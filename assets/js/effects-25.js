/* ==========================================================================
   Jaykou — effects-25 · 灵感源批次（带出处）
   取经（每个动效的 def.src 都记录了出处，工作台卡片与参数面板可见）：
     Aceternity UI        ui.aceternity.com       Lamp / Spotlight / Meteors / Background Beams
     Magic UI             magicui.design          Aurora / Border Beam
     Liquid Glass         glass.samasante.com     液态玻璃折射
     Circle Loaders       circleloaders.dominikakissi.com  环形加载
     Uiverse              uiverse.io              点阵加载
     Gradient Buttons     gradientbuttons.colorion.co      渐变按钮
     MicroKit UI          microkit.co             开关 / 输入框微交互
     Navbar Gallery       navbar.gallery          导航下划线
     CTA Gallery          cta.gallery             行动按钮光环
     404s                 404s.design             故障 404
     Scrolltide           scrolltide.co           滚动叙事 / 章节固定
     Kinetics             kinetics.colorion.co    动能排版
     Motion Primitives    motion-primitives.com   文字变形转场
     CSS Text Effects     text-effects.colorion.co 金属流光字
     Anime.js             animejs.com             路径描线
     3Dicons              3dicons.co              等距 3D 图标
     mapcn                mapcn.dev               地图路线
   硬约束：draw 完全自包含（只依赖 ctx/t/p/U），可被 toString 序列化导出。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF, P = MF.P, rng = MF.rng, txt = MF.txt, col = MF.col;
  function sel(arr) {
    return { type: 'select', options: arr.map(function (x) { return Array.isArray(x) ? x : [x, x]; }) };
  }
  function src(name, url) { return { name: name, url: url }; }

  /* ══════════════════════ 一、光效原语（Lamp / Spotlight / Meteors / Beams / Aurora） ══════════════════════ */

  function lightDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var kind = p.kind, A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    var cx = W / 2;

    /* 深色底：光效类自己铺底，保证任何主题下都是夜景 */
    var bgG = ctx.createLinearGradient(0, 0, W * 0.4, H);
    bgG.addColorStop(0, '#070910'); bgG.addColorStop(.6, '#0A0D16'); bgG.addColorStop(1, '#04050A');
    ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (kind === 'lamp') {
      var ly = H * 0.12, barW = W * 0.34;
      /* 灯罩 */
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - barW / 2, ly - 6 * S, barW, 8 * S, 4 * S);
      ctx.fill();
      ctx.fillStyle = 'rgba(160,175,210,.35)';
      ctx.fillRect(cx - barW / 2 - 10 * S, ly - 16 * S, barW + 20 * S, 4 * S);
      ctx.globalCompositeOperation = 'lighter';
      /* 双锥光 */
      [-1, 1].forEach(function (sgn, k) {
        var spread = W * (0.3 + 0.03 * Math.sin(tt * 1.1 + k));
        var g = ctx.createLinearGradient(cx, ly, cx + sgn * spread, H);
        g.addColorStop(0, U.rgba(A, 0.85));
        g.addColorStop(0.3, U.rgba(A, 0.32));
        g.addColorStop(0.7, U.rgba(B, 0.12));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx + sgn * barW * 0.5, ly);
        ctx.lineTo(cx + sgn * spread, H);
        ctx.lineTo(cx + sgn * spread * 0.2, H);
        ctx.closePath();
        ctx.fill();
      });
      /* 地面光池 */
      var pool = ctx.createRadialGradient(cx, H * 0.86, 0, cx, H * 0.86, W * 0.4);
      pool.addColorStop(0, U.rgba(A, 0.42)); pool.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.translate(cx, H * 0.86); ctx.scale(1, 0.26);
      ctx.fillStyle = pool; ctx.beginPath(); ctx.arc(0, 0, W * 0.4, 0, 6.283); ctx.fill(); ctx.restore();
      /* 文案 */
      ctx.globalCompositeOperation = 'source-over';
      var k2 = U.clamp(tt * 0.6 - 0.2, 0, 1);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 900);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.92 * k2);
      ctx.shadowColor = U.rgba(A, 0.55); ctx.shadowBlur = 26 * S;
      ctx.fillText(String(p.text || 'MAKE IT GLOW'), cx, H * 0.62);
      ctx.shadowBlur = 0;
      ctx.font = U.fs(15 * S, 600, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.4 * k2);
      ctx.fillText('A C E T E R N I T Y', cx, H * 0.72);

    } else if (kind === 'spotlight') {
      var sx = cx + Math.sin(tt * 0.5) * W * 0.26;
      var sy = H * 0.44 + Math.cos(tt * 0.37) * H * 0.1;
      /* 背景网格 */
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,255,255,.045)'; ctx.lineWidth = Math.max(1, S);
      var step = 72 * S, gx, gy;
      ctx.beginPath();
      for (gx = 0; gx <= W; gx += step) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
      for (gy = 0; gy <= H; gy += step) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      /* 主光斑 */
      var rg = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.26);
      rg.addColorStop(0, U.rgba('#FFFFFF', 0.26));
      rg.addColorStop(0.4, U.rgba(A, 0.16));
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sx, sy, W * 0.26, 0, 6.283); ctx.fill();
      /* 斜向光束 */
      ctx.save();
      ctx.translate(sx, sy); ctx.rotate(-0.42);
      var lg = ctx.createLinearGradient(-W * 0.4, 0, W * 0.4, 0);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, U.rgba('#FFFFFF', 0.09)); lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lg; ctx.fillRect(-W * 0.4, -H * 0.35, W * 0.8, H * 0.7);
      ctx.restore();
      /* 光尘 */
      for (var i = 0; i < 26; i++) {
        var px = U.rnd(0, W, i * 3.1), py = U.rnd(0, H, i * 5.7);
        var dx = px - sx, dy = py - sy, d = Math.sqrt(dx * dx + dy * dy);
        var lit = Math.max(0, 1 - d / (W * 0.3));
        ctx.fillStyle = U.rgba('#FFFFFF', 0.08 + lit * 0.55);
        ctx.beginPath(); ctx.arc(px + Math.sin(tt + i) * 6 * S, py + Math.cos(tt * .8 + i) * 6 * S, (1 + lit * 1.6) * S, 0, 6.283); ctx.fill();
      }
      /* 文案 */
      ctx.globalCompositeOperation = 'source-over';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 900);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.9);
      ctx.fillText(String(p.text || 'SPOTLIGHT'), cx, H * 0.83);

    } else if (kind === 'meteor') {
      /* 星野 */
      ctx.globalCompositeOperation = 'source-over';
      for (var s = 0; s < 120; s++) {
        var x1 = U.rnd(0, W, s * 1.3), y1 = U.rnd(0, H * 0.9, s * 2.7);
        var tw = 0.35 + 0.35 * Math.sin(tt * 2 + s);
        ctx.fillStyle = U.rgba('#FFFFFF', tw * 0.8);
        ctx.fillRect(x1, y1, (s % 5 === 0 ? 2 : 1) * S, (s % 5 === 0 ? 2 : 1) * S);
      }
      ctx.globalCompositeOperation = 'lighter';
      /* 流星 */
      var ang = 0.55, len = W * 0.16;
      for (var m = 0; m < 7; m++) {
        var cyc = (tt * (0.16 + m * 0.017) + m * 0.31) % 1;
        var prog = cyc;
        var mx = W * (1.1 - prog * 1.5) + m * W * 0.09;
        var my = H * (-0.15 + prog * 1.25) + (m % 4) * H * 0.07;
        var ex = mx - Math.cos(ang) * len, ey = my - Math.sin(ang) * len;
        var lg2 = ctx.createLinearGradient(ex, ey, mx, my);
        lg2.addColorStop(0, 'rgba(0,0,0,0)');
        lg2.addColorStop(.7, U.rgba(m % 2 ? B : A, 0.55));
        lg2.addColorStop(1, 'rgba(255,255,255,.95)');
        ctx.strokeStyle = lg2; ctx.lineWidth = (m % 3 === 0 ? 3.2 : 1.8) * S; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(mx, my); ctx.stroke();
        var hg = ctx.createRadialGradient(mx, my, 0, mx, my, 12 * S);
        hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(mx, my, 12 * S, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 900);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.92);
      ctx.fillText(String(p.text || 'METEORS'), W * 0.08, H * 0.26);

    } else if (kind === 'beams') {
      var n = 9;
      for (var b = 0; b < n; b++) {
        var bx = W * (0.05 + b / (n - 1) * 0.9) + Math.sin(tt * 0.35 + b) * W * 0.02;
        var bw = W * (0.02 + (b % 3) * 0.012);
        var topY = H * (0.02 + (b % 4) * 0.02);
        var bg2 = ctx.createLinearGradient(bx, topY, bx, H * 1.02);
        var c = b % 2 ? B : A;
        bg2.addColorStop(0, U.rgba(c, 0.34));
        bg2.addColorStop(0.5, U.rgba(c, 0.1));
        bg2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg2;
        ctx.beginPath();
        ctx.moveTo(bx - bw * 0.18, topY);
        ctx.lineTo(bx + bw * 0.18, topY);
        ctx.lineTo(bx + bw, H);
        ctx.lineTo(bx - bw, H);
        ctx.closePath(); ctx.fill();
      }
      /* 顶部光源雾 */
      var tg = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, W * 0.6);
      tg.addColorStop(0, U.rgba('#FFFFFF', 0.18)); tg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(W * 0.5, 0, W * 0.6, 0, 6.283); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 900);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.9);
      ctx.fillText(String(p.text || 'BACKGROUND BEAMS'), cx, H * 0.72);

    } else {
      /* aurora：多层丝带 */
      var hues = [A, B, '#5CE1E6', '#FF7AD9'];
      for (var l = 0; l < 5; l++) {
        var baseY = H * (0.3 + l * 0.1);
        var amp = H * (0.06 + l * 0.012);
        var ph = tt * (0.5 + l * 0.12) + l * 1.3;
        var grd = ctx.createLinearGradient(0, baseY - amp * 2, 0, baseY + amp * 3);
        var hc = hues[l % hues.length];
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(0.45, U.rgba(hc, 0.34 - l * 0.03));
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        for (var x = 0; x <= W; x += W / 64) {
          var yy = baseY + Math.sin(x / W * 6.283 * 1.4 + ph) * amp + Math.sin(x / W * 6.283 * 3.1 - ph * 0.7) * amp * 0.4;
          ctx.lineTo(x, yy);
        }
        for (var x2 = W; x2 >= 0; x2 -= W / 64) {
          var y2 = baseY + amp * 1.9 + Math.sin(x2 / W * 6.283 * 1.2 - ph * 0.9) * amp * 0.7;
          ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      /* 星点 */
      for (var st = 0; st < 60; st++) {
        ctx.fillStyle = U.rgba('#FFFFFF', 0.25 + 0.3 * Math.sin(tt * 2 + st));
        ctx.fillRect(U.rnd(0, W, st * 7.7), U.rnd(0, H * 0.7, st * 3.3), 1.4 * S, 1.4 * S);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 800);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.88);
      ctx.fillText(String(p.text || 'AURORA'), cx, H * 0.78);
    }
    ctx.restore();
  }

  MF.forge({
    cat: '光影氛围', type: 'block', dur: 6, poster: 0.6,
    params: [
      P('kind', '形态', 'lamp', sel([
        ['lamp', '聚光灯罩'], ['spotlight', '移动光斑'], ['meteor', '流星雨'],
        ['beams', '背景光束'], ['aurora', '极光丝带']
      ])),
      P('speed', '速度', 1, rng(1, 0.2, 2.6, 0.05)),
      P('size', '字号', 150, rng(150, 40, 340, 2)),
      P('text', '文本', 'MAKE IT GLOW', txt()),
      P('ink2', '主光色', '$accent', col('$accent')),
      P('ink3', '辅光色', '$accent2', col('$accent2'))
    ],
    draw: lightDraw,
    ids: [
      { id: 'src-lamp', name: '揭幕聚光灯', desc: '白色灯管从顶部垂下双锥光，光池在字下晕开，品牌字随光浮现', tags: ['聚光', '揭幕', '暗场'], src: src('Aceternity UI', 'https://ui.aceternity.com'), cfg: { kind: 'lamp', text: 'MAKE IT GLOW' } },
      { id: 'src-spotlight', name: '游走光斑', desc: '一束柔光在暗场网格上缓慢游走，光尘只在被照到的区域发亮', tags: ['光斑', '产品页', '暗场'], src: src('Aceternity UI', 'https://ui.aceternity.com'), cfg: { kind: 'spotlight', text: 'SPOTLIGHT' } },
      { id: 'src-meteor', name: '流星穿夜', desc: '星野闪烁，七道流星以不同速度斜穿画面，拖尾带品牌色辉光', tags: ['流星', '夜空', '发布会'], src: src('Aceternity UI', 'https://ui.aceternity.com'), cfg: { kind: 'meteor', text: 'METEORS' } },
      { id: 'src-beams', name: '天光垂落', desc: '九道半透明光束从顶部垂落并轻微摆动，顶部雾气收束光源', tags: ['光束', 'Hero', '产品页'], src: src('Aceternity UI', 'https://ui.aceternity.com'), cfg: { kind: 'beams', text: 'BACKGROUND BEAMS' } },
      { id: 'src-aurora', name: '极光丝带', desc: '五层极光丝带以不同相位流动，青紫交错，星空在背后呼吸', tags: ['极光', '渐变', '氛围'], src: src('Magic UI', 'https://magicui.design'), cfg: { kind: 'aurora', text: 'AURORA' } }
    ]
  });

  /* ══════════════════════ 二、材质原语（液态玻璃 / 边框跑光） ══════════════════════ */

  function glassDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;

    /* 彩色背景（玻璃要有东西可折射） */
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#120E24'); bg.addColorStop(.5, '#1B1233'); bg.addColorStop(1, '#0C0A18');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    var blobs = [[0.26, 0.3, 0.30, A], [0.74, 0.26, 0.26, B], [0.58, 0.78, 0.34, '#5CE1E6'], [0.18, 0.8, 0.22, '#FF7AD9']];
    blobs.forEach(function (b, i) {
      var bx = W * b[0] + Math.sin(tt * 0.4 + i) * W * 0.05;
      var by = H * b[1] + Math.cos(tt * 0.33 + i) * H * 0.05;
      var rr2 = Math.min(W, H) * b[2];
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, rr2);
      g.addColorStop(0, U.rgba(b[3], 0.55)); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, rr2, 0, 6.283); ctx.fill();
    });

    if (p.kind === 'border-beam') {
      /* 边框跑光：圆角矩形描边 + 虚线偏移 */
      var cw = W * 0.58, ch = H * 0.44;
      var x0 = (W - cw) / 2, y0 = (H - ch) / 2, r = 24 * S;
      function rrPath() {
        ctx.beginPath();
        if (U.rr) U.rr(ctx, x0, y0, cw, ch, r); else ctx.rect(x0, y0, cw, ch);
      }
      /* 卡面 */
      ctx.fillStyle = 'rgba(10,10,20,.72)'; rrPath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1.4 * S; rrPath(); ctx.stroke();
      /* 静态微光边 */
      var eg = ctx.createLinearGradient(x0, y0, x0 + cw, y0 + ch);
      eg.addColorStop(0, U.rgba(A, 0.28)); eg.addColorStop(1, U.rgba(B, 0.28));
      ctx.strokeStyle = eg; ctx.lineWidth = 1 * S; rrPath(); ctx.stroke();
      /* 跑光段 */
      var per = 2 * (cw + ch) - (8 - 2 * Math.PI) * r;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.setLineDash([per * 0.16, per]);
      ctx.lineDashOffset = -((tt * 0.42 % 1) * per);
      ctx.shadowColor = U.rgba(A, 0.9); ctx.shadowBlur = 18 * S;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3 * S; rrPath(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(A, 0.85); ctx.lineWidth = 6 * S; rrPath(); ctx.stroke();
      ctx.restore();
      /* 文案 */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 800);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(String(p.text || 'BORDER BEAM'), W / 2, H / 2 - 10 * S);
      ctx.font = U.fs(14 * S, 600, true);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.fillText('MAGIC UI', W / 2, H / 2 + 30 * S);

    } else {
      /* 液态玻璃卡：折射 + 高光扫过 + 内阴影 */
      var gw = W * 0.62, gh = H * 0.56;
      var gx = (W - gw) / 2, gy = (H - gh) / 2, gr = 34 * S;
      /* 背后景物的「折射版」：裁剪卡内并轻微放大偏移 */
      ctx.save();
      ctx.beginPath();
      if (U.rr) U.rr(ctx, gx, gy, gw, gh, gr); else ctx.rect(gx, gy, gw, gh);
      ctx.clip();
      ctx.globalAlpha = 0.55;
      ctx.translate(gw * 0.04, gh * 0.06);
      ctx.scale(1.06, 1.06);
      ctx.translate(-gx * 0.06, -gy * 0.06);
      var bg2 = ctx.createLinearGradient(0, 0, W, H);
      bg2.addColorStop(0, U.rgba(A, 0.5)); bg2.addColorStop(.5, 'rgba(255,255,255,.06)'); bg2.addColorStop(1, U.rgba(B, 0.5));
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      /* 内部雾面 */
      var fg = ctx.createLinearGradient(gx, gy, gx, gy + gh);
      fg.addColorStop(0, 'rgba(255,255,255,.20)'); fg.addColorStop(.35, 'rgba(255,255,255,.06)'); fg.addColorStop(1, 'rgba(255,255,255,.12)');
      ctx.fillStyle = fg; ctx.fillRect(gx - gw, gy - gh, gw * 3, gh * 3);
      /* 高光斜带扫过 */
      var hx = gx - gw * 0.6 + ((tt * 0.35) % 1) * gw * 2.2;
      var hg = ctx.createLinearGradient(hx - gw * 0.2, gy, hx + gw * 0.2, gy + gh);
      hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(.5, 'rgba(255,255,255,.26)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hg; ctx.fillRect(gx, gy, gw, gh);
      ctx.restore();
      /* 边框：上亮下暗 */
      var bd = ctx.createLinearGradient(gx, gy, gx, gy + gh);
      bd.addColorStop(0, 'rgba(255,255,255,.85)'); bd.addColorStop(.5, 'rgba(255,255,255,.22)'); bd.addColorStop(1, 'rgba(255,255,255,.45)');
      ctx.strokeStyle = bd; ctx.lineWidth = 1.6 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, gx, gy, gw, gh, gr); else ctx.rect(gx, gy, gw, gh);
      ctx.stroke();
      /* 外发光 */
      ctx.save();
      ctx.shadowColor = U.rgba(B, 0.4); ctx.shadowBlur = 40 * S;
      ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 8 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, gx, gy, gw, gh, gr); else ctx.rect(gx, gy, gw, gh);
      ctx.stroke();
      ctx.restore();
      /* 文案 */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S, 800);
      ctx.fillStyle = 'rgba(255,255,255,.94)';
      ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12 * S;
      ctx.fillText(String(p.text || 'LIQUID GLASS'), W / 2, H / 2 - 8 * S);
      ctx.shadowBlur = 0;
      ctx.font = U.fs(14 * S, 600, true);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillText('GLASS.SAMASANTE', W / 2, H / 2 + 34 * S);
    }
  }

  MF.forge({
    cat: '材质与纹理', type: 'component', dur: 6, poster: 0.55,
    params: [
      P('kind', '形态', 'glass', sel([['glass', '液态玻璃'], ['border-beam', '边框跑光']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.6, 0.05)),
      P('size', '字号', 96, rng(96, 30, 200, 2)),
      P('text', '文本', 'LIQUID GLASS', txt()),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: glassDraw,
    ids: [
      { id: 'src-liquid-glass', name: '液态玻璃卡', desc: '彩色雾团在卡后流动，卡面折射放大，斜向高光周期性扫过，边缘上亮下暗', tags: ['玻璃', '折射', '卡片'], src: src('Liquid Glass', 'https://glass.samasante.com'), cfg: { kind: 'glass' } },
      { id: 'src-border-beam', name: '边框跑光', desc: '圆角卡边缘一圈亮光沿周长匀速奔跑，带品牌色辉光，适合做功能卡强调', tags: ['边框', '跑光', '强调'], src: src('Magic UI', 'https://magicui.design'), cfg: { kind: 'border-beam', text: 'BORDER BEAM' } }
    ]
  });

  /* ══════════════════════ 三、加载原语（环形 / 点阵 / 轨道） ══════════════════════ */

  function loaderDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    var cx = W / 2, cy = H * 0.48;
    var R = Math.min(W, H) * 0.16 * (p.size / 100);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (p.kind === 'ring') {
      var rings = [[R, 1.2, 0.0, A, 0.30], [R * 0.74, -0.9, 0.35, B, 0.42], [R * 0.48, 1.7, 0.7, '#5CE1E6', 0.28]];
      rings.forEach(function (r, i) {
        ctx.strokeStyle = U.rgba(r[3], 0.14); ctx.lineWidth = 9 * S; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, r[0], 0, 6.283); ctx.stroke();
        ctx.strokeStyle = U.rgba(r[3], 0.9);
        ctx.shadowColor = U.rgba(r[3], 0.7); ctx.shadowBlur = 16 * S;
        var start = tt * r[1] + r[2] * 6.283;
        ctx.beginPath(); ctx.arc(cx, cy, r[0], start, start + 6.283 * r[4]); ctx.stroke();
        ctx.shadowBlur = 0;
      });
      var pct = Math.round(((tt * 0.22) % 1) * 100);
      ctx.font = U.fs(46 * S, 800);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(pct + '%', cx, cy + 2 * S);
      ctx.font = U.fs(12 * S, 600, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.5);
      ctx.fillText('LOADING', cx, cy + R + 34 * S);

    } else if (p.kind === 'dots') {
      /* 胶囊卡 + 五颗弹跳点 */
      var pw = 300 * S, phh = 110 * S;
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - pw / 2, cy - phh / 2, pw, phh, phh / 2); else ctx.rect(cx - pw / 2, cy - phh / 2, pw, phh);
      ctx.fill(); ctx.stroke();
      for (var i = 0; i < 5; i++) {
        var ph = (tt * 2.4 - i * 0.18) % 1;
        var yy = cy + Math.sin(Math.max(0, ph) * Math.PI) * -18 * S;
        var al = 0.35 + 0.65 * Math.max(0, Math.sin(Math.max(0, ph) * Math.PI));
        ctx.fillStyle = U.rgba(i % 2 ? B : A, al);
        ctx.shadowColor = U.rgba(A, 0.5); ctx.shadowBlur = 12 * S;
        ctx.beginPath(); ctx.arc(cx + (i - 2) * 42 * S, yy, 9 * S, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.font = U.fs(13 * S, 600, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.42);
      ctx.fillText('UIVERSE · BOUNCE', cx, cy + phh * 0.86);

    } else {
      /* orbit：双椭圆轨道 + 卫星 */
      ctx.save();
      ctx.translate(cx, cy);
      for (var k = 0; k < 2; k++) {
        var rx = R * (1.5 - k * 0.32), ry = rx * 0.42;
        ctx.strokeStyle = U.rgba('#FFFFFF', 0.12); ctx.lineWidth = 1.2 * S;
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, k ? -0.35 : 0.25, 0, 6.283); ctx.stroke();
        for (var s = 0; s < 3; s++) {
          var ang = tt * (k ? -0.9 : 1.3) + s * 2.094;
          var ex = Math.cos(ang) * rx, ey = Math.sin(ang) * ry;
          var rot = k ? -0.35 : 0.25;
          var px = ex * Math.cos(rot) - ey * Math.sin(rot);
          var py = ex * Math.sin(rot) + ey * Math.cos(rot);
          ctx.fillStyle = U.rgba(k ? B : A, 0.95);
          ctx.shadowColor = U.rgba(k ? B : A, 0.8); ctx.shadowBlur = 14 * S;
          ctx.beginPath(); ctx.arc(px, py, (s === 0 ? 6 : 3.6) * S, 0, 6.283); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      var cg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.55);
      cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(.35, U.rgba(A, 0.55)); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, 6.283); ctx.fill();
      ctx.restore();
      ctx.font = U.fs(30 * S, 800);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('SYNCING', cx, cy + R * 1.15);
    }
  }

  MF.forge({
    cat: '加载与进度', type: 'component', dur: 4, poster: 0.5,
    params: [
      P('kind', '形态', 'ring', sel([['ring', '三环加载'], ['dots', '点阵弹跳'], ['orbit', '轨道卫星']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.6, 0.05)),
      P('size', '尺寸', 100, rng(100, 50, 170, 2)),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: loaderDraw,
    ids: [
      { id: 'src-ring-loader', name: '三环加载', desc: '三层圆环以不同速度反向旋转，弧段带辉光，中心百分比循环递增', tags: ['加载', '圆环', '进度'], src: src('Circle Loaders', 'https://circleloaders.dominikakissi.com'), cfg: { kind: 'ring' } },
      { id: 'src-dots-loader', name: '点阵弹跳', desc: '五颗圆点依次弹跳并明暗交替，胶囊卡内像呼吸一样等待', tags: ['加载', '点阵', '等待'], src: src('Uiverse', 'https://uiverse.io'), cfg: { kind: 'dots' } },
      { id: 'src-orbit-loader', name: '轨道卫星', desc: '两条倾斜椭圆轨道上各三颗卫星公转，中心光核脉动，科技感加载', tags: ['加载', '轨道', '科技'], src: src('Circle Loaders', 'https://circleloaders.dominikakissi.com'), cfg: { kind: 'orbit' } }
    ]
  });

  /* ══════════════════════ 四、微交互原语（按钮 / 开关 / 输入框 / 导航） ══════════════════════ */

  function microDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    var cx = W / 2, cy = H * 0.5;

    if (p.kind === 'button') {
      var bw = Math.min(W * 0.34, 420 * S), bh = 96 * S;
      var cycle = (tt * 0.5) % 1;                 /* 0-0.6 悬停扫光，0.72 按下 */
      var press = cycle > 0.7 && cycle < 0.8 ? Math.sin((cycle - 0.7) / 0.1 * Math.PI) : 0;
      var sc = 1 - press * 0.04;
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(sc, sc);
      /* 外发光 */
      ctx.shadowColor = U.rgba(A, 0.45 + press * 0.3); ctx.shadowBlur = (30 + press * 26) * S;
      var g = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
      var shift = 0.5 + 0.5 * Math.sin(tt * 1.2);
      g.addColorStop(0, U.mix(A, B, shift * 0.5));
      g.addColorStop(1, U.mix(B, A, shift * 0.5));
      ctx.fillStyle = g;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2); else ctx.rect(-bw / 2, -bh / 2, bw, bh);
      ctx.fill();
      ctx.shadowBlur = 0;
      /* 顶部内高光 */
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.4 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, -bw / 2 + 1.5 * S, -bh / 2 + 1.5 * S, bw - 3 * S, bh - 3 * S, bh / 2); else ctx.rect(-bw / 2, -bh / 2, bw, bh);
      ctx.stroke();
      /* 扫光 */
      var sweepX = -bw * 0.7 + (cycle / 0.62) * bw * 1.4;
      ctx.save();
      ctx.beginPath();
      if (U.rr) U.rr(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2); else ctx.rect(-bw / 2, -bh / 2, bw, bh);
      ctx.clip();
      var sg = ctx.createLinearGradient(sweepX - 60 * S, 0, sweepX + 60 * S, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.42)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.restore();
      /* 按压水波 */
      if (press > 0.01) {
        ctx.strokeStyle = U.rgba('#FFFFFF', 0.55 * (1 - press));
        ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.arc(0, 0, (bw * 0.2) + press * bw * 0.42, 0, 6.283); ctx.stroke();
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(30 * S, 800);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(String(p.text || 'Get Started'), 0, 1 * S);
      ctx.restore();

    } else if (p.kind === 'toggle') {
      var tw = 220 * S, th = 104 * S;
      var on = (Math.sin(tt * 0.9) > 0);
      var k = (Math.sin(tt * 0.9) * 0.5 + 0.5);           /* 0..1 连续 */
      var kk = e ? e.inOutCubic(k) : k;
      var trackG = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      trackG.addColorStop(0, U.mix('#2A2E3A', A, kk));
      trackG.addColorStop(1, U.mix('#2A2E3A', B, kk));
      ctx.fillStyle = trackG;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - tw / 2, cy - th / 2, tw, th, th / 2); else ctx.rect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.fill();
      ctx.strokeStyle = U.rgba('#FFFFFF', 0.12 + kk * 0.2); ctx.lineWidth = 1.4 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - tw / 2, cy - th / 2, tw, th, th / 2); else ctx.rect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.stroke();
      var knobX = cx - tw / 2 + th / 2 + kk * (tw - th);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 14 * S;
      ctx.beginPath(); ctx.arc(knobX, cy, th / 2 - 8 * S, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = U.rgba(A, 0.6 * kk);
      ctx.beginPath(); ctx.arc(knobX, cy, th / 2 - 18 * S, 0, 6.283); ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(13 * S, 700, true);
      ctx.fillStyle = U.rgba('#FFFFFF', kk > 0.5 ? 0.85 : 0.4);
      ctx.fillText(on ? 'ON' : 'OFF', cx, cy + th * 0.78);

    } else if (p.kind === 'input') {
      var iw = Math.min(W * 0.46, 620 * S), ih = 84 * S;
      var focus = U.clamp(Math.sin(tt * 0.7) * 2 + 0.4, 0, 1);
      var label = String(p.text || 'you@studio.com');
      var n = Math.floor(U.clamp((tt * 0.45) % 1.6, 0, 1) * label.length);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(13 * S, 700, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.5);
      ctx.fillText('EMAIL', cx - iw / 2, cy - ih / 2 - 24 * S);
      /* 聚焦光晕 */
      ctx.save();
      ctx.shadowColor = U.rgba(A, 0.55 * focus); ctx.shadowBlur = 26 * S * focus;
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - iw / 2, cy - ih / 2, iw, ih, 14 * S); else ctx.rect(cx - iw / 2, cy - ih / 2, iw, ih);
      ctx.fill(); ctx.restore();
      ctx.strokeStyle = U.rgba(A, 0.25 + 0.65 * focus); ctx.lineWidth = (1.2 + 1.4 * focus) * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - iw / 2, cy - ih / 2, iw, ih, 14 * S); else ctx.rect(cx - iw / 2, cy - ih / 2, iw, ih);
      ctx.stroke();
      /* 已输入文字 + 光标 */
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      var shown = label.slice(0, n);
      ctx.fillText(shown, cx - iw / 2 + 24 * S, cy + 1 * S);
      if (Math.floor(tt * 2) % 2 === 0) {
        var tw2 = ctx.measureText(shown).width;
        ctx.fillStyle = U.rgba(A, 0.95);
        ctx.fillRect(cx - iw / 2 + 26 * S + tw2, cy - 15 * S, 2 * S, 30 * S);
      }
      /* 对勾 */
      if (n === label.length) {
        ctx.strokeStyle = '#5CE1A0'; ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + iw / 2 - 42 * S, cy);
        ctx.lineTo(cx + iw / 2 - 32 * S, cy + 9 * S);
        ctx.lineTo(cx + iw / 2 - 18 * S, cy - 10 * S);
        ctx.stroke();
      }

    } else {
      /* nav：导航项 + 滑动下划线 */
      var items = ['Home', 'Work', 'Studio', 'Contact'];
      var active = Math.floor((tt * 0.35) % items.length);
      var gapN = Math.min(W * 0.18, 240 * S);
      var startX = cx - gapN * (items.length - 1) / 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var widths = [];
      items.forEach(function (it, i) {
        ctx.font = U.fs(22 * S, i === active ? 800 : 600);
        widths.push(ctx.measureText(it).width);
        ctx.fillStyle = i === active ? '#FFFFFF' : U.rgba('#FFFFFF', 0.42);
        ctx.fillText(it, startX + i * gapN, cy);
      });
      /* 下划线：在上一个与当前之间补间 */
      var prev = (active - 1 + items.length) % items.length;
      var mixK = U.clamp((tt * 0.35 % items.length) % 1, 0, 1);
      var ux = startX + (prev + (active - prev) * (active >= prev ? 1 : -1) * 0) * gapN;
      var xx = startX + prev * gapN + (startX + active * gapN - (startX + prev * gapN)) * mixK;
      ctx.fillStyle = U.rgba(A, 0.95);
      ctx.shadowColor = U.rgba(A, 0.7); ctx.shadowBlur = 12 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, xx - widths[active] / 2 - 4 * S, cy + 26 * S, widths[active] + 8 * S, 3 * S, 2 * S);
      else ctx.rect(xx - widths[active] / 2, cy + 26 * S, widths[active], 3 * S);
      ctx.fill();
      ctx.shadowBlur = 0;
      /* 顶部细线 */
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1 * S;
      ctx.beginPath(); ctx.moveTo(cx - gapN * 2, cy + 27.5 * S); ctx.lineTo(cx + gapN * 2, cy + 27.5 * S); ctx.stroke();
    }
  }

  MF.forge({
    cat: '界面组件', type: 'component', dur: 5, poster: 0.5,
    params: [
      P('kind', '形态', 'button', sel([['button', '渐变按钮'], ['toggle', '开关'], ['input', '输入框'], ['nav', '导航下划线']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.6, 0.05)),
      P('text', '文本', 'Get Started', txt()),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: microDraw,
    ids: [
      { id: 'src-gradient-btn', name: '渐变按钮', desc: '双向渐变随时间流动，高光斜扫，周期性的按下缩放与水波扩散', tags: ['按钮', '渐变', 'CTA'], src: src('Gradient Buttons', 'https://gradientbuttons.colorion.co'), cfg: { kind: 'button' } },
      { id: 'src-toggle', name: '弹性开关', desc: '滑块在开与关之间平滑往返，轨道颜色随之渐变，旋钮内圈着色', tags: ['开关', '微交互', '设置'], src: src('MicroKit UI', 'https://microkit.co'), cfg: { kind: 'toggle' } },
      { id: 'src-input-focus', name: '输入框聚焦', desc: '文字逐字敲入，光标闪烁，聚焦光晕与描边同步增强，完成后亮起对勾', tags: ['输入框', '聚焦', '表单'], src: src('MicroKit UI', 'https://microkit.co'), cfg: { kind: 'input' } },
      { id: 'src-nav-underline', name: '导航滑动线', desc: '四项导航依次点亮，品牌色下划线在项间补间滑动，带轻微辉光', tags: ['导航', '下划线', '菜单'], src: src('Navbar Gallery', 'https://navbar.gallery'), cfg: { kind: 'nav' } }
    ]
  });

  /* ══════════════════════ 五、转化原语（CTA 光环 / 404 故障） ══════════════════════ */

  function convertDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    var cx = W / 2, cy = H / 2;

    if (p.kind === 'cta') {
      /* 呼吸光环 */
      for (var i = 0; i < 4; i++) {
        var ph = ((tt * 0.35 + i * 0.25) % 1);
        var rr2 = Math.min(W, H) * (0.16 + ph * 0.26);
        ctx.strokeStyle = U.rgba(i % 2 ? B : A, 0.5 * (1 - ph));
        ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.ellipse(cx, cy, rr2 * 1.5, rr2 * 0.7, 0, 0, 6.283); ctx.stroke();
      }
      var bw = Math.min(W * 0.3, 380 * S), bh = 92 * S;
      ctx.save();
      ctx.shadowColor = U.rgba(A, 0.5); ctx.shadowBlur = 34 * S;
      var g = ctx.createLinearGradient(cx - bw / 2, cy, cx + bw / 2, cy);
      g.addColorStop(0, A); g.addColorStop(1, B);
      ctx.fillStyle = g;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, bh / 2); else ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.fill();
      ctx.restore();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(28 * S, 800);
      ctx.fillStyle = '#FFFFFF';
      var label = String(p.text || '开始体验');
      ctx.fillText(label, cx - 12 * S, cy);
      var ax = cx + ctx.measureText(label).width / 2 + 8 * S + Math.sin(tt * 2.2) * 5 * S;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.6 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, cy - 9 * S); ctx.lineTo(ax + 12 * S, cy); ctx.lineTo(ax, cy + 9 * S); ctx.stroke();

    } else {
      /* 404 故障 */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var glitch = Math.max(0, Math.sin(tt * 3.1) - 0.82) / 0.18;   /* 间歇爆发 */
      var gx = (U.noise2(tt * 9, 3) ) * 10 * S * glitch;
      var gy = (U.noise2(tt * 7, 9) ) * 5 * S * glitch;
      var fs2 = Math.min(W * 0.34, 320 * S);
      ctx.font = U.fs(fs2, 900);
      /* RGB 分离 */
      ctx.fillStyle = U.rgba('#FF3B5C', 0.55 * glitch); ctx.fillText('404', cx - 10 * S * glitch + gx, cy + gy);
      ctx.fillStyle = U.rgba('#38E1FF', 0.55 * glitch); ctx.fillText('404', cx + 10 * S * glitch - gx, cy - gy);
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('404', cx, cy);
      /* 扫描线 */
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (var y = 0; y < H; y += 4 * S) {
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, y, W, 1 * S);
      }
      ctx.restore();
      /* 故障块 */
      if (glitch > 0.15) {
        for (var b = 0; b < 7; b++) {
          var bx = (U.rng(b + Math.floor(tt * 8)) * 0.9 + 0.05) * W;
          var by = (U.rng(b * 3 + Math.floor(tt * 8)) * 0.9 + 0.05) * H;
          var bw2 = (20 + U.rng(b * 7) * 90) * S * glitch;
          ctx.fillStyle = U.rgba(b % 2 ? '#38E1FF' : '#FF3B5C', 0.35 * glitch);
          ctx.fillRect(bx, by, bw2, 3 * S);
        }
      }
      ctx.font = U.fs(16 * S, 700, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.55);
      ctx.fillText('P A G E   N O T   F O U N D', cx, cy + fs2 * 0.66);
      ctx.font = U.fs(13 * S, 600);
      ctx.fillStyle = U.rgba(A, 0.9);
      ctx.fillText('← 返回首页', cx, cy + fs2 * 0.82);
    }
  }

  MF.forge({
    cat: '界面组件', type: 'component', dur: 5, poster: 0.5,
    params: [
      P('kind', '形态', 'cta', sel([['cta', 'CTA 光环'], ['404', '故障 404']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.6, 0.05)),
      P('text', '文本', '开始体验', txt()),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: convertDraw,
    ids: [
      { id: 'src-cta-pulse', name: 'CTA 呼吸光环', desc: '按钮外四圈椭圆光环由内向外扩散消散，箭头随呼吸轻移，适合落地页主行动', tags: ['CTA', '按钮', '转化'], src: src('CTA Gallery', 'https://cta.gallery'), cfg: { kind: 'cta' } },
      { id: 'src-404-glitch', name: '故障 404', desc: '巨大 404 间歇性 RGB 分离抖动，扫描线与彩色故障块随机出现', tags: ['404', '故障', '赛博'], src: src('404s', 'https://404s.design'), cfg: { kind: '404' } }
    ]
  });

  /* ══════════════════════ 六、滚动叙事原语（逐段显现 / 章节固定） ══════════════════════ */

  function scrollDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    /* 视口框 */
    var vw = Math.min(W * 0.72, 1180 * S), vh = Math.min(H * 0.78, 720 * S);
    var vx = (W - vw) / 2, vy = (H - vh) / 2, vr = 18 * S;

    if (p.kind === 'reveal') {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      if (U.rr) U.rr(ctx, vx, vy, vw, vh, vr); else ctx.rect(vx, vy, vw, vh);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      if (U.rr) U.rr(ctx, vx, vy, vw, vh, vr); else ctx.rect(vx, vy, vw, vh);
      ctx.clip();
      /* 章节卡片依次上浮 */
      var prog = (tt * 0.16) % 1;
      var n = 4;
      for (var i = 0; i < n; i++) {
        var local = U.clamp(prog * n - i, 0, 1);
        var easev = e ? e.outCubic(local) : local;
        var ch = vh * 0.3;
        var cyy = vy + vh * 0.12 + i * (ch + 18 * S) - (1 - easev) * 90 * S;
        var alpha = 0.25 + easev * 0.75;
        var cw = vw * (0.72 + 0.1 * Math.sin(i));
        var cxx = vx + (vw - cw) / 2;
        ctx.save();
        ctx.globalAlpha = alpha;
        var cg = ctx.createLinearGradient(cxx, cyy, cxx + cw, cyy + ch);
        cg.addColorStop(0, U.rgba(i % 2 ? B : A, 0.28));
        cg.addColorStop(1, 'rgba(255,255,255,.04)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        if (U.rr) U.rr(ctx, cxx, cyy, cw, ch, 14 * S); else ctx.rect(cxx, cyy, cw, ch);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1 * S;
        ctx.beginPath();
        if (U.rr) U.rr(ctx, cxx, cyy, cw, ch, 14 * S); else ctx.rect(cxx, cyy, cw, ch);
        ctx.stroke();
        /* 内容示意 */
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.fillRect(cxx + 24 * S, cyy + 26 * S, cw * 0.42, 8 * S);
        ctx.fillStyle = 'rgba(255,255,255,.28)';
        ctx.fillRect(cxx + 24 * S, cyy + 48 * S, cw * 0.62, 5 * S);
        ctx.fillRect(cxx + 24 * S, cyy + 61 * S, cw * 0.5, 5 * S);
        ctx.restore();
      }
      ctx.restore();
      /* 右侧滚动条 */
      var trackH = vh * 0.7, trackY = vy + vh * 0.15;
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(vx + vw + 12 * S, trackY, 4 * S, trackH);
      ctx.fillStyle = U.rgba(A, 0.85);
      ctx.fillRect(vx + vw + 12 * S, trackY + prog * (trackH - trackH * 0.25), 4 * S, trackH * 0.25);
      /* 标题 */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(p.size * S * 0.42, 800);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillText(String(p.text || 'SCROLL STORY'), W / 2, vy + vh + 34 * S);

    } else {
      /* 章节固定：左侧标题固定，右侧横向卡片带随滚动位移 */
      ctx.save();
      ctx.beginPath();
      if (U.rr) U.rr(ctx, vx, vy, vw, vh, vr); else ctx.rect(vx, vy, vw, vh);
      ctx.clip();
      var prog2 = (tt * 0.2) % 1;
      /* 左固定区 */
      var lg2 = ctx.createLinearGradient(vx, vy, vx + vw * 0.45, vy + vh);
      lg2.addColorStop(0, U.rgba(A, 0.24)); lg2.addColorStop(1, 'rgba(255,255,255,.02)');
      ctx.fillStyle = lg2; ctx.fillRect(vx, vy, vw, vh);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(15 * S, 700, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.45);
      ctx.fillText('CHAPTER 0' + (Math.floor(prog2 * 4) + 1), vx + vw * 0.08, vy + vh * 0.34);
      ctx.font = U.fs(p.size * S * 0.5, 900);
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.fillText(String(p.text || '叙事编排'), vx + vw * 0.08, vy + vh * 0.46);
      ctx.font = U.fs(13 * S, 600);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.4);
      ctx.fillText('固定左侧 · 横向滚动右侧', vx + vw * 0.08, vy + vh * 0.58);
      /* 进度点 */
      for (var d = 0; d < 4; d++) {
        var on = Math.floor(prog2 * 4) === d;
        ctx.fillStyle = on ? U.rgba(A, 0.95) : 'rgba(255,255,255,.18)';
        ctx.beginPath(); ctx.arc(vx + vw * 0.08 + d * 18 * S, vy + vh * 0.7, (on ? 4 : 3) * S, 0, 6.283); ctx.fill();
      }
      /* 右侧卡片带 */
      var cardW = vw * 0.3, cardH = vh * 0.56;
      var shift = -prog2 * (cardW + 20 * S) * 3;
      for (var c = 0; c < 4; c++) {
        var cxx2 = vx + vw * 0.44 + c * (cardW + 20 * S) + shift;
        var cyy2 = vy + vh * 0.22;
        var cg2 = ctx.createLinearGradient(cxx2, cyy2, cxx2 + cardW, cyy2 + cardH);
        cg2.addColorStop(0, U.rgba(c % 2 ? B : A, 0.55));
        cg2.addColorStop(1, 'rgba(255,255,255,.06)');
        ctx.fillStyle = cg2;
        ctx.beginPath();
        if (U.rr) U.rr(ctx, cxx2, cyy2, cardW, cardH, 16 * S); else ctx.rect(cxx2, cyy2, cardW, cardH);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1.2 * S;
        ctx.beginPath();
        if (U.rr) U.rr(ctx, cxx2, cyy2, cardW, cardH, 16 * S); else ctx.rect(cxx2, cyy2, cardW, cardH);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.fillRect(cxx2 + 20 * S, cyy2 + cardH - 46 * S, cardW * 0.5, 7 * S);
        ctx.fillStyle = 'rgba(255,255,255,.22)';
        ctx.fillRect(cxx2 + 20 * S, cyy2 + cardH - 30 * S, cardW * 0.34, 5 * S);
      }
      ctx.restore();
      /* 顶部进度条 */
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(vx, vy - 10 * S, vw, 3 * S);
      ctx.fillStyle = U.rgba(A, 0.95); ctx.fillRect(vx, vy - 10 * S, vw * prog2, 3 * S);
      /* SCROLL 提示 */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(12 * S, 700, true);
      ctx.fillStyle = U.rgba('#FFFFFF', 0.35 + 0.3 * Math.sin(tt * 2));
      ctx.fillText('↓  SCROLL', W / 2, vy + vh + 26 * S);
    }
  }

  MF.forge({
    cat: '叙事与演示', type: 'block', dur: 8, poster: 0.55,
    params: [
      P('kind', '形态', 'reveal', sel([['reveal', '逐段显现'], ['pin', '章节固定']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.4, 0.05)),
      P('size', '字号', 160, rng(160, 40, 320, 2)),
      P('text', '文本', 'SCROLL STORY', txt()),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: scrollDraw,
    ids: [
      { id: 'src-scroll-reveal', name: '滚动逐段显现', desc: '章节卡片随滚动进度依次上浮淡入，右侧滚动条与内容同步推进', tags: ['滚动', '叙事', '落地页'], src: src('Scrolltide', 'https://scrolltide.co'), cfg: { kind: 'reveal', text: 'SCROLL STORY' } },
      { id: 'src-scroll-pin', name: '章节固定引导', desc: '左侧标题与进度点固定不动，右侧卡片带横向滑过，顶部进度条同步', tags: ['滚动', '固定', '章节'], src: src('Scrolltide', 'https://scrolltide.co'), cfg: { kind: 'pin', text: '叙事编排' } }
    ]
  });

  /* ══════════════════════ 七、文字原语（动能排版 / 变形转场 / 流光字） ══════════════════════ */

  function typeDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    var text = String(p.text || 'KINETIC TYPE');
    var cx = W / 2, cy = H / 2;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (p.kind === 'kinetic') {
      var words = text.split(/\s+/).filter(Boolean);
      if (!words.length) words = ['KINETIC'];
      var fs2 = Math.min(p.size * S, W * 0.9 / Math.max(3, words.length * 0.62));
      ctx.font = U.fs(fs2, 900);
      var totalW = 0, widths = [];
      words.forEach(function (w) { var ww = ctx.measureText(w).width; widths.push(ww); totalW += ww; });
      var gap = fs2 * 0.26;
      totalW += gap * (words.length - 1);
      var x0 = cx - totalW / 2;
      words.forEach(function (w, i) {
        var local = U.clamp(tt * 0.9 - i * 0.16, 0, 1);
        var ev = e ? e.outBack(local) : local;
        var yy = cy + (1 - ev) * fs2 * 0.9;
        var rot = (1 - ev) * (i % 2 ? 0.18 : -0.18);
        var alpha = U.clamp(local * 2, 0, 1);
        ctx.save();
        ctx.translate(x0 + widths.slice(0, i).reduce(function (a, b) { return a + b; }, 0) + (i ? gap * i : 0), yy);
        ctx.rotate(rot);
        ctx.fillStyle = i === words.length - 1 ? U.rgba(A, alpha) : U.rgba('#FFFFFF', alpha);
        ctx.fillText(w, widths[i] / 2, 0);
        ctx.restore();
      });
      /* 背景细线 */
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1 * S;
      for (var ln = 0; ln < 6; ln++) {
        var ly = H * (0.15 + ln * 0.14);
        ctx.beginPath(); ctx.moveTo(W * 0.06, ly); ctx.lineTo(W * (0.06 + 0.88 * U.clamp(tt * 0.5 - ln * 0.1, 0, 1)), ly); ctx.stroke();
      }

    } else if (p.kind === 'morph') {
      /* 两词之间用裁剪擦除互换 + 缩放 */
      var A2 = String(p.textB || 'MOTION');
      var B2 = text;
      var cyc2 = (tt * 0.5) % 1;
      var swap = cyc2 < 0.5 ? 0 : 1;
      var local2 = cyc2 < 0.5 ? cyc2 * 2 : (cyc2 - 0.5) * 2;
      var from = swap ? A2 : B2, to = swap ? B2 : A2;
      var fs3 = Math.min(p.size * S * 1.2, W * 0.68);
      ctx.font = U.fs(fs3, 900);
      var cut = (e ? e.inOutCubic(local2) : local2);
      /* 前一个词向下裁出 */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, cy); ctx.clip();
      ctx.fillStyle = U.rgba('#FFFFFF', 0.9 * (1 - cut));
      ctx.fillText(from, cx, cy - cut * fs3 * 0.5);
      ctx.restore();
      /* 后一个词从下裁入 */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, cy, W, H - cy); ctx.clip();
      ctx.fillStyle = U.rgba(A, 0.95 * cut);
      ctx.fillText(to, cx, cy + (1 - cut) * fs3 * 0.5);
      ctx.restore();
      /* 中间扫描线 */
      ctx.strokeStyle = U.rgba(B, 0.8); ctx.lineWidth = 2 * S;
      if (cut > 0.02 && cut < 0.98) {
        ctx.beginPath(); ctx.moveTo(cx - fs3 * 2.2, cy); ctx.lineTo(cx + fs3 * 2.2, cy); ctx.stroke();
      }
      ctx.font = U.fs(13 * S, 700, true);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.fillText('MOTION PRIMITIVES', cx, cy + fs3 * 0.72);

    } else {
      /* shimmer：金属流光 */
      var fs4 = Math.min(p.size * S * 1.1, W * 0.8);
      ctx.font = U.fs(fs4, 900);
      var g = ctx.createLinearGradient(cx - fs4 * 3, 0, cx + fs4 * 3, 0);
      var sp = (tt * 0.45) % 1;
      var s0 = sp * 1.4 - 0.2;
      g.addColorStop(Math.max(0, s0 - 0.28), U.rgba('#FFFFFF', 0.30));
      g.addColorStop(Math.max(0, Math.min(1, s0)), 'rgba(255,255,255,.98)');
      g.addColorStop(Math.min(1, s0 + 0.06), U.rgba(A, 0.95));
      g.addColorStop(Math.min(1, s0 + 0.16), U.rgba('#FFFFFF', 0.32));
      g.addColorStop(1, U.rgba('#FFFFFF', 0.30));
      ctx.fillStyle = g;
      ctx.fillText(text, cx, cy);
      /* 第二层镜面窄带 */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var g2 = ctx.createLinearGradient(cx - fs4 * 1.2, 0, cx + fs4 * 1.2, 0);
      g2.addColorStop(Math.max(0, sp - 0.08), 'rgba(255,255,255,0)');
      g2.addColorStop(Math.min(1, sp + 0.02), 'rgba(255,255,255,.45)');
      g2.addColorStop(Math.min(1, sp + 0.12), 'rgba(255,255,255,0)');
      ctx.fillStyle = g2;
      ctx.fillText(text, cx, cy);
      ctx.restore();
      ctx.font = U.fs(13 * S, 700, true);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fillText('S H I M M E R', cx, cy + fs4 * 0.62);
    }
  }

  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.5,
    params: [
      P('kind', '形态', 'kinetic', sel([['kinetic', '动能排版'], ['morph', '变形转场'], ['shimmer', '金属流光']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.4, 0.05)),
      P('size', '字号', 210, rng(210, 60, 360, 2)),
      P('text', '文本', 'KINETIC TYPE', txt()),
      P('textB', '对比文本', 'MOTION', txt('MOTION')),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: typeDraw,
    ids: [
      { id: 'src-kinetic-type', name: '动能排版', desc: '逐词从下方弹入并轻微倾斜，末词以品牌色强调，背景细线随节奏生长', tags: ['排版', '逐词', '片头'], src: src('Kinetics', 'https://kinetics.colorion.co'), cfg: { kind: 'kinetic', text: 'KINETIC TYPE' } },
      { id: 'src-morph-type', name: '文字变形转场', desc: '上下裁切扫描线划过，旧词退出新词进入，适合章节之间的文字切换', tags: ['转场', '文字', '裁切'], src: src('Motion Primitives', 'https://motion-primitives.com'), cfg: { kind: 'morph', text: 'DESIGN', textB: 'MOTION' } },
      { id: 'src-shimmer-text', name: '金属流光字', desc: '一条高光带从左向右扫过字面，金属底色随角度变化，叠一层镜面窄光', tags: ['流光', '金属', '标题'], src: src('CSS Text Effects', 'https://text-effects.colorion.co'), cfg: { kind: 'shimmer', text: 'SHIMMER' } }
    ]
  });

  /* ══════════════════════ 八、空间原语（路径描线 / 等距 3D / 地图路线） ══════════════════════ */

  function spatialDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var tt = t * Math.max(0.1, p.speed);
    var A = p.ink2 || U.accent, B = p.ink3 || U.accent2;
    var cx = W / 2, cy = H / 2;

    if (p.kind === 'path') {
      /* 网格 */
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1 * S;
      var gs = 64 * S, gx2, gy2;
      ctx.beginPath();
      for (gx2 = 0; gx2 < W; gx2 += gs) { ctx.moveTo(gx2, 0); ctx.lineTo(gx2, H); }
      for (gy2 = 0; gy2 < H; gy2 += gs) { ctx.moveTo(0, gy2); ctx.lineTo(W, gy2); }
      ctx.stroke();
      /* 贝塞尔主路径 */
      var x0 = W * 0.12, y0 = H * 0.72;
      var c1x = W * 0.34, c1y = H * 0.12;
      var c2x = W * 0.66, c2y = H * 0.9;
      var x1 = W * 0.88, y1 = H * 0.3;
      function bz(u) {
        var v = 1 - u;
        return [
          v * v * v * x0 + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * x1,
          v * v * v * y0 + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * y1
        ];
      }
      /* 底路径 */
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.6 * S; ctx.setLineDash([6 * S, 8 * S]);
      ctx.beginPath();
      for (var u0 = 0; u0 <= 1.001; u0 += 0.02) { var pt0 = bz(u0); if (u0 === 0) ctx.moveTo(pt0[0], pt0[1]); else ctx.lineTo(pt0[0], pt0[1]); }
      ctx.stroke(); ctx.setLineDash([]);
      /* 已绘制段 */
      var prog3 = U.clamp((tt * 0.32) % 1.35, 0, 1);
      ctx.strokeStyle = U.rgba(A, 0.95); ctx.lineWidth = 4 * S; ctx.lineCap = 'round';
      ctx.shadowColor = U.rgba(A, 0.8); ctx.shadowBlur = 16 * S;
      ctx.beginPath();
      for (var u1 = 0; u1 <= prog3; u1 += 0.01) { var pt1 = bz(u1); if (u1 === 0) ctx.moveTo(pt1[0], pt1[1]); else ctx.lineTo(pt1[0], pt1[1]); }
      ctx.stroke(); ctx.shadowBlur = 0;
      /* 头部亮点 */
      var hp = bz(prog3);
      var hg2 = ctx.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 26 * S);
      hg2.addColorStop(0, 'rgba(255,255,255,.98)'); hg2.addColorStop(.35, U.rgba(A, 0.7)); hg2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg2; ctx.beginPath(); ctx.arc(hp[0], hp[1], 26 * S, 0, 6.283); ctx.fill();
      /* 端点 */
      [[x0, y0], [x1, y1]].forEach(function (pt, i) {
        ctx.strokeStyle = U.rgba(i ? B : A, 0.9); ctx.lineWidth = 2 * S;
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 7 * S, 0, 6.283); ctx.stroke();
        ctx.fillStyle = U.rgba(i ? B : A, 0.35);
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 3.4 * S, 0, 6.283); ctx.fill();
      });
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(14 * S, 700, true);
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.fillText('ANIME.JS · PATH DRAW', W * 0.06, H * 0.1);

    } else if (p.kind === 'iso') {
      /* 等距立方体 */
      var s3 = Math.min(W, H) * 0.16 * (p.size / 100);
      var bob = Math.sin(tt * 1.2) * 10 * S;
      var rot = Math.sin(tt * 0.5) * 0.12;
      function cube(ccx, ccy, sz, tint, alpha) {
        var hw = sz * 0.87, hh = sz * 0.5;
        /* 顶面 */
        ctx.fillStyle = U.rgba(U.mix('#FFFFFF', tint, 0.35), alpha);
        ctx.beginPath();
        ctx.moveTo(ccx, ccy - hh * 2);
        ctx.lineTo(ccx + hw, ccy - hh);
        ctx.lineTo(ccx, ccy);
        ctx.lineTo(ccx - hw, ccy - hh);
        ctx.closePath(); ctx.fill();
        /* 左面 */
        ctx.fillStyle = U.rgba(U.mix('#000000', tint, 0.62), alpha);
        ctx.beginPath();
        ctx.moveTo(ccx - hw, ccy - hh);
        ctx.lineTo(ccx, ccy);
        ctx.lineTo(ccx, ccy + hh * 2);
        ctx.lineTo(ccx - hw, ccy + hh);
        ctx.closePath(); ctx.fill();
        /* 右面 */
        ctx.fillStyle = U.rgba(U.mix('#000000', tint, 0.38), alpha);
        ctx.beginPath();
        ctx.moveTo(ccx + hw, ccy - hh);
        ctx.lineTo(ccx, ccy);
        ctx.lineTo(ccx, ccy + hh * 2);
        ctx.lineTo(ccx + hw, ccy + hh);
        ctx.closePath(); ctx.fill();
        /* 棱线 */
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2 * S;
        ctx.beginPath();
        ctx.moveTo(ccx, ccy - hh * 2); ctx.lineTo(ccx + hw, ccy - hh);
        ctx.lineTo(ccx, ccy); ctx.lineTo(ccx - hw, ccy - hh); ctx.closePath();
        ctx.moveTo(ccx, ccy); ctx.lineTo(ccx, ccy + hh * 2);
        ctx.stroke();
      }
      /* 阴影 */
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.beginPath(); ctx.ellipse(cx, cy + s3 * 2.05 + bob * 0.5, s3 * 1.15, s3 * 0.26, 0, 0, 6.283); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy + bob);
      ctx.rotate(rot);
      cube(0, s3 * 0.35, s3 * 0.66, B, 0.9);       /* 后 */
      cube(-s3 * 0.55, s3 * 0.85, s3 * 0.8, A, 0.95);
      cube(s3 * 0.62, s3 * 1.0, s3 * 0.72, '#5CE1E6', 0.92);
      ctx.restore();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(14 * S, 700, true);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.fillText('3DICONS', cx, H * 0.9);

    } else {
      /* 地图路线 */
      ctx.fillStyle = 'rgba(255,255,255,.02)';
      ctx.fillRect(0, 0, W, H);
      /* 城区块 */
      for (var b = 0; b < 26; b++) {
        var bx = U.rnd(0, W, b * 3.7), by = U.rnd(0, H, b * 5.3);
        var bw2 = U.rnd(40, 160, b * 2.1) * S, bh2 = U.rnd(30, 110, b * 4.4) * S;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.02 + U.rng(b) * 0.04).toFixed(3) + ')';
        ctx.beginPath();
        if (U.rr) U.rr(ctx, bx, by, bw2, bh2, 4 * S); else ctx.rect(bx, by, bw2, bh2);
        ctx.fill();
      }
      /* 道路 */
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1 * S;
      for (var rd = 0; rd < 9; rd++) {
        ctx.beginPath();
        var ry = H * (0.1 + rd * 0.1);
        ctx.moveTo(0, ry); ctx.lineTo(W, ry + Math.sin(rd) * 20 * S);
        ctx.stroke();
      }
      /* 路线 */
      var pts = [[0.14, 0.76], [0.28, 0.66], [0.38, 0.72], [0.5, 0.5], [0.62, 0.56], [0.72, 0.36], [0.86, 0.28]];
      var prog4 = U.clamp((tt * 0.26) % 1.2, 0, 1);
      function mapPt(k) {
        var f = k * (pts.length - 1), i0 = Math.floor(f), i1 = Math.min(pts.length - 1, i0 + 1), f2 = f - i0;
        return [W * (pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f2), H * (pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f2)];
      }
      ctx.strokeStyle = U.rgba(A, 0.22); ctx.lineWidth = 12 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (var q = 0; q <= prog4; q += 0.01) { var mp = mapPt(q); if (q === 0) ctx.moveTo(mp[0], mp[1]); else ctx.lineTo(mp[0], mp[1]); }
      ctx.stroke();
      ctx.strokeStyle = U.rgba(A, 0.95); ctx.lineWidth = 4 * S;
      ctx.shadowColor = U.rgba(A, 0.7); ctx.shadowBlur = 14 * S;
      ctx.beginPath();
      for (var q2 = 0; q2 <= prog4; q2 += 0.01) { var mp2 = mapPt(q2); if (q2 === 0) ctx.moveTo(mp2[0], mp2[1]); else ctx.lineTo(mp2[0], mp2[1]); }
      ctx.stroke(); ctx.shadowBlur = 0;
      /* 端点标 */
      function pin(px, py, c, label) {
        ctx.fillStyle = U.rgba(c, 0.95);
        ctx.beginPath(); ctx.arc(px, py, 10 * S, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#0A0B10';
        ctx.beginPath(); ctx.arc(px, py, 4 * S, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.font = U.fs(12 * S, 600, true);
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(label, px, py + 16 * S);
      }
      pin(W * pts[0][0], H * pts[0][1], '#5CE1A0', 'START');
      pin(W * pts[pts.length - 1][0], H * pts[pts.length - 1][1], B, 'END');
      /* 移动标记 */
      var head = mapPt(prog4);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = U.rgba(A, 0.9); ctx.shadowBlur = 20 * S;
      ctx.beginPath(); ctx.arc(head[0], head[1], 7 * S, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = U.fs(13 * S, 700, true);
      ctx.fillStyle = 'rgba(255,255,255,.42)';
      ctx.fillText('MAPCN · ROUTE', W * 0.06, H * 0.08);
    }
  }

  MF.forge({
    cat: '几何空间', type: 'block', dur: 6, poster: 0.5,
    params: [
      P('kind', '形态', 'path', sel([['path', '路径描线'], ['iso', '等距 3D'], ['map', '地图路线']])),
      P('speed', '速度', 1, rng(1, 0.2, 2.4, 0.05)),
      P('size', '尺寸', 100, rng(100, 50, 170, 2)),
      P('ink2', '主色', '$accent', col('$accent')),
      P('ink3', '辅色', '$accent2', col('$accent2'))
    ],
    draw: spatialDraw,
    ids: [
      { id: 'src-path-draw', name: '路径描线', desc: '一条贝塞尔曲线在网格上被逐段画出，笔尖亮点随进度移动，端点带标记', tags: ['路径', '描线', 'SVG'], src: src('Anime.js', 'https://animejs.com'), cfg: { kind: 'path' } },
      { id: 'src-iso-3dicon', name: '等距 3D 图标', desc: '三个等距立方体错落悬浮上下呼吸，三面明暗分明，底部投影随高度缩放', tags: ['3D', '等距', '图标'], src: src('3Dicons', 'https://3dicons.co'), cfg: { kind: 'iso' } },
      { id: 'src-map-route', name: '地图路线', desc: '抽象街区与道路作底，品牌色路线从起点逐段延伸至终点，行进点带辉光', tags: ['地图', '路线', '导航'], src: src('mapcn', 'https://mapcn.dev'), cfg: { kind: 'map' } }
    ]
  });

})();
