# 在 Mac 上运行 MOTIONFORGE

纯静态项目，无 node_modules、无构建步骤，拷过去就能跑。

## 最快方式

双击 `start.command` → 浏览器自动打开 <http://127.0.0.1:8899/>

首次双击若提示「无法打开，因为无法验证开发者」：右键点 `start.command` → 打开 → 再点「打开」。
若仍不行，在终端执行一次：

```bash
chmod +x start.command
./start.command
```

## 手动方式

```bash
cd motionforge
python3 -m http.server 8899
# 浏览器访问 http://127.0.0.1:8899/
```

## 说明

- **建议用本地服务打开**，不要直接双击 `index.html`：`file://` 下 Service Worker、PWA 离线缓存、部分导出功能会失效。
- `index.html` 是主入口；`嘉Jaykou动效库.html` 是构建脚本生成的同名副本，改的话改 `index.html`。
- 动效改 `assets/js/effects-*.js` 后，需要重新合并 bundle：

  ```bash
  python3 tools/build-bundle.py
  ```

  然后刷新页面（必要时在 URL 后加 `?v=` 版本号绕过缓存）。
- 如果页面样式/脚本像是旧的：硬刷新（Cmd+Shift+R），或删掉 PWA 缓存（浏览器开发者工具 → Application → Storage → Clear site data）。
- 项目原本就托管在 GitHub Pages，源码同源：<https://github.com/qq499797400-cpu/jaykou-motionforge>

## 目录

```
index.html              主页面
start.command           Mac 一键启动
assets/js/effects-*.js  动效定义（24 个批次文件）
assets/js/engine.js     渲染内核 MF.*
assets/js/studio.js     工作台 UI
assets/js/bundle.js     合并产物（页面实际加载）
assets/css/app.css      全部样式
screenshots/            README 配图
tools/build-bundle.py   bundle 构建脚本
```
