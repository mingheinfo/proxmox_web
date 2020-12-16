<template>
  <Dialog
    :visible="visible"
    @close="close()"
    :_style="{
      width: '100%',
      height: 'calc(100%)',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    }"
    title="集群加入信息"
  >
    <template slot="content" v-if="type === 'info'">
      <h1>在此处复制加入信息并在要添加的节点上使用它。</h1>
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>ip地址</dt>
            <dd>
              <m-input
                type="text"
                prop="ipAddress"
                v-model="ipAddress"
                readonly
                :_style="{ width: '650px' }"
                :__conStyle="{'width':'auto'}"
                placeholder="请输入IP地址"
              />
            </dd>
          </dl>
          <dl>
            <dt>指纹</dt>
            <dd>
              <m-input
                type="text"
                prop="fingerprint"
                v-model="fingerprint"
                readonly
                :_style="{ width: '650px' }"
                :__conStyle="{'width':'auto'}"
                placeholder="请输入指纹"
              />
            </dd>
          </dl>
          <dl>
            <dt>加入信息</dt>
            <dd>
              <m-input
                ref="info"
                type="textarea"
                prop="information"
                v-model="information"
                :rows="10"
                :_style="{ width: '650px' }"
                readonly
                :__conStyle="{'width':'auto'}"
                placeholder="请输入信息"
              />
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'create'">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>集群名称</dt>
            <dd>
              <m-input
                type="text"
                prop="clusterName"
                validateEvent
                @validate="validate"
                :show-error="rules.clusterName.error"
                :error-msg="rules.clusterName.message"
                v-model="clusterName"
                placeholder="请输入集群名称"
              />
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-show="isAdvice">
            <dl>
            <dt>网络</dt>
            <dd>
              <m-select
                type="text"
                prop="link0"
                label="link0"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.link0.error"
                :error-msg="rules.link0.message"
                :readonly="false"
								@on-change="(value) => link0 = value"
                v-model="link0"
                placeholder="请选择"
              >
                <m-option
                  v-for="(item, index) in netWorkList"
                  :key="item.address"
                  :label="item.address"
                  :value="item.address"
                >
                  <template v-show="index === 0">
                    <div class="table-header__tr">
                      <span class="table-td">CIDR</span>
                      <span class="table-td">接口</span>
                      <span class="table-td">活动</span>
                      <span class="table-td">备注</span>
                    </div>
                  </template>
                  <div class="table-tr">
                    <span class="table-td" :title="item.address">{{ item.address }}</span>
                    <span class="table-td" :title="item.iface">{{ item.iface }}</span>
                    <span class="table-td" :title="item.active">
                      <table-info-state
                        :content="item.active === 1 ? '是' : '否'"
                        :state="item.active === 1 ? 'actived' : 'unactived'"
                      ></table-info-state>
                    </span>
                    <span class="table-td" :title="item.comment">
                      {{ item.comment }}
                    </span>
                  </div>
                </m-option>
              </m-select>
              <template v-for="(item, num) in networkNum">
                <m-select
                  type="text"
                  :prop="`link${item}`"
                  :label='`link${item}`'
                  labelWidth="100px"
                  validateEvent
                  v-model="link[item]"
									@on-change="(value) => $data.link[item] = value"
                  placeholder="请选择"
                  :key="num"
                >
                  <m-option
                    v-for="(item, index) in netWorkList"
                    :key="item.address"
                    :label="item.address"
                    :value="item.address"
                  >
                    <template v-show="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">CIDR</span>
                        <span class="table-td">接口</span>
                        <span class="table-td">活动</span>
                        <span class="table-td">备注</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.address">{{ item.address }}</span>
                      <span class="table-td" :title="item.iface">{{ item.iface }}</span>
                      <span class="table-td" :title="item.active">
                        <table-info-state
                          :content="item.active === 1 ? '是' : '否'"
                          :state="item.active === 1 ? 'actived' : 'unactived'"
                        ></table-info-state>
                      </span>
                      <span class="table-td" :title="item.comment">
                        {{ item.comment }}
                      </span>
                    </div>
                  </m-option>
                </m-select>
                <m-button
                  type="danger"
                  icon="el-icon-delete"
                  @on-click="handleLinkDelete(item, num)"
                  :key="num"
                  >删除</m-button
                >
              </template>
              <m-button
                type="primary"
                icon="el-icon-plus"
                @on-click="handleLinkChange"
                >添加</m-button
              >
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="content" v-if="type === 'join'">
      <h1>
        <div class="checkbox">
          <label class="m-form__checkbox">
            <input type="checkbox" v-model="isCreate" />
            <div></div>
          </label>
        </div>
        辅助加入：粘贴编码了的集群加入信息并输入密码。
      </h1>
      <div class="m-form__content">
        <div class="m-form__section">
          <dl v-if="isCreate">
            <dt>信息</dt>
            <dd>
              <m-input
                type="textarea"
                prop="serializedinfo"
                validateEvent
                @validate="validate"
                :show-error="rules.serializedinfo.error"
                :error-msg="rules.serializedinfo.message"
                v-model="serializedinfo"
                @change="searialChange"
                placeholder="请输入集群名称"
              />
            </dd>
          </dl>
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="text"
                prop="hostname"
                label="对端地址"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.hostname.error"
                :error-msg="rules.hostname.message"
                v-model="hostname"
                :readonly="isCreate"
                :placeholder="!isCreate ? '请输入对端地址' : ''"
              />
              <m-input
                type="password"
                prop="password"
                label="密码"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.password.error"
                :error-msg="rules.password.message"
                v-model="password"
                placeholder="请输入密码"
              />
              <m-input
                type="text"
                prop="fingerprint"
                label="指纹"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :readonly="isCreate"
                :show-error="rules.fingerprint.error"
                :error-msg="rules.fingerprint.message"
                v-model="fingerprint"
                :placeholder="!isCreate ? '请输入指纹' : ''"
              />
            </dd>
          </dl>
          <dl>
            <dt>网络</dt>
            <dd>
              <m-select
                type="text"
                prop="link0"
                label="link0"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.link0.error"
                :error-msg="rules.link0.message"
                :readonly="false"
								@on-change="(value) => link0 = value"
                v-model="link0"
                placeholder="请选择"
              >
                <m-option
                  v-for="(item, index) in netWorkList"
                  :key="item.address"
                  :label="item.address"
                  :value="item.address"
                >
                  <template v-if="index === 0">
                    <div class="table-header__tr">
                      <span class="table-td">CIDR</span>
                      <span class="table-td">接口</span>
                      <span class="table-td">活动</span>
                      <span class="table-td">备注</span>
                    </div>
                  </template>
                  <div class="table-tr">
                    <span class="table-td" :title="item.address">{{ item.address }}</span>
                    <span class="table-td" :title="item.iface">{{ item.iface }}</span>
                    <span class="table-td">
                      <table-info-state
                        :content="item.active === 1 ? '是' : '否'"
                        :state="item.active === 1 ? 'actived' : 'unactived'"
                      ></table-info-state>
                    </span>
                    <span class="table-td" :title="item.comment">
                      {{ item.comment }}
                    </span>
                  </div>
                </m-option>
              </m-select>
							<template v-if="!isCreate">
							 <template v-for="(item, num) in networkNum">
                <m-select
                  type="text"
                  :prop="`link${item}`"
                  :label='`link${item}`'
                  labelWidth="100px"
                  validateEvent
                  :key="num"
                  v-model="link[item]"
									@on-change="(value) => $data.link[item] = value"
                  placeholder="请选择"
                >
                  <m-option
                    v-for="(item, index) in netWorkList"
                    :key="item.address"
                    :label="item.address"
                    :value="item.address"
                  >
                    <template v-show="index === 0">
                      <div class="table-header__tr">
                        <span class="table-td">CIDR</span>
                        <span class="table-td">接口</span>
                        <span class="table-td">活动</span>
                        <span class="table-td">备注</span>
                      </div>
                    </template>
                    <div class="table-tr">
                      <span class="table-td" :title="item.address">{{ item.address }}</span>
                      <span class="table-td" :title="item.iface">{{ item.iface }}</span>
                      <span class="table-td">
                        <table-info-state
                          :content="item.active === 1 ? '是' : '否'"
                          :state="item.active === 1 ? 'actived' : 'unactived'"
                        ></table-info-state>
                      </span>
                      <span class="table-td" :title="item.comment">
                        {{ item.comment }}
                      </span>
                    </div>
                  </m-option>
                </m-select>
                <m-button
                  type="danger"
                  icon="el-icon-delete"
                  @on-click="handleLinkDelete(item, num)"
                  :key="item"
                  >删除</m-button
                >
              </template>
							</template>
							<div>
								<m-button
                type="primary"
                icon="el-icon-plus"
                @on-click="handleLinkChange"
								v-if="!isCreate"
                >添加</m-button>Multiple links are used as failover, lower numbers have higher priority.
							</div>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="footer">
      <Dialog :visible="showLog"
              @close="closeLog"
              :_style="{
      width: '800px',
    }"
    title="Task Viewer: 加入集群">
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="输出" name="log"></m-tab-panel>
             <m-tab-panel label="状态" name="status"></m-tab-panel>
          </m-tab>
          <m-button class="create-btn" type="primary" @on-click="stopTask1" :disabled="db.addClusterStatusObj.status !== 'running'"
          >停止</m-button>
          <el-scrollbar style="height: 100%">
             <div class="taskmodal-content">
               <div class="table" v-if="tab === 'log'">
                <div class="table-tr" v-for="item in db.addClusterLogList" :key="item.n">
                  {{item.t}}
                </div>
              </div>
              <div class="table" v-if="tab === 'status'">
                  <template v-for="(item, key) in db.addClusterStatusObj">
                    <div class="table-tr" v-if="!['exitstatus', 'id', 'pstart'].includes(key)" :key="key">
                      <div class="table-td">{{$t(`clusterStatus.${key}`)}}</div>
                      <div class="table-td" v-if="key === 'starttime'">{{dateFormat(new Date(item * 1000), 'yyyy-MM-dd hh:mm')}}</div>
                      <div class="table-td" v-else>{{item}}</div>
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
      <m-button @on-click="copy" v-if="type === 'info'">拷贝信息</m-button>
      <template v-if="type === 'create'">
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
      <template v-if="type === 'join'">
        <m-button class="create-btn" type="primary" @on-click="joinCluster"
          >加入</m-button
        >
      </template>
    </template>
  </Dialog>
</template>

<script>
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import { dateFormat, percentToFixed } from "@libs/utils/index";
import Base64 from "@libs/utils/base64.js";
import ClusterHttp from "./http";

export default {
  name: "ClusterModal",
  mixins: [ClusterHttp],
  components: {
    Dialog,
    MButton,
  },
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    type: String, //info表示加入信息、create表示创建集群、join表示加入集群
  },
  data() {
    return {
      ipAddress: "",
      fingerprint: "",
      information: "",
      ring_addr: [],
      clusterName: "",
      fingerprint: "",
      serializedinfo: "",
      ring1Possible: false,
      ring1Needed: false,
      ring0Needed: false,
      password: "",
      hostname: "",
      isCreate: true,
      networkNum: [],
      showLog: false,
      tab: 'log',
      rules: {
        clusterName: {
          error: false,
          message: "",
        },
        fingerprint: {
          error: false,
          message: "",
        },
        hostname: {
          error: false,
          message: "",
        },
        serializedinfo: {
          error: false,
          message: "",
        },
        password: {
          error: false,
          message: "",
        },
        link0: {
          error: false,
          message: "",
        },
        link1Radio: {
          error: false,
          message: "",
        },
      },
      link0: "",
      link: {},
      netWorkList: [],
      isAdvice: true,
			initnum: 1,
      deleteNum: [],
      interVal: null
    };
  },
  mounted() {
    if (this.type === "info") {
      let nodeinfo = this.db.clusterObj.nodelist.filter((el) => {
        return el.name === this.db.clusterObj.preferred_node;
      });
      this.ipAddress = nodeinfo[0].pve_addr;
      this.fingerprint = nodeinfo[0].pve_fp;
      this.ring_addr = [nodeinfo[0].ring0_addr, nodeinfo[0].ring1_addr];
      let joinInfo = {
        ipAddress: this.ipAddress,
        fingerprint: this.fingerprint,
        ring_addr: this.ring_addr,
        totem: this.db.clusterObj.totem,
      };
      if (!joinInfo) {
        return;
      }
      //将joinInfo转化为string类型的javascript的对象
      let jsons = JSON.stringify(joinInfo);
      //对象进行Base64加密
      this.information = Base64.encode(jsons);
    }
    //创建、加入集群时需要查询网络、配置网络
    if (this.type === "create" || this.type === "join") {
      this.queryClusterNetWork().then((res) => {
        this.netWorkList = this.db.netWorkList.filter((item) => {
          if (item.cidr) {
            return item;
          }
        });
      });
    }
  },
  methods: {
    dateFormat,
    //关闭弹框
    close() {
      this.$emit("close");
    },
    //加入信息时需要copy内容
    copy() {
      this.$refs["info"].$el.childNodes[2].children[0].select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.log("该浏览器不支持点击复制到剪贴板");
      }
    },
    handleLink0Change(row) {
      this.link0Radio = row.address;
    },
    handleLink1Change(row) {
      this.link1Radio = row.address;
    },
    //单个校验字段
    validate(prop) {
      let _this = this,
        value = String(_this[prop]).trim();
      _this.rules[prop].error = false;
      _this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        _this.rules[prop].error = true;
        _this.rules[prop].message = "该字段不能为空!";
        return;
      }
    },
    //加入集群时解析输入的base64数据
    searialChange() {
      //几码base64得到信息
      var jsons = Base64.decode(this.serializedinfo);
      let joinInfo;
      try {
        joinInfo = JSON.parse(jsons);
      } catch (e) {
        let props = ["hostname", "password", "fingerprint", "serializedinfo"];
        props.forEach((prop) => this.validate(prop));
      }
      (this.fingerprint = ""), (this.ring1Needed = false);
      this.ring1Possible = false;
      this.hostname = "";
      let totem;
      let props = ["hostname", "password", "fingerprint", "serializedinfo"];
      if (!(joinInfo && joinInfo.totem)) {
        props.forEach((prop) => this.validate(prop));
      } else {
        this.ring0Needed = false;
        if (joinInfo.ring_addr !== undefined) {
          this.ring0Needed = joinInfo.ring_addr[0] !== joinInfo.ipAddress;
        }
        this.fingerprint = joinInfo.fingerprint
        this.ring1Needed = !!joinInfo.totem["interface"]["1"];
        this.ring1Possible = !!joinInfo.totem["interface"]["1"];
        this.hostname = joinInfo.ipAddress;
        this.link0 = '';
        totem = joinInfo.totem;
        if (!this.ring1Needed) {
          props.concat("link0");
        }
        if (!this.ring0Needed) {
          props.concat("link1");
        }
        props.forEach((prop) => this.validate(prop));
      }
    },
    //创建集群
    create() {
      this.validate("clusterName");
      if (this.rules["clusterName"].error) return;
      let param = {
        clustername: this.clusterName,
			};
			if(this.isAdvice) {
				for(let i in this.link) {
			  	param[`link${i}`] = this.link[i]
				}
				param['link0'] = this.link0;
      }
      this.createCluster(param).then((res) => {
         this.showLog = true;
         this.interVal = setInterval(() => this.queryStatus(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid), 3000);
     });
    },
    //整体校验
    validateAll() {
      let props;
      if (this.type === "join") {
        props = [
          "hostname",
          "password",
          "fingerprint",
          "link0"
        ];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //加入集群
    joinCluster() {
      if (this.validateAll()) return;
      let param = {
        hostname: this.hostname,
        password: this.password,
        link0: this.link0,
        fingerprint: this.fingerprint,
			};
			for(let i in this.link) {
				param[`link${i}`] = this.link[i]
			}
      this.clusterJoin(param)
          .then(() => {
            this.showLog = true;
            this.interVal = setInterval(() => this.queryStatus(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid), 3000);
          }).catch((res) => {
            this.$confirm.error({
              msg: res,
              type: 'error'
            }).then(() => {})
              .catch(() => {})
          })
    },
    handleTabChange(value) {
      this.tab = value;
    },
    handleLinkChange() {
      if(this.deleteNum.length > 0) {
				this.$set(this.$data.link, this.deleteNum[0], `link${this.deleteNum[0]}`);
				this.$data.link[this.deleteNum[0]] = "";
				this.networkNum.push(this.deleteNum[0]);
				this.deleteNum.splice(0,1);
				return;
			}
			let key = this.initnum++;
			this.networkNum.push(key);
      this.$set(this.$data.link, key, `link${key}`);
      this.$data.link[key] = "";
    },
    handleLinkDelete(item, num) {
			this.networkNum.splice(num, 1);
			delete this.$data.link[item];
			this.deleteNum.push(item);
    },
    closeLog() {
      this.showLog = false;
      this.close();
    },
    stopTask1() {
      this.stopTask(this.db.addClusterStatusObj.node, this.db.addClusterStatusObj.upid);
    }
  },
  beforeDestroy() {
    if(this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null
    }
  }
};
</script>

<style lang="less" scoped>
.checkbox {
  margin-bottom: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
}
.m-button{
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