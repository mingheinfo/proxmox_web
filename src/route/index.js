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
      component: () => import(/*webpackChunkName： 'Error404'*/"@view/error/Error404")
    },
    {
      path: '/login',
      name: 'login',
      component:() => import(/*webpackChunkName: 'Login'*/"@view/login/index.vue"),
      meta: {
        title: '登录'
      }
    },
    {
      path: '/home',
      component:() => import(/*webpackChunkName: 'home' */"@view/home/index.vue"),
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
export default router;
