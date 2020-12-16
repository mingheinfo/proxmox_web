<template>
	<m-dialog :visible="visible"
	          @close="close"
						@cancel="close"
						title="修改密码"
						@confirm="confirm">
	  <template slot="content">
			<div class="modify-form">
				<m-input label="密码"
				         labelWidth="100px"
								 v-model="password"
								 prop="password"
								 type="password"
								 validateEvent
								 @validate="validate"
								 :show-error="rules['password'].error"
								 placeholder="请输入密码"
								 :error-msg="rules['password'].message"/>
				<m-input label="确认密码"
				         labelWidth="100px"
								 v-model="confirmPsw"
								 type="password"
								 prop="confirmPsw"
								 validateEvent
								 @validate="validate"
								 placeholder="请确认密码"
								 :show-error="rules['confirmPsw'].error"
								 :error-msg="rules['confirmPsw'].message"/>
			</div>
		</template>
	</m-dialog>
</template>

<script>
import HeaderHttp from './Http';
export default {
	name: 'ModifyPswModal',
	mixins: [HeaderHttp],
	/**
	 * porps 父组件所传属性
	*/
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		modalType: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		}
	},
	data() {
		return  {
			password: '',
			confirmPsw: '',
			rules: {
				password: {
					message: '',
					error: false
				},
				confirmPsw: {
					message: '',
					error: false
				}
			}
		}
	},
	methods: {
		/**
		 * 单个校验
		*/
    validate(prop) {
			let value = String(this[prop]).trim();
			this.rules[prop].error = false;
					this.rules[prop].message = '';
			if(/^\s*$/.test(value)) {
				this.rules[prop].error = true;
				this.rules[prop].message = '不能为空!';
				return;
			}
			if(value && prop=== 'confirmPsw' && this.password) {
				if(value !== this.password) {
					this.rules[prop].error = true;
					this.rules[prop].message = '两次输入密码不一致!';
					return;
				}
			}
		},
		/**
		 * 整体校验
		*/
		validateAll() {
			let props = ['password', 'confirmPsw'];
			props.forEach(prop => this.validate(prop));
			return props.some(prop => this.rules[prop].error === true);
		},
		/**
		 * 关闭弹框
		*/
		close() {
      this.$emit('close');
		},
		/**
		 * 确认修改
		*/
		confirm() {
			if(this.validateAll()) return;
			    //获取数据中心名称
      let ticket = window.localStorage.getItem('ticket') || '{}',
      tic = JSON.parse(ticket);
			let param = {
				 password: this.password,
				 userid: tic.username
			}
			this.updatePsw(param)
			    .then(res => {
						this.close();
					}).catch(res => {
						this.$confirm.error({
							msg: res,
							icon: 'icon-warning'
						})
					})
		}
	}
}
</script>

<style lang="less" scoped>
.modify-form{
	margin: 0 auto;
  width: 325px;
  margin-top: 45px;
}
</style>