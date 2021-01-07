<template>
  <page-template>
    <div slot="toolbar-left">
       <m-dropdown
        trigger="click"
        @on-change="handleCommand"
        style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        "
      >
        <span slot="label">
          <m-button
            type="primary"
            style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus"
            >添加</m-button
          >
        </span>
        <template  v-for="item in menu_items">
           <m-dropdown-item
          v-if="/^fa/.test(item.iconCls)"
          :key="item.itemId"
          :command="item.itemId"
          :icon="item.iconCls"
          :disabled="item.disabled"
          >{{ item.text }}</m-dropdown-item
        >
        <m-dropdown-item
          v-else
          :key="item.itemId"
          :command="item.itemId"
          :name="item.iconCls"
          :disabled="item.disabled"
          >{{ item.text }}</m-dropdown-item
        >
        </template>
      </m-dropdown>
      <m-button
        type="primary"
        @on-click="handleResume()"
        icon="el-icon-edit"
        :disabled="!canResume()"
        >还原</m-button
      >
      <m-button
        type="warning"
        @on-click="handleCommand('','edit')"
        icon="el-icon-video-play"
        :disabled="!inType('serial','efidisk') || !current"
        >编辑</m-button
      >
      <m-button
        type="danger"
        @on-click="handleDelete()"
        icon="el-icon-delete"
        :disabled="inType('scsi', 'ide', 'net', 'usb', 'serial', 'audio', 'efidisk', 'unused')"
        >{{/(net|scsi)/.test(current) ? '分离' :  '删除'}}</m-button
      >
      <m-button
        type="info"
        @on-click="handleCommand('resize', 'resize')"
        icon="el-icon-edit-outline"
        :disabled="inType('scsi') || canResume()"
        >调整磁盘大小</m-button
      >
      <m-button
        type="info"
        @on-click="handleMoveDisk()"
        icon="el-icon-edit-outline"
        :disabled="inType('scsi') || canResume()"
        >移动磁盘</m-button
      >
    </div>
    <div slot="page-content">
        <hardware-add-modal
                        :visible="visible"
                        :type="type"
                        v-if="visible"
                        :modal-type="modalType"
                        :param="param"
                        @close="visible = false; __init__()"></hardware-add-modal>
      <el-table :data="hardwareList"  :show-header="false" highlight-current-row @row-click="handleSingleSelect">
        <el-table-column width="55px">
          <template slot-scope="scope">
            <el-radio :label="scope.row.type" v-model="current">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="name" width="200px">
          <template slot-scope="scope">
            <div>
              <base-icon
                class="hardware-icon"
                :name="scope.row.icon"
                v-if="!/^[fa]/.test(scope.row.icon)"
              ></base-icon>
              <i v-else :class="scope.row.icon" class="fa"></i>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="值" prop="value">
          <template slot-scope="scope">
            <div>{{scope.row && scope.row.render && scope.row.render(false).replace(/(delete\:true)$/, '')}}</div>
            <div v-show="scope.row && scope.row.render && scope.row.render(false).indexOf('delete:true') >= 0 " class="pending" style="text-decoration: line-through;">
              {{ scope.row.render(false).replace(/(delete\:true)$/, '')}}
            </div>
            <div class="pending">
              {{ scope.row && scope.row.render && scope.row.render(true) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <job-press-modal v-if="jobVisible"
                       :visible="jobVisible"
                       :title="jobTitle"
                       @close="jobVisible = false; __init__()"
                       :msg="jobText"></job-press-modal>
    </div>
  </page-template>
</template>

<script>
import VolumeHttp from "@src/views/home/qemu/volume/http";
import {
  byteToSize,
  isEmpty,
  stringFormat,
  render_qemu_bios,
  render_kvm_vga_driver,
  forEachBus,
} from "@libs/utils/index";
import { gettext } from "@src/i18n/local_zhCN.js";
import BaseIcon from '@src/components/icon/BaseIcon.vue';
import PageTemplate from '@src/components/page/PageTemplate.vue';
import HardwareAddModal from '@src/views/home/qemu/volume/HardwareAddModal';
import JobPressModal from './JobPressModal';
export default {
  name: "Volume",
  mixins:[VolumeHttp],
  components: {
    BaseIcon,
    PageTemplate,
    HardwareAddModal,
    JobPressModal
  },
  data() {
    let _this = this;
    return {
      hardwareList: [],
      store: {},
      current: '',
      currentObj:'',
      visible: false,
      type: '',
      modalType: 'create',
      param: {},
      jobText:  "删除中...",
      statusObj: {},
      jobVisible: '',
      jobTitle: '',
      //可以添加的硬盘配置
      hardware_counts: {
        net: 32,
        usb: 5,
        hostpci: 16,
        audio: 1,
        efidisk: 1,
        serial: 4,
        rng: 1,
      },
      //添加菜单
      menu_items: [
			    {
				   text: gettext('Hard Disk'),
           iconCls: 'fa fa-fw fa-hdd-o black',
           itemId: 'adddisk',
				   disabled: _this.db && _this.db.cap && !_this.db.cap.vms['VM.Config.Disk']
			    },
			    {
            text: gettext('CD/DVD Drive'),
            itemId: 'addcdrom',
            iconCls: 'icon-cd',
            disabled: _this.db && _this.db.cap && !_this.db.cap.vms['VM.Config.Disk']
			    },
			    {
            text: gettext('Network Device'),
            itemId: 'addnet',
            iconCls: 'fa fa-fw fa-exchange black',
            disabled: _this.db && _this.db.cap && !_this.db.cap.vms['VM.Config.Network'],
			    },
			    {
              text: gettext('EFI Disk'),
              itemId: 'addefidisk',
              iconCls: 'fa fa-fw fa-hdd-o black',
              disabled: _this.db && _this.db.cap && !_this.db.cap.vms['VM.Config.Disk'],
          },
			    {
              text: gettext('USB Device'),
              itemId: 'addusb',
              iconCls: 'fa fa-fw fa-usb black',
              disabled: _this.db && _this.db.cap && !_this.db.cap.nodes['Sys.Console']
			    },
			    {
              text: gettext('PCI Device'),
              itemId: 'addpci',
              iconCls: 'icon-pci',
              disabled: _this.db && _this.db.cap && !_this.db.cap.nodes['Sys.Console']
			    },
			    {
            text: gettext('Serial Port'),
            itemId: 'addserial',
            iconCls: 'icon-serial',
            disabled: _this.db && _this.db.cap && !_this.db.cap.vms['VM.Config.Options']
			    },
			    {
              text: gettext('CloudInit Drive'),
              itemId: 'addci',
              iconCls: 'fa fa-fw fa-cloud black',
              disabled: _this.db && _this.db.cap && !_this.db.cap.nodes['Sys.Console']
			    },
			    {
              text: gettext('Audio Device'),
              itemId: 'addaudio',
              iconCls: 'fa fa-fw fa-volume-up black',
              disabled: _this.db && _this.db.cap && !_this.db.cap.vms['VM.Config.HWType'],
			    },
			    {
              text: gettext("VirtIO RNG"),
              itemId: 'addrng',
              iconCls: 'icon-die',
              disabled: _this.db && _this.db.cap && !_this.db.cap.nodes['Sys.Console']
			    }
			]
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //初始化请求
    __init__() {
      let _this = this;
      _this.queryResource().then((res) => {
        //装配数据得到格式为{key: value}的数据以便后期数据处理
        _this.store = _this.db.volumeList.reduce((target, source) => {
          if (!target.hasOwnProperty(source.key)) {
            target[source.key] = {
              data: source,
            };
          }
          return target;
        }, {});
        //表格数据
        this.hardwareList = [
          {
            name: gettext("Memory"),//名称
            type: "memory",//数据类型
            icon: "icon-ram",//icon
            itemId: 'addmemory',//添加弹框id
            render: function (pending) {//渲染值
              var res = "";
              var max = _this.getObjectValue("memory", 512, pending);
              var balloon = _this.getObjectValue("balloon", undefined, pending);
              var shares = _this.getObjectValue("shares", undefined, pending);
              res = byteToSize(max * 1024 * 1024);
              if (balloon !== undefined && balloon > 0) {
                res = byteToSize(balloon * 1024 * 1024) + "/" + res;
                if (shares) {
                  res += " [shares=" + shares + "]";
                }
              } else if (balloon === 0) {
                res += " [balloon=0]";
              }
              if(/^[0]/.test(res)) return;
              return res;
            },
          },
          {
            name: gettext("Processors"),
            type: "sockets",
            icon: "icon-cpu",
            itemId: 'addsockets',
            render: function (pending) {
              let sockets = _this.getObjectValue("sockets", 1, pending);
              let model = _this.getObjectValue("cpu", undefined, pending);
              let cores = _this.getObjectValue("cores", 1, pending);
              let numa = _this.getObjectValue("numa", undefined, pending);
              let vcpus = _this.getObjectValue("vcpus", undefined, pending);
              let cpulimit = _this.getObjectValue(
                "cpulimit",
                undefined,
                pending
              );
              let cpuunits = _this.getObjectValue(
                "cpuunits",
                undefined,
                pending
              );
              let res = stringFormat(
                "{0} ({1} sockets, {2} cores)",
                sockets * cores,
                sockets,
                cores
              );
              if (model) {
                res += " [" + model + "]";
              }
              if (numa) {
                res += " [numa=" + numa + "]";
              }
              if (vcpus) {
                res += " [vcpus=" + vcpus + "]";
              }
              if (cpulimit) {
                res += " [cpulimit=" + cpulimit + "]";
              }
              if (cpuunits) {
                res += " [cpuunits=" + cpuunits + "]";
              }
							//if(pending && isEmpty(_this.store.sockets.data && _this.store.sockets.data.pending)) return '';
              return res;
            },
          },
          {
            name: "BIOS",
            type: "bios",
            itemId: 'addbios',
            icon: "fa-microchip",
            render: function (pending) {
              if(pending)
               return _this.store.bios && _this.store.bios.data &&  _this.store.bios.data.pending ? render_qemu_bios(_this.store.bios.data && _this.store.bios.data.pending) : '';
              else
                return _this.store.bios ? render_qemu_bios(_this.store.bios.data && _this.store.bios.data.value) : '默认 (SeaBIOS)';
            },
          },
          {
            name: gettext("Display"),
            type: "vga",
            itemId:'addvga',
            icon: "fa-desktop",
            render: function (pending) {
              if (pending) {
                return _this.store.vga && _this.store.vga.data && !isEmpty(_this.store.vga.data.pending)
                  ? render_kvm_vga_driver(_this.store.vga.data.pending)
                  : "";
              } else {
                return _this.store.vga && _this.store.vga.data && !isEmpty(_this.store.vga.data.value)
                  ? render_kvm_vga_driver(_this.store.vga.data.value)
                  : "默认";
              }
            },
          },
          {
            name: gettext("Machine"),
            type: "machine",
            icon: "fa-cogs",
            itemId: 'addmachine',
            render: function (pending) {
              if (pending) {
                return _this.store.machine && _this.store.machine.data && _this.render_qemu_machine(
                  !isEmpty(_this.store.machine.data.pending)
                    ? _this.store.machine.data.pending
                    : ""
                );
              } else {
                return _this.store.machine && _this.store.machine.data ? _this.render_qemu_machine(
                  !isEmpty(_this.store.machine.data.value)
                    ? _this.store.machine.data.value
                    : ""
                ) : "默认(i440fx)";
              }
            },
          },
          {
            name: gettext("SCSI Controller"),
            type: "scsihw",
            itemId: 'addscsihw',
            icon: "fa-database",
            render: function (pending) {
              if (pending) {
                return _this.store.scsihw && _this.store.scsihw.data && _this.store.scsihw.data.pending && _this.render_scsihw(
                  !isEmpty(_this.store.scsihw.data.pending)
                    ? _this.store.scsihw.data.pending
                    : ""
                );
              } else {
                return _this.store.scsihw && _this.store.scsihw.data && _this.render_scsihw(
                  !isEmpty(_this.store.scsihw.data.value)
                    ? _this.store.scsihw.data.value
                    : ""
                );
              }
            },
          },
        ];

        forEachBus(undefined, (type, id) => {
          let confid = type + id;
          if (this.store.hasOwnProperty(confid)) {
            _this.hardwareList.push({
              name: /scsi/.test(confid)
                ? gettext("Hard Disk") + " (" + confid + ")"
                : !_this.isCloudInit(confid)
                ? gettext("CD/DVD Drive") + " (" + confid + ")"
                : gettext("CloudInit Drive") + " (" + confid + ")",
              type: confid,
              itemId: /scsi/.test(confid)
                ? "adddisk"
                : !_this.isCloudInit(confid)
                ? "addcdrom"
                : "addci",
              icon: /scsi/.test(confid)
                ? "fa-hdd-o"
                : !_this.isCloudInit(confid)
                ? "icon-cd"
                : "icon-harddisk",
              render: function (pending) {
                if (pending) {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                    ? _this.store[confid].data.pending
                    : "";
                } else {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value) && _this.store[confid].data.delete ?
                     _this.store[confid].data.value + "delete:true"
                    : _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value) ? _this.store[confid].data.value
                    : '';
                }
              },
            });
          }
        });

        for (let i = 0; i < _this.hardware_counts.net; i++) {
          let confid = "net" + i.toString();
          if (_this.store.hasOwnProperty(confid)) {
            _this.hardwareList.push({
              icon: "fa-exchange",
              type: confid,
              itemId: 'addnet',
              name: gettext("Network Device") + " (" + confid + ")",
              render: function (pending) {
                if (pending) {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                    ? _this.store[confid].data.pending
                    : "";
                } else {
                 return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value) && _this.store[confid].data.delete ?
                     _this.store[confid].data.value + "delete:true"
                    : _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value) ? _this.store[confid].data.value
                    : '';
                }
              },
            });
          }
        }
        if (_this.store.hasOwnProperty("efidisk0")) {
           _this.hardwareList.push({
            icon: "fa-hdd-o",
            type: "efidisk0",
            itemId: 'addefidisk',
            name: gettext("EFI Disk"),
            render: function (pending) {
              if (pending) {
                return _this.store.efidisk0 && _this.store.efidisk0.data && !isEmpty(
                  _this.store.efidisk0 && _this.store.efidisk0.data.pending
                )
                  ? _this.store.efidisk0.data.pending
                  : "";
              } else {
                return _this.store.efidisk0 && _this.store.efidisk0.data && !isEmpty(
                  _this.store.efidisk0 && _this.store.efidisk0.data.value
                )
                  ? _this.store.efidisk0.data.value
                  : "";
              }
            },
          });
        }

        for (let i = 0; i < _this.hardware_counts.usb; i++) {
          let confid = "usb" + i.toString();
          if (this.store.hasOwnProperty(confid)) {
            _this.hardwareList.push({
              icon: "icon-usb",
              type: confid,
              itemId: 'addusb',
              name: gettext("USB Device") + " (" + confid + ")",
              render: function (pending) {
                if (pending) {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                    ? _this.store[confid].data.pending
                    : "";
                } else {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value)
                    ? _this.store[confid].data.value
                    : "";
                }
              },
            });
          }
        }

        for (let i = 0; i < _this.hardware_counts.hostpci; i++) {
          let confid = "hostpci" + i.toString();
          if (this.store.hasOwnProperty(confid)) {
            _this.hardwareList.push({
              icon: "icon-pci",
              type: confid,
              itemId: 'addpci',
              name: gettext("PCI Device") + " (" + confid + ")",
              render: function (pending) {
                if (pending) {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                    ? _this.store[confid].data.pending
                    : "";
                } else {
                  return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value)
                    ? _this.store[confid].data.value
                    : "";
                }
              },
            });
           }
          }

          for (let i = 0; i < _this.hardware_counts.serial; i++) {
            let confid = "serial" + i.toString();
            if (this.store.hasOwnProperty(confid)) {
              _this.hardwareList.push({
                icon: "icon-serial",
                type: confid,
                itemId: 'addserial',
                name: gettext("Serial Port") + " (" + confid + ")",
                render: function (pending) {
                  if (pending) {
                    return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                      ? _this.store[confid].data.pending
                      : "";
                  } else {
                    return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value)
                      ? _this.store[confid].data.value
                      : "";
                  }
                },
              });
             }
            }

            if (_this.store.hasOwnProperty("audio0")) {
              _this.hardwareList.push({
                icon: "fa-volume-up",
                type: "audio0",
                 itemId: 'addaudio',
                name: gettext("Audio Device"),
                render: function () {
                  return  _this.store["audio0"] && _this.store["audio0"].data && !isEmpty(
                    _this.store["audio0"] && _this.store["audio0"].data.pending
                  )
                    ? _this.store["audio0"].data.pending
                    : "";
                },
              });
            }


            for (let i = 0; i < 256; i++) {
              let confid = "unused" + i.toString();
              if (this.store.hasOwnProperty(confid)) {
                _this.hardwareList.push({
                  icon: "fa-hdd-o",
                  type: confid,
                  itemId: 'adddisk',
                  name: gettext("Unused Disk") + " " + i.toString(),
                  render: function (pending) {
                    if (pending) {
                      return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                        ? _this.store[confid].data.pending
                        : "";
                    } else {
                      return !isEmpty(_this.store[confid].data.value)
                        ? _this.store[confid].data.value
                        : "";
                    }
                  },
                });
              }
            }

            if (_this.store.hasOwnProperty("rng0")) {
              _this.hardwareList.push({
                  icon: "icon-die",
                  name: gettext("VirtIO RNG"),
                  type: "rng0",
                   itemId: 'addrng',
                  render: function (pending) {
                    let confid= 'rng0'
                    if (pending) {
                      return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending)
                        ? _this.store[confid].data.pending
                        : "";
                    } else {
                      return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value)
                        ? _this.store[confid].data.value
                        : "";
                    }
                  },
                });
            }
            _this.setDisabled();
          })
      },
      setDisabled() {
         let _this = this,
         noSysConsolePerm = _this.db && _this.db.cap && this.db.cap.nodes && !this.db.cap.nodes['Sys.Console'],
         noVMConfigHWTypePerm = _this.db && _this.db.cap && this.db.cap.vms && !this.db.cap.vms['VM.Config.HWType'],
         noVMConfigNetPerm = _this.db && _this.db.cap && this.db.cap.vms && !this.db.cap.vms['VM.Config.Network'],
         hasCloudInit = false;
	       _this.db.volumeList.forEach(function(item){
          if (!hasCloudInit && (
              /vm-.*-cloudinit/.test(item.value) ||
              /vm-.*-cloudinit/.test(item.pending)
          )) {
              hasCloudInit = true;
          }
        })
         _this.menu_items.forEach((it, index) => {
           if(it.itemId == 'addpci') {
             it.disabled = (noSysConsolePerm || _this.isAtLimit('hostpci'))
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addaudio') {
             it.disabled = (noSysConsolePerm || _this.isAtLimit('audio'))
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addserial') {
             it.disabled = (noSysConsolePerm || _this.isAtLimit('serial'))
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addnet') {
             it.disabled = (noVMConfigNetPerm || _this.isAtLimit('net'))
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addrng') {
             it.disabled = (noSysConsolePerm || _this.isAtLimit('rng'))
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addefidisk') {
             it.disabled = (noSysConsolePerm || _this.isAtLimit('efidisk'))
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addci') {
             it.disabled = (noSysConsolePerm || hasCloudInit)
             _this.$set(this.menu_items, index, it);
           }
           if(it.itemId ==='addusb') {
             it.disabled = (noSysConsolePerm || _this.isAtLimit('usb'))
             _this.$set(this.menu_items, index, it);
           }
         })
      },
      handleDelete() {
        this.$confirm.confirm({
          msg: `你确定你要删除该项${this.currentObj.name}?`,
          icon: 'icon-question'
        }).then(res => {
          this.deleteHareWare({delete: this.current}).then(res => {
            this.__init__();
          }).catch(res => {
          this.$confirm.info({
            msg: res
          }).then(res => this.__init__()).catch(res => this.__init__())
         });
        })
      },
     isAtLimit(type) {
      let _this = this, hardware_counts = { net: 32, usb: 5, hostpci: 16, audio: 1, efidisk: 1, serial: 4, rng: 1 };
      const counts = _this.setCounts();
      return (counts[type] >= hardware_counts[type])
     },
    setCounts() {
      let _this = this,hardware_counts = { net: 32, usb: 5, hostpci: 16, audio: 1, efidisk: 1, serial: 4, rng: 1 };
     return Object.keys(_this.store).reduce((prev, curr) => {
        Object.keys(hardware_counts).forEach(it => {
            if(!prev.hasOwnProperty(it) && Object.keys(_this.store).join('').indexOf(it) > 0) {
               prev[it] = 1;
            } else {
              let regx = new RegExp(`\^\(${it}\)`, 'g');
              if(regx.test(curr)) {
                prev[it]++;
              }
            }
        })
        return prev;
      },{})
    },
    render_qemu_machine(value) {
      return value || "默认" + " (i440fx)";
    },
    render_scsihw: function (value) {
      if (!value) {
        return "默认" + " (LSI 53C895A)";
      } else if (value === "lsi") {
        return "LSI 53C895A";
      } else if (value === "lsi53c810") {
        return "LSI 53C810";
      } else if (value === "megasas") {
        return "MegaRAID SAS 8708EM2";
      } else if (value === "virtio-scsi-pci") {
        return "VirtIO SCSI";
      } else if (value === "virtio-scsi-single") {
        return "VirtIO SCSI single";
      } else if (value === "pvscsi") {
        return "VMware PVSCSI";
      } else {
        return value;
      }
    },
    getObjectValue(type, defaultValue, pending) {
      let _this = this;
      let rec = this.store[type];
      if (rec) {
        let value = rec.data.value;
        if (pending) {
          if (!isEmpty(rec.data.pending)) {
            value = rec.data.pending;
          } else if (rec.data["delete"] === 1) {
            value = defaultValue;
					}else {
						value = value;
					}
					return value;
        } else {
        if (!isEmpty(value)) {
          return value;
        } else {
          return defaultValue;
        }
				}
      }
      return defaultValue;
    },
    //添加硬盘等
    handleCommand(type, modaltype = 'create') {
      debugger;
      //硬盘类型如果modalType存在证明是添加
      this.type =(modaltype === 'create' || modaltype === 'resize') ? type : this.currentObj.itemId;
      //创建或者编辑
      this.modalType = modaltype !== 'create' ? modaltype : 'create';
      this.param = modaltype !== 'create' ? this.currentObj : {};
      this.visible = true;
    },
    //改变磁盘大小
    handleRestSize() {

    },
    //移动磁盘
    handleMoveDisk() {
    //硬盘类型如果modalType存在证明是添加
      this.type = 'migratedisk';
      //创建或者编辑
      this.modalType = 'create';
      this.param =this.currentObj;
      this.visible = true;
    },
    handleSingleSelect(row) {
      this.current = row.type;
      this.currentObj= row;
    },
    inType() {
      let states = [], arg = arguments, _this = this;
      if(this.current ===  '') return true;
      for(let i in arguments) {
        states.push(arguments[i])
      }
      if(_this.store[_this.current] && _this.store[_this.current].data && _this.store[_this.current].data.delete) return false;
      return !states.some(it => {
        let regx = new RegExp("\^\("+it+"\)", 'g');
        if(it === 'scsi') {
           regx = new RegExp("\^\("+it+"\)\\d\$", 'g');
        }
        return regx.test(_this.current)
      })
    },
    canResume() {
      return ( (this.store[this.current] && this.store[this.current].data && this.store[this.current].data.pending)
             ||  (this.store[this.current] && this.store[this.current].data && this.store[this.current].data.delete) )
             ? true
             : false;
    },
    handleResume() {
      let param = {};
      if(this.current ===  'memory') {
        param['revert'] = ['memory','balloon','shares'].join(',')
      } else if(this.current === 'sockets') {
        param['revert'] = ['sockets','cpu','cores', 'numa', 'vcpus', 'cpulimit', 'cpuunits'].join(',')
      } else {
         param['revert'] = this.current;
      }
      this.resume(param).then(res => {
        this.__init__();
      });
    },
    isCloudInit(confid) {
      let _this = this;
      return _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.pending) &&  /vm-.*-cloudinit/.test(_this.store[confid].data.pending)
             ||  _this.store[confid] && _this.store[confid].data && !isEmpty(_this.store[confid].data.value) &&  /vm-.*-cloudinit/.test(_this.store[confid].data.value)
    }
 }
};
</script>

<style lang="less" scoped>
.pending {
  color: #f87c7c;
}
.hardware-icon {
  width: 16px;
  vertical-align: middle;
  height: 19px;
  line-height: 19px;
  margin-right: 5px;
  background-size: 16px;
}
/deep/.el-table td, .el-table th{
  padding: 0px
}
/deep/.base-icon{
  background-size: 16px;
}
/deep/.tool-bar-left{
   flex: 2;
}
</style>
