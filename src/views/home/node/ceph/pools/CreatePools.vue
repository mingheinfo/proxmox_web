<template>
  <m-dialog :visible="visible" title="创建Ceph Pools"
	          @close="close"
						@cancel="close"
						@confirm="confirm">
    <template slot="content">
          <div class="m-form__content">
      <div class="m-form__section">
        <m-input
          label="名称"
          prop="name"
          labelWidth="100px"
          v-model="name"
          validateEvent
          @validate="validate"
          required
          :show-error="rules['name'].error"
          :error-msg="rules['name'].message"
        />
        <m-input
          label="大小"
          prop="size"
          labelWidth="100px"
          v-model="size"
          validateEvent
          @validate="validate"
          required
          :show-error="rules['size'].error"
          :error-msg="rules['size'].message"
        />
        <m-input
          label="最小尺寸"
          prop="min_size"
          labelWidth="100px"
          v-model="min_size"
          validateEvent
          @validate="validate"
          required
          :show-error="rules['min_size'].error"
          :error-msg="rules['min_size'].message"
        />
        <m-select
           label="Crush Rule"
           labelWidth="100px"
           validateEvent
           @validate="validate"
           prop="crush_rule"
           required
           :show-error="rules['crush_rule'].error"
           :error-msg="rules['crush_rule'].message"
           @on-change="(val) => crush_rule = val"
           v-model="crush_rule">
          <m-option
            v-for="item in rulesList"
            :label="item.name"
            :value="item.name"
            :key="item.name"
          ></m-option>
        </m-select>
        <m-input
          label="pg_num"
          prop="pg_num"
          labelWidth="100px"
          v-model="pg_num"
          validateEvent
          @validate="validate"
          required
          :show-error="rules['pg_num'].error"
          :error-msg="rules['pg_num'].message"
        />
        <m-checkbox label="添加存储" labelWidth="100px" v-model="add_storages">
        </m-checkbox>
      </div>
    </div>
    </template>
  </m-dialog>
</template>

<script>
import CephHttp from "@src/views/home/node/ceph/http";
export default {
  name: "CreatePools",
  mixins: [CephHttp],
  props: {
    visible: Boolean,
  },
  data() {
    return {
      name: "",
      size: "3",
      min_size: "2",
      crush_rule: "",
      pg_num: "128",
      add_storages: false,
      rulesList: '',
      rules: {
        name: {
          error: false,
          message: "",
        },
        size: {
          error: false,
          message: "",
        },
        min_size: {
          error: false,
          message: "",
        },
        crush_rule: {
          error: false,
          message: "",
        },
        pg_num: {
          error: false,
          message: "",
        },
        add_storages: {
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
    //初始化
    __init__() {
      this.queryRules()
          .then(res => {
            this.rulesList = res;
            this.crush_rule = this.rulesList[0].rule
          })
    },
    //校验
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].message = "";
      this.rules[prop].error = false;
      if (/^\s*$/.test(value)) {
        this.rules[prop].message = "不能为空！";
        this.rules[prop].error = true;
        return;
      }
      if (prop === "min_size" && value) {
        if (this.size < this.min_size) {
          this.rules[prop].message = "最小大小不能超过大小！";
          this.rules[prop].error = true;
          return;
        }
      }
		},
		close() {
			this.$emit('close');
		},
    validateAll() {
      let props = [
        "name",
        "size",
        "min_size",
        "crush_rule",
        "pg_num",
        "add_storages",
			];
			props.forEach(item => this.validate(item));
			return props.some(prop => this.rules[prop].error === true);
		},
		confirm() {
			if(this.validateAll()) return;
			let param = {
        name: this.name,
        size: this.size,
        min_size: this.min_size,
        crush_rule: this.crush_rule,
        pg_num: this.pg_num,
        add_storages: this.add_storages ? 1 : 0
			}
			this.createPools(param)
			    .then(res => {
						this.close();
					});
		}
  },
};
</script>
