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
                prop="group"
                labelWidth="100px"
                label="ID"
                v-model="group"
                validateEvent
                @validate="validate"
                :show-error="rules.group.error"
                :error-msg="rules.group.message"
                placeholder="请输入ID"
              />
              <m-checkbox
                label="nofailback"
                v-model="nofailback"
                labelWidth="100px"
              ></m-checkbox>
              <m-checkbox
                label="restricted"
                v-model="restricted"
                labelWidth="100px"
              ></m-checkbox>
              <m-input
                type="textarea"
                prop="comment"
                labelWidth="100px"
                label="备注"
                v-model="comment"
                placeholder="请输入备注"
              />
            </dd>
          </dl>
          <dl>
            <dt>选择节点</dt>
            <dd>
              <el-table :data="nodeList" @selection-change="handleSelect" ref="dataTable">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="节点" prop="node"></el-table-column>
                <el-table-column
                  label="内存使用率"
                >
								   <template slot-scope="scope">
										 <span>{{ (scope.row) | formatSize('memory')}}</span>
									 </template>
								</el-table-column>
                <el-table-column
                  label="CPU使用率"
                >
								  <template slot-scope="scope">
										 <span>{{ (scope.row) | formatSize('cpu')}}</span>
									 </template>
								</el-table-column>
                <el-table-column label="Priority" prop="nodes">
									<template slot-scope="scope">
										 <span sytle="width: 110px;dispaly: inline-block;">
											 <m-input
                type="number"
                prop="priority"
								style="width: 123px"
								:_style="{width: '105px', 'min-width': '90px'}"
								:__conStyle="{width: '115px', 'min-width': '115px'}"
                v-model="node[scope.row.id]"
                placeholder="请输入备注"
              /></span>
									 </template>
								</el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import HaHttp from "@src/views/home/dataCenter/ha/http";
import { flotToFixed, percentToFixed, byteToSize } from "@libs/utils/index";
export default {
  name: "CreateGroupModal",
  mixins: [HaHttp],
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
	computed:{
		// nodeList() {
		// 	if(!this.db.resources) return;
		// 	if(this.db.resources && this.db.resources.length > 0) {
    //     return this.db.resources.filter(it => it.type === 'node')
		// 	}
		// }
	},
  data() {
    return {
      group: "",
      restricted: false,
      nofailback: false,
			comment: "",
			priority: null,
			nodeList: [],
			selectedList: [],
			node: {},
      rules: {
        group: {
          error: false,
          message: "",
        },
        max_relocate: {
          error: false,
          message: "",
        },
        node: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
	},
	filters: {
		formatSize(row, type) {
			debugger;
			if(type === 'memory') {
				if(row.maxmem && row.mem) return percentToFixed(row.mem/row.maxmem, 3);
			}else {
			if(row.maxcpu && row.cpu) return `${percentToFixed(row.cpu, 3)} of ${row.maxcpu}`;
			}
		}
	},
  methods: {
    async __init__() {
      if (this.isCreate) {
				Object.assign(this.$data, this.$options.data());
        this.queryResource()
            .then((data) => {
              this.nodeList = data.filter(it => it.type === 'node');
						  this.nodeList.forEach(it => Object.assign(this.node, it.id, ''));
            });
      } else {
				Object.assign(this.$data, this.$options.data());
        await this.queryResource()
                   .then((data) => {
                       this.nodeList = data.filter(it => it.type === 'node');
						           this.nodeList.forEach(it => Object.assign(this.node, it.id, ''));
                  });;
				this.queryGroupsById({id: this.param.group})
				    .then(() => {
							Object.keys(this.db.groupsObj).forEach(it => {
								if(it === 'nodes' &&  this.db.groupsObj.nodes) {
									 let nodes = this.db.groupsObj.nodes.split(',');
									 this.nodeList.forEach(item => {
										 nodes.forEach(it => {
											 if(it.indexOf(':') > -1 && item.node === it.split(':')[0]) {
												 this.$refs.dataTable.toggleRowSelection(item, true);
												 this.node[item.id] = it.split(':')[1];
											 } else if(item.node === it){
                         this.$refs.dataTable.toggleRowSelection(item, true);
											 }
										 })
									 })
								} else if(['restricted', 'nofailback'].includes(it)){
									this[it] = this.db.groupsObj[it] ? true : false;
								} else {
									this[it] = this.db.groupsObj[it]
								}
							})
						});
      }
    },
    handleVmidSelect(value) {
      this.vmid = value;
    },
    handleGroupSelect(value) {
      this.group = value;
    },
    handleStateSelect(value) {
      this.state = value;
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
		handleSelect(row) {
     this.selectedList = row;
		},
    validateAll() {
      let props = ["group"];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    confirm() {
			if (this.validateAll()) return;
			let nodes = ''
			this.selectedList.forEach((item) => {
         if(this.node[item.id]){
           nodes +=`${item.node}:${this.node[item.id]},`
				 } else {
					 nodes +=`${item.node},`
				 }
			})
			if(nodes.endsWith(',')) nodes = nodes.slice(0, nodes.length - 1);
      let param = {
        group: this.group,
				nodes: nodes,
				restricted: this.restricted ? 1 : 0,
				nofailback: this.restricted ? 1 : 0,
				comment: this.comment,
				type: 'group',
      };
      if (this.isCreate) {
        this.createHaGroup(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
          });
      } else {
				param.digist = this.db.groupsObj.digist;
				delete param.group;
				delete param.type;
        this.updateHaGroup(this.db.groupsObj.group, param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then(() => this.close());
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