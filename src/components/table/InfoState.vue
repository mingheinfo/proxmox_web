<template>
	<div class="state">
		<div class="state-dot" :class="__class"></div>
		<div class="state-content">{{content}}</div>
	</div>
</template>
<script>
//表格状态组件
export default {
	name: 'InfoState',
	props: {
		state: {
			type: String,
			default: 'normal'
		},
		content: {
			type: String,
			default: ''
		}
	},
	computed:{
		//计算属性根据状态计算不同的类名，根据不同的类名得到不同的颜色状态
		__class() {
			return {
				'actived': this.state === 'actived',
				'unactived': this.state ===  'unActived',
				'online': this.state === 'online',
				'unLine': this.state === 'unLine',
				'unknown': this.state === 'unknown',
				'running': this.state === 'running',
				'stopped': this.state === 'stopped',
				'dead': this.state === 'dead',
				'stopped': this.state === 'stop'
			}
		}
	}
}
</script>

<style lang="less" scoped>
  @import '~@src/components/table/infoState.less';
</style>