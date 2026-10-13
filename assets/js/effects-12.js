/* ==========================================================================
   Jaykou 动效库 · 12
   原语：物理运动 / 背景循环
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng;

  /* ══════════════════════════ 物理运动 ══════════════════════════ */

  var PHYS_PARAMS = [
    P('kind', '物理类型', 'pendulum', sel('pendulum', [
      ['pendulum', '单摆'], ['spring', '弹簧振子'], ['bounce-trail', '弹跳拖尾'], ['newton', '牛顿摆'],
      ['cloth', '布料波动'], ['rope', '绳索波'], ['drop-ripple', '落水涟漪'], ['magnetic-p', '磁力吸附'],
      ['gravity', '重力落体'], ['collision', '弹性碰撞'], ['domino', '多米诺'], ['balance', '天平摆动'],
      ['chain', '链条摆动'], ['fluid', '流体扰动'], ['gyro', '陀螺旋转'], ['trajectory', '抛物线']
    ])),
    P('count', '数量', 6, rng(6, 2, 24, 1)),
    P('size', '尺寸', 900, rng(900, 90.0, 1971, 4.0)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('damp', '阻尼', 0.35, rng(0.35, 0, 1, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function physDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var n = Math.max(2, Math.round(p.count));
    var k = e.outCubic(U.clamp(t / 1.1, 0, 1));
    var ink = U.ink;
    var i, a;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (kind === 'pendulum') {
      var pivY = cy - base * 0.72;
      var len = base * 0.95;
      var ang = Math.sin(t * sp * 1.8) * 0.62;
      ctx.strokeStyle = U.rgba(ink, 0.35);
      ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.arc(cx, pivY, 7 * S, 0, Math.PI * 2); ctx.fillStyle = U.rgba(ink, 0.5); ctx.fill();
      var bx2 = cx + Math.sin(ang) * len * k;
      var by3 = pivY + Math.cos(ang) * len * k;
      ctx.beginPath(); ctx.moveTo(cx, pivY); ctx.lineTo(bx2, by3);
      ctx.strokeStyle = U.rgba(ink, 0.5); ctx.lineWidth = 3 * S; ctx.stroke();
      var bg3 = ctx.createRadialGradient(bx2 - 20 * S, by3 - 20 * S, 0, bx2, by3, 46 * S);
      bg3.addColorStop(0, U.mix('#FFFFFF', U.accent, 0.3));
      bg3.addColorStop(1, U.accent);
      ctx.fillStyle = bg3;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.beginPath(); ctx.arc(bx2, by3, 34 * S, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(ink, 0.12);
      ctx.lineWidth = 1.6 * S;
      ctx.beginPath(); ctx.arc(cx, pivY, len, Math.PI / 2 - 0.7, Math.PI / 2 + 0.7); ctx.stroke();
    }

    else if (kind === 'spring') {
      var dt2 = (t * sp) % 3.2;
      var dampK = Math.exp(-dt2 * (0.6 + p.damp * 1.6));
      var offY = Math.cos(dt2 * 9) * dampK * base * 0.5;
      ctx.strokeStyle = U.rgba(U.accent, 0.9);
      ctx.lineWidth = 4 * S;
      ctx.beginPath();
      var coils = 11, topY = cy - base * 0.72, coilH = (base * 0.72 + offY) / coils;
      ctx.moveTo(cx, topY);
      for (i = 0; i < coils; i++) {
        var yy2 = topY + i * coilH;
        ctx.quadraticCurveTo(cx + (i % 2 ? -34 : 34) * S, yy2 + coilH * 0.5, cx, yy2 + coilH);
      }
      ctx.stroke();
      var wby = topY + (base * 0.72 + offY);
      var wbx = cx;
      ctx.fillStyle = U.accent2;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      U.rr(ctx, wbx - 60 * S, wby, 120 * S, 80 * S, 14 * S);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    else if (kind === 'bounce-trail') {
      var period = 1.5 / sp;
      var bt = (t % period) / period;
      var bxx = -base * 0.6 + bt * base * 1.2;
      var bounces = 3;
      var bphase = (bt * bounces) % 1;
      var bheight = base * 0.62 * Math.pow(1 - bt, 1.4);
      var byy2 = cy + base * 0.42 - Math.abs(Math.sin(bphase * Math.PI)) * bheight;
      for (i = 9; i >= 0; i--) {
        var trailT = bt - i * 0.018;
        if (trailT < 0) continue;
        var txx = -base * 0.6 + trailT * base * 1.2;
        var tphase = (trailT * bounces) % 1;
        var theight = base * 0.62 * Math.pow(1 - trailT, 1.4);
        var tyy = cy + base * 0.42 - Math.abs(Math.sin(tphase * Math.PI)) * theight;
        ctx.globalAlpha = (1 - i / 10) * 0.55;
        ctx.beginPath(); ctx.arc(txx, tyy, (30 - i * 2.2) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(bxx, byy2, 30 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.mix('#FFFFFF', U.accent, 0.25);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 28 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(ink, 0.16);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.75, cy + base * 0.42); ctx.lineTo(cx + base * 0.75, cy + base * 0.42); ctx.stroke();
    }

    else if (kind === 'newton') {
      var balls = 5;
      var br = base * 0.19;
      var gap2 = br * 2.1;
      var total = balls * gap2;
      var originX = cx - total / 2 + gap2 / 2;
      var originY = cy - base * 0.54;
      var stringLen = base * 0.72;
      var phase = (t * sp * 0.9) % 1;
      for (i = 0; i < balls; i++) {
        var swing = 0;
        if (i === 0) swing = Math.max(0, Math.sin(phase * Math.PI * 2)) * 0.9;
        else if (i === balls - 1) swing = -Math.max(0, -Math.sin(phase * Math.PI * 2)) * 0.9;
        var px4 = originX + i * gap2 + Math.sin(swing) * stringLen;
        var py4 = originY + Math.cos(swing) * stringLen;
        ctx.strokeStyle = U.rgba(ink, 0.3);
        ctx.lineWidth = 1.8 * S;
        ctx.beginPath(); ctx.moveTo(originX + i * gap2, originY); ctx.lineTo(px4, py4); ctx.stroke();
        var ng = ctx.createRadialGradient(px4 - br * 0.4, py4 - br * 0.4, 0, px4, py4, br);
        ng.addColorStop(0, U.mix('#FFFFFF', U.accent, 0.35));
        ng.addColorStop(1, U.accent2);
        ctx.fillStyle = ng;
        if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow * 0.8); ctx.shadowBlur = 22 * S * p.glow; }
        ctx.beginPath(); ctx.arc(px4, py4, br, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.strokeStyle = U.rgba(ink, 0.35);
      ctx.lineWidth = 4 * S;
      ctx.beginPath(); ctx.moveTo(originX - gap2 * 0.9, originY); ctx.lineTo(originX + (balls - 1) * gap2 + gap2 * 0.9, originY); ctx.stroke();
    }

    else if (kind === 'cloth') {
      var cols = Math.max(5, Math.round(n * 1.6)), rows = Math.max(4, Math.round(cols * 0.66));
      var cw = base * 1.55 / cols, chh = base * 1.05 / rows;
      var ox = cx - (cols * cw) / 2, oy = cy - (rows * chh) / 2;
      ctx.lineWidth = 1.8 * S;
      for (var cr = 0; cr <= rows; cr++) {
        ctx.beginPath();
        for (var cc = 0; cc <= cols; cc++) {
          var wv2 = Math.sin(cc * 0.55 + t * sp * 2.6) * Math.cos(cr * 0.5 - t * sp * 2.1) * 26 * S * k;
          var ptx = ox + cc * cw, pty = oy + cr * chh + wv2;
          if (cc) ctx.lineTo(ptx, pty); else ctx.moveTo(ptx, pty);
        }
        ctx.strokeStyle = U.rgba(U.accent, 0.5 + (cr / rows) * 0.5);
        ctx.stroke();
      }
      for (var cc2 = 0; cc2 <= cols; cc2++) {
        ctx.beginPath();
        for (var cr2 = 0; cr2 <= rows; cr2++) {
          var wv3 = Math.sin(cc2 * 0.55 + t * sp * 2.6) * Math.cos(cr2 * 0.5 - t * sp * 2.1) * 26 * S * k;
          var ptx2 = ox + cc2 * cw, pty2 = oy + cr2 * chh + wv3;
          if (cr2) ctx.lineTo(ptx2, pty2); else ctx.moveTo(ptx2, pty2);
        }
        ctx.strokeStyle = U.rgba(U.accent2, 0.5 + (cc2 / cols) * 0.5);
        ctx.stroke();
      }
    }

    else if (kind === 'rope') {
      var segs = Math.max(14, n * 4);
      var rlw = base * 1.8;
      var amp2 = base * 0.3 * k;
      ctx.strokeStyle = U.rgba(U.accent, 0.95);
      ctx.lineWidth = 7 * S;
      ctx.beginPath();
      for (i = 0; i <= segs; i++) {
        var rf = i / segs;
        var rx2 = cx - rlw / 2 + rlw * rf;
        var ry3 = cy + Math.sin(rf * Math.PI * 4 - t * sp * 4.2) * amp2 * Math.exp(-Math.pow(rf - 0.5, 2) * 4);
        if (i) ctx.lineTo(rx2, ry3); else ctx.moveTo(rx2, ry3);
      }
      ctx.stroke();
      ctx.strokeStyle = U.rgba(U.accent2, 0.4);
      ctx.lineWidth = 14 * S;
      ctx.stroke();
      for (i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.arc(cx + i * rlw / 2, cy, 12 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent2; ctx.fill();
      }
    }

    else if (kind === 'drop-ripple') {
      var cycle2 = 2.6 / sp;
      var dct = t % cycle2;
      var dp = U.clamp(dct / cycle2, 0, 1);
      var dy3 = cy - base * 0.3 + dp * base * 0.5;
      ctx.beginPath();
      ctx.arc(cx, dy3, 26 * S, 0, Math.PI * 2);
      var dg2 = ctx.createRadialGradient(cx - 8 * S, dy3 - 8 * S, 0, cx, dy3, 26 * S);
      dg2.addColorStop(0, '#FFFFFF');
      dg2.addColorStop(1, U.accent);
      ctx.fillStyle = dg2;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      if (dp > 0.55) {
        var rp = (dp - 0.55) / 0.45;
        for (i = 0; i < 5; i++) {
          var rrp = (rp - i * 0.11) / 0.6;
          if (rrp <= 0 || rrp > 1) continue;
          ctx.globalAlpha = (1 - rrp) * 0.7;
          ctx.beginPath();
          ctx.ellipse(cx, cy + base * 0.2, base * 0.75 * rrp, base * 0.22 * rrp, 0, 0, Math.PI * 2);
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = 3 * S;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = U.rgba(ink, 0.18);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.85, cy + base * 0.2); ctx.lineTo(cx + base * 0.85, cy + base * 0.2); ctx.stroke();
    }

    else if (kind === 'magnetic-p') {
      for (i = 0; i < n * 3; i++) {
        var mph = (t * sp * 0.35 + U.rng(i) * 0.8) % 1;
        var mrad2 = base * 0.95 * (1 - Math.pow(mph, 1.8));
        var mang2 = U.rng(i + 5) * Math.PI * 2 + mph * 2.4;
        ctx.globalAlpha = 0.2 + mph * 0.8;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(mang2) * mrad2, cy + Math.sin(mang2) * mrad2, (4 + mph * 14) * S, 0, Math.PI * 2);
        ctx.fillStyle = mph > 0.8 ? U.mix('#FFFFFF', U.accent, 0.3) : U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      var mg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.5);
      mg2.addColorStop(0, U.rgba(U.accent2, 0.55));
      mg2.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = mg2;
      ctx.beginPath(); ctx.arc(cx, cy, base * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 26 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.accent2; ctx.fill();
    }

    else if (kind === 'gravity') {
      for (i = 0; i < n; i++) {
        var gx = cx - base * 0.8 + (i / Math.max(1, n - 1)) * base * 1.6;
        var gphase = ((t * sp * 0.55 + U.rng(i) * 1.2) % 1.5) / 1.5;
        var gy = cy - base * 0.8 + gphase * gphase * base * 1.5;
        var squish = gphase > 0.92 ? 1 + (gphase - 0.92) * 3 : 1;
        ctx.globalAlpha = 1 - Math.pow(gphase, 6);
        ctx.beginPath();
        ctx.ellipse(gx, gy, (18 + i * 1.6) * S / squish, (18 + i * 1.6) * S * squish, 0, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = U.rgba(ink, 0.2);
      ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.92, cy + base * 0.72); ctx.lineTo(cx + base * 0.92, cy + base * 0.72); ctx.stroke();
    }

    else if (kind === 'collision') {
      var cA = cx - base * 0.9 + e.inOutCubic(U.clamp(t * sp / 1.2, 0, 1)) * base * 0.9;
      var cB = cx + base * 0.9 - e.inOutCubic(U.clamp(t * sp / 1.2, 0, 1)) * base * 0.9;
      var flash = U.clamp(1 - Math.abs(t * sp - 1.25) * 5, 0, 1);
      var ballR = base * 0.22;
      var drawBall = function (bx3, col) {
        var bg4 = ctx.createRadialGradient(bx3 - ballR * 0.35, cy - ballR * 0.35, 0, bx3, cy, ballR);
        bg4.addColorStop(0, U.mix('#FFFFFF', col, 0.3));
        bg4.addColorStop(1, col);
        ctx.fillStyle = bg4;
        ctx.beginPath(); ctx.arc(bx3, cy, ballR, 0, Math.PI * 2); ctx.fill();
      };
      drawBall(cA, U.accent);
      drawBall(cB, U.accent2);
      if (flash > 0) {
        var fg3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, ballR * 4 * flash);
        fg3.addColorStop(0, U.rgba('#FFFFFF', 0.9 * flash));
        fg3.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = fg3;
        ctx.beginPath(); ctx.arc(cx, cy, ballR * 4 * flash, 0, Math.PI * 2); ctx.fill();
        for (i = 0; i < 14; i++) {
          a = U.rng(i) * Math.PI * 2;
          var fr = flash * base * 0.5 * (0.4 + U.rng(i + 9) * 0.9);
          ctx.globalAlpha = flash;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * fr, cy + Math.sin(a) * fr, 6 * S * flash, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = U.rgba(ink, 0.14);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 1.1, cy + ballR + 22 * S); ctx.lineTo(cx + base * 1.1, cy + ballR + 22 * S); ctx.stroke();
    }

    else if (kind === 'domino') {
      var domW = base * 1.7 / n;
      for (i = 0; i < n; i++) {
        var df = i / Math.max(1, n - 1);
        var dly2 = i * 0.14 / sp;
        var fall = U.clamp((t * sp - dly2) / 0.5, 0, 1);
        var angle = e.inOutQuad(fall) * 1.35;
        var dx4 = cx - base * 0.85 + i * domW;
        var dh2 = base * 0.62;
        ctx.save();
        ctx.translate(dx4, cy + dh2 / 2);
        ctx.rotate(angle);
        var dgd = ctx.createLinearGradient(0, -dh2 / 2, 0, dh2 / 2);
        dgd.addColorStop(0, U.rgba(U.mix(U.accent, U.accent2, df), 0.95));
        dgd.addColorStop(1, U.rgba(U.mix(U.accent2, U.bg1, 0.3), 0.95));
        ctx.fillStyle = dgd;
        U.rr(ctx, -domW * 0.22, -dh2 / 2, domW * 0.44, dh2, 5 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = U.rgba(ink, 0.18);
      ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(cx - base * 0.95, cy + base * 0.32); ctx.lineTo(cx + base * 0.95, cy + base * 0.32); ctx.stroke();
    }

    else if (kind === 'balance') {
      var bAng = Math.sin(t * sp * 1.3) * 0.3 * (1 + p.damp);
      var armL = base * 0.85;
      ctx.strokeStyle = U.rgba(ink, 0.5);
      ctx.lineWidth = 5 * S;
      ctx.beginPath(); ctx.moveTo(cx, cy - base * 0.5); ctx.lineTo(cx, cy + base * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - base * 0.3, cy + base * 0.3); ctx.lineTo(cx + base * 0.3, cy + base * 0.3); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy - base * 0.5);
      ctx.rotate(bAng);
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 6 * S;
      ctx.beginPath(); ctx.moveTo(-armL, 0); ctx.lineTo(armL, 0); ctx.stroke();
      for (i = -1; i <= 1; i += 2) {
        var panY = 0;
        ctx.beginPath(); ctx.moveTo(i * armL, 0); ctx.lineTo(i * armL, base * 0.34); ctx.stroke();
        var pg3 = ctx.createLinearGradient(i * armL - 46 * S, base * 0.34, i * armL + 46 * S, base * 0.34);
        pg3.addColorStop(0, i < 0 ? U.accent : U.accent2);
        pg3.addColorStop(1, i < 0 ? U.accent : U.accent2);
        ctx.fillStyle = U.rgba(i < 0 ? U.accent : U.accent2, 0.9);
        ctx.beginPath();
        ctx.moveTo(i * armL - 52 * S, base * 0.34);
        ctx.lineTo(i * armL + 52 * S, base * 0.34);
        ctx.lineTo(i * armL + 40 * S, base * 0.34 + 40 * S);
        ctx.lineTo(i * armL - 40 * S, base * 0.34 + 40 * S);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    else if (kind === 'chain') {
      var links = Math.max(6, n * 2);
      var segLen = base * 1.7 / links;
      var prevX2 = cx - base * 0.85, prevY2 = cy - base * 0.2;
      for (i = 0; i < links; i++) {
        var lf = i / links;
        var lx2 = cx - base * 0.85 + i * segLen;
        var ly5 = cy - base * 0.2 + Math.sin(t * sp * 2.2 - i * 0.42) * base * 0.3 * k * Math.exp(-Math.pow(lf - 0.4, 2) * 3);
        ctx.save();
        ctx.translate((lx2 + prevX2) / 2, (ly5 + prevY2) / 2);
        ctx.rotate(Math.atan2(ly5 - prevY2, lx2 - prevX2));
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = 5 * S;
        ctx.beginPath();
        ctx.ellipse(0, 0, segLen * 0.42, 11 * S, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        prevX2 = lx2; prevY2 = ly5;
      }
    }

    else if (kind === 'fluid') {
      var fCols = Math.max(6, Math.round(n * 2.4));
      ctx.lineWidth = 2.4 * S;
      for (i = 0; i < fCols; i++) {
        var ffy = H * (i + 0.5) / fCols;
        ctx.beginPath();
        for (var fx3 = 0; fx3 <= W; fx3 += 12) {
          var fn = U.noise2(fx3 * 0.004 + t * sp * 0.5, i * 0.6, 13);
          var fyy = ffy + fn * 46 * S * k + Math.sin(fx3 * 0.008 + t * sp * 1.6 + i) * 18 * S;
          if (fx3) ctx.lineTo(fx3, fyy); else ctx.moveTo(fx3, fyy);
        }
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.55);
        ctx.stroke();
      }
    }

    else if (kind === 'gyro') {
      var gAng = t * sp * 1.6;
      var tilt = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      var gR = base * 0.62;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(gAng * 0.35);
      for (i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI / 4 + gAng * 0.5);
        ctx.scale(1, 0.28 + tilt * 0.5);
        ctx.beginPath(); ctx.arc(0, 0, gR, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.85);
        ctx.lineWidth = 4 * S;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, 20 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.mix('#FFFFFF', U.accent, 0.3);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    else if (kind === 'trajectory') {
      var tjP = (t * sp * 0.6) % 1;
      var startX = cx - base * 0.85, startY = cy + base * 0.6;
      var endX = cx + base * 0.85;
      ctx.strokeStyle = U.rgba(ink, 0.22);
      ctx.lineWidth = 2 * S;
      ctx.setLineDash([10 * S, 8 * S]);
      ctx.beginPath();
      for (i = 0; i <= 40; i++) {
        var tf2 = i / 40;
        var tx4 = U.lerp(startX, endX, tf2);
        var ty4 = startY - Math.sin(tf2 * Math.PI) * base * 1.05;
        if (i) ctx.lineTo(tx4, ty4); else ctx.moveTo(tx4, ty4);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      for (i = 9; i >= 0; i--) {
        var tpt = tjP - i * 0.022;
        if (tpt < 0) continue;
        var ttx2 = U.lerp(startX, endX, tpt);
        var tty2 = startY - Math.sin(tpt * Math.PI) * base * 1.05;
        ctx.globalAlpha = (1 - i / 10) * 0.6;
        ctx.beginPath(); ctx.arc(ttx2, tty2, (24 - i * 1.8) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      var jx = U.lerp(startX, endX, tjP), jy = startY - Math.sin(tjP * Math.PI) * base * 1.05;
      ctx.beginPath(); ctx.arc(jx, jy, 26 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.mix('#FFFFFF', U.accent2, 0.3);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    else {
      ctx.beginPath(); ctx.arc(cx, cy, base * 0.4 * k, 0, Math.PI * 2);
      ctx.strokeStyle = U.accent; ctx.lineWidth = 5 * S; ctx.stroke();
    }

    ctx.restore();
  }

  MF.forge({
    cat: '物理运动', type: 'block', dur: 6, poster: 0.5,
    params: PHYS_PARAMS, draw: physDraw,
    ids: [
      { id: 'ph-pendulum', name: '单摆', tags: ['摆动', '物理'], desc: '单摆在重力下往复摆动，并画出摆角弧线，物理感真实。', cfg: { kind: 'pendulum' } },
      { id: 'ph-spring', name: '弹簧振子', tags: ['弹性', '振动'], desc: '弹簧拉伸后带阻尼回弹，直观展示弹性与阻尼。', cfg: { kind: 'spring' } },
      { id: 'ph-bounce-trail', name: '弹跳拖尾', tags: ['弹跳', '拖尾'], desc: '小球弹跳并带运动拖尾，高度逐次衰减。', cfg: { kind: 'bounce-trail' } },
      { id: 'ph-newton', name: '牛顿摆', tags: ['牛顿摆', '动量'], desc: '经典牛顿摆演示动量传递，两端小球交替摆动。', cfg: { kind: 'newton' } },
      { id: 'ph-cloth', name: '布料波动', tags: ['布料', '网格'], desc: '网格布面在风的作用下起伏波动，质感柔软。', cfg: { kind: 'cloth' } },
      { id: 'ph-rope', name: '绳索波', tags: ['绳索', '波'], desc: '绳索被抖动后正弦波沿绳传播，物理演示感强。', cfg: { kind: 'rope' } },
      { id: 'ph-drop-ripple', name: '落水涟漪', tags: ['水波', '涟漪'], desc: '小球落入水面后激起同心涟漪，水面透视感明确。', cfg: { kind: 'drop-ripple' } },
      { id: 'ph-magnetic', name: '磁力吸附', tags: ['磁力', '吸引'], desc: '粒子被磁力吸引向中心聚拢，带磁场光晕。', cfg: { kind: 'magnetic-p' } },
      { id: 'ph-gravity', name: '重力落体', tags: ['重力', '下落'], desc: '多球自由落体并落地压扁，重力加速度直观可见。', cfg: { kind: 'gravity' } },
      { id: 'ph-collision', name: '弹性碰撞', tags: ['碰撞', '冲击'], desc: '两球相撞瞬间的冲击闪光与飞溅，撞击感强烈。', cfg: { kind: 'collision' } },
      { id: 'ph-domino', name: '多米诺', tags: ['多米诺', '连锁'], desc: '骨牌依次倒下形成连锁反应，隐喻传导与影响。', cfg: { kind: 'domino', count: 12 } },
      { id: 'ph-balance', name: '天平摆动', tags: ['天平', '权衡'], desc: '天平在两端之间摆动趋于平衡，适合对比与权衡主题。', cfg: { kind: 'balance' } },
      { id: 'ph-chain', name: '链条摆动', tags: ['链条', '传递'], desc: '链条呈波浪式运动，机械与传递感强。', cfg: { kind: 'chain' } },
      { id: 'ph-fluid', name: '流体扰动', tags: ['流体', '有机'], desc: '噪声场驱动的流体线条持续扰动，有机且柔和。', cfg: { kind: 'fluid', count: 8 } },
      { id: 'ph-gyro', name: '陀螺旋转', tags: ['陀螺', '立体'], desc: '多层圆环构成陀螺结构并旋转，立体感强。', cfg: { kind: 'gyro' } },
      { id: 'ph-trajectory', name: '抛物线', tags: ['抛物', '轨道'], desc: '小球沿抛物线飞行并留下虚线轨迹与拖尾。', cfg: { kind: 'trajectory' } }
    ]
  });

  /* ══════════════════════════ 背景循环 ══════════════════════════ */

  var BG_PARAMS = [
    P('kind', '背景类型', 'grid-pan', sel('grid-pan', [
      ['grid-pan', '网格平移'], ['particle-field', '粒子场'], ['aurora-bg', '极光背景'], ['matrix-rain', '矩阵雨'],
      ['noise-warp', '噪声扭曲'], ['wave-layers', '波浪层'], ['topo', '等高线'], ['gradient-mesh', '渐变网格'],
      ['starfield-bg', '星空漂移'], ['bokeh-bg', '散景光斑'], ['hex-bg', '蜂窝底纹'], ['scanlines', '扫描线'],
      ['dots-bg', '点阵底纹'], ['stripes', '斜条纹'], ['circuit', '电路板'], ['blueprint', '蓝图'],
      ['liquid-bg', '液态流动'], ['rays-bg', '放射线'], ['crack', '裂纹'], ['fog', '迷雾']
    ])),
    P('density', '密度', 14, rng(14, 3, 40, 1)),
    P('size', '尺寸', 300.0, rng(300.0, 60.0, 912.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.1, 3, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function bgDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var n = Math.max(3, Math.round(p.density));
    var kb = U.clamp(t / 1.2, 0, 1);
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.05, p.speed);
    var ink = U.ink;
    var i, x, y, a;

    ctx.save();
    ctx.globalAlpha = kb;

    if (kind === 'grid-pan') {
      var step = base / n * 3.4;
      var off = (t * sp * 40) % step;
      ctx.strokeStyle = U.rgba(ink, 0.1);
      ctx.lineWidth = 1.4 * S;
      ctx.beginPath();
      for (x = -step + off; x < W + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (y = -step + off; y < H + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.55);
      rg.addColorStop(0, U.rgba(U.accent, 0.16));
      rg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'particle-field') {
      for (i = 0; i < n * 12; i++) {
        var px5 = U.rng(i) * W + Math.sin(t * sp * 0.4 + i) * 30 * S;
        var py5 = U.rng(i + 7) * H + Math.cos(t * sp * 0.34 + i * 1.3) * 30 * S;
        ctx.globalAlpha = kb * (0.16 + U.rng(i + 19) * 0.6);
        ctx.beginPath();
        ctx.arc(px5, py5, (1.6 + U.rng(i + 29) * 5) * S, 0, Math.PI * 2);
        ctx.fillStyle = i % 4 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
    }

    else if (kind === 'aurora-bg') {
      for (i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, H * (0.15 + i * 0.12));
        for (x = 0; x <= W; x += 22) {
          ctx.lineTo(x, H * (0.2 + i * 0.12) + Math.sin(x * 0.004 + t * sp * 0.9 + i) * 70 * S
            + Math.sin(x * 0.011 - t * sp * 0.6) * 34 * S);
        }
        ctx.lineTo(W, H * 0.8); ctx.lineTo(0, H * 0.8); ctx.closePath();
        var ag2 = ctx.createLinearGradient(0, H * 0.1, W, H * 0.8);
        ag2.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0));
        ag2.addColorStop(0.4, U.rgba(i % 2 ? U.accent : U.accent2, 0.16));
        ag2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ag2;
        ctx.fill();
      }
    }

    else if (kind === 'matrix-rain') {
      var cols = n * 2;
      var cw4 = W / cols;
      ctx.font = U.fs(20 * S, 700, true);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (i = 0; i < cols; i++) {
        var colX = i * cw4 + cw4 / 2;
        var seedc = U.rng(i);
        var head = ((t * sp * (0.4 + seedc * 0.8) + seedc * 3) % 1.4) * H * 1.4 - H * 0.2;
        for (var mi2 = 0; mi2 < 16; mi2++) {
          var charY = head - mi2 * 26 * S;
          if (charY < -30 || charY > H + 30) continue;
          var fade = Math.max(0, 1 - mi2 / 16);
          ctx.globalAlpha = kb * fade * (0.25 + seedc * 0.6);
          ctx.fillStyle = mi2 === 0 ? '#FFFFFF' : (mi2 < 3 ? U.accent : U.rgba(U.accent, 0.8));
          var gi = Math.floor(U.rng(i * 31 + mi2 * 7 + Math.floor(t * sp * 6)) * 36);
          ctx.fillText('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(gi), colX, charY);
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'noise-warp') {
      for (i = 0; i < n; i++) {
        var nwy = H * (i + 0.5) / n;
        ctx.beginPath();
        for (x = 0; x <= W; x += 10) {
          var nv2 = U.noise2(x * 0.003 + t * sp * 0.4, i * 0.4, 7);
          var nyy = nwy + nv2 * 60 * S;
          if (x) ctx.lineTo(x, nyy); else ctx.moveTo(x, nyy);
        }
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.5);
        ctx.lineWidth = (1.6 + U.rng(i + 5) * 3) * S;
        ctx.stroke();
      }
    }

    else if (kind === 'wave-layers') {
      for (i = 0; i < n / 2; i++) {
        var wly = H * (0.3 + i * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (x = 0; x <= W; x += 16) {
          ctx.lineTo(x, wly + Math.sin(x * 0.006 + t * sp * 1.1 + i * 0.8) * 40 * S);
        }
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = U.rgba(i % 2 ? U.accent : U.accent2, 0.16 - i * 0.02);
        ctx.fill();
      }
    }

    else if (kind === 'topo') {
      ctx.lineWidth = 1.6 * S;
      for (i = 0; i < n; i++) {
        ctx.beginPath();
        for (var ta = 0; ta <= 360; ta += 6) {
          var tr2 = ta * Math.PI / 180;
          var tnoise = U.noise2(Math.cos(tr2) * 1.6 + t * sp * 0.2, Math.sin(tr2) * 1.6, 21);
          var trad = base * (0.16 + i * 0.05) * (1 + tnoise * 0.22);
          var tx5 = cx + Math.cos(tr2) * trad, ty5 = cy + Math.sin(tr2) * trad * 0.82;
          if (ta) ctx.lineTo(tx5, ty5); else ctx.moveTo(tx5, ty5);
        }
        ctx.closePath();
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.42);
        ctx.stroke();
      }
    }

    else if (kind === 'gradient-mesh' || kind === 'bokeh-bg') {
      var meshN = kind === 'bokeh-bg' ? n * 1.6 : n * 0.7;
      for (i = 0; i < meshN; i++) {
        var mx2 = cx + Math.sin(t * sp * 0.28 + i * 2.1) * W * 0.34;
        var my2 = cy + Math.cos(t * sp * 0.24 + i * 1.7) * H * 0.3;
        var mr2 = base * (0.3 + U.rng(i + 3) * 0.6);
        var mg2 = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, mr2);
        mg2.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.2));
        mg2.addColorStop(1, U.rgba(i % 2 ? U.accent2 : U.accent, 0));
        ctx.fillStyle = mg2;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'starfield-bg') {
      for (i = 0; i < n * 14; i++) {
        var sx5 = (U.rng(i) * W + t * sp * (2 + U.rng(i + 3) * 8)) % W;
        var sy5 = U.rng(i + 11) * H;
        var twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * sp * 2 + i));
        ctx.globalAlpha = kb * twinkle * (0.3 + U.rng(i + 21) * 0.7);
        ctx.beginPath();
        ctx.arc(sx5, sy5, (0.8 + U.rng(i + 31) * 2.4) * S, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 ? U.ink : U.accent;
        ctx.fill();
      }
    }

    else if (kind === 'hex-bg') {
      var hr2 = base / n * 0.9;
      var colW2 = hr2 * 1.732, rowH2 = hr2 * 1.5;
      var pulse = 0.5 + 0.5 * Math.sin(t * sp * 1.4);
      for (y = -rowH2; y < H + rowH2; y += rowH2) {
        for (x = -colW2; x < W + colW2; x += colW2) {
          var ox3 = x + (Math.round(y / rowH2) % 2 ? colW2 / 2 : 0);
          ctx.beginPath();
          for (i = 0; i < 6; i++) {
            a = Math.PI * 2 * i / 6 + Math.PI / 6;
            var hpx = ox3 + hr2 * Math.cos(a), hpy = y + hr2 * Math.sin(a);
            if (i) ctx.lineTo(hpx, hpy); else ctx.moveTo(hpx, hpy);
          }
          ctx.closePath();
          var hdist = Math.hypot(ox3 - cx, y - cy) / (Math.min(W, H) * 0.6);
          ctx.strokeStyle = U.rgba(U.accent, 0.1 + 0.3 * Math.max(0, 1 - Math.abs(hdist - pulse * 0.8) * 3));
          ctx.lineWidth = 1.6 * S;
          ctx.stroke();
        }
      }
    }

    else if (kind === 'scanlines') {
      for (i = 0; i < H / (6 * S) + 2; i++) {
        ctx.globalAlpha = kb * 0.14;
        ctx.fillStyle = ink;
        ctx.fillRect(0, i * 6 * S, W, 2 * S);
      }
      ctx.globalAlpha = kb;
      var sl = (t * sp * 0.4 % 1) * H * 1.2 - H * 0.1;
      var slg = ctx.createLinearGradient(0, sl - 60 * S, 0, sl + 60 * S);
      slg.addColorStop(0, U.rgba(U.accent, 0));
      slg.addColorStop(0.5, U.rgba(U.accent, 0.28));
      slg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = slg;
      ctx.fillRect(0, sl - 60 * S, W, 120 * S);
    }

    else if (kind === 'dots-bg') {
      var dst = base / n * 2.4;
      for (y = dst / 2; y < H; y += dst) {
        for (x = dst / 2; x < W; x += dst) {
          var dpl = 0.5 + 0.5 * Math.sin(x * 0.01 + y * 0.01 - t * sp * 1.8);
          ctx.globalAlpha = kb * (0.06 + 0.24 * dpl);
          ctx.beginPath();
          ctx.arc(x, y, (2 + dpl * 4) * S, 0, Math.PI * 2);
          ctx.fillStyle = U.accent;
          ctx.fill();
        }
      }
    }

    else if (kind === 'stripes') {
      var sst = base / n * 2.6;
      var soff = (t * sp * 60) % sst;
      ctx.strokeStyle = U.rgba(U.accent, 0.14);
      ctx.lineWidth = sst * 0.34;
      ctx.beginPath();
      for (i = -Math.ceil(H / sst) - 2; i < W / sst + 2; i++) {
        var sxo = i * sst + soff;
        ctx.moveTo(sxo, 0);
        ctx.lineTo(sxo + H, H);
      }
      ctx.stroke();
    }

    else if (kind === 'circuit') {
      ctx.strokeStyle = U.rgba(U.accent, 0.3);
      ctx.lineWidth = 1.8 * S;
      var gs = base / n * 2;
      for (i = 0; i < n * 2; i++) {
        var sxp2 = Math.floor(U.rng(i) * (W / gs)) * gs;
        var syp2 = Math.floor(U.rng(i + 5) * (H / gs)) * gs;
        ctx.beginPath();
        ctx.moveTo(sxp2, syp2);
        var dir = U.rng(i + 11) > 0.5;
        var len2 = gs * (1 + Math.floor(U.rng(i + 21) * 3));
        ctx.lineTo(sxp2 + (dir ? len2 : 0), syp2 + (dir ? 0 : len2));
        ctx.lineTo(sxp2 + (dir ? len2 : gs * Math.floor(U.rng(i + 31) * 3)), syp2 + (dir ? gs * Math.floor(U.rng(i + 41) * 3) : len2));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sxp2, syp2, 5 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      var glowPulse = 0.5 + 0.5 * Math.sin(t * sp * 2.2);
      ctx.globalAlpha = kb * glowPulse * 0.5;
      ctx.fillStyle = U.rgba(U.accent, 0.3);
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = kb;
    }

    else if (kind === 'blueprint') {
      var bst = base / n * 2.6;
      ctx.strokeStyle = U.rgba(U.accent, 0.16);
      ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      for (x = 0; x < W; x += bst) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (y = 0; y < H; y += bst) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      ctx.strokeStyle = U.rgba(U.accent, 0.5);
      ctx.lineWidth = 2.4 * S;
      for (i = 0; i < 6; i++) {
        var bwx = U.rng(i * 13) * W * 0.7 + W * 0.1;
        var bwy = U.rng(i * 17 + 3) * H * 0.7 + H * 0.1;
        var bww = 80 * S + U.rng(i + 7) * 200 * S * kb;
        var bwh = 60 * S + U.rng(i + 23) * 150 * S * kb;
        ctx.strokeRect(bwx, bwy, bww, bwh);
      }
      ctx.setLineDash([10 * S, 8 * S]);
      ctx.strokeStyle = U.rgba(U.accent2, 0.5);
      ctx.beginPath();
      ctx.moveTo(cx - base * 0.8, cy); ctx.lineTo(cx + base * 0.8, cy);
      ctx.moveTo(cx, cy - base * 0.5); ctx.lineTo(cx, cy + base * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    else if (kind === 'liquid-bg') {
      for (var lyr = 0; lyr < 4; lyr++) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (x = 0; x <= W; x += 14) {
          var lvy = H * (0.55 + lyr * 0.12) + Math.sin(x * 0.007 + t * sp * (1 + lyr * 0.3) + lyr) * 40 * S
            + Math.sin(x * 0.018 - t * sp * 1.4) * 22 * S;
          ctx.lineTo(x, lvy);
        }
        ctx.lineTo(W, H); ctx.closePath();
        var lvg = ctx.createLinearGradient(0, H * 0.4, 0, H);
        lvg.addColorStop(0, U.rgba(lyr % 2 ? U.accent2 : U.accent, 0.2));
        lvg.addColorStop(1, U.rgba(U.accent, 0.05));
        ctx.fillStyle = lvg;
        ctx.fill();
      }
    }

    else if (kind === 'rays-bg') {
      for (i = 0; i < n * 1.4; i++) {
        var rayA = i / (n * 1.4) * Math.PI * 2 + t * sp * 0.06;
        var rayW = 0.012 + 0.03 * Math.abs(Math.sin(i * 1.4 + t * sp * 0.4));
        var rgd2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
        rgd2.addColorStop(0, U.rgba(U.accent, 0.16));
        rgd2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = rgd2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rayA - rayW) * Math.max(W, H), cy + Math.sin(rayA - rayW) * Math.max(W, H));
        ctx.lineTo(cx + Math.cos(rayA + rayW) * Math.max(W, H), cy + Math.sin(rayA + rayW) * Math.max(W, H));
        ctx.closePath();
        ctx.fill();
      }
    }

    else if (kind === 'crack') {
      ctx.strokeStyle = U.rgba(U.accent, 0.5);
      ctx.lineCap = 'round';
      for (i = 0; i < n; i++) {
        var ckx = U.rng(i * 7) * W, cky = U.rng(i * 11 + 3) * H;
        var ckA = U.rng(i + 17) * Math.PI * 2;
        var ckLen = base * (0.3 + U.rng(i + 27) * 0.7);
        var ckGrow = U.clamp((t * sp - i * 0.06) / 0.9, 0, 1);
        ctx.beginPath();
        ctx.moveTo(ckx, cky);
        var cxx = ckx, cyy = cky;
        var csegs = 9;
        for (var cs2 = 0; cs2 < csegs * ckGrow; cs2++) {
          ckA += (U.rng(i * 31 + cs2 * 7) - 0.5) * 1.2;
          cxx += Math.cos(ckA) * ckLen / csegs;
          cyy += Math.sin(ckA) * ckLen / csegs;
          ctx.lineTo(cxx, cyy);
        }
        ctx.lineWidth = (3.4 - i * 0.12) * S;
        ctx.stroke();
      }
    }

    else if (kind === 'fog') {
      for (i = 0; i < 5; i++) {
        var fx4 = cx + Math.sin(t * sp * 0.22 + i * 1.8) * W * 0.34;
        var fy4 = cy + Math.cos(t * sp * 0.18 + i * 2.3) * H * 0.28;
        var fg4 = ctx.createRadialGradient(fx4, fy4, 0, fx4, fy4, base * 1.1);
        fg4.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.14));
        fg4.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = fg4;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else {
      ctx.fillStyle = U.rgba(U.accent, 0.08);
      ctx.fillRect(0, 0, W, H);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  MF.forge({
    cat: '背景循环', type: 'block', dur: 8, poster: 0.6,
    params: BG_PARAMS, draw: bgDraw,
    ids: [
      { id: 'bg-grid-pan', name: '网格平移', tags: ['网格', '科技'], desc: '网格持续平移并带中心光晕，最通用的科技感底纹。', cfg: { kind: 'grid-pan' } },
      { id: 'bg-particle', name: '粒子场', tags: ['粒子', '氛围'], desc: '光点轻柔漂浮的粒子场，安静且有空间感。', cfg: { kind: 'particle-field' } },
      { id: 'bg-aurora', name: '极光背景', tags: ['极光', '梦幻'], desc: '多层极光带缓慢起伏，梦幻氛围直接拉满。', cfg: { kind: 'aurora-bg' } },
      { id: 'bg-matrix', name: '矩阵雨', tags: ['矩阵', '赛博'], desc: '数字字符如瀑布般下落，黑客与赛博的经典符号。', cfg: { kind: 'matrix-rain' } },
      { id: 'bg-noise', name: '噪声扭曲', tags: ['噪声', '有机'], desc: '噪声驱动的扭曲线条，有机流动感强。', cfg: { kind: 'noise-warp' } },
      { id: 'bg-waves', name: '波浪层', tags: ['波浪', '层次'], desc: '多层波浪叠加起伏，层次柔和。', cfg: { kind: 'wave-layers', density: 16 } },
      { id: 'bg-topo', name: '等高线', tags: ['等高线', '地图'], desc: '等高线式闭合曲线缓慢变化，地图与地理主题感强。', cfg: { kind: 'topo', size: 700} },
      { id: 'bg-mesh', name: '渐变网格', tags: ['渐变', '色彩'], desc: '多色光团融合流动的渐变网格，非常现代。', cfg: { kind: 'gradient-mesh' } },
      { id: 'bg-stars', name: '星空漂移', tags: ['星空', '宇宙'], desc: '星空缓慢横向漂移并闪烁，安静而深邃。', cfg: { kind: 'starfield-bg' } },
      { id: 'bg-bokeh', name: '散景背景', tags: ['散景', '柔美'], desc: '散景光斑缓慢漂浮，柔美摄影感。', cfg: { kind: 'bokeh-bg' } },
      { id: 'bg-hex', name: '蜂窝底纹', tags: ['蜂窝', '科技'], desc: '蜂窝网格带同心脉冲，科技与工业主题底纹。', cfg: { kind: 'hex-bg' } },
      { id: 'bg-scanlines', name: '扫描线', tags: ['扫描', '复古'], desc: 'CRT 扫描线与扫描光带叠加，复古显示器质感。', cfg: { kind: 'scanlines' } },
      { id: 'bg-dots', name: '点阵底纹', tags: ['点阵', '呼吸'], desc: '点阵底纹随波动呼吸，干净且规律。', cfg: { kind: 'dots-bg' } },
      { id: 'bg-stripes', name: '斜条纹', tags: ['条纹', '速度'], desc: '斜条纹持续流动，带速度与警示的意味。', cfg: { kind: 'stripes' } },
      { id: 'bg-circuit', name: '电路板', tags: ['电路', '硬件'], desc: '电路走线与焊点构成硬件感背景，科技硬件主题首选。', cfg: { kind: 'circuit' } },
      { id: 'bg-blueprint', name: '蓝图', tags: ['蓝图', '工程'], desc: '工程蓝图网格与标注线，专业与工程感强。', cfg: { kind: 'blueprint' } },
      { id: 'bg-liquid', name: '液态流动', tags: ['液态', '柔和'], desc: '多层液态波纹缓慢流动，柔和且有层次。', cfg: { kind: 'liquid-bg' } },
      { id: 'bg-rays', name: '放射线', tags: ['放射', '光感'], desc: '放射状光线缓慢旋转，中心光感明确。', cfg: { kind: 'rays-bg' } },
      { id: 'bg-crack', name: '裂纹生长', tags: ['裂纹', '张力'], desc: '裂纹自随机点向外蔓延生长，张力与破碎感强。', cfg: { kind: 'crack' } },
      { id: 'bg-fog', name: '迷雾', tags: ['迷雾', '氛围'], desc: '流动的迷雾缓慢弥漫，氛围柔和且有空间深度。', cfg: { kind: 'fog' } }
    ]
  });
})();
