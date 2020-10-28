<template>
  <div class="dropdown-item"
       @mousedown="handleClick"
       :class="{'disabled': disabled}">
    <span v-if="icon" :class="['icon', icon]"></span>
    <base-icon v-if="name" :class="['icon']" :name="name" :_style="{width: '16px', 'height': '16px'}"></base-icon>
    <slot></slot>
  </div>
</template>

<script>
  import { stopEvent } from "@libs/utils";
  import BaseIcon from "../icon/BaseIcon";

  export default {
    name: "dropdownItem",
    components: {BaseIcon},
    inject: {
      Dropdown: { default: "Dropdown" }
    },
    props: {
      icon: String,
      command: String | Number | Object,
      disabled: Boolean,
      divided: Boolean,
      name: String
    },
    methods: {
      //点击下拉框时触发的时间
      handleClick(e) {
        stopEvent(e);
        if(!this.disabled)
        this.Dropdown.handleChange('on-change', this.command);
      }
    }
  }
</script>

<style scoped lang="less">
  .dropdown-item {
    padding: 0px 10px;
    position: relative;
    height: 30px;
    line-height: 30px;
    background: #fff;
    cursor: pointer;
    text-align: left;
    &:hover {
      color: #7fdbff;
    }
  }
</style>
