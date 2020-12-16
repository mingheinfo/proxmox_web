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
          <div class="table-td" v-if="['enable', 'ndp', 'dhcp', 'radv', 'macfilter', 'ipfilter'].includes(item.value)">
            {{ db.qemuFireWallOptionsObj && db.qemuFireWallOptionsObj[item.value] == 1 ? '是' : '否' }}
            <i class="el-icon-edit edit-icon" @click="showModal(item.value)"></i>
          </div>
					<div class="table-td" v-else>
						{{ db.qemuFireWallOptionsObj && db.qemuFireWallOptionsObj[item.value] ? db.qemuFireWallOptionsObj[item.value] : '默认' }}
            <i class="el-icon-edit edit-icon" @click="showModal(item.value)"></i>
					</div>
        </div>
      </div>
					<OptionModal :visible="visible" 
			             v-if="visible"
									 :title="title"
									 @close="visible = false; __init__()" 
									 :type="type"></OptionModal>
    </div>
  </page-template>
</template>
<script>
import QemuFirewallOptionHttp from "@src/views/home/qemu/firewall/options/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import OptionModal  from './OptionModal';
export default {
  name: "NodeFirewallOption",
  mixins: [QemuFirewallOptionHttp],
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
	        value: 'dhcp',
					label: 'DHCP'
				},
				{
	        value: 'ndp',
					label: 'NDP'
				},
				{
	        value: 'radv',
					label: '路由器广播'
				},
				{
	        value: 'macfilter',
					label: 'MAC过滤'
				},
				{
        	value: 'ipfilter',
					label: 'IP过滤'
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
	        value: 'policy_in',
					label: '输入策略'
				},
				{
	        value: 'policy_out',
					label: '输出策略'
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
      this.queryQemuOption();
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
				case 'dhcp':
					this.title="编辑：DHCP"
					break;
				case 'policy_in':
					this.title="编辑：输入策略"
					break;
				case 'ndp':
					this.title="编辑：NDP"
					break;
				case 'plicy_out':
					this.title="编辑：输出策略"
					break;
				case 'ipfilter':
					this.title="编辑：IP过滤器"
					break;
				case 'log_level_in':
					this.title="编辑：log_level_in"
					break;
				case 'log_level_out':
					this.title="编辑：log_level_out"
					break;
				case 'macfilter':
					this.title="编辑：MAC过滤器"
					break;
				case 'radv':
					this.title="编辑：路由器广播"
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