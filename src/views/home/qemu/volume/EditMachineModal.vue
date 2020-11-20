<template>
  <m-dialog
    :title="modalType !== 'edit' ? '添加: 显示' : '编辑: 显示'"
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
            <m-select labelWidth="100px" label="类别" v-model="machine" prop="cpu" @on-change="handleMachineChange">
              <m-option
                v-for="(item) in machineItems"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              >
              </m-option>
            </m-select>          
          </dd>
        </dl>
      </div>
    </div>
    <template slot="footer">
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
import { MACHINELIST } from "@libs/enum/enum";
import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
  name: "EditMachineModal",
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
      machineItems: MACHINELIST,
			machine: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    __init__() {
      let _this = this;
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
				_this.machine = _this.db.qemuConfigObj.machine;
      });
    },
    confirm() {
      let param = {
        machine:`${this.machine}`,
				digest: this.db.qemuConfigObj.digest,
			};
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
    handleMachineChange(value) {
      this.machine = value;
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