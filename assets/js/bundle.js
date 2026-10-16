/* 嘉Jaykou动效工作台 · 合并包 v202610161325 · 由 tools/build-bundle.py 生成 */
/* ════════ assets/js/runtime-src.js ════════ */
/* ==========================================================================
   Jaykou — Shared Runtime
   --------------------------------------------------------------------------
   这是全站唯一一份「纯运行时」源码。它有两个身份：
     1) 工作台运行时：由下方 IIFE 立即执行，挂载到 window.MFCore
     2) 导出产物运行时：导出单文件 HTML / React 组件时，原样内联进产物
   因此本段源码必须严格遵守：
     · 零依赖、零 DOM 假设（只操作传入的 ctx）
     · 不使用反引号与 ${} 插值（避免破坏外层 String.raw 模板）
     · 所有工具函数挂在返回的 U 对象上，供效果 draw() 调用
   ========================================================================== */
window.MF_RUNTIME_SRC = String.raw`
(function () {
  'use strict';

  /* ------------------------------ 缓动函数 ------------------------------ */
  var EASE = {
    linear: function (x) { return x; },
    inQuad: function (x) { return x * x; },
    outQuad: function (x) { return 1 - (1 - x) * (1 - x); },
    inOutQuad: function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; },
    inCubic: function (x) { return x * x * x; },
    outCubic: function (x) { return 1 - Math.pow(1 - x, 3); },
    inOutCubic: function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    inQuart: function (x) { return x * x * x * x; },
    outQuart: function (x) { return 1 - Math.pow(1 - x, 4); },
    outQuint: function (x) { return 1 - Math.pow(1 - x, 5); },
    inOutQuart: function (x) { return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; },
    inOutQuint: function (x) { return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2; },
    outExpo: function (x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); },
    inExpo: function (x) { return x <= 0 ? 0 : Math.pow(2, 10 * x - 10); },
    inQuint: function (x) { return x * x * x * x * x; },
    outSine: function (x) { return Math.sin((x * Math.PI) / 2); },
    inOutExpo: function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      return x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;
    },
    outCirc: function (x) { return Math.sqrt(1 - Math.pow(x - 1, 2)); },
    inOutSine: function (x) { return -(Math.cos(Math.PI * x) - 1) / 2; },
    outBack: function (x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    inOutBack: function (x) {
      var c2 = 1.70158 * 1.525;
      return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    },
    outElastic: function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    outBounce: function (x) {
      var n1 = 7.5625, d1 = 2.75;
      if (x < 1 / d1) return n1 * x * x;
      if (x < 2 / d1) { x -= 1.5 / d1; return n1 * x * x + 0.75; }
      if (x < 2.5 / d1) { x -= 2.25 / d1; return n1 * x * x + 0.9375; }
      x -= 2.625 / d1; return n1 * x * x + 0.984375;
    }
  };

  /* ------------------------------ 数学与色彩 ------------------------------ */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function map(v, a, b, c, d) { return b === a ? c : c + (d - c) * ((v - a) / (b - a)); }

  function hex2rgb(h) {
    h = String(h || '').trim();
    /* 兼容 mix() 产出的 rgb()/rgba() 形式，避免二次包装时被解析成黑色 */
    var m = /^rgba?\(([^)]+)\)\s*$/i.exec(h);
    if (m) {
      var parts = m[1].split(',');
      return [parseFloat(parts[0]) || 0, parseFloat(parts[1]) || 0, parseFloat(parts[2]) || 0];
    }
    if (h.charAt(0) === '#') h = h.slice(1);
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgba(h, a) {
    var c = hex2rgb(h);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a === undefined ? 1 : a) + ')';
  }

  function mixHex(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b);
    t = clamp(t, 0, 1);
    return 'rgb(' + Math.round(lerp(x[0], y[0], t)) + ',' + Math.round(lerp(x[1], y[1], t)) + ',' + Math.round(lerp(x[2], y[2], t)) + ')';
  }

  /* 确定性伪随机：同一个 i 永远得到同一个值 —— 拖拽时间轴时画面不会乱跳 */
  function hash(n, seed) {
    var s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }
  /* 一维平滑噪声 */
  function noise(x, seed) {
    var i = Math.floor(x), f = x - i;
    var a = hash(i, seed), b = hash(i + 1, seed);
    var u = f * f * (3 - 2 * f);
    return (a * (1 - u) + b * u) * 2 - 1;
  }
  /* 二维平滑噪声 */
  function noise2(x, y, seed) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    function h(a, b) { return hash(a * 57.13 + b * 131.7, seed); }
    var v00 = h(xi, yi), v10 = h(xi + 1, yi), v01 = h(xi, yi + 1), v11 = h(xi + 1, yi + 1);
    var ux = xf * xf * (3 - 2 * xf), uy = yf * yf * (3 - 2 * yf);
    var a = v00 * (1 - ux) + v10 * ux, b = v01 * (1 - ux) + v11 * ux;
    return (a * (1 - uy) + b * uy) * 2 - 1;
  }

  /* ------------------------------ 绘制助手 ------------------------------ */
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r === undefined ? 0 : r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    return ctx;
  }

  function poly(ctx, pts) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    return ctx;
  }

  function star(ctx, cx, cy, n, R, r, rot) {
    ctx.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var rad = i % 2 ? r : R;
      var a = (Math.PI * i) / n + (rot || 0);
      var x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
    return ctx;
  }

  var FONT_STACK = '-apple-system,BlinkMacSystemFont,' + String.fromCharCode(34) + 'PingFang SC' + String.fromCharCode(34) + ',' + String.fromCharCode(34) + 'Segoe UI' + String.fromCharCode(34) + ',' + String.fromCharCode(34) + 'Microsoft YaHei' + String.fromCharCode(34) + ',sans-serif';
  var MONO_STACK = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

  /* ------------------------------ 工具对象工厂 ------------------------------ */
  function createUtils(o) {
    o = o || {};
    var W = o.W || 1920, H = o.H || 1080, D = o.D || 6, t = o.t || 0;
    var S = Math.min(W / 1920, H / 1080);   /* 全局尺度单位：1080p 下为 1 */
    var seed = o.seed === undefined ? 7 : o.seed;
    var U = {
      W: W, H: H, D: D, S: S, t: t, seed: seed,
      t01: clamp(t / D, 0, 1),
      loop: clamp(t / D, 0, 1),          /* 别名，语义更直观 */
      ease: EASE,
      accent: o.accent || '#FF5A1F',
      accent2: o.accent2 || '#7C5CFF',
      ink: o.ink || '#FFFFFF',
      bg1: o.bg1 || '#0A0B0F',
      bg2: o.bg2 || '#161B26',
      bgMode: o.bgMode || 'gradient',
      font: FONT_STACK,
      mono: MONO_STACK,
      /* 数值 */
      clamp: clamp, lerp: lerp, map: map,
      /* 色彩 */
      rgba: rgba, h2r: hex2rgb, mix: mixHex,
      /* 随机（确定性） */
      rng: function (i) { return hash(i, seed); },
      rnd: function (a, b, i) { return a + (b - a) * hash(i, seed); },
      noise: function (x, s) { return noise(x, s === undefined ? seed : s); },
      noise2: function (x, y, s) { return noise2(x, y, s === undefined ? seed : s); },
      /* 形状 */
      rr: rr, poly: poly, star: star,
      /* 字体串 */
      fs: function (px, weight, mono) {
        return (weight || 700) + ' ' + Math.round(px) + 'px ' + (mono ? MONO_STACK : FONT_STACK);
      }
    };
    return U;
  }

  /* ------------------------------ 背景绘制 ------------------------------ */
  function drawBackground(ctx, U, cfg) {
    var mode = cfg && cfg.bgMode ? cfg.bgMode : U.bgMode;
    var W = U.W, H = U.H;
    if (mode === 'transparent') return;
    ctx.save();
    if (mode === 'solid') {
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
    } else if (mode === 'radial') {
      var g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      g.addColorStop(0, U.bg2); g.addColorStop(1, U.bg1);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (mode === 'grid') {
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var step = 60 * U.S;
      ctx.strokeStyle = rgba(U.ink, 0.055);
      ctx.lineWidth = Math.max(1, 1 * U.S);
      ctx.beginPath();
      for (var x = step; x < W; x += step) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
      for (var y = step; y < H; y += step) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
      ctx.stroke();
      var rg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.6);
      rg.addColorStop(0, rgba(U.accent, 0.06)); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    } else {
      var lg = ctx.createLinearGradient(0, 0, W * 0.85, H);
      lg.addColorStop(0, U.bg2); lg.addColorStop(0.55, U.bg1); lg.addColorStop(1, U.bg1);
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
      var bg2 = ctx.createRadialGradient(W * 0.78, H * 0.16, 0, W * 0.78, H * 0.16, W * 0.55);
      bg2.addColorStop(0, rgba(U.accent, 0.13)); bg2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
      var bg3 = ctx.createRadialGradient(W * 0.14, H * 0.92, 0, W * 0.14, H * 0.92, W * 0.5);
      bg3.addColorStop(0, rgba(U.accent2, 0.12)); bg3.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg3; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  window.MFCore = {
    EASE: EASE,
    createUtils: createUtils,
    drawBackground: drawBackground,
    rgba: rgba,
    hex2rgb: hex2rgb,
    mixHex: mixHex,
    clamp: clamp,
    lerp: lerp,
    rr: rr,
    FONT_STACK: FONT_STACK,
    MONO_STACK: MONO_STACK
  };
})();
`;

/* 工作台侧立即实例化这份运行时（与导出产物共用同一份代码，杜绝行为漂移） */
(function () {
  if (!window.MFCore) new Function(window.MF_RUNTIME_SRC)();
})();

/* ════════ assets/js/engine.js ════════ */
/* ==========================================================================
   Jaykou — Engine
   效果注册表 · 舞台渲染 · 时间轴 · 录制 · 导出产物生成
   ========================================================================== */
(function () {
  'use strict';

  var MF = (window.MF = window.MF || {});
  MF.effects = [];
  MF.byId = {};

  /* 全局默认设置（可在界面中修改，驱动所有效果的配色与背景） */
  MF.defaultSettings = {
    accent: '#FF5A1F',
    accent2: '#7C5CFF',
    ink: '#FFFFFF',
    bg1: '#0A0B0F',
    bg2: '#161B26',
    bgMode: 'gradient',
    seed: 7,
    speed: 1,
    ratio: '16:9'
  };

  MF.ratios = {
    '16:9': { w: 1920, h: 1080, label: '横屏 16:9' },
    '9:16': { w: 1080, h: 1920, label: '竖屏 9:16' },
    '1:1': { w: 1080, h: 1080, label: '方形 1:1' },
    '4:5': { w: 1080, h: 1350, label: '竖版 4:5' },
    '21:9': { w: 2100, h: 900, label: '宽银幕 21:9' }
  };

  MF.categories = [];

  /* 细类 → 大类映射：界面只展示 10 个大类，原始细类保留在 def.sub */
  MF.catGroups = {
    '文字与排版': '文字排版', '文字特效': '文字排版', '弹幕字幕': '文字排版',
    '入场与反馈': '入场与状态', '入场序列': '入场与状态', '退场收尾': '入场与状态',
    '加载与进度': '入场与状态', '状态与进度': '入场与状态',
    '镜头与转场': '转场运镜', '转场切换': '转场运镜', '镜头运动': '转场运镜', '形变转换': '转场运镜',
    '数据可视化': '数据图表', '数据图表': '数据图表', '数据大屏': '数据图表', '数字计数': '数据图表',
    'HUD 仪表': '数据图表', '对比展示': '数据图表', '时间轴': '数据图表',
    '粒子与反馈': '粒子光影', '粒子系统': '粒子光影', '光影氛围': '粒子光影', '节日庆典': '粒子光影',
    '空间与展示': '几何空间', '几何与抽象': '几何空间', '几何构成': '几何空间',
    '3D 立体': '几何空间', '物理运动': '几何空间',
    '交互与卡片': '界面交互', '界面组件': '界面交互', '办公效率': '界面交互',
    '终端代码': '界面交互', '社交叙事': '界面交互',
    '品牌与标识': '品牌叙事', '叙事与演示': '品牌叙事', '徽章印章': '品牌叙事',
    '涂鸦手绘': '创意生活', '拼贴手账': '创意生活', '天气氛围': '创意生活',
    '地图轨迹': '创意生活', '音乐律动': '创意生活',
    '材质与纹理': '背景材质', '背景循环': '背景材质'
  };

  /* ------------------------------ 注册 ------------------------------ */
  /* 退役名单：基础款与同质化配方，注册时直接跳过（保留 id 便于将来复活） */
  MF.retired = new Set(("enter-fade enter-down enter-left enter-right enter-rotate enter-roll enter-back-up enter-back-scale " +
    "enter-quint-clean enter-card-up enter-card-elastic enter-card-zoom enter-chip-pop enter-chip-slide enter-chip-elastic enter-chip-focus " +
    "enter-title-blur enter-title-scale enter-title-flip enter-title-elastic enter-title-bounce enter-title-roll enter-title-clean " +
    "enter-side-pop enter-soft-rise enter-hard-cut enter-diagonal enter-delayed-stack enter-tall-pop " +
    "exit-down exit-left exit-right exit-grow exit-rotate exit-flip exit-slow-fade exit-drift exit-long-hold exit-vanish " +
    "tr-wipe-v tr-diagonal tr-checker tr-grain tr-star tr-bars tr-sweep tr-cross tr-corners tr-triangle tr-ripple " +
    "tr-push-right tr-slide-up tr-slide-down tr-zoom-out " +
    "tx-rotchar tx-box tx-scale tx-skew tx-bounce-cn tx-wave-slow tx-gradient-wide tx-outline-bold tx-glitch-cn tx-shine-gold " +
    "tx-scramble tx-matrix tx-typewriter-cn tx-countup-percent tx-neon-cn tx-cycle tx-split tx-stack " +
    "geo-star-draw geo-spiral geo-grid-wave geo-ripple geo-tri-grid geo-hex geo-dots geo-sine geo-squares geo-dotgrid " +
    "geo-polynet geo-spiral-dots geo-arcs geo-hatch geo-weave geo-bricks geo-stairs geo-wave-rings " +
    "ui-toggle ui-search ui-menu ui-spinner ui-skeleton ui-input ui-tabs ui-tooltip ui-calendar ui-tasklist ui-badge ui-dropdown ui-slider ui-settings ui-battery " +
    "pt-rain pt-snow pt-fireworks pt-confetti pt-starfield pt-galaxy pt-pollen pt-dust pt-ripplep " +
    "lt-aurora lt-bokeh lt-mesh lt-rainbow lt-haze lt-rings " +
    "ch-spark ch-rings ch-timeline ch-grid-heat " +
    "pr-bar-stripes pr-dots pr-bounce-dots pr-percent pr-counter pr-clock pr-circle-arrow pr-hashtag pr-square-flip pr-ladder pr-wave-load " +
    "scr-box scr-cross scr-star scr-heart scr-spiral scr-double scr-strike scr-bracket scr-wave " +
    "bdg-stamp-pulse bdg-laurel bdg-shield bdg-seal bdg-wobble bdg-serial bdg-stamp-slam bdg-ribbon bdg-verified bdg-coin bdg-ink bdg-medal " +
    "term-progress term-cursor term-split term-ascii " +
    "soc-heart-rain soc-vote soc-mention soc-trend " +
    "mus-wave mus-metronome mus-cassette mus-reel " +
    "num-percent num-flip-date " +
    "map-radar map-compass map-grid-locate map-contour " +
    "col-photo-grid col-scrapbook col-magazine col-pin-board " +
    "hud-toggle hud-slider hud-battery " +
    "d3-stairs d3-pyramid d3-box-tunnel d3-cyl " +
    "cmp-wipe cmp-labels cmp-bars cmp-oscillate cmp-scale cmp-merge " +
    "tl-vertical tl-steps tl-dots tl-flag tl-calendar tl-progress-nodes " +
    "dash-pie dash-progress dash-funnel dash-bubble dash-num-roll " +
    "wx-rain wx-drizzle wx-snow wx-snow-heavy wx-sun wx-wind wx-hail wx-dew " +
    "wk-calendar wk-timer wk-bell wk-target wk-clipboard wk-sync " +
    "dm-top dm-quiz dm-reply dm-watermark dm-ping " +
    "fest-gift fest-cake fest-bunting fest-cheers " +
    "ph-magnetic ph-gravity ph-collision ph-balance ph-chain ph-trajectory " +
    "cm-tilt cm-whip-pan cm-roll cm-pan-lr cm-pan-ud cm-focus-pull cm-handheld " +
    "mo-star-burst mo-ribbon mo-spring mo-fold mo-inflate mo-merge mo-split mo-wave-blob " +
    "bg-grid-pan bg-particle bg-hex bg-stripes bg-blueprint bg-rays bg-crack").trim().split(/\s+/));

  MF.register = function (def) {
    if (!def || !def.id) throw new Error('effect.id 必填');
    if (MF.byId[def.id]) throw new Error('效果 id 重复：' + def.id);
    if (MF.retired.has(def.id)) return null;   /* 已退役：静默跳过 */
    def.type = def.type || 'block';
    def.dur = def.dur || 6;
    def.poster = def.poster === undefined ? 0.72 : def.poster;
    def.tags = def.tags || [];
    def.params = def.params || [];
    def.desc = def.desc || '';
    def.sub = def.cat;                       /* 保留原始细类，供搜索与展示 */
    def.cat = MF.catGroups[def.cat] || def.cat;
    MF.effects.push(def);
    MF.byId[def.id] = def;
    if (dev_cache_cats.indexOf(def.cat) === -1) dev_cache_cats.push(def.cat);
    return def;
  };
  var dev_cache_cats = MF.categories;

  /* 参数默认值合并：支持 $accent / $accent2 / $ink 跟随全局主题 */
  MF.resolveParams = function (effect, params, settings) {
    var s = settings || MF.defaultSettings;
    var out = {};
    var src = params || {};
    effect.params.forEach(function (pd) {
      var v = src[pd.k] === undefined ? pd.def : src[pd.k];
      if (typeof v === 'string' && v.charAt(0) === '$') {
        v = s[v.slice(1)] || pd.def;
      }
      out[pd.k] = v;
    });
    return out;
  };

  MF.defaultParams = function (effect) {
    var o = {};
    effect.params.forEach(function (pd) { o[pd.k] = pd.def; });
    return o;
  };

  /* ------------------------------ 光栅绘制 ------------------------------ */
  MF.paint = function (ctx, effect, params, t, cfg) {
    var W = cfg.w, H = cfg.h;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (cfg.clear !== false) ctx.clearRect(0, 0, W, H);
    var U = window.MFCore.createUtils({
      W: W, H: H, D: cfg.duration, t: t,
      accent: cfg.accent, accent2: cfg.accent2, ink: cfg.ink,
      bg1: cfg.bg1, bg2: cfg.bg2, bgMode: cfg.bgMode, seed: cfg.seed
    });
    if (cfg.background !== false) window.MFCore.drawBackground(ctx, U, cfg);
    try {
      effect.draw(ctx, t, params, U);
    } catch (err) {
      if (!cfg.quiet) console.warn('[Jaykou] 效果渲染失败：' + effect.id, err);
    }
    ctx.restore();
  };

  /* ------------------------------ 颜色混合（用于转场） ------------------------------ */
  MF.blend = function (dst, src, a) {
    dst.save();
    dst.globalAlpha = a;
    dst.drawImage(src.canvas, 0, 0);
    dst.restore();
  };

  /* ------------------------------ 录制器 ------------------------------ */
  MF.recorder = {
    chunks: [],
    recorder: null,
    /* 以真实时间驱动一次完整播放，边播边录。
       format: 'mp4' | 'webm' | undefined(自动，优先 MP4) */
    start: function (canvas, fps, bitrate, format) {
      if (!window.MediaRecorder) return null;
      var MP4 = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'];
      var WEBM = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      var types = format === 'webm' ? WEBM : MP4.concat(WEBM);
      var mime = '';
      for (var i = 0; i < types.length; i++) {
        if (MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
      }
      this.mime = mime || 'video/webm';
      var stream = canvas.captureStream(fps || 60);
      var rec;
      try {
        rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: bitrate || 16000000 } : undefined);
      } catch (e) {
        rec = new MediaRecorder(stream);
      }
      this.chunks = [];
      var self = this;
      rec.ondataavailable = function (e) { if (e.data && e.data.size) self.chunks.push(e.data); };
      this.recorder = rec;
      rec.start(120);
      return rec;
    },
    stop: function () {
      var self = this;
      return new Promise(function (resolve) {
        var rec = self.recorder;
        if (!rec) return resolve(null);
        rec.onstop = function () {
          var blob = new Blob(self.chunks, { type: self.mime || 'video/webm' });
          self.recorder = null;
          resolve(blob);
        };
        if (rec.state !== 'inactive') rec.stop(); else resolve(null);
      });
    }
  };

  /* ------------------------------ 导出产物生成 ------------------------------ */
  MF.download = function (blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1200);
  };

  MF.downloadText = function (text, filename, mime) {
    MF.download(new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' }), filename);
  };

  /* 生成「单文件可播放 HTML」——把运行时 + 该效果的 draw 源码 + 当前参数一起打包 */
  MF.buildStandaloneHTML = function (scene, settings) {
    var effect = MF.byId[scene.id];
    var p = MF.resolveParams(effect, scene.params, settings);
    var R = MF.ratios[settings.ratio] || MF.ratios['16:9'];
    var title = effect.name + ' · 嘉Jaykou动效工作台';
    var cfg = {
      w: R.w, h: R.h, duration: scene.duration || effect.dur,
      accent: settings.accent, accent2: settings.accent2, ink: settings.ink,
      bg1: settings.bg1, bg2: settings.bg2, bgMode: settings.bgMode, seed: settings.seed
    };
    return [
      '<!doctype html>',
      '<html lang="zh-CN"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>' + escapeHTML(title) + '</title>',
      '<style>',
      '  html,body{margin:0;height:100%;background:#07080b;overflow:hidden}',
      '  #wrap{position:fixed;inset:0;display:grid;place-items:center}',
      '  canvas{max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;display:block}',
      '  .bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:8px;',
      '       padding:7px 10px;border-radius:999px;background:rgba(14,16,22,.72);backdrop-filter:blur(12px);',
      '       border:1px solid rgba(255,255,255,.09);opacity:0;transition:.28s;font:600 13px/1 ' + 'system-ui,sans-serif}',
      '  #wrap:hover+.bar,.bar:hover{opacity:1}',
      '  .bar button{cursor:pointer;border:0;border-radius:999px;padding:8px 14px;background:rgba(255,255,255,.08);color:#fff;font:inherit}',
      '  .bar button:hover{background:rgba(255,255,255,.16)}',
      '  .bar span{color:#9aa3b5;font-weight:500;padding:8px 6px}',
      '</style></head><body>',
      '<div id="wrap"><canvas id="cv" width="' + cfg.w + '" height="' + cfg.h + '"></canvas></div>',
      '<div class="bar"><button id="pp">暂停</button><button id="rp">重播</button><span id="tm"></span></div>',
      '<script>' + window.MF_RUNTIME_SRC + '<\/script>',
      '<script>',
      'var CFG=' + JSON.stringify(cfg) + ';',
      'var P=' + JSON.stringify(p) + ';',
      'var DRAW=' + effect.draw.toString() + ';',
      'var cv=document.getElementById("cv"),ctx=cv.getContext("2d");',
      'var D=CFG.duration,t=0,last=performance.now(),playing=true,loops=Infinity;',
      'function frame(now){',
      '  var dt=(now-last)/1000;last=now;',
      '  if(playing)t+=dt;',
      '  if(t>D){t-=D;}',
      '  var U=MFCore.createUtils({W:CFG.w,H:CFG.h,D:D,t:t,accent:CFG.accent,accent2:CFG.accent2,',
      '     ink:CFG.ink,bg1:CFG.bg1,bg2:CFG.bg2,bgMode:CFG.bgMode,seed:CFG.seed});',
      '  ctx.clearRect(0,0,CFG.w,CFG.h);MFCore.drawBackground(ctx,U,CFG);',
      '  ctx.save();DRAW(ctx,t,P,U);ctx.restore();',
      '  document.getElementById("tm").textContent=t.toFixed(1)+"s / "+D+"s";',
      '  requestAnimationFrame(frame);',
      '}',
      'requestAnimationFrame(frame);',
      'document.getElementById("pp").onclick=function(){playing=!playing;this.textContent=playing?"暂停":"播放"};',
      'document.getElementById("rp").onclick=function(){t=0};',
      'cv.addEventListener("dblclick",function(){document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()});',
      '<\/script></body></html>'
    ].join('\n');
  };

  /* 生成 React 组件 */
  MF.buildReact = function (scene, settings) {
    var effect = MF.byId[scene.id];
    var p = MF.resolveParams(effect, scene.params, settings);
    var R = MF.ratios[settings.ratio] || MF.ratios['16:9'];
    var cfg = {
      w: R.w, h: R.h, duration: scene.duration || effect.dur,
      accent: settings.accent, accent2: settings.accent2, ink: settings.ink,
      bg1: settings.bg1, bg2: settings.bg2, bgMode: settings.bgMode, seed: settings.seed
    };
    return [
      '/* ' + effect.name + ' · 由 嘉Jaykou动效工作台 生成 */',
      "import { useEffect, useRef } from 'react';",
      '',
      window.MF_RUNTIME_SRC,
      '',
      'const CFG = ' + JSON.stringify(cfg, null, 2) + ';',
      'const PARAMS = ' + JSON.stringify(p, null, 2) + ';',
      '',
      'const draw = ' + effect.draw.toString() + ';',
      '',
      'export default function ' + pascal(effect.id) + '({ loop = true, className }) {',
      '  const ref = useRef(null);',
      '  useEffect(() => {',
      '    const cv = ref.current;',
      '    const ctx = cv.getContext("2d");',
      '    let t = 0, last = performance.now(), raf = 0;',
      '    const frame = (now) => {',
      '      const dt = (now - last) / 1000; last = now;',
      '      t += dt;',
      '      if (t > CFG.duration) t = loop ? t - CFG.duration : CFG.duration;',
      '      const U = window.MFCore.createUtils({ W: CFG.w, H: CFG.h, D: CFG.duration, t,',
      '        accent: CFG.accent, accent2: CFG.accent2, ink: CFG.ink,',
      '        bg1: CFG.bg1, bg2: CFG.bg2, bgMode: CFG.bgMode, seed: CFG.seed });',
      '      ctx.clearRect(0, 0, CFG.w, CFG.h);',
      '      window.MFCore.drawBackground(ctx, U, CFG);',
      '      ctx.save(); draw(ctx, t, PARAMS, U); ctx.restore();',
      '      raf = requestAnimationFrame(frame);',
      '    };',
      '    raf = requestAnimationFrame(frame);',
      '    return () => cancelAnimationFrame(raf);',
      '  }, [loop]);',
      '  return <canvas ref={ref} width={CFG.w} height={CFG.h} className={className}',
      '    style={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }} />;',
      '}'
    ].join('\n');
  };

  MF.buildEmbed = function (scene, settings) {
    var R = MF.ratios[settings.ratio] || MF.ratios['16:9'];
    return '<iframe src="' + 'YOUR_HOST/' + scene.id + '.html' + '" width="' + R.w + '" height="' + R.h +
      '" style="border:0;border-radius:14px;max-width:100%" allowfullscreen loading="lazy" title="' +
      MF.byId[scene.id].name + '"></iframe>';
  };

  /* 参数写入 URL，便于分享 / 复现 */
  MF.encodeShare = function (state) {
    var payload = {
      e: state.id,
      p: state.params,
      s: {
        a: state.settings.accent, a2: state.settings.accent2, ink: state.settings.ink,
        b1: state.settings.bg1, b2: state.settings.bg2, bg: state.settings.bgMode,
        sd: state.settings.seed, r: state.settings.ratio
      }
    };
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (e) { return ''; }
  };

  MF.decodeShare = function (str) {
    try {
      var o = JSON.parse(decodeURIComponent(escape(atob(str))));
      return {
        id: o.e, params: o.p || {},
        settings: {
          accent: o.s.a, accent2: o.s.a2, ink: o.s.ink,
          bg1: o.s.b1, bg2: o.s.b2, bgMode: o.s.bg, seed: o.s.sd, ratio: o.s.r
        }
      };
    } catch (e) { return null; }
  };

  /* 生成收藏集分享页：一个自包含 HTML，网格内全部实时动画
     opts: { light: true } 输出浅色版式（默认深色画廊） */
  MF.buildCollectionHTML = function (ids, settings, opts) {
    var s = settings || MF.defaultSettings;
    var light = !!(opts && opts.light);
    var C = light
      ? { page: '#f6f7fa', card: '#ffffff', line: 'rgba(12,14,22,.10)', text: '#12141c', sub: '#69707f', cvbg: '#ffffff', colorScheme: 'light' }
      : { page: '#0a0b10', card: '#0d0f16', line: 'rgba(255,255,255,.08)', text: '#eef1f7', sub: '#8b93a7', cvbg: '#06070a', colorScheme: 'dark' };
    var items = [];
    ids.forEach(function (id) {
      var eff = MF.byId[id];
      if (!eff) return;
      items.push({
        id: eff.id, name: eff.name, cat: eff.cat || '', dur: eff.dur,
        params: MF.resolveParams(eff, null, s),
        draw: eff.draw.toString()
      });
    });
    var title = '我的收藏集 · ' + items.length + ' 个动效 · 嘉Jaykou动效工作台';
    return [
      '<!doctype html>',
      '<html lang="zh-CN"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>' + escapeHTML(title) + '</title>',
      '<style>',
      '  :root{color-scheme:' + C.colorScheme + '}',
      '  html,body{margin:0;background:' + C.page + ';color:' + C.text + ';font:15px/1.6 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}',
      '  header{padding:34px 28px 10px;max-width:1280px;margin:0 auto;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}',
      '  header h1{font-size:24px;margin:0;letter-spacing:-.01em}',
      '  header em{font-style:normal;color:' + C.sub + ';font-size:13px}',
      '  header .dot{color:' + s.accent + '}',
      '  .grid{max-width:1280px;margin:18px auto 60px;padding:0 28px;display:grid;gap:22px;grid-template-columns:repeat(auto-fill,minmax(380px,1fr))}',
      '  .card{border:1px solid ' + C.line + ';border-radius:16px;overflow:hidden;background:' + C.card + '}',
      '  .card canvas{width:100%;aspect-ratio:16/9;display:block;background:' + C.cvbg + '}',
      '  .meta{display:flex;align-items:center;gap:10px;padding:12px 15px 14px}',
      '  .meta b{font-size:14.5px}',
      '  .meta span{margin-left:auto;color:' + C.sub + ';font-size:12px;font-family:ui-monospace,Menlo,monospace}',
      '  .empty{max-width:560px;margin:80px auto;text-align:center;color:' + C.sub + '}',
      '  @media(max-width:560px){.grid{grid-template-columns:1fr;padding:0 16px}header{padding:24px 16px 6px}}',
      '</style></head><body>',
      '<header><h1>我的收藏集<span class="dot"> .</span></h1><em>' + items.length + ' 个动效 · 实时渲染 · 嘉Jaykou动效工作台出品</em></header>',
      items.length ? '<div class="grid" id="grid"></div>' : '<p class="empty">收藏集为空</p>',
      '<script>' + window.MF_RUNTIME_SRC + '<\/script>',
      '<script>',
      'var META=' + JSON.stringify(items.map(function (it) {
        return { id: it.id, name: it.name, cat: it.cat, dur: it.dur, params: it.params };
      })) + ';',
      'var SRCS=' + JSON.stringify(items.map(function (it) { return it.draw; })) + ';',
      'var FNS=SRCS.map(function(s){return eval("(" + s + ")");});',
      'var ST=' + JSON.stringify({ accent: s.accent, accent2: s.accent2, ink: s.ink, bg1: s.bg1, bg2: s.bg2, bgMode: s.bgMode, seed: s.seed }) + ';',
      'var grid=document.getElementById("grid"),io=null;',
      'if("IntersectionObserver" in window){io=new IntersectionObserver(function(es){es.forEach(function(en){',
      '  var r=en.target._rec;if(en.isIntersecting&&!r.on){r.on=true;r.last=0;loop(r);}else if(!en.isIntersecting&&r.on){r.on=false;}',
      '});},{rootMargin:"160px"});}',
      'META.forEach(function(it,i){',
      '  var card=document.createElement("div");card.className="card";',
      '  var cv=document.createElement("canvas");cv.width=560;cv.height=315;',
      '  var meta=document.createElement("div");meta.className="meta";',
      '  meta.innerHTML="<b>"+it.name+"</b><span>"+it.dur+"s · "+it.cat+"</span>";',
      '  card.appendChild(cv);card.appendChild(meta);grid.appendChild(card);',
      '  var rec={ctx:cv.getContext("2d"),cv:cv,it:it,fn:FNS[i],t:i*0.7,last:0,on:false};card._rec=rec;',
      '  if(io)io.observe(card);else{rec.on=true;loop(rec);}',
      '});',
      'function loop(r){',
      '  if(!r.on)return;',
      '  var now=performance.now();',
      '  var dt=r.last?Math.min(.05,(now-r.last)/1000):0;r.last=now;',
      '  r.t=(r.t+dt)%r.it.dur;',
      '  var U=MFCore.createUtils({W:r.cv.width,H:r.cv.height,D:r.it.dur,t:r.t,accent:ST.accent,accent2:ST.accent2,',
      '    ink:ST.ink,bg1:ST.bg1,bg2:ST.bg2,bgMode:ST.bgMode,seed:ST.seed});',
      '  r.ctx.setTransform(1,0,0,1,0,0);r.ctx.clearRect(0,0,r.cv.width,r.cv.height);',
      '  MFCore.drawBackground(r.ctx,U,{w:r.cv.width,h:r.cv.height,bgMode:ST.bgMode,bg1:ST.bg1,bg2:ST.bg2});',
      '  try{r.ctx.save();r.fn(r.ctx,r.t,r.it.params,U);r.ctx.restore();}catch(e){}',
      '  requestAnimationFrame(function(){loop(r);});',
      '}',
      '<\/script></body></html>'
    ].join('\n');
  };

  function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function pascal(id) {
    return String(id).split(/[^a-z0-9]+/i).filter(Boolean)
      .map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join('') || 'MotionScene';
  }
  MF.pascal = pascal;
})();

/* ════════ assets/js/effects-01.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 01
   文字与排版 / 数据可视化 / 镜头与转场
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* ══════════════════════════ 文字与排版 ══════════════════════════ */

  MF.register({
    id: 'kinetic-type', name: '动态标题', cat: '文字与排版', type: 'block', dur: 6, poster: 0.8,
    desc: '逐词上浮的动感标题，跟随下划线扫光与副标题淡入，节奏短促有力，适合开场与章节标题。',
    tags: ['标题', '开场', '上浮'],
    params: [
      { k: 'text', label: '标题文案', type: 'textarea', def: 'MAKE IT MOVE' },
      { k: 'sub', label: '副标题', type: 'text', def: 'JAYKOU · 动效工作台' },
      { k: 'size', label: '字号', type: 'range', min: 40, max: 300, step: 2, def: 200 },
      { k: 'weight', label: '字重', type: 'select', options: [['900', '特粗'], ['700', '粗体'], ['500', '中黑']], def: '900' },
      { k: 'align', label: '对齐', type: 'select', options: [['center', '居中'], ['left', '左对齐']], def: 'center' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var words = String(p.text || '').split(/\s+/).filter(Boolean);
      if (!words.length) return;
      var size = p.size * S;
      ctx.font = U.fs(size, p.weight);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      var widths = words.map(function (w) { return ctx.measureText(w).width; });
      var gaps = size * 0.3;
      var total = widths.reduce(function (a, b) { return a + b; }, 0) + gaps * (words.length - 1);
      var cx = p.align === 'center' ? W / 2 : W * 0.1;
      var x0 = p.align === 'center' ? cx - total / 2 : cx;
      var cy = H * 0.48;
      var cursor = x0;
      for (var i = 0; i < words.length; i++) {
        var pr = U.clamp((t - 0.35 - i * 0.1) / 0.85, 0, 1);
        var k = e.outExpo(pr);
        ctx.save();
        ctx.globalAlpha = U.clamp(pr * 2.4, 0, 1);
        ctx.translate(cursor + widths[i] / 2, cy + (1 - k) * size * 0.8);
        ctx.rotate((1 - k) * 0.05 * (i % 2 ? -1 : 1));
        var g = ctx.createLinearGradient(-widths[i] / 2, 0, widths[i] / 2, 0);
        g.addColorStop(0, U.ink);
        g.addColorStop(1, U.mix(U.ink, U.accent, 0.6));
        ctx.fillStyle = g;
        ctx.fillText(words[i], -widths[i] / 2, 0);
        ctx.restore();
        cursor += widths[i] + gaps;
      }
      var up = e.outQuint(U.clamp((t - 1.15) / 0.85, 0, 1));
      var uw = total * up;
      var ux = p.align === 'center' ? cx - uw / 2 : x0;
      var g2 = ctx.createLinearGradient(ux, 0, ux + uw, 0);
      g2.addColorStop(0, U.accent);
      g2.addColorStop(1, U.accent2);
      ctx.save();
      ctx.fillStyle = g2;
      ctx.fillRect(ux, cy + size * 0.66, uw, 4 * S);
      ctx.shadowColor = U.rgba(U.accent, 0.9);
      ctx.shadowBlur = 26 * S;
      ctx.fillRect(ux, cy + size * 0.66, uw, 4 * S);
      ctx.restore();
      var sp = e.outCubic(U.clamp((t - 1.5) / 0.8, 0, 1));
      ctx.save();
      ctx.globalAlpha = sp * 0.7;
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(22 * S, 500);
      ctx.textAlign = p.align === 'center' ? 'center' : 'left';
      ctx.fillText(p.sub || '', p.align === 'center' ? cx : x0, cy + size * 0.66 + 52 * S);
      ctx.restore();
    }
  });

  MF.register({
    id: 'type-mask', name: '遮罩文字', cat: '文字与排版', type: 'block', dur: 7, poster: 0.85,
    desc: '粗字被斜向光带扫过填充，字体内流动渐变与细条纹，收尾带一层虚化重影，气质偏品牌大片。',
    tags: ['标题', '渐变', '扫光'],
    params: [
      { k: 'text', label: '文案', type: 'text', def: 'MOTION' },
      { k: 'size', label: '字号', type: 'range', min: 80, max: 320, step: 4, def: 190 },
      { k: 'sweep', label: '扫光速度', type: 'range', min: 0.3, max: 3, step: 0.1, def: 1 },
      { k: 'ghost', label: '重影强度', type: 'range', min: 0, max: 1, step: 0.02, def: 0.35 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var size = p.size * S, txt = String(p.text || 'MOTION');
      var pr = e.outExpo(U.clamp(t / 1.1, 0, 1));
      ctx.save();
      ctx.globalAlpha = pr;
      ctx.translate(W / 2, H / 2);
      ctx.scale(1.16 - 0.16 * pr, 1.16 - 0.16 * pr);
      ctx.font = U.fs(size, 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var w = ctx.measureText(txt).width;
      if (p.ghost > 0.02) {
        for (var k = 3; k >= 1; k--) {
          ctx.save();
          ctx.globalAlpha = pr * p.ghost * (0.1 * k);
          ctx.translate(k * 16 * S * (1 - pr), 0);
          ctx.fillStyle = k % 2 ? U.accent2 : U.accent;
          ctx.fillText(txt, 0, 0);
          ctx.restore();
        }
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(-w / 2 - size * 0.2, -size, w + size * 0.4, size * 2);
      ctx.clip();
      var g = ctx.createLinearGradient(-w / 2, -size * 0.5, w / 2, size * 0.5);
      g.addColorStop(0, U.ink);
      g.addColorStop(0.45, U.mix(U.ink, U.accent, 0.85));
      g.addColorStop(0.72, U.accent2);
      g.addColorStop(1, U.mix(U.accent2, U.ink, 0.35));
      ctx.fillStyle = g;
      ctx.fillText(txt, 0, 0);
      /* 斜向流动条纹 */
      ctx.globalCompositeOperation = 'overlay';
      var band = size * 0.5, travel = w * 1.6, off = ((t * p.sweep * 0.55) % 1) * travel - travel / 2;
      for (var i = -3; i < 10; i++) {
        var bx = off + i * band;
        ctx.save();
        ctx.translate(bx, 0);
        ctx.rotate(-0.35);
        ctx.fillStyle = U.rgba('#FFFFFF', 0.055);
        ctx.fillRect(0, -size, band * 0.42, size * 2.4);
        ctx.restore();
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = pr * 0.85;
      ctx.lineWidth = 1.4 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.55);
      ctx.strokeText(txt, 0, 0);
      ctx.restore();
      ctx.restore();
    }
  });

  MF.register({
    id: 'char-scatter', name: '字符散落', cat: '文字与排版', type: 'block', dur: 6, poster: 0.9,
    desc: '每个字符从画布外的随机位置带着旋转飞入，落位后轻微回弹，适合制造有张力的标题运动。',
    tags: ['标题', '散落', '弹性'],
    params: [
      { k: 'text', label: '文案', type: 'text', def: 'FLUX' },
      { k: 'size', label: '字号', type: 'range', min: 60, max: 400, step: 4, def: 280 },
      { k: 'spread', label: '散落范围', type: 'range', min: 0.2, max: 1.4, step: 0.05, def: 0.75 },
      { k: 'easing', label: '缓动', type: 'select', options: [['outBack', '回弹'], ['outExpo', '急速'], ['outElastic', '弹性']], def: 'outBack' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var chars = String(p.text || 'FLUX').split('');
      var size = p.size * S;
      ctx.font = U.fs(size, 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var track = size * 0.62;
      var total = track * (chars.length - 1);
      for (var i = 0; i < chars.length; i++) {
        var d = i * 0.07;
        var pr = U.clamp((t - 0.3 - d) / 1.05, 0, 1);
        var k = e[p.easing](pr);
        var ax = U.rnd(-1, 1, i * 13.7 + 2) * W * 0.7 * p.spread;
        var ay = U.rnd(-1, 1, i * 7.31 + 9) * H * 0.7 * p.spread;
        var ang = U.rnd(-1, 1, i * 3.7 + 4) * 1.5;
        var x = W / 2 - total / 2 + i * track + (1 - k) * ax;
        var y = H / 2 + (1 - k) * ay;
        ctx.save();
        ctx.globalAlpha = U.clamp(pr * 1.8, 0, 1);
        ctx.translate(x, y);
        ctx.rotate((1 - k) * ang);
        var g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
        g.addColorStop(0, U.ink);
        g.addColorStop(1, U.mix(U.ink, U.accent2, 0.5));
        ctx.fillStyle = g;
        ctx.fillText(chars[i], 0, 0);
        ctx.restore();
      }
      var lp = e.outCubic(U.clamp((t - 1.5) / 1, 0, 1));
      ctx.save();
      ctx.globalAlpha = lp * 0.5;
      ctx.strokeStyle = U.rgba(U.accent, 0.8);
      ctx.lineWidth = 2 * S;
      ctx.beginPath();
      ctx.moveTo(W / 2 - total / 2 - size * 0.5, H / 2 + size * 0.66);
      ctx.lineTo(W / 2 - total / 2 - size * 0.5 + (total + size) * lp, H / 2 + size * 0.66);
      ctx.stroke();
      ctx.restore();
    }
  });

  MF.register({
    id: 'marquee-echo', name: '回声跑马灯', cat: '文字与排版', type: 'block', dur: 8, poster: 0.6,
    desc: '两条巨型文字反向横向滚动，下方带镜像倒影与渐隐遮罩，适合循环播放的视觉背景。',
    tags: ['跑马灯', '循环', '倒影'],
    params: [
      { k: 'text', label: '文案', type: 'text', def: 'KEEP IT MOVING' },
      { k: 'size', label: '字号', type: 'range', min: 60, max: 260, step: 4, def: 150 },
      { k: 'speed', label: '速度', type: 'range', min: 0.2, max: 3, step: 0.1, def: 1 },
      { k: 'rows', label: '行数', type: 'range', min: 1, max: 3, step: 1, def: 2 },
      { k: 'outline', label: '描边行', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var size = p.size * S, txt = (p.text || '') + '   ·   ';
      ctx.font = U.fs(size, 900);
      ctx.textBaseline = 'middle';
      var unit = ctx.measureText(txt).width;
      var rows = Math.round(p.rows);
      for (var r = 0; r < rows; r++) {
        var dir = r % 2 ? -1 : 1;
        var y = H * (0.5 + (r - (rows - 1) / 2) * 0.34);
        var offset = ((t * p.speed * 130 * S * dir) % unit + unit) % unit;
        ctx.save();
        var outlineRow = p.outline && r === rows - 1;
        for (var x = -unit - offset; x < W + unit; x += unit) {
          ctx.save();
          ctx.translate(x, y);
          if (outlineRow) {
            ctx.strokeStyle = U.rgba(U.ink, 0.42);
            ctx.lineWidth = 2 * S;
            ctx.strokeText(txt, 0, 0);
          } else {
            var g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
            g.addColorStop(0, U.ink);
            g.addColorStop(1, U.rgba(U.accent, 0.75));
            ctx.fillStyle = g;
            ctx.fillText(txt, 0, 0);
          }
          ctx.restore();
        }
        /* 倒影 */
        if (!outlineRow) {
          ctx.save();
          ctx.globalAlpha = 0.16;
          ctx.translate(0, y + size * 0.95);
          ctx.scale(1, -1);
          for (var x2 = -unit - offset; x2 < W + unit; x2 += unit) {
            ctx.save();
            ctx.translate(x2, 0);
            ctx.fillStyle = U.accent;
            ctx.fillText(txt, 0, 0);
            ctx.restore();
          }
          ctx.restore();
        }
        ctx.restore();
      }
      var m = ctx.createLinearGradient(0, 0, 0, H);
      m.addColorStop(0, U.rgba(U.bg1, 1));
      m.addColorStop(0.18, U.rgba(U.bg1, 0));
      m.addColorStop(0.82, U.rgba(U.bg1, 0));
      m.addColorStop(1, U.rgba(U.bg1, 1));
      ctx.fillStyle = m;
      ctx.fillRect(0, 0, W, H);
    }
  });

  /* ══════════════════════════ 数据可视化 ══════════════════════════ */

  MF.register({
    id: 'bar-race', name: '柱状竞速', cat: '数据可视化', type: 'block', dur: 9, poster: 0.7,
    desc: '横向长条随数值增长持续换位，排名实时更新，标签跟随移动，适合表现增长与排名变化。',
    tags: ['图表', '排名', '增长'],
    params: [
      { k: 'labels', label: '条目（逗号分隔）', type: 'textarea', def: 'Alpha,Bravo,Charlie,Delta,Echo,Foxtrot' },
      { k: 'slot', label: '换位间隔(秒)', type: 'range', min: 0.6, max: 3, step: 0.1, def: 1.6 },
      { k: 'barH', label: '条高', type: 'range', min: 0.4, max: 1, step: 0.02, def: 0.72 },
      { k: 'showValue', label: '显示数值', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var names = String(p.labels || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = names.length;
      if (!n) return;
      var vals = names.map(function (_, i) {
        var base = 22 + 78 * U.rng(i * 5.13 + 1);
        var rate = 4 + 26 * U.rng(i * 2.71 + 5);
        return base + t * rate;
      });
      var maxV = Math.max.apply(null, vals);
      function rankAt(tt) {
        var v = names.map(function (_, i) { return 22 + 78 * U.rng(i * 5.13 + 1) + tt * (4 + 26 * U.rng(i * 2.71 + 5)); });
        var idx = names.map(function (_, i) { return i; });
        idx.sort(function (a, b) { return v[b] - v[a]; });
        var rank = {};
        idx.forEach(function (id, r) { rank[id] = r; });
        return rank;
      }
      var top = H * 0.2, bottom = H * 0.88;
      var rowH = (bottom - top) / n;
      var barH = rowH * p.barH;
      var labelW = W * 0.19;
      var maxW = W * 0.6;
      /* 排名是时间上的阶跃函数，直接取用会导致跳变。
         这里对一小段滚动窗口内的排名做加权平均，把换位变成平滑的插值运动。 */
      function smoothRank(tv, i) {
        var acc = 0, wsum = 0;
        for (var k = -3; k <= 3; k++) {
          var tt = Math.max(0, tv + k * 0.09);
          var wgt = 1 - Math.abs(k) / 4;
          acc += rankAt(tt)[i] * wgt;
          wsum += wgt;
        }
        return acc / wsum;
      }
      for (var i = 0; i < n; i++) {
        var ry = smoothRank(t, i);
        var y = top + ry * rowH;
        var appear = e.outCubic(U.clamp((t - i * 0.05) / 0.6, 0, 1));
        var w = (vals[i] / maxV) * maxW * appear;
        ctx.save();
        ctx.globalAlpha = appear;
        var h = barH;
        U.rr(ctx, labelW, y + (rowH - h) / 2, Math.max(w, 0.001), h, h * 0.24);
        var g = ctx.createLinearGradient(labelW, 0, labelW + Math.max(w, 1), 0);
        g.addColorStop(0, U.accent);
        g.addColorStop(1, U.accent2);
        ctx.fillStyle = g;
        ctx.shadowColor = U.rgba(U.accent, 0.32);
        ctx.shadowBlur = 22 * S;
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = appear;
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(24 * S, 700);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i], labelW - 22 * S, y + rowH / 2);
        if (p.showValue) {
          ctx.textAlign = 'left';
          ctx.font = U.fs(20 * S, 600, true);
          ctx.fillStyle = U.mix(U.ink, U.accent, 0.35);
          ctx.fillText(Math.round(vals[i]), labelW + Math.max(w, 1) + 18 * S, y + rowH / 2);
        }
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = U.rgba(U.ink, 0.1);
      ctx.lineWidth = 1 * S;
      ctx.beginPath();
      ctx.moveTo(labelW, H * 0.14);
      ctx.lineTo(labelW, H * 0.92);
      ctx.stroke();
      ctx.restore();
    }
  });

  MF.register({
    id: 'line-grow', name: '折线生长', cat: '数据可视化', type: 'block', dur: 8, poster: 0.8,
    desc: '折线从左向右生长，主序列带渐变面积与跟随光点，网格与坐标轴同步淡入，可替换多组序列。',
    tags: ['折线图', '面积图', '趋势'],
    params: [
      { k: 'series', label: '序列数', type: 'range', min: 1, max: 4, step: 1, def: 3 },
      { k: 'points', label: '数据点数', type: 'range', min: 6, max: 40, step: 1, def: 16 },
      { k: 'amp', label: '波动幅度', type: 'range', min: 0.1, max: 1, step: 0.05, def: 0.6 },
      { k: 'dot', label: '跟随光点', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var n = Math.round(p.points), sn = Math.round(p.series);
      var x0 = W * 0.11, x1 = W * 0.9, y0 = H * 0.22, y1 = H * 0.84;
      ctx.save();
      ctx.globalAlpha = e.outCubic(U.clamp(t / 0.8, 0, 1)) * 0.55;
      ctx.strokeStyle = U.rgba(U.ink, 0.16);
      ctx.lineWidth = 1 * S;
      ctx.beginPath();
      for (var i = 0; i <= 5; i++) {
        var gy = U.lerp(y0, y1, i / 5);
        ctx.moveTo(x0, gy); ctx.lineTo(x1, gy);
      }
      ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.restore();
      for (var s = 0; s < sn; s++) {
        var pts = [];
        for (var j = 0; j < n; j++) {
          var v = 0.5 + 0.42 * Math.sin(j * 0.55 + s * 2.1) * p.amp + U.rng(j * 3.3 + s * 17.1) * 0.28 * p.amp - 0.14 * p.amp;
          v = U.clamp(v, 0.04, 0.98);
          pts.push([U.lerp(x0, x1, j / (n - 1)), U.lerp(y1, y0, v)]);
        }
        var prog = e.inOutCubic(U.clamp((t - 0.25 - s * 0.22) / 2.1, 0, 1));
        var pos = prog * (n - 1);
        var lastIdx = Math.min(n - 1, Math.floor(pos));
        var nextIdx = Math.min(n - 1, lastIdx + 1);
        var frac = pos - lastIdx;
        var tipX = U.lerp(pts[lastIdx][0], pts[nextIdx][0], frac);
        var tipY = U.lerp(pts[lastIdx][1], pts[nextIdx][1], frac);
        var isMain = s === 0;
        var col = isMain ? U.accent : (s === 1 ? U.accent2 : U.mix(U.accent2, U.ink, 0.45));
        ctx.save();
        if (isMain) {
          var ag = ctx.createLinearGradient(0, y0, 0, y1);
          ag.addColorStop(0, U.rgba(U.accent, 0.4));
          ag.addColorStop(1, U.rgba(U.accent, 0));
          ctx.beginPath();
          ctx.moveTo(pts[0][0], y1);
          for (var k = 0; k <= lastIdx; k++) ctx.lineTo(pts[k][0], pts[k][1]);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(tipX, y1);
          ctx.closePath();
          ctx.fillStyle = ag;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.lineWidth = (isMain ? 4.5 : 2.6) * S;
        ctx.strokeStyle = col;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = U.rgba(col, 0.6);
        ctx.shadowBlur = isMain ? 20 * S : 0;
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (var m = 1; m <= lastIdx; m++) ctx.lineTo(pts[m][0], pts[m][1]);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.restore();
        if (isMain && p.dot) {
          ctx.save();
          ctx.globalAlpha = U.clamp((t - 2.4) / 0.4, 0, 1);
          ctx.fillStyle = U.ink;
          ctx.shadowColor = U.accent;
          ctx.shadowBlur = 30 * S;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 7 * S, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          var pulse = 1 + 0.5 * Math.sin(t * 6);
          ctx.strokeStyle = U.rgba(U.accent, 0.55);
          ctx.lineWidth = 2 * S;
          ctx.arc(tipX, tipY, 14 * S * pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  });

  MF.register({
    id: 'donut-progress', name: '环形进度', cat: '数据可视化', type: 'block', dur: 7, poster: 0.85,
    desc: '双层圆环从零度开始生长，中心数字同步滚动计数，外圈刻度随进度点亮并带轻微辉光。',
    tags: ['环形图', '进度', '计数'],
    params: [
      { k: 'label', label: '标签', type: 'text', def: 'COMPLETION' },
      { k: 'value', label: '目标数值', type: 'range', min: 1, max: 100, step: 1, def: 87 },
      { k: 'ticks', label: '刻度数量', type: 'range', min: 0, max: 120, step: 4, def: 72 },
      { k: 'thick', label: '环粗', type: 'range', min: 6, max: 80, step: 1, def: 26 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cx = W / 2, cy = H * 0.5, R = Math.min(W, H) * 0.28;
      var val = p.value;
      var prog = e.inOutCubic(U.clamp((t - 0.25) / 2.6, 0, 1));
      var shown = val * prog;
      ctx.save();
      ctx.lineWidth = p.thick * S;
      ctx.lineCap = 'round';
      ctx.strokeStyle = U.rgba(U.ink, 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      var start = -Math.PI / 2;
      var g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      g.addColorStop(0, U.accent);
      g.addColorStop(1, U.accent2);
      ctx.strokeStyle = g;
      ctx.shadowColor = U.rgba(U.accent, 0.75);
      ctx.shadowBlur = 34 * S;
      ctx.lineWidth = p.thick * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, R, start, start + Math.PI * 2 * (shown / 100));
      ctx.stroke();
      ctx.restore();
      var ticks = Math.round(p.ticks);
      for (var i = 0; i < ticks; i++) {
        var a = start + (Math.PI * 2 * i) / ticks;
        var lit = (i / ticks) * 100 <= shown;
        var r1 = R + p.thick * S * 0.85, r2 = r1 + (lit ? 16 : 9) * S;
        ctx.save();
        ctx.strokeStyle = lit ? U.rgba(U.accent, 0.95) : U.rgba(U.ink, 0.14);
        ctx.lineWidth = (lit ? 2.4 : 1.4) * S;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(96 * S, 900);
      ctx.fillText(Math.round(shown) + '', cx, cy - 8 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.font = U.fs(20 * S, 600);
      ctx.fillText(p.label || '', cx, cy + 62 * S);
      ctx.restore();
    }
  });

  MF.register({
    id: 'hex-heatmap', name: '六边形热力图', cat: '数据可视化', type: 'block', dur: 9, poster: 0.75,
    desc: '六边形网格按噪声场逐格点亮，亮部随时间缓慢流动，可作数据密度图或抽象底纹。',
    tags: ['网格', '热力', '数据'],
    params: [
      { k: 'cell', label: '单元尺寸', type: 'range', min: 20, max: 90, step: 2, def: 46 },
      { k: 'rough', label: '噪声频率', type: 'range', min: 0.2, max: 3, step: 0.05, def: 1 },
      { k: 'speed', label: '流动速度', type: 'range', min: 0, max: 1.5, step: 0.05, def: 0.35 },
      { k: 'glow', label: '辉光', type: 'range', min: 0, max: 1, step: 0.05, def: 0.5 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var cell = p.cell * S;
      var hw = cell, hh = cell * 0.866;
      var cols = Math.ceil(W / (hw * 1.5)) + 2;
      var rows = Math.ceil(H / (hh * 2)) + 2;
      for (var r = -1; r < rows; r++) {
        for (var c = -1; c < cols; c++) {
          var cx = c * hw * 1.5;
          var cy = r * hh * 2 + (c % 2 ? hh : 0);
          var nv = U.noise2(cx * 0.004 * p.rough, cy * 0.004 * p.rough + t * p.speed, 3);
          var k = U.clamp((nv + 1) / 2, 0, 1);
          var reveal = U.clamp((t - (c + r) * 0.045) / 0.7, 0, 1);
          var a = Math.pow(k, 1.35) * reveal;
          ctx.beginPath();
          for (var i = 0; i < 6; i++) {
            var ang = (Math.PI / 3) * i + Math.PI / 6;
            var px = cx + Math.cos(ang) * hw * 0.94;
            var py = cy + Math.sin(ang) * hw * 0.94;
            if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.closePath();
          if (a > 0.55 && p.glow > 0) {
            ctx.save();
            ctx.shadowColor = U.rgba(U.accent, 0.85);
            ctx.shadowBlur = 30 * S * p.glow;
            ctx.fillStyle = U.rgba(U.mix(U.accent, U.accent2, k), a * 0.95);
            ctx.fill();
            ctx.restore();
          } else {
            ctx.fillStyle = U.rgba(U.mix(U.accent2, U.accent, k), 0.24 + a * 0.76);
            ctx.fill();
          }
          ctx.strokeStyle = U.rgba(U.ink, 0.05);
          ctx.lineWidth = 1 * S;
          ctx.stroke();
        }
      }
    }
  });

  /* ══════════════════════════ 镜头与转场 ══════════════════════════ */

  MF.register({
    id: 'zoom-blur', name: '推镜转场', cat: '镜头与转场', type: 'block', dur: 5, poster: 0.8,
    desc: '全画幅放射状速度线持续推进，几何块面由远及近穿过镜头，营造高速推近的转场张力。',
    tags: ['转场', '推镜', '速度线'],
    params: [
      { k: 'rays', label: '速度线数量', type: 'range', min: 20, max: 240, step: 4, def: 110 },
      { k: 'speed', label: '推进速度', type: 'range', min: 0.2, max: 3, step: 0.1, def: 1.2 },
      { k: 'blocks', label: '块面数量', type: 'range', min: 0, max: 16, step: 1, def: 7 },
      { k: 'vignette', label: '暗角', type: 'range', min: 0, max: 1, step: 0.05, def: 0.75 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cx = W / 2, cy = H / 2, Max = Math.hypot(W, H) * 0.6;
      var phase = (t * p.speed * 0.5) % 1;
      var n = Math.round(p.rays);
      ctx.save();
      ctx.lineCap = 'round';
      for (var i = 0; i < n; i++) {
        var a = (Math.PI * 2 * i) / n + U.rng(i * 1.7) * 0.05;
        var r0 = 60 * S + ((phase + U.rng(i * 3.1)) % 1) * Max * 0.55;
        var len = 120 * S + U.rng(i * 5.9) * 420 * S * (0.4 + phase);
        var g = ctx.createLinearGradient(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0,
          cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
        g.addColorStop(0, U.rgba(U.accent, 0));
        g.addColorStop(0.5, U.rgba(i % 3 ? U.ink : U.accent2, 0.5));
        g.addColorStop(1, U.rgba(U.accent, 0));
        ctx.strokeStyle = g;
        ctx.lineWidth = (1 + U.rng(i * 7.7) * 3) * S;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
        ctx.stroke();
      }
      ctx.restore();
      var bn = Math.round(p.blocks);
      for (var b = 0; b < bn; b++) {
        var zb = ((phase + U.rng(b * 11.3) * 0.9) % 1);
        var scale = e.outExpo(zb) * 3.2;
        var w = W * 0.1 * scale, h = w * (0.4 + U.rng(b * 2.2) * 0.5);
        var ang = U.rng(b * 3.3) * Math.PI;
        var dist = zb * Max * 0.85;
        var dir = U.rng(b * 9.1) * Math.PI * 2;
        ctx.save();
        ctx.globalAlpha = U.clamp(1 - Math.abs(zb - 0.55) * 1.8, 0, 1) * 0.9;
        ctx.translate(cx + Math.cos(dir) * dist, cy + Math.sin(dir) * dist);
        ctx.rotate(ang + zb * 1.2);
        ctx.fillStyle = U.rgba(b % 2 ? U.accent : U.accent2, 0.5);
        ctx.strokeStyle = U.rgba(U.ink, 0.55);
        ctx.lineWidth = 2 * S;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.save();
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Max);
      rg.addColorStop(0, U.rgba(U.ink, 0.18));
      rg.addColorStop(0.2, U.rgba(U.accent, 0.05));
      rg.addColorStop(1, U.rgba(U.bg1, p.vignette));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  MF.register({
    id: 'glitch-slice', name: '故障切片', cat: '镜头与转场', type: 'block', dur: 4, poster: 0.55,
    desc: '画面被随机切片横向位移并叠加 RGB 通道分离，间歇性爆发，适合赛博、故障美学转场。',
    tags: ['故障', 'RGB 分离', '切换'],
    params: [
      { k: 'text', label: '文案', type: 'text', def: 'SIGNAL' },
      { k: 'freq', label: '爆发频率', type: 'range', min: 0.5, max: 6, step: 0.1, def: 2.4 },
      { k: 'power', label: '位移强度', type: 'range', min: 4, max: 160, step: 2, def: 56 },
      { k: 'split', label: '通道分离', type: 'range', min: 0, max: 1, step: 0.02, def: 0.6 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      /* 底图 */
      ctx.save();
      ctx.fillStyle = U.rgba(U.ink, 0.04);
      for (var i = 0; i < 24; i++) ctx.fillRect(0, (H / 24) * i, W, 1.2 * S);
      ctx.restore();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(150 * S, 900);
      var g = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.7);
      g.addColorStop(0, U.ink);
      g.addColorStop(1, U.mix(U.ink, U.accent2, 0.6));
      ctx.fillStyle = g;
      ctx.fillText(String(p.text || ''), W / 2, H / 2);
      ctx.restore();
      /* 故障爆发：用确定性哈希决定每个时间窗口是否触发 */
      var slot = Math.floor(t * p.freq);
      var local = (t * p.freq) % 1;
      var active = U.rng(slot * 3.7) > 0.45 && local < 0.42;
      var power = active ? (1 - local / 0.42) * p.power * S : 0;
      var slices = 14;
      for (var s = 0; s < slices; s++) {
        var sy = Math.floor(U.rng(slot * 5.1 + s) * H);
        var sh = 10 * S + U.rng(slot * 7.3 + s * 2.1) * 70 * S;
        var dx = (U.rng(slot * 11.7 + s * 3.3) * 2 - 1) * power;
        if (active && dx) {
          ctx.drawImage(ctx.canvas, 0, sy, W, sh, dx, sy, W, sh);
        }
        if (p.split > 0) {
          var amp = (power * 0.5 + 6 * S) * p.split * (U.rng(slot + s * 13) > 0.6 ? 1 : 0.25);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.35;
          ctx.drawImage(ctx.canvas, 0, sy, W, sh, U.rng(s + slot) * amp, sy, W, sh);
          ctx.restore();
        }
      }
      ctx.save();
      ctx.globalAlpha = 0.16 + (active ? 0.18 : 0);
      ctx.fillStyle = U.accent;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      ctx.save();
      var sc = ctx.createLinearGradient(0, 0, 0, H);
      sc.addColorStop(0, U.rgba(U.bg1, 0.5));
      sc.addColorStop(0.5, U.rgba(U.bg1, 0));
      sc.addColorStop(1, U.rgba(U.bg1, 0.55));
      ctx.fillStyle = sc;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  MF.register({
    id: 'wipe-diagonal', name: '斜切擦除', cat: '镜头与转场', type: 'block', dur: 6, poster: 0.5,
    desc: '前后两屏沿对角方向被光刃擦除切换，边缘带高亮光束与拖尾，适合内容分屏对切。',
    tags: ['转场', '擦除', '光束'],
    params: [
      { k: 'a', label: '首屏标题', type: 'text', def: 'BEFORE' },
      { k: 'b', label: '次屏标题', type: 'text', def: 'AFTER' },
      { k: 'angle', label: '切角(度)', type: 'range', min: -60, max: 60, step: 2, def: 26 },
      { k: 'beam', label: '光刃宽度', type: 'range', min: 10, max: 300, step: 5, def: 90 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var D = U.D;
      var raw = U.clamp((t - D * 0.28) / (D * 0.34), 0, 1);
      var prog = e.inOutQuint(raw);
      function panel(title, tint) {
        var g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, U.mix(U.bg2, tint, 0.22));
        g.addColorStop(1, U.bg1);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = U.rgba(U.ink, 0.07);
        ctx.lineWidth = 1 * S;
        ctx.beginPath();
        for (var x = 0; x < W; x += 70 * S) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (var y = 0; y < H; y += 70 * S) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = U.fs(120 * S, 900);
        ctx.fillStyle = U.ink;
        ctx.fillText(title, W / 2, H / 2);
        ctx.fillStyle = U.accent;
        ctx.fillRect(W / 2 - 90 * S, H / 2 + 90 * S, 180 * S, 4 * S);
        ctx.restore();
      }
      panel(p.a || 'A', U.accent);
      ctx.save();
      ctx.beginPath();
      var ang = (p.angle * Math.PI) / 180;
      var nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
      var L = W + H;
      var cx = W / 2, cy = H / 2;
      var d = (prog * 1.7 - 0.35) * L;
      ctx.moveTo(cx + nx * d + Math.cos(ang) * L, cy + ny * d + Math.sin(ang) * L);
      ctx.lineTo(cx + nx * d - Math.cos(ang) * L, cy + ny * d - Math.sin(ang) * L);
      ctx.lineTo(cx + nx * (d + L) - Math.cos(ang) * L, cy + ny * (d + L) - Math.sin(ang) * L);
      ctx.lineTo(cx + nx * (d + L) + Math.cos(ang) * L, cy + ny * (d + L) + Math.sin(ang) * L);
      ctx.closePath();
      ctx.clip();
      panel(p.b || 'B', U.accent2);
      ctx.restore();
      /* 光刃 */
      if (raw > 0 && raw < 1) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);
        ctx.globalCompositeOperation = 'lighter';
        var bg = ctx.createLinearGradient(-p.beam * S, 0, p.beam * S, 0);
        bg.addColorStop(0, U.rgba(U.accent, 0));
        bg.addColorStop(0.5, U.rgba('#FFFFFF', 0.9));
        bg.addColorStop(1, U.rgba(U.accent2, 0));
        ctx.fillStyle = bg;
        var bd = (prog * 1.7 - 0.35) * (W + H) / 2;
        ctx.fillRect(bd - p.beam * S, -L, p.beam * S * 2, L * 2);
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'tunnel-rings', name: '隧道穿越', cat: '镜头与转场', type: 'block', dur: 8, poster: 0.4,
    desc: '透视隧道中多边形环持续向镜头推进并旋转，中心有光核与色散，可用作无限穿越式背景。',
    tags: ['隧道', '透视', '无限'],
    params: [
      { k: 'rings', label: '环数量', type: 'range', min: 6, max: 40, step: 1, def: 18 },
      { k: 'sides', label: '边数', type: 'range', min: 3, max: 12, step: 1, def: 6 },
      { k: 'speed', label: '推进速度', type: 'range', min: 0.2, max: 2.5, step: 0.05, def: 0.85 },
      { k: 'twist', label: '扭转速度', type: 'range', min: 0, max: 2, step: 0.05, def: 0.5 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var cx = W / 2, cy = H / 2;
      var R = Math.round(p.rings), sides = Math.round(p.sides);
      var travel = (t * p.speed) % 1;
      var maxR = Math.hypot(W, H) * 0.62;
      var order = [];
      for (var i = 0; i < R; i++) {
        var f = ((i / R) + travel) % 1;   /* 0 = 隧道深处，1 = 贴近镜头 */
        order.push({ d: f, i: i });
      }
      order.sort(function (a, b) { return a.d - b.d; });
      ctx.save();
      var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220 * S);
      core.addColorStop(0, U.rgba('#FFFFFF', 0.95));
      core.addColorStop(0.25, U.rgba(U.accent, 0.5));
      core.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      for (var o = 0; o < order.length; o++) {
        var d = order[o].d;
        var sc = Math.pow(d, 2.3) * maxR;
        if (sc < 2 * S) continue;
        var alpha = U.clamp(d * 4, 0, 1) * (1 - Math.pow(d, 5) * 0.9);
        var rot = t * p.twist * (0.4 + d) + order[o].i * 0.2;
        ctx.save();
        ctx.translate(cx + Math.sin(order[o].i * 1.7) * d * W * 0.05, cy + Math.cos(order[o].i * 2.3) * d * H * 0.05);
        ctx.rotate(rot);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (var s2 = 0; s2 <= sides; s2++) {
          var a = (Math.PI * 2 * s2) / sides;
          var rr = sc * (0.9 + 0.08 * Math.sin(s2 * 3 + t * 2));
          var px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.82;
          if (s2) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.closePath();
        ctx.lineWidth = (1.2 + d * d * 9) * S;
        ctx.strokeStyle = o % 2 ? U.rgba(U.accent, 0.9) : U.rgba(U.accent2, 0.85);
        if (d > 0.5) {
          ctx.shadowColor = U.rgba(o % 2 ? U.accent : U.accent2, 0.8);
          ctx.shadowBlur = 26 * S;
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  });
})();

/* ════════ assets/js/effects-02.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 02
   空间与展示 / 品牌与标识 / 叙事与演示
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* ══════════════════════════ 空间与展示 ══════════════════════════ */

  MF.register({
    id: 'orbit-cards', name: '空间卡片', cat: '空间与展示', type: 'block', dur: 10, poster: 0.55,
    desc: '一叠卡片在三维空间中绕轴环绕，带透视缩放、彼此遮挡与地面反光，适合展示多条目并列。',
    tags: ['3D', '卡片', '环绕'],
    params: [
      { k: 'labels', label: '卡片文案（逗号分隔）', type: 'textarea', def: 'Strategy,Product,Growth,Brand,Data' },
      { k: 'radius', label: '轨道半径', type: 'range', min: 0.4, max: 1.6, step: 0.05, def: 0.95 },
      { k: 'speed', label: '转速', type: 'range', min: 0.05, max: 1.2, step: 0.05, def: 0.32 },
      { k: 'tilt', label: '俯仰角', type: 'range', min: -0.6, max: 0.6, step: 0.02, def: 0.22 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var names = String(p.labels || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = names.length;
      if (!n) return;
      var R = W * 0.26 * p.radius;
      var focal = R * 3.1;
      var items = [];
      for (var i = 0; i < n; i++) {
        var a = t * p.speed + (Math.PI * 2 * i) / n;
        var z = Math.sin(a) * R;
        items.push({ i: i, a: a, z: z, x: Math.cos(a) * R, y: -Math.abs(Math.sin(a)) * R * 0.18 + Math.sin(a) * R * p.tilt });
      }
      items.sort(function (a, b) { return a.z - b.z; });
      var cw = W * 0.2, ch = cw * 0.62;
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        var persp = focal / (focal + it.z);
        var scale = persp * 1.15;
        var appear = e.outBack(U.clamp((t - 0.3 - it.i * 0.06) / 0.9, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp(persp * 0.75 + 0.25, 0, 1) * appear;
        ctx.translate(W / 2 + it.x * 0.55, H * 0.52 + it.y * 0.35);
        ctx.scale(scale * appear, scale * appear);
        ctx.transform(1, 0, 0.22 * Math.sin(it.a), 1, 0, 0);
        var w = cw, h = ch;
        ctx.shadowColor = 'rgba(0,0,0,.55)';
        ctx.shadowBlur = 40 * S;
        ctx.shadowOffsetY = 22 * S;
        U.rr(ctx, -w / 2, -h / 2, w, h, 22 * S);
        var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        g.addColorStop(0, U.rgba(U.mix(U.bg2, U.ink, 0.52), 0.98));
        g.addColorStop(1, U.rgba(U.mix(U.bg1, U.accent, 0.4), 0.98));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = U.rgba(U.ink, 0.14);
        ctx.lineWidth = 1.4 * S;
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = it.i % 2 ? U.accent2 : U.accent;
        ctx.beginPath();
        ctx.arc(-w / 2 + 26 * S, -h / 2 + 26 * S, 8 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(26 * S, 700);
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillText(names[it.i], -w / 2 + 24 * S, h / 2 - 34 * S);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = U.rgba(U.ink, 0.65);
        ctx.font = U.fs(15 * S, 500, true);
        ctx.fillText(String((it.i + 1) < 10 ? '0' + (it.i + 1) : it.i + 1), -w / 2 + 24 * S, h / 2 - 12 * S);
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'iso-grid', name: '等距网格', cat: '空间与展示', type: 'block', dur: 8, poster: 0.5,
    desc: '等距视角的方块网格随正弦波起伏，块顶面提亮、侧面压暗，呈现轻盈的数据地形感。',
    tags: ['等距', '网格', '波浪'],
    params: [
      { k: 'cols', label: '列数', type: 'range', min: 6, max: 34, step: 1, def: 20 },
      { k: 'cell', label: '单元', type: 'range', min: 20, max: 90, step: 2, def: 52 },
      { k: 'amp', label: '起伏高度', type: 'range', min: 0.1, max: 2, step: 0.05, def: 0.85 },
      { k: 'wave', label: '波速', type: 'range', min: 0.2, max: 3, step: 0.05, def: 1.1 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var cols = Math.round(p.cols), cell = p.cell * S, rows = Math.max(4, Math.round(cols * 0.6));
      var cx = W / 2, cy = H * 0.42;
      var iso = function (gx, gy, gz) {
        return [cx + (gx - gy) * cell, cy + (gx + gy) * cell * 0.5 - gz];
      };
      var items = [];
      for (var gx = 0; gx < cols; gx++) {
        for (var gy = 0; gy < rows; gy++) {
          items.push([gx, gy]);
        }
      }
      items.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
      for (var i = 0; i < items.length; i++) {
        var gx2 = items[i][0], gy2 = items[i][1];
        var d = Math.hypot(gx2 - cols / 2, gy2 - rows / 2);
        var wave = Math.sin(d * 0.6 - t * p.wave * 2) * 0.5 + 0.5;
        var reveal = U.clamp((t - d * 0.1) / 0.8, 0, 1);
        var hgt = wave * 90 * S * p.amp * reveal;
        var reveal2 = U.ease.outCubic(reveal);
        if (reveal2 <= 0) continue;
        var top = iso(gx2 - cols / 2, gy2 - rows / 2, hgt);
        var px = top[0], py = top[1];
        var w2 = cell, h2 = cell * 0.5;
        ctx.save();
        ctx.globalAlpha = reveal2;
        ctx.beginPath();
        ctx.moveTo(px, py - h2);
        ctx.lineTo(px + w2, py);
        ctx.lineTo(px, py + h2);
        ctx.lineTo(px - w2, py);
        ctx.closePath();
        var lit = 0.35 + wave * 0.65;
        ctx.fillStyle = U.rgba(U.mix(U.accent2, U.accent, wave), 0.25 + lit * 0.7);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px - w2, py);
        ctx.lineTo(px, py + h2);
        ctx.lineTo(px, py + h2 + hgt * 0.42);
        ctx.lineTo(px - w2, py + hgt * 0.42);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.accent, 0.16 + wave * 0.3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px + w2, py);
        ctx.lineTo(px, py + h2);
        ctx.lineTo(px, py + h2 + hgt * 0.42);
        ctx.lineTo(px + w2, py + hgt * 0.42);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.fill();
        ctx.strokeStyle = U.rgba(U.ink, 0.1);
        ctx.lineWidth = 1 * S;
        ctx.stroke();
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'glass-slabs', name: '玻璃板块', cat: '空间与展示', type: 'block', dur: 10, poster: 0.6,
    desc: '多层毛玻璃面板以不同速度漂浮，层间形成视差错动，适合做官网首屏与产品页背景。',
    tags: ['玻璃拟态', '视差', '背景'],
    params: [
      { k: 'panels', label: '面板数量', type: 'range', min: 2, max: 12, step: 1, def: 7 },
      { k: 'drift', label: '漂移速度', type: 'range', min: 0.05, max: 1.2, step: 0.05, def: 0.4 },
      { k: 'blur', label: '玻璃厚度', type: 'range', min: 0.1, max: 1, step: 0.05, def: 0.6 },
      { k: 'parallax', label: '视差强度', type: 'range', min: 0, max: 1.5, step: 0.05, def: 0.8 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var n = Math.round(p.panels);
      /* 背景光斑 */
      for (var b = 0; b < 3; b++) {
        var bx = W * (0.25 + 0.28 * b) + Math.sin(t * 0.4 + b * 2) * W * 0.08;
        var by = H * (0.3 + 0.22 * ((b + 1) % 2)) + Math.cos(t * 0.33 + b) * H * 0.1;
        var rg = ctx.createRadialGradient(bx, by, 0, bx, by, W * 0.34);
        rg.addColorStop(0, U.rgba(b % 2 ? U.accent2 : U.accent, 0.35));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      }
      for (var i = 0; i < n; i++) {
        var depth = (i + 1) / n;
        var w = W * (0.16 + U.rng(i * 3.1) * 0.34);
        var h = H * (0.18 + U.rng(i * 7.7) * 0.46);
        var x = U.rng(i * 5.3) * (W - w) + Math.sin(t * p.drift * (0.5 + depth) + i) * 60 * S * p.parallax;
        var y = U.rng(i * 9.1) * (H - h) + Math.cos(t * p.drift * (0.4 + depth) + i * 1.7) * 40 * S * p.parallax;
        var appear = e.outCubic(U.clamp((t - i * 0.09) / 0.9, 0, 1));
        var rot = (U.rng(i * 11.3) - 0.5) * 0.22 + Math.sin(t * p.drift * 0.3 + i) * 0.03;
        ctx.save();
        ctx.globalAlpha = appear * (0.45 + depth * 0.5);
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(rot);
        ctx.shadowColor = 'rgba(0,0,0,.4)';
        ctx.shadowBlur = 50 * S * p.blur;
        U.rr(ctx, -w / 2, -h / 2, w, h, 26 * S);
        var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        g.addColorStop(0, U.rgba(U.ink, 0.16 * p.blur));
        g.addColorStop(0.5, U.rgba(U.ink, 0.05 * p.blur));
        g.addColorStop(1, U.rgba(U.accent, 0.12 * p.blur));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = U.rgba(U.ink, 0.2);
        ctx.lineWidth = 1.2 * S;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 20 * S, -h / 2 + h * 0.18);
        ctx.lineTo(w / 2 - 20 * S, -h / 2 + h * 0.1);
        ctx.strokeStyle = U.rgba(U.ink, 0.26);
        ctx.lineWidth = 1 * S;
        ctx.stroke();
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'device-mock', name: '设备展示', cat: '空间与展示', type: 'block', dur: 9, poster: 0.8,
    desc: '手机或平板外壳由小放大登场，屏幕内的界面元素逐块填充，并弹出一条通知，适合 App 演示。',
    tags: ['设备', 'App', '演示'],
    params: [
      { k: 'device', label: '设备', type: 'select', options: [['phone', '手机'], ['tablet', '平板']], def: 'phone' },
      { k: 'title', label: '页面标题', type: 'text', def: 'Motion Lab' },
      { k: 'note', label: '通知文案', type: 'text', def: '新动效已上架 · 386 个' },
      { k: 'showNote', label: '显示通知', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var isPhone = p.device !== 'tablet';
      var dw = (isPhone ? W * 0.2 : W * 0.36), dh = dw * (isPhone ? 2.03 : 1.34);
      var scaleMax = Math.min(1, (H * 0.8) / dh);
      var app = e.outBack(U.clamp(t / 1.1, 0, 1));
      var sc = scaleMax * (0.72 + 0.28 * app);
      var cx = W / 2, cy = H * 0.52;
      ctx.save();
      ctx.globalAlpha = U.clamp(t / 0.5, 0, 1);
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      ctx.shadowColor = U.rgba(U.accent, 0.3);
      ctx.shadowBlur = 90 * S;
      ctx.shadowOffsetY = 40 * S;
      U.rr(ctx, -dw / 2, -dh / 2, dw, dh, dw * 0.14);
      ctx.fillStyle = '#0C0E13';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.18);
      ctx.lineWidth = 2.4 * S;
      ctx.stroke();
      U.rr(ctx, -dw / 2 + 8 * S, -dh / 2 + 8 * S, dw - 16 * S, dh - 16 * S, dw * 0.12);
      var sg = ctx.createLinearGradient(0, -dh / 2, 0, dh / 2);
      sg.addColorStop(0, U.mix(U.bg1, U.accent, 0.1));
      sg.addColorStop(1, U.bg1);
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.save();
      U.rr(ctx, -dw / 2 + 8 * S, -dh / 2 + 8 * S, dw - 16 * S, dh - 16 * S, dw * 0.12);
      ctx.clip();
      var pad = dw * 0.09;
      var ty = -dh / 2 + dh * 0.11;
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(dw * 0.09, 800);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.title || '', -dw / 2 + pad, ty);
      var rows = 4;
      for (var i = 0; i < rows; i++) {
        var rr2 = e.outCubic(U.clamp((t - 0.5 - i * 0.14) / 0.7, 0, 1));
        var ry = ty + dh * (0.1 + i * 0.13);
        var rh = dh * 0.1;
        ctx.save();
        ctx.globalAlpha = rr2;
        ctx.translate((-dw / 2 + pad) + (1 - rr2) * (-30 * S), 0);
        U.rr(ctx, 0, ry, (dw - pad * 2) * rr2, rh, rh * 0.28);
        ctx.fillStyle = i === 0 ? U.rgba(U.accent, 0.28) : U.rgba(U.ink, 0.07);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, i === 0 ? 0.85 : 0.45);
        ctx.beginPath();
        ctx.arc(dw * 0.05, ry + rh / 2, rh * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.3);
        U.rr(ctx, dw * 0.02, ry + rh * 0.32, (dw - pad * 2) * 0.4 * rr2, rh * 0.16, rh * 0.08);
        ctx.fill();
        U.rr(ctx, dw * 0.02, ry + rh * 0.58, (dw - pad * 2) * 0.26 * rr2, rh * 0.14, rh * 0.07);
        ctx.fill();
        ctx.restore();
      }
      if (p.showNote) {
        var na = e.outBack(U.clamp((t - 2.1) / 0.8, 0, 1));
        var nw = dw * 0.82, nh = dh * 0.1;
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 2.1) / 0.5, 0, 1);
        ctx.translate(0, U.lerp(-dh * 0.28, dh * 0.3, na) - dh * 0.3);
        ctx.scale(U.lerp(0.85, 1, na), U.lerp(0.85, 1, na));
        U.rr(ctx, -nw / 2, -nh / 2, nw, nh, nh * 0.3);
        ctx.fillStyle = U.rgba('#F4F6FB', 0.96);
        ctx.fill();
        ctx.fillStyle = U.accent;
        U.rr(ctx, -nw / 2 + nh * 0.22, -nh * 0.24, nh * 0.48, nh * 0.48, nh * 0.14);
        ctx.fill();
        ctx.fillStyle = '#0C0E13';
        ctx.font = U.fs(nh * 0.32, 600);
        ctx.textAlign = 'left';
        ctx.fillText(String(p.note || ''), -nw / 2 + nh * 0.9, 0);
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();
    }
  });

  /* ══════════════════════════ 品牌与标识 ══════════════════════════ */

  MF.register({
    id: 'logo-draw', name: '标识描边', cat: '品牌与标识', type: 'block', dur: 7, poster: 0.9,
    desc: '圆环与折角标记按路径长度逐段描出，随后品牌名从右侧滑入，收尾点亮标记圆点。',
    tags: ['Logo', '描边', '品牌'],
    params: [
      { k: 'brand', label: '品牌名', type: 'text', def: 'JAYKOU' },
      { k: 'ringPct', label: '圆环粗细', type: 'range', min: 1, max: 20, step: 1, def: 7 },
      { k: 'bolt', label: '显示折角', type: 'toggle', def: true },
      { k: 'dot', label: '收尾圆点', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var size = Math.min(W, H) * 0.3;
      var cx = W / 2 - size * 0.55, cy = H / 2;
      var ringProg = e.inOutCubic(U.clamp(t / 1.6, 0, 1));
      var boltProg = e.inOutCubic(U.clamp((t - 1.3) / 1.1, 0, 1));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.lineCap = 'round';
      ctx.strokeStyle = U.ink;
      ctx.lineWidth = p.ringPct * S;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringProg);
      ctx.stroke();
      if (p.bolt) {
        var pts = [[0.3, -0.46], [0.02, 0.02], [0.2, 0.02], [-0.06, 0.5]];
        var segs = [], total = 0;
        for (var i = 1; i < pts.length; i++) {
          var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          segs.push(d); total += d;
        }
        var want = total * boltProg, acc = 0, started = false;
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = p.ringPct * 1.35 * S;
        ctx.shadowColor = U.rgba(U.accent, 0.85);
        ctx.shadowBlur = 26 * S;
        ctx.beginPath();
        for (var j = 0; j < segs.length; j++) {
          var a = pts[j], b = pts[j + 1];
          var x0 = a[0] * size, y0 = a[1] * size, x1 = b[0] * size, y1 = b[1] * size;
          if (acc + segs[j] <= want) {
            if (!started) { ctx.moveTo(x0, y0); started = true; }
            ctx.lineTo(x1, y1);
          } else if (acc < want) {
            var f = (want - acc) / segs[j];
            if (!started) { ctx.moveTo(x0, y0); started = true; }
            ctx.lineTo(U.lerp(x0, x1, f), U.lerp(y0, y1, f));
          }
          acc += segs[j];
        }
        ctx.stroke();
      }
      if (p.dot) {
        var dp = e.outBack(U.clamp((t - 2.4) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 2.4) / 0.4, 0, 1);
        ctx.fillStyle = U.accent2;
        ctx.beginPath();
        ctx.arc(0, size * 0.78, 9 * S * dp, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      /* 品牌名 */
      var tp = e.outQuint(U.clamp((t - 2.2) / 0.9, 0, 1));
      ctx.save();
      ctx.globalAlpha = U.clamp((t - 2.2) / 0.5, 0, 1);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(size * 0.3, 800);
      ctx.fillStyle = U.ink;
      ctx.fillText(p.brand || '', cx + size * 0.62 + (1 - tp) * 60 * S, cy);
      ctx.restore();
    }
  });

  MF.register({
    id: 'logo-outro', name: '品牌片尾', cat: '品牌与标识', type: 'block', dur: 6, poster: 0.85,
    desc: '标记由四块碎片拼合、标语逐字打出、下划线扫过，最后以一句签名收束，适合作视频片尾。',
    tags: ['片尾', 'Logo', '签名'],
    params: [
      { k: 'brand', label: '品牌名', type: 'text', def: 'JAYKOU' },
      { k: 'tagline', label: '标语', type: 'text', def: '让每一个想法动起来' },
      { k: 'sign', label: '署名', type: 'text', def: 'JAYKOU · 2026' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cy = H * 0.42;
      var size = Math.min(W, H) * 0.2;
      var parts = [
        { a: -0.5, x: -1, y: -1 },
        { a: 0.5, x: 1, y: -1 },
        { a: -0.5, x: -1, y: 1 },
        { a: 0.5, x: 1, y: 1 }
      ];
      ctx.save();
      ctx.translate(W / 2, cy);
      ctx.lineCap = 'round';
      for (var i = 0; i < parts.length; i++) {
        var pr = e.outBack(U.clamp((t - i * 0.12) / 0.9, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp((t - i * 0.12) / 0.4, 0, 1);
        ctx.translate(parts[i].x * (1 - pr) * 200 * S, parts[i].y * (1 - pr) * 140 * S);
        ctx.rotate((1 - pr) * parts[i].a);
        if (i === 0) {
          ctx.strokeStyle = U.ink;
          ctx.lineWidth = size * 0.09;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.5, -Math.PI / 2, 0);
          ctx.stroke();
        } else if (i === 1) {
          ctx.strokeStyle = U.ink;
          ctx.lineWidth = size * 0.09;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.5, 0, Math.PI / 2);
          ctx.stroke();
        } else if (i === 2) {
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = size * 0.09;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.5, Math.PI / 2, Math.PI);
          ctx.stroke();
        } else {
          ctx.strokeStyle = U.ink;
          ctx.lineWidth = size * 0.09;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.5, Math.PI, Math.PI * 1.5);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.save();
      var bp = U.clamp((t - 0.85) / 0.6, 0, 1);
      ctx.globalAlpha = bp;
      ctx.fillStyle = U.accent;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.16 * e.outBack(U.clamp((t - 1.15) / 0.6, 0, 1)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(size * 0.34, 800);
      ctx.globalAlpha = U.clamp((t - 1.5) / 0.6, 0, 1);
      ctx.fillText(p.brand || '', W / 2, cy + size * 0.95);
      var tag = String(p.tagline || '');
      var chars = Math.floor(U.clamp((t - 2) / 0.04, 0, tag.length));
      ctx.font = U.fs(size * 0.16, 500);
      ctx.fillStyle = U.rgba(U.ink, 0.66);
      ctx.globalAlpha = U.clamp((t - 2) / 0.3, 0, 1);
      ctx.fillText(tag.slice(0, chars), W / 2, cy + size * 1.42);
      var lp = e.outQuint(U.clamp((t - 2.6) / 0.8, 0, 1));
      var uw = size * 1.4 * lp;
      var g = ctx.createLinearGradient(W / 2 - uw / 2, 0, W / 2 + uw / 2, 0);
      g.addColorStop(0, U.accent);
      g.addColorStop(1, U.accent2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(W / 2 - uw / 2, cy + size * 1.72, uw, 3 * S);
      ctx.font = U.fs(size * 0.13, 600, true);
      ctx.fillStyle = U.rgba(U.ink, 0.4);
      ctx.globalAlpha = U.clamp((t - 3.2) / 0.6, 0, 1);
      ctx.fillText(p.sign || '', W / 2, cy + size * 2.1);
      ctx.restore();
    }
  });

  MF.register({
    id: 'particle-logo', name: '粒子聚合', cat: '品牌与标识', type: 'block', dur: 8, poster: 0.95,
    desc: '数百颗粒子从四周汇聚成标记形状，落位后轻微呼吸闪烁，可用作科技感品牌开场。',
    tags: ['粒子', 'Logo', '聚合'],
    params: [
      { k: 'count', label: '粒子数量', type: 'range', min: 120, max: 1400, step: 20, def: 520 },
      { k: 'gather', label: '聚合时长(秒)', type: 'range', min: 1, max: 5, step: 0.1, def: 2.4 },
      { k: 'size', label: '粒子大小', type: 'range', min: 1, max: 10, step: 0.5, def: 3.5 },
      { k: 'trail', label: '拖尾感', type: 'range', min: 0, max: 1, step: 0.05, def: 0.4 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var n = Math.round(p.count);
      var size = Math.min(W, H) * 0.24;
      var cx = W / 2, cy = H / 2;
      var gather = p.gather;
      for (var i = 0; i < n; i++) {
        var k = U.rng(i * 1.37);
        var target;
        if (k < 0.17) {          /* 圆环段 */
          var a = ((i * 0.618) % 1) * Math.PI * 2 + Math.PI * 0.15;
          target = [Math.cos(a) * size * 0.5, Math.sin(a) * size * 0.5];
        } else if (k < 0.52) {   /* 折角段 */
          var f = ((i * 0.3713) % 1) * 3;
          var pts = [[0.3, -0.46], [0.02, 0.02], [0.2, 0.02], [-0.06, 0.5]];
          var seg = Math.min(2, Math.floor(f));
          var lf = f - seg;
          target = [U.lerp(pts[seg][0], pts[seg + 1][0], lf) * size, U.lerp(pts[seg][1], pts[seg + 1][1], lf) * size];
        } else {                 /* 散落星尘 */
          var ang = U.rng(i * 3.3) * Math.PI * 2;
          var rad = size * (0.62 + U.rng(i * 5.7) * 0.5);
          target = [Math.cos(ang) * rad, Math.sin(ang) * rad];
        }
        var delay = U.rng(i * 7.1) * 0.9;
        var pr = e.inOutQuint(U.clamp((t - 0.2 - delay) / gather, 0, 1));
        var sx = (U.rng(i * 2.13) - 0.5) * W * 1.7;
        var sy = (U.rng(i * 4.77) - 0.5) * H * 1.7;
        var wob = U.noise(i * 0.3 + t * 1.2, i % 7) * 26 * S * (1 - pr) * (0.5 + p.trail);
        var x = cx + U.lerp(sx, target[0], pr) + wob;
        var y = cy + U.lerp(sy, target[1], pr) + wob * 0.6;
        var breathe = 1 + 0.28 * Math.sin(t * 3 + i * 0.7) * pr;
        ctx.save();
        ctx.globalAlpha = U.clamp(0.25 + pr * 0.75, 0, 1) * (0.5 + U.rng(i * 9.9) * 0.5);
        ctx.fillStyle = i % 5 === 0 ? U.ink : (i % 3 === 0 ? U.accent2 : U.accent);
        if (pr > 0.75) {
          ctx.shadowColor = i % 3 === 0 ? U.rgba(U.accent2, 0.9) : U.rgba(U.accent, 0.9);
          ctx.shadowBlur = 14 * S;
        }
        ctx.beginPath();
        ctx.arc(x, y, p.size * S * breathe, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (p.trail > 0.05 && pr < 1) {
          ctx.save();
          ctx.globalAlpha = 0.16 * p.trail * (1 - pr);
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = p.size * 0.8 * S;
          ctx.beginPath();
          ctx.moveTo(cx + sx * 0.9, cy + sy * 0.9);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  });

  MF.register({
    id: 'spark-burst', name: '火花爆发', cat: '品牌与标识', type: 'block', dur: 5, poster: 0.75,
    desc: '标记用力弹出并伴随冲击波与放射火花，适合短促有力的品牌闪现与片头卡点。',
    tags: ['爆发', '冲击波', '卡点'],
    params: [
      { k: 'mark', label: '标记文字', type: 'text', def: 'MF' },
      { k: 'sparks', label: '火花数量', type: 'range', min: 0, max: 160, step: 4, def: 60 },
      { k: 'ring', label: '冲击波数', type: 'range', min: 0, max: 4, step: 1, def: 2 },
      { k: 'power', label: '冲击力', type: 'range', min: 0.3, max: 2, step: 0.05, def: 1 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cx = W / 2, cy = H / 2;
      var pop = e.outBack(U.clamp((t - 0.15) / 0.75, 0, 1));
      var rings = Math.round(p.ring);
      for (var r = 0; r < rings; r++) {
        var rp = U.clamp((t - 0.35 - r * 0.14) / 1.5, 0, 1);
        if (rp <= 0 || rp >= 1) continue;
        var rad = e.outExpo(rp) * Math.min(W, H) * 0.62 * p.power;
        ctx.save();
        ctx.globalAlpha = (1 - rp) * 0.85;
        ctx.strokeStyle = r === 0 ? U.accent : U.accent2;
        ctx.lineWidth = (16 * (1 - rp) + 1.2) * S;
        ctx.shadowColor = U.rgba(U.accent, 0.8);
        ctx.shadowBlur = 40 * S;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      var n = Math.round(p.sparks);
      for (var i = 0; i < n; i++) {
        var sp = U.clamp((t - 0.3 - U.rng(i * 1.1) * 0.12) / (1.1 + U.rng(i * 3.3)), 0, 1);
        if (sp <= 0 || sp >= 1) continue;
        var a = U.rng(i * 5.7) * Math.PI * 2;
        var dist = e.outExpo(sp) * Math.min(W, H) * (0.3 + U.rng(i * 7.7) * 0.42) * p.power;
        var x = cx + Math.cos(a) * dist, y = cy + Math.sin(a) * dist;
        var len = (1 - sp) * 90 * S;
        ctx.save();
        ctx.globalAlpha = (1 - sp) * (0.4 + U.rng(i * 9.1) * 0.6);
        ctx.strokeStyle = i % 4 === 0 ? U.ink : (i % 2 ? U.accent : U.accent2);
        ctx.lineWidth = (3.4 * (1 - sp) + 0.4) * S;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pop, pop);
      ctx.globalAlpha = U.clamp(t / 0.25, 0, 1);
      var g = ctx.createLinearGradient(0, -120 * S, 0, 120 * S);
      g.addColorStop(0, U.ink);
      g.addColorStop(1, U.mix(U.ink, U.accent, 0.75));
      ctx.fillStyle = g;
      ctx.font = U.fs(190 * S, 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = U.rgba(U.accent, 0.7);
      ctx.shadowBlur = 60 * S;
      ctx.fillText(String(p.mark || ''), 0, 0);
      ctx.restore();
      ctx.save();
      var fl = U.clamp(1 - t / 0.5, 0, 1) * 0.4;
      ctx.fillStyle = U.rgba(U.ink, fl);
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  /* ══════════════════════════ 叙事与演示 ══════════════════════════ */

  MF.register({
    id: 'chat-reveal', name: '聊天叙事', cat: '叙事与演示', type: 'block', dur: 12, poster: 0.6,
    desc: '聊天界面中对话逐句出现，先显示输入中的三点动画再弹出气泡，左右交替呈现完整交流。',
    tags: ['对话', '气泡', '界面'],
    params: [
      { k: 'msgs', label: '对话（每行一条，奇数行为右侧）', type: 'textarea', def: '这个动效能改颜色吗？|当然，右侧面板随时调。|导出呢？|一键导出网页或视频。' },
      { k: 'speed', label: '节奏', type: 'range', min: 0.4, max: 3, step: 0.1, def: 1 },
      { k: 'bubble', label: '气泡圆角', type: 'range', min: 6, max: 40, step: 1, def: 22 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var msgs = String(p.msgs || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var pw = Math.min(W * 0.62, 900 * S), ph = H * 0.78;
      var px = (W - pw) / 2, py = (H - ph) / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.5)';
      ctx.shadowBlur = 60 * S;
      U.rr(ctx, px, py, pw, ph, 24 * S);
      ctx.fillStyle = U.rgba(U.bg1, 0.78);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.lineWidth = 1.4 * S;
      ctx.stroke();
      ctx.save();
      U.rr(ctx, px, py, pw, ph, 24 * S);
      ctx.clip();
      ctx.fillStyle = U.rgba(U.ink, 0.05);
      ctx.fillRect(px, py, pw, 72 * S);
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(24 * S, 700);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText('JAYKOU · LIVE', px + 32 * S, py + 36 * S);
      var dots = ['#FF5F57', '#FEBC2E', '#28C840'];
      for (var dd = 0; dd < 3; dd++) {
        ctx.fillStyle = dots[dd];
        ctx.beginPath();
        ctx.arc(px + pw - 34 * S - dd * 26 * S, py + 36 * S, 7 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      /* 累计出现时间 */
      var tAcc = 0.6, starts = [], typingSpans = [];
      for (var i = 0; i < msgs.length; i++) {
        var typeTime = U.clamp(msgs[i].length * 0.045, 0.5, 2.2) / p.speed;
        starts.push({ start: tAcc, type: typeTime, msg: msgs[i], side: i % 2 });
        tAcc += typeTime + 0.65 / p.speed;
      }
      var lh = 62 * S, gap = 26 * S;
      var y = py + 96 * S;
      for (var m = 0; m < starts.length; m++) {
        var cur = starts[m], right = cur.side === 1;
        var typing = t > cur.start && t < cur.start + cur.type;
        var showAt = cur.start + cur.type;
        var ap = e.outBack(U.clamp((t - showAt) / 0.5, 0, 1));
        ctx.font = U.fs(24 * S, 500);
        var lines = cur.msg.split('|');
        var tw = Math.min(pw * 0.6, ctx.measureText(cur.msg).width + 60 * S);
        var bh = lh;
        var bx = right ? px + pw - 40 * S - tw : px + 40 * S;
        if (typing) {
          ctx.save();
          ctx.globalAlpha = U.clamp((t - cur.start) / 0.2, 0, 1);
          U.rr(ctx, bx, y, 84 * S, bh * 0.7, p.bubble * S);
          ctx.fillStyle = U.rgba(U.ink, 0.1);
          ctx.fill();
          for (var d2 = 0; d2 < 3; d2++) {
            var bounce = Math.max(0, Math.sin((t * 4 - d2 * 0.35) * Math.PI)) * 5 * S;
            ctx.fillStyle = U.rgba(U.ink, 0.6);
            ctx.beginPath();
            ctx.arc(bx + 26 * S + d2 * 18 * S, y + bh * 0.35 - bounce, 5 * S, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (ap > 0) {
          ctx.save();
          ctx.globalAlpha = ap;
          ctx.translate((1 - ap) * (right ? 40 * S : -40 * S), 0);
          U.rr(ctx, bx, y, tw, bh, p.bubble * S);
          var g = right
            ? (function () { var gg = ctx.createLinearGradient(bx, 0, bx + tw, 0); gg.addColorStop(0, U.accent); gg.addColorStop(1, U.accent2); return gg; })()
            : U.rgba(U.ink, 0.1);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.fillStyle = right ? '#0A0B0F' : U.ink;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.font = U.fs(24 * S, 500);
          ctx.fillText(cur.msg, bx + 28 * S, y + bh / 2);
          ctx.restore();
        }
        if (ap > 0 || typing) y += bh + gap;
      }
      ctx.restore();
      ctx.restore();
    }
  });

  MF.register({
    id: 'code-typing', name: '代码打字', cat: '叙事与演示', type: 'block', dur: 11, poster: 0.8,
    desc: '代码窗口逐字符输入，关键字、字符串、注释按语法着色，行号与光标同步，适合技术演示。',
    tags: ['代码', '打字机', '技术'],
    params: [
      { k: 'code', label: '代码内容', type: 'textarea', def: 'const motion = forge({\n  effect: "kinetic-type",\n  params: { color: "#FF5A1F" },\n});\n// 一行命令，导出你的动效\nmotion.export("video.webm");' },
      { k: 'size', label: '字号', type: 'range', min: 14, max: 44, step: 1, def: 26 },
      { k: 'speed', label: '打字速度(字/秒)', type: 'range', min: 6, max: 120, step: 2, def: 38 },
      { k: 'title', label: '窗口标题', type: 'text', def: 'forge.js' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var code = String(p.code || '').replace(/\\n/g, '\n');
      var pw = Math.min(W * 0.76, 1180 * S), ph = Math.min(H * 0.76, 640 * S);
      var px = (W - pw) / 2, py = (H - ph) / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = 70 * S;
      U.rr(ctx, px, py, pw, ph, 22 * S);
      ctx.fillStyle = U.rgba(U.bg1, 0.92);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.14);
      ctx.lineWidth = 1.4 * S;
      ctx.stroke();
      U.rr(ctx, px, py, pw, 62 * S, 22 * S);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = U.rgba(U.ink, 0.06);
      ctx.fillRect(px, py, pw, 62 * S);
      ctx.restore();
      var dots = ['#FF5F57', '#FEBC2E', '#28C840'];
      for (var i = 0; i < 3; i++) {
        ctx.fillStyle = dots[i];
        ctx.beginPath();
        ctx.arc(px + 30 * S + i * 24 * S, py + 31 * S, 7 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.font = U.fs(20 * S, 600, true);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.title || '', px + pw / 2, py + 31 * S);
      var fs2 = p.size * S;
      var lineH = fs2 * 1.65;
      var chars = Math.floor(U.clamp((t - 0.45) / (1 / p.speed), 0, 1e6));
      var lines = code.split('\n');
      var used = 0;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (var li = 0; li < lines.length; li++) {
        var lineText = lines[li];
        var remain = chars - used;
        var shown = lineText.slice(0, Math.max(0, remain));
        var ly = py + 100 * S + li * lineH;
        ctx.save();
        ctx.globalAlpha = remain > 0 ? 1 : 0.28;
        ctx.fillStyle = U.rgba(U.ink, 0.28);
        ctx.font = U.fs(fs2 * 0.85, 500, true);
        ctx.fillText(String(li + 1).padStart(2, ' '), px + 26 * S, ly);
        var x = px + 82 * S;
        /* 简易语法着色 */
        var tokens = shown.match(/(\/\/.*$)|("[^"]*"?|'[^']*'?)|(const|let|var|function|return|import|from|export|new|await)\b|(\d+(?:\.\d+)?)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g) || [];
        ctx.font = U.fs(fs2, 500, true);
        for (var ti = 0; ti < tokens.length; ti++) {
          var tk = tokens[ti];
          var col = U.ink;
          if (/^\/\//.test(tk)) col = U.rgba(U.ink, 0.42);
          else if (/^["']/.test(tk)) col = U.mix(U.accent2, U.ink, 0.25);
          else if (/^(const|let|var|function|return|import|from|export|new|await)$/.test(tk)) col = U.accent;
          else if (/^\d/.test(tk)) col = U.mix(U.accent2, U.ink, 0.55);
          else if (/^[A-Za-z_$]/.test(tk)) col = U.rgba(U.ink, 0.85);
          ctx.fillStyle = col;
          ctx.fillText(tk, x, ly);
          x += ctx.measureText(tk).width;
        }
        if (remain > 0 && remain <= lineText.length && Math.floor(t * 2) % 2 === 0) {
          ctx.fillStyle = U.accent;
          ctx.fillRect(x + 2 * S, ly - fs2 * 0.55, fs2 * 0.5, fs2 * 1.15);
        }
        ctx.restore();
        used += lineText.length + 1;
        if (used > chars) break;
      }
      ctx.restore();
    }
  });

  MF.register({
    id: 'slide-deck', name: '幻灯片流转', cat: '叙事与演示', type: 'block', dur: 12, poster: 0.55,
    desc: '多页幻灯片横向推入推出，标题与要点逐条淡入，底部进度条指示当前页，适合知识分享片。',
    tags: ['幻灯片', '讲解', '分页'],
    params: [
      { k: 'titles', label: '页标题（每行一页）', type: 'textarea', def: '一、为什么是动效|二、工作台的三个变化|三、从灵感到上线' },
      { k: 'per', label: '每页时长(秒)', type: 'range', min: 1.5, max: 6, step: 0.1, def: 3.4 },
      { k: 'bullets', label: '每页要点数', type: 'range', min: 0, max: 5, step: 1, def: 3 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var titles = String(p.titles || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = Math.max(1, titles.length);
      var per = p.per;
      var total = n * per;
      var prog = (t % (total + 1)) / per;
      var idx = Math.floor(prog);
      var local = prog - idx;
      ctx.save();
      var enter = e.inOutQuint(U.clamp(local / 0.28, 0, 1));
      var slideIn = (1 - enter) * W * 0.5;
      ctx.translate(-slideIn, 0);
      ctx.globalAlpha = enter;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var tx = W * 0.12;
      ctx.fillStyle = U.rgba(U.accent, 0.9);
      ctx.font = U.fs(24 * S, 700, true);
      ctx.fillText('SLIDE ' + String(Math.min(idx, n - 1) + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), tx, H * 0.24);
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(78 * S, 900);
      ctx.fillText(titles[Math.min(idx, n - 1)] || '', tx, H * 0.36);
      ctx.fillStyle = U.accent;
      ctx.fillRect(tx, H * 0.44, 120 * S, 5 * S);
      var bn = Math.round(p.bullets);
      for (var b = 0; b < bn; b++) {
        var bp = e.outCubic(U.clamp((local - 0.2 - b * 0.12) / 0.5, 0, 1));
        var by = H * 0.56 + b * 68 * S;
        ctx.save();
        ctx.globalAlpha = bp;
        ctx.translate((1 - bp) * 40 * S, 0);
        ctx.fillStyle = U.accent2;
        ctx.beginPath();
        ctx.arc(tx + 10 * S, by, 7 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.78);
        U.rr(ctx, tx + 34 * S, by - 9 * S, (W * 0.42) * (0.55 + 0.45 * U.rng(idx * 7 + b)), 18 * S, 9 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.textAlign = 'right';
      ctx.font = U.fs(20 * S, 600, true);
      ctx.fillStyle = U.rgba(U.ink, 0.35);
      ctx.fillText('JAYKOU', W * 0.88, H * 0.86);
      ctx.restore();
      ctx.restore();
      var pbW = W * 0.76;
      ctx.save();
      ctx.fillStyle = U.rgba(U.ink, 0.12);
      U.rr(ctx, W * 0.12, H * 0.93, pbW, 5 * S, 2.5 * S);
      ctx.fill();
      ctx.fillStyle = U.accent;
      U.rr(ctx, W * 0.12, H * 0.93, pbW * U.clamp((idx + local) / n, 0, 1), 5 * S, 2.5 * S);
      ctx.fill();
      ctx.restore();
    }
  });

  MF.register({
    id: 'timeline-story', name: '时间线叙事', cat: '叙事与演示', type: 'block', dur: 10, poster: 0.7,
    desc: '中轴线自上而下生长，节点依次弹出并展开年份与说明，适合复盘、里程碑与流程讲述。',
    tags: ['时间线', '里程碑', '复盘'],
    params: [
      { k: 'items', label: '节点（年份|说明，每行一条）', type: 'textarea', def: '2022|开始做跨境，跑通第一套流程|2024|搭起 7 人小分队|2025|切入 AI 选品与自动化|2026|用动效工作台放大表达' },
      { k: 'spin', label: '排布', type: 'select', options: [['vertical', '纵向'], ['horizontal', '横向']], def: 'vertical' },
      { k: 'nodes', label: '实心节点', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var rows = String(p.items || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var items = rows.map(function (r) {
        var parts = r.split('|');
        return parts.length > 1 ? { y: parts[0], d: parts.slice(1).join('|') } : { y: '', d: r };
      });
      var n = items.length;
      if (!n) return;
      var vert = p.spin !== 'horizontal';
      var grow = e.inOutCubic(U.clamp(t / 1.6, 0, 1));
      if (vert) {
        var x = W * 0.34, y0 = H * 0.16, y1 = H * 0.86;
        ctx.save();
        ctx.strokeStyle = U.rgba(U.ink, 0.16);
        ctx.lineWidth = 3 * S;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, U.lerp(y0, y1, grow));
        ctx.stroke();
        ctx.restore();
        for (var i = 0; i < n; i++) {
          var p1 = U.clamp((grow - (i + 1) / n) * n * 1.4, 0, 1);
          var y = y0 + ((y1 - y0) * (i + 0.5)) / n;
          var np = e.outBack(U.clamp((t - 1.2 - i * 0.42) / 0.7, 0, 1));
          ctx.save();
          ctx.globalAlpha = U.clamp((t - 1.2 - i * 0.42) / 0.5, 0, 1);
          if (p.nodes) {
            ctx.fillStyle = U.accent;
            ctx.shadowColor = U.rgba(U.accent, 0.9);
            ctx.shadowBlur = 28 * S;
            ctx.beginPath();
            ctx.arc(x, y, 11 * S * np, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.strokeStyle = U.rgba(U.card || U.accent, 0.7);
          ctx.lineWidth = 2 * S;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 40 * S * np, y);
          ctx.stroke();
          ctx.translate(x + 56 * S + (1 - np) * 20 * S, y);
          ctx.fillStyle = U.accent2;
          ctx.font = U.fs(24 * S, 800, true);
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(items[i].y, 0, -20 * S);
          ctx.fillStyle = U.rgba(U.ink, 0.85);
          ctx.font = U.fs(26 * S, 500);
          ctx.fillText(items[i].d, 0, 14 * S);
          ctx.restore();
        }
      } else {
        var yy = H * 0.5, xa = W * 0.1, xb = W * 0.9;
        ctx.save();
        ctx.strokeStyle = U.rgba(U.ink, 0.16);
        ctx.lineWidth = 3 * S;
        ctx.beginPath();
        ctx.moveTo(xa, yy);
        ctx.lineTo(U.lerp(xa, xb, grow), yy);
        ctx.stroke();
        ctx.restore();
        for (var j = 0; j < n; j++) {
          var x2 = xa + ((xb - xa) * (j + 0.5)) / n;
          var np2 = e.outBack(U.clamp((t - 1.2 - j * 0.42) / 0.7, 0, 1));
          ctx.save();
          ctx.globalAlpha = U.clamp((t - 1.2 - j * 0.42) / 0.5, 0, 1);
          ctx.textAlign = 'center';
          ctx.translate(x2, yy);
          ctx.fillStyle = U.accent;
          ctx.beginPath();
          ctx.arc(0, 0, 11 * S * np2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = U.rgba(U.ink, 0.3);
          ctx.lineWidth = 2 * S;
          ctx.beginPath();
          ctx.moveTo(0, j % 2 ? 0 : -0);
          ctx.lineTo(0, (j % 2 ? 60 : -60) * np2);
          ctx.stroke();
          ctx.translate(0, (j % 2 ? 96 : -96) * np2);
          ctx.fillStyle = U.accent2;
          ctx.font = U.fs(22 * S, 800, true);
          ctx.textBaseline = 'middle';
          ctx.fillText(items[j].y, 0, 0);
          ctx.fillStyle = U.rgba(U.ink, 0.8);
          ctx.font = U.fs(19 * S, 500);
          ctx.fillText(items[j].d, 0, 30 * S);
          ctx.restore();
        }
      }
    }
  });
})();

/* ════════ assets/js/effects-03.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 03
   交互与卡片 / 粒子与反馈 / 材质与纹理
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* ══════════════════════════ 交互与卡片 ══════════════════════════ */

  MF.register({
    id: 'card-stack', name: '卡片堆叠', cat: '交互与卡片', type: 'block', dur: 9, poster: 0.8,
    desc: '一叠卡片从牌堆中依次抽出并扇形展开，每张到位后带轻微回弹与投影变化，适合功能罗列。',
    tags: ['卡片', '扇形', '展开'],
    params: [
      { k: 'labels', label: '卡片文案（逗号分隔）', type: 'textarea', def: '选品,定价,视觉,投放,复盘' },
      { k: 'spread', label: '展开角度', type: 'range', min: 0.1, max: 1.4, step: 0.05, def: 0.85 },
      { k: 'stagger', label: '错峰', type: 'range', min: 0.05, max: 0.8, step: 0.05, def: 0.24 },
      { k: 'fan', label: '扇形展开', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var names = String(p.labels || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = names.length || 1;
      var cw = W * 0.2, ch = cw * 1.32;
      var cx = W / 2, cy = H * 0.56;
      for (var i = n - 1; i >= 0; i--) {
        var pr = e.outBack(U.clamp((t - 0.35 - i * p.stagger) / 1, 0, 1));
        var norm = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
        var ang = p.fan ? norm * p.spread * 0.5 : 0;
        var ox = p.fan ? norm * cw * 0.62 : 0;
        var oy = p.fan ? Math.abs(norm) * ch * 0.14 : -i * 18 * S;
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 0.35 - i * p.stagger) / 0.5, 0, 1);
        ctx.translate(cx + ox * pr, cy + oy * pr);
        ctx.rotate(ang * pr);
        var lift = e.outCubic(U.clamp((t - 1.6 - i * p.stagger) / 0.9, 0, 1));
        ctx.translate(0, -lift * 22 * S);
        ctx.rotate(lift * Math.sin(t * 1.1 + i) * 0.02);
        ctx.shadowColor = 'rgba(0,0,0,.5)';
        ctx.shadowBlur = (36 + lift * 30) * S;
        ctx.shadowOffsetY = (18 + lift * 16) * S;
        U.rr(ctx, -cw / 2, -ch / 2, cw, ch, 24 * S);
        var g = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
        g.addColorStop(0, U.mix(U.bg2, U.accent, 0.12 + (i % 3) * 0.06));
        g.addColorStop(1, U.bg1);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = U.rgba(U.ink, 0.16);
        ctx.lineWidth = 1.4 * S;
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        U.rr(ctx, -cw / 2 + 26 * S, -ch / 2 + 26 * S, cw * 0.16, cw * 0.16, cw * 0.05);
        ctx.fill();
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(30 * S, 700);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(names[i], -cw / 2 + 26 * S, ch / 2 - 92 * S);
        ctx.fillStyle = U.rgba(U.ink, 0.22);
        U.rr(ctx, -cw / 2 + 26 * S, ch / 2 - 72 * S, cw - 52 * S, 9 * S, 5 * S);
        ctx.fill();
        U.rr(ctx, -cw / 2 + 26 * S, ch / 2 - 52 * S, (cw - 52 * S) * 0.6, 9 * S, 5 * S);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.font = U.fs(16 * S, 500, true);
        ctx.fillText(String(i + 1).padStart(2, '0'), -cw / 2 + 26 * S, -ch / 2 + 40 * S);
        ctx.restore();
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'list-stagger', name: '清单错落', cat: '交互与卡片', type: 'block', dur: 8, poster: 0.8,
    desc: '待办清单逐行滑入，每行尾部的对勾用描边动画勾出并扩散一圈光晕，适合功能清单与流程确认。',
    tags: ['清单', '对勾', '依次'],
    params: [
      { k: 'items', label: '条目（每行一条）', type: 'textarea', def: '绑定动效参数|实时预览渲染|一键导出视频|同步到项目' },
      { k: 'width', label: '行宽', type: 'range', min: 0.4, max: 0.86, step: 0.02, def: 0.66 },
      { k: 'stagger', label: '错峰', type: 'range', min: 0.1, max: 1.2, step: 0.05, def: 0.42 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var items = String(p.items || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var rows = items.length || 1;
      var lw = W * p.width, lh = Math.min(96 * S, (H * 0.66) / rows - 18 * S);
      var x0 = (W - lw) / 2;
      var total = rows * (lh + 18 * S);
      var y0 = H / 2 - total / 2 + 9 * S;
      for (var i = 0; i < rows; i++) {
        var pr = U.clamp((t - 0.3 - i * p.stagger) / 0.7, 0, 1);
        var k = e.outExpo(pr);
        var y = y0 + i * (lh + 18 * S);
        ctx.save();
        ctx.globalAlpha = U.clamp(pr * 2, 0, 1);
        ctx.translate(x0 + (1 - k) * -70 * S, 0);
        ctx.shadowColor = 'rgba(0,0,0,.4)';
        ctx.shadowBlur = 28 * S;
        U.rr(ctx, 0, y, lw, lh, lh * 0.3);
        var g = ctx.createLinearGradient(0, 0, lw, 0);
        g.addColorStop(0, U.rgba(U.ink, 0.1));
        g.addColorStop(1, U.rgba(U.ink, 0.035));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = U.rgba(U.ink, 0.13);
        ctx.lineWidth = 1.2 * S;
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = U.accent;
        ctx.beginPath();
        ctx.arc(lh * 0.5, y + lh / 2, lh * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = U.rgba(U.ink, 0.88);
        ctx.font = U.fs(lh * 0.28, 600);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(items[i], lh * 0.95, y + lh / 2);
        /* 对勾 */
        var cp = e.outCubic(U.clamp((t - 0.9 - i * p.stagger) / 0.6, 0, 1));
        var ccx = lw - lh * 0.62, ccy = y + lh / 2, rad = lh * 0.26;
        ctx.save();
        ctx.globalAlpha = cp * 0.35;
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = 2 * S;
        ctx.beginPath();
        ctx.arc(ccx, ccy, rad * (1 + cp * 1.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 0.85 - i * p.stagger) / 0.4, 0, 1);
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = 4.4 * S;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        var cpts = [[ccx - rad * 0.55, ccy + rad * 0.02], [ccx - rad * 0.12, ccy + rad * 0.45], [ccx + rad * 0.6, ccy - rad * 0.48]];
        var segs = [], tt = 0;
        for (var s2 = 1; s2 < cpts.length; s2++) {
          var d = Math.hypot(cpts[s2][0] - cpts[s2 - 1][0], cpts[s2][1] - cpts[s2 - 1][1]);
          segs.push(d); tt += d;
        }
        var want = tt * cp, acc = 0, started = false;
        ctx.beginPath();
        for (var s3 = 0; s3 < segs.length; s3++) {
          var A = cpts[s3], B = cpts[s3 + 1];
          if (acc + segs[s3] <= want) {
            if (!started) { ctx.moveTo(A[0], A[1]); started = true; }
            ctx.lineTo(B[0], B[1]);
          } else if (acc < want) {
            var f = (want - acc) / segs[s3];
            if (!started) { ctx.moveTo(A[0], A[1]); started = true; }
            ctx.lineTo(U.lerp(A[0], B[0], f), U.lerp(A[1], B[1], f));
          }
          acc += segs[s3];
        }
        ctx.stroke();
        ctx.restore();
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'switch-toggle', name: '开关切换', cat: '交互与卡片', type: 'block', dur: 6, poster: 0.5,
    desc: '大号开关在开与关之间来回切换，滑块带弹性位移与扩散涟漪，两侧标签同步高亮。',
    tags: ['开关', '涟漪', '状态'],
    params: [
      { k: 'on', label: '开启文案', type: 'text', def: 'ON · 已启用' },
      { k: 'off', label: '关闭文案', type: 'text', def: 'OFF · 已停用' },
      { k: 'period', label: '切换周期(秒)', type: 'range', min: 1, max: 5, step: 0.1, def: 2.4 },
      { k: 'w', label: '开关宽度', type: 'range', min: 200, max: 900, step: 10, def: 480 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var sw = p.w * S, sh = sw * 0.44;
      var cx = W / 2, cy = H / 2;
      var phase = (t % p.period) / p.period;
      var isOn = phase < 0.5;
      var knob = e.inOutBack(U.clamp(((isOn ? phase : phase - 0.5) / 0.5) * 1, 0, 1));
      var kpos = U.lerp(sh / 2, sw - sh / 2, isOn ? knob : 1 - knob);
      ctx.save();
      ctx.translate(cx, cy);
      U.rr(ctx, -sw / 2, -sh / 2, sw, sh, sh / 2);
      var g = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
      var mixv = isOn ? knob : 1 - knob;
      g.addColorStop(0, U.mix(U.mix(U.ink, U.accent2, 0.5), U.accent, mixv));
      g.addColorStop(1, U.mix(U.rgba(U.ink, 1), U.accent2, mixv * 0.9));
      ctx.fillStyle = g;
      ctx.shadowColor = U.rgba(isOn ? U.accent : U.accent2, 0.55);
      ctx.shadowBlur = 50 * S;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.18);
      ctx.lineWidth = 1.6 * S;
      ctx.stroke();
      /* 涟漪 */
      for (var r = 0; r < 2; r++) {
        var rs = U.clamp((phase - r * 0.04) / 0.28, 0, 1);
        var rs2 = U.clamp((phase - 0.5 - r * 0.04) / 0.28, 0, 1);
        var useOn = phase < 0.5;
        var rp = useOn ? rs : rs2;
        if (rp > 0 && rp < 1) {
          ctx.save();
          ctx.globalAlpha = (1 - rp) * 0.5;
          ctx.strokeStyle = useOn ? U.accent : U.accent2;
          ctx.lineWidth = 3 * S;
          ctx.beginPath();
          ctx.arc(-sw / 2 + (useOn ? sw - sh / 2 : sh / 2), 0, sh * (0.6 + rp * 2.2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      /* 滑块 */
      ctx.save();
      ctx.translate(-sw / 2 + kpos, 0);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = 30 * S;
      ctx.shadowOffsetY = 8 * S;
      ctx.beginPath();
      ctx.arc(0, 0, sh * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = U.mix(U.accent2, U.accent, isOn ? 1 : 0);
      var tick = isOn ? 1 : 0;
      ctx.strokeStyle = U.rgba('#0A0B0F', 0.85);
      ctx.lineWidth = 4.5 * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (tick > 0.5) {
        ctx.moveTo(-sh * 0.13, 0);
        ctx.lineTo(-sh * 0.03, sh * 0.11);
        ctx.lineTo(sh * 0.14, -sh * 0.11);
      } else {
        ctx.moveTo(-sh * 0.1, -sh * 0.1);
        ctx.lineTo(sh * 0.1, sh * 0.1);
        ctx.moveTo(sh * 0.1, -sh * 0.1);
        ctx.lineTo(-sh * 0.1, sh * 0.1);
      }
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(28 * S, 700);
      ctx.globalAlpha = isOn ? 1 : 0.35;
      ctx.fillStyle = U.ink;
      ctx.fillText(String(p.on || ''), cx, cy + sh * 1.1);
      ctx.globalAlpha = isOn ? 0.35 : 1;
      ctx.fillStyle = U.rgba(U.ink, 0.75);
      ctx.fillText(String(p.off || ''), cx, cy + sh * 1.1 + 0);
      ctx.restore();
    }
  });

  MF.register({
    id: 'notification-stack', name: '通知堆叠', cat: '交互与卡片', type: 'block', dur: 10, poster: 0.75,
    desc: '系统通知从右上角依次滑入并向下堆叠，旧通知被压缩，最后逐条淡出，适合消息流与提醒场景。',
    tags: ['通知', '堆叠', '提醒'],
    params: [
      { k: 'items', label: '通知文案（每行一条）', type: 'textarea', def: '动效库已更新|导出任务已完成|新模板已同步|今日灵感已生成' },
      { k: 'gap', label: '出现间隔(秒)', type: 'range', min: 0.3, max: 2, step: 0.05, def: 0.9 },
      { k: 'stay', label: '停留(秒)', type: 'range', min: 1, max: 6, step: 0.1, def: 3.2 },
      { k: 'icon', label: '显示图标', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var items = String(p.items || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = items.length || 1;
      var cw = Math.min(W * 0.34, 560 * S), ch = cw * 0.22;
      var x = W - cw - W * 0.06;
      var y0 = H * 0.1;
      for (var i = 0; i < n; i++) {
        var inT = i * p.gap;
        var outT = inT + p.stay;
        var pr = e.outExpo(U.clamp((t - inT) / 0.7, 0, 1));
        var out = e.inOutCubic(U.clamp((t - outT) / 0.6, 0, 1));
        if (t < inT) continue;
        var y = y0 + i * (ch + 16 * S);
        ctx.save();
        ctx.globalAlpha = (1 - out) * U.clamp((t - inT) / 0.4, 0, 1);
        ctx.translate(x + (1 - pr) * (cw + 120 * S) + out * (cw + 120 * S), y - out * 30 * S);
        ctx.shadowColor = 'rgba(0,0,0,.5)';
        ctx.shadowBlur = 40 * S;
        ctx.shadowOffsetY = 16 * S;
        U.rr(ctx, 0, 0, cw, ch, 20 * S);
        var g = ctx.createLinearGradient(0, 0, cw, ch);
        g.addColorStop(0, U.rgba('#F7F9FD', 0.96));
        g.addColorStop(1, U.rgba('#E8EDF6', 0.94));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        if (p.icon) {
          ctx.save();
          var ig = ctx.createLinearGradient(0, 0, 0, ch);
          ig.addColorStop(0, U.accent);
          ig.addColorStop(1, U.accent2);
          ctx.fillStyle = ig;
          U.rr(ctx, ch * 0.22, ch * 0.22, ch * 0.56, ch * 0.56, ch * 0.16);
          ctx.fill();
          ctx.fillStyle = '#0A0B0F';
          ctx.font = U.fs(ch * 0.3, 900);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('MF', ch * 0.5, ch * 0.5);
          ctx.restore();
        }
        ctx.fillStyle = '#101319';
        ctx.font = U.fs(ch * 0.24, 700);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(items[i], ch * 1.0, ch * 0.42);
        ctx.fillStyle = 'rgba(16,19,25,.45)';
        ctx.font = U.fs(ch * 0.18, 500);
        ctx.fillText('Jaykou · 刚刚', ch * 1.0, ch * 0.68);
        ctx.restore();
      }
    }
  });

  /* ══════════════════════════ 粒子与反馈 ══════════════════════════ */

  MF.register({
    id: 'particle-flow', name: '粒子流场', cat: '粒子与反馈', type: 'block', dur: 10, poster: 0.6,
    desc: '成百条流线沿噪声场持续流动，头部明亮尾部渐隐，适合做科技底纹与数据流动氛围。',
    tags: ['流场', '流线', '底纹'],
    params: [
      { k: 'lines', label: '流线数量', type: 'range', min: 40, max: 700, step: 10, def: 260 },
      { k: 'speed', label: '流速', type: 'range', min: 0.1, max: 2, step: 0.05, def: 0.6 },
      { k: 'tail', label: '拖尾长度', type: 'range', min: 0.02, max: 0.4, step: 0.01, def: 0.14 },
      { k: 'weight', label: '线宽', type: 'range', min: 0.5, max: 6, step: 0.5, def: 2 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.lines);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (var i = 0; i < n; i++) {
        var s0 = U.rng(i * 1.71), s1 = U.rng(i * 3.13);
        var u0 = ((t * p.speed * (0.35 + s0 * 0.4) + s1) % 1);
        var steps = 8;
        ctx.beginPath();
        for (var s = 0; s <= steps; s++) {
          var u = u0 - (s / steps) * p.tail * (0.6 + s0);
          var uu = (u + 10) % 1;
          var wob = U.noise(uu * 3 + s1 * 10, i % 9) * 0.11;
          var x = W * (uu * 1.3 - 0.15);
          var y = H * (0.1 + s0 * 0.8) + Math.sin(uu * 6.2 + s1 * 6) * H * 0.1 + wob * H;
          if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        var a = (1 - Math.abs(u0 - 0.5) * 0.9);
        ctx.strokeStyle = U.rgba(i % 4 === 0 ? U.accent2 : U.accent, 0.06 + a * 0.34);
        ctx.lineWidth = p.weight * S * (0.5 + s0);
        ctx.stroke();
      }
      for (var j = 0; j < Math.round(n * 0.5); j++) {
        var s2 = U.rng(j * 5.3);
        var u2 = ((t * p.speed * (0.4 + s2 * 0.5) + U.rng(j * 7.7)) % 1);
        var x2 = W * (u2 * 1.3 - 0.15);
        var y2 = H * (0.1 + s2 * 0.8) + Math.sin(u2 * 6.2 + U.rng(j * 9.1) * 6) * H * 0.1;
        ctx.fillStyle = U.rgba(i % 3 ? U.ink : U.accent, 0.5);
        ctx.beginPath();
        ctx.arc(x2, y2, 1.8 * S * (0.6 + s2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  MF.register({
    id: 'confetti-burst', name: '彩纸爆炸', cat: '粒子与反馈', type: 'block', dur: 5, poster: 0.5,
    desc: '数百片彩纸从中心炸开，受重力下落并旋转，颜色取自主题色，适合庆祝与里程碑节点。',
    tags: ['彩带', '庆祝', '重力'],
    params: [
      { k: 'count', label: '数量', type: 'range', min: 60, max: 700, step: 20, def: 260 },
      { k: 'power', label: '爆炸力', type: 'range', min: 0.3, max: 2, step: 0.05, def: 1 },
      { k: 'gravity', label: '重力', type: 'range', min: 0.2, max: 2.5, step: 0.05, def: 1.1 },
      { k: 'shape', label: '形状', type: 'select', options: [['rect', '矩形'], ['circle', '圆形'], ['mix', '混合']], def: 'mix' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.count);
      var cx = W / 2, cy = H * 0.46;
      var g = 1100 * p.gravity;
      for (var i = 0; i < n; i++) {
        var delay = U.rng(i * 1.31) * 0.12;
        var life = t - delay;
        if (life <= 0 || life > 4.4) continue;
        var a = U.rng(i * 2.71) * Math.PI * 2;
        var v = (620 + U.rng(i * 5.13) * 900) * p.power * S;
        var vx = Math.cos(a) * v, vy = Math.sin(a) * v - 260 * S * p.power;
        var x = cx + vx * life;
        var y = cy + vy * life + 0.5 * g * S * life * life;
        if (y > H * 1.06) continue;
        var alpha = U.clamp(1 - (life - 3.1) / 1.3, 0, 1);
        var cols = [U.accent, U.accent2, U.ink, U.mix(U.accent, U.ink, 0.5), U.mix(U.accent2, U.ink, 0.35)];
        var col = cols[i % cols.length];
        var rot = U.rng(i * 7.77) * 6 + life * (3 + U.rng(i * 9.1) * 8);
        var w = (10 + U.rng(i * 3.7) * 16) * S, h = w * (0.4 + U.rng(i * 11.3) * 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = col;
        var kind = p.shape;
        if (kind === 'circle' || (kind === 'mix' && i % 3 === 0)) {
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          var squash = Math.abs(Math.sin(rot * 1.7));
          ctx.fillRect(-w / 2, -h / 2 * (0.3 + squash * 0.7), w, h * (0.3 + squash * 0.7));
        }
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'ripple-rings', name: '涟漪扩散', cat: '粒子与反馈', type: 'block', dur: 8, poster: 0.55,
    desc: '规则点阵持续向外扩散圆环，环与环交叠形成有序的呼吸节律，适合做轻量背景与点击反馈。',
    tags: ['涟漪', '点阵', '扩散'],
    params: [
      { k: 'cols', label: '列数', type: 'range', min: 3, max: 24, step: 1, def: 10 },
      { k: 'period', label: '周期(秒)', type: 'range', min: 0.8, max: 5, step: 0.1, def: 2.6 },
      { k: 'reach', label: '扩散半径', type: 'range', min: 0.2, max: 1.6, step: 0.05, def: 0.8 },
      { k: 'grid', label: '显示点', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var cols = Math.round(p.cols);
      var rows = Math.max(2, Math.round((cols * H) / W));
      var dx = W / (cols + 1), dy = H / (rows + 1);
      var maxR = Math.min(dx, dy) * 1.9 * p.reach;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var c = 1; c <= cols; c++) {
        for (var r = 1; r <= rows; r++) {
          var x = c * dx, y = r * dy;
          var phase = ((t / p.period) + U.rng(c * 3.1 + r * 7.7) * 0.6) % 1;
          for (var k = 0; k < 2; k++) {
            var pp = phase - k * 0.5;
            if (pp <= 0) continue;
            var rad = pp * maxR;
            var alpha = (1 - pp) * (1 - pp) * 0.6;
            ctx.strokeStyle = U.rgba(k ? U.accent2 : U.accent, alpha);
            ctx.lineWidth = (1 + (1 - pp) * 3) * S;
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
      if (p.grid) {
        for (var c2 = 1; c2 <= cols; c2++) {
          for (var r2 = 1; r2 <= rows; r2++) {
            ctx.fillStyle = U.rgba(U.ink, 0.34);
            ctx.beginPath();
            ctx.arc(c2 * dx, r2 * dy, 2.6 * S, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  });

  MF.register({
    id: 'starfield-warp', name: '星野跃迁', cat: '粒子与反馈', type: 'block', dur: 8, poster: 0.5,
    desc: '星点从中心向外高速拉伸成光条，速度随深度变化，营造穿越星空的推进感，适合段落开头。',
    tags: ['星空', '跃迁', '速度'],
    params: [
      { k: 'stars', label: '星数', type: 'range', min: 100, max: 1200, step: 20, def: 420 },
      { k: 'speed', label: '跃迁速度', type: 'range', min: 0.1, max: 2.5, step: 0.05, def: 0.9 },
      { k: 'stretch', label: '光条长度', type: 'range', min: 0.01, max: 0.3, step: 0.01, def: 0.09 },
      { k: 'color', label: '彩色星', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.stars);
      var cx = W / 2, cy = H / 2;
      var focal = Math.min(W, H) * 0.9;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (var i = 0; i < n; i++) {
        var base = U.rng(i * 1.37);
        var z = ((base + t * p.speed * 0.16) % 1);
        if (z < 0.02) continue;
        var ang = U.rng(i * 3.97) * Math.PI * 2;
        var rr = Math.pow(z, 1.7) * Math.hypot(W, H) * 0.62;
        var x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
        var z2 = z - p.stretch * (0.4 + U.rng(i * 5.7));
        var rr2 = Math.pow(Math.max(z2, 0.01), 1.7) * Math.hypot(W, H) * 0.62;
        var x2 = cx + Math.cos(ang) * rr2, y2 = cy + Math.sin(ang) * rr2;
        var a = U.clamp(z * 1.6, 0, 1);
        var col = p.color ? (i % 7 === 0 ? U.accent2 : (i % 5 === 0 ? U.accent : '#FFFFFF')) : '#FFFFFF';
        ctx.strokeStyle = U.rgba(col, a * 0.85);
        ctx.lineWidth = (0.5 + z * 3.2) * S;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.3);
      g.addColorStop(0, U.rgba(U.accent, 0.18));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  /* ══════════════════════════ 材质与纹理 ══════════════════════════ */

  MF.register({
    id: 'grain-noise', name: '噪点颗粒', cat: '材质与纹理', type: 'block', dur: 6, poster: 0.5,
    desc: '在画面上叠加胶片颗粒、扫描线与轻微色散，可套在任意内容上增加质感与年代感。',
    tags: ['颗粒', '胶片', '质感'],
    params: [
      { k: 'amount', label: '颗粒强度', type: 'range', min: 0.05, max: 1, step: 0.05, def: 0.45 },
      { k: 'scan', label: '扫描线', type: 'range', min: 0, max: 1, step: 0.05, def: 0.4 },
      { k: 'vignette', label: '暗角', type: 'range', min: 0, max: 1, step: 0.05, def: 0.6 },
      { k: 'text', label: '叠加文案', type: 'text', def: 'ANALOG' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(180 * S, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.06);
      ctx.fillText(String(p.text || ''), W / 2, H / 2);
      ctx.restore();
      var frame = Math.floor(t * 24);
      var n = Math.round(2600 * p.amount);
      ctx.save();
      for (var i = 0; i < n; i++) {
        var x = U.rng(i * 1.37 + frame * 0.017) * W;
        var y = U.rng(i * 3.71 + frame * 0.031) * H;
        var a = U.rng(i * 5.13 + frame * 0.011) * p.amount * 0.5;
        ctx.fillStyle = U.rgba(i % 2 ? U.ink : '#000000', a);
        ctx.fillRect(x, y, 2 * S, 2 * S);
      }
      ctx.restore();
      if (p.scan > 0.02) {
        ctx.save();
        ctx.fillStyle = U.rgba('#000000', p.scan * 0.22);
        for (var y2 = (t * 40) % (6 * S); y2 < H; y2 += 6 * S) {
          ctx.fillRect(0, y2, W, 1.6 * S);
        }
        ctx.restore();
      }
      ctx.save();
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.22, W / 2, H / 2, Math.max(W, H) * 0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, U.rgba('#000000', p.vignette));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  MF.register({
    id: 'halftone-field', name: '流动点阵', cat: '材质与纹理', type: 'block', dur: 10, poster: 0.6,
    desc: '等距点阵的半径由噪声场驱动，形成缓慢起伏的流动波纹，兼具印刷网点的质感与节奏。',
    tags: ['半调', '点阵', '流动'],
    params: [
      { k: 'gap', label: '点距', type: 'range', min: 8, max: 46, step: 1, def: 20 },
      { k: 'rough', label: '噪声频率', type: 'range', min: 0.3, max: 4, step: 0.1, def: 1.6 },
      { k: 'speed', label: '流动速度', type: 'range', min: 0, max: 1.5, step: 0.05, def: 0.4 },
      { k: 'maxR', label: '最大点半径', type: 'range', min: 1, max: 16, step: 0.5, def: 7 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var gap = p.gap * S;
      var cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          var x = c * gap + (r % 2 ? gap * 0.5 : 0);
          var y = r * gap * 0.87;
          var nv = U.noise2(x * 0.0035 * p.rough, y * 0.0035 * p.rough + t * p.speed, 5);
          var k = U.clamp((nv + 1) / 2, 0, 1);
          k = Math.pow(k, 1.5);
          var rad = k * p.maxR * S;
          if (rad < 0.4) continue;
          var camber = U.clamp(1 - Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2)), 0, 1);
          var col = U.mix(U.accent2, U.accent, k);
          ctx.fillStyle = U.rgba(col, 0.2 + camber * 0.7);
          if (rad > p.maxR * S * 0.62) {
            ctx.save();
            ctx.shadowColor = U.rgba(col, 0.8);
            ctx.shadowBlur = 22 * S;
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  });

  MF.register({
    id: 'metallic-sweep', name: '金属扫光', cat: '材质与纹理', type: 'block', dur: 7, poster: 0.75,
    desc: '拉丝金属表面上一道高光缓慢横扫，文字随光线亮起浮雕，适合做品牌铭牌与产品细节展示。',
    tags: ['金属', '拉丝', '扫光'],
    params: [
      { k: 'text', label: '铭牌文字', type: 'text', def: 'JAYKOU' },
      { k: 'brush', label: '拉丝密度', type: 'range', min: 40, max: 460, step: 10, def: 200 },
      { k: 'sweep', label: '扫光速度', type: 'range', min: 0.1, max: 1.6, step: 0.05, def: 0.55 },
      { k: 'emboss', label: '浮雕强度', type: 'range', min: 0, max: 1, step: 0.05, def: 0.6 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var x0 = W * 0.1, y0 = H * 0.34, pw = W * 0.8, ph = H * 0.32;
      U.rr(ctx, x0, y0, pw, ph, 20 * S);
      var base = ctx.createLinearGradient(0, y0, 0, y0 + ph);
      base.addColorStop(0, U.mix(U.bg2, '#FFFFFF', 0.22));
      base.addColorStop(0.35, U.mix(U.bg2, '#FFFFFF', 0.06));
      base.addColorStop(0.5, U.mix(U.bg1, '#FFFFFF', 0.16));
      base.addColorStop(1, U.bg1);
      ctx.fillStyle = base;
      ctx.fill();
      ctx.save();
      ctx.clip();
      var bn = Math.round(p.brush);
      for (var i = 0; i < bn; i++) {
        var yy = y0 + (i / bn) * ph;
        ctx.strokeStyle = U.rgba(i % 2 ? '#FFFFFF' : '#000000', 0.02 + U.rng(i * 3.3) * 0.05);
        ctx.lineWidth = (ph / bn) * (0.4 + U.rng(i * 5.7) * 0.8);
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(x0 + pw, yy + U.rng(i * 7.1) * 2);
        ctx.stroke();
      }
      var sp = ((t * p.sweep * 0.5) % 1) * 1.6 - 0.3;
      var sx = x0 + sp * pw;
      var sg = ctx.createLinearGradient(sx - pw * 0.3, y0, sx + pw * 0.3, y0 + ph);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.42, U.rgba(U.accent, 0.3));
      sg.addColorStop(0.5, 'rgba(255,255,255,0.75)');
      sg.addColorStop(0.58, U.rgba(U.accent2, 0.28));
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = sg;
      ctx.fillRect(x0, y0, pw, ph);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      ctx.strokeStyle = U.rgba(U.ink, 0.16);
      ctx.lineWidth = 1.6 * S;
      U.rr(ctx, x0, y0, pw, ph, 20 * S);
      ctx.stroke();
      var txt = String(p.text || '');
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(ph * 0.3, 800);
      var tg = ctx.createLinearGradient(0, y0 + ph * 0.2, 0, y0 + ph * 0.8);
      tg.addColorStop(0, '#FFFFFF');
      tg.addColorStop(0.45, U.mix(U.ink, U.accent, 0.5));
      tg.addColorStop(1, U.rgba(U.accent2, 0.85));
      ctx.fillStyle = tg;
      if (p.emboss > 0.05) {
        ctx.globalAlpha = p.emboss * 0.5;
        ctx.fillStyle = '#000000';
        ctx.fillText(txt, W / 2 + 3 * S, H / 2 + 3 * S);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = tg;
      ctx.fillText(txt, W / 2, H / 2);
      ctx.globalAlpha = 0.5;
      ctx.font = U.fs(ph * 0.13, 500, true);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText('MADE WITH JAYKOU', W / 2, y0 + ph * 0.78);
      ctx.restore();
    }
  });

  MF.register({
    id: 'gradient-mesh', name: '渐变网格', cat: '材质与纹理', type: 'block', dur: 12, poster: 0.5,
    desc: '多团彩色光斑缓慢漂移交融，叠加细颗粒形成柔和的网格渐变背景，适合做长时段底图。',
    tags: ['渐变', '光斑', '背景'],
    params: [
      { k: 'blobs', label: '光斑数量', type: 'range', min: 3, max: 14, step: 1, def: 7 },
      { k: 'drift', label: '漂移速度', type: 'range', min: 0.02, max: 0.8, step: 0.02, def: 0.22 },
      { k: 'soft', label: '柔和度', type: 'range', min: 0.2, max: 1, step: 0.05, def: 0.7 },
      { k: 'grain', label: '颗粒', type: 'range', min: 0, max: 1, step: 0.05, def: 0.3 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.blobs);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < n; i++) {
        var ph = U.rng(i * 1.7) * 6.28;
        var cx = W * (0.15 + U.rng(i * 3.1) * 0.7) + Math.sin(t * p.drift + ph) * W * 0.16;
        var cy = H * (0.15 + U.rng(i * 5.7) * 0.7) + Math.cos(t * p.drift * 0.8 + ph * 1.3) * H * 0.16;
        var rad = Math.min(W, H) * (0.22 + U.rng(i * 7.3) * 0.34) * (1 + p.soft);
        var col = i % 3 === 0 ? U.accent : (i % 3 === 1 ? U.accent2 : U.mix(U.accent, U.accent2, 0.5));
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, U.rgba(col, 0.36 * p.soft + 0.14));
        g.addColorStop(0.45, U.rgba(col, 0.1));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
      ctx.save();
      var vg = ctx.createLinearGradient(0, 0, W, H);
      vg.addColorStop(0, U.rgba(U.bg1, 0.35));
      vg.addColorStop(0.5, 'rgba(0,0,0,0)');
      vg.addColorStop(1, U.rgba(U.bg1, 0.5));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      if (p.grain > 0.02) {
        var frame = Math.floor(t * 24);
        var gn = Math.round(1600 * p.grain);
        for (var k = 0; k < gn; k++) {
          ctx.fillStyle = U.rgba(k % 2 ? '#FFFFFF' : '#000000', U.rng(k * 3.3 + frame * 0.021) * 0.16 * p.grain);
          ctx.fillRect(U.rng(k * 1.1 + frame * 0.013) * W, U.rng(k * 2.3 + frame * 0.019) * H, 2 * S, 2 * S);
        }
      }
    }
  });
})();

/* ════════ assets/js/effects-04.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 04
   状态与进度 / 入场与反馈 / 几何与抽象
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* ══════════════════════════ 状态与进度 ══════════════════════════ */

  MF.register({
    id: 'loader-orbit', name: '轨道加载', cat: '状态与进度', type: 'block', dur: 6, poster: 0.5,
    desc: '数颗光点沿轨道绕行并拖出渐隐尾迹，中心文案随呼吸淡入淡出，适合加载与等待状态。',
    tags: ['加载', '轨道', '等待'],
    params: [
      { k: 'dots', label: '光点数', type: 'range', min: 2, max: 10, step: 1, def: 4 },
      { k: 'speed', label: '速度', type: 'range', min: 0.2, max: 3, step: 0.05, def: 0.9 },
      { k: 'radius', label: '半径', type: 'range', min: 0.06, max: 0.3, step: 0.01, def: 0.14 },
      { k: 'text', label: '中心文案', type: 'text', def: 'LOADING' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.dots);
      var R = Math.min(W, H) * p.radius;
      var cx = W / 2, cy = H / 2;
      ctx.save();
      ctx.strokeStyle = U.rgba(U.ink, 0.1);
      ctx.lineWidth = 1.6 * S;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.55, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(U.ink, 0.05);
      ctx.stroke();
      ctx.restore();
      for (var i = 0; i < n; i++) {
        var base = t * p.speed + (Math.PI * 2 * i) / n;
        var tail = 26;
        for (var k = 0; k < tail; k++) {
          var a = base - k * 0.028;
          var f = 1 - k / tail;
          ctx.fillStyle = U.rgba(i % 2 ? U.accent2 : U.accent, f * f * 0.5);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, (2 + f * 3.4) * S, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = U.rgba(i % 2 ? U.accent2 : U.accent, 0.95);
        ctx.shadowBlur = 26 * S;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(base) * R, cy + Math.sin(base) * R, 6.4 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 2.2);
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(24 * S, 700, true);
      ctx.fillText(String(p.text || ''), cx, cy + R * 2.5);
      ctx.restore();
    }
  });

  MF.register({
    id: 'progress-ring', name: '进度环', cat: '状态与进度', type: 'block', dur: 9, poster: 0.7,
    desc: '进度环配合百分比计数与阶段文案推进，环上有流光沿弧线绕行，适合渲染、导出等长任务状态。',
    tags: ['进度', '加载', '阶段'],
    params: [
      { k: 'stages', label: '阶段文案（逗号分隔）', type: 'textarea', def: '解析素材,应用参数,渲染帧,封装输出' },
      { k: 'cycles', label: '轮回次数', type: 'range', min: 1, max: 4, step: 1, def: 1 },
      { k: 'thick', label: '环粗', type: 'range', min: 6, max: 56, step: 1, def: 18 },
      { k: 'showPct', label: '显示百分比', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cx = W / 2, cy = H * 0.48, R = Math.min(W, H) * 0.24;
      var total = U.D * p.cycles;
      var pr = U.clamp(t / total, 0, 1);
      var lin = e.inOutSine(pr);
      var stages = String(p.stages || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      ctx.save();
      ctx.lineWidth = p.thick * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      var start = -Math.PI / 2;
      var g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      g.addColorStop(0, U.accent);
      g.addColorStop(1, U.accent2);
      ctx.strokeStyle = g;
      ctx.lineCap = 'round';
      ctx.lineWidth = p.thick * S;
      ctx.shadowColor = U.rgba(U.accent, 0.7);
      ctx.shadowBlur = 30 * S;
      ctx.beginPath();
      ctx.arc(cx, cy, R, start, start + Math.PI * 2 * lin);
      ctx.stroke();
      /* 沿弧流光 */
      var glowA = start + Math.PI * 2 * lin;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(glowA) * R, cy + Math.sin(glowA) * R, p.thick * S * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (p.showPct) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(74 * S, 900);
        ctx.fillText(Math.round(lin * 100) + '%', cx, cy);
        var si = Math.min(stages.length - 1, Math.floor(lin * stages.length));
        ctx.fillStyle = U.rgba(U.ink, 0.6);
        ctx.font = U.fs(22 * S, 600);
        ctx.fillText(stages[si] || '处理中', cx, cy + R + 70 * S);
        ctx.restore();
      }
      /* 外圈刻度 */
      for (var i = 0; i < 60; i++) {
        var a = start + (Math.PI * 2 * i) / 60;
        var lit = i / 60 <= lin;
        ctx.strokeStyle = lit ? U.rgba(U.accent, 0.8) : U.rgba(U.ink, 0.12);
        ctx.lineWidth = (lit ? 2.4 : 1.2) * S;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (R + p.thick * S * 0.9), cy + Math.sin(a) * (R + p.thick * S * 0.9));
        ctx.lineTo(cx + Math.cos(a) * (R + p.thick * S * 0.9 + (lit ? 14 : 8) * S), cy + Math.sin(a) * (R + p.thick * S * 0.9 + (lit ? 14 : 8) * S));
        ctx.stroke();
      }
    }
  });

  MF.register({
    id: 'skeleton-shimmer', name: '骨架屏微光', cat: '状态与进度', type: 'block', dur: 6, poster: 0.55,
    desc: '卡片骨架中的占位块循环闪过一道高光，头像与文本块依次成形，适合表达加载中的界面。',
    tags: ['骨架屏', '微光', '加载'],
    params: [
      { k: 'rows', label: '文本行数', type: 'range', min: 2, max: 8, step: 1, def: 4 },
      { k: 'speed', label: '扫光速度', type: 'range', min: 0.3, max: 3, step: 0.1, def: 1.1 },
      { k: 'avatar', label: '显示头像', type: 'toggle', def: true },
      { k: 'radius', label: '卡片圆角', type: 'range', min: 0, max: 48, step: 1, def: 22 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cw = Math.min(W * 0.56, 880 * S), ch = Math.min(H * 0.62, 520 * S);
      var x0 = (W - cw) / 2, y0 = (H - ch) / 2;
      var ap = e.outCubic(U.clamp(t / 0.7, 0, 1));
      ctx.save();
      ctx.globalAlpha = ap;
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = 60 * S;
      U.rr(ctx, x0, y0, cw, ch, p.radius * S);
      ctx.fillStyle = U.rgba(U.bg1, 0.72);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.1);
      ctx.lineWidth = 1.4 * S;
      ctx.stroke();
      ctx.save();
      U.rr(ctx, x0, y0, cw, ch, p.radius * S);
      ctx.clip();
      var base = U.rgba(U.ink, 0.08);
      var pad = cw * 0.07;
      if (p.avatar) {
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(x0 + pad + ch * 0.16, y0 + pad + ch * 0.16, ch * 0.16, 0, Math.PI * 2);
        ctx.fill();
        var tx = x0 + pad + ch * 0.42;
        ctx.fillStyle = base;
        U.rr(ctx, tx, y0 + pad + ch * 0.06, cw * 0.4, ch * 0.075, ch * 0.04);
        ctx.fill();
        U.rr(ctx, tx, y0 + pad + ch * 0.17, cw * 0.26, ch * 0.06, ch * 0.03);
        ctx.fill();
      }
      var rows = Math.round(p.rows);
      var startY = y0 + ch * (p.avatar ? 0.44 : 0.14);
      for (var i = 0; i < rows; i++) {
        var w = cw * (0.6 + 0.32 * U.rng(i * 3.7));
        if (i === rows - 1) w *= 0.6;
        var hh = ch * 0.062;
        var ry = startY + i * ch * 0.108;
        ctx.fillStyle = base;
        U.rr(ctx, x0 + pad, ry, w, hh, hh / 2);
        ctx.fill();
      }
      /* 扫光 */
      var sweep = ((t * p.speed * 0.42) % 1) * 1.8 - 0.4;
      var sx = x0 + sweep * cw;
      var sg = ctx.createLinearGradient(sx - cw * 0.22, 0, sx + cw * 0.22, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, U.rgba('#FFFFFF', 0.14));
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(x0, y0, cw, ch);
      ctx.restore();
      /* 状态点 */
      for (var d = 0; d < 3; d++) {
        var bounce = Math.max(0, Math.sin((t * 3.4 - d * 0.4) * Math.PI));
        ctx.fillStyle = U.rgba(U.accent, 0.5 + bounce * 0.5);
        ctx.beginPath();
        ctx.arc(x0 + pad + d * 22 * S, y0 + ch - pad * 0.9 - bounce * 8 * S, 6 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  MF.register({
    id: 'success-check', name: '成功对勾', cat: '状态与进度', type: 'block', dur: 5, poster: 0.85,
    desc: '圆环快速闭合后对勾被一笔勾出，伴随扩散光环与结果文案，适合提交成功、任务完成反馈。',
    tags: ['成功', '对勾', '反馈'],
    params: [
      { k: 'text', label: '结果文案', type: 'text', def: '导出完成' },
      { k: 'sub', label: '补充说明', type: 'text', def: '已保存到本地 · video.webm' },
      { k: 'burst', label: '光环数量', type: 'range', min: 0, max: 3, step: 1, def: 2 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var cx = W / 2, cy = H * 0.46, R = Math.min(W, H) * 0.13;
      var ring = e.outCubic(U.clamp(t / 0.6, 0, 1));
      var checkP = e.outQuint(U.clamp((t - 0.55) / 0.7, 0, 1));
      var burstN = Math.round(p.burst);
      for (var b = 0; b < burstN; b++) {
        var bp = U.clamp((t - 0.5 - b * 0.12) / 1.4, 0, 1);
        if (bp <= 0 || bp >= 1) continue;
        ctx.save();
        ctx.globalAlpha = (1 - bp) * 0.6;
        ctx.strokeStyle = b ? U.accent2 : U.accent;
        ctx.lineWidth = (10 * (1 - bp) + 1) * S;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (1 + bp * 2.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      var g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      g.addColorStop(0, U.accent);
      g.addColorStop(1, U.accent2);
      ctx.strokeStyle = g;
      ctx.lineWidth = 9 * S;
      ctx.lineCap = 'round';
      ctx.shadowColor = U.rgba(U.accent, 0.7);
      ctx.shadowBlur = 40 * S;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = U.ink;
      ctx.lineWidth = 12 * S;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      var cpts = [[cx - R * 0.46, cy + R * 0.03], [cx - R * 0.12, cy + R * 0.38], [cx + R * 0.5, cy - R * 0.38]];
      var segs = [], tot = 0;
      for (var i = 1; i < cpts.length; i++) {
        var d = Math.hypot(cpts[i][0] - cpts[i - 1][0], cpts[i][1] - cpts[i - 1][1]);
        segs.push(d); tot += d;
      }
      var want = tot * checkP, acc = 0, started = false;
      ctx.beginPath();
      for (var j = 0; j < segs.length; j++) {
        var A = cpts[j], B = cpts[j + 1];
        if (acc + segs[j] <= want) {
          if (!started) { ctx.moveTo(A[0], A[1]); started = true; }
          ctx.lineTo(B[0], B[1]);
        } else if (acc < want) {
          var f = (want - acc) / segs[j];
          if (!started) { ctx.moveTo(A[0], A[1]); started = true; }
          ctx.lineTo(U.lerp(A[0], B[0], f), U.lerp(A[1], B[1], f));
        }
        acc += segs[j];
      }
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = U.clamp((t - 1.2) / 0.7, 0, 1);
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(52 * S, 800);
      ctx.fillText(String(p.text || ''), cx, cy + R * 2.1);
      ctx.globalAlpha = U.clamp((t - 1.5) / 0.7, 0, 1) * 0.6;
      ctx.fillStyle = U.rgba(U.ink, 0.7);
      ctx.font = U.fs(22 * S, 500, true);
      ctx.fillText(String(p.sub || ''), cx, cy + R * 2.1 + 56 * S);
      ctx.restore();
    }
  });

  /* ══════════════════════════ 入场与反馈 ══════════════════════════ */

  MF.register({
    id: 'curtain-reveal', name: '幕布揭开', cat: '入场与反馈', type: 'block', dur: 7, poster: 0.8,
    desc: '竖向日式幕布逐片抬起揭开画面，缝隙间透出光线，底部内容缓缓推近，适合作开场揭示。',
    tags: ['幕布', '揭示', '开场'],
    params: [
      { k: 'panels', label: '幕片数量', type: 'range', min: 3, max: 16, step: 1, def: 8 },
      { k: 'title', label: '主标题', type: 'text', def: 'REVEAL' },
      { k: 'stagger', label: '错峰', type: 'range', min: 0, max: 0.3, step: 0.01, def: 0.06 },
      { k: 'beam', label: '缝隙光线', type: 'range', min: 0, max: 1, step: 0.05, def: 0.6 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var n = Math.round(p.panels);
      var pw = W / n;
      /* 内容层 */
      var ap = e.outCubic(U.clamp((t - 0.2) / 1.4, 0, 1));
      ctx.save();
      ctx.translate(W / 2, H / 2);
      var zs = 1 + (1 - ap) * 0.16;
      ctx.scale(zs, zs);
      ctx.translate(-W / 2, -H / 2);
      var g = ctx.createLinearGradient(0, H * 0.2, W, H * 0.8);
      g.addColorStop(0, U.ink);
      g.addColorStop(0.55, U.mix(U.ink, U.accent, 0.6));
      g.addColorStop(1, U.mix(U.accent2, U.ink, 0.4));
      ctx.fillStyle = g;
      ctx.font = U.fs(Math.min(W * 0.14, H * 0.3), 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(p.title || ''), W / 2, H / 2);
      ctx.fillStyle = U.accent;
      ctx.globalAlpha = U.clamp((t - 1.4) / 0.8, 0, 1);
      ctx.fillRect(W * 0.35, H * 0.62, W * 0.3, 5 * S);
      ctx.restore();
      /* 幕片 */
      for (var i = 0; i < n; i++) {
        var pr = e.inOutQuart(U.clamp((t - 0.35 - i * p.stagger) / 1.35, 0, 1));
        var x = i * pw;
        var open = pr * (H * 1.05);
        ctx.save();
        var pg = ctx.createLinearGradient(x, 0, x + pw, 0);
        pg.addColorStop(0, U.mix(U.bg1, '#FFFFFF', 0.03));
        pg.addColorStop(0.5, U.mix(U.bg2, '#FFFFFF', 0.07));
        pg.addColorStop(1, U.mix(U.bg1, '#FFFFFF', 0.02));
        ctx.fillStyle = pg;
        ctx.fillRect(x, -open, pw, H + 2);
        ctx.strokeStyle = U.rgba(U.ink, 0.12);
        ctx.lineWidth = 1.4 * S;
        ctx.beginPath();
        ctx.moveTo(x + pw, -open);
        ctx.lineTo(x + pw, H - open);
        ctx.stroke();
        if (p.beam > 0.05 && pr > 0.02 && pr < 0.98) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          var bg2 = ctx.createLinearGradient(0, H - open - 90 * S, 0, H - open + 20 * S);
          bg2.addColorStop(0, 'rgba(0,0,0,0)');
          bg2.addColorStop(0.7, U.rgba(U.accent, 0.5 * p.beam));
          bg2.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bg2;
          ctx.fillRect(x, H - open - 90 * S, pw, 110 * S);
          ctx.restore();
        }
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'spring-pop', name: '弹性弹入', cat: '入场与反馈', type: 'block', dur: 5, poster: 0.7,
    desc: '元素以过冲回弹的弹性入场，落地瞬间产生冲击环与地面投影收缩，适合按钮与卡片强调。',
    tags: ['弹性', '过冲', '强调'],
    params: [
      { k: 'shape', label: '元素', type: 'select', options: [['box', '圆角方'], ['circle', '圆形'], ['text', '文字']], def: 'box' },
      { k: 'text', label: '文字（文字模式）', type: 'text', def: 'START' },
      { k: 'size', label: '尺寸', type: 'range', min: 0.08, max: 0.4, step: 0.01, def: 0.2 },
      { k: 'bounce', label: '回弹强度', type: 'range', min: 0, max: 1, step: 0.05, def: 0.7 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var size = Math.min(W, H) * p.size;
      var cx = W / 2, cy = H * 0.48;
      var pr = U.clamp((t - 0.15) / 0.85, 0, 1);
      var sc = p.bounce > 0.05 ? e.outElastic(pr) : e.outBack(pr);
      var scale = 0.2 + 0.8 * sc;
      /* 冲击环 */
      for (var r = 0; r < 2; r++) {
        var rp = U.clamp((t - 0.75 - r * 0.1) / 1, 0, 1);
        if (rp <= 0 || rp >= 1) continue;
        ctx.save();
        ctx.globalAlpha = (1 - rp) * 0.55;
        ctx.strokeStyle = r ? U.accent2 : U.accent;
        ctx.lineWidth = (12 * (1 - rp) + 1) * S;
        var rad = size * (0.7 + rp * 3.2);
        ctx.beginPath();
        ctx.ellipse(cx, cy + size * 0.72, rad, rad * 0.24, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.32 * pr;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.66, size * (0.9 - sc * 0.25), size * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      var g = ctx.createLinearGradient(-size, -size, size, size);
      g.addColorStop(0, U.accent);
      g.addColorStop(1, U.accent2);
      ctx.shadowColor = U.rgba(U.accent, 0.65);
      ctx.shadowBlur = 50 * S;
      ctx.fillStyle = g;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'text') {
        ctx.font = U.fs(size * 0.72, 900);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(p.text || ''), 0, 0);
      } else {
        U.rr(ctx, -size / 2, -size / 2, size, size * 0.78, size * 0.2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  MF.register({
    id: 'text-scramble', name: '乱码解码', cat: '入场与反馈', type: 'block', dur: 6, poster: 0.8,
    desc: '字符先在乱码中高速跳动，再自左向右逐位锁定为最终文案，适合科技感标题与数据揭示。',
    tags: ['乱码', '解码', '科技'],
    params: [
      { k: 'text', label: '最终文案', type: 'text', def: 'JAYKOU' },
      { k: 'chars', label: '乱码字符集', type: 'text', def: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/\\' },
      { k: 'speed', label: '跳动速度', type: 'range', min: 4, max: 40, step: 1, def: 16 },
      { k: 'lock', label: '锁定节奏(秒/字)', type: 'range', min: 0.02, max: 0.3, step: 0.01, def: 0.075 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var txt = String(p.text || '');
      var pool = String(p.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
      var size = Math.min(W * 0.16, H * 0.3);
      ctx.save();
      ctx.font = U.fs(size, 900);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var widths = [], tot = 0;
      for (var i = 0; i < txt.length; i++) {
        var w = ctx.measureText(txt[i]).width * 1.06;
        widths.push(w); tot += w;
      }
      var x = W / 2 - tot / 2;
      var frame = Math.floor(t * p.speed);
      for (var j = 0; j < txt.length; j++) {
        var lockAt = 0.4 + j * p.lock;
        var locked = t >= lockAt;
        var ch = txt[j];
        if (!locked && txt[j] !== ' ') {
          var r = U.rng(j * 13.7 + frame * 1.31);
          ch = pool.charAt(Math.floor(r * pool.length) % pool.length);
        }
        var flick = locked ? 1 : 0.55 + 0.45 * U.rng(j * 3.3 + frame);
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 0.1) / 0.3, 0, 1) * flick;
        if (locked) {
          var g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
          g.addColorStop(0, U.ink);
          g.addColorStop(1, U.mix(U.ink, U.accent, 0.55));
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = U.rgba(U.accent, 0.9);
        }
        ctx.fillText(ch, x, H / 2 + (locked ? 0 : U.rng(j * 7.1 + frame) * 4 * S - 2 * S));
        ctx.restore();
        x += widths[j];
      }
      ctx.restore();
      ctx.save();
      var allLocked = t > 0.4 + txt.length * p.lock;
      ctx.globalAlpha = U.clamp((t - (0.4 + txt.length * p.lock)) / 0.5, 0, 1);
      var uw = tot * U.clamp((t - (0.5 + txt.length * p.lock)) / 0.7, 0, 1);
      var g2 = ctx.createLinearGradient(W / 2 - uw / 2, 0, W / 2 + uw / 2, 0);
      g2.addColorStop(0, U.accent);
      g2.addColorStop(1, U.accent2);
      ctx.fillStyle = g2;
      ctx.fillRect(W / 2 - uw / 2, H * 0.5 + size * 0.72, uw, 4 * S);
      ctx.restore();
    }
  });

  MF.register({
    id: 'wave-reveal', name: '波浪显现', cat: '入场与反馈', type: 'block', dur: 7, poster: 0.7,
    desc: '波浪形遮罩自下而上漫过画面，把文字与色块逐层显现出来，水面带轻微抖动与高光。',
    tags: ['波浪', '遮罩', '显现'],
    params: [
      { k: 'text', label: '文案', type: 'text', def: 'FLOW' },
      { k: 'waves', label: '波数', type: 'range', min: 1, max: 6, step: 1, def: 3 },
      { k: 'amp', label: '波幅', type: 'range', min: 0.01, max: 0.14, step: 0.005, def: 0.05 },
      { k: 'speed', label: '波速', type: 'range', min: 0.2, max: 3, step: 0.05, def: 1 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var lvl = e.inOutCubic(U.clamp((t - 0.3) / 2.6, 0, 1));
      var wy = H * (1.05 - lvl * 1.15);
      var n = Math.round(p.waves);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-10, H + 20);
      ctx.lineTo(-10, wy);
      for (var x = 0; x <= W + 10; x += 12 * S) {
        var y = wy;
        for (var k = 0; k < n; k++) {
          y += Math.sin(x * (0.006 + k * 0.004) + t * p.speed * (1.4 + k * 0.6)) * H * p.amp * (1 / (k + 1.4));
        }
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W + 10, H + 20);
      ctx.closePath();
      ctx.clip();
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, U.accent);
      g.addColorStop(0.5, U.mix(U.accent, U.accent2, 0.6));
      g.addColorStop(1, U.accent2);
      ctx.fillStyle = g;
      ctx.fillRect(-10, -10, W + 20, H + 20);
      ctx.save();
      var tg = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.65);
      tg.addColorStop(0, '#FFFFFF');
      tg.addColorStop(1, U.rgba('#FFFFFF', 0.65));
      ctx.fillStyle = tg;
      ctx.font = U.fs(Math.min(W * 0.22, H * 0.4), 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || ''), W / 2, H * 0.5);
      ctx.restore();
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = U.rgba('#FFFFFF', 0.75);
      ctx.lineWidth = 3 * S;
      ctx.beginPath();
      for (var x2 = 0; x2 <= W + 10; x2 += 12 * S) {
        var y2 = wy;
        for (var k2 = 0; k2 < n; k2++) {
          y2 += Math.sin(x2 * (0.006 + k2 * 0.004) + t * p.speed * (1.4 + k2 * 0.6)) * H * p.amp * (1 / (k2 + 1.4));
        }
        if (x2) ctx.lineTo(x2, y2); else ctx.moveTo(x2, y2);
      }
      ctx.stroke();
      ctx.restore();
    }
  });

  /* ══════════════════════════ 几何与抽象 ══════════════════════════ */

  MF.register({
    id: 'spiral-galaxy', name: '旋转星系', cat: '几何与抽象', type: 'block', dur: 12, poster: 0.5,
    desc: '数千颗粒子按差速旋转构成螺旋星系，中心有明亮的核球，适合宇宙主题与抽象品牌背景。',
    tags: ['星系', '螺旋', '宇宙'],
    params: [
      { k: 'count', label: '粒子数', type: 'range', min: 200, max: 2600, step: 50, def: 1200 },
      { k: 'arms', label: '旋臂数', type: 'range', min: 1, max: 6, step: 1, def: 3 },
      { k: 'twist', label: '缠绕度', type: 'range', min: 1, max: 9, step: 0.2, def: 4.2 },
      { k: 'speed', label: '转速', type: 'range', min: 0.05, max: 1, step: 0.05, def: 0.22 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var n = Math.round(p.count);
      var cx = W / 2, cy = H / 2;
      var R = Math.min(W, H) * 0.42;
      var arms = Math.round(p.arms);
      var appear = e.outCubic(U.clamp(t / 2.4, 0, 1));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < n; i++) {
        var arm = i % arms;
        var rr = Math.pow(U.rng(i * 1.37), 0.62);
        var ang = (arm / arms) * Math.PI * 2 + rr * p.twist + t * p.speed * (1.4 - rr);
        var rad = rr * R;
        var jitter = 40 * S * rr;
        var x = cx + Math.cos(ang) * rad + U.noise(i * 0.7, 1) * jitter;
        var y = cy + Math.sin(ang) * rad * 0.52 + U.noise(i * 0.9, 2) * jitter * 0.6;
        var a = (1 - rr) * 0.85 * appear + 0.06;
        var col = rr < 0.22 ? '#FFFFFF' : (i % 7 === 0 ? U.accent2 : U.accent);
        ctx.fillStyle = U.rgba(col, a);
        var sz = (1.6 + (1 - rr) * 3.4) * S;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      core.addColorStop(0, U.rgba('#FFFFFF', 0.85 * appear));
      core.addColorStop(0.22, U.rgba(U.accent, 0.5 * appear));
      core.addColorStop(0.6, U.rgba(U.accent2, 0.14 * appear));
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.2, R * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  MF.register({
    id: 'cosmic-orb', name: '星云玻璃球', cat: '几何与抽象', type: 'block', dur: 10, poster: 0.6,
    desc: '一颗通透的玻璃球体内有星云缓慢翻涌，外层环绕一枚倾斜光环，带高光与折射感。',
    tags: ['球体', '星云', '玻璃'],
    params: [
      { k: 'size', label: '球体大小', type: 'range', min: 0.1, max: 0.34, step: 0.01, def: 0.22 },
      { k: 'nebula', label: '星云活跃度', type: 'range', min: 0, max: 1, step: 0.05, def: 0.7 },
      { k: 'ring', label: '光环倾角', type: 'range', min: -1, max: 1, step: 0.05, def: 0.42 },
      { k: 'speed', label: '旋转速度', type: 'range', min: 0, max: 1, step: 0.02, def: 0.24 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var R = Math.min(W, H) * p.size;
      var cx = W / 2, cy = H * 0.5;
      var appear = e.outCubic(U.clamp(t / 1.1, 0, 1));
      R *= 0.7 + 0.3 * appear;
      ctx.save();
      ctx.globalAlpha = U.clamp(t / 0.7, 0, 1);
      /* 光环后半 */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(p.ring * 0.5);
      ctx.scale(1, 1 - Math.abs(p.ring) * 0.72);
      ctx.strokeStyle = U.rgba(U.accent2, 0.35);
      ctx.lineWidth = 3 * S;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.45, Math.PI, Math.PI * 2);
      ctx.stroke();
      for (var i = 0; i < 40; i++) {
        var a = t * p.speed * 1.6 + (Math.PI * 2 * i) / 40;
        var rr = R * 1.45;
        ctx.fillStyle = U.rgba(i % 3 ? U.accent2 : '#FFFFFF', 0.5);
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, (1.4 + (i % 4)) * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      /* 球体 */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R * 1.1);
      g.addColorStop(0, U.mix(U.bg2, U.ink, 0.35));
      g.addColorStop(0.5, U.mix(U.bg1, U.accent2, 0.28));
      g.addColorStop(1, '#04050A');
      ctx.fillStyle = g;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      for (var b = 0; b < 6; b++) {
        var ba = t * p.speed * (0.4 + b * 0.1) + b * 2.1;
        var bx = cx + Math.cos(ba) * R * 0.42;
        var by = cy + Math.sin(ba * 1.3) * R * 0.38;
        var br = R * (0.3 + U.rng(b * 3.1) * 0.45);
        var bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0, U.rgba(b % 2 ? U.accent : U.accent2, 0.5 * p.nebula));
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
      for (var s = 0; s < 90; s++) {
        var sa = U.rng(s * 1.7) * Math.PI * 2 + t * p.speed * 0.3;
        var sr = Math.pow(U.rng(s * 3.3), 0.6) * R * 0.96;
        ctx.fillStyle = U.rgba('#FFFFFF', 0.25 + U.rng(s * 5.7) * 0.6);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr, 1.4 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      /* 玻璃高光 */
      ctx.save();
      ctx.strokeStyle = U.rgba(U.ink, 0.35);
      ctx.lineWidth = 1.8 * S;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI * 0.9, -Math.PI * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.005, Math.PI * 0.15, Math.PI * 0.6);
      ctx.strokeStyle = U.rgba(U.ink, 0.16);
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = U.rgba('#FFFFFF', 0.5);
      ctx.beginPath();
      ctx.ellipse(cx - R * 0.42, cy - R * 0.44, R * 0.2, R * 0.12, -0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      /* 光环前半 */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(p.ring * 0.5);
      ctx.scale(1, 1 - Math.abs(p.ring) * 0.72);
      ctx.strokeStyle = U.rgba(U.accent, 0.6);
      ctx.lineWidth = 3 * S;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.45, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }
  });

  MF.register({
    id: 'moire-waves', name: '摩尔纹波纹', cat: '几何与抽象', type: 'block', dur: 9, poster: 0.55,
    desc: '三组同心圆波纹相互干涉形成摩尔纹图案，随相位缓慢漂移，抽象而克制，适合做视觉底纹。',
    tags: ['摩尔纹', '干涉', '波纹'],
    params: [
      { k: 'centers', label: '波源数量', type: 'range', min: 2, max: 5, step: 1, def: 3 },
      { k: 'freq', label: '波纹密度', type: 'range', min: 6, max: 70, step: 1, def: 26 },
      { k: 'speed', label: '漂移速度', type: 'range', min: 0, max: 1.5, step: 0.05, def: 0.35 },
      { k: 'lw', label: '线宽', type: 'range', min: 0.6, max: 6, step: 0.2, def: 1.6 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var n = Math.round(p.centers);
      var appear = e.outCubic(U.clamp(t / 1.2, 0, 1));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var c = 0; c < n; c++) {
        var cx = W * (0.2 + 0.6 * U.rng(c * 3.1)) + Math.sin(t * p.speed + c) * W * 0.06;
        var cy = H * (0.2 + 0.6 * U.rng(c * 7.7)) + Math.cos(t * p.speed * 0.8 + c * 1.7) * H * 0.06;
        var maxR = Math.hypot(W, H) * 0.62;
        var rings = Math.round(p.freq);
        ctx.strokeStyle = U.rgba(c % 2 ? U.accent : U.accent2, 0.5);
        ctx.lineWidth = p.lw * S;
        for (var i = 0; i < rings; i++) {
          var rad = (i / rings) * maxR;
          if (rad < 2) continue;
          ctx.globalAlpha = (1 - (i / rings)) * 0.8 * appear;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      ctx.save();
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, U.rgba(U.bg1, 0.9));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  MF.register({
    id: 'grid-pulse', name: '网格脉冲', cat: '几何与抽象', type: 'block', dur: 8, poster: 0.5,
    desc: '网格线上有一道脉冲光带横向扫过，沿线节点被依次点亮并留下延时余辉，科技感十足。',
    tags: ['网格', '脉冲', '节点'],
    params: [
      { k: 'gap', label: '网格间距', type: 'range', min: 40, max: 240, step: 10, def: 110 },
      { k: 'speed', label: '脉冲速度', type: 'range', min: 0.1, max: 1.5, step: 0.05, def: 0.5 },
      { k: 'nodes', label: '显示节点', type: 'toggle', def: true },
      { k: 'beam', label: '光带宽度', type: 'range', min: 0.02, max: 0.3, step: 0.01, def: 0.1 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var gap = p.gap * S;
      var cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
      var appear = e.outCubic(U.clamp(t / 1.1, 0, 1));
      ctx.save();
      ctx.globalAlpha = appear;
      ctx.strokeStyle = U.rgba(U.ink, 0.1);
      ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      for (var c = 0; c < cols; c++) { ctx.moveTo(c * gap, 0); ctx.lineTo(c * gap, H); }
      for (var r = 0; r < rows; r++) { ctx.moveTo(0, r * gap); ctx.lineTo(W, r * gap); }
      ctx.stroke();
      ctx.restore();
      var head = ((t * p.speed * 0.6) % 1) * 1.4 - 0.2;
      var hx = head * W;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var bg = ctx.createLinearGradient(hx - W * p.beam, 0, hx + W * p.beam, 0);
      bg.addColorStop(0, 'rgba(0,0,0,0)');
      bg.addColorStop(0.5, U.rgba(U.accent, 0.35));
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = U.rgba('#FFFFFF', 0.5);
      ctx.lineWidth = 2.4 * S;
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, H);
      ctx.stroke();
      ctx.restore();
      if (p.nodes) {
        for (var c2 = 0; c2 < cols; c2++) {
          for (var r2 = 0; r2 < rows; r2++) {
            var x = c2 * gap, y = r2 * gap;
            var d = Math.abs(x - hx) / (W * 0.34);
            var k = Math.max(0, 1 - d);
            var jitter = 0.7 + 0.5 * U.noise(c2 * 1.3 + r2 * 2.7, 4);
            ctx.fillStyle = U.rgba(k > 0.5 ? '#FFFFFF' : U.accent, 0.18 + k * k * 0.85 * jitter);
            ctx.beginPath();
            ctx.arc(x, y, (2.4 + k * 5.4) * S, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  });
})();

/* ════════ assets/js/forge.js ════════ */
/* ==========================================================================
   Jaykou — Forge（动效锻造器）

   作用：把「一份绘制原语 + 一组参数配方」批量注册成独立动效。
   这样几百个动效共享同一套经过验证的运动语法，但每个动效拥有自己的
   名称、描述、标签、默认参数与时长 —— 视觉上各不相同，且都能继续调参。

   硬约束：draw 函数会被 toString() 序列化进导出产物（单文件 HTML / React）。
   因此原语 draw 必须「自包含」—— 只能使用形参 (ctx, t, p, U)，
   绝不引用外部作用域变量或外部辅助函数，全部行为由 p（参数）驱动。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* 注册一批同族动效。
     spec = {
       cat:    分类名
       type:   'block' | 'component'
       dur:    默认时长
       poster: 默认代表帧位置
       params: 参数 schema（各变体可覆盖 def）
       draw:   绘制原语
       ids:    [{ id, name, desc, tags, dur, poster, cfg:{参数默认值覆盖} }]
     } */
  MF.forge = function (spec) {
    var base = spec.params || [];
    var list = spec.ids || [];
    /* 可选：为没有自定义文案的变体轮换默认文案，避免整个分类的封面长得一样 */
    if (spec.texts && spec.texts.length) {
      var field = spec.textField || 'text';
      list.forEach(function (item, ix) {
        item.cfg = item.cfg || {};
        if (item.cfg[field] === undefined) item.cfg[field] = spec.texts[ix % spec.texts.length];
      });
    }
    list.forEach(function (item) {
      var params = base.map(function (pd) {
        var def = pd.def;
        if (item.cfg && item.cfg[pd.k] !== undefined) def = item.cfg[pd.k];
        var np = { k: pd.k, label: pd.label, type: pd.type, def: def };
        if (pd.min !== undefined) np.min = pd.min;
        if (pd.max !== undefined) np.max = pd.max;
        if (pd.step !== undefined) np.step = pd.step;
        if (pd.options) np.options = pd.options;
        return np;
      });
      MF.register({
        id: item.id,
        name: item.name,
        cat: spec.cat,
        type: item.type || spec.type || 'block',
        dur: item.dur === undefined ? (spec.dur === undefined ? 5.5 : spec.dur) : item.dur,
        poster: item.poster === undefined
          ? (spec.poster === undefined ? 0.72 : spec.poster) : item.poster,
        desc: item.desc || '',
        tags: item.tags || [],
        params: params,
        draw: spec.draw
      });
    });
    return list.length;
  };

  /* 参数 schema 的快速构造（少写点字，统一风格） */
  MF.P = function (k, label, def, opts) {
    var o = { k: k, label: label, def: def };
    if (opts) for (var i in opts) if (opts.hasOwnProperty(i)) o[i] = opts[i];
    return o;
  };
  MF.sel = function (def, options) { return { type: 'select', def: def, options: options }; };
  MF.rng = function (def, min, max, step) { return { type: 'range', def: def, min: min, max: max, step: step }; };
  MF.txt = function (def, area) { return { type: area ? 'textarea' : 'text', def: def }; };
  MF.col = function (def) { return { type: 'color', def: def }; };
})();

/* ════════ assets/js/effects-05.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 05
   原语：元素入场 / 元素退场
   --------------------------------------------------------------------------
   一份自包含的绘制原语，通过参数配方批量产出几十个视觉各不相同的动效。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  /* ══════════════════════════ 原语一：元素入场 ══════════════════════════ */

  var ENTER_PARAMS = [
    P('text', '文案', 'MOTION', txt('MOTION')),
    P('sub', '副标题', '', txt('')),
    P('dir', '入场方向', 'up', sel('up', [
      ['up', '下方升入'], ['down', '上方落下'], ['left', '左侧滑入'], ['right', '右侧滑入'],
      ['scale', '缩放浮现'], ['rotate', '旋转入场'], ['flip', '翻转展开'],
      ['roll', '滚入'], ['blur', '虚化聚焦']
    ])),
    P('curve', '运动曲线', 'outCubic', sel('outCubic', [
      ['outCubic', '平滑'], ['outExpo', '急停'], ['outQuint', '干净'],
      ['outBack', '回弹'], ['outElastic', '弹性'], ['outBounce', '弹跳'], ['inOutQuint', '均衡']
    ])),
    P('dist', '位移量', 180, rng(180, 30, 640, 10)),
    P('anim', '动作时长', 0.9, rng(0.9, 0.3, 2.2, 0.05)),
    P('delay', '延迟', 0.2, rng(0.2, 0, 1.4, 0.05)),
    P('size', '字号', 229, rng(229, 321, 321, 2)),
    P('shape', '元素形态', 'text', sel('text', [
      ['text', '大字标题'], ['title', '标题组'], ['card', '信息卡片'], ['chip', '胶囊标签']
    ])),
    P('blurAmt', '虚化强度', 16, rng(16, 0, 40, 1)),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  function enterDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var ez = e[p.curve] || e.outCubic;
    var raw = U.clamp((t - p.delay) / Math.max(0.08, p.anim), 0, 1);
    var k = ez(raw);
    var vis = U.clamp(raw * 2.6, 0, 1);
    var d = p.dist * S;
    var dx = 0, dy = 0, rot = 0, sc = 1, sy = 1;
    var dir = p.dir;
    if (dir === 'up') { dy = (1 - k) * d; }
    else if (dir === 'down') { dy = -(1 - k) * d; }
    else if (dir === 'left') { dx = -(1 - k) * d; }
    else if (dir === 'right') { dx = (1 - k) * d; }
    else if (dir === 'scale') { sc = 0.5 + 0.5 * k; }
    else if (dir === 'rotate') { rot = (1 - k) * -0.5; sc = 0.72 + 0.28 * k; }
    else if (dir === 'flip') { sy = 0.035 + 0.965 * k; }
    else if (dir === 'roll') { rot = (1 - k) * -0.55; dx = -(1 - k) * d * 0.5; dy = (1 - k) * d * 0.2; }
    else if (dir === 'blur') { sc = 0.9 + 0.1 * k; }
    else { dy = (1 - k) * d; }
    var blur = (1 - k) * p.blurAmt * S;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.globalAlpha = vis;
    if (blur > 0.5) ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
    ctx.translate(dx, dy);
    if (rot) ctx.rotate(rot);
    ctx.scale(sc, sc * sy);

    var size = p.size * S;
    var label = String(p.text || '');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* 重绘主体：三种形态共享同一套入场变换 */
    var shape = p.shape;
    if (shape === 'card' || shape === 'chip') {
      ctx.font = U.fs(size * (shape === 'chip' ? 0.42 : 0.62), 800);
      var tw = ctx.measureText(label).width;
      var padX = size * (shape === 'chip' ? 0.62 : 0.8);
      var padY = size * (shape === 'chip' ? 0.34 : 0.66);
      var cw = Math.max(tw + padX * 2, size * 2.6);
      var ch = shape === 'chip' ? size * 0.95 : Math.max(size * 1.7, size * 1.7);
      var rd = shape === 'chip' ? ch / 2 : size * 0.28;
      ctx.shadowColor = U.rgba('#000000', 0.45);
      ctx.shadowBlur = 46 * S; ctx.shadowOffsetY = 16 * S;
      var g = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
      g.addColorStop(0, U.rgba(U.mix(U.bg2, U.accent, 0.42), 0.99));
      g.addColorStop(1, U.rgba(U.mix(U.bg1, U.accent2, 0.3), 0.99));
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch, rd);
      ctx.fillStyle = g; ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.16); ctx.lineWidth = 1.6 * S; ctx.stroke();
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.9); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.fillStyle = U.ink;
      ctx.fillText(label, 0, shape === 'card' ? -size * 0.2 : 0);
      ctx.shadowBlur = 0;
      if (shape === 'card' && p.sub) {
        ctx.font = U.fs(size * 0.3, 600);
        ctx.fillStyle = U.rgba(U.ink, 0.6);
        ctx.fillText(String(p.sub), 0, size * 0.42);
      }
      ctx.restore();
      return;
    }

    /* 大字标题 / 标题组 */
    ctx.font = U.fs(size, 900);
    var gr = ctx.createLinearGradient(-W * 0.3, 0, W * 0.3, 0);
    gr.addColorStop(0, U.ink);
    gr.addColorStop(1, U.mix(U.ink, U.accent, 0.55));
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 36 * S * p.glow; }
    ctx.fillStyle = gr;
    ctx.fillText(label, 0, shape === 'title' ? -size * 0.16 : 0);
    ctx.shadowBlur = 0;

    if (shape === 'title') {
      var uw = Math.min(ctx.measureText(label).width, W * 0.78);
      var grow = U.clamp((raw - 0.35) / 0.5, 0, 1);
      var gg = ctx.createLinearGradient(-uw / 2, 0, uw / 2, 0);
      gg.addColorStop(0, U.accent); gg.addColorStop(1, U.accent2);
      ctx.fillStyle = gg;
      ctx.fillRect(-uw / 2, size * 0.56, uw * grow, 5 * S);
      if (p.sub) {
        var sp = U.clamp((raw - 0.5) / 0.5, 0, 1);
        ctx.globalAlpha = vis * sp;
        ctx.font = U.fs(size * 0.26, 600);
        ctx.fillStyle = U.rgba(U.ink, 0.62);
        ctx.letterSpacing = '2px';
        ctx.fillText(String(p.sub), 0, size * 0.94);
        ctx.letterSpacing = '0px';
      }
    }
    ctx.restore();
  }

  MF.forge({
    cat: '入场序列', type: 'block', dur: 5, poster: 0.16,
    texts: ['MOTION', 'IMPACT', 'BOOM', 'FOCUS', 'RISE', 'GLORY', 'LAUNCH', 'HERO', 'VIBES', 'DRIFT', 'SURGE', 'PIVOT', '闪亮登场', '重头戏', '开场'],
    params: ENTER_PARAMS, draw: enterDraw,
    ids: [
      { id: 'enter-fade', name: '淡入浮现', tags: ['淡入', '极简'], desc: '最克制的一种入场：只做透明度渐变，不加位移。适合需要安静出现的正文或图表。', cfg: { dir: 'blur', blurAmt: 0, dist: 0, glow: 0.2, anim: 1.1 } },
      { id: 'enter-up', name: '上浮入场', tags: ['上浮', '开场'], desc: '元素自下方升入并逐渐显影，最通用的开场动作，稳重不抢戏。', cfg: { dir: 'up' } },
      { id: 'enter-down', name: '下落入场', tags: ['下落', '开场'], desc: '元素自上方落下停稳，带一点重量感，适合标题与提示条。', cfg: { dir: 'down' } },
      { id: 'enter-left', name: '左侧滑入', tags: ['滑入', '横向'], desc: '元素从左侧平移进入，与阅读方向一致，常用于段落与列表。', cfg: { dir: 'left' } },
      { id: 'enter-right', name: '右侧滑入', tags: ['滑入', '横向'], desc: '元素从右侧平移进入，适合需要打破常规阅读节奏的画面。', cfg: { dir: 'right' } },
      { id: 'enter-scale', name: '缩放浮现', tags: ['缩放', '聚焦'], desc: '元素由小放大并淡入，像被镜头对焦，适合强调单个结论。', cfg: { dir: 'scale', glow: 0.6 } },
      { id: 'enter-rotate', name: '旋转入场', tags: ['旋转', '动感'], desc: '元素带角度旋转落位，动势更强，适合活泼的封面与新品亮相。', cfg: { dir: 'rotate', glow: 0.6 } },
      { id: 'enter-flip', name: '翻转展开', tags: ['翻转', '立体'], desc: '元素像翻牌一样从压扁状态展开，带轻微立体感，适合揭晓类画面。', cfg: { dir: 'flip', glow: 0.5 } },
      { id: 'enter-roll', name: '滚入落位', tags: ['滚入', '动感'], desc: '元素从侧下方滚动进入并回正，节奏明快，适合快剪片头。', cfg: { dir: 'roll', curve: 'outExpo' } },
      { id: 'enter-blur', name: '虚化聚焦', tags: ['虚化', '高级'], desc: '元素从模糊状态逐渐聚焦清晰，是很高级的入场方式，适合质感型内容。', cfg: { dir: 'blur', blurAmt: 30, anim: 1.2 } },
      { id: 'enter-back-up', name: '回弹上浮', tags: ['回弹', '俏皮'], desc: '上浮到位后再回弹一点点，动作有生命感，适合轻量级资讯类内容。', cfg: { dir: 'up', curve: 'outBack' } },
      { id: 'enter-back-scale', name: '回弹放大', tags: ['回弹', '强调'], desc: '放大到位后轻微回弹，强调感强但不粗暴，适合数字与卖点。', cfg: { dir: 'scale', curve: 'outBack' } },
      { id: 'enter-elastic-up', name: '弹性上浮', tags: ['弹性', '活泼'], desc: '弹性曲线带来的自然余震，是电商与社媒内容最常用的入场手感。', cfg: { dir: 'up', curve: 'outElastic', glow: 0.6 } },
      { id: 'enter-bounce-drop', name: '弹跳落下', tags: ['弹跳', '活泼'], desc: '元素落地后连续弹跳几次才停稳，趣味性强，适合促销与儿童向内容。', cfg: { dir: 'down', curve: 'outBounce', dist: 260 } },
      { id: 'enter-expo-left', name: '急停左滑', tags: ['急停', '快节奏'], desc: '高速滑入并瞬间刹停，节奏干脆，适合信息密度高的数据画面。', cfg: { dir: 'left', curve: 'outExpo', anim: 0.7 } },
      { id: 'enter-expo-right', name: '急停右滑', tags: ['急停', '快节奏'], desc: '高速自右侧滑入急停，与左滑形成镜像，适合左右对比布局。', cfg: { dir: 'right', curve: 'outExpo', anim: 0.7 } },
      { id: 'enter-quint-clean', name: '干净上浮', tags: ['干净', '通用'], desc: '用干净利落的五次曲线完成上浮，没有多余动作，最百搭的默认选择。', cfg: { dir: 'up', curve: 'outQuint' } },
      { id: 'enter-card-up', name: '卡片上浮', tags: ['卡片', '界面'], desc: '一张信息卡片从下方托起，适合界面演示与功能介绍。', cfg: { shape: 'card', text: 'Dashboard', sub: '实时数据概览', dir: 'up', size: 158 } },
      { id: 'enter-card-flip', name: '卡片翻转', tags: ['卡片', '翻转'], desc: '卡片翻面出现，带轻微的立体翻转，适合产品切换与前后对比。', cfg: { shape: 'card', text: 'Pro Plan', sub: '专为团队设计', dir: 'flip', glow: 0.55, size: 158 } },
      { id: 'enter-card-elastic', name: '卡片弹入', tags: ['卡片', '弹性'], desc: '卡片带弹性余震落入画面，适合消息通知与轻量级弹层。', cfg: { shape: 'card', text: 'New Message', sub: '来自 Jaykou', dir: 'up', curve: 'outElastic', size: 66 } },
      { id: 'enter-card-blur', name: '卡片聚焦', tags: ['卡片', '虚化'], desc: '卡片从虚化中显影，质感偏高级，适合金融与科技类内容。', cfg: { shape: 'card', text: 'Quarterly Report', sub: '2026 · Q3', dir: 'blur', blurAmt: 28, size: 141 } },
      { id: 'enter-card-zoom', name: '卡片推近', tags: ['卡片', '推近'], desc: '卡片由远推近并淡入，制造镜头推进的感觉。', cfg: { shape: 'card', text: 'Featured', sub: '本期精选', dir: 'scale', size: 70 } },
      { id: 'enter-chip-pop', name: '标签弹入', tags: ['标签', '俏皮'], desc: '小胶囊从中心弹出，适合给关键词打上标记。', cfg: { shape: 'chip', text: 'NEW', dir: 'scale', curve: 'outBack', glow: 0.7 } },
      { id: 'enter-chip-slide', name: '标签滑入', tags: ['标签', '横向'], desc: '胶囊从左侧滑入，适合多个标签依次登场的场景。', cfg: { shape: 'chip', text: '限时特惠', dir: 'left', glow: 0.5 } },
      { id: 'enter-chip-elastic', name: '标签弹跳', tags: ['标签', '弹性'], desc: '胶囊带弹性落地，适合促销标签与徽章。', cfg: { shape: 'chip', text: 'HOT', dir: 'down', curve: 'outBounce', glow: 0.7 } },
      { id: 'enter-chip-focus', name: '标签聚焦', tags: ['标签', '虚化'], desc: '胶囊从虚化中清晰，适合需要质感的品牌露出。', cfg: { shape: 'chip', text: 'PREMIUM', dir: 'blur', blurAmt: 24, glow: 0.8 } },
      { id: 'enter-title-up', name: '标题组升起', tags: ['标题', '开场'], desc: '标题、下划线、副标题依次升起，是标准的开场版式。', cfg: { shape: 'title', text: '让画面动起来', sub: '嘉Jaykou动效工作台', dir: 'up', size: 229 } },
      { id: 'enter-title-blur', name: '标题组聚焦', tags: ['标题', '虚化'], desc: '标题从模糊中显影，副标题随后淡入，情绪更沉稳。', cfg: { shape: 'title', text: 'Design in Motion', sub: '视觉表达 · 一次说清', dir: 'blur', blurAmt: 26, size: 211 } },
      { id: 'enter-title-scale', name: '标题组缩放', tags: ['标题', '聚焦'], desc: '标题由小放大到正位，强调感强，适合结论页。', cfg: { shape: 'title', text: '增长 237%', sub: '同比去年 · 全渠道', dir: 'scale', size: 118 } },
      { id: 'enter-title-flip', name: '标题组翻转', tags: ['标题', '立体'], desc: '标题翻面展开，带轻微透视，适合新品发布。', cfg: { shape: 'title', text: 'NEW ARRIVAL', sub: '2026 秋冬系列', dir: 'flip', size: 100 } },
      { id: 'enter-title-elastic', name: '标题组弹入', tags: ['标题', '弹性'], desc: '标题弹性落位，气场活泼，适合社媒内容开头。', cfg: { shape: 'title', text: '今天聊点干货', sub: '跨境电商 · 选品方法论', dir: 'up', curve: 'outElastic', size: 211 } },
      { id: 'enter-title-bounce', name: '标题组弹跳', tags: ['标题', '弹跳'], desc: '标题从上方弹跳落下，趣味性强，适合轻松话题。', cfg: { shape: 'title', text: '三个避坑点', sub: '踩过的坑 · 都在这', dir: 'down', curve: 'outBounce', size: 100 } },
      { id: 'enter-title-roll', name: '标题组滚入', tags: ['标题', '动感'], desc: '标题带旋转滚入，动势凌厉，适合快节奏片头。', cfg: { shape: 'title', text: 'SPEED UP', sub: '效率即是优势', dir: 'roll', curve: 'outExpo', glow: 0.6 } },
      { id: 'enter-title-clean', name: '标题组净入', tags: ['标题', '干净'], desc: '用干净的缓动完成上浮，没有任何多余动效，商务首选。', cfg: { shape: 'title', text: '季度经营复盘', sub: '数据 · 结论 · 下一步', dir: 'up', curve: 'outQuint', glow: 0.25 } },
      { id: 'enter-slow-lux', name: '从容浮现', tags: ['慢速', '高级'], desc: '放慢到 1.8 秒的入场，配合虚化，适合品牌片与高端物料。', cfg: { anim: 1.8, blurAmt: 22, dir: 'blur', glow: 0.3, text: 'REFINED' } },
      { id: 'enter-fast-punch', name: '极速登场', tags: ['快速', '冲击'], desc: '0.45 秒完成的猛烈入场，适合短视频前三秒抓注意力。', cfg: { anim: 0.45, dir: 'up', curve: 'outExpo', dist: 300, glow: 0.75, text: 'WAIT!' } },
      { id: 'enter-side-pop', name: '侧向弹入', tags: ['侧向', '回弹'], desc: '从侧向回弹进入，介于滑入与弹出之间的手感。', cfg: { dir: 'right', curve: 'outBack', dist: 240, text: '第一时间' } },
      { id: 'enter-soft-rise', name: '柔光升入', tags: ['柔光', '上浮'], desc: '低强度辉光配合缓速上浮，气质柔和，适合生活方式内容。', cfg: { dir: 'up', anim: 1.35, glow: 0.35, curve: 'outQuint', text: 'Slow Living' } },
      { id: 'enter-hard-cut', name: '硬切入场', tags: ['硬切', '利落'], desc: '极短动作时长、近乎瞬移的入场，适合强调信息的冲击力。', cfg: { anim: 0.32, curve: 'outExpo', dir: 'up', dist: 380, glow: 0.85, text: 'BREAK' } },
      { id: 'enter-diagonal', name: '对角滑入', tags: ['对角', '动态'], desc: '沿对角线方向滑入，比水平或垂直多一分设计感。', cfg: { dir: 'roll', curve: 'outExpo', dist: 280, text: 'Move Different' } },
      { id: 'enter-zoom-fade', name: '缩放淡入', tags: ['缩放', '通用'], desc: '缩放与透明度同步变化，是最中性的强调式入场。', cfg: { dir: 'scale', curve: 'outQuint', glow: 0.4, text: 'Insight' } },
      { id: 'enter-delayed-stack', name: '延迟叠加', tags: ['延迟', '节奏'], desc: '较长的延迟配合较强弹跳，适合紧跟上一个动效之后的二次强调。', cfg: { delay: 0.75, dir: 'up', curve: 'outBack', text: '然后呢？' } },
      { id: 'enter-tall-pop', name: '长距弹出', tags: ['长距', '冲击'], desc: '超长位移配合回弹曲线，让元素几乎从画面外冲进来。', cfg: { dir: 'up', dist: 620, curve: 'outBack', anim: 1.1, text: 'BOOM' } }
    ]
  });

  /* ══════════════════════════ 原语二：元素退场 ══════════════════════════ */

  var EXIT_PARAMS = [
    P('text', '文案', 'GOODBYE', txt('GOODBYE')),
    P('dir', '退场方向', 'up', sel('up', [
      ['up', '向上飘离'], ['down', '向下沉离'], ['left', '向左滑离'], ['right', '向右滑离'],
      ['scale', '缩小消失'], ['grow', '放大淡出'], ['rotate', '旋转离去'],
      ['flip', '翻转收起'], ['blur', '虚化消散']
    ])),
    P('curve', '运动曲线', 'inCubic', sel('inCubic', [
      ['inCubic', '加速'], ['inQuint', '猛冲'], ['inOutCubic', '起缓收急'], ['inQuad', '轻缓']
    ])),
    P('dist', '位移量', 200, rng(200, 30, 640, 10)),
    P('anim', '动作时长', 0.8, rng(0.8, 0.3, 2, 0.05)),
    P('hold', '保持时长', 1.2, rng(1.2, 0, 3, 0.1)),
    P('size', '字号', 211, rng(211, 295, 295, 2)),
    P('blurAmt', '虚化强度', 18, rng(18, 0, 40, 1)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function exitDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var ez = e[p.curve] || e.inCubic;
    var raw = U.clamp((t - p.hold) / Math.max(0.08, p.anim), 0, 1);
    var k = ez(raw);
    var vis = 1 - raw;
    var d = p.dist * S;
    var dx = 0, dy = 0, rot = 0, sc = 1, sy = 1;
    var dir = p.dir;
    if (dir === 'up') { dy = -k * d; }
    else if (dir === 'down') { dy = k * d; }
    else if (dir === 'left') { dx = -k * d; }
    else if (dir === 'right') { dx = k * d; }
    else if (dir === 'scale') { sc = 1 - 0.85 * k; }
    else if (dir === 'grow') { sc = 1 + 0.9 * k; }
    else if (dir === 'rotate') { rot = k * 0.7; sc = 1 - 0.4 * k; }
    else if (dir === 'flip') { sy = 1 - 0.97 * k; }
    else if (dir === 'blur') { sc = 1 - 0.12 * k; }
    else { dy = -k * d; }
    var blur = k * p.blurAmt * S;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.globalAlpha = U.clamp(vis, 0, 1);
    if (blur > 0.5) ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
    ctx.translate(dx, dy);
    if (rot) ctx.rotate(rot);
    ctx.scale(sc, sc * sy);

    var size = p.size * S;
    ctx.font = U.fs(size, 900);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var gr = ctx.createLinearGradient(-W * 0.3, 0, W * 0.3, 0);
    gr.addColorStop(0, U.ink);
    gr.addColorStop(1, U.mix(U.ink, U.accent2, 0.6));
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow); ctx.shadowBlur = 34 * S * p.glow; }
    ctx.fillStyle = gr;
    ctx.fillText(String(p.text || ''), 0, 0);
    ctx.restore();
  }

  MF.forge({
    cat: '退场收尾', type: 'block', dur: 5, poster: 0.62,
    texts: ['GOODBYE', 'SEE YOU', 'FADE OUT', 'THE END', 'EXIT', 'WRAP UP', 'ADIEU', 'FIN', '收尾', '落幕'],
    params: EXIT_PARAMS, draw: exitDraw,
    ids: [
      { id: 'exit-up', name: '上浮退离', tags: ['上浮', '收尾'], desc: '元素加速向上飘离，最常见的收尾动作，衔接下一个画面很自然。', cfg: { dir: 'up' } },
      { id: 'exit-down', name: '下沉退离', tags: ['下沉', '收尾'], desc: '元素向下沉离，带一点落幕感，适合章节结束。', cfg: { dir: 'down' } },
      { id: 'exit-left', name: '左滑退离', tags: ['左滑', '收尾'], desc: '元素向左滑出画面，与左滑入场互为镜像，可做往返切换。', cfg: { dir: 'left' } },
      { id: 'exit-right', name: '右滑退离', tags: ['右滑', '收尾'], desc: '元素向右滑出，与右滑入场互为镜像，可做往返切换。', cfg: { dir: 'right' } },
      { id: 'exit-scale', name: '缩小消失', tags: ['缩小', '收束'], desc: '元素缩向中心消失，把注意力收拢回画面中心。', cfg: { dir: 'scale' } },
      { id: 'exit-grow', name: '放大淡出', tags: ['放大', '穿越'], desc: '元素放大到冲出画面，像穿过镜头一样，适合场景切换。', cfg: { dir: 'grow', curve: 'inQuad' } },
      { id: 'exit-rotate', name: '旋转离去', tags: ['旋转', '动感'], desc: '元素边旋转边缩小离开，动势更有戏剧性。', cfg: { dir: 'rotate' } },
      { id: 'exit-flip', name: '翻转收起', tags: ['翻转', '立体'], desc: '元素像翻牌一样收拢消失，适合翻页与切换场景。', cfg: { dir: 'flip' } },
      { id: 'exit-blur', name: '虚化消散', tags: ['虚化', '高级'], desc: '元素逐渐模糊到消失，柔和且高级，适合品牌片收尾。', cfg: { dir: 'blur', blurAmt: 32, anim: 1.1 } },
      { id: 'exit-fast-cut', name: '急速切离', tags: ['急速', '利落'], desc: '极短时长内迅速离场，适合快剪节奏。', cfg: { dir: 'up', anim: 0.35, curve: 'inQuint', dist: 420 } },
      { id: 'exit-slow-fade', name: '缓缓隐没', tags: ['慢速', '抒情'], desc: '长时间缓慢淡出，情绪绵长，适合纪录片式收尾。', cfg: { dir: 'blur', blurAmt: 26, anim: 1.9, hold: 1 } },
      { id: 'exit-blow-up', name: '爆破离场', tags: ['放大', '冲击'], desc: '元素急速放大到超出画面，冲击感强，适合广告收尾。', cfg: { dir: 'grow', anim: 0.5, curve: 'inQuint', glow: 0.8 } },
      { id: 'exit-shrink-thread', name: '收束成点', tags: ['缩小', '聚焦'], desc: '元素缩小到几乎变成一个点后消失，像被光点吸走。', cfg: { dir: 'scale', anim: 1, curve: 'inOutCubic', glow: 0.7 } },
      { id: 'exit-drift', name: '漂流离去', tags: ['漂移', '柔和'], desc: '边轻微旋转边向上飘走，像纸片被风带走。', cfg: { dir: 'rotate', dist: 320, anim: 1.5, curve: 'inOutCubic' } },
      { id: 'exit-long-hold', name: '长留后离', tags: ['停留', '节奏'], desc: '保持 3 秒后再离场，适合需要充分阅读的标题。', cfg: { hold: 3, dir: 'up', anim: 0.7 } },
      { id: 'exit-vanish', name: '瞬间隐没', tags: ['瞬间', '极短'], desc: '几乎不带动效的瞬时消失，适合硬切剪辑。', cfg: { anim: 0.28, curve: 'inQuad', dir: 'blur', blurAmt: 8, dist: 40 } }
    ]
  });
})();

/* ════════ assets/js/effects-06.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 06
   原语：转场切换（两画面之间用不同遮罩或变换完成切换）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var TRANS_PARAMS = [
    P('textA', '前一画面', 'BEFORE', txt('BEFORE')),
    P('textB', '后一画面', 'AFTER', txt('AFTER')),
    P('kind', '转场类型', 'wipeH', sel('wipeH', [
      ['wipeH', '水平擦除'], ['wipeV', '垂直擦除'], ['circle', '圆形扩散'], ['iris', '光圈收拢'],
      ['diagonal', '对角擦除'], ['blinds', '百叶窗'], ['checker', '方格错落'], ['pixel', '像素溶解'],
      ['hex', '六边形扩散'], ['star', '星形扩散'], ['bars', '随机条形'], ['clock', '时钟扫描'],
      ['spiral', '螺旋推进'], ['wave', '波浪推进'], ['cross', '十字扩散'], ['corners', '四角汇聚'],
      ['curtain', '幕布开合'], ['luma', '光带扫过'], ['mosaic', '马赛克拼合'], ['ripple', '涟漪扩散'],
      ['shutter', '快门条'], ['triangle', '三角拼合'], ['sweep', '扇扫'], ['grain', '噪点溶解'],
      ['pushLeft', '向左推移'], ['pushRight', '向右推移'], ['slideUp', '向上推移'], ['slideDown', '向下推移'],
      ['zoomIn', '推近切换'], ['zoomOut', '拉远切换'], ['blurMix', '模糊交叠'], ['flip3d', '3D 翻转']
    ])),
    P('anim', '切换时长', 1.3, rng(1.3, 0.5, 3, 0.05)),
    P('size', '字号', 150, rng(150, 60, 260, 2)),
    P('decor', '装饰强度', 0.55, rng(0.55, 0, 1, 0.05)),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function transDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var anim = Math.max(0.25, p.anim);
    var prog = U.clamp(t / anim, 0, 1);
    var k = e.inOutCubic(prog);
    var kind = p.kind;

    var TRANSFORM = {
      pushLeft: 1, pushRight: 1, slideUp: 1, slideDown: 1,
      zoomIn: 1, zoomOut: 1, blurMix: 1, flip3d: 1
    };
    var cols = [U.accent, U.accent2];
    var labels = [String(p.textA || ''), String(p.textB || '')];
    var diag = Math.sqrt(W * W + H * H);

    for (var layer = 0; layer < 2; layer++) {
      ctx.save();

      if (layer === 1) {
        if (TRANSFORM[kind]) {
          /* ---- 变换型：整屏推拉/缩放/翻面 ---- */
          if (kind === 'pushLeft') { ctx.translate(W * (1 - k), 0); }
          else if (kind === 'pushRight') { ctx.translate(-W * (1 - k), 0); }
          else if (kind === 'slideUp') { ctx.translate(0, H * (1 - k)); }
          else if (kind === 'slideDown') { ctx.translate(0, -H * (1 - k)); }
          else if (kind === 'zoomIn') {
            var zi = 0.35 + 0.65 * k; ctx.translate(W / 2, H / 2); ctx.scale(zi, zi); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = U.clamp(prog * 1.5, 0, 1);
          } else if (kind === 'zoomOut') {
            var zo = 2.6 - 1.6 * k; ctx.translate(W / 2, H / 2); ctx.scale(zo, zo); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = U.clamp(prog * 1.5, 0, 1);
          } else if (kind === 'blurMix') {
            ctx.globalAlpha = k;
            if (prog < 0.99 && prog > 0.01) ctx.filter = 'blur(' + ((1 - k) * 22 * S).toFixed(1) + 'px)';
          } else if (kind === 'flip3d') {
            var cs = Math.cos((1 - k) * Math.PI / 2);
            ctx.translate(W / 2, H / 2); ctx.scale(Math.max(0.02, Math.abs(cs)), 1); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = U.clamp(k * 1.4, 0, 1);
          }
        } else {
          /* ---- 遮罩型 ---- */
          ctx.beginPath();
          var K = kind, i, j, n, wq;
          if (K === 'wipeH') { ctx.rect(-2, -2, W * k + 2, H + 4); }
          else if (K === 'wipeV') { ctx.rect(-2, -2, W + 4, H * k + 2); }
          else if (K === 'circle') { ctx.arc(W / 2, H / 2, diag * 0.56 * k, 0, Math.PI * 2); }
          else if (K === 'ripple') {
            ctx.arc(W / 2, H / 2, diag * 0.56 * k, 0, Math.PI * 2);
            ctx.arc(W / 2, H / 2, diag * 0.56 * Math.max(0, k - 0.22), 0, Math.PI * 2);
          }
          else if (K === 'iris') {
            var hw = W / 2 * k, hh = H / 2 * k;
            ctx.rect(W / 2 - hw, H / 2 - hh, hw * 2, hh * 2);
          }
          else if (K === 'diagonal') {
            var s = (W + H + 200) * k;
            ctx.moveTo(-10, -10); ctx.lineTo(s - 10, -10); ctx.lineTo(-10, s - 10); ctx.closePath();
          }
          else if (K === 'blinds') {
            n = 14; var bh = H / n;
            for (i = 0; i < n; i++) {
              wq = U.clamp(k * 1.7 - i * 0.045, 0, 1);
              ctx.rect(0, i * bh + 1, W * wq, bh - 2);
            }
          }
          else if (K === 'checker') {
            var cC = 12, rR = 7, cw = W / cC, ch = H / rR;
            for (i = 0; i < rR; i++) for (j = 0; j < cC; j++) {
              var idx = i * cC + j, th = (idx % 9) / 9 * 0.4;
              var q = U.clamp((k - th) / 0.45, 0, 1);
              if (q <= 0) continue;
              var sx = cw * q / 2, sy = ch * q / 2;
              ctx.rect(j * cw + cw / 2 - sx, i * ch + ch / 2 - sy, sx * 2, sy * 2);
            }
          }
          else if (K === 'pixel') {
            var px = 20, py = 12, pw = W / px, ph = H / py;
            for (i = 0; i < py; i++) for (j = 0; j < px; j++) {
              if (k > U.rng(i * px + j) * 0.85) ctx.rect(j * pw, i * ph, pw + 1, ph + 1);
            }
          }
          else if (K === 'grain') {
            var gx = 42, gy = 24, gw = W / gx, gh = H / gy;
            for (i = 0; i < gy; i++) for (j = 0; j < gx; j++) {
              var thr = U.noise2(j * 0.5, i * 0.5, 11) * 0.5 + 0.5;
              if (k > thr * 0.9) ctx.rect(j * gw, i * gh, gw + 1, gh + 1);
            }
          }
          else if (K === 'mosaic') {
            var mC = 8, mR = 5, mw = W / mC, mh = H / mR;
            for (i = 0; i < mR; i++) for (j = 0; j < mC; j++) {
              var d = Math.abs(i - (mR - 1) / 2) + Math.abs(j - (mC - 1) / 2);
              var qq = U.clamp((k - d / 12) / 0.5, 0, 1);
              if (qq <= 0) continue;
              ctx.rect(j * mw + mw / 2 - mw * qq / 2, i * mh + mh / 2 - mh * qq / 2, mw * qq, mh * qq);
            }
          }
          else if (K === 'hex') {
            var hr = 62 * S, colW = hr * 1.732, rowH = hr * 1.5;
            for (var ry = -1; ry * rowH < H + rowH; ry++) {
              for (var rx = -1; rx * colW < W + colW; rx++) {
                var cx0 = rx * colW + (ry % 2 ? colW / 2 : 0), cy0 = ry * rowH;
                var dist = Math.hypot(cx0 - W / 2, cy0 - H / 2) / (diag * 0.5);
                if (k * 1.25 > dist) {
                  ctx.moveTo(cx0 + hr * Math.cos(0), cy0 + hr * Math.sin(0));
                  for (var a2 = 1; a2 <= 6; a2++) {
                    var ang = Math.PI * 2 * a2 / 6;
                    ctx.lineTo(cx0 + hr * Math.cos(ang), cy0 + hr * Math.sin(ang));
                  }
                  ctx.closePath();
                }
              }
            }
          }
          else if (K === 'star') {
            U.star(ctx, W / 2, H / 2, 5, diag * 0.62 * k, diag * 0.26 * k, -Math.PI / 2);
          }
          else if (K === 'bars') {
            n = 26; var bw = W / n;
            for (i = 0; i < n; i++) {
              var hgt = (0.25 + U.rng(i * 3 + 1) * 1.1) * k;
              ctx.rect(i * bw + 1, H - H * U.clamp(hgt, 0, 1), bw - 2, H * U.clamp(hgt, 0, 1));
            }
          }
          else if (K === 'clock') {
            var ca = -Math.PI / 2 + Math.PI * 2 * k;
            ctx.moveTo(W / 2, H / 2);
            ctx.arc(W / 2, H / 2, diag * 0.6, -Math.PI / 2, ca);
            ctx.closePath();
          }
          else if (K === 'sweep') {
            var sa = -Math.PI / 2 + Math.PI * 2 * k;
            ctx.moveTo(W * 0.22, H * 0.5);
            ctx.arc(W * 0.22, H * 0.5, diag * 0.85, -Math.PI / 2, sa);
            ctx.closePath();
          }
          else if (K === 'spiral') {
            ctx.moveTo(W / 2, H / 2);
            var turns = 2.6, steps = 190;
            for (i = 0; i <= steps * k; i++) {
              var frac = i / steps;
              var ang2 = frac * Math.PI * 2 * turns;
              var rad2 = diag * 0.6 * Math.pow(frac, 0.72);
              ctx.lineTo(W / 2 + Math.cos(ang2) * rad2, H / 2 + Math.sin(ang2) * rad2);
            }
            ctx.closePath();
          }
          else if (K === 'wave') {
            var colsN = 40, cwn = W / colsN;
            for (i = 0; i < colsN; i++) {
              var wv = Math.sin(i / colsN * Math.PI * 2.2 - prog * 6) * 0.5 + 0.5;
              var hgt2 = U.clamp(k * 1.35 - wv * 0.35, 0, 1);
              ctx.rect(i * cwn, 0, cwn + 1, H * hgt2);
            }
          }
          else if (K === 'cross') {
            var arm = Math.max(W, H) * k;
            ctx.rect(W / 2 - arm * 0.16, 0, arm * 0.32, H);
            ctx.rect(0, H / 2 - arm * 0.16, W, arm * 0.32);
          }
          else if (K === 'corners') {
            var cs2 = Math.min(W, H) * 0.85 * k;
            ctx.moveTo(0, 0); ctx.lineTo(cs2, 0); ctx.lineTo(0, cs2); ctx.closePath();
            ctx.moveTo(W, 0); ctx.lineTo(W - cs2, 0); ctx.lineTo(W, cs2); ctx.closePath();
            ctx.moveTo(0, H); ctx.lineTo(cs2, H); ctx.lineTo(0, H - cs2); ctx.closePath();
            ctx.moveTo(W, H); ctx.lineTo(W - cs2, H); ctx.lineTo(W, H - cs2); ctx.closePath();
          }
          else if (K === 'curtain') {
            var gapW = W * 0.5 * k;
            ctx.rect(0, 0, gapW, H);
            ctx.rect(W - gapW, 0, gapW, H);
          }
          else if (K === 'shutter') {
            n = 9; var sh = H / n;
            for (i = 0; i < n; i++) { ctx.rect(0, i * sh + 1, W * k, sh - 2); }
          }
          else if (K === 'triangle') {
            var tStep = Math.ceil(W / (120 * S)) + 1;
            var tW = W / tStep;
            for (i = 0; i < tStep; i++) {
              var q2 = U.clamp((k - (i % 4) * 0.07) / 0.6, 0, 1);
              if (q2 <= 0) continue;
              ctx.moveTo(i * tW, H); ctx.lineTo(i * tW + tW / 2, H - H * q2); ctx.lineTo(i * tW + tW, H);
              ctx.closePath();
            }
          }
          else if (K === 'luma') {
            var bandW = W * 0.28;
            var bx = -bandW + (W + bandW * 2) * k;
            ctx.rect(-2, -2, Math.max(0, bx), H + 4);
          }
          else { ctx.rect(-2, -2, W * k + 2, H + 4); }
          ctx.clip();
        }
      }

      /* ---- 绘制该层画面 ---- */
      var c = cols[layer];
      var g = ctx.createLinearGradient(0, 0, W * 0.9, H);
      g.addColorStop(0, U.mix(U.bg2, c, 0.62));
      g.addColorStop(1, U.mix(U.bg1, c, 0.16));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      if (p.decor > 0.02) {
        ctx.globalAlpha = p.decor;
        ctx.strokeStyle = U.rgba(U.ink, 0.1);
        ctx.lineWidth = 1.2 * S;
        ctx.beginPath();
        var stp = 88 * S;
        for (var gx2 = stp; gx2 < W; gx2 += stp) { ctx.moveTo(gx2, 0); ctx.lineTo(gx2, H); }
        for (var gy2 = stp; gy2 < H; gy2 += stp) { ctx.moveTo(0, gy2); ctx.lineTo(W, gy2); }
        ctx.stroke();
        var rg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.5);
        rg.addColorStop(0, U.rgba(c, 0.22 * p.decor));
        rg.addColorStop(1, U.rgba(c, 0));
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      ctx.font = U.fs(p.size * S, 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(c, p.glow); ctx.shadowBlur = 40 * S * p.glow; }
      ctx.fillStyle = U.ink;
      ctx.fillText(labels[layer], W / 2, H / 2);
      ctx.restore();
    }

    /* 中线指示（前后画面对比用，轻微） */
    if (p.decor > 0.5 && !TRANSFORM[kind] && prog > 0.02 && prog < 0.98) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = U.rgba(U.ink, 0.6);
      ctx.lineWidth = 1.4 * S;
      ctx.setLineDash([12 * S, 10 * S]);
      ctx.beginPath();
      ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H);
      ctx.stroke();
      ctx.restore();
    }
  }

  MF.forge({
    cat: '转场切换', type: 'block', dur: 5, poster: 0.3,
    params: TRANS_PARAMS, draw: transDraw,
    ids: [
      { id: 'tr-wipe-h', name: '水平擦除', tags: ['擦除', '通用'], desc: '自左向右推进的硬边擦除，最直白的转场，适合信息条与资料切换。', cfg: { kind: 'wipeH' } },
      { id: 'tr-wipe-v', name: '垂直擦除', tags: ['擦除', '通用'], desc: '自上而下推进的擦除，适合竖版视频与手机屏幕内容。', cfg: { kind: 'wipeV' } },
      { id: 'tr-circle', name: '圆形扩散', tags: ['圆形', '聚焦'], desc: '从画面中心向外扩散的圆形揭示，视觉焦点明确，适合揭晓答案。', cfg: { kind: 'circle' } },
      { id: 'tr-iris', name: '光圈收拢', tags: ['光圈', '镜头'], desc: '矩形光圈由大到小收拢切换，模拟镜头对焦，专业感强。', cfg: { kind: 'iris' } },
      { id: 'tr-diagonal', name: '对角擦除', tags: ['对角', '动感'], desc: '沿对角线方向斜切推进，比水平擦除更有设计感。', cfg: { kind: 'diagonal' } },
      { id: 'tr-blinds', name: '百叶窗', tags: ['百叶', '经典'], desc: '多条横缝依次打开的经典百叶窗转场，节奏感强。', cfg: { kind: 'blinds' } },
      { id: 'tr-checker', name: '方格错落', tags: ['方格', '俏皮'], desc: '画面被切成一格格随机先后揭示，活泼有趣，适合快节奏内容。', cfg: { kind: 'checker' } },
      { id: 'tr-pixel', name: '像素溶解', tags: ['像素', '科技'], desc: '像素块随机溶解出现，数字感强，适合科技与赛博主题。', cfg: { kind: 'pixel' } },
      { id: 'tr-grain', name: '噪点溶解', tags: ['噪点', '有机'], desc: '按噪声场逐步显现的柔和溶解，过渡自然不生硬。', cfg: { kind: 'grain' } },
      { id: 'tr-mosaic', name: '马赛克拼合', tags: ['马赛克', '中心'], desc: '从中心向外一块块拼满画面，有拼图的秩序感。', cfg: { kind: 'mosaic' } },
      { id: 'tr-hex', name: '六边形扩散', tags: ['六边形', '科技'], desc: '蜂窝状六边形由中心向外铺开，科技感与结构感兼备。', cfg: { kind: 'hex' } },
      { id: 'tr-star', name: '星形扩散', tags: ['星形', '活泼'], desc: '五角星形状放大铺满画面，适合儿童与活动主题。', cfg: { kind: 'star' } },
      { id: 'tr-bars', name: '随机条形', tags: ['条形', '节奏'], desc: '高低不一的竖条随机升起填满画面，节奏跳跃。', cfg: { kind: 'bars' } },
      { id: 'tr-clock', name: '时钟扫描', tags: ['扫描', '时间'], desc: '像表针一样扫过一圈完成切换，时间主题的首选。', cfg: { kind: 'clock' } },
      { id: 'tr-sweep', name: '扇扫推进', tags: ['扇形', '动感'], desc: '以偏心圆为轴心扇形扫过，动势更集中。', cfg: { kind: 'sweep' } },
      { id: 'tr-spiral', name: '螺旋推进', tags: ['螺旋', '迷幻'], desc: '沿螺旋路径展开画面，带一点眩晕的迷幻感。', cfg: { kind: 'spiral' } },
      { id: 'tr-wave', name: '波浪推进', tags: ['波浪', '柔和'], desc: '波浪状的高低起伏推进，过渡柔和自然。', cfg: { kind: 'wave' } },
      { id: 'tr-cross', name: '十字扩散', tags: ['十字', '结构'], desc: '十字形张开铺满画面，结构感强烈。', cfg: { kind: 'cross' } },
      { id: 'tr-corners', name: '四角汇聚', tags: ['四角', '汇聚'], desc: '四个角同时向内生长，适合做「聚焦中心」的转场。', cfg: { kind: 'corners' } },
      { id: 'tr-curtain', name: '幕布开合', tags: ['幕布', '舞台'], desc: '像舞台幕布一样从两侧收开，戏剧感强。', cfg: { kind: 'curtain' } },
      { id: 'tr-shutter', name: '快门条', tags: ['快门', '机械'], desc: '横条像快门一样逐条张开，机械感十足。', cfg: { kind: 'shutter' } },
      { id: 'tr-triangle', name: '三角拼合', tags: ['三角', '几何'], desc: '一排三角形自下而上撑起画面，几何构成感强。', cfg: { kind: 'triangle' } },
      { id: 'tr-luma', name: '光带扫过', tags: ['光带', '高级'], desc: '一条明亮光带扫过屏幕，扫过之处画面切换，高级感强。', cfg: { kind: 'luma', glow: 0.7 } },
      { id: 'tr-ripple', name: '涟漪扩散', tags: ['涟漪', '柔和'], desc: '双重涟漪同心扩散，柔和且有层次。', cfg: { kind: 'ripple' } },
      { id: 'tr-push-left', name: '向左推移', tags: ['推移', '连续'], desc: '后一画面把前一画面整体推向左侧，像翻页一样连贯。', cfg: { kind: 'pushLeft' } },
      { id: 'tr-push-right', name: '向右推移', tags: ['推移', '连续'], desc: '后一画面自右侧推入，与向左推移互为反向。', cfg: { kind: 'pushRight' } },
      { id: 'tr-slide-up', name: '向上推移', tags: ['推移', '竖版'], desc: '画面整体向上推移切换，适合竖屏内容与信息流。', cfg: { kind: 'slideUp' } },
      { id: 'tr-slide-down', name: '向下推移', tags: ['推移', '竖版'], desc: '画面整体向下推移切换，与向上推移互为反向。', cfg: { kind: 'slideDown' } },
      { id: 'tr-zoom-in', name: '推近切换', tags: ['推近', '冲击'], desc: '后一画面由远推近，带镜头推进感，适合强调与揭晓。', cfg: { kind: 'zoomIn' } },
      { id: 'tr-zoom-out', name: '拉远切换', tags: ['拉远', '收束'], desc: '后一画面由近拉远稳定下来，适合收尾与总结。', cfg: { kind: 'zoomOut' } },
      { id: 'tr-blur-mix', name: '模糊交叠', tags: ['模糊', '柔和'], desc: '两画面在模糊中交叠，几乎看不到切换的痕迹，最柔和的转场。', cfg: { kind: 'blurMix', anim: 1.6 } },
      { id: 'tr-flip-3d', name: '3D 翻转', tags: ['翻转', '立体'], desc: '画面像卡片一样绕竖轴翻面，立体感强。', cfg: { kind: 'flip3d' } }
    ]
  });
})();

/* ════════ assets/js/effects-07.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 07
   原语：文字特效（逐字型 / 整体型 / 特殊型）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var TEXT_PARAMS = [
    P('text', '文案', 'MOTION', txt('MOTION')),
    P('kind', '特效类型', 'rise', sel('rise', [
      ['rise', '逐字升起'], ['wave', '波浪浮动'], ['bounce', '逐字弹跳'], ['rotchar', '逐字旋转'],
      ['karaoke', '逐字点亮'], ['box', '逐字方框'], ['scale', '逐字缩放'], ['skew', '斜切入场'],
      ['blurchar', '逐字显影'], ['trackin', '聚拢字距'],
      ['gradient', '渐变流光'], ['outline', '描边空心'], ['glitch', '故障闪切'], ['maskrise', '遮罩上推'],
      ['mirror', '镜像倒影'], ['split', '上下分离'], ['stack', '重复叠影'], ['cycle', '色相循环'],
      ['shine', '光泽扫过'], ['extrude', '立体挤出'],
      ['typewriter', '打字机'], ['decode', '乱码解码'], ['scramble', '字符滚动'], ['countup', '数字滚动'],
      ['vertical', '竖排文字'], ['highlight', '荧光笔'], ['matrix', '点阵成像'], ['fire', '火焰文字'],
      ['liquid', '液态流动'], ['neon', '霓虹灯管']
    ])),
    P('size', '字号', 240, rng(240, 40.0, 324.0, 2.0)),
    P('weight', '字重', '900', sel('900', [['900', '特粗'], ['700', '粗体'], ['500', '中黑'], ['300', '细体']])),
    P('gap', '字距', 0, rng(0, -8, 34, 1)),
    P('speed', '速度', 1, rng(1, 0.3, 3, 0.1)),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  /* 逐字把字符串切成「绘制单元」：中文单字、英文单词、空格独立 */
  function sliceChars(str) {
    var raw = String(str || '');
    var out = [], buf = '';
    for (var i = 0; i < raw.length; i++) {
      var ch = raw.charAt(i);
      if (ch === ' ') {
        if (buf) { out.push(buf); buf = ''; }
        out.push(' ');
      } else if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/.test(ch)) {
        if (buf) { out.push(buf); buf = ''; }
        out.push(ch);
      } else {
        buf += ch;
      }
    }
    if (buf) out.push(buf);
    return out;
  }

  /* ─────────────── 原语 A：逐字型特效 ─────────────── */
  function textPerCharDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var size = p.size * S;
    /* 切分函数必须内联在 draw 内部：导出产物只保留 draw 的函数体 */
    function sliceChars(str) {
      var raw = String(str || '');
      var out = [], buf = '';
      for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        if (ch === ' ') {
          if (buf) { out.push(buf); buf = ''; }
          out.push(' ');
        } else if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/.test(ch)) {
          if (buf) { out.push(buf); buf = ''; }
          out.push(ch);
        } else {
          buf += ch;
        }
      }
      if (buf) out.push(buf);
      return out;
    }
    var chars = sliceChars(p.text);
    if (!chars.length) return;
    ctx.font = U.fs(size, p.weight);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    var gap = p.gap * S;
    var widths = [], total = 0, i;
    for (i = 0; i < chars.length; i++) {
      var w = ctx.measureText(chars[i]).width;
      widths.push(w); total += w;
    }
    total += gap * (chars.length - 1);
    var x0 = W / 2 - total / 2;
    var cy = H / 2;
    var kind = p.kind;
    var sp = Math.max(0.2, p.speed);

    var grad = ctx.createLinearGradient(x0, 0, x0 + total, 0);
    grad.addColorStop(0, U.ink);
    grad.addColorStop(1, U.mix(U.ink, U.accent, 0.5));

    var cursor = x0;
    for (i = 0; i < chars.length; i++) {
      var cx = cursor + widths[i] / 2;
      var idx = i;
      var k, dx = 0, dy = 0, rot = 0, sc = 1, alpha = 1, blur = 0;
      var col = grad;

      if (kind === 'rise') {
        k = e.outCubic(U.clamp((t * sp - 0.25 - idx * 0.07) / 0.75, 0, 1));
        dy = (1 - k) * size * 0.95; alpha = k;
      } else if (kind === 'wave') {
        k = 1; dy = Math.sin(t * sp * 2.6 - idx * 0.55) * size * 0.16;
        rot = Math.cos(t * sp * 2.6 - idx * 0.55) * 0.06;
      } else if (kind === 'bounce') {
        k = e.outBounce(U.clamp((t * sp - 0.2 - idx * 0.09) / 0.85, 0, 1));
        dy = -(1 - k) * size * 1.3; alpha = U.clamp(k * 2, 0, 1);
      } else if (kind === 'rotchar') {
        k = e.outBack(U.clamp((t * sp - 0.2 - idx * 0.08) / 0.9, 0, 1));
        rot = (1 - k) * 1.8; dy = (1 - k) * size * 0.4; sc = 0.6 + 0.4 * k; alpha = U.clamp(k * 1.8, 0, 1);
      } else if (kind === 'karaoke') {
        var lit = U.clamp((t * sp - 0.3) / 1.9, 0, 1) * chars.length;
        col = idx < lit ? grad : U.rgba(U.ink, 0.16);
        sc = 1 + U.clamp(1 - Math.abs(idx + 0.5 - lit), 0, 1) * 0.16;
      } else if (kind === 'box') {
        k = U.clamp((t * sp - 0.25 - idx * 0.1) / 0.55, 0, 1);
        alpha = k;
        ctx.save();
        ctx.globalAlpha = k * 0.9;
        ctx.strokeStyle = U.rgba(U.accent, 0.9);
        ctx.lineWidth = 2.4 * S;
        var bw = widths[i] * (0.55 + 0.55 * k), bh = size * (0.55 + 0.55 * k);
        U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 8 * S);
        ctx.stroke();
        ctx.restore();
      } else if (kind === 'scale') {
        k = e.outBack(U.clamp((t * sp - 0.25 - idx * 0.07) / 0.8, 0, 1));
        sc = 0.2 + 0.8 * k; alpha = U.clamp(k * 1.6, 0, 1);
      } else if (kind === 'skew') {
        k = e.outExpo(U.clamp((t * sp - 0.2 - idx * 0.06) / 0.7, 0, 1));
        dx = (1 - k) * size * 0.9; rot = (1 - k) * 0.5; alpha = k;
      } else if (kind === 'blurchar') {
        k = U.clamp((t * sp - 0.25 - idx * 0.08) / 0.9, 0, 1);
        alpha = k; blur = (1 - k) * size * 0.28;
      } else if (kind === 'trackin') {
        k = e.outExpo(U.clamp((t * sp - 0.2) / 1.1, 0, 1));
        dx = (1 - k) * (idx - (chars.length - 1) / 2) * size * 0.75; alpha = U.clamp(k * 2, 0, 1);
      } else {
        k = e.outCubic(U.clamp((t * sp - 0.25 - idx * 0.07) / 0.75, 0, 1));
        dy = (1 - k) * size * 0.95; alpha = k;
      }

      ctx.save();
      ctx.globalAlpha *= alpha;
      if (blur > 0.5) ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
      ctx.translate(cx + dx, cy + dy);
      if (rot) ctx.rotate(rot);
      if (sc !== 1) ctx.scale(sc, sc);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.85); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.fillStyle = col;
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
      cursor += widths[i] + gap;
    }
  }

  /* ─────────────── 原语 B：整体型特效 ─────────────── */
  function textWholeDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var size = p.size * S;
    var label = String(p.text || '');
    ctx.font = U.fs(size, p.weight);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var tw = ctx.measureText(label).width;
    var cx = W / 2, cy = H / 2;
    var kind = p.kind;
    var sp = Math.max(0.2, p.speed);
    var prog = U.clamp(t * sp, 0, 4);
    var k = e.outCubic(U.clamp(prog / 1.1, 0, 1));

    var grad = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
    grad.addColorStop(0, U.ink);
    grad.addColorStop(1, U.mix(U.ink, U.accent, 0.55));

    if (kind === 'gradient') {
      var flow = ctx.createLinearGradient(cx - tw / 2 - tw * 0.6 + Math.sin(t * 1.6) * tw * 0.3, cy - size, cx + tw / 2 + tw * 0.6, cy + size);
      flow.addColorStop(0, U.accent);
      flow.addColorStop(0.35, U.ink);
      flow.addColorStop(0.6, U.accent2);
      flow.addColorStop(1, U.accent);
      ctx.save();
      ctx.shadowColor = U.rgba(U.accent, p.glow * 0.6);
      ctx.shadowBlur = 26 * S * p.glow;
      ctx.fillStyle = flow;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'outline') {
      ctx.save();
      /* 从左向右逐字揭示，随后辉光呼吸 */
      var rev = e.outCubic(U.clamp(t * sp / 1.2, 0, 1));
      ctx.beginPath();
      ctx.rect(cx - tw / 2 - 30 * S, cy - size * 1.2, tw * rev + 60 * S, size * 2.4);
      ctx.clip();
      var pulse = 0.55 + 0.45 * Math.sin(t * sp * 2.4);
      ctx.lineWidth = Math.max(1.6, size * 0.035);
      ctx.strokeStyle = U.accent;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * (0.5 + 0.5 * pulse)); ctx.shadowBlur = (14 + 26 * pulse) * S * p.glow; }
      ctx.strokeText(label, cx, cy);
      ctx.globalAlpha = 0.22 * (0.7 + 0.3 * Math.sin(t * sp * 1.7));
      ctx.fillStyle = U.mix(U.accent, U.ink, 0.5);
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'glitch') {
      var bands = 12;
      for (var b = 0; b < bands; b++) {
        var ry = cy - size * 0.7 + (b / bands) * size * 1.4;
        var rh = size * 1.4 / bands;
        var off = (U.rng(b + Math.floor(t * sp * 6) * 13) - 0.5) * size * 0.34;
        var on = U.rng(b * 7 + Math.floor(t * sp * 4) * 3) > 0.42;
        if (!on) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - tw / 2 - size, ry, tw + size * 2, rh);
        ctx.clip();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = U.accent;
        ctx.fillText(label, cx + off, cy);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = U.accent2;
        ctx.fillText(label, cx - off, cy);
        ctx.globalAlpha = 1;
        ctx.fillStyle = U.ink;
        ctx.fillText(label, cx, cy);
        ctx.restore();
      }
      return;
    }

    if (kind === 'maskrise') {
      var mh = size * 1.6;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, cy - mh / 2 + (1 - k) * mh, W, mh * k);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'mirror') {
      /* 流光渐变 + 倒影呼吸，不再是静帧 */
      var mgx = Math.sin(t * sp * 1.4) * tw * 0.3;
      var mflow = ctx.createLinearGradient(cx - tw / 2 - tw * 0.4 + mgx, cy - size, cx + tw / 2 + tw * 0.4 + mgx, cy + size);
      mflow.addColorStop(0, U.ink);
      mflow.addColorStop(0.45, U.mix(U.ink, U.accent, 0.6));
      mflow.addColorStop(0.55, U.mix(U.ink, U.accent2, 0.5));
      mflow.addColorStop(1, U.ink);
      ctx.save();
      ctx.fillStyle = mflow;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.7); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fillText(label, cx, cy - size * 0.15);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.17 + 0.09 * Math.sin(t * sp * 2.1);
      ctx.translate(0, cy + size * 0.5);
      ctx.scale(1, -0.55);
      var mg = ctx.createLinearGradient(0, 0, 0, -size);
      mg.addColorStop(0, U.rgba(U.accent, 0.0));
      mg.addColorStop(1, U.rgba(U.accent, 0.9));
      ctx.fillStyle = mg;
      ctx.fillText(label, cx, 0);
      ctx.restore();
      return;
    }

    if (kind === 'split') {
      var up = e.outExpo(U.clamp(prog / 1.2, 0, 1));
      var half = size * 1.5;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, cy); ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillText(label, cx, cy - (1 - up) * half * 0.5);
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.rect(0, cy, W, H - cy); ctx.clip();
      ctx.fillStyle = U.mix(U.accent, U.ink, 0.35);
      ctx.fillText(label, cx, cy + (1 - up) * half * 0.5);
      ctx.restore();
      return;
    }

    if (kind === 'stack') {
      var layers = 7;
      for (var L = layers; L >= 1; L--) {
        ctx.save();
        ctx.globalAlpha = 0.1 * (1 - L / layers) + 0.06;
        ctx.fillStyle = L % 2 ? U.accent : U.accent2;
        ctx.fillText(label, cx - L * 7 * S * k, cy + L * 6 * S * k);
        ctx.restore();
      }
      ctx.fillStyle = grad;
      ctx.fillText(label, cx, cy);
      return;
    }

    if (kind === 'cycle') {
      var hue = (t * sp * 90) % 360;
      var c1 = 'hsl(' + hue.toFixed(0) + ',92%,62%)';
      var c2 = 'hsl(' + ((hue + 120) % 360).toFixed(0) + ',92%,62%)';
      var cg = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      cg.addColorStop(0, c1); cg.addColorStop(1, c2);
      ctx.save();
      ctx.shadowColor = c1; ctx.shadowBlur = 30 * S * (0.4 + p.glow);
      ctx.fillStyle = cg;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'shine') {
      ctx.save();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy);
      ctx.globalCompositeOperation = 'source-atop';
      var sw = tw * 0.4;
      var sx = cx - tw / 2 - sw + ((tw + sw * 2) * ((t * sp * 0.55) % 1.4));
      var sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
      sg.addColorStop(0, U.rgba(U.accent, 0));
      sg.addColorStop(0.5, U.rgba('#FFFFFF', 0.95));
      sg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(cx - tw / 2 - sw, cy - size, tw + sw * 2, size * 2);
      ctx.restore();
      return;
    }

    if (kind === 'extrude') {
      var depth = Math.round(16 * k);
      for (var d2 = depth; d2 > 0; d2--) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = U.mix(U.bg1, U.accent, U.clamp(1 - d2 / depth, 0, 1) * 0.85);
        ctx.fillText(label, cx + d2 * 1.6 * S, cy + d2 * 1.6 * S);
        ctx.restore();
      }
      ctx.fillStyle = U.ink;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.fillText(label, cx, cy);
      return;
    }

    /* 兜底：整体上浮淡入 */
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(0, (1 - k) * size * 0.6);
    ctx.fillStyle = grad;
    ctx.fillText(label, cx, cy);
    ctx.restore();
  }

  /* ─────────────── 原语 C：特殊型特效 ─────────────── */
  function textSpecialDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var size = p.size * S;
    /* 乱码字符池与切分函数必须内联在 draw 内部：导出产物只保留 draw 的函数体 */
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*<>/\\|+=~';
    function sliceChars(str) {
      var raw = String(str || '');
      var out = [], buf = '';
      for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        if (ch === ' ') {
          if (buf) { out.push(buf); buf = ''; }
          out.push(' ');
        } else if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/.test(ch)) {
          if (buf) { out.push(buf); buf = ''; }
          out.push(ch);
        } else {
          buf += ch;
        }
      }
      if (buf) out.push(buf);
      return out;
    }
    var label = String(p.text || '');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = U.fs(size, p.weight);
    var tw = ctx.measureText(label).width;
    var cx = W / 2, cy = H / 2;
    var kind = p.kind;
    var sp = Math.max(0.2, p.speed);

    if (kind === 'typewriter') {
      var chars = sliceChars(label);
      var gapW = p.gap * S;
      var widths = [], total = 0, i;
      for (i = 0; i < chars.length; i++) { var w = ctx.measureText(chars[i]).width; widths.push(w); total += w; }
      total += gapW * (chars.length - 1);
      var x0 = cx - total / 2;
      var shown = U.clamp(Math.floor(t * sp * 9), 0, chars.length);
      var cur = x0;
      ctx.textAlign = 'left';
      for (i = 0; i < shown; i++) {
        ctx.fillStyle = U.ink;
        ctx.fillText(chars[i], cur, cy);
        cur += widths[i] + gapW;
      }
      var blink = Math.floor(t * sp * 2.4) % 2 === 0;
      if (blink && shown < chars.length) {
        ctx.fillStyle = U.accent;
        ctx.fillRect(cur + 2 * S, cy - size * 0.46, size * 0.075, size * 0.92);
      }
      return;
    }

    if (kind === 'decode') {
      var chs = sliceChars(label);
      var gw2 = p.gap * S;
      var ws = [], tot2 = 0;
      for (i = 0; i < chs.length; i++) { var w2 = ctx.measureText(chs[i]).width; ws.push(w2); tot2 += w2; }
      tot2 += gw2 * (chs.length - 1);
      var sx0 = cx - tot2 / 2;
      var reveal = U.clamp(t * sp / 1.4, 0, 1) * chs.length;
      ctx.textAlign = 'left';
      var cx2 = sx0;
      for (i = 0; i < chs.length; i++) {
        var done = reveal - i;
        if (done >= 1) {
          ctx.fillStyle = U.ink;
          ctx.fillText(chs[i], cx2, cy);
        } else {
          var g = GLYPHS.charAt(Math.floor(U.rng(i * 17 + Math.floor(t * sp * 22) * 7) * GLYPHS.length) % GLYPHS.length);
          ctx.fillStyle = U.rgba(U.accent, 0.85);
          ctx.fillText(g, cx2, cy);
        }
        cx2 += ws[i] + gw2;
      }
      return;
    }

    if (kind === 'scramble') {
      var cs = sliceChars(label);
      var gw3 = p.gap * S;
      var w3 = [], tt = 0;
      for (i = 0; i < cs.length; i++) { var ww = ctx.measureText(cs[i]).width; w3.push(ww); tt += ww; }
      tt += gw3 * (cs.length - 1);
      var bx = cx - tt / 2;
      ctx.textAlign = 'left';
      for (i = 0; i < cs.length; i++) {
        var settle = (i * 0.13 + 0.35) / sp;
        if (t > settle) {
          ctx.fillStyle = U.ink;
          ctx.fillText(cs[i], bx, cy);
        } else {
          var roll = Math.floor(U.rng(i * 31 + Math.floor(t * 20) * 11) * GLYPHS.length);
          ctx.fillStyle = U.rgba(U.accent, 0.9);
          ctx.fillText(GLYPHS.charAt(roll), bx, cy);
        }
        bx += w3[i] + gw3;
      }
      return;
    }

    if (kind === 'countup') {
      var num = parseFloat(String(label).replace(/[^\d.]/g, '')) || 0;
      var suffix = String(label).replace(/[\d.,\s]/g, '');
      var cur2 = Math.round(num * e.outExpo(U.clamp(t * sp / 1.6, 0, 1)));
      var shownTxt = String(cur2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      ctx.font = U.fs(size, p.weight);
      var gt = ctx.createLinearGradient(cx - 300 * S, 0, cx + 300 * S, 0);
      gt.addColorStop(0, U.ink);
      gt.addColorStop(1, U.accent);
      ctx.save();
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 32 * S * p.glow; }
      ctx.fillStyle = gt;
      ctx.fillText(shownTxt, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'vertical') {
      var vc = sliceChars(label);
      var lh = size * 1.12;
      var y0 = cy - (vc.length - 1) * lh / 2;
      for (i = 0; i < vc.length; i++) {
        var kk = e.outCubic(U.clamp((t * sp - i * 0.08) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = kk;
        if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 26 * S * p.glow; }
        ctx.fillStyle = i === vc.length - 1 ? U.accent : U.ink;
        ctx.fillText(vc[i], cx, y0 + i * lh + (1 - kk) * size * 0.5);
        ctx.restore();
      }
      return;
    }

    if (kind === 'highlight') {
      var sweep = e.inOutCubic(U.clamp(t * sp / 1.2, 0, 1));
      ctx.save();
      ctx.fillStyle = U.ink;
      ctx.fillText(label, cx, cy);
      ctx.globalCompositeOperation = 'source-atop';
      var hl = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      hl.addColorStop(0, U.rgba(U.accent, 0.9));
      hl.addColorStop(0.75, U.rgba(U.accent, 0.55));
      hl.addColorStop(1, U.rgba(U.accent, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = hl;
      ctx.fillRect(cx - tw / 2 - 20 * S, cy - size * 0.62, (tw + 40 * S) * sweep, size * 1.24);
      ctx.restore();
      return;
    }

    if (kind === 'matrix') {
      var cells = 30, rows = 6;
      var gx = W / cells, gy = H / rows;
      var lit = U.clamp(t * sp / 1.7, 0, 1);
      var mx = cx - tw / 2, my = cy - size / 2;
      for (var r2 = 0; r2 < rows; r2++) {
        for (var c2 = 0; c2 < cells; c2++) {
          var px = c2 * gx + gx / 2, py = r2 * gy + gy / 2;
          var tInText = px > mx - 6 && px < mx + tw + 6 && py > my - 6 && py < my + size + 6;
          if (!tInText) continue;
          var rndv = U.rng(r2 * 61 + c2 * 13);
          if (rndv > lit * 1.15) continue;
          ctx.globalAlpha = 0.5 + 0.5 * U.rng(r2 * 7 + c2 * 19);
          ctx.fillStyle = rndv > lit ? U.accent : U.ink;
          var rad = Math.min(gx, gy) * 0.3;
          ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = U.rgba(U.ink, U.clamp(lit * 1.6 - 1.2, 0, 1));
      ctx.font = U.fs(size, p.weight);
      ctx.fillText(label, cx, cy);
      return;
    }

    if (kind === 'fire') {
      ctx.save();
      ctx.shadowColor = 'rgba(255,120,20,0.9)';
      ctx.shadowBlur = 40 * S;
      var fg = ctx.createLinearGradient(cx, cy + size * 0.6, cx, cy - size * 0.6);
      fg.addColorStop(0, '#FFC24B');
      fg.addColorStop(0.45, '#FF7A18');
      fg.addColorStop(1, '#FF2D55');
      ctx.fillStyle = fg;
      ctx.fillText(label, cx + Math.sin(t * 9) * 2.4 * S, cy + Math.cos(t * 7) * 2 * S);
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-atop';
      for (var fi = 0; fi < 26; fi++) {
        var fxp = cx - tw / 2 + U.rng(fi * 3) * tw;
        var rise = (t * sp * 0.8 + U.rng(fi * 11)) % 1;
        var fy = cy + size * 0.5 - rise * size * 1.7;
        var rad2 = (1 - rise) * size * 0.13;
        var fgd = ctx.createRadialGradient(fxp, fy, 0, fxp, fy, rad2);
        fgd.addColorStop(0, 'rgba(255,240,180,0.95)');
        fgd.addColorStop(1, 'rgba(255,90,0,0)');
        ctx.fillStyle = fgd;
        ctx.beginPath(); ctx.arc(fxp, fy, rad2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      return;
    }

    if (kind === 'liquid') {
      var lprog = U.clamp(t * sp / 1.5, 0, 1);
      ctx.save();
      ctx.fillStyle = U.rgba(U.ink, 0.14);
      ctx.fillText(label, cx, cy);
      ctx.beginPath();
      ctx.moveTo(0, cy + size * 0.8);
      for (var lx = 0; lx <= W; lx += 14) {
        var ly = cy + size * 0.8 - lprog * size * 1.7 + Math.sin(lx * 0.012 + t * sp * 2.4) * size * 0.09
          + Math.sin(lx * 0.03 - t * sp * 1.7) * size * 0.05;
        ctx.lineTo(lx, ly);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.clip();
      var lg2 = ctx.createLinearGradient(0, cy - size, 0, cy + size);
      lg2.addColorStop(0, U.accent2);
      lg2.addColorStop(1, U.accent);
      ctx.fillStyle = lg2;
      ctx.font = U.fs(size, p.weight);
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'neon') {
      var flick = 0.85 + 0.15 * Math.sin(t * sp * 18) * Math.sin(t * sp * 5.3);
      ctx.save();
      ctx.font = U.fs(size, p.weight);
      ctx.lineWidth = Math.max(1.6, size * 0.028);
      ctx.strokeStyle = U.accent;
      ctx.shadowColor = U.accent;
      ctx.shadowBlur = 30 * S * flick * (0.6 + p.glow);
      ctx.strokeText(label, cx, cy);
      ctx.shadowBlur = 60 * S * flick * (0.6 + p.glow);
      ctx.strokeText(label, cx, cy);
      ctx.shadowBlur = 14 * S;
      ctx.fillStyle = U.mix(U.ink, U.accent, 0.35);
      ctx.globalAlpha = flick;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalAlpha = U.clamp(t * sp, 0, 1);
    ctx.fillStyle = U.ink;
    ctx.fillText(label, cx, cy);
    ctx.restore();
  }

  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.58,
    params: TEXT_PARAMS, draw: textPerCharDraw,
    ids: [
      { id: 'tx-rise', name: '逐字升起', tags: ['逐字', '通用'], desc: '字符一个个从下方升起并显影，最经典的字幕式入场。', cfg: { kind: 'rise', text: 'MAKE IT MOVE' } },
      { id: 'tx-wave', name: '波浪浮动', tags: ['波浪', '循环'], desc: '字符沿正弦波持续起伏，适合标题动画与循环背景文字。', cfg: { kind: 'wave', text: 'WAVE MOTION' } },
      { id: 'tx-bounce', name: '逐字弹跳', tags: ['弹跳', '活泼'], desc: '每个字符弹跳落位，节奏轻快，适合儿童与娱乐内容。', cfg: { kind: 'bounce', text: 'BOUNCE!' } },
      { id: 'tx-rotchar', name: '逐字旋转', tags: ['旋转', '动感'], desc: '字符带旋转落位，动感强，适合片头与活动视觉。', cfg: { kind: 'rotchar', text: 'SPIN IN' } },
      { id: 'tx-karaoke', name: '逐字点亮', tags: ['点亮', '字幕'], desc: '字符按进度依次点亮，最常见的歌词与口播强调样式。', cfg: { kind: 'karaoke', text: '跟着节奏走到最后' } },
      { id: 'tx-box', name: '逐字方框', tags: ['方框', '科技'], desc: '每个字外扩出一个描边框，科技感与结构感并存。', cfg: { kind: 'box', text: 'BOXED' } },
      { id: 'tx-scale', name: '逐字缩放', tags: ['缩放', '强调'], desc: '字符从极小放大落位，强调感强，适合关键词。', cfg: { kind: 'scale', text: 'GROW' } },
      { id: 'tx-skew', name: '斜切入场', tags: ['斜切', '速度'], desc: '字符带倾斜角度高速切入，节奏凌厉。', cfg: { kind: 'skew', text: 'FAST LANE' } },
      { id: 'tx-blurchar', name: '逐字显影', tags: ['虚化', '高级'], desc: '每个字符从模糊中聚焦，高级且克制。', cfg: { kind: 'blurchar', text: 'FOCUS' } },
      { id: 'tx-trackin', name: '聚拢字距', tags: ['字距', '收束'], desc: '字符从极宽字距聚拢到正常间距，有「合拢」的仪式感。', cfg: { kind: 'trackin', text: 'CONVERGE' } },
      { id: 'tx-lift-chars', name: '错落升起', tags: ['错落', '节奏'], desc: '放缓的逐字升起，配合更大字距，适合长句标题。', cfg: { kind: 'rise', text: 'EVERY WORD MATTERS', speed: 0.55, gap: 4, size: 240 } },
      { id: 'tx-bounce-cn', name: '中文弹跳', tags: ['中文', '活泼'], desc: '中文逐字弹跳的节奏更明显，适合社媒标题。', cfg: { kind: 'bounce', text: '爆款选品逻辑', gap: 6 } },
      { id: 'tx-wave-slow', name: '慢波荡漾', tags: ['慢速', '柔和'], desc: '放慢的波浪浮动，气质安静，适合生活方式内容。', cfg: { kind: 'wave', text: 'SLOW MOTION', speed: 0.45, gap: 8 } }
    ]
  });

  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.58,
    params: TEXT_PARAMS, draw: textWholeDraw,
    ids: [
      { id: 'tx-gradient', name: '渐变流光', tags: ['渐变', '质感'], desc: '字面沿横向流动的渐变，色彩在字内穿行，质感现代。', cfg: { kind: 'gradient', text: 'GRADIENT FLOW' } },
      { id: 'tx-outline', name: '描边空心', tags: ['描边', '极简'], desc: '只有轮廓没有填充的空心字，极简且高级。', cfg: { kind: 'outline', text: 'OUTLINE' } },
      { id: 'tx-glitch', name: '故障闪切', tags: ['故障', '赛博'], desc: '带 RGB 分离与横向切片的故障效果，赛博风格代表。', cfg: { kind: 'glitch', text: 'GLITCH' } },
      { id: 'tx-maskrise', name: '遮罩上推', tags: ['遮罩', '干净'], desc: '文字像被上推的遮罩揭示，干净利落，是很高级的字幕手法。', cfg: { kind: 'maskrise', text: 'REVEAL' } },
      { id: 'tx-mirror', name: '镜像倒影', tags: ['镜像', '倒影'], desc: '文字下方带渐变倒影，适合发布会与产品名。', cfg: { kind: 'mirror', text: 'REFLECT' } },
      { id: 'tx-split', name: '上下分离', tags: ['分离', '层次'], desc: '文字被水平切开，上下两半分别移动，趣味性强。', cfg: { kind: 'split', text: 'SPLIT' } },
      { id: 'tx-stack', name: '重复叠影', tags: ['叠影', '动感'], desc: '多层错位叠影拉出运动拖尾，速度感强。', cfg: { kind: 'stack', text: 'ECHO' } },
      { id: 'tx-cycle', name: '色相循环', tags: ['变色', '循环'], desc: '色相持续循环变化，适合需要吸睛的循环标题。', cfg: { kind: 'cycle', text: 'COLOR LOOP' } },
      { id: 'tx-shine', name: '光泽扫过', tags: ['光泽', '质感'], desc: '一道高光横扫字面，像金属反光，质感强烈。', cfg: { kind: 'shine', text: 'METALLIC' } },
      { id: 'tx-extrude', name: '立体挤出', tags: ['立体', '3D'], desc: '文字向后挤出厚度并带透视方向，不做 3D 也有立体感。', cfg: { kind: 'extrude', text: 'DEPTH' } },
      { id: 'tx-gradient-wide', name: '宽字流光', tags: ['渐变', '宽幅'], desc: '更大字号配合更宽的流光范围，适合做封面主标。', cfg: { kind: 'gradient', text: 'JAYKOU', size: 176 } },
      { id: 'tx-outline-bold', name: '粗描边字', tags: ['描边', '力量'], desc: '加粗描边形成的力量型标题，适合运动与潮流主题。', cfg: { kind: 'outline', text: 'STRONG', size: 190 } },
      { id: 'tx-glitch-cn', name: '中文故障', tags: ['中文', '赛博'], desc: '中文语境下的故障闪切，适合科技评测与数码内容。', cfg: { kind: 'glitch', text: '系统异常', size: 150 } },
      { id: 'tx-shine-gold', name: '金色扫光', tags: ['金色', '质感'], desc: '偏暖的扫光质感，适合高单价产品与品牌片。', cfg: { kind: 'shine', text: 'PREMIUM', size: 168 } }
    ]
  });

  MF.forge({
    cat: '文字特效', type: 'block', dur: 7, poster: 0.5,
    params: TEXT_PARAMS, draw: textSpecialDraw,
    ids: [
      { id: 'tx-typewriter', name: '打字机', tags: ['打字', '叙事'], desc: '逐字敲出并有光标闪烁，适合口播字幕与叙事开场。', cfg: { kind: 'typewriter', text: 'Hello, World.' } },
      { id: 'tx-decode', name: '乱码解码', tags: ['解码', '科技'], desc: '字符在乱码中逐位解码成正确文字，数据感强。', cfg: { kind: 'decode', text: 'DECRYPTED' } },
      { id: 'tx-scramble', name: '字符滚动', tags: ['滚动', '科技'], desc: '字符高速滚动后逐位定格，是黑客与数据主题的标配。', cfg: { kind: 'scramble', text: 'SEQUENCE' } },
      { id: 'tx-countup', name: '数字滚动', tags: ['数字', '数据'], desc: '数字快速滚动到目标值并带千分位，适合战绩与数据播报。', cfg: { kind: 'countup', text: '1274580+', size: 240 } },
      { id: 'tx-vertical', name: '竖排文字', tags: ['竖排', '东方'], desc: '文字自上而下竖排，东方美学，适合中式与国风内容。', cfg: { kind: 'vertical', text: '纵横四海', size: 240 } },
      { id: 'tx-highlight', name: '荧光笔', tags: ['荧光笔', '强调'], desc: '一道荧光色从左扫过文字，是最直观的强调方式。', cfg: { kind: 'highlight', text: '重点来了', size: 240 } },
      { id: 'tx-matrix', name: '点阵成像', tags: ['点阵', '科技'], desc: '文字由点阵逐格点亮拼合而成，数字感极强。', cfg: { kind: 'matrix', text: 'MATRIX' } },
      { id: 'tx-fire', name: '火焰文字', tags: ['火焰', '热烈'], desc: '文字带真实火焰粒子燃烧，热烈有情绪，适合爆点内容。', cfg: { kind: 'fire', text: 'HOT!' } },
      { id: 'tx-liquid', name: '液态流动', tags: ['液态', '有机'], desc: '液面上升逐步淹没文字并填充渐变，有机流动感。', cfg: { kind: 'liquid', text: 'FLUID' } },
      { id: 'tx-neon', name: '霓虹灯管', tags: ['霓虹', '夜店'], desc: '霓虹管效果带闪烁，夜店与潮流场景的经典选择。', cfg: { kind: 'neon', text: 'OPEN' } },
      { id: 'tx-typewriter-cn', name: '中文打字', tags: ['中文', '叙事'], desc: '中文逐字敲出，适合口播与叙述型字幕。', cfg: { kind: 'typewriter', text: '我们先说结论。', size: 118 } },
      { id: 'tx-countup-percent', name: '百分比滚动', tags: ['百分比', '数据'], desc: '百分比数字滚动到目标值，适合增长与转化数据。', cfg: { kind: 'countup', text: '237%', size: 200 } },
      { id: 'tx-neon-cn', name: '中文霓虹', tags: ['中文', '霓虹'], desc: '中文霓虹灯管效果，适合餐饮与夜经济内容。', cfg: { kind: 'neon', text: '深夜食堂', size: 140 } }
    ]
  });
})();

/* ════════ assets/js/effects-08.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 08
   原语：几何构成（用数学图形做视觉构成与循环动画）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng;

  var GEO_PARAMS = [
    P('kind', '几何形态', 'poly-morph', sel('poly-morph', [
      ['poly-morph', '多边形变形'], ['star-draw', '星形绘制'], ['spiral-line', '螺旋线'],
      ['grid-wave', '网格波动'], ['ripple-rings', '同心圆环'], ['tri-grid', '三角阵列'],
      ['circle-pack', '圆形堆叠'], ['hex-mosaic', '蜂窝网格'], ['guilloche', '万花线'],
      ['mandala', '曼陀罗'], ['rosette', '玫瑰线'], ['truchet', '特鲁谢拼贴'],
      ['dots-wave', '点阵波'], ['sine-field', '正弦场'], ['squares', '同心方框'],
      ['dot-grid', '网点矩阵'], ['poly-net', '多边形网'], ['moire', '摩尔纹'],
      ['spiral-dots', '螺旋点阵'], ['arcs', '圆弧阵列'], ['cross-hatch', '交叉排线'],
      ['lissajous', '李萨如曲线'], ['rings-3d', '立体连环'], ['kaleido', '万花筒'],
      ['weave', '编织纹'], ['bricks', '砖阵'], ['stairs', '阶梯'], ['wave-rings', '波纹环']
    ])),
    P('size', '基准尺寸', 320, rng(320, 80, 620, 4)),
    P('count', '数量', 12, rng(12, 2, 48, 1)),
    P('stroke', '线宽', 3, rng(3, 0.6, 14, 0.2)),
    P('speed', '速度', 1, rng(1, 0.15, 3, 0.05)),
    P('rot', '旋转', 0.5, rng(0.5, -1, 1, 0.05)),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function geoDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var k = e.outCubic(U.clamp(t / 1.5, 0, 1));
    var kind = p.kind;
    var n = Math.max(2, Math.round(p.count));
    var base = p.size * S * k;
    var lw = p.stroke * S;
    var sp = Math.max(0.1, p.speed);
    var rot = t * p.rot * sp * 0.5;
    var i, a;

    ctx.save();
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 22 * S * p.glow; }

    if (kind === 'poly-morph') {
      var sides = n < 3 ? 3 : n;
      var wob = Math.sin(t * sp * 1.4) * 0.5 + 0.5;
      ctx.beginPath();
      for (i = 0; i <= 260; i++) {
        var ang = Math.PI * 2 * i / 260 - Math.PI / 2;
        var rad = base * (0.72 + 0.28 * Math.cos(sides * ang + t * sp) * wob);
        var px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
      var pg = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
      pg.addColorStop(0, U.accent); pg.addColorStop(1, U.accent2);
      ctx.strokeStyle = pg;
      ctx.stroke();
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = U.mix(U.accent, U.bg1, 0.45);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'star-draw') {
      var pts = n < 3 ? 5 : n;
      ctx.beginPath();
      for (i = 0; i <= pts * 2; i++) {
        var rr = i % 2 ? base * 0.42 : base;
        var ag = Math.PI * i / pts - Math.PI / 2 + rot;
        var sx2 = cx + Math.cos(ag) * rr, sy2 = cy + Math.sin(ag) * rr;
        if (i) ctx.lineTo(sx2, sy2); else ctx.moveTo(sx2, sy2);
      }
      ctx.closePath();
      ctx.strokeStyle = U.accent;
      ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = U.rgba(U.accent2, 0.7);
      ctx.lineWidth = lw * 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spiral-line') {
      ctx.beginPath();
      var turns = n / 2 > 1 ? n / 2 : 2;
      var steps = 460;
      for (i = 0; i <= steps; i++) {
        var fr = i / steps;
        var aa = fr * Math.PI * 2 * turns + rot;
        var rr2 = base * Math.pow(fr, 0.72);
        var sxp = cx + Math.cos(aa) * rr2, syp = cy + Math.sin(aa) * rr2;
        if (i) ctx.lineTo(sxp, syp); else ctx.moveTo(sxp, syp);
      }
      var sg = ctx.createLinearGradient(cx - base, cy, cx + base, cy);
      sg.addColorStop(0, U.accent); sg.addColorStop(1, U.accent2);
      ctx.strokeStyle = sg;
      ctx.stroke();
    }

    else if (kind === 'grid-wave') {
      var cols = n, rows = Math.max(2, Math.round(n * H / W));
      var gx = W / (cols - 1), gy = H / (rows - 1);
      ctx.strokeStyle = U.rgba(U.ink, 0.55);
      ctx.lineWidth = lw * 0.7;
      for (var gyy = 0; gyy < rows; gyy++) {
        ctx.beginPath();
        for (var gxx = 0; gxx < cols; gxx++) {
          var px2 = gxx * gx;
          var py2 = gyy * gy + Math.sin(gxx * 0.5 + t * sp * 2 - gyy * 0.3) * 26 * S * k;
          if (gxx) ctx.lineTo(px2, py2); else ctx.moveTo(px2, py2);
        }
        ctx.globalAlpha = 0.35 + 0.65 * (gyy / rows);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'ripple-rings') {
      var maxR = Math.min(W, H) * 0.62;
      for (i = 0; i < n; i++) {
        var ph = (t * sp * 0.42 + i / n) % 1;
        var rr3 = maxR * ph;
        ctx.globalAlpha = (1 - ph) * 0.9 * k;
        ctx.beginPath();
        ctx.arc(cx, cy, rr3, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * (0.5 + (1 - ph));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'tri-grid') {
      var tCols = n, tRows = Math.max(2, Math.round(n * 0.6));
      var tW = W / tCols, tH = H / tRows;
      for (var tr = 0; tr < tRows; tr++) {
        for (var tc = 0; tc < tCols; tc++) {
          var dly = (tr + tc) * 0.09;
          var kk = e.outCubic(U.clamp((t * sp - dly) / 0.9, 0, 1));
          if (kk <= 0) continue;
          var ox = tc * tW, oy = tr * tH;
          var up = (tr + tc) % 2 === 0;
          ctx.beginPath();
          if (up) { ctx.moveTo(ox + tW / 2, oy + tH * (1 - kk)); ctx.lineTo(ox + tW * kk, oy + tH); ctx.lineTo(ox + tW - tW * kk, oy + tH); }
          else { ctx.moveTo(ox + tW / 2, oy + tH * kk); ctx.lineTo(ox + tW * kk, oy); ctx.lineTo(ox + tW - tW * kk, oy); }
          ctx.closePath();
          ctx.strokeStyle = U.rgba(U.accent, 0.85);
          ctx.lineWidth = lw * 0.8;
          ctx.stroke();
        }
      }
    }

    else if (kind === 'circle-pack') {
      ctx.strokeStyle = U.accent;
      for (i = 0; i < n; i++) {
        var ph2 = (i / n + t * sp * 0.12) % 1;
        var rr4 = base * 0.92 * ph2;
        ctx.globalAlpha = (1 - ph2) * 0.85;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(i * 2.399) * base * 0.16, cy + Math.sin(i * 2.399) * base * 0.16, rr4, 0, Math.PI * 2);
        ctx.lineWidth = lw;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = U.ink;
      ctx.lineWidth = lw * 1.2;
      ctx.stroke();
    }

    else if (kind === 'hex-mosaic') {
      var hr = base / Math.max(3, n) * 1.55;
      var colW = hr * 1.732, rowH = hr * 1.5;
      for (var ry2 = -2; ry2 * rowH < H + rowH * 2; ry2++) {
        for (var rx2 = -2; rx2 * colW < W + colW * 2; rx2++) {
          var hcx = rx2 * colW + (ry2 % 2 ? colW / 2 : 0), hcy = ry2 * rowH;
          var dd = Math.hypot(hcx - cx, hcy - cy) / (Math.min(W, H) * 0.5);
          var vis = U.clamp(k * 1.4 - dd * 0.7, 0, 1);
          if (vis <= 0.02) continue;
          ctx.globalAlpha = vis * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(dd * 5 - t * sp * 2.2)));
          ctx.beginPath();
          for (i = 0; i < 6; i++) {
            a = Math.PI * 2 * i / 6;
            var hx = hcx + hr * Math.cos(a), hy = hcy + hr * Math.sin(a);
            if (i) ctx.lineTo(hx, hy); else ctx.moveTo(hx, hy);
          }
          ctx.closePath();
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = lw * 0.7;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'guilloche') {
      var R = base * 0.85, rr5 = base * 0.34;
      var pts = Math.max(6, n);
      for (var li = 0; li < 5; li++) {
        ctx.beginPath();
        for (i = 0; i <= 720; i++) {
          var th = i / 720 * Math.PI;
          var x5 = cx + R * Math.cos(th + rot) + rr5 * Math.cos(pts * th + li * 0.35);
          var y5 = cy + R * Math.sin(th + rot) + rr5 * Math.sin(pts * th + li * 0.35);
          if (i) ctx.lineTo(x5, y5); else ctx.moveTo(x5, y5);
        }
        ctx.strokeStyle = U.rgba(li % 2 ? U.accent2 : U.accent, 0.75);
        ctx.lineWidth = lw * 0.6;
        ctx.stroke();
      }
    }

    else if (kind === 'mandala') {
      var petals = n;
      for (var ring = 0; ring < 3; ring++) {
        var rr6 = base * (0.4 + ring * 0.3);
        for (i = 0; i < petals; i++) {
          a = Math.PI * 2 * i / petals + rot * (1 + ring * 0.3);
          var mx = cx + Math.cos(a) * rr6, my = cy + Math.sin(a) * rr6;
          ctx.beginPath();
          ctx.arc(mx, my, base * 0.16 * (1 - ring * 0.18), 0, Math.PI * 2);
          ctx.strokeStyle = U.rgba(ring % 2 ? U.accent2 : U.accent, 0.8);
          ctx.lineWidth = lw * 0.8;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = U.accent;
      ctx.beginPath(); ctx.arc(cx, cy, base * 0.98, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'rosette') {
      var kk2 = n / 2;
      ctx.beginPath();
      for (i = 0; i <= 1440; i++) {
        var th2 = i / 1440 * Math.PI * 2;
        var rad3 = base * Math.abs(Math.cos(kk2 * th2 + t * sp)); 
        var xr = cx + Math.cos(th2) * rad3, yr = cy + Math.sin(th2) * rad3;
        if (i) ctx.lineTo(xr, yr); else ctx.moveTo(xr, yr);
      }
      ctx.closePath();
      var rg = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
      rg.addColorStop(0, U.accent); rg.addColorStop(0.5, U.accent2); rg.addColorStop(1, U.accent);
      ctx.strokeStyle = rg;
      ctx.lineWidth = lw * 0.7;
      ctx.stroke();
    }

    else if (kind === 'truchet') {
      var tN = Math.max(3, Math.round(n * 0.8));
      var cw = W / tN, ch = H / Math.max(3, Math.round(tN * H / W));
      for (var ty = 0; ty * ch < H; ty++) {
        for (var tx = 0; tx * cw < W; tx++) {
          var arc = U.rng(ty * 97 + tx * 31) > 0.5;
          var flip = U.rng(ty * 53 + tx * 71) > 0.5;
          var oy2 = ty * ch, ox2 = tx * cw;
          var kv = e.outCubic(U.clamp((t * sp - (tx + ty) * 0.05) / 1.2, 0, 1));
          ctx.save();
          ctx.globalAlpha = kv * 0.9;
          ctx.strokeStyle = (tx + ty) % 3 ? U.accent : U.accent2;
          ctx.lineWidth = lw * 0.7;
          var r3 = cw / 2;
          ctx.beginPath();
          if (arc) {
            ctx.arc(ox2 + (flip ? cw : 0), oy2, r3, flip ? Math.PI : 0, flip ? Math.PI * 2 : Math.PI);
            ctx.moveTo(ox2 + (flip ? 0 : cw), oy2 + ch);
            ctx.arc(ox2 + (flip ? cw : 0), oy2 + ch, r3, flip ? Math.PI * 2 : Math.PI, flip ? Math.PI * 3 : Math.PI * 2);
          } else {
            ctx.arc(ox2, oy2 + (flip ? 0 : ch), r3, flip ? Math.PI * 1.5 : Math.PI * 0.5, flip ? Math.PI * 2.5 : Math.PI * 1.5);
            ctx.moveTo(ox2 + cw, oy2 + (flip ? ch : 0));
            ctx.arc(ox2 + cw, oy2 + (flip ? 0 : ch), r3, flip ? Math.PI * 0.5 : Math.PI * 1.5, flip ? Math.PI * 1.5 : Math.PI * 2.5);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    else if (kind === 'dots-wave') {
      var dCols = n, dRows = Math.max(2, Math.round(n * H / W * 0.6));
      var dgx = W / (dCols - 1), dgy = H / (dRows - 1);
      for (var dr = 0; dr < dRows; dr++) {
        for (var dc = 0; dc < dCols; dc++) {
          var wave = Math.sin(dc * 0.42 + t * sp * 2.2) * Math.cos(dr * 0.42 - t * sp * 1.6);
          var rad4 = (3 + 9 * (0.5 + 0.5 * wave)) * S * k;
          ctx.globalAlpha = 0.28 + 0.72 * (0.5 + 0.5 * wave);
          ctx.beginPath();
          ctx.arc(dc * dgx, dr * dgy, rad4, 0, Math.PI * 2);
          ctx.fillStyle = wave > 0 ? U.accent : U.accent2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'sine-field') {
      var lines = n;
      for (i = 0; i < lines; i++) {
        ctx.beginPath();
        var baseY = H * (i + 0.5) / lines;
        for (var xx = 0; xx <= W; xx += 10) {
          var yy = baseY + Math.sin(xx * 0.006 + t * sp * 1.8 + i * 0.42) * 40 * S * k;
          if (xx) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
        }
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.72);
        ctx.lineWidth = lw * 0.55;
        ctx.stroke();
      }
    }

    else if (kind === 'squares') {
      for (i = n; i > 0; i--) {
        var side = base * (i / n) * 1.35;
        ctx.globalAlpha = 0.9 * (1 - i / (n * 1.4));
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * 0.8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot + i * 0.06);
        ctx.strokeRect(-side / 2, -side / 2, side, side);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'dot-grid') {
      var dn = n;
      var sp2 = Math.min(W, H) / (dn + 1);
      for (var gy3 = 0; gy3 < Math.ceil(H / sp2); gy3++) {
        for (var gx3 = 0; gx3 < Math.ceil(W / sp2); gx3++) {
          var dx3 = (gx3 + 0.5) * sp2, dy3 = (gy3 + 0.5) * sp2;
          var dist2 = Math.hypot(dx3 - cx, dy3 - cy) / (Math.min(W, H) * 0.62);
          var pulse = 0.5 + 0.5 * Math.sin(dist2 * 8 - t * sp * 2.6);
          var r5 = (2 + 7 * pulse) * S * k;
          ctx.globalAlpha = (1 - dist2 * 0.65) * (0.4 + 0.6 * pulse);
          ctx.beginPath();
          ctx.arc(dx3, dy3, r5, 0, Math.PI * 2);
          ctx.fillStyle = pulse > 0.5 ? U.accent : U.mix(U.ink, U.accent2, 0.5);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'poly-net') {
      var pn = Math.max(3, Math.min(9, n));
      var pr = base * 0.9;
      var verts = [];
      for (i = 0; i < pn; i++) {
        a = Math.PI * 2 * i / pn - Math.PI / 2 + rot;
        verts.push([cx + Math.cos(a) * pr, cy + Math.sin(a) * pr]);
      }
      for (i = 0; i < pn; i++) {
        for (var j = i + 1; j < pn; j++) {
          ctx.globalAlpha = 0.28 + 0.5 * k;
          ctx.beginPath();
          ctx.moveTo(verts[i][0], verts[i][1]);
          ctx.lineTo(verts[j][0], verts[j][1]);
          ctx.strokeStyle = (i + j) % 2 ? U.rgba(U.accent, 0.8) : U.rgba(U.accent2, 0.8);
          ctx.lineWidth = lw * 0.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < pn; i++) {
        ctx.beginPath();
        ctx.arc(verts[i][0], verts[i][1], 5 * S * k, 0, Math.PI * 2);
        ctx.fillStyle = U.ink;
        ctx.fill();
      }
    }

    else if (kind === 'moire') {
      var mo = Math.max(4, n);
      for (i = 0; i < mo; i++) {
        var off = i / mo * 26 * S;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * 0.5;
        for (var m = 0; m < mo; m++) {
          ctx.beginPath();
          ctx.arc(cx - off + Math.sin(t * sp * 0.5) * 20 * S, cy, base * (0.3 + m / mo * 0.9) * k, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spiral-dots') {
      var total = n * 12;
      for (i = 0; i < total; i++) {
        var ft = i / total;
        var aa2 = ft * Math.PI * 2 * 4.5 + rot;
        var rr7 = base * Math.pow(ft, 0.65);
        var dotR = (2 + 7 * ft) * S * k;
        ctx.globalAlpha = (0.35 + 0.65 * ft) * k;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(aa2) * rr7, cy + Math.sin(aa2) * rr7, dotR, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'arcs') {
      var an = n;
      for (i = 0; i < an; i++) {
        var ph3 = i / an;
        var start = ph3 * Math.PI * 2 + t * sp * 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, base * (0.35 + 0.6 * ph3), start, start + Math.PI * 0.72);
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent : U.accent2, 0.9 - ph3 * 0.4);
        ctx.lineWidth = lw * (0.8 + ph3);
        ctx.stroke();
      }
    }

    else if (kind === 'cross-hatch') {
      var hn = n;
      for (i = -hn; i <= hn; i++) {
        var shift = (Math.sin(t * sp + i * 0.3) * 0.5 + 0.5) * 40 * S * k;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = U.rgba(U.accent, 0.75);
        ctx.lineWidth = lw * 0.5;
        ctx.beginPath(); ctx.moveTo(cx + i * 46 * S * k - shift, cy - base); ctx.lineTo(cx + i * 46 * S * k + shift, cy + base); ctx.stroke();
        ctx.strokeStyle = U.rgba(U.accent2, 0.75);
        ctx.beginPath(); ctx.moveTo(cx - base, cy + i * 46 * S * k - shift); ctx.lineTo(cx + base, cy + i * 46 * S * k + shift); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'lissajous') {
      var A = n, B = n + 2;
      ctx.beginPath();
      for (i = 0; i <= 1200; i++) {
        var lt = i / 1200 * Math.PI * 2;
        var lx2 = cx + Math.sin(A * lt + t * sp * 0.5) * base * 0.9;
        var ly2 = cy + Math.sin(B * lt) * base * 0.9;
        if (i) ctx.lineTo(lx2, ly2); else ctx.moveTo(lx2, ly2);
      }
      var lg3 = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
      lg3.addColorStop(0, U.accent); lg3.addColorStop(1, U.accent2);
      ctx.strokeStyle = lg3;
      ctx.lineWidth = lw * 0.65;
      ctx.stroke();
    }

    else if (kind === 'rings-3d') {
      for (var r8 = 0; r8 < n; r8++) {
        var ang8 = t * sp * 0.6 + r8 * 0.42;
        var stretch = 0.25 + 0.75 * Math.abs(Math.cos(ang8));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang8 * 0.6);
        ctx.scale(1, stretch);
        ctx.beginPath();
        ctx.arc(0, 0, base * (0.4 + r8 / n * 0.7), 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(r8 % 2 ? U.accent2 : U.accent, 0.8 - r8 / n * 0.4);
        ctx.lineWidth = lw;
        ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'kaleido') {
      var segs = Math.max(4, n);
      for (var sg2 = 0; sg2 < segs; sg2++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sg2 * Math.PI * 2 / segs + rot * 0.5);
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = sg2 % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (i = 0; i <= 40; i++) {
          var kf = i / 40;
          var kr = base * kf;
          var ka = Math.sin(kf * Math.PI * 2 + t * sp * 2) * 0.5 * (1 - kf);
          ctx.lineTo(Math.cos(ka) * kr, Math.sin(ka) * kr);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'weave') {
      var wn = Math.max(3, Math.round(n * 0.7));
      var ww = Math.min(W, H) / wn;
      for (var wy = 0; wy < Math.ceil(H / ww); wy++) {
        for (var wx = 0; wx < Math.ceil(W / ww); wx++) {
          var horiz = (wx + wy) % 2 === 0;
          var wv = 0.5 + 0.5 * Math.sin((wx + wy) * 0.6 - t * sp * 2);
          ctx.globalAlpha = 0.25 + 0.6 * wv * k;
          ctx.strokeStyle = horiz ? U.accent : U.accent2;
          ctx.lineWidth = lw * (0.5 + wv);
          ctx.beginPath();
          if (horiz) { ctx.moveTo(wx * ww + ww * 0.12, wy * ww + ww / 2); ctx.lineTo(wx * ww + ww * 0.88, wy * ww + ww / 2); }
          else { ctx.moveTo(wx * ww + ww / 2, wy * ww + ww * 0.12); ctx.lineTo(wx * ww + ww / 2, wy * ww + ww * 0.88); }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'bricks') {
      var bRows = Math.max(3, Math.round(n * 0.6));
      var bH = H / bRows;
      var bW = Math.min(W, H) / n;
      for (var br = 0; br < bRows; br++) {
        var offset = (br % 2) * bW / 2;
        for (var bc = -1; bc * bW < W + bW; bc++) {
          var bkx = bc * bW + offset, bky = br * bH;
          var bK = e.outCubic(U.clamp((t * sp - (br + bc) * 0.08) / 0.9, 0, 1));
          if (bK <= 0.02) continue;
          ctx.globalAlpha = 0.85 * bK;
          ctx.strokeStyle = (br + bc) % 2 ? U.accent : U.accent2;
          ctx.lineWidth = lw * 0.65;
          U.rr(ctx, bkx + 3 * S, bky + 3 * S, bW * bK - 6 * S, bH * 0.82 - 6 * S, 5 * S);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'stairs') {
      var sn = n;
      var stW = W / (sn + 1), stH = H / (sn + 1);
      for (i = 0; i < sn; i++) {
        var pv = 0.5 + 0.5 * Math.sin(i * 0.5 - t * sp * 1.6);
        ctx.globalAlpha = 0.3 + 0.7 * pv * k;
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        var bh2 = stH * (0.3 + pv * 0.7) * k;
        U.rr(ctx, stW * 0.5 + i * stW, H * 0.8 - bh2, stW * 0.62, bh2, 6 * S);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'wave-rings') {
      for (i = 0; i < n; i++) {
        var wph = (i / n + t * sp * 0.3) % 1;
        var wr = base * 1.1 * wph;
        ctx.globalAlpha = (1 - wph) * 0.8 * k;
        ctx.beginPath();
        for (var wa = 0; wa <= 140; wa++) {
          var wang = Math.PI * 2 * wa / 140;
          var wrr = wr * (1 + 0.12 * Math.sin(wang * 6 + t * sp * 3));
          var wxp = cx + Math.cos(wang) * wrr, wyp = cy + Math.sin(wang) * wrr;
          if (wa) ctx.lineTo(wxp, wyp); else ctx.moveTo(wxp, wyp);
        }
        ctx.closePath();
        ctx.strokeStyle = i % 2 ? U.accent2 : U.accent;
        ctx.lineWidth = lw * 0.8;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else {
      ctx.strokeStyle = U.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, base, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* 主题文案覆盖：几何类动效可加中央标题 */
  MF.forge({
    cat: '几何构成', type: 'block', dur: 6, poster: 0.7,
    params: GEO_PARAMS, draw: geoDraw,
    ids: [
      { id: 'geo-poly-morph', name: '多边形变形', tags: ['多边形', '变形'], desc: '圆与多边形之间连续呼吸式变形，是数据与科技主题的通用底纹。', cfg: { kind: 'poly-morph', count: 5, size: 340 } },
      { id: 'geo-star-draw', name: '星形绘制', tags: ['星形', '对称'], desc: '多角星缓慢旋转并呼吸，适合奖项与荣誉类画面。', cfg: { kind: 'star-draw', count: 8, size: 360 } },
      { id: 'geo-spiral', name: '螺旋线', tags: ['螺旋', '生长'], desc: '螺旋线自中心展开，有生长与递归的秩序感。', cfg: { kind: 'spiral-line', count: 12, size: 420 } },
      { id: 'geo-grid-wave', name: '网格波动', tags: ['网格', '波动'], desc: '网格线随正弦波起伏，是最通用的科技感底纹之一。', cfg: { kind: 'grid-wave', count: 22 } },
      { id: 'geo-ripple', name: '同心圆环', tags: ['圆环', '扩散'], desc: '圆环持续向外扩散消失，节奏稳定，适合等待与加载场景。', cfg: { kind: 'ripple-rings', count: 6, size: 340 } },
      { id: 'geo-tri-grid', name: '三角阵列', tags: ['三角', '几何'], desc: '三角格依次升起，几何构成感强，适合建筑与结构主题。', cfg: { kind: 'tri-grid', count: 16 } },
      { id: 'geo-circle-pack', name: '圆形堆叠', tags: ['圆形', '层次'], desc: '多层圆环由内向外扩散堆叠，层次分明。', cfg: { kind: 'circle-pack', count: 9, size: 360 } },
      { id: 'geo-hex', name: '蜂窝网格', tags: ['蜂窝', '科技'], desc: '六边形网格呼吸闪烁，科技与化工主题的经典底纹。', cfg: { kind: 'hex-mosaic', size: 320, count: 12 } },
      { id: 'geo-guilloche', name: '万花线', tags: ['万花', '精密'], desc: '精密仪器式的万花线，带机械与金融票据的质感。', cfg: { kind: 'guilloche', count: 9, size: 380 } },
      { id: 'geo-mandala', name: '曼陀罗', tags: ['曼陀罗', '对称'], desc: '多层圆点构成的曼陀罗缓慢旋转，东方与神秘气质。', cfg: { kind: 'mandala', count: 10, size: 380 } },
      { id: 'geo-rosette', name: '玫瑰线', tags: ['玫瑰线', '数学'], desc: '经典玫瑰线在旋转中不断变换花瓣形态，数学之美。', cfg: { kind: 'rosette', count: 8, size: 400 } },
      { id: 'geo-truchet', name: '特鲁谢拼贴', tags: ['拼贴', '随机'], desc: '随机圆弧拼贴成连续路径，像管道与电路，生成感强。', cfg: { kind: 'truchet', count: 14 } },
      { id: 'geo-dots', name: '点阵波', tags: ['点阵', '波动'], desc: '点阵随双重正弦起伏，柔和且规律，适合大面积铺底。', cfg: { kind: 'dots-wave', count: 24 } },
      { id: 'geo-sine', name: '正弦场', tags: ['正弦', '流动'], desc: '多条正弦曲线并行流动，干净且有秩序。', cfg: { kind: 'sine-field', count: 11 } },
      { id: 'geo-squares', name: '同心方框', tags: ['方框', '聚焦'], desc: '方框逐层旋转收拢，聚焦感强，适合强调某个中心元素。', cfg: { kind: 'squares', count: 12, size: 330 } },
      { id: 'geo-dotgrid', name: '网点矩阵', tags: ['网点', '呼吸'], desc: '网点矩阵按距离脉冲呼吸，有放射状的律动。', cfg: { kind: 'dot-grid', count: 16 } },
      { id: 'geo-polynet', name: '多边形网', tags: ['完全图', '结构'], desc: '所有顶点两两连线形成关系网，适合生态与网络主题。', cfg: { kind: 'poly-net', count: 7, size: 360 } },
      { id: 'geo-moire', name: '摩尔纹', tags: ['摩尔纹', '迷幻'], desc: '多组同心圆叠加产生摩尔纹，迷幻且高级。', cfg: { kind: 'moire', count: 7, size: 340 } },
      { id: 'geo-spiral-dots', name: '螺旋点阵', tags: ['螺旋', '点阵'], desc: '点沿螺旋线排布并旋转，结构感与秩序感兼备。', cfg: { kind: 'spiral-dots', count: 11, size: 400 } },
      { id: 'geo-arcs', name: '圆弧阵列', tags: ['圆弧', '旋转'], desc: '多层圆弧错位旋转，像仪表盘与雷达。', cfg: { kind: 'arcs', count: 8, size: 350 } },
      { id: 'geo-hatch', name: '交叉排线', tags: ['排线', '手绘'], desc: '交叉排线带轻微摆动，有手绘与版画的质感。', cfg: { kind: 'cross-hatch', count: 9, size: 300 } },
      { id: 'geo-lissajous', name: '李萨如曲线', tags: ['曲线', '数学'], desc: '李萨如曲线在振荡中不断重绘，优雅且数学感强。', cfg: { kind: 'lissajous', count: 5, size: 380 } },
      { id: 'geo-rings3d', name: '立体连环', tags: ['立体', '连环'], desc: '圆环带透视翻转形成立体连环，空间感强。', cfg: { kind: 'rings-3d', count: 10, size: 360 } },
      { id: 'geo-kaleido', name: '万花筒', tags: ['万花筒', '对称'], desc: '镜像对称的放射结构，像万花筒一样不断变化。', cfg: { kind: 'kaleido', count: 12, size: 380 } },
      { id: 'geo-weave', name: '编织纹', tags: ['编织', '纹理'], desc: '横竖交替的编织纹理持续波动，适合做质感底纹。', cfg: { kind: 'weave', count: 14 } },
      { id: 'geo-bricks', name: '砖阵', tags: ['砖块', '构建'], desc: '砖块逐块垒起，有建造与积累的隐喻。', cfg: { kind: 'bricks', count: 10 } },
      { id: 'geo-stairs', name: '阶梯韵律', tags: ['阶梯', '节奏'], desc: '柱状阶梯随波起伏跳动的韵律。', cfg: { kind: 'stairs', count: 16, size: 320 } },
      { id: 'geo-wave-rings', name: '波纹环', tags: ['波纹', '柔性'], desc: '边缘带波动的圆环向外扩散，柔性且有生命力。', cfg: { kind: 'wave-rings', count: 6, size: 340 } }
    ]
  });
})();

/* ════════ assets/js/effects-09.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 09
   原语：粒子系统 / 光影氛围
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  /* ══════════════════════════ 粒子系统 ══════════════════════════ */

  var PT_PARAMS = [
    P('kind', '粒子形态', 'burst', sel('burst', [
      ['burst', '中心爆炸'], ['confetti', '彩纸飘落'], ['starfield', '星域穿梭'], ['bubble', '气泡上升'],
      ['fireworks', '烟花绽放'], ['snow', '落雪'], ['rain', '雨丝'], ['sparkup', '火星上窜'],
      ['spiral', '螺旋粒子'], ['trail', '拖尾流光'], ['orbit', '环绕轨道'], ['ink', '墨迹扩散'],
      ['pollen', '花粉漂浮'], ['dust', '尘埃浮动'], ['firefly', '萤火虫'], ['vortex', '漩涡卷入'],
      ['galaxy', '星系漩涡'], ['comet', '彗星划过'], ['geyser', '喷泉涌出'], ['pulse', '脉冲扩散'],
      ['magnetic', '磁性吸附'], ['wind', '风线流动'], ['ripplep', '涟漪粒子'], ['bloom', '绽放']
    ])),
    P('count', '粒子数量', 110, rng(110, 12, 320, 2)),
    P('size', '粒子尺寸', 5, rng(5, 2, 40, 0.5)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('spread', '扩散幅度', 0.7, rng(0.7, 0.1, 1, 0.05)),
    P('glow', '辉光', 0.6, rng(0.6, 0, 1, 0.05))
  ];

  function particleDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var n = Math.max(4, Math.round(p.count));
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var baseSize = p.size * S;
    var spread = p.spread;
    var i, x, y, a, r;

    ctx.save();
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 18 * S * p.glow; }

    if (kind === 'burst') {
      var cycle = 2.6 / sp;
      var ct = t % cycle;
      var prog = e.outExpo(U.clamp(ct / (cycle * 0.62), 0, 1));
      for (i = 0; i < n; i++) {
        a = U.rng(i) * Math.PI * 2;
        var spd = 0.35 + U.rng(i + 91) * 0.95;
        r = prog * Math.min(W, H) * 0.62 * spread * spd;
        var dt = U.clamp(1 - ct / cycle, 0, 1);
        ctx.globalAlpha = dt;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, baseSize * (1 - prog * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
    }

    else if (kind === 'confetti') {
      for (i = 0; i < n; i++) {
        var cfx = U.rng(i) * W * 1.1 - W * 0.05;
        var cfy = ((t * sp * (0.16 + U.rng(i + 5) * 0.3) + U.rng(i + 10)) % 1.2 - 0.1) * H;
        ctx.save();
        ctx.translate(cfx + Math.sin(t * sp * 1.4 + i) * 34 * S, cfy);
        ctx.rotate(t * sp * (1 + U.rng(i + 30) * 2.2) + i);
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = i % 3 === 0 ? U.accent : (i % 3 === 1 ? U.accent2 : U.mix(U.ink, U.accent, 0.35));
        var cw2 = baseSize * (1.4 + U.rng(i + 41));
        ctx.fillRect(-cw2 / 2, -cw2 / 4, cw2, cw2 / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'starfield') {
      for (i = 0; i < n; i++) {
        var z = (i / n + t * sp * 0.16) % 1;
        var ang = U.rng(i) * Math.PI * 2;
        var rad = Math.pow(z, 2.1) * Math.min(W, H) * 0.78;
        var sz = baseSize * (0.3 + z * 2.4);
        ctx.globalAlpha = U.clamp(z * 1.6, 0, 1);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, sz, 0, Math.PI * 2);
        ctx.fillStyle = z > 0.7 ? U.ink : U.mix(U.accent, U.ink, z);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'bubble') {
      for (i = 0; i < n; i++) {
        var bh = (i % 7 + 1) / 7;
        var by = H * 1.1 - ((t * sp * (0.1 + bh * 0.18) + U.rng(i)) % 1.25) * H * 1.2;
        var bx = U.rng(i + 3) * W + Math.sin(t * sp * 1.3 + i) * 26 * S * bh;
        var br = baseSize * (0.5 + bh * 1.6);
        ctx.globalAlpha = 0.5 + 0.4 * bh;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(U.accent, 0.85);
        ctx.lineWidth = 1.6 * S;
        ctx.stroke();
        ctx.globalAlpha = 0.12 + 0.2 * bh;
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'fireworks') {
      var bursts = 4;
      for (var b = 0; b < bursts; b++) {
        var bcx = W * (0.16 + U.rng(b * 17) * 0.68);
        var bcy = H * (0.16 + U.rng(b * 23 + 5) * 0.42);
        var bt = (t * sp * 0.42 + b / bursts) % 1;
        if (bt > 0.82) continue;
        var bp = e.outExpo(U.clamp(bt / 0.7, 0, 1));
        var perB = Math.floor(n / bursts);
        for (i = 0; i < perB; i++) {
          a = U.rng(b * 137 + i) * Math.PI * 2;
          var rr = bp * Math.min(W, H) * 0.3 * spread * (0.5 + U.rng(i + b * 61) * 0.9);
          ctx.globalAlpha = U.clamp(1 - bt / 0.82, 0, 1);
          ctx.beginPath();
          ctx.arc(bcx + Math.cos(a) * rr, bcy + Math.sin(a) * rr + bp * bp * 90 * S, baseSize * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = b % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'snow') {
      for (i = 0; i < n; i++) {
        var sy = ((t * sp * (0.06 + U.rng(i + 2) * 0.14) + U.rng(i)) % 1.15) * H * 1.15 - H * 0.08;
        var sx = U.rng(i + 7) * W + Math.sin(t * sp * 0.9 + i * 0.9) * 40 * S;
        var sr = baseSize * (0.4 + U.rng(i + 19) * 1.2);
        ctx.globalAlpha = 0.35 + 0.6 * U.rng(i + 33);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = U.mix(U.ink, U.accent, 0.18);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'rain') {
      ctx.lineCap = 'round';
      for (i = 0; i < n; i++) {
        var ry = ((t * sp * (0.7 + U.rng(i) * 0.9) + U.rng(i + 4)) % 1.2) * H * 1.2 - H * 0.1;
        var rx = U.rng(i + 9) * W * 1.05 - W * 0.02;
        var rl = baseSize * (2.4 + U.rng(i + 12) * 4);
        ctx.globalAlpha = 0.3 + 0.5 * U.rng(i + 15);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - rl * 0.22, ry + rl);
        ctx.strokeStyle = U.rgba(U.accent, 0.85);
        ctx.lineWidth = 1.5 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'sparkup') {
      for (i = 0; i < n; i++) {
        var up = ((t * sp * (0.4 + U.rng(i) * 0.8) + U.rng(i + 6)) % 1.2);
        var spy = H * 1.02 - up * H * 1.1;
        var spx = W * 0.5 + (U.rng(i + 21) - 0.5) * W * 0.7 * spread + Math.sin(up * 7 + i) * 22 * S;
        var life = U.clamp(1 - up / 1.1, 0, 1);
        ctx.globalAlpha = life;
        ctx.beginPath();
        ctx.arc(spx, spy, baseSize * (0.5 + life * 1.1), 0, Math.PI * 2);
        ctx.fillStyle = U.mix('#FFC24B', U.accent, 0.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spiral') {
      for (i = 0; i < n; i++) {
        var sfr = i / n;
        var sang = sfr * Math.PI * 2 * 4.2 + t * sp * 1.1;
        var srad = Math.min(W, H) * 0.6 * spread * Math.pow(sfr, 0.7);
        ctx.globalAlpha = 0.35 + 0.65 * sfr;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sang) * srad, cy + Math.sin(sang) * srad, baseSize * (0.4 + sfr), 0, Math.PI * 2);
        ctx.fillStyle = i % 4 ? U.accent : U.accent2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'trail') {
      ctx.lineCap = 'round';
      for (var tr2 = 0; tr2 < 5; tr2++) {
        var tcx = W * (0.2 + U.rng(tr2 * 31) * 0.6);
        var tcy = H * (0.2 + U.rng(tr2 * 41 + 3) * 0.6);
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        var prevX = tcx, prevY = tcy;
        for (i = 0; i <= 60; i++) {
          var tf = i / 60;
          var ttx = tcx + Math.sin(t * sp * 1.6 + tr2 * 2 + tf * 5) * 130 * S * spread;
          var tty = tcy + Math.cos(t * sp * 1.4 + tr2 * 3 + tf * 4) * 130 * S * spread;
          if (i) { ctx.moveTo(prevX, prevY); ctx.lineTo(ttx, tty); }
          prevX = ttx; prevY = tty;
        }
        ctx.strokeStyle = U.rgba(tr2 % 2 ? U.accent : U.accent2, 0.55);
        ctx.lineWidth = 2 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < n / 3; i++) {
        var fx2 = W * 0.5 + Math.sin(t * sp * 1.2 + i * 0.6) * W * 0.36 * spread;
        var fy2 = H * 0.5 + Math.cos(t * sp * 1.05 + i * 0.75) * H * 0.34 * spread;
        ctx.beginPath();
        ctx.arc(fx2, fy2, baseSize * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = U.ink;
        ctx.fill();
      }
    }

    else if (kind === 'orbit') {
      var rings = 4;
      for (var rg2 = 0; rg2 < rings; rg2++) {
        var orr = Math.min(W, H) * (0.16 + rg2 * 0.1) * (0.6 + spread * 0.6);
        var speedO = 0.6 - rg2 * 0.1;
        var cnt = Math.max(3, Math.round(n / rings));
        for (i = 0; i < cnt; i++) {
          var oa = i / cnt * Math.PI * 2 + t * sp * speedO + rg2;
          ctx.globalAlpha = 0.85 - rg2 * 0.12;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(oa) * orr, cy + Math.sin(oa) * orr * 0.72, baseSize * (1 - rg2 * 0.1), 0, Math.PI * 2);
          ctx.fillStyle = (i + rg2) % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
        ctx.globalAlpha = 0.16;
        ctx.beginPath();
        ctx.ellipse(cx, cy, orr, orr * 0.72, 0, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(U.ink, 0.5);
        ctx.lineWidth = 1.2 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'ink') {
      for (i = 0; i < n; i++) {
        var ik = (t * sp * 0.2 + U.rng(i) * 0.5) % 1;
        var ikr = Math.pow(ik, 0.6) * Math.min(W, H) * 0.5 * spread * (0.4 + U.rng(i + 11) * 1.1);
        var ika = U.rng(i + 21) * Math.PI * 2;
        ctx.globalAlpha = (1 - ik) * 0.4;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ika) * ikr * 0.6, cy + Math.sin(ika) * ikr * 0.6, ikr * 0.5, 0, Math.PI * 2);
        var ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.5);
        ig.addColorStop(0, U.rgba(U.accent, 0.5));
        ig.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ig;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'pollen' || kind === 'dust' || kind === 'firefly') {
      var slow = kind === 'dust' ? 0.35 : (kind === 'firefly' ? 0.8 : 0.55);
      for (i = 0; i < n; i++) {
        var nx = U.rng(i) * W + Math.sin(t * sp * 0.35 * slow + i * 0.8) * 60 * S * spread;
        var ny = U.rng(i + 13) * H + Math.cos(t * sp * 0.3 * slow + i * 1.1) * 60 * S * spread;
        var flick = kind === 'firefly' ? (0.35 + 0.65 * Math.abs(Math.sin(t * sp * 2.2 + i * 1.7))) : (0.3 + 0.5 * U.rng(i + 8));
        ctx.globalAlpha = flick;
        var pr = baseSize * (kind === 'dust' ? 0.35 : 0.7) * (0.5 + U.rng(i + 3));
        ctx.beginPath();
        ctx.arc(nx, ny, pr, 0, Math.PI * 2);
        ctx.fillStyle = kind === 'firefly' ? U.mix('#FFF59A', U.accent, 0.35) : U.mix(U.ink, U.accent, 0.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'vortex' || kind === 'galaxy') {
      var arms = kind === 'galaxy' ? 3 : 1;
      for (i = 0; i < n; i++) {
        var vf = i / n;
        var vang = vf * Math.PI * 2 * 2.6 + t * sp * (0.9 - vf * 0.5) + Math.floor(U.rng(i) * arms) * (Math.PI * 2 / arms);
        var vrad = Math.min(W, H) * 0.66 * spread * Math.pow(vf, 0.62);
        ctx.globalAlpha = 0.25 + 0.7 * (1 - vf);
        var vr = baseSize * (0.35 + U.rng(i + 9) * 1.1) * (1 - vf * 0.4);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(vang) * vrad, cy + Math.sin(vang) * vrad * 0.8, vr, 0, Math.PI * 2);
        ctx.fillStyle = vf < 0.32 ? U.mix('#FFFFFF', U.accent, 0.5) : (i % 3 ? U.accent : U.accent2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.3;
      var cg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.24);
      cg2.addColorStop(0, U.rgba('#FFFFFF', 0.9));
      cg2.addColorStop(0.4, U.rgba(U.accent, 0.4));
      cg2.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = cg2;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    else if (kind === 'comet') {
      ctx.lineCap = 'round';
      var comets = Math.max(2, Math.round(n / 18));
      for (var ci2 = 0; ci2 < comets; ci2++) {
        var cprog = (t * sp * 0.3 + ci2 / comets) % 1;
        var cpx = -W * 0.2 + cprog * W * 1.4;
        var cpy = H * (0.15 + U.rng(ci2 * 13) * 0.55) + cprog * H * 0.28;
        var cgA = ctx.createLinearGradient(cpx, cpy, cpx - 320 * S * spread, cpy - 90 * S * spread);
        cgA.addColorStop(0, U.rgba('#FFFFFF', 0.95));
        cgA.addColorStop(0.25, U.rgba(U.accent, 0.7));
        cgA.addColorStop(1, U.rgba(U.accent, 0));
        ctx.strokeStyle = cgA;
        ctx.lineWidth = baseSize * 1.6;
        ctx.beginPath();
        ctx.moveTo(cpx, cpy);
        ctx.lineTo(cpx - 340 * S * spread, cpy - 96 * S * spread);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cpx, cpy, baseSize * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    else if (kind === 'geyser') {
      for (i = 0; i < n; i++) {
        var gph = ((t * sp * (0.5 + U.rng(i) * 0.7) + U.rng(i + 17)) % 1.15);
        var gpy = H * 0.86 - gph * H * 0.95;
        var gpxc = cx + (U.rng(i + 27) - 0.5) * 90 * S * spread;
        var grav = gph * gph * 200 * S;
        ctx.globalAlpha = U.clamp(1 - gph / 1.1, 0, 1);
        ctx.beginPath();
        ctx.arc(gpxc + Math.sin(gph * 6 + i) * 26 * S, gpy + grav, baseSize * (0.5 + (1 - gph)), 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'pulse') {
      for (i = 0; i < n; i++) {
        var pph = ((t * sp * 0.35 + i / n) % 1);
        var ppr = Math.pow(pph, 0.7) * Math.min(W, H) * 0.68 * spread;
        ctx.globalAlpha = (1 - pph) * 0.75;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(i * 2.399) * ppr * 0.42, cy + Math.sin(i * 2.399) * ppr * 0.42, baseSize * (1.5 - pph), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'magnetic') {
      for (i = 0; i < n; i++) {
        var mpph = (t * sp * 0.3 + U.rng(i) * 0.7) % 1;
        var mrad = Math.min(W, H) * 0.62 * spread * (1 - Math.pow(mpph, 1.7));
        var mang = U.rng(i + 5) * Math.PI * 2 + mpph * 3;
        ctx.globalAlpha = 0.25 + mpph * 0.7;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(mang) * mrad, cy + Math.sin(mang) * mrad, baseSize * (0.4 + mpph), 0, Math.PI * 2);
        ctx.fillStyle = mpph > 0.75 ? U.ink : U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'wind') {
      ctx.lineCap = 'round';
      for (i = 0; i < n; i++) {
        var wy2 = U.rng(i + 6) * H;
        var wxp = ((t * sp * (0.5 + U.rng(i) * 0.9) + U.rng(i + 16)) % 1.3 - 0.15) * W;
        var wlen = (60 + U.rng(i + 26) * 260) * S * spread;
        var wAl = 0.14 + 0.5 * U.rng(i + 36);
        ctx.globalAlpha = wAl;
        ctx.beginPath();
        ctx.moveTo(wxp, wy2);
        ctx.lineTo(wxp + wlen, wy2 + Math.sin(t * sp + i) * 8 * S);
        ctx.strokeStyle = i % 4 ? U.rgba(U.ink, 0.7) : U.rgba(U.accent, 0.85);
        ctx.lineWidth = (1 + U.rng(i + 46) * 2.6) * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'ripplep') {
      for (i = 0; i < n; i++) {
        var rpph = (t * sp * 0.28 + i / n) % 1;
        var rpr = Math.pow(rpph, 0.72) * Math.min(W, H) * 0.7 * spread;
        var rpa = i / n * Math.PI * 2;
        ctx.globalAlpha = (1 - rpph) * 0.85;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(rpa) * rpr, cy + Math.sin(rpa) * rpr, baseSize * (1.4 - rpph * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.ink;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'bloom') {
      var petals2 = 6;
      for (var pb = 0; pb < petals2; pb++) {
        var pba = pb / petals2 * Math.PI * 2 + t * sp * 0.24;
        var pbl = e.outElastic(U.clamp((t * sp % 3) / 1.8, 0, 1));
        for (i = 0; i < n / petals2; i++) {
          var pbf = i / (n / petals2);
          var pbr = pbl * Math.min(W, H) * 0.5 * spread * pbf;
          ctx.globalAlpha = 0.3 + 0.7 * (1 - pbf);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(pba) * pbr, cy + Math.sin(pba) * pbr, baseSize * (1 - pbf * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = pb % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else {
      for (i = 0; i < n; i++) {
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(U.rng(i) * W, U.rng(i + 5) * H, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  MF.forge({
    cat: '粒子系统', type: 'block', dur: 6, poster: 0.45,
    params: PT_PARAMS, draw: particleDraw,
    ids: [
      { id: 'pt-burst', name: '中心爆炸', tags: ['爆炸', '冲击'], desc: '粒子自中心高速四散并淡出，冲击力强，适合揭晓与开场。', cfg: { kind: 'burst', count: 130 } },
      { id: 'pt-confetti', name: '彩纸飘落', tags: ['彩纸', '庆祝'], desc: '彩纸旋转飘落，庆祝氛围直接，适合成交与达成类画面。', cfg: { kind: 'confetti', count: 120 } },
      { id: 'pt-starfield', name: '星域穿梭', tags: ['星空', '穿梭'], desc: '星点自中心向外加速飞过，制造高速穿越的错觉。', cfg: { kind: 'starfield', count: 150 } },
      { id: 'pt-bubble', name: '气泡上升', tags: ['气泡', '轻盈'], desc: '透明气泡缓缓上升并晃动，轻盈通透。', cfg: { kind: 'bubble', count: 46, size: 9 } },
      { id: 'pt-fireworks', name: '烟花绽放', tags: ['烟花', '节庆'], desc: '多点烟花依次绽放与消散，节日气氛浓厚。', cfg: { kind: 'fireworks', count: 160 } },
      { id: 'pt-snow', name: '落雪', tags: ['雪', '冬季'], desc: '雪花缓慢飘落并左右摇摆，冬季与节日主题首选。', cfg: { kind: 'snow', count: 130 } },
      { id: 'pt-rain', name: '雨丝', tags: ['雨', '氛围'], desc: '斜向雨丝持续落下，情绪沉稳，适合叙事与抒情画面。', cfg: { kind: 'rain', count: 140, size: 2 } },
      { id: 'pt-sparkup', name: '火星上窜', tags: ['火星', '上升'], desc: '火星自底部向上窜动并消散，像篝火与热浪。', cfg: { kind: 'sparkup', count: 110 } },
      { id: 'pt-spiral', name: '螺旋粒子', tags: ['螺旋', '旋转'], desc: '粒子沿螺旋线排布旋转，结构感与动感一体。', cfg: { kind: 'spiral', count: 120 } },
      { id: 'pt-trail', name: '拖尾流光', tags: ['拖尾', '流光'], desc: '光点沿复杂曲线运动并留下拖尾轨迹，像数据流。', cfg: { kind: 'trail', count: 90 } },
      { id: 'pt-orbit', name: '环绕轨道', tags: ['轨道', '系统'], desc: '多层轨道上的粒子环绕运动，像原子与星系系统。', cfg: { kind: 'orbit', count: 100 } },
      { id: 'pt-ink', name: '墨迹扩散', tags: ['墨', '扩散'], desc: '墨色在水中的扩散质感，柔和且艺术。', cfg: { kind: 'ink', count: 60 } },
      { id: 'pt-pollen', name: '花粉漂浮', tags: ['漂浮', '柔和'], desc: '光点在空中缓慢漂浮，空气感强，适合美妆与生活方式。', cfg: { kind: 'pollen', count: 100, size: 6 } },
      { id: 'pt-dust', name: '尘埃浮动', tags: ['尘埃', '细腻'], desc: '光束中细微尘埃的浮动，安静且有质感。', cfg: { kind: 'dust', count: 160, size: 3 } },
      { id: 'pt-firefly', name: '萤火虫', tags: ['萤火', '夜晚'], desc: '萤火虫闪烁漂浮，夜间的梦幻氛围。', cfg: { kind: 'firefly', count: 70, size: 7 } },
      { id: 'pt-vortex', name: '漩涡卷入', tags: ['漩涡', '吸引'], desc: '粒子被中心漩涡卷入并被吞没，有强烈的吸引力。', cfg: { kind: 'vortex', count: 150 } },
      { id: 'pt-galaxy', name: '星系漩涡', tags: ['星系', '宏大'], desc: '多旋臂星系结构缓慢旋转，宏大且有宇宙感。', cfg: { kind: 'galaxy', count: 200 } },
      { id: 'pt-comet', name: '彗星划过', tags: ['彗星', '轨迹'], desc: '多颗彗星带长尾划过画面，速度与优雅并存。', cfg: { kind: 'comet', count: 72 } },
      { id: 'pt-geyser', name: '喷泉涌出', tags: ['喷泉', '动能'], desc: '粒子自底部喷出后受重力回落，物理感强。', cfg: { kind: 'geyser', count: 130, size: 17.5} },
      { id: 'pt-pulse', name: '脉冲扩散', tags: ['脉冲', '节奏'], desc: '粒子以脉冲方式一波波向外扩散。', cfg: { kind: 'pulse', count: 120, size: 17.5} },
      { id: 'pt-magnetic', name: '磁性吸附', tags: ['磁性', '收拢'], desc: '粒子自外被磁力吸附到中心，收拢感强烈。', cfg: { kind: 'magnetic', count: 130 } },
      { id: 'pt-wind', name: '风线流动', tags: ['风', '速度'], desc: '水平风线快速掠过，营造速度与流动感。', cfg: { kind: 'wind', count: 110 } },
      { id: 'pt-ripplep', name: '涟漪粒子', tags: ['涟漪', '同心'], desc: '粒子以同心方式向外扩散，规律而柔和。', cfg: { kind: 'ripplep', count: 110 } },
      { id: 'pt-bloom', name: '绽放', tags: ['绽放', '生机'], desc: '粒子沿六片花瓣方向绽放，有生命感。', cfg: { kind: 'bloom', count: 140 } }
    ]
  });

  /* ══════════════════════════ 光影氛围 ══════════════════════════ */

  var LIGHT_PARAMS = [
    P('kind', '光效形态', 'glow-pulse', sel('glow-pulse', [
      ['glow-pulse', '光晕脉冲'], ['lens-flare', '镜头光斑'], ['neon-line', '霓虹线'], ['sweep', '扫光推移'],
      ['spotlight', '聚光灯'], ['laser', '激光线'], ['aurora', '极光'], ['prism', '棱镜色散'],
      ['god-rays', '体积光'], ['lightning', '闪电'], ['plasma', '等离子'], ['hologram', '全息扫描'],
      ['starburst', '星光爆点'], ['bokeh', '散景光斑'], ['mesh', '渐变网格'], ['caustics', '焦散波纹'],
      ['tunnel', '光隧道'], ['haze', '光雾'], ['rings', '光环叠加'], ['rainbow', '彩虹光带']
    ])),
    P('size', '尺寸', 340, rng(340, 80, 700, 4)),
    P('count', '数量', 9, rng(9, 2, 40, 1)),
    P('speed', '速度', 1, rng(1, 0.15, 3, 0.05)),
    P('intensity', '强度', 0.75, rng(0.75, 0.1, 1, 0.05)),
    P('glow', '辉光', 0.7, rng(0.7, 0, 1, 0.05))
  ];

  function lightDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var k = e.outCubic(U.clamp(t / 1.4, 0, 1));
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var base = p.size * S * k;
    var intensity = p.intensity;
    var i, a, x, y;

    ctx.save();

    if (kind === 'glow-pulse') {
      for (i = 0; i < 5; i++) {
        var ph = (t * sp * 0.35 + i / 5) % 1;
        var rr = base * (0.35 + ph * 1.1);
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, U.rgba(U.accent, 0.5 * intensity * (1 - ph)));
        g.addColorStop(0.5, U.rgba(U.accent2, 0.22 * intensity * (1 - ph)));
        g.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'lens-flare') {
      var fx = cx + Math.sin(t * sp * 0.6) * W * 0.16;
      var fy = cy + Math.cos(t * sp * 0.5) * H * 0.14;
      var fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, base * 0.6);
      fg.addColorStop(0, U.rgba('#FFFFFF', 0.95 * intensity));
      fg.addColorStop(0.18, U.rgba(U.accent, 0.6 * intensity));
      fg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, W, H);
      for (i = 1; i <= Math.max(3, Math.round(p.count / 2)); i++) {
        var fx2 = W - (fx - W * 0.5) * (i * 0.5) - W * 0.5;
        var fr = base * (0.06 + i * 0.045);
        var fg2 = ctx.createRadialGradient(fx2, fy, 0, fx2, fy, fr);
        fg2.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.4 * intensity));
        fg2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = fg2;
        ctx.beginPath(); ctx.arc(fx2, fy, fr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 0.5 * intensity;
      ctx.strokeStyle = U.rgba(U.accent2, 0.7);
      ctx.lineWidth = 2 * S;
      ctx.beginPath();
      ctx.moveTo(fx - base * 1.5, fy); ctx.lineTo(fx + base * 1.5, fy);
      ctx.moveTo(fx, fy - base * 0.5); ctx.lineTo(fx, fy + base * 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'neon-line') {
      ctx.lineCap = 'round';
      var nLines = Math.max(2, Math.round(p.count));
      for (i = 0; i < nLines; i++) {
        var ly = H * (i + 1) / (nLines + 1);
        var startX = Math.sin(t * sp * 0.8 + i) * 40 * S;
        ctx.globalAlpha = 0.9 * intensity;
        for (var pass = 0; pass < 3; pass++) {
          ctx.strokeStyle = U.rgba(i % 2 ? U.accent : U.accent2, [0.28, 0.5, 1][pass] * intensity);
          ctx.lineWidth = [10, 5, 2][pass] * S;
          ctx.beginPath();
          for (x = startX; x <= W - startX; x += 12) {
            var yy = ly + Math.sin(x * 0.008 + t * sp * 2 + i) * 26 * S;
            if (x === startX) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'sweep') {
      var sw = base * 0.9;
      var sx = -sw + (W + sw * 2) * ((t * sp * 0.5) % 1.35);
      var sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
      sg.addColorStop(0, U.rgba(U.accent, 0));
      sg.addColorStop(0.42, U.rgba(U.accent, 0.42 * intensity));
      sg.addColorStop(0.5, U.rgba('#FFFFFF', 0.68 * intensity));
      sg.addColorStop(0.58, U.rgba(U.accent2, 0.42 * intensity));
      sg.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.85 * intensity;
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba('#FFFFFF', 0.8);
      ctx.beginPath();
      ctx.moveTo(sx, -20); ctx.lineTo(sx, H + 20);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spotlight') {
      var sxa = cx + Math.sin(t * sp * 0.7) * W * 0.26;
      var sya = cy + Math.cos(t * sp * 0.55) * H * 0.16;
      var rTop = base * 0.12, rBot = base * 0.85;
      var lg = ctx.createLinearGradient(sxa, -H * 0.2, sxa, H);
      lg.addColorStop(0, U.rgba(U.accent, 0.4 * intensity));
      lg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(sxa - rTop, -H * 0.2);
      ctx.lineTo(sxa + rTop, -H * 0.2);
      ctx.lineTo(sxa + rBot, H);
      ctx.lineTo(sxa - rBot, H);
      ctx.closePath();
      ctx.fill();
      var sp2 = ctx.createRadialGradient(sxa, sya, 0, sxa, sya, base * 0.9);
      sp2.addColorStop(0, U.rgba(U.accent, 0.35 * intensity));
      sp2.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = sp2;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'laser') {
      ctx.lineCap = 'round';
      for (i = 0; i < Math.max(2, Math.round(p.count)); i++) {
        var lang = t * sp * 0.5 + i * Math.PI * 2 / Math.max(2, p.count);
        var lx = cx + Math.cos(lang) * W;
        var ly2 = cy + Math.sin(lang) * H;
        ctx.globalAlpha = 0.85 * intensity;
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent : U.accent2, 0.9);
        ctx.shadowColor = U.rgba(i % 2 ? U.accent : U.accent2, 0.9);
        ctx.shadowBlur = 26 * S * p.glow;
        ctx.lineWidth = 2.6 * S;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(lx, ly2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      var cg3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.4);
      cg3.addColorStop(0, U.rgba('#FFFFFF', 0.9));
      cg3.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = cg3;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'aurora') {
      for (i = 0; i < 4; i++) {
        var ag = ctx.createLinearGradient(0, 0, W, H * 0.6);
        var off = Math.sin(t * sp * 0.5 + i * 1.6) * 0.18;
        ag.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0));
        ag.addColorStop(U.clamp(0.3 + off, 0.05, 0.9), U.rgba(i % 2 ? U.accent : U.accent2, 0.3 * intensity));
        ag.addColorStop(U.clamp(0.62 + off, 0.1, 0.95), U.rgba(i % 2 ? U.accent2 : U.accent, 0.24 * intensity));
        ag.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.moveTo(0, H * 0.1 + i * 12 * S);
        for (x = 0; x <= W; x += 20) {
          ctx.lineTo(x, H * (0.16 + i * 0.13) + Math.sin(x * 0.005 + t * sp * 1.1 + i) * 60 * S * k
            + Math.sin(x * 0.013 - t * sp * 0.7) * 30 * S * k);
        }
        ctx.lineTo(W, H * 0.75);
        ctx.lineTo(0, H * 0.75);
        ctx.closePath();
        ctx.fill();
      }
    }

    else if (kind === 'prism') {
      for (i = 0; i < Math.max(3, Math.round(p.count)); i++) {
        var pang = t * sp * 0.4 + i * Math.PI * 2 / Math.max(3, p.count);
        var pcol = 'hsl(' + (i * 360 / Math.max(3, p.count)).toFixed(0) + ',90%,62%)';
        ctx.globalAlpha = 0.34 * intensity;
        ctx.fillStyle = pcol;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(pang) * W, cy + Math.sin(pang) * H);
        ctx.lineTo(cx + Math.cos(pang + 0.24) * W, cy + Math.sin(pang + 0.24) * H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 1;
      var pg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.5);
      pg2.addColorStop(0, U.rgba('#FFFFFF', 0.7 * intensity));
      pg2.addColorStop(1, U.rgba('#FFFFFF', 0));
      ctx.fillStyle = pg2;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'god-rays') {
      var rays = Math.max(6, Math.round(p.count * 1.4));
      for (i = 0; i < rays; i++) {
        var ra = i / rays * Math.PI * 2 + t * sp * 0.06;
        var rw = 0.022 + 0.05 * Math.abs(Math.sin(i * 1.7 + t * sp * 0.5));
        var rgd = ctx.createRadialGradient(cx, cy - H * 0.24, 0, cx, cy - H * 0.24, Math.max(W, H) * 1.05);
        rgd.addColorStop(0, U.rgba(U.accent, 0.34 * intensity));
        rgd.addColorStop(0.35, U.rgba(U.accent, 0.14 * intensity));
        rgd.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = rgd;
        ctx.beginPath();
        ctx.moveTo(cx, cy - H * 0.24);
        ctx.lineTo(cx + Math.cos(ra - rw) * Math.max(W, H) * 1.2, cy - H * 0.24 + Math.sin(ra - rw) * Math.max(W, H) * 1.2);
        ctx.lineTo(cx + Math.cos(ra + rw) * Math.max(W, H) * 1.2, cy - H * 0.24 + Math.sin(ra + rw) * Math.max(W, H) * 1.2);
        ctx.closePath();
        ctx.fill();
      }
    }

    else if (kind === 'lightning') {
      ctx.lineCap = 'round';
      for (var lb = 0; lb < Math.max(2, Math.round(p.count / 3)); lb++) {
        var ly3 = -20;
        var lx3 = W * (0.15 + U.rng(lb * 13) * 0.7);
        ctx.beginPath();
        ctx.moveTo(lx3, ly3);
        for (i = 0; i < 14; i++) {
          ly3 += H / 13;
          lx3 += (U.rng(lb * 97 + i * 7 + Math.floor(t * sp * 8) * 3) - 0.5) * 140 * S;
          ctx.lineTo(lx3, ly3);
        }
        ctx.globalAlpha = (0.35 + 0.6 * U.rng(lb * 31 + Math.floor(t * sp * 6))) * intensity;
        ctx.strokeStyle = U.rgba('#DDF3FF', 0.95);
        ctx.shadowColor = U.rgba(U.accent2, 0.95);
        ctx.shadowBlur = 34 * S * p.glow;
        ctx.lineWidth = 2.8 * S;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    else if (kind === 'plasma') {
      for (i = 0; i < 26; i++) {
        var plx = cx + Math.sin(t * sp * 0.7 + i * 0.9) * base * 0.9;
        var ply = cy + Math.cos(t * sp * 0.6 + i * 1.3) * base * 0.72;
        var plr = base * (0.08 + 0.16 * Math.abs(Math.sin(t * sp + i)));
        var plg = ctx.createRadialGradient(plx, ply, 0, plx, ply, plr);
        plg.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0.7 * intensity));
        plg.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = plg;
        ctx.beginPath(); ctx.arc(plx, ply, plr, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'hologram') {
      for (i = 0; i < 60; i++) {
        var hly = (i / 60) * H;
        var hlv = 0.5 + 0.5 * Math.sin(hly * 0.06 - t * sp * 3);
        ctx.globalAlpha = (0.06 + 0.22 * hlv) * intensity;
        ctx.fillStyle = U.accent;
        ctx.fillRect(0, hly, W, H / 60 * 0.9);
      }
      ctx.globalAlpha = 1;
      var hb = (t * sp * 0.35) % 1 * H * 1.2 - H * 0.1;
      var hg = ctx.createLinearGradient(0, hb - 70 * S, 0, hb + 70 * S);
      hg.addColorStop(0, U.rgba(U.accent2, 0));
      hg.addColorStop(0.5, U.rgba(U.accent2, 0.42 * intensity));
      hg.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = hg;
      ctx.fillRect(0, hb - 70 * S, W, 140 * S);
    }

    else if (kind === 'starburst') {
      var sbx = cx, sby = cy;
      var pulses = 0.6 + 0.4 * Math.sin(t * sp * 2.4);
      for (i = 0; i < 4; i++) {
        ctx.globalAlpha = [0.34, 0.5, 0.75, 1][i] * intensity * pulses;
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.85);
        ctx.lineWidth = [10, 6, 3, 1.6][i] * S * k;
        ctx.beginPath();
        ctx.moveTo(sbx - base * 1.6, sby); ctx.lineTo(sbx + base * 1.6, sby);
        ctx.moveTo(sbx, sby - base * 1.6); ctx.lineTo(sbx, sby + base * 1.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      var stg = ctx.createRadialGradient(sbx, sby, 0, sbx, sby, base * 0.7);
      stg.addColorStop(0, U.rgba('#FFFFFF', 0.9 * intensity));
      stg.addColorStop(0.3, U.rgba(U.accent, 0.4 * intensity));
      stg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = stg;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'bokeh') {
      var bn = Math.max(6, Math.round(p.count * 2));
      for (i = 0; i < bn; i++) {
        var brx = U.rng(i) * W + Math.sin(t * sp * 0.3 + i) * 30 * S;
        var bry = U.rng(i + 7) * H + Math.cos(t * sp * 0.24 + i) * 30 * S;
        var brr = base * (0.06 + U.rng(i + 13) * 0.22);
        var bg = ctx.createRadialGradient(brx, bry, 0, brx, bry, brr);
        bg.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.32 * intensity));
        bg.addColorStop(0.72, U.rgba(i % 2 ? U.accent2 : U.accent, 0.22 * intensity));
        bg.addColorStop(0.82, U.rgba('#FFFFFF', 0.1 * intensity));
        bg.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(brx, bry, brr, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'mesh') {
      for (i = 0; i < 5; i++) {
        var mxp = cx + Math.sin(t * sp * 0.4 + i * 2.2) * W * 0.32;
        var myp = cy + Math.cos(t * sp * 0.34 + i * 1.7) * H * 0.28;
        var mg = ctx.createRadialGradient(mxp, myp, 0, mxp, myp, base * 0.95);
        mg.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0.4 * intensity));
        mg.addColorStop(1, U.rgba(i % 2 ? U.accent : U.accent2, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'caustics') {
      ctx.globalCompositeOperation = 'screen';
      for (i = 0; i < 3; i++) {
        ctx.strokeStyle = U.rgba(U.accent, 0.16 * intensity);
        ctx.lineWidth = 12 * S;
        for (var cyc = 0; cyc < 14; cyc++) {
          ctx.beginPath();
          for (x = 0; x <= W; x += 14) {
            var cyv = cy + Math.sin(x * 0.007 + cyc * 0.5 + t * sp * (1 + i * 0.4)) * 90 * S * k
              + Math.sin(x * 0.019 - t * sp * 1.6) * 40 * S * k;
            if (x === 0) ctx.moveTo(x, cyv + cyc * 60 * S - 380 * S); else ctx.lineTo(x, cyv + cyc * 60 * S - 380 * S);
          }
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    else if (kind === 'tunnel') {
      var rings2 = Math.max(6, Math.round(p.count * 1.6));
      for (i = 0; i < rings2; i++) {
        var tph = (i / rings2 + t * sp * 0.24) % 1;
        var trr = Math.pow(tph, 1.8) * Math.min(W, H) * 0.95;
        ctx.globalAlpha = U.clamp(tph * 2.2, 0, 1) * (1 - tph * 0.4) * intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, trr, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = (1.4 + tph * 8) * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      var tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.2);
      tg.addColorStop(0, U.rgba('#FFFFFF', 0.85 * intensity));
      tg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = tg;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'haze') {
      for (i = 0; i < 4; i++) {
        var hx = cx + Math.sin(t * sp * 0.24 + i * 1.9) * W * 0.3;
        var hy = cy + Math.cos(t * sp * 0.2 + i * 2.4) * H * 0.26;
        var hg2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, base * 1.15);
        hg2.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.26 * intensity));
        hg2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = hg2;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'rings') {
      for (i = 0; i < Math.max(3, Math.round(p.count)); i++) {
        var rph2 = (t * sp * 0.3 + i / Math.max(3, p.count)) % 1;
        var rrad = base * 1.2 * Math.pow(rph2, 0.72);
        ctx.globalAlpha = (1 - rph2) * 0.8 * intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, rrad, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.shadowColor = U.rgba(i % 2 ? U.accent : U.accent2, p.glow);
        ctx.shadowBlur = 20 * S * p.glow;
        ctx.lineWidth = (2 + (1 - rph2) * 8) * S;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    else if (kind === 'rainbow') {
      var bands = Math.max(3, Math.round(p.count));
      for (i = 0; i < bands; i++) {
        ctx.globalAlpha = 0.24 * intensity;
        ctx.fillStyle = 'hsl(' + (i * 360 / bands).toFixed(0) + ',92%,60%)';
        ctx.beginPath();
        ctx.moveTo(0, H * (0.2 + i * 0.5 / bands) + Math.sin(t * sp * 0.6) * 40 * S * k);
        for (x = 0; x <= W; x += 24) {
          ctx.lineTo(x, H * (0.2 + i * 0.5 / bands) + Math.sin(x * 0.006 + t * sp + i * 0.6) * 50 * S * k);
        }
        ctx.lineTo(W, H * (0.3 + i * 0.5 / bands) + 60 * S);
        ctx.lineTo(0, H * (0.3 + i * 0.5 / bands) + 60 * S);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else {
      var dg = ctx.createRadialGradient(cx, cy, 0, cx, cy, base);
      dg.addColorStop(0, U.rgba(U.accent, 0.4 * intensity));
      dg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = dg;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }

  MF.forge({
    cat: '光影氛围', type: 'block', dur: 6, poster: 0.62,
    params: LIGHT_PARAMS, draw: lightDraw,
    ids: [
      { id: 'lt-glow-pulse', name: '光晕脉冲', tags: ['光晕', '呼吸'], desc: '柔光以呼吸节奏向外扩散，适合做氛围底光。', cfg: { kind: 'glow-pulse' } },
      { id: 'lt-lens-flare', name: '镜头光斑', tags: ['光斑', '镜头'], desc: '真实镜头光斑沿画面游走并带十字星芒，电影感强。', cfg: { kind: 'lens-flare' } },
      { id: 'lt-neon-line', name: '霓虹线', tags: ['霓虹', '线条'], desc: '多条霓虹灯管线条波动，科技与夜店氛围兼具。', cfg: { kind: 'neon-line' } },
      { id: 'lt-sweep', name: '扫光推移', tags: ['扫光', '高级'], desc: '一道宽光带横扫而过，是最常用的高级质感动效。', cfg: { kind: 'sweep' } },
      { id: 'lt-spotlight', name: '聚光灯', tags: ['聚光', '舞台'], desc: '顶部投下的聚光灯缓慢扫过，舞台与发布会标配。', cfg: { kind: 'spotlight' } },
      { id: 'lt-laser', name: '激光线', tags: ['激光', '放射'], desc: '激光自中心旋转放射，赛博与科幻感强烈。', cfg: { kind: 'laser' } },
      { id: 'lt-aurora', name: '极光', tags: ['极光', '梦幻'], desc: '多层极光带缓慢流动，梦幻且极具氛围。', cfg: { kind: 'aurora' } },
      { id: 'lt-prism', name: '棱镜色散', tags: ['棱镜', '色彩'], desc: '光线经棱镜色散成彩色光扇，色彩表现力强。', cfg: { kind: 'prism' } },
      { id: 'lt-god-rays', name: '体积光', tags: ['体积光', '自然'], desc: '自上方倾泻的体积光束，自然光感强，适合晨光场景。', cfg: { kind: 'god-rays' } },
      { id: 'lt-lightning', name: '闪电', tags: ['闪电', '冲击'], desc: '随机折线闪电击中画面，配合辉光，冲击力极强。', cfg: { kind: 'lightning' } },
      { id: 'lt-plasma', name: '等离子', tags: ['等离子', '能量'], desc: '等离子光团在画面中游走融合，能量感强。', cfg: { kind: 'plasma' } },
      { id: 'lt-hologram', name: '全息扫描', tags: ['全息', '科技'], desc: '横向扫描线与扫描光带叠加，全息投影质感。', cfg: { kind: 'hologram' } },
      { id: 'lt-starburst', name: '星光爆点', tags: ['星光', '闪耀'], desc: '十字星芒脉冲爆闪，是强调与惊喜瞬间的利器。', cfg: { kind: 'starburst' } },
      { id: 'lt-bokeh', name: '散景光斑', tags: ['散景', '柔美'], desc: '大光圈散景光斑漂浮，柔美且有摄影质感。', cfg: { kind: 'bokeh' } },
      { id: 'lt-mesh', name: '渐变网格', tags: ['网格', '色彩'], desc: '多个彩色光团融合成渐变网格，现代设计感强。', cfg: { kind: 'mesh' } },
      { id: 'lt-caustics', name: '焦散波纹', tags: ['焦散', '水感'], desc: '水面焦散般的光纹波动，通透且有水感。', cfg: { kind: 'caustics' } },
      { id: 'lt-tunnel', name: '光隧道', tags: ['隧道', '穿越'], desc: '多层光环由远及近穿过，穿越感强烈。', cfg: { kind: 'tunnel' } },
      { id: 'lt-haze', name: '光雾', tags: ['光雾', '氛围'], desc: '流动的光雾铺满画面，适合做柔和的氛围底。', cfg: { kind: 'haze' } },
      { id: 'lt-rings', name: '光环叠加', tags: ['光环', '扩散'], desc: '多层光环依次向外扩散，规律且华丽。', cfg: { kind: 'rings' } },
      { id: 'lt-rainbow', name: '彩虹光带', tags: ['彩虹', '色彩'], desc: '彩色光带波动流动，色彩丰富，适合活泼内容。', cfg: { kind: 'rainbow' } }
    ]
  });
})();

/* ════════ assets/js/effects-10.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 10
   原语：数据图表（让数据以动画方式呈现）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var CHART_PARAMS = [
    P('kind', '图表类型', 'bar', sel('bar', [
      ['bar', '柱状图'], ['stacked', '堆叠柱'], ['line', '折线图'], ['area', '面积图'],
      ['dual', '双折线'], ['spark', '迷你折线'], ['pie', '饼图'], ['donut', '环形图'],
      ['radar', '雷达图'], ['gauge', '仪表盘'], ['scatter', '散点图'], ['bubble', '气泡图'],
      ['heatmap', '热力图'], ['grid-heat', '格子热力'], ['funnel', '漏斗图'], ['waterfall', '瀑布图'],
      ['candle', 'K 线图'], ['treemap', '矩形树图'], ['radial', '径向柱'], ['bump', '排名变化'],
      ['quadrant', '四象限'], ['bullet', '子弹图'], ['rings', '进度环组'], ['timeline-m', '时间序列']
    ])),
    P('label', '图表标题', 'QUARTERLY', txt('QUARTERLY')),
    P('count', '数据点数', 9, rng(9, 3, 24, 1)),
    P('size', '基准尺寸', 380, rng(380, 120, 700, 4)),
    P('speed', '速度', 1, rng(1, 0.3, 3, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function chartDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var n = Math.max(3, Math.round(p.count));
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var base = p.size * S;
    var k = e.outCubic(U.clamp(t * sp / 1.5, 0, 1));
    var cx = W / 2, cy = H / 2;
    var data = [], i;
    for (i = 0; i < n; i++) data.push(0.22 + U.rng(i * 7 + 3) * 0.78);
    var d2 = [];
    for (i = 0; i < n; i++) d2.push(0.15 + U.rng(i * 13 + 91) * 0.7);

    var plotW = W * 0.72, plotH = H * 0.56;
    var px = cx - plotW / 2, py = cy - plotH / 2 + 20 * S;
    var ink = U.ink;

    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.7); ctx.shadowBlur = 20 * S * p.glow; }

    /* 标题 */
    if (p.label) {
      ctx.font = U.fs(30 * S, 700);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.letterSpacing = '3px';
      ctx.fillText(String(p.label), px, py - 26 * S);
      ctx.letterSpacing = '0px';
    }

    if (kind === 'bar' || kind === 'stacked') {
      var gapB = plotW / n;
      var bw = gapB * 0.58;
      for (i = 0; i < n; i++) {
        var dly = i * 0.07 / sp;
        var bk = e.outBack(U.clamp((t * sp - dly) / 0.85, 0, 1));
        var bh = plotH * data[i] * k;
        var bx = px + i * gapB + (gapB - bw) / 2;
        var byy = py + plotH - bh;
        var bg = ctx.createLinearGradient(0, py + plotH, 0, byy);
        bg.addColorStop(0, U.rgba(U.accent, 0.35));
        bg.addColorStop(1, U.rgba(U.accent, 1));
        ctx.fillStyle = bg;
        U.rr(ctx, bx, py + plotH - bh * bk, bw, bh * bk, 6 * S);
        ctx.fill();
        if (kind === 'stacked') {
          var s1 = plotH * d2[i] * 0.42 * k;
          ctx.fillStyle = U.rgba(U.accent2, 0.9);
          U.rr(ctx, bx, py + plotH - bh * bk - s1 * bk, bw, s1 * bk, 6 * S);
          ctx.fill();
        }
      }
    }

    else if (kind === 'line' || kind === 'area' || kind === 'dual' || kind === 'spark') {
      var pts = [], pts2 = [];
      var stepX = plotW / (n - 1);
      var shown = e.outCubic(U.clamp(t * sp / 1.4, 0, 1)) * (n - 1);
      for (i = 0; i < n; i++) {
        pts.push([px + i * stepX, py + plotH - plotH * data[i] * k]);
        pts2.push([px + i * stepX, py + plotH - plotH * d2[i] * k]);
      }
      if (kind === 'area') {
        var ag = ctx.createLinearGradient(0, py, 0, py + plotH);
        ag.addColorStop(0, U.rgba(U.accent, 0.4));
        ag.addColorStop(1, U.rgba(U.accent, 0));
        ctx.beginPath();
        ctx.moveTo(pts[0][0], py + plotH);
        for (i = 0; i <= shown; i++) { var pi2 = Math.min(n - 1, Math.floor(i)); ctx.lineTo(pts[pi2][0], pts[pi2][1]); }
        var lastP = Math.min(n - 1, Math.ceil(shown));
        var frac = shown - Math.floor(shown);
        var tipXA = U.lerp(pts[Math.min(n - 1, Math.floor(shown))][0], pts[lastP][0], frac);
        var tipYA = U.lerp(pts[Math.min(n - 1, Math.floor(shown))][1], pts[lastP][1], frac);
        ctx.lineTo(tipXA, tipYA);
        ctx.lineTo(tipXA, py + plotH);
        ctx.closePath();
        ctx.fillStyle = ag;
        ctx.fill();
      }
      var drawLine = function (pp, col, wdt) {
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = wdt * S;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        for (i = 0; i < n; i++) {
          if (i > shown + 0.001) {
            if (i === Math.ceil(shown)) {
              var f2 = shown - Math.floor(shown);
              ctx.lineTo(U.lerp(pp[Math.floor(shown)][0], pp[i][0], f2), U.lerp(pp[Math.floor(shown)][1], pp[i][1], f2));
            }
            break;
          }
          if (i) ctx.lineTo(pp[i][0], pp[i][1]); else ctx.moveTo(pp[i][0], pp[i][1]);
        }
        ctx.stroke();
      };
      if (kind === 'dual') { drawLine(pts2, U.rgba(U.accent2, 0.9), 3); }
      drawLine(pts, U.accent, kind === 'spark' ? 3 : 4);
      if (kind !== 'spark') {
        for (i = 0; i <= Math.min(n - 1, Math.floor(shown)); i++) {
          ctx.beginPath();
          ctx.arc(pts[i][0], pts[i][1], 5 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.mix(U.bg1, U.accent, 0.2);
          ctx.fill();
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = 2.4 * S;
          ctx.stroke();
        }
      }
    }

    else if (kind === 'pie' || kind === 'donut') {
      var total = data.reduce(function (a, b) { return a + b; }, 0);
      var start = -Math.PI / 2;
      var R = base * 0.62;
      var prog = e.outCubic(U.clamp(t * sp / 1.5, 0, 1));
      for (i = 0; i < n; i++) {
        var sweep = (data[i] / total) * Math.PI * 2 * prog;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R * k, start, start + sweep);
        ctx.closePath();
        ctx.fillStyle = i % 2 ? U.rgba(U.accent2, 0.9) : U.rgba(U.accent, 0.92);
        if (i % 3 === 2) ctx.fillStyle = U.rgba(U.mix(U.accent, U.accent2, 0.5), 0.9);
        ctx.fill();
        ctx.strokeStyle = U.rgba(U.bg1, 0.5);
        ctx.lineWidth = 2 * S;
        ctx.stroke();
        start += sweep;
      }
      if (kind === 'donut') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.56 * k, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    else if (kind === 'radar') {
      var R2 = base * 0.55;
      ctx.strokeStyle = U.rgba(ink, 0.14);
      ctx.lineWidth = 1.2 * S;
      for (var ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        for (i = 0; i <= n; i++) {
          var ang = -Math.PI / 2 + i / n * Math.PI * 2;
          var rr = R2 * (ring / 4) * k;
          var vx = cx + Math.cos(ang) * rr, vy = cy + Math.sin(ang) * rr;
          if (i) ctx.lineTo(vx, vy); else ctx.moveTo(vx, vy);
        }
        ctx.stroke();
      }
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R2);
      rg.addColorStop(0, U.rgba(U.accent, 0.5));
      rg.addColorStop(1, U.rgba(U.accent2, 0.3));
      ctx.beginPath();
      for (i = 0; i <= n; i++) {
        var ang2 = -Math.PI / 2 + i / n * Math.PI * 2;
        var val = data[i % n] * R2 * k * (0.6 + 0.4 * Math.sin(t * sp + i));
        var vx2 = cx + Math.cos(ang2) * val, vy2 = cy + Math.sin(ang2) * val;
        if (i) ctx.lineTo(vx2, vy2); else ctx.moveTo(vx2, vy2);
      }
      ctx.closePath();
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 2.4 * S;
      ctx.stroke();
    }

    else if (kind === 'gauge') {
      var R3 = base * 0.55;
      var startA = Math.PI * 0.75, endA = Math.PI * 2.25;
      ctx.beginPath();
      ctx.arc(cx, cy, R3 * k, startA, endA);
      ctx.strokeStyle = U.rgba(ink, 0.14);
      ctx.lineWidth = 26 * S;
      ctx.lineCap = 'round';
      ctx.stroke();
      var val2 = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * sp * 0.8));
      var eg = ctx.createLinearGradient(cx - R3, cy, cx + R3, cy);
      eg.addColorStop(0, U.accent);
      eg.addColorStop(1, U.accent2);
      ctx.beginPath();
      ctx.arc(cx, cy, R3 * k, startA, startA + (endA - startA) * val2);
      ctx.strokeStyle = eg;
      ctx.lineWidth = 26 * S;
      ctx.stroke();
      ctx.font = U.fs(72 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(val2 * 100) + '%', cx, cy + 6 * S);
    }

    else if (kind === 'scatter' || kind === 'bubble') {
      for (i = 0; i < n * 3; i++) {
        var sx3 = px + U.rng(i * 3 + 1) * plotW;
        var sy3 = py + U.rng(i * 5 + 7) * plotH;
        var sk = e.outBack(U.clamp((t * sp - i * 0.03) / 0.7, 0, 1));
        var rad = (kind === 'bubble' ? 8 + U.rng(i + 11) * 26 : 5 + U.rng(i + 11) * 5) * S;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(sx3, sy3, rad * sk, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? U.accent2 : U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'heatmap' || kind === 'grid-heat') {
      var hc = Math.max(3, Math.round(n * 0.6)), hr = Math.max(3, Math.round(hc * 0.62));
      var cw = plotW / hc, chh = plotH / hr;
      for (var hy = 0; hy < hr; hy++) {
        for (var hx = 0; hx < hc; hx++) {
          var hv = U.rng(hy * 53 + hx * 17);
          var hk = e.outCubic(U.clamp((t * sp - (hx + hy) * 0.04) / 0.8, 0, 1));
          ctx.globalAlpha = hk;
          ctx.fillStyle = U.mix(U.mix(U.bg2, U.accent2, 0.3), U.accent, hv);
          U.rr(ctx, px + hx * cw + 2 * S, py + hy * chh + 2 * S, cw - 4 * S, chh - 4 * S, 5 * S);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'funnel') {
      for (i = 0; i < n; i++) {
        var fw = plotW * (1 - i / n * 0.78);
        var fh = plotH / n * 0.86;
        var fy = py + i * (plotH / n);
        var fk = e.outCubic(U.clamp((t * sp - i * 0.1) / 0.7, 0, 1));
        ctx.globalAlpha = 0.9;
        var fg = ctx.createLinearGradient(px, 0, px + plotW, 0);
        fg.addColorStop(0, U.mix(U.accent, U.accent2, i / n));
        fg.addColorStop(1, U.mix(U.accent2, U.accent, i / n));
        ctx.fillStyle = fg;
        U.rr(ctx, cx - fw / 2, fy, fw * fk, fh, 6 * S);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'waterfall') {
      var wbW = plotW / n * 0.66;
      var acc = 0;
      for (i = 0; i < n; i++) {
        var wv = (U.rng(i * 11 + 5) - 0.42) * 0.55;
        var startY = py + plotH * (0.6 - acc);
        acc += wv;
        var endY = py + plotH * (0.6 - acc);
        var wk = e.outCubic(U.clamp((t * sp - i * 0.09) / 0.7, 0, 1));
        ctx.fillStyle = wv >= 0 ? U.rgba(U.accent, 0.92) : U.rgba(U.accent2, 0.92);
        U.rr(ctx, px + i * (plotW / n) + (plotW / n - wbW) / 2, U.lerp(startY, endY, wk), wbW, Math.abs(endY - startY) * wk, 4 * S);
        ctx.fill();
      }
    }

    else if (kind === 'candle') {
      var cbW = plotW / n * 0.5;
      for (i = 0; i < n; i++) {
        var o = 0.3 + U.rng(i * 3 + 2) * 0.5;
        var c = 0.3 + U.rng(i * 7 + 9) * 0.5;
        var hi2 = Math.max(o, c) + U.rng(i + 21) * 0.14;
        var lo2 = Math.min(o, c) - U.rng(i + 31) * 0.14;
        var cbx = px + i * (plotW / n) + (plotW / n - cbW) / 2;
        var up = c >= o;
        var ck = e.outCubic(U.clamp((t * sp - i * 0.07) / 0.7, 0, 1));
        ctx.strokeStyle = up ? U.accent : U.accent2;
        ctx.lineWidth = 2.4 * S;
        ctx.beginPath();
        ctx.moveTo(cbx + cbW / 2, py + plotH - plotH * hi2 * k);
        ctx.lineTo(cbx + cbW / 2, py + plotH - plotH * lo2 * k);
        ctx.stroke();
        ctx.fillStyle = up ? U.rgba(U.accent, 0.95) : U.rgba(U.accent2, 0.95);
        var top = py + plotH - plotH * Math.max(o, c) * k;
        var hgt = Math.abs(c - o) * plotH * k * ck;
        U.rr(ctx, cbx, top, cbW, Math.max(3 * S, hgt), 3 * S);
        ctx.fill();
      }
    }

    else if (kind === 'treemap') {
      var rects = [];
      var tmx = px, tmy = py, tmw = plotW, tmh = plotH;
      for (i = 0; i < n; i++) {
        var vertical = tmw > tmh;
        var ratio = data[i] / (n - i) * 1.4;
        if (vertical) {
          var rw = tmw * Math.min(0.85, 0.3 + data[i] * 0.5);
          rects.push([tmx, tmy, rw, tmh]);
          tmx += rw; tmw -= rw;
        } else {
          var rh2 = tmh * Math.min(0.85, 0.3 + data[i] * 0.5);
          rects.push([tmx, tmy, tmw, rh2]);
          tmy += rh2; tmh -= rh2;
        }
        if (tmw <= 2 || tmh <= 2) break;
      }
      for (i = 0; i < rects.length; i++) {
        var rk = e.outCubic(U.clamp((t * sp - i * 0.07) / 0.7, 0, 1));
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = i % 2 ? U.rgba(U.accent2, 0.85) : U.rgba(U.accent, 0.9);
        U.rr(ctx, rects[i][0] + 3 * S, rects[i][1] + 3 * S, (rects[i][2] - 6 * S) * rk, (rects[i][3] - 6 * S) * rk, 6 * S);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'radial') {
      var R4 = base * 0.56;
      for (i = 0; i < n; i++) {
        var ra2 = -Math.PI / 2 + i / n * Math.PI * 2;
        var rk2 = e.outBack(U.clamp((t * sp - i * 0.06) / 0.8, 0, 1));
        var rl2 = R4 * data[i] * k * rk2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ra2) * R4 * 0.28, cy + Math.sin(ra2) * R4 * 0.28);
        ctx.lineTo(cx + Math.cos(ra2) * (R4 * 0.28 + rl2), cy + Math.sin(ra2) * (R4 * 0.28 + rl2));
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = Math.max(4, (Math.PI * 2 * R4 / n) * 0.5) * S;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, R4 * 0.24 * k, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(ink, 0.25); ctx.lineWidth = 2 * S; ctx.stroke();
    }

    else if (kind === 'bump') {
      var bp = [];
      for (i = 0; i < n; i++) bp.push([px + i * (plotW / (n - 1)), py + plotH * data[i]]);
      var bp2 = [];
      for (i = 0; i < n; i++) bp2.push([px + i * (plotW / (n - 1)), py + plotH * (1 - data[i] * 0.75)]);
      var bprog = e.outCubic(U.clamp(t * sp / 1.5, 0, 1));
      var loop = function (arr, col) {
        ctx.beginPath();
        ctx.strokeStyle = col; ctx.lineWidth = 3.4 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (i = 0; i < n; i++) { if (i) ctx.lineTo(arr[i][0], arr[i][1]); else ctx.moveTo(arr[i][0], arr[i][1]); }
        ctx.stroke();
        for (i = 0; i < n; i++) {
          ctx.beginPath(); ctx.arc(arr[i][0], arr[i][1], 7 * S * bprog, 0, Math.PI * 2);
          ctx.fillStyle = U.bg1; ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 2.6 * S; ctx.stroke();
        }
      };
      loop(bp2, U.rgba(U.accent2, 0.85));
      loop(bp, U.rgba(U.accent, 0.95));
    }

    else if (kind === 'quadrant') {
      ctx.strokeStyle = U.rgba(ink, 0.2);
      ctx.lineWidth = 1.6 * S;
      ctx.beginPath();
      ctx.moveTo(cx, py); ctx.lineTo(cx, py + plotH);
      ctx.moveTo(px, cy + 10 * S); ctx.lineTo(px + plotW, cy + 10 * S);
      ctx.stroke();
      for (i = 0; i < n * 2; i++) {
        var qx = px + U.rng(i * 3 + 4) * plotW;
        var qy = py + U.rng(i * 5 + 8) * plotH;
        var qk = e.outBack(U.clamp((t * sp - i * 0.04) / 0.7, 0, 1));
        ctx.beginPath();
        ctx.arc(qx, qy, 9 * S * qk, 0, Math.PI * 2);
        ctx.fillStyle = qx > cx ? (qy > cy ? U.accent : U.accent2) : (qy > cy ? U.mix(U.accent, U.accent2, 0.5) : U.rgba(ink, 0.5));
        ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
      }
    }

    else if (kind === 'bullet') {
      for (i = 0; i < n; i++) {
        var by2 = py + (i + 0.5) * (plotH / n);
        var blw = plotW * 0.82 * k;
        var bk2 = e.outCubic(U.clamp((t * sp - i * 0.08) / 0.7, 0, 1));
        ctx.fillStyle = U.rgba(ink, 0.1);
        U.rr(ctx, px, by2 - 13 * S, blw, 26 * S, 6 * S); ctx.fill();
        ctx.fillStyle = U.rgba(U.accent, 0.92);
        U.rr(ctx, px, by2 - 13 * S, blw * data[i] * bk2, 26 * S, 6 * S); ctx.fill();
        var tgt = px + blw * d2[i];
        ctx.strokeStyle = U.accent2; ctx.lineWidth = 3.4 * S;
        ctx.beginPath(); ctx.moveTo(tgt, by2 - 19 * S); ctx.lineTo(tgt, by2 + 19 * S); ctx.stroke();
      }
    }

    else if (kind === 'rings') {
      var ringN = Math.min(n, 4);
      for (var rn = 0; rn < ringN; rn++) {
        var rr5 = base * (0.22 + rn * 0.16);
        ctx.beginPath();
        ctx.arc(cx, cy, rr5 * k, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(ink, 0.12);
        ctx.lineWidth = 12 * S;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, rr5 * k, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * data[rn] * e.outCubic(U.clamp((t * sp - rn * 0.14) / 0.9, 0, 1)));
        ctx.strokeStyle = rn % 2 ? U.accent2 : U.accent;
        ctx.lineWidth = 12 * S;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    else if (kind === 'timeline-m') {
      var tlY = cy + 20 * S;
      ctx.strokeStyle = U.rgba(ink, 0.35);
      ctx.lineWidth = 2.6 * S;
      ctx.beginPath();
      ctx.moveTo(px, tlY);
      ctx.lineTo(px + plotW * e.outCubic(U.clamp(t * sp / 1.4, 0, 1)), tlY);
      ctx.stroke();
      for (i = 0; i < n; i++) {
        var tx3 = px + i * (plotW / (n - 1));
        var tk2 = e.outBack(U.clamp((t * sp - i * 0.1) / 0.7, 0, 1));
        var up3 = i % 2 === 0;
        ctx.globalAlpha = tk2;
        ctx.beginPath();
        ctx.arc(tx3, tlY, 8 * S * tk2, 0, Math.PI * 2);
        ctx.fillStyle = up3 ? U.accent : U.accent2;
        ctx.fill();
        ctx.fillStyle = U.rgba(ink, 0.85);
        ctx.font = U.fs(20 * S, 700);
        ctx.textAlign = 'center';
        ctx.fillText('0' + (i + 1), tx3, tlY + (up3 ? -26 * S : 40 * S));
        ctx.globalAlpha = 1;
      }
    }

    else {
      var gapD = plotW / n;
      for (i = 0; i < n; i++) {
        var dbh = plotH * data[i] * k;
        ctx.fillStyle = U.rgba(U.accent, 0.9);
        U.rr(ctx, px + i * gapD + gapD * 0.2, py + plotH - dbh, gapD * 0.6, dbh, 5 * S);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }

  MF.forge({
    cat: '数据图表', type: 'block', dur: 6, poster: 0.75,
    params: CHART_PARAMS, draw: chartDraw,
    ids: [
      { id: 'ch-bar', name: '柱状生长', tags: ['柱状', '基础'], desc: '柱子依次向上生长的经典柱状图，最通用的数据呈现。', cfg: { kind: 'bar' } },
      { id: 'ch-stacked', name: '堆叠柱', tags: ['堆叠', '构成'], desc: '双色堆叠展示构成比例，适合拆解与占比分析。', cfg: { kind: 'stacked' } },
      { id: 'ch-line', name: '折线绘制', tags: ['折线', '趋势'], desc: '折线随进度自左向右绘制并打点，趋势一目了然。', cfg: { kind: 'line' } },
      { id: 'ch-area', name: '面积填充', tags: ['面积', '趋势'], desc: '折线下方渐变填充并逐步展开，适合强调累计规模。', cfg: { kind: 'area' } },
      { id: 'ch-dual', name: '双线对比', tags: ['对比', '双线'], desc: '两条折线同时绘制，方便做同比与双指标对比。', cfg: { kind: 'dual' } },
      { id: 'ch-spark', name: '迷你折线', tags: ['迷你', '轻量'], desc: '不带坐标的迷你折线，适合放在数据卡里做趋势提示。', cfg: { kind: 'spark', size: 300, count: 14 } },
      { id: 'ch-pie', name: '饼图展开', tags: ['饼图', '占比'], desc: '扇形按数据占比依次展开，经典占比表达。', cfg: { kind: 'pie' } },
      { id: 'ch-donut', name: '环形图', tags: ['环形', '占比'], desc: '中间留空的环形图，中心可放核心数字，更现代。', cfg: { kind: 'donut' } },
      { id: 'ch-radar', name: '雷达图', tags: ['雷达', '多维'], desc: '多维度能力的雷达图脉动展示，适合能力评估与多维对比。', cfg: { kind: 'radar' } },
      { id: 'ch-gauge', name: '仪表盘', tags: ['仪表', '指标'], desc: '仪表指针在区间内摆动，适合展示完成度与健康度。', cfg: { kind: 'gauge' } },
      { id: 'ch-scatter', name: '散点图', tags: ['散点', '分布'], desc: '散点散布并依次弹入，适合展示相关性与分布。', cfg: { kind: 'scatter' } },
      { id: 'ch-bubble', name: '气泡图', tags: ['气泡', '权重'], desc: '用气泡大小表达第三维数据，信息密度高。', cfg: { kind: 'bubble' } },
      { id: 'ch-heat', name: '热力图', tags: ['热力', '矩阵'], desc: '颜色深浅表达数值强度的热力矩阵，一眼看出聚集。', cfg: { kind: 'heatmap' } },
      { id: 'ch-grid-heat', name: '格子热力', tags: ['格子', '看板'], desc: '方格热力图带错落入场，适合日历与活跃度看板。', cfg: { kind: 'grid-heat', count: 16 } },
      { id: 'ch-funnel', name: '漏斗图', tags: ['漏斗', '转化'], desc: '逐层收窄的漏斗，直观表达转化流失。', cfg: { kind: 'funnel' } },
      { id: 'ch-waterfall', name: '瀑布图', tags: ['瀑布', '增减'], desc: '展示逐项增减累积的瀑布图，财务与归因分析常用。', cfg: { kind: 'waterfall', count: 11 } },
      { id: 'ch-candle', name: 'K 线图', tags: ['K线', '行情'], desc: '蜡烛图带上下影线，金融行情的标准表达。', cfg: { kind: 'candle', count: 14 } },
      { id: 'ch-treemap', name: '矩形树图', tags: ['树图', '占比'], desc: '用矩形面积表达占比的树图，紧凑且信息量大。', cfg: { kind: 'treemap', count: 12 } },
      { id: 'ch-radial', name: '径向柱', tags: ['径向', '放射'], desc: '柱状图沿圆周放射排布，构成感更强。', cfg: { kind: 'radial', count: 14 } },
      { id: 'ch-bump', name: '排名变化', tags: ['排名', '变化'], desc: '双线交叉展示排名升降，适合竞争格局分析。', cfg: { kind: 'bump', count: 8 } },
      { id: 'ch-quadrant', name: '四象限', tags: ['象限', '定位'], desc: '四象限散点用于战略定位与优先级排布。', cfg: { kind: 'quadrant' } },
      { id: 'ch-bullet', name: '子弹图', tags: ['子弹', '达成'], desc: '横向子弹图带目标线，适合展示目标达成情况。', cfg: { kind: 'bullet', count: 6 } },
      { id: 'ch-rings', name: '进度环组', tags: ['环组', '多维'], desc: '多层进度环同时推进，适合多维完成度总览。', cfg: { kind: 'rings', count: 4, size: 340 } },
      { id: 'ch-timeline', name: '时间序列', tags: ['时间线', '节点'], desc: '节点沿时间轴依次落位并标注序号，适合流程与阶段。', cfg: { kind: 'timeline-m', count: 7 } }
    ]
  });
})();

/* ════════ assets/js/effects-11.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 11
   原语：界面组件（用界面语言做演示）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var UI_PARAMS = [
    P('kind', '组件类型', 'notification', sel('notification', [
      ['notification', '通知横幅'], ['card-stack', '卡片堆叠'], ['profile', '资料卡'], ['toggle', '开关切换'],
      ['search', '搜索框'], ['menu', '菜单展开'], ['chat', '消息气泡'], ['modal', '弹窗对话框'],
      ['spinner', '加载环'], ['skeleton', '骨架屏'], ['input', '输入框'], ['tabs', '标签切换'],
      ['rating', '星级评分'], ['tooltip', '浮动提示'], ['carousel', '轮播卡片'], ['calendar', '日历'],
      ['tasklist', '任务清单'], ['statcard', '数据卡片'], ['badge', '徽章数字'], ['avatars', '头像堆叠'],
      ['dropdown', '下拉选择'], ['slider', '滑块调节'], ['settings', '设置列表'], ['battery', '电量充能'],
      ['waveform', '声波跳动'], ['keypress', '按键反馈']
    ])),
    P('text', '主文案', 'Jaykou', txt('Jaykou')),
    P('sub', '副文案', '动效已就绪', txt('动效已就绪')),
    P('size', '基准尺寸', 420.0, rng(420.0, 160.0, 936.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.3, 3, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function uiDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var k = e.outBack(U.clamp(t * sp / 1, 0, 1));
    var k2 = e.outCubic(U.clamp(t * sp / 1.2, 0, 1));
    var ink = U.ink;
    var label = String(p.text || '');
    var sub = String(p.sub || '');

    var panel = function (w, h, rx) {
      var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      g.addColorStop(0, U.mix(U.bg2, U.accent, 0.24));
      g.addColorStop(1, U.mix(U.bg1, U.accent2, 0.16));
      ctx.save();
      ctx.shadowColor = U.rgba('#000000', 0.45);
      ctx.shadowBlur = 42 * S;
      ctx.shadowOffsetY = 16 * S;
      U.rr(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
      U.rr(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.strokeStyle = U.rgba(ink, 0.14);
      ctx.lineWidth = 1.6 * S;
      ctx.stroke();
    };

    ctx.save();
    ctx.translate(cx, cy);

    if (kind === 'notification') {
      var nw = Math.min(base * 2.2, W * 0.72), nh = 132 * S;
      ctx.save();
      ctx.globalAlpha = U.clamp(t * sp * 2, 0, 1);
      ctx.translate(0, (1 - k2) * -70 * S);
      panel(nw, nh, 22 * S);
      ctx.beginPath();
      ctx.arc(-nw / 2 + 54 * S, 0, 24 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.accent, 0.92);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(26 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.bg1;
      ctx.fillText('✓', -nw / 2 + 54 * S, 2 * S);
      ctx.textAlign = 'left';
      ctx.font = U.fs(30 * S, 800);
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 18), -nw / 2 + 96 * S, -18 * S);
      ctx.font = U.fs(23 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 24), -nw / 2 + 96 * S, 22 * S);
      ctx.restore();
    }

    else if (kind === 'card-stack') {
      var cw2 = Math.min(base * 1.5, W * 0.5), ch2 = cw2 * 0.62;
      for (var si = 3; si >= 0; si--) {
        var sk = e.outCubic(U.clamp((t * sp - (3 - si) * 0.15) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = 0.35 + sk * 0.65;
        ctx.translate(si * 22 * S * sk, -si * 26 * S * sk);
        ctx.rotate(si * 0.028 * sk);
        panel(cw2, ch2, 20 * S);
        ctx.restore();
      }
      ctx.font = U.fs(40 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.letterSpacing = '2px';
      ctx.fillText(label.slice(0, 12), 0, -8 * S);
      ctx.letterSpacing = '0px';
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 22), 0, 34 * S);
    }

    else if (kind === 'profile') {
      /* 入场弹升 + 悬浮呼吸 + 三项数据计数 */
      var pk = e.outBack(U.clamp((t * sp - 0.05) / 0.9, 0, 1));
      var pk2 = e.outCubic(U.clamp((t * sp - 0.55) / 0.9, 0, 1));
      var pw = Math.min(base * 1.5, W * 0.5), ph = pw * 0.74;
      ctx.save();
      ctx.translate(0, (1 - pk) * 52 * S + Math.sin(t * sp * 1.5) * 5 * S);
      ctx.globalAlpha = U.clamp(pk * 1.6, 0, 1);
      if (pk < 1) { var psc = 0.9 + 0.1 * pk; ctx.scale(psc, psc); }
      panel(pw, ph, 26 * S);
      ctx.beginPath();
      ctx.arc(0, -ph / 2 + 62 * S, 42 * S, 0, Math.PI * 2);
      var avg = ctx.createLinearGradient(-42 * S, -104 * S, 42 * S, 20 * S);
      avg.addColorStop(0, U.accent);
      avg.addColorStop(1, U.accent2);
      ctx.fillStyle = avg;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(40 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label.charAt(0).toUpperCase() || 'M', 0, -ph / 2 + 64 * S);
      ctx.font = U.fs(32 * S, 800);
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), 0, -ph / 2 + 138 * S);
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 26), 0, -ph / 2 + 172 * S);
      var statW = (pw - 60 * S) / 3;
      for (var st = 0; st < 3; st++) {
        var stx = -pw / 2 + 30 * S + st * statW;
        var sv = [128, 4.9, 36][st];
        var shown = st === 1 ? (sv * pk2).toFixed(1) : String(Math.round(sv * pk2));
        ctx.font = U.fs(26 * S, 800);
        ctx.fillStyle = U.accent;
        ctx.fillText(shown, stx + statW / 2, ph / 2 - 62 * S);
        ctx.font = U.fs(17 * S, 500);
        ctx.fillStyle = U.rgba(ink, 0.5);
        ctx.fillText(['作品', '评分', '粉丝'][st], stx + statW / 2, ph / 2 - 34 * S);
      }
      ctx.restore();
    }

    else if (kind === 'toggle') {
      var tw = base * 1.1, th = tw * 0.52;
      var on = k2 > 0.5;
      var knobPos = (on ? 1 : 0) * (tw / 2 - th / 2) * k2;
      var trackG = ctx.createLinearGradient(-tw / 2, 0, tw / 2, 0);
      if (on) { trackG.addColorStop(0, U.accent); trackG.addColorStop(1, U.accent2); }
      else { trackG.addColorStop(0, U.rgba(ink, 0.2)); trackG.addColorStop(1, U.rgba(ink, 0.2)); }
      U.rr(ctx, -tw / 2, -th / 2, tw, th, th / 2);
      ctx.fillStyle = trackG;
      if (on && p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 28 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(-tw / 2 + th / 2 + knobPos, 0, th * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.75);
      ctx.fillText(label.slice(0, 14), 0, th / 2 + 54 * S);
      ctx.fillStyle = on ? U.accent : U.rgba(ink, 0.4);
      ctx.fillText(on ? 'ON' : 'OFF', 0, -th / 2 - 40 * S);
    }

    else if (kind === 'search') {
      var sw2 = Math.min(base * 2, W * 0.7), sh = 92 * S;
      panel(sw2, sh, sh / 2);
      ctx.beginPath();
      ctx.arc(-sw2 / 2 + 52 * S, -4 * S, 17 * S, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(ink, 0.6);
      ctx.lineWidth = 4 * S;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-sw2 / 2 + 64 * S, 9 * S);
      ctx.lineTo(-sw2 / 2 + 76 * S, 22 * S);
      ctx.stroke();
      var typed = label.slice(0, Math.floor(U.clamp(t * sp * 7, 0, label.length)));
      ctx.font = U.fs(30 * S, 500);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = typed ? ink : U.rgba(ink, 0.35);
      ctx.fillText(typed || 'Search…', -sw2 / 2 + 96 * S, -2 * S);
      if (Math.floor(t * sp * 2) % 2 === 0 && typed.length < label.length) {
        ctx.fillStyle = U.accent;
        ctx.fillRect(-sw2 / 2 + 98 * S + ctx.measureText(typed).width, -22 * S, 3 * S, 42 * S);
      }
      var sug = U.clamp((t * sp - 0.9) / 0.6, 0, 1);
      if (sug > 0) {
        ctx.save();
        ctx.globalAlpha = sug;
        ctx.translate(0, sh / 2 + 24 * S);
        panel(sw2, 150 * S, 20 * S);
        for (var qi = 0; qi < 3; qi++) {
          ctx.fillStyle = U.rgba(ink, 0.7 - qi * 0.16);
          ctx.font = U.fs(25 * S, 500);
          ctx.textAlign = 'left';
          ctx.fillText(sub.slice(0, 20) + ' ' + (qi + 1), -sw2 / 2 + 34 * S, -40 * S + qi * 44 * S);
        }
        ctx.restore();
      }
    }

    else if (kind === 'menu') {
      var mw = 300 * S, itemH = 62 * S, items = 5;
      ctx.save();
      ctx.translate(-base * 0.45, -base * 0.2);
      panel(mw, itemH * items + 40 * S, 20 * S);
      for (var mi = 0; mi < items; mi++) {
        var mk = e.outCubic(U.clamp((t * sp - mi * 0.09) / 0.5, 0, 1));
        ctx.globalAlpha = mk;
        ctx.save();
        ctx.translate(-mk * 40 * S, 0);
        ctx.beginPath();
        ctx.arc(-mw / 2 + 40 * S, -((items - 1) * itemH) / 2 + mi * itemH + 6 * S, 12 * S, 0, Math.PI * 2);
        ctx.fillStyle = mi === 1 ? U.accent : U.rgba(ink, 0.35);
        ctx.fill();
        ctx.fillStyle = mi === 1 ? ink : U.rgba(ink, 0.68);
        ctx.font = U.fs(25 * S, mi === 1 ? 800 : 500);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(label.slice(0, 8) + ' ' + (mi + 1), -mw / 2 + 66 * S, -((items - 1) * itemH) / 2 + mi * itemH + 6 * S);
        ctx.restore();
      }
      ctx.restore();
    }

    else if (kind === 'chat') {
      var bw2 = Math.min(base * 1.9, W * 0.62);
      var bubbles = [
        { t: sub.slice(0, 20) || '你好，在吗？', me: false, w: 0.62 },
        { t: label.slice(0, 20) || '在的，请讲', me: true, w: 0.5 },
        { t: '方案我看过了', me: false, w: 0.55 }
      ];
      var totalH = bubbles.length * 86 * S;
      for (var bi = 0; bi < bubbles.length; bi++) {
        var bk2 = e.outBack(U.clamp((t * sp - bi * 0.35) / 0.6, 0, 1));
        if (bk2 <= 0) continue;
        var byy = -totalH / 2 + bi * 86 * S;
        ctx.globalAlpha = U.clamp(bk2, 0, 1);
        var bbw = bw2 * bubbles[bi].w * bk2;
        var bbx = bubbles[bi].me ? bw2 / 2 - bbw : -bw2 / 2;
        U.rr(ctx, bbx, byy, bbw, 64 * S, 16 * S);
        ctx.fillStyle = bubbles[bi].me ? U.rgba(U.accent, 0.92) : U.rgba(U.mix(U.bg2, ink, 0.16), 0.98);
        ctx.fill();
        ctx.font = U.fs(25 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = bubbles[bi].me ? U.bg1 : ink;
        ctx.globalAlpha = bk2;
        ctx.fillText(bubbles[bi].t, bbx + 22 * S, byy + 34 * S);
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'modal') {
      var dw = Math.min(base * 1.9, W * 0.66), dh = dw * 0.62;
      ctx.save();
      ctx.globalAlpha = 0.6 * k2;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-W, -H, W * 2, H * 2);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = U.clamp(k2 * 1.4, 0, 1);
      var pop = 0.86 + 0.14 * k;
      ctx.scale(pop, pop);
      panel(dw, dh, 26 * S);
      ctx.font = U.fs(42 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), 0, -dh / 2 + 70 * S);
      ctx.font = U.fs(24 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 26), 0, -dh / 2 + 124 * S);
      var btnW = dw * 0.36, btnH = 70 * S;
      U.rr(ctx, -dw / 2 + dw * 0.06, dh / 2 - 106 * S, btnW, btnH, 14 * S);
      ctx.fillStyle = U.rgba(ink, 0.12);
      ctx.fill();
      ctx.fillStyle = U.rgba(ink, 0.8);
      ctx.font = U.fs(26 * S, 700);
      ctx.fillText('取消', -dw / 2 + dw * 0.06 + btnW / 2, dh / 2 - 106 * S + btnH / 2);
      U.rr(ctx, dw / 2 - dw * 0.06 - btnW, dh / 2 - 106 * S, btnW, btnH, 14 * S);
      var btng = ctx.createLinearGradient(dw / 2 - btnW * 2, 0, dw / 2, 0);
      btng.addColorStop(0, U.accent); btng.addColorStop(1, U.accent2);
      ctx.fillStyle = btng;
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('确认', dw / 2 - dw * 0.06 - btnW / 2, dh / 2 - 106 * S + btnH / 2);
      ctx.restore();
    }

    else if (kind === 'spinner') {
      var R = base * 0.4;
      var ang = t * sp * 3.4;
      ctx.strokeStyle = U.rgba(ink, 0.12);
      ctx.lineWidth = 16 * S;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
      var sg2 = ctx.createLinearGradient(-R, -R, R, R);
      sg2.addColorStop(0, U.accent);
      sg2.addColorStop(1, U.accent2);
      ctx.strokeStyle = sg2;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.beginPath(); ctx.arc(0, 0, R, ang, ang + Math.PI * 1.25); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(30 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(sub.slice(0, 16), 0, R + 60 * S);
    }

    else if (kind === 'skeleton') {
      var kw = Math.min(base * 1.9, W * 0.6);
      var rows = 3;
      for (var ri = 0; ri < rows; ri++) {
        var ry2 = -((rows - 1) * 56 * S) / 2 + ri * 56 * S;
        var rw = kw * (1 - (ri % 2) * 0.32);
        var shine = ((t * sp * 0.7 + ri * 0.2) % 1);
        var sg3 = ctx.createLinearGradient(-rw / 2, 0, rw / 2, 0);
        sg3.addColorStop(U.clamp(shine - 0.25, 0, 1), U.rgba(ink, 0.09));
        sg3.addColorStop(U.clamp(shine, 0, 1), U.rgba(ink, 0.2));
        sg3.addColorStop(U.clamp(shine + 0.25, 0, 1), U.rgba(ink, 0.09));
        U.rr(ctx, -rw / 2, ry2, rw, 26 * S, 13 * S);
        ctx.fillStyle = sg3;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(-kw / 2 + 38 * S, 0, 30 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(ink, 0.14);
      ctx.fill();
    }

    else if (kind === 'input') {
      var iw = Math.min(base * 2, W * 0.7), ih = 96 * S;
      panel(iw, ih, 16 * S);
      var focus = U.clamp((t * sp - 0.5) / 0.4, 0, 1);
      U.rr(ctx, -iw / 2, -ih / 2, iw, ih, 16 * S);
      ctx.strokeStyle = U.rgba(U.accent, focus);
      ctx.lineWidth = 3 * S * focus;
      if (p.glow > 0.02 && focus > 0) { ctx.shadowColor = U.rgba(U.accent, p.glow * focus); ctx.shadowBlur = 20 * S * p.glow; }
      ctx.stroke();
      ctx.shadowBlur = 0;
      var iv = label.slice(0, Math.floor(U.clamp((t * sp - 0.9) * 5, 0, label.length)));
      ctx.font = U.fs(30 * S, 500);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(iv, -iw / 2 + 28 * S, 0);
      if (iv.length && focus > 0.5 && Math.floor(t * sp * 2) % 2 === 0) {
        ctx.fillStyle = U.accent;
        ctx.fillRect(-iw / 2 + 30 * S + ctx.measureText(iv).width, -22 * S, 3 * S, 44 * S);
      }
      ctx.font = U.fs(21 * S, 500);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(ink, 0.45);
      ctx.fillText(sub.slice(0, 20), -iw / 2 + 28 * S, ih / 2 + 38 * S);
    }

    else if (kind === 'tabs') {
      var tabs = ['概览', '明细', '设置'];
      var ttw = base * 0.6, tth = 72 * S;
      var activeIdx = Math.floor((t * sp * 0.6) % tabs.length);
      var trackW = ttw * tabs.length;
      ctx.save();
      ctx.translate(-trackW / 2, 0);
      U.rr(ctx, 0, -tth / 2, trackW, tth, tth / 2);
      ctx.fillStyle = U.rgba(ink, 0.09);
      ctx.fill();
      var indicatorX = activeIdx * ttw;
      U.rr(ctx, indicatorX + 6 * S, -tth / 2 + 6 * S, ttw - 12 * S, tth - 12 * S, (tth - 12 * S) / 2);
      var tg = ctx.createLinearGradient(indicatorX, 0, indicatorX + ttw, 0);
      tg.addColorStop(0, U.accent); tg.addColorStop(1, U.accent2);
      ctx.fillStyle = tg;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var ti2 = 0; ti2 < tabs.length; ti2++) {
        ctx.fillStyle = ti2 === activeIdx ? U.bg1 : U.rgba(ink, 0.6);
        ctx.fillText(tabs[ti2], ti2 * ttw + ttw / 2, 0);
      }
      ctx.restore();
    }

    else if (kind === 'rating') {
      var stars = 5, activeStars = Math.floor(U.clamp(t * sp * 1.1, 0, stars)) + 1;
      var starSize = base * 0.24;
      for (var sti = 0; sti < stars; sti++) {
        var sx4 = (sti - (stars - 1) / 2) * starSize * 1.25;
        var litFlag = sti < Math.min(activeStars, stars);
        var pop2 = litFlag ? e.outBack(U.clamp((t * sp - sti * 0.18) / 0.5, 0, 1)) : 1;
        ctx.save();
        ctx.translate(sx4, 0);
        ctx.scale(pop2, pop2);
        U.star(ctx, 0, 0, 5, starSize * 0.52, starSize * 0.24, -Math.PI / 2);
        if (litFlag) {
          var stg = ctx.createLinearGradient(-starSize / 2, -starSize / 2, starSize / 2, starSize / 2);
          stg.addColorStop(0, U.accent); stg.addColorStop(1, U.accent2);
          ctx.fillStyle = stg;
          if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = U.rgba(ink, 0.16);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.font = U.fs(30 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(sub.slice(0, 16), 0, starSize * 1.4);
    }

    else if (kind === 'tooltip') {
      var up = e.outBack(U.clamp(t * sp / 0.8, 0, 1));
      var tkw = 320 * S, tkh = 84 * S;
      ctx.save();
      ctx.globalAlpha = U.clamp(up, 0, 1);
      ctx.translate(0, -base * 0.34 - (1 - up) * 30 * S);
      panel(tkw, tkh, 16 * S);
      ctx.beginPath();
      ctx.moveTo(-14 * S, tkh / 2);
      ctx.lineTo(14 * S, tkh / 2);
      ctx.lineTo(0, tkh / 2 + 18 * S);
      ctx.closePath();
      ctx.fillStyle = U.mix(U.bg2, U.accent, 0.2);
      ctx.fill();
      ctx.font = U.fs(27 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), 0, -6 * S);
      ctx.font = U.fs(20 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 22), 0, 24 * S);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(0, base * 0.26, 30 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.accent, 0.9);
      ctx.fill();
      ctx.font = U.fs(24 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.bg1;
      ctx.fillText('?', 0, base * 0.27);
    }

    else if (kind === 'carousel') {
      var cards = 3;
      for (var ci = 0; ci < cards; ci++) {
        var cd = ci - 1;
        var cprog = (t * sp * 0.3) % cards;
        var xoff = cd - cprog;
        xoff = ((xoff + cards * 1.5) % cards) - 1.5;
        var cw3 = base * 1.1, ch3 = cw3 * 0.72;
        var scaleC = 1 - Math.abs(xoff) * 0.18;
        ctx.save();
        ctx.globalAlpha = 0.35 + (1 - Math.abs(xoff) / 1.6) * 0.65;
        ctx.translate(xoff * cw3 * 0.78, 0);
        ctx.scale(scaleC, scaleC);
        panel(cw3, ch3, 20 * S);
        ctx.font = U.fs(34 * S, 900);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = ink;
        ctx.fillText(label.slice(0, 10), 0, -12 * S);
        ctx.font = U.fs(21 * S, 500);
        ctx.fillStyle = U.rgba(ink, 0.55);
        ctx.fillText(sub.slice(0, 16), 0, 26 * S);
        ctx.restore();
      }
    }

    else if (kind === 'calendar') {
      var cols = 7, rows2 = 5;
      var cellW = base * 0.19, cellH = cellW * 0.88;
      var gridW = cols * cellW, gridH = rows2 * cellH;
      ctx.save();
      ctx.translate(-gridW / 2, -gridH / 2 + 20 * S);
      var today = Math.floor(U.clamp(t * sp * 1.2, 0, 34));
      for (var gr = 0; gr < rows2; gr++) {
        for (var gc = 0; gc < cols; gc++) {
          var idx2 = gr * cols + gc;
          var ck3 = e.outCubic(U.clamp((t * sp - idx2 * 0.015) / 0.6, 0, 1));
          var isToday = idx2 === today;
          ctx.globalAlpha = ck3 * (idx2 > today ? 0.35 : 1);
          if (isToday) {
            var cg = ctx.createLinearGradient(gc * cellW, gr * cellH, (gc + 1) * cellW, (gr + 1) * cellH);
            cg.addColorStop(0, U.accent); cg.addColorStop(1, U.accent2);
            ctx.fillStyle = cg;
            if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 18 * S * p.glow; }
            U.rr(ctx, gc * cellW + 4 * S, gr * cellH + 4 * S, cellW - 8 * S, cellH - 8 * S, 10 * S);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.font = U.fs(20 * S, isToday ? 800 : 500);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = isToday ? U.bg1 : U.rgba(ink, 0.72);
          ctx.fillText(String(idx2 + 1), gc * cellW + cellW / 2, gr * cellH + cellH / 2);
        }
      }
      ctx.restore();
      ctx.font = U.fs(26 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.8);
      ctx.fillText(label.slice(0, 10), 0, -gridH / 2 - 16 * S);
    }

    else if (kind === 'tasklist') {
      var items2 = ['设计稿评审', '动效联调', '导出交付'];
      var lw2 = Math.min(base * 1.8, W * 0.6);
      for (var li2 = 0; li2 < items2.length; li2++) {
        var ly4 = -((items2.length - 1) * 84 * S) / 2 + li2 * 84 * S;
        var lk = e.outCubic(U.clamp((t * sp - li2 * 0.25) / 0.55, 0, 1));
        ctx.globalAlpha = lk;
        ctx.save();
        ctx.translate((1 - lk) * -50 * S, 0);
        var done = t * sp > li2 * 0.45 + 0.85;
        U.rr(ctx, -lw2 / 2, ly4 - 30 * S, lw2, 60 * S, 14 * S);
        ctx.fillStyle = done ? U.rgba(U.accent, 0.16) : U.rgba(ink, 0.07);
        ctx.fill();
        U.rr(ctx, -lw2 / 2 + 20 * S, ly4 - 15 * S, 30 * S, 30 * S, 8 * S);
        ctx.strokeStyle = done ? U.accent : U.rgba(ink, 0.35);
        ctx.lineWidth = 2.6 * S;
        ctx.stroke();
        if (done) {
          ctx.beginPath();
          ctx.moveTo(-lw2 / 2 + 27 * S, ly4);
          ctx.lineTo(-lw2 / 2 + 34 * S, ly4 + 8 * S);
          ctx.lineTo(-lw2 / 2 + 46 * S, ly4 - 9 * S);
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = 3.2 * S;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.stroke();
        }
        ctx.font = U.fs(26 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = done ? U.rgba(ink, 0.45) : ink;
        ctx.fillText(items2[li2], -lw2 / 2 + 70 * S, ly4);
        if (done) {
          var tw3 = ctx.measureText(items2[li2]).width;
          ctx.strokeStyle = U.rgba(ink, 0.4);
          ctx.lineWidth = 2 * S;
          ctx.beginPath();
          ctx.moveTo(-lw2 / 2 + 70 * S, ly4);
          ctx.lineTo(-lw2 / 2 + 70 * S + tw3, ly4);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'statcard') {
      var cards2 = [['128K', '曝光'], ['4.9', '评分'], ['36%', '增长']];
      var scw = Math.min(base * 1.1, W * 0.24), sch = scw * 0.92;
      for (var sc = 0; sc < 3; sc++) {
        var scx = (sc - 1) * (scw * 1.12);
        var sck = e.outBack(U.clamp((t * sp - sc * 0.15) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp(sck, 0, 1);
        ctx.translate(scx, (1 - sck) * 40 * S);
        panel(scw, sch, 20 * S);
        ctx.font = U.fs(50 * S, 900);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var scg = ctx.createLinearGradient(-scw / 4, 0, scw / 4, 0);
        scg.addColorStop(0, U.accent); scg.addColorStop(1, U.accent2);
        ctx.fillStyle = scg;
        ctx.fillText(cards2[sc][0], 0, -sch * 0.12);
        ctx.font = U.fs(22 * S, 600);
        ctx.fillStyle = U.rgba(ink, 0.6);
        ctx.fillText(cards2[sc][1], 0, sch * 0.2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'badge') {
      ctx.beginPath();
      ctx.arc(0, 0, base * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(ink, 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, base * 0.32, 0, Math.PI * 2);
      var bdg = ctx.createLinearGradient(-base * 0.3, -base * 0.3, base * 0.3, base * 0.3);
      bdg.addColorStop(0, U.accent); bdg.addColorStop(1, U.accent2);
      ctx.fillStyle = bdg;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      var num = Math.floor(U.clamp(t * sp / 1.6, 0, 1) * 99) + 1;
      ctx.font = U.fs(base * 0.28, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(String(num), 0, 2 * S);
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 14), 0, base * 0.4 + 40 * S);
      var ang2 = t * sp * 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, base * 0.46, ang2, ang2 + Math.PI * 0.6);
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
      ctx.stroke();
    }

    else if (kind === 'avatars') {
      var avN = 5;
      for (var av = avN - 1; av >= 0; av--) {
        var avk = e.outBack(U.clamp((t * sp - av * 0.11) / 0.6, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp(avk, 0, 1);
        ctx.translate(-av * 44 * S, 0);
        ctx.beginPath();
        ctx.arc(0, 0, base * 0.22, 0, Math.PI * 2);
        var ag2 = ctx.createLinearGradient(-base * 0.2, -base * 0.2, base * 0.2, base * 0.2);
        ag2.addColorStop(0, U.mix(U.accent, U.bg1, av * 0.16));
        ag2.addColorStop(1, U.mix(U.accent2, U.bg1, av * 0.16));
        ctx.fillStyle = ag2;
        ctx.strokeStyle = U.rgba(U.bg1, 0.9);
        ctx.lineWidth = 4 * S;
        ctx.fill();
        ctx.stroke();
        ctx.font = U.fs(base * 0.15, 800);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('ABCDE'.charAt(av), 0, 1 * S);
        ctx.restore();
      }
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(sub.slice(0, 18), -avN * 22 * S, base * 0.4 + 34 * S);
    }

    else if (kind === 'dropdown') {
      var ddw = Math.min(base * 1.5, W * 0.5), ddh = 76 * S;
      var open = U.clamp((t * sp - 0.7) / 0.5, 0, 1);
      panel(ddw, ddh, 14 * S);
      ctx.font = U.fs(27 * S, 600);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), -ddw / 2 + 24 * S, 0);
      ctx.save();
      ctx.translate(ddw / 2 - 34 * S, 0);
      ctx.rotate(open * Math.PI);
      ctx.strokeStyle = U.rgba(ink, 0.7);
      ctx.lineWidth = 3 * S;
      ctx.beginPath();
      ctx.moveTo(-10 * S, -5 * S); ctx.lineTo(0, 6 * S); ctx.lineTo(10 * S, -5 * S);
      ctx.stroke();
      ctx.restore();
      if (open > 0.01) {
        var listH = 3 * 56 * S + 20 * S;
        ctx.save();
        ctx.globalAlpha = open;
        ctx.translate(0, ddh / 2 + 12 * S + (1 - open) * -20 * S);
        panel(ddw, listH, 14 * S);
        for (var di = 0; di < 3; di++) {
          ctx.fillStyle = di === 1 ? U.rgba(U.accent, 0.9) : U.rgba(ink, 0.7);
          ctx.font = U.fs(24 * S, di === 1 ? 800 : 500);
          ctx.textAlign = 'left';
          ctx.fillText(sub.slice(0, 12) + ' ' + (di + 1), -ddw / 2 + 24 * S, -listH / 2 + 28 * S + di * 56 * S);
        }
        ctx.restore();
      }
    }

    else if (kind === 'slider') {
      var slw = Math.min(base * 2, W * 0.68);
      var val3 = 0.5 + 0.5 * Math.sin(t * sp * 0.9);
      var knobX = -slw / 2 + slw * val3;
      U.rr(ctx, -slw / 2, -10 * S, slw, 20 * S, 10 * S);
      ctx.fillStyle = U.rgba(ink, 0.12);
      ctx.fill();
      U.rr(ctx, -slw / 2, -10 * S, slw * val3, 20 * S, 10 * S);
      var slg = ctx.createLinearGradient(-slw / 2, 0, slw / 2, 0);
      slg.addColorStop(0, U.accent); slg.addColorStop(1, U.accent2);
      ctx.fillStyle = slg;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(knobX, 0, 28 * S, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(30 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.accent;
      ctx.fillText(Math.round(val3 * 100) + '%', 0, -70 * S);
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(label.slice(0, 16), 0, 76 * S);
    }

    else if (kind === 'settings') {
      var rows3 = ['自动播放', '高清导出', '云端同步'];
      var sw3 = Math.min(base * 1.9, W * 0.62);
      for (var ri3 = 0; ri3 < rows3.length; ri3++) {
        var ry3 = -((rows3.length - 1) * 78 * S) / 2 + ri3 * 78 * S;
        var rk2 = e.outCubic(U.clamp((t * sp - ri3 * 0.16) / 0.55, 0, 1));
        ctx.globalAlpha = rk2;
        ctx.font = U.fs(27 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = ink;
        ctx.fillText(rows3[ri3], -sw3 / 2, ry3);
        var onFlag = ri3 !== 1;
        var tglW = 68 * S, tglH = 34 * S;
        var tglX = sw3 / 2 - tglW;
        U.rr(ctx, tglX, ry3 - tglH / 2, tglW, tglH, tglH / 2);
        ctx.fillStyle = onFlag ? U.rgba(U.accent, 0.9) : U.rgba(ink, 0.16);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tglX + (onFlag ? tglW - tglH / 2 : tglH / 2), ry3, tglH * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        if (ri3 < rows3.length - 1) {
          ctx.strokeStyle = U.rgba(ink, 0.08);
          ctx.lineWidth = 1.4 * S;
          ctx.beginPath();
          ctx.moveTo(-sw3 / 2, ry3 + 39 * S); ctx.lineTo(sw3 / 2, ry3 + 39 * S);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'battery') {
      var bw3 = base * 1.1, bh3 = bw3 * 0.44;
      var level = (t * sp * 0.4) % 1.4;
      level = U.clamp(level, 0, 1);
      U.rr(ctx, -bw3 / 2, -bh3 / 2, bw3, bh3, bh3 * 0.26);
      ctx.strokeStyle = U.rgba(ink, 0.45);
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      U.rr(ctx, bw3 / 2 - 4 * S, -bh3 * 0.16, 14 * S, bh3 * 0.32, 4 * S);
      ctx.fillStyle = U.rgba(ink, 0.45);
      ctx.fill();
      var pad = 9 * S;
      var fillW = (bw3 - pad * 2) * level;
      U.rr(ctx, -bw3 / 2 + pad, -bh3 / 2 + pad, fillW, bh3 - pad * 2, bh3 * 0.16);
      var bg2 = ctx.createLinearGradient(-bw3 / 2, 0, bw3 / 2, 0);
      bg2.addColorStop(0, level > 0.3 ? U.accent : '#FF3B30');
      bg2.addColorStop(1, U.accent2);
      ctx.fillStyle = bg2;
      if (p.glow > 0.02 && level < 0.99) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(28 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(level * 100) + '%', 0, bh3 / 2 + 46 * S);
    }

    else if (kind === 'waveform') {
      var bars = 28;
      var barW = base * 0.07;
      for (var bi2 = 0; bi2 < bars; bi2++) {
        var bxc = (bi2 - (bars - 1) / 2) * barW * 1.5;
        var amp = Math.abs(Math.sin(bi2 * 0.5 + t * sp * 4)) * Math.abs(Math.cos(bi2 * 0.23 - t * sp * 2.2));
        var bhh = 12 * S + amp * base * 0.5;
        var barG = ctx.createLinearGradient(0, -bhh / 2, 0, bhh / 2);
        barG.addColorStop(0, U.accent);
        barG.addColorStop(1, U.accent2);
        ctx.fillStyle = barG;
        U.rr(ctx, bxc, -bhh / 2, barW, bhh, barW / 2);
        ctx.fill();
      }
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 16), 0, base * 0.4 + 40 * S);
    }

    else if (kind === 'keypress') {
      var keys = ['⌘', 'K'];
      var kw2 = base * 0.42, kh2 = kw2 * 0.9;
      var press = 0;
      for (var ki = 0; ki < keys.length; ki++) {
        press = U.clamp((t * sp - 0.9 - ki * 0.12) / 0.18, 0, 1) * U.clamp((1 - (t * sp - 1.5 - ki * 0.12) / 0.4), 0, 1);
        var kx2 = (ki - (keys.length - 1) / 2) * (kw2 * 1.18);
        ctx.globalAlpha = 0.9;
        var kyg = ctx.createLinearGradient(0, -kh2 / 2, 0, kh2 / 2);
        kyg.addColorStop(0, U.mix(U.bg2, U.accent, press * 0.5 + 0.12));
        kyg.addColorStop(1, U.mix(U.bg1, U.accent, press * 0.35));
        U.rr(ctx, kx2 - kw2 / 2, -kh2 / 2 + press * 6 * S, kw2, kh2, 16 * S);
        ctx.fillStyle = kyg;
        ctx.fill();
        ctx.strokeStyle = U.rgba(press > 0.5 ? U.accent : ink, 0.3 + press * 0.6);
        ctx.lineWidth = 2.4 * S;
        ctx.stroke();
        ctx.font = U.fs(kw2 * 0.5, 800);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = U.rgba(ink, 0.85);
        ctx.fillText(keys[ki], kx2, press * 6 * S);
      }
      if (press > 0.5) {
        ctx.globalAlpha = (press - 0.5) * 2 * 0.6;
        var ripples = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 0.8);
        ripples.addColorStop(0, U.rgba(U.accent, 0.4));
        ripples.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ripples;
        ctx.fillRect(-W, -H, W * 2, H * 2);
      }
      ctx.globalAlpha = 1;
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center';
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 18), 0, kh2 + 50 * S);
    }

    else {
      panel(base, base * 0.6, 20 * S);
      ctx.font = U.fs(36 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 12), 0, 0);
    }

    ctx.restore();
  }

  MF.forge({
    cat: '界面组件', type: 'component', dur: 5.5, poster: 0.8,
    params: UI_PARAMS, draw: uiDraw,
    ids: [
      { id: 'ui-notification', name: '通知横幅', tags: ['通知', '反馈'], desc: '通知横幅自顶部滑入并展示勾选图标，适合操作成功反馈。', cfg: { kind: 'notification', text: '保存成功', sub: '动效已同步到工作台', size: 720} },
      { id: 'ui-card-stack', name: '卡片堆叠', tags: ['堆叠', '层次'], desc: '多层卡片依次错位展开，适合展示专辑与项目集合。', cfg: { kind: 'card-stack' } },
      { id: 'ui-profile', name: '资料卡', tags: ['资料', '人设'], desc: '头像、姓名与三项统计依次落位的资料卡，适合人物介绍。', cfg: { kind: 'profile', text: 'JAYKOU', sub: '跨境 · 动效 · 选品', size: 380 } },
      { id: 'ui-toggle', name: '开关切换', tags: ['开关', '状态'], desc: '开关从关到开并带颜色渐变，适合功能启停演示。', cfg: { kind: 'toggle', text: '自动播放' } },
      { id: 'ui-search', name: '搜索展开', tags: ['搜索', '输入'], desc: '搜索框逐字输入并下拉出建议列表，交互演示的标准件。', cfg: { kind: 'search', text: 'motion', sub: '动效模板' } },
      { id: 'ui-menu', name: '菜单展开', tags: ['菜单', '导航'], desc: '菜单项依次从左侧滑入并高亮当前项。', cfg: { kind: 'menu', text: '设置' } },
      { id: 'ui-chat', name: '消息气泡', tags: ['聊天', '对话'], desc: '多条气泡依次弹出，左右分栏呈现对话，适合访谈与客服场景。', cfg: { kind: 'chat', text: '在的，请讲', sub: '你好，在吗？', size: 720} },
      { id: 'ui-modal', name: '弹窗对话框', tags: ['弹窗', '确认'], desc: '遮罩渐暗 + 弹窗弹出，标准的确认交互演示。', cfg: { kind: 'modal', text: '确认删除？', sub: '删除后不可恢复' } },
      { id: 'ui-spinner', name: '加载环', tags: ['加载', '等待'], desc: '渐变加载环持续旋转，等待状态的通用表达。', cfg: { kind: 'spinner', sub: '正在加载' } },
      { id: 'ui-skeleton', name: '骨架屏', tags: ['骨架', '占位'], desc: '骨架条依次流光扫过，内容加载前的占位演示。', cfg: { kind: 'skeleton' } },
      { id: 'ui-input', name: '输入框聚焦', tags: ['输入', '聚焦'], desc: '输入框边框高亮并逐字输入，聚焦态演示。', cfg: { kind: 'input', text: 'Jaykou', sub: '请输入项目名称' } },
      { id: 'ui-tabs', name: '标签切换', tags: ['标签', '切换'], desc: '胶囊指示器在三档之间平滑滑动，适合分栏切换演示。', cfg: { kind: 'tabs' } },
      { id: 'ui-rating', name: '星级评分', tags: ['评分', '反馈'], desc: '星星依次弹亮到指定分值，适合评价与口碑场景。', cfg: { kind: 'rating', sub: '基于 1,284 条评价', size: 720} },
      { id: 'ui-tooltip', name: '浮动提示', tags: ['提示', '指引'], desc: '提示气泡弹入并指向问号图标，适合功能说明。', cfg: { kind: 'tooltip', text: '点击查看详情', sub: '这里有更详细的说明' } },
      { id: 'ui-carousel', name: '轮播卡片', tags: ['轮播', '循环'], desc: '三张卡片循环轮转并缩放，适合展示多个方案。', cfg: { kind: 'carousel', text: '精选方案', sub: '方案 ' } },
      { id: 'ui-calendar', name: '日历节奏', tags: ['日历', '节奏'], desc: '日期逐格点亮并高亮当前日，适合排期与打卡场景。', cfg: { kind: 'calendar', text: '十月排期', size: 520 } },
      { id: 'ui-tasklist', name: '任务清单', tags: ['清单', '完成'], desc: '任务逐条滑入并被打勾划掉，完成感很强。', cfg: { kind: 'tasklist' } },
      { id: 'ui-statcard', name: '数据卡片组', tags: ['数据卡', '指标'], desc: '三张数据卡依次弹入，适合关键指标总览。', cfg: { kind: 'statcard' } },
      { id: 'ui-badge', name: '徽章计数', tags: ['徽章', '计数'], desc: '圆形徽章数字滚动并带环形进度，适合成就与提醒。', cfg: { kind: 'badge', sub: '待处理事项' } },
      { id: 'ui-avatars', name: '头像堆叠', tags: ['头像', '成员'], desc: '多个头像依次错位叠放，适合团队成员展示。', cfg: { kind: 'avatars', sub: '已有 36 人参与', size: 720} },
      { id: 'ui-dropdown', name: '下拉选择', tags: ['下拉', '选择'], desc: '下拉箭头翻转并展开选项列表，表单演示常用。', cfg: { kind: 'dropdown', text: '选择分类', sub: '选项' } },
      { id: 'ui-slider', name: '滑块调节', tags: ['滑块', '数值'], desc: '滑块自动往复并实时显示数值，适合参数调节演示。', cfg: { kind: 'slider', text: '细节强度' } },
      { id: 'ui-settings', name: '设置列表', tags: ['设置', '开关'], desc: '设置项逐条出现并带各自开关状态的列表。', cfg: { kind: 'settings' } },
      { id: 'ui-battery', name: '电量充能', tags: ['电量', '进度'], desc: '电池电量逐步充满，充电与进度主题的直观表达。', cfg: { kind: 'battery' } },
      { id: 'ui-waveform', name: '声波跳动', tags: ['声波', '音频'], desc: '声波柱随节奏跳动，适合播客与音乐内容。', cfg: { kind: 'waveform', sub: '正在录音' } },
      { id: 'ui-keypress', name: '按键反馈', tags: ['按键', '快捷键'], desc: '快捷键按键被按下并弹出涟漪，适合功能介绍与教程。', cfg: { kind: 'keypress', sub: '打开命令面板', size: 720} }
    ]
  });
})();

/* ════════ assets/js/effects-12.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 12
   原语：物理运动 / 背景循环
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng;

  /* ══════════════════════════ 物理运动 ══════════════════════════ */

  var PHYS_PARAMS = [
    P('kind', '物理类型', 'pendulum', sel('pendulum', [
      ['pendulum', '单摆'], ['spring', '弹簧振子'], ['bounce-trail', '弹跳拖尾'], ['newton', '牛顿摆'],
      ['cloth', '布料波动'], ['rope', '绳索波'], ['drop-ripple', '落水涟漪'], ['magnetic-p', '磁力吸附'],
      ['gravity', '重力落体'], ['collision', '弹性碰撞'], ['domino', '多米诺'], ['balance', '天平摆动'],
      ['chain', '链条摆动'], ['fluid', '流体扰动'], ['gyro', '陀螺旋转'], ['trajectory', '抛物线']
    ])),
    P('count', '数量', 6, rng(6, 2, 24, 1)),
    P('size', '尺寸', 900, rng(900, 90.0, 1971, 4.0)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('damp', '阻尼', 0.35, rng(0.35, 0, 1, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function physDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var n = Math.max(2, Math.round(p.count));
    var k = e.outCubic(U.clamp(t / 1.1, 0, 1));
    var ink = U.ink;
    var i, a;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (kind === 'pendulum') {
      var pivY = cy - base * 0.72;
      var len = base * 0.95;
      var ang = Math.sin(t * sp * 1.8) * 0.62;
      ctx.strokeStyle = U.rgba(ink, 0.35);
      ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.arc(cx, pivY, 7 * S, 0, Math.PI * 2); ctx.fillStyle = U.rgba(ink, 0.5); ctx.fill();
      var bx2 = cx + Math.sin(ang) * len * k;
      var by3 = pivY + Math.cos(ang) * len * k;
      ctx.beginPath(); ctx.moveTo(cx, pivY); ctx.lineTo(bx2, by3);
      ctx.strokeStyle = U.rgba(ink, 0.5); ctx.lineWidth = 3 * S; ctx.stroke();
      var bg3 = ctx.createRadialGradient(bx2 - 20 * S, by3 - 20 * S, 0, bx2, by3, 46 * S);
      bg3.addColorStop(0, U.mix('#FFFFFF', U.accent, 0.3));
      bg3.addColorStop(1, U.accent);
      ctx.fillStyle = bg3;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.beginPath(); ctx.arc(bx2, by3, 34 * S, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(ink, 0.12);
      ctx.lineWidth = 1.6 * S;
      ctx.beginPath(); ctx.arc(cx, pivY, len, Math.PI / 2 - 0.7, Math.PI / 2 + 0.7); ctx.stroke();
    }

    else if (kind === 'spring') {
      var dt2 = (t * sp) % 3.2;
      var dampK = Math.exp(-dt2 * (0.6 + p.damp * 1.6));
      var offY = Math.cos(dt2 * 9) * dampK * base * 0.5;
      ctx.strokeStyle = U.rgba(U.accent, 0.9);
      ctx.lineWidth = 4 * S;
      ctx.beginPath();
      var coils = 11, topY = cy - base * 0.72, coilH = (base * 0.72 + offY) / coils;
      ctx.moveTo(cx, topY);
      for (i = 0; i < coils; i++) {
        var yy2 = topY + i * coilH;
        ctx.quadraticCurveTo(cx + (i % 2 ? -34 : 34) * S, yy2 + coilH * 0.5, cx, yy2 + coilH);
      }
      ctx.stroke();
      var wby = topY + (base * 0.72 + offY);
      var wbx = cx;
      ctx.fillStyle = U.accent2;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      U.rr(ctx, wbx - 60 * S, wby, 120 * S, 80 * S, 14 * S);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    else if (kind === 'bounce-trail') {
      var period = 1.5 / sp;
      var bt = (t % period) / period;
      var bxx = -base * 0.6 + bt * base * 1.2;
      var bounces = 3;
      var bphase = (bt * bounces) % 1;
      var bheight = base * 0.62 * Math.pow(1 - bt, 1.4);
      var byy2 = cy + base * 0.42 - Math.abs(Math.sin(bphase * Math.PI)) * bheight;
      for (i = 9; i >= 0; i--) {
        var trailT = bt - i * 0.018;
        if (trailT < 0) continue;
        var txx = -base * 0.6 + trailT * base * 1.2;
        var tphase = (trailT * bounces) % 1;
        var theight = base * 0.62 * Math.pow(1 - trailT, 1.4);
        var tyy = cy + base * 0.42 - Math.abs(Math.sin(tphase * Math.PI)) * theight;
        ctx.globalAlpha = (1 - i / 10) * 0.55;
        ctx.beginPath(); ctx.arc(txx, tyy, (30 - i * 2.2) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(bxx, byy2, 30 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.mix('#FFFFFF', U.accent, 0.25);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 28 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(ink, 0.16);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.75, cy + base * 0.42); ctx.lineTo(cx + base * 0.75, cy + base * 0.42); ctx.stroke();
    }

    else if (kind === 'newton') {
      var balls = 5;
      var br = base * 0.19;
      var gap2 = br * 2.1;
      var total = balls * gap2;
      var originX = cx - total / 2 + gap2 / 2;
      var originY = cy - base * 0.54;
      var stringLen = base * 0.72;
      var phase = (t * sp * 0.9) % 1;
      for (i = 0; i < balls; i++) {
        var swing = 0;
        if (i === 0) swing = Math.max(0, Math.sin(phase * Math.PI * 2)) * 0.9;
        else if (i === balls - 1) swing = -Math.max(0, -Math.sin(phase * Math.PI * 2)) * 0.9;
        var px4 = originX + i * gap2 + Math.sin(swing) * stringLen;
        var py4 = originY + Math.cos(swing) * stringLen;
        ctx.strokeStyle = U.rgba(ink, 0.3);
        ctx.lineWidth = 1.8 * S;
        ctx.beginPath(); ctx.moveTo(originX + i * gap2, originY); ctx.lineTo(px4, py4); ctx.stroke();
        var ng = ctx.createRadialGradient(px4 - br * 0.4, py4 - br * 0.4, 0, px4, py4, br);
        ng.addColorStop(0, U.mix('#FFFFFF', U.accent, 0.35));
        ng.addColorStop(1, U.accent2);
        ctx.fillStyle = ng;
        if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow * 0.8); ctx.shadowBlur = 22 * S * p.glow; }
        ctx.beginPath(); ctx.arc(px4, py4, br, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.strokeStyle = U.rgba(ink, 0.35);
      ctx.lineWidth = 4 * S;
      ctx.beginPath(); ctx.moveTo(originX - gap2 * 0.9, originY); ctx.lineTo(originX + (balls - 1) * gap2 + gap2 * 0.9, originY); ctx.stroke();
    }

    else if (kind === 'cloth') {
      var cols = Math.max(5, Math.round(n * 1.6)), rows = Math.max(4, Math.round(cols * 0.66));
      var cw = base * 1.55 / cols, chh = base * 1.05 / rows;
      var ox = cx - (cols * cw) / 2, oy = cy - (rows * chh) / 2;
      ctx.lineWidth = 1.8 * S;
      for (var cr = 0; cr <= rows; cr++) {
        ctx.beginPath();
        for (var cc = 0; cc <= cols; cc++) {
          var wv2 = Math.sin(cc * 0.55 + t * sp * 2.6) * Math.cos(cr * 0.5 - t * sp * 2.1) * 26 * S * k;
          var ptx = ox + cc * cw, pty = oy + cr * chh + wv2;
          if (cc) ctx.lineTo(ptx, pty); else ctx.moveTo(ptx, pty);
        }
        ctx.strokeStyle = U.rgba(U.accent, 0.5 + (cr / rows) * 0.5);
        ctx.stroke();
      }
      for (var cc2 = 0; cc2 <= cols; cc2++) {
        ctx.beginPath();
        for (var cr2 = 0; cr2 <= rows; cr2++) {
          var wv3 = Math.sin(cc2 * 0.55 + t * sp * 2.6) * Math.cos(cr2 * 0.5 - t * sp * 2.1) * 26 * S * k;
          var ptx2 = ox + cc2 * cw, pty2 = oy + cr2 * chh + wv3;
          if (cr2) ctx.lineTo(ptx2, pty2); else ctx.moveTo(ptx2, pty2);
        }
        ctx.strokeStyle = U.rgba(U.accent2, 0.5 + (cc2 / cols) * 0.5);
        ctx.stroke();
      }
    }

    else if (kind === 'rope') {
      var segs = Math.max(14, n * 4);
      var rlw = base * 1.8;
      var amp2 = base * 0.3 * k;
      ctx.strokeStyle = U.rgba(U.accent, 0.95);
      ctx.lineWidth = 7 * S;
      ctx.beginPath();
      for (i = 0; i <= segs; i++) {
        var rf = i / segs;
        var rx2 = cx - rlw / 2 + rlw * rf;
        var ry3 = cy + Math.sin(rf * Math.PI * 4 - t * sp * 4.2) * amp2 * Math.exp(-Math.pow(rf - 0.5, 2) * 4);
        if (i) ctx.lineTo(rx2, ry3); else ctx.moveTo(rx2, ry3);
      }
      ctx.stroke();
      ctx.strokeStyle = U.rgba(U.accent2, 0.4);
      ctx.lineWidth = 14 * S;
      ctx.stroke();
      for (i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.arc(cx + i * rlw / 2, cy, 12 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent2; ctx.fill();
      }
    }

    else if (kind === 'drop-ripple') {
      var cycle2 = 2.6 / sp;
      var dct = t % cycle2;
      var dp = U.clamp(dct / cycle2, 0, 1);
      var dy3 = cy - base * 0.3 + dp * base * 0.5;
      ctx.beginPath();
      ctx.arc(cx, dy3, 26 * S, 0, Math.PI * 2);
      var dg2 = ctx.createRadialGradient(cx - 8 * S, dy3 - 8 * S, 0, cx, dy3, 26 * S);
      dg2.addColorStop(0, '#FFFFFF');
      dg2.addColorStop(1, U.accent);
      ctx.fillStyle = dg2;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      if (dp > 0.55) {
        var rp = (dp - 0.55) / 0.45;
        for (i = 0; i < 5; i++) {
          var rrp = (rp - i * 0.11) / 0.6;
          if (rrp <= 0 || rrp > 1) continue;
          ctx.globalAlpha = (1 - rrp) * 0.7;
          ctx.beginPath();
          ctx.ellipse(cx, cy + base * 0.2, base * 0.75 * rrp, base * 0.22 * rrp, 0, 0, Math.PI * 2);
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = 3 * S;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = U.rgba(ink, 0.18);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.85, cy + base * 0.2); ctx.lineTo(cx + base * 0.85, cy + base * 0.2); ctx.stroke();
    }

    else if (kind === 'magnetic-p') {
      for (i = 0; i < n * 3; i++) {
        var mph = (t * sp * 0.35 + U.rng(i) * 0.8) % 1;
        var mrad2 = base * 0.95 * (1 - Math.pow(mph, 1.8));
        var mang2 = U.rng(i + 5) * Math.PI * 2 + mph * 2.4;
        ctx.globalAlpha = 0.2 + mph * 0.8;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(mang2) * mrad2, cy + Math.sin(mang2) * mrad2, (4 + mph * 14) * S, 0, Math.PI * 2);
        ctx.fillStyle = mph > 0.8 ? U.mix('#FFFFFF', U.accent, 0.3) : U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      var mg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.5);
      mg2.addColorStop(0, U.rgba(U.accent2, 0.55));
      mg2.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = mg2;
      ctx.beginPath(); ctx.arc(cx, cy, base * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 26 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.accent2; ctx.fill();
    }

    else if (kind === 'gravity') {
      for (i = 0; i < n; i++) {
        var gx = cx - base * 0.8 + (i / Math.max(1, n - 1)) * base * 1.6;
        var gphase = ((t * sp * 0.55 + U.rng(i) * 1.2) % 1.5) / 1.5;
        var gy = cy - base * 0.8 + gphase * gphase * base * 1.5;
        var squish = gphase > 0.92 ? 1 + (gphase - 0.92) * 3 : 1;
        ctx.globalAlpha = 1 - Math.pow(gphase, 6);
        ctx.beginPath();
        ctx.ellipse(gx, gy, (18 + i * 1.6) * S / squish, (18 + i * 1.6) * S * squish, 0, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = U.rgba(ink, 0.2);
      ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.92, cy + base * 0.72); ctx.lineTo(cx + base * 0.92, cy + base * 0.72); ctx.stroke();
    }

    else if (kind === 'collision') {
      var cA = cx - base * 0.9 + e.inOutCubic(U.clamp(t * sp / 1.2, 0, 1)) * base * 0.9;
      var cB = cx + base * 0.9 - e.inOutCubic(U.clamp(t * sp / 1.2, 0, 1)) * base * 0.9;
      var flash = U.clamp(1 - Math.abs(t * sp - 1.25) * 5, 0, 1);
      var ballR = base * 0.22;
      var drawBall = function (bx3, col) {
        var bg4 = ctx.createRadialGradient(bx3 - ballR * 0.35, cy - ballR * 0.35, 0, bx3, cy, ballR);
        bg4.addColorStop(0, U.mix('#FFFFFF', col, 0.3));
        bg4.addColorStop(1, col);
        ctx.fillStyle = bg4;
        ctx.beginPath(); ctx.arc(bx3, cy, ballR, 0, Math.PI * 2); ctx.fill();
      };
      drawBall(cA, U.accent);
      drawBall(cB, U.accent2);
      if (flash > 0) {
        var fg3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, ballR * 4 * flash);
        fg3.addColorStop(0, U.rgba('#FFFFFF', 0.9 * flash));
        fg3.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = fg3;
        ctx.beginPath(); ctx.arc(cx, cy, ballR * 4 * flash, 0, Math.PI * 2); ctx.fill();
        for (i = 0; i < 14; i++) {
          a = U.rng(i) * Math.PI * 2;
          var fr = flash * base * 0.5 * (0.4 + U.rng(i + 9) * 0.9);
          ctx.globalAlpha = flash;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * fr, cy + Math.sin(a) * fr, 6 * S * flash, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = U.rgba(ink, 0.14);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 1.1, cy + ballR + 22 * S); ctx.lineTo(cx + base * 1.1, cy + ballR + 22 * S); ctx.stroke();
    }

    else if (kind === 'domino') {
      var domW = base * 1.7 / n;
      for (i = 0; i < n; i++) {
        var df = i / Math.max(1, n - 1);
        var dly2 = i * 0.14 / sp;
        var fall = U.clamp((t * sp - dly2) / 0.5, 0, 1);
        var angle = e.inOutQuad(fall) * 1.35;
        var dx4 = cx - base * 0.85 + i * domW;
        var dh2 = base * 0.62;
        ctx.save();
        ctx.translate(dx4, cy + dh2 / 2);
        ctx.rotate(angle);
        var dgd = ctx.createLinearGradient(0, -dh2 / 2, 0, dh2 / 2);
        dgd.addColorStop(0, U.rgba(U.mix(U.accent, U.accent2, df), 0.95));
        dgd.addColorStop(1, U.rgba(U.mix(U.accent2, U.bg1, 0.3), 0.95));
        ctx.fillStyle = dgd;
        U.rr(ctx, -domW * 0.22, -dh2 / 2, domW * 0.44, dh2, 5 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = U.rgba(ink, 0.18);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.95, cy + base * 0.32); ctx.lineTo(cx + base * 0.95, cy + base * 0.32); ctx.stroke();
    }

    else if (kind === 'balance') {
      var bAng = Math.sin(t * sp * 1.3) * 0.3 * (1 + p.damp);
      var armL = base * 0.85;
      ctx.strokeStyle = U.rgba(ink, 0.5);
      ctx.lineWidth = 5 * S;
      ctx.beginPath(); ctx.moveTo(cx, cy - base * 0.5); ctx.lineTo(cx, cy + base * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - base * 0.3, cy + base * 0.3); ctx.lineTo(cx + base * 0.3, cy + base * 0.3); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy - base * 0.5);
      ctx.rotate(bAng);
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 6 * S;
      ctx.beginPath(); ctx.moveTo(-armL, 0); ctx.lineTo(armL, 0); ctx.stroke();
      for (i = -1; i <= 1; i += 2) {
        var panY = 0;
        ctx.beginPath(); ctx.moveTo(i * armL, 0); ctx.lineTo(i * armL, base * 0.34); ctx.stroke();
        var pg3 = ctx.createLinearGradient(i * armL - 46 * S, base * 0.34, i * armL + 46 * S, base * 0.34);
        pg3.addColorStop(0, i < 0 ? U.accent : U.accent2);
        pg3.addColorStop(1, i < 0 ? U.accent : U.accent2);
        ctx.fillStyle = U.rgba(i < 0 ? U.accent : U.accent2, 0.9);
        ctx.beginPath();
        ctx.moveTo(i * armL - 52 * S, base * 0.34);
        ctx.lineTo(i * armL + 52 * S, base * 0.34);
        ctx.lineTo(i * armL + 40 * S, base * 0.34 + 40 * S);
        ctx.lineTo(i * armL - 40 * S, base * 0.34 + 40 * S);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    else if (kind === 'chain') {
      var links = Math.max(6, n * 2);
      var segLen = base * 1.7 / links;
      var prevX2 = cx - base * 0.85, prevY2 = cy - base * 0.2;
      for (i = 0; i < links; i++) {
        var lf = i / links;
        var lx2 = cx - base * 0.85 + i * segLen;
        var ly5 = cy - base * 0.2 + Math.sin(t * sp * 2.2 - i * 0.42) * base * 0.3 * k * Math.exp(-Math.pow(lf - 0.4, 2) * 3);
        ctx.save();
        ctx.translate((lx2 + prevX2) / 2, (ly5 + prevY2) / 2);
        ctx.rotate(Math.atan2(ly5 - prevY2, lx2 - prevX2));
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = 5 * S;
        ctx.beginPath();
        ctx.ellipse(0, 0, segLen * 0.42, 11 * S, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        prevX2 = lx2; prevY2 = ly5;
      }
    }

    else if (kind === 'fluid') {
      var fCols = Math.max(6, Math.round(n * 2.4));
      ctx.lineWidth = 2.4 * S;
      for (i = 0; i < fCols; i++) {
        var ffy = H * (i + 0.5) / fCols;
        ctx.beginPath();
        for (var fx3 = 0; fx3 <= W; fx3 += 12) {
          var fn = U.noise2(fx3 * 0.004 + t * sp * 0.5, i * 0.6, 13);
          var fyy = ffy + fn * 46 * S * k + Math.sin(fx3 * 0.008 + t * sp * 1.6 + i) * 18 * S;
          if (fx3) ctx.lineTo(fx3, fyy); else ctx.moveTo(fx3, fyy);
        }
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.55);
        ctx.stroke();
      }
    }

    else if (kind === 'gyro') {
      var gAng = t * sp * 1.6;
      var tilt = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      var gR = base * 0.62;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(gAng * 0.35);
      for (i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI / 4 + gAng * 0.5);
        ctx.scale(1, 0.28 + tilt * 0.5);
        ctx.beginPath(); ctx.arc(0, 0, gR, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.85);
        ctx.lineWidth = 4 * S;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, 20 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.mix('#FFFFFF', U.accent, 0.3);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    else if (kind === 'trajectory') {
      var tjP = (t * sp * 0.6) % 1;
      var startX = cx - base * 0.85, startY = cy + base * 0.6;
      var endX = cx + base * 0.85;
      ctx.strokeStyle = U.rgba(ink, 0.22);
      ctx.lineWidth = 2 * S;
      ctx.setLineDash([10 * S, 8 * S]);
      ctx.beginPath();
      for (i = 0; i <= 40; i++) {
        var tf2 = i / 40;
        var tx4 = U.lerp(startX, endX, tf2);
        var ty4 = startY - Math.sin(tf2 * Math.PI) * base * 1.05;
        if (i) ctx.lineTo(tx4, ty4); else ctx.moveTo(tx4, ty4);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      for (i = 9; i >= 0; i--) {
        var tpt = tjP - i * 0.022;
        if (tpt < 0) continue;
        var ttx2 = U.lerp(startX, endX, tpt);
        var tty2 = startY - Math.sin(tpt * Math.PI) * base * 1.05;
        ctx.globalAlpha = (1 - i / 10) * 0.6;
        ctx.beginPath(); ctx.arc(ttx2, tty2, (24 - i * 1.8) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      var jx = U.lerp(startX, endX, tjP), jy = startY - Math.sin(tjP * Math.PI) * base * 1.05;
      ctx.beginPath(); ctx.arc(jx, jy, 26 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.mix('#FFFFFF', U.accent2, 0.3);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    else {
      ctx.beginPath(); ctx.arc(cx, cy, base * 0.4 * k, 0, Math.PI * 2);
      ctx.strokeStyle = U.accent; ctx.lineWidth = 5 * S; ctx.stroke();
    }

    ctx.restore();
  }

  MF.forge({
    cat: '物理运动', type: 'block', dur: 6, poster: 0.5,
    params: PHYS_PARAMS, draw: physDraw,
    ids: [
      { id: 'ph-pendulum', name: '单摆', tags: ['摆动', '物理'], desc: '单摆在重力下往复摆动，并画出摆角弧线，物理感真实。', cfg: { kind: 'pendulum' } },
      { id: 'ph-spring', name: '弹簧振子', tags: ['弹性', '振动'], desc: '弹簧拉伸后带阻尼回弹，直观展示弹性与阻尼。', cfg: { kind: 'spring' } },
      { id: 'ph-bounce-trail', name: '弹跳拖尾', tags: ['弹跳', '拖尾'], desc: '小球弹跳并带运动拖尾，高度逐次衰减。', cfg: { kind: 'bounce-trail' } },
      { id: 'ph-newton', name: '牛顿摆', tags: ['牛顿摆', '动量'], desc: '经典牛顿摆演示动量传递，两端小球交替摆动。', cfg: { kind: 'newton' } },
      { id: 'ph-cloth', name: '布料波动', tags: ['布料', '网格'], desc: '网格布面在风的作用下起伏波动，质感柔软。', cfg: { kind: 'cloth' } },
      { id: 'ph-rope', name: '绳索波', tags: ['绳索', '波'], desc: '绳索被抖动后正弦波沿绳传播，物理演示感强。', cfg: { kind: 'rope' } },
      { id: 'ph-drop-ripple', name: '落水涟漪', tags: ['水波', '涟漪'], desc: '小球落入水面后激起同心涟漪，水面透视感明确。', cfg: { kind: 'drop-ripple' } },
      { id: 'ph-magnetic', name: '磁力吸附', tags: ['磁力', '吸引'], desc: '粒子被磁力吸引向中心聚拢，带磁场光晕。', cfg: { kind: 'magnetic-p' } },
      { id: 'ph-gravity', name: '重力落体', tags: ['重力', '下落'], desc: '多球自由落体并落地压扁，重力加速度直观可见。', cfg: { kind: 'gravity' } },
      { id: 'ph-collision', name: '弹性碰撞', tags: ['碰撞', '冲击'], desc: '两球相撞瞬间的冲击闪光与飞溅，撞击感强烈。', cfg: { kind: 'collision' } },
      { id: 'ph-domino', name: '多米诺', tags: ['多米诺', '连锁'], desc: '骨牌依次倒下形成连锁反应，隐喻传导与影响。', cfg: { kind: 'domino', count: 12 } },
      { id: 'ph-balance', name: '天平摆动', tags: ['天平', '权衡'], desc: '天平在两端之间摆动趋于平衡，适合对比与权衡主题。', cfg: { kind: 'balance' } },
      { id: 'ph-chain', name: '链条摆动', tags: ['链条', '传递'], desc: '链条呈波浪式运动，机械与传递感强。', cfg: { kind: 'chain' } },
      { id: 'ph-fluid', name: '流体扰动', tags: ['流体', '有机'], desc: '噪声场驱动的流体线条持续扰动，有机且柔和。', cfg: { kind: 'fluid', count: 8 } },
      { id: 'ph-gyro', name: '陀螺旋转', tags: ['陀螺', '立体'], desc: '多层圆环构成陀螺结构并旋转，立体感强。', cfg: { kind: 'gyro' } },
      { id: 'ph-trajectory', name: '抛物线', tags: ['抛物', '轨道'], desc: '小球沿抛物线飞行并留下虚线轨迹与拖尾。', cfg: { kind: 'trajectory' } }
    ]
  });

  /* ══════════════════════════ 背景循环 ══════════════════════════ */

  var BG_PARAMS = [
    P('kind', '背景类型', 'grid-pan', sel('grid-pan', [
      ['grid-pan', '网格平移'], ['particle-field', '粒子场'], ['aurora-bg', '极光背景'], ['matrix-rain', '矩阵雨'],
      ['noise-warp', '噪声扭曲'], ['wave-layers', '波浪层'], ['topo', '等高线'], ['gradient-mesh', '渐变网格'],
      ['starfield-bg', '星空漂移'], ['bokeh-bg', '散景光斑'], ['hex-bg', '蜂窝底纹'], ['scanlines', '扫描线'],
      ['dots-bg', '点阵底纹'], ['stripes', '斜条纹'], ['circuit', '电路板'], ['blueprint', '蓝图'],
      ['liquid-bg', '液态流动'], ['rays-bg', '放射线'], ['crack', '裂纹'], ['fog', '迷雾']
    ])),
    P('density', '密度', 14, rng(14, 3, 40, 1)),
    P('size', '尺寸', 300.0, rng(300.0, 60.0, 912.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.1, 3, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function bgDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var n = Math.max(3, Math.round(p.density));
    var kb = U.clamp(t / 1.2, 0, 1);
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.05, p.speed);
    var ink = U.ink;
    var i, x, y, a;

    ctx.save();
    ctx.globalAlpha = kb;

    if (kind === 'grid-pan') {
      var step = base / n * 3.4;
      var off = (t * sp * 40) % step;
      ctx.strokeStyle = U.rgba(ink, 0.1);
      ctx.lineWidth = 1.4 * S;
      ctx.beginPath();
      for (x = -step + off; x < W + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (y = -step + off; y < H + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.55);
      rg.addColorStop(0, U.rgba(U.accent, 0.16));
      rg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'particle-field') {
      for (i = 0; i < n * 12; i++) {
        var px5 = U.rng(i) * W + Math.sin(t * sp * 0.4 + i) * 30 * S;
        var py5 = U.rng(i + 7) * H + Math.cos(t * sp * 0.34 + i * 1.3) * 30 * S;
        ctx.globalAlpha = kb * (0.16 + U.rng(i + 19) * 0.6);
        ctx.beginPath();
        ctx.arc(px5, py5, (1.6 + U.rng(i + 29) * 5) * S, 0, Math.PI * 2);
        ctx.fillStyle = i % 4 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
    }

    else if (kind === 'aurora-bg') {
      for (i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, H * (0.15 + i * 0.12));
        for (x = 0; x <= W; x += 22) {
          ctx.lineTo(x, H * (0.2 + i * 0.12) + Math.sin(x * 0.004 + t * sp * 0.9 + i) * 70 * S
            + Math.sin(x * 0.011 - t * sp * 0.6) * 34 * S);
        }
        ctx.lineTo(W, H * 0.8); ctx.lineTo(0, H * 0.8); ctx.closePath();
        var ag2 = ctx.createLinearGradient(0, H * 0.1, W, H * 0.8);
        ag2.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0));
        ag2.addColorStop(0.4, U.rgba(i % 2 ? U.accent : U.accent2, 0.16));
        ag2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ag2;
        ctx.fill();
      }
    }

    else if (kind === 'matrix-rain') {
      var cols = n * 2;
      var cw4 = W / cols;
      ctx.font = U.fs(20 * S, 700, true);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (i = 0; i < cols; i++) {
        var colX = i * cw4 + cw4 / 2;
        var seedc = U.rng(i);
        var head = ((t * sp * (0.4 + seedc * 0.8) + seedc * 3) % 1.4) * H * 1.4 - H * 0.2;
        for (var mi2 = 0; mi2 < 16; mi2++) {
          var charY = head - mi2 * 26 * S;
          if (charY < -30 || charY > H + 30) continue;
          var fade = Math.max(0, 1 - mi2 / 16);
          ctx.globalAlpha = kb * fade * (0.25 + seedc * 0.6);
          ctx.fillStyle = mi2 === 0 ? '#FFFFFF' : (mi2 < 3 ? U.accent : U.rgba(U.accent, 0.8));
          var gi = Math.floor(U.rng(i * 31 + mi2 * 7 + Math.floor(t * sp * 6)) * 36);
          ctx.fillText('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(gi), colX, charY);
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'noise-warp') {
      for (i = 0; i < n; i++) {
        var nwy = H * (i + 0.5) / n;
        ctx.beginPath();
        for (x = 0; x <= W; x += 10) {
          var nv2 = U.noise2(x * 0.003 + t * sp * 0.4, i * 0.4, 7);
          var nyy = nwy + nv2 * 60 * S;
          if (x) ctx.lineTo(x, nyy); else ctx.moveTo(x, nyy);
        }
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.5);
        ctx.lineWidth = (1.6 + U.rng(i + 5) * 3) * S;
        ctx.stroke();
      }
    }

    else if (kind === 'wave-layers') {
      for (i = 0; i < n / 2; i++) {
        var wly = H * (0.3 + i * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (x = 0; x <= W; x += 16) {
          ctx.lineTo(x, wly + Math.sin(x * 0.006 + t * sp * 1.1 + i * 0.8) * 40 * S);
        }
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = U.rgba(i % 2 ? U.accent : U.accent2, 0.16 - i * 0.02);
        ctx.fill();
      }
    }

    else if (kind === 'topo') {
      ctx.lineWidth = 1.6 * S;
      for (i = 0; i < n; i++) {
        ctx.beginPath();
        for (var ta = 0; ta <= 360; ta += 6) {
          var tr2 = ta * Math.PI / 180;
          var tnoise = U.noise2(Math.cos(tr2) * 1.6 + t * sp * 0.2, Math.sin(tr2) * 1.6, 21);
          var trad = base * (0.16 + i * 0.05) * (1 + tnoise * 0.22);
          var tx5 = cx + Math.cos(tr2) * trad, ty5 = cy + Math.sin(tr2) * trad * 0.82;
          if (ta) ctx.lineTo(tx5, ty5); else ctx.moveTo(tx5, ty5);
        }
        ctx.closePath();
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.42);
        ctx.stroke();
      }
    }

    else if (kind === 'gradient-mesh' || kind === 'bokeh-bg') {
      var meshN = kind === 'bokeh-bg' ? n * 1.6 : n * 0.7;
      for (i = 0; i < meshN; i++) {
        var mx2 = cx + Math.sin(t * sp * 0.28 + i * 2.1) * W * 0.34;
        var my2 = cy + Math.cos(t * sp * 0.24 + i * 1.7) * H * 0.3;
        var mr2 = base * (0.3 + U.rng(i + 3) * 0.6);
        var mg2 = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, mr2);
        mg2.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.2));
        mg2.addColorStop(1, U.rgba(i % 2 ? U.accent2 : U.accent, 0));
        ctx.fillStyle = mg2;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'starfield-bg') {
      for (i = 0; i < n * 14; i++) {
        var sx5 = (U.rng(i) * W + t * sp * (2 + U.rng(i + 3) * 8)) % W;
        var sy5 = U.rng(i + 11) * H;
        var twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * sp * 2 + i));
        ctx.globalAlpha = kb * twinkle * (0.3 + U.rng(i + 21) * 0.7);
        ctx.beginPath();
        ctx.arc(sx5, sy5, (0.8 + U.rng(i + 31) * 2.4) * S, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 ? U.ink : U.accent;
        ctx.fill();
      }
    }

    else if (kind === 'hex-bg') {
      var hr2 = base / n * 0.9;
      var colW2 = hr2 * 1.732, rowH2 = hr2 * 1.5;
      var pulse = 0.5 + 0.5 * Math.sin(t * sp * 1.4);
      for (y = -rowH2; y < H + rowH2; y += rowH2) {
        for (x = -colW2; x < W + colW2; x += colW2) {
          var ox3 = x + (Math.round(y / rowH2) % 2 ? colW2 / 2 : 0);
          ctx.beginPath();
          for (i = 0; i < 6; i++) {
            a = Math.PI * 2 * i / 6 + Math.PI / 6;
            var hpx = ox3 + hr2 * Math.cos(a), hpy = y + hr2 * Math.sin(a);
            if (i) ctx.lineTo(hpx, hpy); else ctx.moveTo(hpx, hpy);
          }
          ctx.closePath();
          var hdist = Math.hypot(ox3 - cx, y - cy) / (Math.min(W, H) * 0.6);
          ctx.strokeStyle = U.rgba(U.accent, 0.1 + 0.3 * Math.max(0, 1 - Math.abs(hdist - pulse * 0.8) * 3));
          ctx.lineWidth = 1.6 * S;
          ctx.stroke();
        }
      }
    }

    else if (kind === 'scanlines') {
      for (i = 0; i < H / (6 * S) + 2; i++) {
        ctx.globalAlpha = kb * 0.14;
        ctx.fillStyle = ink;
        ctx.fillRect(0, i * 6 * S, W, 2 * S);
      }
      ctx.globalAlpha = kb;
      var sl = (t * sp * 0.4 % 1) * H * 1.2 - H * 0.1;
      var slg = ctx.createLinearGradient(0, sl - 60 * S, 0, sl + 60 * S);
      slg.addColorStop(0, U.rgba(U.accent, 0));
      slg.addColorStop(0.5, U.rgba(U.accent, 0.28));
      slg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = slg;
      ctx.fillRect(0, sl - 60 * S, W, 120 * S);
    }

    else if (kind === 'dots-bg') {
      var dst = base / n * 2.4;
      for (y = dst / 2; y < H; y += dst) {
        for (x = dst / 2; x < W; x += dst) {
          var dpl = 0.5 + 0.5 * Math.sin(x * 0.01 + y * 0.01 - t * sp * 1.8);
          ctx.globalAlpha = kb * (0.06 + 0.24 * dpl);
          ctx.beginPath();
          ctx.arc(x, y, (2 + dpl * 4) * S, 0, Math.PI * 2);
          ctx.fillStyle = U.accent;
          ctx.fill();
        }
      }
    }

    else if (kind === 'stripes') {
      var sst = base / n * 2.6;
      var soff = (t * sp * 60) % sst;
      ctx.strokeStyle = U.rgba(U.accent, 0.14);
      ctx.lineWidth = sst * 0.34;
      ctx.beginPath();
      for (i = -Math.ceil(H / sst) - 2; i < W / sst + 2; i++) {
        var sxo = i * sst + soff;
        ctx.moveTo(sxo, 0);
        ctx.lineTo(sxo + H, H);
      }
      ctx.stroke();
    }

    else if (kind === 'circuit') {
      ctx.strokeStyle = U.rgba(U.accent, 0.3);
      ctx.lineWidth = 1.8 * S;
      var gs = base / n * 2;
      for (i = 0; i < n * 2; i++) {
        var sxp2 = Math.floor(U.rng(i) * (W / gs)) * gs;
        var syp2 = Math.floor(U.rng(i + 5) * (H / gs)) * gs;
        ctx.beginPath();
        ctx.moveTo(sxp2, syp2);
        var dir = U.rng(i + 11) > 0.5;
        var len2 = gs * (1 + Math.floor(U.rng(i + 21) * 3));
        ctx.lineTo(sxp2 + (dir ? len2 : 0), syp2 + (dir ? 0 : len2));
        ctx.lineTo(sxp2 + (dir ? len2 : gs * Math.floor(U.rng(i + 31) * 3)), syp2 + (dir ? gs * Math.floor(U.rng(i + 41) * 3) : len2));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sxp2, syp2, 5 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      var glowPulse = 0.5 + 0.5 * Math.sin(t * sp * 2.2);
      ctx.globalAlpha = kb * glowPulse * 0.5;
      ctx.fillStyle = U.rgba(U.accent, 0.3);
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = kb;
    }

    else if (kind === 'blueprint') {
      var bst = base / n * 2.6;
      ctx.strokeStyle = U.rgba(U.accent, 0.16);
      ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      for (x = 0; x < W; x += bst) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (y = 0; y < H; y += bst) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      ctx.strokeStyle = U.rgba(U.accent, 0.5);
      ctx.lineWidth = 2.4 * S;
      for (i = 0; i < 6; i++) {
        var bwx = U.rng(i * 13) * W * 0.7 + W * 0.1;
        var bwy = U.rng(i * 17 + 3) * H * 0.7 + H * 0.1;
        var bww = 80 * S + U.rng(i + 7) * 200 * S * kb;
        var bwh = 60 * S + U.rng(i + 23) * 150 * S * kb;
        ctx.strokeRect(bwx, bwy, bww, bwh);
      }
      ctx.setLineDash([10 * S, 8 * S]);
      ctx.strokeStyle = U.rgba(U.accent2, 0.5);
      ctx.beginPath();
      ctx.moveTo(cx - base * 0.8, cy); ctx.lineTo(cx + base * 0.8, cy);
      ctx.moveTo(cx, cy - base * 0.5); ctx.lineTo(cx, cy + base * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    else if (kind === 'liquid-bg') {
      for (var lyr = 0; lyr < 4; lyr++) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (x = 0; x <= W; x += 14) {
          var lvy = H * (0.55 + lyr * 0.12) + Math.sin(x * 0.007 + t * sp * (1 + lyr * 0.3) + lyr) * 40 * S
            + Math.sin(x * 0.018 - t * sp * 1.4) * 22 * S;
          ctx.lineTo(x, lvy);
        }
        ctx.lineTo(W, H); ctx.closePath();
        var lvg = ctx.createLinearGradient(0, H * 0.4, 0, H);
        lvg.addColorStop(0, U.rgba(lyr % 2 ? U.accent2 : U.accent, 0.2));
        lvg.addColorStop(1, U.rgba(U.accent, 0.05));
        ctx.fillStyle = lvg;
        ctx.fill();
      }
    }

    else if (kind === 'rays-bg') {
      for (i = 0; i < n * 1.4; i++) {
        var rayA = i / (n * 1.4) * Math.PI * 2 + t * sp * 0.06;
        var rayW = 0.012 + 0.03 * Math.abs(Math.sin(i * 1.4 + t * sp * 0.4));
        var rgd2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
        rgd2.addColorStop(0, U.rgba(U.accent, 0.16));
        rgd2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = rgd2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rayA - rayW) * Math.max(W, H), cy + Math.sin(rayA - rayW) * Math.max(W, H));
        ctx.lineTo(cx + Math.cos(rayA + rayW) * Math.max(W, H), cy + Math.sin(rayA + rayW) * Math.max(W, H));
        ctx.closePath();
        ctx.fill();
      }
    }

    else if (kind === 'crack') {
      ctx.strokeStyle = U.rgba(U.accent, 0.5);
      ctx.lineCap = 'round';
      for (i = 0; i < n; i++) {
        var ckx = U.rng(i * 7) * W, cky = U.rng(i * 11 + 3) * H;
        var ckA = U.rng(i + 17) * Math.PI * 2;
        var ckLen = base * (0.3 + U.rng(i + 27) * 0.7);
        var ckGrow = U.clamp((t * sp - i * 0.06) / 0.9, 0, 1);
        ctx.beginPath();
        ctx.moveTo(ckx, cky);
        var cxx = ckx, cyy = cky;
        var csegs = 9;
        for (var cs2 = 0; cs2 < csegs * ckGrow; cs2++) {
          ckA += (U.rng(i * 31 + cs2 * 7) - 0.5) * 1.2;
          cxx += Math.cos(ckA) * ckLen / csegs;
          cyy += Math.sin(ckA) * ckLen / csegs;
          ctx.lineTo(cxx, cyy);
        }
        ctx.lineWidth = (3.4 - i * 0.12) * S;
        ctx.stroke();
      }
    }

    else if (kind === 'fog') {
      for (i = 0; i < 5; i++) {
        var fx4 = cx + Math.sin(t * sp * 0.22 + i * 1.8) * W * 0.34;
        var fy4 = cy + Math.cos(t * sp * 0.18 + i * 2.3) * H * 0.28;
        var fg4 = ctx.createRadialGradient(fx4, fy4, 0, fx4, fy4, base * 1.1);
        fg4.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.14));
        fg4.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = fg4;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else {
      ctx.fillStyle = U.rgba(U.accent, 0.08);
      ctx.fillRect(0, 0, W, H);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  MF.forge({
    cat: '背景循环', type: 'block', dur: 8, poster: 0.6,
    params: BG_PARAMS, draw: bgDraw,
    ids: [
      { id: 'bg-grid-pan', name: '网格平移', tags: ['网格', '科技'], desc: '网格持续平移并带中心光晕，最通用的科技感底纹。', cfg: { kind: 'grid-pan' } },
      { id: 'bg-particle', name: '粒子场', tags: ['粒子', '氛围'], desc: '光点轻柔漂浮的粒子场，安静且有空间感。', cfg: { kind: 'particle-field' } },
      { id: 'bg-aurora', name: '极光背景', tags: ['极光', '梦幻'], desc: '多层极光带缓慢起伏，梦幻氛围直接拉满。', cfg: { kind: 'aurora-bg' } },
      { id: 'bg-matrix', name: '矩阵雨', tags: ['矩阵', '赛博'], desc: '数字字符如瀑布般下落，黑客与赛博的经典符号。', cfg: { kind: 'matrix-rain' } },
      { id: 'bg-noise', name: '噪声扭曲', tags: ['噪声', '有机'], desc: '噪声驱动的扭曲线条，有机流动感强。', cfg: { kind: 'noise-warp' } },
      { id: 'bg-waves', name: '波浪层', tags: ['波浪', '层次'], desc: '多层波浪叠加起伏，层次柔和。', cfg: { kind: 'wave-layers', density: 16 } },
      { id: 'bg-topo', name: '等高线', tags: ['等高线', '地图'], desc: '等高线式闭合曲线缓慢变化，地图与地理主题感强。', cfg: { kind: 'topo', size: 700} },
      { id: 'bg-mesh', name: '渐变网格', tags: ['渐变', '色彩'], desc: '多色光团融合流动的渐变网格，非常现代。', cfg: { kind: 'gradient-mesh' } },
      { id: 'bg-stars', name: '星空漂移', tags: ['星空', '宇宙'], desc: '星空缓慢横向漂移并闪烁，安静而深邃。', cfg: { kind: 'starfield-bg' } },
      { id: 'bg-bokeh', name: '散景背景', tags: ['散景', '柔美'], desc: '散景光斑缓慢漂浮，柔美摄影感。', cfg: { kind: 'bokeh-bg' } },
      { id: 'bg-hex', name: '蜂窝底纹', tags: ['蜂窝', '科技'], desc: '蜂窝网格带同心脉冲，科技与工业主题底纹。', cfg: { kind: 'hex-bg' } },
      { id: 'bg-scanlines', name: '扫描线', tags: ['扫描', '复古'], desc: 'CRT 扫描线与扫描光带叠加，复古显示器质感。', cfg: { kind: 'scanlines' } },
      { id: 'bg-dots', name: '点阵底纹', tags: ['点阵', '呼吸'], desc: '点阵底纹随波动呼吸，干净且规律。', cfg: { kind: 'dots-bg' } },
      { id: 'bg-stripes', name: '斜条纹', tags: ['条纹', '速度'], desc: '斜条纹持续流动，带速度与警示的意味。', cfg: { kind: 'stripes' } },
      { id: 'bg-circuit', name: '电路板', tags: ['电路', '硬件'], desc: '电路走线与焊点构成硬件感背景，科技硬件主题首选。', cfg: { kind: 'circuit' } },
      { id: 'bg-blueprint', name: '蓝图', tags: ['蓝图', '工程'], desc: '工程蓝图网格与标注线，专业与工程感强。', cfg: { kind: 'blueprint' } },
      { id: 'bg-liquid', name: '液态流动', tags: ['液态', '柔和'], desc: '多层液态波纹缓慢流动，柔和且有层次。', cfg: { kind: 'liquid-bg' } },
      { id: 'bg-rays', name: '放射线', tags: ['放射', '光感'], desc: '放射状光线缓慢旋转，中心光感明确。', cfg: { kind: 'rays-bg' } },
      { id: 'bg-crack', name: '裂纹生长', tags: ['裂纹', '张力'], desc: '裂纹自随机点向外蔓延生长，张力与破碎感强。', cfg: { kind: 'crack' } },
      { id: 'bg-fog', name: '迷雾', tags: ['迷雾', '氛围'], desc: '流动的迷雾缓慢弥漫，氛围柔和且有空间深度。', cfg: { kind: 'fog' } }
    ]
  });
})();

/* ════════ assets/js/effects-13.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 13
   原语：镜头运动 / 形变转换 / 加载与进度
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  /* ══════════════════════════ 镜头运动 ══════════════════════════ */

  var CAM_PARAMS = [
    P('kind', '运镜方式', 'push-in', sel('push-in', [
      ['push-in', '推近'], ['pull-out', '拉远'], ['orbit', '环绕'], ['shake', '手持抖动'],
      ['tilt', '倾斜俯仰'], ['whip-pan', '甩镜'], ['parallax', '视差层'], ['crane', '升降'],
      ['dolly-zoom', '推拉变焦'], ['roll', '翻滚'], ['zoom-punch', '冲击缩放'], ['pan-lr', '左右横移'],
      ['pan-ud', '上下纵移'], ['focus-pull', '移焦'], ['handheld', '手持漫步'], ['spiral-cam', '螺旋运镜']
    ])),
    P('text', '画面标题', 'SCENE', txt('SCENE')),
    P('size', '场景尺度', 300, rng(300, 100, 600, 4)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('intensity', '幅度', 0.7, rng(0.7, 0.15, 1.6, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function camDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var sp = Math.max(0.1, p.speed);
    var kind = p.kind;
    var amp = p.intensity;
    var base = p.size * S;
    var tl = t * sp;
    var zoom = 1, panX = 0, panY = 0, rot = 0, tiltX = 0, skewY = 0;
    var i;

    if (kind === 'push-in') { zoom = 1 + e.inOutCubic(U.clamp(tl / 5, 0, 1)) * 0.55 * amp; }
    else if (kind === 'pull-out') { zoom = 1.6 - e.inOutCubic(U.clamp(tl / 5, 0, 1)) * 0.6 * amp; }
    else if (kind === 'orbit') { panX = Math.sin(tl * 0.5) * base * 0.4 * amp; panY = Math.cos(tl * 0.5) * base * 0.16 * amp; }
    else if (kind === 'shake') {
      panX = U.noise(tl * 5.2, 3) * 20 * S * amp;
      panY = U.noise(tl * 4.6, 11) * 20 * S * amp;
      rot = U.noise(tl * 3.4, 17) * 0.02 * amp;
    }
    else if (kind === 'tilt') { tiltX = Math.sin(tl * 0.5) * 0.4 * amp; rot = Math.sin(tl * 0.35) * 0.12 * amp; }
    else if (kind === 'whip-pan') {
      var wp = (tl * 0.45) % 1;
      panX = (wp < 0.5 ? e.outExpo(wp * 2) : 1 - e.inExpo((wp - 0.5) * 2)) * base * 1.1 * amp;
      if (wp > 0.42 && wp < 0.58) { ctx.save(); ctx.globalAlpha = Math.abs(wp - 0.5) * 6; ctx.filter = 'blur(' + (16 * S).toFixed(1) + 'px)'; ctx.fillStyle = U.rgba(U.accent, 0.3); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    }
    else if (kind === 'parallax') { panX = Math.sin(tl * 0.4) * base * 0.34 * amp; }
    else if (kind === 'crane') { panY = Math.sin(tl * 0.42) * base * 0.5 * amp; rot = Math.sin(tl * 0.42) * 0.05; }
    else if (kind === 'dolly-zoom') {
      var dz = Math.sin(tl * 0.4) * 0.5 + 0.5;
      zoom = 1 + dz * 0.45 * amp;
      panY = (1 - dz) * 0.0;
      skewY = (1 - dz) * 0.0;
    }
    else if (kind === 'roll') { rot = tl * 0.5 * amp; }
    else if (kind === 'zoom-punch') {
      var zp = (tl * 0.6) % 1;
      zoom = 1 + Math.max(0, 1 - zp * 2.4) * 0.4 * amp;
    }
    else if (kind === 'pan-lr') { panX = ((tl * 0.3) % 1 - 0.5) * base * 1.4 * amp; }
    else if (kind === 'pan-ud') { panY = ((tl * 0.3) % 1 - 0.5) * base * 1.4 * amp; }
    else if (kind === 'focus-pull') {
      zoom = 1.12 + Math.sin(tl * 0.55) * 0.12 * amp;
    }
    else if (kind === 'handheld') {
      panX = U.noise(tl * 1.4, 5) * 34 * S * amp;
      panY = U.noise(tl * 1.1, 9) * 24 * S * amp;
      rot = U.noise(tl * 0.8, 13) * 0.05 * amp;
      zoom = 1.06 + U.noise(tl * 0.6, 21) * 0.04;
    }
    else if (kind === 'spiral-cam') {
      var srad = base * 0.3 * amp;
      panX = Math.cos(tl * 0.6) * srad;
      panY = Math.sin(tl * 0.6) * srad * 0.5;
      rot = tl * 0.16 * amp;
      zoom = 1 + (tl % 4.5) / 4.5 * 0.3;
    }

    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.scale(zoom, zoom);
    if (tiltX) ctx.transform(1, 0, tiltX * 0.3, 1, 0, 0);
    ctx.translate(-cx + panX, -cy + panY);

    /* ---- 场景：透视地面网格 ---- */
    var horizon = cy - base * 0.15;
    ctx.strokeStyle = U.rgba(U.ink, 0.1);
    ctx.lineWidth = 1.4 * S;
    ctx.beginPath();
    for (i = -10; i <= 10; i++) {
      ctx.moveTo(cx + i * base * 0.2, H);
      ctx.lineTo(cx + i * base * 0.03, horizon);
    }
    for (i = 1; i <= 9; i++) {
      var fy = H - Math.pow(i / 9, 2) * (H - horizon);
      ctx.moveTo(0, fy); ctx.lineTo(W, fy);
    }
    ctx.stroke();

    /* ---- 场景：散布的方块（不同视差深度） ---- */
    for (i = 0; i < 11; i++) {
      var depth = U.rng(i * 7 + 1);
      var bx4 = W * 0.08 + U.rng(i * 11 + 3) * W * 0.84;
      var by4 = horizon + (H - horizon) * (0.15 + depth * 0.75);
      var bsize = base * (0.06 + depth * 0.18);
      var bwob = Math.sin(tl * 1.2 + i) * 8 * S;
      var bg5 = ctx.createLinearGradient(bx4 - bsize / 2, by4 - bsize, bx4 + bsize / 2, by4);
      bg5.addColorStop(0, U.rgba(U.mix(U.bg2, U.accent, 0.5), 0.92));
      bg5.addColorStop(1, U.rgba(U.mix(U.bg1, U.accent2, 0.4), 0.92));
      ctx.fillStyle = bg5;
      U.rr(ctx, bx4 - bsize / 2, by4 - bsize * 1.4 + bwob, bsize, bsize * 1.4, 8 * S);
      ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
    }

    /* ---- 场景：中心标题 ---- */
    ctx.font = U.fs(base * 0.3, 900);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var tg2 = ctx.createLinearGradient(cx - base * 0.6, 0, cx + base * 0.6, 0);
    tg2.addColorStop(0, U.ink);
    tg2.addColorStop(1, U.mix(U.ink, U.accent, 0.6));
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 40 * S * p.glow; }
    ctx.fillStyle = tg2;
    ctx.fillText(String(p.text || ''), cx, cy - base * 0.42);
    ctx.shadowBlur = 0;

    ctx.restore();

    /* 取景框 */
    ctx.save();
    ctx.strokeStyle = U.rgba(U.ink, 0.18);
    ctx.lineWidth = 2 * S;
    ctx.setLineDash([16 * S, 12 * S]);
    var m = 34 * S;
    ctx.strokeRect(m, m, W - m * 2, H - m * 2);
    ctx.setLineDash([]);
    ctx.font = U.fs(20 * S, 700);
    ctx.fillStyle = U.rgba(U.ink, 0.4);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('REC ●', m + 14 * S, m + 12 * S);
    ctx.restore();
  }

  MF.forge({
    cat: '镜头运动', type: 'block', dur: 6, poster: 0.6,
    params: CAM_PARAMS, draw: camDraw,
    ids: [
      { id: 'cm-push-in', name: '推近', tags: ['推近', '聚焦'], desc: '镜头缓慢推近，画面逐渐聚焦，是最基础的运镜。', cfg: { kind: 'push-in' } },
      { id: 'cm-pull-out', name: '拉远', tags: ['拉远', '展开'], desc: '镜头由近拉远，揭示更大的空间与全貌。', cfg: { kind: 'pull-out' } },
      { id: 'cm-orbit', name: '环绕', tags: ['环绕', '空间'], desc: '镜头围绕主体横向环绕，空间感与立体感强。', cfg: { kind: 'orbit' } },
      { id: 'cm-shake', name: '手持抖动', tags: ['抖动', '真实'], desc: '噪声驱动的手持抖动，真实且有纪录片质感。', cfg: { kind: 'shake' } },
      { id: 'cm-tilt', name: '倾斜俯仰', tags: ['俯仰', '动感'], desc: '镜头带倾斜与透视变化，画面更有张力。', cfg: { kind: 'tilt' } },
      { id: 'cm-whip-pan', name: '甩镜', tags: ['甩镜', '转场'], desc: '高速甩镜并带运动模糊，是最常用的转场式运镜。', cfg: { kind: 'whip-pan' } },
      { id: 'cm-parallax', name: '视差层', tags: ['视差', '深度'], desc: '近远景以不同速度移动，制造强烈的空间深度。', cfg: { kind: 'parallax' } },
      { id: 'cm-crane', name: '升降', tags: ['升降', '宏大'], desc: '镜头整体升降，适合展示规模与宏大场景。', cfg: { kind: 'crane' } },
      { id: 'cm-dolly-zoom', name: '推拉变焦', tags: ['眩晕', '希区柯克'], desc: '推近同时变焦的眩晕效果，情绪张力极强。', cfg: { kind: 'dolly-zoom' } },
      { id: 'cm-roll', name: '翻滚', tags: ['翻滚', '动感'], desc: '镜头持续旋转翻滚，动感与眩晕感并存。', cfg: { kind: 'roll' } },
      { id: 'cm-zoom-punch', name: '冲击缩放', tags: ['冲击', '节奏'], desc: '周期性快速缩放形成的冲击节奏，适合卡点剪辑。', cfg: { kind: 'zoom-punch' } },
      { id: 'cm-pan-lr', name: '左右横移', tags: ['横移', '展示'], desc: '镜头左右平移，像在空间中横向巡视。', cfg: { kind: 'pan-lr' } },
      { id: 'cm-pan-ud', name: '上下纵移', tags: ['纵移', '展示'], desc: '镜头上下平移，适合展示竖直结构与长图。', cfg: { kind: 'pan-ud' } },
      { id: 'cm-focus-pull', name: '移焦', tags: ['移焦', '呼吸'], desc: '焦距缓慢变化产生的呼吸感，气质柔和。', cfg: { kind: 'focus-pull' } },
      { id: 'cm-handheld', name: '手持漫步', tags: ['手持', '自然'], desc: '复合的轻微手持运动，像摄影师边走边拍。', cfg: { kind: 'handheld' } },
      { id: 'cm-spiral', name: '螺旋运镜', tags: ['螺旋', '迷幻'], desc: '镜头沿螺旋轨迹运动并旋转，迷幻而有沉浸感。', cfg: { kind: 'spiral-cam' } }
    ]
  });

  /* ══════════════════════════ 形变转换 ══════════════════════════ */

  var MORPH_PARAMS = [
    P('kind', '形变方式', 'circle-square', sel('circle-square', [
      ['circle-square', '圆变方'], ['polygon-interp', '多边形插值'], ['blob-liquid', '液态球体'], ['star-burst', '星爆展开'],
      ['ribbon', '丝带缠绕'], ['spring-coil', '弹簧线圈'], ['mobius', '莫比乌斯'], ['metaball', '元球融合'],
      ['fold', '折叠翻转'], ['twist', '扭曲旋转'], ['inflate', '充气膨胀'], ['shatter', '破碎重组'],
      ['merge', '合并聚合'], ['split-shape', '分裂'], ['wave-blob', '波纹形变'], ['knot', '环面纽结']
    ])),
    P('count', '数量', 6, rng(6, 2, 20, 1)),
    P('size', '尺寸', 620, rng(620, 90.0, 840.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function morphDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var n = Math.max(2, Math.round(p.count));
    var i, a;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    var grd = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
    grd.addColorStop(0, U.accent);
    grd.addColorStop(1, U.accent2);
    ctx.strokeStyle = grd;
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 26 * S * p.glow; }

    if (kind === 'circle-square') {
      var cs = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      cs = e.inOutCubic(cs);
      ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var ca = Math.PI * 2 * i / 200;
        var crx = Math.max(Math.abs(Math.cos(ca)), Math.abs(Math.sin(ca)));
        var circR = base * 0.34;
        var sqR = base * 0.34 / Math.max(0.0001, crx);
        var rad = U.lerp(circR, Math.min(sqR, base * 0.5), cs);
        var px6 = cx + Math.cos(ca) * rad, py6 = cy + Math.sin(ca) * rad;
        if (i) ctx.lineTo(px6, py6); else ctx.moveTo(px6, py6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'polygon-interp') {
      /* n 边形 ↔ (n+4) 边形真实插值：按角度求各自多边形半径再 lerp */
      var sidesA = Math.max(3, n), sidesB = Math.max(3, n + 4);
      var ip = e.inOutCubic(Math.sin(t * sp * 0.6) * 0.5 + 0.5);
      var spin = t * sp * 0.18;
      function polyR(ang, sides) {
        var seg = Math.PI * 2 / sides;
        var loc = ((ang + spin) % seg + seg) % seg - seg / 2;
        return base * 0.38 * Math.cos(seg / 2) / Math.cos(loc);
      }
      ctx.beginPath();
      var STEPS = 160;
      for (i = 0; i <= STEPS; i++) {
        var pa = Math.PI * 2 * i / STEPS - Math.PI / 2;
        var rr = U.lerp(polyR(pa, sidesA), polyR(pa, sidesB), ip);
        var fx6 = cx + Math.cos(pa) * rr, fy6 = cy + Math.sin(pa) * rr;
        if (i) ctx.lineTo(fx6, fy6); else ctx.moveTo(fx6, fy6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'blob-liquid' || kind === 'wave-blob') {
      ctx.beginPath();
      for (i = 0; i <= 240; i++) {
        var ba = Math.PI * 2 * i / 240;
        var noiseV = U.noise(ba * 1.6 + t * sp * 1.2, 5) * 0.5 + U.noise(ba * 3.2 - t * sp * 0.8, 9) * 0.3;
        var brad = base * 0.34 * (1 + noiseV * 0.28);
        var bx5 = cx + Math.cos(ba) * brad, by5 = cy + Math.sin(ba) * brad;
        if (i) ctx.lineTo(bx5, by5); else ctx.moveTo(bx5, by5);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'star-burst') {
      var spikes = Math.max(4, n);
      var grow = e.outElastic(U.clamp((t * sp % 3.4) / 1.6, 0, 1));
      ctx.beginPath();
      for (i = 0; i <= spikes * 2; i++) {
        var sa = Math.PI * i / spikes - Math.PI / 2;
        var srr = (i % 2 ? base * 0.16 : base * 0.44) * (0.4 + grow * 0.6);
        var sx6 = cx + Math.cos(sa) * srr, sy6 = cy + Math.sin(sa) * srr;
        if (i) ctx.lineTo(sx6, sy6); else ctx.moveTo(sx6, sy6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'ribbon') {
      var ribbonN = Math.max(8, n * 4);
      for (var pass2 = 0; pass2 < 3; pass2++) {
        ctx.beginPath();
        for (i = 0; i <= ribbonN; i++) {
          var rf2 = i / ribbonN;
          var rba = rf2 * Math.PI * 2 * 2.2 + t * sp * 0.8;
          var rrad2 = base * 0.4 * (1 - rf2 * 0.4);
          var rx3 = cx + Math.cos(rba) * rrad2 + (pass2 - 1) * 14 * S;
          var ry4 = cy + Math.sin(rba * 1.6) * rrad2 * 0.72 + (pass2 - 1) * 8 * S;
          if (i) ctx.lineTo(rx3, ry4); else ctx.moveTo(rx3, ry4);
        }
        ctx.lineWidth = (7 - pass2 * 1.8) * S;
        ctx.globalAlpha = 0.55 + pass2 * 0.22;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spring-coil') {
      var coils2 = Math.max(5, n);
      var ch2 = (coils2 - 1) * 0.6;
      ctx.beginPath();
      for (i = 0; i <= coils2 * 26; i++) {
        var cf2 = i / (coils2 * 26);
        var cang3 = cf2 * Math.PI * 2 * coils2 + t * sp * 2;
        var crad3 = base * 0.3;
        var cxx2 = cx + Math.cos(cang3) * crad3;
        var cyy2 = cy - ch2 * base * 0.5 + cf2 * ch2 * base;
        if (i) ctx.lineTo(cxx2, cyy2); else ctx.moveTo(cxx2, cyy2);
      }
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'mobius') {
      ctx.beginPath();
      for (i = 0; i <= 360; i++) {
        var mf = i / 360;
        var ma = mf * Math.PI * 2;
        var mr = base * 0.32;
        var mx6 = cx + Math.cos(ma) * mr * (1 + 0.5 * Math.cos(ma / 2 + t * sp));
        var my6 = cy + Math.sin(ma) * mr * (1 + 0.5 * Math.cos(ma / 2 + t * sp));
        if (i) ctx.lineTo(mx6, my6); else ctx.moveTo(mx6, my6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'metaball') {
      var orbs = Math.max(3, n - 2);
      for (i = 0; i < orbs; i++) {
        var moa = i / orbs * Math.PI * 2 + t * sp * 0.5;
        var mod = base * 0.18;
        var mox = cx + Math.cos(moa) * mod;
        var moy = cy + Math.sin(moa) * mod;
        var mor = base * 0.2 * (1 + 0.2 * Math.sin(t * sp * 2 + i));
        var mg3 = ctx.createRadialGradient(mox, moy, 0, mox, moy, mor * 1.6);
        mg3.addColorStop(0, U.rgba(U.mix(U.accent, U.accent2, i / orbs), 0.9));
        mg3.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = mg3;
        ctx.beginPath(); ctx.arc(mox, moy, mor * 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'fold') {
      var foldP = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      var foldW = base * 0.7, foldH = base * 0.5;
      for (i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(i * Math.PI / 2 + t * sp * 0.2);
        var fScale = Math.abs(Math.cos(foldP * Math.PI + i * 0.4));
        ctx.scale(1, Math.max(0.06, fScale));
        ctx.beginPath();
        ctx.rect(-foldW / 2, -foldH / 2, foldW, foldH);
        ctx.lineWidth = 5 * S;
        ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'twist') {
      var twN = Math.max(6, n * 2);
      for (var ti3 = 0; ti3 < twN; ti3++) {
        var tf3 = ti3 / (twN - 1);
        ctx.beginPath();
        for (i = 0; i <= 80; i++) {
          var ttf = i / 80;
          var ttang = ttf * Math.PI * 2 + tf3 * 2.2 + t * sp * 1.2;
          var ttrad = base * 0.36 * (0.4 + tf3 * 0.6);
          var ttx3 = cx + Math.cos(ttang) * ttrad;
          var tty3 = cy + Math.sin(ttang) * ttrad * 0.6 + (tf3 - 0.5) * base * 1.1;
          if (i) ctx.lineTo(ttx3, tty3); else ctx.moveTo(ttx3, tty3);
        }
        ctx.lineWidth = 3 * S;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'inflate') {
      for (var layer2 = 0; layer2 < 4; layer2++) {
        var iph = ((t * sp * 0.4 + layer2 / 4) % 1);
        var ir = base * 0.5 * Math.pow(iph, 0.7);
        ctx.globalAlpha = (1 - iph) * 0.75;
        ctx.beginPath();
        for (i = 0; i <= 120; i++) {
          var ia = Math.PI * 2 * i / 120;
          var irad = ir * (1 + 0.1 * Math.sin(ia * 6 + t * sp * 3));
          var ix2 = cx + Math.cos(ia) * irad, iy2 = cy + Math.sin(ia) * irad;
          if (i) ctx.lineTo(ix2, iy2); else ctx.moveTo(ix2, iy2);
        }
        ctx.closePath();
        ctx.lineWidth = 4 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'shatter') {
      var pieces = Math.max(8, n * 3);
      var cycle3 = 3.4 / sp;
      var sct = (t % cycle3) / cycle3;
      var explodeP = sct < 0.5 ? e.outExpo(sct * 2) : 1 - e.inOutCubic((sct - 0.5) * 2);
      for (i = 0; i < pieces; i++) {
        var sha = U.rng(i) * Math.PI * 2;
        var shd = base * 0.55 * explodeP * (0.4 + U.rng(i + 9) * 1.1);
        var shx = cx + Math.cos(sha) * shd;
        var shy = cy + Math.sin(sha) * shd;
        var shs = base * 0.1 * (1 - explodeP * 0.35);
        ctx.save();
        ctx.translate(shx, shy);
        ctx.rotate(t * sp * 1.4 + i);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        U.rr(ctx, -shs / 2, -shs / 2, shs, shs, 3 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'merge') {
      var orbs2 = Math.max(4, n);
      var mergeP = (Math.sin(t * sp * 0.55) * 0.5 + 0.5);
      for (i = 0; i < orbs2; i++) {
        var mma = i / orbs2 * Math.PI * 2 + t * sp * 0.3;
        var mmd = base * 0.42 * (1 - mergeP * 0.9);
        var mmx = cx + Math.cos(mma) * mmd;
        var mmy = cy + Math.sin(mma) * mmd;
        var mmr = base * 0.14 * (0.7 + mergeP * 0.6);
        var mmg = ctx.createRadialGradient(mmx, mmy, 0, mmx, mmy, mmr * 1.5);
        mmg.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0.9));
        mmg.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = mmg;
        ctx.beginPath(); ctx.arc(mmx, mmy, mmr * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'split-shape') {
      var spP = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      for (i = -1; i <= 1; i += 2) {
        ctx.save();
        ctx.translate(cx + i * spP * base * 0.42, cy);
        ctx.rotate(i * spP * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, base * 0.26, 0, Math.PI * 2);
        ctx.lineWidth = 5 * S;
        ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'knot') {
      ctx.beginPath();
      for (i = 0; i <= 400; i++) {
        var kf2 = i / 400;
        var ka = kf2 * Math.PI * 2;
        var kR = base * 0.3;
        var kx3 = cx + (kR + kR * 0.4 * Math.cos(3 * ka)) * Math.cos(2 * ka + t * sp * 0.5);
        var ky3 = cy + (kR + kR * 0.4 * Math.cos(3 * ka)) * Math.sin(2 * ka + t * sp * 0.5);
        if (i) ctx.lineTo(kx3, ky3); else ctx.moveTo(kx3, ky3);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else {
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.34, 0, Math.PI * 2);
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    ctx.restore();
  }

  MF.forge({
    cat: '形变转换', type: 'block', dur: 6, poster: 0.55,
    params: MORPH_PARAMS, draw: morphDraw,
    ids: [
      { id: 'mo-circle-square', name: '圆变方', tags: ['形变', '基础'], desc: '圆角在圆与方之间平滑过渡，是最直观的形变演示。', cfg: { kind: 'circle-square' } },
      { id: 'mo-polygon', name: '多边形插值', tags: ['多边形', '过渡'], desc: '多边形在边数之间连续插值变形，数学感强。', cfg: { kind: 'polygon-interp', count: 5 } },
      { id: 'mo-blob', name: '液态球体', tags: ['液态', '有机'], desc: '边缘由噪声驱动的液态形变，有机且生动。', cfg: { kind: 'blob-liquid' } },
      { id: 'mo-star-burst', name: '星爆展开', tags: ['星爆', '弹性'], desc: '星形带弹性展开，冲击与庆祝感兼备。', cfg: { kind: 'star-burst', count: 9 } },
      { id: 'mo-ribbon', name: '丝带缠绕', tags: ['丝带', '柔美'], desc: '多条丝带缠绕旋转，柔美且优雅。', cfg: { kind: 'ribbon' } },
      { id: 'mo-spring', name: '弹簧线圈', tags: ['弹簧', '机械'], desc: '弹簧线圈持续旋转压缩，机械结构感强。', cfg: { kind: 'spring-coil', count: 7 } },
      { id: 'mo-mobius', name: '莫比乌斯', tags: ['莫比乌斯', '拓扑'], desc: '莫比乌斯环的拓扑形态持续变形，神秘且优雅。', cfg: { kind: 'mobius' } },
      { id: 'mo-metaball', name: '元球融合', tags: ['元球', '融合'], desc: '多个光球互相吸引融合，流体般的融合感。', cfg: { kind: 'metaball', count: 6 } },
      { id: 'mo-fold', name: '折叠翻转', tags: ['折叠', '立体'], desc: '多层结构不断折叠翻转，立体感突出。', cfg: { kind: 'fold' } },
      { id: 'mo-twist', name: '扭曲旋转', tags: ['扭曲', '立体'], desc: '大量线条带扭曲旋转，形成立体螺旋结构。', cfg: { kind: 'twist', count: 9 } },
      { id: 'mo-inflate', name: '充气膨胀', tags: ['膨胀', '脉冲'], desc: '形状一波波向外充气膨胀，节奏明显。', cfg: { kind: 'inflate' } },
      { id: 'mo-shatter', name: '破碎重组', tags: ['破碎', '重组'], desc: '形状炸裂成碎片再重新聚合，循环往复。', cfg: { kind: 'shatter', count: 10 } },
      { id: 'mo-merge', name: '合并聚合', tags: ['合并', '聚合'], desc: '多个光球向中心聚合后又散开，循环有序。', cfg: { kind: 'merge', count: 7 } },
      { id: 'mo-split', name: '分裂', tags: ['分裂', '对称'], desc: '单一形状分裂为两半并分离，再合并回来。', cfg: { kind: 'split-shape' } },
      { id: 'mo-knot', name: '环面纽结', tags: ['纽结', '拓扑'], desc: '环面纽结曲线持续旋转，复杂而优雅。', cfg: { kind: 'knot' } },
      { id: 'mo-wave-blob', name: '波纹形变', tags: ['波纹', '有机'], desc: '边缘波纹式起伏的液态形变，柔和有呼吸感。', cfg: { kind: 'wave-blob' } }
    ]
  });

  /* ══════════════════════════ 加载与进度 ══════════════════════════ */

  var PROG_PARAMS = [
    P('kind', '进度形态', 'bar', sel('bar', [
      ['bar', '进度条'], ['bar-stripes', '条纹进度'], ['ring', '环形进度'], ['dots', '点阵加载'],
      ['steps', '步骤进度'], ['percent', '百分比滚动'], ['segments', '分段进度'], ['upload', '上传进度'],
      ['loading-text', '加载文案'], ['bounce-dots', '弹跳点'], ['square-flip', '方块翻转'], ['wave-load', '波浪加载'],
      ['counter', '计数加载'], ['battery-charge', '电池充能'], ['circle-arrow', '圆环旋转'], ['ladder', '阶梯进度'],
      ['pulse-bar', '脉冲条'], ['hashtag', '井号旋转'], ['clock-progress', '时钟进度'], ['fill-reveal', '填充揭示']
    ])),
    P('text', '主文案', '加载中', txt('加载中')),
    P('sub', '副文案', '请稍候', txt('请稍候')),
    P('size', '尺寸', 360.0, rng(360.0, 2156, 912.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function progDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var ink = U.ink;
    var label = String(p.text || '');
    var sub = String(p.sub || '');
    var i;
    var cyc = (t * sp * 0.32) % 1.25;
    var prog = U.clamp(cyc, 0, 1);

    ctx.save();
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.7); ctx.shadowBlur = 22 * S * p.glow; }
    var grad = ctx.createLinearGradient(cx - base * 0.5, 0, cx + base * 0.5, 0);
    grad.addColorStop(0, U.accent);
    grad.addColorStop(1, U.accent2);

    if (kind === 'bar' || kind === 'bar-stripes' || kind === 'pulse-bar') {
      var bw5 = base * 1.4, bh5 = 34 * S;
      U.rr(ctx, cx - bw5 / 2, cy - bh5 / 2, bw5, bh5, bh5 / 2);
      ctx.fillStyle = U.rgba(ink, 0.1);
      ctx.fill();
      ctx.save();
      U.rr(ctx, cx - bw5 / 2, cy - bh5 / 2, bw5, bh5, bh5 / 2);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillRect(cx - bw5 / 2, cy - bh5 / 2, bw5 * prog, bh5);
      if (kind === 'bar-stripes') {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFFFF';
        var soff2 = (t * sp * 90) % (26 * S);
        for (i = -6; i < bw5 / (26 * S) + 6; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - bw5 / 2 + i * 26 * S + soff2, cy - bh5);
          ctx.lineTo(cx - bw5 / 2 + i * 26 * S + soff2 + 12 * S, cy + bh5);
          ctx.lineTo(cx - bw5 / 2 + i * 26 * S + soff2 + 20 * S, cy + bh5);
          ctx.lineTo(cx - bw5 / 2 + i * 26 * S + soff2 + 8 * S, cy - bh5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (kind === 'pulse-bar') {
        var pg4 = ctx.createLinearGradient(cx - bw5 / 2, 0, cx + bw5 / 2, 0);
        pg4.addColorStop(0, U.rgba(U.accent, 0));
        pg4.addColorStop(Math.max(0, prog - 0.16), U.rgba('#FFFFFF', 0.6));
        pg4.addColorStop(prog, U.rgba('#FFFFFF', 0));
        ctx.fillStyle = pg4;
        ctx.fillRect(cx - bw5 / 2, cy - bh5 / 2, bw5, bh5);
      }
      ctx.restore();
      ctx.font = U.fs(28 * S, 800);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), cx - bw5 / 2, cy - bh5 / 2 - 34 * S);
      ctx.textAlign = 'right';
      ctx.fillStyle = U.accent;
      ctx.fillText(Math.round(prog * 100) + '%', cx + bw5 / 2, cy - bh5 / 2 - 34 * S);
    }

    else if (kind === 'ring' || kind === 'circle-arrow' || kind === 'clock-progress') {
      var R5 = base * 0.42;
      ctx.beginPath();
      ctx.arc(cx, cy, R5, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(ink, 0.12);
      ctx.lineWidth = 24 * S;
      ctx.lineCap = 'round';
      ctx.stroke();
      if (kind === 'ring') {
        ctx.beginPath();
        ctx.arc(cx, cy, R5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 24 * S;
        ctx.stroke();
      } else if (kind === 'clock-progress') {
        var tick = Math.floor(prog * 12);
        for (i = 0; i < 12; i++) {
          var tka = i / 12 * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tka) * R5 * 0.82, cy + Math.sin(tka) * R5 * 0.82);
          ctx.lineTo(cx + Math.cos(tka) * R5 * 0.95, cy + Math.sin(tka) * R5 * 0.95);
          ctx.strokeStyle = i < tick ? U.accent : U.rgba(ink, 0.2);
          ctx.lineWidth = 8 * S;
          ctx.stroke();
        }
      } else {
        var arrA = t * sp * 3;
        ctx.beginPath();
        ctx.arc(cx, cy, R5, arrA, arrA + Math.PI * 0.5);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 24 * S;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(arrA + 0.5) * R5, cy + Math.sin(arrA + 0.5) * R5);
        ctx.lineTo(cx + Math.cos(arrA + 0.5) * (R5 + 28 * S), cy + Math.sin(arrA + 0.5) * (R5 + 28 * S));
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = 10 * S;
        ctx.stroke();
      }
      ctx.font = U.fs(64 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(prog * 100) + '%', cx, cy + 4 * S);
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 18), cx, cy + R5 + 52 * S);
    }

    else if (kind === 'dots' || kind === 'bounce-dots') {
      var dn2 = Math.max(3, Math.round(base / 60));
      var dotGap = base * 0.24;
      for (i = 0; i < dn2; i++) {
        var dph = kind === 'bounce-dots' ? Math.abs(Math.sin(t * sp * 2 - i * 0.7)) : U.clamp((t * sp * 1.4 - i * 0.22) % 1.4, 0, 1);
        var dyy = kind === 'bounce-dots' ? -dph * 40 * S : 0;
        var drr2 = kind === 'bounce-dots' ? 16 * S : (8 + dph * 12) * S;
        ctx.globalAlpha = kind === 'bounce-dots' ? 1 : 0.3 + dph * 0.7;
        ctx.beginPath();
        ctx.arc(cx + (i - (dn2 - 1) / 2) * dotGap, cy + dyy, drr2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.font = U.fs(26 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 18), cx, cy + 70 * S);
    }

    else if (kind === 'steps' || kind === 'ladder') {
      var stepN = 5;
      var activeStep = Math.floor(prog * stepN);
      var stepGap = base * 0.9 / (stepN - 1);
      for (i = 0; i < stepN; i++) {
        var stx2 = cx - base * 0.45 + i * stepGap;
        var stir = i <= activeStep;
        var spop = stir ? e.outBack(U.clamp((t * sp * 4 - i * 0.6), 0, 1)) : 0.6;
        var sr3 = 20 * S * spop;
        ctx.beginPath();
        ctx.arc(stx2, cy, sr3, 0, Math.PI * 2);
        ctx.fillStyle = stir ? U.accent : U.rgba(ink, 0.16);
        ctx.fill();
        if (i < stepN - 1) {
          ctx.strokeStyle = i < activeStep ? U.accent : U.rgba(ink, 0.14);
          ctx.lineWidth = 5 * S;
          ctx.beginPath();
          ctx.moveTo(stx2 + sr3 + 4 * S, cy);
          ctx.lineTo(stx2 + stepGap - sr3 - 4 * S, cy);
          ctx.stroke();
        }
        if (stir) {
          ctx.font = U.fs(20 * S, 800);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = U.bg1;
          ctx.fillText(String(i + 1), stx2, cy + 1 * S);
        }
      }
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(label.slice(0, 16), cx, cy + 70 * S);
    }

    else if (kind === 'percent' || kind === 'counter') {
      var num3 = Math.round(prog * 100);
      ctx.font = U.fs(base * 0.62, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var pg5 = ctx.createLinearGradient(cx - base * 0.35, 0, cx + base * 0.35, 0);
      pg5.addColorStop(0, U.ink);
      pg5.addColorStop(1, U.accent);
      ctx.fillStyle = pg5;
      ctx.fillText(String(num3) + (kind === 'percent' ? '%' : ''), cx, cy - 12 * S);
      var bw6 = base * 1.1;
      U.rr(ctx, cx - bw6 / 2, cy + base * 0.42, bw6, 12 * S, 6 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      U.rr(ctx, cx - bw6 / 2, cy + base * 0.42, bw6 * prog, 12 * S, 6 * S);
      ctx.fillStyle = grad; ctx.fill();
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 18), cx, cy + base * 0.62);
    }

    else if (kind === 'segments') {
      var segN = 22;
      var segW = base * 1.3 / segN;
      var filled = Math.floor(prog * segN);
      for (i = 0; i < segN; i++) {
        var segOn = i < filled;
        ctx.globalAlpha = segOn ? 1 : 0.16;
        ctx.fillStyle = segOn ? (i % 3 === 2 ? U.accent2 : U.accent) : ink;
        U.rr(ctx, cx - base * 0.65 + i * segW, cy - 22 * S, segW * 0.62, 44 * S, 4 * S);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(label.slice(0, 16), cx, cy + 74 * S);
    }

    else if (kind === 'upload') {
      var arrY = cy - base * 0.3 + Math.abs(Math.sin(t * sp * 2)) * 16 * S;
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 7 * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, arrY + 40 * S);
      ctx.lineTo(cx, arrY);
      ctx.moveTo(cx - 20 * S, arrY + 20 * S);
      ctx.lineTo(cx, arrY);
      ctx.lineTo(cx + 20 * S, arrY + 20 * S);
      ctx.stroke();
      var uw = base * 1.3;
      U.rr(ctx, cx - uw / 2, cy + base * 0.16, uw, 16 * S, 8 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      U.rr(ctx, cx - uw / 2, cy + base * 0.16, uw * prog, 16 * S, 8 * S);
      ctx.fillStyle = grad; ctx.fill();
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 20) + ' · ' + Math.round(prog * 100) + '%', cx, cy + base * 0.34);
    }

    else if (kind === 'loading-text') {
      var dotsN = Math.floor(t * sp * 2.4) % 4;
      ctx.font = U.fs(base * 0.24, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.letterSpacing = '4px';
      ctx.fillText(label.slice(0, 14) + '...'.slice(0, dotsN), cx, cy - 16 * S);
      ctx.letterSpacing = '0px';
      var lw3 = base * 1.1;
      U.rr(ctx, cx - lw3 / 2, cy + 52 * S, lw3, 10 * S, 5 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      var lrunner = (t * sp * 0.5) % 1.4 - 0.2;
      U.rr(ctx, cx - lw3 / 2 + lw3 * Math.max(0, lrunner), cy + 52 * S, lw3 * 0.22, 10 * S, 5 * S);
      ctx.fillStyle = grad; ctx.fill();
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.5);
      ctx.fillText(sub.slice(0, 20), cx, cy + 108 * S);
    }

    else if (kind === 'square-flip') {
      var sqN = 4;
      for (i = 0; i < sqN; i++) {
        var sqp = (t * sp * 1.4 - i * 0.2) % (sqN * 0.4);
        var sqf = sqp < 0 ? 0 : U.clamp(sqp / 0.4, 0, 1);
        var sqScale = Math.abs(Math.cos(sqf * Math.PI));
        var sqx3 = cx + (i - (sqN - 1) / 2) * 70 * S;
        ctx.save();
        ctx.translate(sqx3, cy);
        ctx.scale(Math.max(0.06, sqScale), 1);
        ctx.fillStyle = U.accent;
        U.rr(ctx, -24 * S, -24 * S, 48 * S, 48 * S, 8 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 18), cx, cy + 78 * S);
    }

    else if (kind === 'wave-load') {
      var wlw = base * 1.4;
      U.rr(ctx, cx - wlw / 2, cy - 30 * S, wlw, 60 * S, 30 * S);
      ctx.fillStyle = U.rgba(ink, 0.1); ctx.fill();
      ctx.save();
      U.rr(ctx, cx - wlw / 2, cy - 30 * S, wlw, 60 * S, 30 * S);
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(cx - wlw / 2, cy + 30 * S);
      for (i = 0; i <= 120; i++) {
        var wlx = cx - wlw / 2 + (i / 120) * wlw;
        var wly = cy - 30 * S + (1 - prog) * 60 * S + Math.sin(i * 0.3 + t * sp * 3) * 6 * S;
        ctx.lineTo(wlx, wly);
      }
      ctx.lineTo(cx + wlw / 2, cy + 30 * S);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      ctx.font = U.fs(26 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(prog * 100) + '%', cx, cy + 1 * S);
    }

    else if (kind === 'battery-charge') {
      var bw7 = base * 1.2, bh7 = bw7 * 0.42;
      U.rr(ctx, cx - bw7 / 2, cy - bh7 / 2, bw7, bh7, 12 * S);
      ctx.strokeStyle = U.rgba(ink, 0.4);
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      U.rr(ctx, cx + bw7 / 2 - 4 * S, cy - bh7 * 0.16, 16 * S, bh7 * 0.32, 5 * S);
      ctx.fillStyle = U.rgba(ink, 0.4); ctx.fill();
      var pad2 = 10 * S;
      U.rr(ctx, cx - bw7 / 2 + pad2, cy - bh7 / 2 + pad2, (bw7 - pad2 * 2) * prog, bh7 - pad2 * 2, 6 * S);
      var bcg = ctx.createLinearGradient(cx - bw7 / 2, 0, cx + bw7 / 2, 0);
      bcg.addColorStop(0, U.accent);
      bcg.addColorStop(1, U.accent2);
      ctx.fillStyle = bcg;
      ctx.fill();
      var bolt = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * S);
      bolt.addColorStop(0, U.rgba('#FFFFFF', 0.8 * (1 - Math.abs(prog - 0.5) * 2)));
      bolt.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = bolt;
      ctx.beginPath(); ctx.arc(cx, cy, 40 * S, 0, Math.PI * 2); ctx.fill();
      ctx.font = U.fs(26 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14) + ' ' + Math.round(prog * 100) + '%', cx, cy + bh7 / 2 + 46 * S);
    }

    else if (kind === 'hashtag') {
      var hrot = t * sp * 1.6;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(hrot);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 12 * S;
      ctx.lineCap = 'round';
      for (i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * 22 * S - 8 * S, -58 * S);
        ctx.lineTo(i * 22 * S + 8 * S, 58 * S);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-58 * S, i * 22 * S - 8 * S);
        ctx.lineTo(58 * S, i * 22 * S + 8 * S);
        ctx.stroke();
      }
      ctx.restore();
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.65);
      ctx.fillText(sub.slice(0, 18), cx, cy + base * 0.4);
    }

    else if (kind === 'fill-reveal') {
      ctx.save();
      ctx.font = U.fs(base * 0.3, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.16);
      ctx.fillText(label.slice(0, 10), cx, cy - 20 * S);
      ctx.beginPath();
      ctx.rect(0, cy + 20 * S - base * 0.5 * prog, W, base * 0.5 * prog + base * 0.5);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillText(label.slice(0, 10), cx, cy - 20 * S);
      ctx.restore();
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.5);
      ctx.fillText(sub.slice(0, 18) + ' · ' + Math.round(prog * 100) + '%', cx, cy + base * 0.4);
    }

    else {
      var dbw = base * 1.4;
      U.rr(ctx, cx - dbw / 2, cy - 16 * S, dbw, 32 * S, 16 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      U.rr(ctx, cx - dbw / 2, cy - 16 * S, dbw * prog, 32 * S, 16 * S);
      ctx.fillStyle = grad; ctx.fill();
    }

    ctx.restore();
  }

  MF.forge({
    cat: '加载与进度', type: 'component', dur: 6, poster: 0.6,
    params: PROG_PARAMS, draw: progDraw,
    ids: [
      { id: 'pr-bar', name: '进度条', tags: ['进度', '基础'], desc: '最经典的横向进度条，循环推进。', cfg: { kind: 'bar', size: 1540} },
      { id: 'pr-bar-stripes', name: '条纹进度', tags: ['条纹', '动感'], desc: '带流动条纹的进度条，动感更强。', cfg: { kind: 'bar-stripes' } },
      { id: 'pr-ring', name: '环形进度', tags: ['环形', '简洁'], desc: '环形进度条并在中心显示百分比。', cfg: { kind: 'ring', size: 1540} },
      { id: 'pr-dots', name: '点阵加载', tags: ['点阵', '简约'], desc: '一串圆点依次放大变亮，简洁的加载表达。', cfg: { kind: 'dots' } },
      { id: 'pr-steps', name: '步骤进度', tags: ['步骤', '流程'], desc: '多段步骤逐级点亮并连线，适合流程进度。', cfg: { kind: 'steps', size: 1540} },
      { id: 'pr-percent', name: '百分比滚动', tags: ['百分比', '数字'], desc: '超大百分比数字滚动并带底部进度条。', cfg: { kind: 'percent' } },
      { id: 'pr-segments', name: '分段进度', tags: ['分段', '科技'], desc: '分段式进度条逐格点亮，科技感强。', cfg: { kind: 'segments', size: 1540} },
      { id: 'pr-upload', name: '上传进度', tags: ['上传', '箭头'], desc: '上传箭头配合底部进度条，明确传达上传中状态。', cfg: { kind: 'upload', size: 1540} },
      { id: 'pr-loading-text', name: '加载文案', tags: ['文案', '等待'], desc: '加载文案省略号循环加上流光进度条。', cfg: { kind: 'loading-text', size: 1540} },
      { id: 'pr-bounce-dots', name: '弹跳点', tags: ['弹跳', '轻量'], desc: '圆点依次弹跳，轻量且通用的等待动画。', cfg: { kind: 'bounce-dots' } },
      { id: 'pr-square-flip', name: '方块翻转', tags: ['方块', '节奏'], desc: '方块依次翻转，节奏感强，适合品牌化加载。', cfg: { kind: 'square-flip' } },
      { id: 'pr-wave-load', name: '波浪加载', tags: ['波浪', '填充'], desc: '液体波浪逐渐填满容器，生动且有进度感。', cfg: { kind: 'wave-load' } },
      { id: 'pr-counter', name: '计数加载', tags: ['计数', '数字'], desc: '纯数字计数加载，极简风格。', cfg: { kind: 'counter' } },
      { id: 'pr-battery', name: '电池充能', tags: ['电池', '能量'], desc: '电池电量逐步充满并带光效，能量感直观。', cfg: { kind: 'battery-charge', size: 1540} },
      { id: 'pr-circle-arrow', name: '圆环旋转', tags: ['旋转', '等待'], desc: '带箭头的圆环持续旋转，明确的处理中状态。', cfg: { kind: 'circle-arrow' } },
      { id: 'pr-ladder', name: '阶梯进度', tags: ['阶梯', '进阶'], desc: '阶梯状节点逐级点亮，隐喻进阶与成长。', cfg: { kind: 'ladder' } },
      { id: 'pr-pulse-bar', name: '脉冲条', tags: ['脉冲', '节奏'], desc: '进度条上有一道脉冲光带持续前推。', cfg: { kind: 'pulse-bar', size: 1540} },
      { id: 'pr-hashtag', name: '井号旋转', tags: ['井号', '品牌'], desc: '旋转的井号图形，社交与话题主题的加载表达。', cfg: { kind: 'hashtag' } },
      { id: 'pr-clock', name: '时钟进度', tags: ['时钟', '时间'], desc: '表盘刻度逐格点亮模拟时间推进。', cfg: { kind: 'clock-progress' } },
      { id: 'pr-fill-reveal', name: '填充揭示', tags: ['填充', '文字'], desc: '色块自下而上填满文字，加载完成感强烈。', cfg: { kind: 'fill-reveal', size: 1540} }
    ]
  });
})();

/* ════════ assets/js/effects-14.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 14
   原语：涂鸦手绘（笔画渐进揭示） / 徽章印章（盖章与徽章动画）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：涂鸦手绘 ══════════════════════════ */

  var SCRIBBLE_PARAMS = [
    P('kind', '笔画', 'circle', sel('circle', [
      ['circle', '手绘圆圈'], ['underline', '手绘下划线'], ['arrow', '手绘箭头'],
      ['box', '手绘方框'], ['check', '手绘对勾'], ['cross', '手绘叉号'],
      ['star', '手绘星星'], ['heart', '手绘爱心'], ['highlight', '荧光笔涂抹'],
      ['loop', '循环圈'], ['spiral', '手绘螺旋'], ['cloud', '思考云'],
      ['double-circle', '双圈强调'], ['strike', '手绘删除线'], ['bracket', '手绘大括号'],
      ['flow', '手绘流程图'], ['burst', '爆炸强调线'], ['underline-wave', '波浪下划线']
    ])),
    P('text', '文字', '划重点', txt('划重点')),
    P('size', '字号', 211, rng(211, 36, 295, 2)),
    P('stroke', '笔宽', 7, rng(7, 2, 22, 0.5)),
    P('speed', '绘制速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('wobble', '手抖幅度', 6, rng(6, 0, 18, 0.5)),
    P('ink2', '笔迹颜色', '$accent', col('$accent')),
    P('glow', '辉光', 0.3, rng(0.3, 0, 1, 0.05))
  ];

  function scribbleDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var k = e.inOutCubic(U.clamp(t * p.speed / 2.4, 0, 1));
    var alpha = U.clamp(t * 3, 0, 1) * U.clamp((U.D - t) * 2.2, 0, 1);
    var lw = p.stroke * S;
    var wob = p.wobble * S;
    var col = U.rgba(p.ink2, alpha);
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = lw;
    ctx.strokeStyle = col;
    if (p.glow > 0.03) { ctx.shadowColor = U.rgba(p.ink2, 0.7 * p.glow); ctx.shadowBlur = 18 * S * p.glow; }

    /* 按进度揭示一条折线路径 */
    function stroke(pts) {
      var n = pts.length;
      var m = Math.max(2, Math.round(n * k));
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < m; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }
    /* 生成带手抖的路径点 */
    function jig(pts) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        out.push([
          pts[i][0] + (U.rnd(-1, 1, i * 3 + 1)) * wob,
          pts[i][1] + (U.rnd(-1, 1, i * 3 + 2)) * wob
        ]);
      }
      return out;
    }

    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var i, a, pts, r;
    var label = String(p.text || '');
    ctx.fillStyle = U.rgba(U.ink, alpha);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    var kind = p.kind;
    if (kind === 'circle' || kind === 'double-circle') {
      var size = ctx.measureText ? 0 : 0;
      ctx.font = U.fs(fs, 800);
      var tw = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.fillText(label, cx, cy - fs * 0.15);
      r = tw * 0.56;
      pts = [];
      for (i = 0; i <= 44; i++) {
        a = (i / 44) * Math.PI * 2.24 - 2.2;
        var rr2 = r * (1 + 0.05 * Math.sin(i * 0.7));
        pts.push([cx + Math.cos(a) * rr2, cy + fs * 0.28 + Math.sin(a) * rr2 * 0.42]);
      }
      stroke(jig(pts));
      if (kind === 'double-circle' && k > 0.55) {
        var k2 = e.outCubic(U.clamp((k - 0.55) / 0.4, 0, 1));
        ctx.save(); ctx.globalAlpha = alpha * k2 * 0.75; ctx.lineWidth = lw * 0.62;
        stroke(jig(pts.map(function (q) { return [q[0] + lw * 0.9, q[1] - lw * 0.7]; })));
        ctx.restore();
      }
    } else if (kind === 'underline' || kind === 'underline-wave') {
      ctx.font = U.fs(fs, 800);
      var tw2 = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.fillText(label, cx, cy);
      pts = [];
      for (i = 0; i <= 36; i++) {
        var xx = cx - tw2 / 2 + (i / 36) * tw2;
        var yy = cy + fs * 0.62;
        if (kind === 'underline-wave') yy += Math.sin(i * 0.9) * fs * 0.09;
        pts.push([xx, yy]);
      }
      ctx.lineWidth = lw * 1.1;
      stroke(jig(pts));
    } else if (kind === 'arrow') {
      ctx.font = U.fs(fs, 800);
      ctx.fillText(label, cx - fs * 0.4, cy);
      pts = jig([[cx + fs * 0.7, cy - fs * 0.5], [cx + fs * 2.0, cy + fs * 0.3]]);
      stroke(pts);
      var hk = e.outCubic(U.clamp((k - 0.7) / 0.3, 0, 1));
      if (hk > 0.01) {
        var tipX = cx + fs * 2.0, tipY = cy + fs * 0.3;
        pts = jig([[tipX - fs * 0.42 * hk, tipY - fs * 0.3 * hk], [tipX, tipY], [tipX - fs * 0.5 * hk, tipY + fs * 0.1 * hk]]);
        stroke(pts);
      }
    } else if (kind === 'box') {
      ctx.font = U.fs(fs, 800);
      var tw3 = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.fillText(label, cx, cy);
      var bw = tw3 * 1.16, bh = fs * 1.5;
      pts = jig([[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2], [cx + bw / 2, cy + bh / 2], [cx - bw / 2, cy + bh / 2], [cx - bw / 2, cy - bh / 2]]);
      stroke(pts);
    } else if (kind === 'check' || kind === 'cross') {
      var u2 = fs * 0.9;
      if (kind === 'check') {
        stroke(jig([[cx - u2, cy], [cx - u2 * 0.2, cy + u2 * 0.6]]));
        if (k > 0.4) { var kk = U.clamp((k - 0.4) / 0.55, 0, 1); ctx.save(); ctx.beginPath(); ctx.moveTo(cx - u2 * 0.2, cy + u2 * 0.6); ctx.lineTo(cx - u2 * 0.2 + (u2 * 1.5) * kk, cy + u2 * 0.6 - (u2 * 1.7) * kk); ctx.stroke(); ctx.restore(); }
      } else {
        stroke(jig([[cx - u2 * 0.7, cy - u2 * 0.7], [cx + u2 * 0.7, cy + u2 * 0.7]]));
        if (k > 0.45) { var k3 = U.clamp((k - 0.45) / 0.5, 0, 1); ctx.save(); ctx.beginPath(); ctx.moveTo(cx + u2 * 0.7, cy - u2 * 0.7); ctx.lineTo(cx + u2 * 0.7 - u2 * 1.4 * k3, cy - u2 * 0.7 + u2 * 1.4 * k3); ctx.stroke(); ctx.restore(); }
      }
      ctx.font = U.fs(fs * 0.62, 700); ctx.globalAlpha = alpha * e.outCubic(k);
      ctx.fillText(label, cx, cy + fs * 1.35); ctx.globalAlpha = alpha;
    } else if (kind === 'star') {
      pts = [];
      for (i = 0; i <= 10; i++) {
        a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        r = (i % 2 ? 0.45 : 1) * fs;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      stroke(jig(pts));
      ctx.font = U.fs(fs * 0.6, 700); ctx.globalAlpha = alpha * e.outCubic(U.clamp((k - 0.6) / 0.35, 0, 1));
      ctx.fillText(label, cx, cy + fs * 1.5); ctx.globalAlpha = alpha;
    } else if (kind === 'heart') {
      pts = [];
      for (i = 0; i <= 48; i++) {
        a = Math.PI - (i / 48) * Math.PI * 2;
        var hx = 16 * Math.pow(Math.sin(a), 3) / 16;
        var hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16;
        pts.push([cx + hx * fs, cy + hy * fs]);
      }
      stroke(jig(pts));
      ctx.font = U.fs(fs * 0.5, 700); ctx.globalAlpha = alpha * e.outCubic(U.clamp((k - 0.7) / 0.3, 0, 1));
      ctx.fillText(label, cx, cy); ctx.globalAlpha = alpha;
    } else if (kind === 'highlight') {
      ctx.font = U.fs(fs, 800);
      var tw4 = Math.max(fs * 2, ctx.measureText(label).width);
      var hk2 = e.outCubic(k);
      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      var hy2 = cy + fs * 0.06;
      var grad = ctx.createLinearGradient(cx - tw4 / 2, 0, cx - tw4 / 2 + tw4 * hk2, 0);
      grad.addColorStop(0, U.rgba(p.ink2, 0.85)); grad.addColorStop(1, U.rgba(p.ink2, 0.55));
      ctx.fillStyle = grad;
      ctx.fillRect(cx - tw4 / 2, hy2 - fs * 0.42, tw4 * hk2, fs * 0.84);
      ctx.restore();
      ctx.fillStyle = U.rgba(U.ink, alpha);
      ctx.fillText(label, cx, cy);
    } else if (kind === 'loop') {
      pts = [];
      for (i = 0; i <= 60; i++) {
        a = (i / 60) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * fs * 0.9, cy + Math.sin(a * 2) * fs * 0.34]);
      }
      stroke(jig(pts));
    } else if (kind === 'spiral') {
      pts = [];
      for (i = 0; i <= 80; i++) {
        a = (i / 80) * Math.PI * 5;
        r = fs * 0.12 * i;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      stroke(jig(pts));
    } else if (kind === 'cloud') {
      ctx.font = U.fs(fs * 0.55, 700);
      var tw5 = Math.max(fs, ctx.measureText(label).width);
      r = fs * 0.85;
      pts = [];
      for (i = 0; i <= 64; i++) {
        a = (i / 64) * Math.PI * 2;
        var rr3 = r * (1 + 0.22 * Math.sin(a * 5 + 1.2));
        pts.push([cx + Math.cos(a) * rr3 * 1.5, cy + Math.sin(a) * rr3 * 0.85]);
      }
      stroke(jig(pts));
      ctx.globalAlpha = alpha * e.outCubic(U.clamp((k - 0.6) / 0.35, 0, 1));
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(label, cx, cy);
      pts = jig([[cx + fs * 0.3, cy + fs * 0.75], [cx + fs * 0.1, cy + fs * 1.05], [cx + fs * 0.42, cy + fs * 1.0]]);
      ctx.save(); ctx.globalAlpha = alpha * 0.7; stroke(pts); ctx.restore();
      ctx.globalAlpha = alpha;
    } else if (kind === 'strike') {
      ctx.font = U.fs(fs, 800);
      var tw6 = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.globalAlpha = alpha * (1 - 0.55 * e.outCubic(U.clamp((k - 0.5) / 0.4, 0, 1)));
      ctx.fillText(label, cx, cy); ctx.globalAlpha = alpha;
      pts = jig([[cx - tw6 / 2 - fs * 0.1, cy - fs * 0.12], [cx + tw6 / 2 + fs * 0.1, cy + fs * 0.18]]);
      stroke(pts);
    } else if (kind === 'bracket') {
      ctx.font = U.fs(fs, 800);
      ctx.fillText(label, cx + fs * 0.3, cy);
      var bh2 = fs * 1.5, bx = cx - fs * 1.4;
      pts = jig([[bx + fs * 0.35, cy - bh2 / 2], [bx, cy - bh2 / 2], [bx, cy + bh2 / 2], [bx + fs * 0.35, cy + bh2 / 2]]);
      stroke(pts);
    } else if (kind === 'flow') {
      var steps = label.split(/[,，|]/).filter(Boolean).slice(0, 4);
      if (!steps.length) steps = ['想法', '行动', '结果'];
      var gap = W * 0.62 / steps.length;
      for (i = 0; i < steps.length; i++) {
        var fx = W * 0.19 + i * gap;
        var shown = e.outCubic(U.clamp((k - i * 0.16) / 0.3, 0, 1));
        ctx.globalAlpha = alpha * shown;
        ctx.font = U.fs(fs * 0.52, 700);
        ctx.fillStyle = U.rgba(U.ink, 1);
        ctx.fillText(steps[i], fx, cy - fs * 0.12);
        var bw2 = Math.max(fs * 1.6, ctx.measureText(steps[i]).width + fs * 0.5);
        ctx.save(); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = col;
        stroke(jig([[fx - bw2 / 2, cy - fs * 0.72], [fx + bw2 / 2, cy - fs * 0.72], [fx + bw2 / 2, cy + fs * 0.5], [fx - bw2 / 2, cy + fs * 0.5], [fx - bw2 / 2, cy - fs * 0.72]]));
        ctx.restore();
        if (i < steps.length - 1 && k > i * 0.16 + 0.2) {
          var ak = e.outCubic(U.clamp((k - i * 0.16 - 0.2) / 0.16, 0, 1));
          ctx.globalAlpha = alpha * ak;
          var ax0 = fx + bw2 / 2 + fs * 0.1, ax1 = fx + gap - bw2 / 2 - fs * 0.1;
          stroke(jig([[ax0, cy - fs * 0.1], [U.lerp(ax0, ax1, ak), cy - fs * 0.1]]));
        }
        ctx.globalAlpha = alpha;
      }
    } else if (kind === 'burst') {
      ctx.font = U.fs(fs, 800);
      ctx.fillText(label, cx, cy);
      for (var b = 0; b < 9; b++) {
        var ba = -Math.PI * 0.9 + (b / 8) * Math.PI * 1.15;
        var bk = e.outCubic(U.clamp((k - b * 0.04) / 0.5, 0, 1));
        if (bk <= 0.02) continue;
        var r0 = fs * 0.95, r1 = fs * (0.95 + 0.75 * bk);
        pts = jig([[cx + Math.cos(ba) * r0, cy + Math.sin(ba) * r0 * 0.8], [cx + Math.cos(ba) * r1, cy + Math.sin(ba) * r1 * 0.8]]);
        ctx.save(); ctx.lineWidth = lw * 0.6; ctx.globalAlpha = alpha * bk; stroke(pts); ctx.restore();
      }
      ctx.globalAlpha = alpha;
    } else {
      stroke(jig([[cx - fs, cy], [cx + fs, cy]]));
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：徽章印章 ══════════════════════════ */

  var BADGE_PARAMS = [
    P('kind', '形态', 'stamp-slam', sel('stamp-slam', [
      ['stamp-slam', '印章砸落'], ['stamp-pulse', '印章脉冲'], ['badge-ribbon', '缎带徽章'],
      ['badge-verified', '认证徽章'], ['badge-coin', '硬币旋转'], ['badge-laurel', '月桂环绕'],
      ['badge-shield', '盾牌徽章'], ['stamp-ink', '油墨晕染'], ['badge-seal', '环形文字印章'],
      ['badge-medal', '奖牌绶带'], ['stamp-wobble', '回弹印章'], ['badge-serial', '序号徽章']
    ])),
    P('text', '主文字', '已认证', txt('已认证')),
    P('sub', '副文字', '', txt('')),
    P('size', '尺寸', 300, rng(300, 120, 520, 4)),
    P('speed', '速度', 1, rng(1, 0.5, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.25, rng(0.25, 0, 1, 0.05))
  ];

  function badgeDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var sub = String(p.sub || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    function stampText(size, weight, color) {
      ctx.font = U.fs(size * S, weight || 800);
      ctx.fillStyle = color;
    }
    function ring(rr2, lw2, c, a1, a2) {
      ctx.beginPath();
      ctx.arc(cx, cy, rr2, a1 || 0, a2 === undefined ? Math.PI * 2 : a2);
      ctx.lineWidth = lw2 * S;
      ctx.strokeStyle = c;
      ctx.stroke();
    }
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.75 * amt); ctx.shadowBlur = 26 * S * amt; }
    }

    if (kind === 'stamp-slam' || kind === 'stamp-wobble' || kind === 'stamp-ink') {
      var hit = e.outCubic(U.clamp(tt / 0.55, 0, 1));
      var sc = 1 + (1 - hit) * 1.6;
      var rot = (1 - hit) * 0.16;
      var alpha = U.clamp(tt * 4, 0, 1);
      if (kind === 'stamp-wobble') {
        var wob2 = Math.sin(tt * 26) * Math.exp(-tt * 3.2) * 0.09;
        rot += wob2; sc = 1 + Math.abs(wob2) * 0.3;
      }
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
      var inkA = kind === 'stamp-ink' ? 0.9 : 1;
      glowOn(col, p.glow * hit);
      ring(R, R * 0.075, U.rgba(col, 0.95 * inkA * hit));
      ring(R * 0.82, R * 0.02, U.rgba(col, 0.55 * inkA * hit));
      stampText(R * 0.42, 900, U.rgba(col, inkA * hit));
      ctx.fillText(label, cx, cy - (sub ? R * 0.08 : 0));
      if (sub) { stampText(R * 0.16, 600, U.rgba(col, 0.8 * inkA * hit)); ctx.fillText(sub, cx, cy + R * 0.34); }
      ctx.shadowBlur = 0;
      var i2;
      for (i2 = 0; i2 < 12; i2++) {
        var a2 = (i2 / 12) * Math.PI * 2 + 0.26;
        var r2 = R * 0.93;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2, R * 0.028, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.9 * inkA * hit);
        ctx.fill();
      }
    } else if (kind === 'stamp-pulse') {
      var base = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      var pulse = 1 + Math.sin(tt * 3.4) * 0.018;
      ctx.translate(cx, cy); ctx.scale(base * pulse, base * pulse); ctx.translate(-cx, -cy);
      glowOn(col, p.glow);
      ring(R, R * 0.08, U.rgba(col, 0.95));
      ring(R * 0.86, R * 0.016, U.rgba(col, 0.5));
      stampText(R * 0.4, 900, U.rgba(col, 1));
      ctx.fillText(label, cx, cy);
      var pk = (tt * 0.9) % 1;
      ctx.globalAlpha = (1 - pk) * 0.5 * U.clamp(tt, 0, 1);
      ring(R * (0.9 + pk * 0.5), R * 0.03 * (1 - pk), U.rgba(col, 1));
    } else if (kind === 'badge-ribbon' || kind === 'badge-medal') {
      var open = e.outBack(U.clamp(tt / 0.85, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.2, 0, 1);
      var rw = R * 0.42 * open, rh = R * 0.9;
      glowOn(col, p.glow * 0.5);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.beginPath();
      ctx.moveTo(cx - rw * 0.55, cy - rh * 0.15);
      ctx.lineTo(cx - rw, cy + rh * 0.85);
      ctx.lineTo(cx - rw * 0.55, cy + rh * 0.62);
      ctx.lineTo(cx - rw * 0.2, cy + rh * 0.8);
      ctx.lineTo(cx - rw * 0.28, cy - rh * 0.1);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + rw * 0.55, cy - rh * 0.15);
      ctx.lineTo(cx + rw, cy + rh * 0.85);
      ctx.lineTo(cx + rw * 0.55, cy + rh * 0.62);
      ctx.lineTo(cx + rw * 0.2, cy + rh * 0.8);
      ctx.lineTo(cx + rw * 0.28, cy - rh * 0.1);
      ctx.closePath(); ctx.fill();
      var medalR = R * 0.5 * open;
      var mg = ctx.createLinearGradient(cx - medalR, cy - medalR, cx + medalR, cy + medalR);
      mg.addColorStop(0, U.rgba(col, 1)); mg.addColorStop(1, U.rgba(U.mix(col, U.accent2, 0.45), 1));
      ctx.beginPath(); ctx.arc(cx, cy - R * 0.06, medalR, 0, Math.PI * 2);
      ctx.fillStyle = mg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - R * 0.06, medalR * 0.78, 0, Math.PI * 2);
      ctx.lineWidth = R * 0.022 * S; ctx.strokeStyle = U.rgba(U.bg1, 0.5); ctx.stroke();
      stampText(medalR * 0.62, 900, U.rgba(U.bg1, 0.92));
      ctx.fillText(label.charAt(0) || '★', cx, cy - R * 0.06);
      if (sub) { stampText(R * 0.14, 700, U.rgba(U.ink, 0.9)); ctx.fillText(sub, cx, cy + R * 0.52); }
    } else if (kind === 'badge-verified') {
      var pop = e.outBack(U.clamp(tt / 0.6, 0, 1));
      var fade = U.clamp(tt * 3.6, 0, 1);
      ctx.globalAlpha = fade;
      glowOn(col, p.glow);
      ctx.beginPath();
      for (var s3 = 0; s3 < 24; s3++) {
        var sa = (s3 / 24) * Math.PI * 2;
        var sr = R * 0.52 * (1 + 0.06 * Math.sin(sa * 8)) * pop;
        if (!s3) ctx.moveTo(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr);
        else ctx.lineTo(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr);
      }
      ctx.closePath();
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      var ck = e.outCubic(U.clamp((tt - 0.35) / 0.4, 0, 1));
      ctx.lineWidth = R * 0.075 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = U.rgba(U.bg1, 0.95);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.2, cy - R * 0.02);
      ctx.lineTo(cx - R * 0.05, cy + R * 0.13 * Math.min(1, ck * 2));
      if (ck > 0.4) ctx.lineTo(cx - R * 0.05 + R * 0.36 * U.clamp((ck - 0.4) / 0.6, 0, 1), cy + R * 0.13 - R * 0.34 * U.clamp((ck - 0.4) / 0.6, 0, 1));
      ctx.stroke();
      ctx.shadowBlur = 0;
      stampText(R * 0.2, 800, U.rgba(U.ink, fade * e.outCubic(U.clamp((tt - 0.7) / 0.4, 0, 1))));
      ctx.fillText(label, cx, cy + R * 0.85);
    } else if (kind === 'badge-coin') {
      var flip = tt * 2.2;
      var squash = Math.abs(Math.cos(flip));
      var face = Math.cos(flip) >= 0;
      var cp = e.outCubic(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var cy2 = cy + (1 - cp) * -R * 0.4;
      glowOn(col, p.glow * 0.6);
      var cg = ctx.createLinearGradient(cx - R * 0.5, cy2 - R * 0.5, cx + R * 0.5, cy2 + R * 0.5);
      cg.addColorStop(0, U.rgba(U.mix(col, U.ink, 0.3), 1));
      cg.addColorStop(1, U.rgba(col, 1));
      ctx.save();
      ctx.translate(cx, cy2);
      ctx.scale(Math.max(0.06, squash), 1);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.lineWidth = R * 0.03 * S; ctx.strokeStyle = U.rgba(U.bg1, 0.4); ctx.stroke();
      if (face) {
        stampText(R * 0.36, 900, U.rgba(U.bg1, 0.9));
        ctx.fillText(label.charAt(0) || '★', 0, 0);
      } else {
        ring(R * 0.34, R * 0.025, U.rgba(U.bg1, 0.5));
        stampText(R * 0.14, 700, U.rgba(U.bg1, 0.8));
        ctx.fillText(String(Math.max(1, Math.round(p.size / 10))), 0, 0);
      }
      ctx.restore();
      stampText(R * 0.17, 800, U.rgba(U.ink, U.clamp((tt - 0.8) / 0.4, 0, 1)));
      ctx.fillText(label, cx, cy + R * 0.8);
    } else if (kind === 'badge-laurel') {
      var grow = e.outCubic(U.clamp(tt / 1.1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var side = -1; side <= 1; side += 2) {
        for (var lf = 0; lf < 7; lf++) {
          var lk = U.clamp((grow - lf * 0.07) / 0.4, 0, 1);
          if (lk <= 0.02) continue;
          var la = -Math.PI * 0.28 + lf * 0.16;
          var lx = cx + side * Math.cos(la) * R * 0.62;
          var ly = cy + Math.sin(-la) * R * 0.62 + R * 0.12;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(side * (la + Math.PI * 0.5) * 0.6);
          ctx.scale(lk, lk);
          ctx.beginPath();
          ctx.ellipse(0, 0, R * 0.1, R * 0.035, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.mix(col, U.accent2, lf / 9), 0.95);
          ctx.fill();
          ctx.restore();
        }
      }
      glowOn(col, p.glow);
      ring(R * 0.42, R * 0.05, U.rgba(col, grow));
      stampText(R * 0.3, 900, U.rgba(col, grow));
      ctx.fillText(label.charAt(0) || '★', cx, cy);
      stampText(R * 0.18, 800, U.rgba(U.ink, e.outCubic(U.clamp((tt - 0.9) / 0.5, 0, 1))));
      ctx.fillText(label, cx, cy + R * 0.95);
      if (sub) { stampText(R * 0.12, 600, U.rgba(U.ink, 0.75)); ctx.fillText(sub, cx, cy + R * 1.18); }
    } else if (kind === 'badge-shield') {
      var up = e.outCubic(U.clamp(tt / 0.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      ctx.translate(cx, cy); ctx.scale(up, up); ctx.translate(-cx, -cy);
      glowOn(col, p.glow * 0.6);
      var sw = R * 0.72, sh = R * 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - sw, cy - sh * 0.55);
      ctx.lineTo(cx + sw, cy - sh * 0.55);
      ctx.lineTo(cx + sw, cy + sh * 0.12);
      ctx.quadraticCurveTo(cx + sw, cy + sh * 0.6, cx, cy + sh);
      ctx.quadraticCurveTo(cx - sw, cy + sh * 0.6, cx - sw, cy + sh * 0.12);
      ctx.closePath();
      ctx.fillStyle = U.rgba(col, 0.16); ctx.fill();
      ctx.lineWidth = R * 0.05 * S; ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      var ck2 = e.outCubic(U.clamp((tt - 0.5) / 0.45, 0, 1));
      ctx.lineWidth = R * 0.07 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = U.rgba(col, 1);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.22, cy - R * 0.04);
      ctx.lineTo(cx - R * 0.05, cy + R * 0.12 * Math.min(1, ck2 * 2));
      if (ck2 > 0.4) ctx.lineTo(cx - R * 0.05 + R * 0.4 * U.clamp((ck2 - 0.4) / 0.6, 0, 1), cy + R * 0.12 - R * 0.36 * U.clamp((ck2 - 0.4) / 0.6, 0, 1));
      ctx.stroke();
      stampText(R * 0.2, 800, U.rgba(U.ink, e.outCubic(U.clamp((tt - 0.9) / 0.4, 0, 1))));
      ctx.fillText(label, cx, cy + R * 1.15);
    } else if (kind === 'badge-seal') {
      var spin = e.outCubic(U.clamp(tt / 0.9, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tt * 0.18);
      var chars = (label + '  ·  ' + (sub || 'AUTHENTIC') + '  ·  ').toUpperCase();
      ctx.font = U.fs(R * 0.14, 700);
      ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.3), 0.9);
      for (var ci = 0; ci < chars.length; ci++) {
        var ca = (ci / chars.length) * Math.PI * 2;
        ctx.save();
        ctx.translate(Math.cos(ca) * R * 0.68, Math.sin(ca) * R * 0.68);
        ctx.rotate(ca + Math.PI / 2);
        ctx.fillText(chars.charAt(ci), 0, 0);
        ctx.restore();
      }
      ctx.restore();
      glowOn(col, p.glow);
      ring(R * 0.5, R * 0.05, U.rgba(col, spin));
      ring(R * 0.56, R * 0.012, U.rgba(col, spin * 0.6));
      stampText(R * 0.34, 900, U.rgba(col, spin));
      ctx.fillText((label.charAt(0) || '★'), cx, cy);
    } else if (kind === 'badge-serial') {
      var up2 = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.2, 0, 1);
      ctx.translate(cx, cy); ctx.scale(up2, up2); ctx.translate(-cx, -cy);
      glowOn(col, p.glow * 0.4);
      var bw3 = R * 1.15, bh3 = R * 0.5;
      U.rr(ctx, cx - bw3 / 2, cy - bh3 / 2, bw3, bh3, bh3 * 0.32);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      var serial = String(Math.max(1, Math.round(p.size / 10)));
      stampText(bh3 * 0.5, 900, U.rgba(U.bg1, 0.95));
      ctx.fillText('#' + serial, cx, cy);
      stampText(R * 0.19, 800, U.rgba(U.ink, e.outCubic(U.clamp((tt - 0.6) / 0.4, 0, 1))));
      ctx.fillText(label, cx, cy + bh3 * 1.15);
    } else {
      ring(R * 0.5, R * 0.05, U.rgba(col, 0.95));
      stampText(R * 0.35, 900, U.rgba(col, 1));
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '涂鸦手绘', type: 'block', dur: 5, poster: 0.5,
    params: SCRIBBLE_PARAMS, draw: scribbleDraw,
    texts: ['划重点', '别错过', '核心观点', '记住这句', '关键一步', '今天就做'],
    ids: [
      { id: 'scr-circle', name: '手绘圈重点', tags: ['圈选', '强调'], desc: '手绘圆圈围绕文字缓缓画成，是最百搭的重点强调方式。', cfg: { kind: 'circle' } },
      { id: 'scr-underline', name: '手绘下划线', tags: ['下划线', '强调'], desc: '一笔手绘下划线扫过文字底部，笔记感十足。', cfg: { kind: 'underline' } },
      { id: 'scr-arrow', name: '手绘箭头', tags: ['箭头', '指向'], desc: '手绘箭头从文字指向侧方，用于引导视线。', cfg: { kind: 'arrow' } },
      { id: 'scr-box', name: '手绘方框', tags: ['方框', '圈选'], desc: '手绘方框围住文字，比圆圈更利落的强调。', cfg: { kind: 'box' } },
      { id: 'scr-check', name: '手绘对勾', tags: ['对勾', '完成'], desc: '两笔手绘对勾，代表完成与确认。', cfg: { kind: 'check' } },
      { id: 'scr-cross', name: '手绘叉号', tags: ['叉号', '否定'], desc: '手绘叉号划过，用于否定与排除。', cfg: { kind: 'cross' } },
      { id: 'scr-star', name: '手绘星星', tags: ['星星', '推荐'], desc: '一笔画成的五角星，推荐与评分场景。', cfg: { kind: 'star' } },
      { id: 'scr-heart', name: '手绘爱心', tags: ['爱心', '喜欢'], desc: '手绘爱心围绕文字，情感表达。', cfg: { kind: 'heart' } },
      { id: 'scr-highlight', name: '荧光笔涂抹', tags: ['荧光', '高亮'], desc: '荧光笔从左到右涂抹高亮文字，笔记质感强。', cfg: { kind: 'highlight' } },
      { id: 'scr-loop', name: '循环圈', tags: ['循环', '无限'], desc: '手绘无限循环符号，表达持续与循环。', cfg: { kind: 'loop', size: 420 } },
      { id: 'scr-spiral', name: '手绘螺旋', tags: ['螺旋', '聚焦'], desc: '螺旋线由内向外画成，聚焦视觉中心。', cfg: { kind: 'spiral' } },
      { id: 'scr-cloud', name: '思考云', tags: ['云朵', '想法'], desc: '手绘思考云朵包住想法文字，头脑风暴场景。', cfg: { kind: 'cloud' } },
      { id: 'scr-double', name: '双圈强调', tags: ['双圈', '重点'], desc: '两个错位手绘圆圈叠加强调，更浓的笔记感。', cfg: { kind: 'double-circle' } },
      { id: 'scr-strike', name: '手绘删除线', tags: ['删除', '更正'], desc: '删除线划过文字并使其变淡，用于更正与否定。', cfg: { kind: 'strike' } },
      { id: 'scr-bracket', name: '手绘大括号', tags: ['括号', '归纳'], desc: '手绘大括号括起内容，归纳与注解。', cfg: { kind: 'bracket' } },
      { id: 'scr-flow', name: '手绘流程图', tags: ['流程', '步骤'], desc: '手绘方框加箭头串起步骤，逗号分隔填入阶段。', cfg: { kind: 'flow', text: '想法, 验证, 迭代, 发布' } },
      { id: 'scr-burst', name: '爆炸强调线', tags: ['爆炸', '强调'], desc: '放射状手绘短线从文字四周炸开，情绪拉满。', cfg: { kind: 'burst' } },
      { id: 'scr-wave', name: '波浪下划线', tags: ['波浪', '活泼'], desc: '波浪形手绘下划线，比直线更活泼。', cfg: { kind: 'underline-wave' } }
    ]
  });

  MF.forge({
    cat: '徽章印章', type: 'block', dur: 5, poster: 0.35,
    params: BADGE_PARAMS, draw: badgeDraw,
    texts: ['已认证', '新品上市', '限时特惠', '官方出品', '满额包邮', '爆款'],
    ids: [
      { id: 'bdg-stamp-slam', name: '印章砸落', tags: ['印章', '冲击'], desc: '印章从高处砸落并带回弹，促销与强调利器。', cfg: { kind: 'stamp-slam' } },
      { id: 'bdg-stamp-pulse', name: '印章脉冲', tags: ['印章', '呼吸'], desc: '盖章后缓慢脉冲呼吸，持续提示。', cfg: { kind: 'stamp-pulse' } },
      { id: 'bdg-ribbon', name: '缎带徽章', tags: ['缎带', '勋章'], desc: '双缎带展开托起圆形勋章，荣誉与活动场景。', cfg: { kind: 'badge-ribbon' } },
      { id: 'bdg-verified', name: '认证徽章', tags: ['认证', '对勾'], desc: '认证徽标弹出后打勾，信任感表达。', cfg: { kind: 'badge-verified' } },
      { id: 'bdg-coin', name: '硬币旋转', tags: ['硬币', '旋转'], desc: '硬币绕竖轴旋转翻转，金融与奖励场景。', cfg: { kind: 'badge-coin' } },
      { id: 'bdg-laurel', name: '月桂环绕', tags: ['月桂', '荣耀'], desc: '月桂叶逐片生长环绕徽标，冠军与荣誉感。', cfg: { kind: 'badge-laurel' } },
      { id: 'bdg-shield', name: '盾牌徽章', tags: ['盾牌', '安全'], desc: '盾牌升起后打勾，安全与保障表达。', cfg: { kind: 'badge-shield' } },
      { id: 'bdg-ink', name: '油墨晕染印章', tags: ['印章', '复古'], desc: '印章落下带油墨质感，复古票据风。', cfg: { kind: 'stamp-ink' } },
      { id: 'bdg-seal', name: '环形文字印章', tags: ['环形', '印章'], desc: '环形文字绕着印章缓慢旋转，公证与封印质感。', cfg: { kind: 'badge-seal' } },
      { id: 'bdg-medal', name: '奖牌绶带', tags: ['奖牌', '排名'], desc: '奖牌与绶带展开，排行榜与获奖场景。', cfg: { kind: 'badge-medal' } },
      { id: 'bdg-wobble', name: '回弹印章', tags: ['印章', '俏皮'], desc: '盖章后左右摇摆回弹，俏皮的强调。', cfg: { kind: 'stamp-wobble' } },
      { id: 'bdg-serial', name: '序号徽章', tags: ['序号', '限量'], desc: '圆角序号徽章弹出，限量与编号场景。', cfg: { kind: 'badge-serial' } }
    ]
  });
})();

/* ════════ assets/js/effects-15.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 15
   原语：终端代码（打字机 / 代码雨 / 日志） / 社交叙事（点赞 / 评论 / 关注）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：终端代码 ══════════════════════════ */

  var TERM_PARAMS = [
    P('kind', '形态', 'type', sel('type', [
      ['type', '命令打字'], ['output', '命令与输出'], ['progress', '终端进度条'],
      ['matrix', '代码雨'], ['log', '日志滚动'], ['boot', '开机自检'],
      ['cursor', '光标呼吸'], ['split', '分屏输出'], ['success', '成功收尾'],
      ['error', '报错抖动'], ['install', '依赖安装'], ['ascii', '字符横幅']
    ])),
    P('cmd', '命令', 'npm run dev', txt('npm run dev')),
    P('lines', '输出内容', '✓ compiled successfully\nready in 412 ms\nlistening on :3000', txt('✓ compiled successfully\nready in 412 ms\nlistening on :3000', true)),
    P('size', '字号', 158, rng(158, 18.0, 221, 1.0)),
    P('speed', '打字速度', 1, rng(1, 0.4, 2.5, 0.05)),
    P('ink2', '终端主色', '#7CFF9B', col('#7CFF9B')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function termDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var fs = p.size * S;
    var mono = U.mono;
    var green = p.ink2;
    var lines = String(p.lines || '').split('\n');
    var kind = p.kind;
    var pad = fs * 1.1;
    ctx.save();
    ctx.textBaseline = 'middle';

    function bar(x, y, w, h, k, c1, c2) {
      U.rr(ctx, x, y, w, h, h / 2);
      ctx.fillStyle = c2; ctx.fill();
      if (k > 0.01) {
        U.rr(ctx, x, y, Math.max(h, w * k), h, h / 2);
        ctx.fillStyle = c1; ctx.fill();
      }
    }

    if (kind === 'matrix') {
      var cols = Math.floor(W / (fs * 0.85));
      ctx.font = U.fs(fs * 0.8, 600, true);
      for (var c = 0; c < cols; c++) {
        var speedC = 0.5 + U.rnd(0.2, 1.3, c) * sp;
        var yBase = ((t * speedC * 240 * S) % (H + fs * 8)) - fs * 4;
        var trail = Math.floor(6 + U.rnd(0, 9, c + 40));
        for (var r2 = 0; r2 < trail; r2++) {
          var yy = yBase - r2 * fs * 0.95;
          if (yy < -fs || yy > H + fs) continue;
          var a = (1 - r2 / trail) * 0.9;
          var ch = String.fromCharCode(0x30A0 + Math.floor(U.rng(c * 97 + r2) * 96));
          ctx.fillStyle = U.rgba(r2 === 0 ? '#FFFFFF' : green, r2 === 0 ? 0.95 : a * 0.85);
          ctx.fillText(ch, c * fs * 0.85 + fs * 0.2, yy);
        }
      }
    } else if (kind === 'type' || kind === 'cursor') {
      var chars = kind === 'cursor' ? '' : String(p.cmd || '');
      var n = Math.floor(chars.length * e.linear(U.clamp(t * sp / 1.8, 0, 1)));
      var shown = chars.slice(0, n);
      var caretOn = kind === 'cursor' ? (Math.sin(t * 5) > -0.2) : (Math.sin(t * 9) > 0 || n < chars.length);
      var y0 = H / 2;
      if (kind === 'type') {
        ctx.font = U.fs(fs * 0.5, 600, true);
        ctx.fillStyle = U.rgba(U.ink, 0.55);
        ctx.fillText('~ $', pad, y0 - fs * 0.85);
      }
      ctx.font = U.fs(fs, 600, true);
      if (p.glow > 0.03) { ctx.shadowColor = U.rgba(green, 0.8 * p.glow); ctx.shadowBlur = 20 * S * p.glow; }
      ctx.fillStyle = U.rgba(green, 1);
      ctx.textAlign = 'left';
      ctx.fillText(shown, pad * 2.6, y0);
      var cw = ctx.measureText(shown).width;
      if (caretOn) {
        ctx.fillRect(pad * 2.6 + cw + fs * 0.12, y0 - fs * 0.55, fs * 0.55, fs * 1.1);
      }
    } else if (kind === 'output' || kind === 'success' || kind === 'error') {
      var cmd2 = String(p.cmd || '');
      var tn = Math.floor(cmd2.length * e.linear(U.clamp(t * sp / 1.5, 0, 1)));
      ctx.font = U.fs(fs * 0.62, 600, true);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText('$ ' + cmd2.slice(0, tn) + (tn < cmd2.length ? '▌' : ''), pad, H * 0.24);
      var isErr = kind === 'error';
      var shake = isErr && t > 1.6 ? Math.sin((t - 1.6) * 55) * Math.exp(-(t - 1.6) * 5) * 8 * S : 0;
      ctx.save();
      ctx.translate(shake, 0);
      for (var li = 0; li < lines.length; li++) {
        var at = 1.7 + li * 0.55;
        var lk = e.outCubic(U.clamp((t * sp - at) / 0.4, 0, 1));
        if (lk <= 0.01) continue;
        var ly = H * 0.24 + fs * 1.5 + li * fs * 1.25;
        ctx.globalAlpha = lk;
        var colLine = isErr && li === lines.length - 1 ? '#FF5A5A' : green;
        if (p.glow > 0.03) { ctx.shadowColor = U.rgba(colLine, 0.7 * p.glow); ctx.shadowBlur = 14 * S * p.glow; }
        ctx.fillStyle = U.rgba(colLine, 1);
        ctx.fillText(String(lines[li]).slice(0, Math.ceil(String(lines[li]).length * lk)), pad, ly);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      if (kind === 'success' && t * sp > 1.7 + lines.length * 0.55) {
        var ok = e.outBack(U.clamp((t * sp - 1.7 - lines.length * 0.55) / 0.5, 0, 1));
        ctx.globalAlpha = ok;
        ctx.fillStyle = U.rgba(green, 0.9);
        ctx.fillText('✔ done in ' + (t).toFixed(1) + 's', pad, H * 0.24 + fs * 1.5 + lines.length * fs * 1.25 + fs * 0.4);
      }
      ctx.restore();
    } else if (kind === 'progress') {
      var pk = e.inOutCubic(U.clamp((t * sp - 0.4) / 2.2, 0, 1));
      var label = 'downloading ' + (p.cmd || 'package.tar.gz');
      ctx.font = U.fs(fs * 0.5, 600, true);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, pad, H * 0.4);
      bar(pad, H * 0.4 + fs * 0.7, W - pad * 2, fs * 0.7, pk, U.rgba(green, 1), U.rgba(green, 0.15));
      ctx.fillStyle = U.rgba(green, 0.95);
      ctx.fillText(Math.round(pk * 100) + '%', W - pad - fs * 1.6, H * 0.4 + fs * 0.7 + fs * 1.4);
    } else if (kind === 'install') {
      var pk2 = e.linear(U.clamp((t * sp - 0.3) / 2.6, 0, 1));
      var total = 42;
      var done = Math.round(total * pk2);
      ctx.font = U.fs(fs * 0.5, 600, true);
      ctx.textAlign = 'left';
      for (var pi = 0; pi < Math.min(lines.length || 6, 6); pi++) {
        var st = pi < done / Math.ceil(total / 6) ? '✓' : (pi === Math.floor(done / Math.ceil(total / 6)) ? '•' : ' ');
        ctx.fillStyle = U.rgba(st === '✓' ? green : U.ink, st === ' ' ? 0.25 : 0.9);
        ctx.fillText(st + ' ' + ['resolve', 'fetch', 'link', 'build', 'bundle', 'finish'][pi], pad, H * 0.3 + pi * fs * 0.95);
      }
      bar(pad, H * 0.78, W - pad * 2, fs * 0.5, pk2, U.rgba(green, 1), U.rgba(green, 0.12));
      ctx.fillStyle = U.rgba(green, 0.9);
      ctx.fillText(done + '/' + total + ' packages', W - pad, H * 0.78 - fs * 0.7);
    } else if (kind === 'log' || kind === 'boot') {
      var rowH = fs * 1.05;
      var rows = Math.floor((H * 0.7) / rowH);
      var pool = kind === 'boot' ? ['BIOS check ......... OK', 'memory 32768K ..... OK', 'loading kernel .... OK', 'mounting disk ..... OK', 'network eth0 ...... UP', 'starting service .. OK'] : lines.concat(['[info] heartbeat ok', '[info] cache warm', '[info] queue drained', '[warn] retry #1', '[info] reconnect ok']);
      if (!pool.length) pool = ['[info] service started'];
      var scroll = Math.floor(Math.max(0, t * sp - 0.6) * 3.2);
      ctx.font = U.fs(fs * 0.5, 500, true);
      ctx.textAlign = 'left';
      for (var ri = 0; ri < rows; ri++) {
        var idx = scroll + ri;
        if (idx >= pool.length + scroll) break;
        var content = pool[idx % pool.length];
        var ly2 = H * 0.16 + ri * rowH;
        var tagOk = /OK|ok|UP|✓/.test(content);
        ctx.fillStyle = U.rgba(tagOk ? green : U.ink, 0.15 + 0.75 * Math.max(0, 1 - Math.max(0, idx - scroll) / rows));
        ctx.fillText(content, pad, ly2);
      }
    } else if (kind === 'split') {
      ctx.font = U.fs(fs * 0.5, 600, true);
      ctx.textAlign = 'left';
      var half = W / 2;
      var ln = e.inOutCubic(U.clamp((t * sp - 0.2) / 0.7, 0, 1));
      ctx.fillStyle = U.rgba(U.ink, 0.35);
      ctx.fillRect(half * ln - 1, H * 0.14, 2, H * 0.72);
      for (var si = 0; si < lines.length; si++) {
        var side = si % 2;
        var sx = side ? half + pad : pad;
        var lk2 = e.outCubic(U.clamp((t * sp - 0.5 - si * 0.35) / 0.4, 0, 1));
        if (lk2 <= 0.01) continue;
        ctx.globalAlpha = lk2;
        ctx.fillStyle = U.rgba(si % 2 ? U.accent : green, 1);
        ctx.fillText(String(lines[si]).slice(0, Math.ceil(String(lines[si]).length * lk2)), sx, H * 0.3 + Math.floor(si / 2) * fs * 1.3);
        ctx.globalAlpha = 1;
      }
    } else if (kind === 'ascii') {
      var word = String(p.cmd || 'MOTION');
      var flick = 0.75 + 0.25 * Math.sin(t * 6);
      ctx.font = U.fs(fs * 1.35, 900, true);
      ctx.textAlign = 'center';
      if (p.glow > 0.03) { ctx.shadowColor = U.rgba(green, 0.9 * p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fillStyle = U.rgba(green, flick);
      ctx.fillText(word, W / 2, H / 2 - fs * 0.4);
      ctx.shadowBlur = 0;
      ctx.font = U.fs(fs * 0.42, 500, true);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText('// ' + String(lines[0] || 'end of transmission') + ' //', W / 2, H / 2 + fs * 0.9);
    } else {
      ctx.font = U.fs(fs, 600, true);
      ctx.fillStyle = U.rgba(green, 1);
      ctx.textAlign = 'left';
      ctx.fillText('$ ' + p.cmd, pad, H / 2);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：社交叙事 ══════════════════════════ */

  var SOC_PARAMS = [
    P('kind', '形态', 'like', sel('like', [
      ['like', '点赞爆心'], ['heart-rain', '心形雨'], ['follow', '关注按钮'],
      ['comment', '评论气泡'], ['share', '分享扩散'], ['notif', '红点通知'],
      ['story', '故事环'], ['vote', '投票对比'], ['follower', '粉丝数滚动'],
      ['mention', '@ 提及'], ['trend', '话题冲榜'], ['gift', '礼物打赏']
    ])),
    P('text', '文案', '点个赞再走', txt('点个赞再走')),
    P('num', '数字', 128, rng(128, 1, 9999, 1)),
    P('size', '尺寸', 1144, rng(1144, 120.0, 1602, 4.0)),
    P('speed', '速度', 1, rng(1, 0.5, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function socDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    function heartPath(x, y, s2) {
      ctx.beginPath();
      ctx.moveTo(x, y + s2 * 0.3);
      ctx.bezierCurveTo(x + s2 * 0.62, y - s2 * 0.3, x + s2 * 0.5, y - s2, x, y - s2 * 0.42);
      ctx.bezierCurveTo(x - s2 * 0.5, y - s2, x - s2 * 0.62, y - s2 * 0.3, x, y + s2 * 0.3);
      ctx.closePath();
    }
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.8 * amt); ctx.shadowBlur = 26 * S * amt; }
    }
    function label2(size, a2, y) {
      ctx.font = U.fs(size * S, 800);
      ctx.fillStyle = U.rgba(U.ink, a2);
      ctx.fillText(label, cx, y === undefined ? cy + R * 1.05 : y);
    }

    if (kind === 'like' || kind === 'gift') {
      var hit = e.outBack(U.clamp(tt / 0.5, 0, 1));
      var beat = 1 + Math.sin(tt * 7) * 0.05 * U.clamp(tt - 0.6, 0, 1);
      ctx.globalAlpha = U.clamp(tt * 4, 0, 1);
      ctx.translate(cx, cy); ctx.scale(hit * beat, hit * beat); ctx.translate(-cx, -cy);
      glowOn(col, p.glow);
      heartPath(cx, cy, R * 0.9);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.shadowBlur = 0;
      for (var i = 0; i < 10; i++) {
        var ba = -Math.PI * 1.1 + (i / 9) * Math.PI * 1.2;
        var bk = e.outCubic(U.clamp((tt - 0.4 - i * 0.03) / 0.5, 0, 1));
        if (bk <= 0.01) continue;
        var r0 = R * 0.75, r1 = R * (0.75 + 0.55 * bk);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ba) * U.lerp(r0, r1, bk), cy + Math.sin(ba) * U.lerp(r0, r1, bk), R * 0.05 * (1 - bk * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(i % 2 ? U.accent2 : col, 0.9 * (1 - bk));
        ctx.fill();
      }
      label2(R * 0.2, U.clamp((tt - 0.7) / 0.4, 0, 1) * 1);
    } else if (kind === 'heart-rain') {
      for (var h2 = 0; h2 < 16; h2++) {
        var delay = U.rnd(0, 2.4, h2);
        var lt = ((tt + delay) % 3) / 3;
        var hx = W * U.rnd(0.12, 0.88, h2) + Math.sin(tt * 1.4 + h2) * 30 * S;
        var hy = U.lerp(H * 1.05, -R * 0.4, lt);
        var hs = R * (0.1 + U.rnd(0, 0.14, h2 + 3)) * (0.7 + 0.3 * Math.sin(lt * Math.PI));
        ctx.globalAlpha = Math.sin(lt * Math.PI) * 0.95;
        glowOn(h2 % 3 ? col : U.accent2, p.glow * 0.4);
        heartPath(hx, hy, hs);
        ctx.fillStyle = U.rgba(h2 % 3 ? col : U.accent2, 1);
        ctx.fill();
      }
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      label2(R * 0.2, 1);
    } else if (kind === 'follow') {
      var flip = e.outCubic(U.clamp((tt - 0.5) / 0.45, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      var bw = R * 1.5, bh = R * 0.5;
      U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, bh / 2);
      var fg = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
      fg.addColorStop(0, U.rgba(col, 1));
      fg.addColorStop(1, U.rgba(U.mix(col, U.accent2, 0.5), 1));
      ctx.fillStyle = fg; ctx.fill();
      ctx.font = U.fs(bh * 0.42, 800);
      var txt1 = '+ 关注', txt2 = '✓ 已关注';
      var k1 = U.clamp(flip * 2, 0, 1), k2v = U.clamp(flip * 2 - 1, 0, 1);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      if (k2v > 0.01) ctx.fillText(txt2, cx, cy);
      else ctx.fillText(txt1, cx - bw * (1 - k1) * 0.0, cy);
      var chip = label ? R * 0.18 : 0;
      if (chip) {
        ctx.font = U.fs(chip * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText(label, cx, cy + bh * 1.25);
      }
    } else if (kind === 'comment') {
      var pool = label.split(/[,，|]/).filter(Boolean);
      if (!pool.length) pool = ['太真实了', '收藏了', '学到了'];
      for (var ci = 0; ci < Math.min(pool.length, 5); ci++) {
        var ck = e.outCubic(U.clamp((tt - 0.4 - ci * 0.5) / 0.45, 0, 1));
        if (ck <= 0.01) continue;
        var side2 = ci % 2 ? 1 : -1;
        var bx2 = cx + side2 * W * U.rnd(0.1, 0.2, ci);
        var by = cy - R * 0.5 + ci * R * 0.34;
        ctx.globalAlpha = ck;
        ctx.font = U.fs(R * 0.14 * S, 700);
        var tw = ctx.measureText(pool[ci]).width + R * 0.24;
        ctx.translate(0, 0);
        ctx.save();
        ctx.translate(U.lerp(bx2 + side2 * 60 * S, bx2, ck), by);
        U.rr(ctx, -tw / 2, -R * 0.11, tw, R * 0.22, R * 0.11);
        ctx.fillStyle = U.rgba(ci === 0 ? col : U.bg2, ci === 0 ? 0.95 : 0.9);
        ctx.fill();
        ctx.fillStyle = U.rgba(ci === 0 ? U.bg1 : U.ink, 1);
        ctx.fillText(pool[ci], 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    } else if (kind === 'share') {
      var s4 = e.outCubic(U.clamp(tt / 0.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      for (var ri = 0; ri < 3; ri++) {
        var rk = U.clamp((s4 - ri * 0.14) / 0.5, 0, 1);
        if (rk <= 0.01) continue;
        ctx.globalAlpha = (1 - rk) * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.5 + rk * 0.7), 0, Math.PI * 2);
        ctx.lineWidth = R * 0.03 * (1 - rk) * S;
        ctx.strokeStyle = U.rgba(col, 1);
        ctx.stroke();
      }
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      glowOn(col, p.glow);
      var nodes = [[0, -1], [-0.87, 0.5], [0.87, 0.5]];
      for (var ni = 0; ni < nodes.length; ni++) {
        var nk = U.clamp((s4 - 0.3 - ni * 0.1) / 0.4, 0, 1);
        var nx = cx + nodes[ni][0] * R * 0.62, ny = cy + nodes[ni][1] * R * 0.62;
        var ncx = cx + nodes[ni][0] * R * 0.2, ncy = cy + nodes[ni][1] * R * 0.2;
        if (nk > 0.01) {
          ctx.beginPath();
          ctx.moveTo(ncx, ncy);
          ctx.lineTo(U.lerp(ncx, nx, nk), U.lerp(ncy, ny, nk));
          ctx.lineWidth = R * 0.035 * S;
          ctx.strokeStyle = U.rgba(col, 0.85);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(nx, ny, R * 0.09 * nk, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(ni === 0 ? U.accent2 : col, 1); ctx.fill();
      }
      ctx.shadowBlur = 0;
      label2(R * 0.18, U.clamp((tt - 0.9) / 0.4, 0, 1));
    } else if (kind === 'notif') {
      var pop2 = e.outBack(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      U.rr(ctx, cx - R * 0.42, cy - R * 0.42, R * 0.84, R * 0.84, R * 0.18);
      ctx.fillStyle = U.rgba(U.bg2, 0.96); ctx.fill();
      ctx.lineWidth = R * 0.02 * S; ctx.strokeStyle = U.rgba(U.ink, 0.18); ctx.stroke();
      ctx.font = U.fs(R * 0.34, 600);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText('🔔', cx, cy - R * 0.02);
      var shake = Math.sin(tt * 24) * Math.exp(-tt * 2.4) * R * 0.05;
      ctx.save();
      ctx.translate(cx + R * 0.38 + shake, cy - R * 0.38);
      ctx.scale(pop2, pop2);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.font = U.fs(R * 0.15 * S, 800);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText(String(Math.max(1, Math.round(p.num % 100))), 0, 0);
      ctx.restore();
      label2(R * 0.18, U.clamp((tt - 0.8) / 0.4, 0, 1));
    } else if (kind === 'story') {
      var prog = (tt * 0.55) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var segs = 5;
      for (var gi = 0; gi < segs; gi++) {
        var gk = U.clamp(prog * segs - gi, 0, 1);
        var a0 = -Math.PI / 2 + (gi / segs) * Math.PI * 2 + 0.04;
        var a1v = -Math.PI / 2 + ((gi + gk) / segs) * Math.PI * 2 - 0.04;
        ctx.beginPath();
        ctx.arc(cx, cy - R * 0.05, R * 0.72, a0, Math.max(a0 + 0.01, a1v));
        ctx.lineWidth = R * 0.045 * S;
        ctx.strokeStyle = U.rgba(gk > 0 && gk < 1 ? U.accent2 : col, gk > 0 ? 1 : 0.28);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy - R * 0.05, R * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
      var av = e.outBack(U.clamp((tt - 0.3) / 0.5, 0, 1));
      ctx.font = U.fs(R * 0.4 * av, 800);
      ctx.fillStyle = U.rgba(U.ink, av);
      ctx.fillText(label.charAt(0) || '★', cx, cy - R * 0.05);
      label2(R * 0.17, U.clamp((tt - 0.7) / 0.4, 0, 1), cy + R * 0.9);
    } else if (kind === 'vote') {
      var pair = label.split(/[,，|]/);
      var a3 = pair[0] || '方案 A', b3 = pair[1] || '方案 B';
      var nA = Math.round(p.num), nB = Math.max(1, Math.round(p.num * U.rnd(0.4, 0.9, 5)));
      var gk2 = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var wA = nA / (nA + nB), wB = 1 - wA;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(R * 0.16 * S, 800);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText(a3, W * 0.12, cy - R * 0.42);
      ctx.fillStyle = U.rgba(U.accent2, 1);
      ctx.fillText(b3, W * 0.12, cy + R * 0.42);
      var bh2 = R * 0.24;
      U.rr(ctx, W * 0.12, cy - R * 0.3, W * 0.76, bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      U.rr(ctx, W * 0.12, cy - R * 0.3, Math.max(bh2, W * 0.76 * wA * gk2), bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      U.rr(ctx, W * 0.12, cy + R * 0.14, W * 0.76, bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      U.rr(ctx, W * 0.12, cy + R * 0.14, Math.max(bh2, W * 0.76 * wB * gk2), bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(Math.round(nA * gk2), W * 0.12 + W * 0.76 * wA * gk2 + 14 * S, cy - R * 0.3 + bh2 / 2);
      ctx.fillText(Math.round(nB * gk2), W * 0.12 + W * 0.76 * wB * gk2 + 14 * S, cy + R * 0.14 + bh2 / 2);
      ctx.textAlign = 'center';
    } else if (kind === 'follower' || kind === 'trend') {
      var target = Math.max(1, Math.round(p.num));
      var ck3 = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      var val = Math.round(target * ck3);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.5);
      ctx.font = U.fs(R * 0.62, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ','), cx, cy - R * 0.12);
      ctx.font = U.fs(R * 0.16 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(kind === 'trend' ? ('#' + label) : (label + ' · ' + (tt > 1 ? '+1' : '')), cx, cy + R * 0.42);
      if (kind === 'trend') {
        var tk = e.outCubic(U.clamp((tt - 0.8) / 0.8, 0, 1));
        ctx.strokeStyle = U.rgba(col, 0.9 * tk);
        ctx.lineWidth = R * 0.03 * S;
        ctx.beginPath();
        for (var pi2 = 0; pi2 <= 20; pi2++) {
          var px = W * 0.3 + (pi2 / 20) * W * 0.4;
          var py = cy + R * 0.8 - Math.pow(pi2 / 20, 1.6) * R * 0.4 * tk;
          if (!pi2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else if (kind === 'mention') {
      var mk = e.outBack(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((1 - e.outCubic(U.clamp(tt / 0.6, 0, 1))) * -0.3);
      ctx.scale(mk, mk);
      ctx.font = U.fs(R * 0.6, 900);
      if (p.glow > 0.03) { ctx.shadowColor = U.rgba(col, 0.8 * p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText('@', 0, 0);
      ctx.restore();
      label2(R * 0.2, U.clamp((tt - 0.6) / 0.4, 0, 1));
    } else {
      heartPath(cx, cy, R * 0.8);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      label2(R * 0.18, 1);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '终端代码', type: 'block', dur: 6, poster: 0.55,
    params: TERM_PARAMS, draw: termDraw,
    ids: [
      { id: 'term-type', name: '命令打字机', tags: ['打字', '命令'], desc: '命令逐字敲出并伴随光标闪烁，开发者质感。', cfg: { kind: 'type' } },
      { id: 'term-output', name: '命令与输出', tags: ['命令', '输出'], desc: '先打命令，再逐行弹出执行输出，教学演示利器。', cfg: { kind: 'output' } },
      { id: 'term-progress', name: '终端进度条', tags: ['进度', '下载'], desc: '终端风格进度条从 0 到 100%，极客感十足。', cfg: { kind: 'progress' } },
      { id: 'term-matrix', name: '代码雨', tags: ['矩阵', '黑客'], desc: '经典代码雨倾泻而下，黑客帝国氛围。', cfg: { kind: 'matrix' } },
      { id: 'term-log', name: '日志滚动', tags: ['日志', '滚动'], desc: '服务日志持续滚动刷新，运维监控感。', cfg: { kind: 'log' } },
      { id: 'term-boot', name: '开机自检', tags: ['开机', 'BIOS'], desc: 'BIOS 自检逐行通过，系统启动叙事。', cfg: { kind: 'boot' } },
      { id: 'term-cursor', name: '光标呼吸', tags: ['光标', '待机'], desc: '只剩光标在黑屏上呼吸闪烁，极简开场。', cfg: { kind: 'cursor' } },
      { id: 'term-split', name: '分屏输出', tags: ['分屏', '对比'], desc: '双栏交错弹出的终端输出，对比演示。', cfg: { kind: 'split' } },
      { id: 'term-success', name: '成功收尾', tags: ['成功', '部署'], desc: '命令执行后逐行输出并以绿色 done 收尾。', cfg: { kind: 'success' } },
      { id: 'term-error', name: '报错抖动', tags: ['报错', '抖动'], desc: '输出后红色报错并伴随屏幕抖动，故障演示。', cfg: { kind: 'error' } },
      { id: 'term-install', name: '依赖安装', tags: ['安装', 'npm'], desc: '模拟依赖安装的分步勾选与总进度，构建叙事。', cfg: { kind: 'install' } },
      { id: 'term-ascii', name: '字符横幅', tags: ['ASCII', '标语'], desc: '等宽字体大字横幅闪烁，片头与章节页。', cfg: { kind: 'ascii', cmd: 'MOTION' } }
    ]
  });

  MF.forge({
    cat: '社交叙事', type: 'block', dur: 5.5, poster: 0.4,
    params: SOC_PARAMS, draw: socDraw,
    texts: ['点个赞再走', '关注不迷路', '评论区聊聊', '转发给需要的人'],
    ids: [
      { id: 'soc-like', name: '点赞爆心', tags: ['点赞', '爱心'], desc: '爱心弹出并放射粒子，互动号召场景。', cfg: { kind: 'like' } },
      { id: 'soc-heart-rain', name: '心形雨', tags: ['心雨', '氛围'], desc: '爱心从天而降连绵不断，直播与感谢场景。', cfg: { kind: 'heart-rain' } },
      { id: 'soc-follow', name: '关注按钮', tags: ['关注', '按钮'], desc: '「+关注」翻转为「已关注」，涨粉引导。', cfg: { kind: 'follow' } },
      { id: 'soc-comment', name: '评论气泡', tags: ['评论', '气泡'], desc: '评论气泡左右交错弹出，用逗号分隔内容。', cfg: { kind: 'comment', text: '太真实了,收藏了,学到了' } },
      { id: 'soc-share', name: '分享扩散', tags: ['分享', '节点'], desc: '分享节点逐个连线扩散，传播可视化。', cfg: { kind: 'share' } },
      { id: 'soc-notif', name: '红点通知', tags: ['通知', '红点'], desc: '图标抖动后红点数字弹出，提醒氛围。', cfg: { kind: 'notif' } },
      { id: 'soc-story', name: '故事环', tags: ['故事', '进度'], desc: '故事环分段填充并露出头像首字。', cfg: { kind: 'story' } },
      { id: 'soc-vote', name: '投票对比', tags: ['投票', '对比'], desc: '两条投票条按票数增长，逗号分隔两个选项。', cfg: { kind: 'vote', text: '方案 A,方案 B' } },
      { id: 'soc-follower', name: '粉丝数滚动', tags: ['数字', '粉丝'], desc: '粉丝数快速滚动到位，里程碑庆祝。', cfg: { kind: 'follower', num: 10000 } },
      { id: 'soc-mention', name: '@ 提及', tags: ['@', '提及'], desc: '@ 符号旋入弹出，提及与召唤场景。', cfg: { kind: 'mention' } },
      { id: 'soc-trend', name: '话题冲榜', tags: ['话题', '热度'], desc: '话题标签伴随热度曲线上扬，冲榜氛围。', cfg: { kind: 'trend', num: 9999 } },
      { id: 'soc-gift', name: '礼物打赏', tags: ['礼物', '打赏'], desc: '爱心爆开配放射光点，感谢打赏场景。', cfg: { kind: 'gift' } }
    ]
  });
})();

/* ════════ assets/js/effects-16.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 16
   原语：音乐律动（频谱 / 节拍） / 数字计数（滚动 / 翻牌 / 跑马）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：音乐律动 ══════════════════════════ */

  var MUS_PARAMS = [
    P('kind', '形态', 'bars', sel('bars', [
      ['bars', '频谱条'], ['wave', '波形线'], ['circle', '环形频谱'],
      ['vinyl', '黑胶唱片'], ['notes', '音符漂浮'], ['metronome', '节拍器'],
      ['eq-dots', '点阵均衡'], ['pulse-ring', '节拍光环'], ['cassette', '磁带转动'],
      ['mic', '麦克风电平'], ['play', '播放律动'], ['reel', '双卷轴']
    ])),
    P('text', '曲名', 'MIDNIGHT GROOVE', txt('MIDNIGHT GROOVE')),
    P('size', '基准尺寸', 300.0, rng(300.0, 120.0, 728.0, 4.0)),
    P('bars', '频段数', 28, rng(28, 6, 64, 1)),
    P('speed', '节奏', 1, rng(1, 0.3, 2.6, 0.05)),
    P('bpm', '节拍强度', 0.8, rng(0.8, 0.2, 1.5, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function musDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var n = Math.max(4, Math.round(p.bars));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    /* 伪频谱：确定性噪声叠加节拍包络 */
    function level(i, tt) {
      var beat = Math.pow(Math.max(0, 1 - ((tt * sp * 1.6) % 1) * 1.6), 2.2) * p.bpm;
      var v = 0.28 + 0.72 * Math.abs(U.noise2(i * 0.9, tt * sp * 2.2, U.seed));
      return U.clamp(v * (0.55 + beat * 0.75), 0.04, 1);
    }

    if (kind === 'bars' || kind === 'eq-dots') {
      var gap = (W * 0.72) / n;
      var bw = gap * 0.58;
      ctx.textAlign = 'left';
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(p.text, W * 0.14, H * 0.2);
      for (var i = 0; i < n; i++) {
        var lv = level(i, t);
        var x = W * 0.14 + i * gap;
        if (kind === 'bars') {
          var bh = lv * H * 0.42;
          var g2 = ctx.createLinearGradient(0, H * 0.78 - bh, 0, H * 0.78);
          g2.addColorStop(0, U.rgba(U.mix(col, U.accent2, i / n), 1));
          g2.addColorStop(1, U.rgba(col, 0.25));
          U.rr(ctx, x, H * 0.78 - bh, bw, bh, bw * 0.4);
          ctx.fillStyle = g2; ctx.fill();
        } else {
          var dots = Math.round(lv * 9);
          for (var d2 = 0; d2 < 9; d2++) {
            ctx.beginPath();
            ctx.arc(x + bw / 2, H * 0.74 - d2 * (H * 0.045), bw * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = U.rgba(d2 < dots ? U.mix(col, U.accent2, d2 / 9) : U.ink, d2 < dots ? 0.95 : 0.14);
            ctx.fill();
          }
        }
      }
    } else if (kind === 'wave') {
      for (var w2 = 0; w2 < 3; w2++) {
        ctx.beginPath();
        for (var x2 = 0; x2 <= W; x2 += 10) {
          var env = Math.sin((x2 / W) * Math.PI);
          var y2 = cy + Math.sin(x2 * 0.012 / (1 + w2 * 0.3) + t * sp * (2.4 + w2)) * H * 0.14 * env * (0.5 + level(w2 * 7 + Math.floor(x2 / 60), t));
          if (!x2) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
        }
        ctx.lineWidth = (3.4 - w2 * 0.9) * S;
        glowOn(w2 ? U.accent2 : col, p.glow * (w2 ? 0.4 : 1));
        ctx.strokeStyle = U.rgba(w2 ? U.accent2 : col, w2 ? 0.5 : 0.95);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.font = U.fs(R * 0.15 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(p.text, cx, cy + H * 0.28);
    } else if (kind === 'circle') {
      glowOn(col, p.glow);
      for (var c2 = 0; c2 < n; c2++) {
        var a2 = (c2 / n) * Math.PI * 2 - Math.PI / 2;
        var lv2 = level(c2, t);
        var r0 = R * 0.62, r1 = r0 + lv2 * R * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a2) * r0, cy + Math.sin(a2) * r0);
        ctx.lineTo(cx + Math.cos(a2) * r1, cy + Math.sin(a2) * r1);
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * r0 / n) * 0.5) * S;
        ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, c2 / n), 0.95);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.34 * (1 + Math.sin(t * sp * 3.2) * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      ctx.font = U.fs(R * 0.14 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText('♪', cx, cy);
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.75);
      ctx.fillText(p.text, cx, cy + R * 0.86);
    } else if (kind === 'vinyl') {
      var rot = t * sp * 1.6;
      ctx.globalAlpha = U.clamp(t * 2.4, 0, 1);
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2);
      var vg = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 0.72);
      vg.addColorStop(0, U.rgba('#1A1D26', 1));
      vg.addColorStop(1, U.rgba('#0C0E14', 1));
      ctx.fillStyle = vg; ctx.fill();
      for (var gr = 0; gr < 7; gr++) {
        ctx.beginPath(); ctx.arc(0, 0, R * (0.3 + gr * 0.06), 0, Math.PI * 2);
        ctx.lineWidth = 1 * S; ctx.strokeStyle = U.rgba(U.ink, 0.08); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, R * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, 0.9); ctx.fill();
      ctx.restore();
      var tone = level(3, t);
      ctx.beginPath(); ctx.arc(cx + R * 0.95, cy, R * 0.06 * (0.6 + tone), 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.accent2, 0.9); ctx.fill();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(p.text, cx, cy + R * 0.98);
    } else if (kind === 'notes') {
      for (var nt = 0; nt < 12; nt++) {
        var ph = (tt * 0.4 + U.rnd(0, 1, nt)) % 1;
        var nx2 = W * U.rnd(0.15, 0.85, nt) + Math.sin(t * sp + nt * 2) * 40 * S;
        var ny2 = U.lerp(H * 1.02, H * 0.05, ph);
        var nsize = R * (0.1 + U.rnd(0, 0.1, nt + 5)) * (0.6 + 0.4 * Math.sin(ph * Math.PI));
        ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.95;
        glowOn(nt % 2 ? U.accent2 : col, p.glow * 0.35);
        ctx.font = U.fs(nsize, 700);
        ctx.fillStyle = U.rgba(nt % 2 ? U.accent2 : col, 1);
        ctx.fillText(nt % 3 ? '♪' : '♫', nx2, ny2);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.font = U.fs(R * 0.15 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(p.text, cx, cy);
    } else if (kind === 'metronome') {
      var beat = (tt * sp) % 1;
      var swing = Math.sin(Math.floor(tt * sp) % 2 ? Math.PI : 0) + (0.5 - beat) * 2;
      var ang = U.clamp(swing, -1, 1) * 0.62 * (1 - beat * 0.25);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.34, cy + R * 0.7);
      ctx.lineTo(cx, cy - R * 0.85);
      ctx.lineTo(cx + R * 0.34, cy + R * 0.7);
      ctx.closePath();
      ctx.lineWidth = R * 0.035 * S;
      ctx.strokeStyle = U.rgba(col, 0.9); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy + R * 0.62);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -R * 1.4);
      ctx.lineWidth = R * 0.028 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -R * 1.28, R * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.restore();
      var bflash = Math.pow(1 - beat, 4);
      ctx.beginPath(); ctx.arc(cx, cy + R * 0.7, R * 0.09 * (0.7 + bflash), 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.4 + bflash * 0.6); ctx.fill();
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.7);
      ctx.fillText(Math.round(60 * sp) + ' BPM', cx, cy + R * 1.05);
    } else if (kind === 'pulse-ring') {
      var beat2 = (tt * sp * 1.4) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var pr = 0; pr < 4; pr++) {
        var pk = (beat2 + pr * 0.25) % 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.3 + pk * 0.85), 0, Math.PI * 2);
        ctx.lineWidth = R * 0.05 * (1 - pk) * S;
        ctx.strokeStyle = U.rgba(pr % 2 ? U.accent2 : col, (1 - pk) * 0.8);
        ctx.stroke();
      }
      glowOn(col, p.glow);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.22 * (1 + Math.pow(1 - beat2, 3) * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.fillText(p.text, cx, cy + R * 1.15);
    } else if (kind === 'cassette' || kind === 'reel') {
      var rot2 = t * sp * 2.4;
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      var cw = R * 1.7, ch = R * 1.06;
      U.rr(ctx, cx - cw / 2, cy - ch / 2, cw, ch, ch * 0.14);
      ctx.fillStyle = U.rgba('#181B24', 0.96); ctx.fill();
      ctx.lineWidth = R * 0.02 * S; ctx.strokeStyle = U.rgba(col, 0.5); ctx.stroke();
      var rx = cw * 0.24, ry2 = 0;
      if (kind === 'reel') rx = cw * 0.3;
      for (var rl = -1; rl <= 1; rl += 2) {
        ctx.save();
        ctx.translate(cx + rl * rx, cy + ry2);
        ctx.rotate(rl * rot2);
        ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#0C0E14', 1); ctx.fill();
        for (var sp2 = 0; sp2 < 6; sp2++) {
          var sa = (sp2 / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(sa) * R * 0.16, Math.sin(sa) * R * 0.16);
          ctx.lineWidth = R * 0.022 * S;
          ctx.strokeStyle = U.rgba(col, 0.8); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, R * 0.055, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.bg1, 0.95); ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy - R * 0.2);
      ctx.lineTo(cx + rx, cy - R * 0.2);
      ctx.lineWidth = R * 0.016 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.35); ctx.stroke();
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText(p.text, cx, cy + ch * 0.32);
    } else if (kind === 'mic') {
      var mlevel = level(2, t);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      U.rr(ctx, cx - R * 0.16, cy - R * 0.5, R * 0.32, R * 0.62, R * 0.16);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.3, cy - R * 0.18);
      ctx.arc(cx, cy - R * 0.18, R * 0.3, Math.PI, 0, false);
      ctx.bezierCurveTo(cx + R * 0.3, cy + R * 0.3, cx + R * 0.12, cy + R * 0.42, cx + R * 0.045, cy + R * 0.46);
      ctx.lineTo(cx - R * 0.045, cy + R * 0.46);
      ctx.bezierCurveTo(cx - R * 0.12, cy + R * 0.42, cx - R * 0.3, cy + R * 0.3, cx - R * 0.3, cy - R * 0.18);
      ctx.lineWidth = R * 0.03 * S;
      ctx.strokeStyle = U.rgba(col, 0.85); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + R * 0.46); ctx.lineTo(cx, cy + R * 0.62);
      ctx.stroke();
      for (var mi = 0; mi < 5; mi++) {
        var ma = (mi - 2) * 0.5;
        var on = Math.abs(ma) < mlevel * 1.6 + 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy + R * 0.62, R * (0.34 + mi * 0.09), -Math.PI / 2 - 0.42 + (mi ? ma * 0 : 0), 0, false);
        ctx.lineWidth = R * 0.03 * S;
        ctx.strokeStyle = U.rgba(on ? col : U.ink, on ? 0.9 : 0.15);
        ctx.stroke();
      }
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.fillText(p.text, cx, cy + R * 1.0);
    } else if (kind === 'play') {
      var beat3 = Math.pow(1 - ((tt * sp * 1.6) % 1), 3);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * (0.4 + beat3 * 0.6));
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.13, cy - R * 0.2);
      ctx.lineTo(cx + R * 0.22, cy);
      ctx.lineTo(cx - R * 0.13, cy + R * 0.2);
      ctx.closePath();
      ctx.fillStyle = U.rgba(U.bg1, 0.92); ctx.fill();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(p.text, cx, cy + R * 0.9);
    } else {
      for (var wi = 0; wi < n; wi++) {
        var wx = W * 0.14 + (wi / n) * W * 0.72;
        ctx.beginPath();
        ctx.arc(wx, cy, 4 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.4 + level(wi, t) * 0.6);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：数字计数 ══════════════════════════ */

  var NUM_PARAMS = [
    P('kind', '形态', 'count-up', sel('count-up', [
      ['count-up', '数字增长'], ['percent', '百分比冲刺'], ['odometer', '滚轮数字'],
      ['currency', '金额滚动'], ['countdown', '倒计时'], ['score', '分数跳加'],
      ['slot', '老虎机翻牌'], ['ticker', '行情跑马'], ['stats-row', '三联数据'], ['flip-date', '日期翻牌']
    ])),
    P('num', '目标数值', 2026, rng(2026, 1, 99999, 1)),
    P('prefix', '前缀', '', txt('')),
    P('suffix', '后缀', '', txt('')),
    P('size', '字号', 300, rng(300, 48.0, 406.0, 2.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.4, 0.05)),
    P('ink2', '强调色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function numDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var col = p.ink2;
    var kind = p.kind;
    var target = Math.max(0, Math.round(p.num));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function fmt(v) {
      var s2 = String(Math.round(v));
      return (p.prefix || '') + s2.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (p.suffix || '');
    }
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 30 * S * amt; }
    }

    if (kind === 'count-up' || kind === 'currency' || kind === 'percent' || kind === 'score') {
      var k = kind === 'percent' ? e.inOutCubic(U.clamp((tt - 0.3) / 1.8, 0, 1))
        : kind === 'score' ? e.outBack(U.clamp((tt - 0.3) / 1.2, 0, 1))
        : e.outExpo(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var val = target * k;
      var pop = kind === 'score' && k >= 1 ? 1 + Math.sin((tt - 1.5) * 9) * 0.035 * Math.exp(-(tt - 1.5) * 2) : 1;
      ctx.translate(cx, cy); ctx.scale(pop, pop); ctx.translate(-cx, -cy);
      glowOn(col, p.glow);
      ctx.font = U.fs(fs, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      var txtv = kind === 'percent' ? Math.round(val) + '%' : fmt(val);
      if (kind === 'currency') txtv = '¥' + fmt(val).replace(/¥/g, '');
      ctx.fillText(txtv, cx, cy);
      ctx.shadowBlur = 0;
      if (p.prefix || p.suffix) { /* noop，已并入 fmt */ }
      ctx.font = U.fs(fs * 0.2 * S, 600);
      ctx.fillStyle = U.rgba(U.ink, 0.45);
      ctx.fillText('JAYKOU · DATA', cx, cy + fs * 0.78);
    } else if (kind === 'odometer') {
      var k2 = e.outExpo(U.clamp((tt - 0.3) / 1.8, 0, 1));
      var chars2 = fmt(target).split('');
      var totalW = 0;
      ctx.font = U.fs(fs, 900);
      var widths = chars2.map(function (ch) { return ctx.measureText(ch).width * 1.08; });
      totalW = widths.reduce(function (a2, b2) { return a2 + b2; }, 0);
      var x0 = cx - totalW / 2;
      var shown = fmt(Math.round(target * k2));
      for (var di = 0; di < chars2.length; di++) {
        var dch = chars2[di];
        var digitK = e.outExpo(U.clamp((k2 - di * 0.05) / 0.85, 0, 1));
        var roll = (1 - digitK) * (dch >= '0' && dch <= '9' ? 3.4 : 0);
        var yoff = roll * fs;
        if (yoff !== 0) {
          for (var roll2 = 1; roll2 <= 3; roll2++) {
            var ry = roll2;
            ctx.fillStyle = U.rgba(U.ink, 0.14 + 0.1 * (3 - ry) / 3);
            ctx.fillText(dch, x0, cy + yoff - ry * fs);
            ctx.fillText(dch, x0, cy + yoff + ry * fs);
          }
        }
        ctx.fillStyle = U.rgba(dch === ',' ? U.ink : U.mix(U.ink, col, digitK), 0.25 + 0.75 * digitK);
        ctx.fillText(dch, x0, cy + yoff);
        x0 += widths[di];
      }
    } else if (kind === 'countdown') {
      var from = Math.max(3, Math.min(10, Math.round(p.num > 10 ? 5 : p.num)));
      var remain = Math.max(0, from - Math.floor(tt));
      var frac = 1 - (tt % 1);
      var popK = Math.pow(frac, 3);
      glowOn(remain === 0 ? col : U.ink, p.glow * (0.3 + popK * 0.7));
      ctx.font = U.fs(fs * (0.72 + popK * 0.34), 900);
      ctx.fillStyle = U.rgba(remain === 0 ? col : U.ink, U.clamp(tt * 3, 0, 1));
      ctx.fillText(remain === 0 ? 'GO' : String(remain), cx, cy);
      ctx.beginPath();
      ctx.arc(cx, cy, fs * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.lineWidth = fs * 0.05 * S;
      ctx.strokeStyle = U.rgba(col, 0.85);
      ctx.stroke();
    } else if (kind === 'slot') {
      var lock = e.outCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      var digits = fmt(target).split('');
      ctx.font = U.fs(fs, 900);
      var tw2 = 0;
      var ws = digits.map(function (ch) { return ctx.measureText(ch).width * 1.06; });
      tw2 = ws.reduce(function (a2, b2) { return a2 + b2; }, 0);
      var xx = cx - tw2 / 2;
      for (var di2 = 0; di2 < digits.length; di2++) {
        var ch2 = digits[di2];
        var locked = U.clamp((lock - di2 * 0.08) / 0.3, 0, 1);
        var isDigit = ch2 >= '0' && ch2 <= '9';
        var shown2 = isDigit && locked < 1 ? String(Math.floor(U.rng(di2 * 31 + Math.floor(tt * 14)) * 10)) : ch2;
        ctx.fillStyle = U.rgba(locked >= 1 ? col : U.ink, 0.25 + 0.75 * locked);
        ctx.fillText(shown2, xx, cy);
        xx += ws[di2];
      }
      ctx.font = U.fs(fs * 0.2 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.4);
      ctx.fillText('· ROLLING ·', cx, cy + fs * 0.75);
    } else if (kind === 'ticker') {
      var scrollX = (tt * 240 * S) % (W * 0.5);
      var rows2 = [
        { s2: 'MOTION', v: target, up: true },
        { s2: 'FORGE', v: Math.round(target * 0.72), up: false },
        { s2: 'INDEX', v: Math.round(target * 1.3), up: true }
      ];
      ctx.font = U.fs(fs * 0.42, 800);
      ctx.textAlign = 'left';
      for (var ti = 0; ti < rows2.length * 2; ti++) {
        var r3 = rows2[ti % rows2.length];
        var tx = W * 0.1 + ((ti * W * 0.25 - scrollX) % (W * 0.75)) + W * 0.75 * Math.floor(ti / rows2.length);
        if (tx < -W * 0.4 || tx > W * 1.2) continue;
        ctx.fillStyle = U.rgba(U.ink, 0.92);
        ctx.fillText(r3.s2, tx, cy - fs * 0.12);
        ctx.fillStyle = U.rgba(r3.up ? '#5DFF8F' : '#FF6A5D', 0.95);
        ctx.fillText(fmt(r3.v) + (r3.up ? ' ↑' : ' ↓'), tx, cy + fs * 0.42);
      }
      ctx.textAlign = 'center';
    } else if (kind === 'stats-row') {
      var trip = [target, Math.round(target * 0.6), Math.round(target * 1.8)];
      var labs = ['总量', '增长', '峰值'];
      var gk3 = e.outExpo(U.clamp((tt - 0.3) / 1.5, 0, 1));
      for (var si = 0; si < 3; si++) {
        var sxx = W * (0.24 + si * 0.26);
        var sk = U.clamp((gk3 - si * 0.12) / 0.88, 0, 1);
        ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
        ctx.font = U.fs(fs * 0.46, 900);
        glowOn(si === 1 ? col : U.ink, p.glow * 0.5);
        ctx.fillStyle = U.rgba(si === 1 ? col : U.ink, 1);
        ctx.fillText(fmt(trip[si] * sk), sxx, cy - fs * 0.1);
        ctx.shadowBlur = 0;
        ctx.font = U.fs(fs * 0.16 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(labs[si], sxx, cy + fs * 0.4);
        ctx.beginPath();
        ctx.moveTo(sxx - fs * 0.3, cy + fs * 0.62);
        ctx.lineTo(sxx + fs * 0.3, cy + fs * 0.62);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(si === 1 ? col : U.ink, 0.35);
        ctx.stroke();
      }
    } else if (kind === 'flip-date') {
      var now = new Date(2026, 0, 1 + Math.floor(tt / 2));
      var ds = ['01', '01'];
      var cur = [String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')];
      var flipT = (tt * 0.5) % 1;
      var flipping = flipT < 0.22;
      var fl = flipping ? Math.sin(flipT / 0.22 * Math.PI) : 0;
      var cardW = fs * 1.15, cardH = fs * 1.5;
      for (var fi = 0; fi < 2; fi++) {
        var fxx = cx + (fi === 0 ? -1 : 1) * (cardW * 0.55 + fs * 0.08);
        U.rr(ctx, fxx - cardW / 2, cy - cardH / 2, cardW, cardH, fs * 0.12);
        ctx.fillStyle = U.rgba(U.bg2, 0.97); ctx.fill();
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(U.ink, 0.12); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fxx - cardW / 2, cy);
        ctx.lineTo(fxx + cardW / 2, cy);
        ctx.strokeStyle = U.rgba(U.bg1, 0.7); ctx.lineWidth = 3 * S; ctx.stroke();
        ctx.save();
        if (flipping && fi === 1) ctx.transform(1, 0, -fl * 0.55, 1 - fl * 0.25, 0, 0);
        ctx.font = U.fs(fs * 0.78, 900);
        ctx.fillStyle = U.rgba(fi === 1 ? col : U.ink, 1);
        ctx.fillText(cur[fi], fxx, cy);
        ctx.restore();
      }
      ctx.font = U.fs(fs * 0.18 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText('MOTION · SCHEDULE', cx, cy + cardH * 0.85);
    } else {
      ctx.font = U.fs(fs, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(fmt(target), cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '音乐律动', type: 'block', dur: 6, poster: 0.55,
    params: MUS_PARAMS, draw: musDraw,
    texts: ['MIDNIGHT GROOVE', 'LO-FI Study', 'Neon Pulse', 'Deep Focus'],
    ids: [
      { id: 'mus-bars', name: '频谱条', tags: ['频谱', '律动'], desc: '经典跳动的频谱柱，音乐与播客封面首选。', cfg: { kind: 'bars' } },
      { id: 'mus-wave', name: '三重波形', tags: ['波形', '声波'], desc: '三层声波交织流动，声音可视化。', cfg: { kind: 'wave' } },
      { id: 'mus-circle', name: '环形频谱', tags: ['环形', '频谱'], desc: '环形频谱围绕唱点跳动，头像律动框。', cfg: { kind: 'circle', size: 560} },
      { id: 'mus-vinyl', name: '黑胶唱片', tags: ['黑胶', '复古'], desc: '黑胶唱片匀速旋转，复古音乐氛围。', cfg: { kind: 'vinyl', size: 560} },
      { id: 'mus-notes', name: '音符漂浮', tags: ['音符', '上浮'], desc: '音符从底部缓缓升起，音乐氛围底衬。', cfg: { kind: 'notes' } },
      { id: 'mus-metronome', name: '节拍器', tags: ['节拍', '练习'], desc: '节拍器左右摆动并随拍点闪光，节奏练习。', cfg: { kind: 'metronome' } },
      { id: 'mus-eq-dots', name: '点阵均衡', tags: ['点阵', '均衡'], desc: '点阵式电平表逐格点亮，录音室质感。', cfg: { kind: 'eq-dots' } },
      { id: 'mus-pulse-ring', name: '节拍光环', tags: ['光环', '节拍'], desc: '光环随节拍层层扩散，强劲律动。', cfg: { kind: 'pulse-ring', size: 560} },
      { id: 'mus-cassette', name: '磁带转动', tags: ['磁带', '复古'], desc: '磁带卷轴转动走带，怀旧听觉记忆。', cfg: { kind: 'cassette' } },
      { id: 'mus-mic', name: '麦克风电平', tags: ['麦克风', '录音'], desc: '麦克风图标随电平点亮声波弧，播客录制。', cfg: { kind: 'mic', size: 560} },
      { id: 'mus-play', name: '播放律动', tags: ['播放', '按钮'], desc: '播放键随节拍呼吸放大，点击号召。', cfg: { kind: 'play', size: 560} },
      { id: 'mus-reel', name: '双卷轴', tags: ['卷轴', '开盘机'], desc: '双卷轴对转的开盘机风格，录音棚氛围。', cfg: { kind: 'reel' } }
    ]
  });

  MF.forge({
    cat: '数字计数', type: 'block', dur: 5.5, poster: 0.62,
    params: NUM_PARAMS, draw: numDraw,
    ids: [
      { id: 'num-count-up', name: '数字增长', tags: ['数字', '增长'], desc: '数字急速滚动到目标值，数据汇报开场。', cfg: { kind: 'count-up', num: 8200 } },
      { id: 'num-percent', name: '百分比冲刺', tags: ['百分比', '进度'], desc: '百分比冲刺到目标，完成度表达。', cfg: { kind: 'percent', num: 98, suffix: '' } },
      { id: 'num-odometer', name: '滚轮数字', tags: ['滚轮', '里程'], desc: '每位数字像里程表一样滚动归位，仪式感强。', cfg: { kind: 'odometer', num: 2026 } },
      { id: 'num-currency', name: '金额滚动', tags: ['金额', '营收'], desc: '人民币金额滚动增长，营收与 GMV 场景。', cfg: { kind: 'currency', num: 1280000 } },
      { id: 'num-countdown', name: '倒计时', tags: ['倒计时', '开场'], desc: '3-2-1 倒计时伴随进度环，发布会开场。', cfg: { kind: 'countdown', num: 3 } },
      { id: 'num-score', name: '分数跳加', tags: ['分数', '游戏'], desc: '分数回弹跳加，游戏与积分场景。', cfg: { kind: 'score', num: 9900 } },
      { id: 'num-slot', name: '老虎机翻牌', tags: ['翻牌', '抽奖'], desc: '数字如老虎机滚动并逐位锁定，抽奖开奖。', cfg: { kind: 'slot', num: 6688 } },
      { id: 'num-ticker', name: '行情跑马', tags: ['跑马', '行情'], desc: '多标的行情横向滚动涨跌，金融氛围。', cfg: { kind: 'ticker', num: 3820 } },
      { id: 'num-stats-row', name: '三联数据', tags: ['数据', '三联'], desc: '三组关键数字错峰滚动，数据看板。', cfg: { kind: 'stats-row', num: 5200 } },
      { id: 'num-flip-date', name: '日期翻牌', tags: ['翻牌', '日历'], desc: '月日翻牌日历，日期提醒与倒计时场景。', cfg: { kind: 'flip-date' } }
    ]
  });
})();

/* ════════ assets/js/effects-17.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 17
   原语：地图轨迹（定位 / 航线 / 雷达） / 拼贴手账（照片网格 / 贴纸 / 胶片）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：地图轨迹 ══════════════════════════ */

  var MAP_PARAMS = [
    P('kind', '形态', 'route', sel('route', [
      ['route', '路线描绘'], ['pin', '定位图钉'], ['radar', '雷达扫描'],
      ['globe', '经纬线球'], ['compass', '罗盘'], ['dots', '点阵地图'],
      ['flight', '航线弧线'], ['heat', '热力扩散'], ['grid-locate', '网格定位'],
      ['cluster', '多点聚合'], ['contour', '等高线'], ['gps', 'GPS 波纹']
    ])),
    P('text', '地名', 'SHENZHEN', txt('SHENZHEN')),
    P('size', '基准尺寸', 340.0, rng(340.0, 1848, 780.0, 4.0)),
    P('points', '节点数', 6, rng(6, 2, 16, 1)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  function mapDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var n = Math.max(2, Math.round(p.points));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 26 * S * amt; }
    }
    function pin(x, y, s2, a2, c) {
      ctx.globalAlpha *= 1;
      ctx.save();
      ctx.translate(x, y); ctx.scale(s2, s2);
      ctx.beginPath();
      ctx.arc(0, -s2 * 0.8, s2 * 0.55, Math.PI * 0.85, Math.PI * 0.15, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = U.rgba(c, a2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -s2 * 0.8, s2 * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, a2); ctx.fill();
      ctx.restore();
    }

    if (kind === 'route') {
      var pts = [];
      for (var i = 0; i < n; i++) {
        pts.push([W * U.rnd(0.2, 0.8, i * 2), H * U.rnd(0.28, 0.72, i * 2 + 1)]);
      }
      var total = n - 1;
      var prog = e.inOutCubic(U.clamp(tt / 2.6, 0, 1));
      var seg = prog * total;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      /* 底图网格 */
      ctx.strokeStyle = U.rgba(U.ink, 0.07);
      ctx.lineWidth = 1.5 * S;
      for (var gx = 0; gx <= 8; gx++) {
        ctx.beginPath(); ctx.moveTo(W * (0.1 + gx * 0.1), H * 0.12); ctx.lineTo(W * (0.1 + gx * 0.1), H * 0.88); ctx.stroke();
      }
      for (var gy = 0; gy <= 5; gy++) {
        ctx.beginPath(); ctx.moveTo(W * 0.1, H * (0.12 + gy * 0.152)); ctx.lineTo(W * 0.9, H * (0.12 + gy * 0.152)); ctx.stroke();
      }
      glowOn(col, p.glow);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var s2 = 1; s2 <= Math.min(total, Math.ceil(seg)); s2++) {
        var f2 = U.clamp(seg - (s2 - 1), 0, 1);
        ctx.lineTo(U.lerp(pts[s2 - 1][0], pts[s2][0], f2), U.lerp(pts[s2 - 1][1], pts[s2][1], f2));
      }
      ctx.lineWidth = 5 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      for (var pi = 0; pi < n; pi++) {
        if (pi > seg + 0.01) break;
        var reached = pi < seg - 0.05;
        ctx.beginPath(); ctx.arc(pts[pi][0], pts[pi][1], (reached ? 7 : 5) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(reached ? col : U.ink, 0.95); ctx.fill();
      }
      var tipI = Math.min(n - 1, Math.floor(seg) + (seg % 1 > 0.02 ? 1 : 0));
      var pulse = 1 + Math.sin(tt * 6) * 0.2;
      pin(pts[tipI][0], pts[tipI][1], 30 * S * pulse, U.clamp(tt * 2, 0, 1), col);
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText(label, cx, H * 0.92);
    } else if (kind === 'pin') {
      var drop = e.outBounce(U.clamp(tt / 1.1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var py = cy - R * 0.1 + (1 - drop) * -R * 0.8;
      for (var rk = 0; rk < 3; rk++) {
        var rp = (tt * 0.8 + rk * 0.3) % 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy + R * 0.52, R * 0.32 * rp, R * 0.1 * rp, 0, 0, Math.PI * 2);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(col, (1 - rp) * 0.8);
        ctx.stroke();
      }
      glowOn(col, p.glow);
      pin(cx, py, R * 0.16, 1, col);
      ctx.font = U.fs(R * 0.14 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.9) / 0.4, 0, 1));
      ctx.fillText(label, cx, cy + R * 0.88);
    } else if (kind === 'radar') {
      var sweep = (tt * 1.1) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var rr2 = 1; rr2 <= 3; rr2++) {
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.24 * rr2, 0, Math.PI * 2);
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(col, 0.3); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (var li2 = 0; li2 <= 6; li2++) {
        var la = -Math.PI * 0.5 + (li2 / 6) * Math.PI * 2;
        ctx.lineTo(cx + Math.cos(la) * R * 0.72, cy + Math.sin(la) * R * 0.72);
      }
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.22); ctx.stroke();
      var sg = ctx.createConicGradient ? null : null;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.72, -Math.PI / 2 + sweep * Math.PI * 2 - 0.9, -Math.PI / 2 + sweep * Math.PI * 2);
      ctx.closePath();
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.72);
      rg.addColorStop(0, U.rgba(col, 0.55));
      rg.addColorStop(1, U.rgba(col, 0.04));
      ctx.fillStyle = rg; ctx.fill();
      ctx.restore();
      for (var bi = 0; bi < n; bi++) {
        var ba = U.rnd(0, Math.PI * 2, bi + 9);
        var br = R * U.rnd(0.2, 0.66, bi + 77);
        var bAng = ba - sweep * Math.PI * 2;
        var diff = Math.abs(Math.atan2(Math.sin(bAng), Math.cos(bAng)));
        var lit = diff < 0.5 ? 1 - diff / 0.5 : 0.12;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ba) * br, cy + Math.sin(ba) * br, 4.5 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.3), 0.2 + lit * 0.8);
        ctx.fill();
      }
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(label + ' · SCANNING', cx, cy + R * 0.95);
    } else if (kind === 'globe') {
      var rot2 = tt * 0.5;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.4);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
      ctx.lineWidth = 2.4 * S; ctx.strokeStyle = U.rgba(col, 0.85); ctx.stroke();
      ctx.shadowBlur = 0;
      for (var lon = 0; lon < 6; lon++) {
        ctx.beginPath();
        for (var la2 = 0; la2 <= 32; la2++) {
          var latA = (la2 / 32) * Math.PI * 2;
          var w = Math.sin(latA);
          var xx = Math.cos(latA) * Math.sin(rot2 + lon * 0.52) * R * 0.62;
          var yy = Math.cos(latA) * Math.cos(rot2 + lon * 0.52) * R * 0.62 * 0.28;
          var py2 = cy + Math.sin(latA) * R * 0.62;
          var px2 = cx + xx;
          if (!la2) ctx.moveTo(px2, py2 + yy); else ctx.lineTo(px2, py2 + yy);
        }
        ctx.lineWidth = 1.6 * S;
        ctx.strokeStyle = U.rgba(col, 0.3); ctx.stroke();
      }
      for (var lat = 1; lat < 4; lat++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.62 * Math.sin(lat * 0.5), R * 0.62 * Math.sin(lat * 0.5) * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(col, 0.3); ctx.lineWidth = 1.6 * S; ctx.stroke();
      }
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.95);
    } else if (kind === 'compass') {
      var wob = Math.sin(tt * 2.2) * 0.35 + Math.sin(tt * 0.7) * 0.2;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.6, 0, Math.PI * 2);
      ctx.lineWidth = R * 0.03 * S; ctx.strokeStyle = U.rgba(col, 0.85); ctx.stroke();
      ctx.font = U.fs(R * 0.11 * S, 800);
      for (var cd = 0; cd < 4; cd++) {
        var ca = cd * Math.PI / 2 - Math.PI / 2;
        ctx.fillStyle = U.rgba(cd === 0 ? col : U.ink, cd === 0 ? 0.95 : 0.55);
        ctx.fillText('NESW'.charAt(cd), cx + Math.cos(ca) * R * 0.5, cy + Math.sin(ca) * R * 0.5);
      }
      for (var tk = 0; tk < 12; tk++) {
        var ta = (tk / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ta) * R * 0.56, cy + Math.sin(ta) * R * 0.56);
        ctx.lineTo(cx + Math.cos(ta) * R * 0.6, cy + Math.sin(ta) * R * 0.6);
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(U.ink, 0.4); ctx.stroke();
      }
      glowOn(col, p.glow * 0.5);
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(wob);
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.42); ctx.lineTo(R * 0.09, 0); ctx.lineTo(-R * 0.09, 0);
      ctx.closePath();
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, R * 0.42); ctx.lineTo(R * 0.09, 0); ctx.lineTo(-R * 0.09, 0);
      ctx.closePath();
      ctx.fillStyle = U.rgba(U.ink, 0.35); ctx.fill();
      ctx.restore();
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.fillText(label, cx, cy + R * 0.95);
    } else if (kind === 'dots') {
      var cols2 = Math.floor(W * 0.62 / (R * 0.075));
      var rows2 = Math.floor(H * 0.5 / (R * 0.075));
      var reveal = e.inOutCubic(U.clamp(tt / 2, 0, 1));
      for (var di = 0; di < cols2 * rows2; di++) {
        var dx = di % cols2, dy2 = Math.floor(di / cols2);
        var distC = Math.abs(dx - cols2 / 2) / cols2 + Math.abs(dy2 - rows2 / 2) / rows2;
        var dk = U.clamp((reveal - distC * 0.9) / 0.3, 0, 1);
        if (dk <= 0.02) continue;
        var on = U.rng(di) > 0.32;
        ctx.beginPath();
        ctx.arc(W * 0.19 + dx * R * 0.075, H * 0.26 + dy2 * R * 0.075, R * 0.02 * dk, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(on ? col : U.ink, (on ? 0.85 : 0.18) * dk);
        ctx.fill();
      }
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1.4) / 0.5, 0, 1) * 0.95);
      ctx.fillText(label, cx, H * 0.87);
    } else if (kind === 'flight') {
      var x0 = W * 0.24, y0 = cy + R * 0.3, x1 = W * 0.76, y1 = cy - R * 0.34;
      var prog2 = e.inOutCubic(U.clamp(tt / 2.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.setLineDash([8 * S, 10 * S]);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy - R * 0.75, x1, y1);
      ctx.lineWidth = 2.6 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.3); ctx.stroke();
      ctx.setLineDash([]);
      glowOn(col, p.glow);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      var steps = 24;
      for (var s3 = 1; s3 <= Math.ceil(steps * prog2); s3++) {
        var f3 = U.clamp(steps * prog2 - (s3 - 1), 0, 1) / steps + (s3 - 1) / steps;
        var qx = (1 - f3) * (1 - f3) * x0 + 2 * (1 - f3) * f3 * cx + f3 * f3 * x1;
        var qy = (1 - f3) * (1 - f3) * y0 + 2 * (1 - f3) * f3 * (cy - R * 0.75) + f3 * f3 * y1;
        ctx.lineTo(qx, qy);
      }
      ctx.lineWidth = 4.4 * S; ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      var fT = U.clamp(prog2 * steps, 0, steps) / steps;
      var px3 = (1 - fT) * (1 - fT) * x0 + 2 * (1 - fT) * fT * cx + fT * fT * x1;
      var py3 = (1 - fT) * (1 - fT) * y0 + 2 * (1 - fT) * fT * (cy - R * 0.75) + fT * fT * y1;
      var prevT = Math.max(0, fT - 0.015);
      var pvx = (1 - prevT) * (1 - prevT) * x0 + 2 * (1 - prevT) * prevT * cx + prevT * prevT * x1;
      var pvy = (1 - prevT) * (1 - prevT) * y0 + 2 * (1 - prevT) * prevT * (cy - R * 0.75) + prevT * prevT * y1;
      ctx.save();
      ctx.translate(px3, py3); ctx.rotate(Math.atan2(py3 - pvy, px3 - pvx));
      ctx.font = U.fs(R * 0.14, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText('✈', 0, 0);
      ctx.restore();
      ctx.beginPath(); ctx.arc(x0, y0, 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.ink, 0.9); ctx.fill();
      ctx.beginPath(); ctx.arc(x1, y1, 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText('FROM', x0, y0 + R * 0.16);
      ctx.fillText(label, x1, y1 - R * 0.14);
    } else if (kind === 'heat') {
      var pulse2 = (tt * 0.7) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var hi = 0; hi < Math.max(2, Math.round(n * 0.7)); hi++) {
        var hx = W * U.rnd(0.25, 0.75, hi * 2), hy = H * U.rnd(0.3, 0.7, hi * 2 + 1);
        var hp = (pulse2 + U.rnd(0, 1, hi)) % 1;
        var hr = R * (0.1 + hp * 0.3);
        var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        hg.addColorStop(0, U.rgba(U.mix(col, U.accent2, hi / n), 0.5 * (1 - hp)));
        hg.addColorStop(1, U.rgba(col, 0));
        ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fillStyle = hg; ctx.fill();
      }
      var mx = W * U.rnd(0.3, 0.7, 11), my = H * U.rnd(0.35, 0.65, 12);
      pin(mx, my, R * 0.13, U.clamp(tt * 2, 0, 1), col);
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, H * 0.88);
    } else if (kind === 'grid-locate') {
      var lock = e.outCubic(U.clamp(tt / 1.4, 0, 1));
      var gw = R * 0.9 * lock, gh = R * 0.55 * lock;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.strokeStyle = U.rgba(U.ink, 0.14); ctx.lineWidth = 1.5 * S;
      for (var gl = 0; gl < 7; gl++) {
        ctx.beginPath(); ctx.moveTo(W * 0.2 + gl * W * 0.1, H * 0.2); ctx.lineTo(W * 0.2 + gl * W * 0.1, H * 0.8); ctx.stroke();
      }
      for (var gl2 = 0; gl2 < 5; gl2++) {
        ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.2 + gl2 * H * 0.15); ctx.lineTo(W * 0.8, H * 0.2 + gl2 * H * 0.15); ctx.stroke();
      }
      glowOn(col, p.glow);
      ctx.lineWidth = 3.4 * S;
      ctx.strokeStyle = U.rgba(col, 0.95);
      var segs = [[-1, -1, 1, 0], [1, -1, 0, 1], [1, 1, -1, 0], [-1, 1, 0, -1]];
      for (var sg2 = 0; sg2 < 4; sg2++) {
        var sk = U.clamp((lock - sg2 * 0.12) / 0.5, 0, 1);
        if (sk <= 0.01) continue;
        var sx = cx + segs[sg2][0] * gw / 2, sy = cy + segs[sg2][1] * gh / 2;
        ctx.beginPath();
        ctx.moveTo(sx - segs[sg2][2] * gw * 0.22 * sk, sy);
        ctx.lineTo(sx, sy);
        ctx.lineTo(sx, sy - segs[sg2][3] * gh * 0.22 * sk);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 5 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.5 * lock, 0, Math.PI * 2);
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.4); ctx.stroke();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.95);
      ctx.fillText(label + '  ' + Math.round(31.2 + U.rnd(-0.4, 0.4, 3) * 10) + '°N ' + Math.round(121.4) + '°E', cx, cy + R * 0.85);
    } else if (kind === 'cluster') {
      var cl = e.outCubic(U.clamp(tt / 1.6, 0, 1));
      var spots = [];
      for (var ci = 0; ci < n * 4; ci++) {
        spots.push([cx + Math.sin(U.rng(ci * 3)) * R * 0.5, cy + Math.cos(U.rng(ci * 3 + 1)) * R * 0.4]);
      }
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var ci2 = 0; ci2 < spots.length; ci2++) {
        var ck = U.clamp((cl - ci2 / spots.length) / 0.3, 0, 1);
        if (ck <= 0.01) continue;
        var pulling = 1 - ck * 0.35;
        var px4 = U.lerp(spots[ci2][0] * 1.08, spots[ci2][0], ck);
        var py4 = U.lerp(spots[ci2][1] * 1.08, spots[ci2][1], ck) * pulling;
        ctx.beginPath();
        ctx.arc(px4, py4, 4 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.8 * ck);
        ctx.fill();
      }
      var count = Math.round(spots.length * cl);
      var badge = R * 0.2 * e.outBack(U.clamp((cl - 0.5) / 0.5, 0, 1));
      if (badge > 1) {
        ctx.beginPath(); ctx.arc(cx + R * 0.2, cy - R * 0.22, badge, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        ctx.font = U.fs(badge * 0.9, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.95);
        ctx.fillText(String(count), cx + R * 0.2, cy - R * 0.22);
      }
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.75);
    } else if (kind === 'contour') {
      var reveal2 = e.inOutCubic(U.clamp(tt / 2.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var ring = 0; ring < 7; ring++) {
        var rk2 = U.clamp((reveal2 - ring * 0.09) / 0.5, 0, 1);
        if (rk2 <= 0.01) continue;
        ctx.beginPath();
        for (var a3 = 0; a3 <= Math.PI * 2 + 0.01; a3 += 0.12) {
          var wob3 = U.noise2(Math.cos(a3) * 1.4 + ring, Math.sin(a3) * 1.4 - ring, U.seed) * R * 0.09;
          var rr3 = R * (0.12 + ring * 0.09) + wob3;
          var px5 = cx + Math.cos(a3) * rr3, py5 = cy + Math.sin(a3) * rr3 * 0.72;
          if (!a3) ctx.moveTo(px5, py5); else ctx.lineTo(px5, py5);
        }
        ctx.closePath();
        ctx.lineWidth = 2 * S;
        ctx.strokeStyle = U.rgba(U.mix(col, U.ink, ring / 8), 0.55 * rk2);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 4 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.fillText(label + ' · ELEVATION', cx, cy + R * 0.78);
    } else if (kind === 'gps') {
      var pk2 = (tt * 0.8) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.shadowBlur = 0;
      for (var gp = 0; gp < 3; gp++) {
        var gk = (pk2 + gp / 3) % 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.12 + gk * 0.5), 0, Math.PI * 2);
        ctx.lineWidth = 4 * S * (1 - gk);
        ctx.strokeStyle = U.rgba(col, (1 - gk) * 0.7);
        ctx.stroke();
      }
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText(label, cx, cy + R * 0.85);
      ctx.font = U.fs(R * 0.09 * S, 600);
      ctx.fillStyle = U.rgba(col, 0.8);
      ctx.fillText('±' + (2 + Math.abs(Math.sin(tt * 3)) * 3).toFixed(1) + 'm', cx, cy + R * 1.08);
    } else {
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.4); ctx.fill();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.7);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：拼贴手账 ══════════════════════════ */

  var COLLAGE_PARAMS = [
    P('kind', '形态', 'photo-grid', sel('photo-grid', [
      ['photo-grid', '照片网格'], ['polaroid', '拍立得'], ['tape', '胶带贴条'],
      ['sticker', '贴纸弹跳'], ['shuffle', '卡牌洗牌'], ['scrapbook', '剪贴簿'],
      ['magazine', '杂志排版'], ['pin-board', '软木板'], ['film-strip', '胶片走带'],
      ['mood', '情绪板拼贴']
    ])),
    P('text', '标题', 'MEMORY', txt('MEMORY')),
    P('tiles', '块数', 9, rng(9, 4, 16, 1)),
    P('size', '基准尺寸', 1144, rng(1144, 140.0, 1602, 4.0)),
    P('speed', '速度', 1, rng(1, 0.5, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.2, rng(0.2, 0, 1, 0.05))
  ];

  function collageDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var n = Math.max(4, Math.round(p.tiles));
    var cols = Math.ceil(Math.sqrt(n));
    var rows = Math.ceil(n / cols);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    function tileFill(x, y, w, h, i) {
      var cA = U.mix(col, U.accent2, (i % 5) / 5);
      var g2 = ctx.createLinearGradient(x, y, x + w, y + h);
      g2.addColorStop(0, U.rgba(cA, 0.8));
      g2.addColorStop(1, U.rgba(U.mix(cA, U.bg1, 0.5), 0.9));
      ctx.fillStyle = g2;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = U.rgba(U.ink, 0.25);
      ctx.beginPath();
      ctx.arc(x + w * U.rnd(0.3, 0.7, i), y + h * U.rnd(0.3, 0.7, i + 9), Math.min(w, h) * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    if (kind === 'photo-grid') {
      var gap = R * 0.06;
      var tw = (R * 1.7 - gap * (cols - 1)) / cols;
      var th = (R * 1.7 - gap * (rows - 1)) / rows;
      var ox = cx - R * 0.85, oy = cy - R * 0.85;
      for (var i = 0; i < n; i++) {
        var gx = i % cols, gy = Math.floor(i / cols);
        var k = e.outBack(U.clamp((tt - 0.2 - i * 0.09) / 0.5, 0, 1));
        if (k <= 0.01) continue;
        ctx.save();
        ctx.translate(ox + gx * (tw + gap) + tw / 2, oy + gy * (th + gap) + th / 2);
        ctx.rotate((1 - k) * 0.3 + U.rnd(-0.06, 0.06, i));
        ctx.scale(k, k);
        tileFill(-tw / 2, -th / 2, tw, th, i);
        ctx.restore();
      }
      var tk = e.outCubic(U.clamp((tt - 0.4 - n * 0.09) / 0.5, 0, 1));
      ctx.font = U.fs(R * 0.2 * tk, 900);
      ctx.fillStyle = U.rgba(U.ink, tk);
      ctx.fillText(label, cx, cy + R * 1.22);
    } else if (kind === 'polaroid') {
      var shots = Math.min(4, Math.max(2, Math.round(n / 3)));
      for (var pi = 0; pi < shots; pi++) {
        var pk = e.outBack(U.clamp((tt - 0.3 - pi * 0.45) / 0.55, 0, 1));
        if (pk <= 0.01) continue;
        var pa = (pi / shots - 0.5) * 1.2 - 0.6;
        var pr = R * (0.62 + pi * 0.05);
        ctx.save();
        ctx.translate(cx + Math.cos(pa) * pr * 0.4, cy + Math.sin(pa) * pr * 0.32);
        ctx.rotate(pa * 0.5);
        ctx.scale(pk, pk);
        var pw = R * 0.56, ph = R * 0.66;
        ctx.shadowColor = U.rgba('#000000', 0.35); ctx.shadowBlur = 18 * S; ctx.shadowOffsetY = 8 * S;
        ctx.fillStyle = U.rgba('#F4F1E8', 0.97);
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        tileFill(-pw / 2 + pw * 0.08, -ph / 2 + pw * 0.08, pw * 0.84, pw * 0.72, pi + 3);
        ctx.fillStyle = U.rgba('#2A2A2A', 0.75);
        ctx.font = U.fs(pw * 0.11, 600);
        ctx.fillText(label.slice(0, 8), 0, ph * 0.36);
        ctx.restore();
      }
    } else if (kind === 'tape' || kind === 'sticker') {
      var items = Math.min(5, Math.max(2, Math.round(n / 2)));
      for (var si = 0; si < items; si++) {
        var sk = e.outBack(U.clamp((tt - 0.3 - si * 0.4) / 0.5, 0, 1));
        if (sk <= 0.01) continue;
        var ang = U.rnd(-0.5, 0.5, si) * (kind === 'tape' ? 0.35 : 0.8);
        var pos = [(si / Math.max(1, items - 1) - 0.5) * R * 1.5, Math.sin(si * 2.4) * R * 0.4];
        ctx.save();
        ctx.translate(cx + pos[0], cy + pos[1]);
        ctx.rotate(ang);
        ctx.scale(sk, sk);
        if (kind === 'tape') {
          var tw2 = R * 0.5, th2 = R * 0.11;
          ctx.rotate(U.rnd(-0.5, 0.5, si) * 0.9);
          ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.3), 0.6);
          ctx.fillRect(-tw2 / 2, -th2 / 2, tw2, th2);
          ctx.fillStyle = U.rgba(U.ink, 0.15);
          for (var zi = 0; zi < 5; zi++) ctx.fillRect(-tw2 / 2 + zi * tw2 / 5, -th2 / 2, tw2 / 10, th2);
        } else {
          var st = R * 0.24;
          ctx.beginPath();
          for (var sd = 0; sd < 10; sd++) {
            var sa = (sd / 10) * Math.PI * 2 - Math.PI / 2;
            var sr2 = sd % 2 ? st * 0.42 : st;
            if (!sd) ctx.moveTo(Math.cos(sa) * sr2, Math.sin(sa) * sr2);
            else ctx.lineTo(Math.cos(sa) * sr2, Math.sin(sa) * sr2);
          }
          ctx.closePath();
          ctx.fillStyle = U.rgba(si % 2 ? U.accent2 : col, 0.92);
          ctx.fill();
          ctx.font = U.fs(st * 0.8, 800);
          ctx.fillStyle = U.rgba(U.bg1, 0.9);
          ctx.fillText('★', 0, 0);
        }
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.17 * e.outCubic(U.clamp((tt - 0.6) / 0.5, 0, 1)), 900);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.6) / 0.5, 0, 1));
      ctx.fillText(label, cx, cy + R * 1.05);
    } else if (kind === 'shuffle') {
      var deck = Math.min(6, Math.max(3, Math.round(n / 2)));
      for (var di = deck - 1; di >= 0; di--) {
        var cycle = (tt * 0.5 + di / deck) % 1;
        var going = cycle < 0.5;
        var cp = going ? e.inOutCubic(cycle * 2) : e.inOutCubic((1 - cycle) * 2);
        var ang2 = U.rnd(-0.2, 0.2, di) + cp * 0.5;
        var dx2 = U.lerp(di * 6 * S - deck * 3 * S, R * 0.9, cp);
        ctx.save();
        ctx.translate(cx + dx2 * (going ? 1 : -1) * (going ? 1 : 1) * (going ? 1 : -1) * (going ? 1 : 1) * (going ? 1 : 0) + (going ? 0 : 0), cy);
        ctx.restore();
        ctx.save();
        var sx2 = going ? U.lerp(di * 5 * S, R * 0.85, cp) : U.lerp(-R * 0.85, (di - deck / 2) * 5 * S, cp);
        ctx.translate(cx + sx2, cy);
        ctx.rotate(ang2);
        var cw2 = R * 0.52, ch2 = R * 0.74;
        ctx.shadowColor = U.rgba('#000000', 0.3); ctx.shadowBlur = 14 * S;
        U.rr(ctx, -cw2 / 2, -ch2 / 2, cw2, ch2, ch2 * 0.09);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg2, di / deck), 0.96);
        ctx.fill();
        ctx.shadowBlur = 0;
        U.rr(ctx, -cw2 / 2 + cw2 * 0.08, -ch2 / 2 + cw2 * 0.08, cw2 * 0.84, ch2 * 0.84, ch2 * 0.07);
        ctx.strokeStyle = U.rgba(U.ink, 0.2); ctx.lineWidth = 1.6 * S; ctx.stroke();
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.14 * U.clamp((tt - 0.4) / 0.5, 0, 1), 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.4) / 0.5, 0, 1) * 0.9);
      ctx.fillText(label, cx, cy + R * 0.95);
    } else if (kind === 'scrapbook' || kind === 'pin-board') {
      var pages = Math.min(4, Math.max(2, Math.round(n / 3)));
      if (kind === 'pin-board') {
        ctx.fillStyle = U.rgba('#8A6A44', 0.35);
        ctx.fillRect(cx - R * 1.05, cy - R * 0.85, R * 2.1, R * 1.7);
      }
      for (var gi = 0; gi < pages; gi++) {
        var gk2 = e.outCubic(U.clamp((tt - 0.25 - gi * 0.5) / 0.6, 0, 1));
        if (gk2 <= 0.01) continue;
        var ga = (gi / pages - 0.5) * 0.9;
        ctx.save();
        ctx.translate(cx + (gi - pages / 2 + 0.5) * R * 0.34, cy + Math.sin(gi * 2.2) * R * 0.18);
        ctx.rotate(ga * 0.4 + U.rnd(-0.1, 0.1, gi));
        ctx.scale(gk2, gk2);
        var gw2 = R * 0.5, gh2 = R * 0.6;
        ctx.shadowColor = U.rgba('#000000', 0.3); ctx.shadowBlur = 12 * S; ctx.shadowOffsetY = 6 * S;
        ctx.fillStyle = U.rgba(U.mix('#F4F1E8', col, gi / pages * 0.35), 0.97);
        ctx.fillRect(-gw2 / 2, -gh2 / 2, gw2, gh2);
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        tileFill(-gw2 / 2 + gw2 * 0.1, -gh2 / 2 + gw2 * 0.1, gw2 * 0.8, gh2 * 0.5, gi + 2);
        ctx.fillStyle = U.rgba('#2A2A2A', 0.7);
        for (var ln = 0; ln < 3; ln++) {
          ctx.fillRect(-gw2 * 0.36, gh2 * 0.02 + ln * gh2 * 0.11, gw2 * U.rnd(0.4, 0.72, gi + ln), 3 * S);
        }
        if (kind === 'pin-board') {
          ctx.beginPath(); ctx.arc(0, -gh2 / 2 + gh2 * 0.07, 6 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        } else {
          ctx.save();
          ctx.rotate(0.2);
          ctx.fillStyle = U.rgba(col, 0.55);
          ctx.fillRect(-gw2 * 0.28, -gh2 / 2 - gh2 * 0.05, gw2 * 0.56, gh2 * 0.1);
          ctx.restore();
        }
        ctx.restore();
      }
    } else if (kind === 'magazine') {
      var mk = e.outCubic(U.clamp(tt / 1.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = U.fs(R * 0.42, 900);
      var chars = label.split('');
      var mx2 = W * 0.12;
      for (var mc = 0; mc < chars.length; mc++) {
        var mck = U.clamp((mk - mc * 0.05) / 0.5, 0, 1);
        ctx.globalAlpha = mck * U.clamp(tt * 3, 0, 1);
        ctx.fillStyle = U.rgba(U.ink, 1);
        ctx.fillText(chars[mc], mx2, cy - R * 0.2);
        mx2 += ctx.measureText(chars[mc]).width;
      }
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bw2 = R * 0.62, bh2 = R * 0.8;
      ctx.save();
      ctx.translate(W * 0.72, cy);
      ctx.rotate(0.04);
      ctx.scale(e.outBack(U.clamp((tt - 0.5) / 0.6, 0, 1)), 1);
      tileFill(-bw2 / 2, -bh2 / 2, bw2, bh2, 4);
      ctx.restore();
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      for (var ml = 0; ml < 4; ml++) {
        var mlk = U.clamp((mk - 0.4 - ml * 0.1) / 0.4, 0, 1);
        ctx.fillRect(W * 0.12, cy + R * 0.05 + ml * R * 0.09, R * 0.5 * mlk, 4 * S);
      }
      ctx.beginPath();
      ctx.moveTo(W * 0.12, cy - R * 0.52);
      ctx.lineTo(W * 0.12 + R * 0.4 * mk, cy - R * 0.52);
      ctx.lineWidth = 6 * S;
      ctx.strokeStyle = U.rgba(col, 0.95);
      ctx.stroke();
      ctx.textAlign = 'center';
    } else if (kind === 'film-strip') {
      var scroll = (tt * R * 0.24) % (R * 0.4);
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      ctx.fillStyle = U.rgba('#0B0C10', 0.97);
      ctx.fillRect(0, cy - R * 0.5, W, R);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      for (var fx = -1; fx < W / (R * 0.08) + 1; fx++) {
        for (var fy = 0; fy < 2; fy++) {
          ctx.beginPath();
          ctx.rect(fx * R * 0.08 + (scroll % (R * 0.08)) - R * 0.02, cy - R * 0.44 + fy * R * 0.88, R * 0.035, R * 0.035);
          ctx.fill();
        }
      }
      var frames = Math.ceil(W / (R * 0.42)) + 2;
      for (var fi2 = 0; fi2 < frames; fi2++) {
        var fxx = fi2 * R * 0.42 - (scroll % (R * 0.42)) - R * 0.42;
        tileFill(fxx + R * 0.03, cy - R * 0.32, R * 0.36, R * 0.64, fi2);
      }
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.font = U.fs(R * 0.1 * S, 800);
      ctx.textAlign = 'left';
      ctx.fillText(label + '  ·  ' + String(Math.floor(tt * 24)).padStart(3, '0') + ' FR', W * 0.06, cy + R * 0.72);
      ctx.textAlign = 'center';
    } else if (kind === 'mood') {
      var pieces = Math.min(8, Math.max(4, n));
      for (var mi = 0; mi < pieces; mi++) {
        var mk2 = e.outBack(U.clamp((tt - 0.2 - mi * 0.14) / 0.55, 0, 1));
        if (mk2 <= 0.01) continue;
        var ma = (mi / pieces) * Math.PI * 2 + 0.4;
        var mrr = R * (0.35 + (mi % 3) * 0.22);
        var mw = R * U.rnd(0.18, 0.34, mi), mh2 = R * U.rnd(0.14, 0.3, mi + 4);
        ctx.save();
        ctx.translate(cx + Math.cos(ma) * mrr, cy + Math.sin(ma) * mrr * 0.8);
        ctx.rotate(U.rnd(-0.4, 0.4, mi + 2));
        ctx.scale(mk2, mk2);
        ctx.fillStyle = U.rgba(U.mix(U.mix(col, U.accent2, (mi % 4) / 4), U.ink, 0.12), 0.9);
        ctx.fillRect(-mw / 2, -mh2 / 2, mw, mh2);
        ctx.fillStyle = U.rgba(U.bg1, 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(mw, mh2) * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.16 * e.outCubic(U.clamp((tt - 0.8) / 0.5, 0, 1)), 900);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.8) / 0.5, 0, 1));
      ctx.fillText(label, cx, cy);
    } else {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(0.05);
      tileFill(-R * 0.5, -R * 0.5, R, R, 1);
      ctx.restore();
      ctx.font = U.fs(R * 0.15, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.8);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '地图轨迹', type: 'block', dur: 6, poster: 0.5,
    params: MAP_PARAMS, draw: mapDraw,
    texts: ['SHENZHEN', 'SHANGHAI', 'BEIJING', 'HANGZHOU'],
    ids: [
      { id: 'map-route', name: '路线描绘', tags: ['路线', '行程'], desc: '路线沿节点逐段绘出，旅行与物流叙事。', cfg: { kind: 'route' } },
      { id: 'map-pin', name: '定位图钉', tags: ['定位', '落点'], desc: '图钉弹跳落下并荡开涟漪，地点标注。', cfg: { kind: 'pin', size: 1320} },
      { id: 'map-radar', name: '雷达扫描', tags: ['雷达', '扫描'], desc: '雷达扇形扫过点亮目标，监测与安防。', cfg: { kind: 'radar' } },
      { id: 'map-globe', name: '经纬线球', tags: ['地球', '全球'], desc: '经纬线缓慢转动，全球化业务表达。', cfg: { kind: 'globe', size: 1320} },
      { id: 'map-compass', name: '罗盘', tags: ['罗盘', '导航'], desc: '罗盘指针摆动寻北，探索与方向感。', cfg: { kind: 'compass' } },
      { id: 'map-dots', name: '点阵地图', tags: ['点阵', '浮现'], desc: '点阵从中心扩散浮现成地图质感。', cfg: { kind: 'dots' } },
      { id: 'map-flight', name: '航线弧线', tags: ['航线', '飞行'], desc: '飞机沿弧线航线飞过，跨境与出差叙事。', cfg: { kind: 'flight', size: 1320} },
      { id: 'map-heat', name: '热力扩散', tags: ['热力', '分布'], desc: '多个热力团呼吸扩散，数据分布可视化。', cfg: { kind: 'heat' } },
      { id: 'map-grid-locate', name: '网格定位', tags: ['锁定', '坐标'], desc: '四角锁定框收拢到目标点，军事与精准感。', cfg: { kind: 'grid-locate' } },
      { id: 'map-cluster', name: '多点聚合', tags: ['聚合', '计数'], desc: '散点收拢聚合并弹出计数徽标。', cfg: { kind: 'cluster', size: 1320} },
      { id: 'map-contour', name: '等高线', tags: ['等高线', '地形'], desc: '等高线一圈圈勾勒地形，户外与地理感。', cfg: { kind: 'contour' } },
      { id: 'map-gps', name: 'GPS 波纹', tags: ['GPS', '信号'], desc: '定位点发出波纹并显示精度，打卡场景。', cfg: { kind: 'gps', size: 1320} }
    ]
  });

  MF.forge({
    cat: '拼贴手账', type: 'block', dur: 6, poster: 0.55,
    params: COLLAGE_PARAMS, draw: collageDraw,
    texts: ['MEMORY', 'MOODBOARD', 'RECAP 2026', 'STORY'],
    ids: [
      { id: 'col-photo-grid', name: '照片网格', tags: ['网格', '相册'], desc: '照片格错落弹入组成网格，年度回顾。', cfg: { kind: 'photo-grid' } },
      { id: 'col-polaroid', name: '拍立得', tags: ['拍立得', '复古'], desc: '拍立得照片依次甩入堆叠，旅行手账。', cfg: { kind: 'polaroid' } },
      { id: 'col-tape', name: '胶带贴条', tags: ['胶带', '手账'], desc: '半透明胶带条啪啪贴上，手作质感。', cfg: { kind: 'tape' } },
      { id: 'col-sticker', name: '贴纸弹跳', tags: ['贴纸', '星星'], desc: '星星贴纸依次弹跳贴上，活泼手账。', cfg: { kind: 'sticker' } },
      { id: 'col-shuffle', name: '卡牌洗牌', tags: ['卡牌', '洗牌'], desc: '卡牌来回洗切，抽卡与悬念场景。', cfg: { kind: 'shuffle' } },
      { id: 'col-scrapbook', name: '剪贴簿', tags: ['剪贴', '翻页'], desc: '剪贴页带胶带依次贴上，回忆叙事。', cfg: { kind: 'scrapbook' } },
      { id: 'col-magazine', name: '杂志排版', tags: ['杂志', '标题'], desc: '大标题逐字排出配图版，刊物质感。', cfg: { kind: 'magazine' } },
      { id: 'col-pin-board', name: '软木板', tags: ['软木', '钉图'], desc: '便签钉上软木板，计划与灵感墙。', cfg: { kind: 'pin-board' } },
      { id: 'col-film-strip', name: '胶片走带', tags: ['胶片', '走带'], desc: '胶片帧横向走带滚动，电影质感。', cfg: { kind: 'film-strip' } },
      { id: 'col-mood', name: '情绪板拼贴', tags: ['情绪板', '拼贴'], desc: '色块碎片从四周拼合，情绪板开场。', cfg: { kind: 'mood' } }
    ]
  });
})();

/* ════════ assets/js/effects-18.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 18
   原语：HUD 仪表（控件 / 状态灯 / 锁定框） / 3D 立体（伪 3D 数学投影）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：HUD 仪表 ══════════════════════════ */

  var HUD_PARAMS = [
    P('kind', '形态', 'gauge', sel('gauge', [
      ['gauge', '仪表指针'], ['cluster', '三表盘'], ['toggle', '开关切换'],
      ['slider', '滑杆自动'], ['stat-card', '数据卡片'], ['spark', '迷你走势'],
      ['battery', '电量充放'], ['signal', '信号强度'], ['wifi', 'WiFi 波纹'],
      ['bluetooth', '蓝牙配对'], ['knob', '旋钮转动'], ['led', 'LED 序列灯'],
      ['lock-on', '目标锁定'], ['vitals', '心电图']
    ])),
    P('text', '标签', 'SYSTEM', txt('SYSTEM')),
    P('level', '数值', 76, rng(76, 0, 100, 1)),
    P('size', '基准尺寸', 1232, rng(1232, 140.0, 1725, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.4, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function hudDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var lv = U.clamp(p.level / 100, 0, 1);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    function jauge(x, y, r2, k, c, a2) {
      ctx.beginPath();
      ctx.arc(x, y, r2, Math.PI * 0.75, Math.PI * 2.25);
      ctx.lineWidth = r2 * 0.14;
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.stroke();
      if (k > 0.01) {
        ctx.beginPath();
        ctx.arc(x, y, r2, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * k));
        ctx.lineWidth = r2 * 0.14;
        ctx.strokeStyle = U.rgba(c, a2 === undefined ? 1 : a2);
        ctx.stroke();
      }
    }

    if (kind === 'gauge') {
      var k = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var needle = lv * k + Math.sin(tt * 2.2) * 0.012;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.6);
      jauge(cx, cy, R * 0.6, needle, col);
      ctx.shadowBlur = 0;
      for (var ti = 0; ti <= 10; ti++) {
        var ta = Math.PI * 0.75 + (ti / 10) * Math.PI * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ta) * R * 0.46, cy + Math.sin(ta) * R * 0.46);
        ctx.lineTo(cx + Math.cos(ta) * R * 0.52, cy + Math.sin(ta) * R * 0.52);
        ctx.lineWidth = 2.4 * S;
        ctx.strokeStyle = U.rgba(U.ink, 0.4);
        ctx.stroke();
      }
      var na = Math.PI * 0.75 + needle * Math.PI * 1.5;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(na);
      ctx.beginPath();
      ctx.moveTo(-R * 0.06, 0); ctx.lineTo(R * 0.5, -R * 0.02); ctx.lineTo(R * 0.5, R * 0.02); ctx.closePath();
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.ink, 0.9); ctx.fill();
      ctx.font = U.fs(R * 0.3, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(Math.round(needle * 100) + '%', cx, cy + R * 0.4);
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'cluster') {
      var kc = e.outCubic(U.clamp((tt - 0.3) / 1.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var vals = [lv, lv * 0.6, lv * 0.85];
      var labs = ['A', 'B', 'C'];
      for (var ci = 0; ci < 3; ci++) {
        var gx = cx + (ci - 1) * R * 0.78;
        var ckk = U.clamp((kc - ci * 0.12) / 0.88, 0, 1);
        jauge(gx, cy - R * 0.05, R * 0.3, vals[ci] * ckk, ci === 1 ? U.accent2 : col);
        ctx.font = U.fs(R * 0.13, 800);
        ctx.fillStyle = U.rgba(U.ink, 0.95);
        ctx.fillText(Math.round(vals[ci] * ckk * 100), gx, cy + R * 0.06);
        ctx.font = U.fs(R * 0.09 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(labs[ci], gx, cy + R * 0.26);
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.8);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'toggle') {
      var cyc = (tt * 0.55) % 1;
      var on = cyc < 0.5;
      var kk2 = e.outCubic(on ? U.clamp(cyc * 6, 0, 1) : U.clamp((0.5 - cyc) * 6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bw = R * 0.9, bh = R * 0.4;
      U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, bh / 2);
      ctx.fillStyle = U.rgba(on ? col : U.ink, on ? 0.95 : 0.18);
      ctx.fill();
      var kx = U.lerp(cx - bw / 2 + bh / 2, cx + bw / 2 - bh / 2, kk2);
      glowOn(on ? col : U.ink, on ? p.glow * 0.5 : 0);
      ctx.beginPath(); ctx.arc(kx, cy, bh * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, 0.97); ctx.fill();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(on ? col : U.ink, 0.85);
      ctx.fillText(on ? 'ON' : 'OFF', cx, cy + R * 0.62);
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, cx, cy - R * 0.62);
    } else if (kind === 'slider') {
      var auto = (Math.sin(tt * 1.4) + 1) / 2;
      var k3 = e.outCubic(U.clamp(tt / 1.2, 0, 1));
      var val = U.lerp(lv * 0.2, lv, k3) * 0.7 + auto * 0.3;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var sw = R * 1.1;
      U.rr(ctx, cx - sw / 2, cy - 4 * S, sw, 8 * S, 4 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.15); ctx.fill();
      U.rr(ctx, cx - sw / 2, cy - 4 * S, sw * val, 8 * S, 4 * S);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      glowOn(col, p.glow * 0.4);
      ctx.beginPath(); ctx.arc(cx - sw / 2 + sw * val, cy, R * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, 1); ctx.fill();
      ctx.lineWidth = 4 * S; ctx.strokeStyle = U.rgba(col, 1); ctx.stroke();
      ctx.font = U.fs(R * 0.14, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(Math.round(val * 100), cx - sw / 2 + sw * val, cy - R * 0.24);
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, cx, cy + R * 0.42);
    } else if (kind === 'stat-card') {
      var up = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((1 - e.outCubic(U.clamp(tt / 0.7, 0, 1))) * 0.06);
      ctx.scale(up, up);
      var cw = R * 1.1, ch = R * 0.72;
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch, ch * 0.14);
      ctx.fillStyle = U.rgba(U.bg2, 0.96); ctx.fill();
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.4); ctx.stroke();
      ctx.font = U.fs(ch * 0.16, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.textAlign = 'left';
      ctx.fillText(label, -cw * 0.38, -ch * 0.24);
      var vk = e.outExpo(U.clamp((tt - 0.5) / 1, 0, 1));
      ctx.font = U.fs(ch * 0.4, 900);
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText(String(Math.round(p.level * vk)), -cw * 0.38, ch * 0.14);
      var delta = U.rnd(-20, 40, 5);
      ctx.font = U.fs(ch * 0.15, 800);
      ctx.fillStyle = U.rgba(delta > 0 ? '#5DFF8F' : '#FF6A5D', 0.95);
      ctx.fillText((delta > 0 ? '▲ +' : '▼ ') + delta.toFixed(1) + '%', -cw * 0.38, ch * 0.36);
      ctx.restore();
    } else if (kind === 'spark') {
      var k4 = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      var pts = [];
      for (var si = 0; si <= 30; si++) {
        var px = W * 0.28 + (si / 30) * W * 0.44;
        var py = cy + U.noise2(si * 0.4, 3, U.seed) * R * 0.3 * (0.4 + 0.6 * (si / 30)) - k4 * R * 0.18;
        pts.push([px, py]);
        if (!si) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.lineWidth = 4.4 * S; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineTo(W * 0.72, cy + R * 0.42);
      ctx.lineTo(W * 0.28, cy + R * 0.42);
      ctx.closePath();
      var ag = ctx.createLinearGradient(0, cy - R * 0.4, 0, cy + R * 0.42);
      ag.addColorStop(0, U.rgba(col, 0.3));
      ag.addColorStop(1, U.rgba(col, 0));
      ctx.fillStyle = ag; ctx.fill();
      var last2 = pts[Math.min(pts.length - 1, Math.ceil(30 * k4))];
      ctx.beginPath(); ctx.arc(last2[0], last2[1], 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.95); ctx.fill();
      ctx.font = U.fs(R * 0.16, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(label + ' ' + Math.round(lv * k4), W * 0.28, cy - R * 0.5);
    } else if (kind === 'battery') {
      var charge = (tt * 0.45) % 1;
      var showK = e.inOutCubic(U.clamp(tt / 1, 0, 1));
      var blevel = Math.abs(charge * 2 - 1) < 0.5 ? charge : (1 - charge);
      var level = U.lerp(0.08, lv, showK) * (0.3 + 0.7 * blevel);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bw2 = R * 1.06, bh2 = R * 0.46;
      U.rr(ctx, cx - bw2 / 2, cy - bh2 / 2, bw2, bh2, bh2 * 0.16);
      ctx.lineWidth = 4 * S; ctx.strokeStyle = U.rgba(U.ink, 0.5); ctx.stroke();
      U.rr(ctx, cx + bw2 / 2 + 6 * S, cy - bh2 * 0.16, 12 * S, bh2 * 0.32, 4 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.5); ctx.fill();
      glowOn(level > 0.2 ? col : '#FF6A5D', p.glow * 0.4);
      if (level > 0.015) {
        U.rr(ctx, cx - bw2 / 2 + 7 * S, cy - bh2 / 2 + 7 * S, Math.max(bh2 * 0.14, (bw2 - 14 * S) * level), bh2 - 14 * S, bh2 * 0.1);
        ctx.fillStyle = U.rgba(level > 0.2 ? col : '#FF6A5D', 0.95); ctx.fill();
      }
      ctx.font = U.fs(R * 0.16, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(Math.round(level * 100) + '%', cx, cy + R * 0.52);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label + (level > 0.99 ? ' · FULL' : ' · CHARGING'), cx, cy + R * 0.74);
    } else if (kind === 'signal') {
      var sk = e.outCubic(U.clamp(tt / 1.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bars = 5;
      var active = Math.round(lv * bars * sk);
      for (var bi = 0; bi < bars; bi++) {
        var bh3 = R * (0.16 + bi * 0.11);
        var bx = cx + (bi - bars / 2 + 0.5) * R * 0.17;
        U.rr(ctx, bx - R * 0.055, cy + R * 0.3 - bh3, R * 0.11, bh3, R * 0.04);
        ctx.fillStyle = U.rgba(bi < active ? col : U.ink, bi < active ? 0.95 : 0.16);
        ctx.fill();
      }
      var flick = Math.sin(tt * 3) > 0.9;
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(flick ? col : U.ink, flick ? 0.9 : 0.55);
      ctx.fillText(label + ' · ' + active + '/' + bars, cx, cy - R * 0.42);
    } else if (kind === 'wifi') {
      var wk = e.outCubic(U.clamp(tt / 1.1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.4);
      for (var wi = 0; wi < 4; wi++) {
        var wkk = U.clamp((wk - wi * 0.14) / 0.6, 0, 1);
        if (wkk <= 0.01) continue;
        ctx.beginPath();
        if (wi < 3) {
          ctx.arc(cx, cy + R * 0.3, R * (0.14 + wi * 0.15), Math.PI * 1.22, Math.PI * 1.78);
          ctx.lineWidth = R * 0.055 * S;
          ctx.strokeStyle = U.rgba(col, 0.95 * wkk);
          ctx.stroke();
        } else {
          ctx.arc(cx, cy + R * 0.3, R * 0.08, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(col, 0.95 * wkk);
          ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(label + ' · ' + Math.round(lv * 4) + ' bars', cx, cy + R * 0.62);
    } else if (kind === 'bluetooth') {
      var pair = e.outBack(U.clamp((tt - 0.4) / 0.6, 0, 1));
      var pulse3 = (tt * 0.8) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, R * (0.4 + pulse3 * 0.25), 0, Math.PI * 2);
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba(col, (1 - pulse3) * 0.5);
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(pair, pair);
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.34); ctx.lineTo(R * 0.2, -R * 0.16); ctx.lineTo(-R * 0.2, R * 0.16); ctx.lineTo(0, R * 0.34);
      ctx.moveTo(0, -R * 0.34); ctx.lineTo(0, R * 0.34);
      ctx.moveTo(0, -R * 0.34); ctx.lineTo(-R * 0.2, -R * 0.16);
      ctx.moveTo(0, R * 0.34); ctx.lineTo(R * 0.2, R * 0.16);
      ctx.lineWidth = R * 0.055 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 1);
      ctx.stroke();
      ctx.restore();
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.7);
      ctx.fillText(label + ' · PAIRED', cx, cy + R * 0.72);
    } else if (kind === 'knob') {
      var rot3 = e.inOutCubic(U.clamp((tt - 0.3) / 1.8, 0, 1)) * Math.PI * 1.5 - Math.PI * 0.75;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      jauge(cx, cy, R * 0.5, (rot3 + Math.PI * 0.75) / (Math.PI * 1.5), col);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.97); ctx.fill();
      ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(U.ink, 0.15); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot3);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(R * 0.3, 0);
      ctx.lineWidth = R * 0.045 * S; ctx.lineCap = 'round';
      ctx.strokeStyle = U.rgba(col, 1); ctx.stroke();
      ctx.restore();
      ctx.font = U.fs(R * 0.13, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(Math.round(((rot3 + Math.PI * 0.75) / (Math.PI * 1.5)) * 100), cx, cy + 1);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'led') {
      var cycle = (tt * sp) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var n2 = 8;
      for (var li = 0; li < n2; li++) {
        var lx = cx + (li - (n2 - 1) / 2) * R * 0.16;
        var phase = (cycle * n2 * 0.5 + li / n2) % 1;
        var bright = Math.pow(Math.max(0, 1 - Math.abs(phase - 0.25) * 4), 2);
        ctx.beginPath(); ctx.arc(lx, cy, R * 0.05, 0, Math.PI * 2);
        if (bright > 0.03) { ctx.shadowColor = U.rgba(col, bright); ctx.shadowBlur = 20 * S * bright * p.glow; }
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, bright * 0.5), 0.15 + bright * 0.85);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText(label + ' · SEQ', cx, cy + R * 0.4);
    } else if (kind === 'lock-on') {
      var lockK = e.outCubic(U.clamp(tt / 1.1, 0, 1));
      var jig = Math.sin(tt * 14) * 0.012 * (1 - lockK);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx + jig * W * 0.05, cy + Math.cos(tt * 11) * R * 0.04 * (1 - lockK));
      var lw = R * 0.5 * lockK, lh = R * 0.34 * lockK;
      var corner = R * 0.12;
      ctx.lineWidth = 4 * S; ctx.lineCap = 'square';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 0.95);
      var cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (var c4 = 0; c4 < 4; c4++) {
        var cxx = cs[c4][0] * lw, cyy = cs[c4][1] * lh;
        ctx.beginPath();
        ctx.moveTo(cxx - cs[c4][0] * corner, cyy);
        ctx.lineTo(cxx, cyy);
        ctx.lineTo(cxx, cyy - cs[c4][1] * corner);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(0, 0, 4 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.restore();
      ctx.font = U.fs(R * 0.11 * S, 800);
      ctx.fillStyle = U.rgba(col, U.clamp((tt - 0.9) / 0.4, 0, 1));
      ctx.fillText('LOCKED · ' + label, cx, cy + lh + R * 0.16);
    } else if (kind === 'vitals') {
      var vk2 = tt * 1.6;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      for (var vi = 0; vi <= 120; vi++) {
        var vx = W * 0.15 + (vi / 120) * W * 0.7;
        var ph2 = (vi / 120 * 3 + vk2) % 1;
        var vy;
        if (ph2 < 0.12) vy = -Math.sin(ph2 / 0.12 * Math.PI) * R * 0.5;
        else if (ph2 < 0.2) vy = Math.sin((ph2 - 0.12) / 0.08 * Math.PI) * R * 0.2;
        else vy = U.noise2(vi * 0.7, 8, U.seed) * R * 0.02;
        if (!vi) ctx.moveTo(vx, cy + vy); else ctx.lineTo(vx, cy + vy);
      }
      ctx.lineWidth = 3.6 * S; ctx.lineJoin = 'round';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      ctx.font = U.fs(R * 0.13, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(Math.round(60 + Math.sin(tt * 2) * 6) + ' BPM', W * 0.15, cy - R * 0.56);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, W * 0.15, cy + R * 0.52);
    } else {
      jauge(cx, cy, R * 0.5, lv, col);
      ctx.font = U.fs(R * 0.13, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.66);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：3D 立体 ══════════════════════════ */

  var D3_PARAMS = [
    P('kind', '形态', 'cube', sel('cube', [
      ['cube', '旋转立方'], ['sphere', '点阵球'], ['extrude', '文字挤出'],
      ['iso-stack', '等距层叠'], ['torus', '环面粒子'], ['ribbon', '3D 缎带'],
      ['stairs', '螺旋阶梯'], ['pyramid', '金字塔'], ['box-tunnel', '盒子隧道'],
      ['wire-globe', '线框地球'], ['cyl', '圆柱扫描'], ['flip-panels', '翻板墙']
    ])),
    P('text', '文字', '3D', txt('3D')),
    P('size', '基准尺寸', 1232, rng(1232, 140.0, 1725, 4.0)),
    P('speed', '速度', 1, rng(1, 0.3, 2.4, 0.05)),
    P('depth', '深度', 1, rng(1, 0.4, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function d3Draw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var dep = p.depth;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.8 * amt); ctx.shadowBlur = 22 * S * amt; }
    }
    /* 简单 3D：绕 Y/X 旋转投影 */
    function proj(x, y, z, ry, rx, persp) {
      var cA = Math.cos(ry), sA = Math.sin(ry);
      var x1 = x * cA - z * sA, z1 = x * sA + z * cA;
      var cB = Math.cos(rx), sB = Math.sin(rx);
      var y1 = y * cB - z1 * sB, z2 = y * sB + z1 * cB;
      var f = persp / (persp + z2);
      return [cx + x1 * f, cy + y1 * f, f, z2];
    }

    if (kind === 'cube') {
      var ry = tt * 0.8, rx = Math.sin(tt * 0.5) * 0.4;
      var vs = [];
      var hs = R * 0.5;
      for (var i = 0; i < 8; i++) {
        vs.push([(i & 1 ? hs : -hs), (i & 2 ? hs : -hs), (i & 4 ? hs : -hs)]);
      }
      var edges = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var pj = vs.map(function (v) { return proj(v[0], v[1], v[2], ry, rx, R * 3 * dep); });
      edges.sort(function (a2, b2) { return (pj[a2[0]][3] + pj[a2[1]][3]) - (pj[b2[0]][3] + pj[b2[1]][3]); });
      for (var ei = 0; ei < edges.length; ei++) {
        var a3 = pj[edges[ei][0]], b3 = pj[edges[ei][1]];
        var zAvg = (a3[3] + b3[3]) / (2 * hs);
        ctx.beginPath();
        ctx.moveTo(a3[0], a3[1]); ctx.lineTo(b3[0], b3[1]);
        ctx.lineWidth = Math.max(1, 4 * a3[2]) * S;
        glowOn(zAvg < 0 ? col : U.accent2, p.glow * 0.5);
        ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, (zAvg + 1) / 2), 0.9);
        ctx.stroke();
      }
      for (var vi = 0; vi < 8; vi++) {
        ctx.beginPath(); ctx.arc(pj[vi][0], pj[vi][1], 5 * pj[vi][2] * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#FFFFFF', 0.9); ctx.fill();
      }
    } else if (kind === 'sphere') {
      var ry2 = tt * 0.7, rx2 = 0.4;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var pts = [];
      for (var la = 0; la < 9; la++) {
        var phi = (la / 8 - 0.5) * Math.PI;
        for (var lo = 0; lo < 14; lo++) {
          var th = (lo / 14) * Math.PI * 2 + tt * 0.3;
          pts.push([Math.cos(phi) * Math.cos(th) * R * 0.55, Math.sin(phi) * R * 0.55, Math.cos(phi) * Math.sin(th) * R * 0.55]);
        }
      }
      var pj2 = pts.map(function (v) { return proj(v[0], v[1], v[2], ry2, rx2, R * 3 * dep); });
      pj2.sort(function (a2, b2) { return b2[3] - a2[3]; });
      for (var pi = 0; pi < pj2.length; pi++) {
        var front = pj2[pi][3] < 0;
        ctx.beginPath();
        ctx.arc(pj2[pi][0], pj2[pi][1], Math.max(0.6, 3.6 * pj2[pi][2]) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(front ? col : U.ink, front ? 0.95 : 0.22);
        ctx.fill();
      }
    } else if (kind === 'extrude') {
      var word = String(p.text || '3D');
      var layers = Math.round(10 * dep);
      var ang = tt * 0.9;
      var sway = Math.sin(ang) * 14 * S;
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      ctx.font = U.fs(R * 0.72, 900);
      for (var ly = layers; ly >= 1; ly--) {
        var f2 = ly / layers;
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, f2 * 0.75), 0.9);
        ctx.fillText(word, cx + sway * f2, cy + sway * f2 * 0.7);
      }
      glowOn(col, p.glow);
      ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.35), 1);
      ctx.fillText(word, cx, cy);
    } else if (kind === 'iso-stack') {
      var n2 = Math.max(3, Math.round(6 * dep));
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var si = 0; si < n2; si++) {
        var sk = e.outBack(U.clamp((tt - 0.25 - si * 0.16) / 0.55, 0, 1));
        if (sk <= 0.01) continue;
        var sy2 = cy + R * 0.42 - si * (R * 0.16);
        var w2 = R * 0.6, h2 = R * 0.3, d2 = R * 0.34;
        ctx.save();
        ctx.translate(cx, sy2 + (1 - sk) * -40 * S);
        ctx.scale(sk, sk);
        ctx.beginPath();
        ctx.moveTo(0, -d2); ctx.lineTo(w2, 0); ctx.lineTo(0, d2); ctx.lineTo(-w2, 0);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.45 - si * 0.05), 0.95);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w2, 0); ctx.lineTo(0, d2); ctx.lineTo(0, d2 + h2 * 0.42); ctx.lineTo(-w2, h2 * 0.42);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, 0.45), 0.95);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w2, 0); ctx.lineTo(0, d2); ctx.lineTo(0, d2 + h2 * 0.42); ctx.lineTo(w2, h2 * 0.42);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, 0.4), 0.95);
        ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'torus') {
      var ry3 = tt * 0.85, rx3 = Math.sin(tt * 0.4) * 0.7;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var dots = [];
      for (var ui = 0; ui < 26; ui++) {
        for (var vi2 = 0; vi2 < 9; vi2++) {
          var u2 = (ui / 26) * Math.PI * 2;
          var v2 = (vi2 / 9) * Math.PI * 2;
          var r2 = R * 0.42, r1 = R * 0.15;
          var x0 = (r2 + r1 * Math.cos(v2)) * Math.cos(u2);
          var y0 = r1 * Math.sin(v2);
          var z0 = (r2 + r1 * Math.cos(v2)) * Math.sin(u2);
          dots.push(proj(x0, y0 * 0.9, z0, ry3, rx3, R * 3.2 * dep));
        }
      }
      dots.sort(function (a2, b2) { return b2[3] - a2[3]; });
      for (var di = 0; di < dots.length; di++) {
        var front2 = dots[di][3] < 0;
        ctx.beginPath();
        ctx.arc(dots[di][0], dots[di][1], Math.max(0.6, R * 0.03 * dots[di][2]), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, (di % 5) / 5), front2 ? 0.9 : 0.2);
        ctx.fill();
      }
    } else if (kind === 'ribbon') {
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      for (var rb = 0; rb < 3; rb++) {
        ctx.beginPath();
        for (var ri = 0; ri <= 60; ri++) {
          var u3 = (ri / 60) * Math.PI * 6;
          var rr4 = R * (0.3 + rb * 0.12);
          var x3 = cx + Math.cos(u3 + tt * 0.8) * rr4;
          var y3 = cy + Math.sin(u3 * 1.5 + tt * 1.1 + rb) * R * 0.3 * dep;
          var w3 = 26 * S * (0.4 + Math.sin(u3 + tt) * 0.5);
          if (!ri) ctx.moveTo(x3 - w3 / 2, y3); else ctx.lineTo(x3 + w3 / 2, y3);
        }
        ctx.lineWidth = 8 * S;
        glowOn(rb === 1 ? U.accent2 : col, p.glow * 0.5);
        ctx.strokeStyle = U.rgba(rb === 1 ? U.accent2 : U.mix(col, U.ink, rb * 0.2), 0.8);
        ctx.stroke();
      }
    } else if (kind === 'stairs') {
      var steps = Math.max(4, Math.round(8 * dep));
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var st = 0; st < steps; st++) {
        var stk = e.outCubic(U.clamp((tt * 1.2 - st * 0.14) / 0.5, 0, 1));
        if (stk <= 0.01) continue;
        var sx3 = cx - R * 0.55 + st * (R * 0.16);
        var sy3 = cy + R * 0.4 - st * (R * 0.12);
        var sw2 = R * 0.15 * stk, sh2 = R * 0.5 * stk;
        U.rr(ctx, sx3, sy3, sw2, sh2, 4 * S);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, st / steps), 0.95);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.5), 0.9);
        U.rr(ctx, sx3, sy3, sw2, 6 * S, 3 * S);
        ctx.fill();
      }
    } else if (kind === 'pyramid') {
      var ry4 = tt * 0.7, rx4 = 0.35;
      var apex = [0, -R * 0.55, 0];
      var base = [];
      for (var b4 = 0; b4 < 4; b4++) {
        var ba = (b4 / 4) * Math.PI * 2 + Math.PI / 4;
        base.push([Math.cos(ba) * R * 0.48, R * 0.42, Math.sin(ba) * R * 0.48]);
      }
      var pa = proj(apex[0], apex[1], apex[2], ry4, rx4, R * 3 * dep);
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      var faces = [];
      for (var f3 = 0; f3 < 4; f3++) {
        var bA = proj(base[f3][0], base[f3][1], base[f3][2], ry4, rx4, R * 3 * dep);
        var bB = proj(base[(f3 + 1) % 4][0], base[(f3 + 1) % 4][1], base[(f3 + 1) % 4][2], ry4, rx4, R * 3 * dep);
        faces.push({ a: bA, b: bB, z: bA[3] + bB[3] + pa[3], i: f3 });
      }
      faces.sort(function (x, y) { return y.z - x.z; });
      for (var f4 = 0; f4 < faces.length; f4++) {
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(faces[f4].a[0], faces[f4].a[1]);
        ctx.lineTo(faces[f4].b[0], faces[f4].b[1]);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, faces[f4].i % 2 ? U.accent2 : U.ink, 0.35), 0.55);
        ctx.fill();
        ctx.lineWidth = 2 * S;
        ctx.strokeStyle = U.rgba(col, 0.85);
        ctx.stroke();
      }
      for (var b5 = 0; b5 < 4; b5++) {
        var bp = proj(base[b5][0], base[b5][1], base[b5][2], ry4, rx4, R * 3 * dep);
        ctx.beginPath(); ctx.arc(bp[0], bp[1], 4.4 * bp[2] * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#FFFFFF', 0.9); ctx.fill();
      }
    } else if (kind === 'box-tunnel') {
      var travel = (tt * 0.5) % 1;
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      var NN = 9;
      var order = [];
      for (var zi = 0; zi < NN; zi++) order.push(((zi / NN) + travel) % 1);
      order.sort(function (a2, b2) { return b2 - a2; });
      for (var oi = 0; oi < order.length; oi++) {
        var z1 = Math.pow(order[oi], 2);
        var sc = 1 / (z1 * 4 + 0.12) * 0.14;
        var hs2 = R * 0.5 * sc;
        var rot5 = tt * 0.4 + oi * 0.2;
        var pj3 = [];
        for (var vi3 = 0; vi3 < 4; vi3++) {
          var corner = [[-hs2, -hs2], [hs2, -hs2], [hs2, hs2], [-hs2, hs2]][vi3];
          pj3.push([cx + corner[0] * Math.cos(rot5) - corner[1] * Math.sin(rot5), cy + corner[0] * Math.sin(rot5) + corner[1] * Math.cos(rot5)]);
        }
        ctx.beginPath();
        for (var vi4 = 0; vi4 <= 4; vi4++) {
          var pp = pj3[vi4 % 4];
          if (!vi4) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]);
        }
        ctx.lineWidth = Math.max(0.6, 3.4 * sc * 3) * S;
        ctx.strokeStyle = U.rgba(oi % 2 ? col : U.accent2, U.clamp(z1 * 3, 0, 1) * 0.9);
        ctx.stroke();
      }
    } else if (kind === 'wire-globe') {
      var ry5 = tt * 0.45;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var lon2 = 0; lon2 < 8; lon2++) {
        ctx.beginPath();
        for (var la2 = 0; la2 <= 36; la2++) {
          var latA = (la2 / 36) * Math.PI * 2;
          var x4 = Math.cos(latA) * R * 0.52;
          var z4 = Math.sin(latA) * R * 0.52;
          var pr = proj(x4, z4 * 0.18, Math.sin(lon2 / 8 * Math.PI * 2) * R * 0.52 + Math.cos(lon2 / 8 * Math.PI * 2) * 0, ry5, 0.25, R * 3 * dep);
          if (!la2) ctx.moveTo(pr[0], pr[1]); else ctx.lineTo(pr[0], pr[1]);
        }
        ctx.lineWidth = 1.4 * S;
        ctx.strokeStyle = U.rgba(col, 0.35);
        ctx.stroke();
      }
      for (var lat2 = -2; lat2 <= 2; lat2++) {
        ctx.beginPath();
        var rLat = Math.cos(lat2 * 0.5) * R * 0.52;
        var yLat = Math.sin(lat2 * 0.5) * R * 0.52;
        for (var la3 = 0; la3 <= 40; la3++) {
          var th3 = (la3 / 40) * Math.PI * 2;
          var pr2 = proj(Math.cos(th3) * rLat, yLat, Math.sin(th3) * rLat, ry5, 0.25, R * 3 * dep);
          if (!la3) ctx.moveTo(pr2[0], pr2[1]); else ctx.lineTo(pr2[0], pr2[1]);
        }
        ctx.lineWidth = 1.4 * S;
        ctx.strokeStyle = U.rgba(col, 0.45);
        ctx.stroke();
      }
    } else if (kind === 'cyl') {
      var ry6 = tt * 0.9;
      var scanY = (Math.sin(tt * 1.2) + 1) / 2;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var HH = R * 0.8, RR = R * 0.3;
      for (var ri2 = 0; ri2 <= 30; ri2++) {
        var th4 = (ri2 / 30) * Math.PI * 2;
        var x5 = Math.cos(th4) * RR, z5 = Math.sin(th4) * RR;
        var top = proj(x5, -HH / 2, z5, ry6, 0.28, R * 3 * dep);
        var bot = proj(x5, HH / 2, z5, ry6, 0.28, R * 3 * dep);
        var front3 = z5 * Math.cos(ry6) - x5 * Math.sin(ry6) < 0;
        ctx.beginPath();
        ctx.moveTo(top[0], top[1]); ctx.lineTo(bot[0], bot[1]);
        ctx.lineWidth = 2.2 * S;
        ctx.strokeStyle = U.rgba(col, front3 ? 0.85 : 0.22);
        ctx.stroke();
        var sy4 = -HH / 2 + HH * scanY;
        if (Math.abs(sy4) < HH / 2) {
          var scanP = proj(x5, sy4, z5, ry6, 0.28, R * 3 * dep);
          ctx.beginPath(); ctx.arc(scanP[0], scanP[1], 2.6 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        }
      }
      var tA = proj(0, -HH / 2, 0, ry6, 0.28, R * 3 * dep);
      var tB = proj(RR, -HH / 2, 0, ry6, 0.28, R * 3 * dep);
      ctx.beginPath(); ctx.ellipse(tA[0], tA[1], Math.abs(tB[0] - tA[0]), Math.abs(tB[0] - tA[0]) * 0.32, 0, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(col, 0.7); ctx.lineWidth = 2 * S; ctx.stroke();
    } else if (kind === 'flip-panels') {
      var cols3 = 6, rows3 = 4;
      var pw = R * 1.5 / cols3, ph2 = R * 1.0 / rows3;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var r4 = 0; r4 < rows3; r4++) {
        for (var c5 = 0; c5 < cols3; c5++) {
          var phase = (tt * 0.9 + (r4 + c5) * 0.22) % 2;
          var ang2 = phase < 1 ? phase * Math.PI : 0;
          var flip = Math.sin(ang2);
          var px6 = cx - R * 0.75 + c5 * pw + pw / 2;
          var py6 = cy - R * 0.5 + r4 * ph2 + ph2 / 2;
          ctx.save();
          ctx.translate(px6, py6);
          ctx.transform(1, 0, flip * 0.0, 1, 0, 0);
          ctx.scale(Math.max(0.06, Math.abs(Math.cos(ang2))), 1);
          ctx.fillStyle = U.rgba(U.mix(col, U.accent2, ((r4 * cols3 + c5) % 5) / 5), flip > 0 ? 0.9 : 0.35);
          U.rr(ctx, -pw * 0.42, -ph2 * 0.4, pw * 0.84, ph2 * 0.8, ph2 * 0.14);
          ctx.fill();
          ctx.restore();
        }
      }
    } else {
      ctx.font = U.fs(R * 0.6, 900);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(String(p.text || '3D'), cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: 'HUD 仪表', type: 'block', dur: 6, poster: 0.55,
    params: HUD_PARAMS, draw: hudDraw,
    texts: ['SYSTEM', 'CPU LOAD', 'SYNC', 'UPLINK'],
    ids: [
      { id: 'hud-gauge', name: '仪表指针', tags: ['仪表', '指针'], desc: '指针划过表盘并实时读数，性能监控感。', cfg: { kind: 'gauge' } },
      { id: 'hud-cluster', name: '三表盘', tags: ['仪表', '组合'], desc: '三块小表盘错峰填充，系统面板。', cfg: { kind: 'cluster' } },
      { id: 'hud-toggle', name: '开关切换', tags: ['开关', 'ON/OFF'], desc: '开关来回拨动并点亮，状态切换表达。', cfg: { kind: 'toggle' } },
      { id: 'hud-slider', name: '滑杆自动', tags: ['滑杆', '调节'], desc: '滑块自动来回调节并显示数值，设置面板。', cfg: { kind: 'slider' } },
      { id: 'hud-stat-card', name: '数据卡片', tags: ['卡片', '数据'], desc: '数据卡片弹出并滚动数值与涨跌幅。', cfg: { kind: 'stat-card' } },
      { id: 'hud-spark', name: '迷你走势', tags: ['走势', '面积'], desc: '迷你折线逐渐绘出并带面积渐变。', cfg: { kind: 'spark' } },
      { id: 'hud-battery', name: '电量充放', tags: ['电量', '电池'], desc: '电池充电往复并显示百分比。', cfg: { kind: 'battery' } },
      { id: 'hud-signal', name: '信号强度', tags: ['信号', '格数'], desc: '信号格逐级点亮，网络状态表达。', cfg: { kind: 'signal' } },
      { id: 'hud-wifi', name: 'WiFi 波纹', tags: ['WiFi', '连接'], desc: 'WiFi 弧线逐层亮起，连接成功。', cfg: { kind: 'wifi' } },
      { id: 'hud-bluetooth', name: '蓝牙配对', tags: ['蓝牙', '配对'], desc: '蓝牙符号弹出并发出配对波纹。', cfg: { kind: 'bluetooth' } },
      { id: 'hud-knob', name: '旋钮转动', tags: ['旋钮', '调音'], desc: '旋钮扫过刻度区间，混音台质感。', cfg: { kind: 'knob' } },
      { id: 'hud-led', name: 'LED 序列灯', tags: ['LED', '序列'], desc: 'LED 灯逐个流过，机箱运行灯效。', cfg: { kind: 'led' } },
      { id: 'hud-lock-on', name: '目标锁定', tags: ['锁定', '瞄准'], desc: '锁定框从抖动到锁定，军事 HUD 感。', cfg: { kind: 'lock-on' } },
      { id: 'hud-vitals', name: '心电图', tags: ['心电', '监测'], desc: '心电波形滚动伴随 BPM 读数。', cfg: { kind: 'vitals' } }
    ]
  });

  MF.forge({
    cat: '3D 立体', type: 'block', dur: 6.5, poster: 0.55,
    params: D3_PARAMS, draw: d3Draw,
    ids: [
      { id: 'd3-cube', name: '旋转立方', tags: ['立方', '旋转'], desc: '线框立方体旋转，顶点高亮，科技开场。', cfg: { kind: 'cube' } },
      { id: 'd3-sphere', name: '点阵球', tags: ['球体', '点阵'], desc: '点阵球体旋转，前后景深分明。', cfg: { kind: 'sphere' } },
      { id: 'd3-extrude', name: '文字挤出', tags: ['文字', '立体'], desc: '文字多层挤出并摆动，片头标题感。', cfg: { kind: 'extrude', text: 'FORGE' } },
      { id: 'd3-iso-stack', name: '等距层叠', tags: ['等距', '层叠'], desc: '等距板块逐层堆起，架构与图层叙事。', cfg: { kind: 'iso-stack' } },
      { id: 'd3-torus', name: '环面粒子', tags: ['环面', '甜甜圈'], desc: '环面粒子旋转，未来感几何。', cfg: { kind: 'torus' } },
      { id: 'd3-ribbon', name: '3D 缎带', tags: ['缎带', '流动'], desc: '三条立体缎带交织流动，舞台背景。', cfg: { kind: 'ribbon' } },
      { id: 'd3-stairs', name: '螺旋阶梯', tags: ['阶梯', '上升'], desc: '阶梯逐级升起，成长与进阶叙事。', cfg: { kind: 'stairs' } },
      { id: 'd3-pyramid', name: '金字塔', tags: ['金字塔', '面'], desc: '四棱锥旋转并按面着色，稳定感。', cfg: { kind: 'pyramid' } },
      { id: 'd3-box-tunnel', name: '盒子隧道', tags: ['隧道', '穿越'], desc: '方框隧道向观者穿越，纵深感强。', cfg: { kind: 'box-tunnel' } },
      { id: 'd3-wire-globe', name: '线框地球', tags: ['地球', '线框'], desc: '线框经纬地球缓慢自转。', cfg: { kind: 'wire-globe' } },
      { id: 'd3-cyl', name: '圆柱扫描', tags: ['圆柱', '扫描'], desc: '圆柱旋转伴随扫描环升降，扫描仪质感。', cfg: { kind: 'cyl' } },
      { id: 'd3-flip-panels', name: '翻板墙', tags: ['翻板', '波浪'], desc: '翻板墙波浪式翻转，媒体墙效果。', cfg: { kind: 'flip-panels' } }
    ]
  });
})();

/* ════════ assets/js/effects-19.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 19
   原语：对比展示 / 时间轴 / 数据大屏
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：对比展示 ══════════════════════════ */

  var CMP_PARAMS = [
    P('kind', '形态', 'slider', sel('slider', [
      ['slider', '分屏推拉'], ['wipe', '上下擦除'], ['vs', 'VS 碰撞'],
      ['labels', '前后标签'], ['bars', '对比条'], ['cards', '双卡翻转'],
      ['oscillate', '分屏振荡'], ['split-text', '一分为二'], ['price', '价格对比'],
      ['scale', '大小对比'], ['ab-toggle', 'A/B 切换'], ['merge', '合二为一']
    ])),
    P('textA', '方案 A', 'BEFORE', txt('BEFORE')),
    P('textB', '方案 B', 'AFTER', txt('AFTER')),
    P('size', '字号', 242, rng(242, 40, 339, 2)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '强调色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function cmpDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var col = p.ink2;
    var kind = p.kind;
    var A = String(p.textA || 'BEFORE');
    var B = String(p.textB || 'AFTER');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    function panel(x, w, label, c, alpha) {
      ctx.fillStyle = U.rgba(U.mix(c, U.bg1, 0.72), alpha);
      ctx.fillRect(x, 0, w, H);
      ctx.font = U.fs(fs * 0.4, 900);
      ctx.fillStyle = U.rgba(c, alpha);
      ctx.fillText(label, x + w / 2, cy);
    }

    if (kind === 'slider') {
      var cyc = (tt * 0.42) % 1;
      var pos = cyc < 0.5 ? e.inOutCubic(cyc * 2) : e.inOutCubic((1 - cyc) * 2);
      var px = W * (0.15 + pos * 0.7);
      panel(0, px, A, U.ink, U.clamp(tt * 3, 0, 1));
      ctx.save();
      ctx.beginPath(); ctx.rect(px, 0, W - px, H); ctx.clip();
      panel(0, W, B, col, U.clamp(tt * 3, 0, 1));
      ctx.restore();
      glowOn('#FFFFFF', p.glow * 0.6);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.95);
      ctx.fillRect(px - 2.5 * S, 0, 5 * S, H);
      ctx.beginPath();
      ctx.arc(px, cy, 26 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.95); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(24 * S, 900);
      ctx.fillStyle = U.rgba(U.bg1, 0.9);
      ctx.fillText('⇄', px, cy + 1);
    } else if (kind === 'wipe') {
      var cyc2 = (tt * 0.42) % 1;
      var pos2 = cyc2 < 0.5 ? e.inOutCubic(cyc2 * 2) : e.inOutCubic((1 - cyc2) * 2);
      var py = H * (0.15 + pos2 * 0.7);
      ctx.fillStyle = U.rgba(U.mix(U.ink, U.bg1, 0.75), U.clamp(tt * 3, 0, 1));
      ctx.fillRect(0, 0, W, py);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, py, W, H - py); ctx.clip();
      ctx.fillStyle = U.rgba(U.mix(col, U.bg1, 0.72), U.clamp(tt * 3, 0, 1));
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      ctx.font = U.fs(fs * 0.38, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(A, cx, py / 2);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, cx, py + (H - py) / 2);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillRect(0, py - 2 * S, W, 4 * S);
    } else if (kind === 'vs') {
      var slam = e.outBack(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.2, 0, 1);
      ctx.save();
      ctx.translate(cx - W * 0.24 * (1 - U.clamp(tt / 0.6, 0, 1)) - 0, 0);
      ctx.font = U.fs(fs * 0.5, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText(A, cx - W * 0.22, cy);
      ctx.restore();
      ctx.save();
      ctx.translate(W * 0.24 * (1 - U.clamp(tt / 0.6, 0, 1)), 0);
      ctx.font = U.fs(fs * 0.5, 900);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, cx + W * 0.22, cy);
      ctx.restore();
      var vsK = e.outBack(U.clamp((tt - 0.45) / 0.4, 0, 1));
      glowOn(col, p.glow);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.12);
      ctx.scale(vsK, vsK);
      U.rr(ctx, -44 * S, -44 * S, 88 * S, 88 * S, 20 * S);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.font = U.fs(44 * S, 900);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText('VS', 0, 2);
      ctx.restore();
    } else if (kind === 'labels') {
      var flip = (tt * 0.5) % 1 < 0.5;
      var fk = flip ? e.outCubic(U.clamp(((tt * 0.5) % 0.5) * 6, 0, 1)) : 1 - e.outCubic(U.clamp(((tt * 0.5 - 0.5) % 0.5) * 6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var showA = (tt * 0.5) % 1 < 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.transform(1, 0, 0, showA ? 1 : 1, 0, 0);
      ctx.font = U.fs(fs, 900);
      if (showA) { ctx.fillStyle = U.rgba(U.ink, 0.95); ctx.fillText(A, 0, 0); }
      else { glowOn(col, p.glow); ctx.fillStyle = U.rgba(col, 0.95); ctx.fillText(B, 0, 0); }
      ctx.restore();
      var chipW = fs * 0.62, chipH = fs * 0.3;
      U.rr(ctx, cx - chipW / 2, cy + fs * 0.68, chipW, chipH, chipH / 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      ctx.font = U.fs(chipH * 0.5, 800);
      ctx.fillStyle = U.rgba(showA ? U.ink : col, 0.9);
      ctx.fillText(showA ? 'BEFORE' : 'AFTER', cx, cy + fs * 0.68 + chipH / 2);
    } else if (kind === 'bars') {
      var gk = e.outExpo(U.clamp((tt - 0.4) / 1.4, 0, 1));
      var vA = U.rnd(0.3, 0.6, 3), vB = U.rnd(0.55, 0.9, 7);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = U.fs(fs * 0.22, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(A, W * 0.12, cy - fs * 0.35);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, W * 0.12, cy + fs * 0.35);
      var bh = fs * 0.16;
      U.rr(ctx, W * 0.12, cy - fs * 0.24, W * 0.76, bh, bh / 2);
      ctx.fillStyle = U.rgba(U.ink, 0.14); ctx.fill();
      U.rr(ctx, W * 0.12, cy - fs * 0.24, Math.max(bh, W * 0.76 * vA * gk), bh, bh / 2);
      ctx.fillStyle = U.rgba(U.ink, 0.85); ctx.fill();
      U.rr(ctx, W * 0.12, cy + fs * 0.24, W * 0.76, bh, bh / 2);
      ctx.fillStyle = U.rgba(col, 0.14); ctx.fill();
      glowOn(col, p.glow * 0.5);
      U.rr(ctx, W * 0.12, cy + fs * 0.24, Math.max(bh, W * 0.76 * vB * gk), bh, bh / 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.textAlign = 'center';
    } else if (kind === 'cards') {
      var cyc3 = (tt * 0.4) % 1;
      var showB = cyc3 > 0.5;
      var ang3 = showB ? (1 - (cyc3 - 0.5) * 2) : (cyc3 * 2);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var cardW = fs * 1.7, cardH = fs * 1.05;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.4 + 0.6 * Math.abs(Math.cos(ang3 * Math.PI * 0.5)) + 0.0, 1);
      U.rr(ctx, -cardW / 2, -cardH / 2, cardW, cardH, cardH * 0.14);
      ctx.fillStyle = U.rgba(showB ? U.mix(col, U.bg1, 0.3) : U.mix(U.ink, U.bg1, 0.3), 0.95);
      ctx.fill();
      ctx.font = U.fs(fs * 0.4, 900);
      ctx.fillStyle = U.rgba(showB ? U.bg1 : U.bg1, 0.95);
      ctx.fillText(showB ? B : A, 0, 0);
      ctx.restore();
      ctx.font = U.fs(fs * 0.13 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText('TAP TO COMPARE', cx, cy + cardH * 0.85);
    } else if (kind === 'oscillate') {
      var osc = Math.sin(tt * 1.6) * 0.5 + 0.5;
      var px2 = W * (0.5 + (osc - 0.5) * 0.36);
      panel(0, px2, A, U.ink, U.clamp(tt * 3, 0, 1));
      ctx.save();
      ctx.beginPath(); ctx.rect(px2, 0, W - px2, H); ctx.clip();
      panel(0, W, B, col, U.clamp(tt * 3, 0, 1));
      ctx.restore();
      ctx.fillStyle = U.rgba('#FFFFFF', 0.9);
      ctx.fillRect(px2 - 2 * S, 0, 4 * S, H);
    } else if (kind === 'split-text') {
      var word2 = A;
      var half = Math.ceil(word2.length / 2);
      var open = e.outCubic(U.clamp((tt - 0.4) / 1, 0, 1));
      ctx.font = U.fs(fs, 900);
      var wA = ctx.measureText(word2.slice(0, half)).width;
      var wB = ctx.measureText(word2.slice(half)).width;
      var gap2 = open * fs * 0.8;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, cx + gap2 / 2, H); ctx.clip();
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(word2.slice(0, half), cx - (wB + gap2) / 2 + wA / 2 - wA / 2 + 0, cy);
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.rect(cx + gap2 / 2, 0, W, H); ctx.clip();
      glowOn(col, p.glow * 0.7);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(word2.slice(half), cx + (wA + gap2) / 2 + wB / 2 - wB / 2 + 0, cy);
      ctx.restore();
      ctx.fillStyle = U.rgba(B, 0);
      ctx.font = U.fs(fs * 0.16 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.6);
      ctx.fillText(B, cx, cy + fs * 0.75);
    } else if (kind === 'price') {
      var pk = e.outBack(U.clamp((tt - 0.3) / 0.6, 0, 1));
      var pk2 = e.outBack(U.clamp((tt - 0.55) / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(fs * 0.42, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.4);
      ctx.save();
      ctx.translate(cx - W * 0.18, cy);
      ctx.rotate(-0.06);
      ctx.fillText(A, 0, 0);
      ctx.strokeStyle = U.rgba('#FF6A5D', 0.95);
      ctx.lineWidth = 6 * S;
      ctx.beginPath();
      ctx.moveTo(-ctx.measureText(A).width / 2 - 10 * S, 0);
      ctx.lineTo(ctx.measureText(A).width / 2 + 10 * S, fs * 0.1);
      ctx.stroke();
      ctx.restore();
      glowOn(col, p.glow);
      ctx.font = U.fs(fs * 0.52 * pk2, 900);
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText(B, cx + W * 0.16, cy);
      var tag = U.outCubic ? 0 : 0;
      ctx.font = U.fs(fs * 0.15 * S, 800);
      U.rr(ctx, cx + W * 0.16 - fs * 0.5, cy - fs * 0.62, fs * 1.0, fs * 0.28, fs * 0.14);
      ctx.fillStyle = U.rgba('#5DFF8F', 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText('省 40%', cx + W * 0.16, cy - fs * 0.48);
    } else if (kind === 'scale') {
      var gk2 = e.outCubic(U.clamp((tt - 0.4) / 1.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(fs * 0.34, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(A, cx - W * 0.2, cy + fs * 0.32);
      ctx.font = U.fs(fs * (0.34 + 0.38 * gk2), 900);
      glowOn(col, p.glow);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, cx + W * 0.16, cy);
      ctx.beginPath();
      ctx.moveTo(cx - W * 0.06, cy + fs * 0.42);
      ctx.lineTo(cx + W * 0.02 + W * 0.06 * gk2, cy + fs * 0.42);
      ctx.lineWidth = 5 * S;
      ctx.strokeStyle = U.rgba(col, 0.9);
      ctx.stroke();
    } else if (kind === 'ab-toggle') {
      var cyc4 = (tt * 0.6) % 1;
      var curB = cyc4 > 0.5;
      var slide = e.outCubic(curB ? U.clamp((cyc4 - 0.5) * 8, 0, 1) : U.clamp((1 - cyc4 * 2), 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var tw2 = fs * 1.4, th2 = fs * 0.62;
      U.rr(ctx, cx - tw2 / 2, cy - th2 / 2, tw2, th2, th2 * 0.3);
      ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
      var knobW = tw2 / 2;
      U.rr(ctx, cx - tw2 / 2 + 5 * S + (tw2 - knobW - 10 * S) * slide, cy - th2 / 2 + 5 * S, knobW, th2 - 10 * S, th2 * 0.26);
      ctx.fillStyle = U.rgba(curB ? col : U.ink, 0.95); ctx.fill();
      ctx.font = U.fs(th2 * 0.34, 900);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText(curB ? 'B' : 'A', cx - tw2 / 2 + 5 * S + (tw2 - knobW - 10 * S) * slide + knobW / 2, cy + 1);
      ctx.font = U.fs(fs * 0.3, 800);
      ctx.fillStyle = U.rgba(curB ? col : U.ink, 0.8);
      ctx.fillText(curB ? B : A, cx, cy + th2 * 1.15);
    } else if (kind === 'merge') {
      var mg = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var cyc5 = (tt * 0.4) % 1;
      var dir = cyc5 < 0.5 ? mg : 1 - e.inOutCubic((cyc5 - 0.5) * 2);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(fs * 0.4, 900);
      ctx.save();
      ctx.translate(-dir * W * 0.16, 0);
      ctx.fillStyle = U.rgba(U.ink, 0.9 * (1 - dir * 0.55));
      ctx.fillText(A, cx - W * 0.12, cy);
      ctx.restore();
      ctx.save();
      ctx.translate(dir * W * 0.16, 0);
      ctx.fillStyle = U.rgba(col, 0.9 * (1 - dir * 0.55));
      ctx.fillText(B, cx + W * 0.12, cy);
      ctx.restore();
      if (dir > 0.92) {
        var mk3 = e.outBack(U.clamp((dir - 0.92) / 0.08, 0, 1));
        glowOn(col, p.glow);
        ctx.font = U.fs(fs * 0.44 * mk3, 900);
        ctx.fillStyle = U.rgba(U.mix(U.ink, col, 0.5), 0.98);
        ctx.fillText(A + B, cx, cy);
      }
    } else {
      ctx.font = U.fs(fs * 0.5, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(A, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：时间轴 ══════════════════════════ */

  var TL_PARAMS = [
    P('kind', '形态', 'line', sel('line', [
      ['line', '主线生长'], ['milestone', '里程碑弹出'], ['horizontal', '横向推进'],
      ['vertical', '纵向滚动'], ['branch', '分支展开'], ['steps', '步骤倒计时'],
      ['process', '流程箭头链'], ['gantt', '甘特条'], ['dots', '节点连线'],
      ['flag', '插旗'], ['calendar', '日历翻格'], ['progress-nodes', '进度节点']
    ])),
    P('text', '阶段', '调研,开发,测试,上线', txt('调研,开发,测试,上线', true)),
    P('points', '节点数', 4, rng(4, 2, 8, 1)),
    P('size', '基准尺寸', 1144, rng(1144, 140.0, 1602, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function tlDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var stages = String(p.text || '').split(/[,，|]/).filter(Boolean).slice(0, 6);
    if (!stages.length) stages = ['规划', '执行', '交付'];
    var n = Math.min(stages.length, Math.max(2, Math.round(p.points)));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 22 * S * amt; }
    }
    function node(x, y, r2, fill, alpha) {
      ctx.beginPath(); ctx.arc(x, y, r2, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(fill, alpha === undefined ? 1 : alpha);
      ctx.fill();
    }

    if (kind === 'line' || kind === 'milestone' || kind === 'flag') {
      var prog = e.inOutCubic(U.clamp((tt - 0.3) / (0.6 + n * 0.5), 0, 1));
      var y0 = cy + R * 0.1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.moveTo(W * 0.14, y0);
      ctx.lineTo(W * 0.14 + (W * 0.72) * prog, y0);
      ctx.lineWidth = 4.4 * S; ctx.lineCap = 'round';
      glowOn(col, p.glow * 0.5);
      ctx.strokeStyle = U.rgba(col, 0.9);
      ctx.stroke();
      ctx.shadowBlur = 0;
      for (var i = 0; i < n; i++) {
        var nx = W * 0.14 + (W * 0.72) * (i / (n - 1));
        var nk = U.clamp((prog * (n - 1) - i) / 0.4, 0, 1);
        if (nk <= 0.01) continue;
        var pop = e.outBack(nk);
        node(nx, y0, R * 0.045 * pop, i === n - 1 ? col : U.bg1, U.clamp(tt * 3, 0, 1));
        if (i === n - 1) glowOn(col, p.glow);
        node(nx, y0, R * 0.02 * pop, i === n - 1 ? U.bg1 : col);
        ctx.shadowBlur = 0;
        ctx.font = U.fs(R * 0.12 * pop, 800);
        ctx.fillStyle = U.rgba(i === n - 1 ? col : U.ink, 0.92 * nk);
        ctx.fillText(stages[i], nx, y0 - R * 0.14);
        if (kind === 'flag' && nk > 0.6) {
          var fk = e.outCubic((nk - 0.6) / 0.4);
          ctx.beginPath();
          ctx.moveTo(nx, y0 + R * 0.04);
          ctx.lineTo(nx, y0 + R * 0.28);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(U.ink, 0.7 * fk);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx, y0 + R * 0.05);
          ctx.lineTo(nx + R * 0.12 * fk, y0 + R * 0.1);
          ctx.lineTo(nx, y0 + R * 0.15);
          ctx.closePath();
          ctx.fillStyle = U.rgba(col, 0.9 * fk);
          ctx.fill();
        }
      }
    } else if (kind === 'horizontal' || kind === 'vertical') {
      var vert = kind === 'vertical';
      var prog2 = e.inOutCubic(U.clamp((tt - 0.3) / (0.5 + n * 0.45), 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var si = 0; si < n; si++) {
        var sk = U.clamp((prog2 * n - si) / 0.6, 0, 1);
        if (sk <= 0.01) continue;
        var px = vert ? cx : W * 0.16 + (W * 0.68) * (si / Math.max(1, n - 1));
        var py = vert ? H * 0.2 + (H * 0.6) * (si / Math.max(1, n - 1)) : cy;
        ctx.save();
        ctx.translate(px, py);
        var enter = e.outBack(sk);
        ctx.scale(enter, enter);
        U.rr(ctx, -R * 0.13, vert ? -R * 0.06 : -R * 0.09, R * 0.26, vert ? R * 0.12 : R * 0.18, R * 0.035);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, si / n * 0.5), 0.96);
        ctx.fill();
        ctx.font = U.fs(R * 0.1, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.95);
        ctx.fillText(stages[si], 0, 1);
        ctx.restore();
      }
      ctx.beginPath();
      if (vert) { ctx.moveTo(cx, H * 0.2); ctx.lineTo(cx, H * 0.2 + (H * 0.6) * U.clamp(prog2 * (n - 1) / Math.max(1, n - 1), 0, 1)); }
      else { ctx.moveTo(W * 0.16, cy); ctx.lineTo(W * 0.16 + (W * 0.68) * U.clamp(prog2, 0, 1), cy); }
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.25);
      ctx.stroke();
    } else if (kind === 'branch') {
      var bk = e.outCubic(U.clamp(tt / 1.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bx0 = W * 0.2;
      ctx.beginPath();
      ctx.moveTo(bx0, cy);
      ctx.lineTo(bx0 + (cx - bx0) * bk, cy);
      ctx.lineWidth = 4 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.55);
      ctx.stroke();
      var branches = Math.min(4, n);
      for (var bi = 0; bi < branches; bi++) {
        var bkk = U.clamp((bk - 0.3 - bi * 0.1) / 0.5, 0, 1);
        if (bkk <= 0.01) continue;
        var by = cy + (bi - (branches - 1) / 2) * R * 0.36;
        var ex = cx + W * 0.22 * bkk;
        ctx.beginPath();
        ctx.moveTo(bx0 + (cx - bx0) * 0.9, cy);
        ctx.quadraticCurveTo(cx, cy, ex, by);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, bi / branches), 0.85 * bkk);
        ctx.stroke();
        node(ex, by, R * 0.035 * bkk, U.mix(col, U.accent2, bi / branches));
        ctx.font = U.fs(R * 0.095 * S * bkk, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85 * bkk);
        ctx.textAlign = 'left';
        ctx.fillText(stages[bi % stages.length], ex + R * 0.07, by);
        ctx.textAlign = 'center';
      }
      node(bx0, cy, R * 0.045, U.ink);
    } else if (kind === 'steps' || kind === 'progress-nodes') {
      var cyc = (tt * 0.6) % n;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var pi = 0; pi < n; pi++) {
        var px2 = cx + (pi - (n - 1) / 2) * (R * 0.46);
        var active = pi <= Math.floor(cyc);
        var isCur = Math.floor(cyc) === pi;
        var cur = Math.pow(1 - (cyc % 1), 2) * (isCur ? 1 : 0);
        node(px2, cy, R * 0.07 + cur * R * 0.02, active ? col : U.ink, active ? 0.95 : 0.2);
        if (isCur) glowOn(col, p.glow);
        node(px2, cy, R * 0.032, U.bg1);
        ctx.shadowBlur = 0;
        ctx.font = U.fs(R * 0.1 * S, 800);
        ctx.fillStyle = U.rgba(active ? U.ink : U.ink, active ? 0.9 : 0.35);
        ctx.fillText(stages[pi], px2, cy + R * 0.18);
        if (pi < n - 1) {
          ctx.beginPath();
          ctx.moveTo(px2 + R * 0.09, cy);
          ctx.lineTo(px2 + R * 0.46 - R * 0.09, cy);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(active && pi < Math.floor(cyc) ? col : U.ink, active && pi < Math.floor(cyc) ? 0.8 : 0.16);
          ctx.stroke();
        }
      }
    } else if (kind === 'process') {
      var pk = e.inOutCubic(U.clamp((tt - 0.3) / (0.4 + n * 0.4), 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var fi = 0; fi < n; fi++) {
        var fk2 = U.clamp((pk * n - fi) / 0.6, 0, 1);
        if (fk2 <= 0.01) continue;
        var fx = W * 0.16 + (W * 0.68) * (fi / Math.max(1, n - 1));
        ctx.save();
        ctx.translate(fx, cy);
        ctx.scale(e.outBack(fk2), e.outBack(fk2));
        U.rr(ctx, -R * 0.11, -R * 0.075, R * 0.22, R * 0.15, R * 0.03);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, fi / n * 0.6), 0.96);
        ctx.fill();
        ctx.font = U.fs(R * 0.085, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.95);
        ctx.fillText(String(fi + 1), 0, 1);
        ctx.restore();
        ctx.font = U.fs(R * 0.085 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85 * fk2);
        ctx.fillText(stages[fi], fx, cy + R * 0.2);
        if (fi < n - 1 && fk2 > 0.5) {
          var ak = (fk2 - 0.5) / 0.5;
          var ax0 = fx + R * 0.13, ax1 = W * 0.16 + (W * 0.68) * ((fi + 1) / Math.max(1, n - 1)) - R * 0.16;
          ctx.beginPath();
          ctx.moveTo(ax0, cy);
          ctx.lineTo(U.lerp(ax0, ax1, ak), cy);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(col, 0.7);
          ctx.stroke();
          if (ak > 0.9) {
            ctx.beginPath();
            ctx.moveTo(ax1, cy - R * 0.035);
            ctx.lineTo(ax1 + R * 0.045, cy);
            ctx.lineTo(ax1, cy + R * 0.035);
            ctx.closePath();
            ctx.fillStyle = U.rgba(col, 0.9);
            ctx.fill();
          }
        }
      }
    } else if (kind === 'gantt') {
      var gk3 = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      for (var gi = 0; gi < n; gi++) {
        var gy = cy - R * 0.42 + gi * (R * 0.84 / Math.max(1, n));
        var gkk = U.clamp((gk3 - gi * 0.12) / 0.88, 0, 1);
        var gw = W * (0.18 + U.rnd(0.15, 0.3, gi)) * gkk;
        var gxx = W * 0.26;
        U.rr(ctx, gxx, gy, gw, R * 0.1, R * 0.05);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, gi / n), 0.92);
        ctx.fill();
        ctx.font = U.fs(R * 0.09 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText(stages[gi], W * 0.12, gy + R * 0.05);
        ctx.font = U.fs(R * 0.075 * S, 600);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(Math.round(gkk * 100) + '%', gxx + gw + 14 * S, gy + R * 0.05);
      }
      ctx.textAlign = 'center';
    } else if (kind === 'dots') {
      var dk = e.inOutCubic(U.clamp((tt - 0.3) / 1.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var pts = [];
      for (var di = 0; di < n; di++) {
        pts.push([W * U.rnd(0.25, 0.75, di * 2), H * U.rnd(0.3, 0.7, di * 2 + 1)]);
      }
      ctx.lineWidth = 2.6 * S;
      for (var li = 0; li < n - 1; li++) {
        var lk = U.clamp((dk * (n - 1) - li) / 0.7, 0, 1);
        if (lk <= 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(pts[li][0], pts[li][1]);
        ctx.lineTo(U.lerp(pts[li][0], pts[li + 1][0], lk), U.lerp(pts[li][1], pts[li + 1][1], lk));
        ctx.strokeStyle = U.rgba(col, 0.55);
        ctx.stroke();
      }
      for (var di2 = 0; di2 < n; di2++) {
        var dk2 = U.clamp(dk * (n - 1) - di2 + 0.5, 0, 1);
        if (dk2 <= 0.01) continue;
        node(pts[di2][0], pts[di2][1], R * 0.04 * e.outBack(dk2), di2 % 2 ? U.accent2 : col);
        ctx.font = U.fs(R * 0.095 * S * dk2, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85 * dk2);
        ctx.fillText(stages[di2], pts[di2][0], pts[di2][1] - R * 0.12);
      }
    } else if (kind === 'calendar') {
      var rows = 3, cols = 5;
      var reveal = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var cw = R * 0.26, ch = R * 0.2;
      var done = Math.floor(reveal * rows * cols);
      for (var ri = 0; ri < rows; ri++) {
        for (var ci = 0; ci < cols; ci++) {
          var idx = ri * cols + ci;
          var ck = U.clamp((reveal * rows * cols - idx) / 0.8, 0, 1);
          if (ck <= 0.01) continue;
          var cxx = cx + (ci - (cols - 1) / 2) * (cw * 1.12);
          var cyy = cy + (ri - (rows - 1) / 2) * (ch * 1.18);
          ctx.save();
          ctx.translate(cxx, cyy);
          ctx.scale(e.outBack(ck), e.outBack(ck));
          U.rr(ctx, -cw / 2, -ch / 2, cw, ch, ch * 0.18);
          ctx.fillStyle = U.rgba(idx === done - 1 ? col : U.bg2, idx === done - 1 ? 0.95 : 0.9);
          ctx.fill();
          if (idx < done) {
            ctx.font = U.fs(ch * 0.4, 800);
            ctx.fillStyle = U.rgba(idx === done - 1 ? U.bg1 : U.ink, 0.85);
            ctx.fillText('✓', 0, 1);
          }
          ctx.restore();
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(stages.join(' · '), cx, cy + R * 0.52);
    } else {
      var pk2 = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pk2);
      ctx.lineWidth = R * 0.06 * S;
      glowOn(col, p.glow * 0.6);
      ctx.strokeStyle = U.rgba(col, 0.9);
      ctx.stroke();
      ctx.font = U.fs(R * 0.16, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(stages[Math.min(n - 1, Math.floor(pk2 * n))], cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语三：数据大屏 ══════════════════════════ */

  var DASH_PARAMS = [
    P('kind', '形态', 'kpi', sel('kpi', [
      ['kpi', 'KPI 翻牌'], ['rank', '排行榜'], ['gauge-row', '三环仪表'],
      ['ticker', '实时跑马'], ['heat-grid', '热力格'], ['status', '状态灯板'],
      ['pie-trio', '三饼'], ['spark-wall', '走势墙'], ['progress-wall', '进度墙'],
      ['area-grow', '面积图生长'], ['clock', '世界时钟'], ['flow', '数据流向'],
      ['alert', '告警弹出'], ['funnel', '漏斗'], ['bubble', '气泡矩阵'], ['num-roll', '数字列滚动']
    ])),
    P('text', '主题', 'LIVE OPS', txt('LIVE OPS')),
    P('num', '基准值', 100, rng(100, 10, 1000, 5)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('size', '尺寸', 946, rng(946, 200, 1324, 10)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function dashDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = (p.size || 430) * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var base = Math.max(1, Math.round(p.num));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 20 * S * amt; }
    }
    function fmt(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

    if (kind === 'kpi') {
      var vk = e.outExpo(U.clamp((tt - 0.4) / 1.5, 0, 1));
      var cardW = R * 1.15, cardH = R * 0.85;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin((tt * 0.5) % 1 * Math.PI) * 0.015);
      U.rr(ctx, -cardW / 2, -cardH / 2, cardW, cardH, cardH * 0.12);
      ctx.fillStyle = U.rgba(U.bg2, 0.96); ctx.fill();
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.4); ctx.stroke();
      ctx.font = U.fs(cardH * 0.14, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(p.text, 0, -cardH * 0.28);
      glowOn(col, p.glow);
      ctx.font = U.fs(cardH * 0.42, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(fmt(base * vk), 0, cardH * 0.06);
      ctx.font = U.fs(cardH * 0.13, 800);
      ctx.fillStyle = U.rgba('#5DFF8F', 0.95);
      ctx.fillText('▲ LIVE · ' + (Math.sin(tt * 3) > 0 ? '+2.4%' : '+1.8%'), 0, cardH * 0.32);
      ctx.restore();
    } else if (kind === 'rank') {
      var rows = Math.min(6, Math.max(3, Math.round(base / 30) + 3));
      var gk = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      var drift = (tt * 0.22) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(p.text, W * 0.14, cy - R * 0.62);
      for (var ri = 0; ri < rows; ri++) {
        var idx = (ri + Math.floor(drift * rows)) % rows;
        var ry = cy - R * 0.42 + ri * (R * 0.72 / rows);
        var val = (rows - ri) / rows;
        var wv = W * 0.42 * val * (0.75 + 0.25 * Math.abs(U.noise2(idx * 3, Math.floor(tt * 2), U.seed)));
        var wv2 = W * 0.42 * val * U.clamp(gk + ri * 0.06, 0, 1);
        U.rr(ctx, W * 0.22, ry, Math.max(6 * S, wv2), R * 0.07, R * 0.035);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, ri / rows), 0.92);
        ctx.fill();
        if (ri === 0 && wv > wv2) {
          U.rr(ctx, W * 0.22, ry, wv, R * 0.07, R * 0.035);
          ctx.fillStyle = U.rgba(col, 0.25); ctx.fill();
        }
        ctx.font = U.fs(R * 0.095 * S, 800);
        ctx.fillStyle = U.rgba(ri === 0 ? col : U.ink, 0.9);
        ctx.fillText('#' + (idx + 1) + ' ITEM-' + (idx + 1), W * 0.14, ry + R * 0.035);
      }
      ctx.textAlign = 'center';
    } else if (kind === 'gauge-row') {
      var gk2 = e.outCubic(U.clamp((tt - 0.4) / 1.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var gi = 0; gi < 3; gi++) {
        var gx = cx + (gi - 1) * R * 0.72;
        var val = U.clamp((0.4 + 0.5 * Math.abs(U.noise2(gi * 7, tt * sp * 0.9, U.seed))) * U.clamp((gk2 - gi * 0.1) / 0.9, 0, 1), 0, 1);
        ctx.beginPath();
        ctx.arc(gx, cy - R * 0.05, R * 0.24, Math.PI * 0.75, Math.PI * 2.25);
        ctx.lineWidth = R * 0.05 * S;
        ctx.strokeStyle = U.rgba(U.ink, 0.12); ctx.stroke();
        ctx.beginPath();
        ctx.arc(gx, cy - R * 0.05, R * 0.24, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * val));
        glowOn(gi === 1 ? U.accent2 : col, p.glow * 0.4);
        ctx.strokeStyle = U.rgba(gi === 1 ? U.accent2 : col, 0.95); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.font = U.fs(R * 0.12, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.95);
        ctx.fillText(Math.round(val * 100) + '%', gx, cy - R * 0.03);
        ctx.font = U.fs(R * 0.075 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(['CPU', 'MEM', 'IO'][gi], gx, cy + R * 0.22);
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.85);
      ctx.fillText(p.text, cx, cy + R * 0.62);
    } else if (kind === 'ticker') {
      var scroll = (tt * 220 * S) % (W * 0.6);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(R * 0.16, 800);
      ctx.textAlign = 'left';
      for (var ti = 0; ti < 8; ti++) {
        var tx = W * 0.08 + ti * W * 0.24 - scroll;
        var tx2 = tx < -W * 0.3 ? tx + W * 1.44 : tx;
        if (tx2 > W * 1.1) continue;
        var up = U.rng(ti + Math.floor(tt)) > 0.5;
        var v = base * (0.5 + U.rnd(0, 1, ti));
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText('T' + (ti % 5 + 1), tx2, cy - R * 0.1);
        ctx.fillStyle = U.rgba(up ? '#5DFF8F' : '#FF6A5D', 0.95);
        ctx.fillText(fmt(v) + (up ? '↑' : '↓'), tx2, cy + R * 0.14);
      }
      ctx.fillStyle = U.rgba(col, 0.8);
      ctx.fillRect(0, cy - R * 0.42, W, 2 * S);
      ctx.fillRect(0, cy + R * 0.42, W, 2 * S);
      ctx.textAlign = 'center';
    } else if (kind === 'heat-grid') {
      var cols = 10, rows2 = 6;
      var reveal = e.inOutCubic(U.clamp((tt - 0.3) / 1.4, 0, 1));
      var cw = W * 0.6 / cols, ch = H * 0.5 / rows2;
      for (var ri2 = 0; ri2 < rows2; ri2++) {
        for (var ci = 0; ci < cols; ci++) {
          var v2 = Math.abs(U.noise2(ci * 0.8, ri2 * 0.8 + Math.floor(tt * 2) * 0.3, U.seed)) * reveal;
          var cxx = cx - W * 0.3 + ci * cw + cw / 2;
          var cyy = cy - H * 0.25 + ri2 * ch + ch / 2;
          ctx.fillStyle = U.rgba(U.mix(U.bg2, col, U.clamp(v2 * 1.4, 0, 1)), 0.92);
          U.rr(ctx, cxx - cw * 0.42, cyy - ch * 0.42, cw * 0.84, ch * 0.84, ch * 0.16);
          ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(p.text + ' · HEATMAP', cx, cy + H * 0.33);
    } else if (kind === 'status') {
      var n2 = Math.min(8, Math.max(4, Math.round(base / 40) + 4));
      var reveal2 = e.outBack(U.clamp(tt / 1.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var si = 0; si < n2; si++) {
        var sk = U.clamp((reveal2 - si * 0.08) / 0.5, 0, 1);
        if (sk <= 0.01) continue;
        var sxx = cx + (si - (n2 - 1) / 2) * (R * 0.2);
        var state = U.rng(si + Math.floor(tt * 0.4));
        var c2 = state > 0.85 ? '#FFD25D' : state > 0.7 ? '#FF6A5D' : '#5DFF8F';
        var blink = state > 0.85 ? (Math.sin(tt * 8) > 0 ? 1 : 0.4) : 1;
        glowOn(c2, p.glow * 0.4);
        ctx.beginPath(); ctx.arc(sxx, cy, R * 0.055 * sk * blink + 2 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(c2, 0.95 * sk); ctx.fill();
        ctx.shadowBlur = 0;
        U.rr(ctx, sxx - R * 0.08, cy + R * 0.12, R * 0.16, R * 0.22, R * 0.03);
        ctx.fillStyle = U.rgba(U.bg2, 0.9 * sk); ctx.fill();
        ctx.font = U.fs(R * 0.07 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.6 * sk);
        ctx.fillText('N' + (si + 1), sxx, cy + R * 0.24);
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.85);
      ctx.fillText(p.text + ' · STATUS', cx, cy - R * 0.35);
    } else if (kind === 'pie-trio') {
      var pk = e.outCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var pi2 = 0; pi2 < 3; pi2++) {
        var px = cx + (pi2 - 1) * R * 0.72;
        var pr = R * 0.22;
        var pkk = U.clamp((pk - pi2 * 0.1) / 0.9, 0, 1);
        var parts = [0.45, 0.3, 0.25];
        var a0 = -Math.PI / 2;
        for (var ppi = 0; ppi < 3; ppi++) {
          var sweep = parts[ppi] * Math.PI * 2 * pkk;
          ctx.beginPath();
          ctx.moveTo(px, cy);
          ctx.arc(px, cy, pr, a0, a0 + sweep);
          ctx.closePath();
          ctx.fillStyle = U.rgba(U.mix(U.mix(col, U.accent2, ppi / 3), U.ink, ppi === 0 ? 0.2 : 0), 0.9);
          ctx.fill();
          a0 += sweep;
        }
        ctx.beginPath(); ctx.arc(px, cy, pr * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.bg1, 0.95); ctx.fill();
        ctx.font = U.fs(pr * 0.42, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.95);
        ctx.fillText(['45%', '30%', '25%'][pi2], px, cy);
      }
    } else if (kind === 'spark-wall' || kind === 'progress-wall') {
      var wall = Math.min(6, Math.max(3, Math.round(base / 60) + 2));
      var wk = e.outExpo(U.clamp((tt - 0.4) / 1.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var wi = 0; wi < wall; wi++) {
        var wxx = cx - R * 0.85 + (wi % 2) * R * 0.92;
        var wyy = cy - R * 0.55 + Math.floor(wi / 2) * (R * 0.42);
        if (kind === 'spark-wall') {
          ctx.beginPath();
          for (var s2 = 0; s2 <= 16; s2++) {
            var sx3 = wxx + (s2 / 16) * R * 0.7;
            var sy3 = wyy + U.noise2(s2 * 0.6 + wi * 4, Math.floor(tt * 2), U.seed) * R * 0.1 * U.clamp((wk - wi * 0.08) / 0.9, 0, 1);
            if (!s2) ctx.moveTo(sx3, sy3); else ctx.lineTo(sx3, sy3);
          }
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, wi / wall), 0.9);
          ctx.stroke();
        } else {
          var wv = U.clamp((wk - wi * 0.08) / 0.9, 0, 1) * (0.3 + 0.6 * U.rnd(0, 1, wi));
          U.rr(ctx, wxx, wyy, R * 0.7, R * 0.05, R * 0.025);
          ctx.fillStyle = U.rgba(U.ink, 0.12); ctx.fill();
          U.rr(ctx, wxx, wyy, Math.max(R * 0.03, R * 0.7 * wv), R * 0.05, R * 0.025);
          ctx.fillStyle = U.rgba(U.mix(col, U.accent2, wi / wall), 0.92); ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.85);
      ctx.fillText(p.text, cx, cy + R * 0.62);
    } else if (kind === 'area-grow') {
      var ak2 = e.inOutCubic(U.clamp((tt - 0.4) / 1.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var x0 = W * 0.16, x1 = W * 0.84, yb = cy + R * 0.45;
      ctx.beginPath();
      ctx.moveTo(x0, yb);
      var tipX = x0 + (x1 - x0) * ak2;
      for (var ai = 0; ai <= 40; ai++) {
        var axx = x0 + (x1 - x0) * (ai / 40);
        if (axx > tipX) break;
        var ay2 = yb - (0.25 + 0.5 * (ai / 40) + 0.18 * Math.sin(ai * 0.6 + 2) + U.noise2(ai * 0.5, 2, U.seed) * 0.08) * R * 0.8;
        ctx.lineTo(axx, ay2);
      }
      ctx.lineTo(tipX, yb);
      ctx.closePath();
      var ag = ctx.createLinearGradient(0, cy - R * 0.5, 0, yb);
      ag.addColorStop(0, U.rgba(col, 0.4));
      ag.addColorStop(1, U.rgba(col, 0.02));
      ctx.fillStyle = ag; ctx.fill();
      ctx.beginPath();
      for (var ai2 = 0; ai2 <= 40; ai2++) {
        var axx2 = x0 + (x1 - x0) * (ai2 / 40);
        if (axx2 > tipX) break;
        var ay3 = yb - (0.25 + 0.5 * (ai2 / 40) + 0.18 * Math.sin(ai2 * 0.6 + 2) + U.noise2(ai2 * 0.5, 2, U.seed) * 0.08) * R * 0.8;
        if (!ai2) ctx.moveTo(axx2, ay3); else ctx.lineTo(axx2, ay3);
      }
      ctx.lineWidth = 4.4 * S; ctx.lineJoin = 'round';
      glowOn(col, p.glow * 0.6);
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText(p.text + ' · ' + Math.round(ak2 * 100) + '%', cx, yb + R * 0.22);
    } else if (kind === 'clock') {
      var zones = [['SH', 8], ['LDN', 0], ['NYC', -5]];
      var zk = e.outCubic(U.clamp(tt / 1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var zi = 0; zi < 3; zi++) {
        var zx = cx + (zi - 1) * R * 0.75;
        var zkk = U.clamp((zk - zi * 0.15) / 0.85, 0, 1);
        var hr = (new Date().getUTCHours() + zones[zi][1] + 24) % 24;
        var mn = new Date().getUTCMinutes();
        ctx.save();
        ctx.translate(zx, cy);
        ctx.scale(zkk, zkk);
        ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, Math.PI * 2);
        ctx.lineWidth = 3 * S; ctx.strokeStyle = U.rgba(col, 0.8); ctx.stroke();
        var ha = ((hr % 12) + mn / 60) / 12 * Math.PI * 2 - Math.PI / 2;
        var ma2 = mn / 60 * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * R * 0.1, Math.sin(ha) * R * 0.1);
        ctx.lineWidth = 4 * S; ctx.strokeStyle = U.rgba(U.ink, 0.9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ma2) * R * 0.15, Math.sin(ma2) * R * 0.15);
        ctx.lineWidth = 2.4 * S; ctx.strokeStyle = U.rgba(col, 1); ctx.stroke();
        ctx.font = U.fs(R * 0.1 * S, 800);
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText(zones[zi][0] + ' ' + String(hr).padStart(2, '0') + ':' + String(mn).padStart(2, '0'), 0, R * 0.36);
        ctx.restore();
      }
    } else if (kind === 'flow') {
      var fk3 = e.inOutCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var nodes = [[W * 0.18, cy], [cx, cy - R * 0.3], [cx, cy + R * 0.3], [W * 0.82, cy]];
      for (var fi = 1; fi < nodes.length; fi++) {
        var fl = U.clamp((fk3 - (fi - 1) * 0.25) / 0.6, 0, 1);
        if (fl <= 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(nodes[fi - 1][0], nodes[fi - 1][1]);
        ctx.quadraticCurveTo((nodes[fi - 1][0] + nodes[fi][0]) / 2, nodes[fi][1], nodes[fi - 1][0] + (nodes[fi][0] - nodes[fi - 1][0]) * fl, nodes[fi - 1][1] + (nodes[fi][1] - nodes[fi - 1][1]) * fl * 0.9);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(fi % 2 ? col : U.accent2, 0.7);
        ctx.stroke();
      }
      for (var ni = 0; ni < nodes.length; ni++) {
        var nk2 = U.clamp((fk3 - ni * 0.22) / 0.4, 0, 1);
        if (nk2 <= 0.01) continue;
        glowOn(ni === nodes.length - 1 ? col : U.ink, p.glow * 0.4);
        node2(nodes, ni, nk2);
        ctx.shadowBlur = 0;
      }
      function node2(ns, i, k) {
        ctx.beginPath();
        ctx.arc(ns[i][0], ns[i][1], R * 0.06 * e.outBack(k) + 3 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(i === ns.length - 1 ? col : U.ink, 0.95);
        ctx.fill();
      }
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText('INGEST', nodes[0][0], nodes[0][1] + R * 0.16);
      ctx.fillText('SERVE', nodes[3][0], nodes[3][1] + R * 0.16);
    } else if (kind === 'alert') {
      var cyc2 = (tt * 0.7) % 2;
      var showing = cyc2 < 1.4;
      var ask = showing ? e.outBack(U.clamp(cyc2 / 0.3, 0, 1)) * U.clamp((1.4 - cyc2) / 0.25, 0, 1) : 0;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(p.text + ' · MONITOR', cx, cy - R * 0.55);
      if (ask > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(ask, ask);
        var aw = R * 1.3, ah = R * 0.44;
        U.rr(ctx, -aw / 2, -ah / 2, aw, ah, ah * 0.16);
        ctx.fillStyle = U.rgba('#2A1414', 0.97); ctx.fill();
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba('#FF6A5D', 0.8); ctx.stroke();
        glowOn('#FF6A5D', p.glow * 0.5);
        ctx.beginPath(); ctx.arc(-aw * 0.36, 0, R * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#FF6A5D', Math.sin(tt * 9) > 0 ? 1 : 0.35); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = U.fs(ah * 0.3, 800);
        ctx.fillStyle = U.rgba('#FFB4A8', 0.95);
        ctx.textAlign = 'left';
        ctx.fillText('ALERT · latency > 500ms', -aw * 0.26, 0);
        ctx.restore();
        ctx.textAlign = 'center';
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#5DFF8F', 0.9); ctx.fill();
        ctx.font = U.fs(R * 0.1 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.6);
        ctx.fillText('ALL SYSTEMS NORMAL', cx, cy + R * 0.2);
      }
    } else if (kind === 'funnel') {
      var fk4 = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var stages = 4;
      for (var st = 0; st < stages; st++) {
        var stk = U.clamp((fk4 - st * 0.12) / 0.88, 0, 1);
        if (stk <= 0.01) continue;
        var sw2 = W * (0.56 - st * 0.11) * stk;
        var sy2 = cy - R * 0.42 + st * (R * 0.84 / stages);
        ctx.beginPath();
        ctx.moveTo(cx - sw2 / 2, sy2);
        ctx.lineTo(cx + sw2 / 2, sy2);
        ctx.lineTo(cx + (W * (0.56 - (st + 1) * 0.11) * stk) / 2, sy2 + R * 0.84 / stages - R * 0.03);
        ctx.lineTo(cx - (W * (0.56 - (st + 1) * 0.11) * stk) / 2, sy2 + R * 0.84 / stages - R * 0.03);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, st / stages), 0.85);
        ctx.fill();
        ctx.font = U.fs(R * 0.1, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.92);
        ctx.fillText(fmt(base * Math.pow(0.55, st)) , cx, sy2 + (R * 0.84 / stages) / 2 - R * 0.02);
      }
    } else if (kind === 'bubble') {
      var bk2 = e.outCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var bi = 0; bi < 9; bi++) {
        var bkk = U.clamp((bk2 - bi * 0.07) / 0.9, 0, 1);
        if (bkk <= 0.01) continue;
        var bx = cx + (bi % 3 - 1) * R * 0.55 + Math.sin(tt + bi) * 6 * S;
        var by = cy + (Math.floor(bi / 3) - 1) * R * 0.5;
        var br = R * (0.08 + U.rnd(0, 0.12, bi)) * bkk;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, bi / 9), 0.4 + 0.5 * bkk);
        ctx.fill();
        ctx.font = U.fs(br * 0.7, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.85 * bkk);
        ctx.fillText(String(Math.round(base * U.rnd(0.1, 1, bi))), bx, by);
      }
    } else if (kind === 'num-roll') {
      var rows3 = 5;
      var rk = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      for (var nr = 0; nr < rows3; nr++) {
        var nk3 = U.clamp((rk - nr * 0.1) / 0.9, 0, 1);
        var nry = cy - R * 0.5 + nr * (R * 0.25);
        var target = Math.round(base * U.rnd(0.2, 1.5, nr));
        var shown = Math.round(target * nk3);
        ctx.font = U.fs(R * 0.14, 900);
        ctx.fillStyle = U.rgba(nr === 0 ? col : U.ink, 0.95 * nk3);
        ctx.fillText(fmt(shown).padStart(7, ' '), W * 0.34, nry);
        ctx.font = U.fs(R * 0.09 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.45 * nk3);
        ctx.fillText('METRIC-' + (nr + 1), W * 0.18, nry);
        ctx.beginPath();
        ctx.moveTo(W * 0.6, nry);
        ctx.lineTo(W * 0.6 + W * 0.22 * nk3 * U.rnd(0.3, 1, nr), nry);
        ctx.lineWidth = 4 * S;
        ctx.strokeStyle = U.rgba(nr === 0 ? col : U.accent2, 0.7 * nk3);
        ctx.stroke();
      }
      ctx.textAlign = 'center';
    } else {
      ctx.font = U.fs(R * 0.2, 900);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(p.text, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '对比展示', type: 'block', dur: 6, poster: 0.45,
    params: CMP_PARAMS, draw: cmpDraw,
    ids: [
      { id: 'cmp-slider', name: '分屏推拉', tags: ['分屏', '前后'], desc: '分割线左右推移对比两版内容，改版对比标配。', cfg: { kind: 'slider' } },
      { id: 'cmp-wipe', name: '上下擦除', tags: ['擦除', '对比'], desc: '分界线纵向擦除对比，改版前后展示。', cfg: { kind: 'wipe' } },
      { id: 'cmp-vs', name: 'VS 碰撞', tags: ['VS', '对决'], desc: '两个方案从两侧撞入并弹出 VS 徽标。', cfg: { kind: 'vs' } },
      { id: 'cmp-labels', name: '前后标签', tags: ['标签', '切换'], desc: 'BEFORE/AFTER 带胶囊标签交替出现。', cfg: { kind: 'labels' } },
      { id: 'cmp-bars', name: '对比条', tags: ['条形', '数据'], desc: '两条对比条竞速增长，数据高低立现。', cfg: { kind: 'bars' } },
      { id: 'cmp-cards', name: '双卡翻转', tags: ['卡片', '翻转'], desc: '卡片左右压缩翻转切换 A/B 内容。', cfg: { kind: 'cards' } },
      { id: 'cmp-oscillate', name: '分屏振荡', tags: ['振荡', '分屏'], desc: '分割线来回振荡对比，营造拉扯感。', cfg: { kind: 'oscillate' } },
      { id: 'cmp-split-text', name: '一分为二', tags: ['分裂', '文字'], desc: '文字从中缝裂开两半，转折叙事。', cfg: { kind: 'split-text' } },
      { id: 'cmp-price', name: '价格对比', tags: ['价格', '促销'], desc: '原价划掉、现价弹出并挂省钱标签。', cfg: { kind: 'price' } },
      { id: 'cmp-scale', name: '大小对比', tags: ['大小', '缩放'], desc: '一侧缩放放大压过另一侧，优势对比。', cfg: { kind: 'scale' } },
      { id: 'cmp-ab', name: 'A/B 切换', tags: ['A/B', '开关'], desc: 'A/B 滑块开关往复切换，实验演示。', cfg: { kind: 'ab-toggle' } },
      { id: 'cmp-merge', name: '合二为一', tags: ['合并', '融合'], desc: '两个词向中间合并成一体，协同叙事。', cfg: { kind: 'merge' } }
    ]
  });

  MF.forge({
    cat: '时间轴', type: 'block', dur: 6.5, poster: 0.55,
    params: TL_PARAMS, draw: tlDraw,
    texts: ['调研,开发,测试,上线', '计划,执行,复盘', '冷启动,增长,成熟'],
    ids: [
      { id: 'tl-line', name: '主线生长', tags: ['时间轴', '生长'], desc: '主线随节点逐个点亮生长，项目叙事。', cfg: { kind: 'line' } },
      { id: 'tl-milestone', name: '里程碑弹出', tags: ['里程碑', '节点'], desc: '末位里程碑节点弹出高亮，达成时刻。', cfg: { kind: 'milestone' } },
      { id: 'tl-horizontal', name: '横向推进', tags: ['推进', '横向'], desc: '阶段卡片自左向右推进，流程演示。', cfg: { kind: 'horizontal' } },
      { id: 'tl-vertical', name: '纵向滚动', tags: ['纵向', '滚动'], desc: '阶段卡片自上而下滚动，汇报结构。', cfg: { kind: 'vertical' } },
      { id: 'tl-branch', name: '分支展开', tags: ['分支', '树状'], desc: '主线分出多条支线，架构与决策树。', cfg: { kind: 'branch' } },
      { id: 'tl-steps', name: '步骤倒计时', tags: ['步骤', '当前'], desc: '当前步骤高亮脉冲推进，任务流。', cfg: { kind: 'steps' } },
      { id: 'tl-process', name: '流程箭头链', tags: ['流程', '箭头'], desc: '编号方块加箭头串成流程链。', cfg: { kind: 'process' } },
      { id: 'tl-gantt', name: '甘特条', tags: ['甘特', '排期'], desc: '甘特条错峰生长并显示百分比，排期表。', cfg: { kind: 'gantt' } },
      { id: 'tl-dots', name: '节点连线', tags: ['节点', '自由'], desc: '自由布局的节点依次连线，思维导图感。', cfg: { kind: 'dots' } },
      { id: 'tl-flag', name: '插旗', tags: ['旗帜', '打卡'], desc: '节点下方小旗展开，打卡与里程碑。', cfg: { kind: 'flag' } },
      { id: 'tl-calendar', name: '日历翻格', tags: ['日历', '打卡'], desc: '日历格子逐个打勾，坚持打卡叙事。', cfg: { kind: 'calendar' } },
      { id: 'tl-progress-nodes', name: '进度节点', tags: ['进度', '脉冲'], desc: '节点沿圆环推进并显示当前阶段。', cfg: { kind: 'progress-nodes' } }
    ]
  });

  MF.forge({
    cat: '数据大屏', type: 'block', dur: 6.5, poster: 0.55,
    params: DASH_PARAMS, draw: dashDraw,
    texts: ['LIVE OPS', 'GROWTH', 'REALTIME'],
    ids: [
      { id: 'dash-kpi', name: 'KPI 翻牌', tags: ['KPI', '卡片'], desc: '核心指标翻牌滚动并带实时涨幅。', cfg: { kind: 'kpi' } },
      { id: 'dash-rank', name: '排行榜', tags: ['排行', '榜单'], desc: '榜单条形交替增长，竞争氛围。', cfg: { kind: 'rank' } },
      { id: 'dash-gauge-row', name: '三环仪表', tags: ['仪表', '资源'], desc: 'CPU/内存/IO 三环实时波动。', cfg: { kind: 'gauge-row' } },
      { id: 'dash-ticker', name: '实时跑马', tags: ['跑马', '行情'], desc: '多标的价格滚动涨跌，交易大屏。', cfg: { kind: 'ticker' } },
      { id: 'dash-heat', name: '热力格', tags: ['热力', '网格'], desc: '热力网格随时间流动，分布监控。', cfg: { kind: 'heat-grid' } },
      { id: 'dash-status', name: '状态灯板', tags: ['状态', '灯板'], desc: '节点状态灯闪烁巡检，运维大屏。', cfg: { kind: 'status' } },
      { id: 'dash-pie', name: '三饼', tags: ['饼图', '占比'], desc: '三个环形占比图逐个扫出。', cfg: { kind: 'pie-trio' } },
      { id: 'dash-spark', name: '走势墙', tags: ['走势', '墙'], desc: '多路迷你走势线同时律动。', cfg: { kind: 'spark-wall' } },
      { id: 'dash-progress', name: '进度墙', tags: ['进度', '墙'], desc: '多路进度条错峰充填。', cfg: { kind: 'progress-wall' } },
      { id: 'dash-area', name: '面积图生长', tags: ['面积图', '趋势'], desc: '面积图从左向右生长，增长叙事。', cfg: { kind: 'area-grow' } },
      { id: 'dash-clock', name: '世界时钟', tags: ['时钟', '全球'], desc: '三地时钟实时走针，跨国团队。', cfg: { kind: 'clock' } },
      { id: 'dash-flow', name: '数据流向', tags: ['流向', '链路'], desc: '数据沿链路逐段点亮流向出口。', cfg: { kind: 'flow' } },
      { id: 'dash-alert', name: '告警弹出', tags: ['告警', '监控'], desc: '告警卡片周期弹出又恢复，故障演练。', cfg: { kind: 'alert' } },
      { id: 'dash-funnel', name: '漏斗', tags: ['漏斗', '转化'], desc: '漏斗逐层收窄并显示转化数值。', cfg: { kind: 'funnel' } },
      { id: 'dash-bubble', name: '气泡矩阵', tags: ['气泡', '矩阵'], desc: '九宫气泡按权重浮动，分布概览。', cfg: { kind: 'bubble' } },
      { id: 'dash-num-roll', name: '数字列滚动', tags: ['数字', '指标列'], desc: '多行指标数字滚动到位并带刻度条。', cfg: { kind: 'num-roll' } }
    ]
  });
})();

/* ════════ assets/js/effects-20.js ════════ */
/* ==========================================================================
   Jaykou 动效库 · 20
   原语：天气氛围 / 办公效率 / 弹幕字幕 / 节日庆典
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：天气氛围 ══════════════════════════ */

  var WX_PARAMS = [
    P('kind', '天气', 'rain', sel('rain', [
      ['rain', '下雨'], ['drizzle', '细雨'], ['snow', '下雪'], ['snow-heavy', '鹅毛大雪'],
      ['sun', '晴天太阳'], ['sun-rays', '阳光射线'], ['clouds', '云朵飘'], ['storm', '雷暴'],
      ['fog', '雾气'], ['rainbow', '彩虹'], ['wind', '大风'], ['leaves', '落叶'],
      ['stars-night', '星空'], ['moon', '月亮'], ['hail', '冰雹'], ['dew', '露珠']
    ])),
    P('text', '文字', 'STAY COZY', txt('STAY COZY')),
    P('size', '基准尺寸', 300.0, rng(300.0, 140.0, 728.0, 4.0)),
    P('density', '密度', 40, rng(40, 8, 90, 1)),
    P('speed', '速度', 1, rng(1, 0.3, 2.4, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function wxDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var n = Math.max(6, Math.round(p.density));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    var isRainy = kind === 'rain' || kind === 'drizzle' || kind === 'storm' || kind === 'hail';
    var isSnowy = kind === 'snow' || kind === 'snow-heavy';
    if (isRainy || isSnowy || kind === 'leaves' || kind === 'stars-night') {
      for (var i = 0; i < n; i++) {
        var ix = W * U.rnd(-0.05, 1.05, i);
        var iv = 0.4 + U.rnd(0, 1, i + 40);
        var per;
        var sz;
        if (isRainy) { per = H * 1.3; sz = kind === 'hail' ? R * 0.02 : R * 0.012; }
        else if (isSnowy) { per = H * 1.4; sz = R * (kind === 'snow-heavy' ? 0.035 : 0.02) * (0.6 + U.rnd(0, 0.7, i + 7)); }
        else if (kind === 'leaves') { per = H * 1.6; sz = R * 0.03; }
        else { per = 1; sz = R * 0.012 * (0.4 + U.rnd(0, 1, i + 3)); }
        var cyc = ((tt * (isRainy ? 1.6 : 0.32) * iv + U.rnd(0, 1, i + 11)) % 1);
        var yy = isRainy ? U.lerp(-H * 0.15, H * 1.15, cyc) : U.lerp(-H * 0.1, H * 1.1, cyc);
        var sway = isSnowy ? Math.sin(tt * 1.4 + i) * 40 * S : kind === 'leaves' ? Math.sin(tt * 2 + i * 1.7) * 70 * S : 0;
        var alpha = isSnowy || kind === 'leaves' ? Math.sin(cyc * Math.PI) : (kind === 'stars-night' ? 0.35 + 0.6 * Math.abs(U.noise(i * 2.3, tt * 2.2)) : 0.65);
        if (kind === 'stars-night') {
          var sy = H * U.rnd(0.05, 0.55, i + 5);
          var twk = Math.abs(U.noise(i * 3.1, tt * 1.8));
          glowOn('#FFFFFF', p.glow * twk * 0.7);
          ctx.beginPath(); ctx.arc(ix, sy, sz * (0.5 + twk), 0, Math.PI * 2);
          ctx.fillStyle = U.rgba('#FFFFFF', 0.3 + twk * 0.7);
          ctx.fill();
          ctx.shadowBlur = 0;
          continue;
        }
        if (kind === 'hail') {
          ctx.beginPath(); ctx.arc(ix + sway, yy, sz, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.5), alpha * 0.9);
          ctx.fill();
        } else if (kind === 'leaves') {
          ctx.save();
          ctx.translate(ix + sway, yy);
          ctx.rotate(tt * 2.4 + i);
          ctx.beginPath();
          ctx.ellipse(0, 0, sz * 1.6, sz * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.mix(U.mix(col, U.accent2, (i % 4) / 4), '#E8A33D', 0.4), alpha * 0.95);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.moveTo(ix, yy);
          ctx.lineTo(ix + (isRainy ? sz * 0.18 : 0), yy + (isRainy ? R * 0.06 : sz * 2));
          ctx.lineWidth = isRainy ? 2.2 * S : sz;
          ctx.lineCap = 'round';
          ctx.strokeStyle = U.rgba(isSnowy ? '#FFFFFF' : U.mix(col, U.ink, 0.35), alpha * 0.85);
          ctx.stroke();
        }
      }
    }
    if (kind === 'sun' || kind === 'sun-rays' || kind === 'moon') {
      var breathe = 1 + Math.sin(tt * 1.8) * 0.03;
      var orbR = R * 0.42 * breathe;
      var oy = kind === 'moon' ? cy - R * 0.1 : cy - R * 0.05;
      glowOn(kind === 'moon' ? U.mix(col, U.ink, 0.6) : col, p.glow);
      ctx.beginPath(); ctx.arc(cx, oy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(kind === 'moon' ? U.mix(col, U.ink, 0.5) : U.mix(col, '#FFD25D', 0.45), 0.98);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (kind === 'sun-rays') {
        for (var ri = 0; ri < 12; ri++) {
          var ra = (ri / 12) * Math.PI * 2 + tt * 0.24;
          var rlen = orbR * (1.28 + 0.14 * Math.sin(tt * 2.2 + ri));
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ra) * orbR * 1.12, oy + Math.sin(ra) * orbR * 1.12);
          ctx.lineTo(cx + Math.cos(ra) * rlen * 1.35, oy + Math.sin(ra) * rlen * 1.35);
          ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
          ctx.strokeStyle = U.rgba(U.mix(col, '#FFD25D', 0.4), 0.6);
          ctx.stroke();
        }
      }
      if (kind === 'moon') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(cx + orbR * 0.42, oy - orbR * 0.3, orbR * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    if (kind === 'clouds' || kind === 'storm' || kind === 'fog' || kind === 'rain' || kind === 'drizzle' || kind === 'snow' || kind === 'snow-heavy' || kind === 'hail' || kind === 'sun') {
      var clouds = kind === 'fog' ? 4 : 3;
      for (var ci = 0; ci < clouds; ci++) {
        var cxx = ((tt * (14 + ci * 9) * S + ci * W * 0.42) % (W + R * 1.6)) - R * 0.8;
        var cyy = H * (0.16 + ci * 0.1) + Math.sin(tt * 0.8 + ci) * 8 * S;
        var cs = R * (0.2 + ci * 0.04);
        ctx.beginPath();
        for (var bi = 0; bi < 5; bi++) {
          var ba = (bi / 5) * Math.PI * 2;
          var br = cs * (0.75 + 0.3 * Math.abs(U.noise(bi + ci * 7, 3)));
          var bx = cxx + Math.cos(ba) * br * 1.3;
          var by = cyy + Math.sin(ba) * br * 0.55;
          if (!bi) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fillStyle = U.rgba(kind === 'storm' ? '#2A2F3C' : U.mix(U.bg2, U.ink, 0.14), kind === 'fog' ? 0.35 : 0.85);
        ctx.fill();
      }
    }
    if (kind === 'storm') {
      var strike = (tt * 0.8) % 1;
      if (strike < 0.22) {
        var sk = U.clamp(strike / 0.1, 0, 1) * U.clamp((0.22 - strike) / 0.1, 0, 1);
        var lx = W * U.rnd(0.3, 0.7, Math.floor(tt * 0.8));
        glowOn('#FFFFFF', p.glow);
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        var ly2 = 0;
        for (var seg = 0; seg < 6; seg++) {
          ly2 += H * 0.09 * (0.7 + U.rnd(0, 0.6, seg + Math.floor(tt * 3)));
          var lx2 = lx + (seg % 2 ? 1 : -1) * W * 0.018 * U.rnd(0.4, 1.4, seg + 3);
          ctx.lineTo(lx2, ly2);
        }
        ctx.lineWidth = 4 * S;
        ctx.strokeStyle = U.rgba('#FFFFFF', 0.95 * sk);
        ctx.stroke();
        ctx.fillStyle = U.rgba('#FFFFFF', 0.08 * sk);
        ctx.fillRect(0, 0, W, H);
      }
    }
    if (kind === 'rainbow') {
      var rbk = e.outCubic(U.clamp(tt / 1.6, 0, 1));
      var bands = ['#FF6A5D', '#FFB45D', '#FFE45D', '#5DFF8F', '#5DC9FF', '#B45DFF'];
      for (var bi2 = 0; bi2 < bands.length; bi2++) {
        ctx.beginPath();
        ctx.arc(cx, cy + R * 0.55, R * (0.95 - bi2 * 0.075), Math.PI, Math.PI + Math.PI * rbk);
        ctx.lineWidth = R * 0.07;
        ctx.strokeStyle = U.rgba(bands[bi2], 0.85);
        ctx.stroke();
      }
    }
    if (kind === 'wind') {
      for (var wi = 0; wi < 7; wi++) {
        var wy = H * U.rnd(0.15, 0.85, wi);
        var wx0 = ((tt * (200 + wi * 60) * S) % (W * 1.4)) - W * 0.2;
        ctx.beginPath();
        ctx.moveTo(wx0 - R * 0.3, wy);
        ctx.quadraticCurveTo(wx0, wy - 14 * S, wx0 + R * 0.3, wy);
        ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
        ctx.strokeStyle = U.rgba(U.ink, 0.3);
        ctx.stroke();
      }
    }
    if (kind === 'dew') {
      for (var di = 0; di < n * 0.6; di++) {
        var dx = W * U.rnd(0.15, 0.85, di * 2), dy = H * U.rnd(0.3, 0.8, di * 2 + 1);
        var wobble = Math.sin(tt * 2 + di * 2) * 0.12;
        glowOn(col, p.glow * 0.3);
        ctx.beginPath();
        ctx.ellipse(dx, dy + wobble * 8 * S, R * 0.022, R * 0.03, 0, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.5), 0.75);
        ctx.fill();
      }
    }
    if (p.text) {
      var tk = e.outCubic(U.clamp((tt - 0.7) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.2 * tk, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.92 * tk);
      ctx.fillText(String(p.text), cx, kind === 'sun' || kind === 'moon' ? cy + R * 0.95 : cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：办公效率 ══════════════════════════ */

  var WORK_PARAMS = [
    P('kind', '形态', 'todo-check', sel('todo-check', [
      ['todo-check', '清单打勾'], ['calendar-pop', '日程弹出'], ['timer-ring', '计时环'],
      ['pomodoro', '番茄钟'], ['kanban', '看板移动'], ['mail-send', '邮件发送'],
      ['bell-ring', '提醒铃铛'], ['rocket-launch', '火箭发射'], ['trophy', '达成奖杯'],
      ['target-hit', '目标命中'], ['clipboard', '剪贴板复制'], ['files-sync', '文件同步']
    ])),
    P('text', '事项', '完成周报', txt('完成周报')),
    P('size', '基准尺寸', 1232, rng(1232, 1725, 1725, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function workDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    function check(x, y, s2, k, c) {
      ctx.beginPath();
      ctx.moveTo(x - s2 * 0.42, y);
      ctx.lineTo(x - s2 * 0.1, y + s2 * 0.3 * Math.min(1, k * 2));
      if (k > 0.45) ctx.lineTo(x + s2 * 0.45 * U.clamp((k - 0.45) / 0.55, 0, 1), y - s2 * 0.3 * U.clamp((k - 0.45) / 0.55, 0, 1));
      ctx.lineWidth = s2 * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = c;
      ctx.stroke();
    }

    if (kind === 'todo-check') {
      var rows = Math.min(4, Math.max(2, Math.round(label.split(/[,，|]/).length) || 3));
      var items = label.split(/[,，|]/).filter(Boolean);
      if (items.length < 2) items = [label, '下一步计划', '复盘归档'];
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var i = 0; i < Math.min(items.length, 4); i++) {
        var iy = cy - R * 0.34 + i * (R * 0.68 / Math.min(items.length, 4));
        var ik = e.outCubic(U.clamp((tt - 0.4 - i * 0.5) / 0.5, 0, 1));
        if (ik <= 0.01) continue;
        ctx.save();
        ctx.translate(cx, iy);
        var done = ik > 0.5;
        U.rr(ctx, -R * 0.52, -R * 0.1, R * 1.04, R * 0.2, R * 0.06);
        ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
        ctx.beginPath(); ctx.arc(-R * 0.4, 0, R * 0.055 * Math.min(1, ik * 2), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(done ? col : U.ink, done ? 0.95 : 0.2);
        ctx.fill();
        if (done) check(-R * 0.4, 0, R * 0.07, (ik - 0.5) * 2, U.bg1);
        ctx.font = U.fs(R * 0.1, 700);
        ctx.fillStyle = U.rgba(U.ink, done ? 0.35 : 0.9);
        ctx.textAlign = 'left';
        ctx.fillText(items[i], -R * 0.28, 1);
        ctx.textAlign = 'center';
        ctx.restore();
      }
    } else if (kind === 'calendar-pop' || kind === 'clipboard') {
      var pop = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pop, pop);
      var cw = R * 0.9, ch = R * 0.8;
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch, ch * 0.1);
      ctx.fillStyle = U.rgba(U.bg2, 0.97); ctx.fill();
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch * 0.24, ch * 0.1);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.bg2, 0.9);
      ctx.fillRect(-cw * 0.12, -ch / 2 - ch * 0.06, cw * 0.07, ch * 0.12);
      ctx.fillRect(cw * 0.05, -ch / 2 - ch * 0.06, cw * 0.07, ch * 0.12);
      if (kind === 'calendar-pop') {
        var dnum = 1 + (Math.floor(tt) % 28);
        ctx.font = U.fs(ch * 0.34, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.92);
        ctx.fillText(String(dnum), 0, ch * 0.14);
        ctx.font = U.fs(ch * 0.1, 700);
        ctx.fillStyle = U.rgba(col, 0.9);
        ctx.fillText(label, 0, ch * 0.36);
      } else {
        ctx.fillStyle = U.rgba(U.ink, 0.25);
        for (var ln = 0; ln < 3; ln++) ctx.fillRect(-cw * 0.36, -ch * 0.1 + ln * ch * 0.16, cw * U.rnd(0.4, 0.72, ln), ch * 0.05);
      }
      ctx.restore();
    } else if (kind === 'timer-ring' || kind === 'pomodoro') {
      var total = kind === 'pomodoro' ? 25 : 60;
      var frac = (tt * 0.5) % 1;
      var remain = Math.round(total * (1 - frac));
      var breathe = kind === 'pomodoro' ? 1 + Math.pow(1 - (tt * 0.5 % 1), 2) * 0.05 : 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(frac > 0.85 ? col : U.ink, p.glow * 0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.4 * breathe, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - frac));
      ctx.lineWidth = R * 0.05 * S;
      ctx.strokeStyle = U.rgba(col, 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.4 * breathe, 0, Math.PI * 2);
      ctx.lineWidth = 2 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.stroke();
      ctx.font = U.fs(R * 0.22, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(remain + ':' + String(Math.floor((1 - frac) * 60) % 60).padStart(2, '0'), cx, cy);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(kind === 'pomodoro' ? 'FOCUS · ' + label : label, cx, cy + R * 0.62);
    } else if (kind === 'kanban') {
      var cyc = (tt * 0.55) % 1;
      var colIdx = Math.min(2, Math.floor(cyc * 3));
      var inCol = cyc * 3 - colIdx;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var lanes = ['TODO', 'DOING', 'DONE'];
      for (var li = 0; li < 3; li++) {
        var lx = cx + (li - 1) * R * 0.62;
        U.rr(ctx, lx - R * 0.24, cy - R * 0.44, R * 0.48, R * 0.88, R * 0.06);
        ctx.fillStyle = U.rgba(U.bg2, 0.85); ctx.fill();
        ctx.font = U.fs(R * 0.075 * S, 800);
        ctx.fillStyle = U.rgba(li === colIdx ? col : U.ink, li === colIdx ? 0.95 : 0.35);
        ctx.fillText(lanes[li], lx, cy - R * 0.32);
      }
      var kx = U.lerp(cx - R * 0.62, cx + R * 0.62, U.clamp(cyc * 2.2 - 0.15, 0, 1));
      var ky = cy + R * 0.02 + Math.sin(cyc * Math.PI) * -R * 0.14;
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(Math.sin(cyc * Math.PI * 2) * 0.08);
      U.rr(ctx, -R * 0.2, -R * 0.11, R * 0.4, R * 0.22, R * 0.04);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.bg1, 0.35);
      ctx.fillRect(-R * 0.14, -R * 0.05, R * 0.28, R * 0.03);
      ctx.restore();
    } else if (kind === 'mail-send' || kind === 'bell-ring' || kind === 'files-sync') {
      var launch = e.outCubic(U.clamp((tt - 0.3) / 1.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'bell-ring') {
        var swing = Math.sin(tt * 7) * Math.exp(-tt * 1.2) * 0.4 + Math.sin(tt * 1.6) * 0.06;
        ctx.save();
        ctx.translate(cx, cy - R * 0.05);
        ctx.rotate(swing);
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.3);
        ctx.quadraticCurveTo(R * 0.26, -R * 0.28, R * 0.24, R * 0.08);
        ctx.lineTo(-R * 0.24, R * 0.08);
        ctx.quadraticCurveTo(-R * 0.26, -R * 0.28, 0, -R * 0.3);
        ctx.lineWidth = R * 0.045 * S;
        glowOn(col, p.glow);
        ctx.strokeStyle = U.rgba(col, 0.95);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, R * 0.16, R * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.restore();
        for (var ri2 = 0; ri2 < 2; ri2++) {
          ctx.beginPath();
          ctx.arc(cx, cy - R * 0.05, R * (0.34 + ri2 * 0.1), -0.7 - swing, -0.1 - swing);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(col, 0.5 - ri2 * 0.2);
          ctx.stroke();
        }
      } else if (kind === 'files-sync') {
        var arrow = (tt * 0.8) % 1;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(tt * 0.8);
        for (var ai = 0; ai < 2; ai++) {
          ctx.save();
          ctx.rotate(ai * Math.PI);
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.32, -0.4 + arrow * Math.PI * 0.6, 1.2 + arrow * Math.PI * 0.6);
          ctx.lineWidth = R * 0.05 * S; ctx.lineCap = 'round';
          ctx.strokeStyle = U.rgba(ai ? U.accent2 : col, 0.95);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(R * 0.32 * Math.cos(1.35 + arrow * Math.PI * 0.6), R * 0.32 * Math.sin(1.35 + arrow * Math.PI * 0.6));
          ctx.lineTo(R * 0.32 * Math.cos(1.35 + arrow * Math.PI * 0.6) + R * 0.08, R * 0.32 * Math.sin(1.35 + arrow * Math.PI * 0.6) + R * 0.02);
          ctx.lineTo(R * 0.32 * Math.cos(1.35 + arrow * Math.PI * 0.6) + R * 0.02, R * 0.32 * Math.sin(1.35 + arrow * Math.PI * 0.6) + R * 0.09);
          ctx.closePath();
          ctx.fillStyle = U.rgba(ai ? U.accent2 : col, 0.95);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      } else {
        var fy = U.lerp(cy + R * 0.2, cy - R * 0.5, launch);
        var fscale = 1 - launch * 0.3;
        ctx.save();
        ctx.translate(cx, fy);
        ctx.rotate(-0.12 + launch * 0.1);
        ctx.scale(fscale, fscale);
        ctx.beginPath();
        ctx.moveTo(-R * 0.3, -R * 0.16);
        ctx.lineTo(R * 0.3, -R * 0.16);
        ctx.lineTo(0, R * 0.14);
        ctx.closePath();
        ctx.lineWidth = R * 0.035 * S;
        ctx.lineJoin = 'round';
        glowOn(col, p.glow * 0.6);
        ctx.strokeStyle = U.rgba(col, 0.95);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-R * 0.3, -R * 0.16);
        ctx.lineTo(0, R * 0.05);
        ctx.lineTo(R * 0.3, -R * 0.16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-R * 0.28, -R * 0.14);
        ctx.lineTo(-R * 0.42 - launch * R * 0.2, -R * 0.05 + launch * R * 0.14);
        ctx.moveTo(R * 0.28, -R * 0.14);
        ctx.lineTo(R * 0.42 + launch * R * 0.2, -R * 0.05 + launch * R * 0.14);
        ctx.lineWidth = 2.4 * S;
        ctx.strokeStyle = U.rgba(col, 0.6);
        ctx.stroke();
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.75);
      ctx.fillText(label, cx, cy + R * 0.6);
    } else if (kind === 'rocket-launch' || kind === 'trophy' || kind === 'target-hit') {
      var lift = e.inOutCubic(U.clamp((tt - 0.3) / 1.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'rocket-launch') {
        var ry = cy + R * 0.4 - lift * R * 1.1;
        glowOn(col, p.glow * 0.6);
        ctx.save();
        ctx.translate(cx, ry);
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.4);
        ctx.quadraticCurveTo(R * 0.18, -R * 0.1, R * 0.14, R * 0.16);
        ctx.lineTo(-R * 0.14, R * 0.16);
        ctx.quadraticCurveTo(-R * 0.18, -R * 0.1, 0, -R * 0.4);
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.35), 0.98);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-R * 0.14, R * 0.02);
        ctx.lineTo(-R * 0.28, R * 0.22);
        ctx.lineTo(-R * 0.13, R * 0.16);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(R * 0.14, R * 0.02);
        ctx.lineTo(R * 0.28, R * 0.22);
        ctx.lineTo(R * 0.13, R * 0.16);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); ctx.arc(0, -R * 0.12, R * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.bg1, 0.9); ctx.fill();
        if (lift > 0.05 && lift < 0.98) {
          var flame = (Math.sin(tt * 30) * 0.2 + 1) * (1 - lift * 0.4);
          ctx.beginPath();
          ctx.moveTo(-R * 0.09, R * 0.17);
          ctx.quadraticCurveTo(0, R * (0.3 + 0.24 * flame), R * 0.09, R * 0.17);
          ctx.closePath();
          ctx.fillStyle = U.rgba(U.mix(col, '#FFD25D', 0.6), 0.9);
          ctx.fill();
        }
        ctx.restore();
      } else if (kind === 'trophy') {
        var tk = e.outBack(U.clamp((tt - 0.3) / 0.6, 0, 1));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(tk, tk);
        glowOn(U.mix(col, '#FFD25D', 0.5), p.glow);
        ctx.beginPath();
        ctx.moveTo(-R * 0.2, -R * 0.3);
        ctx.lineTo(R * 0.2, -R * 0.3);
        ctx.quadraticCurveTo(R * 0.24, R * 0.02, 0, R * 0.1);
        ctx.quadraticCurveTo(-R * 0.24, R * 0.02, -R * 0.2, -R * 0.3);
        ctx.fillStyle = U.rgba(U.mix(col, '#FFD25D', 0.55), 1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-R * 0.27, -R * 0.2, R * 0.09, 0, Math.PI * 2);
        ctx.arc(R * 0.27, -R * 0.2, R * 0.09, 0, Math.PI * 2);
        ctx.lineWidth = R * 0.03 * S;
        ctx.strokeStyle = U.rgba(U.mix(col, '#FFD25D', 0.55), 0.9);
        ctx.stroke();
        ctx.fillRect(-R * 0.045, R * 0.1, R * 0.09, R * 0.12);
        ctx.fillRect(-R * 0.13, R * 0.22, R * 0.26, R * 0.05);
        ctx.restore();
        for (var si = 0; si < 8; si++) {
          var sa = (si / 8) * Math.PI * 2 + tt;
          var sr2 = R * (0.42 + Math.sin(tt * 3 + si) * 0.04);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(sa) * sr2, cy + Math.sin(sa) * sr2, 3.4 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba('#FFE45D', 0.7);
          ctx.fill();
        }
      } else {
        var hitK = (tt * 0.7) % 1;
        var aim = 1 - Math.pow(Math.min(1, hitK * 3), 2);
        glowOn(col, p.glow);
        for (var ri3 = 3; ri3 >= 1; ri3--) {
          ctx.beginPath();
          ctx.arc(cx, cy, R * 0.1 * ri3 * aim, 0, Math.PI * 2);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(col, ri3 === 1 ? 0.95 : 0.4);
          ctx.stroke();
        }
        var hitNow = hitK > 0.4;
        ctx.beginPath(); ctx.arc(cx, cy, R * (hitNow ? 0.06 : 0.03), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(hitNow ? col : U.ink, 0.98); ctx.fill();
        if (hitNow) {
          var bk = e.outCubic((hitK - 0.4) / 0.6);
          for (var hi = 0; hi < 8; hi++) {
            var ha = (hi / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ha) * R * 0.1, cy + Math.sin(ha) * R * 0.1);
            ctx.lineTo(cx + Math.cos(ha) * R * (0.14 + 0.2 * bk), cy + Math.sin(ha) * R * (0.14 + 0.2 * bk));
            ctx.lineWidth = 3.4 * S;
            ctx.strokeStyle = U.rgba(col, (1 - bk) * 0.9);
            ctx.stroke();
          }
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText(label, cx, cy + R * 0.72);
    } else {
      ctx.font = U.fs(R * 0.16, 900);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语三：弹幕字幕 ══════════════════════════ */

  var DM_PARAMS = [
    P('kind', '形态', 'danmaku', sel('danmaku', [
      ['danmaku', '滚动弹幕'], ['danmaku-top', '顶部弹幕'], ['subtitle', '底部字幕条'],
      ['caption-pop', '气泡字幕'], ['live-heat', '直播间热度'], ['quiz', '答题弹幕'],
      ['reply', '回复串'], ['watermark', '平铺水印'], ['ping', '坐标标记'], ['chapter', '章节标题']
    ])),
    P('text', '弹幕内容', '前方高能,名场面来了,哈哈哈哈,泪目,收藏了', txt('前方高能,名场面来了,哈哈哈哈,泪目,收藏了', true)),
    P('size', '字号', 44.0, rng(44.0, 259, 110.0, 1.0)),
    P('speed', '速度', 1, rng(1, 0.3, 2.4, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.3, rng(0.3, 0, 1, 0.05))
  ];

  function dmDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var col = p.ink2;
    var kind = p.kind;
    var pool = String(p.text || '').split(/[,，|]/).filter(Boolean);
    if (!pool.length) pool = ['前方高能', '名场面'];
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    ctx.save();
    ctx.textBaseline = 'middle';

    if (kind === 'danmaku' || kind === 'quiz' || kind === 'reply') {
      var lanes = 7;
      ctx.font = U.fs(fs * 0.8, 700);
      for (var i = 0; i < pool.length * 3; i++) {
        var lane = i % lanes;
        var txtv = pool[i % pool.length];
        if (kind === 'reply' && i % 2) txtv = '↳ ' + txtv;
        if (kind === 'quiz' && i % 3 === 0) txtv = 'A. ' + txtv;
        var w2 = ctx.measureText(txtv).width;
        var laneSpeed = (0.6 + (lane % 3) * 0.22) * sp;
        var x0 = ((tt * 420 * S * laneSpeed + i * W * 0.37) % (W + w2 * 2)) - w2;
        var y0 = H * 0.12 + lane * (H * 0.76 / (lanes - 1));
        ctx.globalAlpha = x0 < -w2 * 0.5 ? 0 : 0.92;
        if (kind === 'quiz' && i % 3 === 0) {
          U.rr(ctx, x0 - 12 * S, y0 - fs * 0.62, w2 + 24 * S, fs * 1.24, fs * 0.3);
          ctx.fillStyle = U.rgba(col, 0.2);
          ctx.fill();
        }
        ctx.fillStyle = U.rgba(i % 4 === 0 ? col : U.mix(U.ink, '#FFFFFF', 0.2), 1);
        ctx.fillText(txtv, x0, y0);
      }
      ctx.globalAlpha = 1;
    } else if (kind === 'danmaku-top') {
      ctx.font = U.fs(fs * 0.9, 800);
      var cur = pool[Math.floor(tt / 2.2) % pool.length];
      var w3 = ctx.measureText(cur).width + 44 * S;
      var inK = e.outBack(U.clamp((tt % 2.2) / 0.4, 0, 1));
      var outK = U.clamp((2.2 - (tt % 2.2)) / 0.3, 0, 1);
      ctx.save();
      ctx.translate(W / 2, H * 0.14);
      ctx.scale(inK * outK, inK * outK);
      U.rr(ctx, -w3 / 2, -fs * 0.75, w3, fs * 1.5, fs * 0.4);
      ctx.fillStyle = U.rgba(U.bg2, 0.88); ctx.fill();
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(cur, 0, 0);
      ctx.restore();
    } else if (kind === 'subtitle' || kind === 'caption-pop') {
      var seg = Math.floor(tt / 1.4) % pool.length;
      var sk = e.outCubic(U.clamp((tt % 1.4) / 0.3, 0, 1));
      var so = U.clamp((1.4 - (tt % 1.4)) / 0.25, 0, 1);
      var txtv2 = pool[seg];
      ctx.font = U.fs(fs * 0.85, 700);
      var w4 = ctx.measureText(txtv2).width;
      if (kind === 'subtitle') {
        ctx.globalAlpha = sk * so;
        U.rr(ctx, cx - w4 / 2 - 26 * S, H * 0.78 - fs * 0.7, w4 + 52 * S, fs * 1.4, fs * 0.2);
        ctx.fillStyle = U.rgba(U.bg1, 0.72); ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.96);
        ctx.fillText(txtv2, cx, H * 0.78);
      } else {
        ctx.save();
        ctx.translate(cx, H * 0.7);
        ctx.scale(sk * so, sk * so);
        U.rr(ctx, -w4 / 2 - 24 * S, -fs * 0.72, w4 + 48 * S, fs * 1.44, fs * 0.4);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-14 * S, fs * 0.7);
        ctx.lineTo(0, fs * 1.02);
        ctx.lineTo(14 * S, fs * 0.7);
        ctx.closePath();
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.fillStyle = U.rgba(U.bg1, 0.96);
        ctx.fillText(txtv2, 0, 0);
        ctx.restore();
      }
    } else if (kind === 'live-heat') {
      var heat = 0.5 + 0.5 * Math.sin(tt * 1.8) + 0.18 * Math.abs(U.noise(tt * 3, 1));
      ctx.font = U.fs(fs * 0.7, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.textAlign = 'left';
      ctx.fillText('● LIVE', W * 0.08, H * 0.14);
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(base2()) + ' 人气', W * 0.92, H * 0.14);
      ctx.textAlign = 'center';
      function base2() { return 12000 + heat * 8000; }
      ctx.fillStyle = U.rgba(col, 0.15);
      ctx.fillRect(W * 0.08, H * 0.2, W * 0.84, 10 * S);
      glowOn(col, p.glow);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillRect(W * 0.08, H * 0.2, W * 0.84 * U.clamp(heat, 0, 1), 10 * S);
      for (var li2 = 0; li2 < 4; li2++) {
        var dmk = pool[(li2 + Math.floor(tt)) % pool.length];
        var dx2 = ((tt * 300 * S + li2 * W * 0.4) % (W * 1.3)) - W * 0.15;
        ctx.font = U.fs(fs * 0.62, 700);
        ctx.fillStyle = U.rgba(li2 % 2 ? U.accent2 : U.mix(U.ink, '#FFFFFF', 0.2), 0.85);
        ctx.fillText(dmk, dx2, H * (0.4 + li2 * 0.14));
      }
    } else if (kind === 'watermark') {
      ctx.font = U.fs(fs * 0.62, 800);
      for (var wx2 = 0; wx2 < 5; wx2++) {
        for (var wy2 = 0; wy2 < 4; wy2++) {
          ctx.save();
          ctx.translate(W * (0.1 + wx2 * 0.2), H * (0.14 + wy2 * 0.24));
          ctx.rotate(-0.3);
          ctx.fillStyle = U.rgba(U.ink, 0.08);
          ctx.fillText(String(p.text || 'JAYKOU').split(/[,，|]/)[0] || 'MF', 0, 0);
          ctx.restore();
        }
      }
      ctx.font = U.fs(fs * 0.8, 800);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(pool[0], cx, cy);
    } else if (kind === 'ping') {
      var pk = (tt * 0.8) % pool.length;
      var idx = Math.floor(pk);
      var px = W * U.rnd(0.2, 0.8, idx + 3), py = H * U.rnd(0.25, 0.7, idx + 9);
      var fk = e.outBack(U.clamp((pk % 1) / 0.3, 0, 1)) * U.clamp((1 - (pk % 1)) / 0.12, 0, 1);
      ctx.beginPath(); ctx.arc(px, py, 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      for (var pi = 0; pi < 2; pi++) {
        var pp = ((tt * 0.9) + pi * 0.5) % 1;
        ctx.beginPath(); ctx.arc(px, py, 12 * S + pp * 40 * S, 0, Math.PI * 2);
        ctx.lineWidth = 2.6 * S * (1 - pp);
        ctx.strokeStyle = U.rgba(col, (1 - pp) * 0.7);
        ctx.stroke();
      }
      if (fk > 0.01) {
        ctx.font = U.fs(fs * 0.62, 700);
        var tw5 = ctx.measureText(pool[idx]).width + 30 * S;
        U.rr(ctx, px + 14 * S, py - fs * 0.8 * fk, tw5 * fk, fs * 1.2, fs * 0.3);
        ctx.fillStyle = U.rgba(U.bg2, 0.92 * fk); ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.95 * fk);
        ctx.fillText(pool[idx], px + 14 * S + tw5 / 2, py - fs * 0.2 * fk);
      }
    } else if (kind === 'chapter') {
      var num = Math.floor(tt / 1.6) % 5 + 1;
      var nk = e.outCubic(U.clamp((tt % 1.6) / 0.5, 0, 1));
      var no = U.clamp((1.6 - (tt % 1.6)) / 0.3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(nk * no, nk * no);
      ctx.font = U.fs(fs * 2.1, 900);
      ctx.fillStyle = U.rgba(col, 0.16);
      ctx.fillText('0' + num, 0, 0);
      ctx.font = U.fs(fs * 0.9, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.96);
      ctx.fillText(pool[(num - 1) % pool.length], 0, fs * 0.15);
      ctx.beginPath();
      ctx.moveTo(-fs * 1.4 * nk, fs * 0.85);
      ctx.lineTo(fs * 1.4 * nk, fs * 0.85);
      ctx.lineWidth = 4 * S;
      ctx.strokeStyle = U.rgba(col, 0.85);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.font = U.fs(fs, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(pool[0], cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语四：节日庆典 ══════════════════════════ */

  var FEST_PARAMS = [
    P('kind', '形态', 'confetti', sel('confetti', [
      ['confetti', '彩带礼炮'], ['balloon', '气球升起'], ['firework', '烟花绽放'],
      ['gift-open', '礼物开箱'], ['cake', '蛋糕蜡烛'], ['lantern', '灯笼升起'],
      ['bunting', '三角彩旗'], ['cheers', '碰杯庆祝'], ['sparkle', '星光点缀'], ['party-count', '倒数开场']
    ])),
    P('text', '祝福语', 'HAPPY 2026', txt('HAPPY 2026')),
    P('size', '基准尺寸', 300.0, rng(300.0, 140.0, 728.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  function festDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 26 * S * amt; }
    }
    function palette(i) { return [col, U.accent2, '#FFD25D', '#5DFF8F', '#FF6A9D'][i % 5]; }

    if (kind === 'confetti' || kind === 'party-count') {
      if (kind === 'party-count') {
        var cd = 3 - Math.floor(tt) % 4;
        var frac = 1 - (tt % 1);
        var popK = Math.pow(frac, 3);
        glowOn(col, p.glow * (0.3 + popK * 0.7));
        ctx.font = U.fs(R * (0.6 + popK * 0.2), 900);
        ctx.fillStyle = U.rgba(cd <= 0 ? col : U.ink, U.clamp(tt * 3, 0, 1));
        ctx.fillText(cd <= 0 ? '🎉' : String(cd), cx, cy);
      }
      for (var i = 0; i < 60; i++) {
        var delay = U.rnd(0, 1.2, i);
        var cyc = ((tt * 0.55 + delay) % 1);
        var px = W * U.rnd(0.06, 0.94, i + 20) + Math.sin(tt * 2 + i) * 26 * S;
        var py = U.lerp(-H * 0.08, H * 1.12, cyc);
        var sz = R * (0.014 + U.rnd(0, 0.02, i + 3));
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tt * 3 * (i % 2 ? 1 : -1) + i);
        ctx.fillStyle = U.rgba(palette(i), Math.sin(cyc * Math.PI) * 0.95);
        ctx.fillRect(-sz, -sz * 0.4, sz * 2, sz * 0.8);
        ctx.restore();
      }
      var tk = e.outBack(U.clamp((tt - 0.5) / 0.6, 0, 1));
      if (kind === 'confetti' && tk > 0.01) {
        glowOn(col, p.glow);
        ctx.font = U.fs(R * 0.34 * tk, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.98);
        ctx.fillText(label, cx, cy);
      }
    } else if (kind === 'balloon' || kind === 'lantern') {
      var n2 = kind === 'balloon' ? 8 : 7;
      for (var bi = 0; bi < n2; bi++) {
        var per = 1.6 + U.rnd(0, 0.8, bi);
        var cyc2 = ((tt / per + U.rnd(0, 1, bi)) % 1);
        var bxx = W * U.rnd(0.12, 0.88, bi) + Math.sin(tt * 1.2 + bi * 2) * 30 * S;
        var byy = U.lerp(H * 1.15, -H * 0.2, cyc2);
        var bs = R * (0.1 + U.rnd(0, 0.08, bi + 5));
        ctx.globalAlpha = Math.sin(cyc2 * Math.PI) * 0.95;
        if (kind === 'balloon') {
          glowOn(palette(bi), p.glow * 0.35);
          ctx.beginPath();
          ctx.ellipse(bxx, byy, bs, bs * 1.22, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(palette(bi), 0.92);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(bxx, byy + bs * 1.22);
          ctx.quadraticCurveTo(bxx + Math.sin(tt * 2 + bi) * 8 * S, byy + bs * 1.7, bxx, byy + bs * 2.1);
          ctx.lineWidth = 1.6 * S;
          ctx.strokeStyle = U.rgba(U.ink, 0.4);
          ctx.stroke();
        } else {
          glowOn('#FF9D45', p.glow * 0.5);
          ctx.beginPath();
          ctx.moveTo(bxx - bs * 0.7, byy - bs * 0.4);
          ctx.quadraticCurveTo(bxx - bs * 0.75, byy + bs * 0.5, bxx, byy + bs * 0.62);
          ctx.quadraticCurveTo(bxx + bs * 0.75, byy + bs * 0.5, bxx + bs * 0.7, byy - bs * 0.4);
          ctx.quadraticCurveTo(bxx + bs * 0.5, byy - bs * 0.95, bxx, byy - bs * 0.95);
          ctx.quadraticCurveTo(bxx - bs * 0.5, byy - bs * 0.95, bxx - bs * 0.7, byy - bs * 0.4);
          ctx.closePath();
          ctx.fillStyle = U.rgba('#FF9D45', 0.9);
          ctx.fill();
          ctx.fillStyle = U.rgba('#FFB35D', 0.9);
          ctx.beginPath(); ctx.arc(bxx, byy, bs * 0.3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      var tk2 = e.outCubic(U.clamp((tt - 0.8) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.22 * tk2, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95 * tk2);
      ctx.fillText(label, cx, cy + R * 0.4);
    } else if (kind === 'firework') {
      var burst = (tt * 0.55) % 1;
      var fxx = W * U.rnd(0.25, 0.75, Math.floor(tt * 0.55));
      var fyy = H * U.rnd(0.22, 0.5, Math.floor(tt * 0.55) + 7);
      var rise = U.clamp(burst / 0.28, 0, 1);
      var explode = U.clamp((burst - 0.28) / 0.72, 0, 1);
      if (explode <= 0) {
        ctx.beginPath();
        ctx.moveTo(fxx, U.lerp(H * 1.05, fyy, e.outCubic(rise)));
        ctx.lineWidth = 3.4 * S; ctx.lineCap = 'round';
        ctx.strokeStyle = U.rgba('#FFE45D', 0.95);
        ctx.stroke();
      } else {
        glowOn(palette(Math.floor(tt * 0.55)), p.glow);
        var rays = 26;
        for (var ri2 = 0; ri2 < rays; ri2++) {
          var ra = (ri2 / rays) * Math.PI * 2;
          var rr2 = R * (0.12 + 0.5 * e.outCubic(explode)) * (0.8 + 0.3 * U.rng(ri2));
          ctx.beginPath();
          ctx.arc(fxx + Math.cos(ra) * rr2, fyy + Math.sin(ra) * rr2, 3.4 * S * (1 - explode * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(ri2 % 3 ? palette(Math.floor(tt * 0.55)) : '#FFFFFF', (1 - explode) * 0.95);
          ctx.fill();
        }
      }
      var tk3 = e.outCubic(U.clamp((tt - 0.6) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.24 * tk3, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95 * tk3);
      ctx.fillText(label, cx, cy + R * 0.75);
    } else if (kind === 'gift-open' || kind === 'cheers') {
      var openK = e.outBack(U.clamp((tt - 0.4) / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'gift-open') {
        var bw = R * 0.6, bh = R * 0.44;
        var lidLift = U.clamp((openK - 0.3) / 0.7, 0, 1);
        U.rr(ctx, cx - bw / 2, cy - bh * 0.1, bw, bh, bh * 0.08);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.save();
        ctx.translate(cx - bw / 2, cy - bh * 0.1);
        ctx.rotate(-lidLift * 0.9);
        ctx.fillRect(0, -bh * 0.22, bw * 0.52, bh * 0.2);
        ctx.restore();
        ctx.save();
        ctx.translate(cx + bw / 2, cy - bh * 0.1);
        ctx.rotate(lidLift * 0.9);
        ctx.fillRect(-bw * 0.52, -bh * 0.22, bw * 0.52, bh * 0.2);
        ctx.restore();
        if (lidLift > 0.1) {
          for (var gi = 0; gi < 8; gi++) {
            var gk = U.clamp((lidLift - 0.1 - gi * 0.05) / 0.5, 0, 1);
            if (gk <= 0.01) continue;
            var ga = -Math.PI / 2 + (gi - 3.5) * 0.3;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ga) * R * 0.34 * gk, cy - bh * 0.2 + Math.sin(ga) * R * 0.3 * gk, R * 0.035, 0, Math.PI * 2);
            ctx.fillStyle = U.rgba(palette(gi), 0.95 * (1 - gk * 0.4));
            ctx.fill();
          }
        }
      } else {
        for (var gi2 = -1; gi2 <= 1; gi2 += 2) {
          ctx.save();
          ctx.translate(cx + gi2 * R * 0.24, cy);
          ctx.rotate(gi2 * (0.2 - (1 - openK) * 0.5));
          ctx.beginPath();
          ctx.moveTo(-R * 0.07, -R * 0.3);
          ctx.quadraticCurveTo(R * 0.1, -R * 0.3, R * 0.09, R * 0.1);
          ctx.lineTo(-R * 0.09, R * 0.1);
          ctx.quadraticCurveTo(-R * 0.1, -R * 0.3, -R * 0.07, -R * 0.3);
          ctx.closePath();
          ctx.fillStyle = U.rgba(gi2 < 0 ? col : U.accent2, 0.92);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-R * 0.07, -R * 0.32, R * 0.05, Math.PI * 0.8, Math.PI * 1.9);
          ctx.lineWidth = R * 0.03 * S;
          ctx.strokeStyle = U.rgba(U.mix(gi2 < 0 ? col : U.accent2, U.ink, 0.3), 0.8);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.font = U.fs(R * 0.14 * e.outCubic(U.clamp((tt - 0.9) / 0.4, 0, 1)), 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'cake' || kind === 'sparkle') {
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'cake') {
        var cw2 = R * 0.7, ch2 = R * 0.2;
        U.rr(ctx, cx - cw2 / 2, cy + R * 0.1, cw2, ch2, ch2 * 0.3);
        ctx.fillStyle = U.rgba(U.mix(col, '#FFD25D', 0.4), 0.95); ctx.fill();
        U.rr(ctx, cx - cw2 * 0.38 / 2, cy - R * 0.08, cw2 * 0.38, ch2 * 0.9, ch2 * 0.28);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        for (var ci = 0; ci < 3; ci++) {
          var cxx = cx + (ci - 1) * R * 0.14;
          var flick2 = 0.75 + 0.25 * Math.sin(tt * 9 + ci * 2);
          glowOn('#FFD25D', p.glow);
          ctx.beginPath();
          ctx.ellipse(cxx, cy - R * 0.22, R * 0.032 * flick2, R * 0.05 * flick2, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba('#FFD25D', 0.98); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = U.rgba(U.ink, 0.6);
          ctx.fillRect(cxx - 1.5 * S, cy - R * 0.16, 3 * S, R * 0.08);
        }
      } else {
        for (var si2 = 0; si2 < 14; si2++) {
          var twk2 = Math.abs(U.noise(si2 * 2.7, tt * 2.4));
          if (twk2 < 0.3) continue;
          var sx4 = W * U.rnd(0.1, 0.9, si2), sy4 = H * U.rnd(0.12, 0.85, si2 + 4);
          var ss = R * 0.03 * twk2;
          glowOn(palette(si2), p.glow * twk2);
          ctx.beginPath();
          ctx.moveTo(sx4, sy4 - ss * 2);
          ctx.quadraticCurveTo(sx4, sy4, sx4 + ss * 2, sy4);
          ctx.quadraticCurveTo(sx4, sy4, sx4, sy4 + ss * 2);
          ctx.quadraticCurveTo(sx4, sy4, sx4 - ss * 2, sy4);
          ctx.quadraticCurveTo(sx4, sy4, sx4, sy4 - ss * 2);
          ctx.fillStyle = U.rgba(palette(si2), twk2);
          ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.18 * e.outCubic(U.clamp((tt - 0.7) / 0.5, 0, 1)), 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(label, cx, cy + R * 0.72);
    } else if (kind === 'bunting') {
      var sway = Math.sin(tt * 1.6) * 0.06;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.14);
      ctx.quadraticCurveTo(cx, H * 0.22, W, H * 0.14);
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.5);
      ctx.stroke();
      var flags = 12;
      for (var fi = 0; fi < flags; fi++) {
        var fx = W * (0.04 + fi * 0.92 / (flags - 1));
        var fy = H * (0.14 + 0.08 * Math.sin(Math.PI * fi / (flags - 1))) + Math.sin(tt * 2 + fi) * 4 * S;
        ctx.beginPath();
        ctx.moveTo(fx - R * 0.05, fy);
        ctx.lineTo(fx + R * 0.05, fy);
        ctx.lineTo(fx, fy + R * 0.14 + sway * R * 0.4);
        ctx.closePath();
        ctx.fillStyle = U.rgba(palette(fi), 0.92);
        ctx.fill();
      }
      var tk4 = e.outCubic(U.clamp((tt - 0.6) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.26 * tk4, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.96 * tk4);
      ctx.fillText(label, cx, cy + R * 0.2);
    } else {
      ctx.font = U.fs(R * 0.2, 900);
      ctx.fillStyle = U.rgba(col, 0.92);
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '天气氛围', type: 'block', dur: 6.5, poster: 0.55,
    params: WX_PARAMS, draw: wxDraw,
    texts: ['STAY COZY', 'RAIN DAY', 'GOOD VIBES', 'LET IT SNOW'],
    ids: [
      { id: 'wx-rain', name: '下雨', tags: ['雨', '氛围'], desc: '雨丝倾泻配乌云，雨天氛围底衬。', cfg: { kind: 'rain' } },
      { id: 'wx-drizzle', name: '细雨', tags: ['细雨', '安静'], desc: '绵密细雨缓慢落下，安静氛围。', cfg: { kind: 'drizzle' } },
      { id: 'wx-snow', name: '下雪', tags: ['雪', '冬天'], desc: '雪花左右摇曳飘落，冬日氛围。', cfg: { kind: 'snow' } },
      { id: 'wx-snow-heavy', name: '鹅毛大雪', tags: ['大雪', '冬日'], desc: '大片雪花纷纷扬扬，暴雪氛围。', cfg: { kind: 'snow-heavy' } },
      { id: 'wx-sun', name: '晴天太阳', tags: ['太阳', '晴天'], desc: '呼吸的太阳配浮云，晴天好心情。', cfg: { kind: 'sun' } },
      { id: 'wx-sun-rays', name: '阳光射线', tags: ['射线', '光合'], desc: '太阳缓慢旋转放射光线，正能量开场。', cfg: { kind: 'sun-rays', size: 1232} },
      { id: 'wx-clouds', name: '云朵飘', tags: ['云', '飘动'], desc: '多层云朵缓缓飘过，平和氛围。', cfg: { kind: 'clouds' } },
      { id: 'wx-storm', name: '雷暴', tags: ['雷电', '风暴'], desc: '乌云压顶闪电劈落，冲突与爆发叙事。', cfg: { kind: 'storm' } },
      { id: 'wx-fog', name: '雾气', tags: ['雾', '朦胧'], desc: '薄雾层叠飘移，神秘与留白。', cfg: { kind: 'fog' } },
      { id: 'wx-rainbow', name: '彩虹', tags: ['彩虹', '希望'], desc: '彩虹逐色展开，希望与多元表达。', cfg: { kind: 'rainbow', size: 1232} },
      { id: 'wx-wind', name: '大风', tags: ['风', '流动'], desc: '风线横向掠过，速度与流动感。', cfg: { kind: 'wind' } },
      { id: 'wx-leaves', name: '落叶', tags: ['落叶', '秋天'], desc: '落叶旋转飘落，秋日叙事。', cfg: { kind: 'leaves' } },
      { id: 'wx-stars-night', name: '星空', tags: ['星空', '闪烁'], desc: '满天星辰随机闪烁，夜晚氛围。', cfg: { kind: 'stars-night' } },
      { id: 'wx-moon', name: '月亮', tags: ['月亮', '夜'], desc: '发光月牙配浮云，晚安场景。', cfg: { kind: 'moon', size: 1232} },
      { id: 'wx-hail', name: '冰雹', tags: ['冰雹', '冲击'], desc: '冰雹密集砸落，紧张氛围。', cfg: { kind: 'hail' } },
      { id: 'wx-dew', name: '露珠', tags: ['露珠', '清新'], desc: '露珠轻轻晃动，清晨与清新感。', cfg: { kind: 'dew' } }
    ]
  });

  MF.forge({
    cat: '办公效率', type: 'block', dur: 6, poster: 0.55,
    params: WORK_PARAMS, draw: workDraw,
    texts: ['完成周报', '提交方案', '今日复盘', '冲刺目标'],
    ids: [
      { id: 'wk-todo', name: '清单打勾', tags: ['清单', '打卡'], desc: '待办事项逐条打勾，效率与完成感。', cfg: { kind: 'todo-check' } },
      { id: 'wk-calendar', name: '日程弹出', tags: ['日历', '日程'], desc: '日历卡片弹出并显示日期，日程提醒。', cfg: { kind: 'calendar-pop' } },
      { id: 'wk-timer', name: '计时环', tags: ['计时', '倒计时'], desc: '圆环倒计时循环，专注计时场景。', cfg: { kind: 'timer-ring' } },
      { id: 'wk-pomodoro', name: '番茄钟', tags: ['番茄钟', '专注'], desc: '25 分钟专注计时带节拍呼吸。', cfg: { kind: 'pomodoro' } },
      { id: 'wk-kanban', name: '看板移动', tags: ['看板', '流转'], desc: '任务卡在 TODO/DOING/DONE 间流转。', cfg: { kind: 'kanban' } },
      { id: 'wk-mail', name: '邮件发送', tags: ['邮件', '发送'], desc: '信封起飞并展开翼线，发送成功。', cfg: { kind: 'mail-send' } },
      { id: 'wk-bell', name: '提醒铃铛', tags: ['铃铛', '提醒'], desc: '铃铛摇摆并荡出声波，提醒时刻。', cfg: { kind: 'bell-ring' } },
      { id: 'wk-rocket', name: '火箭发射', tags: ['火箭', '发射'], desc: '火箭升空带尾焰，项目启动叙事。', cfg: { kind: 'rocket-launch' } },
      { id: 'wk-trophy', name: '达成奖杯', tags: ['奖杯', '达成'], desc: '奖杯弹出伴随星光环绕，目标达成。', cfg: { kind: 'trophy' } },
      { id: 'wk-target', name: '目标命中', tags: ['靶心', '命中'], desc: '准星收拢命中靶心并爆出射线。', cfg: { kind: 'target-hit' } },
      { id: 'wk-clipboard', name: '剪贴板复制', tags: ['复制', '剪贴板'], desc: '剪贴板卡片弹出，内容已复制。', cfg: { kind: 'clipboard' } },
      { id: 'wk-sync', name: '文件同步', tags: ['同步', '双箭头'], desc: '双向箭头旋转，云同步进行中。', cfg: { kind: 'files-sync' } }
    ]
  });

  MF.forge({
    cat: '弹幕字幕', type: 'block', dur: 6.5, poster: 0.5,
    params: DM_PARAMS, draw: dmDraw,
    texts: ['前方高能,名场面来了,哈哈哈哈,泪目,收藏了', '太强了,学到了,冲冲冲,打卡'],
    ids: [
      { id: 'dm-scroll', name: '滚动弹幕', tags: ['弹幕', '滚动'], desc: '多行弹幕横向滚动，直播与视频氛围。', cfg: { kind: 'danmaku' } },
      { id: 'dm-top', name: '顶部弹幕', tags: ['置顶', '公告'], desc: '置顶弹幕依次弹出，重要提示。', cfg: { kind: 'danmaku-top' } },
      { id: 'dm-subtitle', name: '底部字幕条', tags: ['字幕', '对白'], desc: '半透明字幕条逐句切换，视频对白。', cfg: { kind: 'subtitle', size: 185} },
      { id: 'dm-caption', name: '气泡字幕', tags: ['气泡', '字幕'], desc: '气泡式字幕弹出，脱口秀风格。', cfg: { kind: 'caption-pop', size: 185} },
      { id: 'dm-live', name: '直播间热度', tags: ['直播', '人气'], desc: '人气值与热度条实时跳动。', cfg: { kind: 'live-heat' } },
      { id: 'dm-quiz', name: '答题弹幕', tags: ['答题', '互动'], desc: '选项弹幕滚动，互动答题场景。', cfg: { kind: 'quiz' } },
      { id: 'dm-reply', name: '回复串', tags: ['回复', '楼中楼'], desc: '带缩进符号的回复弹幕滚过。', cfg: { kind: 'reply' } },
      { id: 'dm-watermark', name: '平铺水印', tags: ['水印', '防盗'], desc: '全屏平铺旋转水印，版权保护。', cfg: { kind: 'watermark' } },
      { id: 'dm-ping', name: '坐标标记', tags: ['标记', '标注'], desc: '坐标点脉冲并弹出标注气泡。', cfg: { kind: 'ping' } },
      { id: 'dm-chapter', name: '章节标题', tags: ['章节', '转场'], desc: '大号章节数字压底弹出，视频分段。', cfg: { kind: 'chapter', size: 185} }
    ]
  });

  MF.forge({
    cat: '节日庆典', type: 'block', dur: 6, poster: 0.5,
    params: FEST_PARAMS, draw: festDraw,
    texts: ['HAPPY 2026', '生日快乐', '开工大吉', '周年庆'],
    ids: [
      { id: 'fest-confetti', name: '彩带礼炮', tags: ['彩带', '庆祝'], desc: '彩带从天洒落配大字祝福，庆祝标配。', cfg: { kind: 'confetti' } },
      { id: 'fest-balloon', name: '气球升起', tags: ['气球', '升空'], desc: '彩色气球摇曳升空，派对氛围。', cfg: { kind: 'balloon' } },
      { id: 'fest-firework', name: '烟花绽放', tags: ['烟花', '夜空'], desc: '烟花升空绽放循环，跨年氛围。', cfg: { kind: 'firework', size: 1232} },
      { id: 'fest-gift', name: '礼物开箱', tags: ['礼物', '惊喜'], desc: '礼盒开盖彩球蹦出，惊喜揭晓。', cfg: { kind: 'gift-open' } },
      { id: 'fest-cake', name: '蛋糕蜡烛', tags: ['蛋糕', '生日'], desc: '烛光摇曳的生日蛋糕，生日祝福。', cfg: { kind: 'cake' } },
      { id: 'fest-lantern', name: '灯笼升起', tags: ['灯笼', '新年'], desc: '孔明灯冉冉升起，新年祈愿。', cfg: { kind: 'lantern' } },
      { id: 'fest-bunting', name: '三角彩旗', tags: ['彩旗', '派对'], desc: '彩旗绳随风摆动，派对布置。', cfg: { kind: 'bunting' } },
      { id: 'fest-cheers', name: '碰杯庆祝', tags: ['碰杯', '干杯'], desc: '双杯相碰扬起，团建与庆功。', cfg: { kind: 'cheers' } },
      { id: 'fest-sparkle', name: '星光点缀', tags: ['星光', '闪耀'], desc: '四角星光随机闪烁，梦幻氛围。', cfg: { kind: 'sparkle' } },
      { id: 'fest-count', name: '倒数开场', tags: ['倒数', '开场'], desc: '3-2-1 倒数配彩带，活动开场。', cfg: { kind: 'party-count' } }
    ]
  });
})();

/* ════════ assets/js/effects-21.js ════════ */
/* ==========================================================================
   Jaykou — effects-21 · 高级质感批次
   取经：React Bits（Aurora/Silk/LiquidChrome/StarBorder/ClickSpark…）
        Aceternity UI（Spotlight/BorderBeam/Shimmer）
        Magic UI（Border Beam/Marquee/Meteors）
        Remotion（TikTok 词级字幕 / Audiogram / Code Hike）
   硬约束：draw 完全自包含（只依赖 ctx/t/p/U），可被 toString 序列化导出。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF, P = MF.P, rng = MF.rng, txt = MF.txt, col = MF.col;
  /* 本文件专用的 select 构造：字符串数组自动转为 [值, 标签] 对（渲染层要求该格式） */
  function sel(arr) {
    return { type: 'select', options: arr.map(function (x) { return Array.isArray(x) ? x : [x, x]; }) };
  }

  /* ══════════ A. 质感背景原语（挂 背景循环 → 背景材质） ══════════ */

  function bgPremiumDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var kind = p.kind, A = U.accent, B = U.accent2;

    if (kind === 'aurora') {
      /* 极光绸缎：多条 noise 驱动的柔性丝带 + 屏幕混合 */
      ctx.save();
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      var bands = Math.max(2, Math.round(p.bands));
      for (var b = 0; b < bands; b++) {
        var colA = b % 2 ? B : A;
        var baseY = H * (0.16 + 0.42 * (b + 0.5) / bands);
        var top2 = [], th2 = [];
        for (var x = -40; x <= W + 40; x += 22) {
          var n = U.noise2(x * 0.0021 * p.scale + b * 3.1, tt * 0.32 + b * 1.7);
          var n2 = U.noise2(x * 0.0052 + b * 7, tt * 0.2);
          top2.push(baseY + (n - 0.5) * H * 0.26 + Math.sin(x * 0.004 + tt + b) * 30 * S * (0.4 + n2));
          th2.push(H * (0.14 + 0.22 * n2) * (0.55 + 0.45 * Math.sin(x * 0.0013 + tt * 0.7 + b * 2)));
        }
        /* 丝带体：上缘到下缘的封闭带，沿厚度渐隐 */
        for (var pass2 = 0; pass2 < 2; pass2++) {
          ctx.beginPath();
          for (var i = 0; i < top2.length; i++) {
            var px = -40 + i * 22;
            if (i === 0) ctx.moveTo(px, top2[i]); else ctx.lineTo(px, top2[i]);
          }
          for (var j = top2.length - 1; j >= 0; j--) {
            var px2 = -40 + j * 22;
            ctx.lineTo(px2, top2[j] + th2[j]);
          }
          ctx.closePath();
          var g = ctx.createLinearGradient(0, baseY - H * 0.16, 0, baseY + H * 0.34);
          if (pass2 === 0) {
            g.addColorStop(0, U.rgba(colA, 0.04));
            g.addColorStop(0.35, U.rgba(colA, 0.5));
            g.addColorStop(0.7, U.rgba(colA, 0.16));
            g.addColorStop(1, U.rgba(colA, 0));
          } else {
            g.addColorStop(0, U.rgba(colA, 0.2));
            g.addColorStop(0.5, U.rgba(U.mix(colA, U.ink, 0.4), 0.16));
            g.addColorStop(1, U.rgba(colA, 0));
          }
          ctx.fillStyle = g;
          ctx.fill();
        }
        /* 帘幕光柱：沿丝带向下的垂直细纹（极光标志性结构） */
        for (var rx = 0; rx <= W; rx += 9) {
          var ri = Math.round((rx + 40) / 22);
          if (ri >= top2.length) continue;
          var rTop = top2[ri], rTh = th2[ri];
          var rayA = U.noise(rx * 0.02 * p.scale + b * 5 + tt * 0.5);
          var rayLen = rTh * (1.6 + 2.6 * rayA);
          var rg2 = ctx.createLinearGradient(0, rTop, 0, rTop + rayLen);
          var rc = U.mix(colA, U.ink, 0.15 * rayA);
          rg2.addColorStop(0, U.rgba(rc, 0.20 + 0.3 * rayA));
          rg2.addColorStop(1, U.rgba(rc, 0));
          ctx.fillStyle = rg2;
          ctx.fillRect(rx, rTop, 5.5 * S, rayLen);
        }
        /* 上缘亮脊 */
        ctx.beginPath();
        for (var k = 0; k < top2.length; k++) {
          var px3 = -40 + k * 22;
          if (k === 0) ctx.moveTo(px3, top2[k]); else ctx.lineTo(px3, top2[k]);
        }
        ctx.strokeStyle = U.rgba(U.mix(colA, U.ink, 0.45), 0.4);
        ctx.lineWidth = 2.2 * S;
        ctx.stroke();
      }
      ctx.restore();
      /* 星尘 */
      ctx.save();
      for (var i4 = 0; i4 < 90; i4++) {
        var sx = U.rnd(0, W, i4 * 2), sy = U.rnd(0, H * 0.7, i4 * 2 + 1);
        var tw = 0.3 + 0.7 * Math.abs(Math.sin(tt * 1.4 + i4 * 1.93));
        ctx.fillStyle = U.rgba(U.ink, 0.16 * tw);
        ctx.fillRect(sx, sy, 2 * S, 2 * S);
      }
      ctx.restore();
    }

    else if (kind === 'silk') {
      /* 丝绸流线：一组相位错开的贝塞尔长线，线宽呼吸 */
      var lines = Math.max(6, Math.round(p.bands * 3));
      ctx.save();
      ctx.lineCap = 'round';
      for (var i = 0; i < lines; i++) {
        var f = i / (lines - 1);
        var ph = tt * 0.5 + f * 2.4;
        var yC = H * (0.2 + 0.6 * f) + Math.sin(ph) * H * 0.06;
        ctx.beginPath();
        for (var x = 0; x <= W; x += 24) {
          var n = U.noise2(x * 0.0011 * p.scale + f * 4, tt * 0.3);
          var y = yC + (n - 0.5) * H * 0.3 + Math.sin(x * 0.0022 + ph * 1.7) * 46 * S;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var depth = Math.sin(f * Math.PI);
        ctx.lineWidth = (0.8 + depth * 3.4) * S;
        ctx.strokeStyle = U.rgba(i % 3 === 0 ? A : (i % 3 === 1 ? B : U.mix(A, B, 0.5)), 0.10 + depth * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    }

    else if (kind === 'chrome') {
      /* 液态铬：细网格 noise 等值带 + 金属高光条纹 */
      ctx.save();
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cell = 11 * S;
      var tt2 = tt * 0.28;
      for (var y = 0; y < H + cell; y += cell) {
        for (var x = 0; x < W + cell; x += cell) {
          var n = U.noise2(x * 0.0026 * p.scale + tt2, y * 0.0026 * p.scale + tt2 * 0.45);
          var band = Math.sin(n * Math.PI * 2 * p.bands * 1.6 + tt * 0.8) * 0.5 + 0.5;
          var spec = Math.pow(band, 6);
          var baseC = U.mix(U.bg2, U.ink, 0.12 + band * 0.42);
          var c = U.mix(baseC, U.ink, spec * 0.85);
          if (band > 0.86) c = U.mix(c, A, (band - 0.86) * 4);
          ctx.fillStyle = U.rgba(c, 0.96);
          ctx.fillRect(x, y, cell + 1, cell + 1);
        }
      }
      /* 大面积镜面高光 */
      var hl = ctx.createLinearGradient(0, 0, W * 0.55, H * 0.85);
      hl.addColorStop(0, U.rgba(U.ink, 0.12));
      hl.addColorStop(0.45, U.rgba(U.ink, 0));
      ctx.fillStyle = hl; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    else if (kind === 'iridescent') {
      /* 虹彩膜：HSL 环游的柔雾渐变 */
      ctx.save();
      var g = ctx.createRadialGradient(W * (0.5 + Math.sin(tt * 0.4) * 0.16), H * (0.42 + Math.cos(tt * 0.3) * 0.14), 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      var h1 = (tt * 26) % 360, h2 = (h1 + 120) % 360, h3 = (h1 + 240) % 360;
      g.addColorStop(0, 'hsla(' + h1 + ',78%,60%,.85)');
      g.addColorStop(0.5, 'hsla(' + h2 + ',72%,58%,.6)');
      g.addColorStop(1, 'hsla(' + h3 + ',70%,52%,.85)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      /* 细干涉纹 */
      for (var i = 0; i < 26; i++) {
        var yy = (i / 26 + (tt * 0.03) % 1) * H;
        ctx.fillStyle = 'hsla(' + ((h1 + i * 12) % 360) + ',80%,70%,.05)';
        ctx.fillRect(0, yy, W, 6 * S);
      }
      ctx.restore();
    }

    else if (kind === 'orb') {
      /* 辉光球：大光球呼吸 + 内部流纹 + 环绕尘埃 */
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.3 * (0.94 + 0.06 * Math.sin(tt * 1.1));
      ctx.save();
      var glow = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 2.4);
      glow.addColorStop(0, U.rgba(A, 0.5));
      glow.addColorStop(0.35, U.rgba(B, 0.2));
      glow.addColorStop(1, U.rgba(B, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      var core = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.05, cx, cy, R);
      core.addColorStop(0, U.rgba(U.mix(A, U.ink, 0.55), 0.95));
      core.addColorStop(0.55, U.rgba(A, 0.65));
      core.addColorStop(1, U.rgba(B, 0.85));
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = core; ctx.fill();
      /* 表面流纹 */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      for (var i = 0; i < 9; i++) {
        ctx.beginPath();
        for (var a = 0; a <= 6.4; a += 0.2) {
          var rr2 = R * (0.3 + 0.62 * (i / 9)) + Math.sin(a * 3 + tt * (1 + i * 0.13) + i * 2) * R * 0.06;
          var px = cx + Math.cos(a) * rr2, py = cy + Math.sin(a) * rr2 * 0.9;
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = U.rgba(U.ink, 0.10);
        ctx.lineWidth = 2 * S; ctx.stroke();
      }
      ctx.restore();
      for (var d2 = 0; d2 < 70; d2++) {
        var ang = U.rnd(0, 6.28, d2) + tt * (0.14 + 0.1 * U.rng(d2 * 3));
        var rad = R * (1.15 + U.rnd(0, 1.1, d2 + 99));
        ctx.fillStyle = U.rgba(d2 % 3 ? A : B, 0.35 * (1 - (rad / R - 1.1)));
        ctx.fillRect(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.85, 2.4 * S, 2.4 * S);
      }
      ctx.restore();
    }

    else if (kind === 'grain') {
      /* 胶片颗粒：内容层 + 全屏 noise 颗粒 + 暗角 + 划痕 */
      ctx.save();
      var cx2 = W / 2;
      ctx.fillStyle = U.rgba(U.bg1, 0);
      /* 中央内容：大字 + 细线 */
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.font = U.fs(W * 0.075, 800, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || 'FILM'), cx2, H * 0.46);
      ctx.strokeStyle = U.rgba(A, 0.9); ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.moveTo(W * 0.3, H * 0.58); ctx.lineTo(W * 0.7, H * 0.58); ctx.stroke();
      /* 颗粒 */
      var n = Math.round(2600 * p.density);
      for (var i = 0; i < n; i++) {
        var gx = U.rnd(0, W, i * 3 + Math.floor(tt * 24) * 7919);
        var gy = U.rnd(0, H, i * 3 + 1 + Math.floor(tt * 24) * 7919);
        var a = U.rnd(0, 1, i * 3 + 2 + Math.floor(tt * 24) * 104729);
        ctx.fillStyle = a > 0.5 ? U.rgba(U.ink, 0.08) : U.rgba('#000000', 0.12);
        ctx.fillRect(gx, gy, 1.6 * S, 1.6 * S);
      }
      /* 暗角 */
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.34, W / 2, H / 2, Math.max(W, H) * 0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      /* 随机竖划痕 */
      if (Math.sin(Math.floor(tt * 8) * 91.7) > 0.86) {
        ctx.strokeStyle = U.rgba(U.ink, 0.10); ctx.lineWidth = 1.4 * S;
        var lx = U.rnd(W * 0.1, W * 0.9, Math.floor(tt * 8));
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + 6 * S, H); ctx.stroke();
      }
      ctx.restore();
    }

    else if (kind === 'hyperspeed') {
      /* 星际跃迁：中心辐射星线 + 色差 */
      var cx3 = W / 2, cy3 = H / 2;
      ctx.save();
      ctx.fillStyle = U.rgba(U.bg1, 0.32); ctx.fillRect(0, 0, W, H);
      var stars = 320;
      for (var i = 0; i < stars; i++) {
        var ang = U.rnd(0, 6.283, i * 2), sp = 0.25 + U.rnd(0, 1, i * 2 + 1);
        var z = (sp + tt * 0.55 * Math.max(0.2, p.speed)) % 1;
        var r1 = Math.pow(z, 2.6) * Math.max(W, H) * 0.85;
        var r2 = Math.pow(Math.min(1, z + 0.02 + sp * 0.012), 2.6) * Math.max(W, H) * 0.85;
        var ca = Math.cos(ang), sa = Math.sin(ang);
        var colr = i % 11 === 0 ? B : (i % 17 === 0 ? A : U.ink);
        ctx.strokeStyle = U.rgba(colr, Math.min(1, z * 1.6));
        ctx.lineWidth = Math.max(0.6, z * 2.6) * S;
        ctx.beginPath();
        ctx.moveTo(cx3 + ca * r1, cy3 + sa * r1);
        ctx.lineTo(cx3 + ca * r2, cy3 + sa * r2);
        ctx.stroke();
      }
      var cg = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, 160 * S);
      cg.addColorStop(0, U.rgba(U.ink, 0.9)); cg.addColorStop(0.3, U.rgba(A, 0.35)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    else if (kind === 'galaxy') {
      /* 星系漩涡：对数螺旋臂 + 核心辉光 + 旋转向 */
      var cx4 = W / 2, cy4 = H / 2;
      ctx.save();
      ctx.fillStyle = U.rgba(U.bg1, 0.4); ctx.fillRect(0, 0, W, H);
      var arms = Math.max(2, Math.round(p.bands));
      for (var a2 = 0; a2 < 900; a2++) {
        var arm = a2 % arms;
        var f = U.rng(a2);
        var ang = f * 5.2 + tt * 0.16 * (1.3 - f * 0.5) + arm * (6.283 / arms);
        var rad = Math.pow(f, 1.6) * Math.min(W, H) * 0.46;
        var scat = (U.noise2(f * 9 + arm, tt * 0.2) - 0.5) * 0.55;
        var px = cx4 + Math.cos(ang + scat) * rad, py = cy4 + Math.sin(ang + scat) * rad * 0.62;
        var cc = f < 0.22 ? U.mix(A, U.ink, 0.5) : (arm % 2 ? A : B);
        ctx.fillStyle = U.rgba(cc, 0.5 * (1 - f * 0.55) + 0.1);
        var sz = (1.6 + (1 - f) * 2.4) * S;
        ctx.fillRect(px, py, sz, sz);
      }
      var gc = ctx.createRadialGradient(cx4, cy4, 0, cx4, cy4, 190 * S);
      gc.addColorStop(0, U.rgba(U.mix(A, U.ink, 0.6), 0.85));
      gc.addColorStop(0.4, U.rgba(A, 0.28));
      gc.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gc; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    else if (kind === 'mesh') {
      /* 柔雾渐变网格：几个漂移的大色球互相融合 */
      ctx.save();
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      var blobs = Math.max(3, Math.round(p.bands + 2));
      for (var i = 0; i < blobs; i++) {
        var ph = tt * 0.22 + i * 2.3;
        var bx = W * (0.5 + Math.sin(ph * 0.9 + i) * 0.34 * U.noise(i * 5));
        var by = H * (0.5 + Math.cos(ph * 0.7 + i * 1.7) * 0.3);
        var br = Math.min(W, H) * (0.3 + 0.12 * Math.sin(ph * 1.3));
        var cc = [A, B, U.mix(A, B, 0.5), U.mix(B, U.ink, 0.3)][i % 4];
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, U.rgba(cc, 0.34));
        g.addColorStop(1, U.rgba(cc, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    else { /* spotlight */
      /* 聚光扫场：柔和光锥缓扫 + 尘埃漂浮，主体剪影 */
      ctx.save();
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var sw = Math.sin(tt * 0.4) * W * 0.22;
      var sx = W / 2 + sw;
      var cone = ctx.createLinearGradient(sx, -H * 0.1, sx, H);
      cone.addColorStop(0, U.rgba(U.mix(A, U.ink, 0.35), 0.5));
      cone.addColorStop(0.7, U.rgba(A, 0.12));
      cone.addColorStop(1, U.rgba(A, 0));
      ctx.beginPath();
      ctx.moveTo(sx - 30 * S, -10);
      ctx.lineTo(sx - W * 0.24, H);
      ctx.lineTo(sx + W * 0.24, H);
      ctx.lineTo(sx + 30 * S, -10);
      ctx.closePath();
      ctx.fillStyle = cone; ctx.fill();
      for (var i = 0; i < 110; i++) {
        var dx = U.rnd(W * 0.22, W * 0.78, i) + Math.sin(tt * 0.6 + i) * 18 * S;
        var dy = (U.rnd(0, 1, i + 500) + tt * 0.03 * (0.5 + U.rng(i * 7))) % 1 * H;
        ctx.fillStyle = U.rgba(U.ink, 0.06 + 0.12 * U.rng(i * 3));
        ctx.beginPath(); ctx.arc(dx, dy, (0.8 + U.rng(i) * 2) * S, 0, 7); ctx.fill();
      }
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.font = U.fs(W * 0.05, 800, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || 'SPOTLIGHT'), W / 2, H * 0.62);
      ctx.restore();
    }
  }

  /* ══════════ B. 高级微质感原语（挂 界面组件 → 界面交互） ══════════ */

  function accentFxDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var kind = p.kind, A = U.accent, B = U.accent2;
    var cyc = tt % 1;
    /* 通用卡片几何 */
    var cw = W * 0.5, ch = H * 0.5, cx = W / 2, cy = H / 2;
    var x0 = cx - cw / 2, y0 = cy - ch / 2, r = 26 * S;

    if (kind === 'borderbeam') {
      /* 边框光束：一枚光点沿圆角矩形轨迹奔跑，带长尾 */
      ctx.save();
      /* 卡片底 */
      U.rr(ctx, x0, y0, cw, ch, r); ctx.fillStyle = U.rgba(U.bg2, 0.85); ctx.fill();
      U.rr(ctx, x0, y0, cw, ch, r); ctx.strokeStyle = U.rgba(U.ink, 0.10); ctx.lineWidth = 2 * S; ctx.stroke();
      /* 中缝内容 */
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.font = U.fs(W * 0.038, 700, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || 'BORDER BEAM'), cx, cy);
      /* 轨迹参数化：周长参数 s∈[0,1) */
      var per = 2 * (cw + ch) - 8 * r + 6.283 * r;
      function ptAt(s) {
        s = ((s % 1) + 1) % 1; var d = s * per;
        var side = cw - 2 * r, sideH = ch - 2 * r;
        if (d < side) return [x0 + r + d, y0];
        d -= side;
        if (d < 1.5708 * r) { var a = d / r; return [x0 + cw - r + Math.sin(a) * r, y0 + r - Math.cos(a) * r]; }
        d -= 1.5708 * r;
        if (d < sideH) return [x0 + cw, y0 + r + d];
        d -= sideH;
        if (d < 1.5708 * r) { var a2 = d / r; return [x0 + cw - r + Math.cos(a2) * r, y0 + ch - r + Math.sin(a2) * r]; }
        d -= 1.5708 * r;
        if (d < side) return [x0 + cw - r - d, y0 + ch];
        d -= side;
        if (d < 1.5708 * r) { var a3 = d / r; return [x0 + r - Math.sin(a3) * r, y0 + ch - r + Math.cos(a3) * r]; }
        d -= 1.5708 * r;
        if (d < sideH) return [x0, y0 + ch - r - d];
        d -= sideH;
        var a4 = d / r; return [x0 + r - Math.cos(a4) * r, y0 + r - Math.sin(a4) * r];
      }
      /* 尾迹（密集采样成连续彗尾） */
      var tail = 0.2;
      for (var s2 = 0; s2 < 70; s2++) {
        var f2 = s2 / 70;
        var pp = ptAt(cyc - f2 * tail);
        ctx.beginPath(); ctx.arc(pp[0], pp[1], (5.5 - f2 * 4.6) * S, 0, 7);
        ctx.fillStyle = U.rgba(s2 < 6 ? U.mix(A, U.ink, 0.4) : A, (1 - f2) * 0.9);
        ctx.fill();
      }
      var head = ptAt(cyc);
      ctx.save(); ctx.shadowColor = U.rgba(A, 0.9); ctx.shadowBlur = 24 * S;
      ctx.beginPath(); ctx.arc(head[0], head[1], 6 * S, 0, 7);
      ctx.fillStyle = U.rgba(U.ink, 0.95); ctx.fill(); ctx.restore();
      ctx.restore();
    }

    else if (kind === 'starborder') {
      /* 星光描边：边框上下两道反向流动的星芒 */
      ctx.save();
      U.rr(ctx, x0, y0, cw, ch, r); ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      U.rr(ctx, x0, y0, cw, ch, r); ctx.strokeStyle = U.rgba(U.ink, 0.08); ctx.lineWidth = 2 * S; ctx.stroke();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.font = U.fs(W * 0.038, 700, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || 'STAR BORDER'), cx, cy);
      function starRow(fy, dir, colr) {
        for (var i = 0; i < 16; i++) {
          var fx = ((i / 16 + dir * cyc * 0.5) % 1 + 1) % 1;
          var px = x0 + fx * cw, py = y0 + fy * ch;
          var tw = 0.4 + 0.6 * Math.abs(Math.sin(tt * 3 + i * 1.7));
          ctx.save();
          ctx.translate(px, py); ctx.rotate(tt * dir + i);
          ctx.strokeStyle = U.rgba(colr, 0.85 * tw);
          ctx.lineWidth = 1.4 * S;
          var L = (5 + 3 * tw) * S;
          ctx.beginPath();
          ctx.moveTo(-L, 0); ctx.lineTo(L, 0); ctx.moveTo(0, -L); ctx.lineTo(0, L);
          ctx.stroke();
          ctx.restore();
        }
      }
      starRow(0, 1, A); starRow(1, -1, B);
      /* 左右竖排稀疏点缀 */
      for (var v = 0; v < 8; v++) {
        var fv = ((v / 8 + cyc * 0.4) % 1 + 1) % 1;
        ctx.fillStyle = U.rgba(v % 2 ? A : B, 0.5);
        ctx.beginPath(); ctx.arc(x0 + (v % 2 ? 0 : cw), y0 + fv * ch, 2.2 * S, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    else if (kind === 'electric') {
      /* 电弧描边：边框随机位置迸发电火花折线 */
      ctx.save();
      U.rr(ctx, x0, y0, cw, ch, r); ctx.fillStyle = U.rgba(U.bg2, 0.88); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.font = U.fs(W * 0.038, 700, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || 'HIGH VOLTAGE'), cx, cy);
      U.rr(ctx, x0, y0, cw, ch, r); ctx.strokeStyle = U.rgba(U.mix(A, U.ink, 0.2), 0.35); ctx.lineWidth = 2.4 * S; ctx.stroke();
      /* 电弧：每 0.5s 在随机边生成一段抖动折线 */
      var seedF = Math.floor(tt * 2);
      var edge = Math.floor(U.rng(seedF) * 4);
      var f01 = U.rng(seedF * 3 + 1);
      var sx2, sy2, ex2, ey2;
      if (edge === 0) { sx2 = x0 + f01 * cw; sy2 = y0; ex2 = sx2 + cw * 0.28; ey2 = y0; }
      else if (edge === 1) { sx2 = x0 + cw; sy2 = y0 + f01 * ch; ex2 = sx2; ey2 = sy2 + ch * 0.3; }
      else if (edge === 2) { sx2 = x0 + f01 * cw; sy2 = y0 + ch; ex2 = sx2 - cw * 0.26; ey2 = y0 + ch; }
      else { sx2 = x0; sy2 = y0 + f01 * ch; ex2 = sx2; ey2 = sy2 - ch * 0.28; }
      var steps = 12;
      ctx.save();
      ctx.shadowColor = U.rgba(A, 0.9); ctx.shadowBlur = 16 * S;
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath(); ctx.moveTo(sx2, sy2);
        for (var i2 = 1; i2 <= steps; i2++) {
          var f3 = i2 / steps;
          var jx = (U.noise(f3 * 5 + seedF * 13) - 0.5) * (edge % 2 ? 34 : 8) * S;
          var jy = (U.noise(f3 * 5 + seedF * 29 + 7) - 0.5) * (edge % 2 ? 8 : 34) * S;
          ctx.lineTo(sx2 + (ex2 - sx2) * f3 + jx, sy2 + (ey2 - sy2) * f3 + jy);
        }
        ctx.strokeStyle = pass === 0 ? U.rgba(U.mix(A, U.ink, 0.5), 0.95) : U.rgba(A, 0.7);
        ctx.lineWidth = (pass === 0 ? 2.6 : 5.5) * S;
        ctx.lineJoin = 'round'; ctx.stroke();
      }
      ctx.restore();
      /* 辉光充能条 */
      var chg = (tt * 0.7) % 1;
      U.rr(ctx, x0 + 24 * S, y0 + ch - 26 * S, (cw - 48 * S) * chg, 5 * S, 3 * S);
      ctx.fillStyle = U.rgba(A, 0.8); ctx.fill();
      ctx.restore();
    }

    else if (kind === 'glare') {
      /* 玻璃眩光卡：光带周期性扫过磨砂卡片，边缘受光 */
      ctx.save();
      U.rr(ctx, x0, y0, cw, ch, r);
      var base = ctx.createLinearGradient(x0, y0, x0, y0 + ch);
      base.addColorStop(0, U.rgba(U.bg2, 0.95)); base.addColorStop(1, U.rgba(U.bg1, 0.95));
      ctx.fillStyle = base; ctx.fill();
      /* 内容骨架 */
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.font = U.fs(W * 0.032, 700, false); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(p.text || 'GLARE CARD'), x0 + 34 * S, y0 + 64 * S);
      for (var li = 0; li < 3; li++) {
        ctx.fillStyle = U.rgba(U.ink, 0.16);
        U.rr(ctx, x0 + 34 * S, y0 + ch - 120 * S + li * 30 * S, cw * (0.72 - li * 0.16), 12 * S, 6 * S);
        ctx.fill();
      }
      /* 掠过的斜向光带（clip 在卡片内） */
      U.rr(ctx, x0, y0, cw, ch, r); ctx.clip();
      var gx = x0 + ((cyc * 1.6) % 1.6 - 0.3) * cw * 1.5;
      var gl = ctx.createLinearGradient(gx - 120 * S, y0, gx + 120 * S, y0 + ch);
      gl.addColorStop(0, U.rgba(U.ink, 0));
      gl.addColorStop(0.5, U.rgba(U.mix(A, U.ink, 0.5), 0.22));
      gl.addColorStop(1, U.rgba(U.ink, 0));
      ctx.fillStyle = gl;
      ctx.save(); ctx.translate(gx, cy); ctx.rotate(-0.5); ctx.translate(-gx, -cy);
      ctx.fillRect(gx - 140 * S, y0 - 40 * S, 280 * S, ch + 80 * S);
      ctx.restore();
      ctx.restore();
      /* 边缘受光 */
      U.rr(ctx, x0, y0, cw, ch, r);
      ctx.strokeStyle = U.rgba(U.mix(A, U.ink, 0.35), 0.4 + 0.3 * Math.sin(cyc * 6.283));
      ctx.lineWidth = 1.6 * S; ctx.stroke();
      ctx.restore();
    }

    else if (kind === 'clickspark') {
      /* 点击火花：节奏性在随机点迸发放射火花，快出慢收 */
      ctx.save();
      U.rr(ctx, x0, y0, cw, ch, r); ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.font = U.fs(W * 0.036, 700, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.text || 'CLICK'), cx, cy);
      var hits = 3;
      for (var h2 = 0; h2 < hits; h2++) {
        var local = (tt * 0.8 + h2 / hits) % 1;
        var hx = x0 + U.rnd(0.18, 0.82, h2 * 7 + Math.floor((tt * 0.8 + h2 / hits))) * cw;
        var hy = y0 + U.rnd(0.2, 0.8, h2 * 7 + 3 + Math.floor((tt * 0.8 + h2 / hits))) * ch;
        var life = local < 0.12 ? local / 0.12 : Math.max(0, 1 - (local - 0.12) / 0.5);
        var n = 14;
        for (var i3 = 0; i3 < n; i3++) {
          var ang3 = (i3 / n) * 6.283 + h2;
          var dist = e.outCubic(local) * 90 * S * (0.6 + U.rng(h2 * 31 + i3) * 0.7);
          ctx.strokeStyle = U.rgba(i3 % 3 ? A : U.mix(A, U.ink, 0.4), life * 0.95);
          ctx.lineWidth = 2.4 * S * life;
          ctx.beginPath();
          ctx.moveTo(hx + Math.cos(ang3) * dist * 0.55, hy + Math.sin(ang3) * dist * 0.55);
          ctx.lineTo(hx + Math.cos(ang3) * dist, hy + Math.sin(ang3) * dist);
          ctx.stroke();
        }
        ctx.fillStyle = U.rgba(U.mix(A, U.ink, 0.5), life);
        ctx.beginPath(); ctx.arc(hx, hy, 4 * S * life, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    else { /* pixelflip */
      /* 像素翻牌：网格方块依次翻转露出新画面 */
      ctx.save();
      var cols = Math.max(6, Math.round(p.density * 10)), rows = Math.round(cols * 9 / 16);
      var gw = cw, gh = ch, cwd = gw / cols, hgt = gh / rows;
      /* 底层画面 B */
      U.rr(ctx, x0, y0, cw, ch, r); ctx.fillStyle = U.rgba(U.mix(B, U.bg1, 0.35), 0.96); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.font = U.fs(W * 0.05, 800, false);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('B', cx, cy);
      /* 翻转的 A 方块 */
      for (var ry = 0; ry < rows; ry++) {
        for (var rx = 0; rx < cols; rx++) {
          var dly = (rx + ry) / (cols + rows) * 0.45;
          var k = e.inOutCubic(U.clamp((cyc - dly) / 0.55, 0, 1));
          if (k >= 1) continue;
          var sc = Math.abs(Math.cos(k * Math.PI));
          ctx.save();
          ctx.translate(x0 + rx * cwd + cwd / 2, y0 + ry * hgt + hgt / 2);
          ctx.scale(sc, 1);
          ctx.fillStyle = U.rgba(U.mix(A, U.bg2, 0.25), 0.97);
          ctx.fillRect(-cwd / 2 + 0.6 * S, -hgt / 2 + 0.6 * S, cwd - 1.2 * S, hgt - 1.2 * S);
          ctx.restore();
        }
      }
      ctx.strokeStyle = U.rgba(U.ink, 0.1); ctx.lineWidth = 2 * S;
      U.rr(ctx, x0, y0, cw, ch, r); ctx.stroke();
      ctx.restore();
    }
  }

  /* ══════════ C. 高级文字原语（挂 文字特效 → 文字排版） ══════════ */

  function textPremiumDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var kind = p.kind, A = U.accent, B = U.accent2;
    var label = String(p.text || '');
    var size = p.size * S;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (kind === 'shimmer') {
      /* 微光扫过标题：灰底字 + clip 内亮色扫带 */
      var cx = W / 2, cy = H / 2;
      ctx.font = U.fs(size, 800, false);
      ctx.fillStyle = U.rgba(U.ink, 0.28);
      ctx.fillText(label, cx, cy);
      var sx = W / 2 + ((tt * 0.5) % 1.7 - 0.35) * W * 0.9;
      ctx.save();
      ctx.beginPath();
      var w2 = ctx.measureText(label).width;
      ctx.rect(cx - w2 / 2 - 10, cy - size, w2 + 20, size * 2.4);
      ctx.clip();
      var g = ctx.createLinearGradient(sx - 220 * S, cy, sx + 220 * S, cy);
      g.addColorStop(0, U.rgba(U.ink, 0.28));
      g.addColorStop(0.45, U.rgba(U.mix(A, U.ink, 0.65), 0.95));
      g.addColorStop(0.55, U.rgba(U.ink, 0.95));
      g.addColorStop(1, U.rgba(U.ink, 0.28));
      ctx.fillStyle = g;
      ctx.fillText(label, cx, cy);
      ctx.restore();
    }

    else if (kind === 'wordcaption') {
      /* 词级字幕（Remotion TikTok 式）：当前词放大高亮 + 底部进度 */
      var words = label.split(/\s+/).filter(Boolean);
      if (!words.length) words = ['WORD', 'BY', 'WORD'];
      var segDur = 0.42, idx = Math.floor(tt / segDur) % words.length;
      var line = words.slice(Math.max(0, idx - 3), idx + 1);
      ctx.font = U.fs(size * 0.62, 800, false);
      /* 已说出的词整行 */
      var widths = line.map(function (w2) { return ctx.measureText(w2).width; });
      var gap = size * 0.32, total = widths.reduce(function (a, b2) { return a + b2; }, 0) + gap * (line.length - 1);
      var x = W / 2 - total / 2, cy = H * 0.68;
      ctx.textAlign = 'left';
      for (var i = 0; i < line.length; i++) {
        var isCur = i === line.length - 1;
        var pop = isCur ? 1 + 0.12 * Math.max(0, 1 - ((tt % segDur) / segDur) * 2.2) : 1;
        ctx.save();
        ctx.translate(x + widths[i] / 2, cy);
        ctx.scale(pop, pop);
        ctx.fillStyle = isCur ? U.rgba(A, 0.98) : U.rgba(U.ink, 0.9);
        ctx.fillText(line[i], -widths[i] / 2, 0);
        ctx.restore();
        x += widths[i] + gap;
      }
      /* 上一句淡影 */
      ctx.textAlign = 'center';
      ctx.font = U.fs(size * 0.4, 600, false);
      ctx.fillStyle = U.rgba(U.ink, 0.3);
      var prev = words[(idx + words.length - 1) % words.length];
      ctx.fillText('… ' + prev, W / 2, H * 0.5);
      /* 底部词进度点 */
      for (var d2 = 0; d2 < words.length; d2++) {
        ctx.fillStyle = U.rgba(d2 === idx ? A : U.ink, d2 === idx ? 0.95 : 0.22);
        ctx.beginPath(); ctx.arc(W / 2 + (d2 - (words.length - 1) / 2) * 26 * S, H * 0.8, 4 * S, 0, 7); ctx.fill();
      }
    }

    else if (kind === 'blurtext') {
      /* 逐词显影：词从模糊+位移中凝聚（BlurText） */
      var words2 = label.split(/\s+/).filter(Boolean);
      if (!words2.length) words2 = ['FOCUS', 'MATTERS'];
      var cy2 = H / 2;
      ctx.font = U.fs(size, 800, false);
      var widths2 = words2.map(function (w2) { return ctx.measureText(w2).width; });
      var gap2 = size * 0.3;
      var total2 = widths2.reduce(function (a, b2) { return a + b2; }, 0) + gap2 * (words2.length - 1);
      var x2 = W / 2 - total2 / 2;
      ctx.textAlign = 'left';
      for (var i2 = 0; i2 < words2.length; i2++) {
        var local = U.clamp((tt - 0.25 - i2 * 0.28) / 0.8, 0, 1);
        if (local > 0 && local < 1) {
          var blurPx = (1 - e.outCubic(local)) * 18;
          ctx.save();
          ctx.filter = 'blur(' + blurPx.toFixed(1) + 'px)';
          ctx.globalAlpha = 0.25 + 0.75 * local;
          ctx.fillStyle = i2 % 2 ? U.rgba(B, 0.95) : U.rgba(U.ink, 0.96);
          ctx.fillText(words2[i2], x2, cy2 - (1 - local) * 30 * S);
          ctx.restore();
        } else if (local >= 1) {
          ctx.fillStyle = i2 % 2 ? U.rgba(B, 0.95) : U.rgba(U.ink, 0.96);
          ctx.fillText(words2[i2], x2, cy2);
        }
        x2 += widths2[i2] + gap2;
      }
    }

    else if (kind === 'codereveal') {
      /* 代码逐行高亮（Code Hike 式）：行滑入 + 当前行左侧光标 + 语法配色 */
      var lines = String(p.text || '').split('\n');
      if (!lines.length || lines[0] === '') lines = ['const x = 42;', 'return x * 2;'];
      var fs2 = size * 0.34;
      ctx.font = U.fs(fs2, 500, true);
      ctx.textAlign = 'left';
      var lh = fs2 * 1.9, x0 = W * 0.3, y0 = H / 2 - (lines.length - 1) * lh / 2;
      var cur = Math.floor(tt * 1.4) % lines.length;
      var kw = /^(const|let|var|function|return|if|for|import|from|export|await|new|class)$/;
      for (var li = 0; li < lines.length; li++) {
        var appear = e.outCubic(U.clamp((tt - 0.2 - li * 0.3) / 0.6, 0, 1));
        if (appear <= 0) continue;
        var isCur = li === cur;
        if (isCur) {
          ctx.fillStyle = U.rgba(A, 0.10);
          ctx.fillRect(x0 - 16 * S, y0 + li * lh - lh * 0.62, W * 0.44, lh);
          ctx.fillStyle = U.rgba(A, 0.9);
          ctx.fillRect(x0 - 26 * S, y0 + li * lh - lh * 0.58, 3.4 * S, lh * 0.92);
        }
        ctx.globalAlpha = 0.25 + 0.75 * appear;
        var ln = lines[li];
        /* 简易分词着色 */
        var toks = ln.match(/("[^"]*"|'[^']*'|\s+|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|.)/g) || [ln];
        var tx2 = x0 + (1 - appear) * 26 * S;
        for (var ti = 0; ti < toks.length; ti++) {
          var tk = toks[ti], c;
          if (/^\/\//.test(tk)) c = U.rgba(U.ink, 0.35);
          else if (/^["']/.test(tk)) c = U.rgba(U.mix(B, U.ink, 0.3), 0.95);
          else if (kw.test(tk)) c = U.rgba(A, 0.95);
          else if (/^\d/.test(tk)) c = U.rgba(U.mix(B, U.ink, 0.55), 0.95);
          else c = U.rgba(U.ink, 0.85);
          ctx.fillStyle = c;
          ctx.fillText(tk, tx2, y0 + li * lh);
          tx2 += ctx.measureText(tk).width;
        }
        ctx.globalAlpha = 1;
      }
    }

    else { /* kineticquote */
      /* 引用大字报：三行大字逐行重击入场 + 引号装饰 */
      var rows = String(p.text || '').split('\n');
      if (rows.length < 2) rows = [label || 'STAY', 'HUNGRY', 'FOOLISH'];
      var fs3 = size * 0.6;
      ctx.font = U.fs(fs3, 900, false);
      var lh3 = fs3 * 1.12, y0 = H / 2 - (rows.length - 1) * lh3 / 2;
      for (var ri = 0; ri < rows.length; ri++) {
        var k = U.clamp((tt - ri * 0.34) / 0.5, 0, 1);
        var punch = e.outBack(k);
        ctx.save();
        ctx.translate(W / 2, y0 + ri * lh3);
        var sk = (1 - punch) * (ri % 2 ? -0.5 : 0.5);
        ctx.transform(1, 0, sk, 1, 0, 0);
        ctx.scale(0.7 + 0.3 * punch, 0.7 + 0.3 * punch);
        ctx.globalAlpha = U.clamp(k * 1.6, 0, 1);
        ctx.fillStyle = ri === 1 ? U.rgba(A, 0.98) : U.rgba(U.ink, 0.96);
        ctx.fillText(rows[ri], 0, 0);
        ctx.restore();
      }
      /* 装饰引号 */
      var qk = e.outCubic(U.clamp((tt - 0.1) / 0.7, 0, 1));
      ctx.font = U.fs(size * 1.3, 900, false);
      ctx.fillStyle = U.rgba(B, 0.5 * qk);
      ctx.fillText('“', W * 0.16, H * 0.24 - (1 - qk) * 40 * S);
      ctx.fillText('”', W * 0.84, H * 0.8 + (1 - qk) * 40 * S);
    }
  }

  /* ══════════ D. 播客波形（挂 音乐律动） ══════════ */

  function audiogramDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var A = U.accent, B = U.accent2;
    var n = Math.max(24, Math.round(p.density * 90));
    var bw = (W * 0.72) / n, cy = H * 0.52;
    /* 中央标题 */
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = U.fs(W * 0.032, 700, false);
    ctx.fillStyle = U.rgba(U.ink, 0.85);
    ctx.fillText(String(p.text || 'EP.12 — ON AIR'), W / 2, H * 0.24);
    /* 波形：左右镜像，noise 驱动包络，当前播放头左侧高亮 */
    var playHead = (tt * 0.12) % 1;
    for (var i = 0; i < n; i++) {
      var f = i / (n - 1);
      var env = (0.3 + 0.7 * U.noise(f * 6.1, 3)) * (0.55 + 0.45 * Math.sin(f * Math.PI));
      var wob = 0.75 + 0.25 * Math.sin(tt * 6 + f * 24);
      var bh = Math.max(4 * S, H * 0.3 * env * wob);
      var x = W * 0.14 + f * W * 0.72;
      var played = f < playHead;
      var g = ctx.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
      if (played) { g.addColorStop(0, U.rgba(A, 0.95)); g.addColorStop(1, U.rgba(U.mix(A, B, 0.6), 0.75)); }
      else { g.addColorStop(0, U.rgba(U.ink, 0.28)); g.addColorStop(1, U.rgba(U.ink, 0.16)); }
      ctx.fillStyle = g;
      U.rr(ctx, x, cy - bh / 2, bw * 0.55, bh, bw * 0.3);
      ctx.fill();
    }
    /* 播放头 */
    var hx = W * 0.14 + playHead * W * 0.72;
    ctx.fillStyle = U.rgba(U.ink, 0.9);
    U.rr(ctx, hx - 2 * S, cy - H * 0.2, 4 * S, H * 0.4, 2 * S); ctx.fill();
    ctx.beginPath(); ctx.arc(hx, cy - H * 0.2 - 14 * S, 7 * S, 0, 7); ctx.fillStyle = U.rgba(A, 0.95); ctx.fill();
    /* 时间码 */
    ctx.font = U.fs(W * 0.018, 600, true);
    ctx.fillStyle = U.rgba(U.ink, 0.5);
    var sec = Math.floor(t);
    ctx.fillText(('0:0' + Math.min(9, sec)).slice(-3) + ' / 0:30', W * 0.14 + W * 0.36, cy + H * 0.26);
    /* LIVE 徽标 */
    var blink = 0.5 + 0.5 * Math.sin(tt * 5);
    ctx.beginPath(); ctx.arc(W * 0.16, H * 0.24, 8 * S, 0, 7);
    ctx.fillStyle = U.rgba('#FF3B30', 0.5 + 0.5 * blink); ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = U.rgba(U.ink, 0.6);
    ctx.fillText('LIVE', W * 0.16 + 18 * S, H * 0.24);
  }

  /* ══════════ E. 3D 缎带 / 丝带流（挂 形变转换 → 转场运镜） ══════════ */

  function ribbon3dDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var A = U.accent, B = U.accent2;
    var strands = Math.max(3, Math.round(p.bands));
    var cx = W / 2, cy = H / 2;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (var s2 = 0; s2 < strands; s2++) {
      var f = s2 / (strands - 1);
      var phase = tt * 0.9 + f * 2.2;
      var colr = s2 % 2 ? A : B;
      /* 正弦带：上下双边缘构成缎带面 */
      var top = [], bot = [];
      for (var x = 0; x <= W; x += 20) {
        var f01 = x / W;
        var depth = 0.5 + 0.5 * Math.sin(f01 * 4.2 + phase);
        var yy = cy + Math.sin(f01 * 3.4 * p.scale + phase * 1.6) * H * 0.2 + (f - 0.5) * H * 0.16;
        var hh = H * 0.05 * (0.4 + depth * 0.8);
        top.push([x, yy - hh, depth]);
        bot.push([x, yy + hh, depth]);
      }
      /* 填充缎带面（分段明暗模拟光照） */
      for (var i = 0; i < top.length - 1; i++) {
        var shade = top[i][2];
        ctx.beginPath();
        ctx.moveTo(top[i][0], top[i][1]);
        ctx.lineTo(top[i + 1][0], top[i + 1][1]);
        ctx.lineTo(bot[i + 1][0], bot[i + 1][1]);
        ctx.lineTo(bot[i][0], bot[i][1]);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(colr, shade > 0.5 ? U.mix(colr, U.ink, 0.35) : U.mix(colr, '#000000', 0.45), Math.abs(shade - 0.5) * 2 * 0.6), 0.88);
        ctx.fill();
      }
      /* 高光脊线 */
      ctx.beginPath();
      for (var j = 0; j < top.length; j++) {
        if (j === 0) ctx.moveTo(top[j][0], top[j][1]); else ctx.lineTo(top[j][0], top[j][1]);
      }
      ctx.strokeStyle = U.rgba(U.mix(colr, U.ink, 0.5), 0.5);
      ctx.lineWidth = 1.6 * S;
      ctx.stroke();
    }
    /* 前景漂浮微粒 */
    for (var d2 = 0; d2 < 40; d2++) {
      var px = (U.rnd(0, 1, d2) + tt * 0.02 * (0.4 + U.rng(d2 * 5))) % 1 * W;
      var py = (U.rnd(0, 1, d2 + 77) + tt * 0.013) % 1 * H;
      ctx.fillStyle = U.rgba(U.ink, 0.12);
      ctx.beginPath(); ctx.arc(px, py, 1.8 * S, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  /* ══════════════════ 注册 ══════════════════ */

  /* A. 质感背景 · 10 */
  MF.forge({
    cat: '背景循环', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'aurora', sel(['aurora', 'silk', 'chrome', 'iridescent', 'orb', 'grain', 'hyperspeed', 'galaxy', 'mesh', 'spotlight'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('bands', '层次数', 4, rng(4, 1, 8, 1)),
      P('scale', '湍流尺度', 1, rng(1, 0.3, 2.5, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('text', '文本', 'JAYKOU', txt())
    ],
    draw: bgPremiumDraw,
    ids: [
      { id: 'px-aurora', name: '极光绸缎', desc: '多条柔性色带在暗夜里缓慢流动，噪声驱动的真实极光形态，星尘点缀', tags: ['Aurora', '氛围', '背景'], cfg: { kind: 'aurora' } },
      { id: 'px-silk', name: '丝绸流线', desc: '数十条相位错开的发光长线如绸缎般起伏，线宽呼吸明暗交替', tags: ['Silk', '流线', '背景'], cfg: { kind: 'silk' } },
      { id: 'px-chrome', name: '液态铬', desc: '金属光泽的等值带缓慢翻涌，高光条纹扫过，如熔化的液态铬', tags: ['LiquidChrome', '金属', '背景'], cfg: { kind: 'chrome' } },
      { id: 'px-iridescent', name: '虹彩薄膜', desc: 'HSL 环游的虹彩渐变缓慢流转，细干涉纹如肥皂泡薄膜', tags: ['Iridescence', '渐变', '背景'], cfg: { kind: 'iridescent' } },
      { id: 'px-orb', name: '辉光星球', desc: '巨大光球呼吸明灭，表面流纹旋转，环绕尘埃微粒缓缓公转', tags: ['Orb', '光晕', '背景'], cfg: { kind: 'orb' } },
      { id: 'px-film-grain', name: '胶片颗粒', desc: '胶片噪点 + 暗角 + 随机竖划痕，文艺片级的复古颗粒质感', tags: ['Grain', '胶片', '质感'], cfg: { kind: 'grain', text: 'FILM' } },
      { id: 'px-hyperspeed', name: '星际跃迁', desc: '星点向屏幕外加速飞掠，中心辉光引领，超空间跳跃既视感', tags: ['Hyperspeed', '穿梭', '背景'], cfg: { kind: 'hyperspeed' } },
      { id: 'px-galaxy', name: '星系漩涡', desc: '对数螺旋臂绕核心缓缓旋转，核球辉光，数千星点确定性散布', tags: ['Galaxy', '漩涡', '背景'], cfg: { kind: 'galaxy' } },
      { id: 'px-mesh', name: '柔雾渐变场', desc: '多个大色球互相融合漂移，屏幕混合出通透的柔雾渐变', tags: ['Mesh', '渐变', '背景'], cfg: { kind: 'mesh' } },
      { id: 'px-spotlight', name: '聚光扫场', desc: '柔和光锥左右缓扫，尘埃在光柱中漂浮，主体剪影登场', tags: ['Spotlight', '舞台', '背景'], cfg: { kind: 'spotlight', text: 'SPOTLIGHT' } }
    ]
  });

  /* B. 高级微质感 · 6 */
  MF.forge({
    cat: '界面组件', type: 'component', dur: 6, poster: 0.5,
    params: [
      P('kind', '形态', 'borderbeam', sel(['borderbeam', 'starborder', 'electric', 'glare', 'clickspark', 'pixelflip'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 0.8, rng(0.8, 0.3, 1.6, 0.05)),
      P('text', '文本', 'BORDER BEAM', txt())
    ],
    draw: accentFxDraw,
    ids: [
      { id: 'px-border-beam', name: '边框光束', desc: '一枚发光彗星沿卡片边框匀速奔跑并拖出长尾（Magic UI Border Beam）', tags: ['BorderBeam', '描边', '卡片'], cfg: { kind: 'borderbeam', text: 'BORDER BEAM' } },
      { id: 'px-star-border', name: '星光描边', desc: '卡片上下边缘两道反向流动的星芒闪烁，左缘右缘点缀星点', tags: ['StarBorder', '星光', '卡片'], cfg: { kind: 'starborder', text: 'STAR BORDER' } },
      { id: 'px-electric', name: '电弧描边', desc: '高能电弧在边框随机位置迸发抖动折线，底部能量条同步充能', tags: ['Electric', '电弧', '卡片'], cfg: { kind: 'electric', text: 'HIGH VOLTAGE' } },
      { id: 'px-glare', name: '玻璃眩光卡', desc: '斜向光带周期性扫过磨砂玻璃卡片，边缘受光呼吸（GlareHover）', tags: ['Glare', '玻璃', '卡片'], cfg: { kind: 'glare', text: 'GLARE CARD' } },
      { id: 'px-click-spark', name: '点击火花', desc: '节奏性迸发的放射火花，快出慢收，微交互反馈的标杆质感', tags: ['ClickSpark', '火花', '反馈'], cfg: { kind: 'clickspark', text: 'CLICK' } },
      { id: 'px-pixel-flip', name: '像素翻牌', desc: '网格方块对角波次翻转，A 画面溶解为 B 画面（PixelTransition）', tags: ['Pixel', '翻牌', '转场'], cfg: { kind: 'pixelflip' } }
    ]
  });

  /* C. 高级文字 · 5 */
  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.5,
    params: [
      P('kind', '形态', 'shimmer', sel(['shimmer', 'wordcaption', 'blurtext', 'codereveal', 'kineticquote'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('size', '字号', 170.0, rng(170.0, 60.0, 416.0, 2.0)),
      P('text', '文本', 'SHIMMER', txt(true))
    ],
    draw: textPremiumDraw,
    ids: [
      { id: 'px-shimmer', name: '微光扫过标题', desc: '灰色底字上有一道亮带周期性扫过，标题瞬间有了高级感（Shimmer）', tags: ['Shimmer', '扫光', '标题'], cfg: { kind: 'shimmer', text: 'SHIMMER', size: 320} },
      { id: 'px-word-caption', name: '词级跳变字幕', desc: '当前词放大高亮 + 底部词进度点，TikTok / Remotion 式口播字幕', tags: ['Caption', '字幕', '口播'], cfg: { kind: 'wordcaption', text: 'THREE THINGS CHANGE EVERYTHING TODAY', size: 120 } },
      { id: 'px-blur-text', name: '逐词显影', desc: '词从高斯模糊与位移中凝聚清晰，节奏错落的优雅入场（BlurText）', tags: ['BlurText', '显影', '标题'], cfg: { kind: 'blurtext', text: 'FOCUS ON WHAT MATTERS', size: 130 } },
      { id: 'px-code-reveal', name: '代码逐行点亮', desc: '代码行滑入 + 当前行高亮条 + 语法配色，Code Hike 级的代码演示', tags: ['CodeHike', '代码', '演示'], cfg: { kind: 'codereveal', text: 'const forge = await MF.load()\nforge.render({ fps: 60 })\n// 确定性渲染，帧帧可复现', size: 150 } },
      { id: 'px-kinetic-quote', name: '金句大字报', desc: '三行大字带斜切冲击逐行入场，中行主色强调，引号装饰呼吸', tags: ['Kinetic', '金句', '排版'], cfg: { kind: 'kineticquote', text: 'STAY\nHUNGRY\nFOOLISH', size: 150 } }
    ]
  });

  /* D. 播客波形 · 1 */
  MF.register({
    id: 'px-audiogram',
    name: '播客声波卡',
    cat: '音乐律动', type: 'component', dur: 8, poster: 0.5,
    desc: '播放头扫过的镜像波形逐渐点亮，LIVE 徽标闪烁，Remotion Audiogram 同款排版',
    tags: ['Audiogram', '播客', '波形'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '波形密度', 0.8, rng(0.8, 0.3, 1.6, 0.05)),
      P('text', '标题', 'EP.12 — ON AIR', txt())
    ],
    draw: audiogramDraw
  });

  /* E. 3D 缎带 · 1 */
  MF.register({
    id: 'px-ribbon-3d',
    name: '缎带光影流',
    cat: '形变转换', type: 'block', dur: 8, poster: 0.5,
    desc: '多条双色缎带正弦翻涌，分段明暗模拟受光，高光脊线勾勒，丝滑的 3D 假象',
    tags: ['Ribbons', '缎带', '光影'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('bands', '缎带数', 4, rng(4, 2, 8, 1)),
      P('scale', '波形尺度', 1, rng(1, 0.3, 2.5, 0.05))
    ],
    draw: ribbon3dDraw
  });
})();

/* ════════ assets/js/effects-22.js ════════ */
/* ==========================================================================
   Jaykou — effects-22 · 潮流动效批次（GitHub 取经）
   取经：React Bits（Squares/Waves/Threads/Lightning/LetterGlitch/DotGrid/
        FaultyTerminal/Plasma/MoltenMetal/LightRays/Beams/Topography/Blinds/PixelSnow）
        Magic UI（Meteors/RetroGrid/Ripple/DotPulse/FlickeringGrid/Warp/Globe/
        ShootingStar/AuroraText/WordRotate/SpinningText/FlipText/DecryptedText/
        FuzzyText/CurvedLoop/NumberTicker/Marquee/OrbitingCircles/AnimatedList/
        CircularProgress/AvatarCircles/Confetti）
   硬约束：draw 完全自包含（只依赖 ctx/t/p/U），可被 toString 序列化导出。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF, P = MF.P, rng = MF.rng, txt = MF.txt, col = MF.col;
  function sel(arr) {
    return { type: 'select', options: arr.map(function (x) { return Array.isArray(x) ? x : [x, x]; }) };
  }
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&*+=<>[]{}';

  /* ══════════ A. React Bits 背景 · 上 ══════════ */
  function rbDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var den = Math.max(0.3, p.density), sc = Math.max(0.2, p.scale);

    if (kind === 'squares') {
      /* Squares：方格边框，涟漪从中心向外扫过点亮 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var size = Math.max(46, 96 * S / den);
      var cx = W / 2, cy = H / 2;
      for (var y = -size; y < H + size; y += size) {
        for (var x = -size; x < W + size; x += size) {
          var mx = x + size / 2 - cx, my = y + size / 2 - cy;
          var dist = Math.sqrt(mx * mx + my * my);
          var ph = dist * 0.0042 * sc - tt * 1.9;
          var glow = Math.max(0, Math.sin(ph));
          glow = glow * glow * glow * glow;
          var base = 0.16 + 0.08 * Math.abs(Math.sin(dist * 0.002));
          ctx.strokeStyle = U.rgba(A, base + glow * 0.85);
          ctx.lineWidth = 1.4 * S;
          ctx.strokeRect(x + 3 * S, y + 3 * S, size - 6 * S, size - 6 * S);
        }
      }
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.4);
      cg.addColorStop(0, U.rgba(A, 0.10)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'waves') {
      /* Waves：层叠波形从底部涌起，前低后高、色彩交替 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var layers = Math.max(3, Math.round(4 * den) + 3);
      for (var L = layers - 1; L >= 0; L--) {
        var f = L / (layers - 1);
        var baseY = H * (0.42 + 0.58 * f);
        var colr = L % 3 === 0 ? A : (L % 3 === 1 ? B : U.mix(A, B, 0.5));
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (var x = 0; x <= W; x += 18) {
          var n = U.noise2(x * 0.0012 * sc + L * 5, tt * 0.4);
          var yy = baseY + (n - 0.5) * H * 0.22 + Math.sin(x * 0.0035 * sc + tt * (0.8 + f) + L * 1.4) * (26 + 40 * f) * S;
          ctx.lineTo(x, yy);
        }
        ctx.lineTo(W, H); ctx.closePath();
        var g = ctx.createLinearGradient(0, baseY - H * 0.3, 0, H);
        g.addColorStop(0, U.rgba(colr, 0.30 - f * 0.16));
        g.addColorStop(1, U.rgba(colr, 0.02));
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath();
        for (var x2 = 0; x2 <= W; x2 += 18) {
          var n2 = U.noise2(x2 * 0.0012 * sc + L * 5, tt * 0.4);
          var y2 = baseY + (n2 - 0.5) * H * 0.22 + Math.sin(x2 * 0.0035 * sc + tt * (0.8 + f) + L * 1.4) * (26 + 40 * f) * S;
          if (x2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = U.rgba(U.mix(colr, U.ink, 0.35), 0.5 - f * 0.3);
        ctx.lineWidth = 1.6 * S; ctx.stroke();
      }
    }

    else if (kind === 'threads') {
      /* Threads：多彩丝线同向流动，色相在主辅色间循环 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      var n2 = Math.max(6, Math.round(14 * den));
      ctx.lineCap = 'round';
      for (var i = 0; i < n2; i++) {
        var f2 = i / (n2 - 1);
        var colr2 = U.mix(A, B, (Math.sin(f2 * 6.28 + tt * 0.4) + 1) / 2);
        ctx.beginPath();
        var amp = H * 0.16 * (0.5 + U.rng(i * 3));
        var midY = H * (0.15 + 0.7 * f2);
        for (var x = -20; x <= W + 20; x += 20) {
          var yy = midY + Math.sin(x * 0.0016 * sc + tt * (0.9 + f2 * 0.8) + i * 1.7) * amp
            + U.noise2(x * 0.0014 + i * 9, tt * 0.3) * 60 * S;
          if (x === -20) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        var depth = Math.sin(f2 * Math.PI);
        ctx.lineWidth = (1 + depth * 3.4) * S;
        ctx.strokeStyle = U.rgba(colr2, 0.20 + depth * 0.5);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    else if (kind === 'lightning') {
      /* Lightning：中点位移闪电，随机步进刷新 + 泛光 + 环境闪白 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var step = Math.floor(tt * 7);
      var flash = Math.pow(Math.max(0, U.rng(step, 3) - 0.55) * 2.2, 2);
      if (flash > 0) { ctx.fillStyle = U.rgba(U.ink, flash * 0.10); ctx.fillRect(0, 0, W, H); }
      var x0 = W * (0.3 + 0.4 * U.rng(step, 5)), y0 = 0;
      var x1 = W * (0.3 + 0.4 * U.rng(step, 7)), y1 = H;
      for (var pass = 0; pass < 2; pass++) {
        var pts = [[x0, y0], [x1, y1]];
        for (var it = 0; it < 6; it++) {
          var np = [pts[0]];
          for (var k = 0; k < pts.length - 1; k++) {
            var ax = pts[k][0], ay = pts[k][1], bx = pts[k + 1][0], by = pts[k + 1][1];
            var mx = (ax + bx) / 2 + (U.rng(step * 13 + it * 7 + k, 9) - 0.5) * (bx - ax) * 0.9;
            var my = (ay + by) / 2 + (U.rng(step * 13 + it * 7 + k, 11) - 0.5) * (by - ay) * 0.22;
            np.push([mx, my], [bx, by]);
          }
          pts = np;
        }
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (var k2 = 1; k2 < pts.length; k2++) ctx.lineTo(pts[k2][0], pts[k2][1]);
        ctx.strokeStyle = U.rgba(pass === 0 ? A : U.mix(A, U.ink, 0.7), pass === 0 ? 0.25 : 0.95);
        ctx.lineWidth = (pass === 0 ? 16 : 2.6) * S;
        ctx.lineJoin = 'round';
        ctx.stroke();
        /* 分叉 */
        if (pass === 1) {
          for (var bi = 2; bi < pts.length - 2; bi += 5) {
            if (U.rng(step * 31 + bi, 13) < 0.5) continue;
            var bxp = pts[bi][0], byp = pts[bi][1];
            ctx.beginPath();
            ctx.moveTo(bxp, byp);
            ctx.lineTo(bxp + (U.rng(bi, step) - 0.5) * W * 0.18, byp + H * 0.08 * (0.5 + U.rng(bi + 3, step)));
            ctx.strokeStyle = U.rgba(A, 0.5);
            ctx.lineWidth = 1.4 * S;
            ctx.stroke();
          }
        }
      }
      var hg = ctx.createRadialGradient(x1, y1, 0, x1, y1, W * 0.2);
      hg.addColorStop(0, U.rgba(A, 0.5)); hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'letterglitch') {
      /* Letter Glitch：字符方阵低频乱跳，少数格子亮主色 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cell = Math.max(20, 44 * S / den);
      var stp = Math.floor(tt * 6);
      var cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
      ctx.font = U.fs(cell * 0.62, 600, true);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var ci = r * 131 + c * 17;
          /* 种子里必须混入时间步 stp，字符才会随时间乱跳 */
          var rc = U.rng(ci + stp * 977);
          var ch = GLYPHS.charAt(Math.floor(U.rng(ci * 3.7 + stp * 613) * GLYPHS.length));
          var gx = c * cell + cell / 2, gy = r * cell + cell / 2;
          if (rc < 0.045) ctx.fillStyle = U.rgba(A, 0.95);
          else if (rc < 0.09) ctx.fillStyle = U.rgba(B, 0.8);
          else ctx.fillStyle = U.rgba(U.ink, 0.09);
          ctx.fillText(ch, gx, gy);
        }
      }
      var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, U.rgba(U.bg1, 0.75));
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'dotgrid') {
      /* Dot Grid：点阵 + 多圈涟漪从游走波源扩散 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var gap = Math.max(18, 34 * S / den);
      var sx = W / 2 + Math.cos(tt * 0.5) * W * 0.28;
      var sy = H / 2 + Math.sin(tt * 0.37) * H * 0.24;
      for (var y = gap / 2; y < H; y += gap) {
        for (var x = gap / 2; x < W; x += gap) {
          var d = Math.sqrt((x - sx) * (x - sx) + (y - sy) * (y - sy));
          var v = Math.sin(d * 0.011 * sc - tt * 2.6);
          var a2 = 0.10 + Math.pow(Math.max(0, v), 3) * 0.9;
          var rad = (1.4 + Math.pow(Math.max(0, v), 2) * 3.4) * S;
          ctx.fillStyle = v > 0.55 ? U.rgba(A, a2) : U.rgba(U.ink, a2 * 0.55);
          ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
        }
      }
      var sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 180 * S);
      sg.addColorStop(0, U.rgba(A, 0.22)); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'faulty') {
      /* Faulty Terminal：故障终端窗口，扫描线 + 行乱码 + 抖动切片 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var px = W * 0.12, py = H * 0.16, pw = W * 0.76, phh = H * 0.68;
      var lines = String(p.text || 'SYSTEM BOOT OK').split('\n');
      ctx.save();
      U.rr(ctx, px, py, pw, phh, 14 * S);
      ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fill();
      ctx.strokeStyle = U.rgba(A, 0.55); ctx.lineWidth = 1.6 * S; ctx.stroke();
      ctx.fillStyle = U.rgba(A, 0.85);
      for (var d3 = 0; d3 < 3; d3++) { ctx.beginPath(); ctx.arc(px + 26 * S + d3 * 24 * S, py + 24 * S, 6 * S, 0, 7); ctx.fill(); }
      ctx.font = U.fs(26 * S, 500, true);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      var stp2 = Math.floor(tt * 9);
      for (var li = 0; li < lines.length; li++) {
        var ly = py + 56 * S + li * 44 * S;
        var str = lines[li];
        var vis = Math.floor(str.length * Math.min(1, tt * 0.9 * den + 0.2));
        var out = '';
        for (var ch2 = 0; ch2 < str.length; ch2++) {
          if (ch2 < vis) out += str.charAt(ch2);
          else if (ch2 < vis + 3 && U.rng(li * 31 + ch2, stp2) > 0.4) out += GLYPHS.charAt(Math.floor(U.rng(li * 7 + ch2 * 3, stp2) * GLYPHS.length));
          else break;
        }
        var flick = U.rng(li * 5 + 1, stp2) < 0.05 ? 0.3 : 1;
        ctx.fillStyle = li === 0 ? U.rgba(A, 0.95 * flick) : U.rgba(U.mix(A, U.ink, 0.4), 0.8 * flick);
        ctx.fillText(out, px + 30 * S, ly);
      }
      /* 光标 */
      if (Math.sin(tt * 5) > 0) {
        ctx.fillStyle = U.rgba(A, 0.9);
        ctx.fillRect(px + 30 * S, py + 56 * S + lines.length * 44 * S, 14 * S, 26 * S);
      }
      /* 扫描线 */
      var scanY = py + ((tt * 90 * sc) % phh);
      var sg2 = ctx.createLinearGradient(0, scanY - 30 * S, 0, scanY + 30 * S);
      sg2.addColorStop(0, 'rgba(0,0,0,0)'); sg2.addColorStop(0.5, U.rgba(A, 0.10)); sg2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg2; ctx.fillRect(px, scanY - 30 * S, pw, 60 * S);
      /* 水平错位切片 */
      if (U.rng(stp2, 17) < 0.34) {
        var sy2 = py + U.rng(stp2, 19) * phh;
        var sh = 12 * S;
        var off = (U.rng(stp2, 23) - 0.5) * 46 * S;
        ctx.drawImage(ctx.canvas, px, sy2, pw, sh, px + off, sy2, pw, sh);
      }
      ctx.restore();
      /* CRT 横纹 */
      for (var yy = 0; yy < H; yy += 4 * S) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, yy, W, 1.4 * S);
      }
    }

    else if (kind === 'plasma') {
      /* Plasma：经典等离子色场，多组正弦干涉 */
      var cell2 = Math.max(8, 14 * S);
      var tt2 = tt * 0.8;
      for (var y = 0; y < H; y += cell2) {
        for (var x = 0; x < W; x += cell2) {
          var v = Math.sin(x * 0.0038 * sc + tt2)
            + Math.sin((y * 0.0042 - tt2 * 0.6) * sc)
            + Math.sin((x + y) * 0.0026 * sc + tt2 * 0.4)
            + U.noise2(x * 0.0016 * sc, y * 0.0016 * sc + tt2 * 0.1) * 1.4;
          var f = (v + 3.4) / 6.8;
          f = Math.max(0, Math.min(1, f));
          var c = U.mix(U.mix(U.bg1, B, Math.pow(f, 1.4)), A, Math.pow(Math.max(0, f - 0.55) / 0.45, 1.6));
          ctx.fillStyle = c;
          ctx.fillRect(x, y, cell2 + 1, cell2 + 1);
        }
      }
    }
  }

  /* ══════════ B. React Bits 背景 · 下 ══════════ */
  function rb2Draw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var den = Math.max(0.3, p.density), sc = Math.max(0.2, p.scale);

    if (kind === 'molten') {
      /* Molten Metal：暗色液态金属，noise 脊线发出炽热裂光 */
      var cell = Math.max(7, 12 * S);
      for (var y = 0; y < H; y += cell) {
        for (var x = 0; x < W; x += cell) {
          var n = U.noise2(x * 0.0022 * sc, y * 0.0022 * sc, tt * 0.12);
          var v = Math.sin(n * 9.4 + tt * 0.7) * 0.5 + 0.5;
          var ridge = Math.pow(v, 9);
          var base = U.mix(U.bg1, U.mix(U.bg2, U.ink, 0.1), v * 0.5);
          var c = U.mix(base, A, ridge);
          if (ridge > 0.75) c = U.mix(c, U.ink, (ridge - 0.75) * 2.4);
          ctx.fillStyle = c;
          ctx.fillRect(x, y, cell + 1, cell + 1);
        }
      }
      var hl = ctx.createLinearGradient(0, 0, W * 0.6, H);
      hl.addColorStop(0, U.rgba(U.ink, 0.07)); hl.addColorStop(0.5, 'rgba(0,0,0,0)');
      ctx.fillStyle = hl; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'lightrays') {
      /* Light Rays：顶部光源体积光柱，尘埃漂浮 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var ox = W * 0.5 + Math.sin(tt * 0.22) * W * 0.06, oy = -H * 0.06;
      var rays = Math.max(5, Math.round(11 * den));
      ctx.globalCompositeOperation = 'screen';
      for (var i = 0; i < rays; i++) {
        var a0 = Math.PI * (0.18 + 0.64 * (i + 0.5) / rays) + Math.sin(tt * 0.3 + i) * 0.035;
        var flick = 0.5 + 0.5 * U.noise(i * 3.3, tt * 0.5);
        var len = Math.max(W, H) * (0.85 + 0.3 * flick);
        var wdt = (26 + 70 * U.rng(i * 7)) * S * den;
        var ex = ox + Math.cos(a0) * len, ey = oy + Math.sin(a0) * len;
        var g = ctx.createLinearGradient(ox, oy, ex, ey);
        var colr = i % 3 === 0 ? A : (i % 3 === 1 ? B : U.mix(A, U.ink, 0.5));
        g.addColorStop(0, U.rgba(colr, 0.30 * flick));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex + Math.cos(a0 + Math.PI / 2) * wdt, ey + Math.sin(a0 + Math.PI / 2) * wdt);
        ctx.lineTo(ex + Math.cos(a0 - Math.PI / 2) * wdt, ey + Math.sin(a0 - Math.PI / 2) * wdt);
        ctx.closePath(); ctx.fill();
      }
      /* 尘埃 */
      for (var d2 = 0; d2 < 70 * den; d2++) {
        var dx = (U.rnd(0, 1, d2 * 2) + tt * 0.014 * (0.4 + U.rng(d2))) % 1 * W;
        var dy = (U.rnd(0, 1, d2 * 2 + 1) + tt * 0.006) % 1 * H;
        var tw = 0.4 + 0.6 * Math.abs(Math.sin(tt * 1.2 + d2));
        ctx.fillStyle = U.rgba(U.ink, 0.16 * tw);
        ctx.beginPath(); ctx.arc(dx, dy, 1.7 * S, 0, 7); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      var src = ctx.createRadialGradient(ox, oy, 0, ox, oy, 260 * S);
      src.addColorStop(0, U.rgba(U.mix(A, U.ink, 0.5), 0.7)); src.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = src; ctx.beginPath(); ctx.arc(ox, oy, 260 * S, 0, 7); ctx.fill();
    }

    else if (kind === 'beams') {
      /* Beams：数道斜向光束周期性横扫 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.rotate(-0.5); ctx.translate(-W, -H * 0.5);
      ctx.globalCompositeOperation = 'screen';
      var span = W * 2.4;
      var nb = Math.max(2, Math.round(4 * den));
      for (var i = 0; i < nb; i++) {
        var cyc = 3.2 / Math.max(0.3, p.speed);
        var pr = ((t + i * cyc / nb) % cyc) / cyc;
        var bx = -span * 0.2 + pr * span * 1.3;
        var bw = (90 + 160 * U.rng(i * 9)) * S;
        var g = ctx.createLinearGradient(bx - bw, 0, bx + bw, 0);
        var colr = i % 2 ? A : B;
        g.addColorStop(0, U.rgba(colr, 0)); g.addColorStop(0.5, U.rgba(colr, 0.34)); g.addColorStop(1, U.rgba(colr, 0));
        ctx.fillStyle = g;
        ctx.fillRect(bx - bw, -H * 0.6, bw * 2, H * 2.4);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      for (var d3 = 0; d3 < 50; d3++) {
        var sx = U.rnd(0, 1, d3) * W, sy = U.rnd(0, 1, d3 + 41) * H;
        ctx.fillStyle = U.rgba(U.ink, 0.10 + 0.14 * Math.abs(Math.sin(tt + d3)));
        ctx.fillRect(sx, sy, 2 * S, 2 * S);
      }
    }

    else if (kind === 'topo') {
      /* Topography Waves：等高线式山脊层叠推移 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var levels = Math.max(8, Math.round(18 * den));
      for (var L = 0; L < levels; L++) {
        var f = L / (levels - 1);
        var baseY = H * (0.12 + 0.86 * f);
        ctx.beginPath();
        for (var x = 0; x <= W; x += 16) {
          var n = U.noise2(x * 0.0016 * sc, L * 0.55 + tt * 0.22);
          var n2 = U.noise2(x * 0.0006 + L, tt * 0.1);
          var yy = baseY + (n * 0.7 + n2 * 0.3) * H * 0.09 * (0.3 + f);
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        var near = Math.sin(f * Math.PI);
        ctx.strokeStyle = L % 5 === 0 ? U.rgba(A, 0.30 + near * 0.35) : U.rgba(U.ink, 0.07 + near * 0.16);
        ctx.lineWidth = (L % 5 === 0 ? 2.2 : 1.1) * S;
        ctx.stroke();
        if (L % 5 === 0) {
          ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
          ctx.fillStyle = U.rgba(A, 0.03);
          ctx.fill();
        }
      }
    }

    else if (kind === 'blinds') {
      /* Gradient Blinds：竖向百叶渐变，波动起伏 */
      var slat = Math.max(26, 64 * S / den);
      var n = Math.ceil(W / slat);
      var bgg = ctx.createLinearGradient(0, 0, W, H);
      bgg.addColorStop(0, U.bg1); bgg.addColorStop(1, U.bg2);
      ctx.fillStyle = bgg; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < n; i++) {
        var ph = Math.sin(i * 0.55 * sc + tt * 1.4) * 0.5 + 0.5;
        var colr = U.mix(A, B, (Math.sin(i * 0.21 + tt * 0.3) + 1) / 2);
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, U.rgba(colr, 0.05 + ph * 0.22));
        g.addColorStop(0.5, U.rgba(colr, 0.02));
        g.addColorStop(1, U.rgba(colr, 0.30 - ph * 0.2));
        ctx.fillStyle = g;
        ctx.fillRect(i * slat + slat * 0.12, 0, slat * 0.76, H);
      }
    }

    else if (kind === 'pixelpop') {
      /* Pixel Snow：粗像素雪片缓落，风向漂移 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = Math.round(260 * den);
      var px2 = Math.max(4, 9 * S);
      for (var i = 0; i < n; i++) {
        var sp = 26 + 90 * U.rng(i * 3.1);
        var x0 = U.rnd(0, 1, i) * W;
        var x = (x0 + Math.sin(tt * 0.6 + i) * 40 * S + tt * 22 * sc) % W;
        var y = (U.rnd(0, 1, i + 77) * H + tt * sp) % (H + 40) - 20;
        var sz = px2 * (0.5 + U.rng(i * 5.3));
        var a2 = 0.14 + 0.5 * U.rng(i * 2.7);
        ctx.fillStyle = U.rng(i * 11) < 0.06 ? U.rgba(A, 0.85) : U.rgba(U.ink, a2);
        ctx.fillRect(Math.floor(x / px2) * px2, Math.floor(y / px2) * px2, sz, sz);
      }
      var vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, U.rgba(U.bg1, 0.6));
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'ghost') {
      /* Ghost Fibers：垂直柔性光纤维缓摆，幽雾质感 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      var n2 = Math.round(26 * den);
      for (var i = 0; i < n2; i++) {
        var f = i / n2;
        var bx = W * (0.06 + 0.88 * f);
        var colr = U.mix(A, B, (Math.sin(f * 5 + tt * 0.35) + 1) / 2);
        ctx.beginPath();
        for (var y = -20; y <= H + 20; y += 22) {
          var xx = bx + Math.sin(y * 0.0022 * sc + tt * (0.5 + f * 0.5) + i * 1.3) * 70 * S
            + U.noise2(i * 4, y * 0.0016 + tt * 0.2) * 50 * S;
          if (y === -20) ctx.moveTo(xx, y); else ctx.lineTo(xx, y);
        }
        var depth = Math.sin(f * Math.PI);
        ctx.lineWidth = (1.4 + depth * 6) * S;
        ctx.strokeStyle = U.rgba(colr, 0.08 + depth * 0.3);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    else if (kind === 'laser') {
      /* Laser Flow：激光细线高速穿梭，残影拉丝 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      var n3 = Math.round(24 * den);
      for (var i = 0; i < n3; i++) {
        var lane = U.rng(i * 3.3);
        var yBase = H * (0.08 + 0.84 * lane);
        var cyc = 1.6 + U.rng(i * 7.7) * 2.4;
        var pr = ((tt * Math.max(0.2, p.speed) + U.rng(i) * cyc * 3) % cyc) / cyc;
        var xHead = pr * (W + 500 * S) - 250 * S;
        var slope = (U.rng(i * 13) - 0.5) * 0.22;
        var tail = (120 + 260 * U.rng(i * 5)) * S;
        var g = ctx.createLinearGradient(xHead - tail, 0, xHead, 0);
        g.addColorStop(0, U.rgba(A, 0)); g.addColorStop(1, U.rgba(i % 3 === 0 ? U.mix(A, U.ink, 0.6) : A, 0.9));
        ctx.strokeStyle = g;
        ctx.lineWidth = (0.8 + 1.8 * U.rng(i * 2)) * S;
        ctx.beginPath();
        ctx.moveTo(xHead - tail, yBase + slope * (xHead - tail - W / 2));
        ctx.lineTo(xHead, yBase + slope * (xHead - W / 2));
        ctx.stroke();
        ctx.fillStyle = U.rgba(U.ink, 0.9);
        ctx.beginPath(); ctx.arc(xHead, yBase + slope * (xHead - W / 2), 2.2 * S, 0, 7); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /* ══════════ C. Magic UI 背景 / 特效 ══════════ */
  function muiDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var den = Math.max(0.3, p.density), sc = Math.max(0.2, p.scale);

    if (kind === 'meteors') {
      /* Meteors：斜向流星群，头亮尾长，循环生灭 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      for (var s = 0; s < H; s += 4 * S) {
        ctx.fillStyle = 'rgba(0,0,0,0)'; /* noop keep bg */
      }
      var n = Math.round(16 * den);
      for (var i = 0; i < n; i++) {
        var cyc = 2.6 + U.rng(i * 3.7) * 3.4;
        var pr = ((tt + U.rng(i * 9) * cyc * 4) % cyc) / cyc;
        var sx0 = U.rnd(0.05, 1.15, i * 5) * W;
        var sy0 = -0.1 * H + U.rnd(0, 0.25, i * 11) * H;
        var dx = 0.72, dy = 0.7;   /* 斜向 45° 左右 */
        var travel = Math.max(W, H) * 1.25;
        var hx = sx0 + dx * pr * travel, hy = sy0 + dy * pr * travel;
        var tail = (140 + 240 * U.rng(i * 7)) * S;
        var fade = Math.sin(pr * Math.PI);
        var g = ctx.createLinearGradient(hx - dx * tail, hy - dy * tail, hx, hy);
        g.addColorStop(0, U.rgba(i % 4 === 0 ? B : A, 0));
        g.addColorStop(1, U.rgba(i % 4 === 0 ? B : A, 0.9 * fade));
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.2 * S; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hx - dx * tail, hy - dy * tail);
        ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = U.rgba(U.ink, fade);
        ctx.beginPath(); ctx.arc(hx, hy, 2.6 * S, 0, 7); ctx.fill();
      }
      for (var st = 0; st < 90; st++) {
        var x = U.rnd(0, 1, st * 2) * W, y = U.rnd(0, 1, st * 2 + 1) * H;
        ctx.fillStyle = U.rgba(U.ink, 0.10 + 0.2 * Math.abs(Math.sin(tt * 1.3 + st)));
        ctx.fillRect(x, y, 2 * S, 2 * S);
      }
    }

    else if (kind === 'retrogrid') {
      /* Retro Grid：合成波透视地板滚动 + 落日 */
      var hz = H * 0.46;
      var sky = ctx.createLinearGradient(0, 0, 0, hz);
      sky.addColorStop(0, U.mix(U.bg1, U.bg2, 0.6)); sky.addColorStop(1, U.bg1);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hz);
      /* 落日 */
      var sunY = hz - 10 * S, sunR = Math.min(W, H) * 0.17;
      var sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sg.addColorStop(0, U.mix(A, U.ink, 0.35)); sg.addColorStop(1, A);
      ctx.save();
      ctx.beginPath(); ctx.arc(W / 2, sunY - sunR * 0.35, sunR, 0, 7); ctx.clip();
      ctx.fillStyle = sg; ctx.fillRect(W / 2 - sunR, sunY - sunR * 1.4, sunR * 2, sunR * 2.4);
      for (var sl = 0; sl < 6; sl++) {
        var sy2 = sunY - sunR * 0.1 + sl * sunR * 0.16;
        ctx.fillStyle = U.bg1;
        ctx.fillRect(W / 2 - sunR, sy2, sunR * 2, sunR * (0.03 + sl * 0.014));
      }
      ctx.restore();
      /* 地板 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, hz, W, H - hz);
      var vp = W / 2;
      ctx.strokeStyle = U.rgba(A, 0.55); ctx.lineWidth = 1.6 * S;
      for (var i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(vp + i * W * 0.024, hz);
        ctx.lineTo(vp + i * W * 0.34, H + 2);
        ctx.stroke();
      }
      var N = 14;
      for (var k = 0; k < N; k++) {
        var z = ((k / N) + (tt * 0.22) % (1 / N) * N * 0 + 0) % 1;
        z = ((k + tt * 2.6) % N) / N;
        var y = hz + (H - hz) * Math.pow(z, 2.4);
        ctx.strokeStyle = U.rgba(A, 0.12 + 0.5 * z);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      var hg = ctx.createLinearGradient(0, hz - 60 * S, 0, hz + 60 * S);
      hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(0.5, U.rgba(A, 0.35)); hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg; ctx.fillRect(0, hz - 60 * S, W, 120 * S);
    }

    else if (kind === 'ripple') {
      /* Ripple：单圈圆环从中心扩散，简洁通透 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var maxR = Math.max(W, H) * 0.52;
      var rings = Math.max(1, Math.round(3 * den));
      for (var k2 = 0; k2 < rings; k2++) {
        var pr = ((tt * 0.34 + k2 / rings) % 1);
        var r = pr * maxR;
        ctx.strokeStyle = U.rgba(k2 % 2 ? B : A, (1 - pr) * 0.6);
        ctx.lineWidth = (2.4 - pr * 1.4) * S;
        ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, 7); ctx.stroke();
      }
      var cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 120 * S);
      cg.addColorStop(0, U.rgba(A, 0.35)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(W / 2, H / 2, 120 * S, 0, 7); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 5 * S, 0, 7); ctx.fill();
    }

    else if (kind === 'dotpulse') {
      /* Dot Pattern Pulse：点阵随波呼吸 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var gap = Math.max(16, 30 * S / den);
      for (var y = gap / 2; y < H; y += gap) {
        for (var x = gap / 2; x < W; x += gap) {
          var d = Math.sqrt((x - W / 2) * (x - W / 2) + (y - H / 2) * (y - H / 2));
          var v = 0.5 + 0.5 * Math.sin(d * 0.008 * sc - tt * 2.4);
          ctx.fillStyle = U.rgba(U.mix(U.ink, A, v), 0.10 + v * 0.55);
          ctx.beginPath(); ctx.arc(x, y, (1.2 + v * 2.2) * S, 0, 7); ctx.fill();
        }
      }
    }

    else if (kind === 'flicker') {
      /* Flickering Grid：网格单元随机点亮又熄灭 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var gap = Math.max(24, 48 * S / den);
      var stp = Math.floor(tt * 5);
      var frac = (tt * 5) % 1;
      for (var y = gap / 2; y < H; y += gap) {
        for (var x = gap / 2; x < W; x += gap) {
          var ci = Math.floor(x / gap) * 97 + Math.floor(y / gap) * 31;
          var on = U.rng(ci, stp);
          var a2 = 0.05;
          if (on < 0.05) a2 = 0.85 * (1 - frac * 0.3);
          else if (on < 0.1 && frac > 0.5) a2 = 0.5;
          else a2 = 0.08;
          var colr = on < 0.05 ? A : (on < 0.1 ? B : U.ink);
          ctx.strokeStyle = U.rgba(colr, a2 * 0.7);
          ctx.lineWidth = 1.2 * S;
          ctx.strokeRect(x - gap * 0.32, y - gap * 0.32, gap * 0.64, gap * 0.64);
          ctx.fillStyle = U.rgba(colr, a2);
          ctx.fillRect(x - gap * 0.32, y - gap * 0.32, gap * 0.64, gap * 0.64);
        }
      }
    }

    else if (kind === 'warp') {
      /* Warp：星点从中心扭曲飞出，拉出弧形残影 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var n = Math.round(240 * den);
      for (var i = 0; i < n; i++) {
        var ang = U.rng(i * 2.7) * Math.PI * 2;
        var depth = (U.rng(i * 5.1) + tt * 0.14 * sc) % 1;
        var r = Math.pow(depth, 1.7) * Math.max(W, H) * 0.72;
        var rPrev = Math.pow(Math.max(0, depth - 0.045), 1.7) * Math.max(W, H) * 0.72;
        var bend = Math.sin(tt * 0.5 + i) * 0.06;
        var x = cx + Math.cos(ang + bend * depth) * r, y = cy + Math.sin(ang + bend * depth) * r;
        var xp = cx + Math.cos(ang + bend * (depth - 0.045)) * rPrev, yp = cy + Math.sin(ang + bend * (depth - 0.045)) * rPrev;
        var a2 = depth * 0.9;
        ctx.strokeStyle = U.rng(i * 13) < 0.08 ? U.rgba(A, a2) : U.rgba(U.ink, a2);
        ctx.lineWidth = (0.5 + depth * 2) * S;
        ctx.beginPath(); ctx.moveTo(xp, yp); ctx.lineTo(x, y); ctx.stroke();
      }
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200 * S);
      cg.addColorStop(0, U.rgba(A, 0.30)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'globe') {
      /* Globe：线框地球缓转，光点脉动 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.32;
      var rot = tt * 0.5;
      ctx.strokeStyle = U.rgba(U.ink, 0.22); ctx.lineWidth = 1.1 * S;
      /* 纬线 */
      for (var la = -60; la <= 60; la += 30) {
        var ry = Math.cos(la * Math.PI / 180) * R;
        var yy = cy + Math.sin(la * Math.PI / 180) * R;
        ctx.beginPath();
        ctx.ellipse(cx, yy, ry, ry * 0.16, 0, 0, 7);
        ctx.stroke();
      }
      /* 经线 */
      for (var lo = 0; lo < 180; lo += 30) {
        var a0 = (lo + rot * 30) * Math.PI / 180;
        var sx2 = Math.cos(a0);
        ctx.strokeStyle = sx2 > 0 ? U.rgba(U.ink, 0.24) : U.rgba(U.ink, 0.08);
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(sx2) * R, R, 0, 0, 7);
        ctx.stroke();
      }
      /* 轮廓 */
      ctx.strokeStyle = U.rgba(U.mix(A, U.ink, 0.3), 0.5);
      ctx.lineWidth = 1.8 * S;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      /* 光点 */
      for (var d3 = 0; d3 < 10; d3++) {
        var la2 = (U.rnd(-55, 55, d3 * 3)) * Math.PI / 180;
        var lo2 = (U.rnd(0, 360, d3 * 5) + rot * 30) * Math.PI / 180;
        var px = Math.cos(lo2) * Math.cos(la2) * R;
        if (Math.cos(lo2) < 0.08) continue;   /* 背面不画 */
        var py = Math.sin(la2) * R;
        var pw = 0.5 + 0.5 * Math.sin(tt * 2.4 + d3 * 2.2);
        ctx.fillStyle = U.rgba(A, 0.35 + pw * 0.6);
        ctx.beginPath(); ctx.arc(cx + px, cy + py, (2 + pw * 3.4) * S, 0, 7); ctx.fill();
      }
      var gg = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.5);
      gg.addColorStop(0, U.rgba(A, 0.10)); gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'shooting') {
      /* Shooting Star： solitary 彗星周期划过 + 星野 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      for (var st = 0; st < 130; st++) {
        var x = U.rnd(0, 1, st * 2) * W, y = U.rnd(0, 1, st * 2 + 1) * H;
        var tw = 0.25 + 0.75 * Math.pow(Math.abs(Math.sin(tt * 1.1 + st * 1.7)), 2);
        ctx.fillStyle = U.rgba(U.ink, 0.4 * tw);
        ctx.fillRect(x, y, 2 * S, 2 * S);
      }
      var cyc = 4 / Math.max(0.3, p.speed);
      var pr = (tt % cyc) / cyc;
      var a0 = 0.32;
      var sx3 = -0.1 * W + pr * W * 1.25;
      var sy3 = H * 0.08 + pr * W * 1.25 * Math.tan(a0);
      var tail = W * 0.3;
      var g = ctx.createLinearGradient(sx3 - Math.cos(a0) * tail, sy3 - Math.sin(a0) * tail, sx3, sy3);
      g.addColorStop(0, U.rgba(A, 0)); g.addColorStop(1, U.rgba(U.mix(A, U.ink, 0.4), 0.95));
      ctx.strokeStyle = g; ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx3 - Math.cos(a0) * tail, sy3 - Math.sin(a0) * tail); ctx.lineTo(sx3, sy3); ctx.stroke();
      var hg = ctx.createRadialGradient(sx3, sy3, 0, sx3, sy3, 40 * S);
      hg.addColorStop(0, U.rgba(U.ink, 0.9)); hg.addColorStop(0.4, U.rgba(A, 0.5)); hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(sx3, sy3, 40 * S, 0, 7); ctx.fill();
    }
  }

  /* ══════════ D. Magic UI 文字动画 ══════════ */
  function muiTextDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var size = Math.max(20, p.size) * S;
    var str = String(p.text || 'MOTION');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (kind === 'aurora-text') {
      /* Aurora Text：极光渐变在文字内部流动 */
      var x = W / 2, y = H / 2;
      ctx.save();
      ctx.font = U.fs(size, 800);
      var g = ctx.createLinearGradient(x - W * 0.3 + Math.sin(tt * 0.7) * W * 0.1, 0, x + W * 0.3 + Math.cos(tt * 0.5) * W * 0.1, H);
      g.addColorStop(0, U.rgba(A, 1));
      g.addColorStop(0.35 + 0.2 * Math.sin(tt), U.rgba(U.mix(A, B, 0.5), 1));
      g.addColorStop(0.7, U.rgba(B, 1));
      g.addColorStop(1, U.rgba(U.mix(B, U.ink, 0.4), 1));
      ctx.shadowColor = U.rgba(A, 0.55); ctx.shadowBlur = 44 * S;
      ctx.fillStyle = g;
      ctx.fillText(str, x, y);
      ctx.shadowBlur = 0;
      /* 内部流光带 */
      ctx.beginPath();
      ctx.rect(x - W * 0.5, y - size * 0.75, W, size * 1.5);
      ctx.clip();
      for (var i = 0; i < 3; i++) {
        var bandY = y + Math.sin(tt * (0.8 + i * 0.3) + i * 2) * size * 0.3;
        var bg = ctx.createLinearGradient(0, bandY - size * 0.28, 0, bandY + size * 0.28);
        bg.addColorStop(0, 'rgba(0,0,0,0)');
        bg.addColorStop(0.5, U.rgba(U.ink, 0.16));
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(x - W * 0.5, bandY - size * 0.28, W, size * 0.56);
      }
      ctx.restore();
    }

    else if (kind === 'word-rotate') {
      /* Word Rotate：词组上滑轮播 */
      var words = str.split(/[|,\n]+/);
      if (!words.length) words = ['MOTION'];
      var slot = 1.6 / Math.max(0.3, p.speed);
      var idx = Math.floor(t / slot) % words.length;
      var pr = (t % slot) / slot;
      var cur = words[idx], nxt = words[(idx + 1) % words.length];
      var cy = H / 2, shift = size * 1.35;
      ctx.font = U.fs(size, 800);
      if (pr < 0.32) {
        var e1 = U.ease.inCubic(pr / 0.32);
        ctx.globalAlpha = 1 - e1;
        ctx.fillStyle = U.ink;
        ctx.fillText(cur, W / 2, cy - e1 * shift);
      }
      if (pr > 0.24) {
        var e2 = U.ease.outCubic((pr - 0.24) / 0.76);
        ctx.globalAlpha = e2;
        ctx.fillStyle = A;
        ctx.fillText(nxt, W / 2, cy + (1 - e2) * shift);
      }
      ctx.globalAlpha = 1;
      /* 指示条 */
      for (var i = 0; i < words.length; i++) {
        ctx.fillStyle = U.rgba(i === idx ? A : U.ink, i === idx ? 0.95 : 0.2);
        ctx.fillRect(W / 2 + (i - words.length / 2) * 26 * S, cy + size * 0.95, 16 * S, 4 * S);
      }
    }

    else if (kind === 'spinning-text') {
      /* Spinning Text：文字沿圆环旋转 */
      var R = Math.min(W, H) * 0.32;
      var rot = tt * 0.55;
      ctx.font = U.fs(size * 0.5, 700);
      for (var i = 0; i < str.length; i++) {
        var a0 = rot + (i / str.length) * Math.PI * 2;
        var x = W / 2 + Math.cos(a0) * R, y = H / 2 + Math.sin(a0) * R;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(a0 + Math.PI / 2);
        ctx.fillStyle = U.rgba(i % 3 === 0 ? A : (i % 3 === 1 ? B : U.ink), 0.55 + 0.45 * Math.sin(a0));
        ctx.fillText(str.charAt(i), 0, 0);
        ctx.restore();
      }
      ctx.fillStyle = U.rgba(A, 0.9);
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 7 * S, 0, 7); ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.1); ctx.lineWidth = 1.2 * S;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.stroke();
    }

    else if (kind === 'flip-text') {
      /* Flip Text：字符依次翻转（scaleY 余弦） */
      ctx.font = U.fs(size, 800);
      var cw = size * 0.72;
      var total = str.length * cw;
      var x0 = W / 2 - total / 2 + cw / 2;
      for (var i = 0; i < str.length; i++) {
        var ph = tt * 1.6 - i * 0.45;
        var sy = Math.cos(ph);
        ctx.save();
        ctx.translate(x0 + i * cw, H / 2);
        ctx.scale(1, Math.max(0.08, Math.abs(sy)));
        ctx.fillStyle = sy > 0 ? U.ink : U.rgba(A, 0.85);
        ctx.fillText(str.charAt(i), 0, 0);
        ctx.restore();
      }
    }

    else if (kind === 'decrypted') {
      /* Decrypted Text：乱码逐字解密落定 */
      ctx.font = U.fs(size, 700);
      var reveal = Math.min(1, tt / 2.4);
      var visN = Math.floor(str.length * reveal);
      var stp = Math.floor(tt * 24);
      var cw = size * 0.62;
      var x0 = W / 2 - str.length * cw / 2;
      ctx.textAlign = 'left';
      for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (ch === ' ') { continue; }
        var xx = x0 + i * cw;
        if (i < visN - 1) {
          ctx.fillStyle = i === visN - 2 ? U.rgba(A, 0.9) : U.ink;
          ctx.fillText(ch, xx, H / 2);
        } else if (i < visN) {
          ctx.fillStyle = U.rgba(A, 0.9);
          ctx.fillText(ch, xx, H / 2);
        } else {
          ctx.fillStyle = U.rgba(U.ink, 0.28);
          ctx.fillText(GLYPHS.charAt(Math.floor(U.rng(i * 7.7, stp) * GLYPHS.length)), xx, H / 2);
        }
      }
      ctx.textAlign = 'center';
    }

    else if (kind === 'fuzzy') {
      /* Fuzzy Text：失焦呼吸，聚焦瞬间清晰 */
      var cyc = 3 / Math.max(0.3, p.speed);
      var pr = (t % cyc) / cyc;
      var focus = pr < 0.45 ? U.ease.outCubic(pr / 0.45) : 1 - U.ease.inQuad((pr - 0.45) / 0.55);
      var blur = (1 - focus) * 18 * S;
      ctx.font = U.fs(size, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.25 + focus * 0.75);
      try { ctx.filter = 'blur(' + blur.toFixed(1) + 'px)'; } catch (e) { /* 忽略 */ }
      ctx.fillText(str, W / 2, H / 2);
      try { ctx.filter = 'none'; } catch (e) { /* 忽略 */ }
      ctx.fillStyle = U.rgba(A, (1 - focus) * 0.5);
      ctx.fillText(str, W / 2 + (1 - focus) * 3 * S, H / 2);
    }

    else if (kind === 'curved') {
      /* Curved Loop：文字沿弧线无限滚动 */
      var R = Math.min(W, H) * 0.42;
      var cx = W / 2, cy = H * 0.72;
      ctx.font = U.fs(size * 0.42, 700);
      var loop = str + '   ·   ';
      var per = loop.length;
      var off = (tt * 3.2) % 1;
      for (var i = 0; i < Math.ceil(per * 1.2); i++) {
        var f = (i - off) / per;
        var a0 = Math.PI * (1.14 - f * 0.9);   /* 上弧区间 */
        var x = cx + Math.cos(a0) * R, y = cy - Math.abs(Math.sin(a0)) * R * 0.9;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(-(a0 - Math.PI / 2));
        ctx.fillStyle = U.rgba(i % 2 ? B : U.ink, 0.5 + 0.5 * Math.sin(a0));
        ctx.fillText(loop.charAt(((i % per) + per) % per), 0, 0);
        ctx.restore();
      }
    }

    else if (kind === 'countup') {
      /* Number Ticker：数字滚动到位 */
      var target = parseFloat(String(p.text).replace(/[^0-9.]/g, '')) || 100;
      var suffix = String(p.text).replace(/[0-9.]/g, '');
      var cyc = 4 / Math.max(0.3, p.speed);
      var pr = Math.min(1, (t % cyc) / (cyc * 0.55));
      var val = target * U.ease.outExpo(pr);
      var disp = target >= 100 ? Math.round(val).toLocaleString('en-US') : val.toFixed(1);
      ctx.font = U.fs(size, 800);
      ctx.fillStyle = U.ink;
      ctx.fillText(disp + suffix, W / 2, H / 2 - size * 0.1);
      /* 底部进度条 */
      var bw = size * 4.2;
      ctx.fillStyle = U.rgba(U.ink, 0.12);
      U.rr(ctx, W / 2 - bw / 2, H / 2 + size * 0.55, bw, 8 * S, 4 * S); ctx.fill();
      ctx.fillStyle = U.rgba(A, 0.95);
      U.rr(ctx, W / 2 - bw / 2, H / 2 + size * 0.55, bw * pr, 8 * S, 4 * S); ctx.fill();
    }
  }

  /* ══════════ E. Magic UI 组件 ══════════ */
  function muiCompDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var str = String(p.text || 'A');

    if (kind === 'marquee') {
      /* Marquee：双行 Logo 跑马灯反向滚动 */
      var items = str.split('|');
      if (!items.length) items = ['LOGO'];
      var rows = [1, -1];
      for (var r = 0; r < 2; r++) {
        var ry = H / 2 + (r === 0 ? -H * 0.14 : H * 0.14);
        var chipH = 74 * S, gap = 26 * S;
        var cw = 260 * S;
        var span = (items.length) * (cw + gap);
        var sp = tt * 150 * (r === 0 ? 1 : -1) / Math.max(0.3, p.speed);
        for (var k = -1; k < Math.ceil(W / span) + 2; k++) {
          for (var i = 0; i < items.length; i++) {
            var x0 = (k * span + i * (cw + gap) + sp) % (span * Math.ceil((W + span) / span));
            var xx = ((x0 % span) + span) % span - span * 0.2;
            if (xx < -cw || xx > W + cw) continue;
            var yy = ry;
            U.rr(ctx, xx, yy - chipH / 2, cw, chipH, 16 * S);
            ctx.fillStyle = U.rgba(U.bg2, 0.85); ctx.fill();
            ctx.strokeStyle = U.rgba(r === 0 ? A : B, 0.4); ctx.lineWidth = 1.4 * S; ctx.stroke();
            ctx.fillStyle = U.rgba(U.ink, 0.85);
            ctx.font = U.fs(30 * S, 700);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(items[i], xx + cw / 2, yy);
          }
        }
      }
      /* 两侧渐隐 */
      var l = ctx.createLinearGradient(0, 0, W * 0.12, 0);
      l.addColorStop(0, U.bg1); l.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = l; ctx.fillRect(0, 0, W * 0.12, H);
      var rr2 = ctx.createLinearGradient(W, 0, W * 0.88, 0);
      rr2.addColorStop(0, U.bg1); rr2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rr2; ctx.fillRect(W * 0.88, 0, W * 0.12, H);
    }

    else if (kind === 'orbiting') {
      /* Orbiting Circles：中心 Logo + 多层轨道环绕点 */
      var cx = W / 2, cy = H / 2;
      var orbits = Math.max(2, Math.round(3 * p.density));
      U.rr(ctx, cx - 90 * S, cy - 90 * S, 180 * S, 180 * S, 28 * S);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      ctx.strokeStyle = U.rgba(A, 0.6); ctx.lineWidth = 2 * S; ctx.stroke();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(44 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(str.slice(0, 6), cx, cy);
      for (var o = 0; o < orbits; o++) {
        var R = 200 * S + o * 110 * S;
        ctx.strokeStyle = U.rgba(U.ink, 0.12); ctx.lineWidth = 1.2 * S;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        var satN = 2 + (o % 2);
        for (var s2 = 0; s2 < satN; s2++) {
          var a0 = tt * (0.6 - o * 0.14) * (o % 2 ? -1 : 1) + s2 * Math.PI + o;
          var x = cx + Math.cos(a0) * R, y = cy + Math.sin(a0) * R;
          /* 尾迹 */
          var tg = ctx.createLinearGradient(cx + Math.cos(a0 - 0.5) * R, cy + Math.sin(a0 - 0.5) * R, x, y);
          tg.addColorStop(0, U.rgba(o % 2 ? B : A, 0));
          tg.addColorStop(1, U.rgba(o % 2 ? B : A, 0.7));
          ctx.strokeStyle = tg; ctx.lineWidth = 2.4 * S;
          ctx.beginPath(); ctx.arc(cx, cy, R, a0 - 0.5, a0); ctx.stroke();
          ctx.fillStyle = o % 2 ? B : A;
          ctx.beginPath(); ctx.arc(x, y, 9 * S, 0, 7); ctx.fill();
          ctx.fillStyle = U.rgba(U.ink, 0.9);
          ctx.beginPath(); ctx.arc(x, y, 3.4 * S, 0, 7); ctx.fill();
        }
      }
    }

    else if (kind === 'animlist') {
      /* Animated List：通知卡片依次滑入堆叠 */
      var names = ['嘉', 'Wei', 'Luna', 'Kai', 'Mo', 'Ana'];
      var acts = ['赞了你的动态', '关注了你', '评论：太强了', '转发了作品', '收藏了文章', '加入了群组'];
      var cyc = 2.4 / Math.max(0.3, p.speed);
      var cardW = 520 * S, cardH = 110 * S;
      var rx = W - W * 0.09 - cardW, ry0 = H * 0.14;
      for (var k = 0; k < 3; k++) {
        var age = (t / cyc + k) % 3;   /* 0=最新 */
        var itemIdx = Math.floor(t / cyc) + k;
        var pr = age - Math.floor(age);
        var eIn = U.ease.outBack(Math.min(1, pr * 3));
        var y = ry0 + k * (cardH + 20 * S);
        var x = rx + (1 - eIn) * (cardW * 0.4);
        var alpha = k === 2 ? 1 - U.ease.inQuad(Math.max(0, (pr - 0.75) * 4)) : 1;
        ctx.globalAlpha = Math.max(0, alpha);
        U.rr(ctx, x, y, cardW, cardH, 18 * S);
        ctx.fillStyle = U.rgba(U.bg2, 0.92); ctx.fill();
        ctx.strokeStyle = U.rgba(U.ink, 0.10); ctx.lineWidth = 1.2 * S; ctx.stroke();
        var ni = ((itemIdx % names.length) + names.length) % names.length;
        var ai = ((itemIdx * 2 + 1) % acts.length + acts.length) % acts.length;
        var avC = [A, B, U.mix(A, B, 0.5)][ni % 3];
        ctx.fillStyle = avC;
        ctx.beginPath(); ctx.arc(x + 55 * S, y + cardH / 2, 32 * S, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgba('#FFFFFF', 0.92);
        ctx.font = U.fs(28 * S, 700);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(names[ni].charAt(0), x + 55 * S, y + cardH / 2);
        ctx.fillStyle = U.rgba(U.ink, 0.9);
        ctx.textAlign = 'left';
        ctx.font = U.fs(26 * S, 600);
        ctx.fillText(names[ni], x + 105 * S, y + cardH * 0.34);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.font = U.fs(22 * S, 400);
        ctx.fillText(acts[ai], x + 105 * S, y + cardH * 0.68);
        ctx.globalAlpha = 1;
      }
    }

    else if (kind === 'ring') {
      /* Animated Circular Progress：环形进度充能 */
      var cyc = 4 / Math.max(0.3, p.speed);
      var pr = Math.min(1, (t % cyc) / (cyc * 0.6));
      var e = U.ease.outExpo(pr);
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.28;
      ctx.strokeStyle = U.rgba(U.ink, 0.10); ctx.lineWidth = 26 * S;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      var g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      g.addColorStop(0, A); g.addColorStop(1, B);
      ctx.strokeStyle = g; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + e * Math.PI * 2); ctx.stroke();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(72 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(e * 100) + '%', cx, cy);
      /* 头部亮点 */
      var ha = -Math.PI / 2 + e * Math.PI * 2;
      var hg = ctx.createRadialGradient(cx + Math.cos(ha) * R, cy + Math.sin(ha) * R, 0, cx + Math.cos(ha) * R, cy + Math.sin(ha) * R, 34 * S);
      hg.addColorStop(0, U.rgba(U.ink, 0.9)); hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(cx + Math.cos(ha) * R, cy + Math.sin(ha) * R, 34 * S, 0, 7); ctx.fill();
    }

    else if (kind === 'avatars') {
      /* Avatar Circles：头像组依次弹入 + 计数徽章 */
      var total = 6;
      var cyc = 4.2 / Math.max(0.3, p.speed);
      var shown = Math.min(total, Math.floor((t % cyc) / 0.35) + 1);
      var R = 64 * S, ov = R * 1.4;
      var x0 = W / 2 - ov * (shown - 1) / 2;
      var cols = [A, B, U.mix(A, B, 0.35), U.mix(A, U.ink, 0.3), U.mix(B, U.ink, 0.3), U.mix(A, B, 0.7)];
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < shown; i++) {
        var age = (t % cyc) - i * 0.35;
        var e = U.ease.outBack(Math.max(0, Math.min(1, age / 0.45)));
        var x = x0 + i * ov, y = H / 2 + (1 - e) * 60 * S;
        ctx.fillStyle = U.bg1;
        ctx.beginPath(); ctx.arc(x, y, R + 6 * S, 0, 7); ctx.fill();
        ctx.fillStyle = cols[i % cols.length];
        ctx.beginPath(); ctx.arc(x, y, R * e, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgba('#FFFFFF', 0.92);
        ctx.font = U.fs(R * 0.7, 700);
        ctx.fillText(String.fromCharCode(65 + i), x, y + (1 - e) * 20 * S);
      }
      /* +N 徽章 */
      var bx = x0 + shown * ov - ov / 2;
      ctx.fillStyle = U.bg2;
      ctx.beginPath(); ctx.arc(bx, H / 2, R + 6 * S, 0, 7); ctx.fill();
      ctx.strokeStyle = U.rgba(A, 0.7); ctx.lineWidth = 2 * S; ctx.stroke();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(R * 0.56, 700);
      ctx.fillText('+' + (total - shown), bx, H / 2);
      ctx.fillStyle = U.rgba(U.ink, 0.45);
      ctx.font = U.fs(26 * S, 500);
      ctx.fillText('正在加入', W / 2, H / 2 + R * 2);
    }

    else if (kind === 'confetti') {
      /* Confetti：周期彩带爆发 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cyc = 2.8 / Math.max(0.3, p.speed);
      var bt = t % cyc;
      var burst = Math.floor(t / cyc);
      var cx = W / 2, cy = H * 0.42;
      var n = 90;
      for (var i = 0; i < n; i++) {
        var a0 = U.rng(i * 3.1 + burst * 17) * Math.PI * 2;
        var v0 = (0.35 + U.rng(i * 7.3 + burst) * 0.65) * H * 0.9;
        var e = Math.min(1, bt / cyc * 1.6);
        var xx = cx + Math.cos(a0) * v0 * e;
        var yy = cy + Math.sin(a0) * v0 * e + 900 * S * e * e;
        var rot = e * (4 + U.rng(i) * 8) + i;
        var a2 = 1 - U.ease.inQuad(Math.max(0, (bt - cyc * 0.55) / (cyc * 0.45)));
        if (a2 <= 0) continue;
        var colr = [A, B, U.mix(A, U.ink, 0.4), U.mix(B, U.ink, 0.4), U.ink][i % 5];
        ctx.save();
        ctx.translate(xx, yy); ctx.rotate(rot);
        ctx.fillStyle = U.rgba(colr, a2);
        ctx.fillRect(-9 * S, -4 * S, 18 * S, 8 * S);
        ctx.restore();
      }
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * S);
      var flash = Math.max(0, 1 - bt / 0.3);
      cg.addColorStop(0, U.rgba(U.mix(A, U.ink, 0.5), 0.5 * flash)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    }
  }

  /* ══════════ 注册 ══════════ */

  /* A. React Bits 背景 · 上 · 8 */
  MF.forge({
    cat: '背景循环', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'squares', sel(['squares', 'waves', 'threads', 'lightning', 'letterglitch', 'dotgrid', 'faulty', 'plasma'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('scale', '尺度', 1, rng(1, 0.3, 2.5, 0.05)),
      P('text', '文本', 'SYSTEM BOOT OK\n> connect forge.dev\n> rendering motion...', txt(true))
    ],
    draw: rbDraw,
    ids: [
      { id: 'nx-squares', name: '方块涟漪', desc: '方格边框阵列上，一圈涟漪从中心周期性扫过点亮（React Bits Squares）', tags: ['Squares', '方格', '背景'], cfg: { kind: 'squares' } },
      { id: 'nx-waves', name: '层叠波涛', desc: '多组波形从底部层层涌起，前低后高、双色交替，海面呼吸感', tags: ['Waves', '波涛', '背景'], cfg: { kind: 'waves' } },
      { id: 'nx-threads', name: '流动彩线', desc: '十几条彩色丝线同向流动，色相在主辅色间循环渐变（React Bits Threads）', tags: ['Threads', '丝线', '背景'], cfg: { kind: 'threads' } },
      { id: 'nx-lightning', name: '夜空闪电', desc: '中点位移算法生成的分形闪电，随机落点、分叉与全屏闪白', tags: ['Lightning', '闪电', '氛围'], cfg: { kind: 'lightning' } },
      { id: 'nx-letter-glitch', name: '字符乱码墙', desc: '满屏字符低频乱跳，少数格子亮起主辅色，黑客帝国的背景墙', tags: ['LetterGlitch', '字符', '背景'], cfg: { kind: 'letterglitch' } },
      { id: 'nx-dot-ripple', name: '点阵涟漪', desc: '波源游走于画布，点阵随之起涟漪，近亮远暗（React Bits DotGrid）', tags: ['DotGrid', '点阵', '涟漪'], cfg: { kind: 'dotgrid' } },
      { id: 'nx-faulty-terminal', name: '故障终端', desc: 'CRT 终端逐行输出乱码，扫描线游走，偶发水平错位切片', tags: ['Terminal', '故障', '科幻'], cfg: { kind: 'faulty' } },
      { id: 'nx-plasma', name: '等离子色场', desc: '四组正弦干涉的经典 Plasma 色场，缓慢流动的迷幻渐变', tags: ['Plasma', '色场', '复古'], cfg: { kind: 'plasma' } }
    ]
  });

  /* B. React Bits 背景 · 下 · 9 */
  MF.forge({
    cat: '光影氛围', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'molten', sel(['molten', 'lightrays', 'beams', 'topo', 'blinds', 'pixelpop', 'ghost', 'laser'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('scale', '尺度', 1, rng(1, 0.3, 2.5, 0.05)),
      P('text', '文本', 'JAYKOU', txt())
    ],
    draw: rb2Draw,
    ids: [
      { id: 'nx-molten', name: '熔融金属', desc: '暗色液态金属表面翻涌，noise 脊线透出炽热裂光（Molten Metal）', tags: ['Molten', '金属', '背景'], cfg: { kind: 'molten' } },
      { id: 'nx-light-rays', name: '体积光柱', desc: '顶部光源洒下多道体积光，尘埃在光柱中漂浮（Light Rays）', tags: ['LightRays', '光柱', '氛围'], cfg: { kind: 'lightrays' } },
      { id: 'nx-beams', name: '斜扫光束', desc: '数道斜向光束周期性横扫全屏，宽窄错落、双色交替（Beams）', tags: ['Beams', '光束', '氛围'], cfg: { kind: 'beams' } },
      { id: 'nx-topo', name: '等高地形', desc: '等高线式山脊层层推移，主色脊线点缀，地图集质感', tags: ['Topography', '等高线', '背景'], cfg: { kind: 'topo' } },
      { id: 'nx-blinds', name: '百叶渐变', desc: '竖向百叶条起伏波动，渐变透明度如窗帘轻摆（Gradient Blinds）', tags: ['Blinds', '百叶', '背景'], cfg: { kind: 'blinds' } },
      { id: 'nx-pixel-snow', name: '像素落雪', desc: '粗像素雪片随风漂移缓落，偶有亮色雪粒，复古像素风', tags: ['Pixel', '落雪', '背景'], cfg: { kind: 'pixelpop' } },
      { id: 'nx-ghost-fibers', name: '幽雾纤维', desc: '垂直柔性光纤维缓缓摆动，屏幕混合出幽雾般的纵深', tags: ['Fibers', '幽雾', '背景'], cfg: { kind: 'ghost' } },
      { id: 'nx-laser-flow', name: '激光穿梭', desc: '激光细线高速横穿画面，头亮尾长，赛博速度感（Laser Flow）', tags: ['Laser', '激光', '速度'], cfg: { kind: 'laser' } }
    ]
  });

  /* C. Magic UI 背景 · 8 */
  MF.forge({
    cat: '光影氛围', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'meteors', sel(['meteors', 'retrogrid', 'ripple', 'dotpulse', 'flicker', 'warp', 'globe', 'shooting'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('scale', '尺度', 1, rng(1, 0.3, 2.5, 0.05)),
      P('text', '文本', 'MF', txt())
    ],
    draw: muiDraw,
    ids: [
      { id: 'nx-meteors', name: '流星群', desc: '斜向流星群循环划过，头亮尾长、疏密有致（Magic UI Meteors）', tags: ['Meteors', '流星', '氛围'], cfg: { kind: 'meteors' } },
      { id: 'nx-retro-grid', name: '合成波地平线', desc: '透视地板网格无限滚动，条纹落日悬在地平线，复古未来主义', tags: ['RetroGrid', '合成波', '背景'], cfg: { kind: 'retrogrid' } },
      { id: 'nx-ripple-ring', name: '涟漪圆环', desc: '圆环从中心周期性扩散，简洁通透的信号感（Magic UI Ripple）', tags: ['Ripple', '圆环', '信号'], cfg: { kind: 'ripple' } },
      { id: 'nx-dot-pulse', name: '点阵呼吸', desc: '点阵随波呼吸明暗，从中心向外扩散的光波', tags: ['DotPattern', '点阵', '呼吸'], cfg: { kind: 'dotpulse' } },
      { id: 'nx-flicker-grid', name: '闪烁网格', desc: '网格单元随机点亮又熄灭，数字空间的信号噪声', tags: ['FlickeringGrid', '闪烁', '背景'], cfg: { kind: 'flicker' } },
      { id: 'nx-warp-stars', name: '曲率星驰', desc: '星点带弧形残影从中心飞出，曲率航行的失真感', tags: ['Warp', '星驰', '穿梭'], cfg: { kind: 'warp' } },
      { id: 'nx-globe', name: '线框地球', desc: '线框地球缓缓自转，表面光点脉明明灭', tags: ['Globe', '地球', '科技'], cfg: { kind: 'globe' } },
      { id: 'nx-shooting-star', name: '彗星划过', desc: '单颗大彗星周期性划过星野，拖出炽亮尾迹（Shooting Star）', tags: ['ShootingStar', '彗星', '氛围'], cfg: { kind: 'shooting' } }
    ]
  });

  /* D. Magic UI 文字 · 8 */
  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.5,
    params: [
      P('kind', '形态', 'aurora-text', sel(['aurora-text', 'word-rotate', 'spinning-text', 'flip-text', 'decrypted', 'fuzzy', 'curved', 'countup'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('size', '字号', 190.0, rng(190.0, 60.0, 416.0, 2.0)),
      P('text', '文本', 'AURORA', txt(true))
    ],
    draw: muiTextDraw,
    ids: [
      { id: 'nx-aurora-text', name: '极光渐变字', desc: '极光渐变在文字内部流动，外发光随色相呼吸（Aurora Text）', tags: ['AuroraText', '渐变', '标题'], cfg: { kind: 'aurora-text', text: 'AURORA' } },
      { id: 'nx-word-rotate', name: '词组轮播', desc: '词组上滑轮换，当前词主色高亮，底部进度指示（Word Rotate）', tags: ['WordRotate', '轮播', '标题'], cfg: { kind: 'word-rotate', text: 'SHIP FAST|SHIP GOOD|SHIP MORE' } },
      { id: 'nx-spinning-text', name: '环形旋转字', desc: '文字沿圆环切向旋转，远近明暗自然起伏（Spinning Text）', tags: ['SpinningText', '环形', '标识'], cfg: { kind: 'spinning-text', text: 'JAYKOU · STUDIO · ' } },
      { id: 'nx-flip-text', name: '翻牌字', desc: '字符依次绕横轴翻转，正反面色切换，机械翻牌质感', tags: ['FlipText', '翻牌', '标题'], cfg: { kind: 'flip-text', text: 'FLIP IT', size: 320} },
      { id: 'nx-decrypt', name: '解密显影', desc: '乱码逐字解密落定，当前字主色高亮，谍战片开场（DecryptedText）', tags: ['Decrypted', '解密', '标题'], cfg: { kind: 'decrypted', text: 'ACCESS GRANTED' } },
      { id: 'nx-fuzzy-text', name: '失焦呼吸字', desc: '文字在模糊与清晰间呼吸，聚焦瞬间锐利（FuzzyText）', tags: ['FuzzyText', '模糊', '标题'], cfg: { kind: 'fuzzy', text: 'FOCUS', size: 320} },
      { id: 'nx-curved-loop', name: '弧形循环字', desc: '文字沿弧线无限滚动，像一枚会转的徽章弧带（CurvedLoop）', tags: ['CurvedLoop', '弧形', '循环'], cfg: { kind: 'curved', text: 'JAYKOU STUDIO' } },
      { id: 'nx-countup', name: '数字滚动', desc: '数字以 outExpo 曲线滚动到位，底部进度条同步（Number Ticker）', tags: ['NumberTicker', '计数', '数据'], cfg: { kind: 'countup', text: '5201314', size: 320 } }
    ]
  });

  /* E. Magic UI 组件 · 6 */
  MF.forge({
    cat: '界面组件', type: 'component', dur: 6, poster: 0.5,
    params: [
      P('kind', '形态', 'marquee', sel(['marquee', 'orbiting', 'animlist', 'ring', 'avatars', 'confetti'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('text', '文本', 'MF|PRO|UI|KIT|LAB|DEV', txt())
    ],
    draw: muiCompDraw,
    ids: [
      { id: 'nx-marquee', name: '双行跑马灯', desc: '双行 Logo 胶囊反向无限滚动，两侧渐隐（Marquee / LogoLoop）', tags: ['Marquee', '跑马灯', '组件'], cfg: { kind: 'marquee', text: 'MF|PRO|UI|KIT|LAB|DEV' } },
      { id: 'nx-orbiting', name: '轨道环绕点', desc: '中心 Logo 徽标，多层轨道上卫星点带尾迹环绕（Orbiting Circles）', tags: ['Orbiting', '轨道', '组件'], cfg: { kind: 'orbiting', text: 'MF' } },
      { id: 'nx-anim-list', name: '通知滑入流', desc: '通知卡片从右上依次弹入堆叠，自动轮播（Animated List）', tags: ['AnimatedList', '通知', '组件'], cfg: { kind: 'animlist' } },
      { id: 'nx-ring-progress', name: '环形充能进度', desc: '渐变环形进度充能扫过，头部亮点拖光（Circular Progress）', tags: ['Progress', '环形', '组件'], cfg: { kind: 'ring' } },
      { id: 'nx-avatar-circles', name: '头像堆叠弹入', desc: '头像组依次弹性弹入堆叠，尾部 +N 计数徽章（Avatar Circles）', tags: ['Avatars', '头像', '社交'], cfg: { kind: 'avatars' } },
      { id: 'nx-confetti', name: '彩带爆发', desc: '周期性彩带从中心爆发，重力下坠、旋转纷飞（Confetti）', tags: ['Confetti', '彩带', '庆祝'], cfg: { kind: 'confetti' } }
    ]
  });
})();

/* ════════ assets/js/effects-23.js ════════ */
/* ==========================================================================
   Jaykou — effects-23 · 场景灵感批次
   取经：LottieFiles 高频场景、GSAP Showcase、CodePen 经典 Canvas 榜、
        各大 motion 网站常青款（气泡/旗帜/万花筒/DNA/太阳系/黑胶/均衡器/
        牛顿摆/融合球/等距波/流场/代码雨/雷达/翻页倒计时/仪表盘/K线/
        条形竞赛/排行榜/报价跑马灯/聊天/点赞/加购/昼夜/骨架屏/上传/
        勋章/优惠券/键盘/故障字/碎裂/光圈/百叶/变焦）
   硬约束：draw 完全自包含（只依赖 ctx/t/p/U），可被 toString 序列化导出。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF, P = MF.P, rng = MF.rng, txt = MF.txt, col = MF.col;
  function sel(arr) {
    return { type: 'select', options: arr.map(function (x) { return Array.isArray(x) ? x : [x, x]; }) };
  }

  /* ══════════ A. 创意生活 ══════════ */
  function lifeDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var den = Math.max(0.3, p.density), sc = Math.max(0.2, p.scale);

    if (kind === 'bubbles') {
      /* 气泡上浮：摇摆上升，近大远小，顶部轻爆 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = Math.round(34 * den);
      for (var i = 0; i < n; i++) {
        var x0 = U.rnd(0, 1, i) * W;
        var sp = (40 + 110 * U.rng(i * 3.3)) * S;
        var y = H + 60 * S - ((tt * sp + U.rnd(0, H, i + 9)) % (H + 120 * S));
        var x = x0 + Math.sin(tt * (0.8 + U.rng(i)) + i) * 34 * S;
        var r = (6 + 26 * U.rng(i * 5.1)) * S;
        var a2 = 0.10 + 0.35 * U.rng(i * 7.7);
        ctx.strokeStyle = U.rgba(i % 5 === 0 ? A : U.ink, a2 + 0.25);
        ctx.lineWidth = 1.4 * S;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
        g.addColorStop(0, U.rgba(U.ink, a2 * 1.6)); g.addColorStop(1, U.rgba(U.ink, 0.02));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        /* 高光点 */
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.beginPath(); ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.14, 0, 7); ctx.fill();
      }
    }

    else if (kind === 'balloon') {
      /* 气球升空：缓升摇摆 + 绳线 + 高光 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = Math.round(5 * den) + 1;
      for (var i = 0; i < n; i++) {
        var sp = (26 + 30 * U.rng(i * 3)) * S;
        var y = H + 140 * S - ((tt * sp + U.rnd(0, H * 1.4, i + 3)) % (H + 280 * S));
        var sway = Math.sin(tt * 0.7 + i * 1.7) * 40 * S;
        var x = W * (0.14 + 0.72 * U.rng(i * 7)) + sway;
        var r = (34 + 30 * U.rng(i * 5)) * S;
        var colr = [A, B, U.mix(A, B, 0.5), U.mix(A, U.ink, 0.3), U.mix(B, U.ink, 0.3)][i % 5];
        /* 绳 */
        ctx.strokeStyle = U.rgba(U.ink, 0.35); ctx.lineWidth = 1.3 * S;
        ctx.beginPath();
        ctx.moveTo(x, y + r * 1.28);
        ctx.quadraticCurveTo(x - sway * 0.5, y + r * 1.28 + 60 * S, x - sway, y + r * 1.28 + 130 * S);
        ctx.stroke();
        /* 球体 */
        var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 1.2);
        g.addColorStop(0, U.mix(colr, U.ink, 0.55)); g.addColorStop(1, U.mix(colr, '#000000', 0.25));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(x, y, r * 0.86, r, 0, 0, 7); ctx.fill();
        /* 尾巴 */
        ctx.beginPath();
        ctx.moveTo(x - 7 * S, y + r * 1.02);
        ctx.lineTo(x, y + r * 1.3);
        ctx.lineTo(x + 7 * S, y + r * 1.02);
        ctx.closePath(); ctx.fillStyle = g; ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.42, r * 0.16, r * 0.24, -0.5, 0, 7); ctx.fill();
      }
    }

    else if (kind === 'flag') {
      /* 旗帜波浪：网格旗面 traveling wave + 明暗 */
      var ox = W * 0.22, oy = H * 0.2, fw = W * 0.56, fh = H * 0.52;
      var colsN = 30, rowsN = 18;
      /* 旗杆 */
      ctx.strokeStyle = U.rgba(U.ink, 0.5); ctx.lineWidth = 5 * S;
      ctx.beginPath(); ctx.moveTo(ox - 8 * S, oy - 30 * S); ctx.lineTo(ox - 8 * S, H * 0.92); ctx.stroke();
      ctx.fillStyle = U.rgba(A, 0.9);
      ctx.beginPath(); ctx.arc(ox - 8 * S, oy - 34 * S, 9 * S, 0, 7); ctx.fill();
      for (var r2 = 0; r2 < rowsN; r2++) {
        ctx.beginPath();
        for (var c = 0; c <= colsN; c++) {
          var fx = c / colsN, fy = r2 / rowsN;
          var wav = Math.sin(fx * 6.5 * sc - tt * 3.2) * 26 * S * fx + U.noise2(fx * 3, fy * 3 + tt * 0.3) * 10 * S;
          var x = ox + fx * fw;
          var y = oy + fy * fh + wav;
          if (c === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var shade = 0.5 + 0.5 * Math.sin(r2 / rowsN * 3 + tt * 3.2);
        ctx.strokeStyle = U.rgba(r2 % 4 === 0 ? A : (r2 % 4 === 2 ? B : U.ink), 0.35 + shade * 0.5);
        ctx.lineWidth = (r2 % 4 === 0 ? 3.4 : 2) * S;
        ctx.stroke();
      }
    }

    else if (kind === 'kaleido') {
      /* 万花筒：N 重镜像对称的粒子与光弧 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var folds = Math.max(4, Math.round(8 * den));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = 'screen';
      for (var f = 0; f < folds; f++) {
        ctx.save();
        ctx.rotate(f / folds * Math.PI * 2 + tt * 0.1);
        for (var i = 0; i < 5; i++) {
          var pr = (tt * 0.35 + i / 5 + U.rng(f * 7 + i)) % 1;
          var r = pr * Math.min(W, H) * 0.48;
          var a0 = Math.sin(tt * (0.6 + U.rng(f + i)) + i * 2) * 0.7;
          var x = Math.cos(a0) * r, y = Math.sin(a0) * r;
          var colr = i % 2 ? A : B;
          ctx.fillStyle = U.rgba(colr, (1 - pr) * 0.7);
          ctx.beginPath(); ctx.arc(x, y, (4 + 12 * (1 - pr)) * S, 0, 7); ctx.fill();
        }
        /* 光弧 */
        ctx.strokeStyle = U.rgba(U.mix(A, B, f / folds), 0.25);
        ctx.lineWidth = 2 * S;
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(W, H) * (0.18 + 0.24 * ((tt * 0.2 + f / folds) % 1)), tt % 6.28, tt % 6.28 + 1.2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * S);
      cg.addColorStop(0, U.rgba(U.ink, 0.6)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 120 * S, 0, 7); ctx.fill();
    }

    else if (kind === 'dna') {
      /* DNA 双螺旋：双链相位差 + 横档，滚动旋转 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, amp = W * 0.16 * sc, R = Math.min(W, H) * 0.13;
      var cycles = Math.max(3, Math.round(6 * den));
      for (var i = 0; i <= 60 * cycles; i++) {
        var f = i / (60 * cycles);
        var y = H * 0.08 + f * H * 0.84;
        var ph = f * Math.PI * 2 * cycles + tt * 2.2;
        var x1 = cx + Math.sin(ph) * amp;
        var x2 = cx + Math.sin(ph + Math.PI) * amp;
        var depth1 = (Math.cos(ph) + 1) / 2, depth2 = (Math.cos(ph + Math.PI) + 1) / 2;
        /* 横档 */
        if (i % 5 === 0) {
          ctx.strokeStyle = U.rgba(U.ink, 0.18 + Math.min(depth1, depth2) * 0.3);
          ctx.lineWidth = 2.4 * S;
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
          var rg = Math.floor(i / 5) % 3;
          ctx.fillStyle = U.rgba(rg === 0 ? A : (rg === 1 ? B : U.mix(A, B, 0.5)), 0.85);
          ctx.beginPath(); ctx.arc(x1, y, 5 * S, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(x2, y, 5 * S, 0, 7); ctx.fill();
        }
        /* 双链 */
        ctx.fillStyle = U.rgba(A, 0.25 + depth1 * 0.7);
        ctx.beginPath(); ctx.arc(x1, y, (2.5 + depth1 * 4.5) * S, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgba(B, 0.25 + depth2 * 0.7);
        ctx.beginPath(); ctx.arc(x2, y, (2.5 + depth2 * 4.5) * S, 0, 7); ctx.fill();
      }
    }

    else if (kind === 'solar') {
      /* 太阳系：恒星 + 行星轨道 + 行星卫星 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var planets = Math.max(3, Math.round(5 * den));
      /* 恒星 */
      var sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110 * S);
      sg.addColorStop(0, U.rgba(U.mix(A, U.ink, 0.6), 1)); sg.addColorStop(0.4, U.rgba(A, 0.7)); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, 110 * S, 0, 7); ctx.fill();
      for (var i = 0; i < planets; i++) {
        var R = 150 * S + i * 92 * S * sc;
        ctx.strokeStyle = U.rgba(U.ink, 0.10); ctx.lineWidth = 1.1 * S;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        var sp = (0.9 / Math.pow(R / (150 * S), 1.5));
        var a0 = tt * sp + i * 2.4;
        var px = cx + Math.cos(a0) * R, py = cy + Math.sin(a0) * R;
        var pr = (8 + 5 * (i % 3)) * S;
        var colr = i % 2 ? B : U.mix(A, U.ink, 0.2);
        ctx.fillStyle = colr;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgba('#000000', 0.35);
        ctx.beginPath(); ctx.arc(px + pr * 0.3, py + pr * 0.2, pr, 0, 7);
        /* 月亮 */
        if (i % 2 === 1) {
          var mr = pr * 2.6;
          var ma = a0 * 3 + i;
          ctx.strokeStyle = U.rgba(U.ink, 0.08);
          ctx.beginPath(); ctx.arc(px, py, mr, 0, 7); ctx.stroke();
          ctx.fillStyle = U.rgba(U.ink, 0.75);
          ctx.beginPath(); ctx.arc(px + Math.cos(ma) * mr, py + Math.sin(ma) * mr, pr * 0.32, 0, 7); ctx.fill();
        }
        /* 彗尾轨迹 */
        var tg = ctx.createLinearGradient(px - Math.cos(a0 - 0.6) * R, py - Math.sin(a0 - 0.6) * R, px, py);
        tg.addColorStop(0, U.rgba(colr, 0)); tg.addColorStop(1, U.rgba(colr, 0.4));
        ctx.strokeStyle = tg; ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.arc(cx, cy, R, a0 - 0.6, a0); ctx.stroke();
      }
    }

    else if (kind === 'vinyl') {
      /* 黑胶唱片：旋转唱片 + 唱臂摆动 + 音符 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W * 0.42, cy = H / 2, R = Math.min(W, H) * 0.34;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(tt * 1.4);
      ctx.fillStyle = '#0C0C10';
      ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      for (var g2 = 0.32; g2 < 1; g2 += 0.045) {
        ctx.strokeStyle = U.rgba(U.ink, 0.05 + 0.05 * Math.sin(g2 * 40));
        ctx.lineWidth = 1 * S;
        ctx.beginPath(); ctx.arc(0, 0, R * g2, 0, 7); ctx.stroke();
      }
      /* 高光扫 */
      var hg = ctx.createLinearGradient(-R, -R, R, R);
      hg.addColorStop(0.2, 'rgba(0,0,0,0)'); hg.addColorStop(0.5, U.rgba(U.ink, 0.06)); hg.addColorStop(0.8, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      /* 唱片标 */
      ctx.fillStyle = A;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.3, 0, 7); ctx.fill();
      ctx.fillStyle = U.bg1;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.045, 0, 7); ctx.fill();
      ctx.restore();
      /* 唱臂 */
      var armA = -0.5 + Math.sin(tt * 0.16) * 0.3;
      var ax0 = cx + R * 1.15, ay0 = cy - R * 0.9;
      ctx.strokeStyle = U.rgba(U.ink, 0.55); ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax0, ay0);
      ctx.lineTo(ax0 + Math.cos(armA) * R * 1.1, ay0 + Math.sin(armA + 0.9) * R * 1.1);
      ctx.stroke();
      /* 音符 */
      ctx.fillStyle = U.rgba(B, 0.8);
      ctx.font = U.fs(34 * S, 700);
      ctx.textAlign = 'center';
      for (var m = 0; m < 3; m++) {
        var mp = (tt * 0.5 + m / 3) % 1;
        ctx.globalAlpha = 1 - mp;
        ctx.fillText('♪', cx + R * 0.7 + mp * 60 * S, cy - R * 0.5 - mp * 130 * S);
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'equalizer') {
      /* 律动均衡柱：节拍量化包络 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = Math.max(10, Math.round(28 * den));
      var bw = W / n;
      var beat = tt * 2.1;
      for (var i = 0; i < n; i++) {
        var bi = Math.floor(beat * 2) / 2;
        var kick = Math.max(0, 1 - ((beat - bi)) * 3) * (i % 4 === 0 ? 0.6 : 0.25);
        var v = (Math.sin(i * 0.7 + beat) * 0.3 + 0.5)
          * (0.4 + 0.6 * U.rng(i * 3.3))
          + kick * (0.4 + 0.6 * U.rng(i * 7.1));
        v = Math.max(0.06, Math.min(1, v));
        var h = v * H * 0.62;
        var colr = v > 0.8 ? U.mix(A, U.ink, 0.3) : (i % 2 ? A : B);
        var g = ctx.createLinearGradient(0, H * 0.86 - h, 0, H * 0.86);
        g.addColorStop(0, colr); g.addColorStop(1, U.rgba(colr, 0.25));
        ctx.fillStyle = g;
        U.rr(ctx, i * bw + bw * 0.14, H * 0.86 - h, bw * 0.72, h, bw * 0.2);
        ctx.fill();
        /* 倒影 */
        ctx.fillStyle = U.rgba(colr, 0.08);
        U.rr(ctx, i * bw + bw * 0.14, H * 0.88, bw * 0.72, h * 0.24, bw * 0.2);
        ctx.fill();
      }
    }

    else if (kind === 'pendulum') {
      /* 牛顿摆：端球交替摆动 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H * 0.32;
      var n = 5, R = Math.min(W, H) * 0.075, gap = R * 2.06;
      var L = H * 0.42;
      var x0 = cx - gap * (n - 1) / 2;
      /* 横梁 */
      ctx.strokeStyle = U.rgba(U.ink, 0.35); ctx.lineWidth = 6 * S;
      ctx.beginPath(); ctx.moveTo(cx - gap * (n - 1) / 2 - R * 2, cy - R * 1.4); ctx.lineTo(cx + gap * (n - 1) / 2 + R * 2, cy - R * 1.4); ctx.stroke();
      var cyc = tt * 1.8;
      var swingL = Math.max(0, Math.sin(cyc)) * 0.9;
      var swingR = Math.max(0, Math.sin(cyc + Math.PI)) * 0.9;
      for (var i = 0; i < n; i++) {
        var ang = 0;
        if (i === 0) ang = -swingL;
        if (i === n - 1) ang = swingR;
        var px = x0 + i * gap + Math.sin(ang) * L;
        var py = cy + Math.cos(ang) * L;
        ctx.strokeStyle = U.rgba(U.ink, 0.3); ctx.lineWidth = 1.6 * S;
        ctx.beginPath(); ctx.moveTo(x0 + i * gap, cy - R * 1.4); ctx.lineTo(px, py); ctx.stroke();
        var colr = (i === 0 || i === n - 1) && Math.abs(ang) > 0.15 ? U.mix(A, U.ink, 0.2) : U.mix(U.ink, U.bg2, 0.4);
        var g = ctx.createRadialGradient(px - R * 0.35, py - R * 0.35, R * 0.1, px, py, R);
        g.addColorStop(0, U.mix(colr, U.ink, 0.6)); g.addColorStop(1, U.mix(colr, '#000000', 0.3));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, R, 0, 7); ctx.fill();
      }
      /* 撞击闪光 */
      var hitPhase = Math.abs(Math.sin(cyc));
      if (hitPhase < 0.12) {
        var side = Math.sin(cyc) > 0 ? 1 : -1;
        var hx = x0 + (side > 0 ? (n - 1) * gap : 0) - side * R;
        var hy = cy + L;
        var fg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 70 * S);
        fg.addColorStop(0, U.rgba(A, 0.5 * (1 - hitPhase / 0.12))); fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.arc(hx, hy, 70 * S, 0, 7); ctx.fill();
      }
    }

    else if (kind === 'metaball') {
      /* 融合球：四个游走 blob 场阈值融合 */
      var cell = Math.max(7, 12 * S);
      var blobs = [];
      var nb = Math.max(2, Math.round(4 * den));
      for (var i = 0; i < nb; i++) {
        blobs.push([
          W / 2 + Math.cos(tt * (0.5 + i * 0.23) + i * 2.1) * W * 0.26 * sc,
          H / 2 + Math.sin(tt * (0.4 + i * 0.31) + i * 1.3) * H * 0.24 * sc,
          (90 + 70 * U.rng(i * 3)) * S
        ]);
      }
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      for (var y = 0; y < H; y += cell) {
        for (var x = 0; x < W; x += cell) {
          var field = 0;
          for (var b = 0; b < blobs.length; b++) {
            var dx = x - blobs[b][0], dy = y - blobs[b][1];
            var d2 = dx * dx + dy * dy;
            field += (blobs[b][2] * blobs[b][2]) / Math.max(1, d2);
          }
          if (field > 1.35) {
            ctx.fillStyle = U.mix(U.mix(B, A, Math.min(1, field / 3)), U.ink, Math.max(0, field - 2) * 0.4);
            ctx.fillRect(x, y, cell + 1, cell + 1);
          } else if (field > 0.9) {
            ctx.fillStyle = U.rgba(B, (field - 0.9) * 0.7);
            ctx.fillRect(x, y, cell + 1, cell + 1);
          }
        }
      }
    }

    else if (kind === 'isowave') {
      /* 等距方块波：菱形柱阵高度波 */
      var colsN = Math.max(8, Math.round(13 * den));
      var tileW = W / colsN * 1.0;
      var tileH = tileW * 0.5;
      var ox = W / 2, oy = H * 0.24;
      for (var r = 0; r < colsN; r++) {
        for (var c = 0; c < colsN; c++) {
          var gx = (c - colsN / 2 + 0.5), gy = (r - colsN / 2 + 0.5);
          var dist = Math.sqrt(gx * gx + gy * gy);
          var h = (Math.sin(dist * 0.55 * sc - tt * 2.2) * 0.5 + 0.5);
          h = Math.pow(h, 1.6);
          var hh = h * H * 0.24 + tileH;
          var x = ox + (gx - gy) * tileW / 2;
          var y = oy + (gx + gy) * tileH / 2;
          var colr = U.mix(U.bg2, U.mix(A, B, dist / colsN * 2), 0.15 + h * 0.8);
          /* 顶面 */
          ctx.fillStyle = U.mix(colr, U.ink, 0.25);
          U.poly(ctx, [[x, y - hh], [x + tileW / 2, y - hh + tileH / 2], [x, y - hh + tileH], [x - tileW / 2, y - hh + tileH / 2]]);
          ctx.fill();
          /* 左面 */
          ctx.fillStyle = U.mix(colr, '#000000', 0.35);
          U.poly(ctx, [[x - tileW / 2, y - hh + tileH / 2], [x, y - hh + tileH], [x, y + tileH], [x - tileW / 2, y + tileH / 2]]);
          ctx.fill();
          /* 右面 */
          ctx.fillStyle = U.mix(colr, '#000000', 0.55);
          U.poly(ctx, [[x + tileW / 2, y - hh + tileH / 2], [x, y - hh + tileH], [x, y + tileH], [x + tileW / 2, y + tileH / 2]]);
          ctx.fill();
        }
      }
    }

    else if (kind === 'flowfield') {
      /* 粒子流场：noise 矢量场中的确定性粒子轨迹 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = Math.round(320 * den);
      var steps = 22;
      for (var i = 0; i < n; i++) {
        var x = U.rnd(0, 1, i) * W;
        var y = U.rnd(0, 1, i + 7) * H;
        var colr = U.rng(i * 3.7) < 0.12 ? A : (U.rng(i * 5.9) < 0.1 ? B : U.ink);
        var a0 = 0.05 + 0.3 * U.rng(i * 9.1);
        ctx.strokeStyle = U.rgba(colr, a0);
        ctx.lineWidth = (0.7 + 1.5 * U.rng(i * 2.3)) * S;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (var s = 0; s < steps; s++) {
          var ang = U.noise2(x * 0.0011 * sc, y * 0.0011 * sc + tt * 0.08) * Math.PI * 2.2;
          x += Math.cos(ang) * 11 * S;
          y += Math.sin(ang) * 11 * S;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    else if (kind === 'coderain') {
      /* 代码雨：字符列下落，头亮尾暗 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var colW = Math.max(16, 26 * S / den);
      var cols = Math.ceil(W / colW);
      var chars = 'アイウエオカキクケコサシスセソ0123456789<>{}[]';
      ctx.font = U.fs(colW * 0.92, 600, true);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (var c = 0; c < cols; c++) {
        var sp = (90 + 200 * U.rng(c * 3.3)) * S;
        var len = 6 + Math.floor(U.rng(c * 7.7) * 12);
        var headY = ((tt * sp + U.rnd(0, H * 2, c)) % (H + 600 * S)) - 300 * S;
        for (var k = 0; k < len; k++) {
          var y = headY - k * colW * 1.05;
          if (y < -colW || y > H + colW) continue;
          var ch = chars.charAt(Math.floor(U.rng(c * 31 + Math.floor((y + tt * 60) / colW) * 7) * chars.length));
          var a2 = k === 0 ? 0.95 : Math.max(0, 0.5 * (1 - k / len));
          ctx.fillStyle = k === 0 ? U.rgba(U.mix(A, U.ink, 0.6), a2) : U.rgba(A, a2 * 0.8);
          ctx.fillText(ch, c * colW + colW / 2, y);
        }
      }
      var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, U.rgba(U.bg1, 0.55));
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'radar') {
      /* 雷达扫描：旋转扇扫 + 目标点经过即亮 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
      for (var rr3 = 1; rr3 <= 4; rr3++) {
        ctx.strokeStyle = U.rgba(U.ink, 0.12); ctx.lineWidth = 1.2 * S;
        ctx.beginPath(); ctx.arc(cx, cy, R * rr3 / 4, 0, 7); ctx.stroke();
      }
      ctx.strokeStyle = U.rgba(U.ink, 0.10);
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      /* 扫描扇 */
      var sw = tt * 1.5;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, U.rgba(A, 0.5)); g.addColorStop(1, U.rgba(A, 0.06));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sw - 0.85, sw);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = U.rgba(U.mix(A, U.ink, 0.5), 0.9); ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sw) * R, cy + Math.sin(sw) * R); ctx.stroke();
      /* 目标 */
      var nb = Math.round(9 * den);
      for (var i = 0; i < nb; i++) {
        var ba = U.rng(i * 3.3) * Math.PI * 2;
        var br = U.rng(i * 7.7) * R * 0.92;
        var diff = ((sw - ba) % 6.283 + 6.283) % 6.283;
        var glow = Math.max(0, 1 - diff / 2.4);
        if (glow <= 0) continue;
        var x = cx + Math.cos(ba) * br, y = cy + Math.sin(ba) * br;
        ctx.fillStyle = U.rgba(i % 4 === 0 ? B : U.mix(A, U.ink, 0.3), glow);
        ctx.beginPath(); ctx.arc(x, y, (3 + glow * 4) * S, 0, 7); ctx.fill();
        ctx.strokeStyle = U.rgba(A, glow * 0.5);
        ctx.beginPath(); ctx.arc(x, y, (6 + (1 - glow) * 22) * S, 0, 7); ctx.stroke();
      }
    }
  }

  /* ══════════ B. 数据图表 ══════════ */
  function dataDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var den = Math.max(0.3, p.density);

    if (kind === 'countdown') {
      /* 翻页倒计时：HH:MM:SS 翻牌 */
      var total = 3725;   /* 1:02:05 */
      var remain = total - Math.floor(tt) % total;
      var hh = Math.floor(remain / 3600), mm = Math.floor(remain % 3600 / 60), ss = remain % 60;
      function pad(v) { return (v < 10 ? '0' : '') + v; }
      var chars = pad(hh) + ':' + pad(mm) + ':' + pad(ss);
      var cardW = 150 * S, cardH = 210 * S, gap = 18 * S;
      var totalW = chars.length * cardW + (chars.length - 1) * gap;
      var x0 = W / 2 - totalW / 2, y0 = H / 2 - cardH / 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < chars.length; i++) {
        var ch = chars.charAt(i);
        var x = x0 + i * (cardW + gap);
        var changed = ch !== (i === 0 || i === 1 || i === 3 || i === 4 || i === 6 || i === 7 ? null : null);
        /* 秒位翻转动画 */
        var flip = 0;
        if (i >= 5 && ss < 1 && tt % 1 < 0.28) flip = Math.sin((tt % 1) / 0.28 * Math.PI);
        U.rr(ctx, x, y0, cardW, cardH, 14 * S);
        ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
        ctx.strokeStyle = U.rgba(U.ink, 0.14); ctx.lineWidth = 1.4 * S; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y0 + cardH / 2); ctx.lineTo(x + cardW, y0 + cardH / 2);
        ctx.strokeStyle = U.rgba(U.bg1, 0.9); ctx.lineWidth = 3 * S; ctx.stroke();
        ctx.save();
        ctx.translate(x + cardW / 2, y0 + cardH / 2);
        ctx.scale(1, 1 - flip * 0.9);
        ctx.fillStyle = i === 2 || i === 5 ? U.rgba(A, 0.8) : U.ink;
        ctx.font = U.fs(120 * S, 800);
        ctx.fillText(ch, 0, 4 * S);
        ctx.restore();
      }
      ctx.fillStyle = U.rgba(U.ink, 0.4);
      ctx.font = U.fs(26 * S, 500);
      ctx.fillText('COUNTDOWN', W / 2, y0 + cardH + 50 * S);
    }

    else if (kind === 'gauge') {
      /* 仪表盘：弧形刻度 + 指针摆动 + 红区 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H * 0.62, R = Math.min(W, H) * 0.34;
      var a0 = Math.PI * 0.85, a1 = Math.PI * 2.15;
      var val = (Math.sin(tt * 0.9) * 0.5 + 0.5) * 0.82 + 0.08;
      /* 刻度弧 */
      ctx.strokeStyle = U.rgba(U.ink, 0.15); ctx.lineWidth = 22 * S;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
      /* 值弧 */
      var g = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
      g.addColorStop(0, B); g.addColorStop(1, A);
      ctx.strokeStyle = g; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, R, a0, a0 + (a1 - a0) * val); ctx.stroke();
      /* 红区 */
      ctx.strokeStyle = U.rgba(A, 0.55); ctx.lineWidth = 22 * S;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0 + (a1 - a0) * 0.85, a1); ctx.stroke();
      /* 刻度线 */
      for (var i = 0; i <= 20; i++) {
        var ta = a0 + (a1 - a0) * i / 20;
        var inner = R * (i % 5 === 0 ? 0.82 : 0.88);
        ctx.strokeStyle = U.rgba(U.ink, i % 5 === 0 ? 0.5 : 0.22);
        ctx.lineWidth = (i % 5 === 0 ? 2.4 : 1.2) * S;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ta) * inner, cy + Math.sin(ta) * inner);
        ctx.lineTo(cx + Math.cos(ta) * R * 0.94, cy + Math.sin(ta) * R * 0.94);
        ctx.stroke();
      }
      /* 指针 */
      var na = a0 + (a1 - a0) * val;
      ctx.strokeStyle = U.ink; ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(na) * R * 0.78, cy + Math.sin(na) * R * 0.78);
      ctx.stroke();
      ctx.fillStyle = A;
      ctx.beginPath(); ctx.arc(cx, cy, 14 * S, 0, 7); ctx.fill();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(64 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(val * 240) + '', cx, cy + R * 0.5);
      ctx.fillStyle = U.rgba(U.ink, 0.4);
      ctx.font = U.fs(24 * S, 500);
      ctx.fillText('RPM ×1000', cx, cy + R * 0.72);
    }

    else if (kind === 'candle') {
      /* K 线图：涨红跌绿（中式配色），向左滚动 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = Math.round(26 * den);
      var cw = W / n;
      var shift = (tt * 1.6) % 1;
      var base = H * 0.5;
      var px = 100;
      var up = '#E0344A', dn = '#18B87A';   /* 涨红跌绿 */
      for (var i = 0; i < n + 1; i++) {
        var seedI = Math.floor(tt * 1.6) + i;
        var o = 100 + (U.rng(seedI * 3.1) - 0.5) * 46;
        var c2 = o + (U.rng(seedI * 7.3) - 0.48) * 60;
        var hi = Math.max(o, c2) + U.rng(seedI * 9.7) * 26;
        var lo = Math.min(o, c2) - U.rng(seedI * 5.9) * 26;
        var yy = function (v) { return H * 0.82 - (v - 40) / 160 * H * 0.6; };
        var x = W - (n - i + shift) * cw;
        if (x < -cw) continue;
        var colr = c2 >= o ? up : dn;
        ctx.strokeStyle = colr; ctx.lineWidth = 1.6 * S;
        ctx.beginPath(); ctx.moveTo(x + cw / 2, yy(hi)); ctx.lineTo(x + cw / 2, yy(lo)); ctx.stroke();
        ctx.fillStyle = colr;
        var top = yy(Math.max(o, c2)), bot = yy(Math.min(o, c2));
        ctx.fillRect(x + cw * 0.18, top, cw * 0.64, Math.max(3, bot - top));
      }
      /* 网格 */
      ctx.strokeStyle = U.rgba(U.ink, 0.06);
      for (var gy = 1; gy < 5; gy++) {
        ctx.beginPath(); ctx.moveTo(0, H * gy / 5); ctx.lineTo(W, H * gy / 5); ctx.stroke();
      }
      /* 现价标签 */
      var lastC = 100 + (U.rng(Math.floor(tt * 1.6) * 7.3) - 0.48) * 60;
      var ly = H * 0.82 - (lastC - 40) / 160 * H * 0.6;
      ctx.fillStyle = U.rgba(A, 0.9);
      U.rr(ctx, W - 120 * S, ly - 20 * S, 108 * S, 40 * S, 8 * S); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = U.fs(24 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(lastC.toFixed(2), W - 66 * S, ly);
    }

    else if (kind === 'barrace') {
      /* 条形竞赛：多列横条此消彼长 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var rows = Math.max(4, Math.round(6 * den));
      var names = ['FORGE', 'FLUX', 'NOVA', 'APEX', 'ZEN', 'VOLT', 'ECHO', 'IRIS'];
      var maxW = W * 0.62;
      var rowH = Math.min(84 * S, (H * 0.76) / rows);
      var y0 = H * 0.12;
      var vals = [];
      for (var i = 0; i < rows; i++) {
        vals.push(0.25 + 0.75 * (0.5 + 0.5 * Math.sin(tt * (0.5 + i * 0.17) + i * 2.2)) * (0.4 + 0.6 * U.rng(i * 3.3)));
      }
      for (var r = 0; r < rows; r++) {
        var v = vals[r];
        var y = y0 + r * rowH;
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.font = U.fs(rowH * 0.34, 700);
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(names[r % names.length], W * 0.30 - 20 * S, y + rowH * 0.5);
        /* 槽 */
        U.rr(ctx, W * 0.30, y + rowH * 0.22, maxW, rowH * 0.56, rowH * 0.28);
        ctx.fillStyle = U.rgba(U.ink, 0.07); ctx.fill();
        /* 值条 */
        var colr = r % 2 ? B : A;
        var g = ctx.createLinearGradient(W * 0.30, 0, W * 0.30 + maxW, 0);
        g.addColorStop(0, colr); g.addColorStop(1, U.mix(colr, U.ink, 0.35));
        ctx.fillStyle = g;
        U.rr(ctx, W * 0.30, y + rowH * 0.22, Math.max(rowH * 0.56, maxW * v), rowH * 0.56, rowH * 0.28);
        ctx.fill();
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(rowH * 0.3, 700);
        ctx.textAlign = 'left';
        ctx.fillText(Math.round(v * 100) + '%', W * 0.30 + Math.max(rowH * 0.56, maxW * v) + 16 * S, y + rowH * 0.5);
      }
    }

    else if (kind === 'rings') {
      /* 多环进度：同心弧各自充能 + 数值 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var ringsN = Math.max(2, Math.round(4 * den));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < ringsN; i++) {
        var R = Math.min(W, H) * (0.14 + 0.09 * i);
        var target = 0.35 + 0.6 * U.rng(i * 7.7);
        var pr = Math.min(1, tt / 2.2 - i * 0.25);
        var e = U.ease.outExpo(Math.max(0, pr));
        var cur = target * Math.min(1, e);
        ctx.strokeStyle = U.rgba(U.ink, 0.09);
        ctx.lineWidth = 16 * S;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        var colr = i % 2 ? B : A;
        ctx.strokeStyle = colr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + cur * Math.PI * 2); ctx.stroke();
        /* 数值 */
        var la = -Math.PI / 2;
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(22 * S, 700);
        ctx.fillText(Math.round(cur * 100) + '%', cx + Math.cos(la) * R, cy + Math.sin(la) * R + (i === 0 ? -20 * S : 0));
      }
      var done = tt > 2.2 + ringsN * 0.25;
      if (done) {
        ctx.fillStyle = U.rgba(U.mix(A, U.ink, 0.3), 0.9);
        ctx.font = U.fs(30 * S, 700);
        ctx.fillText('✓ SYNCED', cx, cy);
      }
    }

    else if (kind === 'sparkline') {
      /* 走势自绘：折线按进度画出 + 面积渐变 + 末端脉冲 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var n = 90;
      var pts = [];
      for (var i = 0; i < n; i++) {
        var v = U.noise2(i * 0.09, 3.7) * 0.5 + U.noise(i * 0.021) * 0.5;
        pts.push([W * 0.08 + i / (n - 1) * W * 0.84, H * 0.55 - v * H * 0.3]);
      }
      var prog = Math.min(1, tt / 2.6);
      var visN = Math.max(2, Math.floor(n * U.ease.outCubic(prog)));
      /* 网格 */
      ctx.strokeStyle = U.rgba(U.ink, 0.07);
      for (var gy = 1; gy < 4; gy++) {
        ctx.beginPath(); ctx.moveTo(W * 0.08, H * (0.25 + gy * 0.17)); ctx.lineTo(W * 0.92, H * (0.25 + gy * 0.17)); ctx.stroke();
      }
      /* 面积 */
      ctx.beginPath();
      ctx.moveTo(pts[0][0], H * 0.85);
      for (var i2 = 0; i2 < visN; i2++) ctx.lineTo(pts[i2][0], pts[i2][1]);
      ctx.lineTo(pts[visN - 1][0], H * 0.85);
      ctx.closePath();
      var g = ctx.createLinearGradient(0, H * 0.2, 0, H * 0.85);
      g.addColorStop(0, U.rgba(A, 0.35)); g.addColorStop(1, U.rgba(A, 0));
      ctx.fillStyle = g; ctx.fill();
      /* 线 */
      ctx.beginPath();
      for (var i3 = 0; i3 < visN; i3++) {
        if (i3 === 0) ctx.moveTo(pts[i3][0], pts[i3][1]); else ctx.lineTo(pts[i3][0], pts[i3][1]);
      }
      ctx.strokeStyle = A; ctx.lineWidth = 3.4 * S; ctx.lineJoin = 'round'; ctx.stroke();
      /* 末端点 */
      var ex = pts[visN - 1][0], ey = pts[visN - 1][1];
      var pulse = 0.5 + 0.5 * Math.sin(tt * 5);
      ctx.fillStyle = U.rgba(A, 0.25 * pulse);
      ctx.beginPath(); ctx.arc(ex, ey, (12 + 10 * pulse) * S, 0, 7); ctx.fill();
      ctx.fillStyle = U.ink;
      ctx.beginPath(); ctx.arc(ex, ey, 6 * S, 0, 7); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'left';
      ctx.fillText('+42.7%', ex + 20 * S, ey - 20 * S);
    }

    else if (kind === 'leaderboard') {
      /* 排行榜：名次随数值变化滑动交换 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var rows = 5;
      var names = ['NOVA', 'FORGE', 'ZEN', 'APEX', 'FLUX'];
      var rowH = Math.min(96 * S, H * 0.8 / rows);
      var y0 = H * 0.1;
      var cyc = 2.2;
      var stepI = Math.floor(tt / cyc);
      var pr2 = (tt % cyc) / cyc;
      function valAt(i2, st) {
        return 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(st * 1.7 + i2 * 2.4)) * (0.5 + U.rng(i2 * 3.3 + st * 0.13));
      }
      var curVals = [], nxtVals = [];
      for (var i = 0; i < rows; i++) {
        curVals.push(valAt(i, stepI));
        nxtVals.push(valAt(i, stepI + 1));
      }
      function ranks(arr) {
        var idx = [0, 1, 2, 3, 4].slice(0, rows);
        idx.sort(function (a2, b2) { return arr[b2] - arr[a2]; });
        var r = [];
        idx.forEach(function (v, k) { r[v] = k; });
        return r;
      }
      var r0 = ranks(curVals), r1 = ranks(nxtVals);
      var e = U.ease.inOutCubic(Math.min(1, pr2 * 2.2));
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (var i2 = 0; i2 < rows; i2++) {
        var yCur = y0 + r0[i2] * rowH, yNxt = y0 + r1[i2] * rowH;
        var y = yCur + (yNxt - yCur) * e;
        var v = curVals[i2] + (nxtVals[i2] - curVals[i2]) * e;
        var rank = Math.round(r0[i2] + (r1[i2] - r0[i2]) * e);
        /* 行卡 */
        U.rr(ctx, W * 0.16, y + rowH * 0.1, W * 0.66, rowH * 0.8, 14 * S);
        ctx.fillStyle = rank === 0 ? U.rgba(A, 0.16) : U.rgba(U.bg2, 0.85);
        ctx.fill();
        ctx.strokeStyle = rank === 0 ? U.rgba(A, 0.7) : U.rgba(U.ink, 0.1);
        ctx.lineWidth = 1.6 * S; ctx.stroke();
        /* 名次徽章 */
        ctx.fillStyle = rank === 0 ? A : U.rgba(U.ink, 0.15);
        ctx.beginPath(); ctx.arc(W * 0.16 + 44 * S, y + rowH * 0.5, 26 * S, 0, 7); ctx.fill();
        ctx.fillStyle = rank === 0 ? '#FFFFFF' : U.ink;
        ctx.font = U.fs(26 * S, 800);
        ctx.textAlign = 'center';
        ctx.fillText(String(rank + 1), W * 0.16 + 44 * S, y + rowH * 0.5);
        ctx.textAlign = 'left';
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(rowH * 0.3, 700);
        ctx.fillText(names[i2], W * 0.16 + 90 * S, y + rowH * 0.5);
        /* 分数条 + 分值 */
        var bw = W * 0.28;
        var bx = W * 0.16 + W * 0.66 - bw - 30 * S;
        U.rr(ctx, bx, y + rowH * 0.4, bw, 12 * S, 6 * S);
        ctx.fillStyle = U.rgba(U.ink, 0.1); ctx.fill();
        ctx.fillStyle = rank === 0 ? A : U.rgba(B, 0.8);
        U.rr(ctx, bx, y + rowH * 0.4, bw * Math.max(0.03, v), 12 * S, 6 * S); ctx.fill();
      }
    }

    else if (kind === 'tape') {
      /* 报价跑马灯：涨红跌绿的 ticker tape */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var syms = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOG', 'AMD'];
      var chipH = 76 * S, gap = 34 * S, cw = 300 * S;
      var span = syms.length * (cw + gap);
      var sp = (tt * 170) % span;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var k = -1; k < Math.ceil(W / span) + 2; k++) {
        for (var i = 0; i < syms.length; i++) {
          var xx = ((k * span + i * (cw + gap) - sp) % (span * 4) + span * 4) % (span * 4) - span;
          if (xx < -cw || xx > W + cw) continue;
          var ch = U.rng(i * 3.3 + 1) - 0.5;
          var pct = (ch * 8);
          var up = pct >= 0;
          var colr = up ? '#E0344A' : '#18B87A';   /* 涨红跌绿 */
          U.rr(ctx, xx, H / 2 - chipH / 2, cw, chipH, 16 * S);
          ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
          ctx.strokeStyle = U.rgba(colr, 0.45); ctx.lineWidth = 1.4 * S; ctx.stroke();
          ctx.fillStyle = U.ink;
          ctx.font = U.fs(30 * S, 700);
          ctx.fillText(syms[i], xx + cw * 0.32, H / 2);
          ctx.fillStyle = colr;
          ctx.font = U.fs(28 * S, 700);
          ctx.fillText((up ? '+' : '') + pct.toFixed(2) + '%', xx + cw * 0.74, H / 2);
        }
      }
      var l = ctx.createLinearGradient(0, 0, W * 0.1, 0);
      l.addColorStop(0, U.bg1); l.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = l; ctx.fillRect(0, 0, W * 0.1, H);
      var r2 = ctx.createLinearGradient(W, 0, W * 0.9, 0);
      r2.addColorStop(0, U.bg1); r2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = r2; ctx.fillRect(W * 0.9, 0, W * 0.1, H);
      ctx.fillStyle = U.rgba(U.ink, 0.35);
      ctx.font = U.fs(22 * S, 500);
      ctx.fillText('MARKET TAPE · LIVE', W / 2, H * 0.2);
    }
  }

  /* ══════════ C. 界面交互 ══════════ */
  function uiDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;

    if (kind === 'chat') {
      /* 聊天气泡：打字指示 → 气泡滑入，左右交替 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var msgs = [
        { me: false, s: '这个动效怎么做出来？' },
        { me: true, s: '用 Jaykou 三分钟搞定' },
        { me: false, s: '真的假的？' },
        { me: true, s: '导出 GIF / MP4 一键搞定' }
      ];
      var cyc = 1.9;
      var shown = Math.min(msgs.length, Math.floor(tt / cyc) + 1);
      var inPr = (tt % cyc) / cyc;
      var bw = Math.min(620 * S, W * 0.56);
      var y = H * 0.12;
      for (var i = 0; i < shown; i++) {
        var m = msgs[i];
        var isNew = i === shown - 1;
        var e = isNew ? U.ease.outBack(Math.min(1, inPr * 2.4)) : 1;
        var bh = 96 * S;
        var bx = m.me ? W * 0.88 - bw : W * 0.12;
        var by = y + (1 - e) * 40 * S;
        ctx.globalAlpha = Math.max(0, Math.min(1, e * 1.4));
        U.rr(ctx, bx, by, bw, bh, 24 * S);
        ctx.fillStyle = m.me ? U.rgba(A, 0.9) : U.rgba(U.bg2, 0.95);
        ctx.fill();
        ctx.fillStyle = m.me ? '#FFFFFF' : U.ink;
        ctx.font = U.fs(30 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(m.s, bx + 34 * S, by + bh / 2);
        ctx.globalAlpha = 1;
        y += bh + 26 * S;
      }
      /* 打字指示 */
      if (shown < msgs.length || inPr < 0.35) {
        var nx = (msgs[Math.min(shown, msgs.length - 1)] || {}).me === false ? W * 0.12 : W * 0.88 - 150 * S;
        U.rr(ctx, nx, Math.min(y, H * 0.8), 150 * S, 70 * S, 20 * S);
        ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        for (var d2 = 0; d2 < 3; d2++) {
          var bounce = Math.abs(Math.sin(tt * 4 + d2 * 0.7));
          ctx.beginPath();
          ctx.arc(nx + 38 * S + d2 * 34 * S, Math.min(y, H * 0.8) + 35 * S - bounce * 8 * S, 7 * S, 0, 7);
          ctx.fill();
        }
      }
    }

    else if (kind === 'like') {
      /* 点赞按钮：心形爆裂 + 计数增长 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cyc = 2.6;
      var bt = (tt % cyc) / cyc;
      var likes = 1024 + Math.floor(tt / cyc);
      var cx = W / 2, cy = H / 2;
      var pop = bt < 0.18 ? U.ease.outBack(bt / 0.18) : (bt > 0.8 ? 1 - (bt - 0.8) / 0.2 * 0.06 : 1);
      var R = 120 * S * pop;
      /* 爆裂粒子 */
      if (bt < 0.5) {
        var pe = U.ease.outCubic(bt / 0.5);
        for (var i = 0; i < 12; i++) {
          var a0 = i / 12 * Math.PI * 2 + 0.3;
          var rr3 = R * 0.9 + pe * 150 * S;
          ctx.fillStyle = U.rgba(i % 2 ? A : B, (1 - pe) * 0.9);
          ctx.beginPath(); ctx.arc(cx + Math.cos(a0) * rr3, cy + Math.sin(a0) * rr3, (4 + (i % 3) * 3) * S * (1 - pe), 0, 7); ctx.fill();
        }
      }
      /* 心 */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pop, pop);
      var s = R / 100;
      ctx.beginPath();
      ctx.moveTo(0, 36 * s);
      ctx.bezierCurveTo(-78 * s, -18 * s, -40 * s, -84 * s, 0, -40 * s);
      ctx.bezierCurveTo(40 * s, -84 * s, 78 * s, -18 * s, 0, 36 * s);
      ctx.closePath();
      var g = ctx.createLinearGradient(0, -R, 0, R);
      g.addColorStop(0, U.mix(A, U.ink, 0.25)); g.addColorStop(1, A);
      ctx.fillStyle = g;
      ctx.shadowColor = U.rgba(A, 0.7); ctx.shadowBlur = 40 * S * pop;
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(44 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(likes.toLocaleString('en-US'), cx, cy + R + 90 * S);
    }

    else if (kind === 'cart') {
      /* 加购飞入：圆点沿弧线飞向购物车，角标弹跳 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cyc = 2.4;
      var bt = (tt % cyc) / cyc;
      var cardX = W * 0.2, cardY = H * 0.3, cardW2 = 340 * S, cardH2 = 300 * S;
      U.rr(ctx, cardX, cardY, cardW2, cardH2, 20 * S);
      ctx.fillStyle = U.rgba(U.bg2, 0.92); ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.1); ctx.lineWidth = 1.4 * S; ctx.stroke();
      ctx.fillStyle = U.rgba(B, 0.35);
      U.rr(ctx, cardX + 30 * S, cardY + 28 * S, cardW2 - 60 * S, 140 * S, 12 * S); ctx.fill();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(28 * S, 700);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('LIMITED EDITION', cardX + 30 * S, cardY + 210 * S);
      ctx.fillStyle = U.rgba(A, 0.9);
      ctx.fillText('¥ 299', cardX + 30 * S, cardY + 256 * S);
      U.rr(ctx, cardX + cardW2 - 150 * S, cardY + 236 * S, 120 * S, 44 * S, 22 * S);
      ctx.fillStyle = A; ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = U.fs(22 * S, 700);
      ctx.textAlign = 'center';
      ctx.fillText('加购', cardX + cardW2 - 90 * S, cardY + 258 * S);
      /* 购物车 */
      var cx = W * 0.82, cy = H * 0.36;
      ctx.strokeStyle = U.ink; ctx.lineWidth = 4 * S; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 50 * S, cy - 20 * S); ctx.lineTo(cx - 30 * S, cy - 20 * S);
      ctx.lineTo(cx - 12 * S, cy + 30 * S); ctx.lineTo(cx + 42 * S, cy + 30 * S);
      ctx.lineTo(cx + 56 * S, cy - 6 * S); ctx.lineTo(cx - 22 * S, cy - 6 * S);
      ctx.stroke();
      ctx.fillStyle = U.ink;
      ctx.beginPath(); ctx.arc(cx - 2 * S, cy + 48 * S, 7 * S, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 32 * S, cy + 48 * S, 7 * S, 0, 7); ctx.fill();
      /* 飞行点 */
      var fly = bt > 0.2 && bt < 0.62 ? U.ease.inOutQuad((bt - 0.2) / 0.42) : (bt >= 0.62 ? 1 : 0);
      if (fly > 0 && fly < 1) {
        var sx = cardX + cardW2 - 90 * S, sy = cardY + 258 * S;
        var fx = sx + (cx - sx) * fly;
        var fy = sy + (cy - sy) * fly - Math.sin(fly * Math.PI) * 180 * S;
        ctx.fillStyle = A;
        ctx.beginPath(); ctx.arc(fx, fy, 11 * S, 0, 7); ctx.fill();
      }
      /* 角标 */
      var badge = bt > 0.6 && bt < 0.85 ? U.ease.outBack((bt - 0.6) / 0.25) : (bt >= 0.85 ? 1 : 0);
      if (badge > 0) {
        var bump = bt > 0.6 && bt < 0.72 ? Math.sin((bt - 0.6) / 0.12 * Math.PI) * 0.25 : 0;
        ctx.save();
        ctx.translate(cx + 58 * S, cy - 28 * S);
        ctx.scale(1 + bump, 1 + bump);
        ctx.fillStyle = U.rgba('#E0344A', 1);
        ctx.beginPath(); ctx.arc(0, 0, 22 * S * badge, 0, 7); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = U.fs(22 * S, 800);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('1', 0, 1);
        ctx.restore();
      }
    }

    else if (kind === 'daynight') {
      /* 昼夜切换：日月光交叉，星现云移 */
      var cyc = 6;
      var pr = (tt % cyc) / cyc;
      var night = pr < 0.5 ? U.ease.inOutQuad(Math.min(1, pr / 0.18)) : 1 - U.ease.inOutQuad(Math.min(1, (pr - 0.5) / 0.18));
      night = Math.max(0, Math.min(1, night));
      var sky = U.mix(U.mix('#BFE3FF', '#FFFFFF', 0.2), U.mix('#0B1026', U.bg1, 0.4), night);
      /* 若主题偏暗则夜间更深 */
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, sky);
      g.addColorStop(1, U.mix(U.mix('#F2FBFF', '#FFFFFF', 0.4), U.mix('#131A38', U.bg2, 0.4), night));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      /* 星星 */
      if (night > 0.15) {
        for (var i = 0; i < 60; i++) {
          var x = U.rnd(0, 1, i) * W, y = U.rnd(0, 0.6, i + 9) * H;
          var tw = 0.4 + 0.6 * Math.abs(Math.sin(tt * 1.4 + i));
          ctx.fillStyle = U.rgba(U.ink, 0.5 * tw * night);
          ctx.fillRect(x, y, 2.4 * S, 2.4 * S);
        }
      }
      /* 日 / 月 */
      var cx = W * 0.72, cy = H * 0.28;
      var sunA = U.rgba(U.mix('#FFB020', U.ink, 0.2), 1 - night * 0.85);
      ctx.fillStyle = sunA;
      ctx.beginPath(); ctx.arc(cx, cy, 70 * S, 0, 7); ctx.fill();
      if (night > 0.1) {
        ctx.fillStyle = U.rgba(U.mix('#E8ECF8', U.ink, 0.3), night);
        ctx.beginPath(); ctx.arc(cx - 14 * S * night, cy, 58 * S, 0, 7); ctx.fill();
        ctx.fillStyle = U.rgba(night > 0.5 ? sky : '#FFFFFF', night);
        ctx.beginPath(); ctx.arc(cx + 22 * S * night, cy - 16 * S * night, 48 * S, 0, 7); ctx.fill();
      }
      /* 云 */
      ctx.fillStyle = U.rgba(U.ink, 0.28 * (1 - night * 0.6));
      for (var c = 0; c < 3; c++) {
        var clx = ((tt * (12 + c * 7) + c * 500 * S) % (W + 400 * S)) - 200 * S;
        var cly = H * (0.16 + c * 0.1);
        ctx.beginPath();
        ctx.arc(clx, cly, 44 * S, 0, 7);
        ctx.arc(clx + 50 * S, cly - 14 * S, 34 * S, 0, 7);
        ctx.arc(clx + 96 * S, cly, 40 * S, 0, 7);
        ctx.fill();
      }
      /* 地面剪影 */
      ctx.fillStyle = U.mix(U.mix('#3E7C4F', '#0A0F1E', night), U.bg1, 0.2);
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.82);
      for (var x2 = 0; x2 <= W; x2 += 40) {
        ctx.lineTo(x2, H * 0.82 + Math.sin(x2 * 0.004) * 22 * S + U.noise(x2 * 0.002) * 14 * S);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }

    else if (kind === 'skeleton') {
      /* 骨架屏：shimmer 扫过 → 内容弹入，循环 */
      var cyc = 4.4;
      var pr = (tt % cyc) / cyc;
      var loaded = pr > 0.55;
      var cx = W * 0.3, cy = H * 0.2, cw = W * 0.4, chh = H * 0.6;
      U.rr(ctx, cx, cy, cw, chh, 22 * S);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.1); ctx.lineWidth = 1.4 * S; ctx.stroke();
      ctx.save();
      U.rr(ctx, cx, cy, cw, chh, 22 * S); ctx.clip();
      if (!loaded) {
        /* 骨架块 */
        var ph2 = U.rgba(U.ink, 0.08);
        ctx.fillStyle = ph2;
        ctx.beginPath(); ctx.arc(cx + 60 * S, cy + 70 * S, 34 * S, 0, 7); ctx.fill();
        U.rr(ctx, cx + 110 * S, cy + 52 * S, cw * 0.5, 22 * S, 10 * S); ctx.fill();
        U.rr(ctx, cx + 30 * S, cy + 130 * S, cw - 60 * S, 18 * S, 9 * S); ctx.fill();
        U.rr(ctx, cx + 30 * S, cy + 162 * S, cw * 0.7, 18 * S, 9 * S); ctx.fill();
        U.rr(ctx, cx + 30 * S, cy + 220 * S, cw - 60 * S, chh - 260 * S, 12 * S); ctx.fill();
        /* shimmer */
        var sx = cx + ((pr * 2.4) % 1) * cw * 1.6 - cw * 0.3;
        var g = ctx.createLinearGradient(sx - 120 * S, 0, sx + 120 * S, 0);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.5, U.rgba(U.ink, 0.10));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(sx - 120 * S, cy, 240 * S, chh);
      } else {
        var e = U.ease.outBack(Math.min(1, (pr - 0.55) / 0.2));
        ctx.translate(cx + cw / 2, cy + chh / 2);
        ctx.scale(e, e);
        ctx.translate(-(cx + cw / 2), -(cy + chh / 2));
        ctx.fillStyle = U.rgba(B, 0.5);
        ctx.beginPath(); ctx.arc(cx + 60 * S, cy + 70 * S, 34 * S, 0, 7); ctx.fill();
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(30 * S, 700);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('Jaykou', cx + 110 * S, cy + 62 * S);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.font = U.fs(20 * S, 400);
        ctx.fillText('jaykou.studio', cx + 110 * S, cy + 92 * S);
        ctx.fillStyle = U.rgba(A, 0.85);
        U.rr(ctx, cx + 30 * S, cy + 220 * S, cw - 60 * S, chh - 260 * S, 12 * S); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = U.fs(26 * S, 700);
        ctx.textAlign = 'center';
        ctx.fillText('开始创作', cx + cw / 2, cy + chh / 2 + 30 * S);
      }
      ctx.restore();
    }

    else if (kind === 'upload') {
      /* 上传进度：文件卡 + 进度 + 完成对勾弹跳 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cyc = 4.2;
      var pr = (tt % cyc) / cyc;
      var prog = Math.min(1, pr / 0.55);
      var cw = W * 0.4, chh = 200 * S;
      var cx = W / 2 - cw / 2, cy = H / 2 - chh / 2;
      U.rr(ctx, cx, cy, cw, chh, 20 * S);
      ctx.fillStyle = U.rgba(U.bg2, 0.92); ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.12); ctx.lineWidth = 1.4 * S; ctx.stroke();
      /* 文件图标 */
      ctx.fillStyle = U.rgba(B, 0.4);
      U.rr(ctx, cx + 28 * S, cy + 28 * S, 64 * S, 78 * S, 10 * S); ctx.fill();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(18 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MP4', cx + 60 * S, cy + 70 * S);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(26 * S, 700);
      ctx.fillText('jaykou-motion.mp4', cx + 112 * S, cy + 52 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.45);
      ctx.font = U.fs(20 * S, 400);
      ctx.fillText(prog < 1 ? (prog * 86.4).toFixed(1) + ' MB / 86.4 MB · ' + Math.round(prog * 24) + ' MB/s' : '上传完成', cx + 112 * S, cy + 86 * S);
      /* 进度条 */
      var bw = cw - 60 * S;
      U.rr(ctx, cx + 30 * S, cy + chh - 70 * S, bw, 14 * S, 7 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.1); ctx.fill();
      var g = ctx.createLinearGradient(cx, 0, cx + bw, 0);
      g.addColorStop(0, A); g.addColorStop(1, B);
      ctx.fillStyle = g;
      U.rr(ctx, cx + 30 * S, cy + chh - 70 * S, Math.max(14 * S, bw * prog), 14 * S, 7 * S); ctx.fill();
      /* 完成 */
      if (prog >= 1) {
        var e = U.ease.outBack(Math.min(1, (pr - 0.55) / 0.18));
        ctx.save();
        ctx.translate(cx + cw - 52 * S, cy + 52 * S);
        ctx.scale(e, e);
        ctx.fillStyle = U.rgba('#18B87A', 0.95);
        ctx.beginPath(); ctx.arc(0, 0, 30 * S, 0, 7); ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-11 * S, 1); ctx.lineTo(-3 * S, 9 * S); ctx.lineTo(12 * S, -8 * S); ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'medal') {
      /* 勋章解锁：灰章 → 亮章 + 光扫 + 粒子 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cyc = 4;
      var pr = (tt % cyc) / cyc;
      var unlocked = pr > 0.35;
      var cx = W / 2, cy = H * 0.42, R = Math.min(W, H) * 0.2;
      /* 缎带 */
      ctx.fillStyle = U.rgba(B, unlocked ? 0.9 : 0.3);
      U.poly(ctx, [[cx - 40 * S, cy - R * 0.7], [cx - 70 * S, cy - R * 1.9], [cx - 12 * S, cy - R * 1.3], [cx, cy - R * 1.6], [cx + 12 * S, cy - R * 1.3], [cx + 70 * S, cy - R * 1.9], [cx + 40 * S, cy - R * 0.7]]);
      ctx.fill();
      /* 章体 */
      var shine = unlocked ? 0.5 + 0.5 * Math.sin((pr - 0.35) * 12) : 0;
      var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      g.addColorStop(0, U.mix(unlocked ? A : U.ink, U.ink, 0.35 + shine * 0.2));
      g.addColorStop(1, U.mix(unlocked ? A : U.ink, '#000000', 0.35));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.4); ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.82, 0, 7); ctx.stroke();
      ctx.fillStyle = unlocked ? '#FFFFFF' : U.rgba(U.ink, 0.4);
      ctx.font = U.fs(R * 0.7, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★', cx, cy + 2 * S);
      /* 光扫 */
      if (unlocked && pr < 0.6) {
        var swp = (pr - 0.35) / 0.25;
        var sx = cx - R + swp * R * 2.4;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
        var lg = ctx.createLinearGradient(sx - 60 * S, 0, sx + 60 * S, 0);
        lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(0.5, U.rgba(U.ink, 0.55)); lg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(sx - 60 * S, cy - R, 120 * S, R * 2);
        ctx.restore();
      }
      /* 粒子 */
      if (unlocked && pr < 0.75) {
        var pe = Math.min(1, (pr - 0.35) / 0.3);
        for (var i = 0; i < 14; i++) {
          var a0 = U.rng(i * 3.3) * Math.PI * 2;
          var rr4 = R * 1.05 + U.ease.outCubic(pe) * 130 * S * (0.5 + U.rng(i));
          ctx.fillStyle = U.rgba(i % 2 ? B : A, (1 - pe) * 0.9);
          ctx.beginPath(); ctx.arc(cx + Math.cos(a0) * rr4, cy + Math.sin(a0) * rr4, (3 + U.rng(i * 7) * 4) * S, 0, 7); ctx.fill();
        }
      }
      ctx.fillStyle = unlocked ? U.ink : U.rgba(U.ink, 0.4);
      ctx.font = U.fs(34 * S, 700);
      ctx.fillText(unlocked ? '成就解锁！' : '继续完成 3 个任务解锁', W / 2, cy + R + 80 * S);
    }

    else if (kind === 'coupon') {
      /* 优惠券：虚线撕开，左右分离 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var cyc = 4.2;
      var pr = (tt % cyc) / cyc;
      var cut = pr > 0.4 ? U.ease.inOutQuad(Math.min(1, (pr - 0.4) / 0.25)) : 0;
      var cw = W * 0.56, chh = H * 0.4;
      var cx = W / 2, cy = H / 2;
      var sep = cut * 46 * S;
      var drop = cut * cut * 60 * S;
      var til = cut * 0.1;
      var colr = A;
      /* 左半 */
      ctx.save();
      ctx.translate(cx - cw / 2, cy - chh / 2);
      ctx.rotate(0);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(cw * 0.72 + sep, 0);
      ctx.arcTo(cw * 0.72 + sep, chh / 2, cw * 0.72 + sep + 18 * S, chh / 2, 18 * S);
      ctx.arcTo(cw * 0.72 + sep, chh, cw * 0.72 + sep - 10 * S, chh, 18 * S);
      ctx.lineTo(0, chh); ctx.closePath();
      ctx.fillStyle = U.rgba(colr, 0.92); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = U.fs(84 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('-50%', cw * 0.36, chh / 2);
      ctx.restore();
      /* 右半（撕开后下坠旋转） */
      ctx.save();
      ctx.translate(cx + cw * 0.22 + sep, cy - chh / 2 + drop);
      ctx.rotate(til);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(cw * 0.28, 0);
      ctx.quadraticCurveTo(cw * 0.28 + 16 * S, chh / 2, cw * 0.28, chh);
      ctx.lineTo(0, chh);
      ctx.arcTo(-18 * S, chh / 2, -18 * S, chh / 2, 18 * S);
      ctx.arcTo(-18 * S, 0, 0, 0, 18 * S);
      ctx.closePath();
      ctx.fillStyle = U.rgba(colr, 0.75); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = U.fs(30 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('COUPON', cw * 0.14, chh * 0.3);
      ctx.font = U.fs(22 * S, 500);
      ctx.fillText('VALID 2026', cw * 0.14, chh * 0.62);
      ctx.restore();
      /* 虚线（未撕开时） */
      if (cut < 0.05) {
        ctx.strokeStyle = U.rgba('#FFFFFF', 0.65);
        ctx.lineWidth = 3 * S;
        ctx.setLineDash([12 * S, 10 * S]);
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.22, cy - chh / 2 + 16 * S);
        ctx.lineTo(cx + cw * 0.22, cy + chh / 2 - 16 * S);
        ctx.stroke();
        ctx.setLineDash([]);
        /* 剪刀标记 */
        ctx.fillStyle = U.rgba('#FFFFFF', 0.8);
        ctx.beginPath(); ctx.arc(cx + cw * 0.22, cy, 10 * S, 0, 7); ctx.fill();
      }
    }

    else if (kind === 'keyboard') {
      /* 键盘打字：按键依次按下，文字逐字输入 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var str = String(p.text || 'JAYKOU');
      var rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
      var keyW = 74 * S, keyH = 74 * S, keyGap = 12 * S;
      var kbW = 10 * keyW + 9 * keyGap;
      var kx0 = W / 2 - kbW / 2, ky0 = H * 0.56;
      var typeRate = 3.4;
      var typeN = Math.min(str.length, Math.floor(tt * typeRate));
      var pressed = typeN > 0 && typeN <= str.length ? str.charAt(typeN - 1).toUpperCase() : '';
      var pressAge = (tt * typeRate) % 1;
      /* 输入框 */
      var bw = kbW * 0.86;
      U.rr(ctx, W / 2 - bw / 2, H * 0.2, bw, 110 * S, 16 * S);
      ctx.fillStyle = U.rgba(U.bg2, 0.92); ctx.fill();
      ctx.strokeStyle = U.rgba(A, 0.5); ctx.lineWidth = 2 * S; ctx.stroke();
      ctx.fillStyle = U.ink;
      ctx.font = U.fs(44 * S, 600);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      var showStr = str.slice(0, typeN);
      ctx.fillText(showStr, W / 2 - bw / 2 + 28 * S, H * 0.2 + 55 * S);
      var caretX = W / 2 - bw / 2 + 28 * S + ctx.measureText(showStr).width + 8 * S;
      if (Math.sin(tt * 6) > -0.2) {
        ctx.fillStyle = U.rgba(A, 0.9);
        ctx.fillRect(caretX, H * 0.2 + 26 * S, 3.4 * S, 58 * S);
      }
      /* 键盘 */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var r = 0; r < rows.length; r++) {
        var off = (kbW - rows[r].length * keyW - (rows[r].length - 1) * keyGap) / 2;
        for (var c = 0; c < rows[r].length; c++) {
          var ch = rows[r].charAt(c);
          var x = kx0 + off + c * (keyW + keyGap);
          var y = ky0 + r * (keyH + keyGap);
          var isPressed = ch === pressed && pressAge < 0.4;
          var depth = isPressed ? (1 - pressAge / 0.4) * 8 * S : 0;
          U.rr(ctx, x, y + depth, keyW, keyH - depth, 12 * S);
          ctx.fillStyle = isPressed ? U.rgba(A, 0.9) : U.rgba(U.bg2, 0.95);
          ctx.fill();
          ctx.strokeStyle = U.rgba(U.ink, isPressed ? 0.2 : 0.12);
          ctx.lineWidth = 1.4 * S; ctx.stroke();
          ctx.fillStyle = isPressed ? '#FFFFFF' : U.rgba(U.ink, 0.7);
          ctx.font = U.fs(30 * S, 700);
          ctx.fillText(ch, x + keyW / 2, y + depth + keyH / 2 - depth / 2);
        }
      }
    }
  }

  /* ══════════ D. 转场运镜 ══════════ */
  function fxDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, tt = t * Math.max(0.05, p.speed);
    var A = U.accent, B = U.accent2, kind = p.kind;
    var str = String(p.text || 'A');
    var str2 = String(p.text2 || 'B');

    /* 两个"场景"的简单绘制（局部函数，随 draw 序列化） */
    function scene(ctx2, label, colr, colr2) {
      var g = ctx2.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, colr); g.addColorStop(1, colr2);
      ctx2.fillStyle = g; ctx2.fillRect(0, 0, W, H);
      ctx2.fillStyle = U.rgba(U.ink, 0.92);
      ctx2.font = U.fs(Math.min(W, H) * 0.3, 800);
      ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
      ctx2.fillText(label, W / 2, H / 2);
    }

    if (kind === 'glitch-rgb') {
      /* 文字 RGB 分离故障：周期性错位爆闪 */
      ctx.fillStyle = U.bg1; ctx.fillRect(0, 0, W, H);
      var stp = Math.floor(tt * 8);
      var fr = (tt * 8) % 1;
      var burst = U.rng(stp, 5) < 0.3 ? 1 : 0;
      var off = burst ? (18 + 30 * U.rng(stp, 7)) * S * (1 - fr) : 0;
      ctx.font = U.fs(Math.min(W, H) * 0.24, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba('#FF2E4C', 0.85);
      ctx.fillText(str, W / 2 - off, H / 2 - off * 0.4);
      ctx.fillStyle = U.rgba('#2EE8FF', 0.85);
      ctx.fillText(str, W / 2 + off, H / 2 + off * 0.4);
      ctx.fillStyle = U.ink;
      ctx.fillText(str, W / 2, H / 2);
      /* 水平切片错位 */
      if (burst) {
        for (var s = 0; s < 4; s++) {
          var sy = H * U.rng(stp * 3 + s, 9);
          var sh = (8 + 26 * U.rng(stp + s, 11)) * S;
          var offx = (U.rng(stp + s, 13) - 0.5) * 90 * S;
          ctx.drawImage(ctx.canvas, 0, sy, W, sh, offx, sy, W, sh);
        }
      }
      /* 扫描线 */
      for (var y = 0; y < H; y += 5 * S) {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, y, W, 1.4 * S);
      }
    }

    else if (kind === 'shatter') {
      /* 玻璃碎裂转场：A 碎成三角片飞散露出 B */
      var cyc = 3.4;
      var pr = Math.min(1, (tt % cyc) / (cyc * 0.55));
      var e = U.ease.inQuad(pr);
      /* 场景 B */
      scene(ctx, str2, U.mix(B, '#000000', 0.25), U.mix(B, U.ink, 0.1));
      /* A 的碎片 */
      var cols = 4, rows = 4;
      var cw = W / cols, chh = H / rows;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var seedI = r * 7 + c;
          var dx0 = (U.rng(seedI * 3.3) - 0.5) * 2;
          var dy0 = 0.4 + U.rng(seedI * 5.1);
          var rot = (U.rng(seedI * 7.7) - 0.5) * 3;
          for (var tri = 0; tri < 2; tri++) {
            var pts = tri === 0
              ? [[0, 0], [cw, 0], [0, chh]]
              : [[cw, 0], [cw, chh], [0, chh]];
            var sx = c * cw, sy = r * chh;
            ctx.save();
            ctx.translate(sx + cw / 2 + dx0 * e * W * 0.7, sy + chh / 2 + (dy0 * e * e) * H * 1.1);
            ctx.rotate(rot * e);
            ctx.translate(-sx - cw / 2, -sy - chh / 2);
            ctx.beginPath();
            ctx.moveTo(sx + pts[0][0], sy + pts[0][1]);
            ctx.lineTo(sx + pts[1][0], sy + pts[1][1]);
            ctx.lineTo(sx + pts[2][0], sy + pts[2][1]);
            ctx.closePath();
            var g = ctx.createLinearGradient(sx, sy, sx + cw, sy + chh);
            g.addColorStop(0, U.mix(A, '#000000', 0.15 + 0.2 * U.rng(seedI + tri)));
            g.addColorStop(1, U.mix(A, U.ink, 0.12));
            ctx.fillStyle = g;
            ctx.globalAlpha = 1 - e * 0.55;
            ctx.fill();
            ctx.strokeStyle = U.rgba(U.ink, 0.25 * (1 - e));
            ctx.lineWidth = 1.6 * S;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      ctx.globalAlpha = 1;
      /* 裂缝闪光 */
      if (pr < 0.12) {
        ctx.fillStyle = U.rgba(U.ink, (0.12 - pr) * 5);
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'iris') {
      /* 光圈转场：B 在扩张圆内显现，圆环描边 */
      var cyc = 3.2;
      var pr = (tt % cyc) / cyc;
      var e = pr < 0.5 ? U.ease.inOutCubic(pr / 0.5) : U.ease.inOutCubic((1 - pr) / 0.5);
      scene(ctx, str, U.mix(A, '#000000', 0.25), U.mix(A, U.ink, 0.08));
      var maxR = Math.sqrt(W * W + H * H) / 2;
      var r = e * maxR;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(W / 2, H / 2, Math.max(0.01, r), 0, 7, true);
      ctx.clip('evenodd');
      scene(ctx, str2, U.mix(B, '#000000', 0.3), U.mix(B, U.ink, 0.05));
      ctx.restore();
      ctx.strokeStyle = U.rgba(U.ink, 0.85);
      ctx.lineWidth = 8 * S;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.max(0.01, r), 0, 7); ctx.stroke();
      ctx.strokeStyle = U.rgba(A, 0.6);
      ctx.lineWidth = 20 * S;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.max(0.01, r + 16 * S), 0, 7); ctx.stroke();
    }

    else if (kind === 'blinds-wipe') {
      /* 百叶转场：竖条依次擦除 A 露出 B */
      scene(ctx, str2, U.mix(B, '#000000', 0.3), U.mix(B, U.ink, 0.05));
      var n = Math.max(6, Math.round(10 * p.density));
      var cw = W / n;
      var cyc = 2.8;
      var pr = Math.min(1, (tt % cyc) / (cyc * 0.5));
      for (var i = 0; i < n; i++) {
        var local = Math.max(0, Math.min(1, (pr - i * 0.5 / n) * n * 1.6));
        var e = U.ease.inOutCubic(local);
        if (e <= 0) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(i * cw, 0, cw, H * e);
        ctx.clip();
        scene(ctx, str, U.mix(A, '#000000', 0.2), U.mix(A, U.ink, 0.1));
        ctx.restore();
        if (e > 0 && e < 1) {
          ctx.fillStyle = U.rgba(U.ink, 0.5);
          ctx.fillRect(i * cw, H * e - 4 * S, cw, 4 * S);
        }
      }
      /* 循环回卷提示 */
      var backP = (tt % cyc) / cyc;
      if (backP > 0.8) {
        var be = U.ease.inOutCubic((backP - 0.8) / 0.2);
        ctx.fillStyle = U.rgba(U.bg1, be * 0.6);
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'zoomblur') {
      /* 变焦转场：A 放大拉丝 crossfade 到 B */
      var cyc = 3;
      var pr = (tt % cyc) / cyc;
      var z = pr < 0.5 ? U.ease.inQuad(pr / 0.5) : 1 - U.ease.outQuad((pr - 0.5) / 0.5);
      var sc = 1 + z * 1.6;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(sc, sc);
      ctx.translate(-W / 2, -H / 2);
      ctx.globalAlpha = 1 - z * 0.9;
      scene(ctx, str, U.mix(A, '#000000', 0.2), U.mix(A, U.ink, 0.1));
      ctx.restore();
      /* 径向拉丝 */
      if (z > 0.15 && z < 0.95) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        var cx = W / 2, cy = H / 2;
        for (var i = 0; i < 40; i++) {
          var a0 = U.rng(i * 3.1) * Math.PI * 2;
          var r0 = Math.min(W, H) * (0.2 + U.rng(i * 7) * 0.5);
          var r1 = r0 + z * Math.min(W, H) * 0.7;
          ctx.strokeStyle = U.rgba(i % 3 === 0 ? A : U.ink, 0.05 * z);
          ctx.lineWidth = (2 + 8 * U.rng(i)) * S;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0);
          ctx.lineTo(cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.globalAlpha = z * z;
      scene(ctx, str2, U.mix(B, '#000000', 0.3), U.mix(B, U.ink, 0.05));
      ctx.globalAlpha = 1;
    }
  }

  /* ══════════ 注册 ══════════ */

  /* A. 创意生活 · 13 */
  MF.forge({
    cat: '创意生活', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'bubbles', sel(['bubbles', 'balloon', 'flag', 'kaleido', 'dna', 'solar', 'vinyl', 'equalizer', 'pendulum', 'metaball', 'isowave', 'flowfield', 'coderain', 'radar'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('scale', '尺度', 1, rng(1, 0.3, 2.5, 0.05)),
      P('text', '文本', '♪', txt())
    ],
    draw: lifeDraw,
    ids: [
      { id: 'cl-bubbles', name: '气泡上浮', desc: '气泡摇摆着浮出水面，高光通透，近大远小', tags: ['Bubbles', '气泡', '清新'], cfg: { kind: 'bubbles' } },
      { id: 'cl-balloon', name: '气球升空', desc: '五彩气球牵着绳线缓缓升空，随风轻摆', tags: ['Balloon', '气球', '庆祝'], cfg: { kind: 'balloon' } },
      { id: 'cl-flag', name: '旗帜飘扬', desc: '旗面网格叠加行波与噪声，明暗随风起伏', tags: ['Flag', '旗帜', '飘扬'], cfg: { kind: 'flag' } },
      { id: 'cl-kaleido', name: '万花筒', desc: '八重镜像对称的光点与光弧旋转绽放', tags: ['Kaleidoscope', '万花筒', '对称'], cfg: { kind: 'kaleido' } },
      { id: 'cl-dna', name: 'DNA 双螺旋', desc: '双链相位旋转，横档碱基交替配色，生命感十足', tags: ['DNA', '螺旋', '科技'], cfg: { kind: 'dna' } },
      { id: 'cl-solar', name: '太阳系轨道', desc: '恒星辉光，行星开普勒速率公转，带卫星与彗尾轨迹', tags: ['Solar', '轨道', '宇宙'], cfg: { kind: 'solar' } },
      { id: 'cl-vinyl', name: '黑胶唱机', desc: '唱片旋转、唱臂缓摆、音符飘出，复古音乐氛围', tags: ['Vinyl', '黑胶', '音乐'], cfg: { kind: 'vinyl' } },
      { id: 'cl-equalizer', name: '律动均衡柱', desc: '节拍量化的频谱柱跳动，底部倒影，DJ 台既视感', tags: ['Equalizer', '频谱', '音乐'], cfg: { kind: 'equalizer' } },
      { id: 'cl-pendulum', name: '牛顿摆', desc: '端球交替摆动传递冲量，撞击瞬间迸出闪光', tags: ['Pendulum', '牛顿摆', '物理'], cfg: { kind: 'pendulum' } },
      { id: 'cl-metaball', name: '融合球', desc: '多个 blob 在标量场中互相吞噬融合，果冻质感', tags: ['Metaball', '融合', '流体'], cfg: { kind: 'metaball' } },
      { id: 'cl-isowave', name: '等距方块波', desc: '等距柱阵随环形波起伏，三面着色，纪念碑谷气质', tags: ['Isometric', '等距', '3D'], cfg: { kind: 'isowave' } },
      { id: 'cl-flow-field', name: '粒子流场', desc: '数百粒子沿 noise 矢量场留下丝滑轨迹', tags: ['FlowField', '流场', '粒子'], cfg: { kind: 'flowfield' } },
      { id: 'cl-code-rain', name: '代码雨', desc: '片假名字符列倾泻而下，头部炽亮、尾部渐隐', tags: ['Matrix', '代码雨', '黑客'], cfg: { kind: 'coderain' } },
      { id: 'cl-radar', name: '雷达扫描', desc: '扇形扫过即点亮目标，光圈扩散渐隐，指挥室氛围', tags: ['Radar', '雷达', '扫描'], cfg: { kind: 'radar' } }
    ]
  });

  /* B. 数据图表 · 8 */
  MF.forge({
    cat: '数据图表', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'countdown', sel(['countdown', 'gauge', 'candle', 'barrace', 'rings', 'sparkline', 'leaderboard', 'tape'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('text', '文本', 'COUNTDOWN', txt())
    ],
    draw: dataDraw,
    ids: [
      { id: 'cl-flip-countdown', name: '翻页倒计时', desc: '机场翻牌式 HH:MM:SS，秒位翻动，紧张感拉满', tags: ['Countdown', '倒计时', '翻牌'], cfg: { kind: 'countdown' } },
      { id: 'cl-gauge', name: '仪表盘', desc: '弧形刻度盘指针摆动，红区警示，数值实时跳动', tags: ['Gauge', '仪表', 'HUD'], cfg: { kind: 'gauge' } },
      { id: 'cl-candlestick', name: 'K 线滚动', desc: '涨红跌绿的蜡烛图向左滚动，现价标签跟随（中式配色）', tags: ['Candlestick', 'K线', '行情'], cfg: { kind: 'candle' } },
      { id: 'cl-bar-race', name: '条形竞赛', desc: '多条横条此消彼长实时竞赛，数值标签跟随', tags: ['BarRace', '条形', '竞赛'], cfg: { kind: 'barrace' } },
      { id: 'cl-rings-stat', name: '多环进度', desc: '同心环依次充能到位，中心点亮 SYNCED 状态', tags: ['Rings', '进度', '统计'], cfg: { kind: 'rings' } },
      { id: 'cl-sparkline', name: '走势自绘', desc: '折线按进度画出自己，面积渐变，末端光点脉冲', tags: ['Sparkline', '走势', '图表'], cfg: { kind: 'sparkline' } },
      { id: 'cl-leaderboard', name: '排行榜换位', desc: '名次随数值变化滑动交换，榜首高亮，竞技感十足', tags: ['Leaderboard', '排行', '竞技'], cfg: { kind: 'leaderboard' } },
      { id: 'cl-ticker-tape', name: '报价跑马灯', desc: '涨红跌绿的行情胶带无缝滚动，两侧渐隐', tags: ['Ticker', '行情', '跑马灯'], cfg: { kind: 'tape' } }
    ]
  });

  /* C. 界面交互 · 9 */
  MF.forge({
    cat: '界面交互', type: 'component', dur: 7, poster: 0.5,
    params: [
      P('kind', '形态', 'chat', sel(['chat', 'like', 'cart', 'daynight', 'skeleton', 'upload', 'medal', 'coupon', 'keyboard'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('text', '文本', 'JAYKOU', txt())
    ],
    draw: uiDraw,
    ids: [
      { id: 'cl-chat', name: '聊天气泡', desc: '打字指示点点点，气泡左右交替弹入，IM 对话感', tags: ['Chat', '聊天', 'IM'], cfg: { kind: 'chat' } },
      { id: 'cl-like', name: '点赞爆裂', desc: '红心 outBack 弹跳，环形粒子迸发，计数持续上涨', tags: ['Like', '点赞', '反馈'], cfg: { kind: 'like' } },
      { id: 'cl-cart-add', name: '加购飞入', desc: '商品卡点加购，圆点划弧线飞进购物车，角标弹跳 +1', tags: ['Cart', '加购', '电商'], cfg: { kind: 'cart' } },
      { id: 'cl-day-night', name: '昼夜切换', desc: '日落月升交叉渐变，星现云移，地面剪影换色', tags: ['DayNight', '昼夜', '场景'], cfg: { kind: 'daynight' } },
      { id: 'cl-skeleton', name: '骨架屏加载', desc: 'shimmer 扫过骨架块，内容 outBack 弹入，循环演示', tags: ['Skeleton', '骨架屏', '加载'], cfg: { kind: 'skeleton' } },
      { id: 'cl-upload', name: '文件上传', desc: '文件卡进度充能，速度实时显示，完成对勾弹跳', tags: ['Upload', '上传', '进度'], cfg: { kind: 'upload' } },
      { id: 'cl-medal', name: '勋章解锁', desc: '灰章点亮成金，光带扫过，粒子迸发，成就时刻', tags: ['Medal', '成就', '游戏'], cfg: { kind: 'medal' } },
      { id: 'cl-coupon', name: '优惠券撕开', desc: '虚线剪刀口撕开票券，右半下坠旋转，折扣揭示', tags: ['Coupon', '优惠券', '营销'], cfg: { kind: 'coupon' } },
      { id: 'cl-keyboard', name: '键盘打字', desc: '按键依次按下回弹，输入框文字逐字出现带光标', tags: ['Keyboard', '键盘', '打字'], cfg: { kind: 'keyboard' } }
    ]
  });

  /* D. 转场运镜 · 5 */
  MF.forge({
    cat: '转场切换', type: 'block', dur: 6, poster: 0.45,
    params: [
      P('kind', '形态', 'glitch-rgb', sel(['glitch-rgb', 'shatter', 'iris', 'blinds-wipe', 'zoomblur'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('density', '密度', 1, rng(1, 0.3, 2, 0.05)),
      P('text', '场景 A', 'A', txt()),
      P('text2', '场景 B', 'B', txt())
    ],
    draw: fxDraw,
    ids: [
      { id: 'cl-glitch-rgb', name: 'RGB 分离故障', desc: '红青双影错位爆闪 + 水平切片抖动，赛博故障转场', tags: ['Glitch', '故障', '转场'], cfg: { kind: 'glitch-rgb', text: 'GLITCH', text2: 'GLITCH' } },
      { id: 'cl-shatter', name: '玻璃碎裂', desc: 'A 画面碎成三角玻璃片旋转坠落，露出 B 画面', tags: ['Shatter', '碎裂', '转场'], cfg: { kind: 'shatter', text: 'A', text2: 'B' } },
      { id: 'cl-iris', name: '光圈开合', desc: '圆形光圈扩张收合切换场景，双层描边光环', tags: ['Iris', '光圈', '转场'], cfg: { kind: 'iris', text: 'A', text2: 'B' } },
      { id: 'cl-blinds-wipe', name: '百叶擦除', desc: '竖向百叶依次下擦切换场景，擦除缘高光划过', tags: ['Blinds', '百叶', '转场'], cfg: { kind: 'blinds-wipe', text: 'A', text2: 'B' } },
      { id: 'cl-zoom-blur', name: '变焦穿越', desc: 'A 画面放大拉丝冲向镜头，crossfade 落回 B 画面', tags: ['ZoomBlur', '变焦', '转场'], cfg: { kind: 'zoomblur', text: 'A', text2: 'B' } }
    ]
  });
})();

/* ════════ assets/js/effects-24.js ════════ */
/* ==========================================================================
   Jaykou — effects-24 · 手绘风批次
   取经：motionface.cc（手绘风歌词成片：纸底 + 墨字 + 逐句设计 + 印章落款）
        vibe-motion/3D-Chladni（克拉尼沙盘）
        vibe-motion/fisheye-motion（鱼眼 + 莫尔干涉）
        vibe-motion/threejs-boids（鱼群洄游）
        vibe-motion/auto-motion（SRT 逐句字幕工作流）
   硬约束：draw 完全自包含（只依赖 ctx/t/p/U），可被 toString 序列化导出。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF, P = MF.P, rng = MF.rng, txt = MF.txt, col = MF.col;
  function sel(arr) {
    return { type: 'select', options: arr.map(function (x) { return Array.isArray(x) ? x : [x, x]; }) };
  }

  /* 手绘风调色板：由 ink 参数解析（在 draw 内联，保证自包含） */
  /* INK 墨黑 #2B2620 / 朱砂 #C4402F / 黛蓝 #3E5C76 / 松绿 #3D6B4F / 赭石 #8A5A2B */

  /* ══════════ A. 手绘歌词家族（涂鸦手绘 / 弹幕字幕） ══════════ */

  function lyricDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var INKS = { ink: '#2B2620', red: '#C4402F', blue: '#3E5C76', green: '#3D6B4F', umber: '#8A5A2B' };
    var INK = INKS[p.ink] || INKS.ink;
    var PAPER = '#F6F2E9', FAINT = 'rgba(43,38,32,0.16)';

    /* 纸底 + 纤维噪点（内联公共函数） */
    function paperBg() {
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      var step = Math.max(3, Math.round(4 * S));
      for (var y = 0; y < H; y += step) {
        for (var x = 0; x < W; x += step) {
          var n = U.noise2(x * 0.05, y * 0.05);
          if (n > 0.42) {
            ctx.fillStyle = 'rgba(43,38,32,' + ((n - 0.42) * 0.09).toFixed(3) + ')';
            ctx.fillRect(x, y, step, step);
          } else if (n < -0.55) {
            ctx.fillStyle = 'rgba(255,255,255,' + ((-n - 0.55) * 0.12).toFixed(3) + ')';
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      /* 四角轻微晕染 */
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,74,52,0.14)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }
    /* 抖动线段（手绘感），seg 段折线 + noise 偏移，phase 控制沸腾帧 */
    function wob(x1, y1, x2, y2, amp, ph, seedI) {
      var segs = 14, i, px, py, nx, ny;
      ctx.moveTo(x1 + U.noise2(seedI, ph) * amp, y1 + U.noise2(seedI + 9, ph) * amp);
      for (i = 1; i <= segs; i++) {
        var k = i / segs;
        px = x1 + (x2 - x1) * k; py = y1 + (y2 - y1) * k;
        nx = U.noise2(seedI + i * 1.7, ph) * amp; ny = U.noise2(seedI + i * 2.3 + 50, ph) * amp;
        ctx.lineTo(px + nx, py + ny);
      }
    }

    var lines = String(p.text || '一句歌词\n一行手绘\n一张纸').split(/\n/).filter(function (s) { return s.trim(); });
    if (!lines.length) lines = ['一句歌词'];

    if (p.kind === 'paper') {
      /* 逐句歌词滚动：当前句大字居中 + 手绘下划线渐现 + 上下句余光 */
      paperBg();
      var cyc = 3.2, idx = Math.floor(tt / cyc) % lines.length, ph = (tt % cyc) / cyc;
      var cy = H * 0.5, size = p.size;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      /* 上下句 */
      for (var off = -2; off <= 2; off++) {
        if (off === 0) continue;
        var j = (idx + off + lines.length * 3) % lines.length;
        var dy = off * size * 1.5 - (ph - 0.5) * size * 1.5;
        var al = Math.max(0, 0.16 - Math.abs(off) * 0.05);
        ctx.fillStyle = 'rgba(43,38,32,' + al.toFixed(3) + ')';
        ctx.font = '700 ' + Math.round(size * 0.52) + 'px Georgia, "Songti SC", "STSong", "Noto Serif SC", serif';
        ctx.fillText(lines[j], W / 2, cy + dy);
      }
      /* 当前句：弹入 */
      var pop = U.ease.outBack(U.clamp(ph * 4, 0, 1));
      var fade = ph > 0.82 ? 1 - (ph - 0.82) / 0.18 : 1;
      ctx.save();
      ctx.translate(W / 2, cy + (1 - pop) * 30 * S);
      ctx.scale(0.92 + pop * 0.08, 0.92 + pop * 0.08);
      ctx.globalAlpha = fade;
      ctx.fillStyle = INK;
      ctx.font = '900 ' + Math.round(size) + 'px Georgia, "Songti SC", "STSong", "Noto Serif SC", serif';
      ctx.fillText(lines[idx], 0, 0);
      ctx.restore();
      /* 手绘下划线随句渐现 */
      var uw = Math.min(W * 0.62, ctx.measureText(lines[idx]).width * 1.12);
      var up = U.ease.outCubic(U.clamp((ph - 0.25) / 0.4, 0, 1)) * fade;
      if (up > 0.01) {
        ctx.strokeStyle = U.rgba(INK, 0.75 * fade);
        ctx.lineWidth = 3.4 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        wob(W / 2 - uw / 2, cy + size * 0.78, W / 2 - uw / 2 + uw * up, cy + size * 0.78, 4 * S, Math.floor(tt * 7), 3);
        ctx.stroke();
      }
      /* 页码角标 */
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(43,38,32,0.4)';
      ctx.font = '600 ' + Math.round(20 * S) + 'px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText('— ' + (idx + 1) + ' / ' + lines.length + ' —', W - 60 * S, H - 52 * S);
    }

    if (p.kind === 'wobble') {
      /* 沸动手绘字：逐字微旋转 + 三重抖动描边，8fps 手绘沸腾帧 */
      paperBg();
      var ph2 = Math.floor(tt * 8);
      var size2 = p.size, amp = (p.wobble === undefined ? 1 : p.wobble) * 2.6 * S;
      var str = String(p.text || '手绘沸腾');
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var total = ctx.measureText(str).width;
      var x0 = W / 2 - total / 2;
      ctx.font = '900 ' + Math.round(size2) + 'px Georgia, "Songti SC", "STSong", "Noto Serif SC", serif';
      for (var ci = 0; ci < str.length; ci++) {
        var ch = str[ci];
        var cw = ctx.measureText(ch).width;
        var rot = U.noise2(ci * 3.1, ph2 * 0.7) * 0.05;
        var dy2 = U.noise2(ci * 2.3 + 40, ph2) * amp;
        ctx.save();
        ctx.translate(x0 + cw / 2, H / 2 + dy2);
        ctx.rotate(rot);
        /* 底层淡描边（错位重影） */
        ctx.fillStyle = U.rgba(INK, 0.18);
        ctx.fillText(ch, U.noise2(ci + 70, ph2) * amp * 1.6, U.noise2(ci + 80, ph2) * amp * 1.6);
        ctx.fillStyle = INK;
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        x0 += cw;
      }
      /* 底部小注 */
      ctx.fillStyle = 'rgba(43,38,32,0.35)';
      ctx.font = '600 ' + Math.round(22 * S) + 'px Georgia, serif';
      ctx.fillText('· HAND-DRAWN BOIL ·', W / 2, H * 0.72);
    }

    if (p.kind === 'karaoke') {
      /* 墨染卡拉OK：逐字由浅入墨，正在染的字带墨点 */
      paperBg();
      var str3 = String(p.text || '把每一句歌词都染上墨色');
      var cyc3 = Math.max(2.4, str3.length * 0.28);
      var prog = (tt % (cyc3 + 1.2));
      var k = U.clamp(prog / cyc3, 0, 1) * str3.length;
      var size3 = p.size;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(size3) + 'px Georgia, "Songti SC", "STSong", "Noto Serif SC", serif';
      var total3 = ctx.measureText(str3).width;
      var x3 = W / 2 - total3 / 2, cy3 = H / 2;
      for (var i3 = 0; i3 < str3.length; i3++) {
        var ch3 = str3[i3], w3 = ctx.measureText(ch3).width;
        var filled = i3 < k;
        var cur = i3 < k + 1 && i3 >= k - 0.6;
        ctx.fillStyle = filled ? INK : 'rgba(43,38,32,0.18)';
        ctx.fillText(ch3, x3 + w3 / 2, cy3);
        if (cur && k < str3.length) {
          var inkK = U.clamp(k - i3, 0, 1);
          ctx.fillStyle = U.rgba(INK, 0.85);
          ctx.beginPath();
          ctx.arc(x3 + w3 / 2 + U.noise2(i3, Math.floor(tt * 9)) * 3 * S, cy3 + size3 * 0.42, (2.5 + inkK * 3.5) * S, 0, 7);
          ctx.fill();
        }
        x3 += w3;
      }
      /* 底部细进度线 */
      ctx.strokeStyle = 'rgba(43,38,32,0.2)'; ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(W * 0.3, H * 0.68); ctx.lineTo(W * 0.7, H * 0.68); ctx.stroke();
      ctx.strokeStyle = U.rgba(INK, 0.8);
      ctx.beginPath(); ctx.moveTo(W * 0.3, H * 0.68); ctx.lineTo(W * 0.3 + W * 0.4 * U.clamp(prog / cyc3, 0, 1), H * 0.68); ctx.stroke();
    }

    if (p.kind === 'pop') {
      /* 歌词弹入切换：旧句上飘淡出，新句 outBack 弹入，句点进度 */
      paperBg();
      var cyc4 = 2.6, idx4 = Math.floor(tt / cyc4) % lines.length, ph4 = (tt % cyc4) / cyc4;
      var prev4 = (idx4 - 1 + lines.length) % lines.length;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      /* 旧句 */
      if (ph4 < 0.35) {
        ctx.fillStyle = 'rgba(43,38,32,' + (0.3 * (1 - ph4 / 0.35)).toFixed(3) + ')';
        ctx.font = '800 ' + Math.round(p.size * 0.6) + 'px Georgia, "Songti SC", serif';
        ctx.fillText(lines[prev4], W / 2, H * 0.42 - (ph4 / 0.35) * 50 * S);
      }
      /* 新句 */
      var e4 = U.clamp(ph4 * 3.4, 0, 1);
      var sc4 = U.ease.outBack(e4);
      ctx.save();
      ctx.translate(W / 2, H * 0.5);
      ctx.scale(sc4, sc4);
      ctx.globalAlpha = e4;
      ctx.fillStyle = INK;
      ctx.font = '900 ' + Math.round(p.size) + 'px Georgia, "Songti SC", "STSong", "Noto Serif SC", serif';
      ctx.fillText(lines[idx4], 0, 0);
      ctx.restore();
      /* 句点进度 */
      var r4 = 7 * S;
      for (var d4 = 0; d4 < lines.length; d4++) {
        var xx = W / 2 + (d4 - (lines.length - 1) / 2) * r4 * 3.4;
        ctx.beginPath();
        ctx.fillStyle = d4 === idx4 ? INK : 'rgba(43,38,32,0.18)';
        ctx.arc(xx, H * 0.7, d4 === idx4 ? r4 : r4 * 0.6, 0, 7);
        ctx.fill();
      }
    }

    if (p.kind === 'brush') {
      /* 笔刷扫字：墨带横扫，字随笔锋显形（clip + 抖动墨带） */
      paperBg();
      var str5 = String(p.text || '笔锋所至');
      var cyc5 = 3, ph5 = (tt % cyc5) / cyc5;
      var size5 = p.size;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(size5) + 'px Georgia, "Songti SC", "STSong", "Noto Serif SC", serif';
      var total5 = ctx.measureText(str5).width;
      var xL = W / 2 - total5 / 2 - 20 * S;
      var sweep = U.ease.inOutCubic(U.clamp(ph5 * 1.25, 0, 1));
      /* 墨字被 clip 逐渐显现 */
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, xL + total5 * 1.06 * sweep, H);
      ctx.clip();
      ctx.fillStyle = INK;
      ctx.fillText(str5, W / 2, H / 2);
      ctx.restore();
      /* 笔刷墨带 */
      if (sweep > 0.02 && sweep < 1) {
        var bx = xL + total5 * 1.06 * sweep;
        var ph6 = Math.floor(tt * 9);
        var grad = ctx.createLinearGradient(bx - 90 * S, 0, bx, 0);
        grad.addColorStop(0, U.rgba(INK, 0.55)); grad.addColorStop(1, U.rgba(INK, 0.95));
        ctx.strokeStyle = grad; ctx.lineCap = 'round';
        for (var b5 = 0; b5 < 3; b5++) {
          ctx.lineWidth = (size5 * (0.5 - b5 * 0.14)) * (0.7 + 0.3 * Math.sin(tt * 6 + b5));
          ctx.beginPath();
          wob(bx - 130 * S, H / 2 + (b5 - 1) * size5 * 0.18, bx, H / 2 + (b5 - 1) * size5 * 0.1, 5 * S, ph6, b5 * 11);
          ctx.stroke();
        }
        /* 笔尖墨点 */
        ctx.fillStyle = INK;
        ctx.beginPath(); ctx.arc(bx, H / 2, 6 * S, 0, 7); ctx.fill();
      }
      /* 循环后整句保持一拍再重来 */
      if (sweep >= 1) {
        ctx.fillStyle = INK;
        ctx.fillText(str5, W / 2, H / 2);
      }
    }
  }

  /* ══════════ B. 手绘标注家族（component） ══════════ */

  function markDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var INKS = { ink: '#2B2620', red: '#C4402F', blue: '#3E5C76', green: '#3D6B4F', umber: '#8A5A2B' };
    var INK = INKS[p.ink] || INKS.red;
    var PAPER = '#F6F2E9';
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);

    function wob(x1, y1, x2, y2, amp, ph, seedI, segs) {
      segs = segs || 14;
      ctx.moveTo(x1 + U.noise2(seedI, ph) * amp, y1 + U.noise2(seedI + 9, ph) * amp);
      for (var i = 1; i <= segs; i++) {
        var k = i / segs;
        ctx.lineTo(x1 + (x2 - x1) * k + U.noise2(seedI + i * 1.7, ph) * amp,
                   y1 + (y2 - y1) * k + U.noise2(seedI + i * 2.3 + 50, ph) * amp);
      }
    }

    var size = p.size || 120;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(43,38,32,0.88)';
    ctx.font = '800 ' + Math.round(size * 0.55) + 'px Georgia, "Songti SC", serif';
    var label = String(p.text || '重点在这里');
    ctx.fillText(label, W / 2, H * 0.42);

    var cyc = 2.8, ph = (tt % cyc) / cyc;
    var prog = U.ease.inOutCubic(U.clamp(ph * 1.6, 0, 1));
    var lw = 5 * S;

    if (p.kind === 'underline') {
      var uw = Math.min(W * 0.66, ctx.measureText(label).width * 1.15);
      var y0 = H * 0.42 + size * 0.42;
      for (var pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = U.rgba(INK, pass === 0 ? 0.9 : 0.45);
        ctx.lineWidth = pass === 0 ? lw : lw * 0.6;
        ctx.lineCap = 'round';
        var seg = U.clamp(prog * 1.15 - pass * 0.3, 0, 1);
        if (seg <= 0.01) continue;
        ctx.beginPath();
        wob(W / 2 - uw / 2, y0 + pass * 9 * S, W / 2 - uw / 2 + uw * seg, y0 + pass * 9 * S + U.noise2(pass, 1) * 4 * S, 4.5 * S, Math.floor(tt * 7), pass * 7);
        ctx.stroke();
      }
    }

    if (p.kind === 'circle') {
      /* 手绘椭圆圈重点：约 1.8 圈，起笔收笔略飘 */
      var rx = Math.min(W * 0.4, ctx.measureText(label).width * 0.72), ry = size * 0.72;
      var cx = W / 2, cy = H * 0.42;
      var total = Math.PI * 2 * 1.8, ang = total * prog - Math.PI * 0.6;
      var ph2 = Math.floor(tt * 7);
      for (var pp = 0; pp < 2; pp++) {
        ctx.strokeStyle = U.rgba(INK, pp === 0 ? 0.92 : 0.4);
        ctx.lineWidth = pp === 0 ? lw : lw * 0.55;
        ctx.beginPath();
        var steps = 42, sn = Math.floor(steps * U.clamp(ang / total + 0.34, 0, 1));
        for (var si = 0; si <= sn; si++) {
          var a2 = -Math.PI * 0.6 + (si / steps) * total;
          var jr = 1 + U.noise2(si * 0.9 + pp * 31, ph2) * 0.035;
          var px = cx + Math.cos(a2) * rx * jr, py = cy + Math.sin(a2) * ry * jr;
          if (si === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }

    if (p.kind === 'arrow') {
      /* 涂鸦箭头：曲线箭杆划入 + 双笔触箭头 */
      var ph3 = Math.floor(tt * 7);
      var x1 = W * 0.3, y1 = H * 0.7, x2 = W * 0.62, y2 = H * 0.52;
      var mx = (x1 + x2) / 2 + 60 * S, my = y1 + 90 * S;
      ctx.strokeStyle = U.rgba(INK, 0.9); ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath();
      var segs = 24, lim = Math.ceil(segs * prog);
      for (var ai = 0; ai <= lim; ai++) {
        var k3 = ai / segs;
        var bx = (1 - k3) * (1 - k3) * x1 + 2 * (1 - k3) * k3 * mx + k3 * k3 * x2;
        var by = (1 - k3) * (1 - k3) * y1 + 2 * (1 - k3) * k3 * my + k3 * k3 * y2;
        bx += U.noise2(ai * 1.3, ph3) * 3.5 * S; by += U.noise2(ai * 1.7 + 40, ph3) * 3.5 * S;
        if (ai === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
      }
      ctx.stroke();
      /* 箭头头部（接近终点时出现） */
      if (prog > 0.75) {
        var hp = U.ease.outCubic((prog - 0.75) / 0.25);
        ctx.beginPath();
        wob(x2, y2, x2 - 46 * S * hp + 8 * S, y2 + 26 * S * hp - 6 * S, 3 * S, ph3, 91, 6);
        ctx.stroke();
        ctx.beginPath();
        wob(x2, y2, x2 - 20 * S * hp - 12 * S, y2 + 40 * S * hp, 3 * S, ph3, 97, 6);
        ctx.stroke();
      }
    }

    if (p.kind === 'splatter') {
      /* 墨点飞溅：中心墨团呼吸 + 飞溅点循环 */
      var cx2 = W / 2, cy2 = H * 0.45;
      var ph4 = (tt % 2.4) / 2.4;
      var pulse = 1 + Math.sin(tt * 3) * 0.06;
      ctx.fillStyle = U.rgba(INK, 0.92);
      ctx.beginPath();
      for (var si2 = 0; si2 <= 40; si2++) {
        var a4 = (si2 / 40) * Math.PI * 2;
        var r4 = (54 + U.noise2(Math.cos(a4) * 2, Math.sin(a4) * 2 + 7) * 16) * S * pulse;
        var px4 = cx2 + Math.cos(a4) * r4, py4 = cy2 + Math.sin(a4) * r4;
        if (si2 === 0) ctx.moveTo(px4, py4); else ctx.lineTo(px4, py4);
      }
      ctx.closePath(); ctx.fill();
      /* 飞溅小点 */
      var N = Math.round(26 * (p.density === undefined ? 1 : p.density));
      for (var i4 = 0; i4 < N; i4++) {
        var ang4 = U.rnd(0, Math.PI * 2, i4 * 3 + 1);
        var dist = U.rnd(70, 330, i4 * 3 + 2) * S;
        var fly = U.ease.outCubic(U.clamp(ph4 * 1.8 - U.rng(i4 * 3) * 0.5, 0, 1));
        var rr4 = U.rnd(1.6, 6.5, i4 * 3 + 3) * S * (1 - fly * 0.4);
        ctx.globalAlpha = Math.max(0, 0.85 - fly * 0.85);
        ctx.beginPath();
        ctx.arc(cx2 + Math.cos(ang4) * dist * fly, cy2 + Math.sin(ang4) * dist * fly, Math.max(0.4, rr4), 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (p.kind === 'ripple') {
      /* 墨滴涟漪：同心墨环扩散消隐 */
      var cx5 = W / 2, cy5 = H * 0.46;
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(cx5, cy5, 10 * S, 0, 7); ctx.fill();
      var RINGS = 5;
      for (var ri = 0; ri < RINGS; ri++) {
        var rp = ((tt * 0.42 + ri / RINGS) % 1);
        var rad = (30 + rp * 340) * S;
        ctx.strokeStyle = U.rgba(INK, (1 - rp) * 0.55);
        ctx.lineWidth = Math.max(0.6, (4.5 - rp * 4) * S);
        ctx.beginPath();
        for (var ri2 = 0; ri2 <= 36; ri2++) {
          var a5 = (ri2 / 36) * Math.PI * 2;
          var jr5 = 1 + U.noise2(Math.cos(a5) * 3 + ri * 9, Math.sin(a5) * 3) * 0.05;
          var px5 = cx5 + Math.cos(a5) * rad * jr5, py5 = cy5 + Math.sin(a5) * rad * jr5;
          if (ri2 === 0) ctx.moveTo(px5, py5); else ctx.lineTo(px5, py5);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
  }

  /* ══════════ C. 纸感场景家族（创意生活） ══════════ */

  function paperSceneDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var PAPER = '#F6F2E9', INK = '#2B2620', RED = '#C4402F';

    function paperBg(tint) {
      ctx.fillStyle = tint || PAPER; ctx.fillRect(0, 0, W, H);
      var step = Math.max(3, Math.round(4 * S));
      for (var y = 0; y < H; y += step) {
        for (var x = 0; x < W; x += step) {
          var n = U.noise2(x * 0.05, y * 0.05);
          if (n > 0.42) { ctx.fillStyle = 'rgba(43,38,32,' + ((n - 0.42) * 0.09).toFixed(3) + ')'; ctx.fillRect(x, y, step, step); }
        }
      }
    }
    function wob(x1, y1, x2, y2, amp, ph, seedI, segs) {
      segs = segs || 14;
      ctx.moveTo(x1 + U.noise2(seedI, ph) * amp, y1 + U.noise2(seedI + 9, ph) * amp);
      for (var i = 1; i <= segs; i++) {
        var k = i / segs;
        ctx.lineTo(x1 + (x2 - x1) * k + U.noise2(seedI + i * 1.7, ph) * amp,
                   y1 + (y2 - y1) * k + U.noise2(seedI + i * 2.3 + 50, ph) * amp);
      }
    }

    if (p.kind === 'grain') {
      /* 手账纸纹：横线 + 装订孔 + 慢速浮尘 */
      paperBg();
      var lineY = H * 0.16, gap = H * 0.105;
      ctx.strokeStyle = 'rgba(62,92,118,0.28)'; ctx.lineWidth = 1.6 * S;
      for (var ly = lineY; ly < H - 20; ly += gap) {
        ctx.beginPath(); wob(W * 0.1, ly, W * 0.9, ly, 1.5 * S, 1, ly, 8); ctx.stroke();
      }
      /* 装订孔 */
      for (var hy = H * 0.12; hy < H * 0.95; hy += H * 0.19) {
        ctx.fillStyle = 'rgba(90,74,52,0.18)';
        ctx.beginPath(); ctx.arc(W * 0.055, hy, 8 * S, 0, 7); ctx.fill();
        ctx.fillStyle = PAPER;
        ctx.beginPath(); ctx.arc(W * 0.055, hy, 5.4 * S, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(90,74,52,0.22)'; ctx.lineWidth = 1.4 * S;
        ctx.beginPath(); ctx.arc(W * 0.055, hy, 5.4 * S, 0, 7); ctx.stroke();
      }
      /* 浮尘 */
      for (var d = 0; d < 26; d++) {
        var dx = (U.rng(d) * W + tt * 12 * (0.4 + U.rng(d + 9))) % W;
        var dy = (U.rng(d + 3) * H + Math.sin(tt * 0.7 + d) * 20 * S + H) % H;
        ctx.fillStyle = 'rgba(43,38,32,' + (0.05 + U.rng(d + 6) * 0.08).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(dx, dy, (1 + U.rng(d + 12) * 2) * S, 0, 7); ctx.fill();
      }
    }

    if (p.kind === 'tape') {
      /* 胶带手账卡：拍立得相框 + 两条胶带 + 手写标签，轻摆 */
      paperBg();
      var cardW = Math.min(W * 0.4, H * 0.62), cardH = cardW * 1.2;
      var cx = W / 2, cy = H * 0.48;
      var sway = Math.sin(tt * 1.1) * 0.02;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(sway);
      /* 相框投影 */
      ctx.fillStyle = 'rgba(60,48,30,0.16)';
      ctx.beginPath(); ctx.rect(-cardW / 2 + 8 * S, -cardH / 2 + 12 * S, cardW, cardH); ctx.fill();
      /* 相框 */
      ctx.fillStyle = '#FDFBF5';
      ctx.beginPath(); ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH); ctx.fill();
      ctx.strokeStyle = 'rgba(43,38,32,0.14)'; ctx.lineWidth = 2 * S; ctx.stroke();
      /* 相片内容：小山水 + 太阳 */
      var iw = cardW * 0.84, ih = cardW * 0.78, ix = -iw / 2, iy = -cardH / 2 + cardW * 0.07;
      ctx.save();
      ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
      ctx.fillStyle = '#EFE7D4'; ctx.fillRect(ix, iy, iw, ih);
      var sunX = ix + iw * 0.68, sunY = iy + ih * 0.3;
      var sunR = iw * 0.13 * (1 + Math.sin(tt * 1.4) * 0.05);
      ctx.fillStyle = 'rgba(212,116,44,0.85)';
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, 7); ctx.fill();
      for (var m = 3; m >= 0; m--) {
        var base = iy + ih * (0.62 + m * 0.09);
        var hgt = ih * (0.3 - m * 0.06);
        ctx.fillStyle = 'rgba(43,38,32,' + (0.14 + (3 - m) * 0.17).toFixed(2) + ')';
        ctx.beginPath(); ctx.moveTo(ix, iy + ih);
        var segm = 26;
        for (var mi = 0; mi <= segm; mi++) {
          var mx = ix + (mi / segm) * iw;
          var myy = base - Math.abs(U.noise2(m * 17 + mi * 0.55, m)) * hgt;
          ctx.lineTo(mx, myy);
        }
        ctx.lineTo(ix + iw, iy + ih); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      /* 胶带两条 */
      function tape(tx, ty, rot, hue) {
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot);
        ctx.fillStyle = hue;
        ctx.beginPath(); ctx.rect(-cardW * 0.3, -12 * S, cardW * 0.6, 24 * S); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        for (var ti = 0; ti < 7; ti++) {
          ctx.fillRect(-cardW * 0.3 + U.rng(ti + tx) * cardW * 0.58, -12 * S, 3 * S, 24 * S);
        }
        ctx.restore();
      }
      tape(0, -cardH / 2, -0.16, 'rgba(196,64,47,0.5)');
      tape(cardW * 0.36, cardH / 2, 0.42, 'rgba(62,92,118,0.45)');
      /* 手写标签 */
      ctx.fillStyle = INK;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 ' + Math.round(cardW * 0.12) + 'px Georgia, "Songti SC", "Kaiti SC", serif';
      ctx.fillText(String(p.text || '夏日纪念'), 0, cardH / 2 - cardW * 0.16);
      ctx.restore();
    }

    if (p.kind === 'sun') {
      /* 纸上太阳：水彩暖阳多层晕染 + 手绘光线慢旋 */
      paperBg();
      var cx2 = W / 2, cy2 = H * 0.46;
      var R = Math.min(W, H) * 0.2 * (1 + Math.sin(tt * 1.2) * 0.03);
      var hues = ['rgba(228,148,54,0.20)', 'rgba(224,120,44,0.28)', 'rgba(210,92,36,0.5)', 'rgba(178,70,28,0.75)'];
      for (var l = 0; l < 4; l++) {
        var lr = R * (1 + l * 0.3);
        ctx.fillStyle = hues[l];
        ctx.beginPath();
        for (var li = 0; li <= 44; li++) {
          var a2 = (li / 44) * Math.PI * 2;
          var jr = 1 + U.noise2(Math.cos(a2) * 2.2 + l * 13, Math.sin(a2) * 2.2 + Math.floor(tt * 5) * 0.13) * 0.12;
          var px = cx2 + Math.cos(a2) * lr * jr, py = cy2 + Math.sin(a2) * lr * jr;
          if (li === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
      /* 手绘光线 */
      var ph3 = Math.floor(tt * 6);
      ctx.strokeStyle = 'rgba(178,70,28,0.65)'; ctx.lineWidth = 4.5 * S; ctx.lineCap = 'round';
      for (var r2 = 0; r2 < 12; r2++) {
        var ang3 = (r2 / 12) * Math.PI * 2 + tt * 0.12;
        var rIn = R * 1.55, rOut = R * (1.9 + 0.16 * Math.sin(tt * 2 + r2));
        ctx.beginPath();
        wob(cx2 + Math.cos(ang3) * rIn, cy2 + Math.sin(ang3) * rIn,
            cx2 + Math.cos(ang3) * rOut, cy2 + Math.sin(ang3) * rOut, 3 * S, ph3, r2 * 5, 5);
        ctx.stroke();
      }
      /* 小字 */
      ctx.fillStyle = 'rgba(43,38,32,0.45)';
      ctx.textAlign = 'center';
      ctx.font = '600 ' + Math.round(22 * S) + 'px Georgia, serif';
      ctx.fillText(String(p.text || 'STAY WARM'), W / 2, H * 0.86);
    }

    if (p.kind === 'mountain') {
      /* 水墨远山：五层浓淡山峦 + 雾带，宣纸底 */
      paperBg('#F4EFE3');
      var layers = 5;
      for (var m2 = 0; m2 < layers; m2++) {
        var depth = m2 / (layers - 1);
        var base = H * (0.52 + depth * 0.34);
        var hgt = H * (0.34 - depth * 0.2);
        var drift = tt * (6 + depth * 14) * S;
        var al = 0.16 + (1 - depth) * 0.62;
        ctx.fillStyle = 'rgba(52,58,54,' + al.toFixed(2) + ')';
        ctx.beginPath(); ctx.moveTo(-20, H + 20);
        var segs2 = 60;
        for (var mi2 = 0; mi2 <= segs2; mi2++) {
          var mx2 = -20 + (mi2 / segs2) * (W + 40);
          var wx = (mx2 + drift) * 0.0016;
          var myy = base - Math.abs(U.noise2(wx + m2 * 8, m2 * 3.7) * 0.7 + U.noise2(wx * 2.7, m2) * 0.3) * hgt;
          ctx.lineTo(mx2, myy);
        }
        ctx.lineTo(W + 20, H + 20); ctx.closePath(); ctx.fill();
        /* 雾带 */
        if (m2 < layers - 1) {
          var fogY = base + H * 0.03 + Math.sin(tt * 0.5 + m2) * 8 * S;
          var fg = ctx.createLinearGradient(0, fogY - 26 * S, 0, fogY + 26 * S);
          fg.addColorStop(0, 'rgba(244,239,227,0)');
          fg.addColorStop(0.5, 'rgba(244,239,227,0.75)');
          fg.addColorStop(1, 'rgba(244,239,227,0)');
          ctx.fillStyle = fg; ctx.fillRect(0, fogY - 26 * S, W, 52 * S);
        }
      }
      /* 题款竖字 + 小印 */
      ctx.fillStyle = 'rgba(43,38,32,0.72)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var title = String(p.text || '山色空蒙');
      ctx.font = '700 ' + Math.round(34 * S) + 'px Georgia, "Songti SC", "Kaiti SC", serif';
      for (var ti2 = 0; ti2 < title.length; ti2++) {
        ctx.fillText(title[ti2], W * 0.09, H * 0.16 + ti2 * 46 * S);
      }
      ctx.fillStyle = U.rgba(RED, 0.85);
      ctx.beginPath(); ctx.rect(W * 0.09 - 16 * S, H * 0.16 + title.length * 46 * S + 6 * S, 32 * S, 32 * S); ctx.fill();
    }

    if (p.kind === 'seal') {
      /* 印章落款：竖排名 + 朱文印章盖下（回弹 + 印泥晕染）
         字号自适应画布：保证「名 + 印」整列在任何画幅都放得下 */
      paperBg();
      var name = String(p.text || '嘉Jaykou');
      var cyc = 3, ph = (tt % cyc) / cyc;
      var hit = U.clamp(ph * 5, 0, 1);
      var sc = hit < 1 ? U.ease.outBack(hit) * (1 - (1 - U.clamp((ph - 0.2) * 6, 0, 1)) * 0.04) : 1;
      var cs = Math.min(p.size, H * 0.78 / (name.length * 0.62 + 1.15));
      var topY = H * 0.5 - (name.length * cs * 0.62 + cs * 1.05) / 2 + cs * 0.5;
      /* 竖排名 */
      ctx.fillStyle = INK;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 ' + Math.round(cs * 0.5) + 'px Georgia, "Songti SC", "Kaiti SC", serif';
      for (var ni = 0; ni < name.length; ni++) {
        ctx.fillText(name[ni], W * 0.5, topY + ni * cs * 0.62);
      }
      /* 印章 */
      var sx = W * 0.5, sy = topY + name.length * cs * 0.62 + cs * 0.55;
      var half = cs * 0.42;
      ctx.save();
      ctx.translate(sx, sy); ctx.scale(sc, sc); ctx.rotate(-0.03);
      var bleed = 1 - U.clamp((ph - 0.2) * 4, 0, 1);
      ctx.fillStyle = U.rgba(RED, 0.88);
      ctx.beginPath();
      for (var qi = 0; qi <= 40; qi++) {
        var a4 = (qi / 40) * Math.PI * 2;
        var jr4 = 1 + U.noise2(Math.cos(a4) * 4, Math.sin(a4) * 4) * 0.02 + bleed * U.noise2(Math.cos(a4) * 9, Math.sin(a4) * 9) * 0.05;
        var qx = Math.cos(a4) * half * jr4 * 1.06, qy = Math.sin(a4) * half * jr4;
        if (qi === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
      }
      ctx.closePath(); ctx.fill();
      /* 印面留白刻字 */
      ctx.fillStyle = '#F6F2E9';
      ctx.font = '900 ' + Math.round(half * 0.95) + 'px Georgia, "Songti SC", serif';
      ctx.fillText('印', 0, 2);
      ctx.strokeStyle = 'rgba(246,242,233,0.95)'; ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.rect(-half * 0.72, -half * 0.72, half * 1.44, half * 1.44); ctx.stroke();
      ctx.restore();
      /* 盖下时的墨晕 */
      if (bleed > 0.02) {
        ctx.strokeStyle = U.rgba(RED, bleed * 0.4);
        ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.arc(sx, sy, half * (1.25 + (1 - bleed) * 0.5), 0, 7); ctx.stroke();
      }
    }
  }

  /* ══════════ D. 描线家族（铅笔 / 粉笔） ══════════ */

  function sketchDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var cyc = 4, ph = (tt % cyc) / cyc;
    var prog = U.ease.inOutCubic(U.clamp(ph * 1.35, 0, 1));

    if (p.kind === 'pencil') {
      /* 铅笔线稿：目标图形被多遍抖动描线画出来，笔尖亮点跟随 */
      ctx.fillStyle = '#F2EFE7'; ctx.fillRect(0, 0, W, H);
      var shape = String(p.shape || 'star');
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.3;
      /* 目标折线（多边形或星形） */
      var pts = [], n = shape === 'star' ? 10 : 6, i;
      for (i = 0; i <= n; i++) {
        var a = (i / n) * Math.PI * 2 - Math.PI / 2;
        var rr = shape === 'star' ? (i % 2 === 0 ? R : R * 0.45) : R;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      var ph2 = Math.floor(tt * 8);
      var passes = 3, done = 0, remain = prog * passes * pts.length;
      var lwBase = Math.max(1.6, Math.min(W, H) * 0.0042);
      for (var pa = 0; pa < passes; pa++) {
        var from = U.clamp(remain - pa * pts.length, 0, pts.length);
        if (from <= 0) break;
        ctx.strokeStyle = 'rgba(48,50,56,' + (0.85 - pa * 0.2).toFixed(2) + ')';
        ctx.lineWidth = Math.max(1.2, lwBase - pa * lwBase * 0.25);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        var lim = Math.floor(from);
        for (i = 0; i <= lim; i++) {
          var jx = U.noise2(pa * 40 + i * 1.7, ph2) * 3 * S;
          var jy = U.noise2(pa * 40 + i * 2.3 + 60, ph2) * 3 * S;
          if (i === 0) ctx.moveTo(pts[i][0] + jx, pts[i][1] + jy);
          else ctx.lineTo(pts[i][0] + jx, pts[i][1] + jy);
        }
        ctx.stroke();
      }
      /* 笔尖亮点 */
      var segF = prog * passes * pts.length, segI = Math.floor(segF) % pts.length, segK = segF % 1;
      if (prog < 0.999) {
        var tipx = pts[segI][0] + (pts[(segI + 1) % pts.length][0] - pts[segI][0]) * segK;
        var tipy = pts[segI][1] + (pts[(segI + 1) % pts.length][1] - pts[segI][1]) * segK;
        ctx.fillStyle = '#C4402F';
        ctx.beginPath(); ctx.arc(tipx, tipy, 6 * S, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(196,64,47,0.4)'; ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.arc(tipx, tipy, 11 * S + Math.sin(tt * 6) * 3 * S, 0, 7); ctx.stroke();
      }
    }

    if (p.kind === 'chalk') {
      /* 黑板粉笔字：墨绿板 + 三重抖动粉笔描边 + 粉尘 */
      ctx.fillStyle = '#2E4636'; ctx.fillRect(0, 0, W, H);
      /* 板面细微擦痕 */
      for (var wi = 0; wi < 14; wi++) {
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.015 + U.rng(wi) * 0.02).toFixed(3) + ')';
        ctx.lineWidth = (8 + U.rng(wi + 5) * 26) * S;
        ctx.beginPath();
        var wy = U.rng(wi + 9) * H;
        ctx.moveTo(-20, wy); ctx.quadraticCurveTo(W / 2, wy + 40 * S * (U.rng(wi) - 0.5), W + 20, wy + 20 * S);
        ctx.stroke();
      }
      /* 木框 */
      ctx.strokeStyle = '#8A6A42'; ctx.lineWidth = 14 * S;
      ctx.strokeRect(7 * S, 7 * S, W - 14 * S, H - 14 * S);
      var str = String(p.text || '黑板报');
      var ph3 = Math.floor(tt * 6);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var size = p.size;
      ctx.font = '700 ' + Math.round(size) + 'px Georgia, "Kaiti SC", "Songti SC", serif';
      var shown = U.clamp(prog * 1.4, 0, 1);
      var total = ctx.measureText(str).width;
      var x0 = W / 2 - total / 2;
      for (var ci = 0; ci < str.length; ci++) {
        var ch = str[ci], cw = ctx.measureText(ch).width;
        var cShow = U.clamp(shown * str.length - ci, 0, 1);
        if (cShow <= 0) { x0 += cw; continue; }
        ctx.save();
        ctx.translate(x0 + cw / 2, H / 2);
        ctx.globalAlpha = cShow;
        for (var pa2 = 0; pa2 < 3; pa2++) {
          ctx.fillStyle = 'rgba(246,246,238,' + (0.72 - pa2 * 0.2).toFixed(2) + ')';
          ctx.fillText(ch, U.noise2(ci * 3 + pa2 * 17, ph3) * 2.2 * S, U.noise2(ci * 5 + pa2 * 23, ph3) * 2.2 * S);
        }
        /* 字底阴影提高可读性 */
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillText(ch, 2.5 * S, 2.5 * S);
        ctx.restore();
        x0 += cw;
      }
      /* 粉笔与粉尘 */
      var dustN = Math.round(18 * (1 - shown) + 8);
      for (var d2 = 0; d2 < dustN; d2++) {
        var dx = W / 2 + U.rnd(-total / 2, total / 2, d2 * 3);
        var dy = H / 2 + size * 0.55 + U.rnd(0, 40, d2 * 3 + 1) * S;
        ctx.fillStyle = 'rgba(240,240,232,' + (0.25 + U.rng(d2) * 0.3).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(dx, dy, U.rnd(1, 3, d2 * 3 + 2) * S, 0, 7); ctx.fill();
      }
      ctx.fillStyle = 'rgba(240,240,232,0.85)';
      ctx.beginPath(); ctx.ellipse(W - 90 * S, H - 46 * S, 26 * S, 8 * S, 0.06, 0, 7); ctx.fill();
    }
  }

  /* ══════════ E. 社区招牌单品 ══════════ */

  MF.register({
    id: 'fm-watercolor',
    name: '水彩晕染',
    cat: '光影氛围', type: 'block', dur: 8, poster: 0.55,
    desc: '三组低透明水色以噪声边缘互相浸润，缓慢生长又缓缓退去，纸面水彩的呼吸感',
    tags: ['水彩', '晕染', '纸感'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('blobs', '色团数', 5, rng(5, 2, 10, 1)),
      P('soft', '柔度', 0.5, rng(0.5, 0.1, 1, 0.05))
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      ctx.fillStyle = '#F6F2E9'; ctx.fillRect(0, 0, W, H);
      var hues = ['rgba(196,90,60,', 'rgba(74,110,144,', 'rgba(150,132,60,', 'rgba(90,130,96,'];
      var N = Math.max(2, Math.round(p.blobs));
      for (var b = 0; b < N; b++) {
        var cx = U.rnd(W * 0.18, W * 0.82, b * 3 + 1);
        var cy = U.rnd(H * 0.2, H * 0.8, b * 3 + 2);
        var base = Math.min(W, H) * U.rnd(0.14, 0.3, b * 3 + 3);
        var hue = hues[b % hues.length];
        var grow = U.ease.inOutSine((t * 0.24 * p.speed + U.rng(b * 7)) % 1);
        var rad = base * (0.5 + grow * 0.8);
        for (var l = 0; l < 3; l++) {
          ctx.fillStyle = hue + (0.1 + (2 - l) * 0.07).toFixed(2) + ')';
          ctx.beginPath();
          var wob = 0.16 + p.soft * 0.22;
          for (var li = 0; li <= 46; li++) {
            var a = (li / 46) * Math.PI * 2;
            var jr = 1 + U.noise2(Math.cos(a) * 2 + b * 9 + l * 4, Math.sin(a) * 2 + Math.floor(t * 4) * 0.11) * wob;
            var px = cx + Math.cos(a) * rad * (1 + l * 0.16) * jr;
            var py = cy + Math.sin(a) * rad * (1 + l * 0.16) * jr;
            if (li === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.fill();
        }
      }
    }
  });

  MF.register({
    id: 'fm-chladni',
    name: '克拉尼沙盘',
    cat: '粒子与反馈', type: 'block', dur: 10, poster: 0.6,
    desc: '振动板上的沙粒不断向节线聚集，模式在 (m,n) 振型间连续变形迁移（3D-Chladni）',
    tags: ['Chladni', '沙盘', '物理'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('grains', '沙粒数', 2200, rng(2200, 400, 4000, 50)),
      P('size', '板面占比', 0.62, rng(0.62, 0.3, 0.85, 0.01))
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      ctx.fillStyle = '#14120E'; ctx.fillRect(0, 0, W, H);
      var side = Math.min(W, H) * p.size;
      var x0 = W / 2 - side / 2, y0 = H / 2 - side / 2;
      /* 振型插值：预设序列 (m,n) */
      var MODES = [[1, 2], [2, 3], [1, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 1]];
      var cyc = 5 * Math.max(0.2, p.speed), cycT = (t / cyc) % 1;
      var mi = Math.floor(cycT * MODES.length) % MODES.length;
      var mj = (mi + 1) % MODES.length;
      var blend = U.ease.inOutCubic(U.clamp((cycT * MODES.length) % 1 / 0.45 - 1.2, 0, 1));
      /* blend: 前 55% 保持，后 45% 过渡 */
      var hold = 0.62;
      var localT = (cycT * MODES.length) % 1;
      blend = U.ease.inOutCubic(U.clamp((localT - hold) / (1 - hold), 0, 1));
      var mm = U.lerp(MODES[mi][0], MODES[mj][0], blend);
      var nn = U.lerp(MODES[mi][1], MODES[mj][1], blend);
      /* 沙盘底 */
      ctx.fillStyle = '#1C1913'; ctx.fillRect(x0, y0, side, side);
      ctx.strokeStyle = 'rgba(214,196,158,0.25)'; ctx.lineWidth = 2 * S;
      ctx.strokeRect(x0, y0, side, side);
      /* 沙粒：每帧做 K 步确定性松弛（位置 = f(初始, 当前振型)） */
      var N = Math.round(p.grains), K = 10;
      var PI = Math.PI;
      function chl(u, v) {
        return Math.cos(PI * mm * u) * Math.cos(PI * nn * v) - Math.cos(PI * nn * u) * Math.cos(PI * mm * v);
      }
      for (var i = 0; i < N; i++) {
        var px = U.rng(i * 2 + 1), py = U.rng(i * 2 + 2);
        for (var k = 0; k < K; k++) {
          var f0 = Math.abs(chl(px, py));
          var step = 0.022 * (1 - f0 * 0.3);
          var bx = px, by = py, bf = f0;
          var cand = [[px + step, py], [px - step, py], [px, py + step], [px, py - step]];
          for (var c = 0; c < 4; c++) {
            var fv = Math.abs(chl(cand[c][0], cand[c][1]));
            if (fv < bf) { bf = fv; bx = cand[c][0]; by = cand[c][1]; }
          }
          /* 抖动让沙粒有生命 */
          var jit = 0.003 * (0.4 + U.noise2(i * 0.37 + k * 5.1, t * 2.2) * 0.6 + f0 * 1.2);
          px = U.clamp(bx + U.noise2(i * 1.3 + k * 9.7, t * 3 + k) * jit, 0, 1);
          py = U.clamp(by + U.noise2(i * 2.7 + k * 4.3, t * 3 + k + 7) * jit, 0, 1);
        }
        var al = U.clamp(1.05 - Math.abs(chl(px, py)) * 1.5, 0.4, 1);
        ctx.fillStyle = 'rgba(238,220,180,' + al.toFixed(2) + ')';
        ctx.fillRect(x0 + px * side, y0 + py * side, Math.max(1.2, 2 * S), Math.max(1.2, 2 * S));
      }
      /* 角标：当前振型 */
      ctx.fillStyle = 'rgba(214,196,158,0.55)';
      ctx.font = '600 ' + Math.round(22 * S) + 'px ' + U.mono;
      ctx.textAlign = 'left';
      ctx.fillText('CHLADNI  m=' + mm.toFixed(2) + '  n=' + nn.toFixed(2), x0, y0 - 18 * S);
    }
  });

  MF.register({
    id: 'fm-fisheye',
    name: '鱼眼莫尔网格',
    cat: '几何与抽象', type: 'block', dur: 8, poster: 0.5,
    desc: '极坐标网格被鱼眼畸变吞吐呼吸，两组错位圆环叠出莫尔干涉（fisheye-motion）',
    tags: ['Fisheye', '莫尔', '畸变'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('strength', '畸变强度', 0.65, rng(0.65, 0.1, 1.2, 0.05)),
      P('rings', '环数', 16, rng(16, 6, 30, 1))
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      ctx.fillStyle = '#0B0C10'; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var Rmax = Math.min(W, H) * 0.48;
      var str = p.strength * (0.75 + 0.25 * Math.sin(t * 0.9 * p.speed));
      var rings = Math.max(4, Math.round(p.rings));
      function fisheye(r01) { return Math.pow(r01, 1 + str * 1.6); }
      ctx.lineCap = 'round';
      /* 环 */
      for (var r = 1; r <= rings; r++) {
        var r01 = r / rings;
        var rad = fisheye(r01) * Rmax;
        var al = 0.12 + 0.5 * (1 - r01) * (0.6 + 0.4 * Math.sin(t * 2 + r));
        ctx.strokeStyle = 'rgba(150,190,255,' + al.toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.5, (2.4 * (1 - r01) + 0.4) * S);
        ctx.beginPath();
        for (var a = 0; a <= 72; a++) {
          var ang = (a / 72) * Math.PI * 2;
          var jr = 1 + U.noise2(Math.cos(ang) * 1.4 + r, Math.sin(ang) * 1.4) * 0.012;
          var px = cx + Math.cos(ang) * rad * jr, py = cy + Math.sin(ang) * rad * jr;
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
      }
      /* 辐条 */
      var spokes = 28;
      for (var sp = 0; sp < spokes; sp++) {
        var ang2 = (sp / spokes) * Math.PI * 2 + t * 0.06 * p.speed;
        ctx.strokeStyle = 'rgba(150,190,255,0.16)';
        ctx.lineWidth = 1 * S;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        var segs = 16;
        for (var si = 1; si <= segs; si++) {
          var rr = fisheye(si / segs) * Rmax;
          ctx.lineTo(cx + Math.cos(ang2) * rr, cy + Math.sin(ang2) * rr);
        }
        ctx.stroke();
      }
      /* 莫尔层：第二组环轻微偏移 + 缓慢缩放 */
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      var off = Math.sin(t * 0.7 * p.speed) * 8 * S;
      for (var r2 = 1; r2 <= rings; r2 += 2) {
        var rad2 = fisheye(r2 / rings) * Rmax * 1.012;
        ctx.strokeStyle = 'rgba(255,140,110,0.10)';
        ctx.lineWidth = 1 * S;
        ctx.beginPath();
        ctx.arc(cx + off, cy - off, rad2, 0, 7);
        ctx.stroke();
      }
      ctx.restore();
      /* 中心瞳孔 */
      var pr = 6 * S + Math.sin(t * 4) * 2 * S;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, 7); ctx.fill();
    }
  });

  MF.register({
    id: 'fm-boids',
    name: '鱼群洄游',
    cat: '粒子与反馈', type: 'block', dur: 10, poster: 0.5,
    desc: '上百条小鱼沿共享流场洄游，尾鳍摆动、疏密聚散自然（threejs-boids 风格）',
    tags: ['Boids', '鱼群', '群体'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('fish', '鱼数', 110, rng(110, 20, 260, 2))
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      ctx.fillStyle = '#0A1420'; ctx.fillRect(0, 0, W, H);
      /* 深海渐层光 */
      var g = ctx.createRadialGradient(W * 0.3, H * 0.1, 0, W * 0.3, H * 0.1, W * 0.8);
      g.addColorStop(0, 'rgba(60,110,140,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var N = Math.max(12, Math.round(p.fish));
      var spd01 = 0.075 * p.speed;
      /* 鱼群按 band 聚成 9~12 条的小群，群内错落，整体从左向右洄游 */
      var BAND = 10;
      for (var i = 0; i < N; i++) {
        var band = Math.floor(i / BAND);
        var inBand = i % BAND;
        var bandY = H * (0.14 + U.rng(band * 7 + 3) * 0.72);
        var x01 = ((i / N) * BAND * 1.7 + t * spd01 + U.rng(i * 3 + 1) * 0.02) % 1;
        var px = x01 * W * 1.12 - W * 0.06;
        var py = bandY
          + (inBand - BAND / 2) * (14 + U.rng(band) * 10) * S
          + U.noise2(i * 0.8, t * 0.6 * p.speed) * H * 0.05
          + Math.sin(t * 1.2 + band * 2.1) * 14 * S;
        var dep = 0.45 + U.rng(i + 90) * 0.55;
        var sz = (8 + U.rng(i + 7) * 6) * S * dep;
        var wig = Math.sin(t * 8 * p.speed + i * 1.7) * 0.5;
        var ang = U.noise2(band * 3.3, t * 0.35) * 0.22;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ang);
        ctx.globalAlpha = 0.4 + dep * 0.55;
        var grad = ctx.createLinearGradient(-sz, 0, sz, 0);
        grad.addColorStop(0, 'rgba(150,195,215,0.95)');
        grad.addColorStop(1, 'rgba(215,238,245,0.8)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sz, 0);
        ctx.quadraticCurveTo(0, -sz * 0.42, -sz * 0.9, 0);
        ctx.quadraticCurveTo(0, sz * 0.42, sz, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(190,220,232,0.8)';
        ctx.lineWidth = Math.max(0.7, sz * 0.16);
        ctx.beginPath();
        ctx.moveTo(-sz * 0.9, 0);
        ctx.lineTo(-sz * 1.5, -sz * (0.34 + wig * 0.2));
        ctx.moveTo(-sz * 0.9, 0);
        ctx.lineTo(-sz * 1.5, sz * (0.34 + wig * 0.2));
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  });

  MF.register({
    id: 'fm-audio-bars',
    name: '手账音频律动',
    cat: '音乐律动', type: 'component', dur: 8, poster: 0.5,
    desc: '纸面上的墨色频谱条对称跳动，红色播放头游走，适合口播/播客封面动效',
    tags: ['音频', '频谱', '播客'],
    params: [
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('bars', '条数', 42, rng(42, 12, 80, 2)),
      P('text', '标题', 'EP.01 · 逐句设计', txt())
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var tt = t * p.speed;
      ctx.fillStyle = '#F6F2E9'; ctx.fillRect(0, 0, W, H);
      var step = 4;
      for (var y = 0; y < H; y += step) {
        for (var x = 0; x < W; x += step) {
          var n = U.noise2(x * 0.05, y * 0.05);
          if (n > 0.46) { ctx.fillStyle = 'rgba(43,38,32,' + ((n - 0.46) * 0.08).toFixed(3) + ')'; ctx.fillRect(x, y, step, step); }
        }
      }
      var N = Math.max(8, Math.round(p.bars));
      var bw = W * 0.62 / N, gap = bw * 0.5;
      var x0 = W * 0.19, cy = H * 0.55, maxH = H * 0.22;
      for (var i = 0; i < N; i++) {
        var s01 = i / (N - 1);
        var env = Math.sin(s01 * Math.PI);
        var v = Math.abs(U.noise2(i * 0.6, Math.floor(tt * 10) * 0.9) * 0.7 + U.noise2(i * 1.7, tt * 3) * 0.3);
        var hh = maxH * env * (0.18 + v * 0.9);
        var bx = x0 + i * (bw + gap);
        ctx.fillStyle = 'rgba(43,38,32,0.85)';
        /* 圆头竖条 */
        var rrr = Math.min(bw / 2, 4 * S);
        ctx.beginPath();
        var byy = cy - hh / 2;
        if (ctx.roundRect) { ctx.roundRect(bx, byy, bw, hh, rrr); ctx.fill(); }
        else { ctx.fillRect(bx, byy, bw, hh); }
        /* 镜像淡影 */
        ctx.fillStyle = 'rgba(43,38,32,0.12)';
        ctx.fillRect(bx, cy + hh / 2 + 6 * S, bw, hh * 0.3);
      }
      /* 播放头 */
      var px = x0 + (W * 0.62) * ((tt * 0.14) % 1);
      ctx.strokeStyle = '#C4402F'; ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px, cy - maxH * 0.72); ctx.lineTo(px, cy + maxH * 0.72); ctx.stroke();
      ctx.fillStyle = '#C4402F';
      ctx.beginPath(); ctx.arc(px, cy - maxH * 0.72, 6 * S, 0, 7); ctx.fill();
      /* 标题 */
      ctx.fillStyle = 'rgba(43,38,32,0.9)';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '800 ' + Math.round(44 * S) + 'px Georgia, "Songti SC", serif';
      ctx.fillText(String(p.text || ''), W * 0.19, H * 0.3);
    }
  });

  MF.register({
    id: 'fm-ink-wipe',
    name: '墨迹擦除转场',
    cat: '转场切换', type: 'block', dur: 4, poster: 0.32,
    desc: '浓墨从一角漫开吞没画面，再从另一角退出显出新幕，边缘是不规则墨渍（手绘转场）',
    tags: ['墨迹', '转场', '擦除'],
    params: [
      P('speed', '速度', 1, rng(1, 0.4, 3, 0.05)),
      P('grain', '墨渍噪声', 0.5, rng(0.5, 0.1, 1, 0.05)),
      P('text', '新幕文字', '下一幕', txt())
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var tt = t * p.speed;
      /* 底幕（新幕） */
      ctx.fillStyle = '#EFE9DB'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(43,38,32,0.8)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(H * 0.11) + 'px Georgia, "Songti SC", serif';
      ctx.fillText(String(p.text || '下一幕'), W / 2, H / 2);
      /* 墨盖进度：0→盖满（0.45）→保持→退出（0.75→1） */
      var cyc = 3, ph = (tt % cyc) / cyc;
      var cover = ph < 0.45 ? U.ease.inOutCubic(ph / 0.45) : (ph < 0.6 ? 1 : 1 - U.ease.inOutCubic(U.clamp((ph - 0.6) / 0.4, 0, 1)));
      if (cover <= 0.001) return;
      var cx, cy;
      if (ph < 0.525) { cx = 0; cy = 0; } else { cx = W; cy = H; }
      var maxR = Math.hypot(W, H) * 1.05;
      var R = cover * maxR;
      ctx.fillStyle = '#17140F';
      ctx.beginPath();
      var edge = 0.1 + p.grain * 0.16;
      for (var a = 0; a <= 72; a++) {
        var ang = (a / 72) * Math.PI * 2;
        var jr = 1 + U.noise2(Math.cos(ang) * 3, Math.sin(ang) * 3 + Math.floor(tt * 8) * 0.2) * edge;
        var px = cx + Math.cos(ang) * R * jr, py = cy + Math.sin(ang) * R * jr;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      /* 前缘墨渍点 */
      var dots = 26;
      for (var d = 0; d < dots; d++) {
        var ang2 = U.rnd(0, Math.PI * 2, d * 3 + 1);
        var dist = R * (1.02 + U.rng(d * 3 + 2) * 0.12);
        ctx.fillStyle = U.rgba('#17140F', 0.5 + U.rng(d * 3 + 3) * 0.5);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang2) * dist, cy + Math.sin(ang2) * dist, U.rnd(3, 14, d) * S, 0, 7);
        ctx.fill();
      }
    }
  });

  /* ══════════ 批量注册 ══════════ */

  /* A. 手绘歌词 · 5 */
  MF.forge({
    cat: '涂鸦手绘', type: 'block', dur: 6, poster: 0.42,
    params: [
      P('kind', '形态', 'paper', sel(['paper', 'wobble', 'karaoke', 'pop', 'brush'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('size', '字号', 150, rng(150, 60, 300, 2)),
      P('ink', '墨色', 'ink', sel([['ink', '墨黑'], ['red', '朱砂'], ['blue', '黛蓝'], ['green', '松绿'], ['umber', '赭石']])),
      P('wobble', '抖动幅度', 1, rng(1, 0, 3, 0.05)),
      P('text', '文本', '一句歌词\n一行手绘\n一张纸', txt(true))
    ],
    draw: lyricDraw,
    ids: [
      { id: 'fm-lyric-paper', name: '手绘歌词逐句', desc: '米白纸底上歌词逐句滚动，当前句弹入并长出手绘下划线，页码角标收尾（motionface 手绘风）', tags: ['歌词', '手绘', '字幕'], cfg: { kind: 'paper', text: '倩女何解\n幽在山水间\n一句一帧' } },
      { id: 'fm-lyric-wobble', name: '手绘沸腾字', desc: '文字逐字微旋转、三重墨影错位，8fps 沸腾帧让它永远在"手抖"（hand-drawn boil）', tags: ['Boil', '抖动', '标题'], cfg: { kind: 'wobble', text: '手绘沸腾', size: 210 } },
      { id: 'fm-karaoke-ink', name: '墨染卡拉OK', desc: '歌词逐字由浅灰被墨色浸染，正在染的字脚带一颗墨点，底部细进度线', tags: ['卡拉OK', '逐字', '歌词'], cfg: { kind: 'karaoke', text: '把每一句歌词都染上墨色', size: 130 } },
      { id: 'fm-lyric-pop', name: '歌词弹入切换', desc: '旧句上飘淡出、新句回弹入场，底部句点进度标示整首进度', tags: ['歌词', '切换', '弹入'], cfg: { kind: 'pop', text: '好想爱这个世界啊\n啊 多交换些快乐\n把不合法的也唱完' } },
      { id: 'fm-brush-text', name: '笔刷扫字', desc: '粗墨笔带从左到右扫过，字随笔锋显形，笔尖颤动收墨', tags: ['笔刷', '扫字', '墨'], cfg: { kind: 'brush', text: '笔锋所至', size: 200 } }
    ]
  });

  /* B. 手绘标注 · 5 */
  MF.forge({
    cat: '涂鸦手绘', type: 'component', dur: 5, poster: 0.55,
    params: [
      P('kind', '形态', 'underline', sel(['underline', 'circle', 'arrow', 'splatter', 'ripple'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('size', '主体大小', 120, rng(120, 50, 260, 2)),
      P('density', '密度', 1, rng(1, 0.2, 2, 0.05)),
      P('ink', '墨色', 'red', sel([['red', '朱砂'], ['ink', '墨黑'], ['blue', '黛蓝'], ['green', '松绿'], ['umber', '赭石']])),
      P('text', '标注文字', '重点在这里', txt())
    ],
    draw: markDraw,
    ids: [
      { id: 'fm-mark-underline', name: '手绘下划线', desc: '两道粗细不同的抖动波浪线依次划过文字下方，收笔带起伏', tags: ['下划线', '标注', '手绘'], cfg: { kind: 'underline', ink: 'red' } },
      { id: 'fm-mark-circle', name: '手绘圈重点', desc: '椭圆两圈半的涂抹圈围绕关键词，起收笔略飘，双层墨迹', tags: ['圈重点', '椭圆', '标注'], cfg: { kind: 'circle', ink: 'red', text: '圈出来' } },
      { id: 'fm-mark-arrow', name: '涂鸦箭头', desc: '二次曲线箭杆划入，双笔触箭头在末端弹出，随手账风格', tags: ['箭头', '指示', '涂鸦'], cfg: { kind: 'arrow', ink: 'blue', text: '看这里' } },
      { id: 'fm-mark-splatter', name: '墨点飞溅', desc: '中心墨团呼吸脉动，周围飞溅小点循环弹出，密度可调', tags: ['墨点', '飞溅', '装饰'], cfg: { kind: 'splatter', ink: 'ink', text: ' ' } },
      { id: 'fm-mark-ripple', name: '墨滴涟漪', desc: '墨点坠纸，五圈不规则墨环依次扩散消隐', tags: ['涟漪', '墨环', '扩散'], cfg: { kind: 'ripple', ink: 'ink', text: ' ' } }
    ]
  });

  /* C. 纸感场景 · 5 */
  MF.forge({
    cat: '拼贴手账', type: 'block', dur: 8, poster: 0.5,
    params: [
      P('kind', '形态', 'grain', sel(['grain', 'tape', 'sun', 'mountain', 'seal'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('size', '主体大小', 150, rng(150, 60, 300, 2)),
      P('text', '文本', '夏日纪念', txt(true))
    ],
    draw: paperSceneDraw,
    ids: [
      { id: 'fm-paper-grain', name: '手账纸纹', desc: '米白纸面纤维 + 淡蓝横线 + 装订孔，浮尘缓缓漂移，做底的万能纸感', tags: ['纸纹', '手账', '背景'], cfg: { kind: 'grain', text: ' ' } },
      { id: 'fm-paper-tape', name: '胶带手账卡', desc: '拍立得相框轻摆，山水小相片配两条半透明胶带与手写标签', tags: ['胶带', '拍立得', '手账'], cfg: { kind: 'tape', text: '夏日纪念' } },
      { id: 'fm-paper-sun', name: '纸上太阳', desc: '水彩暖阳四层晕染呼吸，手绘光线缓慢旋转，纸上生暖意', tags: ['太阳', '水彩', '暖'], cfg: { kind: 'sun', text: 'STAY WARM' } },
      { id: 'fm-paper-mountain', name: '水墨远山', desc: '五层浓淡山峦视差漂移，雾带流动，竖排题款配朱红小印（泸沽湖式封面）', tags: ['水墨', '远山', '国风'], cfg: { kind: 'mountain', text: '山色空蒙' } },
      { id: 'fm-paper-seal', name: '印章落款', desc: '竖排名号下朱文印章回弹盖下，印泥边缘晕染扩散（手绘成片收尾）', tags: ['印章', '落款', '国风'], cfg: { kind: 'seal', text: '嘉Jaykou', size: 150 } }
    ]
  });

  /* D. 描线 · 2 */
  MF.forge({
    cat: '涂鸦手绘', type: 'block', dur: 5, poster: 0.5,
    params: [
      P('kind', '形态', 'pencil', sel(['pencil', 'chalk'])),
      P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
      P('size', '主体大小', 180, rng(180, 60, 320, 2)),
      P('text', '文本', '黑板报', txt()),
      P('shape', '线稿形状', 'star', sel([['star', '星形'], ['hex', '六边形']]))
    ],
    draw: sketchDraw,
    ids: [
      { id: 'fm-pencil-sketch', name: '铅笔线稿', desc: '星形被三遍抖动描线逐渐画出，红色笔尖亮点跟随当前位置', tags: ['铅笔', '线稿', '描线'], cfg: { kind: 'pencil', shape: 'star' } },
      { id: 'fm-chalk-board', name: '黑板粉笔字', desc: '墨绿黑板带擦痕与木框，粉笔字逐字浮现并掉落粉尘，板槽留着粉笔', tags: ['黑板', '粉笔', '校园'], cfg: { kind: 'chalk', text: '黑板报', size: 200 } }
    ]
  });

})();

/* ════════ assets/js/vendor/gifenc.js ════════ */
/* MotionForge — gifenc 1.0.3 (MIT) vendored，包装为 window.GIFEnc */
(function () {
  var exp = {};
  (function (module, exports) {
var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/index.js
__markAsModule(exports);
__export(exports, {
  GIFEncoder: () => GIFEncoder,
  applyPalette: () => applyPalette,
  default: () => src_default,
  nearestColor: () => nearestColor,
  nearestColorIndex: () => nearestColorIndex,
  nearestColorIndexWithDistance: () => nearestColorIndexWithDistance,
  prequantize: () => prequantize,
  quantize: () => quantize,
  snapColorsToPalette: () => snapColorsToPalette
});

// src/constants.js
var constants_default = {
  signature: "GIF",
  version: "89a",
  trailer: 59,
  extensionIntroducer: 33,
  applicationExtensionLabel: 255,
  graphicControlExtensionLabel: 249,
  imageSeparator: 44,
  signatureSize: 3,
  versionSize: 3,
  globalColorTableFlagMask: 128,
  colorResolutionMask: 112,
  sortFlagMask: 8,
  globalColorTableSizeMask: 7,
  applicationIdentifierSize: 8,
  applicationAuthCodeSize: 3,
  disposalMethodMask: 28,
  userInputFlagMask: 2,
  transparentColorFlagMask: 1,
  localColorTableFlagMask: 128,
  interlaceFlagMask: 64,
  idSortFlagMask: 32,
  localColorTableSizeMask: 7
};

// src/stream.js
function createStream(initialCapacity = 256) {
  let cursor = 0;
  let contents = new Uint8Array(initialCapacity);
  return {
    get buffer() {
      return contents.buffer;
    },
    reset() {
      cursor = 0;
    },
    bytesView() {
      return contents.subarray(0, cursor);
    },
    bytes() {
      return contents.slice(0, cursor);
    },
    writeByte(byte) {
      expand(cursor + 1);
      contents[cursor] = byte;
      cursor++;
    },
    writeBytes(data, offset = 0, byteLength = data.length) {
      expand(cursor + byteLength);
      for (let i = 0; i < byteLength; i++) {
        contents[cursor++] = data[i + offset];
      }
    },
    writeBytesView(data, offset = 0, byteLength = data.byteLength) {
      expand(cursor + byteLength);
      contents.set(data.subarray(offset, offset + byteLength), cursor);
      cursor += byteLength;
    }
  };
  function expand(newCapacity) {
    var prevCapacity = contents.length;
    if (prevCapacity >= newCapacity)
      return;
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
    if (prevCapacity != 0)
      newCapacity = Math.max(newCapacity, 256);
    const oldContents = contents;
    contents = new Uint8Array(newCapacity);
    if (cursor > 0)
      contents.set(oldContents.subarray(0, cursor), 0);
  }
}

// src/lzwEncode.js
var BITS = 12;
var DEFAULT_HSIZE = 5003;
var MASKS = [
  0,
  1,
  3,
  7,
  15,
  31,
  63,
  127,
  255,
  511,
  1023,
  2047,
  4095,
  8191,
  16383,
  32767,
  65535
];
function lzwEncode(width, height, pixels, colorDepth, outStream = createStream(512), accum = new Uint8Array(256), htab = new Int32Array(DEFAULT_HSIZE), codetab = new Int32Array(DEFAULT_HSIZE)) {
  const hsize = htab.length;
  const initCodeSize = Math.max(2, colorDepth);
  accum.fill(0);
  codetab.fill(0);
  htab.fill(-1);
  let cur_accum = 0;
  let cur_bits = 0;
  const init_bits = initCodeSize + 1;
  const g_init_bits = init_bits;
  let clear_flg = false;
  let n_bits = g_init_bits;
  let maxcode = (1 << n_bits) - 1;
  const ClearCode = 1 << init_bits - 1;
  const EOFCode = ClearCode + 1;
  let free_ent = ClearCode + 2;
  let a_count = 0;
  let ent = pixels[0];
  let hshift = 0;
  for (let fcode = hsize; fcode < 65536; fcode *= 2) {
    ++hshift;
  }
  hshift = 8 - hshift;
  outStream.writeByte(initCodeSize);
  output(ClearCode);
  const length = pixels.length;
  for (let idx = 1; idx < length; idx++) {
    next_block: {
      const c = pixels[idx];
      const fcode = (c << BITS) + ent;
      let i = c << hshift ^ ent;
      if (htab[i] === fcode) {
        ent = codetab[i];
        break next_block;
      }
      const disp = i === 0 ? 1 : hsize - i;
      while (htab[i] >= 0) {
        i -= disp;
        if (i < 0)
          i += hsize;
        if (htab[i] === fcode) {
          ent = codetab[i];
          break next_block;
        }
      }
      output(ent);
      ent = c;
      if (free_ent < 1 << BITS) {
        codetab[i] = free_ent++;
        htab[i] = fcode;
      } else {
        htab.fill(-1);
        free_ent = ClearCode + 2;
        clear_flg = true;
        output(ClearCode);
      }
    }
  }
  output(ent);
  output(EOFCode);
  outStream.writeByte(0);
  return outStream.bytesView();
  function output(code) {
    cur_accum &= MASKS[cur_bits];
    if (cur_bits > 0)
      cur_accum |= code << cur_bits;
    else
      cur_accum = code;
    cur_bits += n_bits;
    while (cur_bits >= 8) {
      accum[a_count++] = cur_accum & 255;
      if (a_count >= 254) {
        outStream.writeByte(a_count);
        outStream.writeBytesView(accum, 0, a_count);
        a_count = 0;
      }
      cur_accum >>= 8;
      cur_bits -= 8;
    }
    if (free_ent > maxcode || clear_flg) {
      if (clear_flg) {
        n_bits = g_init_bits;
        maxcode = (1 << n_bits) - 1;
        clear_flg = false;
      } else {
        ++n_bits;
        maxcode = n_bits === BITS ? 1 << n_bits : (1 << n_bits) - 1;
      }
    }
    if (code == EOFCode) {
      while (cur_bits > 0) {
        accum[a_count++] = cur_accum & 255;
        if (a_count >= 254) {
          outStream.writeByte(a_count);
          outStream.writeBytesView(accum, 0, a_count);
          a_count = 0;
        }
        cur_accum >>= 8;
        cur_bits -= 8;
      }
      if (a_count > 0) {
        outStream.writeByte(a_count);
        outStream.writeBytesView(accum, 0, a_count);
        a_count = 0;
      }
    }
  }
}
var lzwEncode_default = lzwEncode;

// src/rgb-packing.js
function rgb888_to_rgb565(r, g, b) {
  return r << 8 & 63488 | g << 2 & 992 | b >> 3;
}
function rgba8888_to_rgba4444(r, g, b, a) {
  return r >> 4 | g & 240 | (b & 240) << 4 | (a & 240) << 8;
}
function rgb888_to_rgb444(r, g, b) {
  return r >> 4 << 8 | g & 240 | b >> 4;
}

// src/pnnquant2.js
function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
function sqr(value) {
  return value * value;
}
function find_nn(bins, idx, hasAlpha) {
  var nn = 0;
  var err = 1e100;
  const bin1 = bins[idx];
  const n1 = bin1.cnt;
  const wa = bin1.ac;
  const wr = bin1.rc;
  const wg = bin1.gc;
  const wb = bin1.bc;
  for (var i = bin1.fw; i != 0; i = bins[i].fw) {
    const bin = bins[i];
    const n2 = bin.cnt;
    const nerr2 = n1 * n2 / (n1 + n2);
    if (nerr2 >= err)
      continue;
    var nerr = 0;
    if (hasAlpha) {
      nerr += nerr2 * sqr(bin.ac - wa);
      if (nerr >= err)
        continue;
    }
    nerr += nerr2 * sqr(bin.rc - wr);
    if (nerr >= err)
      continue;
    nerr += nerr2 * sqr(bin.gc - wg);
    if (nerr >= err)
      continue;
    nerr += nerr2 * sqr(bin.bc - wb);
    if (nerr >= err)
      continue;
    err = nerr;
    nn = i;
  }
  bin1.err = err;
  bin1.nn = nn;
}
function create_bin() {
  return {
    ac: 0,
    rc: 0,
    gc: 0,
    bc: 0,
    cnt: 0,
    nn: 0,
    fw: 0,
    bk: 0,
    tm: 0,
    mtm: 0,
    err: 0
  };
}
function create_bin_list(data, format) {
  const bincount = format === "rgb444" ? 4096 : 65536;
  const bins = new Array(bincount);
  const size = data.length;
  if (format === "rgba4444") {
    for (let i = 0; i < size; ++i) {
      const color = data[i];
      const a = color >> 24 & 255;
      const b = color >> 16 & 255;
      const g = color >> 8 & 255;
      const r = color & 255;
      const index = rgba8888_to_rgba4444(r, g, b, a);
      let bin = index in bins ? bins[index] : bins[index] = create_bin();
      bin.rc += r;
      bin.gc += g;
      bin.bc += b;
      bin.ac += a;
      bin.cnt++;
    }
  } else if (format === "rgb444") {
    for (let i = 0; i < size; ++i) {
      const color = data[i];
      const b = color >> 16 & 255;
      const g = color >> 8 & 255;
      const r = color & 255;
      const index = rgb888_to_rgb444(r, g, b);
      let bin = index in bins ? bins[index] : bins[index] = create_bin();
      bin.rc += r;
      bin.gc += g;
      bin.bc += b;
      bin.cnt++;
    }
  } else {
    for (let i = 0; i < size; ++i) {
      const color = data[i];
      const b = color >> 16 & 255;
      const g = color >> 8 & 255;
      const r = color & 255;
      const index = rgb888_to_rgb565(r, g, b);
      let bin = index in bins ? bins[index] : bins[index] = create_bin();
      bin.rc += r;
      bin.gc += g;
      bin.bc += b;
      bin.cnt++;
    }
  }
  return bins;
}
function quantize(rgba, maxColors, opts = {}) {
  const {
    format = "rgb565",
    clearAlpha = true,
    clearAlphaColor = 0,
    clearAlphaThreshold = 0,
    oneBitAlpha = false
  } = opts;
  if (!rgba || !rgba.buffer) {
    throw new Error("quantize() expected RGBA Uint8Array data");
  }
  if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
    throw new Error("quantize() expected RGBA Uint8Array data");
  }
  const data = new Uint32Array(rgba.buffer);
  let useSqrt = opts.useSqrt !== false;
  const hasAlpha = format === "rgba4444";
  const bins = create_bin_list(data, format);
  const bincount = bins.length;
  const bincountMinusOne = bincount - 1;
  const heap = new Uint32Array(bincount + 1);
  var maxbins = 0;
  for (var i = 0; i < bincount; ++i) {
    const bin = bins[i];
    if (bin != null) {
      var d = 1 / bin.cnt;
      if (hasAlpha)
        bin.ac *= d;
      bin.rc *= d;
      bin.gc *= d;
      bin.bc *= d;
      bins[maxbins++] = bin;
    }
  }
  if (sqr(maxColors) / maxbins < 0.022) {
    useSqrt = false;
  }
  var i = 0;
  for (; i < maxbins - 1; ++i) {
    bins[i].fw = i + 1;
    bins[i + 1].bk = i;
    if (useSqrt)
      bins[i].cnt = Math.sqrt(bins[i].cnt);
  }
  if (useSqrt)
    bins[i].cnt = Math.sqrt(bins[i].cnt);
  var h, l, l2;
  for (i = 0; i < maxbins; ++i) {
    find_nn(bins, i, false);
    var err = bins[i].err;
    for (l = ++heap[0]; l > 1; l = l2) {
      l2 = l >> 1;
      if (bins[h = heap[l2]].err <= err)
        break;
      heap[l] = h;
    }
    heap[l] = i;
  }
  var extbins = maxbins - maxColors;
  for (i = 0; i < extbins; ) {
    var tb;
    for (; ; ) {
      var b1 = heap[1];
      tb = bins[b1];
      if (tb.tm >= tb.mtm && bins[tb.nn].mtm <= tb.tm)
        break;
      if (tb.mtm == bincountMinusOne)
        b1 = heap[1] = heap[heap[0]--];
      else {
        find_nn(bins, b1, false);
        tb.tm = i;
      }
      var err = bins[b1].err;
      for (l = 1; (l2 = l + l) <= heap[0]; l = l2) {
        if (l2 < heap[0] && bins[heap[l2]].err > bins[heap[l2 + 1]].err)
          l2++;
        if (err <= bins[h = heap[l2]].err)
          break;
        heap[l] = h;
      }
      heap[l] = b1;
    }
    var nb = bins[tb.nn];
    var n1 = tb.cnt;
    var n2 = nb.cnt;
    var d = 1 / (n1 + n2);
    if (hasAlpha)
      tb.ac = d * (n1 * tb.ac + n2 * nb.ac);
    tb.rc = d * (n1 * tb.rc + n2 * nb.rc);
    tb.gc = d * (n1 * tb.gc + n2 * nb.gc);
    tb.bc = d * (n1 * tb.bc + n2 * nb.bc);
    tb.cnt += nb.cnt;
    tb.mtm = ++i;
    bins[nb.bk].fw = nb.fw;
    bins[nb.fw].bk = nb.bk;
    nb.mtm = bincountMinusOne;
  }
  let palette = [];
  var k = 0;
  for (i = 0; ; ++k) {
    let r = clamp(Math.round(bins[i].rc), 0, 255);
    let g = clamp(Math.round(bins[i].gc), 0, 255);
    let b = clamp(Math.round(bins[i].bc), 0, 255);
    let a = 255;
    if (hasAlpha) {
      a = clamp(Math.round(bins[i].ac), 0, 255);
      if (oneBitAlpha) {
        const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
        a = a <= threshold ? 0 : 255;
      }
      if (clearAlpha && a <= clearAlphaThreshold) {
        r = g = b = clearAlphaColor;
        a = 0;
      }
    }
    const color = hasAlpha ? [r, g, b, a] : [r, g, b];
    const exists = existsInPalette(palette, color);
    if (!exists)
      palette.push(color);
    if ((i = bins[i].fw) == 0)
      break;
  }
  return palette;
}
function existsInPalette(palette, color) {
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    let matchesRGB = p[0] === color[0] && p[1] === color[1] && p[2] === color[2];
    let matchesAlpha = p.length >= 4 && color.length >= 4 ? p[3] === color[3] : true;
    if (matchesRGB && matchesAlpha)
      return true;
  }
  return false;
}

// src/color.js
function euclideanDistanceSquared(a, b) {
  var sum = 0;
  var n;
  for (n = 0; n < a.length; n++) {
    const dx = a[n] - b[n];
    sum += dx * dx;
  }
  return sum;
}

// src/palettize.js
function roundStep(byte, step) {
  return step > 1 ? Math.round(byte / step) * step : byte;
}
function prequantize(rgba, {roundRGB = 5, roundAlpha = 10, oneBitAlpha = null} = {}) {
  const data = new Uint32Array(rgba.buffer);
  for (let i = 0; i < data.length; i++) {
    const color = data[i];
    let a = color >> 24 & 255;
    let b = color >> 16 & 255;
    let g = color >> 8 & 255;
    let r = color & 255;
    a = roundStep(a, roundAlpha);
    if (oneBitAlpha) {
      const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
      a = a <= threshold ? 0 : 255;
    }
    r = roundStep(r, roundRGB);
    g = roundStep(g, roundRGB);
    b = roundStep(b, roundRGB);
    data[i] = a << 24 | b << 16 | g << 8 | r << 0;
  }
}
function applyPalette(rgba, palette, format = "rgb565") {
  if (!rgba || !rgba.buffer) {
    throw new Error("quantize() expected RGBA Uint8Array data");
  }
  if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
    throw new Error("quantize() expected RGBA Uint8Array data");
  }
  if (palette.length > 256) {
    throw new Error("applyPalette() only works with 256 colors or less");
  }
  const data = new Uint32Array(rgba.buffer);
  const length = data.length;
  const bincount = format === "rgb444" ? 4096 : 65536;
  const index = new Uint8Array(length);
  const cache = new Array(bincount);
  const hasAlpha = format === "rgba4444";
  if (format === "rgba4444") {
    for (let i = 0; i < length; i++) {
      const color = data[i];
      const a = color >> 24 & 255;
      const b = color >> 16 & 255;
      const g = color >> 8 & 255;
      const r = color & 255;
      const key = rgba8888_to_rgba4444(r, g, b, a);
      const idx = key in cache ? cache[key] : cache[key] = nearestColorIndexRGBA(r, g, b, a, palette);
      index[i] = idx;
    }
  } else {
    const rgb888_to_key = format === "rgb444" ? rgb888_to_rgb444 : rgb888_to_rgb565;
    for (let i = 0; i < length; i++) {
      const color = data[i];
      const b = color >> 16 & 255;
      const g = color >> 8 & 255;
      const r = color & 255;
      const key = rgb888_to_key(r, g, b);
      const idx = key in cache ? cache[key] : cache[key] = nearestColorIndexRGB(r, g, b, palette);
      index[i] = idx;
    }
  }
  return index;
}
function nearestColorIndexRGBA(r, g, b, a, palette) {
  let k = 0;
  let mindist = 1e100;
  for (let i = 0; i < palette.length; i++) {
    const px2 = palette[i];
    const a2 = px2[3];
    let curdist = sqr2(a2 - a);
    if (curdist > mindist)
      continue;
    const r2 = px2[0];
    curdist += sqr2(r2 - r);
    if (curdist > mindist)
      continue;
    const g2 = px2[1];
    curdist += sqr2(g2 - g);
    if (curdist > mindist)
      continue;
    const b2 = px2[2];
    curdist += sqr2(b2 - b);
    if (curdist > mindist)
      continue;
    mindist = curdist;
    k = i;
  }
  return k;
}
function nearestColorIndexRGB(r, g, b, palette) {
  let k = 0;
  let mindist = 1e100;
  for (let i = 0; i < palette.length; i++) {
    const px2 = palette[i];
    const r2 = px2[0];
    let curdist = sqr2(r2 - r);
    if (curdist > mindist)
      continue;
    const g2 = px2[1];
    curdist += sqr2(g2 - g);
    if (curdist > mindist)
      continue;
    const b2 = px2[2];
    curdist += sqr2(b2 - b);
    if (curdist > mindist)
      continue;
    mindist = curdist;
    k = i;
  }
  return k;
}
function snapColorsToPalette(palette, knownColors, threshold = 5) {
  if (!palette.length || !knownColors.length)
    return;
  const paletteRGB = palette.map((p) => p.slice(0, 3));
  const thresholdSq = threshold * threshold;
  const dim = palette[0].length;
  for (let i = 0; i < knownColors.length; i++) {
    let color = knownColors[i];
    if (color.length < dim) {
      color = [color[0], color[1], color[2], 255];
    } else if (color.length > dim) {
      color = color.slice(0, 3);
    } else {
      color = color.slice();
    }
    const r = nearestColorIndexWithDistance(paletteRGB, color.slice(0, 3), euclideanDistanceSquared);
    const idx = r[0];
    const distanceSq = r[1];
    if (distanceSq > 0 && distanceSq <= thresholdSq) {
      palette[idx] = color;
    }
  }
}
function sqr2(a) {
  return a * a;
}
function nearestColorIndex(colors, pixel, distanceFn = euclideanDistanceSquared) {
  let minDist = Infinity;
  let minDistIndex = -1;
  for (let j = 0; j < colors.length; j++) {
    const paletteColor = colors[j];
    const dist = distanceFn(pixel, paletteColor);
    if (dist < minDist) {
      minDist = dist;
      minDistIndex = j;
    }
  }
  return minDistIndex;
}
function nearestColorIndexWithDistance(colors, pixel, distanceFn = euclideanDistanceSquared) {
  let minDist = Infinity;
  let minDistIndex = -1;
  for (let j = 0; j < colors.length; j++) {
    const paletteColor = colors[j];
    const dist = distanceFn(pixel, paletteColor);
    if (dist < minDist) {
      minDist = dist;
      minDistIndex = j;
    }
  }
  return [minDistIndex, minDist];
}
function nearestColor(colors, pixel, distanceFn = euclideanDistanceSquared) {
  return colors[nearestColorIndex(colors, pixel, distanceFn)];
}

// src/index.js
function GIFEncoder(opt = {}) {
  const {initialCapacity = 4096, auto = true} = opt;
  const stream = createStream(initialCapacity);
  const HSIZE = 5003;
  const accum = new Uint8Array(256);
  const htab = new Int32Array(HSIZE);
  const codetab = new Int32Array(HSIZE);
  let hasInit = false;
  return {
    reset() {
      stream.reset();
      hasInit = false;
    },
    finish() {
      stream.writeByte(constants_default.trailer);
    },
    bytes() {
      return stream.bytes();
    },
    bytesView() {
      return stream.bytesView();
    },
    get buffer() {
      return stream.buffer;
    },
    get stream() {
      return stream;
    },
    writeHeader,
    writeFrame(index, width, height, opts = {}) {
      const {
        transparent = false,
        transparentIndex = 0,
        delay = 0,
        palette = null,
        repeat = 0,
        colorDepth = 8,
        dispose = -1
      } = opts;
      let first = false;
      if (auto) {
        if (!hasInit) {
          first = true;
          writeHeader();
          hasInit = true;
        }
      } else {
        first = Boolean(opts.first);
      }
      width = Math.max(0, Math.floor(width));
      height = Math.max(0, Math.floor(height));
      if (first) {
        if (!palette) {
          throw new Error("First frame must include a { palette } option");
        }
        encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth);
        encodeColorTable(stream, palette);
        if (repeat >= 0) {
          encodeNetscapeExt(stream, repeat);
        }
      }
      const delayTime = Math.round(delay / 10);
      encodeGraphicControlExt(stream, dispose, delayTime, transparent, transparentIndex);
      const useLocalColorTable = Boolean(palette) && !first;
      encodeImageDescriptor(stream, width, height, useLocalColorTable ? palette : null);
      if (useLocalColorTable)
        encodeColorTable(stream, palette);
      encodePixels(stream, index, width, height, colorDepth, accum, htab, codetab);
    }
  };
  function writeHeader() {
    writeUTFBytes(stream, "GIF89a");
  }
}
function encodeGraphicControlExt(stream, dispose, delay, transparent, transparentIndex) {
  stream.writeByte(33);
  stream.writeByte(249);
  stream.writeByte(4);
  if (transparentIndex < 0) {
    transparentIndex = 0;
    transparent = false;
  }
  var transp, disp;
  if (!transparent) {
    transp = 0;
    disp = 0;
  } else {
    transp = 1;
    disp = 2;
  }
  if (dispose >= 0) {
    disp = dispose & 7;
  }
  disp <<= 2;
  const userInput = 0;
  stream.writeByte(0 | disp | userInput | transp);
  writeUInt16(stream, delay);
  stream.writeByte(transparentIndex || 0);
  stream.writeByte(0);
}
function encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth = 8) {
  const globalColorTableFlag = 1;
  const sortFlag = 0;
  const globalColorTableSize = colorTableSize(palette.length) - 1;
  const fields = globalColorTableFlag << 7 | colorDepth - 1 << 4 | sortFlag << 3 | globalColorTableSize;
  const backgroundColorIndex = 0;
  const pixelAspectRatio = 0;
  writeUInt16(stream, width);
  writeUInt16(stream, height);
  stream.writeBytes([fields, backgroundColorIndex, pixelAspectRatio]);
}
function encodeNetscapeExt(stream, repeat) {
  stream.writeByte(33);
  stream.writeByte(255);
  stream.writeByte(11);
  writeUTFBytes(stream, "NETSCAPE2.0");
  stream.writeByte(3);
  stream.writeByte(1);
  writeUInt16(stream, repeat);
  stream.writeByte(0);
}
function encodeColorTable(stream, palette) {
  const colorTableLength = 1 << colorTableSize(palette.length);
  for (let i = 0; i < colorTableLength; i++) {
    let color = [0, 0, 0];
    if (i < palette.length) {
      color = palette[i];
    }
    stream.writeByte(color[0]);
    stream.writeByte(color[1]);
    stream.writeByte(color[2]);
  }
}
function encodeImageDescriptor(stream, width, height, localPalette) {
  stream.writeByte(44);
  writeUInt16(stream, 0);
  writeUInt16(stream, 0);
  writeUInt16(stream, width);
  writeUInt16(stream, height);
  if (localPalette) {
    const interlace = 0;
    const sorted = 0;
    const palSize = colorTableSize(localPalette.length) - 1;
    stream.writeByte(128 | interlace | sorted | 0 | palSize);
  } else {
    stream.writeByte(0);
  }
}
function encodePixels(stream, index, width, height, colorDepth = 8, accum, htab, codetab) {
  lzwEncode_default(width, height, index, colorDepth, stream, accum, htab, codetab);
}
function writeUInt16(stream, short) {
  stream.writeByte(short & 255);
  stream.writeByte(short >> 8 & 255);
}
function writeUTFBytes(stream, text) {
  for (var i = 0; i < text.length; i++) {
    stream.writeByte(text.charCodeAt(i));
  }
}
function colorTableSize(length) {
  return Math.max(Math.ceil(Math.log2(length)), 1);
}
var src_default = GIFEncoder;
//# sourceMappingURL=gifenc.js.map

  })({}, exp);
  window.GIFEnc = { GIFEncoder: exp.GIFEncoder, quantize: exp.quantize, applyPalette: exp.applyPalette };
})();

/* ════════ assets/js/gif-export.js ════════ */
/* ==========================================================================
   Jaykou — GIF 导出（依赖 vendored gifenc：window.GIFEnc）
   流程：离屏 canvas 逐帧渲染 → 每帧量化 256 色 → LZW 编码 → Blob
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* opts = { id, params, settings, duration, width, fps, onProgress } */
  MF.exportGIF = function (opts) {
    return new Promise(function (resolve, reject) {
      var G = window.GIFEnc;
      if (!G || !G.GIFEncoder) return reject(new Error('GIF 编码器未加载'));
      var eff = MF.byId[opts.id];
      if (!eff) return reject(new Error('未知动效：' + opts.id));
      var R = MF.ratios[opts.settings.ratio] || MF.ratios['16:9'];
      var W = Math.max(120, Math.round(opts.width || 640));
      var H = Math.round(W * R.h / R.w);
      var fps = Math.min(24, Math.max(5, opts.fps || 12));
      var D = Math.max(0.5, opts.duration || eff.dur);
      var frames = Math.max(2, Math.round(D * fps));
      var delay = Math.round(1000 / fps);

      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var ctx = cv.getContext('2d', { willReadFrequently: true });
      var enc = G.GIFEncoder();
      var i = 0;
      var BATCH = 3;

      function step() {
        var end = Math.min(i + BATCH, frames);
        for (; i < end; i++) {
          var t = (i / frames) * D;
          MF.paint(ctx, eff, opts.params, t, {
            w: W, h: H, duration: D,
            accent: opts.settings.accent, accent2: opts.settings.accent2,
            ink: opts.settings.ink, bg1: opts.settings.bg1, bg2: opts.settings.bg2,
            bgMode: opts.settings.bgMode, seed: opts.settings.seed, quiet: true
          });
          var data = ctx.getImageData(0, 0, W, H).data;
          var palette = G.quantize(data, 256);
          var index = G.applyPalette(data, palette);
          enc.writeFrame(index, W, H, { palette: palette, delay: delay });
        }
        if (opts.onProgress) { try { opts.onProgress(i / frames); } catch (e) {} }
        if (i < frames) {
          setTimeout(step, 0);
        } else {
          enc.finish();
          var bytes = enc.bytes();
          resolve(new Blob([bytes], { type: 'image/gif' }));
        }
      }
      setTimeout(step, 30);
    });
  };
})();

/* ════════ assets/js/studio.js ════════ */
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
