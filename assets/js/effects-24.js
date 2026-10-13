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
