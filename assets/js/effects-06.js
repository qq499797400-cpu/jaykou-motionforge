/* ==========================================================================
   Jaykou 动效库 · 06
   原语：转场切换（两画面之间用不同遮罩或变换完成切换）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var TRANS_PARAMS = [
    P('textA', '前一画面', 'BEFORE', txt('BEFORE')),
    P('textB', '后一画面', 'AFTER', txt('AFTER')),
    P('kind', '转场类型', 'wipeH', sel('wipeH', [
      ['wipeH', '水平擦除'], ['wipeV', '垂直擦除'], ['circle', '圆形扩散'], ['iris', '光圈收拢'],
      ['diagonal', '对角擦除'], ['blinds', '百叶窗'], ['checker', '方格错落'], ['pixel', '像素溶解'],
      ['hex', '六边形扩散'], ['star', '星形扩散'], ['bars', '随机条形'], ['clock', '时钟扫描'],
      ['spiral', '螺旋推进'], ['wave', '波浪推进'], ['cross', '十字扩散'], ['corners', '四角汇聚'],
      ['curtain', '幕布开合'], ['luma', '光带扫过'], ['mosaic', '马赛克拼合'], ['ripple', '涟漪扩散'],
      ['shutter', '快门条'], ['triangle', '三角拼合'], ['sweep', '扇扫'], ['grain', '噪点溶解'],
      ['pushLeft', '向左推移'], ['pushRight', '向右推移'], ['slideUp', '向上推移'], ['slideDown', '向下推移'],
      ['zoomIn', '推近切换'], ['zoomOut', '拉远切换'], ['blurMix', '模糊交叠'], ['flip3d', '3D 翻转']
    ])),
    P('anim', '切换时长', 1.3, rng(1.3, 0.5, 3, 0.05)),
    P('size', '字号', 150, rng(150, 60, 260, 2)),
    P('decor', '装饰强度', 0.55, rng(0.55, 0, 1, 0.05)),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function transDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var anim = Math.max(0.25, p.anim);
    var prog = U.clamp(t / anim, 0, 1);
    var k = e.inOutCubic(prog);
    var kind = p.kind;

    var TRANSFORM = {
      pushLeft: 1, pushRight: 1, slideUp: 1, slideDown: 1,
      zoomIn: 1, zoomOut: 1, blurMix: 1, flip3d: 1
    };
    var cols = [U.accent, U.accent2];
    var labels = [String(p.textA || ''), String(p.textB || '')];
    var diag = Math.sqrt(W * W + H * H);

    for (var layer = 0; layer < 2; layer++) {
      ctx.save();

      if (layer === 1) {
        if (TRANSFORM[kind]) {
          /* ---- 变换型：整屏推拉/缩放/翻面 ---- */
          if (kind === 'pushLeft') { ctx.translate(W * (1 - k), 0); }
          else if (kind === 'pushRight') { ctx.translate(-W * (1 - k), 0); }
          else if (kind === 'slideUp') { ctx.translate(0, H * (1 - k)); }
          else if (kind === 'slideDown') { ctx.translate(0, -H * (1 - k)); }
          else if (kind === 'zoomIn') {
            var zi = 0.35 + 0.65 * k; ctx.translate(W / 2, H / 2); ctx.scale(zi, zi); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = U.clamp(prog * 1.5, 0, 1);
          } else if (kind === 'zoomOut') {
            var zo = 2.6 - 1.6 * k; ctx.translate(W / 2, H / 2); ctx.scale(zo, zo); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = U.clamp(prog * 1.5, 0, 1);
          } else if (kind === 'blurMix') {
            ctx.globalAlpha = k;
            if (prog < 0.99 && prog > 0.01) ctx.filter = 'blur(' + ((1 - k) * 22 * S).toFixed(1) + 'px)';
          } else if (kind === 'flip3d') {
            var cs = Math.cos((1 - k) * Math.PI / 2);
            ctx.translate(W / 2, H / 2); ctx.scale(Math.max(0.02, Math.abs(cs)), 1); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = U.clamp(k * 1.4, 0, 1);
          }
        } else {
          /* ---- 遮罩型 ---- */
          ctx.beginPath();
          var K = kind, i, j, n, wq;
          if (K === 'wipeH') { ctx.rect(-2, -2, W * k + 2, H + 4); }
          else if (K === 'wipeV') { ctx.rect(-2, -2, W + 4, H * k + 2); }
          else if (K === 'circle') { ctx.arc(W / 2, H / 2, diag * 0.56 * k, 0, Math.PI * 2); }
          else if (K === 'ripple') {
            ctx.arc(W / 2, H / 2, diag * 0.56 * k, 0, Math.PI * 2);
            ctx.arc(W / 2, H / 2, diag * 0.56 * Math.max(0, k - 0.22), 0, Math.PI * 2);
          }
          else if (K === 'iris') {
            var hw = W / 2 * k, hh = H / 2 * k;
            ctx.rect(W / 2 - hw, H / 2 - hh, hw * 2, hh * 2);
          }
          else if (K === 'diagonal') {
            var s = (W + H + 200) * k;
            ctx.moveTo(-10, -10); ctx.lineTo(s - 10, -10); ctx.lineTo(-10, s - 10); ctx.closePath();
          }
          else if (K === 'blinds') {
            n = 14; var bh = H / n;
            for (i = 0; i < n; i++) {
              wq = U.clamp(k * 1.7 - i * 0.045, 0, 1);
              ctx.rect(0, i * bh + 1, W * wq, bh - 2);
            }
          }
          else if (K === 'checker') {
            var cC = 12, rR = 7, cw = W / cC, ch = H / rR;
            for (i = 0; i < rR; i++) for (j = 0; j < cC; j++) {
              var idx = i * cC + j, th = (idx % 9) / 9 * 0.4;
              var q = U.clamp((k - th) / 0.45, 0, 1);
              if (q <= 0) continue;
              var sx = cw * q / 2, sy = ch * q / 2;
              ctx.rect(j * cw + cw / 2 - sx, i * ch + ch / 2 - sy, sx * 2, sy * 2);
            }
          }
          else if (K === 'pixel') {
            var px = 20, py = 12, pw = W / px, ph = H / py;
            for (i = 0; i < py; i++) for (j = 0; j < px; j++) {
              if (k > U.rng(i * px + j) * 0.85) ctx.rect(j * pw, i * ph, pw + 1, ph + 1);
            }
          }
          else if (K === 'grain') {
            var gx = 42, gy = 24, gw = W / gx, gh = H / gy;
            for (i = 0; i < gy; i++) for (j = 0; j < gx; j++) {
              var thr = U.noise2(j * 0.5, i * 0.5, 11) * 0.5 + 0.5;
              if (k > thr * 0.9) ctx.rect(j * gw, i * gh, gw + 1, gh + 1);
            }
          }
          else if (K === 'mosaic') {
            var mC = 8, mR = 5, mw = W / mC, mh = H / mR;
            for (i = 0; i < mR; i++) for (j = 0; j < mC; j++) {
              var d = Math.abs(i - (mR - 1) / 2) + Math.abs(j - (mC - 1) / 2);
              var qq = U.clamp((k - d / 12) / 0.5, 0, 1);
              if (qq <= 0) continue;
              ctx.rect(j * mw + mw / 2 - mw * qq / 2, i * mh + mh / 2 - mh * qq / 2, mw * qq, mh * qq);
            }
          }
          else if (K === 'hex') {
            var hr = 62 * S, colW = hr * 1.732, rowH = hr * 1.5;
            for (var ry = -1; ry * rowH < H + rowH; ry++) {
              for (var rx = -1; rx * colW < W + colW; rx++) {
                var cx0 = rx * colW + (ry % 2 ? colW / 2 : 0), cy0 = ry * rowH;
                var dist = Math.hypot(cx0 - W / 2, cy0 - H / 2) / (diag * 0.5);
                if (k * 1.25 > dist) {
                  ctx.moveTo(cx0 + hr * Math.cos(0), cy0 + hr * Math.sin(0));
                  for (var a2 = 1; a2 <= 6; a2++) {
                    var ang = Math.PI * 2 * a2 / 6;
                    ctx.lineTo(cx0 + hr * Math.cos(ang), cy0 + hr * Math.sin(ang));
                  }
                  ctx.closePath();
                }
              }
            }
          }
          else if (K === 'star') {
            U.star(ctx, W / 2, H / 2, 5, diag * 0.62 * k, diag * 0.26 * k, -Math.PI / 2);
          }
          else if (K === 'bars') {
            n = 26; var bw = W / n;
            for (i = 0; i < n; i++) {
              var hgt = (0.25 + U.rng(i * 3 + 1) * 1.1) * k;
              ctx.rect(i * bw + 1, H - H * U.clamp(hgt, 0, 1), bw - 2, H * U.clamp(hgt, 0, 1));
            }
          }
          else if (K === 'clock') {
            var ca = -Math.PI / 2 + Math.PI * 2 * k;
            ctx.moveTo(W / 2, H / 2);
            ctx.arc(W / 2, H / 2, diag * 0.6, -Math.PI / 2, ca);
            ctx.closePath();
          }
          else if (K === 'sweep') {
            var sa = -Math.PI / 2 + Math.PI * 2 * k;
            ctx.moveTo(W * 0.22, H * 0.5);
            ctx.arc(W * 0.22, H * 0.5, diag * 0.85, -Math.PI / 2, sa);
            ctx.closePath();
          }
          else if (K === 'spiral') {
            ctx.moveTo(W / 2, H / 2);
            var turns = 2.6, steps = 190;
            for (i = 0; i <= steps * k; i++) {
              var frac = i / steps;
              var ang2 = frac * Math.PI * 2 * turns;
              var rad2 = diag * 0.6 * Math.pow(frac, 0.72);
              ctx.lineTo(W / 2 + Math.cos(ang2) * rad2, H / 2 + Math.sin(ang2) * rad2);
            }
            ctx.closePath();
          }
          else if (K === 'wave') {
            var colsN = 40, cwn = W / colsN;
            for (i = 0; i < colsN; i++) {
              var wv = Math.sin(i / colsN * Math.PI * 2.2 - prog * 6) * 0.5 + 0.5;
              var hgt2 = U.clamp(k * 1.35 - wv * 0.35, 0, 1);
              ctx.rect(i * cwn, 0, cwn + 1, H * hgt2);
            }
          }
          else if (K === 'cross') {
            var arm = Math.max(W, H) * k;
            ctx.rect(W / 2 - arm * 0.16, 0, arm * 0.32, H);
            ctx.rect(0, H / 2 - arm * 0.16, W, arm * 0.32);
          }
          else if (K === 'corners') {
            var cs2 = Math.min(W, H) * 0.85 * k;
            ctx.moveTo(0, 0); ctx.lineTo(cs2, 0); ctx.lineTo(0, cs2); ctx.closePath();
            ctx.moveTo(W, 0); ctx.lineTo(W - cs2, 0); ctx.lineTo(W, cs2); ctx.closePath();
            ctx.moveTo(0, H); ctx.lineTo(cs2, H); ctx.lineTo(0, H - cs2); ctx.closePath();
            ctx.moveTo(W, H); ctx.lineTo(W - cs2, H); ctx.lineTo(W, H - cs2); ctx.closePath();
          }
          else if (K === 'curtain') {
            var gapW = W * 0.5 * k;
            ctx.rect(0, 0, gapW, H);
            ctx.rect(W - gapW, 0, gapW, H);
          }
          else if (K === 'shutter') {
            n = 9; var sh = H / n;
            for (i = 0; i < n; i++) { ctx.rect(0, i * sh + 1, W * k, sh - 2); }
          }
          else if (K === 'triangle') {
            var tStep = Math.ceil(W / (120 * S)) + 1;
            var tW = W / tStep;
            for (i = 0; i < tStep; i++) {
              var q2 = U.clamp((k - (i % 4) * 0.07) / 0.6, 0, 1);
              if (q2 <= 0) continue;
              ctx.moveTo(i * tW, H); ctx.lineTo(i * tW + tW / 2, H - H * q2); ctx.lineTo(i * tW + tW, H);
              ctx.closePath();
            }
          }
          else if (K === 'luma') {
            var bandW = W * 0.28;
            var bx = -bandW + (W + bandW * 2) * k;
            ctx.rect(-2, -2, Math.max(0, bx), H + 4);
          }
          else { ctx.rect(-2, -2, W * k + 2, H + 4); }
          ctx.clip();
        }
      }

      /* ---- 绘制该层画面 ---- */
      var c = cols[layer];
      var g = ctx.createLinearGradient(0, 0, W * 0.9, H);
      g.addColorStop(0, U.mix(U.bg2, c, 0.62));
      g.addColorStop(1, U.mix(U.bg1, c, 0.16));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      if (p.decor > 0.02) {
        ctx.globalAlpha = p.decor;
        ctx.strokeStyle = U.rgba(U.ink, 0.1);
        ctx.lineWidth = 1.2 * S;
        ctx.beginPath();
        var stp = 88 * S;
        for (var gx2 = stp; gx2 < W; gx2 += stp) { ctx.moveTo(gx2, 0); ctx.lineTo(gx2, H); }
        for (var gy2 = stp; gy2 < H; gy2 += stp) { ctx.moveTo(0, gy2); ctx.lineTo(W, gy2); }
        ctx.stroke();
        var rg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.5);
        rg.addColorStop(0, U.rgba(c, 0.22 * p.decor));
        rg.addColorStop(1, U.rgba(c, 0));
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      ctx.font = U.fs(p.size * S, 900);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(c, p.glow); ctx.shadowBlur = 40 * S * p.glow; }
      ctx.fillStyle = U.ink;
      ctx.fillText(labels[layer], W / 2, H / 2);
      ctx.restore();
    }

    /* 中线指示（前后画面对比用，轻微） */
    if (p.decor > 0.5 && !TRANSFORM[kind] && prog > 0.02 && prog < 0.98) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = U.rgba(U.ink, 0.6);
      ctx.lineWidth = 1.4 * S;
      ctx.setLineDash([12 * S, 10 * S]);
      ctx.beginPath();
      ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H);
      ctx.stroke();
      ctx.restore();
    }
  }

  MF.forge({
    cat: '转场切换', type: 'block', dur: 5, poster: 0.3,
    params: TRANS_PARAMS, draw: transDraw,
    ids: [
      { id: 'tr-wipe-h', name: '水平擦除', tags: ['擦除', '通用'], desc: '自左向右推进的硬边擦除，最直白的转场，适合信息条与资料切换。', cfg: { kind: 'wipeH' } },
      { id: 'tr-wipe-v', name: '垂直擦除', tags: ['擦除', '通用'], desc: '自上而下推进的擦除，适合竖版视频与手机屏幕内容。', cfg: { kind: 'wipeV' } },
      { id: 'tr-circle', name: '圆形扩散', tags: ['圆形', '聚焦'], desc: '从画面中心向外扩散的圆形揭示，视觉焦点明确，适合揭晓答案。', cfg: { kind: 'circle' } },
      { id: 'tr-iris', name: '光圈收拢', tags: ['光圈', '镜头'], desc: '矩形光圈由大到小收拢切换，模拟镜头对焦，专业感强。', cfg: { kind: 'iris' } },
      { id: 'tr-diagonal', name: '对角擦除', tags: ['对角', '动感'], desc: '沿对角线方向斜切推进，比水平擦除更有设计感。', cfg: { kind: 'diagonal' } },
      { id: 'tr-blinds', name: '百叶窗', tags: ['百叶', '经典'], desc: '多条横缝依次打开的经典百叶窗转场，节奏感强。', cfg: { kind: 'blinds' } },
      { id: 'tr-checker', name: '方格错落', tags: ['方格', '俏皮'], desc: '画面被切成一格格随机先后揭示，活泼有趣，适合快节奏内容。', cfg: { kind: 'checker' } },
      { id: 'tr-pixel', name: '像素溶解', tags: ['像素', '科技'], desc: '像素块随机溶解出现，数字感强，适合科技与赛博主题。', cfg: { kind: 'pixel' } },
      { id: 'tr-grain', name: '噪点溶解', tags: ['噪点', '有机'], desc: '按噪声场逐步显现的柔和溶解，过渡自然不生硬。', cfg: { kind: 'grain' } },
      { id: 'tr-mosaic', name: '马赛克拼合', tags: ['马赛克', '中心'], desc: '从中心向外一块块拼满画面，有拼图的秩序感。', cfg: { kind: 'mosaic' } },
      { id: 'tr-hex', name: '六边形扩散', tags: ['六边形', '科技'], desc: '蜂窝状六边形由中心向外铺开，科技感与结构感兼备。', cfg: { kind: 'hex' } },
      { id: 'tr-star', name: '星形扩散', tags: ['星形', '活泼'], desc: '五角星形状放大铺满画面，适合儿童与活动主题。', cfg: { kind: 'star' } },
      { id: 'tr-bars', name: '随机条形', tags: ['条形', '节奏'], desc: '高低不一的竖条随机升起填满画面，节奏跳跃。', cfg: { kind: 'bars' } },
      { id: 'tr-clock', name: '时钟扫描', tags: ['扫描', '时间'], desc: '像表针一样扫过一圈完成切换，时间主题的首选。', cfg: { kind: 'clock' } },
      { id: 'tr-sweep', name: '扇扫推进', tags: ['扇形', '动感'], desc: '以偏心圆为轴心扇形扫过，动势更集中。', cfg: { kind: 'sweep' } },
      { id: 'tr-spiral', name: '螺旋推进', tags: ['螺旋', '迷幻'], desc: '沿螺旋路径展开画面，带一点眩晕的迷幻感。', cfg: { kind: 'spiral' } },
      { id: 'tr-wave', name: '波浪推进', tags: ['波浪', '柔和'], desc: '波浪状的高低起伏推进，过渡柔和自然。', cfg: { kind: 'wave' } },
      { id: 'tr-cross', name: '十字扩散', tags: ['十字', '结构'], desc: '十字形张开铺满画面，结构感强烈。', cfg: { kind: 'cross' } },
      { id: 'tr-corners', name: '四角汇聚', tags: ['四角', '汇聚'], desc: '四个角同时向内生长，适合做「聚焦中心」的转场。', cfg: { kind: 'corners' } },
      { id: 'tr-curtain', name: '幕布开合', tags: ['幕布', '舞台'], desc: '像舞台幕布一样从两侧收开，戏剧感强。', cfg: { kind: 'curtain' } },
      { id: 'tr-shutter', name: '快门条', tags: ['快门', '机械'], desc: '横条像快门一样逐条张开，机械感十足。', cfg: { kind: 'shutter' } },
      { id: 'tr-triangle', name: '三角拼合', tags: ['三角', '几何'], desc: '一排三角形自下而上撑起画面，几何构成感强。', cfg: { kind: 'triangle' } },
      { id: 'tr-luma', name: '光带扫过', tags: ['光带', '高级'], desc: '一条明亮光带扫过屏幕，扫过之处画面切换，高级感强。', cfg: { kind: 'luma', glow: 0.7 } },
      { id: 'tr-ripple', name: '涟漪扩散', tags: ['涟漪', '柔和'], desc: '双重涟漪同心扩散，柔和且有层次。', cfg: { kind: 'ripple' } },
      { id: 'tr-push-left', name: '向左推移', tags: ['推移', '连续'], desc: '后一画面把前一画面整体推向左侧，像翻页一样连贯。', cfg: { kind: 'pushLeft' } },
      { id: 'tr-push-right', name: '向右推移', tags: ['推移', '连续'], desc: '后一画面自右侧推入，与向左推移互为反向。', cfg: { kind: 'pushRight' } },
      { id: 'tr-slide-up', name: '向上推移', tags: ['推移', '竖版'], desc: '画面整体向上推移切换，适合竖屏内容与信息流。', cfg: { kind: 'slideUp' } },
      { id: 'tr-slide-down', name: '向下推移', tags: ['推移', '竖版'], desc: '画面整体向下推移切换，与向上推移互为反向。', cfg: { kind: 'slideDown' } },
      { id: 'tr-zoom-in', name: '推近切换', tags: ['推近', '冲击'], desc: '后一画面由远推近，带镜头推进感，适合强调与揭晓。', cfg: { kind: 'zoomIn' } },
      { id: 'tr-zoom-out', name: '拉远切换', tags: ['拉远', '收束'], desc: '后一画面由近拉远稳定下来，适合收尾与总结。', cfg: { kind: 'zoomOut' } },
      { id: 'tr-blur-mix', name: '模糊交叠', tags: ['模糊', '柔和'], desc: '两画面在模糊中交叠，几乎看不到切换的痕迹，最柔和的转场。', cfg: { kind: 'blurMix', anim: 1.6 } },
      { id: 'tr-flip-3d', name: '3D 翻转', tags: ['翻转', '立体'], desc: '画面像卡片一样绕竖轴翻面，立体感强。', cfg: { kind: 'flip3d' } }
    ]
  });
})();
