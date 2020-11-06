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

const PORTOCOLIST =[
	{ p: 'tcp', n: 6, d: 'Transmission Control Protocol' },
		{ p: 'udp', n: 17, d: 'User Datagram Protocol' },
		{ p: 'icmp', n: 1, d: 'Internet Control Message Protocol' },
		{ p: 'igmp', n: 2,  d: 'Internet Group Management' },
		{ p: 'ggp', n: 3, d: 'gateway-gateway protocol' },
		{ p: 'ipencap', n: 4, d: 'IP encapsulated in IP' },
		{ p: 'st', n: 5, d: 'ST datagram mode' },
		{ p: 'egp', n: 8, d: 'exterior gateway protocol' },
		{ p: 'igp', n: 9, d: 'any private interior gateway (Cisco)' },
		{ p: 'pup', n: 12, d: 'PARC universal packet protocol' },
		{ p: 'hmp', n: 20, d: 'host monitoring protocol' },
		{ p: 'xns-idp', n: 22, d: 'Xerox NS IDP' },
		{ p: 'rdp', n: 27, d: '"reliable datagram" protocol' },
		{ p: 'iso-tp4', n: 29, d: 'ISO Transport Protocol class 4 [RFC905]' },
		{ p: 'dccp', n: 33, d: 'Datagram Congestion Control Prot. [RFC4340]' },
		{ p: 'xtp', n: 36, d: 'Xpress Transfer Protocol' },
		{ p: 'ddp', n: 37, d: 'Datagram Delivery Protocol' },
		{ p: 'idpr-cmtp', n: 38, d: 'IDPR Control Message Transport' },
		{ p: 'ipv6', n: 41, d: 'Internet Protocol, version 6' },
		{ p: 'ipv6-route', n: 43, d: 'Routing Header for IPv6' },
		{ p: 'ipv6-frag', n: 44, d: 'Fragment Header for IPv6' },
		{ p: 'idrp', n: 45, d: 'Inter-Domain Routing Protocol' },
		{ p: 'rsvp', n: 46, d: 'Reservation Protocol' },
		{ p: 'gre', n: 47, d: 'General Routing Encapsulation' },
		{ p: 'esp', n: 50, d: 'Encap Security Payload [RFC2406]' },
		{ p: 'ah', n: 51, d: 'Authentication Header [RFC2402]' },
		{ p: 'skip', n: 57, d: 'SKIP' },
		{ p: 'ipv6-icmp', n: 58, d: 'ICMP for IPv6' },
		{ p: 'ipv6-nonxt', n: 59, d: 'No Next Header for IPv6' },
		{ p: 'ipv6-opts', n: 60, d: 'Destination Options for IPv6' },
		{ p: 'vmtp', n: 81, d: 'Versatile Message Transport' },
		{ p: 'eigrp', n: 88, d: 'Enhanced Interior Routing Protocol (Cisco)' },
		{ p: 'ospf', n: 89, d: 'Open Shortest Path First IGP' },
		{ p: 'ax.25', n: 93, d: 'AX.25 frames' },
		{ p: 'ipip', n: 94, d: 'IP-within-IP Encapsulation Protocol' },
		{ p: 'etherip', n: 97, d: 'Ethernet-within-IP Encapsulation [RFC3378]' },
		{ p: 'encap', n: 98, d: 'Yet Another IP encapsulation [RFC1241]' },
		{ p: 'pim', n: 103, d: 'Protocol Independent Multicast' },
		{ p: 'ipcomp', n: 108, d: 'IP Payload Compression Protocol' },
		{ p: 'vrrp', n: 112, d: 'Virtual Router Redundancy Protocol [RFC5798]' },
		{ p: 'l2tp', n: 115, d: 'Layer Two Tunneling Protocol [RFC2661]' },
		{ p: 'isis', n: 124, d: 'IS-IS over IPv4' },
		{ p: 'sctp', n: 132, d: 'Stream Control Transmission Protocol' },
		{ p: 'fc', n: 133, d: 'Fibre Channel' },
		{ p: 'mobility-header', n: 135, d: 'Mobility Support for IPv6 [RFC3775]' },
		{ p: 'udplite', n: 136, d: 'UDP-Lite [RFC3828]' },
		{ p: 'mpls-in-ip', n: 137, d: 'MPLS-in-IP [RFC4023]' },
		{ p: 'hip', n: 139, d: 'Host Identity Protocol' },
		{ p: 'shim6', n: 140, d: 'Shim6 Protocol [RFC5533]' },
		{ p: 'wesp', n: 141, d: 'Wrapped Encapsulating Security Payload' },
		{ p: 'rohc', n: 142, d: 'Robust Header Compression' }
]

const network_iface_types = {
	eth: "Network Device",
	bridge: 'Linux Bridge',
	bond: 'Linux Bond',
	vlan: 'Linux VLAN',
	OVSBridge: 'OVS Bridge',
	OVSBond: 'OVS Bond',
	OVSPort: 'OVS Port',
	OVSIntPort: 'OVS IntPort'
}

const bond_mode_gettext_map = {
	'802.3ad': 'LACP (802.3ad)',
	'lacp-balance-slb': 'LACP (balance-slb)',
	'lacp-balance-tcp': 'LACP (balance-tcp)',
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
	STORAGESCHEMA,
	PORTOCOLIST,
	network_iface_types,
	bond_mode_gettext_map
} 