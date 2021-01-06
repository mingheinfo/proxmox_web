<template>
  <m-dialog
    :visible="visible"
    @confirm="confirm"
    :title="title"
    :_style="{
      width: '800px',
    }"
    @close="close"
  >
    <template slot="content">
      <div class="m-form__section">
        <dl>
          <dt>基本信息</dt>
          <dd>
            <template v-if="modalType === 'editMemory'">
              <m-input
                type="number"
                v-model="memory"
                prop="memory"
                validateEvent
                :min="0"
                @validate="validate"
                :show-error="rules['memory'].error"
                :error-msg="rules['memory'].message"
                placeholder="请输入内存"
                label="内存（MiB）"
                labelWidth="100px"
              />
              <m-input
                type="number"
                v-model="swap"
                prop="swap"
                validateEvent
                @validate="validate"
                :min="0"
                :show-error="rules['swap'].error"
                :error-msg="rules['swap'].message"
                placeholder="请输入交换分区"
                label="交换分区（MiB）"
                labelWidth="100px"
              />
            </template>

            <template v-if="modalType === 'editCores'">
              <m-input
                type="number"
                v-model="cores"
                prop="cores"
                :min="0"
                validateEvent
                @validate="validate"
                :show-error="rules['cores'].error"
                :error-msg="rules['cores'].message"
                placeholder="请输入核数"
                label="核"
                labelWidth="100px"
              />
            </template>

            <template v-if="modalType === 'editDisk'">
              <m-input
                type="text"
                v-model="disk"
                prop="disk"
                validateEvent
                @validate="validate"
                :show-error="rules['disk'].error"
                :error-msg="rules['disk'].message"
                placeholder="请输入磁盘映像"
                label="磁盘映像"
                :disabled="true"
                labelWidth="100px"
              />
              <m-input
                type="text"
                v-model="mp"
                prop="mp"
                v-show="!isRoot"
                validateEvent
                @validate="validate"
                :show-error="rules['mp'].error"
                :error-msg="rules['mp'].message"
                placeholder="请输入路径"
                label="路径"
                labelWidth="100px"
              />
              <m-checkbox
                v-show="!isRoot"
                v-model="backup"
                label="备份"
                labelWidth="100px"
              />
            </template>

            <template v-if="modalType === 'migrate'">
              <m-input
                type="text"
                v-model="disk"
                prop="disk"
                placeholder="请输入挂载点"
                label="挂载点"
                :disabled="true"
                labelWidth="100px"
              />
              <m-select
                prop="storage"
                label="目标存储"
                labelWidth="100px"
                @on-change="handleStorageSelect"
                v-model="storage"
                validateEvent
                v-show="modalType !== 'edit'"
                @validate="validate"
                :error-msg="rules['storage'].message"
                :show-error="rules['storage'].error"
                :readonly="false"
                placeholder="请选目标存储"
              >
                <div class="table">
                  <m-option
                    v-for="(item, index) in db.storageList"
                    :key="item.storage"
                    :value="item.storage"
                    :label="item.storage"
                  >
                    <div v-if="index === 0" class="table-tr">
                      <div class="table-td">名称</div>
                      <div class="table-td">类别</div>
                      <div class="table-td">可用</div>
                      <div class="table-td">容量</div>
                    </div>
                    <div class="table-tr">
                      <div class="table-td" :title="item.storage">{{ item.storage }}</div>
                      <div class="table-td" :title="item.type">{{ item.type }}</div>
                      <div class="table-td" :title="byteToSize(item.avail)">{{ byteToSize(item.avail) }}</div>
                      <div class="table-td" :title="byteToSize(item.total)">{{ byteToSize(item.total) }}</div>
                    </div>
                  </m-option>
                </div>
              </m-select>
              <m-select
                prop="format"
                label="格式"
                labelWidth="100px"
                @on-change="(value) => (format = value)"
                v-model="format"
                :readonly="false"
                v-show="modalType === 'create'"
                :disabled="!storageType || storageType !== 'dir'"
                placeholder="请选格式"
              >
                <m-option
                  v-for="(item, index) in formatList"
                  :key="index"
                  :value="item.value"
                  :label="item.label"
                >
                </m-option>
              </m-select>
              <m-checkbox
                label="删除源"
                v-model="delete_origin"
                labelWidth="100px"
              ></m-checkbox>
            </template>

            <template v-if="modalType === 'updatedisksize'">
              <m-input
                type=""
                labelWidth="100px"
                label="磁盘"
                v-model="disk"
                prop="disk"
                :disabled="true"
              >
                <div style="padding-left: 5px; height: 28px; line-height: 28px">
                  {{ disk }}
                </div>
              </m-input>
              <m-input
                type="number"
                labelWidth="100px"
                label="增量大小"
                v-model="size"
                :max="131072"
                validateEvent
                @validate="validate"
                prop="size"
                :min="1"
                :error-msg="rules['size'].message"
                :show-error="rules['size'].error"
              />
            </template>

						<template v-if="modalType === 'adddisk'">
							<m-input
                type="number"
                v-model="storageId"
                prop="storageId"
                validateEvent
                @validate="validate"
                :show-error="rules['storageId'].error"
                :error-msg="rules['storageId'].message"
                placeholder="请输入挂载点id"
                label="挂载点id"
                labelWidth="100px"
              />
              <m-input
                type="text"
                v-model="mp"
                prop="mp"
                v-show="!isRoot"
                validateEvent
                @validate="validate"
                :show-error="rules['mp'].error"
                :error-msg="rules['mp'].message"
                placeholder="/some/path"
                label="路径"
                labelWidth="100px"
              />
							 <m-select
                prop="storage"
                label="存储"
                labelWidth="100px"
                @on-change="handleStorageSelect"
                v-model="storage"
                validateEvent
                v-show="modalType !== 'edit'"
                @validate="validate"
                :error-msg="rules['storage'].message"
                :show-error="rules['storage'].error"
                :readonly="false"
                placeholder="请选存储"
              >
                <div class="table">
                  <m-option
                    v-for="(item, index) in db.storageList"
                    :key="item.storage"
                    :value="item.storage"
                    :label="item.storage"
                  >
                    <div v-if="index === 0" class="table-tr">
                      <div class="table-td">名称</div>
                      <div class="table-td">类别</div>
                      <div class="table-td">可用</div>
                      <div class="table-td">容量</div>
                    </div>
                    <div class="table-tr">
                      <div class="table-td" :title="item.storage">{{ item.storage }}</div>
                      <div class="table-td" :title="item.type">{{ item.type }}</div>
                      <div class="table-td" :title="byteToSize(item.avail)">{{ byteToSize(item.avail) }}</div>
                      <div class="table-td" :title="byteToSize(item.total)">{{ byteToSize(item.total) }}</div>
                    </div>
                  </m-option>
                </div>
              </m-select>
							  <m-input
                type="number"
                labelWidth="100px"
                label="磁盘大小（GiB）"
                v-model="size"
                :max="131072"
                validateEvent
                @validate="validate"
                prop="size"
                :min="1"
                :error-msg="rules['size'].message"
                :show-error="rules['size'].error"
              />
              <m-checkbox
                v-show="!isRoot"
                v-model="backup"
                label="备份"
                labelWidth="100px"
              />
						</template>
          </dd>
        </dl>
        <dl v-if="isAdvice">
          <dt>高级</dt>
          <dd>
            <template v-if="modalType === 'editCores'">
              <m-input
                type="number"
                v-model="cpulimit"
                prop="cpulimit"
                :min="0"
                validateEvent
                @validate="validate"
                :show-error="rules['cpulimit'].error"
                :error-msg="rules['cpulimit'].message"
                placeholder="请输入CPU限制"
                label="CPU限制"
                labelWidth="100px"
              />
              <m-input
                type="number"
                v-model="cpuunits"
                prop="cpuunits"
                :min="8"
                validateEvent
                @validate="validate"
                :show-error="rules['cpuunits'].error"
                :error-msg="rules['cpuunits'].message"
                placeholder="请输入CPU权重"
                label="CPU权重"
                labelWidth="100px"
              />
            </template>
            <template v-if="modalType === 'editDisk' || modalType === 'adddisk'">
              <m-checkbox
                v-model="quota"
                label="启用配额"
                :disabled="!isQuota()"
                labelWidth="100px"
              />
              <m-select
                v-model="acl"
                prop="acl"
                @on-change="(value) => (acl = value)"
                placeholder="请输入磁盘映像"
                label="ACLs"
                labelWidth="100px"
              >
                <m-option
                  v-for="item in aclsItems"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                ></m-option>
              </m-select>
              <m-checkbox
                v-model="ro"
                label="只读"
                v-show="!isRoot"
                labelWidth="100px"
              />
              <m-checkbox
                v-model="replicate"
                label="跳过复制"
                labelWidth="100px"
              />
              <m-select
                v-model="mountoptions"
                type="multiple"
                prop="mountoptions"
                @on-change="(value) => (mountoptions = value)"
                placeholder="选择挂载选项"
                label="挂载选项"
                labelWidth="100px"
              >
                <m-option
                  v-for="item in munteoptionsItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </template>
          </dd>
        </dl>
      </div>

      <m-dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 移动磁盘"
      >
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
            <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button
            class="create-btn m-margin-top-10"
            type="primary"
            @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >停止</m-button
          >
          <el-scrollbar style="height: 100%">
           <div class="taskmodal-content">
            <div class="table" v-if="tab === 'log'">
              <div
                class="table-tr"
                v-for="item in db.addClusterLogList"
                :key="item.n"
              >
                {{ item.t }}
              </div>
            </div>
            <div class="table" v-if="tab === 'status'">
              <template v-for="(item, key) in db.addClusterStatusObj">
                <div
                  class="table-tr"
                  v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                  :key="key"
                >
                  <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                  <div class="table-td" v-if="key === 'starttime'">
                    {{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
                  </div>
                  <div class="table-td" v-else>{{ item }}</div>
                </div>
              </template>
            </div>
          </div>
          </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
    </template>
    <template slot="footer">
      <div
        class="label_box"
        v-if="modalType === 'editDisk' || modalType === 'editCores' || modalType === 'adddisk'"
      >
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>高级</div>
        </label>
      </div>
      <m-button class="create-btn" type="primary" @on-click="confirm"
        >创建</m-button
      >
    </template>
  </m-dialog>
</template>

<script>
import VolumeHttp from "@src/views/home/qemu/volume/http";
import { byteToSize, dateFormat } from "@libs/utils/index";
export default {
  name: "EditModal",
  mixins: [VolumeHttp],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      disk: "",
      cores: 1,
      memory: "",
      swap: "",
      replicate: false,
      ro: false,
      backup: false,
      quota: false,
      mountoptions: [],
      acl: "__default__",
      cpulimit: "",
      cpuunits: "",
      mp: "",
      isAdvice: false,
      isRoot: false,
      storage: "",
      delete_origin: false,
      size: "",
      storageType: 'raw',
			format: 'raw',
      interVal: null,
      showLog: false,
			tab: "log",
			storageId: '',
      formatList: [
        {
          label: "Raw磁盘映像（raw）",
          value: "raw",
        },
        {
          label: "VMware映像格式（vmdk）",
          value: "vmdk",
        },
        {
          label: "QEMU映像格式（qcow2）",
          value: "qcow2",
        },
      ],
      munteoptionsItems: [
        { label: "noatime", value: "noatime" },
        { label: "nodev", value: "nodev" },
        { label: "noexec", value: "noexec" },
        { label: "nosuid", value: "nosuid" },
      ],
      aclsItems: [
        { value: "__default__", label: "默认" },
        { value: "1", label: "已启用" },
        { value: "0", label: "已禁用" },
      ],
      rules: {
        memory: {
          message: "",
          error: false,
        },
        disk: {
          message: "",
          error: false,
        },
        mp: {
          message: "",
          error: false,
        },
        cpuunits: {
          message: "",
          error: false,
        },
        cpulimit: {
          message: "",
          error: false,
        },
        swap: {
          message: "",
          error: false,
        },
        cores: {
          message: "",
          error: false,
        },
        storage: {
          error: false,
          message: "",
        },
        size: {
          error: false,
          message: "",
				},
				storageId: {
					error: false,
          message: "",
				}
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		byteToSize,
		dateFormat,
    async __init__() {
      let _this = this;
			_this.isRoot = _this.param && _this.param.type === "rootfs";
			if(_this.modalType !== 'adddisk' && _this.modalType !== "migrate" && _this.modalType !== "updatedisksize") {
          _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        if (_this.modalType === "editMemory") {
          _this.memory = _this.db.qemuConfigObj["memory"]
            ? _this.db.qemuConfigObj["memory"]
            : "";
          _this.swap = _this.db.qemuConfigObj["swap"]
            ? _this.db.qemuConfigObj["swap"]
            : "";
        } else if (_this.modalType === "editCores") {
          _this.cores = _this.db.qemuConfigObj["cores"]
            ? _this.db.qemuConfigObj["cores"]
            : "";
        } else if (_this.modalType === "editDisk") {
          _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
          if (_this.isRoot) {
            _this.munteoptionsItems = [
              {
                label: "noatime",
                value: "noatime",
              },
              {
                label: "nosuid",
                value: "nosuid",
              },
            ];
          }
        }
       });
			} else if (_this.modalType === "migrate") {
        _this.queryStorage({ format: 1, content: "rootdir" });
        _this.disk = _this.param.type;
      } else if (_this.modalType === "updatedisksize") {
        _this.disk = _this.param.type;
      } else {
				await _this.queryConfig({ _dc: new Date().getTime() })
				let keys = Object.keys(_this.db.qemuConfigObj).filter(item => /^(mp)\d$/.test(item));
				if(keys && keys.length > 0) {
					let ids = keys.map(item => Number(item.replace(/(mp)/, '')))
					_this.storageId = Math.max(...ids) + 1;
				} else {
					_this.storageId = 1;
				}
				 _this.queryStorage({ format: 1, content: "rootdir" })
				      .then(res => {
								_this.storage = _this.db.storageList[0].storage;
								_this.size = 8;
							});
			}
    },
    isQuota() {
      let _this = this;
      if (!_this.db.qemuConfigObj) return false;
      return !(
        _this.db.qemuConfigObj["type"] === "zfs" ||
        _this.db.qemuConfigObj["type"] === "zfspool" ||
        _this.db.qemuConfigObj["unprivileged"] === 1
      );
    },
    parseValue(value) {
      let values = value.split(",");
      if (values) {
        for (let i in values) {
          if (
            ["quota", "replicate", "ro", "acl", "mountoptions"].includes(
              values[i].split("=")[0]
            )
          ) {
            this.isAdvice = true;
          }
          if (values[i].indexOf("=") < 0) {
            this.disk = values[i];
          } else if (
            values[i].indexOf("=") >= 0 &&
            values[i].split("=")[0] === "mountoptions"
          ) {
            this[values[i].split("=")[0]] = values[i].split("=")[1].split(";");
          } else if (
            values[i].indexOf("=") >= 0 &&
            ["ro", "replicate", "backup", "quota"].includes(
              values[i].split("=")[0]
            )
          ) {
            this[values[i].split("=")[0]] =
              values[i].split("=")[1] && values[i].split("=")[1] === "1"
                ? true
                : false;
          } else {
            this[values[i].split("=")[0]] =
              values[i].split("=")[1] && values[i].split("=")[1];
          }
        }
      }
    },
    close() {
      this.$emit("close");
    },
    confirm() {
			if(this.validateAll()) return;
      let param = {};
      switch (this.modalType) {
        case "editMemory":
          param["memory"] = this.memory;
          param["swap"] = this.swap;
          break;
        case "editCores":
          param["cores"] = this.cores;
          if(this.cpulimit) param["cpulimit"] = this.cpulimit;
          if(this.cpuunits) param["cpuunits"] = this.cpuunits;
          break;
        case "editDisk":
          let disk = "";
          disk += this.disk + ",";
          if (this.mountoptions.length > 0)
            disk += `mountoptions=${this.mountoptions.join(";")},`;
          if (this.replicate) disk += `replicate=1,`;
          if (this.backup) disk += `backup=1,`;
          if (this.ro) disk += `ro=1,`;
          if (this.quota) disk += `quota=1,`;
          if (this.acl && this.acl !== "__default__")
            disk += `acl=${this.acl},`;
          if (this.mp) disk += `mp=${this.mp},`;
          param[this.param.type] = disk.replace(/\,$/, "");
          break;
        case "updatedisksize":
          param["disk"] = this.disk;
          param["size"] = `+${this.size}G`;
					break;
				case  'adddisk':
					let disk1 = '';
					disk1+=`${this.storage}:${this.size},`;
					if(this.mp) disk1+=`mp=${this.mp},`;
					if(this.backup) disk1+=`backup=1,`;
					if(this.acl && this.acl !== "__default__") disk1+=`acl=${this.acl},`;
					if(this.replicate) disk1+=`replicate=0,`;
					if(this.mountoptions && this.mountoptions.length > 0) disk1+=`mountoptions=${this.mountoptions.join(';')},`;
					if(this.ro) disk1+=`ro=1,`;
					if(this.quota) disk1+=`quota=1,`;
					param[`mp${this.storageId}`] = disk1.replace(/\,$/, '');
      }
      if (this.modalType === "migrate") {
        let param = {
          volume: this.disk,
          storage: this.storage,
          delete: this.delete_origin ? 0 : 1,
        };
        Object.keys(param).forEach((key) => {
          if (!param[key]) delete param[key];
        });
        //确定迁移
        this.removeDisk(param, 'move_volume')
          .then((res) => {
            this.showLog = true;
            //相应成功之后展示任务进度日志
            this.interVal = setInterval(() => {
              this.queryStatus(this.db.addClusterStatusObj.upid);
              this.queryLog(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
            }, 3000);
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      } else if (this.modalType === "updatedisksize") {
        Object.keys(param).forEach((key) => {
          if (!param[key]) delete param[key];
        });
        this.updateHardWareSize(param)
          .then((res) => {
            this.showLog = true;
            //相应成功之后展示任务进度日志
            this.interVal = setInterval(() => {
              this.queryStatus(this.db.addClusterStatusObj.upid);
              this.queryLog(
                this.db.addClusterStatusObj.node,
                this.db.addClusterStatusObj.upid
              );
            }, 3000);
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      } else if(this.modalType === 'adddisk') {
					 (param["digest"] = this.db.qemuConfigObj.digest);
					 this.createLxcRs(param).then(res =>{
							this.close();
						})
						.catch(res => {
							this.$confirm.confirm({
								msg: res
							})
						});
			} else {
        (param["digest"] = this.db.qemuConfigObj.digest),
          this.updateHardWare(param)
            .then((res) => {
              this.close();
            })
            .catch((res) => {
              this.$confirm.confirm({
                msg: res,
              });
            });
      }
    },
    validate(prop) {
			let value = String(this[prop]).trim();
			this.rules[prop].error = false;
			this.rules[prop].message = '';
			if(/^\s*$/.test(value)) {
       this.rules[prop].error = true;
			 this.rules[prop].message = '不能为空!';
			 return;
			}
			if(prop==="cpuunits" && value) {
				if(value<=8 || value>=500000) {
					 this.rules[prop].error = true;
			     this.rules[prop].message = '值应该在8~500000!';
			     return;
				}
			}
		},
		validateAll() {
			let props = [];
			switch(this.modalType) {
				case 'editMemory':
					props = ['memory', 'swap'];
					break;
				case 'editCores':
					props = ['cpuunits'];
					break;
				case 'migrate':
					props =  ['storage'];
					break;
				case 'updatedisksize':
					props = ['size'];
					break;
				case 'adddisk':
					props = ['storageId', 'mp', 'storage', 'size'];
					break;
			}
			props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
    closeLog() {
      this.showLog = false;
      this.close();
    },
    //停止当前任务
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    //切换tab @param type种类log日志、status状态
    handleTabChange(value) {
      this.tab = value;
    },
    //迁移到哪个存储
    handleStorageSelect(value) {
      this.storage = value;
      this.storageType = this.db.storageList.filter(
        (it) => it.storage === value
      )[0].type;
      if (this.storageType === "dir") this.format = "qcow2";
      else this.format = "raw";
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>
