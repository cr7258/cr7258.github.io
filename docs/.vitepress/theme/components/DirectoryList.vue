<!-- 目录列表组件 -->
<template>
  <div class="directory-list">
    <div v-if="groups.length === 0" class="no-content">
      暂无内容
    </div>
    <div v-else v-for="(group, index) in groups" :key="index" class="directory-group">
      <h2 class="group-title">{{ cleanText(group.text) }}</h2>
      <div class="article-list">
        <a v-for="(item, itemIndex) in group.items" 
           :key="itemIndex" 
           :href="withBase(item.link)"
           class="article-card">
          {{ cleanText(item.text) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useData, withBase } from 'vitepress'

const route = useRoute()
const { site } = useData()
const groups = ref([])

// 清理文本内容，移除HTML标签和序号
const cleanText = (text: string) => {
  // 移除HTML标签
  let cleaned = text.replace(/<[^>]*>/g, '')
  
  // 移除各种形式的序号和标记
  cleaned = cleaned
    .replace(/^\d+\.\s*/, '')  // 移除开头的数字和点
    .replace(/\s*\(\d+篇\)$/, '')  // 移除末尾的计数
    .replace(/^<div[^>]*>\d+<\/div>\s*/, '')  // 移除开头的序号div
    .replace(/^\d+\s+/, '')  // 移除开头的纯数字
    .replace(/^第\d+章\s*/, '')  // 移除"第X章"
    .replace(/^[\d\.]+\s*/, '')  // 移除多级序号（如 1.1, 1.1.1）
    .replace(/^\d+、\s*/, '')  // 移除数字加顿号
    .replace(/^[①-⑩]\s*/, '')  // 移除圆圈数字
    .replace(/^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]\s*/, '')  // 移除罗马数字
    
  return cleaned.trim()
}

onMounted(() => {
  // 获取当前路径
  const currentPath = route.path
  
  // 从 sidebar 配置中获取当前路径的分组信息
  const sidebarConfig = site.value.themeConfig.sidebar
  const currentSidebar = Object.entries(sidebarConfig).find(([path]) => {
    return currentPath.startsWith(path)
  })
  
  if (currentSidebar) {
    groups.value = currentSidebar[1]
  }
})
</script>

<style scoped>
.directory-list {
  margin: 1.5rem 0;
}

.directory-group {
  margin-bottom: 2rem;
}

.group-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
  display: inline-block;
  line-height: 1.4;
}

.article-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  padding: 0;
}

.article-card {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(235, 245, 255, 0.5);
  border: 1px solid rgba(200, 220, 255, 0.3);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.3s ease;
  min-height: 40px;
  backdrop-filter: blur(4px);
}

.article-card:hover {
  color: var(--vp-c-brand);
  background: rgba(235, 245, 255, 0.7);
  border-color: rgba(200, 220, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(100, 150, 255, 0.1);
}

/* 暗色主题适配 */
:root.dark .article-card {
  background: rgba(30, 40, 60, 0.5);
  border-color: rgba(60, 80, 120, 0.3);
}

:root.dark .article-card:hover {
  background: rgba(35, 45, 65, 0.7);
  border-color: rgba(60, 80, 120, 0.5);
  box-shadow: 0 2px 8px rgba(0, 30, 60, 0.2);
}

.no-content {
  text-align: center;
  color: var(--vp-c-text-3);
  padding: 2rem 0;
}

@media (max-width: 640px) {
  .article-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .article-card {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
