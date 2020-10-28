<template>
  <page-template>
    <div slot="toolbar-left">
      <Dropdown
        trigger="click"
        @on-change="handleCommand"
        style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        "
      >
        <span slot="label">
          <m-button
            type="primary"
            style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus"
            >添加</m-button
          >
        </span>
        <DropdownItem v-for="(item) in storageItems" 
				              :key="item.type"
											:command="item.type"
											:icon="item.iconCls">{{item.text}}</DropdownItem>
      </Dropdown>
      <m-button type="danger" icon="el-icon-delete" :disabled="curStorage.length !== 1" @on-click="handleDelete">删除</m-button>
      <m-button type="primary" icon="el-icon-edit" :disabled="curStorage.length !== 1" @on-click="handleEdit">编辑</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.storageList" @selection-change="handleSelection">
				<el-table-column type="selection" width="55px"></el-table-column>
        <el-table-column label="ID" prop="storage" sortable></el-table-column>
        <el-table-column label="类别" prop="type">
          <template slot-scope="scope">
            {{ format_storage_type(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="内容" prop="content"></el-table-column>
        <el-table-column label="路径/目录" prop="path"></el-table-column>
        <el-table-column label="共享的">
          <template slot-scope="scope">
            <table-info-state
              :state="scope.row && scope.row.shared ? 'actived' : 'unActived'"
              :content="scope.row && scope.row.shared ? '是' : '否'"
            ></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="已用的">
          <template slot-scope="scope">
            <table-info-state
              :state="scope.row && scope.row.disable ? 'unActived' : 'actived'"
              :content="scope.row && scope.row.disable ? '否' : '是'"
            ></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="宽带限制"></el-table-column>
      </el-table>
				<CreateStorageModal :visible="visible" 
														:type="type"
													  :title="title"
														:isCreate="isCreate"
                            v-if="visible"
														:param= "editParam"
				                    @close="visible = false"></CreateStorageModal>
    </div>
  </page-template>
</template>

<script>
import DataCenterStorageHttp from "@src/views/home/dataCenter/storage/http";
import DropdownItem from "@src/components/dropdown/dropdownItem";
import PageTemplate from "@src/components/page/PageTemplate";
import { STORAGESCHEMA } from "@libs/enum/enum.js";
import Dropdown from "@src/components/dropdown/dropdown";
import MButton from "@src/components/button/Button";
import CreateStorageModal from '@src/views/home/dataCenter/storage/CreateStorageModal';
export default {
  name: "DataCenterStorage",
  mixins: [DataCenterStorageHttp],
  components: {
    PageTemplate,
    MButton,
    DropdownItem,
		Dropdown,
		CreateStorageModal
	},
	data() {
		return {
			storageItems: [],
			visible: false,
			type: '',
			title: '',
			curStorage: [],
			isCreate: true,
			editParam: {}
		}
	},
  mounted() {
    this.__init__();
  },
  methods: {
    __init__() {
			this.queryStorageList().then(() => this.curStorage ='');
			this.setStorageSchame();
    },
    setStorageSchame() {
			this.storageItems = [];
      for (let type in STORAGESCHEMA) {
        let storage = STORAGESCHEMA[type];
        if (storage.hideAdd) {
          continue;
        }
        this.storageItems.push({
          text: this.format_storage_type(type),
					iconCls: "fa fa-fw fa-" + storage.faIcon,
					type
        });
      }
    },
    format_storage_type: function (value, md, record) {
      if (value === "rbd") {
        value = !record || record.get("monhost") ? "rbd" : "pveceph";
      } else if (value === "cephfs") {
        value = !record || record.get("monhost") ? "cephfs" : "pvecephfs";
      }

      var schema = STORAGESCHEMA[value];
      if (schema) {
        return schema.name;
      }
      return '未知';
		},
		handleCommand(item, type) {
			this.type = item;
			if(!type)
			this.title = `添加： ` + this.format_storage_type(item);
			else 
			this.title = `编辑： ` + this.format_storage_type(item);
			this.isCreate = type !== 'edit'
			if(type ===  'edit') {
				this.editParam = this.curStorage[0];
			}
			this.visible = true;
		},
		handleSelection(row, column) {
      this.curStorage = row;
		},
		handleDelete() {
			this.$confirm.confirm({
				msg: `确定要删除${this.curStorage[0].storage}`,
				title:'确认',
				type: 'warning'
			}).then(() => {
         this.delete(this.curStorage[0].storage);
			}).catch(() => {})
		},
		handleEdit() {
			this.handleCommand(this.curStorage[0].type, 'edit');
		}
  },
};
</script>