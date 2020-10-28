<template>
  <div class="option-item"
       :class="{'disabled': disabled}">
    <div v-show="Select.type !== 'multiple'"  @mousedown.stop="handleClick">
      <span v-if="icon" :class="['icon', icon]"></span>
      <base-icon v-if="name" :class="['icon']" :name="name" :_style="{width: '16px', 'height': '16px'}"></base-icon>
     <template>
			 <div class="option-item__content" :class="{'option-item__selected': Select.selectValues === value}"  @blur.stop="Select.handleBlur">
				  <template v-if="$slots['default']">
            <slot></slot>
          </template>
          <template v-else>{{label}}</template>
			</div>
		 </template>
    </div>
    <div v-show="Select.type === 'multiple'"  @click.stop="handleClick">
      <span v-if="icon" :class="['icon', icon]"></span>
    <base-icon v-if="name" :class="['icon']" :name="name" :_style="{width: '16px', 'height': '16px'}"></base-icon>
		 <template>
				<label class="option-item__checkbox">
           <input type="checkbox" v-model="isChecked"/>
           <div></div>
        </label>
				<div class="option-item__content" :class="{'option-item__selected': isChecked}">
			   <template v-if="$slots['default']">
            <slot></slot>
          </template>
          <template v-else>{{label}}</template>
			 </div>
			</template>
    </div>
  </div>
</template>

<script>
  import { stopEvent } from "@libs/utils";
  import BaseIcon from "../icon/BaseIcon";

  export default {
    name: "Option",
    components: {BaseIcon},
    inject: {
      Select: { default: "Select" }
		},
		data() {
			return {
				isChecked: false
			}
		},
    props: {
      icon: String,
      value: String | Number | Object,
      disabled: Boolean,
      divided: Boolean,
			name: String,
			label: String
    },
    created() {
      this.Select.cachedOptions.push({value: this.value, label: this.label});
    },
    methods: {
      //点击下拉框时触发的时间
      handleClick(e) {
        if(!this.disabled){
					this.isChecked = !this.isChecked;
          this.Select.handleChange('on-change', this.value,this.isChecked);
				}
      },
      setChecked(newVal) {
       if(newVal.includes(this.value)) {
							this.isChecked = true;
					}
      },
      setSelectValuesChecked(newVal){
        if(newVal.includes(this.value)) {
							this.isChecked = true;
					}else {
            	this.isChecked = false;
          }
      }
		},
		watch: {
			'Select.value': function(newVal, oldVal) {
          this.setChecked(newVal);
			},
			'Select.selectValues': {
        deep: true,
        immediate: true,
        handler: function(newVal, oldVal) {
          this.setSelectValuesChecked(newVal);
        }
      }
		}
  }
</script>

<style scoped lang="less">
  .option-item {
    padding: 0px 10px;
    position: relative;
    min-height: 30px;
    //line-height: 30px;
    background: #fff;
    cursor: pointer;
    text-align: left;
    &:hover {
      color: #7fdbff;
		}
		&__selected{
			color: #3973ff;
		}
		&__content{
			display: inline-block;
			vertical-align: middle;
			min-height: 30px;
      line-height: 30px;
      margin: 5px 10px;
		}
		&__checkbox{
			padding-right: 10px;
    input[type="checkbox"] {
      display: none;
    }
    div{
      position: relative;
      width: 15px;
			height: 15px;
			line-height: 15px;
			display: inline-block;
			vertical-align: middle;
    }
    input[type="checkbox"] + div::after{
      content: '';
      width: 15px;
      height: 15px;
      background: #fff;
      border: 1px solid #c4d6ec;
      display: inline-block;
    }
    input[type="checkbox"]:checked + div::before{
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
    input[type="checkbox"]:checked+div:after {
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
</style>