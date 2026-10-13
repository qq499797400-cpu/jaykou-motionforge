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
