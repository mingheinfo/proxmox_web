<template>
  <Dialog
    :visible="visible"
    @close="close()"
    @confirm="confirm"
    @cancel="cancel"
    cancelText="重置"
    :_style="{
      width: '100%',
      height: 'calc(100%)',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    }"
    title="创建虚拟机"
  >
    <template slot="content">
      <div>
        <!--步骤条-->
        <m-steps :active="step" @change="handleStepChange">
          <m-step title="一般"></m-step>
          <m-step title="模板"></m-step>
          <m-step title="根磁盘"></m-step>
          <m-step title="CPU">CPU</m-step>
          <m-step title="内存">内存</m-step>
          <m-step title="网络">网络</m-step>
					<m-step title="DNS">DNS</m-step>
          <m-step title="确认">确认</m-step>
        </m-steps>
      </div>
      <!--第一步添加名称vmid等-->
      <div v-show="step === 1" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <!--input组件validateEvent表示需要校验， show-error表示校验是否通过；error-msg表示校验未通过时的提示信息； validate校验；v-modal输入值-->
              <m-input
                v-model="hostname"
                prop="hostname"
								label="主机名"
								labelWidth="100px"
                validateEvent
                :show-error="rules['hostname'].error"
                :error-msg="rules['hostname'].message"
                @validate="validate"
                placeholder="请输入名称"
              />
							<m-input
                v-model="vmid"
								type='number'
                prop="vmid"
								label="CT ID"
								labelWidth="100px"
                validateEvent
                required
                :show-error="rules['vmid'].error"
                :error-msg="rules['vmid'].message"
                @validate="validate"
                placeholder="请输入名称"
              />

							 <m-select
                prop="nodename"
                label="节点"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.nodename.error"
                :error-msg="rules.nodename.message"
                :readonly="false"
                required
                @on-change="(value) => nodename = value"
                v-model="nodename"
                placeholder="请选择节点"
              >
                <m-option
                  v-for="(item, index) in nodeList"
                  :key="item.node"
                  :label="item.node"
                  :value="item.node"
                >
								  <div v-if="index === 0" class="table-tr">
										<div class="table-td">节点</div>
										<div class="table-td">内存使用率</div>
										<div class="table-td">CPU使用率</div>
									</div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.node">{{ item.node }}</span>
                    <span class="table-td" :title="item.mem && item.maxmem && percentToFixed(item.mem / item.maxmem, 3)">{{
                      item.mem && item.maxmem && percentToFixed(item.mem / item.maxmem, 3)
                    }}</span>
                    <span class="table-td" :title="item.cpu && item.maxcpu && `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`">{{
                      item.cpu && item.maxcpu && `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                    }}</span>
                  </div>
                </m-option>
              </m-select>

						<m-select
                prop="pool"
                label="资源池"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.pool.error"
                :error-msg="rules.pool.message"
                :readonly="false"
                @on-change="(value) => pool = value"
                v-model="pool"
                placeholder="请选择节点"
              >
                <m-option
                  v-for="(item, index) in poolList"
                  :key="item.poolid"
                  :label="item.poolid"
                  :value="item.poolid"
                >
								 <div v-if="index === 0" class="table-tr">
										<div class="table-td">池</div>
										<div class="table-td">描述</div>
									</div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.poolid">{{ item.poolid }}</span>
                    <span class="table-td" :title="item.comment">{{
                      item.comment
                    }}</span>
                  </div>
                </m-option>
              </m-select>


							<m-input
                v-model="password"
								type='password'
                prop="password"
								label="密码"
								labelWidth="100px"
                validateEvent
                :show-error="rules['password'].error"
                :error-msg="rules['password'].message"
                @validate="validate"
                placeholder="请输入密码"
              />

							<m-input
                v-model="vPsw"
								type='password'
                prop="vPsw"
								label="确认密码"
								labelWidth="100px"
                validateEvent
                :show-error="rules['vPsw'].error"
                :error-msg="rules['vPsw'].message"
                @validate="validate"
                placeholder="请输入确认密码"
              />

							<m-input
                v-model="ssh"
								type='text'
                prop="ssh"
								label="SSH公钥"
								labelWidth="100px"
                validateEvent
                :show-error="rules['ssh'].error"
                :error-msg="rules['ssh'].message"
                @validate="validate"
                placeholder="请输入ssh公钥"
              />
              <m-button type="primary" style="position: relative;">
								<input type="file" ref="uploadFile" @change="uploadSsh" class="upload-input"/>
								加载SSH秘钥文件
							</m-button>

							<m-checkbox v-model="unprivileged"
							            label="无特权的容器"
													labelWidth="100px"></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
      <!--第二步镜像选择方式-->
      <div v-if="step === 2" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
             <m-select
                prop="storage"
                label="存储"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                required
                :show-error="rules.storage.error"
                :error-msg="rules.storage.message"
                :readonly="false"
                @on-change="handleStorageSelect"
                v-model="storage"
                placeholder="请选择节点"
              >
                <m-option
                  v-for="(item, index) in storageList"
                  :key="item.storage"
                  :label="item.storage"
                  :value="item.storage"
                >
								 <div v-if="index === 0" class="table-tr">
										<div class="table-td">名称</div>
										<div class="table-td">类别</div>
										<div class="table-td">可用</div>
										<div class="table-td">容量</div>
									</div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.storage">{{ item.storage }}</span>
										<span class="table-td" :title="item.type">{{item.type}}</span>
                    <span class="table-td" :title="byteToSize(item.avail)">{{
                      byteToSize(item.avail)
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.total)">{{
                      byteToSize(item.total)
                    }}</span>
                  </div>
                </m-option>
              </m-select>

						<m-select
                prop="tmpl"
                label="模板"
                labelWidth="100px"
                validateEvent
                @validate="validate"
                :show-error="rules.tmpl.error"
                :error-msg="rules.tmpl.message"
                required
                :readonly="false"
                @on-change="(value) => tmpl = value"
                v-model="tmpl"
                placeholder="请选择节点"
              >
                <m-option
                  v-for="(item, index) in isoList"
                  :key="item.volid && item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')"
                  :label="item.volid && item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')"
                  :value="item.volid && item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')"
                >
								<div v-if="index === 0" class="table-tr">
										<div class="table-td">名称</div>
										<div class="table-td">格式</div>
										<div class="table-td">大小</div>
									</div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.volid && item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')">{{ item.volid && item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2') }}</span>
                    <span class="table-td" :title="item.format">{{
                      item.format
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.size)">{{
                      byteToSize(item.size)
                    }}</span>
                  </div>
                </m-option>
              </m-select>

            </dd>
          </dl>
        </div>
      </div>
      <!--配置显卡-->
      <div v-if="step === 3" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>显卡</dt>
            <dd>
             <m-select
                prop="rootStorage"
                label="存储"
                labelWidth="100px"
                @on-change="(value) => rootStorage = value"
                v-model="rootStorage"
                validateEvent
                @validate="validate"
                :error-msg="rules['rootStorage'].message"
                :show-error="rules['rootStorage'].error"
                required
                :readonly="false"
                placeholder="请选存储"
              >
                <div class="table">
                  <m-option
                    v-for="(item, index) in rootStorageList"
                    :key="item.storage"
                    :value="item.storage"
                    :label="item.storage"
                  >
                    <div v-if="index === 0" class="table-tr">
                      <div class="table-td">名称</div>
                      <div class="table-td">类别</div>
                      <div class="table-td">可用</div>
                      <div class="table-td">容量</div>
                    </div>
                    <div class="table-tr">
                      <div class="table-td" :title="item.storage">{{ item.storage }}</div>
                      <div class="table-td" :title="item.type">{{ item.type }}</div>
                      <div class="table-td" :title="byteToSize(item.avail)">{{ byteToSize(item.avail) }}</div>
                      <div class="table-td" :title="byteToSize(item.total)">{{ byteToSize(item.total) }}</div>
                    </div>
                  </m-option>
                </div>
              </m-select>
							  <m-input
                type="number"
                labelWidth="100px"
                label="磁盘大小（GiB）"
                v-model="size"
                :max="131072"
                validateEvent
                @validate="validate"
                prop="size"
                :min="1"
                required
                :error-msg="rules['size'].message"
                :show-error="rules['size'].error"
              />
            </dd>
          </dl>
        </div>
				<div class="m-form__section" v-if="isAdvice">
					<dl>
						<dt>高级</dt>
						<dd>

							 <m-checkbox
                v-model="quota"
                label="启用配额"
                :disabled="!isQuota()"
                labelWidth="100px"
              />
              <m-select
                v-model="acl"
                prop="acl"
                @on-change="(value) => (acl = value)"
                placeholder="请输入磁盘映像"
                label="ACLs"
                labelWidth="100px"
              >
                <m-option
                  v-for="item in aclsItems"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                ></m-option>
              </m-select>
              <m-checkbox
                v-model="replicate"
                label="跳过复制"
                labelWidth="100px"
              />
              <m-select
                v-model="mountoptions"
                type="multiple"
                prop="mountoptions"
                @on-change="(value) => (mountoptions = value)"
                placeholder="选择挂载选项"
                label="挂载选项"
                labelWidth="100px"
              >
                <m-option
                  v-for="item in munteoptionsItems"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </m-option>
              </m-select>

						</dd>
					</dl>
				</div>
      </div>
      <!--配置驱动-->
      <div v-if="step === 4" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>CPU</dt>
            <dd>
              <m-input
                type="number"
                v-model="cores"
                prop="cores"
                :min="0"
                validateEvent
                @validate="validate"
                required
                :show-error="rules['cores'].error"
                :error-msg="rules['cores'].message"
                placeholder="请输入核数"
                label="核"
                labelWidth="100px"
              />
            </dd>
          </dl>
        </div>

        <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
          <dt>高级</dt>
          <dd>
             <m-input
                type="number"
                v-model="cpulimit"
                prop="cpulimit"
                :min="0"
                validateEvent
                @validate="validate"
                required
                :show-error="rules['cpulimit'].error"
                :error-msg="rules['cpulimit'].message"
                placeholder="请输入CPU限制"
                label="CPU限制"
                labelWidth="100px"
              />
              <m-input
                type="number"
                v-model="cpuunits"
                prop="cpuunits"
                :min="8"
                validateEvent
                @validate="validate"
                required
                :show-error="rules['cpuunits'].error"
                :error-msg="rules['cpuunits'].message"
                placeholder="请输入CPU权重"
                label="CPU权重"
                labelWidth="100px"
              />
          </dd>
        </div>
      </div>

      <!--配置CPU等信息-->
      <div v-if="step === 5" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
               <m-input
                type="number"
                v-model="memory"
                prop="memory"
                validateEvent
                :min="16"
                @validate="validate"
                required
                :show-error="rules['memory'].error"
                :error-msg="rules['memory'].message"
                placeholder="请输入内存"
                label="内存（MiB）"
                labelWidth="100px"
              />
              <m-input
                type="number"
                v-model="swap"
                prop="swap"
                validateEvent
                @validate="validate"
                :min="0"
                required
                :show-error="rules['swap'].error"
                :error-msg="rules['swap'].message"
                placeholder="请输入交换分区"
                label="交换分区（MiB）"
                labelWidth="100px"
              />
            </dd>
          </dl>
        </div>
      </div>

      <!--配置内存-->
      <div v-if="step === 6" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
             			<m-input v-model="name"
						         prop="name"
										 label="名称"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 placeholder="形如：eth0"
                     required
										 :show-error="rules['name'].error"
										 :error-msg="rules['name'].message"/>

						<m-input v-model="hwaddr"
						         prop="hwaddr"
										 label="MAC地址"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 placeholder="形如：2A:75:78:42:45:37"
										 :show-error="rules['hwaddr'].error"
										 :error-msg="rules['hwaddr'].message"/>

						<m-select v-model="bridge"
						         prop="bridge"
										 label="桥接"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
                      required
										 :show-error="rules['bridge'].error"
										 :error-msg="rules['bridge'].message"
										 @on-change="(value) => bridge = value"
										 >
							<m-option v-for="(item, index) in networkList"
							          :key="item.iface"
												:label="item.iface"
												:value="item.iface">
								<div v-if="index === 0" class="table-tr">
									<div class="table-td">桥接</div>
									<div class="table-td">活动</div>
									<div class="table-td">备注</div>
								</div>
								<div class="table-tr">
									<div class="table-td" :title="item.iface">{{item.iface}}</div>
									<div class="table-td" :title="item.active">
										<table-info-state :content="item.active && item.active === 1 ? '是' : '否'"
										                  :state="item.active && item.active === 1 ? 'actived' : 'unActived'"></table-info-state>
									</div>
									<div class="table-td" :title="item.comment">{{item.comment}}</div>
								</div>
							</m-option>
						</m-select>

						<m-input v-model="tag"
						         prop="tag"
										 type="number"
										 label="VLAN标签"
										 labelWidth="100px"
										 placeholder="请输入VLAN标签"
										/>

						<m-input v-model="rate"
						         type="number"
						         prop="rate"
										 label="速率限制(MiB)"
										 labelWidth="100px"
										 :min="0"
										 placeholder="请输入速率限制"
										/>

						<m-checkbox v-model="firewall"
						         prop="firewall"
										 label="防火墙"
										 labelWidth="100px"
									   />
					</dd>
				</dl>
				<dl>
					<dt>IPV4</dt>
					<dd>
            <div>
							<label class="m-input__radio">
									<input
										type="radio"
										value="static"
										name="ipv4"
										v-model="ip4type"
									/>
									<div></div>
									<span>静态</span>
								</label>
						 <label class="m-input__radio">
								<input
									type="radio"
									value="dhcp"
									name="ipv4"
									v-model="ip4type"
									@change="() => {
										ip ='';
										gw = '';
									}"
								/>
								<div></div>
								<span>DHCP</span>
							</label>
						</div>
						<m-input v-model="ip"
						         prop="ip"
										 label="IPv4/CIDR"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['ip'].error"
										 :error-msg="rules['ip'].message"
										 :disabled="ip4type !== 'static'"
										 placeholder="None"/>

						<m-input v-model="gw"
						         prop="gw"
										 label="网关(IPv4)"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 placeholder="形如：10.10.10.0"
										 :show-error="rules['gw'].error"
										 :disabled="ip4type !== 'static'"
										 :error-msg="rules['gw'].message"/>
					</dd>
				</dl>

        <dl>
					<dt>IPV6</dt>
					<dd>
            <div>
							<label class="m-input__radio">
									<input
										type="radio"
										value="static"
										name="ipv6"
										v-model="ip6type"
									/>
									<div></div>
									<span>静态</span>
								</label>
						 <label class="m-input__radio">
								<input
									type="radio"
									value="dhcp"
									name="ipv6"
									v-model="ip6type"
									@change="() => {
										ip6 ='';
										gw6 = '';
									}"
								/>
								<div></div>
								<span>DHCP</span>
							</label>
							 <label class="m-input__radio">
								<input
									type="radio"
									value="auto"
									name="ipv6"
									v-model="ip6type"
									@change="() => {
										ip6 ='';
										gw6 = '';
									}"
								/>
								<div></div>
								<span>SLAAC</span>
							</label>
						</div>
						<m-input v-model="ip6"
						         prop="ip6"
										 label="IPv6/CIDR"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['ip6'].error"
										 :error-msg="rules['ip6'].message"
										 :disabled="ip6type !== 'static'"
										 placeholder="None"/>

						<m-input v-model="gw6"
						         prop="gw6"
										 label="网关(IPv6)"
										 labelWidth="100px"
										 validateEvent
										 @validate="validate"
										 :show-error="rules['gw6'].error"
										 placeholder="形如：2001:DB8::42"
										 :disabled="ip6type !== 'static'"
										 :error-msg="rules['gw6'].message"/>
            </dd>
          </dl>
        </div>
      </div>

      <!--配置网络-->
      <div v-if="step === 7" class="m-form__content">
        <div class="m-form__section">
					<dl>
						<dt>基本信息</dt>
						<dd>
							<m-input v-model="searchdomain"
											prop="searchdomain"
											label="DNS域"
											labelWidth="100px"
											placeholder="请输入DNS域"/>

							<m-input v-model="nameserver"
											prop="nameserver"
											label="DNS服务器"
											labelWidth="100px"
											validateEvent
											@validate="validate"
											:show-error="rules['nameserver'].error"
											placeholder="形如：192.168.1.1"
											:error-msg="rules['nameserver'].message"/>
						</dd>
          </dl>
        </div>
      </div>
      <!--展示配置参数-->
      <div v-if="step === 8" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>预览</dt>
            <dd>
              <div class="table">
                <div class="table-tr">
                  <span class="table-td">key</span>
                  <span class="table-td">value</span>
                </div>
                <div v-for="(data, key) of params" class="table-tr" :key="key">
                  <span class="table-td" :title="key">{{ key }}</span>
                  <span class="table-td" :title="data">{{ data }}</span>
                </div>
              </div>
            </dd>
						<dt>是否自启动</dt>
            <dd>
							<m-checkbox v-model="start">创建后自启动</m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="footer">
      <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>高级</div>
        </label>
      </div>
      <m-button
        type="primary"
        style="height: 40px; line-height: 40px; width: 100px"
        @on-click="prev()"
        >上一步</m-button
      >
      <m-button
        type="primary"
        style="height: 40px; line-height: 40px; width: 100px"
        @on-click="next()"
        v-show="step < 8"
        >下一步</m-button
      >
      <m-button
        type="primary"
        style="height: 40px; line-height: 40px; width: 100px"
        @on-click="confirm()"
        v-show="step === 8"
        >确定</m-button
      >
			  <m-dialog
      :visible="showLog"
      @close="closeLog"
      :_style="{
        width: '800px',
      }"
      title="Task Viewer: 恢复"
    >
      <template slot="content">
        <m-tab v-model="tab" @tab-click="handleTabChange">
          <m-tab-panel label="输出" name="log"></m-tab-panel>
          <m-tab-panel label="状态" name="status"></m-tab-panel>
        </m-tab>
        <m-button
          class="create-btn m-margin-top-10"
          type="primary"
          @on-click="stopTask1"
          :disabled="db.addClusterStatusObj.status !== 'running'"
          >停止</m-button
        >
        <el-scrollbar style="height: 100%">
            <div class="taskmodal-content">
          <div class="table" v-if="tab === 'log'">
            <div
              class="table-tr"
              v-for="item in db.addClusterLogList"
              :key="item.n"
            >
              {{ item.t }}
            </div>
          </div>
          <div class="table" v-if="tab === 'status'">
            <template v-for="(item, key) in db.addClusterStatusObj">
              <div
                class="table-tr"
                v-if="!['exitstatus', 'id', 'pstart'].includes(key)"
                :key="key"
              >
                <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                <div class="table-td" v-if="key === 'starttime'">
                  {{ dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm") }}
                </div>
                <div class="table-td" v-else>{{ item }}</div>
              </div>
            </template>
          </div>
        </div>
        </el-scrollbar>
      </template>
      <template slot="footer">
        <span></span>
      </template>
    </m-dialog>
    </template>
  </Dialog>
</template>

<script>
import MSteps from "../step/MSteps";
import MStep from "../step/MStep";
import Button from "../button/Button";
import CreateQemuHttp from "./Http";
import { flotToFixed, byteToSize, getEvent, percentToFixed, IP6_match, IP4_match, IP6_cidr_match, IP4_cidr_match, isEmpty, parseSSHKey,quickSort, dateFormat  } from "@libs/utils/";
import {
  VGALIST,
  BIOSLIST,
  SCSIHWLIST,
  MACHINELIST,
  DEVICELIST,
  CACHELIST,
  CPULIST,
  MODELLIST,
	VMCPUFlag
} from "@libs/enum/enum";
import Dialog from "@src/components/dialog/Dialog";
export default {
  name: "CreateLxcModal",
  mixins: [CreateQemuHttp],
  props: {
    visible: Boolean,
  },
  components: {
    MStep,
    MSteps,
    "m-button": Button,
    Dialog,
  },
  data() {
    return {
			interVal: null,
      showLog: false,
      tab: "log",
			name: '',
			hostname: '',
			nameserver:'',
			searchdomain: '',
			ip: '',
			ip6: '',
			gw: '',
			gw6: '',
			vmid: '',
			nodename: '',
			pool: '',
			ssh: '',
			unprivileged: false,
			storage: '',
			rootStorage: '',
			tmpl: '',
			password: '',
			vPsw: '',
			size: 8,
			acl: '',
			quota: '',
			mountoptions: ['noatime'],
			replicate: '',
			cores: '',
			cpulimit: '',
			cpuunits: '',
			firewall: false,
			rate: '',
			tag:'',
			bridge: '',
			hwaddr:'',
			ip4type: 'static',
			ip6type: 'static',
			step: 1,
			isAdvice: true,
			poolList: [],
			nodeList: [],
			storageList: [],
			rootStorageList: [],
			networkList: [],
			isoList: [],
			memory: '',
			swap: '',
			start: false,
			 munteoptionsItems: [
        { label: "noatime", value: "noatime" },
        { label: "nodev", value: "nodev" },
        { label: "noexec", value: "noexec" },
        { label: "nosuid", value: "nosuid" },
      ],
      aclsItems: [
        { value: "__default__", label: "默认" },
        { value: "1", label: "已启用" },
        { value: "0", label: "已禁用" },
			],
			params: {

			},
      rules: {
				storage: {
					error: false,
          message: "",
				},
				tmpl: {
					error: false,
          message: "",
				},
        name: {
          error: false,
          message: "",
        },
        vmid: {
          error: false,
          message: "",
        },
        nodename: {
          error: false,
          message: "",
        },
        swap: {
          error: false,
          message: "",
        },
        ip: {
          error: false,
          message: "",
        },
        ip6: {
          error: false,
          message: "",
        },
        size: {
          error: false,
          message: "",
        },
        vPsw: {
          error: false,
          message: "",
        },
        password: {
          error: false,
          message: "",
        },
        cores: {
          error: false,
          message: "",
        },
        cpuunits: {
          error: false,
          message: "",
        },
        memory: {
          error: false,
          message: "",
				},
				gw: {
          error: false,
          message: "",
				},
				gw6: {
          error: false,
          message: "",
				},
				pool: {
					error: false,
          message: "",
				},
				ssh: {
					error: false,
          message: "",
				},
				hostname: {
					error: false,
          message: "",
				},
				rootStorage: {
					error: false,
          message: "",
				},
				cpulimit: {
	        error: false,
          message: "",
				},
				cpuunits: {
	        error: false,
          message: "",
				},
				hwaddr: {
					error: false,
          message: "",
				},
				bridge: {
					error: false,
          message: "",
				},
				searchdomain: {
					error: false,
          message: "",
				},
				nameserver: {
					error: false,
          message: "",
				}
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    flotToFixed, //格式化内存、磁盘数据
		byteToSize, //格式化内存、磁盘数据
    percentToFixed,
    dateFormat,
    //确定添加
    confirm() {
			//创建请求
			delete this.params.nodename;
      this.createLxc(
        Object.assign(this.params, { start: this.start ? 1 : 0, password: this.password })
      ).then(() => {
				  this.tab = "log";
          this.showLog = true;
					this.interVal = setInterval(() => {
						this.queryLog(this.nodename, this.db.addClusterStatusObj.upid);
						this.queryStatus(this.nodename, this.db.addClusterStatusObj.upid);
					}, 3000);
			}).catch((res) => {
        this.$confirm.confirm({
          msg: res,
        });
      });
		},
		 //结束任务
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      ).then((res) => {
        if (this.interVal) {
          clearInterval(this.interVal);
          this.interVal = null;
        }
      });
    },
    closeLog() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.$emit('close');
    },
    /**
     * 上传ssh
    */
		uploadSsh() {
      let file = this.$refs.uploadFile.files[0],
          rs = new FileReader();
          rs.onload = (e) => {
            if(e.target.readyState === 2) {
              this.ssh = e.target.result;
            }
          }
          rs.readAsText(file);
		},
    cancel() {},
    //下一步按钮所做操作
    async next() {
      //整体校验没一步的表单
      if (this.validateAll()) return;
      //校验通过则步骤加1
      if (this.step < 8) ++this.step;
      if (this.step === 2) {
        //查询存储
        await this.queryStorageList({format: 1, content: 'vztmpl'}).then((res) => {
          this.storage = this.storageList[0].storage;
        });
        //根据存储查询相应的模板列表并初始化
        this.queryIsoList({ storage: this.storage, content: "vztmpl" }).then(
          (res) => {
            this.tmpl =
              this.isoList.length > 0 ? this.isoList[0].volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2') : "";
          }
        );
      }
      if (this.step === 3) {
        //查询存储
      this.queryStorageList({format: 1,content: 'rootdir'}).then((data) => {
				  this.rootStorageList = data || [];
          this.rootStorage =
            this.rootStorageList.length > 0
              ? this.rootStorageList[0].storage
              : "";
        });
      }
      if (this.step === 6) {
        //查询网络初始化网络选择
        Promise.all([this.queryNetWorkList()]).then(() => {
          this.bridge =
            this.networkList.length > 0 ? this.networkList[0].iface : "";
        });
      }
      if (this.step === 8) {
        //拼接添加请求参数
				//网络
				let network = '';
				if(this.name) network+=`name=${this.name},`;
				if(this.bridge) network+=`bridge=${this.bridge},`;
				if(this.firewall) network+=`firewall=1,`;
				if(this.ip) network+=`ip=${this.ip},`;
				if(this.ip6)  network+=`ip6=${this.ip6},`;
				if(this.gw)  network+=`gw=${this.gw},`;
				if(this.gw6)  network+=`gw6=${this.gw6},`;
				if(this.hwaddr)  network+=`hwaddr=${this.hwaddr},`;
				if(this.rate)  network+=`rate=${this.rate},`;
				if(this.tag)  network+=`tag=${this.tag},`;
				if(this.ip4type && this.ip4type !== 'static')  network+=`ip=${this.ip4type},`;
				if(this.ip6type && this.ip6type !== 'static')  network+=`ip6=${this.ip6type},`;
				//根磁盘
				let rootDisk = '';
				rootDisk+=`${this.rootStorage}:${this.size},`;
				if(this.isAdvice) {
					if(this.acl && this.acl !== "__default__") rootDisk+=`acl=${this.acl},`;
					if(this.replicate) rootDisk+=`replicate=0,`;
					if(this.mountoptions) rootDisk+=`mountoptions=${this.mountoptions.join(';')},`;
					if(this.quota) rootDisk+=`quota=1,`;
				}
				//os模板
        let tmpl = '';
				tmpl+=`${this.storage}:vztmpl/${this.tmpl},`;
				let baseParams = {};
			  baseParams = {
					cores: this.cores,
					hostname: this.hostname,
					memory: this.memory,
					nameserver: this.nameserver,
					net0: network.replace(/\,$/, ''),
					nodename: this.nodename,
					ostemplate: tmpl.replace(/\,$/, ''),
					pool: this.pool,
					rootfs: rootDisk.replace(/\,$/, ''),
					searchdomain: this.searchdomain,
					swap: this.swap,
					vmid: this.vmid
				}
				if(this.isAdvice) {
					baseParams['cpulimit'] = this.cpulimit;
					baseParams['cpuunits'] = this.cpuunits;
				}
				if(!this.unprivileged) {
           baseParams['unprivileged'] = 1;
				}
				Object.keys(baseParams).forEach((key) => {
          if (!baseParams[key]) delete baseParams[key];
        });
        this.params = baseParams;
      }
    },
    //上一步
    prev() {
      //步骤逐次递减直到为1
      if (this.step > 1) --this.step;
    },
    //关闭
    close() {
      this.$emit("close", false);
    },
    //整体校验
    validateAll() {
      let props = [];
			if (this.step === 1) props = ["nodename", "vmid", "password", 'vPsw', 'ssh', 'hostname'];
			if (this.step === 2) props = ["storage", 'tmpl'];
      if (this.step === 4) {
        this.isAdvice
          ? (props = [
              "cpulimit",
              "cpuunits",
              "cores",
            ])
          : (props = ["cores"]);
      }
      if (this.step === 5) {
        props = ['memory', 'swap']
      }
      if (this.step === 6) {
       props = ['name', 'bridge', 'gw', 'gw6', 'ip', 'ip6', 'hwaddr'];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    //逐个校验
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value) && ['vmid', 'nodename', 'storage', 'tmpl', 'size', 'memory', 'swap', 'name', 'rootStorage'].includes(prop)) {
        //判断是否为空
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (value && prop == "hostname" && !/^\w/.test(value)) {
        //判断名称
        this.rules[prop].error = true;
        this.rules[prop].message = "名称以数字或字母开头";
        return;
      }
      if (prop == "vmid" && !/\d/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "VM ID只能是数字";
        return;
      }
      if (prop == "vmid" && value < this.nextid) {
        this.rules[prop].error = true;
        this.rules[prop].message = "VM ID不能小于初始值";
        return;
			}
			if(prop === 'vPsw' && value) {
				if(value !== this.password) {
					 this.rules[prop].error = true;
           this.rules[prop].message = "两次输入的密码不一致!";
           return;
				}
			}
			if(prop === 'name') {
				if(/[\u4e00-\u9fa5]/.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '名称中不能存在汉字!';
				    return;
				}
			}
			if(value && prop === 'ip') {
				if(!IP4_cidr_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = 'IPv4/CIDR格式不正确!';
				    return;
				}
			}
			if(value && prop === 'ip6') {
				if(!IP6_cidr_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = 'IPv6/CIDR格式不正确! 示例：2001:DB8::42/64';
				    return;
				}
			}
			if(value && prop === 'gw') {
					if(!IP4_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '网关格式不正确! 示例： 2001:DB8::42';
				    return;
				}
			}
			if(value && prop === 'gw6') {
					if(!IP6_match.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = '网关格式不正确!';
				    return;
				}
			}
			if(value && prop === 'hwaddr') {
        if(!/[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}/.test(value)) {
						this.rules[prop].error = true;
				    this.rules[prop].message = 'mac格式不正确!';
				    return;
				}
			}
			if(value && prop === 'nameserver' && !/^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value)) {
          	this.rules[prop].error = true;
				    this.rules[prop].message = '格式不正确!';
				    return;
			}
      if (prop === "cpuunits" && value && Number(value) < 8) {
        this.rules[prop].error = true;
        this.rules[prop].message = `值不能小于8`;
        return;
      }
      if(value && prop === 'ssh') {
        if(!parseSSHKey(this.ssh)) {
          this.rules[prop].error = true;
          this.rules[prop].message = `公钥格式不正确!`;
          return;
        }
      }
		},
		handleStepChange() {},
    __init__() {
      Promise.all([
        this.queryNodeList(),
        this.queryPoolList(),
        this.queryNextVmId(),
      ]).then(() => {
        this.templateRadio = this.nodeList && this.nodeList[0].id;
        this.nodename = this.nodeList && this.nodeList[0].node;
      });
    },
    //选择存储
    handleStorageSingleList(val) {
      this.storageRadio = val.storage;
      this.queryIsoList({ storage: this.storageRadio, content: "iso" }).then(
        (res) => {
          this.isoRadio = this.isoList.length > 0 ? this.isoList[0].volid : "";
        }
      );
    },
    //选择镜像存储
    handleImageStorageChange(val) {
      this.imageStorageRadio = val;
      this.storageType = this.imageStorageList.filter(
        (it) => it.storage === val
      )[0].type;
      if (this.storageType === "dir") this.format = "qcow2";
      else this.format = "raw";
		},
		//选择存储并请求模板列表
    handleStorageSelect(val) {
			this.storage = val;
			this.queryIsoList({ storage: this.storage, content: "vztmpl" }).then(
          (res) => {
            this.tmpl =
              this.isoList.length > 0 ? this.isoList[0].volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2') : "";
          }
        );
		},
		isQuota() {

		},
		handleTabChange(value) {
			this.tab = value;
		}
	},
	//页面销毁之前取消定时任务
	beforeDestroy() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
	},
  watch: {
    visible: function (newVal, oldVal) {
			debugger;
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
};
</script>

<style scoped lang="less">
.vm-cpu__flag {
  /deep/.el-table__body {
    font-size: 12px;
  }
}
.cpu-check {
  width: 100%;
  white-space: nowrap;
}
.cpu-label {
  width: 55px;
  display: inline-block;
}
.m-form__section{
	dl{
			width: 964px
	}
}
</style>
