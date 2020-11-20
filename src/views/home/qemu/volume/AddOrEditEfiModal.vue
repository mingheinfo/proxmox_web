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
							<m-select
                prop="storage"
                label="存储"
                labelWidth="100px"
                @on-change="handleStorageSelect"
                v-model="storage"
								validateEvent
                @validate="validate"
                :readonly="false"
                placeholder="请选缓存"
              >
								<div class="table">
                  <m-option
										v-for="(item, index) in db.storageList"
										:key="item.storage"
										:value="item.storage"
										:label="item.storage"
									>
								   <div v-if="index === 0" class="table-row">
										 <div class="table-td">名称</div>
										 <div class="table-td">类别</div>
										 <div class="table-td">可用</div>
										 <div class="table-td">容量</div>
									 </div>
									 <div class="table-row">
										 <div class="table-td">{{item.storage}}</div>
										 <div class="table-td">{{item.type}}</div>
										 <div class="table-td">{{byteToSize(item.avail)}}</div>
										 <div class="table-td">{{byteToSize(item.total)}}</div>
									 </div>
                	</m-option>
								</div>
              </m-select>
						<m-select
                prop="format"
                label="格式"
                labelWidth="100px"
                @on-change="handleFormatSelect"
                v-model="format"
                :readonly="false"
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
							<p class="warning">警告：虚拟机当前不使用“ OVMF（UEFI）”作为BIOS。</p>
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
 import { byteToSize } from '@libs/utils/index';
 import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
	name: "AddOrEditEfiModal",
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
      format: "qcow2",
			storage: "",
			storageType: "",
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
        }
      ],
      rules: {
				 storage: {
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
			this.queryConfig({_dc: new Date().getTime()})
			this.queryStorage({format: 1, content: 'images'})
		},
		confirm() {
				if(this.validateAll()) return; 
				let device = '';
				if(this.storage) device +=`${this.storage}:1,`;
				if(this.format && this.storageType === 'dir') device +=`format=${this.format},`;
				let param = {
					[`efidisk0`]: device.slice(0, device.length - 1)
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
    validate() {

		},
		handleStorageSelect(value) {
			this.storage = value;
			this.storageType = this.db.storageList.filter(it => it.storage === value)[0].type;
			if(this.storageType === 'dir') this.format = 'qcow2';
			else this.format = 'raw';
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
			let props = ['storage'];
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