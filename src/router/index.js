// 路由-相关模块
import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/Layout'
import Home from '@/views/Home'
import Search from '@/views/Search'
import Play from '@/views/Play'
Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    redirect: '/layout',
  },
  {
    path: '/layout',
    component: Layout,
    redirect: '/layout/home',
    children: [
      {
        path: 'home',
        component: Home,
        meta: {
          // meta保存路由对象额外信息的
          title: '首页',
        },
      },
      {
        path: 'search',
        component: Search,
        meta: {
          title: '搜索',
        },
      },
    ],
  },
  {
    path: '/play',
    component: Play,
  },
]
const router = new VueRouter({
  routes,
})
// 解决跳转的路由地址相同时的报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

export default router
