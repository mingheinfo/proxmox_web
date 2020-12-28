<template>
  <div class="overview">
    <overview-card style="width: calc(100%)">
      <div slot="title">状态</div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <single-line
            :desc="db.poolsObj && db.poolsObj.comment && db.poolsObj.comment"
						title="备注"
						:__style="{whiteSpace:'normal'}"
          />
        </div>
      </div>
    </overview-card>
  </div>
</template>

<script>
import PoolsHttp from "@src/views/home/pool/http";
import SingleLine from "@src/components/chart/line/SingleLine";
import OverviewCard from "@src/components/card/OverviewCard";
import { render_uptime, byteToSize } from "@libs/utils";
export default {
  name: "StorageOverview",
  mixins: [PoolsHttp],
  components: {
    SingleLine,
    OverviewCard
  },
  data() {
    return {
    };
  },
  methods: {
    render_uptime,
    byteToSize,
    __init__() {
      this.queryPoolList();
    },
  },
  mounted() {
    this.__init__();
  },
  watch: {
    "$store.state.db.lastSelectObj": function (newVal, oldVal) {
      if (newVal !== oldVal && newVal.type === "storage") {
        this.__init__();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.overview {
  &-select {
    margin: 5px 10px;
    position: relative;
    background-color: #fff;
    text-align: right;

    &:after {
      position: absolute;
      top: 36%;
      right: 11px;
      background-color: transparent;
      color: #52545c;
      font: normal normal normal 12px FontAwesome;
      content: "\F0D7";
      pointer-events: none;
      font-size: 11px;
    }
  }
}
</style>
