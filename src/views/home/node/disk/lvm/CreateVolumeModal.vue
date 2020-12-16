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
                prop="device"
                label="磁盘"
                labelWidth="100px"
                @on-change="handleDestSelect"
                v-model="device"
								validateEvent
								@validate="validate"
								:error-msg="rules['device'].message"
								:show-error="rules['device'].error"
                :readonly="false"
                placeholder="请选择磁盘"
              >
                <m-option
                  v-for="(item, index) in db.nodeDiskList"
                  :key="item.devpath"
                  :label="item.devpath"
                  :value="item.devpath"
                >
                  <div class="table">
                    <template v-if="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">设备</span>
                        <span class="table-td">大小</span>
                        <span class="table-td">串行</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.devpath">{{ item.devpath }}</span>
                      <span class="table-td" :title="item.size && byteToSize(item.size) || 0">{{ item.size && byteToSize(item.size) || 0 }}</span>
                      <span class="table-td" :title="item.serial">{{ item.serial }}</span>
                    </div>
                  </div>
                </m-option>
              </m-select>
              <m-input
                type="text"
                prop="name"
                label="名称"
                labelWidth="100px"
								v-model="name"
                validateEvent
								@validate="validate"
								:error-msg="rules['name'].message"
								:show-error="rules['name'].error"
                :placeholder="'请输入名称'"
              />
              <m-checkbox
                label="添加存储"
                v-model="add_storage"
                labelWidth="100px"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="confirm"
        >创建</m-button
      >
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import NodeDiskLvmHttp from "@src/views/home/node/disk/lvm/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
import { PORTOCOLIST } from "@libs/enum/enum";
export default {
  name: "CreateVolumeModal",
  mixins: [NodeDiskLvmHttp],
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
    }
  },
  data() {
    return {
			device: '',
			name: '',
			add_storage: true,
      rules: {
        name: {
          error: false,
          message: "",
				},
				device: {
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
    //请求磁盘
    async __init__() {
      let _this = this;
      this.queryListNodeDiskList({type: 'unused'});
		},
		//选择磁盘
    handleDestSelect(value) {
      this.device = value;
		},
		//关闭弹框
    close() {
      this.$emit("close");
		},
		//校验表单
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
		//整体校验表单
    validateAll() {
      let props = ['name', 'device'];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		//确定添加
    confirm() {
      if (this.validateAll()) return;
      let param = {
				name: this.name,
				add_storage: this.add_storage ? 1 : 0,
				device: this.device
      };
     
         this.createVolumeGroup(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
							.then(() => this.close());
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