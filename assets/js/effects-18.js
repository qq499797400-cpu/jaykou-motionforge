/* ==========================================================================
   Jaykou 动效库 · 18
   原语：HUD 仪表（控件 / 状态灯 / 锁定框） / 3D 立体（伪 3D 数学投影）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：HUD 仪表 ══════════════════════════ */

  var HUD_PARAMS = [
    P('kind', '形态', 'gauge', sel('gauge', [
      ['gauge', '仪表指针'], ['cluster', '三表盘'], ['toggle', '开关切换'],
      ['slider', '滑杆自动'], ['stat-card', '数据卡片'], ['spark', '迷你走势'],
      ['battery', '电量充放'], ['signal', '信号强度'], ['wifi', 'WiFi 波纹'],
      ['bluetooth', '蓝牙配对'], ['knob', '旋钮转动'], ['led', 'LED 序列灯'],
      ['lock-on', '目标锁定'], ['vitals', '心电图']
    ])),
    P('text', '标签', 'SYSTEM', txt('SYSTEM')),
    P('level', '数值', 76, rng(76, 0, 100, 1)),
    P('size', '基准尺寸', 1232, rng(1232, 140.0, 1725, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.4, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function hudDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var lv = U.clamp(p.level / 100, 0, 1);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    function jauge(x, y, r2, k, c, a2) {
      ctx.beginPath();
      ctx.arc(x, y, r2, Math.PI * 0.75, Math.PI * 2.25);
      ctx.lineWidth = r2 * 0.14;
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.stroke();
      if (k > 0.01) {
        ctx.beginPath();
        ctx.arc(x, y, r2, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * k));
        ctx.lineWidth = r2 * 0.14;
        ctx.strokeStyle = U.rgba(c, a2 === undefined ? 1 : a2);
        ctx.stroke();
      }
    }

    if (kind === 'gauge') {
      var k = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var needle = lv * k + Math.sin(tt * 2.2) * 0.012;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.6);
      jauge(cx, cy, R * 0.6, needle, col);
      ctx.shadowBlur = 0;
      for (var ti = 0; ti <= 10; ti++) {
        var ta = Math.PI * 0.75 + (ti / 10) * Math.PI * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ta) * R * 0.46, cy + Math.sin(ta) * R * 0.46);
        ctx.lineTo(cx + Math.cos(ta) * R * 0.52, cy + Math.sin(ta) * R * 0.52);
        ctx.lineWidth = 2.4 * S;
        ctx.strokeStyle = U.rgba(U.ink, 0.4);
        ctx.stroke();
      }
      var na = Math.PI * 0.75 + needle * Math.PI * 1.5;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(na);
      ctx.beginPath();
      ctx.moveTo(-R * 0.06, 0); ctx.lineTo(R * 0.5, -R * 0.02); ctx.lineTo(R * 0.5, R * 0.02); ctx.closePath();
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.ink, 0.9); ctx.fill();
      ctx.font = U.fs(R * 0.3, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(Math.round(needle * 100) + '%', cx, cy + R * 0.4);
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'cluster') {
      var kc = e.outCubic(U.clamp((tt - 0.3) / 1.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var vals = [lv, lv * 0.6, lv * 0.85];
      var labs = ['A', 'B', 'C'];
      for (var ci = 0; ci < 3; ci++) {
        var gx = cx + (ci - 1) * R * 0.78;
        var ckk = U.clamp((kc - ci * 0.12) / 0.88, 0, 1);
        jauge(gx, cy - R * 0.05, R * 0.3, vals[ci] * ckk, ci === 1 ? U.accent2 : col);
        ctx.font = U.fs(R * 0.13, 800);
        ctx.fillStyle = U.rgba(U.ink, 0.95);
        ctx.fillText(Math.round(vals[ci] * ckk * 100), gx, cy + R * 0.06);
        ctx.font = U.fs(R * 0.09 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(labs[ci], gx, cy + R * 0.26);
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.8);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'toggle') {
      var cyc = (tt * 0.55) % 1;
      var on = cyc < 0.5;
      var kk2 = e.outCubic(on ? U.clamp(cyc * 6, 0, 1) : U.clamp((0.5 - cyc) * 6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bw = R * 0.9, bh = R * 0.4;
      U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, bh / 2);
      ctx.fillStyle = U.rgba(on ? col : U.ink, on ? 0.95 : 0.18);
      ctx.fill();
      var kx = U.lerp(cx - bw / 2 + bh / 2, cx + bw / 2 - bh / 2, kk2);
      glowOn(on ? col : U.ink, on ? p.glow * 0.5 : 0);
      ctx.beginPath(); ctx.arc(kx, cy, bh * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, 0.97); ctx.fill();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(on ? col : U.ink, 0.85);
      ctx.fillText(on ? 'ON' : 'OFF', cx, cy + R * 0.62);
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, cx, cy - R * 0.62);
    } else if (kind === 'slider') {
      var auto = (Math.sin(tt * 1.4) + 1) / 2;
      var k3 = e.outCubic(U.clamp(tt / 1.2, 0, 1));
      var val = U.lerp(lv * 0.2, lv, k3) * 0.7 + auto * 0.3;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var sw = R * 1.1;
      U.rr(ctx, cx - sw / 2, cy - 4 * S, sw, 8 * S, 4 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.15); ctx.fill();
      U.rr(ctx, cx - sw / 2, cy - 4 * S, sw * val, 8 * S, 4 * S);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      glowOn(col, p.glow * 0.4);
      ctx.beginPath(); ctx.arc(cx - sw / 2 + sw * val, cy, R * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, 1); ctx.fill();
      ctx.lineWidth = 4 * S; ctx.strokeStyle = U.rgba(col, 1); ctx.stroke();
      ctx.font = U.fs(R * 0.14, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(Math.round(val * 100), cx - sw / 2 + sw * val, cy - R * 0.24);
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, cx, cy + R * 0.42);
    } else if (kind === 'stat-card') {
      var up = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((1 - e.outCubic(U.clamp(tt / 0.7, 0, 1))) * 0.06);
      ctx.scale(up, up);
      var cw = R * 1.1, ch = R * 0.72;
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch, ch * 0.14);
      ctx.fillStyle = U.rgba(U.bg2, 0.96); ctx.fill();
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.4); ctx.stroke();
      ctx.font = U.fs(ch * 0.16, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.textAlign = 'left';
      ctx.fillText(label, -cw * 0.38, -ch * 0.24);
      var vk = e.outExpo(U.clamp((tt - 0.5) / 1, 0, 1));
      ctx.font = U.fs(ch * 0.4, 900);
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText(String(Math.round(p.level * vk)), -cw * 0.38, ch * 0.14);
      var delta = U.rnd(-20, 40, 5);
      ctx.font = U.fs(ch * 0.15, 800);
      ctx.fillStyle = U.rgba(delta > 0 ? '#5DFF8F' : '#FF6A5D', 0.95);
      ctx.fillText((delta > 0 ? '▲ +' : '▼ ') + delta.toFixed(1) + '%', -cw * 0.38, ch * 0.36);
      ctx.restore();
    } else if (kind === 'spark') {
      var k4 = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      var pts = [];
      for (var si = 0; si <= 30; si++) {
        var px = W * 0.28 + (si / 30) * W * 0.44;
        var py = cy + U.noise2(si * 0.4, 3, U.seed) * R * 0.3 * (0.4 + 0.6 * (si / 30)) - k4 * R * 0.18;
        pts.push([px, py]);
        if (!si) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.lineWidth = 4.4 * S; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineTo(W * 0.72, cy + R * 0.42);
      ctx.lineTo(W * 0.28, cy + R * 0.42);
      ctx.closePath();
      var ag = ctx.createLinearGradient(0, cy - R * 0.4, 0, cy + R * 0.42);
      ag.addColorStop(0, U.rgba(col, 0.3));
      ag.addColorStop(1, U.rgba(col, 0));
      ctx.fillStyle = ag; ctx.fill();
      var last2 = pts[Math.min(pts.length - 1, Math.ceil(30 * k4))];
      ctx.beginPath(); ctx.arc(last2[0], last2[1], 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.95); ctx.fill();
      ctx.font = U.fs(R * 0.16, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(label + ' ' + Math.round(lv * k4), W * 0.28, cy - R * 0.5);
    } else if (kind === 'battery') {
      var charge = (tt * 0.45) % 1;
      var showK = e.inOutCubic(U.clamp(tt / 1, 0, 1));
      var blevel = Math.abs(charge * 2 - 1) < 0.5 ? charge : (1 - charge);
      var level = U.lerp(0.08, lv, showK) * (0.3 + 0.7 * blevel);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bw2 = R * 1.06, bh2 = R * 0.46;
      U.rr(ctx, cx - bw2 / 2, cy - bh2 / 2, bw2, bh2, bh2 * 0.16);
      ctx.lineWidth = 4 * S; ctx.strokeStyle = U.rgba(U.ink, 0.5); ctx.stroke();
      U.rr(ctx, cx + bw2 / 2 + 6 * S, cy - bh2 * 0.16, 12 * S, bh2 * 0.32, 4 * S);
      ctx.fillStyle = U.rgba(U.ink, 0.5); ctx.fill();
      glowOn(level > 0.2 ? col : '#FF6A5D', p.glow * 0.4);
      if (level > 0.015) {
        U.rr(ctx, cx - bw2 / 2 + 7 * S, cy - bh2 / 2 + 7 * S, Math.max(bh2 * 0.14, (bw2 - 14 * S) * level), bh2 - 14 * S, bh2 * 0.1);
        ctx.fillStyle = U.rgba(level > 0.2 ? col : '#FF6A5D', 0.95); ctx.fill();
      }
      ctx.font = U.fs(R * 0.16, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(Math.round(level * 100) + '%', cx, cy + R * 0.52);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label + (level > 0.99 ? ' · FULL' : ' · CHARGING'), cx, cy + R * 0.74);
    } else if (kind === 'signal') {
      var sk = e.outCubic(U.clamp(tt / 1.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bars = 5;
      var active = Math.round(lv * bars * sk);
      for (var bi = 0; bi < bars; bi++) {
        var bh3 = R * (0.16 + bi * 0.11);
        var bx = cx + (bi - bars / 2 + 0.5) * R * 0.17;
        U.rr(ctx, bx - R * 0.055, cy + R * 0.3 - bh3, R * 0.11, bh3, R * 0.04);
        ctx.fillStyle = U.rgba(bi < active ? col : U.ink, bi < active ? 0.95 : 0.16);
        ctx.fill();
      }
      var flick = Math.sin(tt * 3) > 0.9;
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(flick ? col : U.ink, flick ? 0.9 : 0.55);
      ctx.fillText(label + ' · ' + active + '/' + bars, cx, cy - R * 0.42);
    } else if (kind === 'wifi') {
      var wk = e.outCubic(U.clamp(tt / 1.1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.4);
      for (var wi = 0; wi < 4; wi++) {
        var wkk = U.clamp((wk - wi * 0.14) / 0.6, 0, 1);
        if (wkk <= 0.01) continue;
        ctx.beginPath();
        if (wi < 3) {
          ctx.arc(cx, cy + R * 0.3, R * (0.14 + wi * 0.15), Math.PI * 1.22, Math.PI * 1.78);
          ctx.lineWidth = R * 0.055 * S;
          ctx.strokeStyle = U.rgba(col, 0.95 * wkk);
          ctx.stroke();
        } else {
          ctx.arc(cx, cy + R * 0.3, R * 0.08, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(col, 0.95 * wkk);
          ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(label + ' · ' + Math.round(lv * 4) + ' bars', cx, cy + R * 0.62);
    } else if (kind === 'bluetooth') {
      var pair = e.outBack(U.clamp((tt - 0.4) / 0.6, 0, 1));
      var pulse3 = (tt * 0.8) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, R * (0.4 + pulse3 * 0.25), 0, Math.PI * 2);
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba(col, (1 - pulse3) * 0.5);
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(pair, pair);
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.34); ctx.lineTo(R * 0.2, -R * 0.16); ctx.lineTo(-R * 0.2, R * 0.16); ctx.lineTo(0, R * 0.34);
      ctx.moveTo(0, -R * 0.34); ctx.lineTo(0, R * 0.34);
      ctx.moveTo(0, -R * 0.34); ctx.lineTo(-R * 0.2, -R * 0.16);
      ctx.moveTo(0, R * 0.34); ctx.lineTo(R * 0.2, R * 0.16);
      ctx.lineWidth = R * 0.055 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 1);
      ctx.stroke();
      ctx.restore();
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.7);
      ctx.fillText(label + ' · PAIRED', cx, cy + R * 0.72);
    } else if (kind === 'knob') {
      var rot3 = e.inOutCubic(U.clamp((tt - 0.3) / 1.8, 0, 1)) * Math.PI * 1.5 - Math.PI * 0.75;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      jauge(cx, cy, R * 0.5, (rot3 + Math.PI * 0.75) / (Math.PI * 1.5), col);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.97); ctx.fill();
      ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(U.ink, 0.15); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot3);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(R * 0.3, 0);
      ctx.lineWidth = R * 0.045 * S; ctx.lineCap = 'round';
      ctx.strokeStyle = U.rgba(col, 1); ctx.stroke();
      ctx.restore();
      ctx.font = U.fs(R * 0.13, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(Math.round(((rot3 + Math.PI * 0.75) / (Math.PI * 1.5)) * 100), cx, cy + 1);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'led') {
      var cycle = (tt * sp) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var n2 = 8;
      for (var li = 0; li < n2; li++) {
        var lx = cx + (li - (n2 - 1) / 2) * R * 0.16;
        var phase = (cycle * n2 * 0.5 + li / n2) % 1;
        var bright = Math.pow(Math.max(0, 1 - Math.abs(phase - 0.25) * 4), 2);
        ctx.beginPath(); ctx.arc(lx, cy, R * 0.05, 0, Math.PI * 2);
        if (bright > 0.03) { ctx.shadowColor = U.rgba(col, bright); ctx.shadowBlur = 20 * S * bright * p.glow; }
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, bright * 0.5), 0.15 + bright * 0.85);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText(label + ' · SEQ', cx, cy + R * 0.4);
    } else if (kind === 'lock-on') {
      var lockK = e.outCubic(U.clamp(tt / 1.1, 0, 1));
      var jig = Math.sin(tt * 14) * 0.012 * (1 - lockK);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx + jig * W * 0.05, cy + Math.cos(tt * 11) * R * 0.04 * (1 - lockK));
      var lw = R * 0.5 * lockK, lh = R * 0.34 * lockK;
      var corner = R * 0.12;
      ctx.lineWidth = 4 * S; ctx.lineCap = 'square';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 0.95);
      var cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (var c4 = 0; c4 < 4; c4++) {
        var cxx = cs[c4][0] * lw, cyy = cs[c4][1] * lh;
        ctx.beginPath();
        ctx.moveTo(cxx - cs[c4][0] * corner, cyy);
        ctx.lineTo(cxx, cyy);
        ctx.lineTo(cxx, cyy - cs[c4][1] * corner);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(0, 0, 4 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.restore();
      ctx.font = U.fs(R * 0.11 * S, 800);
      ctx.fillStyle = U.rgba(col, U.clamp((tt - 0.9) / 0.4, 0, 1));
      ctx.fillText('LOCKED · ' + label, cx, cy + lh + R * 0.16);
    } else if (kind === 'vitals') {
      var vk2 = tt * 1.6;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      for (var vi = 0; vi <= 120; vi++) {
        var vx = W * 0.15 + (vi / 120) * W * 0.7;
        var ph2 = (vi / 120 * 3 + vk2) % 1;
        var vy;
        if (ph2 < 0.12) vy = -Math.sin(ph2 / 0.12 * Math.PI) * R * 0.5;
        else if (ph2 < 0.2) vy = Math.sin((ph2 - 0.12) / 0.08 * Math.PI) * R * 0.2;
        else vy = U.noise2(vi * 0.7, 8, U.seed) * R * 0.02;
        if (!vi) ctx.moveTo(vx, cy + vy); else ctx.lineTo(vx, cy + vy);
      }
      ctx.lineWidth = 3.6 * S; ctx.lineJoin = 'round';
      glowOn(col, p.glow);
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      ctx.font = U.fs(R * 0.13, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(Math.round(60 + Math.sin(tt * 2) * 6) + ' BPM', W * 0.15, cy - R * 0.56);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(label, W * 0.15, cy + R * 0.52);
    } else {
      jauge(cx, cy, R * 0.5, lv, col);
      ctx.font = U.fs(R * 0.13, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.66);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：3D 立体 ══════════════════════════ */

  var D3_PARAMS = [
    P('kind', '形态', 'cube', sel('cube', [
      ['cube', '旋转立方'], ['sphere', '点阵球'], ['extrude', '文字挤出'],
      ['iso-stack', '等距层叠'], ['torus', '环面粒子'], ['ribbon', '3D 缎带'],
      ['stairs', '螺旋阶梯'], ['pyramid', '金字塔'], ['box-tunnel', '盒子隧道'],
      ['wire-globe', '线框地球'], ['cyl', '圆柱扫描'], ['flip-panels', '翻板墙']
    ])),
    P('text', '文字', '3D', txt('3D')),
    P('size', '基准尺寸', 1232, rng(1232, 140.0, 1725, 4.0)),
    P('speed', '速度', 1, rng(1, 0.3, 2.4, 0.05)),
    P('depth', '深度', 1, rng(1, 0.4, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function d3Draw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var dep = p.depth;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.8 * amt); ctx.shadowBlur = 22 * S * amt; }
    }
    /* 简单 3D：绕 Y/X 旋转投影 */
    function proj(x, y, z, ry, rx, persp) {
      var cA = Math.cos(ry), sA = Math.sin(ry);
      var x1 = x * cA - z * sA, z1 = x * sA + z * cA;
      var cB = Math.cos(rx), sB = Math.sin(rx);
      var y1 = y * cB - z1 * sB, z2 = y * sB + z1 * cB;
      var f = persp / (persp + z2);
      return [cx + x1 * f, cy + y1 * f, f, z2];
    }

    if (kind === 'cube') {
      var ry = tt * 0.8, rx = Math.sin(tt * 0.5) * 0.4;
      var vs = [];
      var hs = R * 0.5;
      for (var i = 0; i < 8; i++) {
        vs.push([(i & 1 ? hs : -hs), (i & 2 ? hs : -hs), (i & 4 ? hs : -hs)]);
      }
      var edges = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var pj = vs.map(function (v) { return proj(v[0], v[1], v[2], ry, rx, R * 3 * dep); });
      edges.sort(function (a2, b2) { return (pj[a2[0]][3] + pj[a2[1]][3]) - (pj[b2[0]][3] + pj[b2[1]][3]); });
      for (var ei = 0; ei < edges.length; ei++) {
        var a3 = pj[edges[ei][0]], b3 = pj[edges[ei][1]];
        var zAvg = (a3[3] + b3[3]) / (2 * hs);
        ctx.beginPath();
        ctx.moveTo(a3[0], a3[1]); ctx.lineTo(b3[0], b3[1]);
        ctx.lineWidth = Math.max(1, 4 * a3[2]) * S;
        glowOn(zAvg < 0 ? col : U.accent2, p.glow * 0.5);
        ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, (zAvg + 1) / 2), 0.9);
        ctx.stroke();
      }
      for (var vi = 0; vi < 8; vi++) {
        ctx.beginPath(); ctx.arc(pj[vi][0], pj[vi][1], 5 * pj[vi][2] * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#FFFFFF', 0.9); ctx.fill();
      }
    } else if (kind === 'sphere') {
      var ry2 = tt * 0.7, rx2 = 0.4;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var pts = [];
      for (var la = 0; la < 9; la++) {
        var phi = (la / 8 - 0.5) * Math.PI;
        for (var lo = 0; lo < 14; lo++) {
          var th = (lo / 14) * Math.PI * 2 + tt * 0.3;
          pts.push([Math.cos(phi) * Math.cos(th) * R * 0.55, Math.sin(phi) * R * 0.55, Math.cos(phi) * Math.sin(th) * R * 0.55]);
        }
      }
      var pj2 = pts.map(function (v) { return proj(v[0], v[1], v[2], ry2, rx2, R * 3 * dep); });
      pj2.sort(function (a2, b2) { return b2[3] - a2[3]; });
      for (var pi = 0; pi < pj2.length; pi++) {
        var front = pj2[pi][3] < 0;
        ctx.beginPath();
        ctx.arc(pj2[pi][0], pj2[pi][1], Math.max(0.6, 3.6 * pj2[pi][2]) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(front ? col : U.ink, front ? 0.95 : 0.22);
        ctx.fill();
      }
    } else if (kind === 'extrude') {
      var word = String(p.text || '3D');
      var layers = Math.round(10 * dep);
      var ang = tt * 0.9;
      var sway = Math.sin(ang) * 14 * S;
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      ctx.font = U.fs(R * 0.72, 900);
      for (var ly = layers; ly >= 1; ly--) {
        var f2 = ly / layers;
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, f2 * 0.75), 0.9);
        ctx.fillText(word, cx + sway * f2, cy + sway * f2 * 0.7);
      }
      glowOn(col, p.glow);
      ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.35), 1);
      ctx.fillText(word, cx, cy);
    } else if (kind === 'iso-stack') {
      var n2 = Math.max(3, Math.round(6 * dep));
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var si = 0; si < n2; si++) {
        var sk = e.outBack(U.clamp((tt - 0.25 - si * 0.16) / 0.55, 0, 1));
        if (sk <= 0.01) continue;
        var sy2 = cy + R * 0.42 - si * (R * 0.16);
        var w2 = R * 0.6, h2 = R * 0.3, d2 = R * 0.34;
        ctx.save();
        ctx.translate(cx, sy2 + (1 - sk) * -40 * S);
        ctx.scale(sk, sk);
        ctx.beginPath();
        ctx.moveTo(0, -d2); ctx.lineTo(w2, 0); ctx.lineTo(0, d2); ctx.lineTo(-w2, 0);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.45 - si * 0.05), 0.95);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w2, 0); ctx.lineTo(0, d2); ctx.lineTo(0, d2 + h2 * 0.42); ctx.lineTo(-w2, h2 * 0.42);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, 0.45), 0.95);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w2, 0); ctx.lineTo(0, d2); ctx.lineTo(0, d2 + h2 * 0.42); ctx.lineTo(w2, h2 * 0.42);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, 0.4), 0.95);
        ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'torus') {
      var ry3 = tt * 0.85, rx3 = Math.sin(tt * 0.4) * 0.7;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var dots = [];
      for (var ui = 0; ui < 26; ui++) {
        for (var vi2 = 0; vi2 < 9; vi2++) {
          var u2 = (ui / 26) * Math.PI * 2;
          var v2 = (vi2 / 9) * Math.PI * 2;
          var r2 = R * 0.42, r1 = R * 0.15;
          var x0 = (r2 + r1 * Math.cos(v2)) * Math.cos(u2);
          var y0 = r1 * Math.sin(v2);
          var z0 = (r2 + r1 * Math.cos(v2)) * Math.sin(u2);
          dots.push(proj(x0, y0 * 0.9, z0, ry3, rx3, R * 3.2 * dep));
        }
      }
      dots.sort(function (a2, b2) { return b2[3] - a2[3]; });
      for (var di = 0; di < dots.length; di++) {
        var front2 = dots[di][3] < 0;
        ctx.beginPath();
        ctx.arc(dots[di][0], dots[di][1], Math.max(0.6, R * 0.03 * dots[di][2]), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, (di % 5) / 5), front2 ? 0.9 : 0.2);
        ctx.fill();
      }
    } else if (kind === 'ribbon') {
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      for (var rb = 0; rb < 3; rb++) {
        ctx.beginPath();
        for (var ri = 0; ri <= 60; ri++) {
          var u3 = (ri / 60) * Math.PI * 6;
          var rr4 = R * (0.3 + rb * 0.12);
          var x3 = cx + Math.cos(u3 + tt * 0.8) * rr4;
          var y3 = cy + Math.sin(u3 * 1.5 + tt * 1.1 + rb) * R * 0.3 * dep;
          var w3 = 26 * S * (0.4 + Math.sin(u3 + tt) * 0.5);
          if (!ri) ctx.moveTo(x3 - w3 / 2, y3); else ctx.lineTo(x3 + w3 / 2, y3);
        }
        ctx.lineWidth = 8 * S;
        glowOn(rb === 1 ? U.accent2 : col, p.glow * 0.5);
        ctx.strokeStyle = U.rgba(rb === 1 ? U.accent2 : U.mix(col, U.ink, rb * 0.2), 0.8);
        ctx.stroke();
      }
    } else if (kind === 'stairs') {
      var steps = Math.max(4, Math.round(8 * dep));
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var st = 0; st < steps; st++) {
        var stk = e.outCubic(U.clamp((tt * 1.2 - st * 0.14) / 0.5, 0, 1));
        if (stk <= 0.01) continue;
        var sx3 = cx - R * 0.55 + st * (R * 0.16);
        var sy3 = cy + R * 0.4 - st * (R * 0.12);
        var sw2 = R * 0.15 * stk, sh2 = R * 0.5 * stk;
        U.rr(ctx, sx3, sy3, sw2, sh2, 4 * S);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, st / steps), 0.95);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.5), 0.9);
        U.rr(ctx, sx3, sy3, sw2, 6 * S, 3 * S);
        ctx.fill();
      }
    } else if (kind === 'pyramid') {
      var ry4 = tt * 0.7, rx4 = 0.35;
      var apex = [0, -R * 0.55, 0];
      var base = [];
      for (var b4 = 0; b4 < 4; b4++) {
        var ba = (b4 / 4) * Math.PI * 2 + Math.PI / 4;
        base.push([Math.cos(ba) * R * 0.48, R * 0.42, Math.sin(ba) * R * 0.48]);
      }
      var pa = proj(apex[0], apex[1], apex[2], ry4, rx4, R * 3 * dep);
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      var faces = [];
      for (var f3 = 0; f3 < 4; f3++) {
        var bA = proj(base[f3][0], base[f3][1], base[f3][2], ry4, rx4, R * 3 * dep);
        var bB = proj(base[(f3 + 1) % 4][0], base[(f3 + 1) % 4][1], base[(f3 + 1) % 4][2], ry4, rx4, R * 3 * dep);
        faces.push({ a: bA, b: bB, z: bA[3] + bB[3] + pa[3], i: f3 });
      }
      faces.sort(function (x, y) { return y.z - x.z; });
      for (var f4 = 0; f4 < faces.length; f4++) {
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(faces[f4].a[0], faces[f4].a[1]);
        ctx.lineTo(faces[f4].b[0], faces[f4].b[1]);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, faces[f4].i % 2 ? U.accent2 : U.ink, 0.35), 0.55);
        ctx.fill();
        ctx.lineWidth = 2 * S;
        ctx.strokeStyle = U.rgba(col, 0.85);
        ctx.stroke();
      }
      for (var b5 = 0; b5 < 4; b5++) {
        var bp = proj(base[b5][0], base[b5][1], base[b5][2], ry4, rx4, R * 3 * dep);
        ctx.beginPath(); ctx.arc(bp[0], bp[1], 4.4 * bp[2] * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#FFFFFF', 0.9); ctx.fill();
      }
    } else if (kind === 'box-tunnel') {
      var travel = (tt * 0.5) % 1;
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      var NN = 9;
      var order = [];
      for (var zi = 0; zi < NN; zi++) order.push(((zi / NN) + travel) % 1);
      order.sort(function (a2, b2) { return b2 - a2; });
      for (var oi = 0; oi < order.length; oi++) {
        var z1 = Math.pow(order[oi], 2);
        var sc = 1 / (z1 * 4 + 0.12) * 0.14;
        var hs2 = R * 0.5 * sc;
        var rot5 = tt * 0.4 + oi * 0.2;
        var pj3 = [];
        for (var vi3 = 0; vi3 < 4; vi3++) {
          var corner = [[-hs2, -hs2], [hs2, -hs2], [hs2, hs2], [-hs2, hs2]][vi3];
          pj3.push([cx + corner[0] * Math.cos(rot5) - corner[1] * Math.sin(rot5), cy + corner[0] * Math.sin(rot5) + corner[1] * Math.cos(rot5)]);
        }
        ctx.beginPath();
        for (var vi4 = 0; vi4 <= 4; vi4++) {
          var pp = pj3[vi4 % 4];
          if (!vi4) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]);
        }
        ctx.lineWidth = Math.max(0.6, 3.4 * sc * 3) * S;
        ctx.strokeStyle = U.rgba(oi % 2 ? col : U.accent2, U.clamp(z1 * 3, 0, 1) * 0.9);
        ctx.stroke();
      }
    } else if (kind === 'wire-globe') {
      var ry5 = tt * 0.45;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var lon2 = 0; lon2 < 8; lon2++) {
        ctx.beginPath();
        for (var la2 = 0; la2 <= 36; la2++) {
          var latA = (la2 / 36) * Math.PI * 2;
          var x4 = Math.cos(latA) * R * 0.52;
          var z4 = Math.sin(latA) * R * 0.52;
          var pr = proj(x4, z4 * 0.18, Math.sin(lon2 / 8 * Math.PI * 2) * R * 0.52 + Math.cos(lon2 / 8 * Math.PI * 2) * 0, ry5, 0.25, R * 3 * dep);
          if (!la2) ctx.moveTo(pr[0], pr[1]); else ctx.lineTo(pr[0], pr[1]);
        }
        ctx.lineWidth = 1.4 * S;
        ctx.strokeStyle = U.rgba(col, 0.35);
        ctx.stroke();
      }
      for (var lat2 = -2; lat2 <= 2; lat2++) {
        ctx.beginPath();
        var rLat = Math.cos(lat2 * 0.5) * R * 0.52;
        var yLat = Math.sin(lat2 * 0.5) * R * 0.52;
        for (var la3 = 0; la3 <= 40; la3++) {
          var th3 = (la3 / 40) * Math.PI * 2;
          var pr2 = proj(Math.cos(th3) * rLat, yLat, Math.sin(th3) * rLat, ry5, 0.25, R * 3 * dep);
          if (!la3) ctx.moveTo(pr2[0], pr2[1]); else ctx.lineTo(pr2[0], pr2[1]);
        }
        ctx.lineWidth = 1.4 * S;
        ctx.strokeStyle = U.rgba(col, 0.45);
        ctx.stroke();
      }
    } else if (kind === 'cyl') {
      var ry6 = tt * 0.9;
      var scanY = (Math.sin(tt * 1.2) + 1) / 2;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      var HH = R * 0.8, RR = R * 0.3;
      for (var ri2 = 0; ri2 <= 30; ri2++) {
        var th4 = (ri2 / 30) * Math.PI * 2;
        var x5 = Math.cos(th4) * RR, z5 = Math.sin(th4) * RR;
        var top = proj(x5, -HH / 2, z5, ry6, 0.28, R * 3 * dep);
        var bot = proj(x5, HH / 2, z5, ry6, 0.28, R * 3 * dep);
        var front3 = z5 * Math.cos(ry6) - x5 * Math.sin(ry6) < 0;
        ctx.beginPath();
        ctx.moveTo(top[0], top[1]); ctx.lineTo(bot[0], bot[1]);
        ctx.lineWidth = 2.2 * S;
        ctx.strokeStyle = U.rgba(col, front3 ? 0.85 : 0.22);
        ctx.stroke();
        var sy4 = -HH / 2 + HH * scanY;
        if (Math.abs(sy4) < HH / 2) {
          var scanP = proj(x5, sy4, z5, ry6, 0.28, R * 3 * dep);
          ctx.beginPath(); ctx.arc(scanP[0], scanP[1], 2.6 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        }
      }
      var tA = proj(0, -HH / 2, 0, ry6, 0.28, R * 3 * dep);
      var tB = proj(RR, -HH / 2, 0, ry6, 0.28, R * 3 * dep);
      ctx.beginPath(); ctx.ellipse(tA[0], tA[1], Math.abs(tB[0] - tA[0]), Math.abs(tB[0] - tA[0]) * 0.32, 0, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(col, 0.7); ctx.lineWidth = 2 * S; ctx.stroke();
    } else if (kind === 'flip-panels') {
      var cols3 = 6, rows3 = 4;
      var pw = R * 1.5 / cols3, ph2 = R * 1.0 / rows3;
      ctx.globalAlpha = U.clamp(tt * 2.4, 0, 1);
      for (var r4 = 0; r4 < rows3; r4++) {
        for (var c5 = 0; c5 < cols3; c5++) {
          var phase = (tt * 0.9 + (r4 + c5) * 0.22) % 2;
          var ang2 = phase < 1 ? phase * Math.PI : 0;
          var flip = Math.sin(ang2);
          var px6 = cx - R * 0.75 + c5 * pw + pw / 2;
          var py6 = cy - R * 0.5 + r4 * ph2 + ph2 / 2;
          ctx.save();
          ctx.translate(px6, py6);
          ctx.transform(1, 0, flip * 0.0, 1, 0, 0);
          ctx.scale(Math.max(0.06, Math.abs(Math.cos(ang2))), 1);
          ctx.fillStyle = U.rgba(U.mix(col, U.accent2, ((r4 * cols3 + c5) % 5) / 5), flip > 0 ? 0.9 : 0.35);
          U.rr(ctx, -pw * 0.42, -ph2 * 0.4, pw * 0.84, ph2 * 0.8, ph2 * 0.14);
          ctx.fill();
          ctx.restore();
        }
      }
    } else {
      ctx.font = U.fs(R * 0.6, 900);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(String(p.text || '3D'), cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: 'HUD 仪表', type: 'block', dur: 6, poster: 0.55,
    params: HUD_PARAMS, draw: hudDraw,
    texts: ['SYSTEM', 'CPU LOAD', 'SYNC', 'UPLINK'],
    ids: [
      { id: 'hud-gauge', name: '仪表指针', tags: ['仪表', '指针'], desc: '指针划过表盘并实时读数，性能监控感。', cfg: { kind: 'gauge' } },
      { id: 'hud-cluster', name: '三表盘', tags: ['仪表', '组合'], desc: '三块小表盘错峰填充，系统面板。', cfg: { kind: 'cluster' } },
      { id: 'hud-toggle', name: '开关切换', tags: ['开关', 'ON/OFF'], desc: '开关来回拨动并点亮，状态切换表达。', cfg: { kind: 'toggle' } },
      { id: 'hud-slider', name: '滑杆自动', tags: ['滑杆', '调节'], desc: '滑块自动来回调节并显示数值，设置面板。', cfg: { kind: 'slider' } },
      { id: 'hud-stat-card', name: '数据卡片', tags: ['卡片', '数据'], desc: '数据卡片弹出并滚动数值与涨跌幅。', cfg: { kind: 'stat-card' } },
      { id: 'hud-spark', name: '迷你走势', tags: ['走势', '面积'], desc: '迷你折线逐渐绘出并带面积渐变。', cfg: { kind: 'spark' } },
      { id: 'hud-battery', name: '电量充放', tags: ['电量', '电池'], desc: '电池充电往复并显示百分比。', cfg: { kind: 'battery' } },
      { id: 'hud-signal', name: '信号强度', tags: ['信号', '格数'], desc: '信号格逐级点亮，网络状态表达。', cfg: { kind: 'signal' } },
      { id: 'hud-wifi', name: 'WiFi 波纹', tags: ['WiFi', '连接'], desc: 'WiFi 弧线逐层亮起，连接成功。', cfg: { kind: 'wifi' } },
      { id: 'hud-bluetooth', name: '蓝牙配对', tags: ['蓝牙', '配对'], desc: '蓝牙符号弹出并发出配对波纹。', cfg: { kind: 'bluetooth' } },
      { id: 'hud-knob', name: '旋钮转动', tags: ['旋钮', '调音'], desc: '旋钮扫过刻度区间，混音台质感。', cfg: { kind: 'knob' } },
      { id: 'hud-led', name: 'LED 序列灯', tags: ['LED', '序列'], desc: 'LED 灯逐个流过，机箱运行灯效。', cfg: { kind: 'led' } },
      { id: 'hud-lock-on', name: '目标锁定', tags: ['锁定', '瞄准'], desc: '锁定框从抖动到锁定，军事 HUD 感。', cfg: { kind: 'lock-on' } },
      { id: 'hud-vitals', name: '心电图', tags: ['心电', '监测'], desc: '心电波形滚动伴随 BPM 读数。', cfg: { kind: 'vitals' } }
    ]
  });

  MF.forge({
    cat: '3D 立体', type: 'block', dur: 6.5, poster: 0.55,
    params: D3_PARAMS, draw: d3Draw,
    ids: [
      { id: 'd3-cube', name: '旋转立方', tags: ['立方', '旋转'], desc: '线框立方体旋转，顶点高亮，科技开场。', cfg: { kind: 'cube' } },
      { id: 'd3-sphere', name: '点阵球', tags: ['球体', '点阵'], desc: '点阵球体旋转，前后景深分明。', cfg: { kind: 'sphere' } },
      { id: 'd3-extrude', name: '文字挤出', tags: ['文字', '立体'], desc: '文字多层挤出并摆动，片头标题感。', cfg: { kind: 'extrude', text: 'FORGE' } },
      { id: 'd3-iso-stack', name: '等距层叠', tags: ['等距', '层叠'], desc: '等距板块逐层堆起，架构与图层叙事。', cfg: { kind: 'iso-stack' } },
      { id: 'd3-torus', name: '环面粒子', tags: ['环面', '甜甜圈'], desc: '环面粒子旋转，未来感几何。', cfg: { kind: 'torus' } },
      { id: 'd3-ribbon', name: '3D 缎带', tags: ['缎带', '流动'], desc: '三条立体缎带交织流动，舞台背景。', cfg: { kind: 'ribbon' } },
      { id: 'd3-stairs', name: '螺旋阶梯', tags: ['阶梯', '上升'], desc: '阶梯逐级升起，成长与进阶叙事。', cfg: { kind: 'stairs' } },
      { id: 'd3-pyramid', name: '金字塔', tags: ['金字塔', '面'], desc: '四棱锥旋转并按面着色，稳定感。', cfg: { kind: 'pyramid' } },
      { id: 'd3-box-tunnel', name: '盒子隧道', tags: ['隧道', '穿越'], desc: '方框隧道向观者穿越，纵深感强。', cfg: { kind: 'box-tunnel' } },
      { id: 'd3-wire-globe', name: '线框地球', tags: ['地球', '线框'], desc: '线框经纬地球缓慢自转。', cfg: { kind: 'wire-globe' } },
      { id: 'd3-cyl', name: '圆柱扫描', tags: ['圆柱', '扫描'], desc: '圆柱旋转伴随扫描环升降，扫描仪质感。', cfg: { kind: 'cyl' } },
      { id: 'd3-flip-panels', name: '翻板墙', tags: ['翻板', '波浪'], desc: '翻板墙波浪式翻转，媒体墙效果。', cfg: { kind: 'flip-panels' } }
    ]
  });
})();
