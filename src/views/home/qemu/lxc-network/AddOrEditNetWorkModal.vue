<template>
	<m-dialog :visible="visible"
	          @close="close"
						:title="title"
						:_style="{
							width: '800px',
						}"
						@confirm="confirm"
						@cancel="close">
	  <template slot="content">
		  <div class="m-form__section">
				<dl>
					<dt>基本信息</dt>
					<dd>
						<m-input v-model="name"
						         prop="name"
										 label="名称"
										 labelWidth="100px"
										 validateEvent
										 required
										 @validate="validate"
										 placeholder="形如：eth0"
										 :show-error="rules['name'].error"
										 :error-msg="rules['name'].message"/>

						<m-input v-model="hwaddr"
						         prop="hwaddr"
										 label="MAC地址"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 placeholder="形如：2A:75:78:42:45:37"
										 :show-error="rules['hwaddr'].error"
										 :error-msg="rules['hwaddr'].message"/>

						<m-select v-model="bridge"
						         prop="bridge"
										 label="桥接"
										 labelWidth="100px"
										 validateEvent
											required
										 @validate="validate"
										 :show-error="rules['bridge'].error"
										 :error-msg="rules['bridge'].message"
										 @on-change="(value) => bridge = value"
										 >
							<m-option v-for="(item, index) in netWorkList"
							          :key="item.iface"
												:label="item.iface"
												:value="item.iface">
								<div v-if="index === 0" class="table-tr">
									<div class="table-td">桥接</div>
									<div class="table-td">活动</div>
									<div class="table-td">备注</div>
								</div>
								<div class="table-tr">
									<div class="table-td" :title="item.iface">{{item.iface}}</div>
									<div class="table-td" :title="item.active && item.active === 1 ? '是' : '否'">
										<table-info-state :content="item.active && item.active === 1 ? '是' : '否'"
										                  :state="item.active && item.active === 1 ? 'actived' : 'unActived'"></table-info-state>
									</div>
									<div class="table-td" :title="item.comment">{{item.comment}}</div>
								</div>
							</m-option>
						</m-select>

						<m-input v-model="tag"
						         prop="tag"
										 type="number"
										 label="VLAN标签"
										 labelWidth="100px"
										 placeholder="请输入VLAN标签"
										/>

						<m-input v-model="rate"
						         type="number"
						         prop="rate"
										 label="速率限制(MiB)"
										 labelWidth="100px"
										 :min="0"
										 placeholder="请输入速率限制"
										/>

						<m-checkbox v-model="firewall"
						         prop="firewall"
										 label="防火墙"
										 labelWidth="100px"
									   />
					</dd>
				</dl>
				<dl>
					<dt>IPV4</dt>
					<dd>
            <div>
							<label class="m-input__radio">
									<input
										type="radio"
										value="static"
										name="ipv4"
										v-model="ip4type"
									/>
									<div></div>
									<span>静态</span>
								</label>
						 <label class="m-input__radio">
								<input
									type="radio"
									value="dhcp"
									name="ipv4"
									v-model="ip4type"
									@change="() => {
										ip ='';
										gw = '';
									}"
								/>
								<div></div>
								<span>DHCP</span>
							</label>
						</div>
						<m-input v-model="ip"
						         prop="ip"
										 label="IPv4/CIDR"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['ip'].error"
										 :error-msg="rules['ip'].message"
										 :disabled="ip4type !== 'static'"
										 placeholder="None"/>

						<m-input v-model="gw"
						         prop="gw"
										 label="网关(IPv4)"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 placeholder="形如：10.10.10.0"
										 :show-error="rules['gw'].error"
										 :disabled="ip4type !== 'static'"
										 :error-msg="rules['gw'].message"/>
					</dd>
				</dl>

					<dl>
					<dt>IPV6</dt>
					<dd>
            <div>
							<label class="m-input__radio">
									<input
										type="radio"
										value="static"
										name="ipv6"
										v-model="ip6type"
									/>
									<div></div>
									<span>静态</span>
								</label>
						 <label class="m-input__radio">
								<input
									type="radio"
									value="dhcp"
									name="ipv6"
									v-model="ip6type"
									@change="() => {
										ip6 ='';
										gw6 = '';
									}"
								/>
								<div></div>
								<span>DHCP</span>
							</label>
							 <label class="m-input__radio">
								<input
									type="radio"
									value="auto"
									name="ipv6"
									v-model="ip6type"
									@change="() => {
										ip6 ='';
										gw6 = '';
									}"
								/>
								<div></div>
								<span>SLAAC</span>
							</label>
						</div>
						<m-input v-model="ip6"
						         prop="ip6"
										 label="IPv6/CIDR"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['ip6'].error"
										 :error-msg="rules['ip6'].message"
										 :disabled="ip6type !== 'static'"
										 placeholder="None"/>

						<m-input v-model="gw6"
						         prop="gw6"
										 label="网关(IPv6)"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['gw6'].error"
										 placeholder="形如：2001:DB8::42"
										 :disabled="ip6type !== 'static'"
										 :error-msg="rules['gw6'].message"/>
					</dd>
				</dl>
			</div>
		</template>
	</m-dialog>
</template>

<script>
import NetWorkHttp from "@src/views/home/qemu/lxc-network/http";
import { quickSort, IP6_match, IP4_match, IP6_cidr_match, IP4_cidr_match, isEmpty } from "@libs/utils/index";
export default {
	name: 'AddOrEditNetWorkModal',
	mixins: [NetWorkHttp],
	data() {
		return {
			name: '',
			ip: '',
			gw: '',
			gw6: '',
			ip6: '',
			firewall: false,
			hwaddr: '',
			rate: '',
			tag: '',
			bridge: '',
			ip6type: 'static',
			ip4type: 'static',
			netWorkList:[],
			rules: {
				name: {
					error: false,
					message: ''
				},
				ip: {
					error: false,
					message: ''
				},
				ip6: {
					error: false,
					message: ''
				},
				hwaddr: {
					error: false,
					message: ''
				},
				gw: {
					error: false,
					message: ''
				},
				gw6: {
					error: false,
					message: ''
				},
				bridge: {
					error: false,
					message: ''
				}
			}
		}
	},
	/**
	 * props接收父组件的属性
	*/
	props: {
	  visible: {
			type: Boolean,
			default: false
		},
		title: {
			type: String,
			default: ''
		},
		modalType: {
			type: String,
			default: ''
		},
		param: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	mounted() {
		this.__init__();
	},
	methods: {
		/**
		 * 初始化查询
		*/
		__init__() {
			let _this = this;
			_this.queryNetWorkList({type: 'any_bridge'})
			    .then(res => {
						this.netWorkList = quickSort(this.db.netWorkList, 'iface', '+');
						if(this.netWorkList && this.netWorkList.length >0) {
							this.bridge = this.netWorkList[0].iface;
						}
					})
			if(this.modalType === 'edit' && !isEmpty(this.param)) {
				_this.name = this.param.name && this.param.name || '';
				_this.bridge = this.param.bridge && this.param.bridge || '';
				_this.hwaddr = this.param.hwaddr && this.param.hwaddr || '';
				_this.gw = this.param.gw && this.param.gw || '';
				_this.gw6 = this.param.gw6 && this.param.gw6 || '';
				_this.rate = this.param.rate && this.param.rate || '';
				_this.tag = this.param.tag && this.param.tag || '';
				_this.firewall = this.param.firewall && this.param.firewall === '1' ?  true : false;
				_this.ip = this.param.ip && this.param.ip && this.param.ip !== 'dhcp' && this.param.ip|| '';
				_this.ip6 = this.param.ip6 && this.param.ip6 && this.param.ip6 !== 'dhcp' && this.param.ip6 !== 'auto' && this.param.ip6 || '';
				_this.ip4type = this.param.ip === 'dhcp' ? 'dhcp' : 'static'
				_this.ip6type = this.param.ip6 === 'auto' ? 'auto' : (this.param.ip6 === 'dhcp' ? 'dhcp' : 'static')
			}
		},
		/**
		 * 关闭弹框
		*/
		close() {
			this.$emit('close');
		},
		/***
		 * 确定时添加
		*/
		confirm() {
			if(this.validateAll())  return;
			let network = '';
			if(this.name) network+=`name=${this.name},`;
			if(this.bridge) network+=`bridge=${this.bridge},`;
			if(this.firewall) network+=`firewall=1,`;
			if(this.ip) network+=`ip=${this.ip},`;
			if(this.ip6)  network+=`ip6=${this.ip6},`;
			if(this.gw)  network+=`gw=${this.gw},`;
			if(this.gw6)  network+=`gw6=${this.gw6},`;
			if(this.hwaddr)  network+=`hwaddr=${this.hwaddr},`;
			if(this.rate)  network+=`rate=${this.rate},`;
			if(this.tag)  network+=`tag=${this.tag},`;
			if(this.ip4type && this.ip4type !== 'static')  network+=`ip=${this.ip4type},`;
			if(this.ip6type && this.ip6type !== 'static')  network+=`ip6=${this.ip6type},`;
			let ids = this.db.lxcNetWorkList.map(item => {
				 return Number(item.id.replace(/^(net)(\d)$/, '$2'))
			});
			let param = {};
			if(this.modalType === 'create') {
				let id = ids.length <=0 ? 0 : Math.max(...ids) + 1
				param = {
				[`net${id}`]: network.replace(/\,$/, ''),
				digest: this.db.qemuConfigObj.digest
			  }
			} else {
				 param = {
					[this.param.id]: network.replace(/\,$/, ''),
					digest: this.db.qemuConfigObj.digest
			  }
			}
			this.createNetWork(param)
			    .then(res => {
						this.close();
					})
					.catch(res => {
						this.$confirm.confirm({
							msg: res,
							icon: 'icon-question'
						})
					});
		},
		//整体校验表单
		validateAll() {
			let props = ['name', 'bridge', 'ip', 'ip6', 'gw', 'gw6', 'hwaddr'];
			if(this.modalType === 'edit') props.shift();
			props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		/**
		 * 单个校验表单
		*/
		validate(prop) {
			let value = String(this[prop]).trim();
			this.rules[prop].error = false;
			this.rules[prop].message = '';
			if(/^\s*$/.test(value) && ['name', 'bridge'].includes(prop)) {
				this.rules[prop].error = true;
				this.rules[prop].message = '不能为空!';
				return;
			}
			if(prop === 'name') {
				let names = this.db.lxcNetWorkList.map(item => item.name);
				if( names && names.includes(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '该名称已存在!';
				    return;
				}
				if(/[\u4e00-\u9fa5]/.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '名称中不能存在汉字!';
				    return;
				}
			}
			if(value && prop === 'ip') {
				if(!IP4_cidr_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = 'IPv4/CIDR格式不正确!';
				    return;
				}
			}
			if(value && prop === 'ip6') {
				if(!IP6_cidr_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = 'IPv6/CIDR格式不正确! 示例：2001:DB8::42/64';
				    return;
				}
			}
			if(value && prop === 'gw') {
					if(!IP4_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '网关格式不正确! 示例： 2001:DB8::42';
				    return;
				}
			}
			if(value && prop === 'gw6') {
					if(!IP6_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '网关格式不正确!';
				    return;
				}
			}
			if(value && prop === 'hwaddr') {
        if(!/[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}/.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = 'mac格式不正确!';
				    return;
				}
			}
		}
	}
}
</script>

<style lang="less" scoped>
/deep/.m-input__radio div {
    position: relative;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
}
/deep/.dialog-main{
	max-height: 385px;
}
</style>
