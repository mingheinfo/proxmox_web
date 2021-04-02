<template>
  <div class="m-checkbox">
    <span class="m-checkbox__label" :style="{ width: labelWidth }">{{
      label
    }}</span>
    <label class="m-checkbox__content" :disabled="disabled" :class="{'disabled': disabled}">
      <input type="checkbox" :checked="checked" :disabled="disabled" @change="$emit('change', $event.target.checked)"/>
      <div></div>
			<span style="display: inline-block;vertical-align: middle;"><slot></slot></span>
    </label>
  </div>
</template>
<script>
//多选框组件
export default {
  name: "Checkbox",
  props: {
    checked: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    label: {
      type: String,
    },
    labelWidth: {
      type: String,
    },
	},
	model: {
		prop: 'checked',
		event: 'change'
	}
};
</script>

<style lang="less" scoped>
.m-checkbox {
  display: inline-block;
  padding: 0 10px 15px;
  position: relative;
  &__label {
    display: inline-block;
    vertical-align: middle;
  }
  &__content {
    padding-right: 10px;
    padding-bottom: 5px;
    input[type="checkbox"] {
      display: none;
    }
    div {
      position: relative;
      width: 15px;
      height: 15px;
      line-height: 15px;
      display: inline-block;
      vertical-align: middle;
    }
    input[type="checkbox"] + div::after {
      content: "";
      width: 15px;
      height: 15px;
      background: #fff;
      border: 1px solid #c4d6ec;
      display: inline-block;
    }
    input[type="checkbox"]:checked + div::before {
      content: "";
      display: inline-block;
      width: 3px;
      height: 6px;
      border-right: 2px solid #fff;
      border-bottom: 2px solid #fff;
      background: #409eff;
      -webkit-transform: rotate(35deg);
      transform: rotate(40deg);
      position: absolute;
      bottom: 6px;
      right: 6px;
      z-index: 2;
      outline: 0;
      vertical-align: middle;
    }
    input[type="checkbox"]:checked + div:after {
      content: "";
      display: inline-block;
      width: 15px;
      height: 15px;
      background-color: #409eff;
      position: absolute;
      bottom: 0px;
      right: 0;
      z-index: 1;
      outline: 0;
      vertical-align: middle;
    }
  }
}

.disabled{
	div{
		background: #c4d6ec!important;
	}
}
</style>