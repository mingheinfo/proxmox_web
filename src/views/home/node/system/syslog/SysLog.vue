<template>
  <page-template>
    <div slot="toolbar-left" style="flex: 2 1 auto;">
      <span class="tab" @click="changeTab">
        <span
          class="tab-item"
          :class="{ 'is-active': livemode }"
          type="livemode"
          >Live模式</span
        >
        <span class="tab-item" :class="{ 'is-active': !livemode }" type="time"
          >选择时间范围</span
        >
      </span>
      <m-input prop="expire" labelWidth="60px" label="选择日期" style="vertical-align: top;" :__conStyle="{width: '355px'}">
        <template slot="other">
          <el-date-picker
            v-model="datetime"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
						:disabled="livemode"
          >
          </el-date-picker>
        </template>
      </m-input>
			<m-button type="primary" style="vertical-align: middle;" @on-click="handleUpdate()" icon="el-icon-refresh" :disabled="livemode">更新</m-button>
    </div>
    <div slot="page-content">
      <ace-editor
        v-model="hostContent"
        :read-only="true"
        ref="ace-editor"
      ></ace-editor>
    </div>
  </page-template>
</template>
<script>
import AceEditor from "@src/components/ace/AceEditor";
import NodeSystemLogHttp from "@view/home/node/system/syslog/http";
import PageTemplate from "@src/components/page/PageTemplate";
import { dateFormat } from '@libs/utils/index';
export default {
  name: "NodeSystemLog",
  mixins: [NodeSystemLogHttp],
  data() {
    return {
      hostContent: "",
      oldContent: "",
      startcursor: "",
      endcursor: "",
			livemode: true,
			ele: null,
      datetime: [
        dateFormat(
          new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd hh:mm:ss"
        ),
        dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
      ]
    };
  },
  components: {
    AceEditor,
    PageTemplate,
  },
  mounted() {
    let _this = this;
    _this.__init__();
    _this.$refs[`ace-editor`].$el.style.height =
      _this.$el.parentElement.clientHeight - 100 + "px";
    window.addEventListener("resize", _this.updateAceEditorHeight, false);
    this.ele = document.querySelector(".ace_scrollbar ");
    this.ele.addEventListener("scroll", _this.updateSysLog, false);
  },
  methods: {
    __init__() {
      let _this = this;
      _this
        .querySysLog({ _dc: new Date().getTime(), lastentries: 500 })
        .then((res) => {
          _this.hostContent = res.join("\n");
        });
    },
    setUpdateCursor(lines) {
      let newend = lines.shift(),
        newstart = lines.pop();
      if (this.livemode) {
        if (!this.isTop() || !this.startcursor) {
          this.startcursor = newstart;
        }
        if (this.isTop() || !this.endcursor) {
          this.endcursor = newend;
        }
      }
    },
    updateSysLog() {
			let _this = this;
			if(!_this.livemode) return;
      if (this.isTop()) {
        _this
          .querySysLog({
            _dc: new Date().getTime(),
            endcursor: this.endcursor,
            lastentries: 500,
          })
          .then((res) => {
            _this.hostContent = res.join("\n") + _this.hostContent;
          });
      } else if (this.isBoottom()) {
        _this
          .querySysLog({
            _dc: new Date().getTime(),
            startcursor: this.startcursor,
          })
          .then((res) => {
            _this.hostContent = _this.hostContent + res.join("\n");
          });
      }
		},
		handleUpdate() {
			let _this = this;
			 _this
				.querySysLog({ _dc: new Date().getTime(), since: new Date(this.datetime[0]).getTime() / 1000, until: new Date(this.datetime[1]).getTime() / 1000})
				.then((res) => {
            _this.hostContent = res.join("\n");
        });
		},
    isBoottom() {
      let el = document.querySelector(".ace_scrollbar ");
      return el.clientHeight + el.scrollTop - Math.abs(el.scrollHeight) >= 0;
    },
    isTop() {
      let el = document.querySelector(".ace_scrollbar ");
      return el.scrollTop === 0;
    },
    updateAceEditorHeight() {
      let _this = this;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$el.parentElement.clientHeight - 100 + "px";
    },
    changeTab(e) {
			this.livemode = e.target.innerText === "Live模式";
			if(this.livemode) {
         this.__init__();
			} else {
				this.handleUpdate();
			}
    },
  },
  beforeDestroy() {
    this.ele.removeEventListener("scroll", this.updateSysLog, false);
    window.removeEventListener("resize", this.updateAceEditorHeight, false);
  },
};
</script>

<style scoped lang="less">
.tab {
  display: inline-flex;
  flex-grow: 1;
  border: 1px solid #409eff;
  border-radius: 2px;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  &-item {
    flex: 1 1 auto;
    padding: 0px 10px;
  }
}
.is-active {
  color: #fff;
  background: #409eff;
}
/deep/.tool-bar-left{
  width: auto;
}
</style>