<template>
  <m-dialog
    :title="modalType !== 'edit' ? '添加: SCSI控制器类型' : '编辑: SCSI控制器类型'"
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
            <m-select labelWidth="100px" label="类别" v-model="scsihw" prop="cpu" @on-change="handleScsiChange">
              <m-option
                v-for="(item, index) in scsiHwItems"
                :key="index"
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
import { SCSIHWLIST } from "@libs/enum/enum";
import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
  name: "EditScsiModal",
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
      scsiHwItems: SCSIHWLIST,
			scsihw: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    __init__() {
      let _this = this;
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
				_this.scsihw = _this.db.qemuConfigObj.scsihw;
      });
    },
    confirm() {
      let param = {
        scsihw:`${this.scsihw}`,
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
    handleScsiChange(value) {
      this.scsihw = value;
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