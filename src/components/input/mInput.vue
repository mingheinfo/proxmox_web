<template>
	 <div class="m-input">
		 <label class="m-input__label" :style="{width: labelWidth}">{{label}}</label>
		 <div class="m-input__container clearfix" :class="{'m-input__error': showError}">
			  <div class="prefix" v-if="prefixIcon || $slots['prefix']">
					<slot name="prefix"></slot>
				</div>
			  <input :type="showPassword ? 'text' : type" 
		        :value="value"
						@input.stop="handleInput"
						@change.stop="handleChange"
						v-if="type !== 'textarea' && !$slots['other']"
						:style="__style"
						:placeholder="placeholder"
						:min="min"
						:max="max"
						:disabled="disabled"
						:readonly="readonly"
						class="m-input__inner"/>
				<slot v-else-if="$slots['other']" name="other"></slot>
				<textarea v-else 
			          :value="value"
								@input.stop="handleInput"
						    @change.stop="handleChange"
								:placeholder="placeholder"
								:disabled="disabled"
								:readonly="readonly"
								:style="__style"
								:rows="rows"
								class="m-input__textarea"/>
				<div class="suffix" v-if="suffixIcon">
					<i :class="suffixIcon"></i>
				</div>
				<div class="suffix" v-if="$slots['suffix']">
					<slot name="suffix"></slot>
				</div>
				<div class="suffix" v-if="clearable">
					<i class="el-icon-circle-close m-input__clear" @click="clear"></i>
				</div>
				<div class="error-message" v-show="showError">
					{{errorMsg}}
				</div>
		 </div>
	 </div>
</template>
<script>
import { getEvent } from '@libs/utils/'
export default {
	name: 'MInput',
	props: {
		label: String,
		labelWidth: {
			type: String
		},
		type: {
			type: String,
			default: 'text'
		},
		placeholder: {
			type: String,
			default: ''
		},
		value: {
			type: [String, Number]
		},
		minLength: [String, Number],
		maxLenght: [String, Number],
		showPassword: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		prefixIcon: {
			type: String,
		},
		suffixIcon: {
			type: String,
		},
		validateEvent: {
			type: Boolean,
			default: false
		},
		errorMsg: {
			type: String,
			default: ''
		},
		prop: {
			type: [String]
		},
		showError: {
			type: Boolean,
			default: false
		},
		_style: {
			type: Object
		},
		rows: {
			type: [String, Number],
			validator: function(value) {
				if(!/\d/.test(String(value))) {
					throw Error(`rows is invalid!`);
					return false;
				}
				return true;
			}
		},
		clearable: {
			type: Boolean,
			default: false
		},
		readonly: {
			type: Boolean,
			default: false
		},
		min: {
			type: [Number, String],
			validator: (value) => {
				if(!/\d/.test(String(value))) {
					throw Error(`min is a number!`);
					return false;
				} else {
					return true;
				}
			}
		},
		max: {
		type: [Number, String],
			validator: (value) => {
				if(!/\d/.test(String(value))) {
					throw Error(`max is a number!`);
					return false;
				} else {
					return true;
				}
			}
		}
	},
	computed: {
		__style() {
			  if(this.type==='number')
				   return Object.assign({padding: '0 10px 0px 10px'}, this._style)
				else  
				return this._style
		}
	},
	methods: {
		  handleInput(event) {
				let ev = getEvent(event),
				value = ev.target.value || ev.srcElement.value;
				this.$emit('input', value);
				if(this.validateEvent) {
					this.$emit('validate', this.prop);
				}
      },
      handleChange(event) {
				let ev = getEvent(event),
				value = ev.target.value || ev.srcElement.value;
        this.$emit('change', value);
      },
		clear() {
      this.$emit('input', '');
      this.$emit('change', '');
      this.$emit('clear');
    },
	}
}
</script>
<style scoped lang="less">
  .suffix {
		color: #575d6c;
    -moz-transition: color .15s;
    -webkit-transition: color .15s;
    -ms-transition: color .15s;
    -o-transition: color .15s;
    transition: color .15s;
    width: 34px;
    border-radius: 0 3px 3px 0;
    height: 100%;
    float: right;
    text-align: center;
		font-size: 14px;
		position: absolute;
		right: 0px;
	}

	.m-input {
		padding: 0px 10px;
		display: inline-block;
		padding-bottom: 15px;
		position: relative;
		&__label {
			display: inline-block;
			vertical-align: middle;
      max-width: 100%;
      margin-bottom: 5px;
      font-weight: 400;
		}
		&__container{
			position: relative;
      border: 1px solid #adb0b8;
      -moz-transition: border-color .15s;
      -webkit-transition: border-color .15s;
      -ms-transition: border-color .15s;
      -o-transition: border-color .15s;
      transition: border-color .15s;
      border-radius: 2px;
      min-width: 200px;
      min-height: 28px;
      line-height: normal;
      display: inline-block;
      vertical-align: middle;
      text-align: left;
      background-color: #fff;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      -ms-box-sizing: border-box;
      box-sizing: border-box;
      cursor: pointer
		}
		&__inner{
			height: 26px;
			line-height: 26px;
      margin-top: 1px;
      width: calc(100%);
      color: #252b3a;
      box-sizing: border-box;
      border: none;
      float: left;
      background-color: #fff;
      padding: 0 25px 0px 10px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      border-radius: 3px;
      text-decoration: none;
			outline: none;
		}
		&__textarea{
			height: calc(100% - 2px);
      margin-top: 1px;
      width: 100%;
      color: #252b3a;
      box-sizing: border-box;
      border: none;
      float: left;
      background-color: #fff;
      padding: 0 0px 0px 10px;
      overflow: auto;
      white-space: normal;
      border-radius: 3px;
      text-decoration: none;
			outline: none;
			max-width: 100%;
		}
		&__error{
			border: 1px solid #ec4242;
		}
    &__clear{
			height: 28px;
			line-height: 28px;
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
	input:disabled{
		background: #dde4ed;
	}
</style>