<template>
   <ul class="context-menu" @click="$emit('on-click')">
     <li v-for="(menu, index) in menuData" :key="index" :id="menu.operate" class="context-menu-item" :class="{'disabled': menu.disabled}">
       <span :class="[menu.cls, menu.icon]"></span>
       <span>{{menu.text}}</span>
     </li>
   </ul>
</template>

<script>
  export default {
    name: "Index",
    props: {
      menuData: {
        type: Array,
        default: () => {
          return []
        }
      },
      visible: {
        type: Boolean,
        default: false
      },
      axis: {
        type: Object,
        default: () => {
          return {}
        }
      },
    },
    data() {
      return {
        showMenu: false
      }
    },
    methods: {
      handleMenu() {
          if(this.axis) {
            this.$el.style.left = this.axis.x + 'px';
            this.$el.style.top = this.axis.y + 'px';
            document.body.appendChild(this.$el);
          }
      }
    },
    watch: {
      visible: function(newVal, oldVal) {
        if(newVal !== oldVal) {
          this.handleMenu();
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .context-menu{
    position: absolute;
    background: #fff;
    box-shadow: 1px 1px 12px #ccc;
    padding: 10px 20px;
    color: #222;
    z-index: 999;
    cursor: pointer;
    &-item{
      padding: 0px 20px;
      height: 30px;
      line-height: 30px;
      &:hover{
        background-image: linear-gradient(180deg, #409EFF, #007dff);
        color: #fff;
      }
      &:first-child{
        margin: 10px 10px 10px;
        background-image: none;
        color: #333;
      }
    }
  }
</style>
