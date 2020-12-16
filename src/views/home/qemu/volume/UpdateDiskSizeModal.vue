<template>
  <m-dialog
    :title="modalType !== 'edit' ? '添加: 磁盘大小' : '编辑: 内存'"
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
              type=""
              labelWidth="100px"
              label="Sockets"
              v-model="disk"
              prop="磁盘"
              :disabled="true"
            >
						  <div style="padding-left: 5px; height: 28px; line-height: 28px;">{{disk}}</div>
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
      disk: '',
      size: '',
      rules: {
        size: {
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
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        _this.disk = _this.param.type
      });
    },
    confirm() {
			let param = {
				disk: this.disk,
				size: `+${this.size}`
			}
      Object.keys(param).forEach((key) => {
        if (!param[key]) delete param[key];
      });
      this.updateHardWareSize(param)
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
			if(value && (value<=0 || value >= 131072) ) {
					this.rules[prop].error = true;
          this.rules[prop].message = `增量不能于大于131072`;
           return;
			}
    },
    validateAll() {
			let props = ["size"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
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