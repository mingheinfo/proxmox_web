<template>
  <ul class="m-sub-tree">
    <li v-for="tree of renderData" :key="tree.data.id">
      <template v-if="tree.data.parentId === parentId">
        <div
          class="m-sub-item"
          :class="tree.data.selected && tree.data.selected ? 'is-selected': ''"
          @click.stop="handleSelect(tree.data)"
        >
          <div class="m-sub-item-content">
            <i :class="tree.data.iconCls" class="m-icon-custom"></i>
            <span>{{tree.data.text}}</span>
          </div>
          <div
            class="m-sub-item-tips"
          >名称：{{tree.data.text}}<br/>{{tree.data.status ? `状态: ${tree.data.status}` : ''}}</div>
        </div>
      </template>
      <template v-if="tree.childNodes && tree.childNodes.length > 0">
        <m-sub-tree :tree-data="tree.childNodes" :parent-id="tree.data.parentId" />
      </template>
    </li>
  </ul>
</template>

<script>
export default {
  name: "MSubTree",
  props: {
    treeData: {
      type: Object | Array,
    },
    parentId: {
      type: String,
    },
  },
  data() {
    return {
      renderData: {},
    };
  },
  methods: {
    handleSelect(node) {
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(node, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop(this.renderData);
      this.$forceUpdate();
      this.$emit("reset-select", node);
    },
    resetSelect(node) {
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(node, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop(this.renderData);
      this.$forceUpdate();
    },
  },
  watch: {
    treeData: {
      immediate: true,
      deep: true,
      handler: function (newVal, oldVal) {
        this.renderData = newVal;
      },
    },
  },
};
</script>

<style scoped lang="less">
.m-sub {
  &-item {
    padding: 5px 0px;
    width: 100%;
    position: relative;
    &-content {
      padding-left: 47px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      table-layout: fixed;
      display: inline-block;
    }
    &-tips {
      display: none;
      position: absolute;
      z-index: 1086;
      background: #222;
      color: #fff;
      top: calc(-100% - 20px);
      padding: 5px 20px;
      font-size: 12px;
      text-overflow: normal;
      word-wrap: break-word;
      white-space: normal;
      width: 100%;
      &:before {
        content: "";
        display: block;
        width: 5px;
        height: 5px;
        border-right: 2px solid #222;
        border-bottom: 2px solid #222;
        -webkit-transform: rotate(35deg);
        transform: rotate(43deg);
        position: absolute;
        bottom: -4px;
        text-align: center;
        background: #222;
         left: 50%;
      }
    }
    &:hover {
      .m-sub-item-tips {
        display: block;
      }
    }
  }
}
.is-selected {
  background: rgba(64, 158, 255, 0.7);
  color: #fff;
}
</style>
