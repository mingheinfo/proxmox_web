<template>
  <div class="base-icon" :style="__style"></div>
</template>

<script>
  import { requireAll2Obj } from "@libs/utils";

  let svgs = requireAll2Obj((require.context('../../assets/', true, /\.(png|svg)$/)));
  export default {
    name: 'BaseIcon',
    props: {
      name: {
        type: String,
        required: true,
        validator: function (value) {
          let svgNames = Object.keys(svgs)
          return svgNames.some((item) => item === value)
        }
      },
      _style: Object
    },
    computed: {
      __style() {
        return {
          backgroundImage: `url(${svgs[this.name]})`,
          backgroundRepeat: 'no-repeat',
          ...this._style
        }
      }
    }
  }
</script>

<style scoped>
  .base-icon {
    display: inline-block;
    height: 36px;
    width: 36px;
    margin-right: 10px;
    vertical-align: middle;
  }
</style>
