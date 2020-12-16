<template>
  <m-dialog
    title="添加磁盘"
    :visible="visible"
		v-if="visible"
    @confirm="confirm"
    @cancel="close"
    :_style="{
      width: '946px'
    }"
    @close="close"
  >
    <div slot="content" style="max-height: 400px; overflow: auto;">
      <div class="m-form__section">
        <dl>
          <dt>基本信息</dt>
          <dd>
            <m-input
              type="number"
              label="总线"
              v-model="deviceIndex"
              labelWidth="100px"
              min="0"
              prop="deviceIndex"
              :_style="{ paddingLeft: '115px' }"
              @validate="validate"
               v-show="isShow()"
              :error-msg="rules['deviceIndex'].message"
              :show-error="rules['deviceIndex'].error"
            >
              <div
                slot="prefix"
                style="
                  display: inline-block;
                  position: absolute;
                  top: -11px;
                  left: -1px;
                  height: 100%;
                "
              >
                <div
                  class="m-margin-top-10 m-form__select"
                  style="width: 115px"
                >
                  <select
                    class="m-form__select_inner"
                    v-model="device"
                    style="width: 110px"
                  >
                    <option
                      v-for="item of deviceList"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </option>
                  </select>
                </div>
              </div>
            </m-input>
						<m-select
                prop="cache"
                label="缓存"
                labelWidth="100px"
                @on-change="handleCacheSelect"
                v-model="cache"
                :readonly="false"
                v-show="isShow()"
                placeholder="请选缓存"
              >
                <m-option
                  v-for="(item, index) in cacheList"
									:key="index"
                  :value="item.value"
                  :label="item.label"
                >
                </m-option>
              </m-select>
						<m-input
              type="slot"
              v-show="isShow()"
							v-if="device === 'scsi'"
              label="SCSI控制器"
              labelWidth="100px"
							:disabled="true"
            >
						 <div slot="other" class="disabled" style="padding-left: 5px; height: 28px; line-height: 28px;">LSI 53C895A</div>
						</m-input>
            <m-input
              type="number"
              labelWidth="100px"
              label="磁盘大小"
              v-model="disksize"
              validateEvent
              @validate="validate"
              prop="disksize"
              v-show="modalType === 'create'"
              :error-msg="rules['disksize'].message"
              :show-error="rules['disksize'].error"
            />
            <m-input
              type="slot"
              v-show="modalType === 'edit'"
              labelWidth="100px"
              label="磁盘映像"
							:disabled="true"
            >
						 <div slot="other" style="height: 28px; line-height: 28px;padding-left: 5px;" class="disabled">{{editStorage}}</div>
						</m-input>
							<m-checkbox label="丢弃" 
						            v-model="discard"
												labelWidth="100px"
												:disabled="device === 'virtio'"></m-checkbox>
							<m-select
                prop="storage"
                label="存储"
                labelWidth="100px"
                @on-change="handleStorageSelect"
                v-model="storage"
								validateEvent
                 v-show="modalType !== 'edit'"
                @validate="validate"
                :readonly="true"
                placeholder="请选缓存"
              >
								<div class="table">
                  <m-option
										v-for="(item, index) in db.storageList"
										:key="item.storage"
										:value="item.storage"
										:label="item.storage"
									>
								   <div v-if="index === 0" class="table-tr">
										 <div class="table-td">名称</div>
										 <div class="table-td">类别</div>
										 <div class="table-td">可用</div>
										 <div class="table-td">容量</div>
									 </div>
									 <div class="table-tr">
										 <div class="table-td" :title="item.storage">{{item.storage}}</div>
										 <div class="table-td" :title="item.type">{{item.type}}</div>
										 <div class="table-td" :title="byteToSize(item.avail)">{{byteToSize(item.avail)}}</div>
										 <div class="table-td" :title="byteToSize(item.total)">{{byteToSize(item.total)}}</div>
									 </div>
                	</m-option>
								</div>
              </m-select>
						<m-select
                prop="format"
                label="格式"
                labelWidth="100px"
                @on-change="handleFormatSelect"
                v-model="format"
                :readonly="false"
                 v-show="modalType === 'create'"
								:disabled="!storageType || storageType !== 'dir'"
                placeholder="请选格式"
              >
                <m-option
                  v-for="(item, index) in formatList"
									:key="index"
                  :value="item.value"
                  :label="item.label"
                >
                </m-option>
              </m-select>
          </dd>
        </dl>
      </div>		
      <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
        <dt>高级</dt>
        <dd>
          <m-checkbox
            v-model="ssd"
            label="SSD仿真"
            :disabled="device === 'virtio'"
          ></m-checkbox>
          <m-checkbox v-model="backup" label="没有备份"></m-checkbox>
          <m-checkbox
            v-model="iothread"
            label="IO Thread"
            :disabled="!(device === 'scsi' || device === 'virtio')"
          ></m-checkbox>
          <m-checkbox v-model="replicate" label="跳过复制"></m-checkbox>
          <m-input
            label="读取限制(MB/s)"
            labelWidth="110px"
            placeholder="无限"
            type="number"
            v-model="mbps_rd"
            class="m-margin-top-10"
          />
          <m-input
            label="写入限制(MB/s)"
            labelWidth="110px"
            placeholder="无限"
            type="number"
            v-model="mbps_wr"
            class="m-margin-top-10"
          />
          <m-input
            label="读取限制(ops/s)"
            labelWidth="110px"
            placeholder="无限"
            type="number"
            prop="iops_rd"
            @validate="validate"
            validateEvent
            class="m-margin-top-10"
            :show-error="rules['iops_rd'].error"
            :error-msg="rules['iops_rd'].message"
            v-model="iops_rd"
          />
          <m-input
            label="写入限制(ops/s)"
            labelWidth="110px"
            placeholder="无限"
            type="number"
            prop="iops_wr"
            class="m-margin-top-10"
            @validate="validate"
            validateEvent
            :show-error="rules['iops_wr'].error"
            :error-msg="rules['iops_wr'].message"
            v-model="iops_wr"
          />
          <m-input
            label="读取最大突发(MB)"
            labelWidth="110px"
            placeholder="默认"
            type="number"
            v-model="mbps_rd_max"
            class="m-margin-top-10"
          />
          <m-input
            label="写入最大突发(MB)"
            labelWidth="110px"
            placeholder="默认"
            type="number"
            v-model="mbps_wr_max"
            class="m-margin-top-10"
          />
          <m-input
            label="读取最大突发(ops)"
            labelWidth="110px"
            placeholder="默认"
            type="number"
            prop="iops_rd_max"
            @validate="validate"
            class="m-margin-top-10"
            validateEvent
            :show-error="rules['iops_rd_max'].error"
            :error-msg="rules['iops_rd_max'].message"
            v-model="iops_rd_max"
          />
          <m-input
            label="写入最大突发(ops)"
            labelWidth="110px"
            placeholder="默认"
            type="number"
            prop="iops_wr_max"
            @validate="validate"
            class="m-margin-top-10"
            validateEvent
            :show-error="rules['iops_wr_max'].error"
            :error-msg="rules['iops_wr_max'].message"
            v-model="iops_wr_max"
          />
        </dd>
      </div>
    </div>
    <template slot="footer">
			 <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>高级</div>
        </label>
      </div>
      <m-button
        type="primary"
        style="height:40px; line-height: 40px; width: 100px"
        @on-click="confirm()"
      >确定</m-button>
		</template>
  </m-dialog>
</template>

<script>
import { 
	DEVICELIST,
	CACHELIST
 } from "@libs/enum/enum";
 import { byteToSize } from '@libs/utils/index';
 import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
	name: "AddOrEditDiskModal",
	mixins: [VolumeHttp],
  props: {
    modalType: {
      type: String,
      default: "",
    },
    param: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
  },
  data() {
    return {
			deviceList: DEVICELIST,
			cacheList: CACHELIST,
      deviceIndex: "1",
      cache: "none",
      iops_wr_max: "",
      iops_rd_max: "",
      mbps_wr_max: "",
      mbps_rd_max: "",
      iops_wr: "",
      iops_rd: "",
      mbps_rd: "",
      mbps_wr: "",
      replicate: false,
      iothread: "",
      ssd: false,
      backup: false,
      format: "qcow2",
      disksize: "32",
      device: "scsi",
      discard: "",
			isAdvice: true,
			storage: "",
      storageType: "",
      editStorage: "",
			formatList: [
        {
          label: "Raw磁盘映像（raw）",
          value: "raw",
				},
				{
          label: "VMware映像格式（vmdk）",
          value: "vmdk",
				},
				{
          label: "QEMU映像格式（qcow2）",
          value: "qcow2",
        }
      ],
      rules: {
        deviceIndex: {
          error: false,
          message: "",
        },
        disksize: {
          error: false,
          message: "",
        },
        iops_rd: {
          error: false,
          message: "",
        },
        iops_wr: {
          error: false,
          message: "",
        },
        iops_rd_max: {
          error: false,
          message: "",
        },
        iops_wr_max: {
          error: false,
          message: "",
				},
				 storage: {
          error: false,
          message: "",
        },
      },
    };
	},
	mounted() {
		this.__init__();
	},
  methods: {
		byteToSize,
		__init__() {
      let _this = this;
      _this.queryConfig({_dc: new Date().getTime()})
          .then(res => {
              if(_this.param.type) {
               _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
               ["iops_rd", "iops_wr", "iops_rd_max", "iops_wr_max"].forEach(item => {
                 (_this.db.qemuConfigObj[_this.param.type].indexOf(item) >= 0)
                 _this.isAdvice = true;
               })
              }
          })
			_this.queryStorage({format: 1, content: 'images'})
    },
    parseValue(value) {
      let values = value.split(','), _this = this;
      if(values) {
         for(let i in values) {
          if(values[i].indexOf('=') < 0) {
            _this.editStorage = values[i];
          } else {
            if(['iothread', 'ssd'].includes(values[i].split('=')[0])) {
               _this[values[i].split('=')[0]] = values[i].split('=')[1] ===  '1' ? true : false;
            } else if('replicate'.indexOf(values[i].split('=')[0]) >=0) {
               _this[values[i].split('=')[0]] = values[i].split('=')[1] ===  '1' ? false : true;
            } else if('discard'.indexOf(values[i].split('=')[0]) >=0) {
              _this[values[i].split('=')[0]] = values[i].split('=')[1] ===  'on' ? true : false;
            } else if('backup'.indexOf(values[i].split('=')[0]) >=0) {
              _this[values[i].split('=')[0]] = values[i].split('=')[1] ===  '0' ? false : true;
            } else {
               _this[values[i].split('=')[0]] = values[i].split('=')[1];
            }
          }
         }
      }
    },
    isShow() {
     return this.modalType !== 'edit' || (this.param && this.param.type && /(unused)/.test(this.param.type))
    },
		confirm() {
			  if(this.validateAll()) return;
			  if(this.modalType !== 'edit') {
          let device = '';
        if(this.cache) device +=`cache=${this.cache},`;
        if(this.discard) device +=`discard=${this.discard ? 'on' : 'ignore'},`;
				if(this.storage) device +=`${this.storage}:${this.disksize},`;
				if(this.format) device +=`format=${this.format},`;
				if(this.isAdvice) {
					if(typeof (this.backup) === 'undefined') device+=`backup=${this.backup ? 'on' : 'no'},`;
          if(typeof (this.replicate) === 'undefined') device+=`replicate=${this.replicate ? 'on' : 'no'},`;
          if(typeof (this.ssd) === 'undefined') device+=`ssd=${this.ssd ? 1 : 0},`;
          if(typeof (this.iothread) === 'undefined') device+=`iothread=${this.iothread ? 'on' : 'no'},`;
          if(this.iops_rd_max) device+=`iops_rd_max=${this.iops_rd_max},`;
          if(this.iops_rd) device+=`iops_rd=${this.iops_rd},`;
          if(this.iops_wr) device+=`iops_wr=${this.iops_wr},`;
          if(this.iops_wr_max) device+=`iops_wr_max=${this.iops_wr_max},`;
          if(this.mbps_wr) device+=`mbps_wr=${this.mbps_wr},`;
          if(this.mbps_rd) device+=`mbps_rd=${this.mbps_rd},`;
          if(this.mbps_rd_max) device+=`mbps_rd_max=${this.mbps_rd_max},`;
          if(this.mbps_wr_max) device+=`mbps_wr_max=${this.mbps_wr_max},`;
				}
				let param = {
					[`scsi${this.deviceIndex}`]: device.slice(0, device.length - 1),
          digest: this.db.qemuConfigObj.digest,
           background_delay: 5    
				}
				this.createHardWare(param)
				    .then(res =>{
							this.close();
						})
						.catch(res => {
							this.$confirm.confirm({
								msg: res
							})
						})
        } else {
           let device = '';
           if(this.editStorage) device +=`${this.editStorage},`
        if(this.cache) device +=`cache=${this.cache},`;
        if(this.discard) device +=`discard=${this.discard ? 'on' : 'ignore'},`;
				if(this.isAdvice) {
					if(typeof (this.backup) !== 'undefined') device+=`backup=${this.backup ? 'on' : 'no'},`;
          if(typeof (this.replicate) !== 'undefined') device+=`replicate=${this.replicate ? 'on' : 'no'},`;
          if(typeof (this.ssd) !== 'undefined') device+=`ssd=${this.ssd ? 'on' : 'no'},`;
          if(typeof (this.iothread) !== 'undefined') device+=`iothread=${this.iothread ? 'on' : 'no'},`;
          if(this.iops_rd_max) device+=`iops_rd_max=${this.iops_rd_max},`;
          if(this.iops_rd) device+=`iops_rd=${this.iops_rd},`;
          if(this.iops_wr) device+=`iops_wr=${this.iops_wr},`;
          if(this.iops_wr_max) device+=`iops_wr_max=${this.iops_wr_max},`;
          if(this.mbps_wr) device+=`mbps_wr=${this.mbps_wr},`;
          if(this.mbps_rd) device+=`mbps_rd=${this.mbps_rd},`;
          if(this.mbps_rd_max) device+=`mbps_rd_max=${this.mbps_rd_max},`;
          if(this.mbps_wr_max) device+=`mbps_wr_max=${this.mbps_wr_max},`;
				}
          let param = {
					[/(unused)/.test(this.param.type) ? `scsi${this.deviceIndex}` : this.param.type]: device.slice(0, device.length - 1),
           digest: this.db.qemuConfigObj.digest,  
				  }
          	this.updateHardWare(param)
				    .then(res =>{
							this.close();
						})
						.catch(res => {
							this.$confirm.confirm({
								msg: res
							})
						})
        }
		},
    close() {
      this.$emit("close");
    },
		handleStorageSelect(value) {
			this.storage = value;
			this.storageType = this.db.storageList.filter(it => it.storage === value)[0].type;
			if(this.storageType === 'dir') this.format = 'qcow2';
			else this.format = 'raw';
		},
		 validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (
        value &&
        ["iops_rd", "iops_wr", "iops_rd_max", "iops_wr_max"].includes(prop) &&
        Number(value) < 10
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "值不能小于10";
        return;
      }
		},
		validateAll() {
        let props = [];
        if(this.modalType !== 'edit') {
          this.isAdvice ? props = [
          "deviceIndex",
          "disksize",
          "iops_rd",
          "iops_wr",
          "iops_rd_max",
          "iops_wr_max",
          "storage"
        ] : props = [
          "deviceIndex",
          "disksize",
          "storage"
        ]
      } else if(this.modalType ==='edit' && this.isAdvice){
        props = [ "iops_rd",
          "iops_wr",
          "iops_rd_max",
          "iops_wr_max"]
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
		},
		handleCacheSelect(value) {
			this.cache = value;
		},
		handleFormatSelect(value) {
			this.format = value;
		}
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
};
</script>