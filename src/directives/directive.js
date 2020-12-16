var scope;
class Directive {
	constructor(props) {
		this.name = name;
		scope = this;
	}
	//对应vue的upate Hooks
	update(el, binding, vnode) {
		scope.handleConfirm(el, binding, vnode);
	}
	handleConfirm(el, binding, vNode) {
		let value    = binding.value,//绑定的值
			  name     = binding.name,//自定义指令名称
			  vnode    = vNode,//虚拟dom树
				oldValue = binding.oldValue;
				vm.$nextTick(() => {
					if(el.ariaDisabled) {
						el.onclick = null;
						return;
					};
					if (name === 'confirm' && value && !el.ariaDisabled) {
						 if(value.msg) {
								el.onclick = () => {
									//如果是对象的时候触发
									if (value instanceof Object) {
										vm.$confirm[value.type ? value.type : 'confirm']({ 
											msg: value.msg ? value.msg : '', 
											icon: value.icon ? value.icon : 'icon-question', 
											title: value.title ? value.title: '提示'
										 })
											.then(() => {
												value.ok();
											}).catch(() => {
												if (value.cancel)
													value.cancel();
											});
										} 
								}
						 }
						}
						 let val = Object.prototype.toString.call(value)
						 if(val === '[object String]' && el.ariaDisabled) {
								//如果是String类型的时候触发
								let val = Object.prototype.toString.call(value);
								if (val === '[object String]') {
									vm.$confirm.info({
										msg: value,
										icon: 'icon-warning',
									}).then(() => {
										value.ok();
									}).catch(() => {
										if (value.cancel)
											value.cancel();
									});
								}
			  	}
				})
	}
	//对应vue的mounted Hooks
	bind(el, binding, vNode) {
		scope.handleConfirm(el, binding, vNode);
	}

	//对应vue的created Hooks
	insert() {

	}
	//解绑对应destoryed Hooks
	unbind(el, binding, vNode) {
		let value = binding.value,//绑定的值
			name = binding.name,//自定义指令名称
			vnode = vNode;//虚拟dom树
		if (name === 'confirm') {
			el.onclick = null;
		}
	}
}

export default new Directive();