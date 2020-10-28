<template>
	 <div class="tabs" ref="tabs">
		 <div :class="['tabs__active-bar', `is-${placement}`]" :style="barStyle"></div>
		 <slot></slot>
	 </div>
</template>
<script>
export default {
	name: 'Tab',
	props: {
		value: {
			type: [String, Number]
		},
		placement: {
			type: [String],
			default: 'bottom'
		}
	},
	provide(){
    return {
			Tabs: this
		}
	},
	data() {
		return {
			barStyle: {}
		}
	},
	methods: {
		handleChange(name) {
		 this.$emit('tab-click', name);
		}
	},
	watch: {
		value:function(newVal, oldVal) {
      if(newVal !== oldVal) {
				return newVal;
			}
		}
	}
}
</script>

<style scoped lang="less">
 .tabs__active-bar{
	  position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background-color: #409eff;
    z-index: 1;
    transition: transform .3s cubic-bezier(.645,.045,.355,1);
    list-style: none;
 }
 .is-bottom{
	 bottom: 0;
 }
 .is-top{
	 top: 100%;
 }
 .tabs{
	 position: relative;
	 &:nth-child(2) {
     padding-left:0px;
	 }
	 &:nth-last-child{
		 padding-right:0px;
	 }
 }
</style>