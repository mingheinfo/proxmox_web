<template>
  <m-dialog
    title="添加磁盘"
    :visible="visible"
    v-if="visible"
    @confirm="confirm"
    @cancel="close"
    :_style="{
      width: '946px',
    }"
    @close="close"
  >
    <div slot="content" style="max-height: 400px; overflow: auto">
      <div class="m-form__section">
        <dl>
          <dt>基本信息</dt>
          <dd>
            <m-select
              prop="device"
              label="选择设备"
              labelWidth="100px"
              @on-change="handleDeviceSelect"
              v-model="device"
              placeholder="请选设备"
            >
              <div class="table">
                <m-option
                  v-for="item in deviceItems"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                >
                </m-option>
              </div>
            </m-select>
            <m-input
              type="number"
              label="后端驱动器"
              v-model="driver"
              :disabled="true"
            >
              <div slot="other" class="disabled" style="padding-left: 5px; height: 28px; line-height: 28px;">spice</div>
            </m-input>
          </dd>
        </dl>
      </div>
    </div>
    <template slot="footer">
      <m-button
        type="primary"
        style="height: 40px; line-height: 40px; width: 100px"
        @on-click="confirm()"
        >确定</m-button
      >
    </template>
  </m-dialog>
</template>

<script>
import VolumeHttp from "@src/views/home/qemu/volume/http";
export default {
  name: "AddOrEditAudioModal",
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
      device: "ich9-intel-hda",
      driver: "spice",
      usedIDList: [],
      deviceItems: [
        {
          label: "ich9-intel-hda",
          value: "ich9-intel-hda",
        },
        {
          label: "intel-hda",
          value: "intel-hda",
        },
        {
          label: "AC97",
          value: "AC97",
        },
      ],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    __init__() {
			let _this = this;
      this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        if (_this.modalType === "edit") {
          if (_this.param.type) {
            _this.parseValue(_this.db.qemuConfigObj[_this.param.type]);
          }
        }
      });
    },
    parseValue(value) {
      let values = value.split(","),
        _this = this;
      if (values) {
        for (let i in values) {
          _this[values[i].split("=")[0]] = values[i].split("=")[1];
        }
      }
    },
    confirm() {
      let device = "";
      if (this.device) {
        device += `device=${this.device},`;
      }
      if (this.driver) {
        device += `driver=${this.driver},`;
      }
      let param = {
        [`audio0`]: device.replace(/(\,)$/, ""),
        digest: this.db.qemuConfigObj.digest,
      };
      if (this.modalType !== "edit") {
        this.createHardWare(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      } else {
        this.updateHardWare(param)
          .then((res) => {
            this.close();
          })
          .catch((res) => {
            this.$confirm.confirm({
              msg: res,
            });
          });
      }
    },
    close() {
      this.$emit("close");
    },
    handleDeviceSelect(value) {
      this.device = value;
    },
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