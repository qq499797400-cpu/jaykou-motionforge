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
