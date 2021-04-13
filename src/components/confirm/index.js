import { isVNode } from 'element-ui/src/utils/vdom';
import Vue from 'vue'
import message from './Confirm.vue'
function isvNode(node) {
  return node !== null && typeof node === 'object' && Object.prototype.hasOwnProperty(node, 'componentOptions');
}
const VueComponent = Vue.extend(message);
let init = false;
let defaultOptions = {
  yesBtnText: '确定',
  noBtnText: '取消'
};

class Confirm {
  constructor(options) {
    this.idList = [];
    this.vm = new VueComponent().$mount();
  }

  info(options) {
    Object.assign(this.vm,defaultOptions , options,{
      type:'info'
    });
    if (isVNode(this.vm.msg)) {
      this.vm.$slots.default = [this.vm.msg];
      this.vm.msg = null;
    } else {
      delete this.vm.$slots.default;
    }
    this.idList.push(this.vm._uid);
    document.body.appendChild(this.vm.$el);
    document.body.classList.toggle('hidden');
    return this.vm.confirm();
  }

  warning(options) {
    Object.assign(this.vm,defaultOptions , options,{
      type:'warning'
    });
    if (isVNode(this.vm.msg)) {
      this.vm.$slots.default = [this.vm.msg];
      this.vm.msg = null;
    } else {
      delete this.vm.$slots.default;
    }
    this.idList.push(this.vm._uid);
    document.body.appendChild(this.vm.$el);
    document.body.classList.toggle('hidden');
    return this.vm.confirm();
  }

  confirm(options) {
    debugger;
    /**
     * 实例化组件
     * **/
    //const vm = new VueComponent().$mount();
    //合并所有选项
    Object.assign(this.vm,defaultOptions , options,{
      type:'confirm'
    });
    //如果是虚拟dom节点的话默认将信息复制给插槽
    if (isVNode(this.vm.msg)) {
      this.vm.$slots.default = [this.vm.msg];
      this.vm.msg = null;
    } else {
      delete this.vm.$slots.default;
    }
    this.idList.push(this.vm._uid);
    document.body.appendChild(this.vm.$el);
    document.body.classList.toggle('hidden');
    //调用confirm方法
    return this.vm.confirm();
  }

  error(options) {
    Object.assign(this.vm,defaultOptions , options,{
      type:'error'
    });
    if (isVNode(this.vm.msg)) {
      this.vm.$slots.default = [this.vm.msg];
      this.vm.msg = null;
    } else {
      delete this.vm.$slots.default;
    }
    this.idList.push(this.vm._uid);
    document.body.appendChild(this.vm.$el);
    document.body.classList.toggle('hidden');
    return this.vm.confirm();
  }

  alert(options) {
    Object.assign(this.vm,defaultOptions , options,{
      type:'alert'
    });
    if (isVNode(this.vm.msg)) {
      this.vm.$slots.default = [this.vm.msg];
      this.vm.msg = null;
    } else {
      delete this.vm.$slots.default;
    }
    this.idList.push(this.vm._uid);
    document.body.appendChild(this.vm.$el);
    document.body.classList.toggle('hidden');
    return this.vm.confirm();
  }

  close() {
    setTimeout(() => {
      document.body.removeChild(document.querySelector(`[data-id='${this.idList.pop()}']`));
      document.body.classList.toggle('hidden');
    },500)
  }

  closeAll() {
    setTimeout(() => {
      this.idList.forEach(id => {
        document.body.removeChild(document.querySelector(`[data-id='${id}']`));
        document.body.classList.toggle('hidden');
      })
    },500)
  }
}
// function confirm (options) {
//   Object.assign(vm,defaultOptions , options,{
//     type:'confirm'
//   });
//
//   if (!init) {
//     document.body.appendChild(vm.$el);
//     init = true;
//   }
//
//   return vm.confirm();
// };
//
// confirm.prototype.info = function(options) {
//   Object.assign(vm,defaultOptions , options,{
//     type:'info'
//   });
//
//   if (!init) {
//     document.body.appendChild(vm.$el);
//     init = true;
//   }
//
//   return vm.confirm();
// }

export default Confirm;
