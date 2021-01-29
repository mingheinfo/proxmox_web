<template>
  <m-dialog
    title="添加磁盘"
    :visible="visible"
		v-if="visible"
    @confirm="confirm"
    @cancel="close"
    :_style="{
      width: '946px'
    }"
    @close="close"
  >
    <div slot="content" style="max-height: 400px; overflow: auto;">
      <div class="m-form__section">
        <dl>
          <dt>基本信息</dt>
          <dd>
            <m-input
              type="number"
              label="总线"
              v-model="serial"
              labelWidth="100px"
              min="0"
							max="3"
              prop="serial"
              @validate="validate"
              required
              :error-msg="rules['serial'].message"
              :show-error="rules['serial'].error"
            />
        </dd>
        </dl>
      </div>
    </div>
    <template slot="footer">
      <m-button
        type="primary"
        style="height:40px; line-height: 40px; width: 100px"
        @on-click="confirm()"
      >确定</m-button>
		</template>
  </m-dialog>
</template>

<script>
import {
	DEVICELIST,
	CACHELIST
 } from "@libs/enum/enum";
 import { byteToSize } from '@libs/utils/index';
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
			serial: '',
      rules: {
        serial: {
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
		__init__() {
			 	let usbId = Object.keys(this.db.qemuConfigObj).filter(it => {
					  return /^(serial)\d$/.test(it)
					}).map(item => {
					return Number(item.replace(/^(serial)(\d)$/g, '$2'));
				});
			this.serial = usbId && usbId.length > 0 ? (Math.max(...usbId) + 1 > 3 ? 3 : Math.max(...usbId) + 1): 0;
			this.queryConfig({_dc: new Date().getTime()})
		},
		confirm() {
			  if(this.validateAll()) return;
				let param = {
					[`serial${this.serial}`]: 'socket',
          digest: this.db.qemuConfigObj.digest,
				}
				this.createHardWare(param)
				    .then(res =>{
							this.close();
						})
						.catch(res => {
							this.$confirm.confirm({
								msg: res
							})
						})
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
			if(value && (value<0 || value > 3)) {
				this.rules[prop].error = true;
        this.rules[prop].message = "值应该在0~3之间";
        return;
			}
		},
		validateAll() {
			let props = ['serial'];
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
