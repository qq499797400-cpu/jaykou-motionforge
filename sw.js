/* 嘉Jaykou动效工作台 · Service Worker
   策略：HTML/导航 → 网络优先（保证更新立刻生效，离线回退缓存）
        静态资源 → 缓存优先 + 后台静默更新（stale-while-revalidate）
   缓存版本号变更时，旧缓存整体清除 */
var CACHE = 'jaykou-motion-v2';
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
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function put(req, res) {
  if (res && res.status === 200 && res.type === 'basic') {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copy); });
  }
  return res;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;   /* 只管同源静态资源 */

  var isDoc = req.mode === 'navigate' || req.destination === 'document' ||
              /\.html?$/.test(url.pathname) || url.pathname === '/';

  if (isDoc) {
    /* 页面本身：网络优先，发新版别人立刻看到；断网时回退缓存 */
    e.respondWith(
      fetch(req).then(put).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* 静态资源：先给缓存（秒开），同时后台拉新版本写回缓存 */
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(put).catch(function () { return hit; });
      return hit || net;
    })
  );
});
