import type { DefaultTheme } from 'vitepress';

export const nav: DefaultTheme.Config['nav'] = [
  // {
  //   text: 'Meetup',
  //   items: [
  //     { text: '网络', link: '/meetup/network/index', activeMatch: '/meetup/network/' },
  //   ],
  //   activeMatch: '/meetup/'
  // },
  {
    text: '博客',
    items: [
      { text: '原创', link: '/blogs/original/index', activeMatch: '/blogs/original/' },
      { text: '翻译', link: '/blogs/translate/index', activeMatch: '/blogs/translate/' },
      // { text: '转载', link: '/blogs/repost/index', activeMatch: '/blogs/repost/' },
    ],
    activeMatch: '/blogs/'
  },
  {
    text: '我的分类',
    items: [
      { text: 'Bug万象集', link: '/categories/issues/index', activeMatch: '/categories/issues/' },
      { text: '个人速查手册', link: '/categories/fragments/index', activeMatch: '/categories/fragments/' },
      { text: '精选工具箱', link: '/categories/tools/index', activeMatch: '/categories/tools/' },
      { text: '开源项目', link: '/categories/open-source/index', activeMatch: '/categories/open-source/' },
      { text: '学习笔记', link: '/categories/learning/index', activeMatch: '/categories/learning/' },
    ],
    activeMatch: '/categories/'
  },
  {
    text: '我的小册',
    items: [
      { text: 'AI Infra 教程', link: '/courses/ai-infra/index', activeMatch: '/courses/ai-infra/' },
      { text: 'Elastic Stack 实战教程', link: '/courses/elastic-stack/index', activeMatch: '/courses/elastic-stack/' },
      { text: 'Observability 教程', link: '/courses/observability/index', activeMatch: '/courses/observability/' },
      { text: '面试宝典', link: '/courses/interview/index', activeMatch: '/courses/interview/' },
      { text: '数据结构与算法', link: '/courses/algorithm/index', activeMatch: '/courses/algorithm/' }
    ],
    activeMatch: '/courses/'
  },
  {
    text: '我的标签',
    link: '/tags',
    activeMatch: '/tags'
  },
  {
    text: '我的归档',
    link: '/archives',
    activeMatch: '/archives'
  },
  {
    text: '关于',
    items: [
      { text: '关于知识库', link: '/about/index', activeMatch: '/about/index' },
      { text: '关于我', link: '/about/me', activeMatch: '/about/me' }
    ],
    activeMatch: '/about/' // // 当前页面处于匹配路径下时, 对应导航菜单将突出显示
  },
];