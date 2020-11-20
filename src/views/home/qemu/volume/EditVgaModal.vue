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
            <m-select labelWidth="100px" label="类别" v-model="vga" prop="cpu" @on-change="handleVgaChange">
              <m-option
                v-for="(item) in vgaItems"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              >
              </m-option>
            </m-select>
            <m-input
              type="number"
              labelWidth="100px"
              label="内存"
              v-model="memory"
              validateEvent
              @validate="validate"
              prop="memory"
              :min="1"
              :error-msg="rules['memory'].message"
              :show-error="rules['memory'].error"
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
import { VGALIST } from "@libs/enum/enum";
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
      vgaItems: VGALIST,
			vga: "",
			memory: '',
      rules: {
        memory: {
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
    __init__() {
      let _this = this;
      _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
				_this.vga = _this.db.qemuConfigObj.vga && _this.db.qemuConfigObj.vga.split(',')[0];
				_this.memory = _this.db.qemuConfigObj.vga && _this.db.qemuConfigObj.vga.indexOf('memory') >=0 ? _this.db.qemuConfigObj.vga.split(',')[1].replace(/([\s\S]*)=/, '') : '';
      });
    },
    confirm() {
      let param = {
        vga: this.memory ? `${this.vga},memory=${this.memory}` : `${this.vga}`,
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
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && prop !== 'memory') {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
			}
			if(value && prop === 'memory') {
				if(this.memory < 4) {
					this.rules[prop].error = true;
          this.rules[prop].message = `内存不能小于4`;
           return;
				}
			}
    },
    validateAll() {
			let props = ["memory"]
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleVgaChange(value) {
      this.vga = value;
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