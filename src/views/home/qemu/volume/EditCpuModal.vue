<template>
  <m-dialog
    :title="modalType !== 'edit' ? '添加: 内存' : '编辑: 内存'"
    :visible="visible"
    v-if="visible"
    @confirm="confirm"
    @cancel="close"
    :_style="{
      width: '946px',
    }"
    @close="close"
  >
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>基本信息</dt>
          <dd>
            <m-input
              type="number"
              labelWidth="100px"
              label="Sockets"
              v-model="sockets"
              validateEvent
              @validate="validate"
              prop="sockets"
              :min="1"
              :error-msg="rules['sockets'].message"
              :show-error="rules['sockets'].error"
            />
            <m-select labelWidth="100px" label="类别" v-model="cpu" prop="cpu" @on-change="handleCpuChange">
              <m-option
                v-for="(item, index) in cpuList"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              >
                <div class="table">
                  <template v-if="index === 0">
                    <div class="table-tr">
                      <div class="table-td">模型</div>
                      <div class="table-td">供应商</div>
                    </div>
                  </template>

                  <div class="table-tr">
                    <div class="table-td" :title="item.value">{{ item.value }}</div>
                    <div class="table-td" :title="item.vendor">{{ item.vendor }}</div>
                  </div>
                </div>
              </m-option>
            </m-select>
            <m-input
              type="number"
              labelWidth="100px"
              label="核"
              v-model="cores"
              validateEvent
              @validate="validate"
              prop="cores"
              :min="1"
              :error-msg="rules['cores'].message"
              :show-error="rules['cores'].error"
            />
            <m-input
              type="number"
              labelWidth="100px"
              label="核总数"
              v-model="cores"
              prop="cores"
              :min="1"
              :disabled="true"
            />
          </dd>
        </dl>
      </div>
      <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
        <dt>高级</dt>
        <dd>
          <m-input
            type="number"
            labelWidth="100px"
            label="VCPUs"
            v-model="vcpus"
            validateEvent
            @validate="validate"
            prop="vcpus"
            :min="1"
            :error-msg="rules['vcpus'].message"
            :show-error="rules['vcpus'].error"
          />
          <m-input
            type="number"
            labelWidth="100px"
            label="Cpu权重"
            v-model="cpuunits"
            prop="cpuunits"
            validateEvent
            @validate="validate"
            :error-msg="rules['cpuunits'].message"
            :show-error="rules['cpuunits'].error"
            :min="8"
            placeholder="默认1000"
          />
          <m-input
            type="number"
            labelWidth="100px"
            label="Cpu限制"
            v-model="cpulimit"
            prop="cpulimit"
            :min="1"
          />
          <m-checkbox v-model="numa" label="启用NUMA"></m-checkbox>
          <div>
            <el-table :data="vmCpuFlagItems">
              <el-table-column label="操作" width="120px;">
                <div slot-scope="scope" class="cpu-check">
                  <label class="cpu-label">{{ flags[scope.row.flag] }}</label
                  >-<m-switch
                    :name="scope.row.flag"
                    v-model="flags[scope.row.flag]"
                  ></m-switch
                  >+
                </div>
              </el-table-column>
              <el-table-column
                label="flag"
                prop="flag"
                width="80px"
              ></el-table-column>
              <el-table-column label="描述" prop="desc"></el-table-column>
            </el-table>
          </div>
        </dd>
      </div>
    </div>
    <template slot="footer">
      <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>高级</div>
        </label>
      </div>
      <m-button
        type="primary"
        style="height: 40px; line-height: 40px; width: 100px"
        @on-click="confirm()"
        >确定</m-button
      >
    </template>
  </m-dialog>
</template>

<script>
import { VMCPUFlag, CPULIST } from "@libs/enum/enum";
import { byteToSize } from "@libs/utils/index";
import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
  name: "AddOrEditDiskModal",
  mixins: [VolumeHttp],
  props: {
    modalType: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
  },
  data() {
    return {
      cpuList: CPULIST,
      vmCpuFlagItems: VMCPUFlag,
      sockets: "",
      cpulimit: "",
      cores: "",
      cpuunits: "",
      vcpus: "",
      numa: "",
      cpu: "kvm64",
      isAdvice: false,
      flags: {},
      rules: {
        sockets: {
          error: false,
          message: "",
        },
        cores: {
          error: false,
          message: "",
        },
        vcpus: {
          error: false,
          message: "",
        },
        cpuunits: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    byteToSize,
    __init__() {
      let _this = this;
      _this.vmCpuFlagItems.forEach((item) => {
        _this.$set(_this.flags, item.flag, "default");
      });
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        ["vcpus", "cpuunits", "cpulimit", "numa"].forEach((item) => {
          if (_this.db.qemuConfigObj.hasOwnProperty(item)) {
            _this.isAdvice = true;
            if (item !== "flags") _this[item] = _this.db.qemuConfigObj[item];
            if (item === "numa") {
              _this[item] = _this.db.qemuConfigObj[item] === 1 ? true : false;
            }
          }
        });
        if (
          _this.db.qemuConfigObj &&
          _this.db.qemuConfigObj.cpu &&
          _this.db.qemuConfigObj.cpu.indexOf("flags") >= 0
        ) {
          let flag = _this.db.qemuConfigObj.cpu.replace(/([\s\S]*)=/, ""),
            values = flag.split(";");
          values.forEach((item) => {
            if (/^[\+]/.test(item)) {
              _this.flags[item.replace(/^[\+]/, "")] = "on";
            }
            if (/^[\-]/.test(item)) {
              _this.flags[item.replace(/^[\-]/, "")] = "off";
            }
          });
          _this.cpu = _this.db.qemuConfigObj.cpu.replace(
            /([\s\S]*)\,([\s\S]*)/,
            "$1"
          );
        }
        _this.sockets = _this.db.qemuConfigObj.sockets;
        _this.cores = _this.db.qemuConfigObj.cores;
      });
    },
    confirm() {
			let cpu = '';
			for(let i in this.vmCpuFlagItems) {
				if(this.flags[this.vmCpuFlagItems[i].flag] === 'on') {
					cpu+=`+${this.vmCpuFlagItems[i].flag};`
				} else if(this.flags[this.vmCpuFlagItems[i].flag] === 'off') {
					cpu+=`-${this.vmCpuFlagItems[i].flag};`
				}
			}
      let param = {
        sockets: this.sockets,
        cores: this.cores,
				digest: this.db.qemuConfigObj.digest,
				cpu: this.cpu
			};
			if(this.isAdvice)  {
				param['vcpus'] = this.vcpus;
				param['cpulimit'] =this.cpulimit;
				param['numa'] = this.numa ? 1 : 0;
				param['cpu'] = `${this.cpu},${cpu ? `flags=${cpu}` : ''}`.replace(/(\,|\;)$/, '')
			}
      Object.keys(param).forEach((key) => {
        if (!param[key]) delete param[key];
      });
      this.updateHardWare(param)
        .then((res) => {
          this.close();
        })
        .catch((res) => {
          this.$confirm.confirm({
            msg: res,
          });
        });
    },
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
			}
			if(value && prop === 'vcpus') {
				if(this.sockets <= value) {
					this.rules[prop].error = true;
          this.rules[prop].message = `vcpus不能小于${this.sockets ? this.sockets : 0}`;
           return;
				}
			}
			if(value && prop === 'cpuunits') {
				if(value < 8) {
					this.rules[prop].error = true;
          this.rules[prop].message = `cpu权重不能小于8`;
           return;
				}
			}
    },
    validateAll() {
			let props = ["sockets", 'cores'];
			if(this.isAdvice) {
				props = ["sockets", 'cores', 'vcpus', 'cpuunits'];
			}
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleCpuChange(value) {
      this.cpu = value;
    }
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
/deep/.el-table__body {
  font-size: 12px;
}
.cpu-check {
  width: 100%;
  white-space: nowrap;
}
.cpu-label {
  width: 55px;
  display: inline-block;
}
</style>