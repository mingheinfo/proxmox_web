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
              <m-input
                type="text"
                prop="name"
                label="名称"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.name.error"
                :error-msg="rules.name.message"
                v-model="name"
                :disabled="!isCreate"
                placeholder="请输入名称"
              />
              <m-select
                prop="ovs_bridge"
                label="OVS Bridge"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.ovs_bridge.error"
                :error-msg="rules.ovs_bridge.message"
                v-model="ovs_bridge"
								@on-change="handleOVSBrigeSelect"
                v-if="iftype === 'OVSBond' || iftype === 'OVSIntPort'"
                placeholder="请选择OVS Bridge"
              >
                <m-option
                  v-for="(item, index) in networkList"
                  :key="item.iface"
                  :label="item.iface"
                  :value="item.iface"
                >
                  <template v-if="index === 0">
                    <div class="table-header__tr">
                      <span class="table-td">桥接</span>
                      <span class="table-td">活动</span>
                      <span class="table-td">备注</span>
                    </div>
                  </template>
                  <div class="table-tr">
                    <span class="table-td">{{ item.iface }}</span>
                    <span class="table-td">
                      <table-info-state
                        :content="
                          item.active && item.active === 1 ? '是' : '否'
                        "
                        :state="
                          item.active && item.active === 1
                            ? 'actived'
                            : 'unActived'
                        "
                      ></table-info-state>
                    </span>
                    <span class="table-td">
                      {{ item.comments }}
                    </span>
                  </div>
                </m-option>
              </m-select>
              <m-checkbox
                label="自启动"
                v-model="autostart"
                v-if="!['OVSBond', 'OVSIntPort'].includes(iftype)"
                labelWidth="100px"
              ></m-checkbox>
              <m-input
                type="text"
                prop="cidr"
                label="IPV4/CIDR"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.cidr.error"
                :error-msg="rules.cidr.message"
                v-model="cidr"
                v-if="iftype !== 'OVSBond'"
                placeholder="请输入IPV4/CIDR"
              />
              <m-input
                type="text"
                prop="vlanRawDevic"
                label="Vlan raw device"
                labelWidth="100px"
                v-model="vlanRawDevic"
                :disabled="
                  (iftype === 'vlan' && /()(\.\d)/.test(name))
                "
                v-if="iftype === 'vlan'"
                placeholder="请输入Vlan raw device"
              />
              <m-input
                type="text"
                prop="id"
                label="slaves"
                labelWidth="100px"
                v-model="slaves"
                v-if="iftype === 'bond'"
                placeholder="请输入Slaves"
              />
              <m-checkbox
                label="VLAN感知"
                v-model="bridge_vlan_aware"
                labelWidth="100px"
                v-if="iftype === 'bridge'"
              ></m-checkbox>
              <m-input
                type="text"
                prop="gateway"
                label="网关(IPV4)"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.gateway.error"
                :error-msg="rules.gateway.message"
                v-model="gateway"
                v-if="iftype !== 'OVSBond'"
                placeholder="请输入网关(IPV4)"
              />
              <m-input
                type="number"
                prop="vlan_tag"
                label="VLAN标签"
                labelWidth="100px"
                v-model="vlan_tag"
                :disabled="
                  (iftype === 'vlan' && /()(\.\d)/.test(name))
                "
                v-if="['vlan', 'OVSBond', 'OVSIntPort'].includes(iftype)"
                placeholder="请输入VLAN标签"
              />
              <m-input
                type="text"
                prop="ovs_options"
                label="OVS选项"
                labelWidth="100px"
                v-model="ovs_options"
                :disabled="!isCreate"
                v-if="['OVSBridge', 'OVSBond', 'OVSIntPort'].includes(iftype)"
                placeholder="请输入OVS选项"
              />
              <m-select
                prop="bond_mode"
                label="模式"
                labelWidth="100px"
                :readonly="false"
                @on-change="handleBondModeSelect"
                v-model="bond_mode"
                v-if="iftype === 'bond' || iftype === 'OVSBond'"
                placeholder="请选择模式"
              >
                <m-option
                  v-for="item in comboItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
              <m-input
                type="number"
                prop="bridge_ports"
                label="桥接端口"
                labelWidth="100px"
                min="100"
                v-model="bridge_ports"
                v-if="iftype === 'OVSBridge' || iftype === 'bridge'"
                placeholder="请输入桥接端口"
              />
              <m-input
                type="text"
                prop="cidr6"
                label="IPV6/CIDR"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.cidr6.error"
                :error-msg="rules.cidr6.message"
                v-model="cidr6"
                v-if="iftype !== 'OVSBond'"
                placeholder="请输入IPV6/CIDR"
              />
              <m-select
                prop="bind_xmit_hash_policy"
                label="hash策略"
                labelWidth="100px"
                :readonly="false"
                v-model="bind_xmit_hash_policy"
                v-if="iftype === 'bond'"
                @on-change="handleHashPolicySelect"
                :disabled="isHashDisabled"
                placeholder="请输入hash策略"
              >
                <m-option
                  v-for="item in hash_policy_comboItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
              <m-input
                type="text"
                prop="comments"
                label="备注"
                labelWidth="100px"
                v-model="comments"
                placeholder="请输入备注"
              />
              <m-input
                type="text"
                prop="gateway6"
                label="网关(IPV6)"
                labelWidth="100px"
                min="100"
                validateEvent
                @validate="validate"
                :show-error="rules.gateway6.error"
                :error-msg="rules.gateway6.message"
                v-model="gateway6"
                v-if="iftype !== 'OVSBond'"
                placeholder="请输入网关(IPV6)"
              />
              <m-input
                type="text"
                prop="bond_primary"
                label="bond-primary"
                labelWidth="100px"
                v-model="bond_primary"
                :disabled="bond_mode !== 'active-backup'"
                v-if="iftype === 'bond'"
                placeholder="请输入bond-primary"
              />
              <div v-if="iftype === 'vlan'" class="m-alert-info">
                Either add the VLAN number to an existing interface name, or
                choose your own name and set the VLAN raw device (for the latter
                ifupdown1 supports vlanXY naming only)
              </div>
            </dd>
          </dl>
          <dl v-if="isAdvice && iftype !== 'OVSBridge'">
            <dt>高级</dt>
            <dd>
              <m-input
                type="number"
                prop="mtu"
                label="MTU"
                labelWidth="100px"
                v-model="mtu"
                min="1280"
                placeholder="1500"
              />
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <template>
        <div class="label_box">
          <label>
            <input type="checkbox" v-model="isAdvice" />
            <div>高级</div>
          </label>
        </div>
        <m-button class="create-btn" type="primary" @on-click="create"
          >创建</m-button
        >
      </template>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeNetworkHttp from "@src/views/home/node/network/http";
import {
  IP4_cidr_match,
  IP4_match,
  IP6_match,
  IP6_cidr_match,
} from "@libs/utils/index";
import { bond_mode_gettext_map } from "@libs/enum/enum";
export default {
  name: "CreateReplicationModal",
  mixins: [NodeNetworkHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    iftype: {
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
  computed: {
    isHashDisabled() {
      return [
        "balance-rr",
        "active-backup",
        "broadcast",
        "balance-tlb",
        "balance-alb",
      ].includes(this.bond_mode);
    },
  },
  data() {
    return {
      name: "",
      autostart: true,
      isAdvice: true,
      bridge_vlan_aware: false,
      bridge_ports: "",
      ovs_ports: "",
      ovs_options: "",
      ovs_bridge: "",
      ovs_tag: "",
      vlan_tag: "",
      vlanRawDevic: "",
      bond_mode: "",
      ovs_bridge: "",
      vlanId: "",
      slaves: "",
      bind_xmit_hash_policy: "",
      bond_mode: "balance-rr",
      ovs_bonds: "",
      bond_primary: "",
      cidr: "",
      gateway: "",
      cidr6: "",
      gateway6: "",
      mtu: "",
      comments: "",
      comboItems: [],
			openvswitch: false,
			networkList: [],
      hash_policy_comboItems: [
        {
          label: "lay2",
          value: "lay2",
        },
        {
          label: "lay2+3",
          value: "lay2+3",
        },
        {
          label: "lay2+4",
          value: "lay2+4",
        },
      ],
      rules: {
        name: {
          error: false,
          message: "",
        },
        cidr: {
          error: false,
          message: "",
        },
        gateway: {
          error: false,
          message: "",
        },
        cidr6: {
          error: false,
          message: "",
        },
        gateway6: {
          error: false,
          message: "",
        },
        vlanRawDevic: {
          error: false,
          message: "",
        },
        ovs_bridge: {
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
    create() {
			if(this.validateAll()) return;
				let param = {}
			switch(this.iftype) {
					case 'bridge':
						param = {
							cidr: this.cidr,
							cidr6: this.cidr6,
							iface: this.name,
							bridge_ports: this.bridge_ports,
							gateway: this.gateway,
							gateway6: this.gateway6,
							autostart: this.autostart ? 1 : 0,
							comments: this.comments,
							bridge_vlan_aware: this.bridge_vlan_aware ? 1 : 0,
							mtu: this.mtu,
							type:'bridge'
						}
						break;
					case 'bond':
							param = {
							cidr: this.cidr,
							cidr6: this.cidr6,
							iface: this.name,
							gateway: this.gateway,
							gateway6: this.gateway6,
							autostart: this.autostart ? 1 : 0,
							comments: this.comments,
							slaves: this.slaves,
							bond_xmit_hash_policy: this.bind_xmit_hash_policy,
							bond_mode: this.bond_mode,
							mtu: this.mtu,
							type:'bond'
						}
						break;
					case 'vlan':
							param = {
							cidr: this.cidr,
							cidr6: this.cidr6,
							iface: this.name,
							gateway: this.gateway,
							gateway6: this.gateway6,
							autostart: this.autostart ? 1 : 0,
							comments: this.comments,
							'vlan-raw-device': this.vlanRawDevic,
							'vlan-id': this.vlan_tag,
							type: 'vlan'
						}
						break;
				  case 'OVSBridge':
						param = {
							cidr: this.cidr,
							cidr6: this.cidr6,
							iface: this.name,
							gateway: this.gateway,
							gateway6: this.gateway6,
							autostart: this.autostart ? 1 : 0,
							comments: this.comments,
							ovs_ports: this.ovs_ports,
							ovs_options: this.ovs_options,
							type: 'OVSBridge'
						}
						break;
					 case 'OVSBond':
						 	param = {
							iface: this.name,
							comments: this.comments,
							'vlan-id': this.vlan_tag,
							bond_mode: this.bond_mode,
							ovs_bridge: this.ovs_bridge,
							ovs_options: this.ovs_options,
							slaves: this.slaves,
							type: 'OVSBond'
						}
						break;
					case 'OVSIntPort':
						param = {
							cidr: this.cidr,
							cidr6: this.cidr6,
							iface: this.name,
							gateway: this.gateway,
							gateway6: this.gateway6,
							comments: this.comments,
								'vlan-id': this.vlan_tag,
							ovs_bridge: this.ovs_bridge,
							ovs_options: this.ovs_options,
							type: 'OVSIntPort'
						}
						break;
						default: 
						param = {
	            cidr: this.cidr,
							cidr6: this.cidr6,
							iface: this.name,
							gateway: this.gateway,
							gateway6: this.gateway6,
							autostart: this.autostart ? 1 : 0,
							comments: this.comments,
							mtu: this.mtu,
							type:'eth'
						}
				}
			if(this.isCreate) {
				for(let key of Object.keys(param)) {
						if(!param[key]) delete param[key];
				}
				this.createNetWork(param)
				    .then(res => {
							this.close();
						}).catch((res) => {
							this.$confirm.error({
								msg: res
							})
						});
			} else {
	      for(let key of Object.keys(param)) {
					if(!String(param[key])) delete param[key];
				}
				delete param.iface;
				this.updateNetWork(this.param.iface, param)
				    .then(res => {
							this.close();
						}).catch((res) => {
							this.$confirm.error({
								msg: res
							})
						});
			}
		},
    render_bond_mode: (value) => bond_mode_gettext_map[value] || value || "",
    bond_mode_array(modes) {
      return modes.map((mode) => {
        return { value: mode, label: this.render_bond_mode(mode) };
      });
    },
    async __init__() {
			let _this = this;
      if (this.iftype === "OVSBond") _this.openvswitch = true;
      if (_this.openvswitch) {
        _this.comboItems = _this.bond_mode_array([
          "active-backup",
          "balance-slb",
          "lacp-balance-slb",
          "lacp-balance-tcp",
        ]);
        _this.bond_mode = "active-backup";
      } else {
        _this.comboItems = _this.bond_mode_array([
          "balance-rr",
          "active-backup",
          "balance-xor",
          "broadcast",
          "802.3ad",
          "balance-tlb",
          "balance-alb",
        ]);
			}
			let number =  (Math.max(
            ..._this.db.nodeNetWorkList
              .filter((it) => {
                if (/vmbr/.test(it.iface)) {
                  return it.iface;
                }
              })
              .map((arr) => {
                return Number(arr.iface.match(/(\d)/)[0]);
              })
          ) +
						1);
				let numberBond =  (Math.max(
            ..._this.db.nodeNetWorkList
              .filter((it) => {
                if (/bond/.test(it.iface)) {
                  return it.iface;
                }
              })
              .map((arr) => {
                return Number(arr.iface.match(/(\d)/)[0]);
              })
          ) +
						1)
						debugger;
      if (/bridge/.test(_this.iftype.toLocaleLowerCase())) {
        _this.name =
          "vmbr" + (String(number) === 'Infinity' || String(number) === '-Infinity' ? 0 : number);
      }
      if (/bond/.test(_this.iftype.toLocaleLowerCase())) {
        _this.name =
          "bond" + (String(numberBond) === 'Infinity' || String(numberBond) === '-Infinity' ? 0 : numberBond);
      }
			if (this.iftype === "vlan") _this.name = "interfaceX.1";
			if (this.iftype === "OVSBond" || this.iftype === "OVSIntPort") {
				this.networkList = this.db.nodeNetWorkList.filter(it => it.type === 'OVSBridge');
			}
			if(this.isCreate) {
         
			} else {
				//Object.assign(_this.$data, _this.$options.data());
				Object.keys(_this.param).forEach((key) => {
					if(key === 'iface') _this.name = _this.param[key];
					else if(key === 'autostart') _this.param[key] === 1 ? true : false;
					else if(key === 'bridge_vlan_aware') _this.param[key] === 1 ? true : false
					else _this[key] = _this.param[key]; 
				})
				if(!_this.param.hasOwnProperty('autostart')) {
					_this.autostart = false;
				}
				if(!_this.param.hasOwnProperty('bridge_vlan_aware')) {
					_this.bridge_vlan_aware = false;
				}
			}
    },
    handleBondModeSelect(value) {
      this.bond_mode = value;
      if (
        [
          "balance-rr",
          "active-backup",
          "broadcast",
          "balance-tlb",
          "balance-alb",
        ].includes(this.bond_mode)
      ) {
        this.bind_xmit_hash_policy = "";
      }
    },
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && prop === "name") {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (value && prop === "cidr") {
        if (!IP4_cidr_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "cidr4格式不正确";
          return;
        }
      }
      if (
        value &&
        prop === "name" &&
        /bridge/.test(this.iftype.toLocaleLowerCase())
      ) {
        if (!/(vmbr)((0){1}|([1-9]([\d]){0,3}))$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "名称格式vmbrN;其中 0<= N <=9999";
          return;
        }
      }
      if (
        value &&
        prop === "name" &&
        /bond/.test(this.iftype.toLocaleLowerCase())
      ) {
        if (!/(bond)((0){1}|([1-9]([\d]){0,3}))$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "名称格式bondN;其中 0<= N <=9999";
          return;
        }
      }
      if (value && prop === "gateway") {
        if (!IP4_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "网关（IPV4）格式不正确";
          return;
        }
      }
      if (value && prop === "cidr6") {
        if (!IP6_cidr_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "cidr6格式不正确";
          return;
        }
      }
      if (value && prop === "gateway6") {
        if (!IP6_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "网关（IPV6）格式不正确";
          return;
        }
      }
    },
    validateAll() {
      let props = [];
      props = ["name", "cidr", "gateway", "cidr6", "gateway6"];
      if (this.iface === "vlan") props.push("vlanRawDevic");
      if (this.iface === "OVSIntPort" || this.iface === "OVSBond")
        props.push("ovs_bridge");

      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    handleHashPolicySelect(value) {
      this.bind_xmit_hash_policy = value;
		},
		handleOVSBrigeSelect(value) {
     this.ovs_bridge = value;
		},
    confirm() {
      if (this.validateAll()) return;
      let params = {
        target: this.target.join(","),
        schedule: this.schedule,
        rate: this.rate,
        comment: this.comment,
        disable: this.disable ? 0 : 1,
      };
      if (this.isCreate) {
        params.type = "local";
        let vm = this.id;
        let id = -1;
        if (this.highestids[vm] !== undefined) {
          id = this.highestids[vm];
        }
        id++;
        params.id = vm + "-" + id.toString();
      }
      for (let key in params) {
        if (!params[key]) delete params[key];
      }
      if (this.modalType === "create")
        this.createReplication(params).then(() => {
          this.close();
        });
      if (this.modalType !== "create") {
        params["id"] = this.param.id;
        params["digest"] = this.db.dataCenterReplicationObj.digest;
        if (!params.disable) params["delete"] = "disable";
        this.updateReplication(params).then(() => {
          this.close();
        });
      }
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
.table {
  &-tr {
    display: table;
    height: 35px;
    line-height: 35px;
    min-width: 300px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
  }
  &-td {
    display: table-cell;
    height: 35px;
    line-height: 35px;
    max-width: 100px;
  }
  &-radio {
    width: 50px;
    padding-right: 20px;
  }
}
.checkbox {
  margin-bottom: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
}
.m-button {
  height: 33px;
  line-height: 28px;
}
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
</style>