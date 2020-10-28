<template>
  <div :class="['m-button', `m-button-${size}`, `m-button-${type}`, disabled ? 'm-button-disabled' : '' ]"
       @click="!disabled && $emit('on-click')">
    <i class="m-button-icon" :class="icon" v-show="icon"></i>
    <span>
       <slot></slot>
    </span>
  </div>
</template>

<script>
  export default {
    name: "Button",
    props: {
      icon: {
        type: String
      },
      type: {
        type: String,
        default: 'default',
        validator: function(value) {
          if(!['default', 'danger',  'info', 'warning', 'primary'].includes(value)) {
            throw Error(`${value} is not include 'default', 'danger',  'info', 'warning', 'primary'`);
            return false;
          }else {
            return true;
          }
        }
      },
      size: {
        type: String,
        default: 'middle'
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },

  }
</script>

<style scoped lang="less">
  .m-button{
    padding: 0px 10px;
    border-radius: 3px;
    border:  1px solid #e6e6e6;
    display: inline-block;
    text-align: center;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
  }
  .m-button-middle{
    height: 30px;
    line-height: 30px;
  }
  .m-button-small{
    height: 30px;
    line-height: 30px;
  }
  .m-button-large{
    height: 30px;
    line-height: 30px;
  }
  .m-button-icon{
    display: inline-block;
    vertical-align: middle;
    padding-right: 5px;
  }
  .m-button-default{
    background: #fff;
  }
  .m-button-primary{
    background: #409eff;
    color: #fff;
  }
  .m-button-danger{
    background: #ff4e41;
    color: #fff;
  }
  .m-button-info{
    background: #21BF4B;
    color: #fff;
  }
  .m-button-warning{
    background: #ffcc00;
    color: #fff;
  }
  .m-button-disabled{
    background: #e0eaf3;
  }
</style>
