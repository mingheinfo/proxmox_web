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
    <template slot="content" v-if="type === 'enable'">
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
		 <template slot="content" v-if="type === 'nosmurfs'">
        <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-checkbox
						    label="SMURFS过滤"
                v-model="nosmurfs"
                labelWidth="100px"
            ></m-checkbox>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		<template slot="content" v-if="type === 'tcpflags'">
         <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-checkbox
						    label="TCP标志过滤器"
                v-model="tcpflags"
                labelWidth="100px"
            ></m-checkbox>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
			<template slot="content" v-if="type === 'ndp'">
         <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					    <m-checkbox
						    label="NDP"
                v-model="ndp"
                labelWidth="100px"
            ></m-checkbox>
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		<template slot="content" v-if="type === 'nf_conntrack_max'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-input
                prop="nf_conntrack_max"
                label="nf_conntrack_max"
								:min="32768"
								type="number"
                v-model="nf_conntrack_max"
                placeholder="请输入nf_conntrack_max"
              />
            </dd>
          </dl>
        </div>
			 </div>
    </template>
		<template slot="content" v-if="type === 'nf_conntrack_tcp_timeout_established'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-input
                prop="nf_conntrack_tcp_timeout_established"
                label="nf_conntrack_tcp_timeout_established"
								type="number"
								:min="32768"
                v-model="nf_conntrack_tcp_timeout_established"
                placeholder="请输入nf_conntrack_tcp_timeout_established"
              />
            </dd>
          </dl>
        </div>
			 </div>
    </template>
			<template slot="content" v-if="type === 'log_level_in'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					   <m-select
                prop="log_level_in"
								label="log_level_in"
                @on-change="handleUnitSelect"
                v-model="log_level_in"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in logsOptions"
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
			<template slot="content" v-if="type === 'log_level_out'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-select
                prop="log_level_out"
								label="log_level_out"
                @on-change="handleUnitSelect"
                v-model="log_level_out"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in logsOptions"
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
			<template slot="content" v-if="type === 'tcp_flags_log_level'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-select
                prop="tcp_flags_log_level"
								label="tcp_flags_log_level"
                @on-change="handleUnitSelect"
                v-model="tcp_flags_log_level"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in logsOptions"
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
			<template slot="content" v-if="type === 'smurf_log_level'">
		 <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
					  <m-select
                prop="smurf_log_level"
								label="smurf_log_level"
                @on-change="handleUnitSelect"
                v-model="smurf_log_level"
                placeholder="请选操作"
              >
                <m-option
                  v-for="item in logsOptions"
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
import NodeFirewallOptionHttp from "@src/views/home/node/firewall/option/http";
import DropdownItem from '@src/components/dropdown/dropdownItem';
import { KVM_KEYMAPS, CONSOLE_Map, KVM_HA_Map } from "@libs/enum/enum.js";
import {  httpProxy, macPrefix, proxmoxMail } from "@libs/utils/index.js";
import Dropdown from '@src/components/dropdown/dropdown';
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
export default {
	name: 'NodeFireWallOptionModal',
	mixins: [NodeFirewallOptionHttp],
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
		 enable: true,
		 nosmurfs: true,
	   tcpflags: true,
		 ndp: true,
		 nf_conntrack_max: '',
		 nf_conntrack_tcp_timeout_established: '',
		 log_level_in: 'nolog',
		 log_level_out: 'nolog',
		 tcp_flags_log_level: 'nolog',
		 smurf_log_level: 'nolog',
		logsOptions: [
        { label: "nolog", value: "nolog" },
        { label: "emerg", value: "emerg" },
        { label: "alert", value: "alert" },
        { label: "crit", value: "crit" },
        { label: "err", value: "err" },
        { label: "warning", value: "warning" },
        { label: "notice", value: "notice" },
        { label: "info", value: "info" },
        { label: "debug", value: "debug" },
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
		await this.queryNodeFireWallOption({_dc: new Date().getTime()});
		//设置默认选中或输入
	  if(['enable', 'ndp', 'nosmurfs', 'tcpflags'].includes(this.type)) {
			this[this.type] = this.db.nodeFireWallOptionObj && this.db.nodeFireWallOptionObj[this.type] && this.db.nodeFireWallOptionObj[this.type] === 1 ? true : false;
		} else {
			this[this.type] = this.db.nodeFireWallOptionObj && this.db.nodeFireWallOptionObj[this.type] && this.db.nodeFireWallOptionObj[this.type]
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
			if(['enable', 'ndp', 'nosmurfs', 'tcpflags'].includes(this.type)) {
			  param[this.type] = this.$data[this.type] ? 1 : 0;
			} else {
				param[this.type] = this.$data[this.type]
			}
			param['digest'] = this.db.nodeFireWallOptionObj.digest;
			if(!this.$data[this.type]) {
				delete param[this.type];
				param['delete'] = this.type;
			}
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
		//选择单位
		handleUnitSelect(value) {
			this.$data[this.type] = value;
		},
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