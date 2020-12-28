<template>
  <ul class="m-select">
    <label class="select__label" :style="{ width: labelWidth }">{{
      label
    }}</label>
    <span class="m-select__input">
      <span
        class="select prefix-icon"
        tabindex="-1"
        :class="{
          show: trigger === 'hover' && isOpen,
          'is-click': isOpen,
          disabled: disabled,
          'm-select__error': showError,
        }"
        @click.stop="handleClick"
        ref="select"
      >
        <span :class="['icon', icon]"></span>
        <template v-if="type === 'multiple'">
          <span
            v-for="(item, index) in selected"
            :key="index"
            class="m-select__item"
          >
            <span>{{ item.label }}</span>
            <span
              class="el-icon-close"
              @click.stop="handleChange('', item.value, false)"
            >
            </span>
          </span>
            <input :placeholder="placeholder"
                   v-show="selected.length <= 0"
                   :class="{'disabled': disabled}"
                    readonly :disabled="disabled" 
                    class="m-select__input__inner"/>
        </template>
        <template v-else>
          <span class="m-select__item__input" 
                v-for="(item, index) in selected"
               :key="index">
            <input class="m-select__input__inner" 
                   :value="item.label" 
                   :class="{'disabled': disabled}"
                   @blur.stop="handleOptionBlur"
                   @input="(e) =>  $emit('on-change', e.target.value)"
                   :placeholder="placeholder"
                   :readonly="readonly" :disabled="disabled"/>
          </span>
          <input v-show="selected.length <= 0"
                 :class="{'disabled': disabled}"
                 class="m-select__input__inner"
                 :placeholder="placeholder"
                 @blur.stop="handleOptionBlur"
                 :value="value" @input="(e) => !disabled && $emit('on-change', e.target.value)" 
                 :readonly="readonly" :disabled="disabled"/>
        </template>
      </span>
      <div class="error-message" v-show="showError">{{ errorMsg }}</div>
    </span>
    <div class="m-select-menu animate__fadeInDown" v-show="renderDropMenu" ref="select-menu">
      <div x-arrow="" class="popper__arrow"></div>
      <div
        style="overflow-y: auto; max-height: 200px"
        ref="select-option"
        tabindex="-1"
        @mouseleave.stop="isOpen = false"
        @blur.stop="() => {if(type === 'multiple')handleOptionBlur()}"
      >
        <slot></slot>
      </div>
    </div>
  </ul>
</template>

<script>
export default {
  name: "select",
  provide() {
    return {
      Select: this,
    };
  },
  computed: {
    renderDropMenu() {
      if(this.disabled) return;
      if (this.isOpen && this.$refs["select-menu"]) {
        const { left, top } =
          this.$refs &&
          this.$refs["select"] &&
          this.$refs["select"].getBoundingClientRect();
        this.$refs["select-menu"].style.top = `${
          top + this.$refs["select"].clientHeight + 10
        }px`;
        this.$refs["select-menu"].style.left = `${left}px`;
        this.$refs["select-menu"].style.minWidth = `${
          1.2 * this.$refs["select"].clientWidth
        }px`;
        this.$refs["select-menu"].style.transition = `all 0.5s ease-in`;
        document.body.appendChild(this.$refs["select-menu"]);
        setTimeout(() => {if(this.isOpen && this.type === 'multiple')  this.$refs["select-option"].focus()}, 10);
        return true;
      } else {
          if(this.$refs && this.$refs["select-menu"] &&  this.$refs["select-menu"].parentNode === document.body) {
             document.body.removeChild(this.$refs["select-menu"]);
          }
        return false;
      }
    },
  },
  props: {
    trigger: {
      type: String,
      default: "hover",
    },
    icon: String,
    disabled: Boolean,
    type: {
      type: String,
      default: "",
    },
    value: {
      type: [Array, Object, String, Number],
    },
    label: {
      type: [String, Number],
      default: "",
    },
    labelWidth: {
      type: String,
    },
    validateEvent: {
      type: Boolean,
    },
    prop: {
      type: String,
      default: "",
    },
    showError: {
      type: Boolean,
      default: false,
    },
    errorMsg: {
      type: String,
      default: "",
    },
    autoComplete: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: "请选择",
    }
  },
  data() {
    return {
      isOpen: false,
      selectValues: [],
      selected: [],
      cachedOptions: []
    };
  },
  mounted() {
    //当窗口大小改变时不展示下拉框
    this.selected = this.setSelected();
    this.selectValues = this.value;
    window.addEventListener("resize", this.handleOptionBlur);
    document.addEventListener("click",this.showOption,false);
  },
  methods: {
    setSelected() {
      let selected = [];
      for(let i =0; i < this.cachedOptions.length; i ++) {
        if(this.type === 'multiple'){
          if(this.value.includes(this.cachedOptions[i].value)) {
            selected.push(this.cachedOptions[i]);
          }
        }else {
          if(this.value === this.cachedOptions[i].value) {
            selected.push(this.cachedOptions[i]);
          }
        }
      }
      return selected;
    },
    //改变下拉框触发的回调
    handleChange(type, value, selected) {
      if(this.type ==='multiple') {
        if (selected){
          this.selectValues.push(value);
        } else {
          for(let i =  0 ; i < this.selectValues.length; i++) {
            if(value === this.selectValues[i]) {
              this.selectValues.splice(i, 1);
            }
          }
        };
          this.$emit("on-change", this.selectValues);
      }else {
          if(value === this.selectValues) return;
          this.$emit("on-change", value);
          if(this.type !== 'multiple') {
              this.isOpen = false;
          }
      }
      this.$emit("validate", this.prop);
      this.selected = this.setSelected();
    },
    //处理多选隐藏
    handleOptionBlur() {
			this.isOpen = false;
    },
    handleClick() {
      this.isOpen = !this.isOpen;
      this.$emit('visible-change');
    },
    //点击下拉选择框之外的区域隐藏选择框
    showOption(event) {
      event.stopPropagation
        ? event.stopPropagation()
        : (event.cancelBubble = true);
      this.isOpen = false;
      this.$emit("validate", this.prop);
    },
    handleOptionBlur() {
      this.isOpen  = false;
    }
  },
  destroyed() {
    //移除resize监听事件
    window.removeEventListener("resize", this.handleOptionBlur);
    document.removeEventListener("click",this.showOption,false);
  },
  watch: {
    value: function(newVal, oldVal) {
      if(newVal !== oldVal) {
        this.selected = this.setSelected();
        this.selectValues = newVal;
        return newVal;
      }
    }
  }
};
</script>

<style scoped lang="less">
.prefix-icon {
  position: relative;
  border: 1px solid #adb0b8;
  -webkit-transition: border-color 0.15s;
  transition: border-color 0.15s;
  border-radius: 2px;
  min-width: 200px;
  width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-height: 28px;
  line-height: normal;
  text-align: left;
  background-color: #fff;
  -webkit-box-sizing: border-box;
  -ms-box-sizing: border-box;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  &::after {
    position: absolute;
    right: 10px;
    top: 36%;
    background-color: transparent;
    color: #52545c;
    font: normal normal normal 12px FontAwesome;
    content: "\F0D7";
    pointer-events: none;
    font-size: 11px;
  }
}

.m-select {
  display: inline-block;
  padding: 0 10px 15px;
  position: relative;
  &-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    color: #000;
    z-index: 9999;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.5s ease-in;
    max-height: 200px;
    transform-origin: center top 0px;
  }
  &__item {
    display: inline-block;
    vertical-align: middle;
    height: 18px;
    line-height: 18px;
    background: #fef0f0;
    margin: 5px 5px;
    padding: 0px 5px;
    &__input{
      height: 30px;
      line-height: 30px;
    }
	}
	&__input{
		display:inline-block;
		vertical-align: middle;
    position: relative;
    &__inner{
      height: 28px;
      border: none;
      width: 100%;
      padding-left: 5px;
    }
	}
	&__error{
		border: 1px solid #ec4242;
	}
}
.select.is-click {
  .select-item {
    display: block;
    z-index: 999;
  }
  .select-menu {
    border: 1px solid #3973ff;
  }
}
.select.show {
  &:hover {
    .select-item {
      display: block;
    }
    .select-menu {
      border: 1px solid #3973ff;
    }
  }
}
.popper__arrow {
  top: -6px;
  left: 50%;
  margin-right: 3px;
  border-top-width: 0;
  border-bottom-color: #ebeef5;
  border-width: 6px;
  // /filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
  &:after {
    content: "";
    position: absolute;
    display: block;
    width: 10px;
    height: 10px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    left: 50%;
    top: -6px;
    border-top: 1px solid #ebeef5;
    border-left: 1px solid #ebeef5;
    background: #fff;
  }
}

.select__label {
  max-width: 100%;
  margin-bottom: 5px;
  font-weight: 400;
  display: inline-block;
  vertical-align: middle;
}
.m-form__checkbox {
  vertical-align: middle;
  margin-top: 10px;
  display: inline-block;
  input:disabled + div::after {
    background: #dde4ed;
  }
}
.error-message{
			position: absolute;
			left: 0px;
			font-size: 12px;
			bottom: -15px;
			color: #ec4242;
			overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
	}
</style>
