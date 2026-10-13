/* ==========================================================================
   Jaykou 动效库 · 14
   原语：涂鸦手绘（笔画渐进揭示） / 徽章印章（盖章与徽章动画）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：涂鸦手绘 ══════════════════════════ */

  var SCRIBBLE_PARAMS = [
    P('kind', '笔画', 'circle', sel('circle', [
      ['circle', '手绘圆圈'], ['underline', '手绘下划线'], ['arrow', '手绘箭头'],
      ['box', '手绘方框'], ['check', '手绘对勾'], ['cross', '手绘叉号'],
      ['star', '手绘星星'], ['heart', '手绘爱心'], ['highlight', '荧光笔涂抹'],
      ['loop', '循环圈'], ['spiral', '手绘螺旋'], ['cloud', '思考云'],
      ['double-circle', '双圈强调'], ['strike', '手绘删除线'], ['bracket', '手绘大括号'],
      ['flow', '手绘流程图'], ['burst', '爆炸强调线'], ['underline-wave', '波浪下划线']
    ])),
    P('text', '文字', '划重点', txt('划重点')),
    P('size', '字号', 211, rng(211, 36, 295, 2)),
    P('stroke', '笔宽', 7, rng(7, 2, 22, 0.5)),
    P('speed', '绘制速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('wobble', '手抖幅度', 6, rng(6, 0, 18, 0.5)),
    P('ink2', '笔迹颜色', '$accent', col('$accent')),
    P('glow', '辉光', 0.3, rng(0.3, 0, 1, 0.05))
  ];

  function scribbleDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var k = e.inOutCubic(U.clamp(t * p.speed / 2.4, 0, 1));
    var alpha = U.clamp(t * 3, 0, 1) * U.clamp((U.D - t) * 2.2, 0, 1);
    var lw = p.stroke * S;
    var wob = p.wobble * S;
    var col = U.rgba(p.ink2, alpha);
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = lw;
    ctx.strokeStyle = col;
    if (p.glow > 0.03) { ctx.shadowColor = U.rgba(p.ink2, 0.7 * p.glow); ctx.shadowBlur = 18 * S * p.glow; }

    /* 按进度揭示一条折线路径 */
    function stroke(pts) {
      var n = pts.length;
      var m = Math.max(2, Math.round(n * k));
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < m; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }
    /* 生成带手抖的路径点 */
    function jig(pts) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        out.push([
          pts[i][0] + (U.rnd(-1, 1, i * 3 + 1)) * wob,
          pts[i][1] + (U.rnd(-1, 1, i * 3 + 2)) * wob
        ]);
      }
      return out;
    }

    var cx = W / 2, cy = H / 2;
    var fs = p.size * S;
    var i, a, pts, r;
    var label = String(p.text || '');
    ctx.fillStyle = U.rgba(U.ink, alpha);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    var kind = p.kind;
    if (kind === 'circle' || kind === 'double-circle') {
      var size = ctx.measureText ? 0 : 0;
      ctx.font = U.fs(fs, 800);
      var tw = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.fillText(label, cx, cy - fs * 0.15);
      r = tw * 0.56;
      pts = [];
      for (i = 0; i <= 44; i++) {
        a = (i / 44) * Math.PI * 2.24 - 2.2;
        var rr2 = r * (1 + 0.05 * Math.sin(i * 0.7));
        pts.push([cx + Math.cos(a) * rr2, cy + fs * 0.28 + Math.sin(a) * rr2 * 0.42]);
      }
      stroke(jig(pts));
      if (kind === 'double-circle' && k > 0.55) {
        var k2 = e.outCubic(U.clamp((k - 0.55) / 0.4, 0, 1));
        ctx.save(); ctx.globalAlpha = alpha * k2 * 0.75; ctx.lineWidth = lw * 0.62;
        stroke(jig(pts.map(function (q) { return [q[0] + lw * 0.9, q[1] - lw * 0.7]; })));
        ctx.restore();
      }
    } else if (kind === 'underline' || kind === 'underline-wave') {
      ctx.font = U.fs(fs, 800);
      var tw2 = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.fillText(label, cx, cy);
      pts = [];
      for (i = 0; i <= 36; i++) {
        var xx = cx - tw2 / 2 + (i / 36) * tw2;
        var yy = cy + fs * 0.62;
        if (kind === 'underline-wave') yy += Math.sin(i * 0.9) * fs * 0.09;
        pts.push([xx, yy]);
      }
      ctx.lineWidth = lw * 1.1;
      stroke(jig(pts));
    } else if (kind === 'arrow') {
      ctx.font = U.fs(fs, 800);
      ctx.fillText(label, cx - fs * 0.4, cy);
      pts = jig([[cx + fs * 0.7, cy - fs * 0.5], [cx + fs * 2.0, cy + fs * 0.3]]);
      stroke(pts);
      var hk = e.outCubic(U.clamp((k - 0.7) / 0.3, 0, 1));
      if (hk > 0.01) {
        var tipX = cx + fs * 2.0, tipY = cy + fs * 0.3;
        pts = jig([[tipX - fs * 0.42 * hk, tipY - fs * 0.3 * hk], [tipX, tipY], [tipX - fs * 0.5 * hk, tipY + fs * 0.1 * hk]]);
        stroke(pts);
      }
    } else if (kind === 'box') {
      ctx.font = U.fs(fs, 800);
      var tw3 = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.fillText(label, cx, cy);
      var bw = tw3 * 1.16, bh = fs * 1.5;
      pts = jig([[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2], [cx + bw / 2, cy + bh / 2], [cx - bw / 2, cy + bh / 2], [cx - bw / 2, cy - bh / 2]]);
      stroke(pts);
    } else if (kind === 'check' || kind === 'cross') {
      var u2 = fs * 0.9;
      if (kind === 'check') {
        stroke(jig([[cx - u2, cy], [cx - u2 * 0.2, cy + u2 * 0.6]]));
        if (k > 0.4) { var kk = U.clamp((k - 0.4) / 0.55, 0, 1); ctx.save(); ctx.beginPath(); ctx.moveTo(cx - u2 * 0.2, cy + u2 * 0.6); ctx.lineTo(cx - u2 * 0.2 + (u2 * 1.5) * kk, cy + u2 * 0.6 - (u2 * 1.7) * kk); ctx.stroke(); ctx.restore(); }
      } else {
        stroke(jig([[cx - u2 * 0.7, cy - u2 * 0.7], [cx + u2 * 0.7, cy + u2 * 0.7]]));
        if (k > 0.45) { var k3 = U.clamp((k - 0.45) / 0.5, 0, 1); ctx.save(); ctx.beginPath(); ctx.moveTo(cx + u2 * 0.7, cy - u2 * 0.7); ctx.lineTo(cx + u2 * 0.7 - u2 * 1.4 * k3, cy - u2 * 0.7 + u2 * 1.4 * k3); ctx.stroke(); ctx.restore(); }
      }
      ctx.font = U.fs(fs * 0.62, 700); ctx.globalAlpha = alpha * e.outCubic(k);
      ctx.fillText(label, cx, cy + fs * 1.35); ctx.globalAlpha = alpha;
    } else if (kind === 'star') {
      pts = [];
      for (i = 0; i <= 10; i++) {
        a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        r = (i % 2 ? 0.45 : 1) * fs;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      stroke(jig(pts));
      ctx.font = U.fs(fs * 0.6, 700); ctx.globalAlpha = alpha * e.outCubic(U.clamp((k - 0.6) / 0.35, 0, 1));
      ctx.fillText(label, cx, cy + fs * 1.5); ctx.globalAlpha = alpha;
    } else if (kind === 'heart') {
      pts = [];
      for (i = 0; i <= 48; i++) {
        a = Math.PI - (i / 48) * Math.PI * 2;
        var hx = 16 * Math.pow(Math.sin(a), 3) / 16;
        var hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16;
        pts.push([cx + hx * fs, cy + hy * fs]);
      }
      stroke(jig(pts));
      ctx.font = U.fs(fs * 0.5, 700); ctx.globalAlpha = alpha * e.outCubic(U.clamp((k - 0.7) / 0.3, 0, 1));
      ctx.fillText(label, cx, cy); ctx.globalAlpha = alpha;
    } else if (kind === 'highlight') {
      ctx.font = U.fs(fs, 800);
      var tw4 = Math.max(fs * 2, ctx.measureText(label).width);
      var hk2 = e.outCubic(k);
      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      var hy2 = cy + fs * 0.06;
      var grad = ctx.createLinearGradient(cx - tw4 / 2, 0, cx - tw4 / 2 + tw4 * hk2, 0);
      grad.addColorStop(0, U.rgba(p.ink2, 0.85)); grad.addColorStop(1, U.rgba(p.ink2, 0.55));
      ctx.fillStyle = grad;
      ctx.fillRect(cx - tw4 / 2, hy2 - fs * 0.42, tw4 * hk2, fs * 0.84);
      ctx.restore();
      ctx.fillStyle = U.rgba(U.ink, alpha);
      ctx.fillText(label, cx, cy);
    } else if (kind === 'loop') {
      pts = [];
      for (i = 0; i <= 60; i++) {
        a = (i / 60) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * fs * 0.9, cy + Math.sin(a * 2) * fs * 0.34]);
      }
      stroke(jig(pts));
    } else if (kind === 'spiral') {
      pts = [];
      for (i = 0; i <= 80; i++) {
        a = (i / 80) * Math.PI * 5;
        r = fs * 0.12 * i;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      stroke(jig(pts));
    } else if (kind === 'cloud') {
      ctx.font = U.fs(fs * 0.55, 700);
      var tw5 = Math.max(fs, ctx.measureText(label).width);
      r = fs * 0.85;
      pts = [];
      for (i = 0; i <= 64; i++) {
        a = (i / 64) * Math.PI * 2;
        var rr3 = r * (1 + 0.22 * Math.sin(a * 5 + 1.2));
        pts.push([cx + Math.cos(a) * rr3 * 1.5, cy + Math.sin(a) * rr3 * 0.85]);
      }
      stroke(jig(pts));
      ctx.globalAlpha = alpha * e.outCubic(U.clamp((k - 0.6) / 0.35, 0, 1));
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(label, cx, cy);
      pts = jig([[cx + fs * 0.3, cy + fs * 0.75], [cx + fs * 0.1, cy + fs * 1.05], [cx + fs * 0.42, cy + fs * 1.0]]);
      ctx.save(); ctx.globalAlpha = alpha * 0.7; stroke(pts); ctx.restore();
      ctx.globalAlpha = alpha;
    } else if (kind === 'strike') {
      ctx.font = U.fs(fs, 800);
      var tw6 = Math.max(fs * 2, ctx.measureText(label).width);
      ctx.globalAlpha = alpha * (1 - 0.55 * e.outCubic(U.clamp((k - 0.5) / 0.4, 0, 1)));
      ctx.fillText(label, cx, cy); ctx.globalAlpha = alpha;
      pts = jig([[cx - tw6 / 2 - fs * 0.1, cy - fs * 0.12], [cx + tw6 / 2 + fs * 0.1, cy + fs * 0.18]]);
      stroke(pts);
    } else if (kind === 'bracket') {
      ctx.font = U.fs(fs, 800);
      ctx.fillText(label, cx + fs * 0.3, cy);
      var bh2 = fs * 1.5, bx = cx - fs * 1.4;
      pts = jig([[bx + fs * 0.35, cy - bh2 / 2], [bx, cy - bh2 / 2], [bx, cy + bh2 / 2], [bx + fs * 0.35, cy + bh2 / 2]]);
      stroke(pts);
    } else if (kind === 'flow') {
      var steps = label.split(/[,，|]/).filter(Boolean).slice(0, 4);
      if (!steps.length) steps = ['想法', '行动', '结果'];
      var gap = W * 0.62 / steps.length;
      for (i = 0; i < steps.length; i++) {
        var fx = W * 0.19 + i * gap;
        var shown = e.outCubic(U.clamp((k - i * 0.16) / 0.3, 0, 1));
        ctx.globalAlpha = alpha * shown;
        ctx.font = U.fs(fs * 0.52, 700);
        ctx.fillStyle = U.rgba(U.ink, 1);
        ctx.fillText(steps[i], fx, cy - fs * 0.12);
        var bw2 = Math.max(fs * 1.6, ctx.measureText(steps[i]).width + fs * 0.5);
        ctx.save(); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = col;
        stroke(jig([[fx - bw2 / 2, cy - fs * 0.72], [fx + bw2 / 2, cy - fs * 0.72], [fx + bw2 / 2, cy + fs * 0.5], [fx - bw2 / 2, cy + fs * 0.5], [fx - bw2 / 2, cy - fs * 0.72]]));
        ctx.restore();
        if (i < steps.length - 1 && k > i * 0.16 + 0.2) {
          var ak = e.outCubic(U.clamp((k - i * 0.16 - 0.2) / 0.16, 0, 1));
          ctx.globalAlpha = alpha * ak;
          var ax0 = fx + bw2 / 2 + fs * 0.1, ax1 = fx + gap - bw2 / 2 - fs * 0.1;
          stroke(jig([[ax0, cy - fs * 0.1], [U.lerp(ax0, ax1, ak), cy - fs * 0.1]]));
        }
        ctx.globalAlpha = alpha;
      }
    } else if (kind === 'burst') {
      ctx.font = U.fs(fs, 800);
      ctx.fillText(label, cx, cy);
      for (var b = 0; b < 9; b++) {
        var ba = -Math.PI * 0.9 + (b / 8) * Math.PI * 1.15;
        var bk = e.outCubic(U.clamp((k - b * 0.04) / 0.5, 0, 1));
        if (bk <= 0.02) continue;
        var r0 = fs * 0.95, r1 = fs * (0.95 + 0.75 * bk);
        pts = jig([[cx + Math.cos(ba) * r0, cy + Math.sin(ba) * r0 * 0.8], [cx + Math.cos(ba) * r1, cy + Math.sin(ba) * r1 * 0.8]]);
        ctx.save(); ctx.lineWidth = lw * 0.6; ctx.globalAlpha = alpha * bk; stroke(pts); ctx.restore();
      }
      ctx.globalAlpha = alpha;
    } else {
      stroke(jig([[cx - fs, cy], [cx + fs, cy]]));
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：徽章印章 ══════════════════════════ */

  var BADGE_PARAMS = [
    P('kind', '形态', 'stamp-slam', sel('stamp-slam', [
      ['stamp-slam', '印章砸落'], ['stamp-pulse', '印章脉冲'], ['badge-ribbon', '缎带徽章'],
      ['badge-verified', '认证徽章'], ['badge-coin', '硬币旋转'], ['badge-laurel', '月桂环绕'],
      ['badge-shield', '盾牌徽章'], ['stamp-ink', '油墨晕染'], ['badge-seal', '环形文字印章'],
      ['badge-medal', '奖牌绶带'], ['stamp-wobble', '回弹印章'], ['badge-serial', '序号徽章']
    ])),
    P('text', '主文字', '已认证', txt('已认证')),
    P('sub', '副文字', '', txt('')),
    P('size', '尺寸', 300, rng(300, 120, 520, 4)),
    P('speed', '速度', 1, rng(1, 0.5, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.25, rng(0.25, 0, 1, 0.05))
  ];

  function badgeDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var sub = String(p.sub || '');
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    function stampText(size, weight, color) {
      ctx.font = U.fs(size * S, weight || 800);
      ctx.fillStyle = color;
    }
    function ring(rr2, lw2, c, a1, a2) {
      ctx.beginPath();
      ctx.arc(cx, cy, rr2, a1 || 0, a2 === undefined ? Math.PI * 2 : a2);
      ctx.lineWidth = lw2 * S;
      ctx.strokeStyle = c;
      ctx.stroke();
    }
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.75 * amt); ctx.shadowBlur = 26 * S * amt; }
    }

    if (kind === 'stamp-slam' || kind === 'stamp-wobble' || kind === 'stamp-ink') {
      var hit = e.outCubic(U.clamp(tt / 0.55, 0, 1));
      var sc = 1 + (1 - hit) * 1.6;
      var rot = (1 - hit) * 0.16;
      var alpha = U.clamp(tt * 4, 0, 1);
      if (kind === 'stamp-wobble') {
        var wob2 = Math.sin(tt * 26) * Math.exp(-tt * 3.2) * 0.09;
        rot += wob2; sc = 1 + Math.abs(wob2) * 0.3;
      }
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
      var inkA = kind === 'stamp-ink' ? 0.9 : 1;
      glowOn(col, p.glow * hit);
      ring(R, R * 0.075, U.rgba(col, 0.95 * inkA * hit));
      ring(R * 0.82, R * 0.02, U.rgba(col, 0.55 * inkA * hit));
      stampText(R * 0.42, 900, U.rgba(col, inkA * hit));
      ctx.fillText(label, cx, cy - (sub ? R * 0.08 : 0));
      if (sub) { stampText(R * 0.16, 600, U.rgba(col, 0.8 * inkA * hit)); ctx.fillText(sub, cx, cy + R * 0.34); }
      ctx.shadowBlur = 0;
      var i2;
      for (i2 = 0; i2 < 12; i2++) {
        var a2 = (i2 / 12) * Math.PI * 2 + 0.26;
        var r2 = R * 0.93;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2, R * 0.028, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.9 * inkA * hit);
        ctx.fill();
      }
    } else if (kind === 'stamp-pulse') {
      var base = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      var pulse = 1 + Math.sin(tt * 3.4) * 0.018;
      ctx.translate(cx, cy); ctx.scale(base * pulse, base * pulse); ctx.translate(-cx, -cy);
      glowOn(col, p.glow);
      ring(R, R * 0.08, U.rgba(col, 0.95));
      ring(R * 0.86, R * 0.016, U.rgba(col, 0.5));
      stampText(R * 0.4, 900, U.rgba(col, 1));
      ctx.fillText(label, cx, cy);
      var pk = (tt * 0.9) % 1;
      ctx.globalAlpha = (1 - pk) * 0.5 * U.clamp(tt, 0, 1);
      ring(R * (0.9 + pk * 0.5), R * 0.03 * (1 - pk), U.rgba(col, 1));
    } else if (kind === 'badge-ribbon' || kind === 'badge-medal') {
      var open = e.outBack(U.clamp(tt / 0.85, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.2, 0, 1);
      var rw = R * 0.42 * open, rh = R * 0.9;
      glowOn(col, p.glow * 0.5);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.beginPath();
      ctx.moveTo(cx - rw * 0.55, cy - rh * 0.15);
      ctx.lineTo(cx - rw, cy + rh * 0.85);
      ctx.lineTo(cx - rw * 0.55, cy + rh * 0.62);
      ctx.lineTo(cx - rw * 0.2, cy + rh * 0.8);
      ctx.lineTo(cx - rw * 0.28, cy - rh * 0.1);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + rw * 0.55, cy - rh * 0.15);
      ctx.lineTo(cx + rw, cy + rh * 0.85);
      ctx.lineTo(cx + rw * 0.55, cy + rh * 0.62);
      ctx.lineTo(cx + rw * 0.2, cy + rh * 0.8);
      ctx.lineTo(cx + rw * 0.28, cy - rh * 0.1);
      ctx.closePath(); ctx.fill();
      var medalR = R * 0.5 * open;
      var mg = ctx.createLinearGradient(cx - medalR, cy - medalR, cx + medalR, cy + medalR);
      mg.addColorStop(0, U.rgba(col, 1)); mg.addColorStop(1, U.rgba(U.mix(col, U.accent2, 0.45), 1));
      ctx.beginPath(); ctx.arc(cx, cy - R * 0.06, medalR, 0, Math.PI * 2);
      ctx.fillStyle = mg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - R * 0.06, medalR * 0.78, 0, Math.PI * 2);
      ctx.lineWidth = R * 0.022 * S; ctx.strokeStyle = U.rgba(U.bg1, 0.5); ctx.stroke();
      stampText(medalR * 0.62, 900, U.rgba(U.bg1, 0.92));
      ctx.fillText(label.charAt(0) || '★', cx, cy - R * 0.06);
      if (sub) { stampText(R * 0.14, 700, U.rgba(U.ink, 0.9)); ctx.fillText(sub, cx, cy + R * 0.52); }
    } else if (kind === 'badge-verified') {
      var pop = e.outBack(U.clamp(tt / 0.6, 0, 1));
      var fade = U.clamp(tt * 3.6, 0, 1);
      ctx.globalAlpha = fade;
      glowOn(col, p.glow);
      ctx.beginPath();
      for (var s3 = 0; s3 < 24; s3++) {
        var sa = (s3 / 24) * Math.PI * 2;
        var sr = R * 0.52 * (1 + 0.06 * Math.sin(sa * 8)) * pop;
        if (!s3) ctx.moveTo(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr);
        else ctx.lineTo(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr);
      }
      ctx.closePath();
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      var ck = e.outCubic(U.clamp((tt - 0.35) / 0.4, 0, 1));
      ctx.lineWidth = R * 0.075 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = U.rgba(U.bg1, 0.95);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.2, cy - R * 0.02);
      ctx.lineTo(cx - R * 0.05, cy + R * 0.13 * Math.min(1, ck * 2));
      if (ck > 0.4) ctx.lineTo(cx - R * 0.05 + R * 0.36 * U.clamp((ck - 0.4) / 0.6, 0, 1), cy + R * 0.13 - R * 0.34 * U.clamp((ck - 0.4) / 0.6, 0, 1));
      ctx.stroke();
      ctx.shadowBlur = 0;
      stampText(R * 0.2, 800, U.rgba(U.ink, fade * e.outCubic(U.clamp((tt - 0.7) / 0.4, 0, 1))));
      ctx.fillText(label, cx, cy + R * 0.85);
    } else if (kind === 'badge-coin') {
      var flip = tt * 2.2;
      var squash = Math.abs(Math.cos(flip));
      var face = Math.cos(flip) >= 0;
      var cp = e.outCubic(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var cy2 = cy + (1 - cp) * -R * 0.4;
      glowOn(col, p.glow * 0.6);
      var cg = ctx.createLinearGradient(cx - R * 0.5, cy2 - R * 0.5, cx + R * 0.5, cy2 + R * 0.5);
      cg.addColorStop(0, U.rgba(U.mix(col, U.ink, 0.3), 1));
      cg.addColorStop(1, U.rgba(col, 1));
      ctx.save();
      ctx.translate(cx, cy2);
      ctx.scale(Math.max(0.06, squash), 1);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.lineWidth = R * 0.03 * S; ctx.strokeStyle = U.rgba(U.bg1, 0.4); ctx.stroke();
      if (face) {
        stampText(R * 0.36, 900, U.rgba(U.bg1, 0.9));
        ctx.fillText(label.charAt(0) || '★', 0, 0);
      } else {
        ring(R * 0.34, R * 0.025, U.rgba(U.bg1, 0.5));
        stampText(R * 0.14, 700, U.rgba(U.bg1, 0.8));
        ctx.fillText(String(Math.max(1, Math.round(p.size / 10))), 0, 0);
      }
      ctx.restore();
      stampText(R * 0.17, 800, U.rgba(U.ink, U.clamp((tt - 0.8) / 0.4, 0, 1)));
      ctx.fillText(label, cx, cy + R * 0.8);
    } else if (kind === 'badge-laurel') {
      var grow = e.outCubic(U.clamp(tt / 1.1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var side = -1; side <= 1; side += 2) {
        for (var lf = 0; lf < 7; lf++) {
          var lk = U.clamp((grow - lf * 0.07) / 0.4, 0, 1);
          if (lk <= 0.02) continue;
          var la = -Math.PI * 0.28 + lf * 0.16;
          var lx = cx + side * Math.cos(la) * R * 0.62;
          var ly = cy + Math.sin(-la) * R * 0.62 + R * 0.12;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(side * (la + Math.PI * 0.5) * 0.6);
          ctx.scale(lk, lk);
          ctx.beginPath();
          ctx.ellipse(0, 0, R * 0.1, R * 0.035, 0, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.mix(col, U.accent2, lf / 9), 0.95);
          ctx.fill();
          ctx.restore();
        }
      }
      glowOn(col, p.glow);
      ring(R * 0.42, R * 0.05, U.rgba(col, grow));
      stampText(R * 0.3, 900, U.rgba(col, grow));
      ctx.fillText(label.charAt(0) || '★', cx, cy);
      stampText(R * 0.18, 800, U.rgba(U.ink, e.outCubic(U.clamp((tt - 0.9) / 0.5, 0, 1))));
      ctx.fillText(label, cx, cy + R * 0.95);
      if (sub) { stampText(R * 0.12, 600, U.rgba(U.ink, 0.75)); ctx.fillText(sub, cx, cy + R * 1.18); }
    } else if (kind === 'badge-shield') {
      var up = e.outCubic(U.clamp(tt / 0.8, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      ctx.translate(cx, cy); ctx.scale(up, up); ctx.translate(-cx, -cy);
      glowOn(col, p.glow * 0.6);
      var sw = R * 0.72, sh = R * 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - sw, cy - sh * 0.55);
      ctx.lineTo(cx + sw, cy - sh * 0.55);
      ctx.lineTo(cx + sw, cy + sh * 0.12);
      ctx.quadraticCurveTo(cx + sw, cy + sh * 0.6, cx, cy + sh);
      ctx.quadraticCurveTo(cx - sw, cy + sh * 0.6, cx - sw, cy + sh * 0.12);
      ctx.closePath();
      ctx.fillStyle = U.rgba(col, 0.16); ctx.fill();
      ctx.lineWidth = R * 0.05 * S; ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      var ck2 = e.outCubic(U.clamp((tt - 0.5) / 0.45, 0, 1));
      ctx.lineWidth = R * 0.07 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = U.rgba(col, 1);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.22, cy - R * 0.04);
      ctx.lineTo(cx - R * 0.05, cy + R * 0.12 * Math.min(1, ck2 * 2));
      if (ck2 > 0.4) ctx.lineTo(cx - R * 0.05 + R * 0.4 * U.clamp((ck2 - 0.4) / 0.6, 0, 1), cy + R * 0.12 - R * 0.36 * U.clamp((ck2 - 0.4) / 0.6, 0, 1));
      ctx.stroke();
      stampText(R * 0.2, 800, U.rgba(U.ink, e.outCubic(U.clamp((tt - 0.9) / 0.4, 0, 1))));
      ctx.fillText(label, cx, cy + R * 1.15);
    } else if (kind === 'badge-seal') {
      var spin = e.outCubic(U.clamp(tt / 0.9, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tt * 0.18);
      var chars = (label + '  ·  ' + (sub || 'AUTHENTIC') + '  ·  ').toUpperCase();
      ctx.font = U.fs(R * 0.14, 700);
      ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.3), 0.9);
      for (var ci = 0; ci < chars.length; ci++) {
        var ca = (ci / chars.length) * Math.PI * 2;
        ctx.save();
        ctx.translate(Math.cos(ca) * R * 0.68, Math.sin(ca) * R * 0.68);
        ctx.rotate(ca + Math.PI / 2);
        ctx.fillText(chars.charAt(ci), 0, 0);
        ctx.restore();
      }
      ctx.restore();
      glowOn(col, p.glow);
      ring(R * 0.5, R * 0.05, U.rgba(col, spin));
      ring(R * 0.56, R * 0.012, U.rgba(col, spin * 0.6));
      stampText(R * 0.34, 900, U.rgba(col, spin));
      ctx.fillText((label.charAt(0) || '★'), cx, cy);
    } else if (kind === 'badge-serial') {
      var up2 = e.outBack(U.clamp(tt / 0.7, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.2, 0, 1);
      ctx.translate(cx, cy); ctx.scale(up2, up2); ctx.translate(-cx, -cy);
      glowOn(col, p.glow * 0.4);
      var bw3 = R * 1.15, bh3 = R * 0.5;
      U.rr(ctx, cx - bw3 / 2, cy - bh3 / 2, bw3, bh3, bh3 * 0.32);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      var serial = String(Math.max(1, Math.round(p.size / 10)));
      stampText(bh3 * 0.5, 900, U.rgba(U.bg1, 0.95));
      ctx.fillText('#' + serial, cx, cy);
      stampText(R * 0.19, 800, U.rgba(U.ink, e.outCubic(U.clamp((tt - 0.6) / 0.4, 0, 1))));
      ctx.fillText(label, cx, cy + bh3 * 1.15);
    } else {
      ring(R * 0.5, R * 0.05, U.rgba(col, 0.95));
      stampText(R * 0.35, 900, U.rgba(col, 1));
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '涂鸦手绘', type: 'block', dur: 5, poster: 0.5,
    params: SCRIBBLE_PARAMS, draw: scribbleDraw,
    texts: ['划重点', '别错过', '核心观点', '记住这句', '关键一步', '今天就做'],
    ids: [
      { id: 'scr-circle', name: '手绘圈重点', tags: ['圈选', '强调'], desc: '手绘圆圈围绕文字缓缓画成，是最百搭的重点强调方式。', cfg: { kind: 'circle' } },
      { id: 'scr-underline', name: '手绘下划线', tags: ['下划线', '强调'], desc: '一笔手绘下划线扫过文字底部，笔记感十足。', cfg: { kind: 'underline' } },
      { id: 'scr-arrow', name: '手绘箭头', tags: ['箭头', '指向'], desc: '手绘箭头从文字指向侧方，用于引导视线。', cfg: { kind: 'arrow' } },
      { id: 'scr-box', name: '手绘方框', tags: ['方框', '圈选'], desc: '手绘方框围住文字，比圆圈更利落的强调。', cfg: { kind: 'box' } },
      { id: 'scr-check', name: '手绘对勾', tags: ['对勾', '完成'], desc: '两笔手绘对勾，代表完成与确认。', cfg: { kind: 'check' } },
      { id: 'scr-cross', name: '手绘叉号', tags: ['叉号', '否定'], desc: '手绘叉号划过，用于否定与排除。', cfg: { kind: 'cross' } },
      { id: 'scr-star', name: '手绘星星', tags: ['星星', '推荐'], desc: '一笔画成的五角星，推荐与评分场景。', cfg: { kind: 'star' } },
      { id: 'scr-heart', name: '手绘爱心', tags: ['爱心', '喜欢'], desc: '手绘爱心围绕文字，情感表达。', cfg: { kind: 'heart' } },
      { id: 'scr-highlight', name: '荧光笔涂抹', tags: ['荧光', '高亮'], desc: '荧光笔从左到右涂抹高亮文字，笔记质感强。', cfg: { kind: 'highlight' } },
      { id: 'scr-loop', name: '循环圈', tags: ['循环', '无限'], desc: '手绘无限循环符号，表达持续与循环。', cfg: { kind: 'loop', size: 420 } },
      { id: 'scr-spiral', name: '手绘螺旋', tags: ['螺旋', '聚焦'], desc: '螺旋线由内向外画成，聚焦视觉中心。', cfg: { kind: 'spiral' } },
      { id: 'scr-cloud', name: '思考云', tags: ['云朵', '想法'], desc: '手绘思考云朵包住想法文字，头脑风暴场景。', cfg: { kind: 'cloud' } },
      { id: 'scr-double', name: '双圈强调', tags: ['双圈', '重点'], desc: '两个错位手绘圆圈叠加强调，更浓的笔记感。', cfg: { kind: 'double-circle' } },
      { id: 'scr-strike', name: '手绘删除线', tags: ['删除', '更正'], desc: '删除线划过文字并使其变淡，用于更正与否定。', cfg: { kind: 'strike' } },
      { id: 'scr-bracket', name: '手绘大括号', tags: ['括号', '归纳'], desc: '手绘大括号括起内容，归纳与注解。', cfg: { kind: 'bracket' } },
      { id: 'scr-flow', name: '手绘流程图', tags: ['流程', '步骤'], desc: '手绘方框加箭头串起步骤，逗号分隔填入阶段。', cfg: { kind: 'flow', text: '想法, 验证, 迭代, 发布' } },
      { id: 'scr-burst', name: '爆炸强调线', tags: ['爆炸', '强调'], desc: '放射状手绘短线从文字四周炸开，情绪拉满。', cfg: { kind: 'burst' } },
      { id: 'scr-wave', name: '波浪下划线', tags: ['波浪', '活泼'], desc: '波浪形手绘下划线，比直线更活泼。', cfg: { kind: 'underline-wave' } }
    ]
  });

  MF.forge({
    cat: '徽章印章', type: 'block', dur: 5, poster: 0.35,
    params: BADGE_PARAMS, draw: badgeDraw,
    texts: ['已认证', '新品上市', '限时特惠', '官方出品', '满额包邮', '爆款'],
    ids: [
      { id: 'bdg-stamp-slam', name: '印章砸落', tags: ['印章', '冲击'], desc: '印章从高处砸落并带回弹，促销与强调利器。', cfg: { kind: 'stamp-slam' } },
      { id: 'bdg-stamp-pulse', name: '印章脉冲', tags: ['印章', '呼吸'], desc: '盖章后缓慢脉冲呼吸，持续提示。', cfg: { kind: 'stamp-pulse' } },
      { id: 'bdg-ribbon', name: '缎带徽章', tags: ['缎带', '勋章'], desc: '双缎带展开托起圆形勋章，荣誉与活动场景。', cfg: { kind: 'badge-ribbon' } },
      { id: 'bdg-verified', name: '认证徽章', tags: ['认证', '对勾'], desc: '认证徽标弹出后打勾，信任感表达。', cfg: { kind: 'badge-verified' } },
      { id: 'bdg-coin', name: '硬币旋转', tags: ['硬币', '旋转'], desc: '硬币绕竖轴旋转翻转，金融与奖励场景。', cfg: { kind: 'badge-coin' } },
      { id: 'bdg-laurel', name: '月桂环绕', tags: ['月桂', '荣耀'], desc: '月桂叶逐片生长环绕徽标，冠军与荣誉感。', cfg: { kind: 'badge-laurel' } },
      { id: 'bdg-shield', name: '盾牌徽章', tags: ['盾牌', '安全'], desc: '盾牌升起后打勾，安全与保障表达。', cfg: { kind: 'badge-shield' } },
      { id: 'bdg-ink', name: '油墨晕染印章', tags: ['印章', '复古'], desc: '印章落下带油墨质感，复古票据风。', cfg: { kind: 'stamp-ink' } },
      { id: 'bdg-seal', name: '环形文字印章', tags: ['环形', '印章'], desc: '环形文字绕着印章缓慢旋转，公证与封印质感。', cfg: { kind: 'badge-seal' } },
      { id: 'bdg-medal', name: '奖牌绶带', tags: ['奖牌', '排名'], desc: '奖牌与绶带展开，排行榜与获奖场景。', cfg: { kind: 'badge-medal' } },
      { id: 'bdg-wobble', name: '回弹印章', tags: ['印章', '俏皮'], desc: '盖章后左右摇摆回弹，俏皮的强调。', cfg: { kind: 'stamp-wobble' } },
      { id: 'bdg-serial', name: '序号徽章', tags: ['序号', '限量'], desc: '圆角序号徽章弹出，限量与编号场景。', cfg: { kind: 'badge-serial' } }
    ]
  });
})();
