// docs/.vitepress/config.ts
import { defineConfig } from "file:///Users/I576375/Code/website/cr7258.github.io/node_modules/.pnpm/vitepress@1.0.0-rc.31_axios@1.6.2_markdown-it-mathjax3@4.3.2_react-dom@15.7.0_react@15.7.0_search-insights@2.7.0/node_modules/vitepress/dist/node/index.js";
import { withMermaid } from "file:///Users/I576375/Code/website/cr7258.github.io/node_modules/.pnpm/vitepress-plugin-mermaid@2.0.8_mermaid@9.3.0_vite-plugin-md@0.20.6_vitepress@1.0.0-rc.31/node_modules/vitepress-plugin-mermaid/dist/vitepress-plugin-mermaid.es.mjs";

// docs/.vitepress/config/constants.ts
var site = "https://blog.charles7c.top";
var metaData = {
  lang: "zh-CN",
  locale: "zh_CN",
  title: "Se7en\u7684\u67B6\u6784\u7B14\u8BB0",
  description: "\u4E2A\u4EBA\u6280\u672F\u77E5\u8BC6\u5E93\uFF0C\u8BB0\u5F55 & \u5206\u4EAB\u4E2A\u4EBA\u788E\u7247\u5316\u3001\u7ED3\u6784\u5316\u3001\u4F53\u7CFB\u5316\u7684\u6280\u672F\u77E5\u8BC6\u5185\u5BB9\u3002",
  site,
  image: `${site}/logo.jpg`
};

// docs/.vitepress/config/head.ts
var head = [
  ["link", { rel: "icon", href: "/favicon.ico" }],
  ["meta", { name: "author", content: "Se7en" }],
  ["meta", { name: "keywords", content: "Se7en\u7684\u67B6\u6784\u7B14\u8BB0, \u77E5\u8BC6\u5E93, \u535A\u5BA2, Se7en" }],
  ["meta", { name: "HandheldFriendly", content: "True" }],
  ["meta", { name: "MobileOptimized", content: "320" }],
  ["meta", { name: "theme-color", content: "#3c8772" }],
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:locale", content: metaData.locale }],
  ["meta", { property: "og:title", content: metaData.title }],
  ["meta", { property: "og:description", content: metaData.description }],
  ["meta", { property: "og:site", content: metaData.site }],
  ["meta", { property: "og:site_name", content: metaData.title }],
  ["meta", { property: "og:image", content: metaData.image }],
  // 百度统计代码：https://tongji.baidu.com
  ["script", {}, `var _hmt = _hmt || [];
  (function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?53af4b1a12fbe40810ca7ad39f8db9c7";
    var s = document.getElementsByTagName("script")[0]; 
    s.parentNode.insertBefore(hm, s);
  })();`]
  // 页面访问量统计
  // ['script', {}, `
  // window.addEventListener('load', function() {
  //   let oldHref = document.location.href, bodyDOM = document.querySelector('body');
  //   const observer = new MutationObserver(function(mutations) {
  //     if (oldHref != document.location.href) {
  //       oldHref = document.location.href;
  //       getPv()
  //       window.requestAnimationFrame(function() {
  //         let tmp = document.querySelector('body');
  //         if(tmp != bodyDOM) {
  //           bodyDOM = tmp;
  //           observer.observe(bodyDOM, config);
  //         }
  //       })
  //     }
  //   });
  //   const config = {
  //     childList: true,
  //     subtree: true
  //   };
  //   observer.observe(bodyDOM, config);
  //   getPv()
  // }, true);
  // function getPv() {
  //   xhr = new XMLHttpRequest();
  //   xhr.open('GET', 'https://api.charles7c.top/blog/pv?pageUrl=' + location.href);
  //   xhr.send();
  // }`]
];

// docs/.vitepress/config/markdown.ts
import mathjax3 from "file:///Users/I576375/Code/website/cr7258.github.io/node_modules/.pnpm/markdown-it-mathjax3@4.3.2/node_modules/markdown-it-mathjax3/index.js";
import footnote from "file:///Users/I576375/Code/website/cr7258.github.io/node_modules/.pnpm/markdown-it-footnote@3.0.3/node_modules/markdown-it-footnote/index.js";
var markdown = {
  // Shiki主题, 所有主题参见: https://github.com/shikijs/shiki/blob/main/docs/themes.md
  theme: {
    light: "github-light",
    dark: "github-dark-dimmed"
  },
  // lineNumbers: true, // 启用行号
  config: (md) => {
    md.use(mathjax3);
    md.use(footnote);
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === "h1")
        htmlResult += `
<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    };
  }
};

// docs/.vitepress/config/nav.ts
var nav = [
  {
    text: "\u535A\u5BA2",
    items: [
      { text: "\u539F\u521B", link: "/blogs/original/index", activeMatch: "/blogs/original/" },
      { text: "\u7FFB\u8BD1", link: "/blogs/translate/index", activeMatch: "/blogs/translate/" }
      // { text: '转载', link: '/blogs/repost/index', activeMatch: '/blogs/repost/' },
    ],
    activeMatch: "/blogs/"
  },
  {
    text: "\u6211\u7684\u5206\u7C7B",
    items: [
      { text: "Bug\u4E07\u8C61\u96C6", link: "/categories/issues/index", activeMatch: "/categories/issues/" },
      { text: "\u4E2A\u4EBA\u901F\u67E5\u624B\u518C", link: "/categories/fragments/index", activeMatch: "/categories/fragments/" },
      { text: "\u7CBE\u9009\u5DE5\u5177\u7BB1", link: "/categories/tools/index", activeMatch: "/categories/tools/" },
      { text: "\u5F00\u6E90\u9879\u76EE", link: "/categories/open-source/index", activeMatch: "/categories/open-source/" }
    ],
    activeMatch: "/categories/"
  },
  {
    text: "\u6211\u7684\u5C0F\u518C",
    items: [
      { text: "Elastic Stack \u6559\u7A0B", link: "/courses/elastic-stack/index", activeMatch: "/courses/elastic-stack/" }
    ],
    activeMatch: "/courses/"
  },
  {
    text: "\u6211\u7684\u6807\u7B7E",
    link: "/tags",
    activeMatch: "/tags"
  },
  {
    text: "\u6211\u7684\u5F52\u6863",
    link: "/archives",
    activeMatch: "/archives"
  },
  {
    text: "\u5173\u4E8E",
    items: [
      { text: "\u5173\u4E8E\u77E5\u8BC6\u5E93", link: "/about/index", activeMatch: "/about/index" },
      { text: "\u5173\u4E8E\u6211", link: "/about/me", activeMatch: "/about/me" }
    ],
    activeMatch: "/about/"
    // // 当前页面处于匹配路径下时, 对应导航菜单将突出显示
  }
];

// docs/.vitepress/config/sidebar.ts
import fg from "file:///Users/I576375/Code/website/cr7258.github.io/node_modules/.pnpm/fast-glob@3.3.2/node_modules/fast-glob/out/index.js";
import matter from "file:///Users/I576375/Code/website/cr7258.github.io/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js";

// docs/.vitepress/theme/utils.ts
function getChineseZodiac(year) {
  const arr = ["monkey", "rooster", "dog", "pig", "rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat"];
  return arr[year % 12];
}
function getChineseZodiacAlias(year) {
  const arr = ["\u7334\u5E74", "\u9E21\u5E74", "\u72D7\u5E74", "\u732A\u5E74", "\u9F20\u5E74", "\u725B\u5E74", "\u864E\u5E74", "\u5154\u5E74", "\u9F99\u5E74", "\u86C7\u5E74", "\u9A6C\u5E74", "\u7F8A\u5E74"];
  return arr[year % 12];
}

// docs/.vitepress/config/sidebar.ts
var sync = fg.sync;
var sidebar = {
  "/categories/issues/": getItemsByDate("categories/issues"),
  "/categories/fragments/": getItemsByDate("categories/fragments"),
  "/categories/tools/": getItemsByDate("categories/tools"),
  "/blogs/original/": getItemsByDate("blogs/original/"),
  "/blogs/translate/": getItemsByDate("blogs/translate/"),
  "/courses/elastic-stack/": getItems("courses/elastic-stack"),
  "/courses/ai-infra/": getItems("courses/ai-infra")
};
function getItemsByDate(path) {
  let yearGroups = [];
  let topArticleItems = [];
  sync(`docs/${path}/*`, {
    onlyDirectories: true,
    objectMode: true
  }).forEach(({ name }) => {
    let year = name;
    let articleItems = [];
    sync(`docs/${path}/${year}/*`, {
      onlyFiles: true,
      objectMode: true
    }).forEach((article) => {
      const articleFile = matter.read(`${article.path}`);
      const { data } = articleFile;
      if (data.isTop) {
        topArticleItems.unshift({
          text: data.title,
          link: `/${path}/${year}/${article.name.replace(".md", "")}`
        });
      }
      articleItems.unshift({
        text: data.title,
        link: `/${path}/${year}/${article.name.replace(".md", "")}`
      });
    });
    yearGroups.unshift({
      text: `<img class="chinese-zodiac" style="position: static; vertical-align: middle; padding-bottom: 3px;" src="/img/svg/chinese-zodiac/${getChineseZodiac(year.replace("\u5E74", ""))}.svg" title="${getChineseZodiacAlias(year.replace("\u5E74", ""))}" alt="\u751F\u8096">
            ${year}\u5E74 (${articleItems.length}\u7BC7)`,
      items: articleItems,
      collapsed: false
    });
  });
  if (topArticleItems.length > 0) {
    yearGroups.unshift({
      text: `<svg style="display: inline-block; vertical-align: middle; padding-bottom: 3px;" viewBox="0 0 1920 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="30" height="30"><path d="M367.488 667.904h423.744v47.232H367.488v-47.232zM320.256 204.352h137.28v68.992h-137.28v-68.992zM367.488 754.112h423.744v48H367.488v-48zM693.76 204.352h137.984v68.992H693.76v-68.992zM507.008 204.352h137.28v68.992h-137.28v-68.992z" p-id="10749" fill="#d81e06"></path><path d="M1792.512 0H127.488C57.472 0 0 57.152 0 127.616v768.768C0 966.72 57.088 1024 127.488 1024h1665.088c69.952 0 127.424-57.152 127.424-127.616V127.616C1920 57.216 1862.912 0 1792.512 0z m-528 175.104h446.976v54.016H1494.72l-24 101.248h206.976V689.6h-57.728V384.32h-289.472v308.224h-57.728v-362.24h140.224l20.992-101.248h-169.472v-53.952z m-996.032-11.2h614.272v167.232h-51.008v-17.28H320.256v17.28H268.48V163.904z m678.784 681.728h-744v-43.52h111.744V454.848h229.504v-48.704H221.248v-42.048h323.264v-39.744h54.016v39.744h331.52v41.984h-331.52v48.768h245.248v347.264h103.488v43.52z m203.264-94.528c0 59.52-30.72 89.28-92.224 89.28-25.472 0-46.016-0.512-61.504-1.472-2.496-22.976-6.528-45.248-12.032-66.752 22.976 5.504 46.72 8.256 71.232 8.256 24 0 35.968-11.52 35.968-34.496V247.872H971.2v-54.72h278.976v54.72H1150.4v503.232z m521.216 121.536c-67.008-55.488-137.28-108.032-210.752-157.504-4.992 9.984-10.496 19.008-16.512 27.008-41.472 57.024-113.28 101.504-215.232 133.504-9.472-16.512-21.504-34.496-35.968-54.016 94.528-27.008 161.28-64.512 200.256-112.512 34.496-44.992 51.776-113.024 51.776-204.032V421.12h57.728v82.496c0 62.528-6.72 115.776-20.224 159.744 84.48 54.016 161.472 107.008 230.976 158.976l-42.048 50.304z" p-id="10750" fill="#d81e06"></path><path d="M367.488 495.36h423.744v47.232H367.488V495.36zM367.488 581.632h423.744v47.232H367.488v-47.232z" p-id="10751" fill="#d81e06"></path></svg>
            \u6211\u7684\u7F6E\u9876 (${topArticleItems.length}\u7BC7)`,
      items: topArticleItems,
      collapsed: false
    });
  }
  addOrderNumber(yearGroups);
  return yearGroups;
}
function getItems(path) {
  let groups = [];
  let items = [];
  let total = 0;
  const groupCollapsedSize = 2;
  const titleCollapsedSize = 20;
  sync(`docs/${path}/*`, {
    onlyDirectories: true,
    objectMode: true
  }).forEach(({ name }) => {
    let groupName = name;
    sync(`docs/${path}/${groupName}/*`, {
      onlyFiles: true,
      objectMode: true
    }).forEach((article) => {
      const articleFile = matter.read(`${article.path}`);
      const { data } = articleFile;
      items.push({
        text: data.title,
        link: `/${path}/${groupName}/${article.name.replace(".md", "")}`
      });
      total += 1;
    });
    groups.push({
      text: `${groupName.substring(groupName.indexOf("-") + 1)} (${items.length}\u7BC7)`,
      items,
      collapsed: items.length < groupCollapsedSize || total > titleCollapsedSize
    });
    items = [];
  });
  addOrderNumber(groups);
  return groups;
}
function addOrderNumber(groups) {
  for (let i = 0; i < groups.length; i++) {
    for (let j = 0; j < groups[i].items.length; j++) {
      const items = groups[i].items;
      const index = j + 1;
      let indexStyle = `<div class="text-color-gray mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      if (index == 1) {
        indexStyle = `<div class="text-color-red mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      } else if (index == 2) {
        indexStyle = `<div class="text-color-orange mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      } else if (index == 3) {
        indexStyle = `<div class="text-color-yellow mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      }
      items[j].text = `${indexStyle}${items[j].text}`;
    }
  }
}

// docs/.vitepress/config/search/local-search.ts
var localSearchOptions = {
  locales: {
    root: {
      translations: {
        button: {
          buttonText: "\u641C\u7D22\u6587\u6863",
          buttonAriaLabel: "\u641C\u7D22\u6587\u6863"
        },
        modal: {
          noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
          resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
          footer: {
            selectText: "\u9009\u62E9",
            navigateText: "\u5207\u6362"
          }
        }
      }
    }
  }
};

// docs/.vitepress/config/theme.ts
var themeConfig = {
  nav,
  // 导航栏配置
  sidebar,
  // 侧边栏配置
  logo: "/logo.png",
  outline: {
    level: "deep",
    // 右侧大纲标题层级
    label: "\u76EE\u5F55"
    // 右侧大纲标题文本配置
  },
  darkModeSwitchLabel: "\u5207\u6362\u65E5\u5149/\u6697\u9ED1\u6A21\u5F0F",
  sidebarMenuLabel: "\u6587\u7AE0",
  returnToTopLabel: "\u8FD4\u56DE\u9876\u90E8",
  lastUpdatedText: "\u6700\u540E\u66F4\u65B0",
  // 最后更新时间文本配置, 需先配置lastUpdated为true
  // 文档页脚文本配置
  docFooter: {
    prev: "\u4E0A\u4E00\u7BC7",
    next: "\u4E0B\u4E00\u7BC7"
  },
  // 编辑链接配置
  editLink: {
    pattern: "https://github.com/cr7258/cr7258.github.io/edit/main/docs/:path",
    text: "\u4E0D\u59A5\u4E4B\u5904\uFF0C\u656C\u8BF7\u96C5\u6B63"
  },
  // 搜索配置（二选一）
  search: {
    // provider: 'algolia',
    // options: algoliaSearchOptions,
    // 本地离线搜索
    provider: "local",
    options: localSearchOptions
  },
  // 导航栏右侧社交链接配置
  socialLinks: [
    { icon: "github", link: "https://github.com/cr7258/cr7258.github.io" }
  ],
  // 自定义扩展: 文章元数据配置
  // @ts-ignore
  articleMetadataConfig: {
    author: "Se7en",
    // 文章全局默认作者名称
    authorLink: "/about/me",
    // 点击作者名时默认跳转的链接
    showViewCount: false
    // 是否显示文章阅读数, 需要在 docs/.vitepress/theme/api/config.js 及 interface.js 配置好相应 API 接口
  },
  // 自定义扩展: 文章版权配置
  copyrightConfig: {
    license: "\u7F72\u540D-\u76F8\u540C\u65B9\u5F0F\u5171\u4EAB 4.0 \u56FD\u9645 (CC BY-SA 4.0)",
    licenseLink: "http://creativecommons.org/licenses/by-sa/4.0/"
  },
  // 自定义扩展: 评论配置
  commentConfig: {
    type: "gitalk",
    showComment: true
    // 是否显示评论
  },
  // 自定义扩展: 页脚配置
  footerConfig: {
    showFooter: true,
    // 是否显示页脚
    copyright: `Copyright \xA9 2023-${(/* @__PURE__ */ new Date()).getFullYear()} Se7en`
    // 版权信息
  }
};

// docs/.vitepress/config.ts
var config_default = withMermaid(
  defineConfig({
    ignoreDeadLinks: true,
    lang: metaData.lang,
    title: metaData.title,
    description: metaData.description,
    cleanUrls: true,
    lastUpdated: true,
    // 显示最后更新时间
    head,
    // <head>内标签配置
    markdown,
    // Markdown配置
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => customElements.includes(tag)
        }
      }
    },
    themeConfig,
    // 主题配置
    // 本地化
    locales: {
      root: {
        label: "\u4E2D\u6587",
        lang: "zh"
      },
      en: {
        label: "English",
        lang: "en"
        // 可选，将作为 `lang` 属性添加到 `html` 标签中
      }
    }
  })
);
var customElements = [
  "mjx-container",
  "mjx-assistive-mml",
  "math",
  "maction",
  "maligngroup",
  "malignmark",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mi",
  "mlongdiv",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mscarries",
  "mscarry",
  "mscarries",
  "msgroup",
  "mstack",
  "mlongdiv",
  "msline",
  "mstack",
  "mspace",
  "msqrt",
  "msrow",
  "mstack",
  "mstack",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
  "math",
  "mi",
  "mn",
  "mo",
  "ms",
  "mspace",
  "mtext",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "msqrt",
  "mstyle",
  "mmultiscripts",
  "mover",
  "mprescripts",
  "msub",
  "msubsup",
  "msup",
  "munder",
  "munderover",
  "none",
  "maligngroup",
  "malignmark",
  "mtable",
  "mtd",
  "mtr",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "msline",
  "msrow",
  "mstack",
  "maction",
  "semantics",
  "annotation",
  "annotation-xml"
];
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL2NvbmZpZy50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL2NvbnN0YW50cy50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL2hlYWQudHMiLCAiZG9jcy8udml0ZXByZXNzL2NvbmZpZy9tYXJrZG93bi50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL25hdi50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL3NpZGViYXIudHMiLCAiZG9jcy8udml0ZXByZXNzL3RoZW1lL3V0aWxzLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvc2VhcmNoL2xvY2FsLXNlYXJjaC50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL3RoZW1lLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IHsgd2l0aE1lcm1haWQgfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLW1lcm1haWQnO1xuaW1wb3J0IHsgbWV0YURhdGEgfSBmcm9tICcuL2NvbmZpZy9jb25zdGFudHMnO1xuaW1wb3J0IHsgaGVhZCB9IGZyb20gJy4vY29uZmlnL2hlYWQnO1xuaW1wb3J0IHsgbWFya2Rvd24gfSBmcm9tICcuL2NvbmZpZy9tYXJrZG93bic7XG5pbXBvcnQgeyB0aGVtZUNvbmZpZyB9IGZyb20gJy4vY29uZmlnL3RoZW1lJztcblxuZXhwb3J0IGRlZmF1bHQgd2l0aE1lcm1haWQoXG4gIGRlZmluZUNvbmZpZyh7XG4gICAgaWdub3JlRGVhZExpbmtzOiB0cnVlLFxuICAgIGxhbmc6IG1ldGFEYXRhLmxhbmcsXG4gICAgdGl0bGU6IG1ldGFEYXRhLnRpdGxlLFxuICAgIGRlc2NyaXB0aW9uOiBtZXRhRGF0YS5kZXNjcmlwdGlvbixcblxuICAgIGNsZWFuVXJsczogdHJ1ZSxcbiAgICBsYXN0VXBkYXRlZDogdHJ1ZSwgLy8gXHU2NjNFXHU3OTNBXHU2NzAwXHU1NDBFXHU2NkY0XHU2NUIwXHU2NUY2XHU5NUY0XG5cbiAgICBoZWFkLCAvLyA8aGVhZD5cdTUxODVcdTY4MDdcdTdCN0VcdTkxNERcdTdGNkVcbiAgICBtYXJrZG93bjogbWFya2Rvd24sIC8vIE1hcmtkb3duXHU5MTREXHU3RjZFXG4gICAgdnVlOiB7XG4gICAgICB0ZW1wbGF0ZToge1xuICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgICBpc0N1c3RvbUVsZW1lbnQ6ICh0YWcpID0+IGN1c3RvbUVsZW1lbnRzLmluY2x1ZGVzKHRhZyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdGhlbWVDb25maWcsIC8vIFx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RVxuXG4gICAgLy8gXHU2NzJDXHU1NzMwXHU1MzE2XG4gICAgbG9jYWxlczoge1xuICAgICAgcm9vdDoge1xuICAgICAgICBsYWJlbDogJ1x1NEUyRFx1NjU4NycsXG4gICAgICAgIGxhbmc6ICd6aCdcbiAgICAgIH0sXG4gICAgICBlbjoge1xuICAgICAgICBsYWJlbDogJ0VuZ2xpc2gnLFxuICAgICAgICBsYW5nOiAnZW4nLCAvLyBcdTUzRUZcdTkwMDlcdUZGMENcdTVDMDZcdTRGNUNcdTRFM0EgYGxhbmdgIFx1NUM1RVx1NjAyN1x1NkRGQlx1NTJBMFx1NTIzMCBgaHRtbGAgXHU2ODA3XHU3QjdFXHU0RTJEXG4gICAgICB9XG4gICAgfVxuICB9KSxcbik7XG5cbmNvbnN0IGN1c3RvbUVsZW1lbnRzID0gW1xuICAnbWp4LWNvbnRhaW5lcicsXG4gICdtangtYXNzaXN0aXZlLW1tbCcsXG4gICdtYXRoJyxcbiAgJ21hY3Rpb24nLFxuICAnbWFsaWduZ3JvdXAnLFxuICAnbWFsaWdubWFyaycsXG4gICdtZW5jbG9zZScsXG4gICdtZXJyb3InLFxuICAnbWZlbmNlZCcsXG4gICdtZnJhYycsXG4gICdtaScsXG4gICdtbG9uZ2RpdicsXG4gICdtbXVsdGlzY3JpcHRzJyxcbiAgJ21uJyxcbiAgJ21vJyxcbiAgJ21vdmVyJyxcbiAgJ21wYWRkZWQnLFxuICAnbXBoYW50b20nLFxuICAnbXJvb3QnLFxuICAnbXJvdycsXG4gICdtcycsXG4gICdtc2NhcnJpZXMnLFxuICAnbXNjYXJyeScsXG4gICdtc2NhcnJpZXMnLFxuICAnbXNncm91cCcsXG4gICdtc3RhY2snLFxuICAnbWxvbmdkaXYnLFxuICAnbXNsaW5lJyxcbiAgJ21zdGFjaycsXG4gICdtc3BhY2UnLFxuICAnbXNxcnQnLFxuICAnbXNyb3cnLFxuICAnbXN0YWNrJyxcbiAgJ21zdGFjaycsXG4gICdtc3R5bGUnLFxuICAnbXN1YicsXG4gICdtc3VwJyxcbiAgJ21zdWJzdXAnLFxuICAnbXRhYmxlJyxcbiAgJ210ZCcsXG4gICdtdGV4dCcsXG4gICdtdHInLFxuICAnbXVuZGVyJyxcbiAgJ211bmRlcm92ZXInLFxuICAnc2VtYW50aWNzJyxcbiAgJ21hdGgnLFxuICAnbWknLFxuICAnbW4nLFxuICAnbW8nLFxuICAnbXMnLFxuICAnbXNwYWNlJyxcbiAgJ210ZXh0JyxcbiAgJ21lbmNsb3NlJyxcbiAgJ21lcnJvcicsXG4gICdtZmVuY2VkJyxcbiAgJ21mcmFjJyxcbiAgJ21wYWRkZWQnLFxuICAnbXBoYW50b20nLFxuICAnbXJvb3QnLFxuICAnbXJvdycsXG4gICdtc3FydCcsXG4gICdtc3R5bGUnLFxuICAnbW11bHRpc2NyaXB0cycsXG4gICdtb3ZlcicsXG4gICdtcHJlc2NyaXB0cycsXG4gICdtc3ViJyxcbiAgJ21zdWJzdXAnLFxuICAnbXN1cCcsXG4gICdtdW5kZXInLFxuICAnbXVuZGVyb3ZlcicsXG4gICdub25lJyxcbiAgJ21hbGlnbmdyb3VwJyxcbiAgJ21hbGlnbm1hcmsnLFxuICAnbXRhYmxlJyxcbiAgJ210ZCcsXG4gICdtdHInLFxuICAnbWxvbmdkaXYnLFxuICAnbXNjYXJyaWVzJyxcbiAgJ21zY2FycnknLFxuICAnbXNncm91cCcsXG4gICdtc2xpbmUnLFxuICAnbXNyb3cnLFxuICAnbXN0YWNrJyxcbiAgJ21hY3Rpb24nLFxuICAnc2VtYW50aWNzJyxcbiAgJ2Fubm90YXRpb24nLFxuICAnYW5ub3RhdGlvbi14bWwnLFxuXTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvY29uc3RhbnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvY29uc3RhbnRzLnRzXCI7Y29uc3Qgc2l0ZSA9ICdodHRwczovL2Jsb2cuY2hhcmxlczdjLnRvcCc7XG5cbmV4cG9ydCBjb25zdCBtZXRhRGF0YSA9IHtcbiAgbGFuZzogJ3poLUNOJyxcbiAgbG9jYWxlOiAnemhfQ04nLFxuICB0aXRsZTogJ1NlN2VuXHU3Njg0XHU2N0I2XHU2Nzg0XHU3QjE0XHU4QkIwJyxcbiAgZGVzY3JpcHRpb246ICdcdTRFMkFcdTRFQkFcdTYyODBcdTY3MkZcdTc3RTVcdThCQzZcdTVFOTNcdUZGMENcdThCQjBcdTVGNTUgJiBcdTUyMDZcdTRFQUJcdTRFMkFcdTRFQkFcdTc4OEVcdTcyNDdcdTUzMTZcdTMwMDFcdTdFRDNcdTY3ODRcdTUzMTZcdTMwMDFcdTRGNTNcdTdDRkJcdTUzMTZcdTc2ODRcdTYyODBcdTY3MkZcdTc3RTVcdThCQzZcdTUxODVcdTVCQjlcdTMwMDInLFxuICBzaXRlLFxuICBpbWFnZTogYCR7c2l0ZX0vbG9nby5qcGdgLFxufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvaGVhZC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2hlYWQudHNcIjtpbXBvcnQgdHlwZSB7IEhlYWRDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IHsgbWV0YURhdGEgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBjb25zdCBoZWFkOiBIZWFkQ29uZmlnW10gPSBbXG4gIFsnbGluaycsIHsgcmVsOiAnaWNvbicsIGhyZWY6ICcvZmF2aWNvbi5pY28nIH1dLFxuICBbJ21ldGEnLCB7IG5hbWU6ICdhdXRob3InLCBjb250ZW50OiAnU2U3ZW4nIH1dLFxuICBbJ21ldGEnLCB7IG5hbWU6ICdrZXl3b3JkcycsIGNvbnRlbnQ6ICdTZTdlblx1NzY4NFx1NjdCNlx1Njc4NFx1N0IxNFx1OEJCMCwgXHU3N0U1XHU4QkM2XHU1RTkzLCBcdTUzNUFcdTVCQTIsIFNlN2VuJyB9XSxcblxuICBbJ21ldGEnLCB7IG5hbWU6ICdIYW5kaGVsZEZyaWVuZGx5JywgY29udGVudDogJ1RydWUnIH1dLFxuICBbJ21ldGEnLCB7IG5hbWU6ICdNb2JpbGVPcHRpbWl6ZWQnLCBjb250ZW50OiAnMzIwJyB9XSxcbiAgWydtZXRhJywgeyBuYW1lOiAndGhlbWUtY29sb3InLCBjb250ZW50OiAnIzNjODc3MicgfV0sXG5cbiAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnR5cGUnLCBjb250ZW50OiAnd2Vic2l0ZScgfV0sXG4gIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzpsb2NhbGUnLCBjb250ZW50OiBtZXRhRGF0YS5sb2NhbGUgfV0sXG4gIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0aXRsZScsIGNvbnRlbnQ6IG1ldGFEYXRhLnRpdGxlIH1dLFxuICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6ZGVzY3JpcHRpb24nLCBjb250ZW50OiBtZXRhRGF0YS5kZXNjcmlwdGlvbiB9XSxcbiAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnNpdGUnLCBjb250ZW50OiBtZXRhRGF0YS5zaXRlIH1dLFxuICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6c2l0ZV9uYW1lJywgY29udGVudDogbWV0YURhdGEudGl0bGUgfV0sXG4gIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzppbWFnZScsIGNvbnRlbnQ6IG1ldGFEYXRhLmltYWdlIH1dLFxuXG4gIC8vIFx1NzY3RVx1NUVBNlx1N0VERlx1OEJBMVx1NEVFM1x1NzgwMVx1RkYxQWh0dHBzOi8vdG9uZ2ppLmJhaWR1LmNvbVxuICBbJ3NjcmlwdCcsIHt9LCBgdmFyIF9obXQgPSBfaG10IHx8IFtdO1xuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICBobS5zcmMgPSBcImh0dHBzOi8vaG0uYmFpZHUuY29tL2htLmpzPzUzYWY0YjFhMTJmYmU0MDgxMGNhN2FkMzlmOGRiOWM3XCI7XG4gICAgdmFyIHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXTsgXG4gICAgcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShobSwgcyk7XG4gIH0pKCk7YF0sXG4gIC8vIFx1OTg3NVx1OTc2Mlx1OEJCRlx1OTVFRVx1OTFDRlx1N0VERlx1OEJBMVxuICAvLyBbJ3NjcmlwdCcsIHt9LCBgXG4gIC8vIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gIC8vICAgbGV0IG9sZEhyZWYgPSBkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCBib2R5RE9NID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAvLyAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zKSB7XG4gIC8vICAgICBpZiAob2xkSHJlZiAhPSBkb2N1bWVudC5sb2NhdGlvbi5ocmVmKSB7XG4gIC8vICAgICAgIG9sZEhyZWYgPSBkb2N1bWVudC5sb2NhdGlvbi5ocmVmO1xuICAvLyAgICAgICBnZXRQdigpXG4gIC8vICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gIC8vICAgICAgICAgbGV0IHRtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgLy8gICAgICAgICBpZih0bXAgIT0gYm9keURPTSkge1xuICAvLyAgICAgICAgICAgYm9keURPTSA9IHRtcDtcbiAgLy8gICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoYm9keURPTSwgY29uZmlnKTtcbiAgLy8gICAgICAgICB9XG4gIC8vICAgICAgIH0pXG4gIC8vICAgICB9XG4gIC8vICAgfSk7XG4gIC8vICAgY29uc3QgY29uZmlnID0ge1xuICAvLyAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAvLyAgICAgc3VidHJlZTogdHJ1ZVxuICAvLyAgIH07XG4gIC8vICAgb2JzZXJ2ZXIub2JzZXJ2ZShib2R5RE9NLCBjb25maWcpO1xuICAvLyAgIGdldFB2KClcbiAgLy8gfSwgdHJ1ZSk7XG5cbiAgLy8gZnVuY3Rpb24gZ2V0UHYoKSB7XG4gIC8vICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIC8vICAgeGhyLm9wZW4oJ0dFVCcsICdodHRwczovL2FwaS5jaGFybGVzN2MudG9wL2Jsb2cvcHY/cGFnZVVybD0nICsgbG9jYXRpb24uaHJlZik7XG4gIC8vICAgeGhyLnNlbmQoKTtcbiAgLy8gfWBdXG5dOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9tYXJrZG93bi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvY29uZmlnL21hcmtkb3duLnRzXCI7aW1wb3J0IHR5cGUgeyBNYXJrZG93bk9wdGlvbnMgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IG1hdGhqYXgzIGZyb20gJ21hcmtkb3duLWl0LW1hdGhqYXgzJztcbmltcG9ydCBmb290bm90ZSBmcm9tICdtYXJrZG93bi1pdC1mb290bm90ZSc7XG5cbmV4cG9ydCBjb25zdCBtYXJrZG93bjogTWFya2Rvd25PcHRpb25zID0ge1xuICAvLyBTaGlraVx1NEUzQlx1OTg5OCwgXHU2MjQwXHU2NzA5XHU0RTNCXHU5ODk4XHU1M0MyXHU4OUMxOiBodHRwczovL2dpdGh1Yi5jb20vc2hpa2lqcy9zaGlraS9ibG9iL21haW4vZG9jcy90aGVtZXMubWRcbiAgdGhlbWU6IHtcbiAgICBsaWdodDogJ2dpdGh1Yi1saWdodCcsXG4gICAgZGFyazogJ2dpdGh1Yi1kYXJrLWRpbW1lZCdcbiAgfSxcbiAgLy8gbGluZU51bWJlcnM6IHRydWUsIC8vIFx1NTQyRlx1NzUyOFx1ODg0Q1x1NTNGN1xuXG4gIGNvbmZpZzogKG1kKSA9PiB7XG4gICAgbWQudXNlKG1hdGhqYXgzKTtcbiAgICBtZC51c2UoZm9vdG5vdGUpO1xuXG4gICAgLy8gXHU1NzI4XHU2MjQwXHU2NzA5XHU2NTg3XHU2ODYzXHU3Njg0PGgxPlx1NjgwN1x1N0I3RVx1NTQwRVx1NkRGQlx1NTJBMDxBcnRpY2xlTWV0YWRhdGEvPlx1N0VDNFx1NEVGNlxuICAgIG1kLnJlbmRlcmVyLnJ1bGVzLmhlYWRpbmdfY2xvc2UgPSAodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2xmKSA9PiB7XG4gICAgICBsZXQgaHRtbFJlc3VsdCA9IHNsZi5yZW5kZXJUb2tlbih0b2tlbnMsIGlkeCwgb3B0aW9ucyk7XG4gICAgICBpZiAodG9rZW5zW2lkeF0udGFnID09PSAnaDEnKSBodG1sUmVzdWx0ICs9IGBcXG48Q2xpZW50T25seT48QXJ0aWNsZU1ldGFkYXRhIHYtaWY9XCIoJGZyb250bWF0dGVyPy5hc2lkZSA/PyB0cnVlKSAmJiAoJGZyb250bWF0dGVyPy5zaG93QXJ0aWNsZU1ldGFkYXRhID8/IHRydWUpXCIgOmFydGljbGU9XCIkZnJvbnRtYXR0ZXJcIiAvPjwvQ2xpZW50T25seT5gO1xuICAgICAgcmV0dXJuIGh0bWxSZXN1bHQ7XG4gICAgfVxuICB9LFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9uYXYudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9uYXYudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5cbmV4cG9ydCBjb25zdCBuYXY6IERlZmF1bHRUaGVtZS5Db25maWdbJ25hdiddID0gW1xuICB7XG4gICAgdGV4dDogJ1x1NTM1QVx1NUJBMicsXG4gICAgaXRlbXM6IFtcbiAgICAgIHsgdGV4dDogJ1x1NTM5Rlx1NTIxQicsIGxpbms6ICcvYmxvZ3Mvb3JpZ2luYWwvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9ibG9ncy9vcmlnaW5hbC8nIH0sXG4gICAgICB7IHRleHQ6ICdcdTdGRkJcdThCRDEnLCBsaW5rOiAnL2Jsb2dzL3RyYW5zbGF0ZS9pbmRleCcsIGFjdGl2ZU1hdGNoOiAnL2Jsb2dzL3RyYW5zbGF0ZS8nIH0sXG4gICAgICAvLyB7IHRleHQ6ICdcdThGNkNcdThGN0QnLCBsaW5rOiAnL2Jsb2dzL3JlcG9zdC9pbmRleCcsIGFjdGl2ZU1hdGNoOiAnL2Jsb2dzL3JlcG9zdC8nIH0sXG4gICAgXSxcbiAgICBhY3RpdmVNYXRjaDogJy9ibG9ncy8nXG4gIH0sXG4gIHtcbiAgICB0ZXh0OiAnXHU2MjExXHU3Njg0XHU1MjA2XHU3QzdCJyxcbiAgICBpdGVtczogW1xuICAgICAgeyB0ZXh0OiAnQnVnXHU0RTA3XHU4QzYxXHU5NkM2JywgbGluazogJy9jYXRlZ29yaWVzL2lzc3Vlcy9pbmRleCcsIGFjdGl2ZU1hdGNoOiAnL2NhdGVnb3JpZXMvaXNzdWVzLycgfSxcbiAgICAgIHsgdGV4dDogJ1x1NEUyQVx1NEVCQVx1OTAxRlx1NjdFNVx1NjI0Qlx1NTE4QycsIGxpbms6ICcvY2F0ZWdvcmllcy9mcmFnbWVudHMvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9jYXRlZ29yaWVzL2ZyYWdtZW50cy8nIH0sXG4gICAgICB7IHRleHQ6ICdcdTdDQkVcdTkwMDlcdTVERTVcdTUxNzdcdTdCQjEnLCBsaW5rOiAnL2NhdGVnb3JpZXMvdG9vbHMvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9jYXRlZ29yaWVzL3Rvb2xzLycgfSxcbiAgICAgIHsgdGV4dDogJ1x1NUYwMFx1NkU5MFx1OTg3OVx1NzZFRScsIGxpbms6ICcvY2F0ZWdvcmllcy9vcGVuLXNvdXJjZS9pbmRleCcsIGFjdGl2ZU1hdGNoOiAnL2NhdGVnb3JpZXMvb3Blbi1zb3VyY2UvJyB9LFxuICAgIF0sXG4gICAgYWN0aXZlTWF0Y2g6ICcvY2F0ZWdvcmllcy8nXG4gIH0sXG4gIHtcbiAgICB0ZXh0OiAnXHU2MjExXHU3Njg0XHU1QzBGXHU1MThDJyxcbiAgICBpdGVtczogW1xuICAgICAgeyB0ZXh0OiAnRWxhc3RpYyBTdGFjayBcdTY1NTlcdTdBMEInLCBsaW5rOiAnL2NvdXJzZXMvZWxhc3RpYy1zdGFjay9pbmRleCcsIGFjdGl2ZU1hdGNoOiAnL2NvdXJzZXMvZWxhc3RpYy1zdGFjay8nIH1cbiAgICBdLFxuICAgIGFjdGl2ZU1hdGNoOiAnL2NvdXJzZXMvJ1xuICB9LFxuICB7XG4gICAgdGV4dDogJ1x1NjIxMVx1NzY4NFx1NjgwN1x1N0I3RScsXG4gICAgbGluazogJy90YWdzJyxcbiAgICBhY3RpdmVNYXRjaDogJy90YWdzJ1xuICB9LFxuICB7XG4gICAgdGV4dDogJ1x1NjIxMVx1NzY4NFx1NUY1Mlx1Njg2MycsXG4gICAgbGluazogJy9hcmNoaXZlcycsXG4gICAgYWN0aXZlTWF0Y2g6ICcvYXJjaGl2ZXMnXG4gIH0sXG4gIHtcbiAgICB0ZXh0OiAnXHU1MTczXHU0RThFJyxcbiAgICBpdGVtczogW1xuICAgICAgeyB0ZXh0OiAnXHU1MTczXHU0RThFXHU3N0U1XHU4QkM2XHU1RTkzJywgbGluazogJy9hYm91dC9pbmRleCcsIGFjdGl2ZU1hdGNoOiAnL2Fib3V0L2luZGV4JyB9LFxuICAgICAgeyB0ZXh0OiAnXHU1MTczXHU0RThFXHU2MjExJywgbGluazogJy9hYm91dC9tZScsIGFjdGl2ZU1hdGNoOiAnL2Fib3V0L21lJyB9XG4gICAgXSxcbiAgICBhY3RpdmVNYXRjaDogJy9hYm91dC8nIC8vIC8vIFx1NUY1M1x1NTI0RFx1OTg3NVx1OTc2Mlx1NTkwNFx1NEU4RVx1NTMzOVx1OTE0RFx1OERFRlx1NUY4NFx1NEUwQlx1NjVGNiwgXHU1QkY5XHU1RTk0XHU1QkZDXHU4MjJBXHU4M0RDXHU1MzU1XHU1QzA2XHU3QTgxXHU1MUZBXHU2NjNFXHU3OTNBXG4gIH0sXG5dOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9zaWRlYmFyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvc2lkZWJhci50c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lIH0gZnJvbSAndml0ZXByZXNzJztcbmltcG9ydCBmZyBmcm9tICdmYXN0LWdsb2InO1xuaW1wb3J0IG1hdHRlciBmcm9tICdncmF5LW1hdHRlcic7XG5pbXBvcnQgeyBnZXRDaGluZXNlWm9kaWFjLCBnZXRDaGluZXNlWm9kaWFjQWxpYXMgfSBmcm9tICcuLi90aGVtZS91dGlscy50cyc7XG5jb25zdCBzeW5jID0gZmcuc3luYztcblxuZXhwb3J0IGNvbnN0IHNpZGViYXI6IERlZmF1bHRUaGVtZS5Db25maWdbJ3NpZGViYXInXSA9IHtcbiAgJy9jYXRlZ29yaWVzL2lzc3Vlcy8nOiBnZXRJdGVtc0J5RGF0ZShcImNhdGVnb3JpZXMvaXNzdWVzXCIpLFxuICAnL2NhdGVnb3JpZXMvZnJhZ21lbnRzLyc6IGdldEl0ZW1zQnlEYXRlKFwiY2F0ZWdvcmllcy9mcmFnbWVudHNcIiksXG4gICcvY2F0ZWdvcmllcy90b29scy8nOiBnZXRJdGVtc0J5RGF0ZShcImNhdGVnb3JpZXMvdG9vbHNcIiksXG4gICcvYmxvZ3Mvb3JpZ2luYWwvJzogZ2V0SXRlbXNCeURhdGUoXCJibG9ncy9vcmlnaW5hbC9cIiksXG4gICcvYmxvZ3MvdHJhbnNsYXRlLyc6IGdldEl0ZW1zQnlEYXRlKFwiYmxvZ3MvdHJhbnNsYXRlL1wiKSxcbiAgJy9jb3Vyc2VzL2VsYXN0aWMtc3RhY2svJzogZ2V0SXRlbXMoXCJjb3Vyc2VzL2VsYXN0aWMtc3RhY2tcIiksXG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFIFx1NjdEMFx1NTIwNlx1N0M3Qi9ZWVlZL3h4eC5tZCBcdTc2ODRcdTc2RUVcdTVGNTVcdTY4M0NcdTVGMEYsIFx1ODNCN1x1NTNENlx1NEZBN1x1OEZCOVx1NjgwRlx1NTIwNlx1N0VDNFx1NTNDQVx1NTIwNlx1N0VDNFx1NEUwQlx1NjgwN1x1OTg5OFxuICogXG4gKiAvY2F0ZWdvcmllcy9pc3N1ZXMvMjAyMi94eHgubWRcbiAqIFxuICogQHBhcmFtIHBhdGggXHU2MjZCXHU2M0NGXHU1N0ZBXHU3ODQwXHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyB7RGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW119XG4gKi9cbmZ1bmN0aW9uIGdldEl0ZW1zQnlEYXRlIChwYXRoOiBzdHJpbmcpIHtcbiAgLy8gXHU0RkE3XHU4RkI5XHU2ODBGXHU1RTc0XHU0RUZEXHU1MjA2XHU3RUM0XHU2NTcwXHU3RUM0XG4gIGxldCB5ZWFyR3JvdXBzOiBEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXSA9IFtdO1xuICAvLyBcdTdGNkVcdTk4NzZcdTY1NzBcdTdFQzRcbiAgbGV0IHRvcEFydGljbGVJdGVtczogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10gPSBbXTtcblxuICAvLyAxLlx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NUU3NFx1NEVGRFx1NzZFRVx1NUY1NVxuICBzeW5jKGBkb2NzLyR7cGF0aH0vKmAsIHtcbiAgICBvbmx5RGlyZWN0b3JpZXM6IHRydWUsXG4gICAgb2JqZWN0TW9kZTogdHJ1ZSxcbiAgfSkuZm9yRWFjaCgoeyBuYW1lIH0pID0+IHtcbiAgICBsZXQgeWVhciA9IG5hbWU7XG4gICAgLy8gXHU1RTc0XHU0RUZEXHU2NTcwXHU3RUM0XG4gICAgbGV0IGFydGljbGVJdGVtczogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10gPSBbXTtcblxuICAgICAgICAvLyBcdTgzQjdcdTUzRDZcdTY1RTVcdTY3MUZcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTYyNDBcdTY3MDlcdTY1ODdcdTdBRTBcbiAgICAgICAgc3luYyhgZG9jcy8ke3BhdGh9LyR7eWVhcn0vKmAsIHtcbiAgICAgICAgICBvbmx5RmlsZXM6IHRydWUsXG4gICAgICAgICAgb2JqZWN0TW9kZTogdHJ1ZSxcbiAgICAgICAgfSkuZm9yRWFjaCgoYXJ0aWNsZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFydGljbGVGaWxlID0gbWF0dGVyLnJlYWQoYCR7YXJ0aWNsZS5wYXRofWApO1xuICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXJ0aWNsZUZpbGU7XG4gICAgICAgICAgaWYgKGRhdGEuaXNUb3ApIHtcbiAgICAgICAgICAgIC8vIFx1NTQxMVx1N0Y2RVx1OTg3Nlx1NTIwNlx1N0VDNFx1NTI0RFx1OEZGRFx1NTJBMFx1NjgwN1x1OTg5OFxuICAgICAgICAgICAgdG9wQXJ0aWNsZUl0ZW1zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICB0ZXh0OiBkYXRhLnRpdGxlLFxuICAgICAgICAgICAgICBsaW5rOiBgLyR7cGF0aH0vJHt5ZWFyfS8ke2FydGljbGUubmFtZS5yZXBsYWNlKCcubWQnLCAnJyl9YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTQxMVx1NUU3NFx1NEVGRFx1NTIwNlx1N0VDNFx1NTI0RFx1OEZGRFx1NTJBMFx1NjgwN1x1OTg5OFxuICAgICAgICAgIGFydGljbGVJdGVtcy51bnNoaWZ0KHtcbiAgICAgICAgICAgIHRleHQ6IGRhdGEudGl0bGUsXG4gICAgICAgICAgICBsaW5rOiBgLyR7cGF0aH0vJHt5ZWFyfS8ke2FydGljbGUubmFtZS5yZXBsYWNlKCcubWQnLCAnJyl9YCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NUU3NFx1NEVGRFx1NTIwNlx1N0VDNFxuICAgIHllYXJHcm91cHMudW5zaGlmdCh7XG4gICAgICB0ZXh0OiBgPGltZyBjbGFzcz1cImNoaW5lc2Utem9kaWFjXCIgc3R5bGU9XCJwb3NpdGlvbjogc3RhdGljOyB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyBwYWRkaW5nLWJvdHRvbTogM3B4O1wiIHNyYz1cIi9pbWcvc3ZnL2NoaW5lc2Utem9kaWFjLyR7Z2V0Q2hpbmVzZVpvZGlhYyh5ZWFyLnJlcGxhY2UoJ1x1NUU3NCcsICcnKSl9LnN2Z1wiIHRpdGxlPVwiJHtnZXRDaGluZXNlWm9kaWFjQWxpYXMoeWVhci5yZXBsYWNlKCdcdTVFNzQnLCAnJykpfVwiIGFsdD1cIlx1NzUxRlx1ODA5NlwiPlxuICAgICAgICAgICAgJHt5ZWFyfVx1NUU3NCAoJHthcnRpY2xlSXRlbXMubGVuZ3RofVx1N0JDNylgLFxuICAgICAgaXRlbXM6IGFydGljbGVJdGVtcyxcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgfSk7XG4gIH0pXG5cbiAgaWYgKHRvcEFydGljbGVJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgLy8gXHU2REZCXHU1MkEwXHU3RjZFXHU5ODc2XHU1MjA2XHU3RUM0XG4gICAgeWVhckdyb3Vwcy51bnNoaWZ0KHtcbiAgICAgIHRleHQ6IGA8c3ZnIHN0eWxlPVwiZGlzcGxheTogaW5saW5lLWJsb2NrOyB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyBwYWRkaW5nLWJvdHRvbTogM3B4O1wiIHZpZXdCb3g9XCIwIDAgMTkyMCAxMDI0XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjMwXCIgaGVpZ2h0PVwiMzBcIj48cGF0aCBkPVwiTTM2Ny40ODggNjY3LjkwNGg0MjMuNzQ0djQ3LjIzMkgzNjcuNDg4di00Ny4yMzJ6TTMyMC4yNTYgMjA0LjM1MmgxMzcuMjh2NjguOTkyaC0xMzcuMjh2LTY4Ljk5MnpNMzY3LjQ4OCA3NTQuMTEyaDQyMy43NDR2NDhIMzY3LjQ4OHYtNDh6TTY5My43NiAyMDQuMzUyaDEzNy45ODR2NjguOTkySDY5My43NnYtNjguOTkyek01MDcuMDA4IDIwNC4zNTJoMTM3LjI4djY4Ljk5MmgtMTM3LjI4di02OC45OTJ6XCIgcC1pZD1cIjEwNzQ5XCIgZmlsbD1cIiNkODFlMDZcIj48L3BhdGg+PHBhdGggZD1cIk0xNzkyLjUxMiAwSDEyNy40ODhDNTcuNDcyIDAgMCA1Ny4xNTIgMCAxMjcuNjE2djc2OC43NjhDMCA5NjYuNzIgNTcuMDg4IDEwMjQgMTI3LjQ4OCAxMDI0aDE2NjUuMDg4YzY5Ljk1MiAwIDEyNy40MjQtNTcuMTUyIDEyNy40MjQtMTI3LjYxNlYxMjcuNjE2QzE5MjAgNTcuMjE2IDE4NjIuOTEyIDAgMTc5Mi41MTIgMHogbS01MjggMTc1LjEwNGg0NDYuOTc2djU0LjAxNkgxNDk0LjcybC0yNCAxMDEuMjQ4aDIwNi45NzZWNjg5LjZoLTU3LjcyOFYzODQuMzJoLTI4OS40NzJ2MzA4LjIyNGgtNTcuNzI4di0zNjIuMjRoMTQwLjIyNGwyMC45OTItMTAxLjI0OGgtMTY5LjQ3MnYtNTMuOTUyeiBtLTk5Ni4wMzItMTEuMmg2MTQuMjcydjE2Ny4yMzJoLTUxLjAwOHYtMTcuMjhIMzIwLjI1NnYxNy4yOEgyNjguNDhWMTYzLjkwNHogbTY3OC43ODQgNjgxLjcyOGgtNzQ0di00My41MmgxMTEuNzQ0VjQ1NC44NDhoMjI5LjUwNHYtNDguNzA0SDIyMS4yNDh2LTQyLjA0OGgzMjMuMjY0di0zOS43NDRoNTQuMDE2djM5Ljc0NGgzMzEuNTJ2NDEuOTg0aC0zMzEuNTJ2NDguNzY4aDI0NS4yNDh2MzQ3LjI2NGgxMDMuNDg4djQzLjUyeiBtMjAzLjI2NC05NC41MjhjMCA1OS41Mi0zMC43MiA4OS4yOC05Mi4yMjQgODkuMjgtMjUuNDcyIDAtNDYuMDE2LTAuNTEyLTYxLjUwNC0xLjQ3Mi0yLjQ5Ni0yMi45NzYtNi41MjgtNDUuMjQ4LTEyLjAzMi02Ni43NTIgMjIuOTc2IDUuNTA0IDQ2LjcyIDguMjU2IDcxLjIzMiA4LjI1NiAyNCAwIDM1Ljk2OC0xMS41MiAzNS45NjgtMzQuNDk2VjI0Ny44NzJIOTcxLjJ2LTU0LjcyaDI3OC45NzZ2NTQuNzJIMTE1MC40djUwMy4yMzJ6IG01MjEuMjE2IDEyMS41MzZjLTY3LjAwOC01NS40ODgtMTM3LjI4LTEwOC4wMzItMjEwLjc1Mi0xNTcuNTA0LTQuOTkyIDkuOTg0LTEwLjQ5NiAxOS4wMDgtMTYuNTEyIDI3LjAwOC00MS40NzIgNTcuMDI0LTExMy4yOCAxMDEuNTA0LTIxNS4yMzIgMTMzLjUwNC05LjQ3Mi0xNi41MTItMjEuNTA0LTM0LjQ5Ni0zNS45NjgtNTQuMDE2IDk0LjUyOC0yNy4wMDggMTYxLjI4LTY0LjUxMiAyMDAuMjU2LTExMi41MTIgMzQuNDk2LTQ0Ljk5MiA1MS43NzYtMTEzLjAyNCA1MS43NzYtMjA0LjAzMlY0MjEuMTJoNTcuNzI4djgyLjQ5NmMwIDYyLjUyOC02LjcyIDExNS43NzYtMjAuMjI0IDE1OS43NDQgODQuNDggNTQuMDE2IDE2MS40NzIgMTA3LjAwOCAyMzAuOTc2IDE1OC45NzZsLTQyLjA0OCA1MC4zMDR6XCIgcC1pZD1cIjEwNzUwXCIgZmlsbD1cIiNkODFlMDZcIj48L3BhdGg+PHBhdGggZD1cIk0zNjcuNDg4IDQ5NS4zNmg0MjMuNzQ0djQ3LjIzMkgzNjcuNDg4VjQ5NS4zNnpNMzY3LjQ4OCA1ODEuNjMyaDQyMy43NDR2NDcuMjMySDM2Ny40ODh2LTQ3LjIzMnpcIiBwLWlkPVwiMTA3NTFcIiBmaWxsPVwiI2Q4MWUwNlwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgIFx1NjIxMVx1NzY4NFx1N0Y2RVx1OTg3NiAoJHt0b3BBcnRpY2xlSXRlbXMubGVuZ3RofVx1N0JDNylgLFxuICAgICAgaXRlbXM6IHRvcEFydGljbGVJdGVtcyxcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgfSk7XG4gIH1cbiAgLy8gXHU2REZCXHU1MkEwXHU1RThGXHU1M0Y3XG4gIGFkZE9yZGVyTnVtYmVyKHllYXJHcm91cHMpO1xuICByZXR1cm4geWVhckdyb3Vwcztcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkUgXHU2N0QwXHU1QzBGXHU4QkZFL1x1NUU4Rlx1NTNGNy1cdTUyMDZcdTdFQzQvXHU1RThGXHU1M0Y3LXh4eC5tZCBcdTc2ODRcdTc2RUVcdTVGNTVcdTY4M0NcdTVGMEYsIFx1ODNCN1x1NTNENlx1NEZBN1x1OEZCOVx1NjgwRlx1NTIwNlx1N0VDNFx1NTNDQVx1NTIwNlx1N0VDNFx1NEUwQlx1NjgwN1x1OTg5OFxuICpcbiAqIGNvdXJzZXMvbXliYXRpcy8wMS1NeUJhdGlzXHU1N0ZBXHU3ODQwLzAxLXh4eC5tZFxuICpcbiAqIEBwYXJhbSBwYXRoIFx1NjI2Qlx1NjNDRlx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFxuICogQHJldHVybnMge0RlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdfVxuICovXG5mdW5jdGlvbiBnZXRJdGVtcyAocGF0aDogc3RyaW5nKSB7XG4gIC8vIFx1NEZBN1x1OEZCOVx1NjgwRlx1NTIwNlx1N0VDNFx1NjU3MFx1N0VDNFxuICBsZXQgZ3JvdXBzOiBEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXSA9IFtdO1xuICAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTUyMDZcdTdFQzRcdTRFMEJcdTY4MDdcdTk4OThcdTY1NzBcdTdFQzRcbiAgbGV0IGl0ZW1zOiBEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXSA9IFtdO1xuICBsZXQgdG90YWwgPSAwO1xuICAvLyBcdTVGNTNcdTUyMDZcdTdFQzRcdTUxODVcdTY1ODdcdTdBRTBcdTY1NzBcdTkxQ0ZcdTVDMTFcdTRFOEUgMiBcdTdCQzdcdTYyMTZcdTY1ODdcdTdBRTBcdTYwM0JcdTY1NzBcdTY2M0VcdTc5M0FcdThEODVcdThGQzcgMjAgXHU3QkM3XHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU2Mjk4XHU1M0UwXHU1MjA2XHU3RUM0XG4gIGNvbnN0IGdyb3VwQ29sbGFwc2VkU2l6ZSA9IDI7XG4gIGNvbnN0IHRpdGxlQ29sbGFwc2VkU2l6ZSA9IDIwO1xuXG4gIC8vIDEuXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XG4gIHN5bmMoYGRvY3MvJHtwYXRofS8qYCwge1xuICAgIG9ubHlEaXJlY3RvcmllczogdHJ1ZSxcbiAgICBvYmplY3RNb2RlOiB0cnVlLFxuICB9KS5mb3JFYWNoKCh7IG5hbWUgfSkgPT4ge1xuICAgIGxldCBncm91cE5hbWUgPSBuYW1lO1xuICAgIC8vIDIuXHU4M0I3XHU1M0Q2XHU1MjA2XHU3RUM0XHU0RTBCXHU3Njg0XHU2MjQwXHU2NzA5XHU2NTg3XHU3QUUwXG4gICAgc3luYyhgZG9jcy8ke3BhdGh9LyR7Z3JvdXBOYW1lfS8qYCwge1xuICAgICAgb25seUZpbGVzOiB0cnVlLFxuICAgICAgb2JqZWN0TW9kZTogdHJ1ZSxcbiAgICB9KS5mb3JFYWNoKChhcnRpY2xlKSA9PiB7XG4gICAgICBjb25zdCBhcnRpY2xlRmlsZSA9IG1hdHRlci5yZWFkKGAke2FydGljbGUucGF0aH1gKTtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXJ0aWNsZUZpbGU7XG4gICAgICAvLyBcdTU0MTFcdTUyNERcdThGRkRcdTUyQTBcdTY4MDdcdTk4OThcbiAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICB0ZXh0OiBkYXRhLnRpdGxlLFxuICAgICAgICBsaW5rOiBgLyR7cGF0aH0vJHtncm91cE5hbWV9LyR7YXJ0aWNsZS5uYW1lLnJlcGxhY2UoJy5tZCcsICcnKX1gLFxuICAgICAgfSk7XG4gICAgICB0b3RhbCArPSAxO1xuICAgIH0pXG5cbiAgICAvLyAzLlx1NTQxMVx1NTI0RFx1OEZGRFx1NTJBMFx1NTIzMFx1NTIwNlx1N0VDNFxuICAgIC8vIFx1NUY1M1x1NTIwNlx1N0VDNFx1NTE4NVx1NjU4N1x1N0FFMFx1NjU3MFx1OTFDRlx1NUMxMVx1NEU4RSBBIFx1N0JDN1x1NjIxNlx1NjU4N1x1N0FFMFx1NjAzQlx1NjU3MFx1NjYzRVx1NzkzQVx1OEQ4NVx1OEZDNyBCIFx1N0JDN1x1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NjI5OFx1NTNFMFx1NTIwNlx1N0VDNFxuICAgIGdyb3Vwcy5wdXNoKHtcbiAgICAgIHRleHQ6IGAke2dyb3VwTmFtZS5zdWJzdHJpbmcoZ3JvdXBOYW1lLmluZGV4T2YoJy0nKSArIDEpfSAoJHtpdGVtcy5sZW5ndGh9XHU3QkM3KWAsXG4gICAgICBpdGVtczogaXRlbXMsXG4gICAgICBjb2xsYXBzZWQ6IGl0ZW1zLmxlbmd0aCA8IGdyb3VwQ29sbGFwc2VkU2l6ZSB8fCB0b3RhbCA+IHRpdGxlQ29sbGFwc2VkU2l6ZSxcbiAgICB9KVxuXG4gICAgLy8gNC5cdTZFMDVcdTdBN0FcdTRGQTdcdThGQjlcdTY4MEZcdTUyMDZcdTdFQzRcdTRFMEJcdTY4MDdcdTk4OThcdTY1NzBcdTdFQzRcbiAgICBpdGVtcyA9IFtdO1xuICB9KVxuXG4gIC8vIFx1NkRGQlx1NTJBMFx1NUU4Rlx1NTNGN1xuICBhZGRPcmRlck51bWJlcihncm91cHMpO1xuICByZXR1cm4gZ3JvdXBzO1xufVxuXG4vKipcbiAqIFx1NkRGQlx1NTJBMFx1NUU4Rlx1NTNGN1xuICogXG4gKiBAcGFyYW0gZ3JvdXBzIFx1NTIwNlx1N0VDNFx1NjU3MFx1NjM2RVxuICovXG5mdW5jdGlvbiBhZGRPcmRlck51bWJlcihncm91cHMpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGdyb3Vwc1tpXS5pdGVtcy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgaXRlbXMgPSBncm91cHNbaV0uaXRlbXM7XG4gICAgICBjb25zdCBpbmRleCA9IGogKyAxO1xuICAgICAgbGV0IGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3ItZ3JheSBtci1bNnB4XVwiIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDU1MDsgZGlzcGxheTogaW5saW5lLWJsb2NrO1wiPiR7aW5kZXh9PC9kaXY+YDtcbiAgICAgIGlmIChpbmRleCA9PSAxKSB7XG4gICAgICAgIGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3ItcmVkIG1yLVs2cHhdXCIgc3R5bGU9XCJmb250LXdlaWdodDogNTUwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+JHtpbmRleH08L2Rpdj5gO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSAyKSB7XG4gICAgICAgIGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3Itb3JhbmdlIG1yLVs2cHhdXCIgc3R5bGU9XCJmb250LXdlaWdodDogNTUwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+JHtpbmRleH08L2Rpdj5gO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSAzKSB7XG4gICAgICAgIGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3IteWVsbG93IG1yLVs2cHhdXCIgc3R5bGU9XCJmb250LXdlaWdodDogNTUwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+JHtpbmRleH08L2Rpdj5gO1xuICAgICAgfVxuICAgICAgaXRlbXNbal0udGV4dCA9IGAke2luZGV4U3R5bGV9JHtpdGVtc1tqXS50ZXh0fWA7XG4gICAgfVxuICB9XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvdGhlbWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy90aGVtZS91dGlscy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvdGhlbWUvdXRpbHMudHNcIjsvKipcbiAqIFx1NjgzQ1x1NUYwRlx1NTMxNlx1NjVGNlx1OTVGNFxuICpcbiAqIEBwYXJhbSBkYXRlIFx1NUY4NVx1NjgzQ1x1NUYwRlx1NTMxNlx1NjVGNlx1OTVGNFxuICogQHJldHVybnMgXHU2ODNDXHU1RjBGXHU1MzE2XHU1NDBFXHU3Njg0XHU2NUY2XHU5NUY0KFlZWVkvTU0vZGQgQU0gaGg6bW0pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlKGRhdGUpIHtcbiAgY29uc3QgZm9ybWF0RGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuICByZXR1cm4gZm9ybWF0RGF0ZS50b0xvY2FsZVN0cmluZygnemgnLCB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJywgaG91cjogJ251bWVyaWMnLCBtaW51dGU6ICdudW1lcmljJ30pO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBVUkwgXHU4REVGXHU1Rjg0XHU0RTJEXHU3Njg0XHU2MzA3XHU1QjlBXHU1M0MyXHU2NTcwXG4gKlxuICogQHBhcmFtIHBhcmFtTmFtZSBcdTUzQzJcdTY1NzBcdTU0MERcbiAqIEByZXR1cm5zIFx1NTNDMlx1NjU3MFx1NTAzQ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UXVlcnlQYXJhbShwYXJhbU5hbWUpIHtcbiAgY29uc3QgcmVnID0gbmV3IFJlZ0V4cChcIihefCYpXCIrIHBhcmFtTmFtZSArXCI9KFteJl0qKSgmfCQpXCIpO1xuICBsZXQgdmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkpLm1hdGNoKHJlZyk7XG4gIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZXNjYXBlKHZhbHVlWzJdKTtcbiAgfSBcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogXHU4REYzXHU4RjZDXHU1MjMwXHU2MzA3XHU1QjlBXHU5NEZFXHU2M0E1XG4gKlxuICogQHBhcmFtIHBhcmFtTmFtZSBcdTUzQzJcdTY1NzBcdTU0MERcbiAqIEBwYXJhbSBwYXJhbVZhbHVlIFx1NTNDMlx1NjU3MFx1NTAzQ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ29Ub0xpbmsodXJsLCBwYXJhbU5hbWUsIHBhcmFtVmFsdWUpIHtcbiAgaWYgKHBhcmFtTmFtZSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsICsgJz8nICsgcGFyYW1OYW1lICsgJz0nICsgcGFyYW1WYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NzUxRlx1ODA5Nlx1NTZGRVx1NjgwN1xuICpcbiAqIEBwYXJhbSB5ZWFyIFx1NUU3NFx1NEVGRFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hpbmVzZVpvZGlhYyh5ZWFyKSB7XG4gIGNvbnN0IGFyciA9IFsnbW9ua2V5JywgJ3Jvb3N0ZXInLCAnZG9nJywgJ3BpZycsICdyYXQnLCAnb3gnLCAndGlnZXInLCAncmFiYml0JywgJ2RyYWdvbicsICdzbmFrZScsICdob3JzZScsICdnb2F0J107XG4gIHJldHVybiBhcnJbeWVhciAlIDEyXTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTc1MUZcdTgwOTZcdTU0MERcdTc5RjBcbiAqXG4gKiBAcGFyYW0geWVhciBcdTVFNzRcdTRFRkRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENoaW5lc2Vab2RpYWNBbGlhcyh5ZWFyKSB7XG4gIGNvbnN0IGFyciA9IFsnXHU3MzM0XHU1RTc0JywgJ1x1OUUyMVx1NUU3NCcsICdcdTcyRDdcdTVFNzQnLCAnXHU3MzJBXHU1RTc0JywgJ1x1OUYyMFx1NUU3NCcsICdcdTcyNUJcdTVFNzQnLCAnXHU4NjRFXHU1RTc0JywgJ1x1NTE1NFx1NUU3NCcsICdcdTlGOTlcdTVFNzQnLCAnXHU4NkM3XHU1RTc0JywgJ1x1OUE2Q1x1NUU3NCcsICdcdTdGOEFcdTVFNzQnXTtcbiAgcmV0dXJuIGFyclt5ZWFyICUgMTJdO1xufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL0k1NzYzNzUvQ29kZS93ZWJzaXRlL2NyNzI1OC5naXRodWIuaW8vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9zZWFyY2hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvc2VhcmNoL2xvY2FsLXNlYXJjaC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3NlYXJjaC9sb2NhbC1zZWFyY2gudHNcIjtpbXBvcnQgdHlwZSB7IExvY2FsU2VhcmNoT3B0aW9ucyB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5cbmV4cG9ydCBjb25zdCBsb2NhbFNlYXJjaE9wdGlvbnM6IExvY2FsU2VhcmNoT3B0aW9ucyA9IHtcbiAgbG9jYWxlczoge1xuICAgIHJvb3Q6IHtcbiAgICAgIHRyYW5zbGF0aW9uczoge1xuICAgICAgICBidXR0b246IHtcbiAgICAgICAgICBidXR0b25UZXh0OiAnXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzJyxcbiAgICAgICAgICBidXR0b25BcmlhTGFiZWw6ICdcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjMnXG4gICAgICAgIH0sXG4gICAgICAgIG1vZGFsOiB7XG4gICAgICAgICAgbm9SZXN1bHRzVGV4dDogJ1x1NjVFMFx1NkNENVx1NjI3RVx1NTIzMFx1NzZGOFx1NTE3M1x1N0VEM1x1Njc5QycsXG4gICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgICAgZm9vdGVyOiB7XG4gICAgICAgICAgICBzZWxlY3RUZXh0OiAnXHU5MDA5XHU2MkU5JyxcbiAgICAgICAgICAgIG5hdmlnYXRlVGV4dDogJ1x1NTIwN1x1NjM2MidcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvSTU3NjM3NS9Db2RlL3dlYnNpdGUvY3I3MjU4LmdpdGh1Yi5pby9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3RoZW1lLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9JNTc2Mzc1L0NvZGUvd2Vic2l0ZS9jcjcyNTguZ2l0aHViLmlvL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvdGhlbWUudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5pbXBvcnQgeyBuYXYgfSBmcm9tICcuL25hdic7XG5pbXBvcnQgeyBzaWRlYmFyIH0gZnJvbSAnLi9zaWRlYmFyJztcbmltcG9ydCB7IGFsZ29saWFTZWFyY2hPcHRpb25zIH0gZnJvbSAnLi9zZWFyY2gvYWxnb2xpYS1zZWFyY2gnO1xuaW1wb3J0IHsgbG9jYWxTZWFyY2hPcHRpb25zIH0gZnJvbSAnLi9zZWFyY2gvbG9jYWwtc2VhcmNoJztcblxuZXhwb3J0IGNvbnN0IHRoZW1lQ29uZmlnOiBEZWZhdWx0VGhlbWUuQ29uZmlnID0ge1xuICBuYXYsIC8vIFx1NUJGQ1x1ODIyQVx1NjgwRlx1OTE0RFx1N0Y2RVxuICBzaWRlYmFyLCAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTkxNERcdTdGNkVcblxuICBsb2dvOiAnL2xvZ28ucG5nJyxcbiAgb3V0bGluZToge1xuICAgIGxldmVsOiAnZGVlcCcsIC8vIFx1NTNGM1x1NEZBN1x1NTkyN1x1N0VCMlx1NjgwN1x1OTg5OFx1NUM0Mlx1N0VBN1xuICAgIGxhYmVsOiAnXHU3NkVFXHU1RjU1JywgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU2NTg3XHU2NzJDXHU5MTREXHU3RjZFXG4gIH0sXG4gIGRhcmtNb2RlU3dpdGNoTGFiZWw6ICdcdTUyMDdcdTYzNjJcdTY1RTVcdTUxNDkvXHU2Njk3XHU5RUQxXHU2QTIxXHU1RjBGJyxcbiAgc2lkZWJhck1lbnVMYWJlbDogJ1x1NjU4N1x1N0FFMCcsXG4gIHJldHVyblRvVG9wTGFiZWw6ICdcdThGRDRcdTU2REVcdTk4NzZcdTkwRTgnLFxuICBsYXN0VXBkYXRlZFRleHQ6ICdcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjAnLCAvLyBcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjBcdTY1RjZcdTk1RjRcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkUsIFx1OTcwMFx1NTE0OFx1OTE0RFx1N0Y2RWxhc3RVcGRhdGVkXHU0RTNBdHJ1ZVxuICAvLyBcdTY1ODdcdTY4NjNcdTk4NzVcdTgxMUFcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcbiAgZG9jRm9vdGVyOiB7XG4gICAgcHJldjogJ1x1NEUwQVx1NEUwMFx1N0JDNycsXG4gICAgbmV4dDogJ1x1NEUwQlx1NEUwMFx1N0JDNydcbiAgfSxcbiAgLy8gXHU3RjE2XHU4RjkxXHU5NEZFXHU2M0E1XHU5MTREXHU3RjZFXG4gIGVkaXRMaW5rOiB7XG4gICAgcGF0dGVybjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9jcjcyNTgvY3I3MjU4LmdpdGh1Yi5pby9lZGl0L21haW4vZG9jcy86cGF0aCcsXG4gICAgdGV4dDogJ1x1NEUwRFx1NTlBNVx1NEU0Qlx1NTkwNFx1RkYwQ1x1NjU2Q1x1OEJGN1x1OTZDNVx1NkI2MydcbiAgfSxcbiAgLy8gXHU2NDFDXHU3RDIyXHU5MTREXHU3RjZFXHVGRjA4XHU0RThDXHU5MDA5XHU0RTAwXHVGRjA5XG4gIHNlYXJjaDoge1xuICAgIC8vIHByb3ZpZGVyOiAnYWxnb2xpYScsXG4gICAgLy8gb3B0aW9uczogYWxnb2xpYVNlYXJjaE9wdGlvbnMsXG4gICAgLy8gXHU2NzJDXHU1NzMwXHU3OUJCXHU3RUJGXHU2NDFDXHU3RDIyXG4gICAgcHJvdmlkZXI6ICdsb2NhbCcsXG4gICAgb3B0aW9uczogbG9jYWxTZWFyY2hPcHRpb25zXG4gIH0sXG4gIC8vIFx1NUJGQ1x1ODIyQVx1NjgwRlx1NTNGM1x1NEZBN1x1NzkzRVx1NEVBNFx1OTRGRVx1NjNBNVx1OTE0RFx1N0Y2RVxuICBzb2NpYWxMaW5rczogW1xuICAgIHsgaWNvbjogJ2dpdGh1YicsIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vY3I3MjU4L2NyNzI1OC5naXRodWIuaW8nIH0sXG4gIF0sXG5cbiAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2MjY5XHU1QzU1OiBcdTY1ODdcdTdBRTBcdTUxNDNcdTY1NzBcdTYzNkVcdTkxNERcdTdGNkVcbiAgLy8gQHRzLWlnbm9yZVxuICBhcnRpY2xlTWV0YWRhdGFDb25maWc6IHtcbiAgICBhdXRob3I6ICdTZTdlbicsIC8vIFx1NjU4N1x1N0FFMFx1NTE2OFx1NUM0MFx1OUVEOFx1OEJBNFx1NEY1Q1x1ODAwNVx1NTQwRFx1NzlGMFxuICAgIGF1dGhvckxpbms6ICcvYWJvdXQvbWUnLCAvLyBcdTcwQjlcdTUxRkJcdTRGNUNcdTgwMDVcdTU0MERcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGNkNcdTc2ODRcdTk0RkVcdTYzQTVcbiAgICBzaG93Vmlld0NvdW50OiBmYWxzZSwgLy8gXHU2NjJGXHU1NDI2XHU2NjNFXHU3OTNBXHU2NTg3XHU3QUUwXHU5NjA1XHU4QkZCXHU2NTcwLCBcdTk3MDBcdTg5ODFcdTU3MjggZG9jcy8udml0ZXByZXNzL3RoZW1lL2FwaS9jb25maWcuanMgXHU1M0NBIGludGVyZmFjZS5qcyBcdTkxNERcdTdGNkVcdTU5N0RcdTc2RjhcdTVFOTQgQVBJIFx1NjNBNVx1NTNFM1xuICB9LFxuICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYyNjlcdTVDNTU6IFx1NjU4N1x1N0FFMFx1NzI0OFx1Njc0M1x1OTE0RFx1N0Y2RVxuICBjb3B5cmlnaHRDb25maWc6IHtcbiAgICBsaWNlbnNlOiAnXHU3RjcyXHU1NDBELVx1NzZGOFx1NTQwQ1x1NjVCOVx1NUYwRlx1NTE3MVx1NEVBQiA0LjAgXHU1NkZEXHU5NjQ1IChDQyBCWS1TQSA0LjApJyxcbiAgICBsaWNlbnNlTGluazogJ2h0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzQuMC8nXG4gIH0sXG4gIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjI2OVx1NUM1NTogXHU4QkM0XHU4QkJBXHU5MTREXHU3RjZFXG4gIGNvbW1lbnRDb25maWc6IHtcbiAgICB0eXBlOiAnZ2l0YWxrJyxcbiAgICBzaG93Q29tbWVudDogdHJ1ZSAvLyBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdThCQzRcdThCQkFcbiAgfSxcbiAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2MjY5XHU1QzU1OiBcdTk4NzVcdTgxMUFcdTkxNERcdTdGNkVcbiAgZm9vdGVyQ29uZmlnOiB7XG4gICAgc2hvd0Zvb3RlcjogdHJ1ZSwgLy8gXHU2NjJGXHU1NDI2XHU2NjNFXHU3OTNBXHU5ODc1XHU4MTFBXG4gICAgY29weXJpZ2h0OiBgQ29weXJpZ2h0IFx1MDBBOSAyMDIzLSR7bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSBTZTdlbmAgLy8gXHU3MjQ4XHU2NzQzXHU0RkUxXHU2MDZGXG4gIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRWLFNBQVMsb0JBQW9CO0FBQ3pYLFNBQVMsbUJBQW1COzs7QUNEMlYsSUFBTSxPQUFPO0FBRTdYLElBQU0sV0FBVztBQUFBLEVBQ3RCLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFBQSxFQUNQLGFBQWE7QUFBQSxFQUNiO0FBQUEsRUFDQSxPQUFPLEdBQUcsSUFBSTtBQUNoQjs7O0FDTk8sSUFBTSxPQUFxQjtBQUFBLEVBQ2hDLENBQUMsUUFBUSxFQUFFLEtBQUssUUFBUSxNQUFNLGVBQWUsQ0FBQztBQUFBLEVBQzlDLENBQUMsUUFBUSxFQUFFLE1BQU0sVUFBVSxTQUFTLFFBQVEsQ0FBQztBQUFBLEVBQzdDLENBQUMsUUFBUSxFQUFFLE1BQU0sWUFBWSxTQUFTLCtFQUE2QixDQUFDO0FBQUEsRUFFcEUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN0RCxDQUFDLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixTQUFTLE1BQU0sQ0FBQztBQUFBLEVBQ3BELENBQUMsUUFBUSxFQUFFLE1BQU0sZUFBZSxTQUFTLFVBQVUsQ0FBQztBQUFBLEVBRXBE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QSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
