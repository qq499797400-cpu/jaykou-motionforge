/* ==========================================================================
   Jaykou 动效库 · 19
   原语：对比展示 / 时间轴 / 数据大屏
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：对比展示 ══════════════════════════ */

  var CMP_PARAMS = [
    P('kind', '形态', 'slider', sel('slider', [
      ['slider', '分屏推拉'], ['wipe', '上下擦除'], ['vs', 'VS 碰撞'],
      ['labels', '前后标签'], ['bars', '对比条'], ['cards', '双卡翻转'],
      ['oscillate', '分屏振荡'], ['split-text', '一分为二'], ['price', '价格对比'],
      ['scale', '大小对比'], ['ab-toggle', 'A/B 切换'], ['merge', '合二为一']
    ])),
    P('textA', '方案 A', 'BEFORE', txt('BEFORE')),
    P('textB', '方案 B', 'AFTER', txt('AFTER')),
    P('size', '字号', 242, rng(242, 40, 339, 2)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '强调色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function cmpDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var col = p.ink2;
    var kind = p.kind;
    var A = String(p.textA || 'BEFORE');
    var B = String(p.textB || 'AFTER');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 24 * S * amt; }
    }
    function panel(x, w, label, c, alpha) {
      ctx.fillStyle = U.rgba(U.mix(c, U.bg1, 0.72), alpha);
      ctx.fillRect(x, 0, w, H);
      ctx.font = U.fs(fs * 0.4, 900);
      ctx.fillStyle = U.rgba(c, alpha);
      ctx.fillText(label, x + w / 2, cy);
    }

    if (kind === 'slider') {
      var cyc = (tt * 0.42) % 1;
      var pos = cyc < 0.5 ? e.inOutCubic(cyc * 2) : e.inOutCubic((1 - cyc) * 2);
      var px = W * (0.15 + pos * 0.7);
      panel(0, px, A, U.ink, U.clamp(tt * 3, 0, 1));
      ctx.save();
      ctx.beginPath(); ctx.rect(px, 0, W - px, H); ctx.clip();
      panel(0, W, B, col, U.clamp(tt * 3, 0, 1));
      ctx.restore();
      glowOn('#FFFFFF', p.glow * 0.6);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.95);
      ctx.fillRect(px - 2.5 * S, 0, 5 * S, H);
      ctx.beginPath();
      ctx.arc(px, cy, 26 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.95); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(24 * S, 900);
      ctx.fillStyle = U.rgba(U.bg1, 0.9);
      ctx.fillText('⇄', px, cy + 1);
    } else if (kind === 'wipe') {
      var cyc2 = (tt * 0.42) % 1;
      var pos2 = cyc2 < 0.5 ? e.inOutCubic(cyc2 * 2) : e.inOutCubic((1 - cyc2) * 2);
      var py = H * (0.15 + pos2 * 0.7);
      ctx.fillStyle = U.rgba(U.mix(U.ink, U.bg1, 0.75), U.clamp(tt * 3, 0, 1));
      ctx.fillRect(0, 0, W, py);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, py, W, H - py); ctx.clip();
      ctx.fillStyle = U.rgba(U.mix(col, U.bg1, 0.72), U.clamp(tt * 3, 0, 1));
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      ctx.font = U.fs(fs * 0.38, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(A, cx, py / 2);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, cx, py + (H - py) / 2);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillRect(0, py - 2 * S, W, 4 * S);
    } else if (kind === 'vs') {
      var slam = e.outBack(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.2, 0, 1);
      ctx.save();
      ctx.translate(cx - W * 0.24 * (1 - U.clamp(tt / 0.6, 0, 1)) - 0, 0);
      ctx.font = U.fs(fs * 0.5, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText(A, cx - W * 0.22, cy);
      ctx.restore();
      ctx.save();
      ctx.translate(W * 0.24 * (1 - U.clamp(tt / 0.6, 0, 1)), 0);
      ctx.font = U.fs(fs * 0.5, 900);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, cx + W * 0.22, cy);
      ctx.restore();
      var vsK = e.outBack(U.clamp((tt - 0.45) / 0.4, 0, 1));
      glowOn(col, p.glow);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.12);
      ctx.scale(vsK, vsK);
      U.rr(ctx, -44 * S, -44 * S, 88 * S, 88 * S, 20 * S);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.font = U.fs(44 * S, 900);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText('VS', 0, 2);
      ctx.restore();
    } else if (kind === 'labels') {
      var flip = (tt * 0.5) % 1 < 0.5;
      var fk = flip ? e.outCubic(U.clamp(((tt * 0.5) % 0.5) * 6, 0, 1)) : 1 - e.outCubic(U.clamp(((tt * 0.5 - 0.5) % 0.5) * 6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var showA = (tt * 0.5) % 1 < 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.transform(1, 0, 0, showA ? 1 : 1, 0, 0);
      ctx.font = U.fs(fs, 900);
      if (showA) { ctx.fillStyle = U.rgba(U.ink, 0.95); ctx.fillText(A, 0, 0); }
      else { glowOn(col, p.glow); ctx.fillStyle = U.rgba(col, 0.95); ctx.fillText(B, 0, 0); }
      ctx.restore();
      var chipW = fs * 0.62, chipH = fs * 0.3;
      U.rr(ctx, cx - chipW / 2, cy + fs * 0.68, chipW, chipH, chipH / 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      ctx.font = U.fs(chipH * 0.5, 800);
      ctx.fillStyle = U.rgba(showA ? U.ink : col, 0.9);
      ctx.fillText(showA ? 'BEFORE' : 'AFTER', cx, cy + fs * 0.68 + chipH / 2);
    } else if (kind === 'bars') {
      var gk = e.outExpo(U.clamp((tt - 0.4) / 1.4, 0, 1));
      var vA = U.rnd(0.3, 0.6, 3), vB = U.rnd(0.55, 0.9, 7);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = U.fs(fs * 0.22, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(A, W * 0.12, cy - fs * 0.35);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, W * 0.12, cy + fs * 0.35);
      var bh = fs * 0.16;
      U.rr(ctx, W * 0.12, cy - fs * 0.24, W * 0.76, bh, bh / 2);
      ctx.fillStyle = U.rgba(U.ink, 0.14); ctx.fill();
      U.rr(ctx, W * 0.12, cy - fs * 0.24, Math.max(bh, W * 0.76 * vA * gk), bh, bh / 2);
      ctx.fillStyle = U.rgba(U.ink, 0.85); ctx.fill();
      U.rr(ctx, W * 0.12, cy + fs * 0.24, W * 0.76, bh, bh / 2);
      ctx.fillStyle = U.rgba(col, 0.14); ctx.fill();
      glowOn(col, p.glow * 0.5);
      U.rr(ctx, W * 0.12, cy + fs * 0.24, Math.max(bh, W * 0.76 * vB * gk), bh, bh / 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.textAlign = 'center';
    } else if (kind === 'cards') {
      var cyc3 = (tt * 0.4) % 1;
      var showB = cyc3 > 0.5;
      var ang3 = showB ? (1 - (cyc3 - 0.5) * 2) : (cyc3 * 2);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var cardW = fs * 1.7, cardH = fs * 1.05;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.4 + 0.6 * Math.abs(Math.cos(ang3 * Math.PI * 0.5)) + 0.0, 1);
      U.rr(ctx, -cardW / 2, -cardH / 2, cardW, cardH, cardH * 0.14);
      ctx.fillStyle = U.rgba(showB ? U.mix(col, U.bg1, 0.3) : U.mix(U.ink, U.bg1, 0.3), 0.95);
      ctx.fill();
      ctx.font = U.fs(fs * 0.4, 900);
      ctx.fillStyle = U.rgba(showB ? U.bg1 : U.bg1, 0.95);
      ctx.fillText(showB ? B : A, 0, 0);
      ctx.restore();
      ctx.font = U.fs(fs * 0.13 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText('TAP TO COMPARE', cx, cy + cardH * 0.85);
    } else if (kind === 'oscillate') {
      var osc = Math.sin(tt * 1.6) * 0.5 + 0.5;
      var px2 = W * (0.5 + (osc - 0.5) * 0.36);
      panel(0, px2, A, U.ink, U.clamp(tt * 3, 0, 1));
      ctx.save();
      ctx.beginPath(); ctx.rect(px2, 0, W - px2, H); ctx.clip();
      panel(0, W, B, col, U.clamp(tt * 3, 0, 1));
      ctx.restore();
      ctx.fillStyle = U.rgba('#FFFFFF', 0.9);
      ctx.fillRect(px2 - 2 * S, 0, 4 * S, H);
    } else if (kind === 'split-text') {
      var word2 = A;
      var half = Math.ceil(word2.length / 2);
      var open = e.outCubic(U.clamp((tt - 0.4) / 1, 0, 1));
      ctx.font = U.fs(fs, 900);
      var wA = ctx.measureText(word2.slice(0, half)).width;
      var wB = ctx.measureText(word2.slice(half)).width;
      var gap2 = open * fs * 0.8;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, cx + gap2 / 2, H); ctx.clip();
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(word2.slice(0, half), cx - (wB + gap2) / 2 + wA / 2 - wA / 2 + 0, cy);
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.rect(cx + gap2 / 2, 0, W, H); ctx.clip();
      glowOn(col, p.glow * 0.7);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(word2.slice(half), cx + (wA + gap2) / 2 + wB / 2 - wB / 2 + 0, cy);
      ctx.restore();
      ctx.fillStyle = U.rgba(B, 0);
      ctx.font = U.fs(fs * 0.16 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.6);
      ctx.fillText(B, cx, cy + fs * 0.75);
    } else if (kind === 'price') {
      var pk = e.outBack(U.clamp((tt - 0.3) / 0.6, 0, 1));
      var pk2 = e.outBack(U.clamp((tt - 0.55) / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(fs * 0.42, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.4);
      ctx.save();
      ctx.translate(cx - W * 0.18, cy);
      ctx.rotate(-0.06);
      ctx.fillText(A, 0, 0);
      ctx.strokeStyle = U.rgba('#FF6A5D', 0.95);
      ctx.lineWidth = 6 * S;
      ctx.beginPath();
      ctx.moveTo(-ctx.measureText(A).width / 2 - 10 * S, 0);
      ctx.lineTo(ctx.measureText(A).width / 2 + 10 * S, fs * 0.1);
      ctx.stroke();
      ctx.restore();
      glowOn(col, p.glow);
      ctx.font = U.fs(fs * 0.52 * pk2, 900);
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText(B, cx + W * 0.16, cy);
      var tag = U.outCubic ? 0 : 0;
      ctx.font = U.fs(fs * 0.15 * S, 800);
      U.rr(ctx, cx + W * 0.16 - fs * 0.5, cy - fs * 0.62, fs * 1.0, fs * 0.28, fs * 0.14);
      ctx.fillStyle = U.rgba('#5DFF8F', 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText('省 40%', cx + W * 0.16, cy - fs * 0.48);
    } else if (kind === 'scale') {
      var gk2 = e.outCubic(U.clamp((tt - 0.4) / 1.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(fs * 0.34, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(A, cx - W * 0.2, cy + fs * 0.32);
      ctx.font = U.fs(fs * (0.34 + 0.38 * gk2), 900);
      glowOn(col, p.glow);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(B, cx + W * 0.16, cy);
      ctx.beginPath();
      ctx.moveTo(cx - W * 0.06, cy + fs * 0.42);
      ctx.lineTo(cx + W * 0.02 + W * 0.06 * gk2, cy + fs * 0.42);
      ctx.lineWidth = 5 * S;
      ctx.strokeStyle = U.rgba(col, 0.9);
      ctx.stroke();
    } else if (kind === 'ab-toggle') {
      var cyc4 = (tt * 0.6) % 1;
      var curB = cyc4 > 0.5;
      var slide = e.outCubic(curB ? U.clamp((cyc4 - 0.5) * 8, 0, 1) : U.clamp((1 - cyc4 * 2), 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var tw2 = fs * 1.4, th2 = fs * 0.62;
      U.rr(ctx, cx - tw2 / 2, cy - th2 / 2, tw2, th2, th2 * 0.3);
      ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
      var knobW = tw2 / 2;
      U.rr(ctx, cx - tw2 / 2 + 5 * S + (tw2 - knobW - 10 * S) * slide, cy - th2 / 2 + 5 * S, knobW, th2 - 10 * S, th2 * 0.26);
      ctx.fillStyle = U.rgba(curB ? col : U.ink, 0.95); ctx.fill();
      ctx.font = U.fs(th2 * 0.34, 900);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText(curB ? 'B' : 'A', cx - tw2 / 2 + 5 * S + (tw2 - knobW - 10 * S) * slide + knobW / 2, cy + 1);
      ctx.font = U.fs(fs * 0.3, 800);
      ctx.fillStyle = U.rgba(curB ? col : U.ink, 0.8);
      ctx.fillText(curB ? B : A, cx, cy + th2 * 1.15);
    } else if (kind === 'merge') {
      var mg = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var cyc5 = (tt * 0.4) % 1;
      var dir = cyc5 < 0.5 ? mg : 1 - e.inOutCubic((cyc5 - 0.5) * 2);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(fs * 0.4, 900);
      ctx.save();
      ctx.translate(-dir * W * 0.16, 0);
      ctx.fillStyle = U.rgba(U.ink, 0.9 * (1 - dir * 0.55));
      ctx.fillText(A, cx - W * 0.12, cy);
      ctx.restore();
      ctx.save();
      ctx.translate(dir * W * 0.16, 0);
      ctx.fillStyle = U.rgba(col, 0.9 * (1 - dir * 0.55));
      ctx.fillText(B, cx + W * 0.12, cy);
      ctx.restore();
      if (dir > 0.92) {
        var mk3 = e.outBack(U.clamp((dir - 0.92) / 0.08, 0, 1));
        glowOn(col, p.glow);
        ctx.font = U.fs(fs * 0.44 * mk3, 900);
        ctx.fillStyle = U.rgba(U.mix(U.ink, col, 0.5), 0.98);
        ctx.fillText(A + B, cx, cy);
      }
    } else {
      ctx.font = U.fs(fs * 0.5, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(A, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：时间轴 ══════════════════════════ */

  var TL_PARAMS = [
    P('kind', '形态', 'line', sel('line', [
      ['line', '主线生长'], ['milestone', '里程碑弹出'], ['horizontal', '横向推进'],
      ['vertical', '纵向滚动'], ['branch', '分支展开'], ['steps', '步骤倒计时'],
      ['process', '流程箭头链'], ['gantt', '甘特条'], ['dots', '节点连线'],
      ['flag', '插旗'], ['calendar', '日历翻格'], ['progress-nodes', '进度节点']
    ])),
    P('text', '阶段', '调研,开发,测试,上线', txt('调研,开发,测试,上线', true)),
    P('points', '节点数', 4, rng(4, 2, 8, 1)),
    P('size', '基准尺寸', 1144, rng(1144, 140.0, 1602, 4.0)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function tlDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var stages = String(p.text || '').split(/[,，|]/).filter(Boolean).slice(0, 6);
    if (!stages.length) stages = ['规划', '执行', '交付'];
    var n = Math.min(stages.length, Math.max(2, Math.round(p.points)));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 22 * S * amt; }
    }
    function node(x, y, r2, fill, alpha) {
      ctx.beginPath(); ctx.arc(x, y, r2, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(fill, alpha === undefined ? 1 : alpha);
      ctx.fill();
    }

    if (kind === 'line' || kind === 'milestone' || kind === 'flag') {
      var prog = e.inOutCubic(U.clamp((tt - 0.3) / (0.6 + n * 0.5), 0, 1));
      var y0 = cy + R * 0.1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.moveTo(W * 0.14, y0);
      ctx.lineTo(W * 0.14 + (W * 0.72) * prog, y0);
      ctx.lineWidth = 4.4 * S; ctx.lineCap = 'round';
      glowOn(col, p.glow * 0.5);
      ctx.strokeStyle = U.rgba(col, 0.9);
      ctx.stroke();
      ctx.shadowBlur = 0;
      for (var i = 0; i < n; i++) {
        var nx = W * 0.14 + (W * 0.72) * (i / (n - 1));
        var nk = U.clamp((prog * (n - 1) - i) / 0.4, 0, 1);
        if (nk <= 0.01) continue;
        var pop = e.outBack(nk);
        node(nx, y0, R * 0.045 * pop, i === n - 1 ? col : U.bg1, U.clamp(tt * 3, 0, 1));
        if (i === n - 1) glowOn(col, p.glow);
        node(nx, y0, R * 0.02 * pop, i === n - 1 ? U.bg1 : col);
        ctx.shadowBlur = 0;
        ctx.font = U.fs(R * 0.12 * pop, 800);
        ctx.fillStyle = U.rgba(i === n - 1 ? col : U.ink, 0.92 * nk);
        ctx.fillText(stages[i], nx, y0 - R * 0.14);
        if (kind === 'flag' && nk > 0.6) {
          var fk = e.outCubic((nk - 0.6) / 0.4);
          ctx.beginPath();
          ctx.moveTo(nx, y0 + R * 0.04);
          ctx.lineTo(nx, y0 + R * 0.28);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(U.ink, 0.7 * fk);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx, y0 + R * 0.05);
          ctx.lineTo(nx + R * 0.12 * fk, y0 + R * 0.1);
          ctx.lineTo(nx, y0 + R * 0.15);
          ctx.closePath();
          ctx.fillStyle = U.rgba(col, 0.9 * fk);
          ctx.fill();
        }
      }
    } else if (kind === 'horizontal' || kind === 'vertical') {
      var vert = kind === 'vertical';
      var prog2 = e.inOutCubic(U.clamp((tt - 0.3) / (0.5 + n * 0.45), 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var si = 0; si < n; si++) {
        var sk = U.clamp((prog2 * n - si) / 0.6, 0, 1);
        if (sk <= 0.01) continue;
        var px = vert ? cx : W * 0.16 + (W * 0.68) * (si / Math.max(1, n - 1));
        var py = vert ? H * 0.2 + (H * 0.6) * (si / Math.max(1, n - 1)) : cy;
        ctx.save();
        ctx.translate(px, py);
        var enter = e.outBack(sk);
        ctx.scale(enter, enter);
        U.rr(ctx, -R * 0.13, vert ? -R * 0.06 : -R * 0.09, R * 0.26, vert ? R * 0.12 : R * 0.18, R * 0.035);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, si / n * 0.5), 0.96);
        ctx.fill();
        ctx.font = U.fs(R * 0.1, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.95);
        ctx.fillText(stages[si], 0, 1);
        ctx.restore();
      }
      ctx.beginPath();
      if (vert) { ctx.moveTo(cx, H * 0.2); ctx.lineTo(cx, H * 0.2 + (H * 0.6) * U.clamp(prog2 * (n - 1) / Math.max(1, n - 1), 0, 1)); }
      else { ctx.moveTo(W * 0.16, cy); ctx.lineTo(W * 0.16 + (W * 0.68) * U.clamp(prog2, 0, 1), cy); }
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.25);
      ctx.stroke();
    } else if (kind === 'branch') {
      var bk = e.outCubic(U.clamp(tt / 1.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bx0 = W * 0.2;
      ctx.beginPath();
      ctx.moveTo(bx0, cy);
      ctx.lineTo(bx0 + (cx - bx0) * bk, cy);
      ctx.lineWidth = 4 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.55);
      ctx.stroke();
      var branches = Math.min(4, n);
      for (var bi = 0; bi < branches; bi++) {
        var bkk = U.clamp((bk - 0.3 - bi * 0.1) / 0.5, 0, 1);
        if (bkk <= 0.01) continue;
        var by = cy + (bi - (branches - 1) / 2) * R * 0.36;
        var ex = cx + W * 0.22 * bkk;
        ctx.beginPath();
        ctx.moveTo(bx0 + (cx - bx0) * 0.9, cy);
        ctx.quadraticCurveTo(cx, cy, ex, by);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, bi / branches), 0.85 * bkk);
        ctx.stroke();
        node(ex, by, R * 0.035 * bkk, U.mix(col, U.accent2, bi / branches));
        ctx.font = U.fs(R * 0.095 * S * bkk, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85 * bkk);
        ctx.textAlign = 'left';
        ctx.fillText(stages[bi % stages.length], ex + R * 0.07, by);
        ctx.textAlign = 'center';
      }
      node(bx0, cy, R * 0.045, U.ink);
    } else if (kind === 'steps' || kind === 'progress-nodes') {
      var cyc = (tt * 0.6) % n;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var pi = 0; pi < n; pi++) {
        var px2 = cx + (pi - (n - 1) / 2) * (R * 0.46);
        var active = pi <= Math.floor(cyc);
        var isCur = Math.floor(cyc) === pi;
        var cur = Math.pow(1 - (cyc % 1), 2) * (isCur ? 1 : 0);
        node(px2, cy, R * 0.07 + cur * R * 0.02, active ? col : U.ink, active ? 0.95 : 0.2);
        if (isCur) glowOn(col, p.glow);
        node(px2, cy, R * 0.032, U.bg1);
        ctx.shadowBlur = 0;
        ctx.font = U.fs(R * 0.1 * S, 800);
        ctx.fillStyle = U.rgba(active ? U.ink : U.ink, active ? 0.9 : 0.35);
        ctx.fillText(stages[pi], px2, cy + R * 0.18);
        if (pi < n - 1) {
          ctx.beginPath();
          ctx.moveTo(px2 + R * 0.09, cy);
          ctx.lineTo(px2 + R * 0.46 - R * 0.09, cy);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(active && pi < Math.floor(cyc) ? col : U.ink, active && pi < Math.floor(cyc) ? 0.8 : 0.16);
          ctx.stroke();
        }
      }
    } else if (kind === 'process') {
      var pk = e.inOutCubic(U.clamp((tt - 0.3) / (0.4 + n * 0.4), 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var fi = 0; fi < n; fi++) {
        var fk2 = U.clamp((pk * n - fi) / 0.6, 0, 1);
        if (fk2 <= 0.01) continue;
        var fx = W * 0.16 + (W * 0.68) * (fi / Math.max(1, n - 1));
        ctx.save();
        ctx.translate(fx, cy);
        ctx.scale(e.outBack(fk2), e.outBack(fk2));
        U.rr(ctx, -R * 0.11, -R * 0.075, R * 0.22, R * 0.15, R * 0.03);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg1, fi / n * 0.6), 0.96);
        ctx.fill();
        ctx.font = U.fs(R * 0.085, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.95);
        ctx.fillText(String(fi + 1), 0, 1);
        ctx.restore();
        ctx.font = U.fs(R * 0.085 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85 * fk2);
        ctx.fillText(stages[fi], fx, cy + R * 0.2);
        if (fi < n - 1 && fk2 > 0.5) {
          var ak = (fk2 - 0.5) / 0.5;
          var ax0 = fx + R * 0.13, ax1 = W * 0.16 + (W * 0.68) * ((fi + 1) / Math.max(1, n - 1)) - R * 0.16;
          ctx.beginPath();
          ctx.moveTo(ax0, cy);
          ctx.lineTo(U.lerp(ax0, ax1, ak), cy);
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(col, 0.7);
          ctx.stroke();
          if (ak > 0.9) {
            ctx.beginPath();
            ctx.moveTo(ax1, cy - R * 0.035);
            ctx.lineTo(ax1 + R * 0.045, cy);
            ctx.lineTo(ax1, cy + R * 0.035);
            ctx.closePath();
            ctx.fillStyle = U.rgba(col, 0.9);
            ctx.fill();
          }
        }
      }
    } else if (kind === 'gantt') {
      var gk3 = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      for (var gi = 0; gi < n; gi++) {
        var gy = cy - R * 0.42 + gi * (R * 0.84 / Math.max(1, n));
        var gkk = U.clamp((gk3 - gi * 0.12) / 0.88, 0, 1);
        var gw = W * (0.18 + U.rnd(0.15, 0.3, gi)) * gkk;
        var gxx = W * 0.26;
        U.rr(ctx, gxx, gy, gw, R * 0.1, R * 0.05);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, gi / n), 0.92);
        ctx.fill();
        ctx.font = U.fs(R * 0.09 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText(stages[gi], W * 0.12, gy + R * 0.05);
        ctx.font = U.fs(R * 0.075 * S, 600);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(Math.round(gkk * 100) + '%', gxx + gw + 14 * S, gy + R * 0.05);
      }
      ctx.textAlign = 'center';
    } else if (kind === 'dots') {
      var dk = e.inOutCubic(U.clamp((tt - 0.3) / 1.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var pts = [];
      for (var di = 0; di < n; di++) {
        pts.push([W * U.rnd(0.25, 0.75, di * 2), H * U.rnd(0.3, 0.7, di * 2 + 1)]);
      }
      ctx.lineWidth = 2.6 * S;
      for (var li = 0; li < n - 1; li++) {
        var lk = U.clamp((dk * (n - 1) - li) / 0.7, 0, 1);
        if (lk <= 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(pts[li][0], pts[li][1]);
        ctx.lineTo(U.lerp(pts[li][0], pts[li + 1][0], lk), U.lerp(pts[li][1], pts[li + 1][1], lk));
        ctx.strokeStyle = U.rgba(col, 0.55);
        ctx.stroke();
      }
      for (var di2 = 0; di2 < n; di2++) {
        var dk2 = U.clamp(dk * (n - 1) - di2 + 0.5, 0, 1);
        if (dk2 <= 0.01) continue;
        node(pts[di2][0], pts[di2][1], R * 0.04 * e.outBack(dk2), di2 % 2 ? U.accent2 : col);
        ctx.font = U.fs(R * 0.095 * S * dk2, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85 * dk2);
        ctx.fillText(stages[di2], pts[di2][0], pts[di2][1] - R * 0.12);
      }
    } else if (kind === 'calendar') {
      var rows = 3, cols = 5;
      var reveal = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var cw = R * 0.26, ch = R * 0.2;
      var done = Math.floor(reveal * rows * cols);
      for (var ri = 0; ri < rows; ri++) {
        for (var ci = 0; ci < cols; ci++) {
          var idx = ri * cols + ci;
          var ck = U.clamp((reveal * rows * cols - idx) / 0.8, 0, 1);
          if (ck <= 0.01) continue;
          var cxx = cx + (ci - (cols - 1) / 2) * (cw * 1.12);
          var cyy = cy + (ri - (rows - 1) / 2) * (ch * 1.18);
          ctx.save();
          ctx.translate(cxx, cyy);
          ctx.scale(e.outBack(ck), e.outBack(ck));
          U.rr(ctx, -cw / 2, -ch / 2, cw, ch, ch * 0.18);
          ctx.fillStyle = U.rgba(idx === done - 1 ? col : U.bg2, idx === done - 1 ? 0.95 : 0.9);
          ctx.fill();
          if (idx < done) {
            ctx.font = U.fs(ch * 0.4, 800);
            ctx.fillStyle = U.rgba(idx === done - 1 ? U.bg1 : U.ink, 0.85);
            ctx.fillText('✓', 0, 1);
          }
          ctx.restore();
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(stages.join(' · '), cx, cy + R * 0.52);
    } else {
      var pk2 = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pk2);
      ctx.lineWidth = R * 0.06 * S;
      glowOn(col, p.glow * 0.6);
      ctx.strokeStyle = U.rgba(col, 0.9);
      ctx.stroke();
      ctx.font = U.fs(R * 0.16, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText(stages[Math.min(n - 1, Math.floor(pk2 * n))], cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语三：数据大屏 ══════════════════════════ */

  var DASH_PARAMS = [
    P('kind', '形态', 'kpi', sel('kpi', [
      ['kpi', 'KPI 翻牌'], ['rank', '排行榜'], ['gauge-row', '三环仪表'],
      ['ticker', '实时跑马'], ['heat-grid', '热力格'], ['status', '状态灯板'],
      ['pie-trio', '三饼'], ['spark-wall', '走势墙'], ['progress-wall', '进度墙'],
      ['area-grow', '面积图生长'], ['clock', '世界时钟'], ['flow', '数据流向'],
      ['alert', '告警弹出'], ['funnel', '漏斗'], ['bubble', '气泡矩阵'], ['num-roll', '数字列滚动']
    ])),
    P('text', '主题', 'LIVE OPS', txt('LIVE OPS')),
    P('num', '基准值', 100, rng(100, 10, 1000, 5)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('size', '尺寸', 946, rng(946, 200, 1324, 10)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function dashDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = (p.size || 430) * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var base = Math.max(1, Math.round(p.num));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 20 * S * amt; }
    }
    function fmt(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

    if (kind === 'kpi') {
      var vk = e.outExpo(U.clamp((tt - 0.4) / 1.5, 0, 1));
      var cardW = R * 1.15, cardH = R * 0.85;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin((tt * 0.5) % 1 * Math.PI) * 0.015);
      U.rr(ctx, -cardW / 2, -cardH / 2, cardW, cardH, cardH * 0.12);
      ctx.fillStyle = U.rgba(U.bg2, 0.96); ctx.fill();
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.4); ctx.stroke();
      ctx.font = U.fs(cardH * 0.14, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText(p.text, 0, -cardH * 0.28);
      glowOn(col, p.glow);
      ctx.font = U.fs(cardH * 0.42, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(fmt(base * vk), 0, cardH * 0.06);
      ctx.font = U.fs(cardH * 0.13, 800);
      ctx.fillStyle = U.rgba('#5DFF8F', 0.95);
      ctx.fillText('▲ LIVE · ' + (Math.sin(tt * 3) > 0 ? '+2.4%' : '+1.8%'), 0, cardH * 0.32);
      ctx.restore();
    } else if (kind === 'rank') {
      var rows = Math.min(6, Math.max(3, Math.round(base / 30) + 3));
      var gk = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      var drift = (tt * 0.22) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(p.text, W * 0.14, cy - R * 0.62);
      for (var ri = 0; ri < rows; ri++) {
        var idx = (ri + Math.floor(drift * rows)) % rows;
        var ry = cy - R * 0.42 + ri * (R * 0.72 / rows);
        var val = (rows - ri) / rows;
        var wv = W * 0.42 * val * (0.75 + 0.25 * Math.abs(U.noise2(idx * 3, Math.floor(tt * 2), U.seed)));
        var wv2 = W * 0.42 * val * U.clamp(gk + ri * 0.06, 0, 1);
        U.rr(ctx, W * 0.22, ry, Math.max(6 * S, wv2), R * 0.07, R * 0.035);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, ri / rows), 0.92);
        ctx.fill();
        if (ri === 0 && wv > wv2) {
          U.rr(ctx, W * 0.22, ry, wv, R * 0.07, R * 0.035);
          ctx.fillStyle = U.rgba(col, 0.25); ctx.fill();
        }
        ctx.font = U.fs(R * 0.095 * S, 800);
        ctx.fillStyle = U.rgba(ri === 0 ? col : U.ink, 0.9);
        ctx.fillText('#' + (idx + 1) + ' ITEM-' + (idx + 1), W * 0.14, ry + R * 0.035);
      }
      ctx.textAlign = 'center';
    } else if (kind === 'gauge-row') {
      var gk2 = e.outCubic(U.clamp((tt - 0.4) / 1.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var gi = 0; gi < 3; gi++) {
        var gx = cx + (gi - 1) * R * 0.72;
        var val = U.clamp((0.4 + 0.5 * Math.abs(U.noise2(gi * 7, tt * sp * 0.9, U.seed))) * U.clamp((gk2 - gi * 0.1) / 0.9, 0, 1), 0, 1);
        ctx.beginPath();
        ctx.arc(gx, cy - R * 0.05, R * 0.24, Math.PI * 0.75, Math.PI * 2.25);
        ctx.lineWidth = R * 0.05 * S;
        ctx.strokeStyle = U.rgba(U.ink, 0.12); ctx.stroke();
        ctx.beginPath();
        ctx.arc(gx, cy - R * 0.05, R * 0.24, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * val));
        glowOn(gi === 1 ? U.accent2 : col, p.glow * 0.4);
        ctx.strokeStyle = U.rgba(gi === 1 ? U.accent2 : col, 0.95); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.font = U.fs(R * 0.12, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.95);
        ctx.fillText(Math.round(val * 100) + '%', gx, cy - R * 0.03);
        ctx.font = U.fs(R * 0.075 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.fillText(['CPU', 'MEM', 'IO'][gi], gx, cy + R * 0.22);
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.85);
      ctx.fillText(p.text, cx, cy + R * 0.62);
    } else if (kind === 'ticker') {
      var scroll = (tt * 220 * S) % (W * 0.6);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(R * 0.16, 800);
      ctx.textAlign = 'left';
      for (var ti = 0; ti < 8; ti++) {
        var tx = W * 0.08 + ti * W * 0.24 - scroll;
        var tx2 = tx < -W * 0.3 ? tx + W * 1.44 : tx;
        if (tx2 > W * 1.1) continue;
        var up = U.rng(ti + Math.floor(tt)) > 0.5;
        var v = base * (0.5 + U.rnd(0, 1, ti));
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText('T' + (ti % 5 + 1), tx2, cy - R * 0.1);
        ctx.fillStyle = U.rgba(up ? '#5DFF8F' : '#FF6A5D', 0.95);
        ctx.fillText(fmt(v) + (up ? '↑' : '↓'), tx2, cy + R * 0.14);
      }
      ctx.fillStyle = U.rgba(col, 0.8);
      ctx.fillRect(0, cy - R * 0.42, W, 2 * S);
      ctx.fillRect(0, cy + R * 0.42, W, 2 * S);
      ctx.textAlign = 'center';
    } else if (kind === 'heat-grid') {
      var cols = 10, rows2 = 6;
      var reveal = e.inOutCubic(U.clamp((tt - 0.3) / 1.4, 0, 1));
      var cw = W * 0.6 / cols, ch = H * 0.5 / rows2;
      for (var ri2 = 0; ri2 < rows2; ri2++) {
        for (var ci = 0; ci < cols; ci++) {
          var v2 = Math.abs(U.noise2(ci * 0.8, ri2 * 0.8 + Math.floor(tt * 2) * 0.3, U.seed)) * reveal;
          var cxx = cx - W * 0.3 + ci * cw + cw / 2;
          var cyy = cy - H * 0.25 + ri2 * ch + ch / 2;
          ctx.fillStyle = U.rgba(U.mix(U.bg2, col, U.clamp(v2 * 1.4, 0, 1)), 0.92);
          U.rr(ctx, cxx - cw * 0.42, cyy - ch * 0.42, cw * 0.84, ch * 0.84, ch * 0.16);
          ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText(p.text + ' · HEATMAP', cx, cy + H * 0.33);
    } else if (kind === 'status') {
      var n2 = Math.min(8, Math.max(4, Math.round(base / 40) + 4));
      var reveal2 = e.outBack(U.clamp(tt / 1.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var si = 0; si < n2; si++) {
        var sk = U.clamp((reveal2 - si * 0.08) / 0.5, 0, 1);
        if (sk <= 0.01) continue;
        var sxx = cx + (si - (n2 - 1) / 2) * (R * 0.2);
        var state = U.rng(si + Math.floor(tt * 0.4));
        var c2 = state > 0.85 ? '#FFD25D' : state > 0.7 ? '#FF6A5D' : '#5DFF8F';
        var blink = state > 0.85 ? (Math.sin(tt * 8) > 0 ? 1 : 0.4) : 1;
        glowOn(c2, p.glow * 0.4);
        ctx.beginPath(); ctx.arc(sxx, cy, R * 0.055 * sk * blink + 2 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(c2, 0.95 * sk); ctx.fill();
        ctx.shadowBlur = 0;
        U.rr(ctx, sxx - R * 0.08, cy + R * 0.12, R * 0.16, R * 0.22, R * 0.03);
        ctx.fillStyle = U.rgba(U.bg2, 0.9 * sk); ctx.fill();
        ctx.font = U.fs(R * 0.07 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.6 * sk);
        ctx.fillText('N' + (si + 1), sxx, cy + R * 0.24);
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.85);
      ctx.fillText(p.text + ' · STATUS', cx, cy - R * 0.35);
    } else if (kind === 'pie-trio') {
      var pk = e.outCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var pi2 = 0; pi2 < 3; pi2++) {
        var px = cx + (pi2 - 1) * R * 0.72;
        var pr = R * 0.22;
        var pkk = U.clamp((pk - pi2 * 0.1) / 0.9, 0, 1);
        var parts = [0.45, 0.3, 0.25];
        var a0 = -Math.PI / 2;
        for (var ppi = 0; ppi < 3; ppi++) {
          var sweep = parts[ppi] * Math.PI * 2 * pkk;
          ctx.beginPath();
          ctx.moveTo(px, cy);
          ctx.arc(px, cy, pr, a0, a0 + sweep);
          ctx.closePath();
          ctx.fillStyle = U.rgba(U.mix(U.mix(col, U.accent2, ppi / 3), U.ink, ppi === 0 ? 0.2 : 0), 0.9);
          ctx.fill();
          a0 += sweep;
        }
        ctx.beginPath(); ctx.arc(px, cy, pr * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.bg1, 0.95); ctx.fill();
        ctx.font = U.fs(pr * 0.42, 900);
        ctx.fillStyle = U.rgba(U.ink, 0.95);
        ctx.fillText(['45%', '30%', '25%'][pi2], px, cy);
      }
    } else if (kind === 'spark-wall' || kind === 'progress-wall') {
      var wall = Math.min(6, Math.max(3, Math.round(base / 60) + 2));
      var wk = e.outExpo(U.clamp((tt - 0.4) / 1.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var wi = 0; wi < wall; wi++) {
        var wxx = cx - R * 0.85 + (wi % 2) * R * 0.92;
        var wyy = cy - R * 0.55 + Math.floor(wi / 2) * (R * 0.42);
        if (kind === 'spark-wall') {
          ctx.beginPath();
          for (var s2 = 0; s2 <= 16; s2++) {
            var sx3 = wxx + (s2 / 16) * R * 0.7;
            var sy3 = wyy + U.noise2(s2 * 0.6 + wi * 4, Math.floor(tt * 2), U.seed) * R * 0.1 * U.clamp((wk - wi * 0.08) / 0.9, 0, 1);
            if (!s2) ctx.moveTo(sx3, sy3); else ctx.lineTo(sx3, sy3);
          }
          ctx.lineWidth = 3 * S;
          ctx.strokeStyle = U.rgba(U.mix(col, U.accent2, wi / wall), 0.9);
          ctx.stroke();
        } else {
          var wv = U.clamp((wk - wi * 0.08) / 0.9, 0, 1) * (0.3 + 0.6 * U.rnd(0, 1, wi));
          U.rr(ctx, wxx, wyy, R * 0.7, R * 0.05, R * 0.025);
          ctx.fillStyle = U.rgba(U.ink, 0.12); ctx.fill();
          U.rr(ctx, wxx, wyy, Math.max(R * 0.03, R * 0.7 * wv), R * 0.05, R * 0.025);
          ctx.fillStyle = U.rgba(U.mix(col, U.accent2, wi / wall), 0.92); ctx.fill();
        }
      }
      ctx.font = U.fs(R * 0.1 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.85);
      ctx.fillText(p.text, cx, cy + R * 0.62);
    } else if (kind === 'area-grow') {
      var ak2 = e.inOutCubic(U.clamp((tt - 0.4) / 1.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var x0 = W * 0.16, x1 = W * 0.84, yb = cy + R * 0.45;
      ctx.beginPath();
      ctx.moveTo(x0, yb);
      var tipX = x0 + (x1 - x0) * ak2;
      for (var ai = 0; ai <= 40; ai++) {
        var axx = x0 + (x1 - x0) * (ai / 40);
        if (axx > tipX) break;
        var ay2 = yb - (0.25 + 0.5 * (ai / 40) + 0.18 * Math.sin(ai * 0.6 + 2) + U.noise2(ai * 0.5, 2, U.seed) * 0.08) * R * 0.8;
        ctx.lineTo(axx, ay2);
      }
      ctx.lineTo(tipX, yb);
      ctx.closePath();
      var ag = ctx.createLinearGradient(0, cy - R * 0.5, 0, yb);
      ag.addColorStop(0, U.rgba(col, 0.4));
      ag.addColorStop(1, U.rgba(col, 0.02));
      ctx.fillStyle = ag; ctx.fill();
      ctx.beginPath();
      for (var ai2 = 0; ai2 <= 40; ai2++) {
        var axx2 = x0 + (x1 - x0) * (ai2 / 40);
        if (axx2 > tipX) break;
        var ay3 = yb - (0.25 + 0.5 * (ai2 / 40) + 0.18 * Math.sin(ai2 * 0.6 + 2) + U.noise2(ai2 * 0.5, 2, U.seed) * 0.08) * R * 0.8;
        if (!ai2) ctx.moveTo(axx2, ay3); else ctx.lineTo(axx2, ay3);
      }
      ctx.lineWidth = 4.4 * S; ctx.lineJoin = 'round';
      glowOn(col, p.glow * 0.6);
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText(p.text + ' · ' + Math.round(ak2 * 100) + '%', cx, yb + R * 0.22);
    } else if (kind === 'clock') {
      var zones = [['SH', 8], ['LDN', 0], ['NYC', -5]];
      var zk = e.outCubic(U.clamp(tt / 1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var zi = 0; zi < 3; zi++) {
        var zx = cx + (zi - 1) * R * 0.75;
        var zkk = U.clamp((zk - zi * 0.15) / 0.85, 0, 1);
        var hr = (new Date().getUTCHours() + zones[zi][1] + 24) % 24;
        var mn = new Date().getUTCMinutes();
        ctx.save();
        ctx.translate(zx, cy);
        ctx.scale(zkk, zkk);
        ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, Math.PI * 2);
        ctx.lineWidth = 3 * S; ctx.strokeStyle = U.rgba(col, 0.8); ctx.stroke();
        var ha = ((hr % 12) + mn / 60) / 12 * Math.PI * 2 - Math.PI / 2;
        var ma2 = mn / 60 * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * R * 0.1, Math.sin(ha) * R * 0.1);
        ctx.lineWidth = 4 * S; ctx.strokeStyle = U.rgba(U.ink, 0.9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ma2) * R * 0.15, Math.sin(ma2) * R * 0.15);
        ctx.lineWidth = 2.4 * S; ctx.strokeStyle = U.rgba(col, 1); ctx.stroke();
        ctx.font = U.fs(R * 0.1 * S, 800);
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText(zones[zi][0] + ' ' + String(hr).padStart(2, '0') + ':' + String(mn).padStart(2, '0'), 0, R * 0.36);
        ctx.restore();
      }
    } else if (kind === 'flow') {
      var fk3 = e.inOutCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var nodes = [[W * 0.18, cy], [cx, cy - R * 0.3], [cx, cy + R * 0.3], [W * 0.82, cy]];
      for (var fi = 1; fi < nodes.length; fi++) {
        var fl = U.clamp((fk3 - (fi - 1) * 0.25) / 0.6, 0, 1);
        if (fl <= 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(nodes[fi - 1][0], nodes[fi - 1][1]);
        ctx.quadraticCurveTo((nodes[fi - 1][0] + nodes[fi][0]) / 2, nodes[fi][1], nodes[fi - 1][0] + (nodes[fi][0] - nodes[fi - 1][0]) * fl, nodes[fi - 1][1] + (nodes[fi][1] - nodes[fi - 1][1]) * fl * 0.9);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(fi % 2 ? col : U.accent2, 0.7);
        ctx.stroke();
      }
      for (var ni = 0; ni < nodes.length; ni++) {
        var nk2 = U.clamp((fk3 - ni * 0.22) / 0.4, 0, 1);
        if (nk2 <= 0.01) continue;
        glowOn(ni === nodes.length - 1 ? col : U.ink, p.glow * 0.4);
        node2(nodes, ni, nk2);
        ctx.shadowBlur = 0;
      }
      function node2(ns, i, k) {
        ctx.beginPath();
        ctx.arc(ns[i][0], ns[i][1], R * 0.06 * e.outBack(k) + 3 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(i === ns.length - 1 ? col : U.ink, 0.95);
        ctx.fill();
      }
      ctx.font = U.fs(R * 0.09 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.6);
      ctx.fillText('INGEST', nodes[0][0], nodes[0][1] + R * 0.16);
      ctx.fillText('SERVE', nodes[3][0], nodes[3][1] + R * 0.16);
    } else if (kind === 'alert') {
      var cyc2 = (tt * 0.7) % 2;
      var showing = cyc2 < 1.4;
      var ask = showing ? e.outBack(U.clamp(cyc2 / 0.3, 0, 1)) * U.clamp((1.4 - cyc2) / 0.25, 0, 1) : 0;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(p.text + ' · MONITOR', cx, cy - R * 0.55);
      if (ask > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(ask, ask);
        var aw = R * 1.3, ah = R * 0.44;
        U.rr(ctx, -aw / 2, -ah / 2, aw, ah, ah * 0.16);
        ctx.fillStyle = U.rgba('#2A1414', 0.97); ctx.fill();
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba('#FF6A5D', 0.8); ctx.stroke();
        glowOn('#FF6A5D', p.glow * 0.5);
        ctx.beginPath(); ctx.arc(-aw * 0.36, 0, R * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#FF6A5D', Math.sin(tt * 9) > 0 ? 1 : 0.35); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = U.fs(ah * 0.3, 800);
        ctx.fillStyle = U.rgba('#FFB4A8', 0.95);
        ctx.textAlign = 'left';
        ctx.fillText('ALERT · latency > 500ms', -aw * 0.26, 0);
        ctx.restore();
        ctx.textAlign = 'center';
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba('#5DFF8F', 0.9); ctx.fill();
        ctx.font = U.fs(R * 0.1 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.6);
        ctx.fillText('ALL SYSTEMS NORMAL', cx, cy + R * 0.2);
      }
    } else if (kind === 'funnel') {
      var fk4 = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var stages = 4;
      for (var st = 0; st < stages; st++) {
        var stk = U.clamp((fk4 - st * 0.12) / 0.88, 0, 1);
        if (stk <= 0.01) continue;
        var sw2 = W * (0.56 - st * 0.11) * stk;
        var sy2 = cy - R * 0.42 + st * (R * 0.84 / stages);
        ctx.beginPath();
        ctx.moveTo(cx - sw2 / 2, sy2);
        ctx.lineTo(cx + sw2 / 2, sy2);
        ctx.lineTo(cx + (W * (0.56 - (st + 1) * 0.11) * stk) / 2, sy2 + R * 0.84 / stages - R * 0.03);
        ctx.lineTo(cx - (W * (0.56 - (st + 1) * 0.11) * stk) / 2, sy2 + R * 0.84 / stages - R * 0.03);
        ctx.closePath();
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, st / stages), 0.85);
        ctx.fill();
        ctx.font = U.fs(R * 0.1, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.92);
        ctx.fillText(fmt(base * Math.pow(0.55, st)) , cx, sy2 + (R * 0.84 / stages) / 2 - R * 0.02);
      }
    } else if (kind === 'bubble') {
      var bk2 = e.outCubic(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var bi = 0; bi < 9; bi++) {
        var bkk = U.clamp((bk2 - bi * 0.07) / 0.9, 0, 1);
        if (bkk <= 0.01) continue;
        var bx = cx + (bi % 3 - 1) * R * 0.55 + Math.sin(tt + bi) * 6 * S;
        var by = cy + (Math.floor(bi / 3) - 1) * R * 0.5;
        var br = R * (0.08 + U.rnd(0, 0.12, bi)) * bkk;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.accent2, bi / 9), 0.4 + 0.5 * bkk);
        ctx.fill();
        ctx.font = U.fs(br * 0.7, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.85 * bkk);
        ctx.fillText(String(Math.round(base * U.rnd(0.1, 1, bi))), bx, by);
      }
    } else if (kind === 'num-roll') {
      var rows3 = 5;
      var rk = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      for (var nr = 0; nr < rows3; nr++) {
        var nk3 = U.clamp((rk - nr * 0.1) / 0.9, 0, 1);
        var nry = cy - R * 0.5 + nr * (R * 0.25);
        var target = Math.round(base * U.rnd(0.2, 1.5, nr));
        var shown = Math.round(target * nk3);
        ctx.font = U.fs(R * 0.14, 900);
        ctx.fillStyle = U.rgba(nr === 0 ? col : U.ink, 0.95 * nk3);
        ctx.fillText(fmt(shown).padStart(7, ' '), W * 0.34, nry);
        ctx.font = U.fs(R * 0.09 * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.45 * nk3);
        ctx.fillText('METRIC-' + (nr + 1), W * 0.18, nry);
        ctx.beginPath();
        ctx.moveTo(W * 0.6, nry);
        ctx.lineTo(W * 0.6 + W * 0.22 * nk3 * U.rnd(0.3, 1, nr), nry);
        ctx.lineWidth = 4 * S;
        ctx.strokeStyle = U.rgba(nr === 0 ? col : U.accent2, 0.7 * nk3);
        ctx.stroke();
      }
      ctx.textAlign = 'center';
    } else {
      ctx.font = U.fs(R * 0.2, 900);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(p.text, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '对比展示', type: 'block', dur: 6, poster: 0.45,
    params: CMP_PARAMS, draw: cmpDraw,
    ids: [
      { id: 'cmp-slider', name: '分屏推拉', tags: ['分屏', '前后'], desc: '分割线左右推移对比两版内容，改版对比标配。', cfg: { kind: 'slider' } },
      { id: 'cmp-wipe', name: '上下擦除', tags: ['擦除', '对比'], desc: '分界线纵向擦除对比，改版前后展示。', cfg: { kind: 'wipe' } },
      { id: 'cmp-vs', name: 'VS 碰撞', tags: ['VS', '对决'], desc: '两个方案从两侧撞入并弹出 VS 徽标。', cfg: { kind: 'vs' } },
      { id: 'cmp-labels', name: '前后标签', tags: ['标签', '切换'], desc: 'BEFORE/AFTER 带胶囊标签交替出现。', cfg: { kind: 'labels' } },
      { id: 'cmp-bars', name: '对比条', tags: ['条形', '数据'], desc: '两条对比条竞速增长，数据高低立现。', cfg: { kind: 'bars' } },
      { id: 'cmp-cards', name: '双卡翻转', tags: ['卡片', '翻转'], desc: '卡片左右压缩翻转切换 A/B 内容。', cfg: { kind: 'cards' } },
      { id: 'cmp-oscillate', name: '分屏振荡', tags: ['振荡', '分屏'], desc: '分割线来回振荡对比，营造拉扯感。', cfg: { kind: 'oscillate' } },
      { id: 'cmp-split-text', name: '一分为二', tags: ['分裂', '文字'], desc: '文字从中缝裂开两半，转折叙事。', cfg: { kind: 'split-text' } },
      { id: 'cmp-price', name: '价格对比', tags: ['价格', '促销'], desc: '原价划掉、现价弹出并挂省钱标签。', cfg: { kind: 'price' } },
      { id: 'cmp-scale', name: '大小对比', tags: ['大小', '缩放'], desc: '一侧缩放放大压过另一侧，优势对比。', cfg: { kind: 'scale' } },
      { id: 'cmp-ab', name: 'A/B 切换', tags: ['A/B', '开关'], desc: 'A/B 滑块开关往复切换，实验演示。', cfg: { kind: 'ab-toggle' } },
      { id: 'cmp-merge', name: '合二为一', tags: ['合并', '融合'], desc: '两个词向中间合并成一体，协同叙事。', cfg: { kind: 'merge' } }
    ]
  });

  MF.forge({
    cat: '时间轴', type: 'block', dur: 6.5, poster: 0.55,
    params: TL_PARAMS, draw: tlDraw,
    texts: ['调研,开发,测试,上线', '计划,执行,复盘', '冷启动,增长,成熟'],
    ids: [
      { id: 'tl-line', name: '主线生长', tags: ['时间轴', '生长'], desc: '主线随节点逐个点亮生长，项目叙事。', cfg: { kind: 'line' } },
      { id: 'tl-milestone', name: '里程碑弹出', tags: ['里程碑', '节点'], desc: '末位里程碑节点弹出高亮，达成时刻。', cfg: { kind: 'milestone' } },
      { id: 'tl-horizontal', name: '横向推进', tags: ['推进', '横向'], desc: '阶段卡片自左向右推进，流程演示。', cfg: { kind: 'horizontal' } },
      { id: 'tl-vertical', name: '纵向滚动', tags: ['纵向', '滚动'], desc: '阶段卡片自上而下滚动，汇报结构。', cfg: { kind: 'vertical' } },
      { id: 'tl-branch', name: '分支展开', tags: ['分支', '树状'], desc: '主线分出多条支线，架构与决策树。', cfg: { kind: 'branch' } },
      { id: 'tl-steps', name: '步骤倒计时', tags: ['步骤', '当前'], desc: '当前步骤高亮脉冲推进，任务流。', cfg: { kind: 'steps' } },
      { id: 'tl-process', name: '流程箭头链', tags: ['流程', '箭头'], desc: '编号方块加箭头串成流程链。', cfg: { kind: 'process' } },
      { id: 'tl-gantt', name: '甘特条', tags: ['甘特', '排期'], desc: '甘特条错峰生长并显示百分比，排期表。', cfg: { kind: 'gantt' } },
      { id: 'tl-dots', name: '节点连线', tags: ['节点', '自由'], desc: '自由布局的节点依次连线，思维导图感。', cfg: { kind: 'dots' } },
      { id: 'tl-flag', name: '插旗', tags: ['旗帜', '打卡'], desc: '节点下方小旗展开，打卡与里程碑。', cfg: { kind: 'flag' } },
      { id: 'tl-calendar', name: '日历翻格', tags: ['日历', '打卡'], desc: '日历格子逐个打勾，坚持打卡叙事。', cfg: { kind: 'calendar' } },
      { id: 'tl-progress-nodes', name: '进度节点', tags: ['进度', '脉冲'], desc: '节点沿圆环推进并显示当前阶段。', cfg: { kind: 'progress-nodes' } }
    ]
  });

  MF.forge({
    cat: '数据大屏', type: 'block', dur: 6.5, poster: 0.55,
    params: DASH_PARAMS, draw: dashDraw,
    texts: ['LIVE OPS', 'GROWTH', 'REALTIME'],
    ids: [
      { id: 'dash-kpi', name: 'KPI 翻牌', tags: ['KPI', '卡片'], desc: '核心指标翻牌滚动并带实时涨幅。', cfg: { kind: 'kpi' } },
      { id: 'dash-rank', name: '排行榜', tags: ['排行', '榜单'], desc: '榜单条形交替增长，竞争氛围。', cfg: { kind: 'rank' } },
      { id: 'dash-gauge-row', name: '三环仪表', tags: ['仪表', '资源'], desc: 'CPU/内存/IO 三环实时波动。', cfg: { kind: 'gauge-row' } },
      { id: 'dash-ticker', name: '实时跑马', tags: ['跑马', '行情'], desc: '多标的价格滚动涨跌，交易大屏。', cfg: { kind: 'ticker' } },
      { id: 'dash-heat', name: '热力格', tags: ['热力', '网格'], desc: '热力网格随时间流动，分布监控。', cfg: { kind: 'heat-grid' } },
      { id: 'dash-status', name: '状态灯板', tags: ['状态', '灯板'], desc: '节点状态灯闪烁巡检，运维大屏。', cfg: { kind: 'status' } },
      { id: 'dash-pie', name: '三饼', tags: ['饼图', '占比'], desc: '三个环形占比图逐个扫出。', cfg: { kind: 'pie-trio' } },
      { id: 'dash-spark', name: '走势墙', tags: ['走势', '墙'], desc: '多路迷你走势线同时律动。', cfg: { kind: 'spark-wall' } },
      { id: 'dash-progress', name: '进度墙', tags: ['进度', '墙'], desc: '多路进度条错峰充填。', cfg: { kind: 'progress-wall' } },
      { id: 'dash-area', name: '面积图生长', tags: ['面积图', '趋势'], desc: '面积图从左向右生长，增长叙事。', cfg: { kind: 'area-grow' } },
      { id: 'dash-clock', name: '世界时钟', tags: ['时钟', '全球'], desc: '三地时钟实时走针，跨国团队。', cfg: { kind: 'clock' } },
      { id: 'dash-flow', name: '数据流向', tags: ['流向', '链路'], desc: '数据沿链路逐段点亮流向出口。', cfg: { kind: 'flow' } },
      { id: 'dash-alert', name: '告警弹出', tags: ['告警', '监控'], desc: '告警卡片周期弹出又恢复，故障演练。', cfg: { kind: 'alert' } },
      { id: 'dash-funnel', name: '漏斗', tags: ['漏斗', '转化'], desc: '漏斗逐层收窄并显示转化数值。', cfg: { kind: 'funnel' } },
      { id: 'dash-bubble', name: '气泡矩阵', tags: ['气泡', '矩阵'], desc: '九宫气泡按权重浮动，分布概览。', cfg: { kind: 'bubble' } },
      { id: 'dash-num-roll', name: '数字列滚动', tags: ['数字', '指标列'], desc: '多行指标数字滚动到位并带刻度条。', cfg: { kind: 'num-roll' } }
    ]
  });
})();
