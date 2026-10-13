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
