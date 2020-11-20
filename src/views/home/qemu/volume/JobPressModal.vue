<template>
  <m-dialog :visible="visible" 
	          @close="close"
						:title="title"
						@cancle="close">
		<div slot="content">
			<div class="progress">
				<div class="progress-inner">{{msg}}</div>
			</div>
		</div>
	</m-dialog>
</template>

<script>
export default {
	name: 'JobPressModal',
	props: {
		msg: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		},
		visible: {
			type: Boolean,
			default: false
		}
	},
	methods: {
    close() {
			this.$emit('close');
		}
	},
	watch: {
		visible: function(newVal, oldVal) {
			if(newVal !== oldVal) {
				return newVal;
			}
		},
		msg: function(newVal, oldVal) {
				if(newVal !== oldVal) {
				return newVal;
			}
		}
	}
}
</script>

<style lang="less" scoped>
 .progress{
	 width: 100%;
	 padding: 20px 50px;
	 background: #f6f6f6;
	 position: relative;
	 &-inner {
		position: absolute;
    top: 0;
    left: 0;
    -webkit-animation: progress-animation-data-v-16dab862 0ms linear .5s infinite;
    animation: progress-animation-data-v-16dab862 0ms linear .5s infinite;
    height: 100%;
    line-height: 40px;
    width: 100%;
	 }
 }

 @keyframes progress-animation {
	 0% {
		 width: 0%;
	 }
	 50% {
		 width: 50%;
	 }
	 100% {
		 width: 100%;
	 }
 }
</style>