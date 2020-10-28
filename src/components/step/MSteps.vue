<template>
   <div class="m-steps">
      <slot></slot>
   </div>
</template>

<script>
  export default {
    name: "MSteps",
    props: {
      space: [Number, String],
      active: Number,
      direction: {
        type: String,
        default: 'horizontal'
      },
      alignCenter: Boolean,
      simple: Boolean,
      finishStatus: {
        type: String,
        default: 'finish'
      },
      processStatus: {
        type: String,
        default: 'process'
      }
    },

    data() {
      return {
        steps: [],
        stepOffset: 0
      };
    },

    watch: {
      active(newVal, oldVal) {
        this.$emit('change', newVal, oldVal);
      },

      steps(steps) {
        steps.forEach((child, index) => {
          child.index = index;
        });
      }
    }
  }
</script>

<style scoped lang="less">
 @import '~@src/components/step/msteps.less';
</style>
