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
