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
    icon: 'fa fa-shield'
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
    path: '/node/shell',
    title: 'shell',
    key: 'node-shell',
    icon: 'fa  fa-sticky-note-o',
    children: []
  },
  {
    path: '/node/system',
    title: 'system',
    key: 'node-system',
    icon: 'fa  fa-sticky-note-o',
    children: [
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
      }
    ]
  }
]

/**
 * 节点对应菜单
 * */
const qemuMenuList = [
  {
    path: '/qemu/overview',
    title: 'overview',
    key: 'node-overview',
    icon: 'fa fa-book',
    children: []
  },
  {
    path: '/qemu/console',
    title: 'console',
    key: 'node-console',
    icon: 'fa fa-terminal',
    children: []
  },
  {
    path: '/qemu/volume',
    title: 'volume',
    key: 'node-volume',
    icon: 'fa fa-terminal',
    children: []
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
    icon: 'fa ',
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
    icon: 'fa ',
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
