English | [中文](./README.md)

# Charles's Repositories

<a href="http://creativecommons.org/licenses/by-sa/4.0/" target="_blank">
    <img src="https://img.shields.io/badge/Post%20License-CC%204.0%20BY--SA-blue.svg">
</a>
<a href="https://github.com/cr7258/cr7258.github.io/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/Code%20License-MIT-blue.svg">
</a>
<a href="https://github.com/cr7258/cr7258.github.io/actions/workflows/deploy-pages.yml" target="_blank">
    <img src="https://github.com/cr7258/cr7258.github.io/actions/workflows/deploy-pages.yml/badge.svg">
</a>


📝 **This is the Se7en's personal technology knowledge repositories website.** 

```bash
# 1. Clone this repository
git clone https://github.com/cr7258/cr7258.github.io.git
# 2. Install PNPM
npm install pnpm -g
# 3. Install dependencies
pnpm install
# 4. Run dev server, visit: http://localhost:5173
pnpm dev
# 5. Build, files will be stored in: docs/.vitepress/dist
# If deploying to GitHub Pages, you can use GitHub Actions to automatically deploy and build after pushing to GitHub
# See: .github/workflows/deploy-pages.yml, modify the workflow configuration according to your needs
pnpm build
# 6. Deploy
# 6.1 Push to GitHub repository, deploy to GitHub Pages: need to enable GitHub Pages in repository settings (this repository uses this deployment method)
# 6.2 Deploy on other platforms, such as: Gitee Pages, Vercel, Netlify, personal virtual hosting, personal servers, etc.
```