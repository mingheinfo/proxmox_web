<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
				<Dialog
        :visible="showLog"
        @close="closeLog"
        :_style="{
          width: '800px',
        }"
        title="Task Viewer: 加入集群"
      >
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
            <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button
            type="primary"
            @on-click="stopTask1"
						class="stop-task"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >停止</m-button
          >
         <el-scrollbar style="height: 100%">
          <div class="taskmodal-content">
          <div class="table" v-if="tab === 'log'">
            <div
              class="table-tr"
              v-for="item in db.addClusterLogList"
              :key="item.n"
            >
              {{ item.t }}
            </div>
          </div>
          <div class="table" v-if="tab === 'status'">
            <template v-for="(item, key) in db.addClusterStatusObj">
              <div
                class="table-tr"
                v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                :key="key"
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
         </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
							<m-select
                prop="ovs_bridge"
                label="Challenge type"
                labelWidth="100px"
                v-model="type"
								@on-change="handleTypeSelect"
                placeholder="请选择Challenge type"
								v-if="modalType === 'domains'"
              >
                <m-option label="HTTP" value="http">HTTP</m-option>
								<m-option label="DNS" value="dns">DNS</m-option>
              </m-select>
              <m-input
                type="text"
                prop="domains"
                label="域名"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.domains.error"
                :error-msg="rules.domains.message"
                v-model="domains"
								v-if="modalType === 'domains'"
                placeholder="请输入域名"
              />
							<m-select
                prop="plugin"
                label="Plugin"
                labelWidth="100px"
                v-model="plugin"
								@on-change="handlePluginSelect"
								 validateEvent
                @validate="validate"
                :show-error="rules.plugin.error"
                :error-msg="rules.plugin.message"
                placeholder="请选择Plugin"
								v-if="modalType === 'domains' && type === 'dns'"
              >
							  <template v-for="item in db.acmePluginList">
                   <m-option   v-if="item.type !== 'standalone'" :label="item.plugin" :value="item.plugin" :key="item.plugin">
                       {{item.plugin}}
								  </m-option>
								</template>
              </m-select>
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
								v-if="modalType === 'account'"
                placeholder="请输入名称"
              />
							<m-select
                prop="directory"
                label="ACME目录"
                labelWidth="100px"
                v-model="directory"
								@on-change="handleDirectorySelect"
                placeholder="请选择ACME目录"
								v-if="modalType === 'account'"
              >
                <m-option v-for="(item, index) in db.directoriesList" 
								          :label="item.name"
													:key="item.url"
													:value="item.url">
									<template v-if="index === 0">
										<div class="table-tr">
											<div class="table-td">名称</div>
											<div class="table-td">URL</div>
										</div>
									</template>
									<div class="table-tr">
										<div class="table-td" :title="item.name">{{item.name}}</div>
										<div class="table-td" :title="item.url">{{item.url}}</div>
									</div>
							</m-option>
              </m-select>
							<m-input
                type="slot"
                prop="tos_url"
                label="服务条款"
                labelWidth="100px"
                v-model="tos_url"
                placeholder="请输入名称"
								:__conStyle="{
                   'border':'none',
									 width: 'calc(100% - 105px)'
								}"
								v-if="modalType === 'account'"
              >
							   <a slot="other" @click="openTos">{{tos_url}}</a>
							</m-input>
							<m-input
                type="text"
                prop="contact"
                label="邮箱"
                labelWidth="100px"
                validateEvent
                @validate="validate"
									v-if="modalType === 'account'"
                :show-error="rules.contact.error"
                :error-msg="rules.contact.message"
                v-model="contact"
                placeholder="请输入邮箱"
              />
								<m-checkbox
                label="接受TOS"
                v-model="reacived"
                labelWidth="100px"
								v-if="modalType === 'account'"
								:disabled="true"
              ></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <template>
        <m-button class="create-btn" type="primary" @on-click="create"
          >创建</m-button
        >
      </template>
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import CertificatesHttp from "@src/views/home/node/system/certificates/http";
import {
  IP4_cidr_match,
  IP4_match,
  IP6_match,
	IP6_cidr_match,
	dateFormat
} from "@libs/utils/index";
export default {
  name: "CreateReplicationModal",
  mixins: [CertificatesHttp],
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
      type: "",
			domains: '',
			tos_url: '',
			concat: '',
			reacived: true,
			contact: '',
			directory: '',
			showLog: false,
      interVal: null,
			tab: "log",
			plugin: '',
			name: '',
      rules: {
        domains: {
          error: false,
          message: "",
				},
				contact: {
          error: false,
          message: "",
				},
				plugin: {
					error: false,
					message: ''
				},
				name: {
					error: false,
					message: ''
				}
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    create() {
			if(this.validateAll()) return;
			if(this.modalType === 'account') {
				let param = {
					tos_url: this.tos_url,
					name: this.name ?  this.name : 'default',
					directory: this.directory,
					contact: this.contact
				}
				this.createAcmeAccount(param).then((res) => {
						this.showLog = true;
            this.interVal = setInterval(() => {
							 this.queryLog( 
								  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid);
							 this.queryStatus(
                  this.db.addClusterStatusObj.node,
                  this.db.addClusterStatusObj.upid
                )
						},3000);
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });;
			} 
			if(this.modalType === 'domains') {
					let param = {
					acme: this.param.acme && this.param.acme.indexOf('domains') > -1 ? this.param.acme +`;${this.domains}` : `${this.param.acme},domains=${this.domains}`,
				  digest: this.db.certificatesConfigObj.digest
				}
				this.createAcmeDomains(param)
				    .then(res => {
							this.close();
						})
				    .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });;
			}
		},
    async __init__() {
			let _this = this;
			if(_this.modalType === 'domains' && _this.isCreate) {
         _this.queryAcmePluginsList();
			}else if(_this.modalType === 'domains' && !_this.isCreate){
				_this.type = _this.param.current['plugin'] ? 'dns' : 'http';
				_this.domains = _this.param.current.domain;
        _this.plugin = _this.param.current.plugin ? _this.param.current.plugin : '';
			}else {
				_this.queryAcmeDirection()
				     .then((res) => {
							 _this.directory = _this.db.directoriesList[0].url;
							 _this.queryAcmeTos(_this.directory)
						 });
			}
    },
    handleTypeSelect(value) {
      this.type = value;
		},
		handleDirectorySelect(value) {
			this.directory = value;
			this.queryAcmeTos(value)
		},
		handlePluginSelect(value) {
      this.plugin = value;
		},
    close() {
      this.$emit("close");
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && (['name', 'domains', 'plugin'].includes(prop))) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (value && prop === "contact" && this.modalType === 'account') {
        if (!/^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "邮箱格式不正确";
          return;
        }
			}
			 if(value && prop ==="domains" && this.modalType === 'domains') {
        if(!/^\w+(?:\.[a-zA-Z0-9]{2,})$/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "域名格式不正确";
          return;
        }
      }
		},
		openTos() {
			window.open(this.tos_url)
		},
    validateAll() {
			let props = [];
			if(this.modalType === 'domains'){
        props = ["domains"];
			}
			if(this.modalType === 'domains' && this.type ===  'dns') {
				props.push('plugin');
			}
			if(this.modalType === 'account') {
        props = ["contact"]
			}
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
   stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      );
    },
    closeLog() {
      this.showLog = false;
      this.close();
		},
		handleTabChange(value) {
      this.tab = value;
    }
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
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
.service-police {
  width: 100%;
  padding: 0px 20px 20px 0px;
  &-label {
    width: 100px;
    display: inline-block;
  }
  &-content {
    display: inline-block;
  }
}
.stop-task{
	margin-top: 10px;
}
</style>