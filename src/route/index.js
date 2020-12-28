import Vue from 'vue';
import VueRoute from 'vue-router';
import store from '@src/store/';
//vue.install安装VueRoute
Vue.use(VueRoute);
//路由配置
const router = new VueRoute({
  mode: 'history',
  routes: [
    {
      path: '*',
      name: 'error404',
      meta: {
        title: '404'
      },
      component: () => import(/*webpackChunkName： "Error404"*/"@view/error/Error404")
    },
    {
      path: '/login',
      name: 'login',
      component:() => import(/*webpackChunkName: "Login"*/"@view/login/index.vue"),
      meta: {
        title: 'login.title'
      }
    },
    {
      path: '/home',
      component:() => import(/*webpackChunkName: "home" */"@view/home/index.vue"),
      children: [
        {
          path: '/datacenter',
          name: 'datacenter',
          component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/index.vue"),
          children: [
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/overview/index.vue"),
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'search',
              name: 'search',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/search/index.vue"),
              meta: {
                title: 'search'
              }
            },
            {
              path: 'cluster',
              name: 'cluster',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/cluster/Cluster.vue"),
              meta: {
                title: 'cluster'
              }
            },
            {
              path: 'option',
              name: 'option',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/option/Option.vue"),
              meta: {
                title: 'option'
              }
            },
            {
              path: 'storage',
              name: 'storage',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/storage/Storage.vue"),
              meta: {
                title: 'storages'
              }
            },
            {
              path: 'backup',
              name: 'backup',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/backup/BackUp.vue"),
              meta: {
                title: 'backup'
              }
            },
            {
              path: 'replication',
              name: 'replication',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/replication/Replication.vue"),
              meta: {
                title: 'replication'
              }
            },
            {
              path: 'access',
              name: 'access',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/Access.vue"),
              meta: {
                title: 'access'
              }
            },
            {
              path: 'access/user',
              name: 'access-user',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/user/User.vue"),
              meta: {
                title: 'user'
              }
            },
            {
              path: 'access/apitoken',
              name: 'access-apitoken',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/apitoken/ApiToken.vue"),
              meta: {
                title: 'Api Tokens'
              }
            },
            {
              path: 'access/group',
              name: 'access-group',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/group/Group.vue"),
              meta: {
                title: 'groups'
              }
            },
            {
              path: 'access/pool',
              name: 'access-pool',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/pool/Pool.vue"),
              meta: {
                title: 'pools'
              }
            },
            {
              path: 'access/role',
              name: 'access-role',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/role/Role.vue"),
              meta: {
                title: 'roles'
              }
            },
            {
              path: 'access/domains',
              name: 'access-domains',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/domains/Domains.vue"),
              meta: {
                title: 'domains'
              }
            },
            {
              path: 'ha',
              name: 'ha',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/ha/Ha.vue"),
              meta: {
                title: 'HA'
              }
            },
            {
              path: 'ha-group',
              name: 'ha-group',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/ha/hagroup/HaGroup.vue"),
              meta: {
                title: 'groups'
              }
            },
            {
              path: 'acme',
              name: 'acme',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/acme/Acme.vue"),
              meta: {
                title: 'Acme'
              }
            },
            {
              path: 'firewall',
              name: 'firewall',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/Firewall.vue"),
              meta: {
                title: 'firewall'
              }
            },
            {
              path: 'firewall/option',
              name: 'firewall-option',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/options/FirOptions.vue"),
              meta: {
                title: 'option'
              }
            },
            {
              path: 'firewall/group',
              name: 'firewall-group',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/group/FireWallGroup.vue"),
              meta: {
                title: 'groups'
              }
            },
            {
              path: 'firewall/alias',
              name: 'firewall-alias',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/alias/FireWallAlias.vue"),
              meta: {
                title: 'firewall-alias'
              }
            },
            {
              path: 'firewall/ipset',
              name: 'firewall-ipset',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/ipset/IpSet.vue"),
              meta: {
                title: 'IPSet'
              }
            },
            {
              path: 'ceph',
              name: 'ceph',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/ceph/Ceph.vue"),
              meta: {
                title: 'Ceph'
              }
            }
          ]
        },
        {
          path: '/node',
          name: 'node',
          component: () => import(/*webpackChunkName: 'node' */"@view/home/node/index.vue"),
          meta: {
            title: 'node'
          },
          children: [
            {
              path: 'search',
              name: 'search',
              component: () => import(/*webpackChunkName: 'search' */"@view/home/node/search/Search.vue"),
              meta: {
                title: 'search'
              }
            },
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/overview/Overview.vue"),
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'console',
              name: 'shell',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/shell/Shell.vue"),
              meta: {
                title: 'shell'
              }
            },
            {
              path: 'notes',
              name: 'notes',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/notes/Notes.vue"),
              meta: {
                title: 'notes'
              }
            },
            {
              path: 'system',
              name: 'system',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/System.vue"),
              meta: {
                title: 'system'
              }
            },
            {
              path: 'network',
              name: 'network',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/network/NetWork.vue"),
              meta: {
                title: 'network'
              }
            },
            {
              path: 'certificates',
              name: 'certificates',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/certificates/Certificates.vue"),
              meta: {
                title: 'certificate'
              }
            },
            {
              path: 'dns',
              name: 'dns',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/dns/Dns.vue"),
              meta: {
                title: 'dns'
              }
            },
            {
              path: 'hosts',
              name: 'hosts',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/hosts/Host.vue"),
              meta: {
                title: 'hosts'
              }
            },
            {
              path: 'time',
              name: 'time',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/time/TimeZone.vue"),
              meta: {
                title: 'time'
              }
            },
            {
              path: 'syslog',
              name: 'syslog',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/syslog/SysLog.vue"),
              meta: {
                title: 'syslog'
              }
            },
            {
              path: 'apt-update',
              name: 'apt-update',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/apt-update/AptUpdate.vue"),
              meta: {
                title: 'apt-update'
              }
            },
            {
              path: 'firewall',
              name: 'node-firewall',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/firewall/FireWall.vue"),
              meta: {
                title: 'firewall'
              }
            },
            {
              path: 'firewall/option',
              name: 'node-firewall-option',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/firewall/option/Option.vue"),
              meta: {
                title: 'option'
              }
            },
            {
              path: 'firewall/log',
              name: 'node-firewall-log',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/firewall/log/FireWallLog.vue"),
              meta: {
                title: 'logs'
              }
            },
            {
              path: 'disk',
              name: 'node-disk',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/Disk.vue"),
              meta: {
                title: 'disk'
              }
            },
            {
              path: 'ceph',
              name: 'ceph',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/ceph/Ceph.vue"),
              meta: {
                title: 'Ceph'
              }
            },
            {
                path: 'ceph/config',
                name: 'node-ceph-config',
                component: () => import(/*webpackChunkName: 'overview'*/"@view/home/node/ceph/config/Config.vue"),
                meta: {
                  title: 'config'
                }
             },
            {
              path: 'ceph/monitor',
              name: 'node-ceph-monitor',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/node/ceph/monitor/monitor.vue"),
              meta: {
                title: 'monitor'
              }
            },
            {
              path: 'ceph/osd',
              name: 'node-ceph-osd',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/node/ceph/osd/osd.vue"),
              meta: {
                title: 'OSD'
              }
            },
            {
              path: 'ceph/pools',
              name: 'node-ceph-pools',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/node/ceph/pools/Pools.vue"),
              meta: {
                title: 'Pools'
              }
            },
            {
              path: 'ceph/log',
              name: 'node-ceph-log',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/node/ceph/log/log.vue"),
              meta: {
                title: 'log'
              }
            },
            {
              path: 'disk/lvm',
              name: 'node-disk-lvm',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/lvm/Lvm.vue"),
              meta: {
                title: 'lvm'
              }
            },
            {
              path: 'disk/lvmthin',
              name: 'node-disk-lvmthin',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/lvmthin/LvmThin.vue"),
              meta: {
                title: 'lvmthin'
              }
            },
            {
              path: 'disk/directory',
              name: 'node-disk-directory',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/directory/Directory.vue"),
              meta: {
                title: 'node-disk-directory'
              }
            },
            {
              path: 'disk/zfs',
              name: 'node-disk-zfs',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/zfs/ZFS.vue"),
              meta: {
                title: 'node-disk-zfs'
              }
            },
            {
              path: 'replication',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/replication/Replication.vue"),
              meta: {
                title: 'replication'
              }
            },
            {
              path: 'task',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/task/HistoryTask.vue"),
              meta: {
                title: 'task'
              }
            }
          ]
        },
        {
          path: '/qemu',
          name: 'qemu',
          component: () => import(/*webpackChunkName: 'node' */"@view/home/qemu/index.vue"),
          children: [
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/overview/Overview.vue"),
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'console',
              name: 'console',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/console/Console.vue"),
              meta: {
                title: 'console'
              }
            },
            {
              path: 'volume',
              name: 'volume',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/volume/Volume.vue"),
              meta: {
                title: 'volume'
              }
            },
            {
              path: 'options',
              name: 'options',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/options/Options.vue"),
              meta: {
                title: 'option'
              }
            },
            {
              path: 'historytask',
              name: 'historytask',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/task/HistoryTask.vue"),
              meta: {
                title: 'task'
              }
            },
            {
              path: 'monitor',
              name: 'monitor',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/monitor/Monitor.vue"),
              meta: {
                title: 'monitor'
              }
            },
            {
              path: 'backup',
              name: 'backup',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/backup/QemuBackup.vue"),
              meta: {
                title: 'backup'
              }
            },
            {
              path: 'replication',
              name: 'replication',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/replication/Replication.vue"),
              meta: {
                title: 'replication'
              }
            },
            {
              path: 'snapshot',
              name: 'snapshot',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/snapshot/SnapShot.vue"),
              meta: {
                title: 'snapshot'
              }
            },
            {
              path: 'lxc-resource',
              name: 'lxc-resource',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/lcx-resource/Resource.vue"),
              meta: {
                title: 'resource'
              }
            },
            {
              path: 'lxc-network',
              name: 'lxc-network',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/lxc-network/NetWork.vue"),
              meta: {
                title: 'network'
              }
            },
            {
              path: 'firewall',
              name: 'lxc-firewall',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/firewall/FireWall.vue"),
              meta: {
                title: 'firewall'
              }
            },
            {
              path: 'firewall/alias',
              name: 'qemu-alias',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/firewall/alias/FireWallAlias.vue"),
              meta: {
                title: 'datacenter-firewall-alias'
              }
            },
            {
              path: 'firewall/ipset',
              name: 'qemu-ipset',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/firewall/ipset/IpSet.vue"),
              meta: {
                title: 'datacenter-firewall-ipset'
              }
            },
            {
              path: 'firewall/log',
              name: 'qemu-log',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/firewall/log/FireWallLog.vue"),
              meta: {
                title: 'node-firewall-log'
              }
            },
            {
              path: 'firewall/options',
              name: 'qemu-firewall-options',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/firewall/options/Options.vue"),
              meta: {
                title: 'option'
              }
            },
            {
              path: 'access',
              name: 'qemu-access',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/access/Access.vue"),
              meta: {
                title: 'access'
              }
            }
          ]
        },
        {
          path: '/storage',
          name: 'storage',
          component:  () => import(/*webpackChunkName: 'storage' */"@view/home/storage/index.vue"),
          meta: {
            title: 'storage'
          },
          children: [
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/storage/overview/Overview.vue"),
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'content',
              name: 'content',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/storage/content/Content.vue"),
              meta: {
                title: 'content'
              }
            },
            {
              path: 'access',
              name: 'access',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/storage/access/Access.vue"),
              meta: {
                title: 'access'
              }
            }
          ]
        },
        {
          path: '/pool',
          name: 'pool',
          component:  () => import(/*webpackChunkName: 'pool' */"@view/home/pool/index.vue"),
          children: [
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/pool/overview/Overview.vue"),
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'member',
              name: 'member',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/pool/member/member.vue"),
              meta: {
                title: 'member'
              }
            },
            {
              path: 'access',
              name: 'access',
              component: () => import(/*webpackChunkName: 'overview'*/"@view/home/qemu/access/Access.vue"),
              meta: {
                title: 'access'
              }
            }
          ]
        }
      ]
    }
  ]
})


router.beforeEach((to, from, next) => {
  store.commit('CLEAR_CANCEL_REQUEST') // 取消请求
  next();
})

router.afterEach((to, from) => {
  setDocumentTitle(to);
})
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
});

function setDocumentTitle(to) {
  if(window.vm)
  document.title = 'MHFLEX_' + window.vm.$t(`${to.meta.title}`);
}
export default router;
