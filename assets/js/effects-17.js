/* ==========================================================================
   Jaykou 动效库 · 17
   原语：地图轨迹（定位 / 航线 / 雷达） / 拼贴手账（照片网格 / 贴纸 / 胶片）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：地图轨迹 ══════════════════════════ */

  var MAP_PARAMS = [
    P('kind', '形态', 'route', sel('route', [
      ['route', '路线描绘'], ['pin', '定位图钉'], ['radar', '雷达扫描'],
      ['globe', '经纬线球'], ['compass', '罗盘'], ['dots', '点阵地图'],
      ['flight', '航线弧线'], ['heat', '热力扩散'], ['grid-locate', '网格定位'],
      ['cluster', '多点聚合'], ['contour', '等高线'], ['gps', 'GPS 波纹']
    ])),
    P('text', '地名', 'SHENZHEN', txt('SHENZHEN')),
    P('size', '基准尺寸', 340.0, rng(340.0, 1848, 780.0, 4.0)),
    P('points', '节点数', 6, rng(6, 2, 16, 1)),
    P('speed', '速度', 1, rng(1, 0.4, 2.2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  function mapDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var n = Math.max(2, Math.round(p.points));
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.85 * amt); ctx.shadowBlur = 26 * S * amt; }
    }
    function pin(x, y, s2, a2, c) {
      ctx.globalAlpha *= 1;
      ctx.save();
      ctx.translate(x, y); ctx.scale(s2, s2);
      ctx.beginPath();
      ctx.arc(0, -s2 * 0.8, s2 * 0.55, Math.PI * 0.85, Math.PI * 0.15, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = U.rgba(c, a2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -s2 * 0.8, s2 * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg1, a2); ctx.fill();
      ctx.restore();
    }

    if (kind === 'route') {
      var pts = [];
      for (var i = 0; i < n; i++) {
        pts.push([W * U.rnd(0.2, 0.8, i * 2), H * U.rnd(0.28, 0.72, i * 2 + 1)]);
      }
      var total = n - 1;
      var prog = e.inOutCubic(U.clamp(tt / 2.6, 0, 1));
      var seg = prog * total;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      /* 底图网格 */
      ctx.strokeStyle = U.rgba(U.ink, 0.07);
      ctx.lineWidth = 1.5 * S;
      for (var gx = 0; gx <= 8; gx++) {
        ctx.beginPath(); ctx.moveTo(W * (0.1 + gx * 0.1), H * 0.12); ctx.lineTo(W * (0.1 + gx * 0.1), H * 0.88); ctx.stroke();
      }
      for (var gy = 0; gy <= 5; gy++) {
        ctx.beginPath(); ctx.moveTo(W * 0.1, H * (0.12 + gy * 0.152)); ctx.lineTo(W * 0.9, H * (0.12 + gy * 0.152)); ctx.stroke();
      }
      glowOn(col, p.glow);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var s2 = 1; s2 <= Math.min(total, Math.ceil(seg)); s2++) {
        var f2 = U.clamp(seg - (s2 - 1), 0, 1);
        ctx.lineTo(U.lerp(pts[s2 - 1][0], pts[s2][0], f2), U.lerp(pts[s2 - 1][1], pts[s2][1], f2));
      }
      ctx.lineWidth = 5 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      for (var pi = 0; pi < n; pi++) {
        if (pi > seg + 0.01) break;
        var reached = pi < seg - 0.05;
        ctx.beginPath(); ctx.arc(pts[pi][0], pts[pi][1], (reached ? 7 : 5) * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(reached ? col : U.ink, 0.95); ctx.fill();
      }
      var tipI = Math.min(n - 1, Math.floor(seg) + (seg % 1 > 0.02 ? 1 : 0));
      var pulse = 1 + Math.sin(tt * 6) * 0.2;
      pin(pts[tipI][0], pts[tipI][1], 30 * S * pulse, U.clamp(tt * 2, 0, 1), col);
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText(label, cx, H * 0.92);
    } else if (kind === 'pin') {
      var drop = e.outBounce(U.clamp(tt / 1.1, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var py = cy - R * 0.1 + (1 - drop) * -R * 0.8;
      for (var rk = 0; rk < 3; rk++) {
        var rp = (tt * 0.8 + rk * 0.3) % 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy + R * 0.52, R * 0.32 * rp, R * 0.1 * rp, 0, 0, Math.PI * 2);
        ctx.lineWidth = 3 * S;
        ctx.strokeStyle = U.rgba(col, (1 - rp) * 0.8);
        ctx.stroke();
      }
      glowOn(col, p.glow);
      pin(cx, py, R * 0.16, 1, col);
      ctx.font = U.fs(R * 0.14 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.9) / 0.4, 0, 1));
      ctx.fillText(label, cx, cy + R * 0.88);
    } else if (kind === 'radar') {
      var sweep = (tt * 1.1) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var rr2 = 1; rr2 <= 3; rr2++) {
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.24 * rr2, 0, Math.PI * 2);
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(col, 0.3); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (var li2 = 0; li2 <= 6; li2++) {
        var la = -Math.PI * 0.5 + (li2 / 6) * Math.PI * 2;
        ctx.lineTo(cx + Math.cos(la) * R * 0.72, cy + Math.sin(la) * R * 0.72);
      }
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.22); ctx.stroke();
      var sg = ctx.createConicGradient ? null : null;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.72, -Math.PI / 2 + sweep * Math.PI * 2 - 0.9, -Math.PI / 2 + sweep * Math.PI * 2);
      ctx.closePath();
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.72);
      rg.addColorStop(0, U.rgba(col, 0.55));
      rg.addColorStop(1, U.rgba(col, 0.04));
      ctx.fillStyle = rg; ctx.fill();
      ctx.restore();
      for (var bi = 0; bi < n; bi++) {
        var ba = U.rnd(0, Math.PI * 2, bi + 9);
        var br = R * U.rnd(0.2, 0.66, bi + 77);
        var bAng = ba - sweep * Math.PI * 2;
        var diff = Math.abs(Math.atan2(Math.sin(bAng), Math.cos(bAng)));
        var lit = diff < 0.5 ? 1 - diff / 0.5 : 0.12;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ba) * br, cy + Math.sin(ba) * br, 4.5 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.3), 0.2 + lit * 0.8);
        ctx.fill();
      }
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.9);
      ctx.fillText(label + ' · SCANNING', cx, cy + R * 0.95);
    } else if (kind === 'globe') {
      var rot2 = tt * 0.5;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.4);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
      ctx.lineWidth = 2.4 * S; ctx.strokeStyle = U.rgba(col, 0.85); ctx.stroke();
      ctx.shadowBlur = 0;
      for (var lon = 0; lon < 6; lon++) {
        ctx.beginPath();
        for (var la2 = 0; la2 <= 32; la2++) {
          var latA = (la2 / 32) * Math.PI * 2;
          var w = Math.sin(latA);
          var xx = Math.cos(latA) * Math.sin(rot2 + lon * 0.52) * R * 0.62;
          var yy = Math.cos(latA) * Math.cos(rot2 + lon * 0.52) * R * 0.62 * 0.28;
          var py2 = cy + Math.sin(latA) * R * 0.62;
          var px2 = cx + xx;
          if (!la2) ctx.moveTo(px2, py2 + yy); else ctx.lineTo(px2, py2 + yy);
        }
        ctx.lineWidth = 1.6 * S;
        ctx.strokeStyle = U.rgba(col, 0.3); ctx.stroke();
      }
      for (var lat = 1; lat < 4; lat++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.62 * Math.sin(lat * 0.5), R * 0.62 * Math.sin(lat * 0.5) * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(col, 0.3); ctx.lineWidth = 1.6 * S; ctx.stroke();
      }
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.95);
    } else if (kind === 'compass') {
      var wob = Math.sin(tt * 2.2) * 0.35 + Math.sin(tt * 0.7) * 0.2;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.6, 0, Math.PI * 2);
      ctx.lineWidth = R * 0.03 * S; ctx.strokeStyle = U.rgba(col, 0.85); ctx.stroke();
      ctx.font = U.fs(R * 0.11 * S, 800);
      for (var cd = 0; cd < 4; cd++) {
        var ca = cd * Math.PI / 2 - Math.PI / 2;
        ctx.fillStyle = U.rgba(cd === 0 ? col : U.ink, cd === 0 ? 0.95 : 0.55);
        ctx.fillText('NESW'.charAt(cd), cx + Math.cos(ca) * R * 0.5, cy + Math.sin(ca) * R * 0.5);
      }
      for (var tk = 0; tk < 12; tk++) {
        var ta = (tk / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ta) * R * 0.56, cy + Math.sin(ta) * R * 0.56);
        ctx.lineTo(cx + Math.cos(ta) * R * 0.6, cy + Math.sin(ta) * R * 0.6);
        ctx.lineWidth = 2 * S; ctx.strokeStyle = U.rgba(U.ink, 0.4); ctx.stroke();
      }
      glowOn(col, p.glow * 0.5);
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(wob);
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.42); ctx.lineTo(R * 0.09, 0); ctx.lineTo(-R * 0.09, 0);
      ctx.closePath();
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, R * 0.42); ctx.lineTo(R * 0.09, 0); ctx.lineTo(-R * 0.09, 0);
      ctx.closePath();
      ctx.fillStyle = U.rgba(U.ink, 0.35); ctx.fill();
      ctx.restore();
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.fillText(label, cx, cy + R * 0.95);
    } else if (kind === 'dots') {
      var cols2 = Math.floor(W * 0.62 / (R * 0.075));
      var rows2 = Math.floor(H * 0.5 / (R * 0.075));
      var reveal = e.inOutCubic(U.clamp(tt / 2, 0, 1));
      for (var di = 0; di < cols2 * rows2; di++) {
        var dx = di % cols2, dy2 = Math.floor(di / cols2);
        var distC = Math.abs(dx - cols2 / 2) / cols2 + Math.abs(dy2 - rows2 / 2) / rows2;
        var dk = U.clamp((reveal - distC * 0.9) / 0.3, 0, 1);
        if (dk <= 0.02) continue;
        var on = U.rng(di) > 0.32;
        ctx.beginPath();
        ctx.arc(W * 0.19 + dx * R * 0.075, H * 0.26 + dy2 * R * 0.075, R * 0.02 * dk, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(on ? col : U.ink, (on ? 0.85 : 0.18) * dk);
        ctx.fill();
      }
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1.4) / 0.5, 0, 1) * 0.95);
      ctx.fillText(label, cx, H * 0.87);
    } else if (kind === 'flight') {
      var x0 = W * 0.24, y0 = cy + R * 0.3, x1 = W * 0.76, y1 = cy - R * 0.34;
      var prog2 = e.inOutCubic(U.clamp(tt / 2.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.setLineDash([8 * S, 10 * S]);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy - R * 0.75, x1, y1);
      ctx.lineWidth = 2.6 * S;
      ctx.strokeStyle = U.rgba(U.ink, 0.3); ctx.stroke();
      ctx.setLineDash([]);
      glowOn(col, p.glow);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      var steps = 24;
      for (var s3 = 1; s3 <= Math.ceil(steps * prog2); s3++) {
        var f3 = U.clamp(steps * prog2 - (s3 - 1), 0, 1) / steps + (s3 - 1) / steps;
        var qx = (1 - f3) * (1 - f3) * x0 + 2 * (1 - f3) * f3 * cx + f3 * f3 * x1;
        var qy = (1 - f3) * (1 - f3) * y0 + 2 * (1 - f3) * f3 * (cy - R * 0.75) + f3 * f3 * y1;
        ctx.lineTo(qx, qy);
      }
      ctx.lineWidth = 4.4 * S; ctx.strokeStyle = U.rgba(col, 0.95); ctx.stroke();
      var fT = U.clamp(prog2 * steps, 0, steps) / steps;
      var px3 = (1 - fT) * (1 - fT) * x0 + 2 * (1 - fT) * fT * cx + fT * fT * x1;
      var py3 = (1 - fT) * (1 - fT) * y0 + 2 * (1 - fT) * fT * (cy - R * 0.75) + fT * fT * y1;
      var prevT = Math.max(0, fT - 0.015);
      var pvx = (1 - prevT) * (1 - prevT) * x0 + 2 * (1 - prevT) * prevT * cx + prevT * prevT * x1;
      var pvy = (1 - prevT) * (1 - prevT) * y0 + 2 * (1 - prevT) * prevT * (cy - R * 0.75) + prevT * prevT * y1;
      ctx.save();
      ctx.translate(px3, py3); ctx.rotate(Math.atan2(py3 - pvy, px3 - pvx));
      ctx.font = U.fs(R * 0.14, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.95);
      ctx.fillText('✈', 0, 0);
      ctx.restore();
      ctx.beginPath(); ctx.arc(x0, y0, 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.ink, 0.9); ctx.fill();
      ctx.beginPath(); ctx.arc(x1, y1, 6 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.font = U.fs(R * 0.12 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText('FROM', x0, y0 + R * 0.16);
      ctx.fillText(label, x1, y1 - R * 0.14);
    } else if (kind === 'heat') {
      var pulse2 = (tt * 0.7) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var hi = 0; hi < Math.max(2, Math.round(n * 0.7)); hi++) {
        var hx = W * U.rnd(0.25, 0.75, hi * 2), hy = H * U.rnd(0.3, 0.7, hi * 2 + 1);
        var hp = (pulse2 + U.rnd(0, 1, hi)) % 1;
        var hr = R * (0.1 + hp * 0.3);
        var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        hg.addColorStop(0, U.rgba(U.mix(col, U.accent2, hi / n), 0.5 * (1 - hp)));
        hg.addColorStop(1, U.rgba(col, 0));
        ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fillStyle = hg; ctx.fill();
      }
      var mx = W * U.rnd(0.3, 0.7, 11), my = H * U.rnd(0.35, 0.65, 12);
      pin(mx, my, R * 0.13, U.clamp(tt * 2, 0, 1), col);
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, H * 0.88);
    } else if (kind === 'grid-locate') {
      var lock = e.outCubic(U.clamp(tt / 1.4, 0, 1));
      var gw = R * 0.9 * lock, gh = R * 0.55 * lock;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.strokeStyle = U.rgba(U.ink, 0.14); ctx.lineWidth = 1.5 * S;
      for (var gl = 0; gl < 7; gl++) {
        ctx.beginPath(); ctx.moveTo(W * 0.2 + gl * W * 0.1, H * 0.2); ctx.lineTo(W * 0.2 + gl * W * 0.1, H * 0.8); ctx.stroke();
      }
      for (var gl2 = 0; gl2 < 5; gl2++) {
        ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.2 + gl2 * H * 0.15); ctx.lineTo(W * 0.8, H * 0.2 + gl2 * H * 0.15); ctx.stroke();
      }
      glowOn(col, p.glow);
      ctx.lineWidth = 3.4 * S;
      ctx.strokeStyle = U.rgba(col, 0.95);
      var segs = [[-1, -1, 1, 0], [1, -1, 0, 1], [1, 1, -1, 0], [-1, 1, 0, -1]];
      for (var sg2 = 0; sg2 < 4; sg2++) {
        var sk = U.clamp((lock - sg2 * 0.12) / 0.5, 0, 1);
        if (sk <= 0.01) continue;
        var sx = cx + segs[sg2][0] * gw / 2, sy = cy + segs[sg2][1] * gh / 2;
        ctx.beginPath();
        ctx.moveTo(sx - segs[sg2][2] * gw * 0.22 * sk, sy);
        ctx.lineTo(sx, sy);
        ctx.lineTo(sx, sy - segs[sg2][3] * gh * 0.22 * sk);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 5 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.5 * lock, 0, Math.PI * 2);
      ctx.lineWidth = 1.6 * S; ctx.strokeStyle = U.rgba(col, 0.4); ctx.stroke();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 1) / 0.4, 0, 1) * 0.95);
      ctx.fillText(label + '  ' + Math.round(31.2 + U.rnd(-0.4, 0.4, 3) * 10) + '°N ' + Math.round(121.4) + '°E', cx, cy + R * 0.85);
    } else if (kind === 'cluster') {
      var cl = e.outCubic(U.clamp(tt / 1.6, 0, 1));
      var spots = [];
      for (var ci = 0; ci < n * 4; ci++) {
        spots.push([cx + Math.sin(U.rng(ci * 3)) * R * 0.5, cy + Math.cos(U.rng(ci * 3 + 1)) * R * 0.4]);
      }
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var ci2 = 0; ci2 < spots.length; ci2++) {
        var ck = U.clamp((cl - ci2 / spots.length) / 0.3, 0, 1);
        if (ck <= 0.01) continue;
        var pulling = 1 - ck * 0.35;
        var px4 = U.lerp(spots[ci2][0] * 1.08, spots[ci2][0], ck);
        var py4 = U.lerp(spots[ci2][1] * 1.08, spots[ci2][1], ck) * pulling;
        ctx.beginPath();
        ctx.arc(px4, py4, 4 * S, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(col, 0.8 * ck);
        ctx.fill();
      }
      var count = Math.round(spots.length * cl);
      var badge = R * 0.2 * e.outBack(U.clamp((cl - 0.5) / 0.5, 0, 1));
      if (badge > 1) {
        ctx.beginPath(); ctx.arc(cx + R * 0.2, cy - R * 0.22, badge, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        ctx.font = U.fs(badge * 0.9, 800);
        ctx.fillStyle = U.rgba(U.bg1, 0.95);
        ctx.fillText(String(count), cx + R * 0.2, cy - R * 0.22);
      }
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.75);
    } else if (kind === 'contour') {
      var reveal2 = e.inOutCubic(U.clamp(tt / 2.2, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      for (var ring = 0; ring < 7; ring++) {
        var rk2 = U.clamp((reveal2 - ring * 0.09) / 0.5, 0, 1);
        if (rk2 <= 0.01) continue;
        ctx.beginPath();
        for (var a3 = 0; a3 <= Math.PI * 2 + 0.01; a3 += 0.12) {
          var wob3 = U.noise2(Math.cos(a3) * 1.4 + ring, Math.sin(a3) * 1.4 - ring, U.seed) * R * 0.09;
          var rr3 = R * (0.12 + ring * 0.09) + wob3;
          var px5 = cx + Math.cos(a3) * rr3, py5 = cy + Math.sin(a3) * rr3 * 0.72;
          if (!a3) ctx.moveTo(px5, py5); else ctx.lineTo(px5, py5);
        }
        ctx.closePath();
        ctx.lineWidth = 2 * S;
        ctx.strokeStyle = U.rgba(U.mix(col, U.ink, ring / 8), 0.55 * rk2);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 4 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      ctx.font = U.fs(R * 0.11 * S, 700);
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.fillText(label + ' · ELEVATION', cx, cy + R * 0.78);
    } else if (kind === 'gps') {
      var pk2 = (tt * 0.8) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow);
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.shadowBlur = 0;
      for (var gp = 0; gp < 3; gp++) {
        var gk = (pk2 + gp / 3) % 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.12 + gk * 0.5), 0, Math.PI * 2);
        ctx.lineWidth = 4 * S * (1 - gk);
        ctx.strokeStyle = U.rgba(col, (1 - gk) * 0.7);
        ctx.stroke();
      }
      ctx.font = U.fs(R * 0.12 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText(label, cx, cy + R * 0.85);
      ctx.font = U.fs(R * 0.09 * S, 600);
      ctx.fillStyle = U.rgba(col, 0.8);
      ctx.fillText('±' + (2 + Math.abs(Math.sin(tt * 3)) * 3).toFixed(1) + 'm', cx, cy + R * 1.08);
    } else {
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 0.4); ctx.fill();
      ctx.font = U.fs(R * 0.13 * S, 800);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.7);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：拼贴手账 ══════════════════════════ */

  var COLLAGE_PARAMS = [
    P('kind', '形态', 'photo-grid', sel('photo-grid', [
      ['photo-grid', '照片网格'], ['polaroid', '拍立得'], ['tape', '胶带贴条'],
      ['sticker', '贴纸弹跳'], ['shuffle', '卡牌洗牌'], ['scrapbook', '剪贴簿'],
      ['magazine', '杂志排版'], ['pin-board', '软木板'], ['film-strip', '胶片走带'],
      ['mood', '情绪板拼贴']
    ])),
    P('text', '标题', 'MEMORY', txt('MEMORY')),
    P('tiles', '块数', 9, rng(9, 4, 16, 1)),
    P('size', '基准尺寸', 1144, rng(1144, 140.0, 1602, 4.0)),
    P('speed', '速度', 1, rng(1, 0.5, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.2, rng(0.2, 0, 1, 0.05))
  ];

  function collageDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var tt = t * sp;
    var cx = W / 2, cy = H / 2;
    var R = p.size * S * 0.5;
    var col = p.ink2;
    var kind = p.kind;
    var label = String(p.text || '');
    var n = Math.max(4, Math.round(p.tiles));
    var cols = Math.ceil(Math.sqrt(n));
    var rows = Math.ceil(n / cols);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    function tileFill(x, y, w, h, i) {
      var cA = U.mix(col, U.accent2, (i % 5) / 5);
      var g2 = ctx.createLinearGradient(x, y, x + w, y + h);
      g2.addColorStop(0, U.rgba(cA, 0.8));
      g2.addColorStop(1, U.rgba(U.mix(cA, U.bg1, 0.5), 0.9));
      ctx.fillStyle = g2;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = U.rgba(U.ink, 0.25);
      ctx.beginPath();
      ctx.arc(x + w * U.rnd(0.3, 0.7, i), y + h * U.rnd(0.3, 0.7, i + 9), Math.min(w, h) * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    if (kind === 'photo-grid') {
      var gap = R * 0.06;
      var tw = (R * 1.7 - gap * (cols - 1)) / cols;
      var th = (R * 1.7 - gap * (rows - 1)) / rows;
      var ox = cx - R * 0.85, oy = cy - R * 0.85;
      for (var i = 0; i < n; i++) {
        var gx = i % cols, gy = Math.floor(i / cols);
        var k = e.outBack(U.clamp((tt - 0.2 - i * 0.09) / 0.5, 0, 1));
        if (k <= 0.01) continue;
        ctx.save();
        ctx.translate(ox + gx * (tw + gap) + tw / 2, oy + gy * (th + gap) + th / 2);
        ctx.rotate((1 - k) * 0.3 + U.rnd(-0.06, 0.06, i));
        ctx.scale(k, k);
        tileFill(-tw / 2, -th / 2, tw, th, i);
        ctx.restore();
      }
      var tk = e.outCubic(U.clamp((tt - 0.4 - n * 0.09) / 0.5, 0, 1));
      ctx.font = U.fs(R * 0.2 * tk, 900);
      ctx.fillStyle = U.rgba(U.ink, tk);
      ctx.fillText(label, cx, cy + R * 1.22);
    } else if (kind === 'polaroid') {
      var shots = Math.min(4, Math.max(2, Math.round(n / 3)));
      for (var pi = 0; pi < shots; pi++) {
        var pk = e.outBack(U.clamp((tt - 0.3 - pi * 0.45) / 0.55, 0, 1));
        if (pk <= 0.01) continue;
        var pa = (pi / shots - 0.5) * 1.2 - 0.6;
        var pr = R * (0.62 + pi * 0.05);
        ctx.save();
        ctx.translate(cx + Math.cos(pa) * pr * 0.4, cy + Math.sin(pa) * pr * 0.32);
        ctx.rotate(pa * 0.5);
        ctx.scale(pk, pk);
        var pw = R * 0.56, ph = R * 0.66;
        ctx.shadowColor = U.rgba('#000000', 0.35); ctx.shadowBlur = 18 * S; ctx.shadowOffsetY = 8 * S;
        ctx.fillStyle = U.rgba('#F4F1E8', 0.97);
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        tileFill(-pw / 2 + pw * 0.08, -ph / 2 + pw * 0.08, pw * 0.84, pw * 0.72, pi + 3);
        ctx.fillStyle = U.rgba('#2A2A2A', 0.75);
        ctx.font = U.fs(pw * 0.11, 600);
        ctx.fillText(label.slice(0, 8), 0, ph * 0.36);
        ctx.restore();
      }
    } else if (kind === 'tape' || kind === 'sticker') {
      var items = Math.min(5, Math.max(2, Math.round(n / 2)));
      for (var si = 0; si < items; si++) {
        var sk = e.outBack(U.clamp((tt - 0.3 - si * 0.4) / 0.5, 0, 1));
        if (sk <= 0.01) continue;
        var ang = U.rnd(-0.5, 0.5, si) * (kind === 'tape' ? 0.35 : 0.8);
        var pos = [(si / Math.max(1, items - 1) - 0.5) * R * 1.5, Math.sin(si * 2.4) * R * 0.4];
        ctx.save();
        ctx.translate(cx + pos[0], cy + pos[1]);
        ctx.rotate(ang);
        ctx.scale(sk, sk);
        if (kind === 'tape') {
          var tw2 = R * 0.5, th2 = R * 0.11;
          ctx.rotate(U.rnd(-0.5, 0.5, si) * 0.9);
          ctx.fillStyle = U.rgba(U.mix(col, U.ink, 0.3), 0.6);
          ctx.fillRect(-tw2 / 2, -th2 / 2, tw2, th2);
          ctx.fillStyle = U.rgba(U.ink, 0.15);
          for (var zi = 0; zi < 5; zi++) ctx.fillRect(-tw2 / 2 + zi * tw2 / 5, -th2 / 2, tw2 / 10, th2);
        } else {
          var st = R * 0.24;
          ctx.beginPath();
          for (var sd = 0; sd < 10; sd++) {
            var sa = (sd / 10) * Math.PI * 2 - Math.PI / 2;
            var sr2 = sd % 2 ? st * 0.42 : st;
            if (!sd) ctx.moveTo(Math.cos(sa) * sr2, Math.sin(sa) * sr2);
            else ctx.lineTo(Math.cos(sa) * sr2, Math.sin(sa) * sr2);
          }
          ctx.closePath();
          ctx.fillStyle = U.rgba(si % 2 ? U.accent2 : col, 0.92);
          ctx.fill();
          ctx.font = U.fs(st * 0.8, 800);
          ctx.fillStyle = U.rgba(U.bg1, 0.9);
          ctx.fillText('★', 0, 0);
        }
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.17 * e.outCubic(U.clamp((tt - 0.6) / 0.5, 0, 1)), 900);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.6) / 0.5, 0, 1));
      ctx.fillText(label, cx, cy + R * 1.05);
    } else if (kind === 'shuffle') {
      var deck = Math.min(6, Math.max(3, Math.round(n / 2)));
      for (var di = deck - 1; di >= 0; di--) {
        var cycle = (tt * 0.5 + di / deck) % 1;
        var going = cycle < 0.5;
        var cp = going ? e.inOutCubic(cycle * 2) : e.inOutCubic((1 - cycle) * 2);
        var ang2 = U.rnd(-0.2, 0.2, di) + cp * 0.5;
        var dx2 = U.lerp(di * 6 * S - deck * 3 * S, R * 0.9, cp);
        ctx.save();
        ctx.translate(cx + dx2 * (going ? 1 : -1) * (going ? 1 : 1) * (going ? 1 : -1) * (going ? 1 : 1) * (going ? 1 : 0) + (going ? 0 : 0), cy);
        ctx.restore();
        ctx.save();
        var sx2 = going ? U.lerp(di * 5 * S, R * 0.85, cp) : U.lerp(-R * 0.85, (di - deck / 2) * 5 * S, cp);
        ctx.translate(cx + sx2, cy);
        ctx.rotate(ang2);
        var cw2 = R * 0.52, ch2 = R * 0.74;
        ctx.shadowColor = U.rgba('#000000', 0.3); ctx.shadowBlur = 14 * S;
        U.rr(ctx, -cw2 / 2, -ch2 / 2, cw2, ch2, ch2 * 0.09);
        ctx.fillStyle = U.rgba(U.mix(col, U.bg2, di / deck), 0.96);
        ctx.fill();
        ctx.shadowBlur = 0;
        U.rr(ctx, -cw2 / 2 + cw2 * 0.08, -ch2 / 2 + cw2 * 0.08, cw2 * 0.84, ch2 * 0.84, ch2 * 0.07);
        ctx.strokeStyle = U.rgba(U.ink, 0.2); ctx.lineWidth = 1.6 * S; ctx.stroke();
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.14 * U.clamp((tt - 0.4) / 0.5, 0, 1), 800);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.4) / 0.5, 0, 1) * 0.9);
      ctx.fillText(label, cx, cy + R * 0.95);
    } else if (kind === 'scrapbook' || kind === 'pin-board') {
      var pages = Math.min(4, Math.max(2, Math.round(n / 3)));
      if (kind === 'pin-board') {
        ctx.fillStyle = U.rgba('#8A6A44', 0.35);
        ctx.fillRect(cx - R * 1.05, cy - R * 0.85, R * 2.1, R * 1.7);
      }
      for (var gi = 0; gi < pages; gi++) {
        var gk2 = e.outCubic(U.clamp((tt - 0.25 - gi * 0.5) / 0.6, 0, 1));
        if (gk2 <= 0.01) continue;
        var ga = (gi / pages - 0.5) * 0.9;
        ctx.save();
        ctx.translate(cx + (gi - pages / 2 + 0.5) * R * 0.34, cy + Math.sin(gi * 2.2) * R * 0.18);
        ctx.rotate(ga * 0.4 + U.rnd(-0.1, 0.1, gi));
        ctx.scale(gk2, gk2);
        var gw2 = R * 0.5, gh2 = R * 0.6;
        ctx.shadowColor = U.rgba('#000000', 0.3); ctx.shadowBlur = 12 * S; ctx.shadowOffsetY = 6 * S;
        ctx.fillStyle = U.rgba(U.mix('#F4F1E8', col, gi / pages * 0.35), 0.97);
        ctx.fillRect(-gw2 / 2, -gh2 / 2, gw2, gh2);
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        tileFill(-gw2 / 2 + gw2 * 0.1, -gh2 / 2 + gw2 * 0.1, gw2 * 0.8, gh2 * 0.5, gi + 2);
        ctx.fillStyle = U.rgba('#2A2A2A', 0.7);
        for (var ln = 0; ln < 3; ln++) {
          ctx.fillRect(-gw2 * 0.36, gh2 * 0.02 + ln * gh2 * 0.11, gw2 * U.rnd(0.4, 0.72, gi + ln), 3 * S);
        }
        if (kind === 'pin-board') {
          ctx.beginPath(); ctx.arc(0, -gh2 / 2 + gh2 * 0.07, 6 * S, 0, Math.PI * 2);
          ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
        } else {
          ctx.save();
          ctx.rotate(0.2);
          ctx.fillStyle = U.rgba(col, 0.55);
          ctx.fillRect(-gw2 * 0.28, -gh2 / 2 - gh2 * 0.05, gw2 * 0.56, gh2 * 0.1);
          ctx.restore();
        }
        ctx.restore();
      }
    } else if (kind === 'magazine') {
      var mk = e.outCubic(U.clamp(tt / 1.4, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = U.fs(R * 0.42, 900);
      var chars = label.split('');
      var mx2 = W * 0.12;
      for (var mc = 0; mc < chars.length; mc++) {
        var mck = U.clamp((mk - mc * 0.05) / 0.5, 0, 1);
        ctx.globalAlpha = mck * U.clamp(tt * 3, 0, 1);
        ctx.fillStyle = U.rgba(U.ink, 1);
        ctx.fillText(chars[mc], mx2, cy - R * 0.2);
        mx2 += ctx.measureText(chars[mc]).width;
      }
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var bw2 = R * 0.62, bh2 = R * 0.8;
      ctx.save();
      ctx.translate(W * 0.72, cy);
      ctx.rotate(0.04);
      ctx.scale(e.outBack(U.clamp((tt - 0.5) / 0.6, 0, 1)), 1);
      tileFill(-bw2 / 2, -bh2 / 2, bw2, bh2, 4);
      ctx.restore();
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      for (var ml = 0; ml < 4; ml++) {
        var mlk = U.clamp((mk - 0.4 - ml * 0.1) / 0.4, 0, 1);
        ctx.fillRect(W * 0.12, cy + R * 0.05 + ml * R * 0.09, R * 0.5 * mlk, 4 * S);
      }
      ctx.beginPath();
      ctx.moveTo(W * 0.12, cy - R * 0.52);
      ctx.lineTo(W * 0.12 + R * 0.4 * mk, cy - R * 0.52);
      ctx.lineWidth = 6 * S;
      ctx.strokeStyle = U.rgba(col, 0.95);
      ctx.stroke();
      ctx.textAlign = 'center';
    } else if (kind === 'film-strip') {
      var scroll = (tt * R * 0.24) % (R * 0.4);
      ctx.globalAlpha = U.clamp(tt * 2.6, 0, 1);
      ctx.fillStyle = U.rgba('#0B0C10', 0.97);
      ctx.fillRect(0, cy - R * 0.5, W, R);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      for (var fx = -1; fx < W / (R * 0.08) + 1; fx++) {
        for (var fy = 0; fy < 2; fy++) {
          ctx.beginPath();
          ctx.rect(fx * R * 0.08 + (scroll % (R * 0.08)) - R * 0.02, cy - R * 0.44 + fy * R * 0.88, R * 0.035, R * 0.035);
          ctx.fill();
        }
      }
      var frames = Math.ceil(W / (R * 0.42)) + 2;
      for (var fi2 = 0; fi2 < frames; fi2++) {
        var fxx = fi2 * R * 0.42 - (scroll % (R * 0.42)) - R * 0.42;
        tileFill(fxx + R * 0.03, cy - R * 0.32, R * 0.36, R * 0.64, fi2);
      }
      ctx.fillStyle = U.rgba(U.ink, 0.85);
      ctx.font = U.fs(R * 0.1 * S, 800);
      ctx.textAlign = 'left';
      ctx.fillText(label + '  ·  ' + String(Math.floor(tt * 24)).padStart(3, '0') + ' FR', W * 0.06, cy + R * 0.72);
      ctx.textAlign = 'center';
    } else if (kind === 'mood') {
      var pieces = Math.min(8, Math.max(4, n));
      for (var mi = 0; mi < pieces; mi++) {
        var mk2 = e.outBack(U.clamp((tt - 0.2 - mi * 0.14) / 0.55, 0, 1));
        if (mk2 <= 0.01) continue;
        var ma = (mi / pieces) * Math.PI * 2 + 0.4;
        var mrr = R * (0.35 + (mi % 3) * 0.22);
        var mw = R * U.rnd(0.18, 0.34, mi), mh2 = R * U.rnd(0.14, 0.3, mi + 4);
        ctx.save();
        ctx.translate(cx + Math.cos(ma) * mrr, cy + Math.sin(ma) * mrr * 0.8);
        ctx.rotate(U.rnd(-0.4, 0.4, mi + 2));
        ctx.scale(mk2, mk2);
        ctx.fillStyle = U.rgba(U.mix(U.mix(col, U.accent2, (mi % 4) / 4), U.ink, 0.12), 0.9);
        ctx.fillRect(-mw / 2, -mh2 / 2, mw, mh2);
        ctx.fillStyle = U.rgba(U.bg1, 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(mw, mh2) * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.font = U.fs(R * 0.16 * e.outCubic(U.clamp((tt - 0.8) / 0.5, 0, 1)), 900);
      ctx.fillStyle = U.rgba(U.ink, U.clamp((tt - 0.8) / 0.5, 0, 1));
      ctx.fillText(label, cx, cy);
    } else {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(0.05);
      tileFill(-R * 0.5, -R * 0.5, R, R, 1);
      ctx.restore();
      ctx.font = U.fs(R * 0.15, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy + R * 0.8);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '地图轨迹', type: 'block', dur: 6, poster: 0.5,
    params: MAP_PARAMS, draw: mapDraw,
    texts: ['SHENZHEN', 'SHANGHAI', 'BEIJING', 'HANGZHOU'],
    ids: [
      { id: 'map-route', name: '路线描绘', tags: ['路线', '行程'], desc: '路线沿节点逐段绘出，旅行与物流叙事。', cfg: { kind: 'route' } },
      { id: 'map-pin', name: '定位图钉', tags: ['定位', '落点'], desc: '图钉弹跳落下并荡开涟漪，地点标注。', cfg: { kind: 'pin', size: 1320} },
      { id: 'map-radar', name: '雷达扫描', tags: ['雷达', '扫描'], desc: '雷达扇形扫过点亮目标，监测与安防。', cfg: { kind: 'radar' } },
      { id: 'map-globe', name: '经纬线球', tags: ['地球', '全球'], desc: '经纬线缓慢转动，全球化业务表达。', cfg: { kind: 'globe', size: 1320} },
      { id: 'map-compass', name: '罗盘', tags: ['罗盘', '导航'], desc: '罗盘指针摆动寻北，探索与方向感。', cfg: { kind: 'compass' } },
      { id: 'map-dots', name: '点阵地图', tags: ['点阵', '浮现'], desc: '点阵从中心扩散浮现成地图质感。', cfg: { kind: 'dots' } },
      { id: 'map-flight', name: '航线弧线', tags: ['航线', '飞行'], desc: '飞机沿弧线航线飞过，跨境与出差叙事。', cfg: { kind: 'flight', size: 1320} },
      { id: 'map-heat', name: '热力扩散', tags: ['热力', '分布'], desc: '多个热力团呼吸扩散，数据分布可视化。', cfg: { kind: 'heat' } },
      { id: 'map-grid-locate', name: '网格定位', tags: ['锁定', '坐标'], desc: '四角锁定框收拢到目标点，军事与精准感。', cfg: { kind: 'grid-locate' } },
      { id: 'map-cluster', name: '多点聚合', tags: ['聚合', '计数'], desc: '散点收拢聚合并弹出计数徽标。', cfg: { kind: 'cluster', size: 1320} },
      { id: 'map-contour', name: '等高线', tags: ['等高线', '地形'], desc: '等高线一圈圈勾勒地形，户外与地理感。', cfg: { kind: 'contour' } },
      { id: 'map-gps', name: 'GPS 波纹', tags: ['GPS', '信号'], desc: '定位点发出波纹并显示精度，打卡场景。', cfg: { kind: 'gps', size: 1320} }
    ]
  });

  MF.forge({
    cat: '拼贴手账', type: 'block', dur: 6, poster: 0.55,
    params: COLLAGE_PARAMS, draw: collageDraw,
    texts: ['MEMORY', 'MOODBOARD', 'RECAP 2026', 'STORY'],
    ids: [
      { id: 'col-photo-grid', name: '照片网格', tags: ['网格', '相册'], desc: '照片格错落弹入组成网格，年度回顾。', cfg: { kind: 'photo-grid' } },
      { id: 'col-polaroid', name: '拍立得', tags: ['拍立得', '复古'], desc: '拍立得照片依次甩入堆叠，旅行手账。', cfg: { kind: 'polaroid' } },
      { id: 'col-tape', name: '胶带贴条', tags: ['胶带', '手账'], desc: '半透明胶带条啪啪贴上，手作质感。', cfg: { kind: 'tape' } },
      { id: 'col-sticker', name: '贴纸弹跳', tags: ['贴纸', '星星'], desc: '星星贴纸依次弹跳贴上，活泼手账。', cfg: { kind: 'sticker' } },
      { id: 'col-shuffle', name: '卡牌洗牌', tags: ['卡牌', '洗牌'], desc: '卡牌来回洗切，抽卡与悬念场景。', cfg: { kind: 'shuffle' } },
      { id: 'col-scrapbook', name: '剪贴簿', tags: ['剪贴', '翻页'], desc: '剪贴页带胶带依次贴上，回忆叙事。', cfg: { kind: 'scrapbook' } },
      { id: 'col-magazine', name: '杂志排版', tags: ['杂志', '标题'], desc: '大标题逐字排出配图版，刊物质感。', cfg: { kind: 'magazine' } },
      { id: 'col-pin-board', name: '软木板', tags: ['软木', '钉图'], desc: '便签钉上软木板，计划与灵感墙。', cfg: { kind: 'pin-board' } },
      { id: 'col-film-strip', name: '胶片走带', tags: ['胶片', '走带'], desc: '胶片帧横向走带滚动，电影质感。', cfg: { kind: 'film-strip' } },
      { id: 'col-mood', name: '情绪板拼贴', tags: ['情绪板', '拼贴'], desc: '色块碎片从四周拼合，情绪板开场。', cfg: { kind: 'mood' } }
    ]
  });
})();
