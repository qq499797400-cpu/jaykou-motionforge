/* ==========================================================================
   Jaykou 动效库 · 13
   原语：镜头运动 / 形变转换 / 加载与进度
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  /* ══════════════════════════ 镜头运动 ══════════════════════════ */

  var CAM_PARAMS = [
    P('kind', '运镜方式', 'push-in', sel('push-in', [
      ['push-in', '推近'], ['pull-out', '拉远'], ['orbit', '环绕'], ['shake', '手持抖动'],
      ['tilt', '倾斜俯仰'], ['whip-pan', '甩镜'], ['parallax', '视差层'], ['crane', '升降'],
      ['dolly-zoom', '推拉变焦'], ['roll', '翻滚'], ['zoom-punch', '冲击缩放'], ['pan-lr', '左右横移'],
      ['pan-ud', '上下纵移'], ['focus-pull', '移焦'], ['handheld', '手持漫步'], ['spiral-cam', '螺旋运镜']
    ])),
    P('text', '画面标题', 'SCENE', txt('SCENE')),
    P('size', '场景尺度', 300, rng(300, 100, 600, 4)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('intensity', '幅度', 0.7, rng(0.7, 0.15, 1.6, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function camDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var sp = Math.max(0.1, p.speed);
    var kind = p.kind;
    var amp = p.intensity;
    var base = p.size * S;
    var tl = t * sp;
    var zoom = 1, panX = 0, panY = 0, rot = 0, tiltX = 0, skewY = 0;
    var i;

    if (kind === 'push-in') { zoom = 1 + e.inOutCubic(U.clamp(tl / 5, 0, 1)) * 0.55 * amp; }
    else if (kind === 'pull-out') { zoom = 1.6 - e.inOutCubic(U.clamp(tl / 5, 0, 1)) * 0.6 * amp; }
    else if (kind === 'orbit') { panX = Math.sin(tl * 0.5) * base * 0.4 * amp; panY = Math.cos(tl * 0.5) * base * 0.16 * amp; }
    else if (kind === 'shake') {
      panX = U.noise(tl * 5.2, 3) * 20 * S * amp;
      panY = U.noise(tl * 4.6, 11) * 20 * S * amp;
      rot = U.noise(tl * 3.4, 17) * 0.02 * amp;
    }
    else if (kind === 'tilt') { tiltX = Math.sin(tl * 0.5) * 0.4 * amp; rot = Math.sin(tl * 0.35) * 0.12 * amp; }
    else if (kind === 'whip-pan') {
      var wp = (tl * 0.45) % 1;
      panX = (wp < 0.5 ? e.outExpo(wp * 2) : 1 - e.inExpo((wp - 0.5) * 2)) * base * 1.1 * amp;
      if (wp > 0.42 && wp < 0.58) { ctx.save(); ctx.globalAlpha = Math.abs(wp - 0.5) * 6; ctx.filter = 'blur(' + (16 * S).toFixed(1) + 'px)'; ctx.fillStyle = U.rgba(U.accent, 0.3); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    }
    else if (kind === 'parallax') { panX = Math.sin(tl * 0.4) * base * 0.34 * amp; }
    else if (kind === 'crane') { panY = Math.sin(tl * 0.42) * base * 0.5 * amp; rot = Math.sin(tl * 0.42) * 0.05; }
    else if (kind === 'dolly-zoom') {
      var dz = Math.sin(tl * 0.4) * 0.5 + 0.5;
      zoom = 1 + dz * 0.45 * amp;
      panY = (1 - dz) * 0.0;
      skewY = (1 - dz) * 0.0;
    }
    else if (kind === 'roll') { rot = tl * 0.5 * amp; }
    else if (kind === 'zoom-punch') {
      var zp = (tl * 0.6) % 1;
      zoom = 1 + Math.max(0, 1 - zp * 2.4) * 0.4 * amp;
    }
    else if (kind === 'pan-lr') { panX = ((tl * 0.3) % 1 - 0.5) * base * 1.4 * amp; }
    else if (kind === 'pan-ud') { panY = ((tl * 0.3) % 1 - 0.5) * base * 1.4 * amp; }
    else if (kind === 'focus-pull') {
      zoom = 1.12 + Math.sin(tl * 0.55) * 0.12 * amp;
    }
    else if (kind === 'handheld') {
      panX = U.noise(tl * 1.4, 5) * 34 * S * amp;
      panY = U.noise(tl * 1.1, 9) * 24 * S * amp;
      rot = U.noise(tl * 0.8, 13) * 0.05 * amp;
      zoom = 1.06 + U.noise(tl * 0.6, 21) * 0.04;
    }
    else if (kind === 'spiral-cam') {
      var srad = base * 0.3 * amp;
      panX = Math.cos(tl * 0.6) * srad;
      panY = Math.sin(tl * 0.6) * srad * 0.5;
      rot = tl * 0.16 * amp;
      zoom = 1 + (tl % 4.5) / 4.5 * 0.3;
    }

    ctx.save();
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.scale(zoom, zoom);
    if (tiltX) ctx.transform(1, 0, tiltX * 0.3, 1, 0, 0);
    ctx.translate(-cx + panX, -cy + panY);

    /* ---- 场景：透视地面网格 ---- */
    var horizon = cy - base * 0.15;
    ctx.strokeStyle = U.rgba(U.ink, 0.1);
    ctx.lineWidth = 1.4 * S;
    ctx.beginPath();
    for (i = -10; i <= 10; i++) {
      ctx.moveTo(cx + i * base * 0.2, H);
      ctx.lineTo(cx + i * base * 0.03, horizon);
    }
    for (i = 1; i <= 9; i++) {
      var fy = H - Math.pow(i / 9, 2) * (H - horizon);
      ctx.moveTo(0, fy); ctx.lineTo(W, fy);
    }
    ctx.stroke();

    /* ---- 场景：散布的方块（不同视差深度） ---- */
    for (i = 0; i < 11; i++) {
      var depth = U.rng(i * 7 + 1);
      var bx4 = W * 0.08 + U.rng(i * 11 + 3) * W * 0.84;
      var by4 = horizon + (H - horizon) * (0.15 + depth * 0.75);
      var bsize = base * (0.06 + depth * 0.18);
      var bwob = Math.sin(tl * 1.2 + i) * 8 * S;
      var bg5 = ctx.createLinearGradient(bx4 - bsize / 2, by4 - bsize, bx4 + bsize / 2, by4);
      bg5.addColorStop(0, U.rgba(U.mix(U.bg2, U.accent, 0.5), 0.92));
      bg5.addColorStop(1, U.rgba(U.mix(U.bg1, U.accent2, 0.4), 0.92));
      ctx.fillStyle = bg5;
      U.rr(ctx, bx4 - bsize / 2, by4 - bsize * 1.4 + bwob, bsize, bsize * 1.4, 8 * S);
      ctx.fill();
      ctx.strokeStyle = U.rgba(U.ink, 0.12);
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
    }

    /* ---- 场景：中心标题 ---- */
    ctx.font = U.fs(base * 0.3, 900);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var tg2 = ctx.createLinearGradient(cx - base * 0.6, 0, cx + base * 0.6, 0);
    tg2.addColorStop(0, U.ink);
    tg2.addColorStop(1, U.mix(U.ink, U.accent, 0.6));
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 40 * S * p.glow; }
    ctx.fillStyle = tg2;
    ctx.fillText(String(p.text || ''), cx, cy - base * 0.42);
    ctx.shadowBlur = 0;

    ctx.restore();

    /* 取景框 */
    ctx.save();
    ctx.strokeStyle = U.rgba(U.ink, 0.18);
    ctx.lineWidth = 2 * S;
    ctx.setLineDash([16 * S, 12 * S]);
    var m = 34 * S;
    ctx.strokeRect(m, m, W - m * 2, H - m * 2);
    ctx.setLineDash([]);
    ctx.font = U.fs(20 * S, 700);
    ctx.fillStyle = U.rgba(U.ink, 0.4);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('REC ●', m + 14 * S, m + 12 * S);
    ctx.restore();
  }

  MF.forge({
    cat: '镜头运动', type: 'block', dur: 6, poster: 0.6,
    params: CAM_PARAMS, draw: camDraw,
    ids: [
      { id: 'cm-push-in', name: '推近', tags: ['推近', '聚焦'], desc: '镜头缓慢推近，画面逐渐聚焦，是最基础的运镜。', cfg: { kind: 'push-in' } },
      { id: 'cm-pull-out', name: '拉远', tags: ['拉远', '展开'], desc: '镜头由近拉远，揭示更大的空间与全貌。', cfg: { kind: 'pull-out' } },
      { id: 'cm-orbit', name: '环绕', tags: ['环绕', '空间'], desc: '镜头围绕主体横向环绕，空间感与立体感强。', cfg: { kind: 'orbit' } },
      { id: 'cm-shake', name: '手持抖动', tags: ['抖动', '真实'], desc: '噪声驱动的手持抖动，真实且有纪录片质感。', cfg: { kind: 'shake' } },
      { id: 'cm-tilt', name: '倾斜俯仰', tags: ['俯仰', '动感'], desc: '镜头带倾斜与透视变化，画面更有张力。', cfg: { kind: 'tilt' } },
      { id: 'cm-whip-pan', name: '甩镜', tags: ['甩镜', '转场'], desc: '高速甩镜并带运动模糊，是最常用的转场式运镜。', cfg: { kind: 'whip-pan' } },
      { id: 'cm-parallax', name: '视差层', tags: ['视差', '深度'], desc: '近远景以不同速度移动，制造强烈的空间深度。', cfg: { kind: 'parallax' } },
      { id: 'cm-crane', name: '升降', tags: ['升降', '宏大'], desc: '镜头整体升降，适合展示规模与宏大场景。', cfg: { kind: 'crane' } },
      { id: 'cm-dolly-zoom', name: '推拉变焦', tags: ['眩晕', '希区柯克'], desc: '推近同时变焦的眩晕效果，情绪张力极强。', cfg: { kind: 'dolly-zoom' } },
      { id: 'cm-roll', name: '翻滚', tags: ['翻滚', '动感'], desc: '镜头持续旋转翻滚，动感与眩晕感并存。', cfg: { kind: 'roll' } },
      { id: 'cm-zoom-punch', name: '冲击缩放', tags: ['冲击', '节奏'], desc: '周期性快速缩放形成的冲击节奏，适合卡点剪辑。', cfg: { kind: 'zoom-punch' } },
      { id: 'cm-pan-lr', name: '左右横移', tags: ['横移', '展示'], desc: '镜头左右平移，像在空间中横向巡视。', cfg: { kind: 'pan-lr' } },
      { id: 'cm-pan-ud', name: '上下纵移', tags: ['纵移', '展示'], desc: '镜头上下平移，适合展示竖直结构与长图。', cfg: { kind: 'pan-ud' } },
      { id: 'cm-focus-pull', name: '移焦', tags: ['移焦', '呼吸'], desc: '焦距缓慢变化产生的呼吸感，气质柔和。', cfg: { kind: 'focus-pull' } },
      { id: 'cm-handheld', name: '手持漫步', tags: ['手持', '自然'], desc: '复合的轻微手持运动，像摄影师边走边拍。', cfg: { kind: 'handheld' } },
      { id: 'cm-spiral', name: '螺旋运镜', tags: ['螺旋', '迷幻'], desc: '镜头沿螺旋轨迹运动并旋转，迷幻而有沉浸感。', cfg: { kind: 'spiral-cam' } }
    ]
  });

  /* ══════════════════════════ 形变转换 ══════════════════════════ */

  var MORPH_PARAMS = [
    P('kind', '形变方式', 'circle-square', sel('circle-square', [
      ['circle-square', '圆变方'], ['polygon-interp', '多边形插值'], ['blob-liquid', '液态球体'], ['star-burst', '星爆展开'],
      ['ribbon', '丝带缠绕'], ['spring-coil', '弹簧线圈'], ['mobius', '莫比乌斯'], ['metaball', '元球融合'],
      ['fold', '折叠翻转'], ['twist', '扭曲旋转'], ['inflate', '充气膨胀'], ['shatter', '破碎重组'],
      ['merge', '合并聚合'], ['split-shape', '分裂'], ['wave-blob', '波纹形变'], ['knot', '环面纽结']
    ])),
    P('count', '数量', 6, rng(6, 2, 20, 1)),
    P('size', '尺寸', 620, rng(620, 90.0, 840.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function morphDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var n = Math.max(2, Math.round(p.count));
    var i, a;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    var grd = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
    grd.addColorStop(0, U.accent);
    grd.addColorStop(1, U.accent2);
    ctx.strokeStyle = grd;
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 26 * S * p.glow; }

    if (kind === 'circle-square') {
      var cs = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      cs = e.inOutCubic(cs);
      ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var ca = Math.PI * 2 * i / 200;
        var crx = Math.max(Math.abs(Math.cos(ca)), Math.abs(Math.sin(ca)));
        var circR = base * 0.34;
        var sqR = base * 0.34 / Math.max(0.0001, crx);
        var rad = U.lerp(circR, Math.min(sqR, base * 0.5), cs);
        var px6 = cx + Math.cos(ca) * rad, py6 = cy + Math.sin(ca) * rad;
        if (i) ctx.lineTo(px6, py6); else ctx.moveTo(px6, py6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'polygon-interp') {
      /* n 边形 ↔ (n+4) 边形真实插值：按角度求各自多边形半径再 lerp */
      var sidesA = Math.max(3, n), sidesB = Math.max(3, n + 4);
      var ip = e.inOutCubic(Math.sin(t * sp * 0.6) * 0.5 + 0.5);
      var spin = t * sp * 0.18;
      function polyR(ang, sides) {
        var seg = Math.PI * 2 / sides;
        var loc = ((ang + spin) % seg + seg) % seg - seg / 2;
        return base * 0.38 * Math.cos(seg / 2) / Math.cos(loc);
      }
      ctx.beginPath();
      var STEPS = 160;
      for (i = 0; i <= STEPS; i++) {
        var pa = Math.PI * 2 * i / STEPS - Math.PI / 2;
        var rr = U.lerp(polyR(pa, sidesA), polyR(pa, sidesB), ip);
        var fx6 = cx + Math.cos(pa) * rr, fy6 = cy + Math.sin(pa) * rr;
        if (i) ctx.lineTo(fx6, fy6); else ctx.moveTo(fx6, fy6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'blob-liquid' || kind === 'wave-blob') {
      ctx.beginPath();
      for (i = 0; i <= 240; i++) {
        var ba = Math.PI * 2 * i / 240;
        var noiseV = U.noise(ba * 1.6 + t * sp * 1.2, 5) * 0.5 + U.noise(ba * 3.2 - t * sp * 0.8, 9) * 0.3;
        var brad = base * 0.34 * (1 + noiseV * 0.28);
        var bx5 = cx + Math.cos(ba) * brad, by5 = cy + Math.sin(ba) * brad;
        if (i) ctx.lineTo(bx5, by5); else ctx.moveTo(bx5, by5);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'star-burst') {
      var spikes = Math.max(4, n);
      var grow = e.outElastic(U.clamp((t * sp % 3.4) / 1.6, 0, 1));
      ctx.beginPath();
      for (i = 0; i <= spikes * 2; i++) {
        var sa = Math.PI * i / spikes - Math.PI / 2;
        var srr = (i % 2 ? base * 0.16 : base * 0.44) * (0.4 + grow * 0.6);
        var sx6 = cx + Math.cos(sa) * srr, sy6 = cy + Math.sin(sa) * srr;
        if (i) ctx.lineTo(sx6, sy6); else ctx.moveTo(sx6, sy6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'ribbon') {
      var ribbonN = Math.max(8, n * 4);
      for (var pass2 = 0; pass2 < 3; pass2++) {
        ctx.beginPath();
        for (i = 0; i <= ribbonN; i++) {
          var rf2 = i / ribbonN;
          var rba = rf2 * Math.PI * 2 * 2.2 + t * sp * 0.8;
          var rrad2 = base * 0.4 * (1 - rf2 * 0.4);
          var rx3 = cx + Math.cos(rba) * rrad2 + (pass2 - 1) * 14 * S;
          var ry4 = cy + Math.sin(rba * 1.6) * rrad2 * 0.72 + (pass2 - 1) * 8 * S;
          if (i) ctx.lineTo(rx3, ry4); else ctx.moveTo(rx3, ry4);
        }
        ctx.lineWidth = (7 - pass2 * 1.8) * S;
        ctx.globalAlpha = 0.55 + pass2 * 0.22;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spring-coil') {
      var coils2 = Math.max(5, n);
      var ch2 = (coils2 - 1) * 0.6;
      ctx.beginPath();
      for (i = 0; i <= coils2 * 26; i++) {
        var cf2 = i / (coils2 * 26);
        var cang3 = cf2 * Math.PI * 2 * coils2 + t * sp * 2;
        var crad3 = base * 0.3;
        var cxx2 = cx + Math.cos(cang3) * crad3;
        var cyy2 = cy - ch2 * base * 0.5 + cf2 * ch2 * base;
        if (i) ctx.lineTo(cxx2, cyy2); else ctx.moveTo(cxx2, cyy2);
      }
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'mobius') {
      ctx.beginPath();
      for (i = 0; i <= 360; i++) {
        var mf = i / 360;
        var ma = mf * Math.PI * 2;
        var mr = base * 0.32;
        var mx6 = cx + Math.cos(ma) * mr * (1 + 0.5 * Math.cos(ma / 2 + t * sp));
        var my6 = cy + Math.sin(ma) * mr * (1 + 0.5 * Math.cos(ma / 2 + t * sp));
        if (i) ctx.lineTo(mx6, my6); else ctx.moveTo(mx6, my6);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else if (kind === 'metaball') {
      var orbs = Math.max(3, n - 2);
      for (i = 0; i < orbs; i++) {
        var moa = i / orbs * Math.PI * 2 + t * sp * 0.5;
        var mod = base * 0.18;
        var mox = cx + Math.cos(moa) * mod;
        var moy = cy + Math.sin(moa) * mod;
        var mor = base * 0.2 * (1 + 0.2 * Math.sin(t * sp * 2 + i));
        var mg3 = ctx.createRadialGradient(mox, moy, 0, mox, moy, mor * 1.6);
        mg3.addColorStop(0, U.rgba(U.mix(U.accent, U.accent2, i / orbs), 0.9));
        mg3.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = mg3;
        ctx.beginPath(); ctx.arc(mox, moy, mor * 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'fold') {
      var foldP = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      var foldW = base * 0.7, foldH = base * 0.5;
      for (i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(i * Math.PI / 2 + t * sp * 0.2);
        var fScale = Math.abs(Math.cos(foldP * Math.PI + i * 0.4));
        ctx.scale(1, Math.max(0.06, fScale));
        ctx.beginPath();
        ctx.rect(-foldW / 2, -foldH / 2, foldW, foldH);
        ctx.lineWidth = 5 * S;
        ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'twist') {
      var twN = Math.max(6, n * 2);
      for (var ti3 = 0; ti3 < twN; ti3++) {
        var tf3 = ti3 / (twN - 1);
        ctx.beginPath();
        for (i = 0; i <= 80; i++) {
          var ttf = i / 80;
          var ttang = ttf * Math.PI * 2 + tf3 * 2.2 + t * sp * 1.2;
          var ttrad = base * 0.36 * (0.4 + tf3 * 0.6);
          var ttx3 = cx + Math.cos(ttang) * ttrad;
          var tty3 = cy + Math.sin(ttang) * ttrad * 0.6 + (tf3 - 0.5) * base * 1.1;
          if (i) ctx.lineTo(ttx3, tty3); else ctx.moveTo(ttx3, tty3);
        }
        ctx.lineWidth = 3 * S;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'inflate') {
      for (var layer2 = 0; layer2 < 4; layer2++) {
        var iph = ((t * sp * 0.4 + layer2 / 4) % 1);
        var ir = base * 0.5 * Math.pow(iph, 0.7);
        ctx.globalAlpha = (1 - iph) * 0.75;
        ctx.beginPath();
        for (i = 0; i <= 120; i++) {
          var ia = Math.PI * 2 * i / 120;
          var irad = ir * (1 + 0.1 * Math.sin(ia * 6 + t * sp * 3));
          var ix2 = cx + Math.cos(ia) * irad, iy2 = cy + Math.sin(ia) * irad;
          if (i) ctx.lineTo(ix2, iy2); else ctx.moveTo(ix2, iy2);
        }
        ctx.closePath();
        ctx.lineWidth = 4 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'shatter') {
      var pieces = Math.max(8, n * 3);
      var cycle3 = 3.4 / sp;
      var sct = (t % cycle3) / cycle3;
      var explodeP = sct < 0.5 ? e.outExpo(sct * 2) : 1 - e.inOutCubic((sct - 0.5) * 2);
      for (i = 0; i < pieces; i++) {
        var sha = U.rng(i) * Math.PI * 2;
        var shd = base * 0.55 * explodeP * (0.4 + U.rng(i + 9) * 1.1);
        var shx = cx + Math.cos(sha) * shd;
        var shy = cy + Math.sin(sha) * shd;
        var shs = base * 0.1 * (1 - explodeP * 0.35);
        ctx.save();
        ctx.translate(shx, shy);
        ctx.rotate(t * sp * 1.4 + i);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        U.rr(ctx, -shs / 2, -shs / 2, shs, shs, 3 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'merge') {
      var orbs2 = Math.max(4, n);
      var mergeP = (Math.sin(t * sp * 0.55) * 0.5 + 0.5);
      for (i = 0; i < orbs2; i++) {
        var mma = i / orbs2 * Math.PI * 2 + t * sp * 0.3;
        var mmd = base * 0.42 * (1 - mergeP * 0.9);
        var mmx = cx + Math.cos(mma) * mmd;
        var mmy = cy + Math.sin(mma) * mmd;
        var mmr = base * 0.14 * (0.7 + mergeP * 0.6);
        var mmg = ctx.createRadialGradient(mmx, mmy, 0, mmx, mmy, mmr * 1.5);
        mmg.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0.9));
        mmg.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = mmg;
        ctx.beginPath(); ctx.arc(mmx, mmy, mmr * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'split-shape') {
      var spP = Math.sin(t * sp * 0.7) * 0.5 + 0.5;
      for (i = -1; i <= 1; i += 2) {
        ctx.save();
        ctx.translate(cx + i * spP * base * 0.42, cy);
        ctx.rotate(i * spP * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, base * 0.26, 0, Math.PI * 2);
        ctx.lineWidth = 5 * S;
        ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'knot') {
      ctx.beginPath();
      for (i = 0; i <= 400; i++) {
        var kf2 = i / 400;
        var ka = kf2 * Math.PI * 2;
        var kR = base * 0.3;
        var kx3 = cx + (kR + kR * 0.4 * Math.cos(3 * ka)) * Math.cos(2 * ka + t * sp * 0.5);
        var ky3 = cy + (kR + kR * 0.4 * Math.cos(3 * ka)) * Math.sin(2 * ka + t * sp * 0.5);
        if (i) ctx.lineTo(kx3, ky3); else ctx.moveTo(kx3, ky3);
      }
      ctx.closePath();
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    else {
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.34, 0, Math.PI * 2);
      ctx.lineWidth = 5 * S;
      ctx.stroke();
    }

    ctx.restore();
  }

  MF.forge({
    cat: '形变转换', type: 'block', dur: 6, poster: 0.55,
    params: MORPH_PARAMS, draw: morphDraw,
    ids: [
      { id: 'mo-circle-square', name: '圆变方', tags: ['形变', '基础'], desc: '圆角在圆与方之间平滑过渡，是最直观的形变演示。', cfg: { kind: 'circle-square' } },
      { id: 'mo-polygon', name: '多边形插值', tags: ['多边形', '过渡'], desc: '多边形在边数之间连续插值变形，数学感强。', cfg: { kind: 'polygon-interp', count: 5 } },
      { id: 'mo-blob', name: '液态球体', tags: ['液态', '有机'], desc: '边缘由噪声驱动的液态形变，有机且生动。', cfg: { kind: 'blob-liquid' } },
      { id: 'mo-star-burst', name: '星爆展开', tags: ['星爆', '弹性'], desc: '星形带弹性展开，冲击与庆祝感兼备。', cfg: { kind: 'star-burst', count: 9 } },
      { id: 'mo-ribbon', name: '丝带缠绕', tags: ['丝带', '柔美'], desc: '多条丝带缠绕旋转，柔美且优雅。', cfg: { kind: 'ribbon' } },
      { id: 'mo-spring', name: '弹簧线圈', tags: ['弹簧', '机械'], desc: '弹簧线圈持续旋转压缩，机械结构感强。', cfg: { kind: 'spring-coil', count: 7 } },
      { id: 'mo-mobius', name: '莫比乌斯', tags: ['莫比乌斯', '拓扑'], desc: '莫比乌斯环的拓扑形态持续变形，神秘且优雅。', cfg: { kind: 'mobius' } },
      { id: 'mo-metaball', name: '元球融合', tags: ['元球', '融合'], desc: '多个光球互相吸引融合，流体般的融合感。', cfg: { kind: 'metaball', count: 6 } },
      { id: 'mo-fold', name: '折叠翻转', tags: ['折叠', '立体'], desc: '多层结构不断折叠翻转，立体感突出。', cfg: { kind: 'fold' } },
      { id: 'mo-twist', name: '扭曲旋转', tags: ['扭曲', '立体'], desc: '大量线条带扭曲旋转，形成立体螺旋结构。', cfg: { kind: 'twist', count: 9 } },
      { id: 'mo-inflate', name: '充气膨胀', tags: ['膨胀', '脉冲'], desc: '形状一波波向外充气膨胀，节奏明显。', cfg: { kind: 'inflate' } },
      { id: 'mo-shatter', name: '破碎重组', tags: ['破碎', '重组'], desc: '形状炸裂成碎片再重新聚合，循环往复。', cfg: { kind: 'shatter', count: 10 } },
      { id: 'mo-merge', name: '合并聚合', tags: ['合并', '聚合'], desc: '多个光球向中心聚合后又散开，循环有序。', cfg: { kind: 'merge', count: 7 } },
      { id: 'mo-split', name: '分裂', tags: ['分裂', '对称'], desc: '单一形状分裂为两半并分离，再合并回来。', cfg: { kind: 'split-shape' } },
      { id: 'mo-knot', name: '环面纽结', tags: ['纽结', '拓扑'], desc: '环面纽结曲线持续旋转，复杂而优雅。', cfg: { kind: 'knot' } },
      { id: 'mo-wave-blob', name: '波纹形变', tags: ['波纹', '有机'], desc: '边缘波纹式起伏的液态形变，柔和有呼吸感。', cfg: { kind: 'wave-blob' } }
    ]
  });

  /* ══════════════════════════ 加载与进度 ══════════════════════════ */

  var PROG_PARAMS = [
    P('kind', '进度形态', 'bar', sel('bar', [
      ['bar', '进度条'], ['bar-stripes', '条纹进度'], ['ring', '环形进度'], ['dots', '点阵加载'],
      ['steps', '步骤进度'], ['percent', '百分比滚动'], ['segments', '分段进度'], ['upload', '上传进度'],
      ['loading-text', '加载文案'], ['bounce-dots', '弹跳点'], ['square-flip', '方块翻转'], ['wave-load', '波浪加载'],
      ['counter', '计数加载'], ['battery-charge', '电池充能'], ['circle-arrow', '圆环旋转'], ['ladder', '阶梯进度'],
      ['pulse-bar', '脉冲条'], ['hashtag', '井号旋转'], ['clock-progress', '时钟进度'], ['fill-reveal', '填充揭示']
    ])),
    P('text', '主文案', '加载中', txt('加载中')),
    P('sub', '副文案', '请稍候', txt('请稍候')),
    P('size', '尺寸', 360.0, rng(360.0, 2156, 912.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function progDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var ink = U.ink;
    var label = String(p.text || '');
    var sub = String(p.sub || '');
    var i;
    var cyc = (t * sp * 0.32) % 1.25;
    var prog = U.clamp(cyc, 0, 1);

    ctx.save();
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.7); ctx.shadowBlur = 22 * S * p.glow; }
    var grad = ctx.createLinearGradient(cx - base * 0.5, 0, cx + base * 0.5, 0);
    grad.addColorStop(0, U.accent);
    grad.addColorStop(1, U.accent2);

    if (kind === 'bar' || kind === 'bar-stripes' || kind === 'pulse-bar') {
      var bw5 = base * 1.4, bh5 = 34 * S;
      U.rr(ctx, cx - bw5 / 2, cy - bh5 / 2, bw5, bh5, bh5 / 2);
      ctx.fillStyle = U.rgba(ink, 0.1);
      ctx.fill();
      ctx.save();
      U.rr(ctx, cx - bw5 / 2, cy - bh5 / 2, bw5, bh5, bh5 / 2);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillRect(cx - bw5 / 2, cy - bh5 / 2, bw5 * prog, bh5);
      if (kind === 'bar-stripes') {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFFFF';
        var soff2 = (t * sp * 90) % (26 * S);
        for (i = -6; i < bw5 / (26 * S) + 6; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - bw5 / 2 + i * 26 * S + soff2, cy - bh5);
          ctx.lineTo(cx - bw5 / 2 + i * 26 * S + soff2 + 12 * S, cy + bh5);
          ctx.lineTo(cx - bw5 / 2 + i * 26 * S + soff2 + 20 * S, cy + bh5);
          ctx.lineTo(cx - bw5 / 2 + i * 26 * S + soff2 + 8 * S, cy - bh5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (kind === 'pulse-bar') {
        var pg4 = ctx.createLinearGradient(cx - bw5 / 2, 0, cx + bw5 / 2, 0);
        pg4.addColorStop(0, U.rgba(U.accent, 0));
        pg4.addColorStop(Math.max(0, prog - 0.16), U.rgba('#FFFFFF', 0.6));
        pg4.addColorStop(prog, U.rgba('#FFFFFF', 0));
        ctx.fillStyle = pg4;
        ctx.fillRect(cx - bw5 / 2, cy - bh5 / 2, bw5, bh5);
      }
      ctx.restore();
      ctx.font = U.fs(28 * S, 800);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), cx - bw5 / 2, cy - bh5 / 2 - 34 * S);
      ctx.textAlign = 'right';
      ctx.fillStyle = U.accent;
      ctx.fillText(Math.round(prog * 100) + '%', cx + bw5 / 2, cy - bh5 / 2 - 34 * S);
    }

    else if (kind === 'ring' || kind === 'circle-arrow' || kind === 'clock-progress') {
      var R5 = base * 0.42;
      ctx.beginPath();
      ctx.arc(cx, cy, R5, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(ink, 0.12);
      ctx.lineWidth = 24 * S;
      ctx.lineCap = 'round';
      ctx.stroke();
      if (kind === 'ring') {
        ctx.beginPath();
        ctx.arc(cx, cy, R5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 24 * S;
        ctx.stroke();
      } else if (kind === 'clock-progress') {
        var tick = Math.floor(prog * 12);
        for (i = 0; i < 12; i++) {
          var tka = i / 12 * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tka) * R5 * 0.82, cy + Math.sin(tka) * R5 * 0.82);
          ctx.lineTo(cx + Math.cos(tka) * R5 * 0.95, cy + Math.sin(tka) * R5 * 0.95);
          ctx.strokeStyle = i < tick ? U.accent : U.rgba(ink, 0.2);
          ctx.lineWidth = 8 * S;
          ctx.stroke();
        }
      } else {
        var arrA = t * sp * 3;
        ctx.beginPath();
        ctx.arc(cx, cy, R5, arrA, arrA + Math.PI * 0.5);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 24 * S;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(arrA + 0.5) * R5, cy + Math.sin(arrA + 0.5) * R5);
        ctx.lineTo(cx + Math.cos(arrA + 0.5) * (R5 + 28 * S), cy + Math.sin(arrA + 0.5) * (R5 + 28 * S));
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = 10 * S;
        ctx.stroke();
      }
      ctx.font = U.fs(64 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(prog * 100) + '%', cx, cy + 4 * S);
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 18), cx, cy + R5 + 52 * S);
    }

    else if (kind === 'dots' || kind === 'bounce-dots') {
      var dn2 = Math.max(3, Math.round(base / 60));
      var dotGap = base * 0.24;
      for (i = 0; i < dn2; i++) {
        var dph = kind === 'bounce-dots' ? Math.abs(Math.sin(t * sp * 2 - i * 0.7)) : U.clamp((t * sp * 1.4 - i * 0.22) % 1.4, 0, 1);
        var dyy = kind === 'bounce-dots' ? -dph * 40 * S : 0;
        var drr2 = kind === 'bounce-dots' ? 16 * S : (8 + dph * 12) * S;
        ctx.globalAlpha = kind === 'bounce-dots' ? 1 : 0.3 + dph * 0.7;
        ctx.beginPath();
        ctx.arc(cx + (i - (dn2 - 1) / 2) * dotGap, cy + dyy, drr2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.font = U.fs(26 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 18), cx, cy + 70 * S);
    }

    else if (kind === 'steps' || kind === 'ladder') {
      var stepN = 5;
      var activeStep = Math.floor(prog * stepN);
      var stepGap = base * 0.9 / (stepN - 1);
      for (i = 0; i < stepN; i++) {
        var stx2 = cx - base * 0.45 + i * stepGap;
        var stir = i <= activeStep;
        var spop = stir ? e.outBack(U.clamp((t * sp * 4 - i * 0.6), 0, 1)) : 0.6;
        var sr3 = 20 * S * spop;
        ctx.beginPath();
        ctx.arc(stx2, cy, sr3, 0, Math.PI * 2);
        ctx.fillStyle = stir ? U.accent : U.rgba(ink, 0.16);
        ctx.fill();
        if (i < stepN - 1) {
          ctx.strokeStyle = i < activeStep ? U.accent : U.rgba(ink, 0.14);
          ctx.lineWidth = 5 * S;
          ctx.beginPath();
          ctx.moveTo(stx2 + sr3 + 4 * S, cy);
          ctx.lineTo(stx2 + stepGap - sr3 - 4 * S, cy);
          ctx.stroke();
        }
        if (stir) {
          ctx.font = U.fs(20 * S, 800);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = U.bg1;
          ctx.fillText(String(i + 1), stx2, cy + 1 * S);
        }
      }
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(label.slice(0, 16), cx, cy + 70 * S);
    }

    else if (kind === 'percent' || kind === 'counter') {
      var num3 = Math.round(prog * 100);
      ctx.font = U.fs(base * 0.62, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var pg5 = ctx.createLinearGradient(cx - base * 0.35, 0, cx + base * 0.35, 0);
      pg5.addColorStop(0, U.ink);
      pg5.addColorStop(1, U.accent);
      ctx.fillStyle = pg5;
      ctx.fillText(String(num3) + (kind === 'percent' ? '%' : ''), cx, cy - 12 * S);
      var bw6 = base * 1.1;
      U.rr(ctx, cx - bw6 / 2, cy + base * 0.42, bw6, 12 * S, 6 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      U.rr(ctx, cx - bw6 / 2, cy + base * 0.42, bw6 * prog, 12 * S, 6 * S);
      ctx.fillStyle = grad; ctx.fill();
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 18), cx, cy + base * 0.62);
    }

    else if (kind === 'segments') {
      var segN = 22;
      var segW = base * 1.3 / segN;
      var filled = Math.floor(prog * segN);
      for (i = 0; i < segN; i++) {
        var segOn = i < filled;
        ctx.globalAlpha = segOn ? 1 : 0.16;
        ctx.fillStyle = segOn ? (i % 3 === 2 ? U.accent2 : U.accent) : ink;
        U.rr(ctx, cx - base * 0.65 + i * segW, cy - 22 * S, segW * 0.62, 44 * S, 4 * S);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(label.slice(0, 16), cx, cy + 74 * S);
    }

    else if (kind === 'upload') {
      var arrY = cy - base * 0.3 + Math.abs(Math.sin(t * sp * 2)) * 16 * S;
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 7 * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, arrY + 40 * S);
      ctx.lineTo(cx, arrY);
      ctx.moveTo(cx - 20 * S, arrY + 20 * S);
      ctx.lineTo(cx, arrY);
      ctx.lineTo(cx + 20 * S, arrY + 20 * S);
      ctx.stroke();
      var uw = base * 1.3;
      U.rr(ctx, cx - uw / 2, cy + base * 0.16, uw, 16 * S, 8 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      U.rr(ctx, cx - uw / 2, cy + base * 0.16, uw * prog, 16 * S, 8 * S);
      ctx.fillStyle = grad; ctx.fill();
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 20) + ' · ' + Math.round(prog * 100) + '%', cx, cy + base * 0.34);
    }

    else if (kind === 'loading-text') {
      var dotsN = Math.floor(t * sp * 2.4) % 4;
      ctx.font = U.fs(base * 0.24, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.letterSpacing = '4px';
      ctx.fillText(label.slice(0, 14) + '...'.slice(0, dotsN), cx, cy - 16 * S);
      ctx.letterSpacing = '0px';
      var lw3 = base * 1.1;
      U.rr(ctx, cx - lw3 / 2, cy + 52 * S, lw3, 10 * S, 5 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      var lrunner = (t * sp * 0.5) % 1.4 - 0.2;
      U.rr(ctx, cx - lw3 / 2 + lw3 * Math.max(0, lrunner), cy + 52 * S, lw3 * 0.22, 10 * S, 5 * S);
      ctx.fillStyle = grad; ctx.fill();
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.5);
      ctx.fillText(sub.slice(0, 20), cx, cy + 108 * S);
    }

    else if (kind === 'square-flip') {
      var sqN = 4;
      for (i = 0; i < sqN; i++) {
        var sqp = (t * sp * 1.4 - i * 0.2) % (sqN * 0.4);
        var sqf = sqp < 0 ? 0 : U.clamp(sqp / 0.4, 0, 1);
        var sqScale = Math.abs(Math.cos(sqf * Math.PI));
        var sqx3 = cx + (i - (sqN - 1) / 2) * 70 * S;
        ctx.save();
        ctx.translate(sqx3, cy);
        ctx.scale(Math.max(0.06, sqScale), 1);
        ctx.fillStyle = U.accent;
        U.rr(ctx, -24 * S, -24 * S, 48 * S, 48 * S, 8 * S);
        ctx.fill();
        ctx.restore();
      }
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 18), cx, cy + 78 * S);
    }

    else if (kind === 'wave-load') {
      var wlw = base * 1.4;
      U.rr(ctx, cx - wlw / 2, cy - 30 * S, wlw, 60 * S, 30 * S);
      ctx.fillStyle = U.rgba(ink, 0.1); ctx.fill();
      ctx.save();
      U.rr(ctx, cx - wlw / 2, cy - 30 * S, wlw, 60 * S, 30 * S);
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(cx - wlw / 2, cy + 30 * S);
      for (i = 0; i <= 120; i++) {
        var wlx = cx - wlw / 2 + (i / 120) * wlw;
        var wly = cy - 30 * S + (1 - prog) * 60 * S + Math.sin(i * 0.3 + t * sp * 3) * 6 * S;
        ctx.lineTo(wlx, wly);
      }
      ctx.lineTo(cx + wlw / 2, cy + 30 * S);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      ctx.font = U.fs(26 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(prog * 100) + '%', cx, cy + 1 * S);
    }

    else if (kind === 'battery-charge') {
      var bw7 = base * 1.2, bh7 = bw7 * 0.42;
      U.rr(ctx, cx - bw7 / 2, cy - bh7 / 2, bw7, bh7, 12 * S);
      ctx.strokeStyle = U.rgba(ink, 0.4);
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      U.rr(ctx, cx + bw7 / 2 - 4 * S, cy - bh7 * 0.16, 16 * S, bh7 * 0.32, 5 * S);
      ctx.fillStyle = U.rgba(ink, 0.4); ctx.fill();
      var pad2 = 10 * S;
      U.rr(ctx, cx - bw7 / 2 + pad2, cy - bh7 / 2 + pad2, (bw7 - pad2 * 2) * prog, bh7 - pad2 * 2, 6 * S);
      var bcg = ctx.createLinearGradient(cx - bw7 / 2, 0, cx + bw7 / 2, 0);
      bcg.addColorStop(0, U.accent);
      bcg.addColorStop(1, U.accent2);
      ctx.fillStyle = bcg;
      ctx.fill();
      var bolt = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * S);
      bolt.addColorStop(0, U.rgba('#FFFFFF', 0.8 * (1 - Math.abs(prog - 0.5) * 2)));
      bolt.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = bolt;
      ctx.beginPath(); ctx.arc(cx, cy, 40 * S, 0, Math.PI * 2); ctx.fill();
      ctx.font = U.fs(26 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14) + ' ' + Math.round(prog * 100) + '%', cx, cy + bh7 / 2 + 46 * S);
    }

    else if (kind === 'hashtag') {
      var hrot = t * sp * 1.6;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(hrot);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 12 * S;
      ctx.lineCap = 'round';
      for (i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * 22 * S - 8 * S, -58 * S);
        ctx.lineTo(i * 22 * S + 8 * S, 58 * S);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-58 * S, i * 22 * S - 8 * S);
        ctx.lineTo(58 * S, i * 22 * S + 8 * S);
        ctx.stroke();
      }
      ctx.restore();
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.65);
      ctx.fillText(sub.slice(0, 18), cx, cy + base * 0.4);
    }

    else if (kind === 'fill-reveal') {
      ctx.save();
      ctx.font = U.fs(base * 0.3, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.16);
      ctx.fillText(label.slice(0, 10), cx, cy - 20 * S);
      ctx.beginPath();
      ctx.rect(0, cy + 20 * S - base * 0.5 * prog, W, base * 0.5 * prog + base * 0.5);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillText(label.slice(0, 10), cx, cy - 20 * S);
      ctx.restore();
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.5);
      ctx.fillText(sub.slice(0, 18) + ' · ' + Math.round(prog * 100) + '%', cx, cy + base * 0.4);
    }

    else {
      var dbw = base * 1.4;
      U.rr(ctx, cx - dbw / 2, cy - 16 * S, dbw, 32 * S, 16 * S);
      ctx.fillStyle = U.rgba(ink, 0.12); ctx.fill();
      U.rr(ctx, cx - dbw / 2, cy - 16 * S, dbw * prog, 32 * S, 16 * S);
      ctx.fillStyle = grad; ctx.fill();
    }

    ctx.restore();
  }

  MF.forge({
    cat: '加载与进度', type: 'component', dur: 6, poster: 0.6,
    params: PROG_PARAMS, draw: progDraw,
    ids: [
      { id: 'pr-bar', name: '进度条', tags: ['进度', '基础'], desc: '最经典的横向进度条，循环推进。', cfg: { kind: 'bar', size: 1540} },
      { id: 'pr-bar-stripes', name: '条纹进度', tags: ['条纹', '动感'], desc: '带流动条纹的进度条，动感更强。', cfg: { kind: 'bar-stripes' } },
      { id: 'pr-ring', name: '环形进度', tags: ['环形', '简洁'], desc: '环形进度条并在中心显示百分比。', cfg: { kind: 'ring', size: 1540} },
      { id: 'pr-dots', name: '点阵加载', tags: ['点阵', '简约'], desc: '一串圆点依次放大变亮，简洁的加载表达。', cfg: { kind: 'dots' } },
      { id: 'pr-steps', name: '步骤进度', tags: ['步骤', '流程'], desc: '多段步骤逐级点亮并连线，适合流程进度。', cfg: { kind: 'steps', size: 1540} },
      { id: 'pr-percent', name: '百分比滚动', tags: ['百分比', '数字'], desc: '超大百分比数字滚动并带底部进度条。', cfg: { kind: 'percent' } },
      { id: 'pr-segments', name: '分段进度', tags: ['分段', '科技'], desc: '分段式进度条逐格点亮，科技感强。', cfg: { kind: 'segments', size: 1540} },
      { id: 'pr-upload', name: '上传进度', tags: ['上传', '箭头'], desc: '上传箭头配合底部进度条，明确传达上传中状态。', cfg: { kind: 'upload', size: 1540} },
      { id: 'pr-loading-text', name: '加载文案', tags: ['文案', '等待'], desc: '加载文案省略号循环加上流光进度条。', cfg: { kind: 'loading-text', size: 1540} },
      { id: 'pr-bounce-dots', name: '弹跳点', tags: ['弹跳', '轻量'], desc: '圆点依次弹跳，轻量且通用的等待动画。', cfg: { kind: 'bounce-dots' } },
      { id: 'pr-square-flip', name: '方块翻转', tags: ['方块', '节奏'], desc: '方块依次翻转，节奏感强，适合品牌化加载。', cfg: { kind: 'square-flip' } },
      { id: 'pr-wave-load', name: '波浪加载', tags: ['波浪', '填充'], desc: '液体波浪逐渐填满容器，生动且有进度感。', cfg: { kind: 'wave-load' } },
      { id: 'pr-counter', name: '计数加载', tags: ['计数', '数字'], desc: '纯数字计数加载，极简风格。', cfg: { kind: 'counter' } },
      { id: 'pr-battery', name: '电池充能', tags: ['电池', '能量'], desc: '电池电量逐步充满并带光效，能量感直观。', cfg: { kind: 'battery-charge', size: 1540} },
      { id: 'pr-circle-arrow', name: '圆环旋转', tags: ['旋转', '等待'], desc: '带箭头的圆环持续旋转，明确的处理中状态。', cfg: { kind: 'circle-arrow' } },
      { id: 'pr-ladder', name: '阶梯进度', tags: ['阶梯', '进阶'], desc: '阶梯状节点逐级点亮，隐喻进阶与成长。', cfg: { kind: 'ladder' } },
      { id: 'pr-pulse-bar', name: '脉冲条', tags: ['脉冲', '节奏'], desc: '进度条上有一道脉冲光带持续前推。', cfg: { kind: 'pulse-bar', size: 1540} },
      { id: 'pr-hashtag', name: '井号旋转', tags: ['井号', '品牌'], desc: '旋转的井号图形，社交与话题主题的加载表达。', cfg: { kind: 'hashtag' } },
      { id: 'pr-clock', name: '时钟进度', tags: ['时钟', '时间'], desc: '表盘刻度逐格点亮模拟时间推进。', cfg: { kind: 'clock-progress' } },
      { id: 'pr-fill-reveal', name: '填充揭示', tags: ['填充', '文字'], desc: '色块自下而上填满文字，加载完成感强烈。', cfg: { kind: 'fill-reveal', size: 1540} }
    ]
  });
})();
