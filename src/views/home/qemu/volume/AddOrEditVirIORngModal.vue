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
              prop="source"
              label="选择设备"
              labelWidth="100px"
              @on-change="handleSourceSelect"
              v-model="source"
              placeholder="请选设备"
            >
              <div class="table">
                <m-option
                  v-for="item in comboItems"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                >
                </m-option>
              </div>
            </m-select>
            <m-input
              type="number"
              labelWidth="100px"
              label="Limit(Bytes/Period)"
              v-model="max_bytes"
            >
            </m-input>
            <m-input
              type="number"
              labelWidth="100px"
              label="Period(ms)"
              v-model="period"
            >
            </m-input>
						<div v-show="!max_bytes" class="warning">
							Disabling the limiter can potentially allow a guest to overload the host. Proceed with caution.
						</div>
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
  name: "AddOrEditVirIORngModal",
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
      max_bytes: "1024",
      period: "",
      source: "/dev/urandom",
      comboItems: [
        { label: "/dev/urandom", value: "/dev/urandom" },
        { label: "/dev/random", value: "/dev/random" },
        { label: "/dev/hwrng", value: " /dev/hwrng" },
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
      if (this.max_bytes) {
        device += `max_bytes=${this.max_bytes},`;
			}
			if(this.period) {
				device += `period=${this.period},`;
			}
      if (this.source) {
        device += `source=${this.source},`;
      }
      let param = {
        [`rng0`]: device.replace(/(\,)$/, ""),
        digest: this.db.qemuConfigObj.digest,
      };
      if(this.modalType !== 'edit') {
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
    handleSourceSelect(value) {
      this.source = value;
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