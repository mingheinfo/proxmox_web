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
                prop="host"
                label="设备"
                labelWidth="100px"
                @on-change="handleHostSelect"
                v-model="host"
								validateEvent
                @validate="validate"
								:show-error="rules['host'].error"
								:error-msg="rules['host'].message"
                :readonly="false"
                placeholder="请选桥接"
              >
								<div class="table">
                  <m-option
										v-for="(item, index) in db.pciList"
										:key="item.id"
										:value="item.id"
										:label="item.id"
									>
								   <div v-if="index === 0" class="table-row">
										 <div class="table-td">ID</div>
										 <div class="table-td">IOMMU组</div>
										 <div class="table-td">供应商</div>
										 <div class="table-td">设备</div>
										 <div class="table-td">中介设备</div>
									 </div>
									 <div class="table-row">
										 <div class="table-td">{{item.id}}</div>
										 <div class="table-td">
											 {{item.immugroup}}
										 </div>
										 <div class="table-td">{{item.subsystem_vendor_name}}</div>
										 <div class="table-td">{{item.device_name}}</div>
										 <div class="table-td">{{item.mdev ? '否' : '是'}}</div>
									 </div>
                	</m-option>
								</div>
              </m-select>
							<m-select
                prop="mdev"
                label="MDev类型"
                labelWidth="100px"
                @on-change="handleModelSelect"
                v-model="mdev"
                :readonly="false"
								:disabled="mdevDisabled"
                placeholder="请选缓存"
              >
								<div class="table">
                  <m-option
										v-for="(item, index) in db.pciMDevList"
										:key="index"
										:value="item.type"
										:label="item.type"
									>
									<div v-if="index === 0" class="table-row">
										 <div class="table-td">类型</div>
										 <div class="table-td">可用</div>
										 <div class="table-td">描述</div>
									 </div>
									 <div class="table-row">
										 <div class="table-td">{{item.type}}</div>
										 <div class="table-td">
											 {{item.available}}
										 </div>
										 <div class="table-td">{{item.description}}</div>
									 </div>
                	</m-option>
								</div>
              </m-select>
              	<m-checkbox label="所有功能" 
						            v-model="multifunction"
												labelWidth="100px"></m-checkbox>
							<m-checkbox label="主CPU" 
						            v-model="xvga"
												labelWidth="100px"></m-checkbox>
							 <div class="m-form__section">
						</div>
          </dd>
        </dl>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>高级</dt>
            <dd>  
             	<m-checkbox label="ROM-Bar" 
						            v-model="rombar"
												labelWidth="100px"></m-checkbox>
								<m-checkbox label="PCI-Express" 
						            v-model="pcie"
												:disabled="!mdev"
												labelWidth="100px">仅Q35</m-checkbox> 
            </dd>
          </dl>
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
	CACHELIST,
	MODELLIST
 } from "@libs/enum/enum";
 import { byteToSize, macPrefix } from '@libs/utils/index';
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
			host: '',
			mdev: '',
			xvga: false,
			multifunction: false,
			rombar: false,
			pcie: false,
			isAdvice: false,
			mdevDisabled: true,
      rules: {
        host: {
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
		async __init__() {
			let _this = this;
			await	this.queryPci();
			this.queryConfig({_dc: new Date().getTime()})
			    .then(res => {
						if(_this.modalType === 'edit') {
              if(_this.param.type) {
               _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
               ["rombar", "pcie"].forEach(item => {
                 (_this.db.qemuConfigObj[_this.param.type].indexOf(item) >= 0)
                 _this.isAdvice = true;
               })
              }
             }
					})
		},
		//解析值
    parseValue(value) {
      let values = value.split(','), _this = this;
      if(values) {
         for(let i in values) {
           if(values[i].indexOf('=') < 0) {
             _this.db.pciList.forEach(item => {
                if(item.id.indexOf(values[i]) >= 0) {
									_this.host = item.id;
								}
						 })
           } else if( ["rombar", "pcie", 'x-vga', 'multifunction'].includes(values[i].split('=')[0])) {
             _this[values[i].split('=')[0].replace(/-/, '')] = values[i].split('=')[1] ===  '1' ? true : false;
           } else {
              _this[values[i].split('=')[0]] = values[i].split('=')[1];
           }
         }
      }
    },
		confirm() {
			if(this.validateAll()) return;
				let hostpci = '', host=this.host;
				if (this.host.substring(0,5) === '0000:') {
	       host = host.substring(5);
	      }
	    if (this.multifunction) {
	    // modify host to skip the '.X'
	        host = host.substring(0, this.host.indexOf('.'));
				}
				if(host) hostpci+=`${host},`
        hostpci+=`rombar=${this.rombar ? 1 : 0},`;
        hostpci+=`x-vga=${this.xvga ? 1 : 0},`;
        if(this.pcie) hostpci+=`pcie=${this.pcie ? 1 : 0},`;
				if(this.modalType !== 'edit') {
					let netId = Object.keys(this.db.qemuConfigObj).filter(it => {
					  return /^(hostpci)\d$/.test(it)
					}).map(item => {
					return Number(item.replace(/^(hostpci)(\d)$/g, '$2'));
				});
        let id = netId && netId.length > 0 ? Math.max(...netId) + 1 : 0;
				let param = {
					[`hostpci${id}`]: hostpci.replace(/\,$/, ""),
          digest: this.db.qemuConfigObj.digest 
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
				} else {
						let param = {
					[this.param.type]: hostpci.replace(/\,$/, ""),
          digest: this.db.qemuConfigObj.digest 
				}
				this.updateHardWare(param)
				    .then(res =>{
							this.close();
						})
						.catch(res => {
							this.$confirm.confirm({
								msg: res
							})
						})
				}
		},
    close() {
      this.$emit("close");
    },
		handleModelSelect(value) {
			this.model = value;
		},
		handleHostSelect(value) {
			if (!value) {
			    return;
			}
			this.host = value;
			let pcidev =this.db.pciList.filter(item => item.id === value)[0];
			this.mdevDisabled = !pcidev || !pcidev.mdev;
			if (!pcidev) {
			    return;
			}
			let id = pcidev.id.substring(0,5); // 00:00
			let iommu = pcidev.iommugroup;
			if (pcidev.mdev) {
			   this.queryMDev();
			}
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
			let props = ['host'];
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