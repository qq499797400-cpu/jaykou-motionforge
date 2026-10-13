/* ==========================================================================
   Jaykou 动效库 · 20
   原语：天气氛围 / 办公效率 / 弹幕字幕 / 节日庆典
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：天气氛围 ══════════════════════════ */

  var WX_PARAMS = [
    P('kind', '天气', 'rain', sel('rain', [
      ['rain', '下雨'], ['drizzle', '细雨'], ['snow', '下雪'], ['snow-heavy', '鹅毛大雪'],
      ['sun', '晴天太阳'], ['sun-rays', '阳光射线'], ['clouds', '云朵飘'], ['storm', '雷暴'],
      ['fog', '雾气'], ['rainbow', '彩虹'], ['wind', '大风'], ['leaves', '落叶'],
      ['stars-night', '星空'], ['moon', '月亮'], ['hail', '冰雹'], ['dew', '露珠']
    ])),
    P('text', '文字', 'STAY COZY', txt('STAY COZY')),
    P('size', '基准尺寸', 300.0, rng(300.0, 140.0, 728.0, 4.0)),
    P('density', '密度', 40, rng(40, 8, 90, 1)),
    P('speed', '速度', 1, rng(1, 0.3, 2.4, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function wxDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var n = Math.max(6, Math.round(p.density));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    var isRainy = kind === 'rain' || kind === 'drizzle' || kind === 'storm' || kind === 'hail';
    var isSnowy = kind === 'snow' || kind === 'snow-heavy';
    if (isRainy || isSnowy || kind === 'leaves' || kind === 'stars-night') {
      for (var i = 0; i < n; i++) {
        var ix = W * U.rnd(-0.05, 1.05, i);
        var iv = 0.4 + U.rnd(0, 1, i + 40);
        var per;
        var sz;
        if (isRainy) { per = H * 1.3; sz = kind === 'hail' ? R * 0.02 : R * 0.012; }
        else if (isSnowy) { per = H * 1.4; sz = R * (kind === 'snow-heavy' ? 0.035 : 0.02) * (0.6 + U.rnd(0, 0.7, i + 7)); }
        else if (kind === 'leaves') { per = H * 1.6; sz = R * 0.03; }
        else { per = 1; sz = R * 0.012 * (0.4 + U.rnd(0, 1, i + 3)); }
        var cyc = ((tt * (isRainy ? 1.6 : 0.32) * iv + U.rnd(0, 1, i + 11)) % 1);
        var yy = isRainy ? U.lerp(-H * 0.15, H * 1.15, cyc) : U.lerp(-H * 0.1, H * 1.1, cyc);
        var sway = isSnowy ? Math.sin(tt * 1.4 + i) * 40 * S : kind === 'leaves' ? Math.sin(tt * 2 + i * 1.7) * 70 * S : 0;
        var alpha = isSnowy || kind === 'leaves' ? Math.sin(cyc * Math.PI) : (kind === 'stars-night' ? 0.35 + 0.6 * Math.abs(U.noise(i * 2.3, tt * 2.2)) : 0.65);
        if (kind === 'stars-night') {
          var sy = H * U.rnd(0.05, 0.55, i + 5);
          var twk = Math.abs(U.noise(i * 3.1, tt * 1.8));
          glowOn('#FFFFFF', p.glow * twk * 0.7);
          ctx.beginPath(); ctx.arc(ix, sy, sz * (0.5 + twk), 0, Math.PI * 2);
          ctx.fillStyle = U.rgba('#FFFFFF', 0.3 + twk * 0.7);
          ctx.fill();
          ctx.shadowBlur = 0;
          continue;
        }
        if (kind === 'hail') {
          ctx.beginPath(); ctx.arc(ix + sway, yy, sz, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.5), alpha * 0.9);
          ctx.fill();
        } else if (kind === 'leaves') {
          ctx.save();
          ctx.translate(ix + sway, yy);
          ctx.rotate(tt * 2.4 + i);
          ctx.beginPath();
          ctx.ellipse(0, 0, sz * 1.6, sz * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.mix(U.mix(col, U.accent2, (i % 4) / 4), '#E8A33D', 0.4), alpha * 0.95);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.moveTo(ix, yy);
          ctx.lineTo(ix + (isRainy ? sz * 0.18 : 0), yy + (isRainy ? R * 0.06 : sz * 2));
          ctx.lineWidth = isRainy ? 2.2 * S : sz;
          ctx.lineCap = 'round';
          ctx.strokeStyle = U.rgba(isSnowy ? '#FFFFFF' : U.mix(col, U.ink, 0.35), alpha * 0.85);
          ctx.stroke();
        }
      }
    }
    if (kind === 'sun' || kind === 'sun-rays' || kind === 'moon') {
      var breathe = 1 + Math.sin(tt * 1.8) * 0.03;
      var orbR = R * 0.42 * breathe;
      var oy = kind === 'moon' ? cy - R * 0.1 : cy - R * 0.05;
      glowOn(kind === 'moon' ? U.mix(col, U.ink, 0.6) : col, p.glow);
      ctx.beginPath(); ctx.arc(cx, oy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(kind === 'moon' ? U.mix(col, U.ink, 0.5) : U.mix(col, '#FFD25D', 0.45), 0.98);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (kind === 'sun-rays') {
        for (var ri = 0; ri < 12; ri++) {
          var ra = (ri / 12) * Math.PI * 2 + tt * 0.24;
          var rlen = orbR * (1.28 + 0.14 * Math.sin(tt * 2.2 + ri));
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ra) * orbR * 1.12, oy + Math.sin(ra) * orbR * 1.12);
          ctx.lineTo(cx + Math.cos(ra) * rlen * 1.35, oy + Math.sin(ra) * rlen * 1.35);
          ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
          ctx.strokeStyle = U.rgba(U.mix(col, '#FFD25D', 0.4), 0.6);
          ctx.stroke();
        }
      }
      if (kind === 'moon') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(cx + orbR * 0.42, oy - orbR * 0.3, orbR * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    if (kind === 'clouds' || kind === 'storm' || kind === 'fog' || kind === 'rain' || kind === 'drizzle' || kind === 'snow' || kind === 'snow-heavy' || kind === 'hail' || kind === 'sun') {
      var clouds = kind === 'fog' ? 4 : 3;
      for (var ci = 0; ci < clouds; ci++) {
        var cxx = ((tt * (14 + ci * 9) * S + ci * W * 0.42) % (W + R * 1.6)) - R * 0.8;
        var cyy = H * (0.16 + ci * 0.1) + Math.sin(tt * 0.8 + ci) * 8 * S;
        var cs = R * (0.2 + ci * 0.04);
        ctx.beginPath();
        for (var bi = 0; bi < 5; bi++) {
          var ba = (bi / 5) * Math.PI * 2;
          var br = cs * (0.75 + 0.3 * Math.abs(U.noise(bi + ci * 7, 3)));
          var bx = cxx + Math.cos(ba) * br * 1.3;
          var by = cyy + Math.sin(ba) * br * 0.55;
          if (!bi) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fillStyle = U.rgba(kind === 'storm' ? '#2A2F3C' : U.mix(U.bg2, U.ink, 0.14), kind === 'fog' ? 0.35 : 0.85);
        ctx.fill();
      }
    }
    if (kind === 'storm') {
      var strike = (tt * 0.8) % 1;
      if (strike < 0.22) {
        var sk = U.clamp(strike / 0.1, 0, 1) * U.clamp((0.22 - strike) / 0.1, 0, 1);
        var lx = W * U.rnd(0.3, 0.7, Math.floor(tt * 0.8));
        glowOn('#FFFFFF', p.glow);
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        var ly2 = 0;
        for (var seg = 0; seg < 6; seg++) {
          ly2 += H * 0.09 * (0.7 + U.rnd(0, 0.6, seg + Math.floor(tt * 3)));
          var lx2 = lx + (seg % 2 ? 1 : -1) * W * 0.018 * U.rnd(0.4, 1.4, seg + 3);
          ctx.lineTo(lx2, ly2);
        }
        ctx.lineWidth = 4 * S;
        ctx.strokeStyle = U.rgba('#FFFFFF', 0.95 * sk);
        ctx.stroke();
        ctx.fillStyle = U.rgba('#FFFFFF', 0.08 * sk);
        ctx.fillRect(0, 0, W, H);
      }
    }
    if (kind === 'rainbow') {
      var rbk = e.outCubic(U.clamp(tt / 1.6, 0, 1));
      var bands = ['#FF6A5D', '#FFB45D', '#FFE45D', '#5DFF8F', '#5DC9FF', '#B45DFF'];
      for (var bi2 = 0; bi2 < bands.length; bi2++) {
        ctx.beginPath();
        ctx.arc(cx, cy + R * 0.55, R * (0.95 - bi2 * 0.075), Math.PI, Math.PI + Math.PI * rbk);
        ctx.lineWidth = R * 0.07;
        ctx.strokeStyle = U.rgba(bands[bi2], 0.85);
        ctx.stroke();
      }
    }
    if (kind === 'wind') {
      for (var wi = 0; wi < 7; wi++) {
        var wy = H * U.rnd(0.15, 0.85, wi);
        var wx0 = ((tt * (200 + wi * 60) * S) % (W * 1.4)) - W * 0.2;
        ctx.beginPath();
        ctx.moveTo(wx0 - R * 0.3, wy);
        ctx.quadraticCurveTo(wx0, wy - 14 * S, wx0 + R * 0.3, wy);
        ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
        ctx.strokeStyle = U.rgba(U.ink, 0.3);
        ctx.stroke();
      }
    }
    if (kind === 'dew') {
      for (var di = 0; di < n * 0.6; di++) {
        var dx = W * U.rnd(0.15, 0.85, di * 2), dy = H * U.rnd(0.3, 0.8, di * 2 + 1);
        var wobble = Math.sin(tt * 2 + di * 2) * 0.12;
        glowOn(col, p.glow * 0.3);
        ctx.beginPath();
        ctx.ellipse(dx, dy + wobble * 8 * S, R * 0.022, R * 0.03, 0, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.5), 0.75);
        ctx.fill();
      }
    }
    if (p.text) {
      var tk = e.outCubic(U.clamp((tt - 0.7) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.2 * tk, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.92 * tk);
      ctx.fillText(String(p.text), cx, kind === 'sun' || kind === 'moon' ? cy + R * 0.95 : cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：办公效率 ══════════════════════════ */

  var WORK_PARAMS = [
    P('kind', '形态', 'todo-check', sel('todo-check', [
      ['todo-check', '清单打勾'], ['calendar-pop', '日程弹出'], ['timer-ring', '计时环'],
      ['pomodoro', '番茄钟'], ['kanban', '看板移动'], ['mail-send', '邮件发送'],
      ['bell-ring', '提醒铃铛'], ['rocket-launch', '火箭发射'], ['trophy', '达成奖杯'],
      ['target-hit', '目标命中'], ['clipboard', '剪贴板复制'], ['files-sync', '文件同步']
    ])),
    P('text', '事项', '完成周报', txt('完成周报')),
    P('size', '基准尺寸', 1232, rng(1232, 1725, 1725, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function workDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    function check(x, y, s2, k, c) {
      ctx.beginPath();
      ctx.moveTo(x - s2 * 0.42, y);
      ctx.lineTo(x - s2 * 0.1, y + s2 * 0.3 * Math.min(1, k * 2));
      if (k > 0.45) ctx.lineTo(x + s2 * 0.45 * U.clamp((k - 0.45) / 0.55, 0, 1), y - s2 * 0.3 * U.clamp((k - 0.45) / 0.55, 0, 1));
      ctx.lineWidth = s2 * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = c;
      ctx.stroke();
    }

    if (kind === 'todo-check') {
      var rows = Math.min(4, Math.max(2, Math.round(label.split(/[,，|]/).length) || 3));
      var items = label.split(/[,，|]/).filter(Boolean);
      if (items.length < 2) items = [label, '下一步计划', '复盘归档'];
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var i = 0; i < Math.min(items.length, 4); i++) {
        var iy = cy - R * 0.34 + i * (R * 0.68 / Math.min(items.length, 4));
        var ik = e.outCubic(U.clamp((tt - 0.4 - i * 0.5) / 0.5, 0, 1));
        if (ik <= 0.01) continue;
        ctx.save();
        ctx.translate(cx, iy);
        var done = ik > 0.5;
        U.rr(ctx, -R * 0.52, -R * 0.1, R * 1.04, R * 0.2, R * 0.06);
        ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
        ctx.beginPath(); ctx.arc(-R * 0.4, 0, R * 0.055 * Math.min(1, ik * 2), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(done ? col : U.ink, done ? 0.95 : 0.2);
        ctx.fill();
        if (done) check(-R * 0.4, 0, R * 0.07, (ik - 0.5) * 2, U.bg1);
        ctx.font = U.fs(R * 0.1, 700);
        ctx.fillStyle = U.rgba(U.ink, done ? 0.35 : 0.9);
        ctx.textAlign = 'left';
        ctx.fillText(items[i], -R * 0.28, 1);
        ctx.textAlign = 'center';
        ctx.restore();
      }
    } else if (kind === 'calendar-pop' || kind === 'clipboard') {
      var pop = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pop, pop);
      var cw = R * 0.9, ch = R * 0.8;
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch, ch * 0.1);
      ctx.fillStyle = U.rgba(U.bg2, 0.97); ctx.fill();
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch * 0.24, ch * 0.1);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.bg2, 0.9);
      ctx.fillRect(-cw * 0.12, -ch / 2 - ch * 0.06, cw * 0.07, ch * 0.12);
      ctx.fillRect(cw * 0.05, -ch / 2 - ch * 0.06, cw * 0.07, ch * 0.12);
      if (kind === 'calendar-pop') {
        var dnum = 1 + (Math.floor(tt) % 28);
        ctx.font = U.fs(ch * 0.34, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.92);
        ctx.fillText(String(dnum), 0, ch * 0.14);
        ctx.font = U.fs(ch * 0.1, 700);
        ctx.fillStyle = U.rgba(col, 0.9);
        ctx.fillText(label, 0, ch * 0.36);
      } else {
        ctx.fillStyle = U.rgba(U.ink, 0.25);
        for (var ln = 0; ln < 3; ln++) ctx.fillRect(-cw * 0.36, -ch * 0.1 + ln * ch * 0.16, cw * U.rnd(0.4, 0.72, ln), ch * 0.05);
      }
      ctx.restore();
    } else if (kind === 'timer-ring' || kind === 'pomodoro') {
      var total = kind === 'pomodoro' ? 25 : 60;
      var frac = (tt * 0.5) % 1;
      var remain = Math.round(total * (1 - frac));
      var breathe = kind === 'pomodoro' ? 1 + Math.pow(1 - (tt * 0.5 % 1), 2) * 0.05 : 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(frac > 0.85 ? col : U.ink, p.glow * 0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.4 * breathe, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - frac));
      ctx.lineWidth = R * 0.05 * S;
      ctx.strokeStyle = U.rgba(col, 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.4 * breathe, 0, Math.PI * 2);
      ctx.lineWidth = 2 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.stroke();
      ctx.font = U.fs(R * 0.22, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(remain + ':' + String(Math.floor((1 - frac) * 60) % 60).padStart(2, '0'), cx, cy);
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(kind === 'pomodoro' ? 'FOCUS · ' + label : label, cx, cy + R * 0.62);
    } else if (kind === 'kanban') {
      var cyc = (tt * 0.55) % 1;
      var colIdx = Math.min(2, Math.floor(cyc * 3));
      var inCol = cyc * 3 - colIdx;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var lanes = ['TODO', 'DOING', 'DONE'];
      for (var li = 0; li < 3; li++) {
        var lx = cx + (li - 1) * R * 0.62;
        U.rr(ctx, lx - R * 0.24, cy - R * 0.44, R * 0.48, R * 0.88, R * 0.06);
        ctx.fillStyle = U.rgba(U.bg2, 0.85); ctx.fill();
        ctx.font = U.fs(R * 0.075 * S, 800);
        ctx.fillStyle = U.rgba(li === colIdx ? col : U.ink, li === colIdx ? 0.95 : 0.35);
        ctx.fillText(lanes[li], lx, cy - R * 0.32);
      }
      var kx = U.lerp(cx - R * 0.62, cx + R * 0.62, U.clamp(cyc * 2.2 - 0.15, 0, 1));
      var ky = cy + R * 0.02 + Math.sin(cyc * Math.PI) * -R * 0.14;
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(Math.sin(cyc * Math.PI * 2) * 0.08);
      U.rr(ctx, -R * 0.2, -R * 0.11, R * 0.4, R * 0.22, R * 0.04);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.bg1, 0.35);
      ctx.fillRect(-R * 0.14, -R * 0.05, R * 0.28, R * 0.03);
      ctx.restore();
    } else if (kind === 'mail-send' || kind === 'bell-ring' || kind === 'files-sync') {
      var launch = e.outCubic(U.clamp((tt - 0.3) / 1.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'bell-ring') {
        var swing = Math.sin(tt * 7) * Math.exp(-tt * 1.2) * 0.4 + Math.sin(tt * 1.6) * 0.06;
        ctx.save();
        ctx.translate(cx, cy - R * 0.05);
        ctx.rotate(swing);
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.3);
        ctx.quadraticCurveTo(R * 0.26, -R * 0.28, R * 0.24, R * 0.08);
        ctx.lineTo(-R * 0.24, R * 0.08);
        ctx.quadraticCurveTo(-R * 0.26, -R * 0.28, 0, -R * 0.3);
        ctx.lineWidth = R * 0.045 * S;
        glowOn(col, p.glow);
        ctx.strokeStyle = U.rgba(col, 0.95);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, R * 0.16, R * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.restore();
        for (var ri2 = 0; ri2 < 2; ri2++) {
          ctx.beginPath();
          ctx.arc(cx, cy - R * 0.05, R * (0.34 + ri2 * 0.1), -0.7 - swing, -0.1 - swing);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(col, 0.5 - ri2 * 0.2);
          ctx.stroke();
        }
      } else if (kind === 'files-sync') {
        var arrow = (tt * 0.8) % 1;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(tt * 0.8);
        for (var ai = 0; ai < 2; ai++) {
          ctx.save();
          ctx.rotate(ai * Math.PI);
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.32, -0.4 + arrow * Math.PI * 0.6, 1.2 + arrow * Math.PI * 0.6);
          ctx.lineWidth = R * 0.05 * S; ctx.lineCap = 'round';
          ctx.strokeStyle = U.rgba(ai ? U.accent2 : col, 0.95);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(R * 0.32 * Math.cos(1.35 + arrow * Math.PI * 0.6), R * 0.32 * Math.sin(1.35 + arrow * Math.PI * 0.6));
          ctx.lineTo(R * 0.32 * Math.cos(1.35 + arrow * Math.PI * 0.6) + R * 0.08, R * 0.32 * Math.sin(1.35 + arrow * Math.PI * 0.6) + R * 0.02);
          ctx.lineTo(R * 0.32 * Math.cos(1.35 + arrow * Math.PI * 0.6) + R * 0.02, R * 0.32 * Math.sin(1.35 + arrow * Math.PI * 0.6) + R * 0.09);
          ctx.closePath();
          ctx.fillStyle = U.rgba(ai ? U.accent2 : col, 0.95);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      } else {
        var fy = U.lerp(cy + R * 0.2, cy - R * 0.5, launch);
        var fscale = 1 - launch * 0.3;
        ctx.save();
        ctx.translate(cx, fy);
        ctx.rotate(-0.12 + launch * 0.1);
        ctx.scale(fscale, fscale);
        ctx.beginPath();
        ctx.moveTo(-R * 0.3, -R * 0.16);
        ctx.lineTo(R * 0.3, -R * 0.16);
        ctx.lineTo(0, R * 0.14);
        ctx.closePath();
        ctx.lineWidth = R * 0.035 * S;
        ctx.lineJoin = 'round';
        glowOn(col, p.glow * 0.6);
        ctx.strokeStyle = U.rgba(col, 0.95);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-R * 0.3, -R * 0.16);
        ctx.lineTo(0, R * 0.05);
        ctx.lineTo(R * 0.3, -R * 0.16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-R * 0.28, -R * 0.14);
        ctx.lineTo(-R * 0.42 - launch * R * 0.2, -R * 0.05 + launch * R * 0.14);
        ctx.moveTo(R * 0.28, -R * 0.14);
        ctx.lineTo(R * 0.42 + launch * R * 0.2, -R * 0.05 + launch * R * 0.14);
        ctx.lineWidth = 2.4 * S;
        ctx.strokeStyle = U.rgba(col, 0.6);
        ctx.stroke();
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.75);
      ctx.fillText(label, cx, cy + R * 0.6);
    } else if (kind === 'rocket-launch' || kind === 'trophy' || kind === 'target-hit') {
      var lift = e.inOutCubic(U.clamp((tt - 0.3) / 1.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'rocket-launch') {
        var ry = cy + R * 0.4 - lift * R * 1.1;
        glowOn(col, p.glow * 0.6);
        ctx.save();
        ctx.translate(cx, ry);
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.4);
        ctx.quadraticCurveTo(R * 0.18, -R * 0.1, R * 0.14, R * 0.16);
        ctx.lineTo(-R * 0.14, R * 0.16);
        ctx.quadraticCurveTo(-R * 0.18, -R * 0.1, 0, -R * 0.4);
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.35), 0.98);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-R * 0.14, R * 0.02);
        ctx.lineTo(-R * 0.28, R * 0.22);
        ctx.lineTo(-R * 0.13, R * 0.16);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(R * 0.14, R * 0.02);
        ctx.lineTo(R * 0.28, R * 0.22);
        ctx.lineTo(R * 0.13, R * 0.16);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); ctx.arc(0, -R * 0.12, R * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.bg1, 0.9); ctx.fill();
        if (lift > 0.05 && lift < 0.98) {
          var flame = (Math.sin(tt * 30) * 0.2 + 1) * (1 - lift * 0.4);
          ctx.beginPath();
          ctx.moveTo(-R * 0.09, R * 0.17);
          ctx.quadraticCurveTo(0, R * (0.3 + 0.24 * flame), R * 0.09, R * 0.17);
          ctx.closePath();
          ctx.fillStyle = U.rgba(U.mix(col, '#FFD25D', 0.6), 0.9);
          ctx.fill();
        }
        ctx.restore();
      } else if (kind === 'trophy') {
        var tk = e.outBack(U.clamp((tt - 0.3) / 0.6, 0, 1));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(tk, tk);
        glowOn(U.mix(col, '#FFD25D', 0.5), p.glow);
        ctx.beginPath();
        ctx.moveTo(-R * 0.2, -R * 0.3);
        ctx.lineTo(R * 0.2, -R * 0.3);
        ctx.quadraticCurveTo(R * 0.24, R * 0.02, 0, R * 0.1);
        ctx.quadraticCurveTo(-R * 0.24, R * 0.02, -R * 0.2, -R * 0.3);
        ctx.fillStyle = U.rgba(U.mix(col, '#FFD25D', 0.55), 1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-R * 0.27, -R * 0.2, R * 0.09, 0, Math.PI * 2);
        ctx.arc(R * 0.27, -R * 0.2, R * 0.09, 0, Math.PI * 2);
        ctx.lineWidth = R * 0.03 * S;
        ctx.strokeStyle = U.rgba(U.mix(col, '#FFD25D', 0.55), 0.9);
        ctx.stroke();
        ctx.fillRect(-R * 0.045, R * 0.1, R * 0.09, R * 0.12);
        ctx.fillRect(-R * 0.13, R * 0.22, R * 0.26, R * 0.05);
        ctx.restore();
        for (var si = 0; si < 8; si++) {
          var sa = (si / 8) * Math.PI * 2 + tt;
          var sr2 = R * (0.42 + Math.sin(tt * 3 + si) * 0.04);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(sa) * sr2, cy + Math.sin(sa) * sr2, 3.4 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba('#FFE45D', 0.7);
          ctx.fill();
        }
      } else {
        var hitK = (tt * 0.7) % 1;
        var aim = 1 - Math.pow(Math.min(1, hitK * 3), 2);
        glowOn(col, p.glow);
        for (var ri3 = 3; ri3 >= 1; ri3--) {
          ctx.beginPath();
          ctx.arc(cx, cy, R * 0.1 * ri3 * aim, 0, Math.PI * 2);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(col, ri3 === 1 ? 0.95 : 0.4);
          ctx.stroke();
        }
        var hitNow = hitK > 0.4;
        ctx.beginPath(); ctx.arc(cx, cy, R * (hitNow ? 0.06 : 0.03), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(hitNow ? col : U.ink, 0.98); ctx.fill();
        if (hitNow) {
          var bk = e.outCubic((hitK - 0.4) / 0.6);
          for (var hi = 0; hi < 8; hi++) {
            var ha = (hi / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ha) * R * 0.1, cy + Math.sin(ha) * R * 0.1);
            ctx.lineTo(cx + Math.cos(ha) * R * (0.14 + 0.2 * bk), cy + Math.sin(ha) * R * (0.14 + 0.2 * bk));
            ctx.lineWidth = 3.4 * S;
            ctx.strokeStyle = U.rgba(col, (1 - bk) * 0.9);
            ctx.stroke();
          }
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText(label, cx, cy + R * 0.72);
    } else {
      ctx.font = U.fs(R * 0.16, 900);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语三：弹幕字幕 ══════════════════════════ */

  var DM_PARAMS = [
    P('kind', '形态', 'danmaku', sel('danmaku', [
      ['danmaku', '滚动弹幕'], ['danmaku-top', '顶部弹幕'], ['subtitle', '底部字幕条'],
      ['caption-pop', '气泡字幕'], ['live-heat', '直播间热度'], ['quiz', '答题弹幕'],
      ['reply', '回复串'], ['watermark', '平铺水印'], ['ping', '坐标标记'], ['chapter', '章节标题']
    ])),
    P('text', '弹幕内容', '前方高能,名场面来了,哈哈哈哈,泪目,收藏了', txt('前方高能,名场面来了,哈哈哈哈,泪目,收藏了', true)),
    P('size', '字号', 44.0, rng(44.0, 259, 110.0, 1.0)),
    P('speed', '速度', 1, rng(1, 0.3, 2.4, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.3, rng(0.3, 0, 1, 0.05))
  ];

  function dmDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var col = p.ink2;
    var kind = p.kind;
    var pool = String(p.text || '').split(/[,，|]/).filter(Boolean);
    if (!pool.length) pool = ['前方高能', '名场面'];
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    ctx.save();
    ctx.textBaseline = 'middle';

    if (kind === 'danmaku' || kind === 'quiz' || kind === 'reply') {
      var lanes = 7;
      ctx.font = U.fs(fs * 0.8, 700);
      for (var i = 0; i < pool.length * 3; i++) {
        var lane = i % lanes;
        var txtv = pool[i % pool.length];
        if (kind === 'reply' && i % 2) txtv = '↳ ' + txtv;
        if (kind === 'quiz' && i % 3 === 0) txtv = 'A. ' + txtv;
        var w2 = ctx.measureText(txtv).width;
        var laneSpeed = (0.6 + (lane % 3) * 0.22) * sp;
        var x0 = ((tt * 420 * S * laneSpeed + i * W * 0.37) % (W + w2 * 2)) - w2;
        var y0 = H * 0.12 + lane * (H * 0.76 / (lanes - 1));
        ctx.globalAlpha = x0 < -w2 * 0.5 ? 0 : 0.92;
        if (kind === 'quiz' && i % 3 === 0) {
          U.rr(ctx, x0 - 12 * S, y0 - fs * 0.62, w2 + 24 * S, fs * 1.24, fs * 0.3);
          ctx.fillStyle = U.rgba(col, 0.2);
          ctx.fill();
        }
        ctx.fillStyle = U.rgba(i % 4 === 0 ? col : U.mix(U.ink, '#FFFFFF', 0.2), 1);
        ctx.fillText(txtv, x0, y0);
      }
      ctx.globalAlpha = 1;
    } else if (kind === 'danmaku-top') {
      ctx.font = U.fs(fs * 0.9, 800);
      var cur = pool[Math.floor(tt / 2.2) % pool.length];
      var w3 = ctx.measureText(cur).width + 44 * S;
      var inK = e.outBack(U.clamp((tt % 2.2) / 0.4, 0, 1));
      var outK = U.clamp((2.2 - (tt % 2.2)) / 0.3, 0, 1);
      ctx.save();
      ctx.translate(W / 2, H * 0.14);
      ctx.scale(inK * outK, inK * outK);
      U.rr(ctx, -w3 / 2, -fs * 0.75, w3, fs * 1.5, fs * 0.4);
      ctx.fillStyle = U.rgba(U.bg2, 0.88); ctx.fill();
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(cur, 0, 0);
      ctx.restore();
    } else if (kind === 'subtitle' || kind === 'caption-pop') {
      var seg = Math.floor(tt / 1.4) % pool.length;
      var sk = e.outCubic(U.clamp((tt % 1.4) / 0.3, 0, 1));
      var so = U.clamp((1.4 - (tt % 1.4)) / 0.25, 0, 1);
      var txtv2 = pool[seg];
      ctx.font = U.fs(fs * 0.85, 700);
      var w4 = ctx.measureText(txtv2).width;
      if (kind === 'subtitle') {
        ctx.globalAlpha = sk * so;
        U.rr(ctx, cx - w4 / 2 - 26 * S, H * 0.78 - fs * 0.7, w4 + 52 * S, fs * 1.4, fs * 0.2);
        ctx.fillStyle = U.rgba(U.bg1, 0.72); ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.96);
        ctx.fillText(txtv2, cx, H * 0.78);
      } else {
        ctx.save();
        ctx.translate(cx, H * 0.7);
        ctx.scale(sk * so, sk * so);
        U.rr(ctx, -w4 / 2 - 24 * S, -fs * 0.72, w4 + 48 * S, fs * 1.44, fs * 0.4);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-14 * S, fs * 0.7);
        ctx.lineTo(0, fs * 1.02);
        ctx.lineTo(14 * S, fs * 0.7);
        ctx.closePath();
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.fillStyle = U.rgba(U.bg1, 0.96);
        ctx.fillText(txtv2, 0, 0);
        ctx.restore();
      }
    } else if (kind === 'live-heat') {
      var heat = 0.5 + 0.5 * Math.sin(tt * 1.8) + 0.18 * Math.abs(U.noise(tt * 3, 1));
      ctx.font = U.fs(fs * 0.7, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.textAlign = 'left';
      ctx.fillText('● LIVE', W * 0.08, H * 0.14);
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(base2()) + ' 人气', W * 0.92, H * 0.14);
      ctx.textAlign = 'center';
      function base2() { return 12000 + heat * 8000; }
      ctx.fillStyle = U.rgba(col, 0.15);
      ctx.fillRect(W * 0.08, H * 0.2, W * 0.84, 10 * S);
      glowOn(col, p.glow);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillRect(W * 0.08, H * 0.2, W * 0.84 * U.clamp(heat, 0, 1), 10 * S);
      for (var li2 = 0; li2 < 4; li2++) {
        var dmk = pool[(li2 + Math.floor(tt)) % pool.length];
        var dx2 = ((tt * 300 * S + li2 * W * 0.4) % (W * 1.3)) - W * 0.15;
        ctx.font = U.fs(fs * 0.62, 700);
        ctx.fillStyle = U.rgba(li2 % 2 ? U.accent2 : U.mix(U.ink, '#FFFFFF', 0.2), 0.85);
        ctx.fillText(dmk, dx2, H * (0.4 + li2 * 0.14));
      }
    } else if (kind === 'watermark') {
      ctx.font = U.fs(fs * 0.62, 800);
      for (var wx2 = 0; wx2 < 5; wx2++) {
        for (var wy2 = 0; wy2 < 4; wy2++) {
          ctx.save();
          ctx.translate(W * (0.1 + wx2 * 0.2), H * (0.14 + wy2 * 0.24));
          ctx.rotate(-0.3);
          ctx.fillStyle = U.rgba(U.ink, 0.08);
          ctx.fillText(String(p.text || 'JAYKOU').split(/[,，|]/)[0] || 'MF', 0, 0);
          ctx.restore();
        }
      }
      ctx.font = U.fs(fs * 0.8, 800);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(pool[0], cx, cy);
    } else if (kind === 'ping') {
      var pk = (tt * 0.8) % pool.length;
      var idx = Math.floor(pk);
      var px = W * U.rnd(0.2, 0.8, idx + 3), py = H * U.rnd(0.25, 0.7, idx + 9);
      var fk = e.outBack(U.clamp((pk % 1) / 0.3, 0, 1)) * U.clamp((1 - (pk % 1)) / 0.12, 0, 1);
      ctx.beginPath(); ctx.arc(px, py, 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      for (var pi = 0; pi < 2; pi++) {
        var pp = ((tt * 0.9) + pi * 0.5) % 1;
        ctx.beginPath(); ctx.arc(px, py, 12 * S + pp * 40 * S, 0, Math.PI * 2);
        ctx.lineWidth = 2.6 * S * (1 - pp);
        ctx.strokeStyle = U.rgba(col, (1 - pp) * 0.7);
        ctx.stroke();
      }
      if (fk > 0.01) {
        ctx.font = U.fs(fs * 0.62, 700);
        var tw5 = ctx.measureText(pool[idx]).width + 30 * S;
        U.rr(ctx, px + 14 * S, py - fs * 0.8 * fk, tw5 * fk, fs * 1.2, fs * 0.3);
        ctx.fillStyle = U.rgba(U.bg2, 0.92 * fk); ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.95 * fk);
        ctx.fillText(pool[idx], px + 14 * S + tw5 / 2, py - fs * 0.2 * fk);
      }
    } else if (kind === 'chapter') {
      var num = Math.floor(tt / 1.6) % 5 + 1;
      var nk = e.outCubic(U.clamp((tt % 1.6) / 0.5, 0, 1));
      var no = U.clamp((1.6 - (tt % 1.6)) / 0.3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(nk * no, nk * no);
      ctx.font = U.fs(fs * 2.1, 900);
      ctx.fillStyle = U.rgba(col, 0.16);
      ctx.fillText('0' + num, 0, 0);
      ctx.font = U.fs(fs * 0.9, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.96);
      ctx.fillText(pool[(num - 1) % pool.length], 0, fs * 0.15);
      ctx.beginPath();
      ctx.moveTo(-fs * 1.4 * nk, fs * 0.85);
      ctx.lineTo(fs * 1.4 * nk, fs * 0.85);
      ctx.lineWidth = 4 * S;
      ctx.strokeStyle = U.rgba(col, 0.85);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.font = U.fs(fs, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(pool[0], cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语四：节日庆典 ══════════════════════════ */

  var FEST_PARAMS = [
    P('kind', '形态', 'confetti', sel('confetti', [
      ['confetti', '彩带礼炮'], ['balloon', '气球升起'], ['firework', '烟花绽放'],
      ['gift-open', '礼物开箱'], ['cake', '蛋糕蜡烛'], ['lantern', '灯笼升起'],
      ['bunting', '三角彩旗'], ['cheers', '碰杯庆祝'], ['sparkle', '星光点缀'], ['party-count', '倒数开场']
    ])),
    P('text', '祝福语', 'HAPPY 2026', txt('HAPPY 2026')),
    P('size', '基准尺寸', 300.0, rng(300.0, 140.0, 728.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  function festDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 26 * S * amt; }
    }
    function palette(i) { return [col, U.accent2, '#FFD25D', '#5DFF8F', '#FF6A9D'][i % 5]; }

    if (kind === 'confetti' || kind === 'party-count') {
      if (kind === 'party-count') {
        var cd = 3 - Math.floor(tt) % 4;
        var frac = 1 - (tt % 1);
        var popK = Math.pow(frac, 3);
        glowOn(col, p.glow * (0.3 + popK * 0.7));
        ctx.font = U.fs(R * (0.6 + popK * 0.2), 900);
        ctx.fillStyle = U.rgba(cd <= 0 ? col : U.ink, U.clamp(tt * 3, 0, 1));
        ctx.fillText(cd <= 0 ? '🎉' : String(cd), cx, cy);
      }
      for (var i = 0; i < 60; i++) {
        var delay = U.rnd(0, 1.2, i);
        var cyc = ((tt * 0.55 + delay) % 1);
        var px = W * U.rnd(0.06, 0.94, i + 20) + Math.sin(tt * 2 + i) * 26 * S;
        var py = U.lerp(-H * 0.08, H * 1.12, cyc);
        var sz = R * (0.014 + U.rnd(0, 0.02, i + 3));
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tt * 3 * (i % 2 ? 1 : -1) + i);
        ctx.fillStyle = U.rgba(palette(i), Math.sin(cyc * Math.PI) * 0.95);
        ctx.fillRect(-sz, -sz * 0.4, sz * 2, sz * 0.8);
        ctx.restore();
      }
      var tk = e.outBack(U.clamp((tt - 0.5) / 0.6, 0, 1));
      if (kind === 'confetti' && tk > 0.01) {
        glowOn(col, p.glow);
        ctx.font = U.fs(R * 0.34 * tk, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.98);
        ctx.fillText(label, cx, cy);
      }
    } else if (kind === 'balloon' || kind === 'lantern') {
      var n2 = kind === 'balloon' ? 8 : 7;
      for (var bi = 0; bi < n2; bi++) {
        var per = 1.6 + U.rnd(0, 0.8, bi);
        var cyc2 = ((tt / per + U.rnd(0, 1, bi)) % 1);
        var bxx = W * U.rnd(0.12, 0.88, bi) + Math.sin(tt * 1.2 + bi * 2) * 30 * S;
        var byy = U.lerp(H * 1.15, -H * 0.2, cyc2);
        var bs = R * (0.1 + U.rnd(0, 0.08, bi + 5));
        ctx.globalAlpha = Math.sin(cyc2 * Math.PI) * 0.95;
        if (kind === 'balloon') {
          glowOn(palette(bi), p.glow * 0.35);
          ctx.beginPath();
          ctx.ellipse(bxx, byy, bs, bs * 1.22, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(palette(bi), 0.92);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(bxx, byy + bs * 1.22);
          ctx.quadraticCurveTo(bxx + Math.sin(tt * 2 + bi) * 8 * S, byy + bs * 1.7, bxx, byy + bs * 2.1);
          ctx.lineWidth = 1.6 * S;
          ctx.strokeStyle = U.rgba(U.ink, 0.4);
          ctx.stroke();
        } else {
          glowOn('#FF9D45', p.glow * 0.5);
          ctx.beginPath();
          ctx.moveTo(bxx - bs * 0.7, byy - bs * 0.4);
          ctx.quadraticCurveTo(bxx - bs * 0.75, byy + bs * 0.5, bxx, byy + bs * 0.62);
          ctx.quadraticCurveTo(bxx + bs * 0.75, byy + bs * 0.5, bxx + bs * 0.7, byy - bs * 0.4);
          ctx.quadraticCurveTo(bxx + bs * 0.5, byy - bs * 0.95, bxx, byy - bs * 0.95);
          ctx.quadraticCurveTo(bxx - bs * 0.5, byy - bs * 0.95, bxx - bs * 0.7, byy - bs * 0.4);
          ctx.closePath();
          ctx.fillStyle = U.rgba('#FF9D45', 0.9);
          ctx.fill();
          ctx.fillStyle = U.rgba('#FFB35D', 0.9);
          ctx.beginPath(); ctx.arc(bxx, byy, bs * 0.3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      var tk2 = e.outCubic(U.clamp((tt - 0.8) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.22 * tk2, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95 * tk2);
      ctx.fillText(label, cx, cy + R * 0.4);
    } else if (kind === 'firework') {
      var burst = (tt * 0.55) % 1;
      var fxx = W * U.rnd(0.25, 0.75, Math.floor(tt * 0.55));
      var fyy = H * U.rnd(0.22, 0.5, Math.floor(tt * 0.55) + 7);
      var rise = U.clamp(burst / 0.28, 0, 1);
      var explode = U.clamp((burst - 0.28) / 0.72, 0, 1);
      if (explode <= 0) {
        ctx.beginPath();
        ctx.moveTo(fxx, U.lerp(H * 1.05, fyy, e.outCubic(rise)));
        ctx.lineWidth = 3.4 * S; ctx.lineCap = 'round';
        ctx.strokeStyle = U.rgba('#FFE45D', 0.95);
        ctx.stroke();
      } else {
        glowOn(palette(Math.floor(tt * 0.55)), p.glow);
        var rays = 26;
        for (var ri2 = 0; ri2 < rays; ri2++) {
          var ra = (ri2 / rays) * Math.PI * 2;
          var rr2 = R * (0.12 + 0.5 * e.outCubic(explode)) * (0.8 + 0.3 * U.rng(ri2));
          ctx.beginPath();
          ctx.arc(fxx + Math.cos(ra) * rr2, fyy + Math.sin(ra) * rr2, 3.4 * S * (1 - explode * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(ri2 % 3 ? palette(Math.floor(tt * 0.55)) : '#FFFFFF', (1 - explode) * 0.95);
          ctx.fill();
        }
      }
      var tk3 = e.outCubic(U.clamp((tt - 0.6) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.24 * tk3, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95 * tk3);
      ctx.fillText(label, cx, cy + R * 0.75);
    } else if (kind === 'gift-open' || kind === 'cheers') {
      var openK = e.outBack(U.clamp((tt - 0.4) / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'gift-open') {
        var bw = R * 0.6, bh = R * 0.44;
        var lidLift = U.clamp((openK - 0.3) / 0.7, 0, 1);
        U.rr(ctx, cx - bw / 2, cy - bh * 0.1, bw, bh, bh * 0.08);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        ctx.save();
        ctx.translate(cx - bw / 2, cy - bh * 0.1);
        ctx.rotate(-lidLift * 0.9);
        ctx.fillRect(0, -bh * 0.22, bw * 0.52, bh * 0.2);
        ctx.restore();
        ctx.save();
        ctx.translate(cx + bw / 2, cy - bh * 0.1);
        ctx.rotate(lidLift * 0.9);
        ctx.fillRect(-bw * 0.52, -bh * 0.22, bw * 0.52, bh * 0.2);
        ctx.restore();
        if (lidLift > 0.1) {
          for (var gi = 0; gi < 8; gi++) {
            var gk = U.clamp((lidLift - 0.1 - gi * 0.05) / 0.5, 0, 1);
            if (gk <= 0.01) continue;
            var ga = -Math.PI / 2 + (gi - 3.5) * 0.3;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ga) * R * 0.34 * gk, cy - bh * 0.2 + Math.sin(ga) * R * 0.3 * gk, R * 0.035, 0, Math.PI * 2);
            ctx.fillStyle = U.rgba(palette(gi), 0.95 * (1 - gk * 0.4));
            ctx.fill();
          }
        }
      } else {
        for (var gi2 = -1; gi2 <= 1; gi2 += 2) {
          ctx.save();
          ctx.translate(cx + gi2 * R * 0.24, cy);
          ctx.rotate(gi2 * (0.2 - (1 - openK) * 0.5));
          ctx.beginPath();
          ctx.moveTo(-R * 0.07, -R * 0.3);
          ctx.quadraticCurveTo(R * 0.1, -R * 0.3, R * 0.09, R * 0.1);
          ctx.lineTo(-R * 0.09, R * 0.1);
          ctx.quadraticCurveTo(-R * 0.1, -R * 0.3, -R * 0.07, -R * 0.3);
          ctx.closePath();
          ctx.fillStyle = U.rgba(gi2 < 0 ? col : U.accent2, 0.92);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-R * 0.07, -R * 0.32, R * 0.05, Math.PI * 0.8, Math.PI * 1.9);
          ctx.lineWidth = R * 0.03 * S;
          ctx.strokeStyle = U.rgba(U.mix(gi2 < 0 ? col : U.accent2, U.ink, 0.3), 0.8);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.font = U.fs(R * 0.14 * e.outCubic(U.clamp((tt - 0.9) / 0.4, 0, 1)), 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.62);
    } else if (kind === 'cake' || kind === 'sparkle') {
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      if (kind === 'cake') {
        var cw2 = R * 0.7, ch2 = R * 0.2;
        U.rr(ctx, cx - cw2 / 2, cy + R * 0.1, cw2, ch2, ch2 * 0.3);
        ctx.fillStyle = U.rgba(U.mix(col, '#FFD25D', 0.4), 0.95); ctx.fill();
        U.rr(ctx, cx - cw2 * 0.38 / 2, cy - R * 0.08, cw2 * 0.38, ch2 * 0.9, ch2 * 0.28);
        ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
        for (var ci = 0; ci < 3; ci++) {
          var cxx = cx + (ci - 1) * R * 0.14;
          var flick2 = 0.75 + 0.25 * Math.sin(tt * 9 + ci * 2);
          glowOn('#FFD25D', p.glow);
          ctx.beginPath();
          ctx.ellipse(cxx, cy - R * 0.22, R * 0.032 * flick2, R * 0.05 * flick2, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba('#FFD25D', 0.98); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = U.rgba(U.ink, 0.6);
          ctx.fillRect(cxx - 1.5 * S, cy - R * 0.16, 3 * S, R * 0.08);
        }
      } else {
        for (var si2 = 0; si2 < 14; si2++) {
          var twk2 = Math.abs(U.noise(si2 * 2.7, tt * 2.4));
          if (twk2 < 0.3) continue;
          var sx4 = W * U.rnd(0.1, 0.9, si2), sy4 = H * U.rnd(0.12, 0.85, si2 + 4);
          var ss = R * 0.03 * twk2;
          glowOn(palette(si2), p.glow * twk2);
          ctx.beginPath();
          ctx.moveTo(sx4, sy4 - ss * 2);
          ctx.quadraticCurveTo(sx4, sy4, sx4 + ss * 2, sy4);
          ctx.quadraticCurveTo(sx4, sy4, sx4, sy4 + ss * 2);
          ctx.quadraticCurveTo(sx4, sy4, sx4 - ss * 2, sy4);
          ctx.quadraticCurveTo(sx4, sy4, sx4, sy4 - ss * 2);
          ctx.fillStyle = U.rgba(palette(si2), twk2);
          ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.18 * e.outCubic(U.clamp((tt - 0.7) / 0.5, 0, 1)), 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(label, cx, cy + R * 0.72);
    } else if (kind === 'bunting') {
      var sway = Math.sin(tt * 1.6) * 0.06;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.14);
      ctx.quadraticCurveTo(cx, H * 0.22, W, H * 0.14);
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.5);
      ctx.stroke();
      var flags = 12;
      for (var fi = 0; fi < flags; fi++) {
        var fx = W * (0.04 + fi * 0.92 / (flags - 1));
        var fy = H * (0.14 + 0.08 * Math.sin(Math.PI * fi / (flags - 1))) + Math.sin(tt * 2 + fi) * 4 * S;
        ctx.beginPath();
        ctx.moveTo(fx - R * 0.05, fy);
        ctx.lineTo(fx + R * 0.05, fy);
        ctx.lineTo(fx, fy + R * 0.14 + sway * R * 0.4);
        ctx.closePath();
        ctx.fillStyle = U.rgba(palette(fi), 0.92);
        ctx.fill();
      }
      var tk4 = e.outCubic(U.clamp((tt - 0.6) / 0.6, 0, 1));
      ctx.font = U.fs(R * 0.26 * tk4, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.96 * tk4);
      ctx.fillText(label, cx, cy + R * 0.2);
    } else {
      ctx.font = U.fs(R * 0.2, 900);
      ctx.fillStyle = U.rgba(col, 0.92);
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '天气氛围', type: 'block', dur: 6.5, poster: 0.55,
    params: WX_PARAMS, draw: wxDraw,
    texts: ['STAY COZY', 'RAIN DAY', 'GOOD VIBES', 'LET IT SNOW'],
    ids: [
      { id: 'wx-rain', name: '下雨', tags: ['雨', '氛围'], desc: '雨丝倾泻配乌云，雨天氛围底衬。', cfg: { kind: 'rain' } },
      { id: 'wx-drizzle', name: '细雨', tags: ['细雨', '安静'], desc: '绵密细雨缓慢落下，安静氛围。', cfg: { kind: 'drizzle' } },
      { id: 'wx-snow', name: '下雪', tags: ['雪', '冬天'], desc: '雪花左右摇曳飘落，冬日氛围。', cfg: { kind: 'snow' } },
      { id: 'wx-snow-heavy', name: '鹅毛大雪', tags: ['大雪', '冬日'], desc: '大片雪花纷纷扬扬，暴雪氛围。', cfg: { kind: 'snow-heavy' } },
      { id: 'wx-sun', name: '晴天太阳', tags: ['太阳', '晴天'], desc: '呼吸的太阳配浮云，晴天好心情。', cfg: { kind: 'sun' } },
      { id: 'wx-sun-rays', name: '阳光射线', tags: ['射线', '光合'], desc: '太阳缓慢旋转放射光线，正能量开场。', cfg: { kind: 'sun-rays', size: 1232} },
      { id: 'wx-clouds', name: '云朵飘', tags: ['云', '飘动'], desc: '多层云朵缓缓飘过，平和氛围。', cfg: { kind: 'clouds' } },
      { id: 'wx-storm', name: '雷暴', tags: ['雷电', '风暴'], desc: '乌云压顶闪电劈落，冲突与爆发叙事。', cfg: { kind: 'storm' } },
      { id: 'wx-fog', name: '雾气', tags: ['雾', '朦胧'], desc: '薄雾层叠飘移，神秘与留白。', cfg: { kind: 'fog' } },
      { id: 'wx-rainbow', name: '彩虹', tags: ['彩虹', '希望'], desc: '彩虹逐色展开，希望与多元表达。', cfg: { kind: 'rainbow', size: 1232} },
      { id: 'wx-wind', name: '大风', tags: ['风', '流动'], desc: '风线横向掠过，速度与流动感。', cfg: { kind: 'wind' } },
      { id: 'wx-leaves', name: '落叶', tags: ['落叶', '秋天'], desc: '落叶旋转飘落，秋日叙事。', cfg: { kind: 'leaves' } },
      { id: 'wx-stars-night', name: '星空', tags: ['星空', '闪烁'], desc: '满天星辰随机闪烁，夜晚氛围。', cfg: { kind: 'stars-night' } },
      { id: 'wx-moon', name: '月亮', tags: ['月亮', '夜'], desc: '发光月牙配浮云，晚安场景。', cfg: { kind: 'moon', size: 1232} },
      { id: 'wx-hail', name: '冰雹', tags: ['冰雹', '冲击'], desc: '冰雹密集砸落，紧张氛围。', cfg: { kind: 'hail' } },
      { id: 'wx-dew', name: '露珠', tags: ['露珠', '清新'], desc: '露珠轻轻晃动，清晨与清新感。', cfg: { kind: 'dew' } }
    ]
  });

  MF.forge({
    cat: '办公效率', type: 'block', dur: 6, poster: 0.55,
    params: WORK_PARAMS, draw: workDraw,
    texts: ['完成周报', '提交方案', '今日复盘', '冲刺目标'],
    ids: [
      { id: 'wk-todo', name: '清单打勾', tags: ['清单', '打卡'], desc: '待办事项逐条打勾，效率与完成感。', cfg: { kind: 'todo-check' } },
      { id: 'wk-calendar', name: '日程弹出', tags: ['日历', '日程'], desc: '日历卡片弹出并显示日期，日程提醒。', cfg: { kind: 'calendar-pop' } },
      { id: 'wk-timer', name: '计时环', tags: ['计时', '倒计时'], desc: '圆环倒计时循环，专注计时场景。', cfg: { kind: 'timer-ring' } },
      { id: 'wk-pomodoro', name: '番茄钟', tags: ['番茄钟', '专注'], desc: '25 分钟专注计时带节拍呼吸。', cfg: { kind: 'pomodoro' } },
      { id: 'wk-kanban', name: '看板移动', tags: ['看板', '流转'], desc: '任务卡在 TODO/DOING/DONE 间流转。', cfg: { kind: 'kanban' } },
      { id: 'wk-mail', name: '邮件发送', tags: ['邮件', '发送'], desc: '信封起飞并展开翼线，发送成功。', cfg: { kind: 'mail-send' } },
      { id: 'wk-bell', name: '提醒铃铛', tags: ['铃铛', '提醒'], desc: '铃铛摇摆并荡出声波，提醒时刻。', cfg: { kind: 'bell-ring' } },
      { id: 'wk-rocket', name: '火箭发射', tags: ['火箭', '发射'], desc: '火箭升空带尾焰，项目启动叙事。', cfg: { kind: 'rocket-launch' } },
      { id: 'wk-trophy', name: '达成奖杯', tags: ['奖杯', '达成'], desc: '奖杯弹出伴随星光环绕，目标达成。', cfg: { kind: 'trophy' } },
      { id: 'wk-target', name: '目标命中', tags: ['靶心', '命中'], desc: '准星收拢命中靶心并爆出射线。', cfg: { kind: 'target-hit' } },
      { id: 'wk-clipboard', name: '剪贴板复制', tags: ['复制', '剪贴板'], desc: '剪贴板卡片弹出，内容已复制。', cfg: { kind: 'clipboard' } },
      { id: 'wk-sync', name: '文件同步', tags: ['同步', '双箭头'], desc: '双向箭头旋转，云同步进行中。', cfg: { kind: 'files-sync' } }
    ]
  });

  MF.forge({
    cat: '弹幕字幕', type: 'block', dur: 6.5, poster: 0.5,
    params: DM_PARAMS, draw: dmDraw,
    texts: ['前方高能,名场面来了,哈哈哈哈,泪目,收藏了', '太强了,学到了,冲冲冲,打卡'],
    ids: [
      { id: 'dm-scroll', name: '滚动弹幕', tags: ['弹幕', '滚动'], desc: '多行弹幕横向滚动，直播与视频氛围。', cfg: { kind: 'danmaku' } },
      { id: 'dm-top', name: '顶部弹幕', tags: ['置顶', '公告'], desc: '置顶弹幕依次弹出，重要提示。', cfg: { kind: 'danmaku-top' } },
      { id: 'dm-subtitle', name: '底部字幕条', tags: ['字幕', '对白'], desc: '半透明字幕条逐句切换，视频对白。', cfg: { kind: 'subtitle', size: 185} },
      { id: 'dm-caption', name: '气泡字幕', tags: ['气泡', '字幕'], desc: '气泡式字幕弹出，脱口秀风格。', cfg: { kind: 'caption-pop', size: 185} },
      { id: 'dm-live', name: '直播间热度', tags: ['直播', '人气'], desc: '人气值与热度条实时跳动。', cfg: { kind: 'live-heat' } },
      { id: 'dm-quiz', name: '答题弹幕', tags: ['答题', '互动'], desc: '选项弹幕滚动，互动答题场景。', cfg: { kind: 'quiz' } },
      { id: 'dm-reply', name: '回复串', tags: ['回复', '楼中楼'], desc: '带缩进符号的回复弹幕滚过。', cfg: { kind: 'reply' } },
      { id: 'dm-watermark', name: '平铺水印', tags: ['水印', '防盗'], desc: '全屏平铺旋转水印，版权保护。', cfg: { kind: 'watermark' } },
      { id: 'dm-ping', name: '坐标标记', tags: ['标记', '标注'], desc: '坐标点脉冲并弹出标注气泡。', cfg: { kind: 'ping' } },
      { id: 'dm-chapter', name: '章节标题', tags: ['章节', '转场'], desc: '大号章节数字压底弹出，视频分段。', cfg: { kind: 'chapter', size: 185} }
    ]
  });

  MF.forge({
    cat: '节日庆典', type: 'block', dur: 6, poster: 0.5,
    params: FEST_PARAMS, draw: festDraw,
    texts: ['HAPPY 2026', '生日快乐', '开工大吉', '周年庆'],
    ids: [
      { id: 'fest-confetti', name: '彩带礼炮', tags: ['彩带', '庆祝'], desc: '彩带从天洒落配大字祝福，庆祝标配。', cfg: { kind: 'confetti' } },
      { id: 'fest-balloon', name: '气球升起', tags: ['气球', '升空'], desc: '彩色气球摇曳升空，派对氛围。', cfg: { kind: 'balloon' } },
      { id: 'fest-firework', name: '烟花绽放', tags: ['烟花', '夜空'], desc: '烟花升空绽放循环，跨年氛围。', cfg: { kind: 'firework', size: 1232} },
      { id: 'fest-gift', name: '礼物开箱', tags: ['礼物', '惊喜'], desc: '礼盒开盖彩球蹦出，惊喜揭晓。', cfg: { kind: 'gift-open' } },
      { id: 'fest-cake', name: '蛋糕蜡烛', tags: ['蛋糕', '生日'], desc: '烛光摇曳的生日蛋糕，生日祝福。', cfg: { kind: 'cake' } },
      { id: 'fest-lantern', name: '灯笼升起', tags: ['灯笼', '新年'], desc: '孔明灯冉冉升起，新年祈愿。', cfg: { kind: 'lantern' } },
      { id: 'fest-bunting', name: '三角彩旗', tags: ['彩旗', '派对'], desc: '彩旗绳随风摆动，派对布置。', cfg: { kind: 'bunting' } },
      { id: 'fest-cheers', name: '碰杯庆祝', tags: ['碰杯', '干杯'], desc: '双杯相碰扬起，团建与庆功。', cfg: { kind: 'cheers' } },
      { id: 'fest-sparkle', name: '星光点缀', tags: ['星光', '闪耀'], desc: '四角星光随机闪烁，梦幻氛围。', cfg: { kind: 'sparkle' } },
      { id: 'fest-count', name: '倒数开场', tags: ['倒数', '开场'], desc: '3-2-1 倒数配彩带，活动开场。', cfg: { kind: 'party-count' } }
    ]
  });
})();
