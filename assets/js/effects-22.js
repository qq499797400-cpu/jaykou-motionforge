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
