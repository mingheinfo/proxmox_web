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
      component: r => {
        require.ensure([], () => r(require('@view/error/Error404')), 'Error404')
      }
    },
    {
      path: '/login',
      name: 'login',
      component: r => {
        require.ensure([], () => r(require('@view/login/index.vue')), 'Login')
      },
      meta: {
        title: 'login.title'
      }
    },
    {
      path: '/home',
      component: r => {
        require.ensure([], () => r(require('@view/home/index.vue')), 'Home')
      },
      children: [
        {
          path: '/datacenter',
          name: 'datacenter',
          component: r => {
            require.ensure([], () => r(require('@view/home/dataCenter/index.vue')), 'DataCenter')
          },
          children: [
            {
              path: 'overview',
              name: 'overview',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/overview/index.vue')), 'DataCenter')
              },
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'search',
              name: 'search',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/search/index.vue')), 'DataCenter')
              },
              meta: {
                title: 'search'
              }
            },
            {
              path: 'cluster',
              name: 'cluster',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/cluster/Cluster.vue')), 'DataCenter')
              },
              meta: {
                title: 'cluster'
              }
            },
            {
              path: 'option',
              name: 'option',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/option/Option.vue')), 'DataCenter')
              },
              meta: {
                title: 'option'
              }
            },
            {
              path: 'storage',
              name: 'datacenter-storage',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/storage/Storage.vue')), 'DataCenter')
              },
              meta: {
                title: 'storages'
              }
            },
            {
              path: 'backup',
              name: 'backup',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/backup/BackUp.vue')), 'DataCenter')
              },
              meta: {
                title: 'backup'
              }
            },
            {
              path: 'replication',
              name: 'replication',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/replication/Replication.vue')), 'DataCenter')
              },
              meta: {
                title: 'replication'
              }
            },
            {
              path: 'access',
              name: 'access',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/access/Access.vue')), 'DataCenter')
              },
              meta: {
                title: 'access'
              }
            },
            {
              path: 'access/user',
              name: 'access-user',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/access/user/User.vue')), 'DataCenter')
              },
              meta: {
                title: 'user'
              }
            },
            {
              path: 'access/apitoken',
              name: 'access-apitoken',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/access/apitoken/ApiToken.vue')), 'DataCenter')
              },
              meta:
                {
                  title: 'Api Tokens'
                }
            },
            {
              path: 'access/group',
              name: 'access-group',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/access/group/Group.vue')), 'DataCenter')
              },
              meta:
                {
                  title: 'groups'
                }
            }
            ,
            {
              path: 'access/pool',
              name: 'access-pool',
              component: r => {
                  require.ensure([], () => r(require('@view/home/dataCenter/access/pool/Pool.vue')), 'DataCenter')
              },
              meta:
                {
                  title: 'pools'
                }
            }
            ,
            {
              path: 'access/role',
              name: 'access-role',
              component: r => {
                require.ensure([], () => r(require('@view/home/dataCenter/access/role/Role.vue')), 'DataCenter')
              },
              meta:
                {
                  title: 'roles'
                }
            }
            ,
            {
              path: 'access/domains',
              name: 'access-domains',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/access/domains/Domains.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'domains'
                }
            }
            ,
            {
              path: 'ha',
              name: 'ha',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/ha/Ha.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'HA'
                }
            }
            ,
            {
              path: 'ha-group',
              name: 'ha-group',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/ha/hagroup/HaGroup.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'groups'
                }
            }
            ,
            {
              path: 'acme',
              name: 'acme',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/acme/Acme.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'Acme'
                }
            }
            ,
            {
              path: 'firewall',
              name: 'firewall',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/firewall/Firewall.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'firewall'
                }
            }
            ,
            {
              path: 'firewall/option',
              name: 'firewall-option',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/firewall/options/FirOptions.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'option'
                }
            },
            {
              path: 'firewall/group',
              name: 'firewall-group',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/firewall/group/FireWallGroup.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'groups'
                }
            }
            ,
            {
              path: 'firewall/alias',
              name: 'firewall-alias',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/firewall/alias/FireWallAlias.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'firewall-alias'
                }
            }
            ,
            {
              path: 'firewall/ipset',
              name: 'firewall-ipset',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/firewall/ipset/IpSet.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'IPSet'
                }
            }
            ,
            {
              path: 'ceph',
              name: 'datacenter-ceph',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/ceph/Ceph.vue")), 'DataCenter')
              },
              meta:
                {
                  title: 'Ceph'
                }
            }
          ]
        },
        {
          path: '/node',
          name: 'node',
          component: r => {
            require.ensure([], () => r(require("@view/home/node/index.vue")), 'Node')
          },
          meta:
            {
              title: 'node'
            }
          ,
          children: [
            {
              path: 'search',
              name: 'node-search',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/search/Search.vue")), 'Node')
              },
              meta: {
                title: 'search'
              }
            },
            {
              path: 'overview',
              name: 'node-overview',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/overview/Overview.vue")), 'Node')
              },
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'console',
              name: 'node-shell',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/shell/Shell.vue")), 'Node')
              },
              meta: {
                title: 'shell'
              }
            },
            {
              path: 'notes',
              name: 'node-notes',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/notes/Notes.vue")), 'Node')
              },
              meta: {
                title: 'notes'
              }
            },
            {
              path: 'system',
              name: 'node-system',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/System.vue")), 'Node')
              },
              meta: {
                title: 'system'
              }
            },
            {
              path: 'network',
              name: 'node-network',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/network/NetWork.vue")), 'Node')
              },
              meta: {
                title: 'network'
              }
            },
            {
              path: 'certificates',
              name: 'node-certificates',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/certificates/Certificates.vue")), 'Node')
              },
              meta: {
                title: 'certificate'
              }
            },
            {
              path: 'dns',
              name: 'node-dns',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/dns/Dns.vue")), 'Node')
              },
              meta: {
                title: 'dns'
              }
            },
            {
              path: 'hosts',
              name: 'node-hosts',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/hosts/Host.vue")), 'Node')
              },
              meta: {
                title: 'hosts'
              }
            },
            {
              path: 'time',
              name: 'node-time',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/time/TimeZone.vue")), 'Node')
              },
              meta: {
                title: 'time'
              }
            },
            {
              path: 'syslog',
              name: 'node-syslog',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/system/syslog/SysLog.vue")), 'Node')
              },
              meta: {
                title: 'syslog'
              }
            },
            {
              path: 'apt-update',
              name: 'node-apt-update',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/apt-update/AptUpdate.vue")), 'Node')
              },
              meta: {
                title: 'apt-update'
              }
            },
            {
              path: 'firewall',
              name: 'node-firewall',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/firewall/FireWall.vue")), 'Node')
              },
              meta: {
                title: 'firewall'
              }
            },
            {
              path: 'firewall/option',
              name: 'node-firewall-option',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/firewall/option/Option.vue")), 'Node')
              },
              meta: {
                title: 'option'
              }
            },
            {
              path: 'firewall/log',
              name: 'node-firewall-log',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/firewall/log/FireWallLog.vue")), 'Node')
              },
              meta: {
                title: 'logs'
              }
            },
            {
              path: 'disk',
              name: 'node-disk',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/disk/Disk.vue")), 'Node')
              },
              meta: {
                title: 'disk'
              }
            },
            {
              path: 'ceph',
              name: 'ceph',
              component: r => {
                require.ensure([], () => r(require("@view/home/dataCenter/ceph/Ceph.vue")), 'Node')
              },
              meta: {
                title: 'Ceph'
              }
            },
            {
              path: 'ceph/config',
              name: 'node-ceph-config',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/ceph/config/Config.vue")), 'Node')
              },
              meta: {
                title: 'config'
              }
            },
            {
              path: 'ceph/monitor',
              name: 'node-ceph-monitor',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/ceph/monitor/monitor.vue")), 'Node')
              },
              meta: {
                title: 'monitor'
              }
            },
            {
              path: 'ceph/osd',
              name: 'node-ceph-osd',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/ceph/osd/osd.vue")), 'Node')
              },
              meta: {
                title: 'OSD'
              }
            },
            {
              path: 'ceph/fs',
              name: 'node-ceph-fs',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/ceph/cephfs/cephFs.vue")), 'Node')
              },
              meta: {
                title: 'CephFs'
              }
            },
            {
              path: 'ceph/pools',
              name: 'node-ceph-pools',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/ceph/pools/Pools.vue")), 'Node')
              },
              meta: {
                title: 'Pools'
              }
            },
            {
              path: 'ceph/log',
              name: 'node-ceph-log',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/ceph/log/log.vue")), 'Node')
              },
              meta: {
                title: 'log'
              }
            },
            {
              path: 'disk/lvm',
              name: 'node-disk-lvm',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/disk/lvm/Lvm.vue")), 'Node')
              },
              meta: {
                title: 'lvm'
              }
            },
            {
              path: 'disk/lvmthin',
              name: 'node-disk-lvmthin',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/disk/lvmthin/LvmThin.vue")), 'Node')
              },
              meta: {
                title: 'lvmthin'
              }
            },
            {
              path: 'disk/directory',
              name: 'node-disk-directory',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/disk/directory/Directory.vue")), 'Node')
              },
              meta: {
                title: 'node-disk-directory'
              }
            },
            {
              path: 'disk/zfs',
              name: 'node-disk-zfs',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/disk/zfs/ZFS.vue")), 'Node')
              },
              meta: {
                title: 'node-disk-zfs'
              }
            },
            {
              path: 'replication',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/replication/Replication.vue")), 'Node')
              },
              meta: {
                title: 'replication'
              }
            },
            {
              path: 'task',
              component: r => {
                require.ensure([], () => r(require("@view/home/node/task/HistoryTask.vue")), 'Node')
              },
              meta: {
                title: 'task'
              }
            }
          ]
        }
        ,
        {
          path: '/qemu',
          name: 'qemu',
          component: r => {
            require.ensure([], () => r(require("@view/home/qemu/index.vue")), 'Qemu')
          },
          children:
            [
              {
                path: 'overview',
                name: 'qemu-overview',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/overview/Overview.vue")), 'Qemu')
                },
                meta: {
                  title: 'overview'
                }
              },
              {
                path: 'console',
                name: 'qemu-console',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/console/Console.vue")), 'Qemu')
                },
                meta: {
                  title: 'console'
                }
              },
              {
                path: 'volume',
                name: 'qemu-volume',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/volume/Volume.vue")), 'Qemu')
                },
                meta: {
                  title: 'volume'
                }
              },
              {
                path: 'options',
                name: 'qemu-options',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/options/Options.vue")), 'Qemu')
                },
                meta: {
                  title: 'option'
                }
              },
              {
                path: 'historytask',
                name: 'qemu-historytask',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/task/HistoryTask.vue")), 'Qemu')
                },
                meta: {
                  title: 'task'
                }
              },
              {
                path: 'monitor',
                name: 'qemu-monitor',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/monitor/Monitor.vue")), 'Qemu')
                },
                meta: {
                  title: 'monitor'
                }
              },
              {
                path: 'backup',
                name: 'qemu-backup',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/backup/QemuBackup.vue")), 'Qemu')
                },
                meta: {
                  title: 'backup'
                }
              },
              {
                path: 'replication',
                name: 'qemu-replication',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/replication/Replication.vue")), 'Qemu')
                },
                meta: {
                  title: 'replication'
                }
              },
              {
                path: 'snapshot',
                name: 'qemu-snapshot',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/snapshot/SnapShot.vue")), 'Qemu')
                },
                meta: {
                  title: 'snapshot'
                }
              },
              {
                path: 'cloud-init',
                name: 'qemu-cloud-init',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/cloud-init/CloudInit.vue")), 'Qemu')
                },
                meta: {
                  title: 'Cloud Init'
                }
              },
              {
                path: 'lxc-resource',
                name: 'lxc-resource',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/lcx-resource/Resource.vue")), 'Qemu')
                },
                meta: {
                  title: 'resource'
                }
              },
              {
                path: 'lxc-network',
                name: 'lxc-network',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/lxc-network/NetWork.vue")), 'Qemu')
                },
                meta: {
                  title: 'network'
                }
              },
              {
                path: 'firewall',
                name: 'lxc-firewall',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/firewall/FireWall.vue")), 'Qemu')
                },
                meta: {
                  title: 'firewall'
                }
              },
              {
                path: 'firewall/alias',
                name: 'qemu-alias',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/firewall/alias/FireWallAlias.vue")), 'Qemu')
                },
                meta: {
                  title: 'datacenter-firewall-alias'
                }
              },
              {
                path: 'firewall/ipset',
                name: 'qemu-ipset',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/firewall/ipset/IpSet.vue")), 'Qemu')
                },
                meta: {
                  title: 'datacenter-firewall-ipset'
                }
              },
              {
                path: 'firewall/log',
                name: 'qemu-log',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/firewall/log/FireWallLog.vue")), 'Qemu')
                },
                meta: {
                  title: 'node-firewall-log'
                }
              },
              {
                path: 'firewall/options',
                name: 'qemu-firewall-options',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/firewall/options/Options.vue")), 'Qemu')
                },
                meta: {
                  title: 'option'
                }
              },
              {
                path: 'access',
                name: 'qemu-access',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/access/Access.vue")), 'Qemu')
                },
                meta: {
                  title: 'access'
                }
              }
            ]
        }
        ,
        {
          path: '/storage',
          name: 'storage',
          component: r => {
            require.ensure([], () => r(require("@view/home/storage/index.vue")), 'Storage')
          },
          meta: {
              title: 'storage'
            }
          ,
          children: [
            {
              path: 'overview',
              name: 'storage-overview',
              component: r => {
                require.ensure([], () => r(require("@view/home/storage/overview/Overview.vue")), 'Storage')
              },
              meta: {
                title: 'overview'
              }
            },
            {
              path: 'content',
              name: 'storage-content',
              component: r => {
                require.ensure([], () => r(require("@view/home/storage/content/Content.vue")), 'Storage')
              },
              meta: {
                title: 'content'
              }
            },
            {
              path: 'access',
              name: 'storage-access',
              component: r => {
                require.ensure([], () => r(require("@view/home/storage/access/Access.vue")), 'Storage')
              },
              meta: {
                title: 'access'
              }
            }
          ]
        }
        ,
        {
          path: '/pool',
          name: 'pool',
          component: r => {
            require.ensure([], () => r(require("@view/home/pool/index.vue")), 'Pool')
          },
          children:
            [
              {
                path: 'overview',
                name: 'pool-overview',
                component: r => {
                  require.ensure([], () => r(require("@view/home/pool/overview/Overview.vue")), 'Pool')
                },
                meta: {
                  title: 'overview'
                }
              },
              {
                path: 'member',
                name: 'pool-member',
                component: r => {
                  require.ensure([], () => r(require("@view/home/pool/member/member.vue")), 'Pool')
                },
                meta: {
                  title: 'member'
                }
              },
              {
                path: 'access',
                name: 'pool-access',
                component: r => {
                  require.ensure([], () => r(require("@view/home/qemu/access/Access.vue")), 'Pool')
                },
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

//路由钩子中进行鉴权或者token验证
router.beforeEach((to, from, next) => {
  store.commit('CLEAR_CANCEL_REQUEST') // 取消请求
  next();
})

router.afterEach((to, from) => {
  setDocumentTitle(to);
})
//路由钩子中进行鉴权或者token验证
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  console.log(router);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
});

function setDocumentTitle(to) {
  if (window.vm)
    document.title = 'MHFLEX_' + window.vm.$t(`${to.meta.title}`);
}

const originalPush = VueRoute.prototype.push
VueRoute.prototype.push = function push(location) {
  //捕获路由重复点击时出现的异常
  return originalPush.call(this, location).catch(err => err)
}
export default router;
