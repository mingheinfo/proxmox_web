<template>
	<div class="markdown-body">
		<readme></readme>
	</div>
</template>

<script>
import RM from './README.md';
import 'github-markdown-css'
import 'highlight.js/styles/github.css';
console.log(RM);
export default {
	name: 'Help',
	components: {
		readme: RM
	}
}
</script>

<style lang="less" scoped>
 .markdown-body{
	 width: 100%;
	 margin: 20px 1px 0px 0px;
	 background-color: #fff;
	 padding: 0px 20px;
 }
</style>