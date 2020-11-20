<template>
  <Dialog
    :visible="showCreateVm"
    @close="close()"
    @confirm="confirm"
    @cancel="cancel"
    cancelText="重置"
    :_style="{
            'width': '100%', 
          'height': 'calc(100%)', 
          'position': 'absolute', 
          'top': '0', 
          'left': '0', 
           right: '0',
           bottom: '0'
          }"
    title="创建虚拟机"
  >
    <template slot="content">
      <div>
        <m-steps :active="step" @change="handleStepChange">
          <m-step title="一般"></m-step>
          <m-step title="操作系统"></m-step>
          <m-step title="系统"></m-step>
          <m-step title="银盘">银盘</m-step>
          <m-step title="CPU">CPU</m-step>
          <m-step title="内存">内存</m-step>
          <m-step title="网络">网络</m-step>
          <m-step title="确认">确认</m-step>
        </m-steps>
      </div>
      <div v-show="step === 1" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>名称</dt>
            <dd>
              <m-input
                v-model="name"
                prop="name"
                validateEvent
                :show-error="rules['name'].error"
                :error-msg="rules['name'].message"
                @validate="validate"
                placeholder="请输入名称"
              />
            </dd>
          </dl>
          <dl>
            <dt>VM ID</dt>
            <dd>
              <m-input
                type="number"
                @validate="validate"
                validateEvent
                prop="vmid"
                :show-error="rules['vmid'].error"
                :error-msg="rules['vmid'].message"
                v-model="vmid"
                :min="100"
                placeholder="请输入VM ID"
              />
            </dd>
          </dl>
        </div>
        <div class="m-form__section">
          <dl>
            <dt>节点</dt>
            <dd>
              <el-table
                :data="nodeList"
                @current-change="handleCurrentChange"
                highlight-current-row
              >
                <el-table-column type="index" width="50">
                  <template slot-scope="scope">
                    <el-radio :label="scope.row.id" v-model="templateRadio">&nbsp</el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="node" label="节点" width="180"></el-table-column>
                <el-table-column label="内存使用率" width="180">
                  <template slot-scope="scope">
                    <span>{{flotToFixed(scope.row.mem / scope.row.maxmem, 2)}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="CPU使用率" width="180">
                  <template slot-scope="scope">
                    <span>{{flotToFixed(scope.row.cpu, 2)}}</span>
                  </template>
                </el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
        <div class="m-form__section">
          <dl>
            <dt>资源池</dt>
            <dd>
              <el-table
                @current-change="handleCurrentPoolChange"
                highlight-current-row
                :data="poolList"
              >
                <el-table-column type="index" width="50">
                  <template slot-scope="scope">
                    <el-radio :label="scope.row.poolid" v-model="poolRadio">&nbsp</el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="poolid" label="资源池" width="180"></el-table-column>
                <el-table-column prop="description" label="备注" width="180"></el-table-column>
              </el-table>
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>开机自启动</dt>
            <dd>
              <label class="m-form__checkbox">
                <input type="checkbox" v-model="onboot" />
                <div></div>
              </label>
            </dd>
          </dl>
          <dl>
            <dt>启动/关机顺序</dt>
            <dd>
              <m-input type="text" v-model="order" placeholder="请输入启动/关机顺序" />
            </dd>
          </dl>
          <dl>
            <dt>启动延时</dt>
            <dd>
              <m-input type="text" v-model="up" placeholder="请输入启动延时" />
            </dd>
          </dl>
          <dl>
            <dt>关机延时</dt>
            <dd>
              <m-input type="text" v-model="down" placeholder="请输入关机延时" />
            </dd>
          </dl>
        </div>
      </div>
      <div v-if="step === 2" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt style="width: 100%">
              <label class="m-input__radio">
                <input type="radio" value="iso" name="mediaType" v-model="mediaType" />
                <div></div>
              </label>
              使用CD/DVD光盘文件(ISO)
            </dt>
            <dd>
              <dl>
                <dt>存储</dt>
                <dd>
                  <el-table :data="storageList" current-row-key @current-change="handleStorageSingleList">
                    <el-table-column type="index" width="50">
                      <template slot-scope="scope">
                        <el-radio :label="scope.row.storage" v-model="storageRadio">&nbsp</el-radio>
                      </template>
                    </el-table-column>
                    <el-table-column prop="storage" label="名称"></el-table-column>
                    <el-table-column prop="type" label="类别" width="180"></el-table-column>
                    <el-table-column label="可用" width="180">
                      <template slot-scope="scope">
                        <span>{{byteToSize(scope.row.avail)}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="容量">
                      <template slot-scope="scope">
                        <span>{{byteToSize(scope.row.total)}}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </dd>
                <dt>镜像</dt>
                <dd>
                  <el-table :data="isoList" :class="{'m-input__error': rules['isoRadio'].error}">
                    <el-table-column type="index" width="50">
                      <template slot-scope="scope">
                        <el-radio :label="scope.row.volid" v-model="isoRadio">&nbsp</el-radio>
                      </template>
                    </el-table-column>
                    <el-table-column prop="volid" label="名称"></el-table-column>
                    <el-table-column prop="format" label="格式" width="180"></el-table-column>
                    <el-table-column label="大小">
                      <template slot-scope="scope">
                        <span>{{byteToSize(scope.row.size)}}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </dd>
              </dl>
            </dd>
          </dl>
        </div>
        <div class="m-form__section">
          <dl>
            <dt style="width: 100%">
              <label class="m-input__radio">
                <input type="radio" value="cdrom" name="mediaType" v-model="mediaType" />
                <div></div>
              </label>
              使用物理CD/DVD驱动器
            </dt>
          </dl>
        </div>
        <div class="m-form__section">
          <dl>
            <dt style="width: 100%">
              <label class="m-input__radio">
                <input type="radio" value="none" name="mediaType" v-model="mediaType" />
                <div></div>
              </label>
              不使用任何介质
            </dt>
          </dl>
        </div>
        <div class="m-form__section">
          <dl>
            <dt>访客OS</dt>
            <dd>
              <div class="m-form__select" style="width: 250px;">
                <label>类别</label>
                <select class="m-form__select_inner" v-model="osType" @change="handleOsTypeChange">
                  <option
                    v-for="item of osTypeList"
                    icon="fa fa-gear"
                    :key="item.value"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
              <div class="m-margin-top-10 m-form__select" style="width: 250px;">
                <label>版本</label>
                <select class="m-form__select_inner" v-model="version">
                  <option
                    v-for="item of versionList"
                    :key="item.value"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <div v-if="step === 3" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>显卡</dt>
            <dd>
              <div class="m-margin-top-10 m-form__select" style="width: 215px;">
                <select class="m-form__select_inner" v-model="vga">
                  <option
                    v-for="(item, index) of vgaList"
                    :key="index"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
            </dd>
            <dt>SCSI控制器</dt>
            <dd>
              <div class="m-margin-top-10 m-form__select" style="width: 215px;">
                <select class="m-form__select_inner" v-model="scsihw">
                  <option
                    v-for="(item, index) of scsiHWList"
                    :key="index"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
            </dd>
            <dt>Qemu代理</dt>
            <dd>
              <label class="m-form__checkbox">
                <input type="checkbox" v-model="agent" />
                <div></div>
              </label>
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>BIOS</dt>
            <dd>
              <div class="m-margin-top-10 m-form__select" style="width: 215px;">
                <select class="m-form__select_inner" v-model="bios">
                  <option
                    v-for="(item,index) of biosList"
                    :key="index"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
            </dd>
            <dt>Machine</dt>
            <dd>
              <div class="m-margin-top-10 m-form__select" style="width: 215px;">
                <select class="m-form__select_inner" v-model="machine">
                  <option
                    v-for="(item, index) of machineList"
                    :key="index"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
            </dd>
            <template v-if="bios === 'ovmf'">
              <dt>添加EFI磁盘</dt>
              <dd>
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="efi" />
                  <div></div>
                </label>
              </dd>
              <div class="m-margin-top-10" v-if="efi">
                <dt>存储</dt>
                <dd>
                  <el-table :data="imageStorageList" highlight-current-row @current-change="handleImageStorageChange">
                    <el-table-column type="index" width="50">
                      <template slot-scope="scope">
                        <el-radio :label="scope.row.storage" v-model="imageStorageRadio">&nbsp</el-radio>
                      </template>
                    </el-table-column>
                    <el-table-column label="名称" prop="storage"></el-table-column>
                    <el-table-column label="类别" prop="type"></el-table-column>
                    <el-table-column label="可用">
                      <template slot-scope="scope">
                        <span>{{byteToSize(scope.row.avail)}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="容量">
                      <template slot-scope="scope">
                        <span>{{byteToSize(scope.row.total)}}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </dd>
              </div>
              <dt>格式</dt>
              <dd>
                <div class="m-margin-top-10 m-form__select" style="width: 215px;">
                  <select class="m-form__select_inner" v-model="format" disabled>
                    <option
                      v-for="(item, index) of formatList"
                      :key="index"
                      :value="item.value"
                    >{{item.label}}</option>
                  </select>
                </div>
              </dd>
            </template>
          </dl>
        </div>
      </div>
      <div v-if="step === 4" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="number"
                label="总线"
                v-model="deviceIndex"
                labelWidth="110px"
                min="0"
                prop="deviceIndex"
                :_style="{paddingLeft: '115px'}"
                @validate="validate"
                :error-msg="rules['deviceIndex'].message"
                :show-error="rules['deviceIndex'].error"
              >
                <div
                  slot="prefix"
                  style="display: inline-block;
                    position: absolute;
                    top: -11px;
                    left: -1px;
                    height: 100%;"
                >
                  <div class="m-margin-top-10 m-form__select" style="width: 115px;">
                    <select class="m-form__select_inner" v-model="device" style="width:110px">
                      <option
                        v-for="item of deviceList"
                        :key="item.value"
                        :value="item.value"
                      >{{item.label}}</option>
                    </select>
                  </div>
                </div>
              </m-input>
              <div style="margin-bottom: 20px;">
                <label
                  class="m-margin-top-10"
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >缓存</label>
                <div
                  class="m-margin-top-10 m-form__select"
                  style="width: 215px;display: inline-block"
                >
                  <select class="m-form__select_inner" v-model="cache">
                    <option
                      v-for="(item, index) of cacheList"
                      :key="index"
                      :value="item.value"
                    >{{item.label}}</option>
                  </select>
                </div>
              </div>
              <div style="margin-bottom: 20px;" v-if="device === 'scsi'">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >SCSI控制器</label>
                VIRTIO SCSI
              </div>
              <div style="margin-bottom: 20px;">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >丢弃</label>
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="discard" :disabled="device === 'virtio'" />
                  <div></div>
                </label>
              </div>
              <m-input
                type="number"
                labelWidth="110px"
                label="磁盘大小"
                v-model="disksize"
                validateEvent
                @validate="validate"
                prop="disksize"
                :error-msg="rules['disksize'].message"
                :show-error="rules['disksize'].error"
              />
              <div style="margin-bottom: 20px;">
                <label
                  class="m-margin-top-10"
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >格式</label>
                <div
                  class="m-margin-top-10 m-form__select"
                  style="width: 215px;display: inline-block"
                >
                  <select class="m-form__select_inner" v-model="format" disabled>
                    <option
                      v-for="(item, index) of formatList"
                      :key="index"
                      :value="item.value"
                    >{{item.label}}</option>
                  </select>
                </div>
              </div>
            </dd>
          </dl>
        </div>
        <div class="m-margin-top-10 m-form__section">
          <dt>存储</dt>
          <dd>
            <el-table :data="imageStorageList" highlight-current-row @current-change="handleImageStorageChange">
              <el-table-column type="index" width="50">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.storage" v-model="imageStorageRadio">&nbsp</el-radio>
                </template>
              </el-table-column>
              <el-table-column label="名称" prop="storage"></el-table-column>
              <el-table-column label="类别" prop="type"></el-table-column>
              <el-table-column label="可用">
                <template slot-scope="scope">
                  <span>{{byteToSize(scope.row.avail)}}</span>
                </template>
              </el-table-column>
              <el-table-column label="容量">
                <template slot-scope="scope">
                  <span>{{byteToSize(scope.row.total)}}</span>
                </template>
              </el-table-column>
            </el-table>
          </dd>
        </div>
        <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
          <dt>高级</dt>
          <dd>
            <div style="margin-bottom: 20px;">
              <label
                style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
              >SSD仿真</label>
              <label class="m-form__checkbox">
                <input type="checkbox" v-model="ssd" :disabled="device === 'virtio'" />
                <div></div>
              </label>
            </div>
            <div style="margin-bottom: 20px;">
              <label
                style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
              >没有备份</label>
              <label class="m-form__checkbox">
                <input type="checkbox" v-model="backup" />
                <div></div>
              </label>
            </div>
            <div style="margin-bottom: 20px;">
              <label
                style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
              >IO Thread</label>
              <label class="m-form__checkbox">
                <input
                  type="checkbox"
                  v-model="iothread"
                  :disabled="!(device==='scsi' || device === 'virtio')"
                />
                <div></div>
              </label>
            </div>
            <div style="margin-bottom: 20px;">
              <label
                style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
              >跳过复制</label>
              <label class="m-form__checkbox">
                <input type="checkbox" v-model="replicate" />
                <div></div>
              </label>
            </div>
            <m-input
              label="读取限制(MB/s)"
              labelWidth="110px"
              placeholder="无限"
              type="number"
              v-model="mbps_rd"
              class="m-margin-top-10"
            />
            <m-input
              label="写入限制(MB/s)"
              labelWidth="110px"
              placeholder="无限"
              type="number"
              v-model="mbps_wr"
              class="m-margin-top-10"
            />
            <m-input
              label="读取限制(ops/s)"
              labelWidth="110px"
              placeholder="无限"
              type="number"
              prop="iops_rd"
              @validate="validate"
              validateEvent
              class="m-margin-top-10"
              :show-error="rules['iops_rd'].error"
              :error-msg="rules['iops_rd'].message"
              v-model="iops_rd"
            />
            <m-input
              label="写入限制(ops/s)"
              labelWidth="110px"
              placeholder="无限"
              type="number"
              prop="iops_wr"
              class="m-margin-top-10"
              @validate="validate"
              validateEvent
              :show-error="rules['iops_wr'].error"
              :error-msg="rules['iops_wr'].message"
              v-model="iops_wr"
            />
            <m-input
              label="读取最大突发(MB)"
              labelWidth="110px"
              placeholder="默认"
              type="number"
              v-model="mbps_rd_max"
              class="m-margin-top-10"
            />
            <m-input
              label="写入最大突发(MB)"
              labelWidth="110px"
              placeholder="默认"
              type="number"
              v-model="mbps_wr_max"
              class="m-margin-top-10"
            />
            <m-input
              label="读取最大突发(ops)"
              labelWidth="110px"
              placeholder="默认"
              type="number"
              prop="iops_rd_max"
              @validate="validate"
              class="m-margin-top-10"
              validateEvent
              :show-error="rules['iops_rd_max'].error"
              :error-msg="rules['iops_rd_max'].message"
              v-model="iops_rd_max"
            />
            <m-input
              label="写入最大突发(ops)"
              labelWidth="110px"
              placeholder="默认"
              type="number"
              prop="iops_wr_max"
              @validate="validate"
              class="m-margin-top-10"
              validateEvent
              :show-error="rules['iops_wr_max'].error"
              :error-msg="rules['iops_wr_max'].message"
              v-model="iops_wr_max"
            />
          </dd>
        </div>
      </div>
      <div v-if="step === 5" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="number"
                labelWidth="110px"
                label="Sockets"
                prop="sockets"
                @validate="validate"
                validateEvent
                :show-error="rules['sockets'].error"
                :error-msg="rules['sockets'].message"
                class="m-margin-top-10"
                v-model="sockets"
              />
              <div style="margin-bottom: 20px;">
                <label
                  class="m-margin-top-10"
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >类别</label>
                <div
                  class="m-margin-top-10 m-form__select"
                  style="width: 215px;display: inline-block"
                >
                  <select class="m-form__select_inner" v-model="cpu">
                    <option
                      v-for="(item, index) of cpuList"
                      :key="index"
                      :value="item.value"
                    >{{item.label}}</option>
                  </select>
                </div>
              </div>
              <m-input
                type="number"
                prop="cores"
                @validate="validate"
                validateEvent
                :show-error="rules['cores'].error"
                :error-msg="rules['cores'].message"
                v-model="cores"
                labelWidth="110px"
                label="核"
              />
              <div style="margin-bottom: 20px;">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >核总数</label>
                VIRTIO SCSI
              </div>
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>高级</dt>
            <dd>
              <m-input
                type="number"
                labelWidth="110px"
                class="m-margin-top-10"
                prop="vcpus"
                @validate="validate"
                validateEvent
                :show-error="rules['vcpus'].error"
                :error-msg="rules['vcpus'].message"
                v-model="vcpus"
                label="VCPUs"
              />
              <m-input
                type="number"
                labelWidth="110px"
                class="m-margin-top-10"
                v-model="cpulimit"
                label="CPU限制"
              />
              <m-input
                type="number"
                labelWidth="110px"
                prop="cpuunits"
                @validate="validate"
                validateEvent
                class="m-margin-top-10"
                :show-error="rules['cpuunits'].error"
                :error-msg="rules['cpuunits'].message"
                v-model="cpuunits"
                label="CPU权重"
              />
              <div style="margin-bottom: 20px;">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >启用NUMA</label>
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="numa" />
                  <div></div>
                </label>
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <div v-if="step === 6" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>基本信息</dt>
            <dd>
              <m-input
                type="number"
                labelWidth="110px"
                label="内存"
                prop="memory"
                validateEvent
                class="m-margin-top-10"
                @validate="validate"
                :show-error="rules['memory'].error"
                :error-msg="rules['memory'].message"
                v-model="memory"
              />
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>高级</dt>
            <dd>
              <m-input
                type="number"
                labelWidth="110px"
                label="最小内存"
                prop="ballon"
                validateEvent
                class="m-margin-top-10"
                @validate="validate"
                :show-error="rules['ballon'].error"
                :error-msg="rules['ballon'].message"
                :disable="!balloncheck"
                v-model="ballon"
              />
              <m-input
                type="number"
                labelWidth="110px"
                label="共享"
                v-model="shares"
                :disabled="!balloncheck || ballon === memory"
              />
              <div style="margin-bottom: 20px;">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >Balloning设备</label>
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="balloncheck" />
                  <div></div>
                </label>
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <div v-if="step === 7" class="m-form__content">
        <div class="m-form__section">
          <dt>基本信息</dt>
          <dd>
            <div style="margin-bottom: 20px;">
              <label
                style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
              >无网络设备</label>
              <label class="m-form__checkbox">
                <input type="checkbox" v-model="hasnetwork" />
                <div></div>
              </label>
            </div>
            <m-input
              type="number"
              labelWidth="110px"
              class="m-margin-top-10"
              label="VLAN标签"
              v-model="tag"
              :disabled="hasnetwork"
            />
            <m-input
              type="number"
              labelWidth="110px"
              label="MAC地址"
              class="m-margin-top-10"
              v-model="mac"
               :disabled="hasnetwork"
            />
            <div style="margin-bottom: 20px;">
              <label
                class="m-margin-top-10"
                style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
              >模型</label>
              <div
                class="m-margin-top-10 m-form__select"
                style="width: 215px;display: inline-block"
              >
                <select class="m-form__select_inner" v-model="model"  :disabled="hasnetwork">
                  <option
                    v-for="(item, index) of modelList"
                    :key="index"
                    :value="item.value"
                  >{{item.label}}</option>
                </select>
              </div>
              <div style="margin-bottom: 20px;">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >防火墙</label>
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="firewall"  :disabled="hasnetwork"/>
                  <div></div>
                </label>
              </div>
            </div>
          </dd>
        </div>
        <div class="m-form__section" v-show="!hasnetwork">
          <dt>网络</dt>
          <dd>
            <el-table :data="networkList">
              <el-table-column type="index" width="50">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.iface" v-model="networkRadio">&nbsp</el-radio>
                </template>
              </el-table-column>
              <el-table-column label="调节" prop="iface"></el-table-column>
              <el-table-column label="活动" prop="type">
                <template slot-scope="scope">
                  <span>{{scope.row.active ? '是' : '不是'}}</span>
                </template>
              </el-table-column>
              <el-table-column label="备注">
                <template slot-scope="scope">
                  <span></span>
                </template>
              </el-table-column>
            </el-table>
          </dd>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>高级</dt>
            <dd>
              <div style="margin-bottom: 20px;">
                <label
                  style="padding-left:10px;height: 28px;
                  width:120px;
                  line-height:28px;display:inline-block;
                  vertical-align: middle;"
                >断开</label>
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="link_down"  :disabled="hasnetwork"/>
                  <div></div>
                </label>
              </div>
              <m-input
                type="number"
                labelWidth="110px"
                label="速率限制"
                v-model="rate"
                :disabled="hasnetwork"
              />
              <m-input
                type="number"
                labelWidth="110px"
                label="Multiqueue"
                v-model="queues"
                :disabled="hasnetwork"
              />
            </dd>
          </dl>
        </div>
      </div>
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
                <div v-for="(data, key) of params"
                     class="table-tr"
                     :key="key">
                   <span class="table-td">{{key}}</span>
                   <span class="table-td">{{data}}</span>
                </div>
              </div>
            </dd>
          </dl>
        </div>
        <div class="m-form__section">
          <dl>
            <dt>创建后自启动</dt>
            <dd>
              <div style="margin-bottom: 20px;">
                <label class="m-form__checkbox">
                  <input type="checkbox" v-model="start"/>
                  <div></div>
                </label>
              </div>
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
        style="height:40px; line-height: 40px; width: 100px"
        @on-click="prev()"
      >上一步</m-button>
      <m-button
        type="primary"
        style="height:40px; line-height: 40px; width: 100px"
        @on-click="next()"
        v-show="step < 8"
      >下一步</m-button>
      <m-button
        type="primary"
        style="height:40px; line-height: 40px; width: 100px"
        @on-click="confirm()"
        v-show="step === 8"
      >确定</m-button>
    </template>
  </Dialog>
</template>

<script>
import MSteps from "../step/MSteps";
import MStep from "../step/MStep";
import Button from "../button/Button";
import CreateQemuHttp from "./Http";
import { flotToFixed, byteToSize, getEvent } from "@libs/utils/";
import {
  VGALIST,
  BIOSLIST,
  SCSIHWLIST,
  MACHINELIST,
  DEVICELIST,
  CACHELIST,
  CPULIST,
  MODELLIST,
} from "@libs/enum/enum";
import Dialog from "@src/components/dialog/Dialog";
export default {
  name: "CreateQemuModal",
  mixins: [CreateQemuHttp],
  props: {
    showCreateVm: Boolean,
  },
  components: {
    MStep,
    MSteps,
    "m-button": Button,
    Dialog,
  },
  data() {
    return {
      step: 1,
      isAdvice: true,
      name: "",
      vmid: 100,
      autoOpen: false,
      templateRadio: "",
      storageRadio: "",
      poolRadio: "",
      onboot: true,
      agent: false,
      down: "",
      up: "",
      order: "",
      nodename: "",
      pool: "",
      scsihw: "lsi",
      machine: "",
      bios: "seabios",
      vga: "",
      efi: false,
      discard: false,
      start: false,
      params: {},
      nodeList: [],
      poolList: [],
      isoList: [],
      storageList: [],
      vgaList: VGALIST,
      scsiHWList: SCSIHWLIST,
      biosList: BIOSLIST,
      machineList: MACHINELIST,
      imageStorageList: [],
      deviceList: DEVICELIST,
      cacheList: CACHELIST,
      cpuList: CPULIST,
      model: 'virtio',
      modelList: MODELLIST,
      cpu: "kvm64",
      cache: "",
      device: "scsi",
      nextid: 100,
      mediaType: "iso",
      isoRadio: "",
      osType: "linux",
      version: "l26",
      format: "raw",
      iops_wr: "",
      iops_wr_max: "",
      iops_rd: "",
      iops_rd_max: "",
      mbps_wr: "",
      mbps_wr_max: "",
      mbps_rd: "",
      mbps_rd_max: "",
      sockets: 1,
      cores: 1,
      vcpus: "",
      mac: '',
      cpuunits: 1024,
      cpulimit: 1,
      numa: false,
      deviceIndex: 0,
      disksize: 32,
      shares: "",
      memory: 512,
      ballon: 512,
      balloncheck: true,
      ssd: false,
      replicate: false,
      backup: false,
      iothread: false,
      hasnetwork: false,
      networkList: [],
      networkRadio: '',
      tag: '',
      firewall: '',
      rate: '',
      queues: '',
      link_down: false,
      formatList: [
        {
          label: "Raw磁盘映像（raw）",
          value: "raw",
        },
      ],
      osTypeList: [
        {
          label: "Linux",
          value: "linux",
        },
        {
          label: "Microsoft Windows",
          value: "win",
        },
        {
          label: "Solaris Kernel",
          value: "solaris",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      versionList: [
        {
          label: "5.x - 2.6 Kernel",
          value: "l26",
        },
        {
          label: "2.4 Kernel",
          value: "l24",
        },
      ],
      rules: {
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
        isoRadio: {
          error: false,
          message: "",
        },
        deviceIndex: {
          error: false,
          message: "",
        },
        disksize: {
          error: false,
          message: "",
        },
        iops_rd_max: {
          error: false,
          message: "",
        },
        iops_wr_max: {
          error: false,
          message: "",
        },
        iops_rd: {
          error: false,
          message: "",
        },
        iops_wr: {
          error: false,
          message: "",
        },
        sockets: {
          error: false,
          message: "",
        },
        cores: {
          error: false,
          message: "",
        },
        vcpus: {
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
        ballon: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    flotToFixed,
    byteToSize,
    confirm() {
      this.createQemu(Object.assign(this.params, {start: this.start ? 1 : 0}));
      this.commitUpdateChangeTree(true);
      this.close();
    },
    cancel() {},
    next() {
      if (this.validateAll()) return;
      if (this.step < 8) ++this.step;
      if (this.step === 2) {
        Promise.all([this.queryStorageList(), this.queryIsoList()]).then(() => {
          this.mediaType = "iso";
          this.storageRadio = this.storageList[0].storage;
          this.isoRadio = this.isoList.length > 0 ? this.isoList[0].volid : "";
        });
      }
      if (this.step === 3) {
        Promise.all([this.queryImageStorageList()]).then(() => {
          this.imageStorageRadio =
            this.imageStorageList.length > 0 ? this.imageStorageList[0].storage : "";
        });
      }
      if (this.step === 7) {
        Promise.all([this.queryNetWorkList()]).then(() => {
          this.networkRadio =
            this.networkList.length > 0 ? this.networkList[0].iface : "";
        });
      }
      if(this.step === 8) {
        let device = '';
        if(this.cache) device +=`cache=${this.cache},`;
        if(this.discard) device +=`discard=${this.discard ? 'on' : 'ignore'},`;
        if(this.imageStorageRadio) device +=`${this.imageStorageRadio}:${this.disksize},`;
        if(this.format) device +=`format=${this.format},`;
        let network = '';
        if(this.networkRadio) network+=`bridge=${this.networkRadio},`;
        if(this.tag) network+=`tag=${this.tag},`;
        if(typeof (this.firewall) =='undefined' && this.firewall) network+=`firewall=1,`;
        if(this.mac) network+=`mac=${this.mac},`;
        if(this.model) network+=`${this.model},`;
        let baseParams = {
          agent: this.agent ? 1 : '',
          cores: this.cores,
          cpulimit: this.cpulimit,
          ide2: `${this.mediaType === 'iso' ? `${this.isoRadio}` : this.mediaType},media=cdrom`,
          ostype: this.version,
          vga:  this.vga,
          scsihw: this.scsihw,
          qemu: this.qemu,
          [`${this.device}${this.deviceIndex}`]: device.replace(/\,$/, ''),
          sockets:this.sockets,
          cores: this.cores,
          cpu: this.cpu,
          memory: this.memory,
          net0: network.replace(/\,$/, ''),
          vmid: this.vmid
        }
        if(this.isAdvice) {
          let startup = '';
          if(this.order) startup+=`order=${this.order},`;
          if(this.up) startup+=`up=${this.up},`;
          if(this.down) startup+=`down=${this.down},`;
          if(typeof (this.backup) === 'undefined') device+=`backup=${this.backup ? 'on' : 'no'},`;
          if(typeof (this.replicate) === 'undefined') device+=`replicate=${this.replicate ? 'on' : 'no'},`;
          if(typeof (this.ssd) === 'undefined') device+=`ssd=${this.ssd ? 'on' : 'no'},`;
          if(typeof (this.iothread) === 'undefined') device+=`iothread=${this.iothread ? 'on' : 'no'},`;
          if(this.iops_rd_max) device+=`iops_rd_max=${this.iops_rd_max},`;
          if(this.iops_rd) device+=`iops_rd=${this.iops_rd},`;
          if(this.iops_wr) device+=`iops_wr=${this.iops_wr},`;
          if(this.iops_wr_max) device+=`iops_wr_max=${this.iops_wr_max},`;
          if(this.mbps_wr) device+=`mbps_wr=${this.mbps_wr},`;
          if(this.mbps_rd) device+=`mbps_rd=${this.mbps_rd},`;
          if(this.mbps_rd_max) device+=`mbps_rd_max=${this.mbps_rd_max},`;
          if(this.mbps_wr_max) device+=`mbps_wr_max=${this.mbps_wr_max},`;
          if(this.link_down) network+=`link_down=1,`;
          if(this.rate) network+=`rate=${this.rate},`;
          if(this.queues) network+=`queues=${this.queues},`;
          let params = {
            onboot: this.onboot ? 1 : '',
            startup: startup.replace(/\,$/, ''),
            bios: this.bios,
            machine: this.machine,
            vcpus: this.vcpus,
            cpulimit: this.cpulimit,
            numa: this.numa ? 1 : 0,
            cpuunits: this.cpuunits,
            balloon: this.balloon,
            shares: this.shares,
            net0: network.replace(/\,$/, ''),
            [`${this.device}${this.deviceIndex}`]: device.replace(/\,$/, ''),
          }
          Object.assign(baseParams,params);
        }
         Object.keys(baseParams).forEach(key =>{
           debugger;
            if(!baseParams[key]) delete baseParams[key]
          })
        this.params = baseParams;
      }
    },
    handleStepChange(){},
    prev() {
      if (this.step > 1) --this.step;
    },
    close() {
      this.visible = false;
      this.$emit("close", false);
    },
    validateAll() {
      let props = [];
      if (this.step === 1) props = ["name", "nodename", "vmid"];
      if (this.step === 2 && this.mediaType == "iso") {
        props = ["isoRadio"];
      } else {
        this.rules["isoRadio"].error = false;
      }
      if (this.step === 4) {
        this.isAdvice ? props = [
          "deviceIndex",
          "disksize",
          "iops_rd",
          "iops_wr",
          "iops_rd_max",
          "iops_wr_max",
        ] : props = [
          "deviceIndex",
          "disksize"
        ]
      }
      if (this.step === 5) {
        this.isAdvice ? props = ["sockets", "cores", "vcpus", "cpuunits"] : props = [
          "sockets", "cores"
        ];
      }
      if (this.step === 6) {
        this.isAdvice ? (props = ["memory", "ballon"]) : (props = ["memory"]);
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (/^\s*$/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "不能为空";
        return;
      }
      if (prop == "name" && !/^\w/.test(value)) {
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
      if (
        value &&
        ["iops_rd", "iops_wr", "iops_rd_max", "iops_wr_max"].includes(prop) &&
        Number(value) < 10
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "值不能小于10";
        return;
      }
      if (prop === "vcpus" && value && Number(value) > Number(this.cores)) {
        this.rules[prop].error = true;
        this.rules[prop].message = `值不能大于${this.cores}`;
        return;
      }
      if (prop === "cpuunits" && value && Number(value) < 8) {
        this.rules[prop].error = true;
        this.rules[prop].message = `值不能小于8`;
        return;
      }
    },
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
    handleCurrentChange(val) {
      this.nodename = val.node;
      this.templateRadio = val.id;
    },
    handleCurrentPoolChange(val) {
      this.pool = val.poolid;
      this.poolRadio = val.poolid;
    },
    handleStorageSingleList(val) {
      this.storageRadio = val.storage;
    },
    handleImageStorageChange(val) {
      this.imageStorageRadio = val.storage
    },
    handleStorageSlect(val) {
      this.imageStorageRadio = val.storage
    },
    handleOsTypeChange(event) {
      let ev = getEvent(event),
        value = ev.target.value || ev.srcElement.value;
      switch (value) {
        case "linux":
          this.versionList = [
            {
              label: "5.x - 2.6 Kernel",
              value: "l26",
            },
            {
              label: "2.4 Kernel",
              value: "l24",
            },
          ];
          this.version = "l26";
          break;
        case "win":
          this.versionList = [
            {
              label: "10/2016",
              value: "win10",
            },
            {
              label: "8.x/2012/2012r2",
              value: "win8",
            },
            {
              label: "7/2008r2",
              value: "win7",
            },
            {
              label: "Vista/2008",
              value: "w2k8",
            },
            {
              label: "XP/2003",
              value: "wxp",
            },
            {
              label: "2000",
              value: "w2k",
            },
          ];
          this.version = "win10";
          break;
        case "solaris":
          this.versionList = [
            {
              label: "-",
              value: "solaris",
            },
          ];
          this.version = "solaris";
          break;
        case "Other":
          this.versionList = [
            {
              label: "-",
              value: "other",
            },
          ];
          this.version = "other";
          break;
      }
    },
  },
  watch: {
    showCreateVm: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
};
</script>

<style scoped>
.table-tr{
  display: table-row;
  width: 100%;
  border-bottom: 1px solid #adb0b8;
}
.table-td{
  display: table-cell;
  width: 50%;
  height: 30px;
  line-height: 30px;
}
</style>
