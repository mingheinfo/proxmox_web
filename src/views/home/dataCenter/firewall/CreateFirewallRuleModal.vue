<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-select
                prop="type"
                label="方向"
                labelWidth="100px"
                validateEvent
                @on-change="handleTypeSelect"
                v-model="type"
                placeholder="请选择方向"
              >
                <m-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
							<m-checkbox
                label="启用"
                v-model="enable"
                labelWidth="100px"
              ></m-checkbox>
              <m-select
                prop="action"
                label="操作"
                labelWidth="100px"
                @on-change="handleActionSelect"
                v-model="action"
                :readonly="false"
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
							 <m-select
                prop="macro"
                label="宏"
                labelWidth="100px"
                @on-change="handleMacroSelect"
                v-model="macro"
                placeholder="请选择宏"
								:readonly="false"
              >
                <m-option
                  v-for="(item, index) in db.macrosList"
                  :key="item.macro"
                  :label="item.macro"
                  :value="item.macro"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">宏</span>
                        <span class="table-td">描述</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.macro }}</span>
                      <span class="table-td">{{ item.descr }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
							<m-input
                type="text"
                prop="iface"
                label="接口"
                labelWidth="100px"
                v-model="iface"
                :placeholder="'请输入接口'"
              />
							 <m-select
                prop="proto"
                label="协议"
                labelWidth="100px"
                @on-change="handleProtoSelect"
                v-model="proto"
								:readonly="false"
								:disabled="macro !== ''"
                placeholder="请选择协议"
              >
                <m-option
                  v-for="(item, index) in portocalOptions"
                  :key="item.p"
                  :label="item.p"
                  :value="item.p"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">协议</span>
                        <span class="table-td">数</span>
												<span class="table-td">描述</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.p }}</span>
											<span class="table-td">{{ item.n }}</span>
                      <span class="table-td">{{ item.d }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-select
                prop="source"
                label="源"
                labelWidth="100px"
                @on-change="handleSourceSelect"
                v-model="source"
								:readonly="false"
                placeholder="请选择源"
              >
                <m-option
                  v-for="(item, index) in db.fireWallResfList"
                  :key="item.name"
                  :label="item.ref"
                  :value="item.name"
                >
								 <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">类</span>
                        <span class="table-td">名称</span>
												<span class="table-td">备注</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.type }}</span>
											<span class="table-td">{{ item.name }}</span>
                      <span class="table-td">{{ item.ref }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
							<m-input
                type="number"
                prop="sport"
                label="源端口"
                labelWidth="100px"
                v-model="sport"
								:disabled="macro !== ''"
                :placeholder="'请输入源端口'"
              />
							<m-select
                prop="dest"
                label="目标"
                labelWidth="100px"
                @on-change="handleDestSelect"
                v-model="dest"
								:readonly="false"
                placeholder="请选择目标"
              >
                <m-option
                  v-for="(item, index) in db.fireWallResfList"
                  :key="item.name"
                  :label="item.ref"
                  :value="item.name"
                >
								  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">类</span>
                        <span class="table-td">名称</span>
												<span class="table-td">备注</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td">{{ item.type }}</span>
											<span class="table-td">{{ item.name }}</span>
                      <span class="table-td">{{ item.ref }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
								<m-input
                type="number"
                prop="dport"
                label="目标端口"
                labelWidth="100px"
								:disabled="macro !== ''"
                v-model="dport"
                :placeholder="'请输入目标端口'"
              />
								<m-input
                type="textarea"
                prop="comment"
                label="备注"
                labelWidth="100px"
                v-model="comment"
                placeholder="请输入备注"
              />
            </dd>
          </dl>
				  <dl v-if="isAdvice">
						<dt>高级</dt>
						<dd>
							<m-select
                prop="log"
                label="日志级别"
                labelWidth="100px"
                @on-change="handleLogSelect"
                v-model="log"
                placeholder="请选择日志级别"
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
    </div>
		<template slot="footer">
			  <div class="label_box">
          <label>
            <input type="checkbox" v-model="isAdvice" />
            <div>高级</div>
          </label>
        </div>
        <m-button class="create-btn" type="primary" @on-click="confirm"
          >创建</m-button
        >
		</template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import FirewallHttp from "@src/views/home/dataCenter/firewall/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
import { PORTOCOLIST } from '@libs/enum/enum'
export default {
  name: "CreateAccessModal",
  mixins: [FirewallHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      type: "in",
      log: 'nolog',
      action: 'ACCEPT',
			enable: false,
			source: '',
			dport: '',
			sport: '',
			comment: '',
			macro: '',
			iface:'',
			dest: '',
			proto:'',
			portocalOptions: PORTOCOLIST,
			isAdvice: true,
			typeOptions: [
				{label: '入', value: 'in'},
				{label: '出', value: 'out'}
			],
			actionOptions: [
				{label: '接收', value: 'ACCEPT'},
				{label: '删除', value: 'DROP'},
				{label: '拒绝', value: 'REJECT'}
			],
			logsOptions: [
				{ label: 'nolog', value: 'nolog'}, 
				{ label: 'emerg', value: 'emerg'}, 
				{label:'alert', value: 'alert'},
				{label:'crit', value: 'crit'},
				{label:'err', value: 'err'}, 
				{label:'warning', value: 'warning'},
				{label:'notice', value: 'notice'}, 
				{label:'info', value: 'info'}, 
				{label:'debug', value: 'debug'}
			],
      rules: {
        path: {
          error: false,
          message: "",
        },
        groups: {
          error: false,
          message: "",
				},
				users: {
					error: false,
          message: "",
				},
				tokens: {
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
    percentToFixed,
    byteToSize,
    async __init__() {
			if(this.isCreate)
			await this.queryMacrosList();
			await this.queryRefsList();
    },
    handlePathSelect(value) {
      this.path = value;
    },
    handleGroupSelect(value) {
			switch(this.modalType) {
				case 'user':
					this.users = value;
					break;
				case 'group':
					this.groups = value;
					break;
				case 'tokens':
					this.tokens = value;
					break;
				default: 
				  this.groups = value;
			}
		},
		handleDestSelect(value) {
			this.dest = value;
		},
		handleSourceSelect(value) {
			this.source = value;
		},
		handleTypeSelect(value) {
			this.type = value;
		},
		handleMacroSelect(value) {
			this.macro = value;
		},
		handleProtoSelect(value) {
			this.proto = value;
		},
		handleLogSelect(value) {
			this.log = value;
		},
		handleActionSelect(value) {
			this.action = value;
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
			let props = [];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let param = {
				type: this.type,
				enable: this.enable ? 1 : 0,
				source: this.source,
				dest: this.dest,
				sport: this.sport,
				proto: this.proto,
				comment: this.comment,
				action: this.action,
				dport: this.dport,
				iface: this.iface,
				macro: this.macro
			}
			if(this.isAdvice) param.log = this.log;
			if(!this.iface) delete param.iface;
      if(this.isCreate)
			this.createFireWall(param).then(res => {
				this.close();
			}).catch(res => {
				this.$confirm.info({
					msg: res
				}).then(() => this.close())
			})
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>