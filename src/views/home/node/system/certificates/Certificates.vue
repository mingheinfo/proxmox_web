<template>
  <div style="padding: 20px">
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
						class="m-margin-top-10"
            :disabled="db.addClusterStatusObj.status !== 'running'"
            >停止</m-button
          >
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
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </Dialog>
    <overview-card>
      <div slot="title">证书</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showStatus }"
        class="m-tool-img"
        @click.stop="handleCollpise('status')"
      ></div>
      <div slot="content" class="card-content" v-if="showStatus">
        <div class="card-item">
          <page-template>
            <div slot="toolbar-left">
              <m-button
                type="primary"
                @on-click="showModal('create')"
                icon="el-icon-plus"
                >上传自定义证书</m-button
              >
              <m-button
                type="danger"
                @on-click="deleteCertificates"
                icon="el-icon-delete"
                :disabled="!inStatus('pveproxy-ssl.pem')"
                >删除自定义证书</m-button
              >
							<m-button
                type="info"
                @on-click="showModal('edit')"
                icon="el-icon-view"
                :disabled="selectedList.length !== 1"
                >查看自定义证书</m-button
              >
            </div>
            <div slot="page-content">
              <el-table
                :data="db.certificatesInfoList"
                ref="dataTable"
                @selection-change="handleSelect"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="文件" prop="filename" show-overflow-tooltip></el-table-column>
								<el-table-column label="发行者" prop="issuer" show-overflow-tooltip></el-table-column>
								<el-table-column label="主题" prop="subject" show-overflow-tooltip></el-table-column>
								<el-table-column label="有效期自" prop="notbefore">
									<template slot-scope="scope">
										<span>{{dateFormat(new Date(scope.row.notbefore * 1000), 'yyyy-MM-dd hh:mm')}}</span>
									</template>
								</el-table-column>
								<el-table-column label="有效期至" prop="notafter">
									<template slot-scope="scope">
										<span>{{dateFormat(new Date(scope.row.notafter * 1000), 'yyyy-MM-dd hh:mm')}}</span>
									</template>
								</el-table-column>
								<el-table-column label="主题名称代替" prop="name">
										<template slot-scope="scope">
										  <span v-for="(item, index) in scope.row.san" :key="index">{{item}}</span>
									 </template>
								</el-table-column>
              </el-table>
            </div>
          </page-template>
        </div>
      </div>
    </overview-card>
    <overview-card>
      <div slot="title">ACME</div>
      <div
        slot="operate"
        :class="{ 'm-tool-collpise': !showResource }"
        class="m-tool-img"
        @click.stop="handleCollpise('resource')"
      ></div>
      <div slot="content" class="card-content" v-if="showResource">
        <div class="card-item">
          <page-template>
            <div slot="toolbar-left">
              <m-button
                type="primary"
                @on-click="showAcmeModal('create', 'domains')"
                icon="el-icon-plus"
                >添加</m-button
              >
              <m-button
                type="info"
                @on-click="showAcmeModal('edit', 'domains')"
                icon="el-icon-edit"
                :disabled="selectedAcmeList.length !== 1"
                >编辑</m-button
              >
              <m-button
                type="danger"
                @on-click="handleAcmeDelete"
                icon="el-icon-delete"
                :disabled="selectedAcmeList.length <= 0"
                >删除</m-button
              >
							<m-button
                type="danger"
                @on-click="handleOrderCertificates"
                icon="el-icon-delete"
                :disabled="acmeList.length <=0 "
                >Order Certificates Now</m-button
              >
               <span v-if="!isEdit && db.acmeAccountList.length > 0">使用账户&nbsp;:&nbsp;{{account}}</span>
               <m-select
                prop="account"
                label="账户"
                labelWidth="30px"
                v-model="account"
								@on-change="handleAccountSelect"
                v-else-if="isEdit && db.acmeAccountList.length > 0"
                placeholder="请选择账户"
              >
                <m-option
                  v-for="(item) in db.acmeAccountList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                >
                 
                </m-option>
              </m-select>
              <span v-else class="no-account">没有可用的账户</span>
              <span v-if="db.acmeAccountList.length > 0"
                    class="edit"
                    @click="handleEdit"
                   :class="{'el-icon-edit': !isEdit, 'el-icon-check': isEdit}"></span>
              <m-button
                type="primary"
                @on-click="showAcmeModal('create', 'account')"
                v-if="db.acmeAccountList.length <= 0"
                icon="el-icon-plus"
                >添加ACME账户</m-button
              >
            </div>
            <div slot="page-content">
              <el-table
                :data="acmeList"
                ref="dataTable"
                @selection-change="handleAcmeSelect"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="域名" prop="domain"></el-table-column>
                <el-table-column label="类别" prop="type"></el-table-column>
								 <el-table-column label="plugin" prop="plugin"></el-table-column>
              </el-table>
            </div>
          </page-template>
          <upload-self-certificates-modal
            :title="title"
            :isCreate="isCreate"
            :param="param"
            :visible="visible"
            v-if="visible"
            :modal-type="type"
            @close="
              visible = false;
              __init__();
            "
          ></upload-self-certificates-modal>
					 <create-acme-account-modal
            :title="acmeTitle"
            :isCreate="acmeIsCreate"
            :param="acmeParam"
            :visible="acmeVisible"
            v-if="acmeVisible"
            :modal-type="acmeType"
            @close="
              acmeVisible = false;
              __init__();
            "
          ></create-acme-account-modal>
        </div>
      </div>
    </overview-card>
  </div>
</template>
<script>
import OverviewCard from "@src/components/card/OverviewCard";
import CertificatesHttp from "@src/views/home/node/system/certificates/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { dateFormat, parseACME } from '@libs/utils/index';
import UploadSelfCertificatesModal from "./UploadSelfCertificatesModal";
import CreateAcmeAccountModal from './CreateAcmeAccountModal';
import Dialog from "@src/components/dialog/Dialog";
export default {
  name: "Certificates",
  mixins: [CertificatesHttp],
  components: {
    PageTemplate,
    OverviewCard,
    MButton,
		UploadSelfCertificatesModal,
    CreateAcmeAccountModal,
    Dialog
  },
  data() {
    return {
      type: "create",
      visible: false,
      title: "创建：复制作业",
      selectedList: [],
      isCreate: true,
      isEdit: false,
      param: {},
      showStatus: true,
      showResource: true,
			resourceList: [],
			selectedAcmeList: [],
		  acmeType: "domains",
      acmeVisible: false,
      acmeTitle: "创建：复制作业",
			acmeIsCreate: true,
			acmeParam: {},
			acmePluginList: [],
      acmeList: [],
      account: '',
      showLog: false,
      interVal: null,
			tab: "log",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		dateFormat,
    //初始化查找
    __init__() {
      this.acmeList = [];
      return Promise.all([
				this.queryAcmeAccount(),
				this.queryCertificatesInfoList(),
				this.queryCertificatesConfig()
				    .then(res => {
							let obj = parseACME(this.db.certificatesConfigObj.acme);   
							(obj.domains || []).forEach(domain => {
	           	  if (domain === '') return;
									let record = {
											domain,
											type: 'standalone',
											configkey: 'acme',
								     	};
									   this.acmeList.push(record);
										});

								if (obj.account) {
							    this.account = obj.account;
								}
						})
      ]);
    },
    //是否展示弹框
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "上传自定义证书" : "查看自定义证书";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
      let status = [];
      for(let i in arguments) {
        status.push(arguments[i]);
      }
      return this.db.certificatesInfoList.every(it => status.some(state => state === it.filename));
    },
    //选择
    handleAccountSelect(value) {
      this.account = value;
		},
		handlePluginDelete() {
       this.$confirm
        .confirm({
          msg: `你确定你要删除已选择项吗？`,
          type: "info",
        })
        .then(() => {
          this.deleteAcmePlugin().catch((res) => {
            this.$confirm.confirm({
              msg: res,
              type: "info",
            });
          });
        })
        .catch(() => {});
		},
    handleDelete() {
      this.$confirm
        .confirm({
          msg: `你确定你要删除已选择项吗？`,
          type: "info",
        })
        .then(() => {
          this.deleteAcmeAccount().then((res) => {
            this.$confirm.confirm({
              msg: this.db.addClusterStatusObj.exitstatus ?  this.db.addClusterStatusObj.exitstatus : '',
              type: "info",
            });
          });
        })
        .catch(() => {});
    },
    handleCollpise(type) {
      if (type === "status") {
        this.showStatus = !this.showStatus;
      } else {
        this.showResource = !this.showResource;
      }
    },
    handleAddAcmeAccount() {

    },
    handleOrderCertificates() {
      this.orderCertifices()
          .then(res => {
            debugger
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
          }).catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
    },
    handleAcmeSelect(row) {
      this.selectedAcmeList = row;
    },
    handleSelect(row) {
     this.selectedList = row;
    },
    handleEdit() {
      this.isEdit = !this.isEdit;
      if(!this.isEdit) {
        let obj = parseACME(this.db.certificatesConfigObj.acme);   
        this.updateAcme({acme: `account=${this.account},domains=${obj.domains.join(';')}`});
      }
    },
    handleAcmeDelete() {
      let obj = parseACME(this.db.certificatesConfigObj.acme);
      this.selectedAcmeList.forEach(async item => {
        obj.domains = await obj.domains.splice(obj.domains.indexOf(item), 1);
      })
      let param;
      if(obj.domains.length > 0) {
        param = {acme: `account=${this.account},domains=${obj.domains.join(';')}`}
      } else {
        param = {acme: `account=${this.account}`}
      }
      this.updateAcme(param)
          .then(() => {
            this.__init__();
          });
    },
		showAcmeModal(type, modalType) {
			this.acmeType = modalType;
      this.acmeIsCreate = type === "create";
      this.acmeTitle = type === "create" ? "创建：ACME DNS Plugin" : "编辑：ACME DNS Plugin";
      this.acmeParam = type === "create" ?  {acme: this.db.certificatesConfigObj.acme} : {acme: this.db.certificatesConfigObj.acme, current: this.selectedAcmeList[0]};
      this.acmeVisible = true;
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
.card {
  width: 100%;
}
.m-tool-img {
  background-image: url("~@images/tool-sprites.png");
  overflow: hidden;
  width: 16px;
  height: 16px;
  margin: 0;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
  opacity: 0.8;
  background-position-y: -224px;
  display: inline-block;
  transition: transform 0.5s linear;
}
.m-tool-collpise {
  transform: rotate(180deg);
  transition: transform 0.5s linear;
}
/deep/.card {
  min-height: auto !important;
}
.no-account{
  display: inline-block;
}
.edit{
  color: #409eff;
  font-size: 16px;
  font-weight: 800;
}
/deep/.tool-bar-left /deep/.prefix-icon:after{
  color: #525457!important;
}
</style>