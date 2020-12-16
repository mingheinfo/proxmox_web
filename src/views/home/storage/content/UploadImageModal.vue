<template>
  <Dialog
    :visible="visible"
    @cancel="close"
    @confirm="confirm"
    :title="title"
    :_style="{ width: '956px' }"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px">
      <div class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-select
                prop="content"
                label="内容"
                labelWidth="100px"
                @on-change="handleContentSelect"
                v-model="content"
								validateEvent
								@validate="validate"
								:error-msg="rules['content'].message"
								:show-error="rules['content'].error"
                :readonly="false"
                :disabled="status === 'uploading'"
                placeholder="请选择磁盘"
              >
                <m-option
                  v-for="(item) in contentItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>
              <div class="upload-file">
								 <m-input
										type="text"
										prop="filename"
										v-model="filename"
										validateEvent
										@validate="validate"
										:error-msg="rules['filename'].message"
										:show-error="rules['filename'].error"
										:placeholder="'请输入名称'"
                    :disabled="status === 'uploading'"
									/>
							   <m-button type="primary" class="upload-btn">
									 <input class="file-input" type="file" accept='.img, .iso' value="选择文件" ref="file" :disabled="status === 'uploading'" @change="fileChange"/>
									 选择文件
								 </m-button>
							</div>
              <LinePercentChart :value="(percentComplete * 100).toFixed(2)" :title="text"></LinePercentChart>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <template slot="footer">
      <m-button class="create-btn" type="primary" @on-click="pause()"
                :disabled="status !== 'uploading'"
        >暂停</m-button
      >
       <m-button class="create-btn" 
                 type="primary"
                 @on-click="confirm()"
                 :disabled="status === 'uploading'"
        >上传</m-button
      >
    </template>
  </Dialog>
</template>

<script>
import Dialog from "@src/components/dialog/Dialog";
import StorageContentHttp from "@src/views/home/storage/content/http";
import {byteToSize, uplodFile, getFileUrl} from "@libs/utils/index";
import LinePercentChart from '@src/components/chart/line/LineCharts';
import { PORTOCOLIST } from "@libs/enum/enum";
import { gettext } from '@src/i18n/local_zhCN.js';
export default {
  name: "CreateVolumeModal",
  mixins: [StorageContentHttp],
  components: {
    Dialog,
    LinePercentChart
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    contents: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
			content: 'iso',
      filename: '',
      text: '',
      percentComplete: 0,
      xhr: null,
      status: 'init',
			contentItems: [],
      rules: {
        content: {
          error: false,
          message: "",
				},
				filename: {
					error: false,
          message: "",
				}
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    // //请求磁盘
    async __init__() {
      let _this = this;
      this.contentItems = this.contents.map(item => {
        if(item === 'iso') {
          return {
            	label: 'ISO镜像',
					    value: 'iso'
          }
        } 
        if(item === 'vztmpl') {
          return {
            label: '容器模板',
            value: 'vztmpl'
				  }
        }
      })
      //this.queryListNodeDiskList({type: 'unused'});
		},
		//选择磁盘
    handleContentSelect(value) {
      this.content = value;
		},
		//关闭弹框
    close() {
      this.$emit("close");
		},
		//校验表单
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
		},
		//整体校验表单
    validateAll() {
      let props = ['name', 'device'];
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		//确定添加
    confirm() {
			let file = this.$refs.file.files[0];
      if(!/(\.(iso|img))$/.test(file.name)) {
				this.rules['filename'].error = true;
				this.rules['filename'].message = '文件格式必须为.iso或者img';
			} else {
				this.rules['filename'].error = false;
				this.rules['filename'].message = '';
			}
			   var fd = new FormData();
			   fd.append("content",  this.content);
         fd.append("filename", file);
         this.status = 'uploading';
         this.uploadImage(fd, this.uploadCallback)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.status = 'init';
            this.$confirm
              .info({
                msg: res,
              })
							.then(() => this.close());
				})
    },
    //上传文件回调
		uploadCallback(e, xhr, bytes) {
      this.xhr = xhr;
      console.log(e);
      if(e.type === 'load') {
				 if (xhr.status == 200) {
		     	this.close();
		    } else {
			   let msg = gettext('Error') + " " + xhr.status.toString() + ": " + xhr.statusText;
			  if (xhr.responseText !== "") {
			    let result = xhr.responseText;
			    result.message = msg;
			  }
		  	  this.$confirm.alert({msg: gettext('Error') + msg});
		    }
			} else if(e.type === 'error') {
		    let msg = "Error " + e.target.status.toString() + " occurred while receiving the document.";
		   this.$confirm.alert({msg: gettext('Error') + msg});
			} else {
				  this.percentComplete = e.loaded / e.total;
		   	  this.text = (this.percentComplete * 100).toFixed(2) + '%';
	       if (bytes) {
		      this.text += " (" + byteToSize(bytes) + ')';
         }
			}
    },
    //上传前读取文件路径
    fileChange() {
      this.filename =  this.$refs.file.value;
      let file = this.$refs.file.files[0];
      if(!/(\.(iso|img))$/.test(file.name)) {
				this.rules['filename'].error = true;
				this.rules['filename'].message = '文件格式必须为.iso或者img';
			} else {
				this.rules['filename'].error = false;
				this.rules['filename'].message = '';
			}
    },
    //暂停
    pause() {
      this.xhr.abort();
      this.close();
    }
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) setTimeout(() => this.__init__(), 0);
        return newVal;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}
.upload-file{
	display: inline-flex;
}
.file-input{
	width: 100%;
	height:100%;
	opacity: 0;
	position: absolute;
	left:0px;
	top: 0px;
}
.upload-btn{
    position: relative;
    margin-left: -10px;
    border-left: none;
    border-top-left-radius: 0px;
		border-bottom-left-radius: 0px;
		height: 29px;
		line-height: 29px;
}
</style>