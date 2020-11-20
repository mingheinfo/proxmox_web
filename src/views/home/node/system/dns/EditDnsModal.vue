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
                prop="search"
                label="搜索域"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.search.error"
                :error-msg="rules.search.message"
                v-model="search"
                placeholder="请输入搜索域"
              />
              <m-input
                type="text"
                prop="dns1"
                label="dns1"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.dns1.error"
                :error-msg="rules.dns1.message"
                v-model="dns1"
                placeholder="请输入IPV4/CIDR"
              />
              <m-input
                type="text"
                prop="dns2"
                label="dns2"
                labelWidth="100px"
                v-model="dns2"
								validateEvent
                @validate="validate"
                :show-error="rules.dns2.error"
                :error-msg="rules.dns2.message"
                placeholder="请输入dns2"
              />
              <m-input
                type="text"
                prop="dns3"
                label="dns3"
                labelWidth="100px"
                v-model="dns3"
               	validateEvent
                @validate="validate"
                :show-error="rules.dns3.error"
                :error-msg="rules.dns3.message"
                placeholder="请输入dns3"
              />
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeSystemDnsHttp from "@src/views/home/node/system/dns/http";
import {
  IP64_match,
} from "@libs/utils/index";
export default {
  name: "EditDnsModal",
  mixins: [NodeSystemDnsHttp],
  components: {
    Dialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
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
    }
  },
  data() {
    return {
			search: '',
			dns1: '',
			dns2: '',
			dns3: '',
      rules: {
        dns1: {
          error: false,
          message: "",
        },
        dns2: {
          error: false,
          message: "",
        },
        dns3: {
          error: false,
          message: "",
				},
				search: {
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
    create() {
			if(this.validateAll()) return;
		},
    __init__() {
			let _this = this;
			Object.keys(_this.param).forEach(key => {
        _this[key] = _this.param[key]
			})
    },
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && prop === 'serach') {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
			}
      if (value && /^(dns)/.test(prop)) {
       if(!IP64_match.test(value)) {
				 this.rules[prop].error = true;
         this.rules[prop].message = "dns格式不正确;示例192.168.1.1   2001:DB8::42";
         return;
			 }
      }
    },
    validateAll() {
      let props = [];
      props = ["search", "dns1", "dns2", "dns3"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
      if (this.validateAll()) return;
      let params = {
        search: this.search,
				dns1: this.dns1,
				dns2: this.dns2,
				dns3: this.dns3
			};
			for(let dns in params) {
				 if(!params[dns]){
					 delete params[dns];
				 }
			}
			this.updateDns(params)
			    .then(res => {
						this.close();
					})
					.catch(res => {
						this.$confirm.error({
							msg: res
						})
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