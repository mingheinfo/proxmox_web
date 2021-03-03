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
  }

  info(options) {
    const vm = new VueComponent().$mount();
    Object.assign(vm,defaultOptions , options,{
      type:'info'
    });
    if (isVNode(vm.msg)) {
      vm.$slots.default = [vm.msg];
      vm.msg = null;
    } else {
      delete vm.$slots.default;
    }
    this.idList.push(vm._uid);
    document.body.appendChild(vm.$el);
    document.body.classList.toggle('hidden');
    return vm.confirm();
  }

  warning(options) {
    const vm = new VueComponent().$mount();
    Object.assign(vm,defaultOptions , options,{
      type:'warning'
    });
    if (isVNode(vm.msg)) {
      vm.$slots.default = [vm.msg];
      vm.msg = null;
    } else {
      delete vm.$slots.default;
    }
    this.idList.push(vm._uid);
    document.body.appendChild(vm.$el);
    document.body.classList.toggle('hidden');
    return vm.confirm();
  }

  confirm(options) {
    /**
     * 实例化组件
     * **/
    const vm = new VueComponent().$mount();
    //合并所有选项
    Object.assign(vm,defaultOptions , options,{
      type:'confirm'
    });
    //如果是虚拟dom节点的话默认将信息复制给插槽
    if (isVNode(vm.msg)) {
      vm.$slots.default = [vm.msg];
      vm.msg = null;
    } else {
      delete vm.$slots.default;
    }
    this.idList.push(vm._uid);
    document.body.appendChild(vm.$el);
    document.body.classList.toggle('hidden');
    //调用confirm方法
    return vm.confirm();
  }

  error(options) {
    const vm = new VueComponent().$mount();
    Object.assign(vm,defaultOptions , options,{
      type:'error'
    });
    if (isVNode(vm.msg)) {
      vm.$slots.default = [vm.msg];
      vm.msg = null;
    } else {
      delete vm.$slots.default;
    }
    this.idList.push(vm._uid);
    document.body.appendChild(vm.$el);
    document.body.classList.toggle('hidden');
    return vm.confirm();
  }

  alert(options) {
    const vm = new VueComponent().$mount();
    Object.assign(vm,defaultOptions , options,{
      type:'alert'
    });
    if (isVNode(vm.msg)) {
      vm.$slots.default = [vm.msg];
      vm.msg = null;
    } else {
      delete vm.$slots.default;
    }
    this.idList.push(vm._uid);
    document.body.appendChild(vm.$el);
    document.body.classList.toggle('hidden');
    return vm.confirm();
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
