<template>
  <div class="ceph-log">
      <ace-editor v-model="logContent"
                  ref="ace-editor"
                  :read-only="false"/>
  </div>
</template>

<script>
  import AceEditor from "@src/components/ace/AceEditor";
  import CephHttp from '@src/views/home/node/ceph/http';
  export default {
    name: "Log",
    mixins: [CephHttp],
    components: {AceEditor},
    data() {
      return {
        logContent: '',
        start: 0
      }
    },
    mounted() {
      let _this = this;
      this.__init__();
      debugger;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$el.parentElement.clientHeight - 40 + "px";
      window.addEventListener("resize", _this.updateAceEditorHeight, false);
      this.ele = document.querySelector(".ace_scrollbar ");
      this.ele.addEventListener("scroll", _this.updateSysLog, false);
    },
    methods: {
      __init__() {
        this.queryCephLog({
          _dc: new Date().getTime(),
          start: this.start,
          limit: 500
        })
          .then(res => {
            this.logContent = res.map(item => item.t).join('\n');
            let nList = res.map(item => item.n);
            this.start = Math.max(...nList)
          });
      },
      updateAceEditorHeight() {
        let _this = this;
        _this.$refs[`ace-editor`].$el.style.height =
          _this.$el.parentElement.clientHeight - 40 + "px";
      },
      isBoottom() {
        let el = document.querySelector(".ace_scrollbar ");
        return el.clientHeight + el.scrollTop - Math.abs(el.scrollHeight) >= 0;
      },
      isTop() {
        let el = document.querySelector(".ace_scrollbar ");
        return el.scrollTop === 0;
      },
      updateSysLog() {
        let _this = this;
        if (this.isBoottom()) {
          _this
            .queryCephLog({
              _dc: new Date().getTime(),
              start: this.start,
              limit: 500
            })
            .then((res) => {
              _this.logContent = _this.logContent + res.map(item => item.t).join('\n');
              let nList = res.map(item => item.n);
              this.start = Math.max(...nList)
            });
        }
      },
    },
    beforeDestroy() {
      this.ele.removeEventListener("scroll", this.updateSysLog, false);
      window.removeEventListener("resize", this.updateAceEditorHeight, false);
    },
  }
</script>

<style scoped lang="less">
 .ceph-log{
   padding: 20px;
 }
</style>
