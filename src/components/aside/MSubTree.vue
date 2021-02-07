<template>
  <ul class="m-sub-tree">
    <li v-for="tree of renderData" :key="tree.data.id" class="m-sub_li">
      <template v-if="tree.data.parentId === parentId">
        <div
          class="m-sub-item"
          :class="tree.data.selected && tree.data.selected ? 'is-selected': ''"
          @click.stop="handleSelect(tree.data)"
          @mouseover.stop="showTip(tree)"
          @mouseout="hiddenTip(tree)"
        >
          <div class="m-sub-item-content" :ref="`m$sub$item${tree.data.id}`">
            <i :class="tree.data.iconCls" class="m-icon-custom"></i>
            <span>{{tree.data.text}}</span>
          </div>
        </div>
      </template>
      <div class="m-sub_li"></div>
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
    showTip(tree) {
      let el = document.createDocumentFragment(),
          pos = this.$refs[`m$sub$item${tree.data.id}`][0].getBoundingClientRect(),
          con = document.querySelector('.m-tree'),
          dom = document.createElement('div');
          dom.className = 'm-sub-item-tips';
          dom.setAttribute('id', `${tree.data.id.replace(/\//g, '')}`)
          dom.style.left = con.clientWidth + 'px';
          dom.style.top = (pos.top - 15) + 'px';
          dom.style.zIndex = '999';
          dom.style.backgroundColor = '#fff';
          dom.style.padding = "10px 20px";
          dom.style.color =  "#222";
          dom.style.position = 'absolute';
          dom.innerHTML = `<ul>
   <li>名称：${tree.data.text ? tree.data.text : ''}</li>
   <li>状态：${tree.data.status ? tree.data.status : ''}</li>
</ul>`
          el.appendChild(dom);
      document.body.appendChild(el);
    },
    hiddenTip(tree) {
      let id = document.querySelector(`#${tree.data.id.replace(/\//g, '')}`);
      document.body.removeChild(id);
    }
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

<style lang="less">
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
      position: absolute;
      z-index: 1086;
      background: #fff;
      color: #222;
      padding: 5px 20px;
      font-size: 12px;
      text-overflow: normal;
      word-wrap: break-word;
      white-space: normal;
      box-shadow: 1px 1px 12px #ccc;
      transition: all 0.5s ease-in;
      &:before {
        content: "";
        display: block;
        width: 10px;
        height: 10px;
        border-right: 2px solid #f6f6f6;
        border-bottom: 2px solid #f6f6f6;
        -webkit-transform: rotate(135deg);
        position: absolute;
        bottom: -4px;
        text-align: center;
        background: #fff;
        top: 50%;
        transform:translateY(-50%) scale(1) rotate(135deg);
        transition-delay: .5s;
        transition-timing-function: ease-in;
        left: -5px;
      }
    }
    &:hover {
      .m-sub-item-tips {
        display: block;
      }
    }
  }
   &_li{
    position: relative;
    &:after{
      content: '';
      position: absolute;
      height: 1px;
      background: #fff;
      left: -10px;
      right: 0;
      bottom: 0;
    }
  }
}
.is-selected {
  background-image: linear-gradient(180deg,  rgba(64, 158, 255, 0.7),  rgba(64, 158, 255));
  color: #fff;
}
</style>
