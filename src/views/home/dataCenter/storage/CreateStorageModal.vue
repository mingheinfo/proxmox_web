<template>
  <Dialog
    :visible="visible"
    v-if="visible"
    :_style="{ width: '956px' }"
    @confirm="confirm()"
    @cancel="cancel()"
    :title="title"
    @close="$emit('close')"
  >
    <div slot="content" style="max-height: 500px;">
      <component :is="type" :ref="type" :isCreate="isCreate" :param="param" :isAdvice="isAdvice"></component>
    </div>
   <template slot="footer" v-if="type === 'nfs' || type === 'cifs'">
     <div class="label_box">
          <label>
            <input type="checkbox" v-model="isAdvice" />
            <div>高级</div>
          </label>
        </div>
      <m-button class="create-btn" type="primary" @on-click="confirm"
          >创建</m-button
        >
	</template>
  </Dialog>
</template>

<script>
import DataCenterStorageHttp from "@src/views/home/dataCenter/storage/http";
import Dialog from "@src/components/dialog/Dialog";
import CreateDirStorage from "./CreateDirStorage";
import CreateLvmStorage from "./CreateLvmStorage";
import CreateNfsStorage from "./CreateNfsStorage";
import CreateCifsStorage from "./CreateCifsStorage";
import CreateGlusterStorage from "./CreateGlusterStorage";
import CreateCephFsStorage from "./CreateCephFsStorage";
import CreateIscsiStorage from "./CreateIscsiStorage";
import CreasteZfsStorage from "./CreateZfsStorage";
import CreateRbdStorage from "./CreateRbdStorage";
import CreateZfsPoolStorage from './CreateZfsPoolStorage'
import CreateLvmThin from "./CreateLvmThin";
export default {
  name: "CreateStorageModal",
  mixins: [DataCenterStorageHttp],
  components: {
    Dialog,
    dir: CreateDirStorage,
    lvm: CreateLvmStorage,
    lvmthin: CreateLvmThin,
    nfs: CreateNfsStorage,
    cifs: CreateCifsStorage,
    glusterfs: CreateGlusterStorage,
    iscsi: CreateIscsiStorage,
    cephfs: CreateCephFsStorage,
    rbd: CreateRbdStorage,
		zfs: CreasteZfsStorage,
		zfspool: CreateZfsPoolStorage
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
		},
		isCreate: {
			type: Boolean,
      default: true,
		},
		param: {
			type: Object
		}
  },
  data() {
    return {
      isAdvice: false,
    }
  },
  methods: {
    cancel() {
      this.$emit("close");
    },
    confirm() {
      let param;
      if (this.type === "dir") {
        if (this.$refs.dir.validateAll()) return;
        param = {
          storage: this.$refs.dir.$data.storage,
          path: this.$refs.dir.$data.path,
          content: this.$refs.dir.$data.content.join(","),
          nodes: this.$refs.dir.$data.nodes.join(","),
          shared: this.$refs.dir.$data.shared ? 1 : 0,
          type: "dir",
          disable: this.$refs.dir.$data.disable ? 0 : 1,
        };
      }
      if (this.type === "lvm") {
        if (this.$refs.lvm.validateAll()) return;
        param = {
          storage: this.$refs.lvm.$data.storage,
          vgname: this.$refs.lvm.$data.vgname,
          content: this.$refs.lvm.$data.content.join(","),
          nodes: this.$refs.lvm.$data.nodes.join(","),
          shared: this.$refs.lvm.$data.shared ? 1 : 0,
          type: "lvm",
          disable: this.$refs.lvm.$data.disable ? 0 : 1,
        };
      }
      if (this.type === "lvmthin") {
        if (this.$refs.lvmthin.validateAll()) return;
        param = {
          storage: this.$refs.lvmthin.$data.storage,
          vgname: this.$refs.lvmthin.$data.vgname,
          content: this.$refs.lvmthin.$data.content.join(","),
          nodes: this.$refs.lvmthin.$data.nodes.join(","),
          thinpool: this.$refs.lvmthin.$data.thinpool.join(","),
          type: "lvmthin",
          disable: this.$refs.lvmthin.$data.disable ? 0 : 1,
        };
      }
      if (this.type === "nfs") {
        if (this.$refs.nfs.validateAll()) return;
        param = {
          storage: this.$refs.nfs.$data.storage,
          server: this.$refs.nfs.$data.server,
          content: this.$refs.nfs.$data.content.join(","),
          nodes: this.$refs.nfs.$data.nodes.join(","),
          export: this.$refs.nfs.$data.export1,
          type: "nfs",
          disable: this.$refs.nfs.$data.disable ? 0 : 1,
        };
        if(this.isAdvice && this.$refs.nfs.$data.options !== '__default__') {
          param['options'] = `vers=${this.$refs.nfs.$data.options}`;
        }
      }
      if (this.type === "cifs") {
        if (this.$refs.cifs.validateAll()) return;
        param = {
          storage: this.$refs.cifs.$data.storage,
          server: this.$refs.cifs.$data.server,
          username: this.$refs.cifs.$data.username,
          password: this.$refs.cifs.$data.password,
          share: this.$refs.cifs.$data.share,
          nodes: this.$refs.cifs.$data.nodes.join(","),
          maxfiles: this.$refs.cifs.$data.maxfiles,
          content: this.$refs.cifs.$data.content.join(","),
          domain: this.$refs.cifs.$data.domain,
          type: "cifs",
          disable: this.$refs.cifs.$data.disable ? 0 : 1,
				};
        if(this.isAdvice && this.$refs.cifs.$data.option !== '__default__') {
          param['smbversion'] = this.$refs.cifs.$data.option;
        }
        if(!param.password) delete param.password;
				if(!this.isCreate) delete param.share;
      }
      if (this.type === "glusterfs") {
        if (this.$refs.glusterfs.validateAll()) return;
        param = {
          storage: this.$refs.glusterfs.$data.storage,
          server: this.$refs.glusterfs.$data.server,
          server2: this.$refs.glusterfs.$data.server2,
          volume: this.$refs.glusterfs.$data.volumename,
          nodes: this.$refs.glusterfs.$data.nodes.join(","),
          maxfiles: this.$refs.glusterfs.$data.maxfiles,
          content: this.$refs.glusterfs.$data.content.join(","),
          type: "glusterfs",
          disable: this.$refs.glusterfs.$data.disable ? 0 : 1,
				};
				if(!this.isCreate) {
					delete param.server2;
					delete param.volume;
				}
      }
      if (this.type === "iscsi") {
        if (this.$refs.iscsi.validateAll()) return;
        param = {
          storage: this.$refs.iscsi.$data.storage,
          portal: this.$refs.iscsi.$data.portal,
          target: this.$refs.iscsi.$data.target,
          nodes: this.$refs.iscsi.$data.nodes.join(","),
          content: "image",
          type: "iscsi",
          disable: this.$refs.iscsi.$data.disable ? 0 : 1,
        };
				if (!this.$refs.iscsi.$data.lun) delete param.content;
				if(!this.isCreate) {
					delete param.portal;
					delete param.target;
				}
      }
      if (this.type === "cephfs") {
        if (this.$refs.cephfs.validateAll()) return;
        param = {
          storage: this.$refs.cephfs.$data.storage,
          monhost: this.$refs.cephfs.$data.monhost,
          username: this.$refs.cephfs.$data.username,
          nodes: this.$refs.cephfs.$data.nodes.join(","),
          content: this.$refs.cephfs.$data.content.join(","),
          maxfiles: this.$refs.cephfs.$data.maxfiles,
          type: "cephfs",
          disable: this.$refs.cephfs.$data.disable ? 0 : 1,
        };
      }
      if (this.type === "rbd") {
        if (this.$refs.rbd.validateAll()) return;
        param = {
          storage: this.$refs.rbd.$data.storage,
          pool: this.$refs.rbd.$data.pool,
          monhost: this.$refs.rbd.$data.monhost,
          username: this.$refs.rbd.$data.username,
          nodes: this.$refs.rbd.$data.nodes.join(","),
          content: this.$refs.rbd.$data.content.join(","),
          krbd: this.$refs.rbd.$data.krbd ? 1 : 0,
          type: "rbd",
          disable: this.$refs.rbd.$data.disable ? 0 : 1,
        };
      }
      if (this.type === "zfs") {
        if (this.$refs.zfs.validateAll()) return;
        param = {
          storage: this.$refs.zfs.$data.storage,
          portal: this.$refs.zfs.$data.portal,
          pool: this.$refs.zfs.$data.pool,
          blocksize: this.$refs.zfs.$data.blocksize,
          target: this.$refs.zfs.$data.target,
          nodes: this.$refs.zfs.$data.nodes.join(","),
          iscsiprovider: this.$refs.zfs.$data.iscsiprovider,
          sparse: this.$refs.zfs.$data.sparse ? 0 : 1,
          lio_tpg: this.$refs.zfs.$data.lio_tpg,
          nowritecache: this.$refs.zfs.$data.writecache ? 0 : 1,
          type: "zfs",
          disable: this.$refs.zfs.$data.disable ? 0 : 1,
				};
				if(!this.isCreate) {
					delete param.portal;
					delete param.target;
					delete param.iscsiprovider;
					delete param.blocksize;
					delete param.pool
				}
			}
			if (this.type === "zfspool") {
        if (this.$refs.zfspool.validateAll()) return;
        param = {
          storage: this.$refs.zfspool.$data.storage,
          pool: this.$refs.zfspool.$data.pool,
          blocksize: this.$refs.zfspool.$data.blocksize,
          nodes: this.$refs.zfspool.$data.nodes.join(","),
          sparse: this.$refs.zfspool.$data.sparse ? 1 : 0,
          type: "zfspool",
          disable: this.$refs.zfspool.$data.disable ? 0 : 1,
				};
				if(!this.isCreate) {
					delete param.pool;
				}
			}
			if(this.isCreate)
				this.createStorage(param).then(() => {
					this.cancel();
				});
			else
			 this.updateStorage(param).then(() => {
					this.cancel();
				});
    },
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
};
</script>
