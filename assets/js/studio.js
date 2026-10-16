/* ==========================================================================
   JAYKOU · 工作台逻辑
   动效库浏览 · 舞台播放 · 参数检查器 · 配色 · 导出与录制 · 场景序列
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  if (!MF.effects.length) {
    document.body.innerHTML = '<p style="padding:40px;font:600 14px system-ui">动效库加载失败，请检查 assets/js 下的脚本是否完整。</p>';
    return;
  }

  /* ══════════════════ 状态 ══════════════════ */
  var LS_KEY = 'motionforge.v1';
  var bootHash = location.hash;   /* 启动前的原始 hash：防止初始 selectEffect 的深链同步把它覆盖掉 */
  function loadLS() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; }
  }
  var saved = loadLS();

  var S = {
    settings: Object.assign({}, MF.defaultSettings, saved.settings || {}),
    favorites: new Set(saved.favorites || []),
    recent: saved.recent || [],
    theme: saved.theme || 'light',
    current: null,
    filter: { type: 'all', cat: null, sub: null, q: '', tag: null },
    sort: 'default',
    favTheme: saved.favTheme || 'dark',
    playing: true,
    t: 0,
    loop: true,
    mode: 'single',       /* single | sequence */
    scenes: saved.scenes || [],
    recording: false,
    recTarget: null,
    recStart: 0,
    browserOpen: true,
    promptMode: 'src',     /* 提示词模式：desc 描述版 / skel 骨架版 / src 源码版（可精确复刻） */
    hover: {}
  };

  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        settings: S.settings,
        favorites: Array.from(S.favorites),
        recent: S.recent.slice(0, 12),
        theme: S.theme,
        favTheme: S.favTheme,
        scenes: S.scenes
      }));
    } catch (e) { /* 忽略隐私模式下的写入失败 */ }
  }

  var cv = $('#cv');
  var ctx = cv.getContext('2d');
  var offA = document.createElement('canvas');
  var offB = document.createElement('canvas');
  var CF = 0.45;   /* 场景交叉淡化时长 */

  /* ══════════════════ 基础工具 ══════════════════ */
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._tid);
    el._tid = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function baseCfg(duration) {
    var r = MF.ratios[S.settings.ratio] || MF.ratios['16:9'];
    return {
      w: r.w, h: r.h,
      duration: duration || 6,
      accent: S.settings.accent,
      accent2: S.settings.accent2,
      ink: S.settings.ink,
      bg1: S.settings.bg1,
      bg2: S.settings.bg2,
      bgMode: S.settings.bgMode,
      seed: S.settings.seed
    };
  }

  function paintScene(dst, scene, t) {
    var eff = MF.byId[scene.id];
    if (!eff) return;
    var cfg = baseCfg(scene.duration);
    MF.paint(dst.getContext('2d'), eff, MF.resolveParams(eff, scene.params, S.settings), t, cfg);
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); },
        function () { fallbackCopy(text, okMsg); });
    } else fallbackCopy(text, okMsg);
  }
  function fallbackCopy(text, okMsg) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg); } catch (e) { toast('复制失败，请手动选择'); }
    ta.remove();
  }

  /* ══════════════════ 画布比例 ══════════════════ */
  function applyRatio() {
    var r = MF.ratios[S.settings.ratio] || MF.ratios['16:9'];
    [cv, offA, offB].forEach(function (c) { c.width = r.w; c.height = r.h; });
    document.documentElement.style.setProperty('--ratio', r.w + ' / ' + r.h);
    dimTicks();
    renderFrame();
  }

  /* ══════════════════ 渲染 ══════════════════ */
  function seqTotal() {
    return S.scenes.reduce(function (a, s) { return a + (s.duration || 6); }, 0);
  }

  function seqAt(t) {
    var acc = 0;
    for (var i = 0; i < S.scenes.length; i++) {
      var d = S.scenes[i].duration || 6;
      if (t < acc + d || i === S.scenes.length - 1) {
        return { i: i, local: Math.min(t - acc, d), dur: d, next: i + 1 < S.scenes.length ? i + 1 : null };
      }
      acc += d;
    }
    return null;
  }

  function renderFrame() {
    if (S.mode === 'sequence' && S.scenes.length) {
      var st = seqAt(S.t);
      if (!st) return;
      var cur = S.scenes[st.i];
      paintScene(offA, cur, st.local);
      var blendA = 0;
      if (st.next !== null && st.local > st.dur - CF) {
        blendA = (st.local - (st.dur - CF)) / CF;
        paintScene(offB, S.scenes[st.next], st.local - (st.dur - CF));
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(offA, 0, 0);
      if (blendA > 0) {
        ctx.globalAlpha = blendA;
        ctx.drawImage(offB, 0, 0);
      }
      ctx.restore();
      highlightScene(st.i);
      return;
    }
    var eff = MF.byId[S.current.id];
    if (!eff) return;
    var cfg = baseCfg(S.current.duration);
    MF.paint(ctx, eff, S.current.params, S.t, cfg);
  }

  function currentDuration() {
    return S.mode === 'sequence' ? Math.max(0.1, seqTotal()) : (S.current ? S.current.duration : 6);
  }

  /* 主动画循环 */
  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var spd = parseFloat($('#speed').value || '1');
    if (S.recording) S.recElapsed += dt * spd;   /* 录制进度独立累计，不受时间轴循环回绕影响 */
    if (S.playing) {
      S.t += dt * spd;
      var D = currentDuration();
      if (S.t >= D) {
        if (S.loop || S.playingSeq) S.t = S.t % D; else { S.t = D; setPlaying(false); }
      }
    }
    updatePlayhead();
    renderFrame();
    tickHover(now);
    if (S.recording) checkRec();
    requestAnimationFrame(tick);
  }

  function updatePlayhead() {
    var D = currentDuration();
    $('#t-now').textContent = S.t.toFixed(2);
    $('#t-total').textContent = D.toFixed(2);
    var sc = $('#scrub');
    if (document.activeElement !== sc) sc.value = String(Math.round((S.t / D) * 1000));
  }

  function setPlaying(v) {
    S.playing = v;
    $('#play-icon').innerHTML = v
      ? '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>'
      : '<path d="M8 5l11 7-11 7z"/>';
  }

  /* ══════════════════ 卡片预览 ══════════════════
     惰性位图策略：468 张 560×315 canvas 若在 buildCards 时全部分配，
     位图内存高达 ~323MB（手机直接崩）。改为——
     · 创建时只给 2×2 占位（几乎零开销，.thumb 自带深色底不露白）
     · 进入视口前 300px 才分配真实位图并绘制海报帧
     · 离开视口即释放位图（滚回来由 IO 重画，海报帧确定性渲染不会跳变） */
  var REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var THUMB_W = 560, THUMB_H = 315;
  var cardReg = [];
  var cardByEl = new Map();   /* el → rec，IO 回调 O(1) 查找（原来 find 是 O(n)，468 卡全量回调时 O(n²)） */

  function allocThumb(rec) {
    if (rec.canvas.width >= THUMB_W) return;
    rec.canvas.width = THUMB_W; rec.canvas.height = THUMB_H;
  }
  function releaseThumb(rec) {
    if (rec.canvas.width > 2) { rec.canvas.width = 2; rec.canvas.height = 2; rec.painted = false; }
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var rec = cardByEl.get(en.target);
      if (!rec) return;
      if (en.isIntersecting) {
        if (!rec.painted) { allocThumb(rec); rec.painted = true; drawPoster(rec); }
      } else if (!S.hover[rec.hoverKey]) {
        releaseThumb(rec);   /* 悬停动画进行中不释放 */
      }
    });
  }, { rootMargin: '300px' });

  function drawPoster(rec) {
    allocThumb(rec);
    var eff = MF.byId[rec.id];
    var cfg = baseCfg(eff.dur);
    cfg.w = rec.canvas.width; cfg.h = rec.canvas.height;
    MF.paint(rec.canvas.getContext('2d'), eff, MF.defaultParams(eff), (eff.poster || 0.7) * eff.dur, cfg);
  }

  function tickHover(now) {
    for (var id in S.hover) {
      var rec = S.hover[id];
      if (!rec) continue;
      var eff = MF.byId[rec.id];
      var dt = Math.min(0.05, (now - (rec.last || now)) / 1000);
      rec.last = now;
      rec.t = (rec.t + dt * 1) % eff.dur;
      var cfg = baseCfg(eff.dur);
      cfg.w = rec.canvas.width; cfg.h = rec.canvas.height;
      MF.paint(rec.canvas.getContext('2d'), eff, MF.defaultParams(eff), rec.t, cfg);
    }
  }

  /* ══════════════════ 动效库浏览 ══════════════════ */
  function filtered() {
    var list = MF.effects.slice();
    var f = S.filter;
    if (f.type === 'fav') list = list.filter(function (e) { return S.favorites.has(e.id); });
    else if (f.type === 'block' || f.type === 'component') list = list.filter(function (e) { return e.type === f.type; });
    if (f.cat) list = list.filter(function (e) { return e.cat === f.cat; });
    if (f.sub) list = list.filter(function (e) { return e.sub === f.sub; });
    if (f.tag) list = list.filter(function (e) { return e.tags.indexOf(f.tag) >= 0; });
    if (f.q) {
      var q = f.q.toLowerCase();
      list = list.filter(function (e) {
        return (e.name + ' ' + e.desc + ' ' + e.cat + ' ' + (e.sub || '') + ' ' + e.tags.join(' ') + ' ' + e.id).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (S.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'zh'); });
    else if (S.sort === 'dur-asc') list.sort(function (a, b) { return a.dur - b.dur; });
    else if (S.sort === 'cat') list.sort(function (a, b) { return a.cat.localeCompare(b.cat, 'zh') || a.name.localeCompare(b.name, 'zh'); });
    return list;
  }

  function buildCards() {
    buildBrowseCats();
    var grid = $('#card-grid');
    grid.innerHTML = '';
    cardReg = [];
    cardByEl.clear();
    S.hover = {};   /* 旧卡片的悬停引用一并作废，避免动画写进已释放的位图 */
    var list = filtered();
    $('#result-count').textContent = '共 ' + list.length + ' 个动效 · ' + MF.categories.length + ' 个分类';
    $('#browse-count').textContent = list.length;
    $('#empty-state').hidden = list.length > 0;

    list.forEach(function (eff, i) {
      var card = document.createElement('button');
      card.className = 'card' + (S.current && S.current.id === eff.id ? ' active' : '');
      card.type = 'button';
      var thumb = document.createElement('div');
      thumb.className = 'thumb';
      var cvs = document.createElement('canvas');
      cvs.width = 2; cvs.height = 2;   /* 占位位图，进入视口才扩到真实尺寸（省 ~320MB 常驻内存） */
      thumb.appendChild(cvs);
      thumb.insertAdjacentHTML('beforeend',
        '<span class="idx">' + (eff.type === 'component' ? 'CMP' : 'BLK') + ' ' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="dur">' + eff.dur + 's</span>' +
        '<span class="fav' + (S.favorites.has(eff.id) ? ' on' : '') + '">' +
          '<svg viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4z"/></svg></span>');
      card.appendChild(thumb);
      var info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = '<h3>' + esc(eff.name) + '</h3><p>' + esc(eff.desc) + '</p>' +
        '<div class="row">' + eff.tags.slice(0, 3).map(function (t, k) {
          return '<span class="t' + (k === 0 ? ' hot' : '') + '">' + esc(t) + '</span>';
        }).join('') + '</div>';
      card.appendChild(info);

      var rec = { el: card, id: eff.id, canvas: cvs, t: 0, painted: false, hoverKey: eff.id + ':' + i };
      cardReg.push(rec);
      cardByEl.set(card, rec);
      io.observe(card);

      card.addEventListener('mouseenter', function () {
        if (!rec.painted) { rec.painted = true; drawPoster(rec); }
        if (REDUCE_MOTION) return;   /* 减少动态偏好：卡片保持静态海报帧 */
        rec.last = performance.now();
        S.hover[rec.hoverKey] = rec;
      });
      card.addEventListener('mouseleave', function () { delete S.hover[rec.hoverKey]; });
      card.addEventListener('click', function () {
        selectEffect(eff.id);
        closeBrowser();
      });
      card.querySelector('.fav').addEventListener('click', function (ev) {
        ev.stopPropagation();   /* 点收藏不触发卡片进入 */
        toggleFav(eff.id);
        this.classList.toggle('on', S.favorites.has(eff.id));
      });
      grid.appendChild(card);
    });
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* 浏览层顶部分类快捷筛选条 */
  /* ══════ 板块图标（果冻玻璃风格：渐变圆角方块 + 白色线性图标） ══════ */
  var IC = function (d) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  };
  var CAT_META = {
    '文字排版':  { g: 'linear-gradient(135deg,#6FA4FF,#2F6BFF)', d: 'M5.5 7V4.5h13V7M12 4.5v15m-3.5 0h7' },
    '数据图表':  { g: 'linear-gradient(135deg,#3EDDA0,#0EA5E9)', d: 'M4 20h16M6.5 20v-7m5.5 7V5.5m5.5 14.5v-10' },
    '转场运镜':  { g: 'linear-gradient(135deg,#FF9A5B,#FF4D6D)', d: 'M4 6.5h16v11H4zM8 6.5l2 2.6m2-2.6 2 2.6m2-2.6 2 2.6M10 10.5v3.5l3-1.75z' },
    '几何空间':  { g: 'linear-gradient(135deg,#A78BFA,#6D28D9)', d: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 9 8-4.5M12 12 4 7.5M12 12v9' },
    '品牌叙事':  { g: 'linear-gradient(135deg,#F472B6,#DB2777)', d: 'M7 3.5h10l4 5.5-9 11.5L3 9l4-5.5zM3 9h18M12 20.5 8.2 9 12 3.5 15.8 9 12 20.5z' },
    '界面交互':  { g: 'linear-gradient(135deg,#38BDF8,#2563EB)', d: 'M5 4l6.5 15.5 2-6.5 6.5-2L5 4z' },
    '粒子光影':  { g: 'linear-gradient(135deg,#FBBF24,#F59E0B)', d: 'M12 4l1.7 4.8L18.5 10.5l-4.8 1.7L12 17l-1.7-4.8L5.5 10.5l4.8-1.7L12 4zm6.5 9.5.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z' },
    '背景材质':  { g: 'linear-gradient(135deg,#C4B5FD,#7C3AED)', d: 'M3 7.5c3-2.6 6-2.6 9 0s6 2.6 9 0M3 12.5c3-2.6 6-2.6 9 0s6 2.6 9 0M3 17.5c3-2.6 6-2.6 9 0s6 2.6 9 0' },
    '入场与状态': { g: 'linear-gradient(135deg,#4ADE80,#159B47)', d: 'M12 3.5V13m0 0 4-4m-4 4-4-4M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2' },
    '创意生活':  { g: 'linear-gradient(135deg,#FB7185,#E11D48)', d: 'M9.5 18h5m-4 3h3M12 3a6 6 0 0 1 4 10.4c-.8.7-1 1.6-1 2.6H9c0-1-.2-1.9-1-2.6A6 6 0 0 1 12 3z' }
  };
  var catMeta = function (cat) {
    return CAT_META[cat] || { g: 'linear-gradient(135deg,#94A3B8,#475569)', d: 'M12 4l8 8-8 8-8-8 8-8z' };
  };
  /* 导出条目图标（key 来自 data-export） */
  var EX_META = {
    'html':      { g: 'linear-gradient(135deg,#6FA4FF,#2F6BFF)', d: 'M9 8l-4 4 4 4m6-8 4 4-4 4' },
    'video':     { g: 'linear-gradient(135deg,#F472B6,#DB2777)', d: 'M3.5 7.5A2 2 0 0 1 5.5 5.5h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-9zM15.5 10.5 20.5 8v8l-5-2.5' },
    'mp4':       { g: 'linear-gradient(135deg,#A78BFA,#6D28D9)', d: 'M4 5.5h16v13H4zM4 9.5h16M9 5.5v4m6-4v4M7 15.5h.01M11 15.5h.01M15 15.5h.01' },
    'gif':       { g: 'linear-gradient(135deg,#FF9A5B,#FF4D6D)', d: 'M4 5.5h16v13H4zm2.5 9.5 3.5-4 2.5 3 2-2.5 3 3.5M8.5 9.5h.01' },
    'png':       { g: 'linear-gradient(135deg,#3EDDA0,#0EA5E9)', d: 'M4 5.5h16v13H4zm11 0v13M4 9h11' },
    'copy-html': { g: 'linear-gradient(135deg,#38BDF8,#2563EB)', d: 'M9 9V6a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 20 6v8a1.5 1.5 0 0 1-1.5 1.5H15M4.5 9h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 12.5 20h-8A1.5 1.5 0 0 1 3 18.5v-8A1.5 1.5 0 0 1 4.5 9z' },
    'copy-draw': { g: 'linear-gradient(135deg,#C4B5FD,#7C3AED)', d: 'M4 20l1.3-4.7L15.8 4.8l3.4 3.4L8.7 18.7 4 20zM13.5 7l3.5 3.5' },
    'react':     { g: 'linear-gradient(135deg,#22D3EE,#0284C7)', d: 'M12 10.6a1.4 1.4 0 1 0 .01 2.81A1.4 1.4 0 0 0 12 10.6zm0-7.6c4.5 3.8 4.5 14.2 0 18M12 3c-4.5 3.8-4.5 14.2 0 18' },
    'embed':     { g: 'linear-gradient(135deg,#94A3B8,#475569)', d: 'M8.5 8l-4 4 4 4m7-8 4 4-4 4' },
    'prompt':    { g: 'linear-gradient(135deg,#FBBF24,#F59E0B)', d: 'M12 4l1.7 4.8 4.8 1.7-4.8 1.7L12 17l-1.7-4.8L5.5 10.5l4.8-1.7L12 4z' },
    'share':     { g: 'linear-gradient(135deg,#F472B6,#DB2777)', d: 'M10 13.5a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 0 0-6.4-6.4l-1.3 1.3m2.2 6.7a4.5 4.5 0 0 0-6.4 0L4.5 15.1a4.5 4.5 0 0 0 6.4 6.4l1.3-1.3' },
    'sequence':  { g: 'linear-gradient(135deg,#FB7185,#E11D48)', d: 'M4 6h10M4 11h10M4 16h6m6-6.5 5 3.5-5 3.5v-7z' },
    'fav-html':  { g: 'linear-gradient(135deg,#FF9A5B,#FF4D6D)', d: 'M6.5 4h11v17l-5.5-3.8L6.5 21V4z' },
    'fav-list':  { g: 'linear-gradient(135deg,#6FA4FF,#2F6BFF)', d: 'M8.5 6.5H20M8.5 12H20M8.5 17.5H20M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01' }
  };
  function decorateExport() {
    $$('.export-item').forEach(function (el) {
      var m = EX_META[el.dataset.export];
      if (!m || el.querySelector('.ex-ic')) return;
      el.insertAdjacentHTML('afterbegin',
        '<i class="ex-ic" style="background:' + m.g + '">' + IC(m.d) + '</i>');
    });
  }

  function buildBrowseCats() {
    var wrap = $('#browse-cats');
    if (!wrap) return;
    wrap.innerHTML = '';
    var counts = {};
    MF.effects.forEach(function (e) { counts[e.cat] = (counts[e.cat] || 0) + 1; });
    var mk = function (label, cat, n) {
      var on = cat ? S.filter.cat === cat : !S.filter.cat;
      var b = document.createElement('button');
      b.type = 'button';
      var m = cat ? catMeta(cat) : { g: 'linear-gradient(135deg,#C7D2FE,#818CF8)', d: 'M12 4l8 8-8 8-8-8 8-8z' };
      b.className = 'bc-chip' + (on ? ' active' : '');
      b.innerHTML = '<i class="bc-ic" style="background:' + m.g + '">' + IC(m.d) + '</i><span>' + esc(label) + '</span><i>' + n + '</i>';
      b.addEventListener('click', function () {
        S.filter.cat = cat;
        S.filter.sub = null;
        S.filter.type = S.filter.type === 'fav' ? 'all' : S.filter.type;
        buildCategories(); syncTabs(); buildCards();
      });
      wrap.appendChild(b);
    };
    mk('全部', null, MF.effects.length);
    MF.categories.forEach(function (c) { mk(c, c, counts[c] || 0); });
  }

  function buildCategories() {
    var wrap = $('#cat-list');
    wrap.innerHTML = '';
    var counts = {};
    MF.effects.forEach(function (e) { counts[e.cat] = (counts[e.cat] || 0) + 1; });
    MF.categories.forEach(function (cat) {
      var b = document.createElement('button');
      var m = catMeta(cat);
      b.className = 'cat-item' + (S.filter.cat === cat ? ' active' : '');
      b.innerHTML = '<i class="cat-ic" style="background:' + m.g + '">' + IC(m.d) + '</i><span>' + esc(cat) + '</span><i>' + counts[cat] + '</i>';
      b.addEventListener('click', function () {
        S.filter.cat = S.filter.cat === cat ? null : cat;
        S.filter.sub = null;   /* 切换大类时清掉细类筛选 */
        S.filter.type = S.filter.type === 'fav' ? 'all' : S.filter.type;
        buildCategories(); syncTabs(); buildCards();
      });
      wrap.appendChild(b);
      /* 选中大类后展开细类二级筛选 */
      if (S.filter.cat === cat) {
        var subCounts = {};
        var subOrder = [];
        MF.effects.forEach(function (e) {
          if (e.cat !== cat) return;
          if (subCounts[e.sub] === undefined) { subCounts[e.sub] = 0; subOrder.push(e.sub); }
          subCounts[e.sub]++;
        });
        var box = document.createElement('div');
        box.className = 'sub-list';
        subOrder.forEach(function (sub) {
          var sb = document.createElement('button');
          sb.className = 'sub-item' + (S.filter.sub === sub ? ' active' : '');
          sb.innerHTML = '<span>' + esc(sub) + '</span><i>' + subCounts[sub] + '</i>';
          sb.addEventListener('click', function () {
            S.filter.sub = S.filter.sub === sub ? null : sub;
            buildCategories(); buildCards();
          });
          box.appendChild(sb);
        });
        wrap.appendChild(box);
        /* 展开该分类（或细类）下的每个动效单元，点行直达 */
        var effs = MF.effects.filter(function (e) {
          return e.cat === cat && (!S.filter.sub || e.sub === S.filter.sub);
        });
        var el = document.createElement('div');
        el.className = 'eff-list';
        effs.forEach(function (e) {
          var row = document.createElement('button');
          row.className = 'eff-row' + (S.current && S.current.id === e.id ? ' active' : '');
          row.title = e.sub + ' · ' + e.desc;
          row.innerHTML = '<span class="n">' + esc(e.name) + '</span><span class="d">' + e.dur + 's</span>';
          row.addEventListener('click', function () {
            selectEffect(e.id);
            buildCategories();
          });
          el.appendChild(row);
        });
        wrap.appendChild(el);
      }
    });
    $('#c-all').textContent = MF.effects.length;
    $('#c-block').textContent = MF.effects.filter(function (e) { return e.type === 'block'; }).length;
    $('#c-comp').textContent = MF.effects.filter(function (e) { return e.type === 'component'; }).length;
    $('#c-fav').textContent = S.favorites.size;
    $('#lib-stat').textContent = MF.effects.length + ' 个动效 · ' + MF.categories.length + ' 个分类 · 全部可导出';
  }

  function buildRecent() {
    var wrap = $('#recent-list');
    wrap.innerHTML = '';
    if (!S.recent.length) { wrap.innerHTML = '<p class="empty-hint">还没有使用记录</p>'; return; }
    S.recent.slice(0, 8).forEach(function (id) {
      var eff = MF.byId[id];
      if (!eff) return;
      var b = document.createElement('button');
      b.className = 'cat-item';
      b.innerHTML = '<span>' + esc(eff.name) + '</span><i>' + eff.dur + 's</i>';
      b.addEventListener('click', function () { selectEffect(id); closeBrowser(); });
      wrap.appendChild(b);
    });
  }

  function syncTabs() {
    $$('#type-tabs .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.type === S.filter.type);
    });
    $('#c-fav').textContent = S.favorites.size;
  }

  function syncFavBtn(pop) {
    var btn = $('#fav-current');
    var on = !!(S.current && S.favorites.has(S.current.id));
    btn.classList.toggle('active', on);
    var label = btn.querySelector('span');
    if (label) label.textContent = on ? '已收藏' : '收藏';
    if (pop) { /* 点按时弹一下 */
      btn.classList.remove('pop');
      void btn.offsetWidth;
      btn.classList.add('pop');
    }
  }

  function toggleFav(id) {
    if (S.favorites.has(id)) S.favorites.delete(id); else S.favorites.add(id);
    persist();
    syncFavBtn(true);
    $('#c-fav').textContent = S.favorites.size;
    if (S.filter.type === 'fav') buildCards();
    toast(S.favorites.has(id) ? '已加入收藏' : '已取消收藏');
  }

  /* ══════════════════ 选择动效 ══════════════════ */
  function selectEffect(id, keepParams) {
    var eff = MF.byId[id];
    if (!eff) return;
    S.mode = 'single';
    var prev = S.current;
    S.current = {
      id: id,
      duration: eff.dur,
      params: keepParams && prev && prev.id === id ? prev.params : MF.defaultParams(eff)
    };
    S.t = eff.dur * (eff.poster || 0.7) * 0.5;   /* 进入时先落到有内容的代表帧，按 R 可从头看 */
    S.playing = true;
    if (S.browserOpen) closeBrowser();
    setPlaying(true);
    S.recent = [id].concat(S.recent.filter(function (x) { return x !== id; })).slice(0, 12);
    persist();
    applyRatio();
    renderMeta();
    renderParams();
    renderPrompt();
    renderTags();
    buildRecent();
    $$('#type-tabs .tab').forEach(function (t) { /* 保持筛选 */ });
    syncFavBtn(false);
    document.title = eff.name + ' · 嘉Jaykou动效工作台';
    /* 深链同步：任意时刻复制地址栏即可分享当前动效（不触发 hashchange） */
    try { history.replaceState(null, '', '#e=' + id); } catch (e2) {}
  }

  function renderMeta() {
    var eff = MF.byId[S.current.id];
    $('#cur-name').textContent = eff.name;
    $('#cur-type').textContent = eff.type === 'component' ? 'COMPONENT' : 'BLOCK';
    $('#cur-cat').textContent = eff.cat + (eff.sub && eff.sub !== eff.cat ? ' · ' + eff.sub : '');
    $('#cur-dur').textContent = eff.dur + 's';
    $('#cur-desc').textContent = eff.desc;
    $('#dur-input').value = S.current.duration;
  }

  function renderTags() {
    var eff = MF.byId[S.current.id];
    var box = $('#cur-tags');
    box.innerHTML = '';
    eff.tags.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'tag';
      b.textContent = '#' + t;
      b.addEventListener('click', function () {
        S.filter.tag = t; S.filter.q = ''; $('#search').value = '';
        buildCards(); openBrowser();
        toast('已按标签筛选：' + t);
      });
      box.appendChild(b);
    });
  }

  /* ══════════════════ 参数检查器 ══════════════════ */
  function renderParams() {
    var eff = MF.byId[S.current.id];
    var wrap = $('#param-list');
    wrap.innerHTML = '';
    eff.params.forEach(function (pd) {
      var val = S.current.params[pd.k];
      if (typeof val === 'string' && val.charAt(0) === '$') {
        val = S.settings[val.slice(1)] || pd.def;
      }
      if (val === undefined) val = pd.def;
      var row = document.createElement('div');
      row.className = 'param';
      var head = document.createElement('div');
      head.className = 'param-head';
      head.innerHTML = '<span>' + esc(pd.label) + '</span>';
      if (pd.type === 'range') {
        var b = document.createElement('b');
        b.textContent = val;
        head.appendChild(b);
        row.appendChild(head);
        var rg = document.createElement('input');
        rg.type = 'range'; rg.min = pd.min; rg.max = pd.max; rg.step = pd.step; rg.value = val;
        rg.setAttribute('aria-label', pd.label);
        rg.addEventListener('input', function () {
          b.textContent = this.value;
          setParam(pd.k, parseFloat(this.value));
        });
        row.appendChild(rg);
      } else if (pd.type === 'toggle') {
        var sw = document.createElement('button');
        sw.className = 'switch';
        sw.setAttribute('aria-pressed', String(!!val));
        sw.setAttribute('aria-label', pd.label);
        head.appendChild(sw);
        head.style.cursor = 'pointer';
        head.addEventListener('click', function () {
          var nv = !(S.current.params[pd.k] === true);
          setParam(pd.k, nv);
          sw.setAttribute('aria-pressed', String(nv));
        });
        row.appendChild(head);
      } else if (pd.type === 'select') {
        row.appendChild(head);
        var sel = document.createElement('select');
        sel.setAttribute('aria-label', pd.label);
        pd.options.forEach(function (o) {
          var op = document.createElement('option');
          op.value = o[0]; op.textContent = o[1];
          if (String(o[0]) === String(val)) op.selected = true;
          sel.appendChild(op);
        });
        sel.addEventListener('change', function () { setParam(pd.k, this.value); });
        row.appendChild(sel);
      } else if (pd.type === 'textarea') {
        row.appendChild(head);
        var ta = document.createElement('textarea');
        ta.value = val;
        ta.setAttribute('aria-label', pd.label);
        ta.addEventListener('input', function () { setParam(pd.k, this.value); });
        row.appendChild(ta);
      } else if (pd.type === 'color') {
        row.appendChild(head);
        var cw = document.createElement('div');
        cw.className = 'color-row';
        var ci = document.createElement('input');
        ci.type = 'color'; ci.value = val;
        ci.setAttribute('aria-label', pd.label);
        var cc = document.createElement('code');
        cc.textContent = val;
        ci.addEventListener('input', function () { cc.textContent = this.value; setParam(pd.k, this.value); });
        cw.appendChild(ci); cw.appendChild(cc);
        row.appendChild(cw);
      } else {
        row.appendChild(head);
        var ti = document.createElement('input');
        ti.type = pd.type === 'number' ? 'number' : 'text';
        ti.value = val;
        ti.setAttribute('aria-label', pd.label);
        ti.addEventListener('input', function () { setParam(pd.k, ti.type === 'number' ? parseFloat(this.value) : this.value); });
        row.appendChild(ti);
      }
      wrap.appendChild(row);
    });
    paintRanges(wrap);
  }

  /* 滑块轨道已填充进度（配合 CSS --fill 渐变轨道） */
  function paintRanges(root) {
    (root || document).querySelectorAll('input[type="range"]').forEach(function (el) {
      var min = parseFloat(el.min) || 0, max = parseFloat(el.max);
      if (isNaN(max)) max = 100;
      var v = parseFloat(el.value);
      if (isNaN(v)) v = min;
      var pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
      el.style.setProperty('--fill', pct.toFixed(1) + '%');
    });
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.type === 'range') {
      var el = e.target;
      var min = parseFloat(el.min) || 0, max = parseFloat(el.max);
      if (isNaN(max)) max = 100;
      var v = parseFloat(el.value);
      if (isNaN(v)) v = min;
      el.style.setProperty('--fill', (max > min ? ((v - min) / (max - min)) * 100 : 0).toFixed(1) + '%');
    }
  });

  function setParam(k, v) {
    S.current.params[k] = v;
    renderFrame();
    renderPrompt();
  }

  /* ══════════════════ 代码提示词（AI Prompt） ══════════════════
     三种模式，必须把「能不能做到一模一样」讲清楚：
       desc 描述版 —— 只给文字描述，AI 自由发挥，观感接近但不保证一致
       skel 骨架版 —— 给结构 + 参数，AI 填实现，一致性中等
       src  源码版 —— 附上本站已验证的完整实现，AI 只做移植，可精确复刻
     真正的「100% 一样」通道是「复制完整源码」（导出单文件 HTML / draw 源码）。 */
  var PROMPT_HINTS = {
    desc: '只给文字描述，由 AI 自由实现 —— 风格接近，<b>细节不会一致</b>。适合「我想要这种感觉」。',
    skel: '给参数 + 渲染循环骨架，由 AI 填实现 —— <b>一致性中等</b>，适合让 AI 从零写一版。',
    src: '附带本站已验证的完整实现源码 —— AI 只需移植，<b>可做到几乎一致</b>。要 100% 还原请用「复制完整源码」。'
  };

  function buildPrompt(eff) {
    var p = S.current.params || MF.defaultParams(eff);
    var mode = S.promptMode || 'src';
    var dur = S.current.duration || eff.dur;
    var L = [];

    if (mode === 'src') {
      L.push('你是一名前端动效工程师。下面这段 Canvas 2D 动效是我方【已验证可运行】的实现，');
      L.push('请把这段参考实现移植到我的项目里，【保持绘制逻辑与数值完全不变】，只做必要的适配');
      L.push('（比如改成模块导出、挂到我的渲染循环、替换成我的画布尺寸）。');
      L.push('不要重新设计画面，不要"优化"视觉，否则会与原效果不一致。');
    } else if (mode === 'skel') {
      L.push('请用原生 Canvas 2D 实现以下动效，输出一个可直接双击打开的独立 HTML 文件（零外部依赖）。');
      L.push('下方给出了参数与渲染循环骨架，请补齐 draw 绘制逻辑。');
    } else {
      L.push('请用原生 Canvas 2D 实现以下动效，输出一个可直接双击打开的独立 HTML 文件（零外部依赖）。');
    }
    L.push('');
    L.push('【动效】' + eff.name + '　分类：' + eff.cat +
      (eff.sub && eff.sub !== eff.cat ? ' / ' + eff.sub : '') +
      '　时长：' + dur + ' 秒无缝循环');
    if (eff.desc) L.push('【描述】' + eff.desc);
    if (eff.tags.length) L.push('【风格标签】' + eff.tags.join('、'));
    L.push('【画布】1920×1080 逻辑尺寸（适配 devicePixelRatio），背景 ' + S.settings.bg1 + ' → ' +
      S.settings.bg2 + '，文字 ' + S.settings.ink + '，主色 ' + S.settings.accent + '，辅色 ' + S.settings.accent2);
    if (eff.params.length) {
      L.push('【参数声明】（每个参数都应在 UI 上可调，改值即换内容）');
      eff.params.forEach(function (pd) {
        var v = p[pd.k] === undefined ? pd.def : p[pd.k];
        var line = '- ' + pd.k + ' (' + pd.label + ')：当前值 ' + JSON.stringify(v);
        if (pd.type === 'range') line += '，范围 ' + pd.min + ' ~ ' + pd.max + '，步进 ' + pd.step;
        else if (pd.type === 'select') line += '，可选 ' + pd.options.map(function (o) { return o[0]; }).join(' / ');
        L.push(line);
      });
    }
    L.push('');
    L.push('【实现要求】');
    L.push('1. 所有可调参数集中在一个 PARAMS 对象，改参数即可换内容；');
    L.push('2. 画面由时间 t（秒）直接计算，不做帧累加，保证任意进度 seek 时画面确定、可复现；');
    L.push('3. 随机元素使用带种子的确定性伪随机（如 mulberry32），种子 = ' + S.settings.seed + '；');
    L.push('4. 首帧与末帧自然衔接，适合无缝循环播放；文字清晰、对比度充足；');
    L.push('5. 通过 MFCore.createUtils({ W, H, D, t, accent, accent2, ink, bg1, bg2, bgMode, seed }) 拿到工具对象 U，');
    L.push('   U 提供 W/H/D/S/t/seed/ease、clamp/lerp/map、rgba/h2r/mix、rng(i)/rnd(a,b,i)/noise(x)/noise2(x,y)、');
    L.push('   rr/poly/star、fs(px,weight,mono)，以及 ready 的 drawBackground(ctx,U,cfg)；');
    L.push('6. 绘制函数签名为 draw(ctx, t, PARAMS, U)，背景由 drawBackground 负责，draw 专注画面本身。');

    if (mode === 'skel') {
      var rp = MF.resolveParams(eff, S.current.params, S.settings);
      L.push('');
      L.push('【渲染骨架】（可直接作为起点，渲染循环已就绪）');
      L.push('<canvas id="cv"></canvas>');
      L.push('<script>');
      L.push('const PARAMS = ' + JSON.stringify(rp) + ';   /* 上方参数的当前值 */');
      L.push('const DUR = ' + dur + ', SEED = ' + S.settings.seed + ';');
      L.push('function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}');
      L.push('const rand = mulberry32(SEED);   /* 确定性随机：同种子同画面 */');
      L.push('const cv = document.getElementById("cv"); cv.width = 1920; cv.height = 1080;');
      L.push('function render(tSec){ const ph = (tSec % DUR) / DUR;   /* 相位 0~1，据此绘制一帧 */ }');
      L.push('(function loop(now){ render(now / 1000); requestAnimationFrame(loop); })(0);');
      L.push('</' + 'script>');
    }

    if (mode === 'src') {
      L.push('');
      L.push('【参考实现 · 请原样移植，不要重写】');
      L.push('// 工具对象 U 由 MFCore.createUtils(...) 提供，接口同上面第 5 条');
      L.push('function draw(ctx, t, P, U) {');
      L.push(bodyOf(eff.draw));
      L.push('}');
      L.push('');
      L.push('【调用方式】ctx.save(); draw(ctx, t, PARAMS, U); ctx.restore();');
      L.push('【完整可运行版本】若需要连运行时一起的内联版，请在本站「导出 → 复制/下载单文件 HTML」获取。');
    }
    return L.join('\n');
  }

  /* 取 draw 函数体（去掉最外层 function 包装），便于嵌进提示词 */
  function bodyOf(fn) {
    var s = fn.toString();
    var i = s.indexOf('{');
    var j = s.lastIndexOf('}');
    if (i < 0 || j <= i) return s;
    var body = s.slice(i + 1, j).replace(/^\n/, '');
    return body.replace(/\n$/, '');
  }

  function renderPrompt() {
    var eff = MF.byId[S.current.id];
    if (!eff) return;
    var box = $('#prompt-box');
    if (box) box.textContent = buildPrompt(eff);
    var hint = $('#prompt-hint');
    if (hint) {
      var m = S.promptMode || 'src';
      hint.innerHTML = PROMPT_HINTS[m];
      var label = $('#prompt-copy-label');
      if (label) label.textContent = (m === 'src' ? '复制移植提示词' : m === 'skel' ? '复制骨架提示词' : '复制描述提示词');
    }
    $$('#prompt-mode .seg-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === (S.promptMode || 'src'));
    });
  }

  /* ══════════════════ 配色面板 ══════════════════ */
  var PRESETS = [
    { name: '锻造橙', accent: '#FF5A1F', accent2: '#7C5CFF', ink: '#FFFFFF', bg1: '#0A0B0F', bg2: '#161B26', bgMode: 'gradient' },
    { name: '极光青', accent: '#22D3EE', accent2: '#4F46E5', ink: '#F2FEFF', bg1: '#050A12', bg2: '#0D2030', bgMode: 'gradient' },
    { name: '品红金', accent: '#FF2E88', accent2: '#FFB020', ink: '#FFF6EC', bg1: '#0C0509', bg2: '#26101C', bgMode: 'radial' },
    { name: '翡翠绿', accent: '#10D98A', accent2: '#0EA5E9', ink: '#F0FFF8', bg1: '#04100C', bg2: '#0B2521', bgMode: 'gradient' },
    { name: '纯净白', accent: '#111318', accent2: '#7C5CFF', ink: '#0B0D12', bg1: '#F7F8FB', bg2: '#FFFFFF', bgMode: 'radial' },
    { name: '暗夜金', accent: '#E8B44A', accent2: '#9A6B2F', ink: '#FFF8E7', bg1: '#0A0805', bg2: '#1C1610', bgMode: 'grid' }
  ];

  function renderPresets() {
    var wrap = $('#presets');
    wrap.innerHTML = '';
    PRESETS.forEach(function (p) {
      var b = document.createElement('button');
      b.className = 'preset' + (S.settings.accent.toLowerCase() === p.accent.toLowerCase() ? ' active' : '');
      b.innerHTML = '<span class="sw"><i style="background:' + p.accent + '"></i><i style="background:' + p.accent2 + '"></i>' +
        '<i style="background:' + p.bg1 + '"></i></span><b>' + p.name + '</b>';
      b.addEventListener('click', function () {
        Object.assign(S.settings, {
          accent: p.accent, accent2: p.accent2, ink: p.ink,
          bg1: p.bg1, bg2: p.bg2, bgMode: p.bgMode
        });
        syncThemeInputs(); renderPresets(); persist(); renderFrame(); drawAllPosters();
        document.documentElement.style.setProperty('--accent', p.accent);
        document.documentElement.style.setProperty('--accent-2', p.accent2);
        toast('已应用主题：' + p.name);
      });
      wrap.appendChild(b);
    });
  }

  function syncThemeInputs() {
    $('#c-accent').value = S.settings.accent;
    $('#c-accent2').value = S.settings.accent2;
    $('#c-ink').value = S.settings.ink;
    $('#c-bg1').value = S.settings.bg1;
    $('#c-bg2').value = S.settings.bg2;
    $('#bg-mode').value = S.settings.bgMode;
    $('#seed').value = S.settings.seed;
    $('#v-accent').textContent = S.settings.accent;
    $('#v-accent2').textContent = S.settings.accent2;
    $('#v-ink').textContent = S.settings.ink;
    $('#v-bg1').textContent = S.settings.bg1;
    $('#v-bg2').textContent = S.settings.bg2;
    $('#v-seed').textContent = S.settings.seed;
    document.documentElement.style.setProperty('--accent', S.settings.accent);
    document.documentElement.style.setProperty('--accent-2', S.settings.accent2);
    document.documentElement.style.setProperty('--glow', hexA(S.settings.accent, 0.22));
  }

  function hexA(hex, a) {
    var c = window.MFCore.hex2rgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function drawAllPosters() {
    cardReg.forEach(function (r) { if (r.painted) drawPoster(r); });
  }

  /* ══════════════════ 场景序列 ══════════════════ */
  function renderScenes() {
    var track = $('#scene-track');
    track.innerHTML = '';
    if (!S.scenes.length) {
      track.innerHTML = '<p class="empty-hint">序列为空 —— 调好参数后点「加入当前动效」，即可串联成一条连续短片。</p>';
      $('#scene-meta').textContent = '';
      return;
    }
    S.scenes.forEach(function (sc, i) {
      var eff = MF.byId[sc.id];
      var chip = document.createElement('div');
      chip.className = 'scene-chip';
      chip.dataset.i = String(i);
      var cvs = document.createElement('canvas');
      cvs.className = 'thumb';
      cvs.width = 336; cvs.height = 189;
      chip.appendChild(cvs);
      var meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = '<b>' + esc(eff.name) + '</b><span>' + (sc.duration || 6) + 's</span>';
      chip.appendChild(meta);
      var ops = document.createElement('div');
      ops.className = 'ops';
      ops.innerHTML = '<button data-op="left" title="前移">←</button><button data-op="right" title="后移">→</button><button data-op="del" title="移除">✕</button>';
      chip.appendChild(ops);
      ops.addEventListener('click', function (ev) {
        var op = ev.target.dataset.op;
        if (!op) return;
        if (op === 'del') S.scenes.splice(i, 1);
        if (op === 'left' && i > 0) { var a = S.scenes.splice(i, 1)[0]; S.scenes.splice(i - 1, 0, a); }
        if (op === 'right' && i < S.scenes.length - 1) { var b = S.scenes.splice(i, 1)[0]; S.scenes.splice(i + 1, 0, b); }
        persist(); renderScenes();
      });
      chip.addEventListener('dblclick', function () {
        if (S.mode === 'sequence') { S.mode = 'single'; selectEffect(sc.id, true); }
        else { selectEffect(sc.id, true); }
      });
      track.appendChild(chip);
      /* 缩略图 */
      var cfg = baseCfg(sc.duration); cfg.w = 336; cfg.h = 189;
      var p = MF.resolveParams(eff, sc.params, S.settings);
      MF.paint(cvs.getContext('2d'), eff, p, (eff.poster || 0.7) * sc.duration, cfg);
    });
    $('#scene-meta').textContent = S.scenes.length + ' 段 · 总时长 ' + seqTotal().toFixed(1) + 's' +
      (S.mode === 'sequence' ? ' · 正在播放整条序列' : '');
    $('#seq-hint').textContent = S.scenes.length ? S.scenes.length + ' 段 · 共 ' + seqTotal().toFixed(1) + ' 秒' : '序列为空';
  }

  function highlightScene(i) {
    $$('#scene-track .scene-chip').forEach(function (c, k) {
      c.classList.toggle('playing', String(k) === String(i));
    });
  }

  /* ══════════════════ 导出与录制 ══════════════════ */
  function startRecord(target, format) {
    if (S.recording) { toast('正在录制中，请稍候'); return; }
    if (!window.MediaRecorder) { toast('当前浏览器不支持录制，请改用 Chrome / Edge'); return; }
    S.mode = target === 'sequence' ? 'sequence' : 'single';
    if (target === 'sequence' && !S.scenes.length) { toast('序列为空，先加入动效'); return; }
    var rec = MF.recorder.start(cv, 60, 16000000, format);
    if (!rec) { toast('无法启动录制'); return; }
    S.recording = true;
    S.recTarget = target;
    S.recElapsed = 0;
    S.t = 0;
    S.loop = target !== 'sequence';
    S.playing = true;
    $('#scene-play').classList.add('active');
    $('#record-status').hidden = false;
    $('#quick-export').disabled = true;
    toast('开始录制，请保持页面在前台');
  }

  function checkRec() {
    var D = currentDuration();
    var p = Math.min(1, (S.recElapsed || 0) / D);
    $('#record-bar').style.width = (p * 100).toFixed(1) + '%';
    $('#record-text').textContent = '正在录制 ' + Math.round(p * 100) + '% · ' + D.toFixed(1) + 's';
    if (p >= 0.999) {
      S.recording = false;
      S.recTarget = null;
      var eff = MF.byId[S.current.id];
      var ext = String(MF.recorder.mime || '').indexOf('mp4') !== -1 ? 'mp4' : 'webm';
      var name = (S.mode === 'sequence' ? 'jaykou-motion-sequence' : 'jaykou-motion-' + eff.id) + '.' + ext;
      MF.recorder.stop().then(function (blob) {
        $('#record-status').hidden = true;
        $('#quick-export').disabled = false;
        if (blob && blob.size) {
          MF.download(blob, name);
          toast('视频已导出：' + name);
        } else toast('录制失败，请重试');
      });
      S.mode = 'single';
    }
  }

  function doExport(kind) {
    var scene = { id: S.current.id, params: S.current.params, duration: S.current.duration };
    var eff = MF.byId[S.current.id];
    if (kind === 'html') {
      MF.downloadText(MF.buildStandaloneHTML(scene, S.settings), 'jaykou-motion-' + eff.id + '.html', 'text/html');
      toast('已导出单文件 HTML');
    } else if (kind === 'video') {
      startRecord('single');
    } else if (kind === 'mp4') {
      startRecord('single', 'mp4');
    } else if (kind === 'gif') {
      exportGIF();
    } else if (kind === 'sequence') {
      startRecord('sequence');
    } else if (kind === 'png') {
      cv.toBlob(function (blob) {
        MF.download(blob, 'jaykou-motion-' + eff.id + '-frame.png');
        toast('当前帧已导出（' + cv.width + '×' + cv.height + '）');
      }, 'image/png');
    } else if (kind === 'react') {
      copyText(MF.buildReact(scene, S.settings), 'React 组件已复制到剪贴板');
    } else if (kind === 'embed') {
      copyText(MF.buildEmbed(scene, S.settings), '嵌入代码已复制');
    } else if (kind === 'prompt') {
      var m = S.promptMode || 'src';
      copyText(buildPrompt(eff),
        m === 'src' ? '已复制移植提示词（附完整参考实现）' : '已复制提示词（' + m + ' 模式）');
    } else if (kind === 'copy-html') {
      var sceneH = { id: S.current.id, params: S.current.params, duration: S.current.duration };
      copyText(MF.buildStandaloneHTML(sceneH, S.settings),
        '已复制单文件 HTML 源码 —— 效果与原动效 100% 一致');
    } else if (kind === 'copy-draw') {
      var effD = MF.byId[S.current.id];
      var rpD = MF.resolveParams(effD, S.current.params, S.settings);
      var head = [
        '/* ' + effD.name + ' · 由 嘉Jaykou动效工作台 生成 · 依赖 MFCore 运行时 */',
        '/* 用法：ctx.save(); draw(ctx, t, PARAMS, U); ctx.restore();',
        '   U = MFCore.createUtils({ W,H,D,t,accent,accent2,ink,bg1,bg2,bgMode,seed }) */',
        'const PARAMS = ' + JSON.stringify(rpD, null, 2) + ';',
        ''
      ].join('\n');
      copyText(head + 'const draw = ' + effD.draw.toString() + ';', 'draw 源码已复制（可贴进你自己的 canvas 项目）');
    } else if (kind === 'share') {
      var code = MF.encodeShare({
        id: scene.id, params: scene.params, settings: S.settings
      });
      var url = location.origin + location.pathname + '#s=' + code;
      copyText(url, '分享链接已复制');
      history.replaceState(null, '', '#s=' + code);
    } else if (kind === 'fav-html') {
      var favs = MF.effects.filter(function (e) { return S.favorites.has(e.id); }).map(function (e) { return e.id; });
      if (!favs.length) { toast('收藏夹还是空的 —— 先给喜欢的动效点收藏'); return; }
      MF.downloadText(MF.buildCollectionHTML(favs, S.settings, { light: S.favTheme === 'light' }),
        'jaykou-favorites' + (S.favTheme === 'light' ? '-light' : '') + '.html', 'text/html');
      toast('收藏集已导出（' + favs.length + ' 个 · ' + (S.favTheme === 'light' ? '浅色' : '深色') + '版式）');
    } else if (kind === 'fav-list') {
      var favs2 = MF.effects.filter(function (e) { return S.favorites.has(e.id); });
      if (!favs2.length) { toast('收藏夹还是空的 —— 先给喜欢的动效点收藏'); return; }
      var md = '# 我的收藏集 · 嘉Jaykou动效工作台\n\n' + favs2.map(function (e, i) {
        return (i + 1) + '. **' + e.name + '**（' + e.cat + ' · ' + e.dur + 's）— ' + e.desc;
      }).join('\n') + '\n';
      copyText(md, '收藏清单已复制（Markdown，' + favs2.length + ' 条）');
    }
  }

  /* GIF 导出：离屏逐帧渲染 + gifenc 编码 */
  function exportGIF() {
    if (S.gifBusy) return;
    var eff = MF.byId[S.current.id];
    var size = parseInt(($('#gif-size') || {}).value || '640', 10);
    var fps = parseInt(($('#gif-fps') || {}).value || '12', 10);
    S.gifBusy = true;
    $('#record-status').hidden = false;
    $('#record-bar').style.width = '0%';
    $('#record-text').textContent = '正在生成 GIF…';
    MF.exportGIF({
      id: S.current.id, params: S.current.params, settings: S.settings,
      duration: S.current.duration || eff.dur, width: size, fps: fps,
      onProgress: function (p) {
        $('#record-bar').style.width = (p * 100).toFixed(0) + '%';
        $('#record-text').textContent = '正在生成 GIF ' + Math.round(p * 100) + '%';
      }
    }).then(function (blob) {
      S.gifBusy = false;
      $('#record-status').hidden = true;
      MF.download(blob, 'jaykou-motion-' + eff.id + '.gif');
      toast('GIF 已导出：' + size + 'px · ' + fps + 'fps · ' + Math.round(blob.size / 1024) + 'KB');
    }).catch(function (e) {
      S.gifBusy = false;
      $('#record-status').hidden = true;
      toast('GIF 导出失败：' + e.message);
    });
  }

  /* ══════════════════ 浏览层开关 ══════════════════ */
  function openBrowser(focusQ) {
    $('#browser').hidden = false;
    S.browserOpen = true;
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    var q = $('#search');
    if (focusQ && canHover && q && !q.value) q.focus();   /* 桌面端主动打开时聚焦搜索；触屏会弹软键盘，跳过 */
  }
  function closeBrowser() {
    $('#browser').hidden = true;
    S.browserOpen = false;
  }

  /* ══════════════════ 事件绑定 ══════════════════ */
  function bind() {
    /* 比例 */
    var sel = $('#ratio');
    Object.keys(MF.ratios).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = MF.ratios[k].label;
      if (k === S.settings.ratio) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      S.settings.ratio = this.value; persist(); applyRatio(); renderScenes();
    });

    /* 主题明暗 */
    $('#theme-toggle').addEventListener('click', function () {
      S.theme = S.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = S.theme;
      persist();
    });

    /* 搜索 */
    var searchTimer = null;
    $('#search').addEventListener('input', function () {
      var v = this.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        S.filter.q = v.trim(); S.filter.tag = null;
        buildCards();
        openBrowser();
      }, 160);
    });
    $('#sort').addEventListener('change', function () { S.sort = this.value; buildCards(); });

    /* 类型tab */
    $$('#type-tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        S.filter.type = t.dataset.type;
        /* 类型 tab 是全库维度：切换时清空分类/细类/标签残留，避免「全部动效」只剩上次分类的几个 */
        S.filter.cat = null; S.filter.sub = null; S.filter.tag = null;
        S.filter.q = ''; $('#search').value = '';
        buildCategories(); syncTabs(); buildCards();
        openBrowser();
      });
    });

    /* 检查器tab */
    $$('#insp-tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('#insp-tabs .tab').forEach(function (x) { x.classList.toggle('active', x === t); });
        ['params', 'theme', 'export'].forEach(function (p) {
          $('#panel-' + p).hidden = p !== t.dataset.panel;
        });
      });
    });

    /* 播放控制 */
    $('#play').addEventListener('click', function () { setPlaying(!S.playing); });
    $('#restart').addEventListener('click', function () { S.t = 0; setPlaying(true); });
    $('#loop').addEventListener('click', function () {
      S.loop = !S.loop;
      this.setAttribute('aria-pressed', String(S.loop));
    });
    $('#scrub').addEventListener('input', function () {
      S.playing = false; setPlaying(false);
      S.t = (parseFloat(this.value) / 1000) * currentDuration();
      renderFrame();
    });
    var step = 1 / 30;
    $('#prev-frame').addEventListener('click', function () {
      S.playing = false; setPlaying(false);
      S.t = Math.max(0, S.t - step); renderFrame();
    });
    $('#next-frame').addEventListener('click', function () {
      S.playing = false; setPlaying(false);
      S.t = Math.min(currentDuration(), S.t + step); renderFrame();
    });
    $('#speed').addEventListener('change', function () { S.settings.speed = parseFloat(this.value); persist(); });
    $('#dur-input').addEventListener('change', function () {
      var v = Math.max(1, Math.min(60, parseFloat(this.value) || 6));
      this.value = v;
      S.current.duration = v;
      S.t = Math.min(S.t, v);
      renderFrame();
    });

    /* 舞台头部 */
    $('#fav-current').addEventListener('click', function () { toggleFav(S.current.id); });
    $('#share-current').addEventListener('click', function () { doExport('share'); });
    $('#randomize').addEventListener('click', function () { randomizeParams(); });
    $('#param-random').addEventListener('click', function () { randomizeParams(); });
    $('#param-reset').addEventListener('click', function () {
      S.current.params = MF.defaultParams(MF.byId[S.current.id]);
      renderParams(); renderPrompt(); renderFrame();
      toast('已恢复默认参数');
    });
    $('#prompt-copy').addEventListener('click', function () {
      var m = S.promptMode || 'src';
      copyText(buildPrompt(MF.byId[S.current.id]),
        m === 'src' ? '已复制移植提示词（附完整参考实现，AI 只需移植）'
          : m === 'skel' ? '已复制骨架提示词（AI 需补实现，一致性中等）'
            : '已复制描述提示词（AI 自由发挥，观感接近、细节不同）');
    });
    /* 100% 还原通道：复制完整可运行源码 */
    $('#copy-src').addEventListener('click', function () {
      var scene = { id: S.current.id, params: S.current.params, duration: S.current.duration };
      copyText(MF.buildStandaloneHTML(scene, S.settings),
        '已复制完整源码（单文件 HTML）—— 粘贴保存即为同款，效果 100% 一致');
    });
    $$('#prompt-mode .seg-item').forEach(function (b) {
      b.addEventListener('click', function () {
        S.promptMode = b.dataset.mode;
        renderPrompt();
      });
    });

    /* 手气不错：随机动效 + 随机参数 + 随机配色，一键出片 */
    $('#random-effect').addEventListener('click', function () {
      var pool = filtered();
      if (pool.length < 2) pool = MF.effects;
      var eff = pool[Math.floor(Math.random() * pool.length)];
      selectEffect(eff.id);
      randomizeParams();
      var p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      Object.assign(S.settings, {
        accent: p.accent, accent2: p.accent2, ink: p.ink,
        bg1: p.bg1, bg2: p.bg2, bgMode: p.bgMode
      });
      syncThemeInputs(); renderPresets(); persist(); renderFrame(); drawAllPosters();
      document.documentElement.style.setProperty('--accent', p.accent);
      document.documentElement.style.setProperty('--accent-2', p.accent2);
      toast('手气不错：' + p.name + ' · ' + eff.cat + ' · ' + eff.name);
    });

    /* 场景 */
    $('#scene-add').addEventListener('click', function () {
      S.scenes.push({ id: S.current.id, params: JSON.parse(JSON.stringify(S.current.params)), duration: S.current.duration });
      persist(); renderScenes();
      toast('已加入序列（第 ' + S.scenes.length + ' 段）');
    });
    $('#scene-play').addEventListener('click', function () {
      if (!S.scenes.length) { toast('序列为空'); return; }
      if (S.mode === 'sequence') {
        S.mode = 'single'; S.t = 0; S.playingSeq = false;
        setPlaying(true); renderScenes(); toast('回到单动效模式');
      } else {
        S.mode = 'sequence'; S.t = 0; S.playingSeq = true;
        setPlaying(true); renderScenes(); toast('播放整条序列');
      }
    });
    $('#scene-clear').addEventListener('click', function () {
      S.scenes = []; S.mode = 'single'; persist(); renderScenes(); toast('序列已清空');
    });

    /* 导出 */
    $$('[data-export]').forEach(function (b) {
      b.addEventListener('click', function () { doExport(this.dataset.export); });
    });
    /* 收藏集版式切换 */
    $$('#fav-theme-row .seg-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.favTheme === S.favTheme);
      b.addEventListener('click', function () {
        S.favTheme = this.dataset.favTheme;
        $$('#fav-theme-row .seg-item').forEach(function (x) { x.classList.toggle('active', x === b); });
        persist();
        toast('收藏集将导出为' + (S.favTheme === 'light' ? '浅色' : '深色') + '版式');
      });
    });
    $('#quick-export').addEventListener('click', function () {
      $$('#insp-tabs .tab').forEach(function (x) { x.classList.toggle('active', x.dataset.panel === 'export'); });
      ['params', 'theme', 'export'].forEach(function (p) { $('#panel-' + p).hidden = p !== 'export'; });
      toast('选择一种导出方式');
    });

    /* 配色输入 */
    [['#c-accent', 'accent'], ['#c-accent2', 'accent2'], ['#c-ink', 'ink'], ['#c-bg1', 'bg1'], ['#c-bg2', 'bg2']].forEach(function (pair) {
      $(pair[0]).addEventListener('input', function () {
        S.settings[pair[1]] = this.value;
        syncThemeInputs(); persist(); renderFrame(); drawAllPosters(); renderScenes();
      });
    });
    $('#bg-mode').addEventListener('change', function () {
      S.settings.bgMode = this.value; persist(); renderFrame(); drawAllPosters();
    });
    $('#seed').addEventListener('input', function () {
      S.settings.seed = parseInt(this.value, 10);
      $('#v-seed').textContent = this.value;
      renderFrame(); drawAllPosters();
      clearTimeout(window.__seedT);
      window.__seedT = setTimeout(persist, 400);
    });

    /* 浏览层 */
    $('#lib-open').addEventListener('click', function () { openBrowser(true); });
    $('#brand-home').addEventListener('click', function (e) { e.preventDefault(); openBrowser(true); });
    $('#browser-close').addEventListener('click', closeBrowser);
    $('#browser-back').addEventListener('click', closeBrowser);
    $('#reset-filters').addEventListener('click', function () {
      S.filter = { type: 'all', cat: null, sub: null, q: '', tag: null };
      $('#search').value = '';
      buildCategories(); syncTabs(); buildCards();
    });

    /* 弹窗 */
    $('#help-open').addEventListener('click', function () { $('#help-modal').hidden = false; });
    $('#help-close').addEventListener('click', function () { $('#help-modal').hidden = true; });
    $('#help-modal').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });

    /* 口播稿推荐 */
    $('#script-rec').addEventListener('click', function () { $('#script-modal').hidden = false; $('#script-input').focus(); });
    $('#script-modal').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });
    $('#script-analyze').addEventListener('click', runScriptAnalysis);
    $('#script-fill').addEventListener('click', fillSequenceFromScript);

    /* 键盘 */
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (e.key === '/' && !typing) { e.preventDefault(); $('#search').focus(); return; }
      if (e.key === 'Escape') {
        if (!$('#help-modal').hidden) { $('#help-modal').hidden = true; return; }
        if (!$('#script-modal').hidden) { $('#script-modal').hidden = true; return; }
        if (S.browserOpen) closeBrowser();
        return;
      }
      if (typing) return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(!S.playing); }
      else if (e.key === 'r' || e.key === 'R') { S.t = 0; setPlaying(true); }
      else if (e.key === 'l' || e.key === 'L') { $('#loop').click(); }
      else if (e.key === 'ArrowLeft') { $('#prev-frame').click(); }
      else if (e.key === 'ArrowRight') { $('#next-frame').click(); }
      else if (e.key === 'b' || e.key === 'B') { S.browserOpen ? closeBrowser() : openBrowser(); }
      else if (e.key === 'f' || e.key === 'F') { if (S.current) $('#fav-current').click(); }
      else if (e.key === 't' || e.key === 'T') { $('#theme-toggle').click(); }
      else if (e.key === '[' || e.key === ']') {
        /* 在当前筛选列表中切换上/下一个动效 */
        var list = filtered();
        if (!list.length || !S.current) return;
        var idx = -1;
        for (var i2 = 0; i2 < list.length; i2++) { if (list[i2].id === S.current.id) { idx = i2; break; } }
        var ni = (idx + (e.key === ']' ? 1 : -1) + list.length) % list.length;
        selectEffect(list[ni].id);
        toast(list[ni].cat + ' · ' + list[ni].name + '（' + (ni + 1) + '/' + list.length + '）');
      }
      else if (e.key === '1' || e.key === '2' || e.key === '3') {
        var map = { '1': 'params', '2': 'theme', '3': 'export' };
        var target = $$('#insp-tabs .tab').find(function (x) { return x.dataset.panel === map[e.key]; });
        if (target) target.click();
      }
    });

    window.addEventListener('hashchange', loadFromHash);
  }

  function randomizeParams() {
    var eff = MF.byId[S.current.id];
    eff.params.forEach(function (pd) {
      if (pd.type === 'range') {
        var v = pd.min + Math.random() * (pd.max - pd.min);
        v = Math.round(v / pd.step) * pd.step;
        S.current.params[pd.k] = parseFloat(v.toFixed(3));
      } else if (pd.type === 'select') {
        S.current.params[pd.k] = pd.options[Math.floor(Math.random() * pd.options.length)][0];
      } else if (pd.type === 'toggle') {
        S.current.params[pd.k] = Math.random() > 0.35;
      } else if (pd.type === 'color') {
        S.current.params[pd.k] = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
      }
    });
    S.settings.seed = Math.floor(Math.random() * 100);
    $('#seed').value = S.settings.seed;
    $('#v-seed').textContent = S.settings.seed;
    renderParams(); renderPrompt(); renderFrame();
    toast('已随机化参数与种子');
  }

  /* ══════════════════ 口播稿推荐（本地规则引擎） ══════════════════ */
  var SCRIPT_RULES = [
    { phase: '开场', label: '开场问候', kws: ['大家好', '欢迎', '哈喽', 'hello', 'hi', '开场', '这期', '今天', '来了', '你们好'],
      cats: ['入场与反馈', '入场序列', '文字与排版'], tags: ['入场', '标题'] },
    { phase: '要点', label: '数据呈现', kws: ['数据', '增长', '%', '百分之', '占比', '统计', '报表', '营收', '销量', '用户', '市场规模', '提升', '下降', '对比', '万', '亿'],
      cats: ['数据可视化', '数据图表', '数据大屏', '数字计数', '对比展示', 'HUD 仪表'], tags: ['数据', '图表', '计数'] },
    { phase: '要点', label: '科技 / AI', kws: ['ai', '科技', '智能', '算法', '模型', '未来', '创新', '技术', '自动化', '机器人', '数字化'],
      cats: ['几何与抽象', '粒子与反馈', '粒子系统', '3D 立体', '光影氛围', '终端代码', '几何构成'], tags: ['科技', '粒子', '抽象'] },
    { phase: '要点', label: '重点强调', kws: ['重点', '关键', '注意', '核心', '记住', '划重点', '千万别', '一定要', '敲黑板', '秘诀'],
      cats: ['文字特效', '状态与进度', '几何构成'], tags: ['强调', '标题', '高亮'] },
    { phase: '要点', label: '流程步骤', kws: ['第一步', '第二步', '步骤', '流程', '然后', '接着', '方法', '怎么', '如何', '教程', '攻略'],
      cats: ['时间轴', '状态与进度', '办公效率', '叙事与演示', '加载与进度'], tags: ['步骤', '流程', '时间'] },
    { phase: '要点', label: '产品展示', kws: ['产品', '实物', '开箱', '展示', '设计', '作品', '房子', '室内', '颜值', '质感'],
      cats: ['空间与展示', '交互与卡片', '材质与纹理', '界面组件'], tags: ['展示', '3d'] },
    { phase: '要点', label: '地点行程', kws: ['城市', '国家', '旅行', '路线', '地图', '出发', '到达', '距离', '打卡'],
      cats: ['地图轨迹'], tags: ['地图', '轨迹'] },
    { phase: '要点', label: '情绪氛围', kws: ['温暖', '治愈', '浪漫', '氛围', '心情', '感受', '安静', '放松', '音乐', '节奏'],
      cats: ['光影氛围', '天气氛围', '创意生活', '音乐律动', '涂鸦手绘'], tags: ['氛围', '光影'] },
    { phase: '要点', label: '剧情字幕', kws: ['说', '台词', '字幕', '弹幕', '吐槽', '聊天', '对话', '采访'],
      cats: ['弹幕字幕', '社交叙事'], tags: ['字幕', '弹幕'] },
    { phase: '收尾', label: '行动号召', kws: ['点赞', '关注', '订阅', '评论', '转发', '分享', '下期', '拜拜', '再见', '别忘了', '粉丝'],
      cats: ['社交叙事', '退场收尾'], tags: ['社交', '互动'] },
    { phase: '收尾', label: '品牌收尾', kws: ['品牌', 'logo', '官方', '出品', '合作', '联系方式', '官网'],
      cats: ['品牌与标识', '退场收尾'], tags: ['logo', '品牌'] },
    { phase: '转场', label: '转场过渡', kws: ['接下来', '另一个', '说到', '切换', '换一个', '转入', ' meanwhile'],
      cats: ['转场切换', '镜头与转场', '镜头运动', '形变转换'], tags: ['转场'] }
  ];

  function analyzeScript(text) {
    var t = String(text || '').toLowerCase();
    var hits = [];
    SCRIPT_RULES.forEach(function (r) {
      for (var i = 0; i < r.kws.length; i++) {
        if (t.indexOf(r.kws[i].toLowerCase()) >= 0) { hits.push({ rule: r, kw: r.kws[i] }); return; }
      }
    });
    var recs = [], seen = {};
    hits.forEach(function (h) {
      var scored = [];
      MF.effects.forEach(function (e) {
        var aff = h.rule.cats.indexOf(e.cat) >= 0 ? 3 : 0;
        var tg = e.tags || [];
        for (var i = 0; i < h.rule.tags.length; i++) {
          if (tg.indexOf(h.rule.tags[i]) >= 0) { aff += 1.5; break; }
        }
        if (!aff) return;
        var txt = (e.name + ' ' + e.desc).toLowerCase(), bonus = 0;
        for (var j = 0; j < h.rule.kws.length; j++) {
          if (txt.indexOf(h.rule.kws[j].toLowerCase()) >= 0) { bonus = 1; break; }
        }
        scored.push({ e: e, s: aff + bonus + Math.random() * 0.6 });
      });
      scored.sort(function (a, b) { return b.s - a.s; });
      scored.slice(0, 3).forEach(function (x) {
        if (seen[x.e.id]) return;
        seen[x.e.id] = 1;
        recs.push({ eff: x.e, phase: h.rule.phase, label: h.rule.label, kw: h.kw });
      });
    });
    return { hits: hits, recs: recs.slice(0, 12) };
  }

  var scriptRecs = [];   /* 最近一次分析结果，供一键生成序列用 */

  function renderScriptRecs() {
    var wrap = $('#script-recs');
    wrap.innerHTML = '';
    if (!scriptRecs.length) {
      wrap.innerHTML = '<p class="empty-hint">没识别到明显的叙事线索 —— 试试文稿里带点数据、重点、行动号召这类词，或直接用「手气不错」碰运气。</p>';
      return;
    }
    scriptRecs.forEach(function (r, i) {
      var card = document.createElement('div');
      card.className = 'rec-card';
      var cvs = document.createElement('canvas');
      cvs.width = 336; cvs.height = 189;
      card.appendChild(cvs);
      var meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = '<b>' + esc(r.eff.name) + '</b>' +
        '<i class="rec-phase">' + r.phase + ' · ' + r.label + '</i>' +
        '<span class="rec-why">命中「' + esc(r.kw) + '」</span>';
      var add = document.createElement('button');
      add.className = 'rec-add';
      add.textContent = '+ 序列';
      add.title = '加入场景序列';
      add.addEventListener('click', function (ev) {
        ev.stopPropagation();
        S.scenes.push({ id: r.eff.id, params: MF.defaultParams(r.eff), duration: r.eff.dur });
        persist(); renderScenes();
        toast('已加入序列（' + S.scenes.length + ' 个场景）');
      });
      meta.appendChild(add);
      card.appendChild(meta);
      card.addEventListener('click', function () {
        selectEffect(r.eff.id);
        $('#script-modal').hidden = true;
        toast(r.phase + ' · ' + r.eff.name);
      });
      wrap.appendChild(card);
      /* 海报帧 */
      var eff = r.eff;
      var cfg = baseCfg(eff.dur); cfg.w = 336; cfg.h = 189;
      MF.paint(cvs.getContext('2d'), eff, MF.defaultParams(eff), (eff.poster || 0.7) * eff.dur, cfg);
    });
  }

  function runScriptAnalysis() {
    var text = $('#script-input').value.trim();
    if (!text) { toast('先粘贴一段口播稿'); return; }
    var res = analyzeScript(text);
    scriptRecs = res.recs;
    var phases = [];
    res.hits.forEach(function (h) { if (phases.indexOf(h.rule.phase + '·' + h.rule.label) < 0) phases.push(h.rule.phase + '·' + h.rule.label); });
    $('#script-hint').textContent = res.hits.length
      ? '识别到 ' + res.hits.length + ' 处线索：' + phases.join(' / ')
      : '';
    $('#script-fill').hidden = scriptRecs.length < 2;
    renderScriptRecs();
  }

  function fillSequenceFromScript() {
    if (!scriptRecs.length) return;
    scriptRecs.slice(0, 6).forEach(function (r) {
      S.scenes.push({ id: r.eff.id, params: MF.defaultParams(r.eff), duration: r.eff.dur });
    });
    persist(); renderScenes();
    $('#script-modal').hidden = true;
    S.mode = 'sequence';
    syncTabs();
    toast('已按口播稿节奏生成 ' + Math.min(6, scriptRecs.length) + ' 段序列，可在下方微调后整条导出');
  }

  function dimTicks() {
    var wrap = $('#tp-ticks');
    wrap.innerHTML = '';
    for (var i = 0; i < 40; i++) wrap.appendChild(document.createElement('i'));
  }

  /* ══════════════════ 分享链接还原 ══════════════════ */
  function loadFromHash() {
    var h = bootHash || location.hash;
    bootHash = null;
    /* #e=动效id —— 轻量深链，直达某个动效 */
    var me = /[#&]e=([a-z0-9-]+)/i.exec(h);
    if (me && MF.byId[me[1]]) { selectEffect(me[1]); return; }
    var m = /[#&]s=([^&]+)/.exec(h);
    if (!m) return;
    var d = MF.decodeShare(m[1]);
    if (!d || !MF.byId[d.id]) return;
    if (d.settings) Object.assign(S.settings, d.settings);
    selectEffect(d.id, false);
    var eff = MF.byId[d.id];
    S.current.params = MF.resolveParams(eff, d.params, S.settings);
    Object.keys(d.params || {}).forEach(function (k) { S.current.params[k] = d.params[k]; });
    renderParams(); syncThemeInputs(); applyRatio();
    toast('已载入分享的动效参数');
  }

  /* ══════════════════ 启动 ══════════════════ */
  document.documentElement.dataset.theme = S.theme;
  bind();
  paintRanges(document);
  syncThemeInputs();
  renderPresets();
  decorateExport();
  buildCategories();
  syncTabs();
  selectEffect(S.recent[0] && MF.byId[S.recent[0]] ? S.recent[0] : MF.effects[0].id);
  buildRecent();
  buildCards();
  renderScenes();
  applyRatio();
  loadFromHash();
  setPlaying(!REDUCE_MOTION);   /* 减少动态偏好时初始暂停，由用户手动播放 */
  requestAnimationFrame(tick);

  if (S.browserOpen) openBrowser();
  setTimeout(function () { toast('已载入 ' + MF.effects.length + ' 个可编辑动效'); }, 600);
})();
