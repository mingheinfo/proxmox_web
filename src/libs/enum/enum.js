const VGALIST = [
	{
		label: 'Default',
		value: ''
	},
	{
		label: 'Standard VGA',
		value: 'sta'
	},
	{
		label: 'VMware compatible',
		value: 'vmware'
	},
	{
		label: 'SPICE',
		value: 'qxl'
	},
	{
		label: 'SPICE dual monitor',
		value: 'qxl2'
	},
	{
		label: 'SPICE three monitors',
		value: 'qxl3'
	},
	{
		label: 'SPICE four monitors',
		value: 'qxl4'
	},
	{
		label: 'Serial terminal 0',
		value: 'serial0'
	},
	{
		label: 'Serial terminal 1',
		value: 'serial1'
	},
	{
		label: 'Serial terminal 2',
		value: 'serial2'
	},
	{
		label: 'Serial terminal 3',
		value: 'serial3'
	},
	{
		label: 'VirtIO-GPU',
		value: 'virtio'
	},
	{
		label: 'none (none)',
		value: 'none'
	}
]
const BIOSLIST = [
	{
		label: 'Default (SeaBIOS)',
		value: 'seabios'
	},
	{
		label: 'SeaBIOS',
		value: 'seabios'
	},
	{
		label: 'SeaBIOS',
		value: 'seabios'
	},
	{
		label: 'OVMF (UEFI)',
		value: 'ovmf'
	}
]

const SCSIHWLIST = [
	{
		label: 'Default (LSI 53C895A)',
		value: 'lsi'
	},
	{
		label: 'LSI 53C895A',
		value: 'lsi'
	},
	{
		label: 'LSI 53C810',
		value: 'lsi53c810'
	},
	{
		label: 'MegaRAID SAS 8708EM2',
		value: 'megasas'
	},
	{
		label: 'VirtIO SCSI',
		value: 'virtio-scsi-pci'
	},
	{
		label: 'VirtIO SCSI single',
		value: 'virtio-scsi-single'
	},
	{
		label: 'VMware PVSCSI',
		value: 'pvscsi'
	}
]

const MACHINELIST = [
	{
		label: 'Default (i440fx)',
		value: ''
	},
	{
		label: 'q35',
		value: 'q35'
	}
]

const DEVICELIST = [
	{
		label: 'IDE',
		value: 'ide'
	},
	{
		label: 'SATA',
		value: 'sata'
	},
	{
		label: 'virtio',
		value: 'virtio'
	},
	{
		label: 'SCSI',
		value: 'scsi'
	}
]

const CACHELIST = [
	{
		label: 'Default (No cache)',
		value: ''
	},
	{
		label: 'Direct sync',
		value: 'directsync'
	},
	{
		label: 'Write through',
		value: 'writethrough'
	},
	{
		label: 'Write back',
		value: 'writeback'
	},
	{
		label: 'Write back (unsafe)',
		value: 'unsafe'
	},
	{
		label: 'No cache',
		value: 'none'
	}
]

const CPULIST = [
	{
		label: 'Default (kvm64)',
		value: 'kvm64'
	},
	{
		label: '486',
		value: '486'
	},
	{
		label: 'athlon',
		value: 'athlon'
	},
	{
		label: 'core2duo',
		value: 'core2duo'
	},
	{
		label: 'coreduo',
		value: 'coreduo'
	},
	{
		label: 'kvm32',
		value: 'kvm32'
	},
	{
		label: 'kvm64',
		value: 'kvm64'
	},
	{
		label: 'pentium',
		value: 'pentium'
	},
	{
		label: 'pentium2',
		value: 'pentium2'
	},
	{
		label: 'pentium3',
		value: 'pentium3'
	},
	{
		label: 'phenom',
		value: 'phenom'
	},
	{
		label: 'qemu32',
		value: 'qemu32'
	},
	{
		label: 'qemu64',
		value: 'qemu64'
	},
	{
		label: 'Conroe',
		value: 'Conroe'
	},
	{
		label: 'Penryn',
		value: 'Penryn'
	},
	{
		label: 'Nehalem',
		value: 'Nehalem'
	},
	{
		label: 'Westmere',
		value: 'Westmere'
	},
	{
		label: 'SandyBridge',
		value: 'SandyBridge'
	},
	{
		label: 'IvyBridge',
		value: 'IvyBridge'
	},
	{
		label: 'Haswell',
		value: 'Haswell'
	},
	{
		label: 'Haswell-noTSX',
		value: 'Haswell-noTSX'
	},
	{
		label: 'Broadwell',
		value: 'Broadwell'
	},
	{
		label: 'Broadwell-noTSX',
		value: 'Broadwell-noTSX'
	},
	{
		label: 'Skylake-Client',
		value: 'Skylake-Client'
	},
	{
		label: 'Opteron_G1',
		value: 'Opteron_G1'
	},
	{
		label: 'Opteron_G2',
		value: 'Opteron_G2'
	},
	{
		label: 'Opteron_G3',
		value: 'Opteron_G3'
	},
	{
		label: 'Opteron_G4',
		value: 'Opteron_G4'
	},
	{
		label: 'Opteron_G5',
		value: 'Opteron_G5'
	},
	{
		label: 'EPYC',
		value: 'EPYC'
	},
	{
		label: 'host',
		value: 'host'
	}
]

const MODELLIST = [
	{
		label: 'Intel E1000',
		value: 'e1000'
	},
	{
		label: 'VirtIO (paravirtualized)',
		value: 'virtio'
	},
	{
		label: 'Realtek RTL8139',
		value: 'rtl8139'
	},
	{
		label: 'VMware vmxnet3',
		value: 'vmxnet3'
	}
]

const KVM_KEYMAPS = {
	'__default__': '默认',
	//ar: 'Arabic',
	da: 'Danish',
	de: 'German',
	'de-ch': 'German (Swiss)',
	'en-gb': 'English (UK)',
	'en-us': 'English (USA)',
	es: 'Spanish',
	//et: 'Estonia',
	fi: 'Finnish',
	//fo: 'Faroe Islands',
	fr: 'French',
	'fr-be': 'French (Belgium)',
	'fr-ca': 'French (Canada)',
	'fr-ch': 'French (Swiss)',
	//hr: 'Croatia',
	hu: 'Hungarian',
	is: 'Icelandic',
	it: 'Italian',
	ja: 'Japanese',
	lt: 'Lithuanian',
	//lv: 'Latvian',
	mk: 'Macedonian',
	nl: 'Dutch',
	//'nl-be': 'Dutch (Belgium)',
	no: 'Norwegian',
	pl: 'Polish',
	pt: 'Portuguese',
	'pt-br': 'Portuguese (Brazil)',
	//ru: 'Russian',
	sl: 'Slovenian',
	sv: 'Swedish',
	//th: 'Thai',
	tr: 'Turkish'
}

const CONSOLE_Map = {
	'__default__': '默认' + ' (xterm.js)',
	'vv': 'SPICE (remote-viewer)',
	'html5': 'HTML5 (noVNC)',
	'xtermjs': 'xterm.js'
}

const KVM_HA_Map = {
	'__default__': '默认' + ' (conditional)',
	'freeze': 'freeze',
	'failover': 'failover',
	'conditional': 'conditional'
} 

const STORAGESCHEMA = {
	dir: {
	    name: '目录',
	    ipanel: 'DirInputPanel',
	    faIcon: 'folder'
	},
	lvm: {
	    name: 'LVM',
	    ipanel: 'LVMInputPanel',
	    faIcon: 'folder'
	},
	lvmthin: {
	    name: 'LVM-Thin',
	    ipanel: 'LvmThinInputPanel',
	    faIcon: 'folder'
	},
	nfs: {
	    name: 'NFS',
	    ipanel: 'NFSInputPanel',
	    faIcon: 'building'
	},
	cifs: {
	    name: 'CIFS',
	    ipanel: 'CIFSInputPanel',
	    faIcon: 'building'
	},
	glusterfs: {
	    name: 'GlusterFS',
	    ipanel: 'GlusterFsInputPanel',
	    faIcon: 'building'
	},
	iscsi: {
	    name: 'iSCSI',
	    ipanel: 'IScsiInputPanel',
	    faIcon: 'building'
	},
	cephfs: {
	    name: 'CephFS',
	    ipanel: 'CephFSInputPanel',
	    faIcon: 'building'
	},
	pvecephfs: {
	    name: 'CephFS (PVE)',
	    ipanel: 'CephFSInputPanel',
	    hideAdd: true,
	    faIcon: 'building'
	},
	rbd: {
	    name: 'RBD',
	    ipanel: 'RBDInputPanel',
	    faIcon: 'building'
	},
	pveceph: {
	    name: 'RBD (PVE)',
	    ipanel: 'RBDInputPanel',
	    hideAdd: true,
	    faIcon: 'building'
	},
	zfs: {
	    name: 'ZFS over iSCSI',
	    ipanel: 'ZFSInputPanel',
	    faIcon: 'building'
	},
	zfspool: {
	    name: 'ZFS',
	    ipanel: 'ZFSPoolInputPanel',
	    faIcon: 'folder'
	},
	drbd: {
	    name: 'DRBD',
	    hideAdd: true
	}
    }
export {
	VGALIST,
	BIOSLIST,
	SCSIHWLIST,
	MACHINELIST,
	DEVICELIST,
	CACHELIST,
	CPULIST,
	MODELLIST,
	KVM_KEYMAPS,
	CONSOLE_Map,
	KVM_HA_Map,
	STORAGESCHEMA
} 