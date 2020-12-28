<template>
	<page-template>
		<div slot="toolbar-left">
       <m-button type="primary" icon="el-icon-plus" @on-click="visible=true;">创建</m-button>
			 <m-button type="danger" icon="el-icon-delete" :disabled="selectedList.length <=0 ">销毁</m-button>
		</div>
		<div slot="page-content">
			<el-table :data="poolList" @selection-change="(row) => selectedList = row">
        <el-table-column label="名称" prop="pool_name"></el-table-column>
				<el-table-column label="大小/min" prop="pool_name">
				  <template slot-scope="scope">
             {{scope.row.min_size +'/'+ scope.row.size}}
					</template>
				</el-table-column>
				<el-table-column label="Placement Groups" prop="pg_num"></el-table-column>
			  <el-table-column label="CRUSH Rule">
          <el-table-column label="ID" prop="crush_rule"></el-table-column>
          <el-table-column label="名称" prop="crush_rule_name"></el-table-column>
        </el-table-column>
			 <el-table-column label="已用">
          <el-table-column label="%" prop="percent_used">
						<template slot-scope="scope">
               {{flotToFixed(scope.row && scope.row.percent_used && scope.row.percent_used || 0, 2)}}
						</template>
					</el-table-column>
          <el-table-column label="总额" prop="bytes_used">
							<template slot-scope="scope">
               {{byteToSize(scope.row && scope.row.bytes_used && scope.row.bytes_used || 0)}}
						</template>
					</el-table-column>
        </el-table-column>
			</el-table>
			<create-pools v-if="visible" :visible="visible" @close="visible=false;"></create-pools>
		</div>
	</page-template>
</template>

<script>
  import PageTemplate from "@src/components/page/PageTemplate";
	import CephHttp from "@src/views/home/node/ceph/http";
	import { byteToSize, flotToFixed, quickSort} from "@libs/utils/index";
	import CreatePools from './CreatePools';
  export default {
		name: 'Pools',
		mixins: [CephHttp],
		components: {
			PageTemplate,
			CreatePools
		},
		mounted() {
			this.__init__();
		},
		data() {
			return {
				poolList: [],
				visible: false,
				selectedList: []
			}
		},
		methods: {
			byteToSize,
			flotToFixed,
			__init__() {
				this.queryCephPools()
				    .then(res => {
							this.poolList = quickSort(res, 'pool_name', '+');
						});
			}
		}
	}
</script>