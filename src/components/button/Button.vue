<template>
  <div :class="['m-button', `m-button-${size}`, `m-button-${type}`, disabled ? 'm-button-disabled' : '' ]"
       @click="!disabled && $emit('on-click')" :aria-disabled="disabled">
    <i class="m-button-icon" :class="icon" v-show="icon"></i>
    <span class="m-button-text">
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
    padding-right: 5px;
  }
  .m-button-default{
    background: #fff;
    border: 1px solid #adb0b8;
    background-image: linear-gradient(180deg, #fff,#fff);
    &:hover{
       border: 1px solid #409eff;
       color: #409eff;
    }
  }
  .m-button-primary{
    background: #409eff;
    color: #fff;
    background-image: linear-gradient(180deg, #93c9ff,#409eff);
    &:hover{
      box-shadow: 0px 2px 3px rgba(64, 158, 255, 0.5);
    }
  }
  .m-button-danger{
    background: #ff4e41;
    color: #fff;
    background-image: linear-gradient(180deg, #ff8476,#ff4e41);
    &:hover{
      box-shadow: 0px 2px 3px rgba(255, 78, 65, 0.5);
    }
  }
  .m-button-info{
    background: #21BF4B;
    color: #fff;
     background-image: linear-gradient(180deg, #3bef6b,#21BF4B);
     &:hover{
      box-shadow: 0px 2px 3px rgba(33, 191, 75, 0.5);
    }
  }
  .m-button-warning{
    background: #ffcc00;
    color: #fff;
    background-image: linear-gradient(180deg, #ffcc00,#ffcc66)
  }
  .m-button-disabled{
    background: #e0eaf3;
     background-image: linear-gradient(180deg,#e9edf2,#d9e0e9)
  }
  .m-button-text{
    display: inline-block;
  }
</style>
