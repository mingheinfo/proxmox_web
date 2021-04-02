<template>
  <!-- 官方文档中使用 id，这里禁止使用，在后期打包后容易出现问题，使用 ref 或者 DOM 就行 -->
  <div class="ace-editor" ref="ace" style="height: 500px;"></div>
</template>
<script>
import ace from 'ace-builds';
//import 'ace-builds/webpack-resolver';
import  'ace-builds/src-noconflict/theme-chrome';

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
      default: 'chrome'
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
    //ace编辑器中的初始化
    this.aceEditor = ace.edit(this.$refs.ace, {
        // mode: `ace/mode/${this.language}`,
        // theme: `ace/theme/${this.theme}`,
        fontSize: 12,
        tabSize: 2,
        value: this.value,//ace中的值
        selectionStyle: 'text',
        //autoScrollEditorIntoView: true,
        maxLines: this.maxLines,
        readOnly: this.readOnly,//是否是只读
        fontFamily: 'Courier New,Courier,Microsoft Yahei',//字体
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
    //监听input事件处理实时变化
    this.aceEditor.addEventListener('input', this.handleChange, false);
  },
  methods: {
    handleChange() {
      this.$emit('change', this.aceEditor.getValue());
    }
  },
  beforeDestroy() {
     //清除监听
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
    }
  }
}
</script>

<style lang="less" scoped>
.ace_content{
  min-height: 300px;
}
</style>