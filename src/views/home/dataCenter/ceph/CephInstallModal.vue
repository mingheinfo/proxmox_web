<template>
	 <m-dialog
	   :visible="visible"
		 :title="modalType === 'detail' ? '详情': '配置CEPH'"
		 @close="$emit('close')"
		 :_style="{
			 height: '500px'
		 }">
		 <template slot="content" v-if="modalType === 'detail'">
			 <div class="table">
				 <div class="table-tr">
					 {{param.message}}
				 </div>
				 <div class="table-tr" v-for="item of param.detail">
					 {{item.message}}
				 </div>
			 </div>
		 </template>
		 <template slot="content" v-else>
       <div class="ceph-step">
				  <!--步骤条-->
        <m-steps :active="step">
          <m-step title="info"></m-step>
          <m-step title="安装"></m-step>
          <m-step title="配置"></m-step>
          <m-step title="成功"></m-step>
        </m-steps>
			 </div>
			 <div v-if="step === 1" class="ceph-text">
Ceph?
	"Ceph is a unified, distributed storage system designed for excellent performance, reliability and scalability."

	Ceph is currently not installed on this node, click on the next button below to start the installation. This wizard will guide you through the necessary steps, after the initial installation you will be offered to create an initial configuration. The configuration step is only needed once per cluster and will be skipped if a config is already present.

	Please take a look at our documentation, by clicking the help button below, before starting the installation, if you want to gain deeper knowledge about Ceph visit ceph.com.
			 </div>
			 <div v-if="step === 2" class="ceph-install">
				 <iframe ref="ifra" src="/shell/?console=cmd&node=localhost&cmd=ceph_install&resize=scale&xtermjs=1" width="100%"></iframe>
			 </div>
			 <div v-if="step === 3" class="ceph-config">
			   <m-select v-model="network"
						         prop="network"
										 label="网络"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['network'].error"
										 :error-msg="rules['network'].message"
										 @on-change="(value) => network = value"
										 >
							  <m-option v-for="(item) in networkList"
							          :key="item.cidr"
												:label="item.cidr"
												:value="item.cidr">
								</m-option>
						</m-select>
						<m-select v-model="clusterNetwork"
						         prop="clusterNetwork"
										 label="集群网络"
										 labelWidth="100px"
										 @on-change="(value) => clusterNetwork = value"
										 >
							<m-option v-for="(item) in networkList"
							          :key="item.cidr"
												:label="item.cidr"
												:value="item.cidr">
							</m-option>
						</m-select>
             <h1 style="margin-bottom: 10px;margin-left: 5px;">{{gettext('First Ceph monitor') + ': '}}</h1>
						 <m-select
                prop="monnode"
                label="监控节点"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.monnode.error"
                :error-msg="rules.monnode.message"
                :readonly="false"
                @on-change="(value) => monnode = value"
                v-model="monnode"
                placeholder="请选择监控节点"
              >
                <m-option
                  v-for="(item, index) in nodeList"
                  :key="item.node"
                  :label="item.node"
                  :value="item.node"
                >
								  <div v-if="index === 0" class="table-tr">
										<div class="table-td">节点</div>
										<div class="table-td">内存使用率</div>
										<div class="table-td">CPU使用率</div>
									</div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.node">{{ item.node }}</span>
                    <span class="table-td" :title="item.mem && item.maxmem && percentToFixed(item.mem / item.maxmem, 3)">{{
                      item.mem && item.maxmem && percentToFixed(item.mem / item.maxmem, 3)
                    }}</span>
                    <span class="table-td" :title="item.cpu && item.maxcpu && `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`">{{
                      item.cpu && item.maxcpu && `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                    }}</span>
                  </div>
                </m-option>
              </m-select>
							<div class="warning">{{gettext('Additional monitors are recommended. They can be created at any time in the Monitor tab.')}}</div>
					    <div class="m-margin-top-10" v-if="isAdvice">
								<m-input
										type="number"
										prop="size"
										label="size"
										labelWidth="100px"
										min="2"
										max="7"
										validateEvent
										@validate="validate"
										:show-error="rules.size.error"
										:error-msg="rules.size.message"
										v-model="size"
										placeholder="请输入size"
									/>
									<m-input
										type="number"
										prop="minsize"
										label="min size"
										labelWidth="100px"
										min="2"
										max="3"
										validateEvent
										@validate="validate"
										:show-error="rules.minsize.error"
										:error-msg="rules.minsize.message"
										v-model="minsize"
										placeholder="请输入最小size"
									/>
							</div>
							<div v-if="step === 4">
								  <template v-for="(item, key) in db.addClusterStatusObj">
										<div
											class="table-tr"
											v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
											:key="item.pid"
										>
											<div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
											<div class="table-td" v-if="key === 'starttime'">
												{{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
											</div>
											<div class="table-td" v-else>{{ item }}</div>
										</div>
                 </template>
							</div>
			 </div>
			 <div v-if="step === 4">
				 <template v-for="(item, key) in db.addClusterStatusObj">
					 <div class="table-tr" v-if="!['exitstatus', 'id', 'pstart'].includes(key)" :key="key">
						 <div class="table-td">{{$t(`clusterStatus.${key}`)}}</div>
						 <div class="table-td" v-if="key === 'starttime'">{{dateFormat(new Date(item * 1000), 'yyyy-MM-dd hh:mm')}}</div>
						 <div class="table-td" v-else>{{item}}</div>
					 </div>
				 </template>
			 </div>
		 </template>
		 <template slot="footer" v-if="modalType !== 'detail'">
			<div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>高级</div>
        </label>
      </div>
      <m-button
        type="primary"
        style="height: 40px; line-height: 40px; width: 100px;vertical-align:top;"
        @on-click="prev"
				v-if="step === 1"
        >开始安装</m-button
      >
			<m-button  type="primary"
        style="height: 40px; line-height: 40px; width: 100px;vertical-align:top;"
        @on-click="prev"
        :disabled="!configuration"
				v-if="step > 1 && step <4">
        下一步
			</m-button>
		 </template>
		 <template slot="footer" v-else>
			 <div></div>
		 </template>
	 </m-dialog>
</template>

<script>
import MSteps from "@src/components/step/MSteps";
import MStep from "@src/components/step/MStep";
import { quickSort, percentToFixed, dateFormat } from '@libs/utils/index';
import { gettext } from '@src/i18n/local_zhCN.js';
import CephHttp from './http';
export default {
	name: 'CephInstallModal',
	mixins: [CephHttp],
	props: {
		visible: {
			type: Boolean,
			default: false
		},
    param: {
		  type: Object,
			default: () => {
			  return {}
			}
		},
		modalType: {
		  type: String,
			default: ''
		}
	},
  components: {
		MSteps,
		MStep
	},
	data() {
		return {
			step: 1,
			isAdvice: true,
			installed: false,
			interVal: null,
			networkList: [],
			network: '',
			clusterNetwork: '',
			monnode:'',
			nodeList: [],
			configuration: false,
			minsize: '',
			size: '',
			rules: {
        network: {
					error: false,
					message: ''
				},
				monnode: {
					error: false,
					message: ''
				},
				size: {
					error: false,
					message: ''
				},
				minsize: {
					error: false,
					message: ''
				}
			}
		}
	},
	methods: {
		gettext,//
		percentToFixed,
		dateFormat,//日期格式化
		prev() {
			 if (this.step < 4 && this.step !== 3) ++this.step;
			if(this.step === 2) {
				this.interVal = setInterval(() => this.queryInstallStatus(), 10000);
			}
			if(this.step === 3) {
				this.queryNetWork()
				    .then(res => {
							 this.networkList = quickSort(this.db.networkList.filter(item => item.cidr), 'cidr', '+');
						})
				this.queryNodeList()
				    .then(res => {
							 this.nodeList = quickSort(this.db.nodeList, 'node', '-');
						})
				if(this.validateAll()) return;
				this.configCeph(this.monnode, this.confirmParam())
				    .then(res => {
							this.configMonNode(this.monnode)
							    .then(res => {
										++this.step;
									});
						})
			}
			if(this.step === 4) {
			  this.$emit('close');
			}
		},
		/**
		 * 查询ceph安装状态
		*/
		queryInstallStatus() {
			this.$http.get(`json/cluster/ceph/status`)
			          .then(res => {
									this.installed = true;
								})
			          .catch(res => {
									/**
									 * 当存在not installed时未安装成功
									*/
										if (!/(not installed)/i.test(res)) {
											this.installed = true;
											this.configuration = true;
										} else if (/(not installed)/i.test(res)) {
											this.configuration = false;
											this.installed = false;
										} else if (/(rados_connect failed)/i.test(res)) {//当出现rados_connect failed时网络连接失败
												this.configuration = true;
										}
								 })
		},
		/**
		 * 确定参数
		*/
		confirmParam() {
			let param =  {
				network: this.network,
				'cluster-network': this.clusterNetwork,
			}
			if(!this.isAdvice)  {
				return param;
			} else {
         return Object.assign({}, param, {size: this.size, min_size: this.minsize})
			}
		 },
		 /**
			* 单个校验表单
		 */
		validate(prop) {
			let value = String(this[prop]).trim();
					this.rules[prop].error =  false;
			  	this.rules[prop].message = '';
			if(/^\s*$/.test(value) && ['monnode', 'network'].includes(prop)) {
				this.rules[prop].error =  true;
				this.rules[prop].message = '不能为空!';
				return ;
			}
			if(this.isAdvice) {
				if(this.size < this.minsize) {
					this.rules[prop].error =  true;
			   	this.rules[prop].message = 'size不能小于minsize!';
				  return ;
				}
			}
		},
		/**
		 * 整体校验
		*/
		validateAll() {
			let prop = ['monnode'];
			if(!this.configuration) {
				prop.push('network');
			}
			if(this.isAdvice) {
				prop.concat(['size', 'minsize']);
			}
			prop.forEach(item => this.validate(item));
			return prop.some(item => this.rules[item].error === true);
		}
	}
}
</script>

<style lang="less" scoped>
.ceph{
	&-step{
		height: 30px;
		line-height: 30px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin: 10px 0px;
	}
	&-text{
	 white-space: pre-wrap;
	}
}
</style>
