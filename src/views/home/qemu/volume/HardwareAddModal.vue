<template>
	<component :is="type" :modal-type="modalType" v-if="visible" :visible="visible" :param="param" @close="$emit('close')"></component>
</template>
<script>
import AddOrEditDiskModal from './AddOrEditDiskModal';
import AddOrEditCdRomModal from './AddOrEditCdRomModal';
import AddOrEditNetworkModal from  './AddOrEditNetworkModal';
import AddOrEditEfiModal from './AddOrEditEfiModal';
import AddOrEditUsbModal from './AddOrEditUsbModal';
import AddOrEditPciModal from './AddOrEditPciModal';
import AddOrEditServialModal from './AddOrEditServialModal';
import AddOrEditCloudInitModal from './AddOrEditCloudInitModal';
import AddOrEditAudioModal from './AddOrEditAudioModal';
import AddOrEditVirIORngModal from './AddOrEditVirIORngModal';
import EditMemoryModal from './EditMemoryModal';
import EditCpuModal from './EditCpuModal';
import EditBiosModal from './EditBiosModal';
import EditVgaModal from './EditVgaModal';
import EditMachineModal from './EditMachineModal';
import EditScsiModal from './EditScsiModal';
import UpdateDiskSizeModal from './UpdateDiskSizeModal'
import MigrateDiskModal from './MigrateDiskModal';
export default {
	name: 'HardwareAddModal',
	components: {
		'adddisk': AddOrEditDiskModal,
		'addcdrom': AddOrEditCdRomModal,
		'addnet': AddOrEditNetworkModal,
		'addefidisk': AddOrEditEfiModal,
		'addusb': AddOrEditUsbModal,
		'addpci': AddOrEditPciModal,
		'addserial': AddOrEditServialModal,
		'addci': AddOrEditCloudInitModal,
		'addaudio': AddOrEditAudioModal,
		'addrng': AddOrEditVirIORngModal,
		'addmemory': EditMemoryModal,
		'addsockets': EditCpuModal,
		'addbios': EditBiosModal,
		'addvga': EditVgaModal,
		'addmachine': EditMachineModal,
		'addscsihw': EditScsiModal,
		'resize': UpdateDiskSizeModal,
		'migratedisk': MigrateDiskModal
	},
	props: {
		type: {
			type: String,
			default: ''
		},
		modalType: {
			type: String,
			default: ''
		},
		param: {
			type: Object
		},
		visible: {
			type: Boolean,
			default: false
		}
	},
 watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
  },
}
</script>