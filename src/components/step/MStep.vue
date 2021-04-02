<template>
  <div
      class="m-step"
      :style="style"
      :class="[
      !isSimple && `is-${$parent.direction}`,
      isSimple && 'is-simple',
      isLast && !space && !isCenter && 'is-flex',
      isCenter && !isVertical && !isSimple && 'is-center'
     ]">
    <!-- icon & line -->
    <div
        class="m-step__head"
        :class="`is-${currentStatus}`">
      <div
          class="m-step__line"
          :style="__lineStyle"
      >
        <i class="m-step__line-inner" :style="lineStyle"></i>
      </div>

      <div class="m-step__icon" :class="`is-${icon ? 'icon' : 'text'}`">
        <slot
            v-if="currentStatus !== 'success' && currentStatus !== 'error'"
            name="icon">
          <i v-if="icon" class="m-step__icon-inner" :class="[icon]"></i>
          <div class="m-step__icon-inner" v-if="!icon && !isSimple">{{ index + 1 }}</div>
        </slot>
        <i
            v-else
            :class="['el-icon-' + (currentStatus === 'success' ? 'check' : 'close')]"
            class="m-step__icon-inner is-status"
        >
        </i>
      </div>
      <div
          class="m-step__title"
          ref="title"
          :class="['is-' + currentStatus]">
        <slot name="title">{{ title }}</slot>
      </div>
    </div>
    <!-- title & description -->
    <div class="m-step__main">
      <div v-if="isSimple" class="el-step__arrow"></div>
      <div
          v-else
          class="m-step__description"
          :class="['is-' + currentStatus]">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
//步骤条
  export default {
    name: 'ElStep',

    props: {
      title: String,
      icon: String,
      description: String,
      status: String
    },

    data() {
      return {
        index: -1,
        lineStyle: {},
        internalStatus: ''
      };
    },

    beforeCreate() {
      //将子组件中的状态添加到父组件的steps中
      this.$parent.steps.push(this);
    },

    beforeDestroy() {
      const steps = this.$parent.steps;
      const index = steps.indexOf(this);
      if (index >= 0) {
        steps.splice(index, 1);
      }
    },

    computed: {
      //计算当前step的状态
      currentStatus() {
        return this.status || this.internalStatus;
      },
      //上一个状态
      prevStatus() {
        const prevStep = this.$parent.steps[this.index - 1];
        return prevStep ? prevStep.currentStatus : 'wait';
      },
      //是否居中
      isCenter() {
        return this.$parent.alignCenter;
      },
      //是否在垂直方向
      isVertical() {
        return this.$parent.direction === 'vertical';
      },
      isSimple() {
        return this.$parent.simple;
      },
      //是否是最后一步
      isLast() {
        const parent = this.$parent;
        return parent.steps[parent.steps.length - 1] === this;
      },
      //总步骤数
      stepsCount() {
        return this.$parent.steps.length;
      },
      //空间
      space() {
        const { isSimple, $parent: { space } } = this;
        return isSimple ? '' : space ;
      },
      style: function() {
        const style = {};
        const parent = this.$parent;
        const len = parent.steps.length;

        const space = (typeof this.space === 'number'
          ? this.space + 'px'
          : this.space
            ? this.space
            : 100 / (len - (this.isCenter ? 0 : 1)) + '%');
        style.flexBasis = space;
        if (this.isVertical) return style;
        if (this.isLast) {
          style.maxWidth = 100 / this.stepsCount + '%';
        } else {
          style.marginRight = -this.$parent.stepOffset + 'px';
        }

        return style;
      },
      __lineStyle() {
        if(this.isLast) {
          return ''
        } else  {
          return {
            left: this.$refs.title.clientWidth + 30 + 'px'
          }
        }
      }
    },

    methods: {
      //更新步骤状态
      updateStatus(val) {
        const prevChild = this.$parent.$children[this.index - 1];

        if (val > this.index) {
          this.internalStatus = this.$parent.finishStatus;
        } else if (val === this.index && this.prevStatus !== 'error') {
          this.internalStatus = this.$parent.processStatus;
        } else {
          this.internalStatus = 'wait';
        }

        if (prevChild) prevChild.calcProgress(this.internalStatus);
      },
      //计算进度
      calcProgress(status) {
        let step = 100;
        const style = {};

        style.transitionDelay = 150 * this.index + 'ms';
        if (status === this.$parent.processStatus) {
          step = this.currentStatus !== 'error' ? 0 : 0;
        } else if (status === 'wait') {
          step = 0;
          style.transitionDelay = (-150 * this.index) + 'ms';
        }

        style.borderWidth = step && !this.isSimple ? '1px' : 0;
        this.$parent.direction === 'vertical'
          ? style.height = step + '%'
          : style.width = step + '%';

        this.lineStyle = style;
      }
    },

    mounted() {
      const unwatch = this.$watch('index', val => {
        this.$watch('$parent.active', this.updateStatus, { immediate: true });
        this.$watch('$parent.processStatus', () => {
          const activeIndex = this.$parent.active;
          this.updateStatus(activeIndex);
        }, { immediate: true });
        unwatch();
      });
    }
  };
</script>
<style scoped lang="less">
  @import '~@src/components/step/mstep.less';
</style>
