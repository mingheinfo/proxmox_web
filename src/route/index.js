import Vue from 'vue';
import VueRoute from 'vue-router';
import store from '@src/store/';

Vue.use(VueRoute);

const router = new VueRoute({
  mode: 'history',
  routes: [
    {
      path: '*',
      name: 'error404',
      meta: {
        title: '404-页面不存在'
      },
      component: () => import(/*webpackChunkName： "Error404"*/"@view/error/Error404")
    },
    {
      path: '/login',
      name: 'login',
      component:() => import(/*webpackChunkName: "Login"*/"@view/login/index.vue"),
      meta: {
        title: '登录'
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
            },
            {
              path: 'search',
              name: 'search',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/search/index.vue"),
            },
            {
              path: 'cluster',
              name: 'cluster',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/cluster/Cluster.vue"),
            },
            {
              path: 'option',
              name: 'option',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/option/Option.vue"),
            },
            {
              path: 'storage',
              name: 'storage',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/storage/Storage.vue"),
            },
            {
              path: 'backup',
              name: 'backup',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/backup/BackUp.vue"),
            },
            {
              path: 'replication',
              name: 'replication',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/replication/Replication.vue")
            },
            {
              path: 'access',
              name: 'access',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/Access.vue")
            },
            {
              path: 'access/user',
              name: 'access-user',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/user/User.vue")
            },
            {
              path: 'access/apitoken',
              name: 'access-apitoken',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/apitoken/ApiToken.vue")
            },
            {
              path: 'access/group',
              name: 'access-group',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/group/Group.vue")
            },
            {
              path: 'access/pool',
              name: 'access-pool',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/pool/Pool.vue")
            },
            {
              path: 'access/role',
              name: 'access-role',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/role/Role.vue")
            },
            {
              path: 'access/domains',
              name: 'access-domains',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/access/domains/Domains.vue")
            },
            {
              path: 'ha',
              name: 'ha',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/ha/Ha.vue")
            },
            {
              path: 'ha-group',
              name: 'ha-group',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/ha/hagroup/HaGroup.vue")
            },
            {
              path: 'acme',
              name: 'acme',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/acme/Acme.vue")
            },
            {
              path: 'firewall',
              name: 'firewall',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/Firewall.vue"),
            },
            {
              path: 'firewall/option',
              name: 'firewall-option',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/options/FirOptions.vue"),
            },
            {
              path: 'firewall/group',
              name: 'firewall-group',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/group/FireWallGroup.vue"),
            },
            {
              path: 'firewall/alias',
              name: 'firewall-alias',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/alias/FireWallAlias.vue"),
            },
            {
              path: 'firewall/ipset',
              name: 'firewall-ipset',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/dataCenter/firewall/ipset/IpSet.vue"),
            }
          ]
        },
        {
          path: '/node',
          name: 'node', 
          component: () => import(/*webpackChunkName: 'node' */"@view/home/node/index.vue"),
          children: [
            {
              path: 'search',
              name: 'search',
              component: () => import(/*webpackChunkName: 'search' */"@view/home/node/search/Search.vue"),
            },
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/overview/Overview.vue"),
            },
            {
              path: 'shell',
              name: 'shell',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/shell/Shell.vue"),
            },
            {
              path: 'notes',
              name: 'notes',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/notes/Notes.vue"),
            },
            { 
              path: 'system',
              name: 'system',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/System.vue")
            },
            {
              path: 'network',
              name: 'network',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/network/NetWork.vue")
            },
            {
              path: 'certificates',
              name: 'certificates',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/certificates/Certificates.vue")
            },
            {
              path: 'dns',
              name: 'dns',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/dns/Dns.vue")
            },
            {
              path: 'hosts',
              name: 'hosts',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/hosts/Host.vue")
            },
            {
              path: 'time',
              name: 'time',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/time/TimeZone.vue")
            },
            {
              path: 'syslog',
              name: 'syslog',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/system/syslog/SysLog.vue")
            },
            {
              path: 'apt-update',
              name: 'apt-update',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/apt-update/AptUpdate.vue")
            },
            {
              path: 'firewall',
              name: 'node-firewall',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/firewall/FireWall.vue")
            },
            {
              path: 'firewall/option',
              name: 'node-firewall-option',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/firewall/option/Option.vue")
            },
            {
              path: 'firewall/log',
              name: 'node-firewall-log',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/firewall/log/FireWallLog.vue")
            },
            {
              path: 'disk',
              name: 'node-disk',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/Disk.vue")
            },
            {
              path: 'disk/lvm',
              name: 'node-disk-lvm',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/lvm/Lvm.vue")
            },
            {
              path: 'disk/lvmthin',
              name: 'node-disk-lvmthin',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/lvmthin/LvmThin.vue")
            },
            {
              path: 'disk/directory',
              name: 'node-disk-directory',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/directory/Directory.vue")
            },
            {
              path: 'disk/zfs',
              name: 'node-disk-zfs',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/disk/zfs/ZFS.vue")
            },
            {
              path: 'replication',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/replication/Replication.vue")
            },
            {
              path: 'task',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/node/task/HistoryTask.vue")
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
            },
            {
              path: 'console',
              name: 'console',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/console/Console.vue"),
            },
            {
              path: 'volume',
              name: 'volume',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/qemu/volume/Volume.vue"),
            }
          ]
        },
        {
          path: '/storage',
          name: 'storage',
          component:  () => import(/*webpackChunkName: 'storage' */"@view/home/storage/index.vue"),
          children: [
            {
              path: 'overview',
              name: 'overview',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/storage/overview/Overview.vue"),
            },
            {
              path: 'content',
              name: 'content',
              component: () => import(/*webpackChunkName: 'overview' */"@view/home/storage/content/Content.vue"),
            },
            {
              path: 'access',
              name: 'access',
              component: () => import(/*webpackChunkName: 'dataCenter' */"@view/home/storage/access/Access.vue"),
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
            },
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

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
});

export default router;
