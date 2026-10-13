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
