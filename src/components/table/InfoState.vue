<template>
	<div class="state">
		<div class="state-dot" :class="__class"></div>
		<div class="state-content">{{content}}</div>
	</div>
</template>
<script>
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
		__class() {
			return {
				'actived': this.state === 'actived',
				'unactived': this.state ===  'unActived',
				'online': this.state === 'online',
				'unLine': this.state === 'unLine'
			}
		}
	}
}
</script>

<style lang="less" scoped>
  @import '~@src/components/table/infoState.less';
</style>