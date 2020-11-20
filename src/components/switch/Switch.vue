<template>
  <div class="switch" @change="handleChange">
		<label class="switch-off m-input__radio" :class="{'checked': value === 'off'}">
			<input type="radio" :name="name" value="off" :checked="value === 'off'"/>
			 <div></div>
		</label>
		<label class="switch-default m-input__radio" :class="{'checked': value === 'default'}">
				<input type="radio" :name="name" value="default" :checked="value === 'default'"/>
				 <div></div>
		</label>
		<label class="switch-on m-input__radio"  :class="{'checked': value === 'on'}">
				<input type="radio" :name="name" value="on" :checked="value === 'on'"/>
				 <div></div>
		</label>
	</div>
</template>

<script>
export default {
	name: 'Switch',
	model: {
		prop: 'value',
		event: 'change'
	},
	props: {
		name: {
			type: String,
			default: ''
		},
		value: {
			type: String,
			default:'default'
		}
	},
	methods: {
		handleChange(e) {
      this.$emit('change', e.target.value);
		}
	}
}
</script>
<style lang="less" scoped>
.switch{
	  display: inline-flex;
    background: #dcdfe6;
    border-radius: 10px;
    width: 50px;
    height: 25px;
		line-height: 25px;
		vertical-align: middle;
		&-off,&-on,&-default{
			width: 0;
			height: 25px;
			line-height: 25px;
			flex: 1 1 auto;
			input, div{
				height: 25px;
			  line-height: 25px;
			}
		}
}
</style>