<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="number"
                prop="id"
                label="CT/VM ID"
                labelWidth="100px"
                min="100"
                validateEvent
                @validate="validate"
                :show-error="rules.id.error"
                :error-msg="rules.id.message"
                v-model="id"
                :disabled="true"
                placeholder="请输入CT/VM ID"
              />
              <m-select
                type="multiple"
                prop="target"
                label="目标"
                labelWidth="100px"
                validateEvent
                :disabled="!isCreate"
                @validate="validate"
                :show-error="rules.target.error"
                :error-msg="rules.target.message"
                :readonly="false"
                @on-change="handleNodeSelect"
                v-model="target"
                placeholder="请选择目标"
              >
                <m-option
                  v-for="(item, index) in nodeList"
                  :key="item.node"
                  :label="item.node"
                  :value="item.node"
                >
                 <div class="table-tr" v-if="index === 0">
                    <div class="table-td">节点</div>
                    <div class="table-td">内存</div>
                    <div class="table-td">CPU</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.node">{{ item.node }}</span>
                    <span class="table-td" :title="item.mum && item.maxmem ? percentToFixed((item.mem / item.maxmem), 3) : 0">{{
                      item.mum && item.maxmem ? percentToFixed((item.mem / item.maxmem), 3) : 0
                    }}</span>
                    <span class="table-td" :title="item.cpu && item.maxcpu ? `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}` : ''">{{
                      item.cpu && item.maxcpu ? `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}` : ''
                    }}</span>
                  </div>
                </m-option>
              </m-select>
              <m-select
                prop="schedule"
                label="安排"
                labelWidth="100px"
                @on-change="handleScheduleSelect"
                v-model="schedule"
                placeholder="*/15 - 每15分钟"
              >
                <m-option
                  v-for="item in scheduleList"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                >
                </m-option>
              </m-select>
              <m-input
                type="number"
                prop="rate"
                label="速率限制（MB/s）"
                labelWidth="100px"
                v-model="rate"
                placeholder="请输入速率"
              />
              <m-input
                type="textarea"
                prop="comment"
                labelWidth="100px"
                label="备注"
                v-model="comment"
                placeholder="请输入备注"
              />
              <m-checkbox
                label="启用"
                v-model="disable"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeReplicationHttp from "@src/views/home/qemu/replication/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateReplicationModal",
  mixins: [NodeReplicationHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
	},
  data() {
    return {
      id: "",
      target: [],
      jobs: [],
      rate: "",
      disable: true,
      comment: "",
      schedule: "",
			highestids: [],
			nodeList: [],
      scheduleList: [
        { value: "*/30", text: "每30分钟" },
        { value: "*/2:00", text: "每两小时" },
        { value: "2,22:30", text: "每天 02:30, 22:30" },
        { value: "mon..fri", text: "周一到周五 00:00" },
        { value: "mon..fri */1:00", text: "周一到周五每小时" },
        { value: "sun 01:00", text: "周日 01:00" },
      ],
      rules: {
        id: {
          error: false,
          message: "",
        },
        target: {
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
    percentToFixed,
    byteToSize,
    async __init__() {
      let _this = this;
      await _this.queryNodeList().then((res) => {
				_this.nodeList = _this.db.nodeList.filter(item => item.node !== this.node.node);
        if (_this.isCreate) {
          _this.target = [_this.db.nodeList[0].node];
          _this.validate("target");
        }
      });
      await _this.queryHighIds().then(() => {
        _this.highestids = [];
        _this.jobs.forEach((job) => {
          let match = /^([0-9]+)\-([0-9]+)$/.exec(job.id);
          if (match) {
            let vmid = parseInt(match[1], 10);
            let id = parseInt(match[2], 10);
            if (
              _this.highestids[vmid] < id ||
              _this.highestids[vmid] === undefined
            ) {
              _this.highestids[vmid] = id;
            }
          }
        });
      });
      _this.id = _this.node.vmid;
      _this.target = [];
      _this.rate = "";
      _this.disable = true;
      _this.comment = "";
      _this.schedule = "";
      if (_this.modalType !== "create") {
        this.queryReplicationById(_this.param.id).then(() => {
          Object.keys(_this.db.dataCenterReplicationObj).forEach((it) => {
            if (it === "id") _this.id = _this.param.guest;
						else if (it === "target") _this[it] = _this.param[it].split(",");
						else if (it === 'disable') _this[it] = this.param[it] ? false : true;
						else _this[it] = _this.param[it];
						_this.validate("target");
          });
        });
      }
    },
    handleCompressSelect(value) {
      this.compress = value;
    },
    handleStartTimeSelect(value) {
      this.starttime = value;
    },
    handleDowSelect(value) {
      this.dow = value;
    },
    handleNodeSelect(value) {
      this.target = value;
    },
    handleScheduleSelect(value) {
      this.schedule = value;
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
    },
    validateAll() {
      let props = ["id", "target"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let params = {
        target: this.target.join(","),
        schedule: this.schedule,
        rate: this.rate,
				comment: this.comment,
				disable: this.disable ? 0 : 1
      };
      if (this.isCreate) {
        params.type = "local";
        let vm = this.id;
        let id = -1;
        if (this.highestids[vm] !== undefined) {
          id = this.highestids[vm];
        }
        id++;
        params.id = vm + "-" + id.toString();
      }
      for (let key in params) {
        if (!params[key]) delete params[key];
      }
      if (this.modalType === "create")
        this.createReplication(params).then(() => {
          this.close();
        }).catch(res => {
					this.$confirm.error({msg: res, icon:  'icon-error'})
				});
      if (this.modalType !== "create") {
				params["id"] =  this.param.id;
				params["digest"] = this.db.dataCenterReplicationObj.digest;
				if(!params.disable) params['delete'] = 'disable'; 
        this.updateReplication(params).then(() => {
          this.close();
        });
      }
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
		}
  },
};
</script>
<style lang="less" scoped>
.table {
  &-tr {
    display: table;
    height: 35px;
    line-height: 35px;
    min-width: 300px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
  }
  &-td {
    display: table-cell;
    height: 35px;
    line-height: 35px;
    max-width: 100px;
  }
  &-radio {
    width: 50px;
    padding-right: 20px;
  }
}
</style>