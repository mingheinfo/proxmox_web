<template>
   <div class="ceph chart-content">
		  <div class="ceph-content">
				<div class="ceph-top">
						<div class="ceph-top__left">
							<div class="ceph-top__title">健康</div>
							<div class="ceph-top__health">
								<h1 class="ceph-title">状态</h1>
								<div class="ceph-top__health_icon" :class="{
									'fa fa-exclamation-circle warning': db.cephObj && db.cephObj.health && db.cephObj.health.status === 'HEALTH_WARN',
									'fa fa-check-circle good': db.cephObj && db.cephObj.health && db.cephObj.health.status === 'HEALTH_OK'
								}"></div>
								<div>{{db.cephObj && db.cephObj.health && db.cephObj.health.status}}</div>
								<div class="">Ceph Version: {{version}}</div>
							</div>
							<div class="ceph-top__health_info">
								<div class="ceph-table">
									<div class="ceph-table-tr" label="严重度" prop="severity">
										<div class="ceph-table-td">严重度</div>
										<div class="ceph-table-td">概要</div>
										<div class="ceph-table-td"></div>
									</div>
									<el-scrollbar :no-resize="false" style="height: 100%">
										<div v-for="(heal, index) in healthList" :key="index" class="ceph-table-tr" label="概要" prop="message">
										<div class="ceph-table-td ceph-table-severity">
											<div :class="clsMap[heal.severity]" class="fa fa-fw warning fa-exclamation"></div>
										</div>
										<div class="ceph-table-td ceph-table-msg">
											{{heal.message}}
										</div>
										<div class="ceph-table-td ceph-table-detail">
											<i class="fa fa-info-circle" style="cursor: pointer" @click="showDetail(heal)"></i>
										</div>
									</div>
									</el-scrollbar>
								</div>
							</div>
						</div>
						<div class="ceph-top__right">
							<div class="ceph-top__right_content">
								<div class="ceph-top__title">状态</div>
								<div class="ceph-top__status">
									<div class="ceph-title">OSD</div>
									<div class="ceph-table" style="padding-top: 0">
										<div class="ceph-table-tr">
											<div class="ceph-table-td"></div>
											<div class="ceph-table-td">
												<span class="dot dot-heal"></span>
												<span class="ceph-table-text">进入</span>
											</div>
											<div class="ceph-table-td">
												<span class="dot dot-warning"></span>
												<span class="ceph-table-text">输出</span>
											</div>
										</div>
										<div class="ceph-table-tr">
											<div class="ceph-table-td">
												<span class="fa fa-fw good fa-arrow-circle-up"></span>
												<span class="ceph-table-text">上</span>
											</div>
											<div class="ceph-table-td">
												{{osdMap.upin}}
											</div>
											<div class="ceph-table-td">
												{{osdMap.upout}}
											</div>
										</div>
										<div class="ceph-table-tr">
											<div class="ceph-table-td">
												<span class="fa fa-fw good fa-arrow-circle-down"></span>
												<span class="ceph-table-text">下</span>
											</div>
											<div class="ceph-table-td">
												{{osdMap.downin}}
											</div>
											<div class="ceph-table-td">
												{{osdMap.downout}}
											</div>
										</div>
									</div>
									<div >总额： {{osdMap.total}}</div>
								</div>
								<div class="ceph-top__pgs">
									<div class="ceph-title">PGs</div>
									<div class="ceph-top__pgs_pie">
										<pie-circle :values="statecategories"></pie-circle>
									</div>
									<div class="ceph-top__pgs_label">
										<div class="ceph-table">
											<el-scrollbar :no-resize="false" style="height: 100%">
												<template  v-for="state in statecategories">
													<div class="ceph-table-tr" v-for="(item, index) in state.states" :key="index">
														<div class="ceph-table-td">
															<span :style="{background: colorsMap[item.cls]}" class="ceph-top__pgs_label__label"></span>
															<span :title="item.state_name">{{item.state_name}}</span>
														</div>
														<div class="ceph-table-td">{{item.count}}</div>
													</div>
												</template>
											</el-scrollbar>
										</div>
									</div>
								</div>
							</div>
							<div>
								<div class="ceph-top__title">服务</div>
								<div class="ceph-top__service">
									<div class="ceph-top__mon">
										<div class="ceph-title">监视器</div>
										<tool-tips v-for="mo of mon" :key="mo.name">
											<div slot="content">
												<li>主机：{{mo.name}}</li>
												<li>地址：{{mo.addrs}}</li>
												<li>版本：{{mo.ceph_version_short}}</li>
											</div>
											<div class="ceph-top__mon_item" >
												<i class="fa fa-building"></i>{{mo.name}}
												<i :class="{
												            'fa fa-fw good fa-check': mo.health === 5,
												            'fa fa-fw critical fa-times': mo.health === 1,
												            'fa fa-fw fa-info-circle': mo.health ===  2,
												            'fa fa-fw fa-question': mo.health === 0,
												            'fa fa-fw fa-refresh': mo.health === 3,
												            'fa fa-fw fa-bold': mo.health === 4
												            }"></i>
											</div>
										</tool-tips>
									</div>
									<div class="ceph-top__mgr">
										<div class="ceph-title">管理HA</div>
										<tool-tips class="ceph-top__mon_item" v-for="mo of mgr" :key="mo.name">
											<div slot="content">
												<li>主机：{{mo.name}}</li>
												<li>地址：{{mo.addrs}}</li>
												<li>状态：{{mo.statuses && mo.statuses.join(',')}}</li>
												<li>版本：{{mo.ceph_version_short}}</li>
											</div>
											<div class="ceph-top__mon_item" >
												<i class="fa fa-building"></i>{{mo.name}}
												<i :class="{
												            'fa fa-fw good fa-check': mo.health === 5,
												            'fa fa-fw critical fa-times': mo.health === 1,
												            'fa fa-fw fa-info-circle': mo.health ===  2,
												            'fa fa-fw fa-question': mo.health === 0,
												            'fa fa-fw fa-refresh': mo.health === 3,
												            'fa fa-fw fa-bold': mo.health === 4
												            }"></i>
											</div>
										</tool-tips>
									</div>
									<div class="ceph-top__mds">
										<div class="ceph-title">Meta Data Service</div>
										<tool-tips class="ceph-top__mon_item" v-for="mo of mds" :key="mo.name">
											<div slot="content">
												<li>主机：{{mo.name}}</li>
												<li>地址：{{mo.addr}}</li>
												<li>状态：{{mo.statuses && mo.statuses.join(',')}}</li>
												<li>版本：{{mo.ceph_version_short}}</li>
											</div>
											<div class="ceph-top__mon_item" >
												<i class="fa fa-building"></i>{{mo.name}}
												<i :class="{
												            'fa fa-fw good fa-check': mo.health === 5,
												            'fa fa-fw critical fa-times': mo.health === 1,
												            'fa fa-fw fa-info-circle': mo.health ===  2,
												            'fa fa-fw fa-question': mo.health === 0,
												            'fa fa-fw fa-refresh': mo.health === 3,
												            'fa fa-fw fa-bold': mo.health === 4
												            }"></i>
											</div>
										</tool-tips>
									</div>
								</div>
							</div>
						</div>
				</div>
				<div class="ceph-bottom">
					<div class="ceph-top__title">性能</div>
          <div class="ceph-bottom__content">
						<div class="ceph-bottom__used">
							<div class="card-item">
								<mh-circle
										title="使用率"
										:value="usage.used &&
                    usage.used * 100"
										:label="usage.text"
								>
								</mh-circle>
							</div>
						</div>
						<div class="ceph-bottom__file">
							<div style="hieght: 100px; width: 100%">
								<overview-card>
									<div slot="title">读取</div>
									<template slot="content">
										<line-graph :param="reads" style="height: 50px;"></line-graph>
									</template>
								</overview-card>
							</div>
							<div style="hieght: 100px; width: 100%">
								<overview-card>
									<div slot="title">写入</div>
									<template slot="content">
										<line-graph :param="writes" style="height: 50px;"></line-graph>
									</template>
								</overview-card>
							</div>
						</div>
					</div>
				</div>
			</div>
      <ceph-install-modal :visible="visible"
													:param="param"
													@close="visible = false; __init__()"
													:modal-type="modalType"
		                      v-if="visible">
		  </ceph-install-modal>
	 </div>
</template>

<script>
import CephHttp from '@src/views/home/dataCenter/ceph/http';
import CephInstallModal from './CephInstallModal';
import { quickSort, byteToSize, stringFormat } from '@libs/utils/index';
import PieCircle from "@src/components/chart/pie/pieCircle";
import Circle from "@src/components/chart/circle/index.vue";
import OverviewCard from '@src/components/card/OverviewCard';
import ToolTips from "./toolTips";
export default {
	name: 'Ceph',
	mixins: [CephHttp],
	components: {
    ToolTips,
    PieCircle,
		CephInstallModal,
    "mh-circle": Circle,
    OverviewCard
	},
	data() {
		return {
			visible: false,
			healthList: [],
      clsMap: {},
			osdMap: {},
      param: {},
      modalType: 'install',
      showTip: false,
			tips: {},
      node: '',
      mgrmessages: {},
      colorsMap: {
        'faded' : '#CFCFCF',
        'good' :'#21BF4B',
        'warning' : '#FFCC00',
        'critical' : '#FF6C59'
      },
      statecategories: [
        {
          text: '未知',
          count: 0,
          states: [],
          cls: 'faded',
          color: ''
        },
        {
          text: '清除',
          cls: 'good',
          color: ''
        },
        {
          text: '工作',
          cls: 'warning',
          color: ''
        },
        {
          text: '错误',
          cls: 'critical',
          color: ''
        }
      ],
      pgstates: {
        // clean
        clean: 1,
        active: 1,

        // working
        activating: 2,
        backfill_wait: 2,
        backfilling: 2,
        creating: 2,
        deep: 2,
        degraded: 2,
        forced_backfill: 2,
        forced_recovery: 2,
        peered: 2,
        peering: 2,
        recovering: 2,
        recovery_wait: 2,
        repair: 2,
        scrubbing: 2,
        snaptrim: 2,
        snaptrim_wait: 2,

        // error
        backfill_toofull: 3,
        backfill_unfound: 3,
        down: 3,
        incomplete: 3,
        inconsistent: 3,
        recovery_toofull: 3,
        recovery_unfound: 3,
        remapped: 3,
        snaptrim_error: 3,
        stale: 3,
        undersized: 3
      },
      version: '',
      interVal: null,
      mon: {},
			mgr: {},
			mds: {},
			usage: {
			  used: 0,
				text: ''
			},
      reads: {
        value: [[], []],
				time: [],
        axisLabelColor: '#fff'
			},
			writes: {
        value: [[], []],
        time: [],
        axisLabelColor: '#fff'
			},
      colors: [
        {
          line: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(148, 174, 10, 1)"
              },
              {
                offset: 1,
                color: "rgba(148, 174, 10, 0.1)"
              }
            ],
            globalCord: false
          },
          start: "rgba(148, 174, 10, 0.1)",
          end: "rgba(148, 174, 10, 1)"
        },
        {
          line: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(18, 94, 166, 1)"
              },
              {
                offset: 1,
                color: "rgba(18, 94, 166, 0.1)"
              }
            ],
            globalCord: false
          },
          start: "rgba(18, 94, 166, 0.1)",
          end: "rgba(18, 94, 166, 1)"
        }
      ],
		}
	},
	created() {
		this.__init__();
	},
	mounted() {
	},
	methods: {
		/***
		 * 初始化请求，操作
		*/
		async __init__() {
		  let _this = this;
		  let router = window.localStorage.getItem('lastLink') || 'datacenter',
				  url = 'json/cluster/ceph/status',
          mgrmessages = {},
          last = window.localStorage.getItem("lastsel") || "[]";
				  this.node = (JSON.parse(last).node && JSON.parse(last).node) || "";
		  if(router.indexOf('datacenter') > -1 ) {
		    url = 'json/cluster/ceph/status';
      } else {
		    url = `json/nodes/${this.node}/ceph/status`
			}
      _this.mgrmessages = {};
      await _this.queryCephStatus(url)
			          .then(res => {
                  let downin_osds = 0;
                  _this.version = _this.db.cephMetaDataObj && _this.db.cephMetaDataObj.version && _this.db.cephMetaDataObj.version[Object.keys(_this.db.cephMetaDataObj.version)[0]];
									//过滤出ceph状态表格数据
									if(_this.db.cephObj && _this.db.cephObj.health && _this.db.cephObj.health.checks) {
                      let healthList = Object.keys(_this.db.cephObj.health.checks).map(key => {
                        if(!_this.clsMap.hasOwnProperty(_this.db.cephObj.health.checks[key].severity)) {
                          _this.clsMap[_this.db.cephObj.health.checks[key].severity]=  _this.db.cephObj.health.checks[key].severity.replace(/HEALTH_/, '').toLowerCase();
												}
                        let found = null;
                        if (key === 'OSD_DOWN') {
                          found = _this.db.cephObj.health.checks[key].summary.message.match(downinregex);
                          if (found !== null) {
                            downin_osds = parseInt(found[1],10);
                          }
                        }
												return {
													message: _this.db.cephObj.health.checks[key].summary.message,
													severity: _this.db.cephObj.health.checks[key].severity,
													detail: _this.db.cephObj.health.checks[key].detail
												}
											})
                    _this.healthList = quickSort(healthList, 'message', '-')
									}
									//ceph osd状态
									if(_this.db.cephObj && _this.db.cephObj.osdmap && _this.db.cephObj.osdmap.osdmap) {
                    let total_osds    = _this.db.cephObj.osdmap.osdmap.num_osds || 0,
                    				in_osds   = _this.db.cephObj.osdmap.osdmap.num_in_osds || 0,
                    				up_osds   = _this.db.cephObj.osdmap.osdmap.num_up_osds || 0,
                    				out_osds  = total_osds - in_osds,
                    				down_osds = total_osds - up_osds,
                         downout_osds = down_osds - downin_osds,
                            upin_osds = in_osds - downin_osds,
                           upout_osds = up_osds - upin_osds;
                    _this.osdMap = {
                      total  : total_osds,
                      upin   : upin_osds,
                      upout  : upout_osds,
                      downin : downin_osds,
                      downout: downout_osds
										};
									}
									//ceph pgs
									if(_this.db.cephObj && _this.db.cephObj.pgmap) {
                    _this.statecategories.forEach((cat, index) => {
                      _this.$set(_this.$data.statecategories, index, {...cat, count: 0, states: [], desc: ''})
                    });
                    _this.db.cephObj.pgmap.pgs_by_state.forEach((state) => {
                      let i,
                      states = state.state_name.split(/[^a-z]+/),
                      result = 0;
                      for (i = 0; i < states.length; i++) {
                        if (_this.pgstates[states[i]] > result) {
                          result = _this.pgstates[states[i]];
                        }
                      }
                      // for the list
                       state.cls = _this.statecategories[result].cls;
                      _this.statecategories[result].count += state.count;
                      _this.statecategories[result].states.push(state);
                      _this.statecategories[result].desc = state.state_name
                    });
									}
									//ceph performace
									if(_this.db.cephObj && _this.db.cephObj.pgmap && _this.db.cephObj.pgmap.bytes_used && _this.db.cephObj.pgmap.bytes_total) {
									  let text = stringFormat('{0} of {1}', byteToSize(_this.db.cephObj.pgmap.bytes_used), byteToSize(_this.db.cephObj.pgmap.bytes_total));
                    _this.usage.used = (_this.db.cephObj.pgmap.bytes_used / _this.db.cephObj.pgmap.bytes_total) || 0;
                    _this.usage.text = text;
									}
                  if(_this.db.cephObj && _this.db.cephObj.pgmap) {
                    let iops = _this.db.cephObj.pgmap.op_per_sec || 0,
                        readiops = _this.db.cephObj.pgmap.read_op_per_sec || 0,
                        writeiops = _this.db.cephObj.pgmap.write_op_per_sec || 0,
                        reads = _this.db.cephObj.pgmap.read_bytes_sec || 0,
                        writes = _this.db.cephObj.pgmap.write_bytes_sec || 0;
                    if (iops !== undefined && _this.version !== 'hammer') {
                      _this.change_version('hammer');
                    } else if((readiops !== undefined || writeiops !== undefined) && _this.version !== 'jewel') {
                      _this.change_version('jewel');
                    }
                    _this.reads.value[0].push(reads);
                    _this.reads.value[1].push(readiops);
                    _this.reads.time.push(new Date().getTime() / 1000);
                    _this.reads.color = _this.colors;
                    _this.reads.label = ['reads', 'readsiops']
                    _this.writes.value[0].push(writes);
                    _this.writes.value[1].push(writeiops);
                    _this.writes.time.push(new Date().getTime() / 1000);
                    _this.writes.color = _this.colors;
                    _this.writes.label = ['writes', 'writeiops']
                    if (_this.db.cephObj.mgrmap) {
                      _this.mgrmessages[_this.db.cephObj.mgrmap.active_name] = "active";
                      _this.db.cephObj.mgrmap.standbys.forEach((mgr) => {
                        _this.mgrmessages[mgr.name] = "standby";
                      });
                    }
									}
                  _this.interVal = setInterval(async () => {
                    await _this.queryCephStatus(url);
                    _this.setCephMetaData();
									}, 10000)
								})
                .catch(res => {
									if(res ===  'not installed') {
                    _this.queryNetWork()
											.then(res => {
                        _this.visible = true;
											})
									}
								})
      _this.setCephMetaData();
		},
		//
		setCephMetaData () {
		  let _this = this;
      _this.queryCephMetaData()
        .then(res => {
          let healthstates = {
              'HEALTH_UNKNOWN': 0,
              'HEALTH_ERR': 1,
              'HEALTH_WARN': 2,
              'HEALTH_UPGRADE': 3,
              'HEALTH_OLD': 4,
              'HEALTH_OK': 5
            },
            healthmap = [
              'HEALTH_UNKNOWN',
              'HEALTH_ERR',
              'HEALTH_WARN',
              'HEALTH_UPGRADE',
              'HEALTH_OLD',
              'HEALTH_OK'
            ];
          if(_this.db.cephMetaDataObj && _this.db.cephMetaDataObj.mon) {
            _this.mon = _this.db.cephMetaDataObj.mon;
            for(let mon of Object.keys(this.mon)) {
              let tmp = mon.split('@'),
                name = tmp[0],
                host = tmp[1];
              if(this.db.cephObj.quorum_names && this.db.cephObj.quorum_names.indexOf(name) > -1) {
                _this.$set(_this.mon[mon], 'health', healthstates.HEALTH_OK);
              } else {
                _this.$set(_this.mon[mon], 'health', healthstates.HEALTH_ERR);
              }
            }
          }
          if(_this.db.cephMetaDataObj && _this.db.cephMetaDataObj.mgr) {
            _this.mgr = _this.db.cephMetaDataObj.mgr;
            for(let mgr of Object.keys(this.mgr)) {
              let tmp = mgr.split('@'),
                name = tmp[0],
                host = tmp[1];
              _this.$set(_this.mgr[mgr], 'health', healthstates.HEALTH_OK);
              if (_this.mgrmessages && _this.mgrmessages[name] === 'active') {
                if(!_this.mgr[mgr].statuses)
                  _this.$set(_this.mgr[mgr], 'statuses', ['active']);
                else
                  _this.$set(_this.mgr[mgr], 'statuses', _this.mgr[mgr].statuses.concat('active'));
              } else if (_this.mgrmessages && _this.mgrmessages === 'standby') {
                if(!_this.mgr[mgr].statuses)
                  _this.$set(_this.mgr[mgr], 'statuses', ['standby']);
                else
                  _this.$set(_this.mgr[mgr], 'statuses', _this.mgr.statuses.concat('standby'));
              } else if ( _this.mgr.health > healthstates.HEALTH_WARN) {
                _this.$set(_this.mgr[mgr], 'health', healthstates.HEALTH_WARN);
              }

            }

          }
          if(_this.db.cephMetaDataObj && _this.db.cephMetaDataObj.mds) {
            _this.mds = _this.db.cephMetaDataObj.mds;
            for(let mds of Object.keys(this.mds)) {
              let tmp = mds.split('@'),
                name = tmp[0],
                host = tmp[1];
              _this.$set(_this.mds[mds], 'health', healthstates.HEALTH_OK);
              if (_this.mgrmessages && _this.mgrmessages[name]) {
                if(!_this.mds[mds].statuses)
                  _this.$set(_this.mds[mds], 'statuses', [_this.mgrmessages[name]]);
                else
                  _this.$set(_this.mds[mds], 'statuses', _this.mds[mds].statuses.concat(_this.mgrmessages[name]));
              } else if (_this.mds[mds].addr !== 'unknow') {
                if(!_this.mds[mds].statuses)
                  _this.$set(_this.mds[mds], 'statuses', ['standby']);
                else
                  _this.$set(_this.mds[mds], 'statuses',_this.mds[mds].statuses.concat('standby'));
              }

            }
          }
        });
		},
    change_version(version) {
      let me = this;
      me.version = version;
    },
		/**
		 * 展示detail
		 * */
    showDetail(detail) {
      this.param = detail;
      this.modalType = 'detail';
      this.visible = true;
		},
    showTips(mon) {
      this.tips = mon;
     this.showTip = true;
		}
	},
	beforeDestroy() {
	  if(this.interVal) {
	    clearInterval(this.interVal);
	    this.interVal = null;
		}
	},
	watch: {
	  '$router': function(newVal, oldVal) {
	    if(newVal !== oldVal && this.node.type ===  'node') {
	      this.__init__();
			}
		}
	}
}
</script>

<style lang="less" scoped>
	.ceph{
		width: 100%;
		padding: 20px;
		background: #010d1b;
		color: #91add4;

		.content {
     	width: 100%;
		  height: 100%;
		}

		&-title{
			margin: 0px 0px 20px 0px;
			font-size: 16px;
			text-align: center;
	  }

    &-top{
		  display: flex;
		  flex-grow: 1;
			justify-content: space-between;
			height: 500px;
			&__service {
			  display: flex;
				flex-grow: 1;
				padding: 20px;
			}
			&__mon,&__mgr,&__mds{
				flex-basis: auto;
				flex-shrink: 1;
				flex-grow: 1;
				&_item{
					padding: 5px 10px 5px 10px;
					margin-right: 5px;
					border: 1px solid #e0eaf3;
					display: inline-block;
					text-align: center;
					border-radius: 2px;
					cursor: pointer;
					&:hover{
						transform: scale(1.02);
					}
				}
			}
			&__pgs{
				display: inline-block;
				vertical-align: top;
				padding-top: 20px;
				text-align: center;
				width: 55%;
				font-size: 0;
				height: calc(100% - 46px);
        &_pie{
          height: calc(100% - 50px);
          width: 40%;
					display: inline-block;
					font-size: 14px;
        }
				&_label{
					display: inline-block;
					vertical-align: top;
					width: 60%;
					font-size: 14px;
					overflow: hidden;
					height: 100%;
					&__label{
						width: 12px;
						height: 12px;
						border-radius: 50%;
						line-height: 20px;
						display: inline-block;
						vertical-align: middle;
					}
				}
			}
			&__status{
				width: 45%;
				padding-top: 20px;
				text-align: center;
				display: inline-block;
				font-size: 14px;
			}
			&__title {
				width: 100%;
				font-size: 16px;
				padding: 5px 20px;
				background: #dde4ed;
			}
			&__health{
				width: 30%;
				height: 100%;
				display: inline-block;
				vertical-align: top;
				font-size: 14px;
				text-align: center;
				margin-top: 20px;
				&_icon{
					font-size: 65px;
				}
				&_info{
					width: 70%;
					height: 100%;
				  display: inline-block;
					vertical-align: top;
					font-size: 14px;
				}
			}
			&__left{
				margin-right: 20px;
				background: #062635;
				height: 500px;
				flex: 1 1 auto;
				width: 0;
				font-size: 0px;
			}
			&__right{
				background: #062635;
				height: 500px;
				flex: 1 1 auto;
				width: 0;
				&_content{
					font-size: 0;
					height: 50%;
				}
			}
	  }

		&-table{
			display: block;
			width: 100%;
			padding: 20px;
			height: calc(100% - 30px);
			overflow: hidden;
			&-tr{
				display: flex;
				height: 28px;
				line-height: 28px;
				flex-grow: 1;
			}
			&-td{
				flex: 2 1 auto;
				border-bottom: 1px solid #fff;
				width: 0;
				justify-content: left;
				table-layout: fixed;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			&-msg{
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				flex: 7 1 auto;
				justify-content: left;
			}
			&-detail{
				flex: 1 1 auto;
				text-align: right;
			}
			&-serverity{
				flex: 1 1 auto;
				justify-content: left;
			}
		}

		&-bottom{
			position: relative;
			margin-top: 20px;
		  &__content{
				display: flex;
				flex-grow: 1;
				height: 370px;
				padding-top: 10px;
				background: #062635;
			}
			&__used, &__file{
				flex-grow: 1;
				flex-shrink: 1;
				flex-basis: auto;
				width: 50%;
				height: 100%;
				background: #062635;
			}
      &__used{
				margin-right: 20px;
			}
		}
	}
	.warning {
    color: #fc0;
	}
  .good {
		color: #21BF4B;
	}

	.dot{
		display: inline-block;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		position: relative;
		vertical-align: middle;
		&::after{
			content: '';
			display: inline-block;
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #fff;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		&-warning{
			background: #fc0;
		}
		&-heal{
			background: #21BF4B;
		}
	}
	/deep/ .card{
		  height: 160px!important;
			display: inline-block;
		  min-height: 160px!important;
			vertical-align: top;
			margin-bottom: 20px;
			width: 100%;
		}
	/deep/.m-chart {
		height: 145px!important;
	}

	.tips{
		position: absolute;
		background: #fff;
		color: #333;
		padding: 20px;
		z-index: 999;
	}
	@media screen and (max-width: 1310px){
		.ceph-table-td{
			font-size: 12px;
		}
	}
</style>
