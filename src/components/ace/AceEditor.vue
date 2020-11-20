<template>
  <div class="ace-container">
    <!-- 官方文档中使用 id，这里禁止使用，在后期打包后容易出现问题，使用 ref 或者 DOM 就行 -->
    <div class="ace-editor" ref="ace"></div>
  </div>
</template>
<script>
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver' 
import 'ace-builds/src-noconflict/theme-monokai' // 默认设置的主题
import 'ace-builds/src-noconflict/mode-javascript' // 默认设置的语言模式
import 'ace-builds/src-min-noconflict/theme-dracula'
// 支持代码格式， 需要引入具体的语法高亮库才会有对应的语法高亮效果
import 'ace-builds/src-min-noconflict/mode-javascript'
import 'ace-builds/src-min-noconflict/mode-json'
import 'ace-builds/src-min-noconflict/mode-css'
// import 'ace-builds/src-min-noconflict/ext-language_tools'
// import jsWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-javascript'
// import jsonWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-json'
// import cssWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-css'
// ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl)
// ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl)
// ace.config.setModuleUrl('ace/mode/css_worker', cssWorkerUrl)
// ace.config.setModuleUrl(
//   'ace/snippets/javascript',
//   require('file-loader!ace-builds/src-noconflict/snippets/javascript.js')
// )
// ace.config.setModuleUrl('ace/snippets/css', require('file-loader!ace-builds/src-noconflict/snippets/css.js'))

export default {
  name: 'AceEditor',
  props: {
    value: {
      type: String,
      required: true
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'javascript'
    },
    // 主题，对应主题库 JS 需要提前引入
    theme: {
      tyle: String,
      default: 'monokai'
    },
    // 最大行数
    maxLines: Number,
    // 是否显示全屏按钮
    withFullscreenBtn: {
      type: Boolean,
      default: false
    },
    withFooterBtns: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  mounted() {
    this.aceEditor = ace.edit(this.$refs.ace, {
        mode: `ace/mode/${this.language}`,
        theme: `ace/theme/${this.theme}`,
        fontSize: 12,
        tabSize: 2,
        value: this.value,
        selectionStyle: 'text',
        autoScrollEditorIntoView: false,
        maxLines: this.maxLines,
        readOnly: this.readOnly,
        fontFamily: 'Courier New,Courier,Microsoft Yahei',
    })
    this.aceEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        wrap: true,
        setShowPrintMargin: false
    })
    this.aceEditor.session.setMode('ace/mode/text')
    this.aceEditor.setShowPrintMargin(false);
    this.aceEditor.addEventListener('input', this.handleChange, false);
  },
  methods: {
    handleChange() {
      this.$emit('change', this.aceEditor.getValue());
    }
  },
  beforeDestroy() {
    this.aceEditor.removeEventListener('input', this.handleChange, false);
  },
  data() {
    return {
      aceEditor: null,
    }
  },
  watch: {
    value(newVal) {
      if(this.aceEditor.getValue() !== newVal) {
         this.aceEditor.setValue(newVal);
         this.aceEditor.clearSelection();
         this.aceEditor.resize(true)
      }
    },
    theme(newVal) {
      if(this.aceEditor.getTheme() !== newVal) {
         this.aceEditor.setTheme(`ace/theme/${newVal}`);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ace-editor{
  height: 100%!important;
}
.ace-container{
  height: 100%;
  /deep/.ace_content{
    height: 100%!important;
  }
}
</style>