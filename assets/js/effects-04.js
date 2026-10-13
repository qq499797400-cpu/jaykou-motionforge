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
