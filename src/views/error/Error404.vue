<template>
  <div class="error404">
    <div class="error404-main">
      <div class="error404-main__text" style="margin-right: -5px">4</div>
      <div class="error404-main__zero"></div>
      <div class="error404-main__text" style="margin-left: -5px">4</div>
    </div>
			<a class="error404-link" @click="goHome">回到首页</a>
			<a class="error404-link" @click="back">回到上一页</a>
  </div>
</template>

<script>
export default {
	name: "Error404",
	methods: {
    back() {
			history.go(-1);
		},
		goHome() {
			this.$router.push('/datacenter/overview')
		}
	}
};
</script>
<style lang="less" scoped>
.error404 {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-grow: 1;
  justify-content: center;
	align-items: center;
	&-link{
	  position: relative;
    top: 88px;
    left: -134px;
		margin-right: 20px;
		cursor: pointer;
	}
  &-main {
    &__text {
      width: 57px;
      height: 88px;
      margin: 0 auto;
			font-size: 88px;
			display: inline-block;
			vertical-align: middle;
			background-image: linear-gradient(to top, #369, #ff0000);
			background-clip: text;
			-webkit-text-fill-color: transparent;
			animation:text-animation 3s linear infinite;
    }
    &__zero {
      width: 32px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(to top, #369, #ff0000);
			animation: zero-animation 3s linear infinite;
			display: inline-block;
			vertical-align: middle;
			position: relative;
			top: 13px;
      &::before {
        display: inline-block;
        width: 20px;
        height: 40px;
        border-radius: 50%;
        background: #fff;
				content: "";
				position: absolute;
				left: 50%;
				top: 50%;
				transform:  translate(-50%,-50%);;
      }
    }
  }
}
.text{
	 animation: text-animation 3s linear infinite;
}
@keyframes zero-animation {
  35% {
		 transform: rotateY(25deg);
		 background: linear-gradient(to top, #369, #ff0000);
  }
  75% {
			transform: rotateY(-25deg);
		 background: linear-gradient(to left, rgb(99, 51, 153), #ff0000);
  }
  100% {
			transform: rotateY(0deg);
		 background: linear-gradient(to right, rgb(153, 105, 51), #ff0000);
  }
}

@keyframes text-animation {
    35% {
			transform: rotateY(25deg);
			background-image: linear-gradient(to left, rgb(99, 51, 153), #ff0000);
    }
    75% {  
			transform: rotateY(-25deg);
			background-image: linear-gradient(to left, rgb(99, 51, 153), #ff0000);
    }
    100% {
			transform: rotateY(0deg);
			background-image: linear-gradient(to right, rgb(153, 105, 51), #ff0000);
    }
}
</style>