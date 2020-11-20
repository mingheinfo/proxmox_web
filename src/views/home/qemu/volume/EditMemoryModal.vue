<template>
  <m-dialog
    :title="modalType !== 'edit' ? '添加: 内存' : '编辑: 内存'"
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
              labelWidth="100px"
              label="内存（MiB）"
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
      <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
        <dt>高级</dt>
        <dd>
					<m-input
              type="number"
              labelWidth="100px"
              label="最小内存（MiB）"
              v-model="balloon"
              validateEvent
              @validate="validate"
              prop="balloon"
							:min="1"
							:max="memory"
							:disabled="!isBalloon"
              :error-msg="rules['balloon'].message"
              :show-error="rules['balloon'].error"
            />
						<m-input
              type="number"
              labelWidth="100px"
              label="共享内存（MiB）"
              v-model="shares"
              prop="shares"
							:min="1"
							:disabled="memory <= balloon || !isBalloon"
							placeholder="默认1000"
            />
          <m-checkbox
            v-model="isBalloon"
            label="Ballooning"
          ></m-checkbox>
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
			memory: '',
			shares: '',
			balloon: '',
			isBalloon: true,
			isAdvice: false,
      rules: {
        balloon: {
          error: false,
          message: "",
        },
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
		byteToSize,
		__init__() {
      let _this = this;
			_this.queryConfig({_dc: new Date().getTime()})
			     .then(res => {
						  if(this.db.qemuConfigObj.hasOwnProperty('balloon')) {
								this.isAdvice = true;
								this.balloon = this.db.qemuConfigObj.balloon;
								this.isBalloon = true;
							}
							if(this.isAdvice) {
								this.shares = this.db.qemuConfigObj.shares;
							}
							this.memory = this.db.qemuConfigObj.memory;
					 })
    },
		confirm() {
				let param = {
				  memory:  this.memory,
					balloon: this.balloon,
					shares:  this.shares,
          digest: this.db.qemuConfigObj.digest,  
				}
				Object.keys(param).forEach((key) => {
					if(!param[key]) delete param[key]
				})
				this.updateHardWare(param)
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
		},
		validateAll() {
      let props = ['memory'];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		handleCacheSelect(value) {
			this.cache = value;
		},
		handleFormatSelect(value) {
			this.format = value;
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