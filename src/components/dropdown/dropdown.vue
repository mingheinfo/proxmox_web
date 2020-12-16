<template>
  <ul
    class="dropdown"
    tabindex="-1"
    :class="{
      show: trigger === 'hover' && isOpen,
      'is-click': isOpen,
      'disabled': disabled,
    }"
    @click.stop="!disabled ? (isOpen = !isOpen) : null"
    @blur.stop="handleBlur"
    ref="dropdown"
  >
    <span class="prefix-icon">
      <span :class="['icon', icon]"></span>
      <slot name="label"></slot>
    </span>
    <div class="dropdown-menu" v-show="renderDropMenu" ref="dropdown-menu">
      <div x-arrow="" class="popper__arrow el-icon-caret-top"></div>
      <div style="overflow-y: auto; max-height: 200px"><slot></slot></div>
    </div>
  </ul>
</template>

<script>
export default {
  name: "dropdown",
  provide() {
    return {
      Dropdown: this,
    };
  },
  computed: {
    renderDropMenu() {
      if (this.isOpen && this.$refs["dropdown-menu"]) {
        const { left, top } =
          this.$refs &&
          this.$refs["dropdown"] &&
          this.$refs["dropdown"].getBoundingClientRect();
        this.$refs["dropdown-menu"].style.top = `${
          top + this.$refs["dropdown"].clientHeight + 10
        }px`;
        this.$refs["dropdown-menu"].style.left = `${left}px`;
        this.$refs["dropdown-menu"].style.minWidth = `${
          1.2 * this.$refs["dropdown"].clientWidth
        }px`;
        this.$refs["dropdown-menu"].style.transition = `all 0.5s ease-in`;
        setTimeout(() => {
          document.body.appendChild(this.$refs["dropdown-menu"]);
        }, 10);
        return true;
      } else {
        if (
          this.$refs &&
          this.$refs["dropdown-menu"] &&
          this.$refs["dropdown-menu"].parentNode === document.body
        ) {
          document.body.removeChild(this.$refs["dropdown-menu"]);
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
  },
  data() {
    return {
      isOpen: false,
    };
  },
  mounted() {
    //当窗口大小改变时不展示下拉框
    window.addEventListener("resize", () => (this.isOpen = false));
  },
  methods: {
    //改变下拉框触发的回调
    handleChange(type, command) {
      this.$emit("on-change", command);
      this.isOpen = false;
      if (
        this.$refs &&
        this.$refs["dropdown-menu"] &&
        this.$refs["dropdown-menu"].parentNode === document.body
      ) {
        document.body.removeChild(this.$refs["dropdown-menu"]);
      }
    },
    //在下拉框失去焦点时隐藏
    handleBlur() {
      this.isOpen = false;
    },
  },
  destroyed() {
    //移除resize监听事件
    window.removeEventListener("resize", () => (this.isOpen = false));
  },
};
</script>

<style scoped lang="less">
.prefix-icon {
  padding-right: 10px;
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

.dropdown {
  position: relative;
  width: 100%;
  font-size: 14px;
  border-radius: 4px;
  padding: 0px 10px;
  outline: none;
  border: 1px solid #adb0b8;
  display: inline-block;
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
  // &-item{
  //   display: none;
  // }
}
.dropdown.is-click {
  .dropdown-item {
    display: block;
    z-index: 999;
  }
  .dropdown-menu {
    border: 1px solid #3973ff;
  }
}
.dropdown.show {
  &:hover {
    .dropdown-item {
      display: block;
    }
    .dropdown-menu {
      border: 1px solid #3973ff;
    }
  }
}
.popper__arrow {
  top: -15px;
  left: 50%;
  margin-right: 3px;
  border-width: 10px;
  z-index: -1;
  position: absolute;
  font-size: 25px;
  color: #fff;
  text-shadow:0px -1px 2px #c4d6ec;
}
</style>
