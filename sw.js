/* 嘉Jaykou动效工作台 · Service Worker  v3
   策略：HTML/导航 → 网络优先（新版立刻生效，断网回退缓存）
        静态资源 → 缓存优先 + 后台静默更新（stale-while-revalidate）
   缓存版本变更时，旧缓存整体清除。

   ⚠️ v2 的致命 bug：`fetch(req).then(put)` 会把 Response 当成 put 的第一个
   参数（req），真正的 res 变成 undefined，put 一路 return undefined →
   respondWith(undefined) → 所有导航请求 ERR_FAILED，回访用户刷新即白屏。
   v3 全部改为显式 `function (res) { return put(req, res); }`，并保证任何
   分支都返回一个真实 Response。 */

var CACHE = 'jaykou-motion-v3';
var CORE = [
  './',
  './index.html',
  './guide.html',
  './manifest.json',
  './assets/css/app.css',
  './assets/js/bundle.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/og.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        /* 逐个 add，单个失败不影响整体安装 */
        return Promise.all(CORE.map(function (u) {
          return c.add(u).catch(function () {});
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* 安全写缓存：只缓存成功的同源基础响应，永不抛错，始终返回原响应 */
function put(req, res) {
  try {
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CACHE)
        .then(function (c) { return c.put(req, copy); })
        .catch(function () {});
    }
  } catch (err) { /* 忽略：缓存失败绝不影响响应 */ }
  return res;
}

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).catch(function () { return null; });
}

/* 导航/HTML：网络优先 → 失败回退缓存 → 再失败才把网络错误交回浏览器 */
function networkFirst(req) {
  return fetch(req)
    .then(function (res) { return put(req, res); })
    .catch(function () {
      return fromCache(req).then(function (hit) {
        return hit || caches.match('./index.html');
      }).then(function (hit) {
        return hit || caches.match('./');
      });
    });
}

/* 静态资源：缓存优先，同时后台拉新版本写回 */
function cacheFirst(req) {
  return fromCache(req).then(function (hit) {
    var net = fetch(req)
      .then(function (res) { return put(req, res); })
      .catch(function () { return hit || null; });
    return hit || net;
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== location.origin) return;
  /* 不拦截 SW 脚本自身，避免更新链路被缓存劫持 */
  if (/\/(sw\.js|tools\/.*)$/.test(url.pathname)) return;

  var isDoc = req.mode === 'navigate' || req.destination === 'document' ||
              /\.html?$/.test(url.pathname) || url.pathname === '/';

  var work = isDoc ? networkFirst(req) : cacheFirst(req);

  e.respondWith(
    work.then(function (res) {
      /* 兜底：任何情况下都必须返回一个真实 Response */
      return res || fetch(req);
    }).catch(function () {
      return fetch(req).catch(function () {
        return caches.match('./index.html').then(function (hit) {
          return hit || Response.error();
        });
      });
    })
  );
});
