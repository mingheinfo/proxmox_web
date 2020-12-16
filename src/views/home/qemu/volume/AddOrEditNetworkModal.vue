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
						<m-select
                prop="bridge"
                label="桥接"
                labelWidth="100px"
                @on-change="handleIfaceSelect"
                v-model="bridge"
								validateEvent
                @validate="validate"
								:show-error="rules['bridge'].error"
								:error-msg="rules['bridge'].message"
                :readonly="true"
                placeholder="请选桥接"
              >
								<div class="table">
                  <m-option
										v-for="(item, index) in db.netWorkList"
										:key="item.iface"
										:value="item.iface"
										:label="item.iface"
									>
								   <div v-if="index === 0" class="table-tr">
										 <div class="table-td">桥接</div>
										 <div class="table-td">活动</div>
										 <div class="table-td">备注</div>
									 </div>
									 <div class="table-tr">
										 <div class="table-td" :title="item.iface">{{item.iface}}</div>
										 <div class="table-td" :title="item.active ? '是' : '不是'">
											 <table-info-state style="line-height: 15px;height: 35px;" :content="item.active ? '是' : '不是'" :state="item.active ? 'actived' :'unActived'"></table-info-state>
										 </div>
										 <div class="table-td" :title="item.comment">{{item.comment}}</div>
									 </div>
                	</m-option>
								</div>
              </m-select>
							<m-select
                prop="model"
                label="模型"
                labelWidth="100px"
                @on-change="handleModelSelect"
                v-model="model"
                :readonly="false"
                placeholder="请选缓存"
              >
								<div class="table">
                  <m-option
										v-for="(item, index) in modelList"
										:key="index"
										:value="item.value"
										:label="item.label"
									>
                	</m-option>
								</div>
              </m-select>
               <m-input
              type="number"
              labelWidth="100px"
              class="m-margin-top-10"
              label="VLAN标签"
              v-model="tag"
            />
            <m-input
              type="text"
              labelWidth="100px"
              label="MAC地址"
              class="m-margin-top-10"
              v-model="mac"
            />
							<m-checkbox label="防火墙" 
						            v-model="firewall"
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
              <m-input
                type="number"
                labelWidth="100px"
                label="速率限制"
                v-model="rate"
              />
								<m-checkbox label="断开" 
						            v-model="link_down"
												labelWidth="100px"></m-checkbox> 
              <m-input
                type="number"
                labelWidth="100px"
                label="Multiqueue"
                v-model="queues"
              />
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
			modelList: MODELLIST,
			firewall: false,
			queues: '',
			rate: '',
			model: 'e1000',
			mac: '',
			tag:'',
			bridge: '',
			isAdvice: true,
			link_down: false,
      rules: {
        bridge: {
          error: false,
          message: "",
				},
				mac: {
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
      this.queryConfig({_dc: new Date().getTime()})
          .then(() => {
             if(_this.modalType === 'edit') {
              if(_this.param.type) {
               _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
               ["rate", "link_down", "queues"].forEach(item => {
                 (_this.db.qemuConfigObj[_this.param.type].indexOf(item) >= 0)
                 _this.isAdvice = true;
               })
              }
             }
          })
			this.queryNetWork({type: 'any_bridge'})
    },
    //解析值
    parseValue(value) {
      let values = value.split(','), _this = this;
      if(values) {
         for(let i in values) {
           if(values[i].split('=')[1].indexOf(':') >= 0) {
             _this.mac = values[i].split('=')[1];
             _this.model = values[i].split('=')[0];
           } else if( ["firewall", "link_down"].includes(values[i].split('=')[0])) {
             _this[values[i].split('=')[0]] = values[i].split('=')[1] ===  '1' ? true : false;
           } else {
              _this[values[i].split('=')[0]] = values[i].split('=')[1];
           }
         }
      }
    },
		confirm() {
			  if(this.validateAll()) return;
			  if(this.modalType !== 'edit') {
          let network = '';
        if(this.bridge) network+=`bridge=${this.bridge},`;
        if(this.tag) network+=`tag=${this.tag},`;
        if(typeof (this.firewall) =='undefined' && this.firewall) network+=`firewall=1,`;
        if(this.mac) network+=`mac=${this.mac},`;
        if(this.model) network+=`${this.model},`;
        if(this.isAdvice) {
          if(this.rate) network+=`rate=${this.rate},`;
          if(this.queues) network+=`queues=${this.queues},`;
          if(this.link_down && link_down) network+=`link_down=1,`;
        }
				let netId = Object.keys(this.db.qemuConfigObj).filter(it => {
					  return /^(net)\d$/.test(it)
					}).map(item => {
					return Number(item.replace(/^(net)(\d)$/g, '$2'));
				});
        let id = netId && netId.length > 0 ? Math.max(...netId) + 1 : 0;
				let param = {
					[`net${id}`]: network.replace(/\,$/, ""),
          digest: this.db.qemuConfigObj.digest,
          background_delay: 5    
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
        }else {
        let network = '';
        if(this.bridge) network+=`bridge=${this.bridge},`;
        if(this.tag) network+=`tag=${this.tag},`;
        if(typeof (this.firewall) =='undefined' && this.firewall) network+=`firewall=1,`;
        if(this.mac && this.model) network+=`${this.model}=${this.mac},`;
        else network+=`${this.model},`;
        if(this.isAdvice) {
          if(this.rate) network+=`rate=${this.rate},`;
          if(this.queues) network+=`queues=${this.queues},`;
          if(this.link_down && this.link_down) network+=`link_down=1,`;
        }
				let param = {
					[this.param.type]: network.replace(/\,$/, ""),
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
		handleIfaceSelect(value) {
			this.iface = value;
		},
		 validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && prop !== 'mac') {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (
        value &&
        prop === 'mac' && !/^[A-F0-9]{2}(-[A-F0-9]{2}){5}$|^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/.test(value)
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "MAC地址不正确";
        return;
      }
		},
		validateAll() {
			  let props = ['mac', 'bridge'];
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