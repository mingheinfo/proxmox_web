<template>
	<Dialog
    :visible="visible"
    @close="close()"
		:drag="false"
    :title="title"
		:_style="{
      height: '300px',
			width: '900px'
    }"
  >
    <template slot="content" v-if="type === 'firewall'">
			  <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-checkbox
						    label="enable"
                v-model="enable"
                labelWidth="100px"
            ></m-checkbox>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		 <template slot="content" v-if="type === 'ebtables'">
        <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-checkbox
						    label="ebtables"
                v-model="ebtables"
                labelWidth="100px"
            ></m-checkbox>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		<template slot="content" v-if="type === 'log_ratelimit'">
         <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-checkbox
						    label="启用"
                v-model="enable"
                labelWidth="100px"
            ></m-checkbox>
						<div>
							<m-input
                type="number"
                prop="rate"
                label="Log速率限制"
                labelWidth="100px"
                v-model="rate"
								min="1"
                :placeholder="'请输入接口'"
              />
							/
							 <m-select
                prop="unit"
                @on-change="handleUnitSelect"
                v-model="unit"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
						</div>
						<m-input
                type="number"
                prop="burst"
								min="1"
                label="Log burst limit"
                labelWidth="100px"
                v-model="burst"
                :placeholder="'请输入接口'"
              />
            </dd>
          </dl>
        </div>
			 </div>
    </template>
			<template slot="content" v-if="type === 'policy_in'">
         <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					   <m-select
                prop="policy_in"
                label="输入策略"
                labelWidth="77px"
                @on-change="handlePolicyInSelect"
                v-model="policy_in"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in actionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		<template slot="content" v-if="type === 'policy_out'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-select
                prop="policy_out"
                label="输出策略"
                labelWidth="77px"
                @on-change="handlePolicyOutSelect"
                v-model="policy_out"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in actionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		<template slot="footer">
			<template>
		   	 <m-button class="create-btn" type="primary"  @on-click="close()">取消</m-button>
				<m-button class="create-btn" type="primary"  @on-click="confirm()">确定</m-button>
			</template>
    </template>
  </Dialog>
</template>

<script>
import FirewallHttp from "@src/views/home/dataCenter/firewall/http";
import DropdownItem from '@src/components/dropdown/dropdownItem';
import { KVM_KEYMAPS, CONSOLE_Map, KVM_HA_Map } from "@libs/enum/enum.js";
import {  httpProxy, macPrefix, proxmoxMail } from "@libs/utils/index.js";
import Dropdown from '@src/components/dropdown/dropdown';
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
export default {
	name: 'DataCenterFireWallOptionModal',
	mixins: [FirewallHttp],
	 components: {
		Dialog,
		DropdownItem,
		Dropdown,
		MButton
  },
	props: {
		//配置弹框是否可见
		visible: {
			type:  Boolean,
			default: false
		},
		//根据不同的type来显示相应的配置
		type: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
		 policy_in: 'ACCEPT',
		 policy_out: 'ACCEPT',
	   ebtables: false,
		 enable: false,
		 unit: 'second',
		 rate: 1,
		 burst: 1,
		actionOptions: [
        { label: "接收", value: "ACCEPT" },
        { label: "删除", value: "DROP" },
        { label: "拒绝", value: "REJECT" },
			],
			options: [
				{ label: "second", value: "second" },
        { label: "minute", value: "minute" },
				{ label: "hour", value: "hour" },
				{ label: "day", value: "day" }
			],
		 //校验规则
		 rules: {
			 http_proxy: {
				 error: false,
				 message: ''
			 },
			 email_from: {
				 error: false,
				 message: ''
			 },
			 mac_prefix: {
				 error: false,
				 message: ''
			 }
		 }
		}
	},
	async mounted() {
		await this.queryFireOptionList({_dc: new Date().getTime()});
		//设置默认选中或输入
		switch(this.type) {
			case 'firewall':
				this.enable = this.db.optionObj && this.db.optionObj.enable === 1 ? true : false;
				break;
			case 'ebtables':
				this.ebtables = this.db.optionObj && this.db.optionObj.ebtables === 1 ?  true : false;;
				break;
			case 'log_ratelimit':
				this.parseLog_rate();
			case 'policy_in':
				this.policy_in = this.db.optionObj && this.db.optionObj.policy_in ? this.db.optionObj.policy_in : 'ACCEPT';
			case 'policy_out':
				this.policy_out = this.db.optionObj && this.db.optionObj.policy_out ? this.db.optionObj.policy_out : 'ACCEPT';
				break;
		}
	},
	methods: {
		//关闭弹框
		close() {
			this.$emit('close');
		},
		//选择不同选项
		handleCommand(prop) {
      this[this.type] = prop;
		},
		//确定修改
		confirm() {
			let param = {};
		 switch(this.type) {
			case 'ebtables':
				param = {
					ebtables: this.ebtables ? 1 : 0
				};
				break;
			case 'firewall':
				param = {
					enable: this.enable ? 1 : 0
				}
				break;
			 case 'policy_in':
				param = {
					policy_in: this.policy_in
				}
				break;
			 case 'policy_out':
			  param = {
					policy_out: this.policy_out
				}
				break;
			 case 'log_ratelimit':
				param = {
					log_ratelimit: `burst=${this.burst},enable=${this.enable ? 1 : 0 },rate=${this.rate}/${this.unit}`
				}
				break;
			}
			param['digest'] = this.db.optionObj.digest;
			this.modifyOptions(param)
			    .then(() => {
						this.close();
					}).catch((res) => {
						this.$confirm.info({
							msg: res
						}).then(() => {
							this.close();
						})
					})
		},
		//解析log速率
		parseLog_rate() {
			if(this.db.optionObj && this.db.optionObj.log_ratelimit) {
				let obj = `{${this.db.optionObj.log_ratelimit.replace(/([a-zA-Z]+)=([a-zA-Z0-9\/]+)/g, '\"$1\":\"$2\"')}}`;
				let o = JSON.parse(obj);
				this.enable = o.enable === '1' ? true : false;
				this.burst = Number(o.burst);
				this.rate = Number(o.rate.split('/')[0]);
				this.unit = o.rate.split('/')[1]
			} else {
				this.enable = false;
				this.burst = 1;
				this.rate = 1;
				this.unit = 'second';
			}
		},
		//选择单位
		handleUnitSelect(value) {
			this.unit = value;
		},
		//选择入方向
		handlePolicyInSelect(value) {
			this.policy_in = value;
		},
		//选择出方向
		handlePolicyOutSelect(value) {
			this.policy_out = value;
		}
	}
}
</script>

<style scoped lang="less">
  .option{
		&-tr{
			display: flex;
			height: 35px;
			line-height: 35px;
			label{
				flex: 1 1 auto;
			}
		}
		&-item{
			flex: 1 1 auto;
			width: 200px;
		}
	}
	.create-btn{
		width: 100px;
    height: 42px;
    display: inline-block;
    line-height: 43px;
	}
</style>