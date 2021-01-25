<template>
  <page-template v-loading="loading" :element-loading-text="loadingText">
    <div slot="toolbar-left">
      <m-button
        type="primary"
        @on-click="showResetModal()"
        icon="el-icon-refresh"
				:disabled="canConfig('backup')"
        >恢复</m-button
      >
			<m-button
        type="danger"
        @on-click="handleDelete()"
        icon="el-icon-delete"
				:disabled="selectedList.length <=0 "
        >删除</m-button
      >
			<m-button
        type="primary"
        @on-click="downLoadTemplate()"
        icon="el-icon-download"
				:disabled="!templ"
        >模板</m-button
      >
				<m-button
        type="primary"
        @on-click="showModal()"
        icon="el-icon-upload2"
				:disabled="!upload && !templ"
        >上传</m-button
      >
      <m-button
        type="primary"
        @on-click="showConfigModal()"
        icon="el-icon-view"
				:disabled="canConfig('backup')"
        >显示配置</m-button
      >
    </div>
    <div slot="toolbar-right" style="text-align: right">
      <m-input placeholder="请输入名称" @input="debounce(handleSearch(), 1000);" v-model="search"/>
    </div>
    <div slot="page-content">
      <el-table
        :data="contentList"
        @selection-change="handleSelect"
        ref="dataTable"
      >
        <el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="名称" prop="volid" width="300px" show-overflow-tooltip sortable>
					<template slot-scope="scope">
						{{render_storage_content(null, null, scope.row)}}
					</template>
				</el-table-column>
        <el-table-column label="日期" prop="ctime" sortable>
						<template slot-scope="scope">
						{{scope.row.ctime ? dateFormat(new Date(scope.row.ctime * 1000), 'yyyy-MM-dd hh:mm') : ''}}
					</template>
				</el-table-column>
        <el-table-column label="格式" prop="format"></el-table-column>
        <el-table-column label="类别" prop="content">
					<template slot-scope="scope">
						{{scope.row && scope.row.content && format_content_types(scope.row.content)}}
					</template>
				</el-table-column>
        <el-table-column label="大小" prop="size">
						<template slot-scope="scope">
						{{scope.row && scope.row.size && byteToSize(scope.row.size)}}
					</template>
				</el-table-column>
      </el-table>
      <el-pagination
          class="page-table-pagination"
          @size-change="
                  (val) => {
                    currentPage = 1;
                    pageSize = val;
                    setData();
                  }
                "
          @current-change="
                  (val) => {
                    currentPage = val;
                    setData();
                  }
                "
          :current-page="currentPage"
          :page-sizes="[10,20,50, 100]"
          :page-size="pageSize"
          :total="storageContentList && storageContentList.length || 0"
          :pager-count="5"
          small
          layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
      <upload-image-modal
        :title="title"
        :visible="visible"
				v-if="visible"
        :contents="contents"
        @close="
          visible = false;
          __init__()
        "
      ></upload-image-modal>
      <template-modal
        :title="title"
        :visible="showTemplate"
				v-if="showTemplate"
        @close="
          showTemplate = false;
          __init__()
        "
      ></template-modal>
      <config-modal :visible="showConfig"
                    v-if="showConfig"
                    :param="configParam"
                    @close="showConfig = false; __init__()"></config-modal>
      <reset-modal :visible="showReset"
                   v-if="showReset"
                  :param="resetParam"
                  @close="showReset = false; __init__()"></reset-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from '@src/components/chart/line/LineCharts';
import StorageContentHttp from "@src/views/home/storage/content/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize,render_storage_content, dateFormat, format_content_types, quickSort, debounce, chunkData } from '@libs/utils/index';
import UploadImageModal from './UploadImageModal';
import TemplateModal from './TemplateModal';
import ConfigModal from './ConfigModal';
import ResetModal from './ResetModal';
export default {
  name: "Lvm",
  mixins: [StorageContentHttp],
  components: {
    PageTemplate,
		MButton,
		LinePercentChart,
    UploadImageModal,
    TemplateModal,
    ConfigModal,
    ResetModal
  },
  data() {
    return {
      visible: false,
      title: "创建：Lvm Volume Group",
      selectedList: [],
      expands: [],
      showTemplate: false,
      showConfig: false,
      configParam: {},
      showReset: false,
      resetParam: {},
      storageContentList: [],
      loading: false,
      loadingText: '',
      contents: [],
      templ: false,
      upload: false,
      search: '',
      pageSize: 10,
      currentPage: 1,
      contentList: []
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
		percentToFixed,
		render_storage_content,
		byteToSize,
		dateFormat,
		format_content_types,
    debounce,
    chunkData,
    //初始化查找
    __init__() {
      this.queryStorageContent()
          .then(res => {
            this.storageContentList = quickSort(this.db.storageContentList, 'content', '+');
            this.setData();
          });
      this.queryStroageStatus()
          .then(res => {
            this.templ = false;
	          this.upload = false;
	          var cts = [];
	          /**
             * 如果content存在将content用，分割根据content内容设置镜像类型
             * */
	          if(this.db.storageStatusObj.content) {
              this.db.storageStatusObj.content.split(',').forEach(content => {
                if (content === 'vztmpl') {
                  this.templ = true;
                  cts.push('vztmpl');
                } else if (content === 'iso') {
                  this.upload = true;
                  cts.push('iso');
                }
                if (this.templ !== this.upload) {
                  this.contents = cts;
                }
              })
            }
          });
    },
    setData() {
      this.contentList = chunkData(this.storageContentList, this.pageSize)[this.currentPage - 1];
    },
    //是否展示弹框
    showModal() {
      this.title = "上传镜像";
      this.visible = true;
    },
    //按钮是否可点击
    inStatus() {
			let states = [];
			if(this.db.storageStatusObj && !this.db.storageStatusObj.content) return true;
			for(let i in arguments) {
				states.push(arguments[i]);
			}
			return this.db.storageStatusObj.content.split(',').some(status => states.forEach((stat) => {
				return stat !== status;
			}))
		},
    /**
     * 按名称搜索
     * */
    handleSearch() {
      let _this = this;
      _this.currentPage = 1;
      _this.storageContentList = quickSort(_this.db.storageContentList.filter(item => {
        return window.encodeURIComponent(item.volid.replace(/^.*?:(.*?\/)?/, '')).indexOf(window.encodeURIComponent(_this.search)) > -1;
      }), 'content', '+');
      if(!_this.search) {
        _this.storageContentList = quickSort(_this.db.storageContentList, 'content', '+');
      }
      this.setData();
    },
		//是否可以配置
		canConfig() {
			if(this.selectedList.length !== 1) return true;
			return this.selectedList.length === 1 && this.selectedList[0].content !== 'backup'
    },
    //查看模板
    downLoadTemplate() {
      this.showTemplate = true;
    },
    //删除镜像
    handleDelete() {
      this.$confirm.confirm({
        msg: `确定要删除以下内容吗?`,
        icon: 'icon-question'
      }).then(() => {
        this.delete();
      }).catch((res) => {
        this.$confirm.info({
          msg: res
        })
      })
    },
    //选择镜像
    handleSelect(rows) {
      if(rows)
       this.selectedList = rows;
    },
    //展示config
    showConfigModal() {
      this.configParam = this.selectedList[0];
      this.showConfig = true;
    },
    //展示reset
    showResetModal() {
      this.resetParam = this.selectedList[0];
      this.showReset = true;
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
</style>
