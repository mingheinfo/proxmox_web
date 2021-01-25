<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="fa fa-save"
        >添加</m-button
      >
      <m-button
        type="primary"
        @on-click="showModal('edit')"
        icon="fa fa-retweet"
        :disabled="inStatus()"
        >编辑</m-button
      >
      <m-button
        type="danger"
        @on-click="handleDelete()"
        icon="el-icon-delete"
        :disabled="inStatus()"
        >删除</m-button
      >
      <m-button
        type="info"
        @on-click="handleRollback"
        icon="el-icon-view"
        :disabled="inStatus()"
        >回滚</m-button
      >
    </div>
    <div slot="page-content" style="
    position: relative;
    top: 0;
    bottom: 0;
    left: 0;
    right: -20px;">
        <div
          class="snapshot tree"
          :style="{ width: (yMax + 1) * ySpace + 'px' }"
        >
          <div
            class="fake-node"
            @click="openCreateSnapshot()"
            title="创建快照"
          ></div>
        </div>
        <div
          class="list"
          :style="{ 'margin-left': (yMax + 1) * ySpace + 'px' }"
          :class="{ 'list-left': snapshotList.length === 0 }"
        >
          <div class="row-title">
            <span id="common-name" class="name">名称</span>
            <span id="common-size" class="size">内存</span>
            <span id="common-createDate" class="date">日期</span>
						<span id="common-createDate" class="description">描述</span>
          </div>
          <label class="row" v-for="it in snapshotList" :key="it.data && !it.data.root && it.data.inventory && it.data.inventory.name && it.data.inventory.name"
					   :class="{'is-active': it.data && it.data.inventory && current === it.data.inventory.name, 'hidden': it.data && it.data.fakeLeaf && it.data.fakeLeaf}">
            <template v-if="it.data && !it.data.fakeLeaf">
							<input name="snapshot" :id="it.data.inventory.name" type="radio" style="display: none;width:0px"  @change="handleSelect"/>
              <span id="vm-snapshot-root" class="root-name" v-if="it.data && !it.data.root">{{it.data && it.data.inventory && it.data.inventory.name && it.data.inventory.name}}</span>
							<span id="vm-snapshot-root" class="root-name" v-if="it.data.root && it.data.root">起始</span>
              <span class="name">
									<table-info-state :state="it.data.inventory.vmstate === 1 ? 'actived' : 'unActived'" :content="it.data.inventory.vmstate === 1 ? '是' : '否'"></table-info-state>
							</span>
              <span class="date">{{it.data.inventory.snaptime ? dateFormat(new Date(it.data.inventory.snaptime*1000), 'yyyy-MM-dd hh:mm:ss') : ''}}</span>
					    <span class="description">{{it.data.inventory.description && it.data.inventory.description}}</span>
					</template>
          </label>
        </div>
      <add-snap-shot-modal
        :visible="visible"
        v-if="visible"
        :title="title"
        :param="param"
        :isCreate="isCreate"
        :modalType="modalType"
        @close="
          visible = false;
          __init__();
        "
      ></add-snap-shot-modal>
      <m-dialog
        :visible="showDeleteLog"
        @close="closeDeleteLog"
        title="任务进度"
      >
        <template slot="content">
          <div class="progress" v-if="!done">
            <div class="progress-inner"></div>
          </div>
          <div v-else>
            <div class="progress">Done!</div>
          </div>
        </template>
        <template slot="footer"><span></span></template>
      </m-dialog>
    </div>
  </page-template>
</template>
<script>
import SnapShotHttp from "@src/views/home/qemu/snapshot/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import AddSnapShotModal from "./AddSnapShotModal";
import { dateFormat, byteToSize, quickSort, isEmpty } from "@libs/utils/index";
import * as d3 from "d3";
export default {
  name: "Snapshot",
  mixins: [SnapShotHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    AddSnapShotModal,
  },
  data() {
    return {
      modalType: "backup",
      visible: false,
      title: "",
      selectedList: [],
      isCreate: true,
      param: {},
      search: "",
      storage: "",
      current: "",
      interVal: null,
      snapshotList: [],
      showDeleteLog: false, //是否展示进度
      done: true,
      yMax: -1,
      xSpace: 48,
      ySpace: 34,
      fakeNewNode: {},
      currentTreeUuid: "",
    };
  },
  mounted() {
    let _this = this;
    _this.yMax = -1;
    _this.fakeNewNode = {};
    let oldSvg = d3.select(_this.$el).select(".tree svg");
    if (oldSvg) oldSvg.remove();
    this.__init__();
  },
  methods: {
    dateFormat,
    byteToSize,
    //初始化查找
    __init__() {
      let _this = this;
      _this.querySnapShotList({ _dc: new Date().getTime() }).then((res) => {
        _this.snapshotList = quickSort(
          _this.db.snapshotList.filter((item) => item.name !== "current"),
          "snaptime",
          "+"
        );
        let current = _this.db.snapshotList.filter(
          (item) => item.name === "current"
        );
        if (current.length > 0) {
          _this.currentTreeUuid = current[0].name;
        }
        _this.snapshotList.push(
          _this.db.snapshotList.filter((item) => item.name === "current")[0]
        );
        let treeData = (tree, parent) => {
          tree.forEach((item) => {
            if (!item.children) {
              item.children = [];
            }
            if (item.parent && item.parent === parent) {
              item.children.push(item);
            }
            if (item.children && item.children.length > 0) {
              treeData(item.children, item.name);
            }
          });
        };
				let fakeRoot = this.getTree(_this.db.snapshotList)
         if (_this.snapshotList.length > 0) {
           this.$nextTick(() => {
             this.draw(fakeRoot);
           })
         }
      });
    },
    getTree(arr) {
      let getChildren = (id) => {
        let children = [];
        for (let i = 0; i < arr.length; i++) {
          if (id === arr[i].parent) {
             children.push({
								inventory: {
					       name: arr[i].name,
					       description: arr[i].description,
                 snaptime: arr[i].snaptime,
								 vmstate: arr[i].vmstate,
								 latest: arr[i].name === 'current' ? true : false
			      	 },
              children: getChildren(arr[i].name),
            });
          }
        }
        return children;
			};
			let root =  this.db.snapshotList.filter((item) => !item.parent);
			console.log(root);
      let tree = {
				inventory: {
					name: root[0].name,
					description: root[0].description,
          snaptime: root[0].snaptime,
					vmstate: root[0].vmstate,
					latest:  root[0].name === 'current' ? true : false
				},
        root: true,
        children: arr.length > 0 ? getChildren(root[0].parent, arr) : [],
      };
      return tree;
    },
    //按钮是否可点击
    inStatus() {
      return isEmpty(this.current) || this.current === "current";
    },
    //选择
    handleSelect(event) {
      this.current = event.target.id;
    },
    draw: function (treeData) {
      let self = this;
      this.snapshotList = [];
      let margin = { top: 20, right: 0, bottom: 50, left: 30 };
      var nodes = d3.hierarchy(treeData);
      let latestNode;
      nodes.each(function (d) {
        if (
          d.data.inventory &&
          d.data.inventory.name &&
          d.data.inventory.name === self.currentTreeUuid
        ) {
          latestNode = d;
        }
      });
      if (!latestNode) {
        latestNode = nodes;
      }
      self.fakeNewNode = {
        data: {
          inventory: {
            fakeNode: true,
          },
          fakeLeaf: true,
        },
        parent: latestNode,
        ...self.fakeNewNode,
      };

      if (!latestNode.children) latestNode.children = [];
      latestNode.children.push(self.fakeNewNode);

      let leaves = nodes.leaves();
      leaves.sort(function (a, b) {
        if (a.data.inventory.fakeNode) return Number.MIN_SAFE_INTEGER;
        if (b.data.inventory.fakeNode) return Number.MAX_SAFE_INTEGER;
        return (
           b.data.inventory.snaptime -
           a.data.inventory.snaptime
        );
      });

      self.xIndex = 0;
      self.yMax = -1;

      function visitNode(node, root, yIndex) {
        if (node && node.children && node.children.length > 0) {
          let leaves = node.leaves();
          leaves.sort(function (a, b) {
            return (
              b.data.inventory.snaptime -
              a.data.inventory.snaptime
            );
          });
          leaves.forEach(function (leaf) {
            if (!leaf.accessed) {
              visitNode(leaf, node, yIndex + 1);
            }
          });
        }
        node.x = self.xIndex * self.xSpace;
        node.y = yIndex * self.ySpace;
        if (self.yMax < yIndex) self.yMax = yIndex;
        node.accessed = true;
        if (node === root) return;
        self.snapshotList.push(node);
        self.xIndex++;
        visitNode(node.parent, root, yIndex);
      }

      visitNode(self.fakeNewNode, nodes, 0);

      self.snapshotList.push(nodes);

      var svg = d3
        .select(this.$el.querySelector(".tree"))
        .append("svg")
        .attr(
          "width",
          (self.yMax + 1) * self.ySpace + margin.left + margin.right
        )
        .attr("height", self.xIndex * self.xSpace + margin.top + margin.bottom);
      let g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      g.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter()
        .append("path")
        .attr("stroke-dasharray", function (d) {
          if (d.data.inventory.fakeNode) return "5, 5";
          return "";
        })
        .attr("class", "link")
        .attr("d", function (d) {
          return (
            "M" +
            d.y +
            "," +
            d.x +
            " L" +
            d.y +
            "," +
            (d.x + d.parent.x) / 2 +
            // ' l' + d.parent.y + ',' + (d.x + d.parent.x) / 2 +
            " L" +
            d.parent.y +
            "," +
            d.parent.x
          );
        });

      // adds each node as a group
      var node = g
        .selectAll(".node")
        .data(nodes.descendants())
        .enter()
        .append("g")
        .attr("class", function (d) {
          return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        });
      // return 'translate(' + (width - d.x) + ',' + (height - d.y) + ')' })

      // adds the circle to the node
      node
        .append("circle")
        .attr("r", 7)
        .attr("fill", (d) =>
          d.data.inventory.latest &&
          d.data.inventory.name === this.currentTreeUuid
            ? "#90D9FF"
            : "#fff"
        );

      // svg.append('div')
      //   .attr('class', 'fake-node')
      //   .style('left', this.fakeNewNode.x)
      //   .style('top', this.fakeNewNode.y)

      // // adds the text to the node
      // node.append('text')
      //   .attr('dy', '.35em')
      //   .attr('y', function (d) { return d.children ? -20 : 20 })
      //   .style('text-anchor', 'middle')
      //   .text(function (d) { return d.data.inventory.name + ' ' + d.data.inventory.latest })
    },
    /**
     * 删除备份任务
     */
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `你确定你要删除改项${this.current}吗？`,
          type: "info",
          icon: "icon-warning",
        })
        .then(() => {
          this.deleteSnapShot()
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.$confirm.confirm({
                msg: res,
              });
            });
        })
        .catch(() => {});
    },
    //排序
    handleSort({ colume, prop, order }) {
      let _this = this;
      if (order !== null)
        _this.qemuTaskList = quickSort(
          _this.db.nodeTaskList,
          prop,
          order === "ascending" ? "+" : "-"
        );
    },
    /**
     * 弹框
     */
    showModal(type) {
      this.modalType = type;
      this.param =
        type !== "create"
          ? this.db.snapshotList.filter((item) => item.name == this.current)[0]
          : {};
      this.isCreate = type === "create";
      this.setTitle(type);
      this.visible = true;
    },
    /**
     * 设置标题 @param type 'backup', 'config', 'restore'
     */
    setTitle(type) {
      switch (type) {
        case "create":
          this.title = `创建: 快照`;
          break;
        case "edit":
          this.title = `编辑： 快照`;
          break;
      }
    },
    /**
     * render同步
     */
    renderSync(value, type, recode) {
      if (!value) {
        return "-";
      }
      if (type === "last") {
        if (record.data.pid) {
          return gettext("syncing");
        }
      } else {
        let now = new Date(),
          next = new Date(value * 1000);
        if (next < now) {
          return gettext("pending");
        }
      }
      return dateFormat(new Date(value * 1000), "yyyy-MM-dd hh:mm:ss");
    },
    /**
     * 持续时间
     */
    render_duration(value) {
      if (value === undefined) {
        return "-";
      }
      return format_duration_short(value);
    },
    closeDeleteLog() {
      this.showDeleteLog = false;
      this.__init__();
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
    },
    //回滚
    handleRollback() {
      this.$confirm
        .confirm({
          msg: `确定要回滚${this.current}?`,
          icon: "icon-question",
        })
        .then((res) => {
          this.rollback(this.current).catch((res) => {
            this.$confirm.info({
              msg: res,
            });
          });
        });
    },
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
.icon {
  background-image: url(~@images/elbow-end.png);
  height: 15px;
  display: inline-block;
  width: 16px;
  background-repeat: no-repeat;
}
.is-active {
  background: #1989fa;
  color: #fff;
}
.progress {
  width: 90%;
  position: relative;
  height: 30px;
  line-height: 30px;
  background: #f5f5f5;
  padding: 0px 10px;
  margin: 90px 0px;
  text-align: center;
  &-inner {
    position: absolute;
    height: 30px;
    line-height: 30px;
    animation: progress 3s infinite;
    background: #369;
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }
  25% {
    width: 25%;
  }
  50% {
    width: 50%;
  }
  75% {
    width: 75%;
  }
  100% {
    width: 100%;
  }
}

.tree {
  position: absolute;
}

.list {
  padding-top: 7px;
  padding-left: 40px;
  font-size: 14px;
}

.list-left {
  padding-left: 74px;
}

.list .row {
		height: 48px;
		line-height: 48px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;

}

.list .row-title {
  height: 31px;
  box-shadow: inset 0 -1px 0 0 #E2EEF4;
  margin-bottom: 20px;
}

.list .row-title .name {
  display: inline-block;
  width: 24%;
}

.list .row-title .size {
  display: inline-block;
  width: 24%;
}

.list .row-title .date {
  display: inline-block;
  width: 24%;
}
.list .row-title .description {
  display: inline-block;
  width: 24%;
}
.list .row .name {
  display: inline-block;
  width: 24%;
  color: #3C73B9;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
	text-overflow: ellipsis;
	height: 48px;
	line-height: 48px;
}

.list .row .description {
  display: inline-block;
  width: 24%;
  color: #3C73B9;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
	text-overflow: ellipsis;
	height: 48px;
	line-height: 48px;
}

.list .row .root-name {
  display: inline-block;
	width: 24%;
	height: 48px;
	overflow: hidden;
  white-space: nowrap;
	text-overflow: ellipsis;
	line-height: 48px;
}

.list .row .size {
  display: inline-block;
	width: 24%;
	height: 48px;
	line-height: 48px;
}

.list .row .date {
  display: inline-block;
	width: 24%;
	height: 48px;
	line-height: 48px;
	vertical-align: top;
}
.snapshot.link {
  fill: none!important;
  stroke: #5e6978!important;
  stroke-width: 1px!important;
}
.hidden{
	display: none!important;
}
</style>
