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
