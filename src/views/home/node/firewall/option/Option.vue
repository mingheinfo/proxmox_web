<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" :disabled="option === ''" @on-click="showModal(option)">编辑</m-button>
    </div>
    <div slot="page-content">
      <div class="table">
        <div
          class="table-tr"
          @click="handleClick"
					v-for="item in options"
					:key="item.value"
          :id="item.value"
          :class="{ 'single-selected': option === item.value }"
        >
          <div class="table-td table-radio">
            <label class="m-input__radio">
              <input
                type="radio"
                :value="item.value"
                name="option"
                v-model="option"
              />
              <div></div>
            </label>
          </div>
          <div class="table-td">{{item.label}}</div>
          <div class="table-td" v-if="['enable', 'ndp', 'nosmurfs', 'tcpflags'].includes(item.value)">
            {{ db.nodeFireWallOptionObj && db.nodeFireWallOptionObj[item.value] == 1 ? '是' : '否' }}
            <i class="el-icon-edit edit-icon" @click="showModal(item.value)"></i>
          </div>
					<div class="table-td" v-else>
						{{ db.nodeFireWallOptionObj && db.nodeFireWallOptionObj[item.value] ? db.nodeFireWallOptionObj[item.value] : '默认' }}
            <i class="el-icon-edit edit-icon" @click="showModal(item.value)"></i>
					</div>
        </div>
      </div>
					<OptionModal :visible="visible" 
			             v-if="visible"
									 :title="title"
									 @close="visible = false; queryNodeFireWallOption()" 
									 :type="type"></OptionModal>
    </div>
  </page-template>
</template>
<script>
import NodeFirewallOptionHttp from "@src/views/home/node/firewall/option/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import OptionModal  from './OptionModal';
export default {
  name: "NodeFirewallOption",
  mixins: [NodeFirewallOptionHttp],
  components: {
    PageTemplate,
		MButton,
		OptionModal
  },
  data() {
    return {
      type: "",
      visible: false,
			option: "",
			title: '',
			options: [
				{
					value: 'enable',
					label: '防火墙'
				},
				{
	        value: 'nosmurfs',
					label: 'SMURFS过滤'
				},
				{
	        value: 'tcpflags',
					label: 'TCP标志过滤器'
				},
				{
	        value: 'ndp',
					label: 'NDP'
				},
				{
	        value: 'nf_conntrack_max',
					label: 'nf_conntrack_max'
				},
				{
        	value: 'nf_conntrack_tcp_timeout_established',
					label: 'nf_conntrack_tcp_timeout_established'
				},
				{
	        value: 'log_level_in',
					label: 'log_level_in'
				},
				{
        	value: 'log_level_out',
					label: 'log_level_out'
				},
				{
	        value: 'tcp_flags_log_level',
					label: 'tcp_flags_log_level'
				},
				{
	        value: 'smurf_log_level',
					label: 'smurf_log_level'
				}
			]
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		//初始化查找
    __init__() {
      this.queryNodeFireWallOption();
		},
		//点击表格行触发事件
    handleClick(event) {
      this.option = event.target.parentElement.id;
		},
		showModal(key) {
			this.type = key;
			switch(key) {
				case 'enable':
					this.title="编辑：防火墙"
					break;
				case 'nosmurfs':
					this.title="编辑：SMURFS过滤"
					break;
				case 'tcpflags':
					this.title="编辑：TCP标志过滤器"
					break;
				case 'ndp':
					this.title="编辑：NDP"
					break;
				case 'nf_conntrack_max':
					this.title="编辑：nf_conntrack_max"
					break;
				case 'nf_conntrack_tcp_timeout_established':
					this.title="编辑：nf_conntrack_tcp_timeout_established"
					break;
				case 'log_level_in':
					this.title="编辑：log_level_in"
					break;
				case 'log_level_out':
					this.title="编辑：log_level_out"
					break;
				case 'tcp_flags_log_level':
					this.title="编辑：tcp_flags_log_level"
					break;
				case 'smurf_log_level':
					this.title="编辑：smurf_log_level"
					break;
			}
			this.visible = true;
		}
  },
};
</script>

<style lang="less" scoped>
.cluster-desc {
  display: flex;
  margin: 10px 0px;
  padding: 10px 0px;
  border-top: 1px solid #c4d6ec;
  border-bottom: 1px solid #c4d6ec;
  &__item {
    flex: 1 1 auto;
    display: flex;
  }
  &__title {
    flex: 1 1 auto;
    display: inline-flex;
  }
  &__desc {
    flex: 1 1 auto;
    display: inline-flex;
  }
}
.table {
  &-td {
    height: 35px;
    line-height: 35px;
    width: 50%;
  }
  &-radio {
    width: 50px;
    padding-right: 20px;
  }
}
</style>