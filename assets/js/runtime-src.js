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
