<script>
  import { throttle } from '@libs/utils/index'
  export default {
    name: 'm-scrollbar',
    mounted: function () {
      //初始化滚动条
      this.initScrollbar()
    },
    destroyed: function () {
      if (this.scrollContainerObserver) {
        this.scrollContainerObserver.disconnect()
        this.scrollContainerObserver = null
      } else {
        console.error(`${this.$options.name} calls destroyed twice!`)
      }
      window.removeEventListener('resize', throttle(this.computeScroll, 200))
    },
    data () {
      return {
        scrollTop: 0,
        scrollLength: 0,
        showScrollbar: false,
        startDrag: false,
        oldScreenY: 0,
        oldScrollTop: 0,
        scrollElement: null,
        scrollContainer: null,
        scrollContainerObserver: null
      }
    },
    methods: {
      initScrollbar: function () {
        //监听滚动条容器如果存在则断开连接清空
        if (this.scrollContainerObserver) {
          this.scrollContainerObserver.disconnect()
          this.scrollContainerObserver = null
          window.removeEventListener('resize', throttle(this.computeScroll, 200))
        }
        let self = this
        let stopInterval = setInterval(() => {
          if (!self.$el) return
          self.scrollElement = self.$el.querySelector(self.scrollElementSelector)
          if (!self.scrollElement) return
          clearInterval(stopInterval)
          if (self.$el.className === 'container') {
            self.scrollContainer = self.$el
          } else {
            self.scrollContainer = self.$el
          }
          //监听容器变化
          self.scrollContainerObserver = new MutationObserver(function (mutations) {
            self.computeScroll()
          })
          //监听容器中元素的变化
          // pass in the target node, as well as the observer options
          self.scrollContainerObserver.observe(self.scrollContainer, { childList: true, subtree: true });
          // self.computeScroll()
          // late 1 ms to compute scroll. Several windows don't ready at this time.
          setTimeout(self.computeScroll, 1)
          window.addEventListener('resize', this.computeScroll)
        }, 0)
      },
      onScroll: throttle(function($event) {
        this.scrollLength = $event.target.parentElement.clientHeight * $event.target.parentElement.clientHeight / $event.target.scrollHeight
        this.scrollTop = $event.target.scrollTop / $event.target.scrollHeight * $event.target.parentElement.clientHeight
      },20),
      computeScroll: function () {
        if (this.startDrag) return
        //当滚动条的高度大于可视区的高度时证明出现滚动条
        this.showScrollbar = (this.scrollElement.scrollHeight - this.scrollContainer.clientHeight) > 1
        //计算滚动条长度随着滚动条高度越高则滚动条长度越小
        this.scrollLength = this.scrollContainer.clientHeight * this.scrollContainer.clientHeight / this.scrollElement.scrollHeight
        //滚动条距离顶部的距离
        this.scrollTop = this.scrollElement.scrollTop / this.scrollElement.scrollHeight * this.scrollContainer.clientHeight
      },
      onScrollBarMouseDown: function ($event) {
        document.addEventListener('mousemove', this.onScrollBarMouseMove, false)
        document.addEventListener('mouseup', this.onScrollBarMouseUp, false)
        this.startDrag = true
        this.oldScreenY = $event.screenY
        this.oldScrollTop = this.scrollTop
        $event.preventDefault()
        $event.stopPropagation()
      },
      onScrollBarMouseMove: function ($event) {
        const deltaY = $event.screenY - this.oldScreenY
        this.scrollTop = this.oldScrollTop + deltaY
        if (this.scrollTop < 0) this.scrollTop = 0
        if (this.scrollTop + this.scrollLength > this.scrollContainer.clientHeight) {
          this.scrollTop = this.scrollContainer.clientHeight - this.scrollLength
        }
        this.scrollElement.scrollTop = this.scrollTop / this.scrollContainer.clientHeight * this.scrollElement.scrollHeight
        $event.preventDefault()
        $event.stopPropagation()
      },
      onScrollBarMouseUp: function ($event) {
        this.startDrag = false
        document.removeEventListener('mousemove', this.onScrollBarMouseMove, false)
        document.removeEventListener('mouseup', this.onScrollBarMouseUp, false)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
