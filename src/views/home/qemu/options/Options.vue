<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button
        type="warning"
        @on-click="handleCommand('', 'edit')"
        icon="el-icon-edit"
        :disabled="canDisabled()"
        >编辑</m-button
      >
      <m-button
        type="primary"
        @on-click="handleResume()"
        icon="el-icon-refresh"
        :disabled="!canResume()"
        >还原</m-button
      >
    </div>
    <div slot="page-content">
      <option-edit-modal
        :visible="visible"
        v-if="visible"
        :modal-type="modalType"
        :param="param"
        :title="title"
        @close="
          visible = false;
          __init__();
        "
      ></option-edit-modal>
      <template v-if="node.type === 'qemu'">
        <el-table 
            :data="hardwareList"
            :show-header="false"
            highlight-current-row
            @row-click="handleSingleSelect"
          >
            <el-table-column width="55px">
              <template slot-scope="scope">
                <el-radio :label="scope.row.type" v-model="current"
                  >&nbsp;</el-radio
                >
              </template>
            </el-table-column>
            <el-table-column label="名称" prop="name" width="200px">
              <template slot-scope="scope">
                <div>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="值" prop="value">
              <template slot-scope="scope">
                <div>
                  {{ scope.row && scope.row.render && scope.row.render(false) }}
                </div>
                <div class="pending">
                  {{ scope.row && scope.row.render && scope.row.render(true) }}
                </div>
              </template>
            </el-table-column>
          </el-table>
      </template>
      <template v-if="node.type === 'lxc'">
        <el-table 
          :data="lxcOptionList"
          :show-header="false"
          highlight-current-row
          @row-click="handleSingleSelect"
        >
          <el-table-column width="55px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.type" v-model="current"
                >&nbsp;</el-radio
              >
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="name" width="200px">
            <template slot-scope="scope">
              <div>
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="value">
            <template slot-scope="scope">
              <div>
                {{ scope.row && scope.row.render && scope.row.render(false) }}
              </div>
              <div class="pending" v-if="/^(edit)/.test(scope.row.itemId)">
                {{ scope.row && scope.row.render && scope.row.render(true) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
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
  parseStartup,
  render_kvm_ostype,
  render_hotplug_features,
  render_spice_enhancements,
  render_qga_features,
} from "@libs/utils/index";
import { gettext } from "@src/i18n/local_zhCN.js";
import BaseIcon from "@src/components/icon/BaseIcon.vue";
import PageTemplate from "@src/components/page/PageTemplate.vue";
import OptionEditModal from "./OptionEditModal";
export default {
  name: "Volume",
  mixins: [VolumeHttp],
  components: {
    BaseIcon,
    PageTemplate,
    OptionEditModal,
  },
  data() {
    let _this = this;
    return {
      hardwareList: [],
      lxcOptionList: [],
      store: {},
      current: "",
      currentObj: "",
      visible: false,
      type: "",
      modalType: "create",
      param: {},
      jobText: "删除中...",
      statusObj: {},
      jobVisible: "",
      jobTitle: "",
      title: "",
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
        _this.hardwareList = [
          {
            name: gettext("Name"), //名称
            type: "name", //数据类型
            itemId: "editname", //添加弹框id
            render: function (pending) {
              //渲染值
              if (!pending)
                return _this.store.name &&
                  _this.store.name.data &&
                  _this.store.name.data.value
                  ? _this.store.name.data.value
                  : _this.node.name;
              else
                return _this.store.name &&
                  _this.store.name.data &&
                  _this.store.name.data.pending
                  ? _this.store.name.data.pending
                  : "";
            },
          },
          //开机
          {
            name: gettext("Start at boot"),
            type: "onboot",
            itemId: "editboot",
            render: function (pending) {
              if (!pending)
                return _this.format_boolean(
                  _this.store.onboot &&
                    _this.store.onboot.data &&
                    _this.store.onboot.data.value
                );
            },
          },
          //启动
          {
            name: "开机启动顺序",
            type: "startup",
            itemId: "editstartup",
            render: function (pending) {
              if (pending)
                return _this.store.startup &&
                  _this.store.startup.data &&
                  _this.store.startup.data.pending
                  ? _this.render_kvm_startup(
                      _this.store.startup.data &&
                        _this.store.startup.data.pending
                    )
                  : "";
              else
                return _this.store.startup
                  ? _this.render_kvm_startup(
                      _this.store.startup.data && _this.store.startup.data.value
                    )
                  : "order=any";
            },
          },
          {
            name: gettext("OS Type"),
            type: "ostype",
            itemId: "editostype",
            render: function (pending) {
              if (_this.node.type === "qemu") {
                if (pending) {
                  return _this.store.ostype &&
                    _this.store.ostype.data &&
                    !isEmpty(_this.store.ostype.data.pending)
                    ? render_kvm_ostype(_this.store.ostype.data.pending)
                    : "";
                } else {
                  return _this.store.ostype &&
                    _this.store.ostype.data &&
                    !isEmpty(_this.store.ostype.data.value)
                    ? render_kvm_ostype(_this.store.ostype.data.value)
                    : "默认";
                }
              } else {
                if (pending) return "";
                return _this.store.ostype.data.value;
              }
            },
          },
          {
            //引导顺序
            name: gettext("Boot Order"),
            type: "boot",
            itemId: "editorder",
            render: function (pending) {
              var i;
              var text = "";
              var bootdisk = _this.getObjectValue(
                "bootdisk",
                undefined,
                pending
              );
              let order =
                (_this.store &&
                  _this.store.boot &&
                  _this.store.boot.data &&
                  _this.store.boot.data.value) ||
                "cdn";
              for (i = 0; i < order.length; i++) {
                var sel = order.substring(i, i + 1);
                if (text) {
                  text += ", ";
                }
                if (sel === "c") {
                  if (bootdisk) {
                    text += "Disk '" + bootdisk + "'";
                  } else {
                    text += "Disk";
                  }
                } else if (sel === "n") {
                  text += "Network";
                } else if (sel === "a") {
                  text += "Floppy";
                } else if (sel === "d") {
                  text += "CD-ROM";
                } else {
                  text += sel;
                }
              }
              if (pending) if (text === `Disk 'scsi0', CD-ROM, Network`) return;
              return text;
            },
          },
          {
            name: gettext("Use tablet for pointer"),
            type: "tablet",
            itemId: "edittablet",
            render: function (pending) {
              if (pending)
                return _this.store &&
                  _this.store.tablet &&
                  _this.store.tablet.data &&
                  _this.store.tablet.data.pending
                  ? _this.format_boolean(_this.store.tablet.data.pending)
                  : "";
              else
                return _this.store &&
                  _this.store.tablet &&
                  _this.store.tablet.data &&
                  _this.store.tablet.data.value &&
                  _this.store.tablet.data.value
                  ? _this.format_boolean(_this.store.tablet.data.value)
                  : "是";
            },
          },
          {
            name: gettext("Hotplug"),
            type: "hotplug",
            itemId: "edithotplug",
            render: function (pending) {
              if (pending)
                return !isEmpty(
                  _this.store &&
                    _this.store.hotplug &&
                    _this.store.hotplug.data &&
                    _this.store.hotplug.data.pending
                )
                  ? render_hotplug_features(_this.store.hotplug.data.pending)
                  : "";
              else
                return _this.store &&
                  _this.store.hotplug &&
                  _this.store.hotplug.data &&
                  _this.store.hotplug.data.value
                  ? render_hotplug_features(_this.store.hotplug.data.value)
                  : "磁盘，网络，usb";
            },
          },
          {
            name: gettext("ACPI support"),
            type: "acpi",
            itemId: "editacpi",
            render: function (pending) {
              if (pending) {
                return _this.store &&
                  _this.store.acpi &&
                  _this.store.acpi.data &&
                  String(_this.store.acpi.data.pending)
                  ? _this.format_boolean(_this.store.acpi.data.pending)
                  : "";
              } else {
                return _this.store &&
                  _this.store.acpi &&
                  _this.store.acpi.data &&
                  _this.store.acpi.data.value &&
                  _this.store.acpi.data.value
                  ? _this.format_boolean(_this.store.acpi.data.value)
                  : "是";
              }
            },
          },
          {
            name: gettext("KVM hardware virtualization"),
            type: "kvm",
            itemId: "editkvm",
            render: function (pending) {
              if (pending)
                return _this.store &&
                  _this.store.kvm &&
                  _this.store.kvm.data &&
                  String(_this.store.kvm.data.pending)
                  ? _this.format_boolean(_this.store.kvm.data.pending)
                  : "";
              else {
                return _this.store &&
                  _this.store.kvm &&
                  _this.store.kvm.data &&
                  _this.store.kvm.data.value &&
                  _this.store.kvm.data.value
                  ? _this.format_boolean(_this.store.kvm.data.value)
                  : "是";
              }
            },
          },
          {
            name: gettext("Freeze CPU at startup"),
            type: "freeze",
            itemId: "editfreeze",
            render: function (pending) {
              if (pending)
                return _this.store &&
                  _this.store.freeze &&
                  _this.store.freeze.data &&
                  String(_this.store.freeze.data.pending) &&
                  _this.store.freeze.data.pending
                  ? _this.format_boolean(_this.store.freeze.data.pending)
                  : "";
              else
                return _this.format_boolean(
                  _this.store &&
                    _this.store.freeze &&
                    _this.store.freeze.data &&
                    _this.store.freeze.data.value &&
                    _this.store.freeze.data.value
                );
            },
          },
          {
            name: gettext("Use local time for RTC"),
            type: "localtime",
            itemId: "editlocaltime",
            render: function (pending) {
              if (pending)
                return _this.store &&
                  _this.store.localtime &&
                  _this.store.localtime.data &&
                  String(_this.store.localtime.data.pending)
                  ? _this.format_boolean(_this.store.localtime.data.pending)
                  : "";
              else
                return _this.format_boolean(
                  _this.store &&
                    _this.store.localtime &&
                    _this.store.localtime.data &&
                    _this.store.localtime.data.value
                );
            },
          },
          {
            name: gettext("RTC start date"),
            type: "startdate",
            itemId: "editstartdate",
            render: function (pending) {
              if (pending)
                return _this.store &&
                  _this.store.startdate &&
                  _this.store.startdate.data &&
                  String(_this.store.startdate.data.pending)
                  ? _this.store.startdate.data.pending
                  : "";
              else
                return (
                  (_this.store &&
                    _this.store.startdate &&
                    _this.store.startdate.data &&
                    _this.store.startdate.data.value) ||
                  "now"
                );
            },
          },
          {
            name: gettext("SMBIOS settings (type1)"),
            type: "smbios1",
            itemId: "editsmbios1",
            render: function (pending) {
              if (!pending)
                return (
                  (_this.store &&
                    _this.store.smbios1 &&
                    _this.store.smbios1.data &&
                    _this.store.smbios1.data.value) ||
                  ""
                );
              else
                return (
                  (_this.store &&
                    _this.store.smbios1 &&
                    _this.store.smbios1.data &&
                    _this.store.smbios1.data.pending &&
                    _this.store.smbios1.data.pending) ||
                  ""
                );
            },
          },
          {
            name: "QEMU Guest Agent",
            type: "agent",
            itemId: "editagent",
            render: function (pending) {
              if (!pending)
                return render_qga_features(
                  _this.store &&
                    _this.store.agent &&
                    _this.store.agent.data &&
                    _this.store.agent.data.value
                    ? _this.store.agent.data.value
                    : undefined
                );
              else
                return (
                  _this.store &&
                  _this.store.agent &&
                  _this.store.agent.data &&
                  _this.store.agent.data.pending &&
                  render_qga_features(_this.store.agent.data.pending)
                );
            },
          },
          {
            name: gettext("Protection"),
            type: "protection",
            itemId: "editprotection",
            render: function (pending) {
              if (!pending)
                return _this.format_boolean(
                  _this.store &&
                    _this.store.protection &&
                    _this.store.protection.data &&
                    _this.store.protection.data.value
                );
            },
          },
          {
            name: gettext("Spice Enhancements"),
            type: "spice_enhancements",
            itemId: "editspice_enhancements",
            render: function (pending) {
              if (pending)
                return _this.store &&
                  _this.store.spice_enhancements &&
                  _this.store.spice_enhancements.data &&
                  _this.store.spice_enhancements.data.pending
                  ? render_spice_enhancements(
                      _this.store.spice_enhancements.data.pending
                    )
                  : "";
              else
                return render_spice_enhancements(
                  _this.store &&
                    _this.store.spice_enhancements &&
                    _this.store.spice_enhancements.data &&
                    _this.store.spice_enhancements.data.value
                );
            },
          },
          {
            name: gettext("VM State storage"),
            type: "vmstatestorage",
            itemId: "editvmstatestorage",
            render: function (pending) {
              if (!pending)
                return (
                  (_this.store &&
                    _this.store.vmstatestorage &&
                    _this.store.vmstatestorage.data &&
                    _this.store.vmstatestorage.data.value) ||
                  "自动"
                );
            },
          },
        ];

        this.lxcOptionList = [
          {
            name: gettext("Start at boot"),
            defaultValue: "",
            type: "onboot",
            itemId: "editboot",
            render: function (pending) {
              if (!pending)
                return _this.format_boolean(
                  _this.store.onboot &&
                    _this.store.onboot.data &&
                    _this.store.onboot.data.value
                )
            }
          },
         //启动
          {
            name: "开机启动顺序",
            type: "startup",
            itemId: "editstartup",
            render: function (pending) {
              if (pending)
                return _this.store.startup &&
                  _this.store.startup.data &&
                  _this.store.startup.data.pending
                  ? _this.render_kvm_startup(
                      _this.store.startup.data &&
                        _this.store.startup.data.pending
                    )
                  : "";
              else
                return _this.store.startup
                  ? _this.render_kvm_startup(
                      _this.store.startup.data && _this.store.startup.data.value
                    )
                  : "order=any";
            },
          },
          {
            name: gettext("OS Type"),
            type: "ostype",
            itemId: "ostype",
            render: function (pending) {
              return _this.store.ostype && _this.store.ostype.data && _this.store.ostype.data.value;
            },
          },
          {
            name: gettext("Architecture"),
            type: "arch",
            itemId: "arch",
            render: function (pending) {
              return _this.store.arch && _this.store.arch.data && _this.store.arch.data.value;
            },
          },
          {
            name: "/dev/console",
            type: "console",
            itemId: "editconsole",
            render: function (pending) {
              if(!pending)
              return _this.store.console && _this.store.console.data && _this.store.console.data.value  === 1 ? '已启用' : '已启用';
              else return _this.store.console && _this.store.console.data && _this.store.console.data.pending ?  (_this.store.console.data.pending === 1 ? '已启用' : '已禁用') : '';
            },
          },
          {
            name: gettext("TTY count"),
            type: 'tty',
            itemId: 'edittty',
            render: function (pending) {
              debugger;
              if(!pending)
               return _this.store.tty && _this.store.tty && _this.store.tty.data.value || 2;
              else return _this.store.tty && _this.store.tty && _this.store.tty.data.pending && _this.store.tty.data.pending || '';
            },
          },
          {
            name: gettext("Console mode"),
            type: 'cmode',
            itemId: 'editcmode',
           render: function (pending) {
              if(!pending)
               return _this.store.cmode && _this.store.cmode.data && _this.store.cmode.data.value ||  'tty';
              else return _this.store.cmode && _this.store.cmode && _this.store.cmode.data.pending && _this.store.cmode.data.pending || '';
            },
          },
          {
            name: gettext("Protection"),
            type: "protection",
            itemId: "editprotection",
            render: function (pending) {
              if (!pending)
                return _this.format_boolean(
                  _this.store &&
                    _this.store.protection &&
                    _this.store.protection.data &&
                    _this.store.protection.data.value
                );
            },
          },
          {
            name: gettext("Unprivileged container"),
            type: 'unprivileged',
            itemId: 'unprivileged',
            render: function (pending) {
                return  _this.store &&
                    _this.store.unprivileged &&
                    _this.store.unprivileged.data &&
                    _this.store.unprivileged.data.value === 1 ? '是' : '否'
            },
          },
          {
            name: gettext("Features"),
            type: 'features',
            itemId: 'editfeatures',
             render: function (pending) {
               if(!pending)
                return  _this.store &&
                    _this.store.features &&
                    _this.store.features.data &&
                    _this.store.features.data.value || '无'
               else return _this.store &&
                    _this.store.features &&
                    _this.store.features.data &&
                    _this.store.features.data.pending || ''
            }
          }
        ];
        //_this.setDisabled();
      });
    },
    format_boolean: function (value) {
      return value ? "是" : "否";
    },
    //渲染启动
    render_kvm_startup: function (value) {
      let startup = parseStartup(value);

      var res = "order=";
      if (startup.order === undefined) {
        res += "any";
      } else {
        res += startup.order;
      }
      if (startup.up !== undefined) {
        res += ",up=" + startup.up;
      }
      if (startup.down !== undefined) {
        res += ",down=" + startup.down;
      }

      return res;
    },
    handleDelete() {
      this.$confirm
        .confirm({
          msg: `你确定你要删除该项${this.currentObj.name}?`,
          icon: "icon-question",
        })
        .then((res) => {
          this.deleteHareWare({ delete: this.current }).catch((res) => {
            this.$confirm
              .info({
                msg: res,
              })
              .then((res) => this.__init__())
              .catch((res) => this.__init__());
          });
        });
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
          } else {
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
    handleCommand(type) {
      //弹框类型
      this.modalType = this.currentObj.itemId;
      this.param = this.currentObj;
      this.setTitle(this.modalType);
      this.visible = true;
    },
    //设置标题
    setTitle(type) {
      let _this = this;
      switch (type) {
        case "editname":
          _this.title = "编辑：名称";
          break;
        case "editboot":
          _this.title = "编辑：开机自启动";
          break;
        case "editorder":
          _this.title = "编辑：引导顺序";
          break;
        case "editstartup":
          _this.title = "编辑：开机启动数据";
          break;
        case "editostype":
          _this.title = "编辑：OS类型";
          break;
        case "edittablet":
          _this.title = "编辑： 使用平板指针";
          break;
        case "edithotplug":
          _this.title = "编辑：热拔插";
          break;
        case "editacpi":
          _this.title = "编辑：ACPI支持";
          break;
        case "editkvm":
          _this.title = "编辑：KVM硬件虚拟化";
          break;
        case "editfreeze":
          _this.title = "编辑：启动时冻结CPU";
          break;
        case "editlocaltime":
          _this.title = "编辑：使用本地时间进行RTC";
          break;
        case "editstartdate":
          _this.title = "编辑：RTC开始时间";
          break;
        case "editsmbios1":
          _this.title = "编辑：SMBIOS设置（type1）";
          break;
        case "editprotection":
          _this.title = "编辑：保护";
          break;
        case "editspice_enhancements":
          _this.title = "编辑：Spice Enhancements";
          break;
        case "editvmstatestorage":
          _this.title = "编辑：VM Sate Storage";
          break;
        case "editagent":
          _this.title = "编辑：QEMU Guest Agent";
          break;
        case "editconsole":
          _this.title = "编辑：/dev/console";
          break;
        case "edittty":
          _this.title = "编辑：TTY技术器";
          break;
        case "editcmode":
          _this.title = "编辑：控制台模式";
          break;
        case "editfeatures":
          _this.title = "编辑：特权";
          break;
      }
    },
    handleResume() {
      let param = {};
      if (this.current === "memory") {
        param["revert"] = ["memory", "balloon", "shares"].join(",");
      } else if (this.current === "sockets") {
        param["revert"] = [
          "sockets",
          "cpu",
          "cores",
          "numa",
          "vcpus",
          "cpulimit",
          "cpuunits",
        ].join(",");
      } else {
        param["revert"] = this.current;
      }
      this.resume(param).then((res) => {
        this.__init__();
      });
    },
    //移动磁盘
    handleMoveDisk() {
      //硬盘类型如果modalType存在证明是添加
      this.type = "migratedisk";
      //创建或者编辑
      this.modalType = "create";
      this.param = this.currentObj;
      this.visible = true;
    },
    handleSingleSelect(row) {
      this.current = row.type;
      this.currentObj = row;
    },
    inType() {
      let states = [],
        arg = arguments,
        _this = this;
      if (this.current === "") return true;
      for (let i in arguments) {
        states.push(arguments[i]);
      }
      if (
        _this.store[_this.current] &&
        _this.store[_this.current].data &&
        _this.store[_this.current].data.delete
      )
        return false;
      return !states.some((it) => {
        let regx = new RegExp("^(" + it + ")", "g");
        if (it === "scsi") {
          regx = new RegExp("^(" + it + ")\\d$", "g");
        }
        return regx.test(_this.current);
      });
    },
    canResume() {
      //由于js将0视为false所以转化为'0'做判断
      return (this.store[this.current] &&
      this.store[this.current].data &&
      !isEmpty((this.store[this.current].data.pending || this.store[this.current].data === 0) ? String(this.store[this.current].data.pending) : undefined)
        ? true
        : false) ||
        (this.store[this.current] &&
          this.store[this.current].data &&
          this.store[this.current].data.delete)
        ? true
        : false;
    },
    canDisabled() {
      if(this.node.type === 'qemu')
       return !this.inType('serial', 'efidisk') || !this.current;
      else 
      return !/^(edit)/.test(this.currentObj.itemId) || !this.current;
    }
  },
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
/deep/.el-table td,
.el-table th {
  padding: 0px;
}
/deep/.base-icon {
  background-size: 16px;
}
</style>