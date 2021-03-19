/**
 * 数据中心对应菜单
 * */
const dataCenterMenuList = [
  {
    path:  '/datacenter/search',
    title: 'search',
    key:  'datacenter-search',
    icon: 'fa fa-search',
    children: []
  },
  {
    path: '/datacenter/overview',
    title: 'overview',
    key: 'datacenter-overview',
    icon: 'fa fa-book',
    children: []
  },
  {
    path: '/datacenter/cluster',
    title: 'cluster',
    key: 'datacenter-cluster',
    icon: 'fa fa-server',
    children: []
  },
  {
    path: '/datacenter/ceph',
    title: 'Ceph',
    icon: 'fa fa-ceph'
  },
  {
    path: '/datacenter/option',
    title: 'option',
    key: 'datacenter-option',
    icon: 'fa fa-gear',
    children: []
  },
  {
    path: '/datacenter/storage',
    title: 'storages',
    key: 'datacenter-storage',
    icon: 'fa fa-database',
    children: []
  },
  {
    path: '/datacenter/backup',
    title: 'backup',
    key: 'datacenter-backup',
    icon: 'fa fa-database',
    children: []
  },
  {
    path: '/datacenter/replication',
    title: 'replication',
    key: 'datacenter-replication',
    icon: 'fa fa-retweet',
    children: []
  },
  {
    path: '/datacenter/access',
    title: 'access',
    key: 'datacenter-access',
    icon: 'fa fa-unlock',
    children: [
      {
        path: '/datacenter/access/user',
        title: 'user',
        key: 'datacenter-access-user',
        icon: 'fa fa-user'
      },
      {
        path: '/datacenter/access/apitoken',
        title: 'apitoken',
        key: 'datacenter-access-apitoken',
        icon: 'fa fa-user-o'
      },
      {
        path: '/datacenter/access/group',
        title: 'groups',
        key: 'datacenter-access-group',
        icon: 'fa fa-users'
      },
      {
        path: '/datacenter/access/pool',
        title: 'pools',
        key: 'datacenter-access-pool',
        icon: 'fa fa-tags'
      },
      {
        path: '/datacenter/access/role',
        title: 'roles',
        key: 'datacenter-access-role',
        icon: 'fa fa-male'
      },
      {
        path: '/datacenter/access/domains',
        title: 'domains',
        key: 'datacenter-access-domains',
        icon: 'fa fa-key'
      }
    ]
  },
  {
    path: '/datacenter/ha',
    title: 'Ha',
    key: 'datacenter-ha',
    icon: 'fa fa-heartbeat',
    children: [
      {
        path: '/datacenter/ha-group',
        title: 'ha-group',
        key: 'datacenter-ha-group',
        icon: 'fa fa-object-group'
      }
    ]
  },
  {
    path: '/datacenter/acme',
    title: 'acme',
    key: 'datacenter-acme',
    icon: 'fa fa-certificate'
  },
  {
    path: '/datacenter/firewall',
    title: 'firewall',
    key: 'datacenter-firewall',
    icon: 'fa fa-shield',
    children: [
      {
        path: '/datacenter/firewall/option',
        name: 'datacenter-firewall-option',
        title: 'datacenter-firewall-option',
        icon: 'fa fa-gear'
      },
      {
        path: '/datacenter/firewall/group',
        name: 'datacenter-firewall-group',
        title: 'datacenter-firewall-group',
        icon: 'fa fa-group'
      },
      {
        path: '/datacenter/firewall/alias',
        name: 'datacenter-firewall-alias',
        title: 'datacenter-firewall-alias',
        icon: 'fa fa-external-link'
      },
      {
        path: '/datacenter/firewall/ipset',
        name: 'datacenter-firewall-ipset',
        title: 'datacenter-firewall-ipset',
        icon: 'fa fa-list-ol'
      }
    ]
  }
];
/**
 * 节点对应菜单
 * */
const nodeMenuList = [
  {
    path:  '/node/search',
    title: 'search',
    key:  'node-search',
    icon: 'fa fa-search',
    children: []
  },
  {
    path: '/node/overview',
    title: 'overview',
    key: 'node-overview',
    icon: 'fa fa-book',
    children: []
  },
  {
    path: '/node/notes',
    title: 'notes',
    key: 'node-notes',
    icon: 'fa  fa-sticky-note-o',
    children: []
  },
  {
    path: '/node/console',
    title: 'shell',
    key: 'node-shell',
    icon: 'fa  fa-terminal',
    children: []
  },
  {
    path: '/node/system',
    title: 'system',
    key: 'node-system',
    icon: 'fa  fa-cogs',
    children: [
      {
        path: '/node/network',
        title: 'network',
        key: 'node-network',
        icon: 'fa fa-exchange',
        children: []
      },
      {
        path: '/node/certificates',
        title: 'certificate',
        key: 'node-certificates',
        icon: 'fa  fa-certificate',
        children: []
      },
      {
        path: '/node/dns',
        title: 'dns',
        key: 'node-dns',
        icon: 'fa fa-globe',
        children: []
      },
      {
        path: '/node/hosts',
        title: 'hosts',
        key: 'node-hosts',
        icon: 'fa fa-globe',
        children: []
      },
      {
        path: '/node/time',
        title: 'time',
        key: 'node-time',
        icon: 'fa fa-clock-o',
        children: []
      },
      {
        path: '/node/syslog',
        title: 'syslog',
        key: 'node-syslog',
        icon: 'fa fa-list',
        children: []
      }
    ],
  },
  {
    path: '/node/apt-update',
    title: 'apt-update',
    key: 'node-apt-update',
    icon: 'fa fa-refresh',
    children: []
  },
  {
    path: '/node/firewall',
    title: 'firewall',
    key: 'node-firewall',
    icon: 'fa fa-shield',
    children: [
      {
        path: '/node/firewall/option',
        name: 'node-firewall-option',
        title: 'node-firewall-option',
        icon: 'fa fa-gear'
      },
      {
        path: '/node/firewall/log',
        name: 'node-firewall-log',
        title: 'node-firewall-log',
        icon: 'fa fa-list'
      }
    ]
  },
  {
    path: '/node/disk',
    title: 'disk',
    key: 'node-disk',
    icon: 'fa fa-hdd-o',
    children: [
      {
        path: '/node/disk/lvm',
        name: 'node-disk-lvm',
        title: 'node-disk-lvm',
        icon: 'fa fa-square'
      },
      {
        path: '/node/disk/lvmthin',
        name: 'node-disk-lvmthin',
        title: 'node-disk-lvmthin',
        icon: 'fa fa-square-o'
      },
      {
        path: '/node/disk/directory',
        name: 'node-disk-directory',
        title: 'node-disk-directory',
        icon: 'fa fa-folder'
      },
      {
        path: '/node/disk/zfs',
        name: 'node-disk-zfs',
        title: 'node-disk-zfs',
        icon: 'fa fa-th-large'
      }
    ]
  },
  {
    path: '/node/ceph',
    title: 'ceph',
    key: 'node-ceph',
    icon: 'fa fa-ceph',
    children: [
      {
        path: '/node/ceph/config',
        title: 'config',
        key: "node-ceph-config",
        icon: 'fa fa-gear'
      },
      {
        path: '/node/ceph/monitor',
        title: 'monitor',
        key: "node-ceph-monitor",
        icon: 'fa fa-tv'
      },
      {
        path: '/node/ceph/osd',
        title: 'OSD',
        key: "node-ceph-osd",
        icon: 'fa fa-hdd-o'
      },
      {
        path: '/node/ceph/fs',
        title: 'CephFs',
        key: "node-ceph-fs",
        icon: 'fa fa-folder'
      },
      {
        path: '/node/ceph/pools',
        title: 'pool',
        key: "node-ceph-pools",
        icon: 'fa fa-sitemap'
      },
      {
        path: '/node/ceph/log',
        title: 'log',
        key: "node-ceph-log",
        icon: 'fa fa-list'
      }
    ]
  },
  {
    path: '/node/replication',
    title: 'replication',
    key: 'node-replication',
    icon: 'fa fa-retweet'
  },
  {
    path: '/node/task',
    title: 'task',
    key: 'node-task',
    icon: 'fa fa-list'
  }
]

/**
 * 节点对应菜单
 * */
const qemuMenuList = [
  {
    path: '/qemu/overview',
    title: 'overview',
    key: 'qemu-overview',
    icon: 'fa fa-book',
    children: []
  },
  {
    path: '/qemu/console',
    title: 'console',
    key: 'qemu-console',
    icon: 'fa fa-terminal',
    children: []
  },
  {
    path: '/qemu/lxc-resource',
    title: 'resource',
    key: 'qemu-lxc-resource',
    icon: 'fa fa-cube',
    children: []
  },
  {
    path: '/qemu/lxc-network',
    title: 'network',
    key: 'qemu-lxc-network',
    icon: 'fa fa-exchange',
    children: []
  },
  {
    path: '/qemu/volume',
    title: 'volume',
    key: 'qemu-volume',
    icon: 'fa fa-desktop',
    children: []
  },
  {
    path: '/qemu/cloud-init',
    title: 'Cloud-Init',
    key: 'qemu-cloud-init',
    icon:'fa fa-cloud',
    children: []
  },
  {
    path: '/qemu/options',
    title:'option',
    key: 'qemu-option',
    icon: 'fa fa-gear',
    children: []
  },
  {
    path: '/qemu/historytask',
    title:'task',
    key: 'qemu-historytask',
    icon: 'fa fa-list',
    children: []
  },
  {
    path: '/qemu/monitor',
    title: 'monitor',
    key: 'qemu-monitor',
    icon: 'fa fa-eye',
    children: []
  },
  {
    path: '/qemu/backup',
    title: 'backup',
    key: 'qemu-backup',
    icon: 'fa fa-floppy-o',
    children: []
  },
  {
    path: '/qemu/replication',
    title: 'replication',
    key: 'qemu-replication',
    icon: 'fa fa-retweet',
    children: []
  },
  {
    path: '/qemu/snapshot',
    title: 'snapshot',
    key: 'qemu-snapshot',
    icon: 'fa fa-history',
    children: []
  },
  {
    path: '/qemu/firewall',
    title: 'firewall',
    key: 'qemu-firewall',
    icon: 'fa fa-shield',
    children: [{
      path: '/qemu/firewall/alias',
      title: 'datacenter-firewall-alias',
      key: 'qemu-alias',
      icon: 'fa fa-external-link'
    },
    {
      path: '/qemu/firewall/ipset',
      title: 'IPSet',
      key: 'qemu-ipset',
      icon: 'fa fa-list-ol'
    },
    {
      path: '/qemu/firewall/log',
      title: 'syslog',
      key: 'qemu-syslog',
      icon: 'fa fa-list'
    },
    {
      path: '/qemu/firewall/options',
      title: 'option',
      key: 'qemu-firewall-options',
      icon: 'fa fa-unlock'
    }
    ]
  },
  {
    path: '/qemu/access',
    title: 'access',
    key: 'qemu-access',
    icon: 'fa fa-unlock'
  },
  {
    path: '/qemu/help',
    name: 'datacenter-help',
    title: 'datacenter-help',
    icon: 'fa fa-book'
  }
]
/**
 * 存储相关菜单
*/
const storageList = [
  {
    path: '/storage/overview',
    title: 'overview',
    key: 'storage-overview',
    icon: 'fa fa-book',
    children: []
  },
  {
    path: '/storage/content',
    title: 'content',
    key: 'stroage-content',
    icon: 'fa fa-th',
    children: []
  },
  {
    path: '/storage/access',
    title: 'access',
    key: 'stroage-access',
    icon: 'fa fa-unlock',
    children: []
  }
]
/**
 * 资源池相关菜单
*/
const poolList = [
  {
    path: '/pool/overview',
    title: 'overview',
    key: 'pool-overview',
    icon: 'fa fa-book',
    children: []
  },
  {
    path: '/pool/member',
    title: 'member',
    key: 'pool-member',
    icon: 'fa fa-th',
    children: []
  },
  {
    path: '/pool/access',
    title: 'access',
    key: 'pool-access',
    icon: 'fa fa-unlock',
    children: []
  }
]
export {
  dataCenterMenuList,
  nodeMenuList,
  qemuMenuList,
  storageList,
  poolList
}
