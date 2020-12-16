<template>
	<m-dialog :title="title" 
	          :visible="visible"
						@confirm="confirm"
						:_style="{
							width: '946px'
						}"
						@cancel="close"
						@close="close">
	  <div slot="content">
			<div class="m-form__section">
					<dl>
						<dt>基本操作</dt>
						<dd>
						<!--名称-->
						 <template v-if="modalType === 'editname'">
							 	<m-input type="text" 
							         prop="name"
											 v-model="name"
											 labelWidth="100px"
											 validateEvent
											 @validate="validate"
											 :show-error="rules['name'].error"
											 :error-msg="rules['name'].message"
											 @on-change="(value) => name = value"
											 label="名称"/>
						 </template>
             <!--开机自启动-->
						  <template  v-if="modalType === 'editboot'">
								<m-checkbox v-model="onboot"
								            labelWidth="100px" 
							              label="开机自启动">
							  </m-checkbox>
							</template>
              <!--启动/关机顺序-->
							<template  v-if="modalType === 'editstartup'">
								<m-input type="text" 
							           prop="order"
											   v-model="order"
												 labelWidth="100px"
											   @on-change="(value) => order = value"
											   placeholer="any"
											   label="启动/关机顺序"/>

							<m-input type="text" 
							         prop="up"
											 v-model="up"
											 labelWidth="100px"
											 @on-change="(value) => up = value"
											 placeholder="any"
											 label="启动延时"/>

							<m-input type="text" 
							         prop="down"
											 labelWidth="100px"
											 v-model="down"
											 @on-change="(value) => down = value"
											 label="关机超时"/>
							</template>
              <!--OS类型-->
							<template  v-if="modalType === 'editostype'">
								<m-select prop="ostype"
													label="类别"
													labelWidth="100px"
													@on-change="handleOsTypeChange"
													v-model="ostype">
							  <m-option v-for="item in osTypeItems"
								          :key="item.key"
													:label="item.label" 
								          :value="item.value">
								</m-option>
							</m-select>

							<m-select prop="version"
							          label="版本"
												labelWidth="100px"
												@on-change="(value) => version = value"
							          v-model="version">
							  <m-option v-for="item in versionItems"
								          :key="item.key"
													:label="item.label" 
								          :value="item.value">
								</m-option>
							</m-select>
							</template>
               <!--引导顺序-->
							<template  v-if="modalType === 'editorder'">
									<m-select prop="bd1"
													label="引导设备1"
													labelWidth="100px"
													@on-change="(value) => { bd1 = value}"
													v-model="bd1">
									<m-option v-for="item in dbItems"
														:key="item.value"
														:label="item.label" 
														:value="item.value">
									</m-option>
								</m-select>

								<m-select prop="bd2"
													label="引导设备2"
													labelWidth="100px"
													@on-change="(value) => { bd2 = value}"
													v-model="bd2">
									<m-option v-for="item in dbItems"
														:key="item.value"
														:label="item.label" 
														:value="item.value">
									</m-option>
								</m-select>

								<m-select prop="bd3"
													label="引导设备3"
													labelWidth="100px"
													@on-change="(value) => { bd3 = value}"
													v-model="bd3">
									<m-option v-for="item in dbItems"
														:key="item.value"
														:label="item.label" 
														:value="item.value">
									</m-option>
								</m-select>
							</template>
              <!--使用平板指针-->
						  <template  v-if="modalType === 'edittablet'">
								<m-checkbox v-model="tablet"
														labelWidth="100px" 
														label="已启用">
						   	</m-checkbox>
							</template>
              <!--热拔插-->
						  <template  v-if="modalType === 'edithotplug'">
								<m-checkbox v-model="disk"
								            labelWidth="100px">
														磁盘
								</m-checkbox>

								<m-checkbox v-model="network"
								            labelWidth="100px">
														网络
								</m-checkbox>
							  
								<m-checkbox v-model="usb"
							            	labelWidth="100px">
														usb
								</m-checkbox>

								<m-checkbox v-model="memory"
								            labelWidth="100px">
														内存
								</m-checkbox>

								<m-checkbox v-model="cpu"
								            labelWidth="100px">
														cpu
								</m-checkbox>
							</template>
              <!--APCI支持-->
							<template  v-if="modalType === 'editacpi'">
								<m-checkbox v-model="acpi"
								            labelWidth="100px"
								            label="已启用">
								</m-checkbox>
							</template>
              <!--KVM虚拟化硬件-->
							<template  v-if="modalType === 'editkvm'">
								<m-checkbox v-model="kvm"
								            label="已启用"
														labelWidth="100px">
								</m-checkbox>
							</template>
							<!--启动时冻结cpu-->
							<template  v-if="modalType === 'editfreeze'">
								<m-checkbox v-model="freeze"
								            label="启动时冻结CPU"
														labelWidth="100px">
								</m-checkbox>
							</template>
							<!--使用本地时间进行RTC-->
							<template  v-if="modalType === 'editlocaltime'">
								<m-checkbox v-model="localtime"
								            label="使用本地时间进行RTC"
														labelWidth="100px">
								</m-checkbox>
							</template>
							<!--RTC开始时间-->
							<template  v-if="modalType === 'editstartdate'">
								<m-input type="text" 
							         prop="startdate"
											 v-model="startdate"
											 validateEvent
											 labelWidth="100px"
											 @validate="validate"
											 :show-error="rules['startdate'].error"
											 :error-msg="rules['startdate'].message"
											 @on-change="(value) => startdate = value"
											 placeholder="值为now或者为空"
											 label="RTC开始时间"/>
							</template>
							<!--SIMBOS-->
							<template  v-if="modalType === 'editsmbios1'">
								<m-input type="text" 
							         prop="uuid"
											 v-model="uuid"
											 labelWidth="100px"
											 validateEvent
											 @validate="validate"
											 :show-error="rules['uuid'].error"
											 :error-msg="rules['uuid'].message"
											 @on-change="(value) => uuid = value"
											 label="UUID"/>
								<m-input type="text" 
							         prop="manufacturer"
											 labelWidth="100px"
											 v-model="manufacturer"
											 @on-change="(value) => manufacturer = value"
											 label="生产厂商"/>
								<m-input type="text" 
							         prop="product"
											 labelWidth="100px"
											 v-model="product"
											 @on-change="(value) => product = value"
											 label="产品"/>
								<m-input type="text" 
							         prop="sversion"
											 labelWidth="100px"
											 v-model="sversion"
											 @on-change="(value) => sversion = value"
											 label="版本"/>
								<m-input type="text" 
							         prop="serial"
											 labelWidth="100px"
											 v-model="serial"
											 @on-change="(value) => serial = value"
											 label="串行"/>
								<m-input type="text" 
							         prop="sku"
											 labelWidth="100px"
											 v-model="sku"
											 @on-change="(value) => sku = value"
											 label="SKU"/>
								<m-input type="text" 
							         prop="family"
											 labelWidth="100px"
											 v-model="family"
											 @on-change="(value) => family = value"
											 label="家族"/>
							</template>
              <!--Qemu代理-->
							<template  v-if="modalType === 'editagent'">
                <m-checkbox v-model="agent"
								            label="Use QEMU Guest Agent"
														labelWidth="100px">
								</m-checkbox>
									<m-checkbox v-model="fstrim_cloned_disks"
									          :disabled="!agent"
								            label="克隆磁盘后运行guest-trim"
														labelWidth="100px">
								 </m-checkbox>
								 <div class="warning" v-show="agent">确保在虚拟机中安装了QEMU Guest Agent。</div>
							</template>
               <!--保护-->
							<template  v-if="modalType === 'editprotection'">
                <m-checkbox v-model="protection"
								            label="已启用"
														labelWidth="100px">
								</m-checkbox>
							</template>
							 <!--Spice Enhancements-->
							<template  v-if="modalType === 'editspice_enhancements'">
                <m-checkbox v-model="foldersharing"
								            label="Folder Sharing"
														labelWidth="100px">
								</m-checkbox>
								<m-select prop="videostreaming"
							          label="Video Streaming"
												@on-change="(value) => videostreaming = value"
							          v-model="videostreaming"
												labelWidth="100px">
							  <m-option v-for="item in videostreamingItems"
								          :key="item.key"
													:label="item.label" 
								          :value="item.value">
								</m-option>
							 </m-select>
							 <div class="warinig" v-show="foldersharing">确保在虚拟机中安装了SPICE WebDav守护程序。</div>
							</template>
							<!--Vm State-->
							<template  v-if="modalType === 'editvmstatestorage'">
								<m-select prop="vmstatestorage"
							          label="Video Streaming"
												labelWidth="100px"
												@on-change="(value) => vmstatestorage = value"
							          v-model="vmstatestorage">
							  <m-option v-for="(item, index) in storageList"
								          :key="item.storage"
													:label="item.storage" 
								          :value="item.storage">
										<div class="table-tr" v-if="index === 0">
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
							 </m-select>
							</template>
							<!--console-->
							<template  v-if="modalType === 'editconsole'">
                <m-checkbox v-model="console"
								            label="/dev/console"
														labelWidth="100px">
								</m-checkbox>
							</template>
								<!--tty-->
							<template v-if="modalType === 'edittty'">
									<m-input type="number" 
							         prop="tty"
											 labelWidth="100px"
											 v-model="tty"
											 @on-change="(value) => tty = value"
											 label="tty"/>
							</template>
								<!--tty-->
							<template v-if="modalType === 'editcmode'">
									<m-select prop="cmode"
							          label="控制台模式"
												labelWidth="100px"
												@on-change="(value) => cmode = value"
							          v-model="cmode">
									<m-option v-for="item in cmodeItems"
														:key="item.value"
														:label="item.label" 
														:value="item.value">
									</m-option>
						  </m-select>
							</template>
								<!--editfeatures-->
							<template v-if="modalType === 'editfeatures'">
									 <m-checkbox v-model="keyctl"
								            label="keyctl"
														:disabled="!unprivileged"
														labelWidth="100px">
								   </m-checkbox>
									  <m-checkbox v-model="nesting"
								            label="嵌套"
														labelWidth="100px">
										</m-checkbox>
										<m-checkbox v-model="nfs"
																label="NFS"
																:disabled="unprivileged"
																labelWidth="100px">
										</m-checkbox>
										<m-checkbox v-model="cifs"
																label="cifs"
																:disabled="unprivileged"
																labelWidth="100px">
										</m-checkbox>
										<m-checkbox v-model="fuse"
																label="FUSE"
																labelWidth="100px">
										</m-checkbox>
											<m-checkbox v-model="mknod"
																label="Create Device Nodes"
																labelWidth="100px">
																Experimental
										</m-checkbox>
							</template>
						</dd>
					</dl>
				</div>
				  <!--Qemu代理-->
				<div class="m-form__section" v-show="isAdvice">
					<dl>
						<dt>高级</dt>
						<dd>
							<m-select prop="type"
							          label="Type"
												labelWidth="100px"
												@on-change="(value) => type = value"
							          v-model="type">
							  <m-option v-for="item in typeItems"
								          :key="item.value"
													:label="item.label" 
								          :value="item.value">
								</m-option>
							</m-select>
						</dd>
					</dl>
				</div>
		</div>
		<template slot="footer">
			<!--高级当type为editagent时展示-->
			<div class="label_box" v-show="modalType === 'editagent'">
          <label>
            <input type="checkbox" v-model="isAdvice" />
            <div>高级</div>
          </label>
        </div>
			<m-button class="create-btn" @on-click="close()" type="danger">取消</m-button>
			<m-button class="create-btn" @on-click="confirm()" type="primary">确定</m-button>
		</template>
	</m-dialog>
</template>

<script>
import QemuEditHttp from '@src/views/home/qemu/options/http';
import { gettext } from "@src/i18n/local_zhCN.js";
import { isEmpty, byteToSize } from '@libs/utils/index';
import Base64 from '@libs/utils/base64';
export default {
	name: 'QemuEditOption',
	mixins: [QemuEditHttp],
	props: {
		title: {//弹框标题
			type: String,
			default: ''
		},
		visible: {//是否展示
			type: Boolean,
			default: false
		},
		param: {//携带参数
			type: Object,
			default: () => {
				return {}
			}
		},
		title: {//弹框标题
			type: String,
			default: ''
		},
		modalType: {//编辑类型
			type: String,
			default: ''
		}
	},
	data() {
		return {
			name: '',
			isAdvice: false,
			dbItems: [],
			storageList: [],
			vmstatestorage: '',
			videostreaming: 'off',
			foldersharing: false,
			protection: false,
			agent: false,
			fstrim_cloned_disks: false,
			type: 'none',
			manufacturer: '',
			bd1: '',
			bd2: '',
			bd3: '',
			uuid: '',
			product: '',
			sversion: '',
			serial: '',
			sku: '',
			family: '',
			startdate: '',
			localtime: false,
			freeze: false,
			kvm: false,
			acpi: false,
			disk: false,
			memory: false,
			usb: false,
			cpu: false,
			network: false,
			ostype: 'linux',
			version: '126',
			onboot: false,
			console: false,
			tablet: '',
			order: '',
			up: '',
			down: '',
			bootdisk: '',
			tty: 2,
			cmode: '',
			unprivileged: false,
			keyctl: false,
			nfc: false,
			nesting: false,
			cifs: false,
			fuse: false,
			mknod: false,
			cmodeItems: [
				{
					label: '默认 (tty)',
					value: '__none__'
				},
				{
					label: '/dev/tty[X]',
					value: 'tty'
				},
				{
					label: '/dev/console',
					value: 'console'
				},
				{
					label: 'shell',
					value: 'shell'
				}
			],
			typeItems: [
				{
					label: '默认 (VirtIO)',
					value: 'none'
				}, 
				{
					label: 'VirtIO',
					value:'virtio'
				},
				{
					label: 'ISA',
					value: 'isa'
				}
			],
			videostreamingItems: [
				{
					label: 'off',
					value: 'off'
				}, 
				{
					label: 'all',
					value:'all'
				},
				{
					label: 'filter',
					value: 'filter'
				}
			],
			osTypeItems: [
        {
          label: "Linux",
          value: "linux",
        },
        {
          label: "Microsoft Windows",
          value: "win",
        },
        {
          label: "Solaris Kernel",
          value: "solaris",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      versionItems: [
        {
          label: "5.x - 2.6 Kernel",
          value: "l26",
        },
        {
          label: "2.4 Kernel",
          value: "l24",
        },
			],
			rules: {
				uuid: {
					message: '',
					error: false
				},
				name: {
					message: '',
					error: false
				},
				startdate: {
					message: '',
					error: false
				}
			}
		}
	},
	mounted() {
		//初始化操作
		this.__init__();
	},
	methods: {
		byteToSize,
		//初始化操作
	async __init__() {
		 let _this = this;
		 await _this.queryVmConfig({_dc: new Date().getTime()})
		      .then(() => {
						_this.setVMConfig(_this.db.qemuObj);
					})
		 await _this.queryVmStateStorage({format: 1,content: 'images'})
		      .then((data) => {
						_this.storageList = data;
					})
					debugger;
			this.unprivileged = _this.db.qemuObj.unprivileged && _this.db.qemuObj.unprivileged === 1 ? true : false;
		  switch(_this.modalType) {
				case 'editname':
					_this.name = _this.db.qemuObj.name ? _this.db.qemuObj.name : _this.node.name;
					break;
				case 'editboot':
					_this.onboot = _this.db.qemuObj.onboot && _this.db.qemuObj.onboot === 1 ? true : false;
					break;
				case 'editstartup':
					_this.parseValue('startup');
					break;
				case 'editostype':
					_this.version = _this.db.qemuObj.ostype && _this.db.qemuObj.ostype;
					_this.getOsTypeByVersion(_this.version);
					_this.handleOsTypeChange(_this.ostype);
					break;
				case 'edittablet':
					_this.tablet = _this.db.qemuObj.tablet && _this.db.qemuObj.tablet && _this.db.qemuObj.tablet === 1 ? true : false;
					break;
				case 'edithotplug':
					_this.parseValue('hotplug');
					break;
				case 'editacpi':
					_this.acpi = _this.db.qemuObj.acpi && _this.db.qemuObj.acpi === 1 ? true : false;
					break;
				case 'editkvm':
					_this.kvm = _this.db.qemuObj.kvm && _this.db.qemuObj.kvm === 1 ? true : false;
					break;
				case 'editfreeze':
					_this.freeze = _this.db.qemuObj.freeze && _this.db.qemuObj.freeze === 1 ? true : false;
					break;
				case 'editlocaltime':
					_this.localtime = _this.db.qemuObj.localtime && _this.db.qemuObj.localtime === 1 ? true : false;
					break;
				case 'editstartdate':
					_this.startdate = _this.db.qemuObj.startdate && _this.db.qemuObj.startdate ? _this.db.qemuObj.startdate : 'now';
					break;
				case 'editsmbios1':
					_this.parseValue('smbios1');
					break;
				case 'editprotection':
					_this.protection = _this.db.qemuObj.protection && _this.db.qemuObj.protection === 1 ? true : false;
					break;
				case 'editspice_enhancements':
					_this.parseSpiceValue('spice_enhancements');
					break;
				case 'editvmstatestorage':
					_this.vmstatestorage = _this.db.qemuObj.vmstatestorage && _this.db.qemuObj.vmstatestorage;
					break;
				case 'editagent':
				 _this.parseAgent('agent');
				 break;
				 case 'editconsole':
					_this.console = _this.db.qemuObj.console && _this.db.qemuObj.console === 1 ? true : false;
					break;
				case 'edittty':
					_this.tty = _this.db.qemuObj.tty && _this.db.qemuObj.tty;
					break;
				case 'editcmode':
					_this.cmode = _this.db.qemuObj.cmode && _this.db.qemuObj.cmode || '__none__';
					break;
				case 'editfeatures':
					_this.parseValue('features');
					break;
			}
		}, 
		//通过os版本得到ostype
		getOsTypeByVersion(version) {
			let _this = this;
      if(['126', 'l24'].includes(version)) {
				_this.ostype = 'linux';
			} else if(['win10', 'win8', 'win7', 'w2k8', 'wxp', 'w2k'].includes(version)) {
				_this.ostype = 'win';
			} else if('solaris' === version) {
				_this.ostype = 'solaris';
			} else {
				_this.ostype = 'other';
			}
		},
		//解析agent
		parseAgent(prop) {
			let _this = this;
			 _this.db.qemuObj[prop].split(',').forEach(item => {
				 if(/([\s\S]*)\=([\s\S]*)[^=]$/.test(item)) {
					 if(item.split('=')[0] === 'type') {
             _this[item.split('=')[0]] = item.split('=')[1]
					 }
					 else {
						 _this[item.split('=')[0]] = item.split('=')[1] && item.split('=')[1] === '1' ? true : false;
					 }
				 } else {
					 _this.agent = true;
					 _this.isAdvice = true;
				 }
			 })
		},
		//解析值形如： key=value,的值
		parseValue(prop) {
			let _this = this;
			//判断是否存在改属性值没有则默认
      if(!isEmpty(_this.db.qemuObj[prop])) {
				let values =  _this.db.qemuObj[prop];
				values.split(',').forEach(item => {
					if(/([\s\S]*)\=([\s\S]*)[^=]$/.test(item)) {
						_this[item.split('=')[0]] = item.split('=')[1];
					} else if(/([\s\S]*)\=([\s\S]*)[=]$/.test(item)){
						let values = item.match(/([a-zA-Z0-9]+)(=)([\s\S]*)/);
						if(item.indexOf('version') >= 0) 
						  _this.sversion = values && values[3] && Base64.decode(values[3]);
            else _this[values[1]] = values && values[3] && Base64.decode(values[3]);
					} else {
						_this[item] = true;
					}
				})
			}
		},
		//解析spice
		parseSpiceValue(prop) {
				let _this = this;
			if(!isEmpty(_this.db.qemuObj[prop])) {
				let values =  _this.db.qemuObj[prop];
				values.split(',').forEach(item => {
						if(/([\s\S]*)\=([\s\S]*)[^=]$/.test(item)) {
							if(item.indexOf('foldersharing') >=0){
								_this[item.split('=')[0]] = item.split('=')[1] && Number(item.split('=')[1]) ===  1 ? true : false;
								if(_this[item.split('=')[0]]) _this.isAdvice = true;
							}
							else {
               _this[item.split('=')[0]] = item.split('=')[1];
							}
					}
				})
			}
		},
		handleOsTypeChange(value) {
			this.ostype = value;
			debugger;
      switch (value) {
        case "linux":
          this.versionItems = [
            {
              label: "5.x - 2.6 Kernel",
              value: "l26",
            },
            {
              label: "2.4 Kernel",
              value: "l24",
            },
          ];
          this.version = "l26";
          break;
        case "win":
          this.versionItems = [
            {
              label: "10/2016",
              value: "win10",
            },
            {
              label: "8.x/2012/2012r2",
              value: "win8",
            },
            {
              label: "7/2008r2",
              value: "win7",
            },
            {
              label: "Vista/2008",
              value: "w2k8",
            },
            {
              label: "XP/2003",
              value: "wxp",
            },
            {
              label: "2000",
              value: "w2k",
            },
          ];
          this.version = "win10";
          break;
        case "solaris":
          this.versionItems = [
            {
              label: "-",
              value: "solaris",
            },
          ];
          this.version = "solaris";
          break;
        case "other":
          this.versionItems = [
            {
              label: "-",
              value: "other",
            },
          ];
          this.version = "other";
          break;
      }
    },
		//关闭弹框操作
		close() {
			let _this = this;
			_this.$emit('close');
		},
		//确定操作
		confirm() {
			let _this = this, param = {};
			if(_this.validateAll()) return;
			switch(_this.modalType) {
				case 'editname':
				  param['name'] = _this.name;
					break;
				case 'editboot':
				  param['onboot'] = _this.onboot ? 1 : 0;
					break;
				case 'editstartup':
					let startup = '';
					if(_this.order) startup += `order=${_this.order},`;
					if(_this.up) startup += `up=${_this.up},`;
					if(_this.down) startup += `down=${_this.down},`;
					param['startup'] = startup.replace(/\,$/, '');
					if(!param['startup']) {
						delete param['startup'];
						param['delete'] = 'startup'
					};
					break;
				case 'editostype':
					param['ostype'] = _this.version;
					break;
				case 'edittablet':
					param['tablet'] = _this.tablet ? 1 : 0;
					break;
				case 'edithotplug':
					let hotplug = '';
						if(_this.disk) hotplug +='disk,';
						if(_this.network) hotplug +='network,';
						if(_this.cpu) hotplug +='cpu,';
						if(_this.usb) hotplug +='usb,';
						if(_this.memory) hotplug +='memory,';
						param['hotplug'] = hotplug.replace(/\,$/, '');
					break;
				case 'editacpi':
					param['acpi'] = _this.acpi ? 1 : 0;
					break;
				case 'editkvm':
					param['kvm'] = _this.kvm ? 1 : 0;
					break;
				case 'editfreeze':
					param['freeze'] = _this.freeze ? 1 : 0;
					break;
				case 'editlocaltime':
					param['localtime'] = _this.localtime ? 1 : 0;
					break;
				case 'editstartdate':
					param['startdate'] = _this.startdate;;
					break;
				case 'editsmbios1':
						let smbios1 = '';
						if(_this.uuid) smbios1+=`uuid=${_this.uuid},`;
						if(_this.manufacturer) smbios1+=`manufacturer=${Base64.encode(_this.manufacturer)},`;
						if(_this.product) smbios1+=`product=${Base64.encode(_this.product)},`;
						if(_this.version) smbios1+=`version=${Base64.encode(_this.sversion)},`;
						if(_this.serial) smbios1+=`serial=${Base64.encode(_this.serial)},`;
						if(_this.sku) smbios1+=`sku=${Base64.encode(_this.sku)},`;
						if(_this.family) smbios1+=`family=${Base64.encode(_this.family)},`;
						smbios1+='base64=1,';
						param['smbios1'] = smbios1.replace(/\,$/, '');
					break;
				case 'editprotection':
					param['protection'] = _this.protection ? 1 : 0;
					break;
				case 'editspice_enhancements':
					let spice = '';
					if(_this.foldersharing) spice+=`foldersharing=${1},`;
					if(_this.videostreaming !== 'off') spice+=`videostreaming=${_this.videostreaming}`
					param['spice_enhancements'] = spice.replace(/\,$/, '');
					break;
				case 'editvmstatestorage':
					param['vmstatestorage'] = _this.vmstatestorage;
					break;
				case 'editagent':
				 let agent = '';
				 agent += `${_this.agent ? 1 : 0},`;
				 if(_this.fstrim_cloned_disks) agent+=`fstrim_cloned_disks=1,`;
				 if(_this.isAdvice && _this.type !== 'none') agent+=`type=${_this.type},`;
				 param['agent'] = agent.replace(/\,$/, '');
				 if(!param['agent']) {
					 delete param['agent'];
					 param['delete'] = 'agent';
				 }
				 break;
				case 'editconsole':
					param['console'] = this.console ? 1 : 0
				break;
				case 'edittty':
					param['tty'] = _this.tty;
					break;
				case 'editcmode':
					if(this.cmode === '__none__' && this.db.qemuObj.cmode === undefined) {
						param['delete'] = 'cmode';
					} else {
						param['cmode'] = this.cmode;
					}
					break;
				case 'editfeatures':
					let features = '';
						if(this.mknod) features+=`mknod=1,`;
						if(this.cifs) features+=`cifs=1,`;
						if(this.fuse) features+=`fuse=1,`;
						if(this.keyctl) features+=`keyctl=1,`;
						if(this.nesting) features+=`nesting=1,`;
						if(this.nfs) features+=`nfs=1,`;
					param['features'] = features.replace(/\,$/, '');
					break;
			}
			param['digest'] = _this.db.qemuObj.digest;
			_this.updateOptions(param)
			     .then(res => {
						 this.close();
					 })
					 .catch(res => {
						 _this.$confirm.confirm({
							 msg: res
						 })
					 });
		},
		//单个表单操作
		validate(prop) {
			let _this = this;
			//防止出现number 为0时判断为空的现象
			value = String(_this[props]).trim();
			if(!/\s\S*/.test(value)) {
				_this.rules[prop].error = true;
				_this.rules[prop].message = "不能为空!";
				return;
			}
		},
		//整体校验
		validateAll() {

		},
		//设置启动顺序
		setVMConfig(vmconfig) {
				let _this = this;
				_this.vmconfig = vmconfig;
				var order = _this.vmconfig.boot || 'cdn';
				_this.bootdisk = _this.vmconfig.bootdisk || undefined;
				let values = order.split('').slice(0,3) || ['c', 'n', 'd'];
				_this.dbItems = [];
				values[values.indexOf('c')] = _this.bootdisk;
				for(let key in _this.vmconfig){
						if (_this.isBootDisk(key) &&
					!(/media=cdrom/).test(_this.vmconfig[key])) {
					    _this.dbItems.push({ value: key, label: "Disk '" + key + "'"});
						}
				};
				_this.dbItems.push({ value: 'd', label: 'CD-ROM'});
				_this.dbItems.push({ value: 'n', label: gettext('Network')});
				_this.dbItems.push({ value: '__none__', label: "无"});
				setTimeout(() => {
				 _this.bd1 = values[0];
				 _this.bd2 = values[1];
				 _this.bd3 = values[2];
				}, 0)
		},
		//判断是否启动云盘
		isBootDisk(value) {
			return /^(ide|sata|virtio|scsi)\d+$/.test(value);
		}
	},
	watch: {
		visible: function(newVal, oldVal) {
			if(newVal !== oldVal) {
				return newVal;
			}
		},
		modalType: function(newVal, oldVal) {
			if(newVal !== oldVal) {
				return newVal;
			}
		},
	}
}
</script>

<style lang="less" scoped>
.create-btn {
  width: 100px;
  height: 42px;
  display: inline-block;
  line-height: 43px;
}

.warning{
	padding: 10px 20px;
	background: #fc0;
	color: #fff;
}
</style>