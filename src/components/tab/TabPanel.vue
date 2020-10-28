<template>
  <div class="tabs__item" ref="tab_item" :name="name" @click="handleClick">
    <template v-if="$slots['tab']"><slot name="tab"></slot></template>
    <template v-else>{{ label }}</template>
  </div>
</template>

<script>
export default {
  name: "tabPanel",
  inject: {
    Tabs: { default: "Tabs" },
  },
  props: {
    name: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    handleClick() {
      this.Tabs.barStyle = {
        width: this.$refs.tab_item.clientWidth + "px",
        transform: `translateX(${this.$refs.tab_item.offsetLeft}px)`,
			};
      this.Tabs.handleChange(this.name);
    },
    init() {
      if (this.Tabs.value === this.name) {
        this.$nextTick(() => {
          let style = getComputedStyle(this.$refs.tab_item);
          this.Tabs.barStyle = {
            width: this.$refs.tab_item.clientWidth + "px",
            transform: `translateX(${style.x})`,
          };
        });
      }
    },
  }
};
</script>

<style>
.tabs__item {
  padding: 0 20px;
  height: 40px;
  box-sizing: border-box;
  line-height: 40px;
  display: inline-block;
  list-style: none;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  position: relative;
  cursor: pointer;
}
</style>