/* ==========================================================================
   Jaykou 动效库 · 11
   原语：界面组件（用界面语言做演示）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var UI_PARAMS = [
    P('kind', '组件类型', 'notification', sel('notification', [
      ['notification', '通知横幅'], ['card-stack', '卡片堆叠'], ['profile', '资料卡'], ['toggle', '开关切换'],
      ['search', '搜索框'], ['menu', '菜单展开'], ['chat', '消息气泡'], ['modal', '弹窗对话框'],
      ['spinner', '加载环'], ['skeleton', '骨架屏'], ['input', '输入框'], ['tabs', '标签切换'],
      ['rating', '星级评分'], ['tooltip', '浮动提示'], ['carousel', '轮播卡片'], ['calendar', '日历'],
      ['tasklist', '任务清单'], ['statcard', '数据卡片'], ['badge', '徽章数字'], ['avatars', '头像堆叠'],
      ['dropdown', '下拉选择'], ['slider', '滑块调节'], ['settings', '设置列表'], ['battery', '电量充能'],
      ['waveform', '声波跳动'], ['keypress', '按键反馈']
    ])),
    P('text', '主文案', 'Jaykou', txt('Jaykou')),
    P('sub', '副文案', '动效已就绪', txt('动效已就绪')),
    P('size', '基准尺寸', 420.0, rng(420.0, 160.0, 936.0, 4.0)),
    P('speed', '速度', 1, rng(1, 0.3, 3, 0.05)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function uiDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var base = p.size * S;
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var k = e.outBack(U.clamp(t * sp / 1, 0, 1));
    var k2 = e.outCubic(U.clamp(t * sp / 1.2, 0, 1));
    var ink = U.ink;
    var label = String(p.text || '');
    var sub = String(p.sub || '');

    var panel = function (w, h, rx) {
      var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      g.addColorStop(0, U.mix(U.bg2, U.accent, 0.24));
      g.addColorStop(1, U.mix(U.bg1, U.accent2, 0.16));
      ctx.save();
      ctx.shadowColor = U.rgba('#000000', 0.45);
      ctx.shadowBlur = 42 * S;
      ctx.shadowOffsetY = 16 * S;
      U.rr(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
      U.rr(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.strokeStyle = U.rgba(ink, 0.14);
      ctx.lineWidth = 1.6 * S;
      ctx.stroke();
    };

    ctx.save();
    ctx.translate(cx, cy);

    if (kind === 'notification') {
      var nw = Math.min(base * 2.2, W * 0.72), nh = 132 * S;
      ctx.save();
      ctx.globalAlpha = U.clamp(t * sp * 2, 0, 1);
      ctx.translate(0, (1 - k2) * -70 * S);
      panel(nw, nh, 22 * S);
      ctx.beginPath();
      ctx.arc(-nw / 2 + 54 * S, 0, 24 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.accent, 0.92);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(26 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.bg1;
      ctx.fillText('✓', -nw / 2 + 54 * S, 2 * S);
      ctx.textAlign = 'left';
      ctx.font = U.fs(30 * S, 800);
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 18), -nw / 2 + 96 * S, -18 * S);
      ctx.font = U.fs(23 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 24), -nw / 2 + 96 * S, 22 * S);
      ctx.restore();
    }

    else if (kind === 'card-stack') {
      var cw2 = Math.min(base * 1.5, W * 0.5), ch2 = cw2 * 0.62;
      for (var si = 3; si >= 0; si--) {
        var sk = e.outCubic(U.clamp((t * sp - (3 - si) * 0.15) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = 0.35 + sk * 0.65;
        ctx.translate(si * 22 * S * sk, -si * 26 * S * sk);
        ctx.rotate(si * 0.028 * sk);
        panel(cw2, ch2, 20 * S);
        ctx.restore();
      }
      ctx.font = U.fs(40 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.letterSpacing = '2px';
      ctx.fillText(label.slice(0, 12), 0, -8 * S);
      ctx.letterSpacing = '0px';
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 22), 0, 34 * S);
    }

    else if (kind === 'profile') {
      /* 入场弹升 + 悬浮呼吸 + 三项数据计数 */
      var pk = e.outBack(U.clamp((t * sp - 0.05) / 0.9, 0, 1));
      var pk2 = e.outCubic(U.clamp((t * sp - 0.55) / 0.9, 0, 1));
      var pw = Math.min(base * 1.5, W * 0.5), ph = pw * 0.74;
      ctx.save();
      ctx.translate(0, (1 - pk) * 52 * S + Math.sin(t * sp * 1.5) * 5 * S);
      ctx.globalAlpha = U.clamp(pk * 1.6, 0, 1);
      if (pk < 1) { var psc = 0.9 + 0.1 * pk; ctx.scale(psc, psc); }
      panel(pw, ph, 26 * S);
      ctx.beginPath();
      ctx.arc(0, -ph / 2 + 62 * S, 42 * S, 0, Math.PI * 2);
      var avg = ctx.createLinearGradient(-42 * S, -104 * S, 42 * S, 20 * S);
      avg.addColorStop(0, U.accent);
      avg.addColorStop(1, U.accent2);
      ctx.fillStyle = avg;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(40 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label.charAt(0).toUpperCase() || 'M', 0, -ph / 2 + 64 * S);
      ctx.font = U.fs(32 * S, 800);
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), 0, -ph / 2 + 138 * S);
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 26), 0, -ph / 2 + 172 * S);
      var statW = (pw - 60 * S) / 3;
      for (var st = 0; st < 3; st++) {
        var stx = -pw / 2 + 30 * S + st * statW;
        var sv = [128, 4.9, 36][st];
        var shown = st === 1 ? (sv * pk2).toFixed(1) : String(Math.round(sv * pk2));
        ctx.font = U.fs(26 * S, 800);
        ctx.fillStyle = U.accent;
        ctx.fillText(shown, stx + statW / 2, ph / 2 - 62 * S);
        ctx.font = U.fs(17 * S, 500);
        ctx.fillStyle = U.rgba(ink, 0.5);
        ctx.fillText(['作品', '评分', '粉丝'][st], stx + statW / 2, ph / 2 - 34 * S);
      }
      ctx.restore();
    }

    else if (kind === 'toggle') {
      var tw = base * 1.1, th = tw * 0.52;
      var on = k2 > 0.5;
      var knobPos = (on ? 1 : 0) * (tw / 2 - th / 2) * k2;
      var trackG = ctx.createLinearGradient(-tw / 2, 0, tw / 2, 0);
      if (on) { trackG.addColorStop(0, U.accent); trackG.addColorStop(1, U.accent2); }
      else { trackG.addColorStop(0, U.rgba(ink, 0.2)); trackG.addColorStop(1, U.rgba(ink, 0.2)); }
      U.rr(ctx, -tw / 2, -th / 2, tw, th, th / 2);
      ctx.fillStyle = trackG;
      if (on && p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 28 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(-tw / 2 + th / 2 + knobPos, 0, th * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.75);
      ctx.fillText(label.slice(0, 14), 0, th / 2 + 54 * S);
      ctx.fillStyle = on ? U.accent : U.rgba(ink, 0.4);
      ctx.fillText(on ? 'ON' : 'OFF', 0, -th / 2 - 40 * S);
    }

    else if (kind === 'search') {
      var sw2 = Math.min(base * 2, W * 0.7), sh = 92 * S;
      panel(sw2, sh, sh / 2);
      ctx.beginPath();
      ctx.arc(-sw2 / 2 + 52 * S, -4 * S, 17 * S, 0, Math.PI * 2);
      ctx.strokeStyle = U.rgba(ink, 0.6);
      ctx.lineWidth = 4 * S;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-sw2 / 2 + 64 * S, 9 * S);
      ctx.lineTo(-sw2 / 2 + 76 * S, 22 * S);
      ctx.stroke();
      var typed = label.slice(0, Math.floor(U.clamp(t * sp * 7, 0, label.length)));
      ctx.font = U.fs(30 * S, 500);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = typed ? ink : U.rgba(ink, 0.35);
      ctx.fillText(typed || 'Search…', -sw2 / 2 + 96 * S, -2 * S);
      if (Math.floor(t * sp * 2) % 2 === 0 && typed.length < label.length) {
        ctx.fillStyle = U.accent;
        ctx.fillRect(-sw2 / 2 + 98 * S + ctx.measureText(typed).width, -22 * S, 3 * S, 42 * S);
      }
      var sug = U.clamp((t * sp - 0.9) / 0.6, 0, 1);
      if (sug > 0) {
        ctx.save();
        ctx.globalAlpha = sug;
        ctx.translate(0, sh / 2 + 24 * S);
        panel(sw2, 150 * S, 20 * S);
        for (var qi = 0; qi < 3; qi++) {
          ctx.fillStyle = U.rgba(ink, 0.7 - qi * 0.16);
          ctx.font = U.fs(25 * S, 500);
          ctx.textAlign = 'left';
          ctx.fillText(sub.slice(0, 20) + ' ' + (qi + 1), -sw2 / 2 + 34 * S, -40 * S + qi * 44 * S);
        }
        ctx.restore();
      }
    }

    else if (kind === 'menu') {
      var mw = 300 * S, itemH = 62 * S, items = 5;
      ctx.save();
      ctx.translate(-base * 0.45, -base * 0.2);
      panel(mw, itemH * items + 40 * S, 20 * S);
      for (var mi = 0; mi < items; mi++) {
        var mk = e.outCubic(U.clamp((t * sp - mi * 0.09) / 0.5, 0, 1));
        ctx.globalAlpha = mk;
        ctx.save();
        ctx.translate(-mk * 40 * S, 0);
        ctx.beginPath();
        ctx.arc(-mw / 2 + 40 * S, -((items - 1) * itemH) / 2 + mi * itemH + 6 * S, 12 * S, 0, Math.PI * 2);
        ctx.fillStyle = mi === 1 ? U.accent : U.rgba(ink, 0.35);
        ctx.fill();
        ctx.fillStyle = mi === 1 ? ink : U.rgba(ink, 0.68);
        ctx.font = U.fs(25 * S, mi === 1 ? 800 : 500);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(label.slice(0, 8) + ' ' + (mi + 1), -mw / 2 + 66 * S, -((items - 1) * itemH) / 2 + mi * itemH + 6 * S);
        ctx.restore();
      }
      ctx.restore();
    }

    else if (kind === 'chat') {
      var bw2 = Math.min(base * 1.9, W * 0.62);
      var bubbles = [
        { t: sub.slice(0, 20) || '你好，在吗？', me: false, w: 0.62 },
        { t: label.slice(0, 20) || '在的，请讲', me: true, w: 0.5 },
        { t: '方案我看过了', me: false, w: 0.55 }
      ];
      var totalH = bubbles.length * 86 * S;
      for (var bi = 0; bi < bubbles.length; bi++) {
        var bk2 = e.outBack(U.clamp((t * sp - bi * 0.35) / 0.6, 0, 1));
        if (bk2 <= 0) continue;
        var byy = -totalH / 2 + bi * 86 * S;
        ctx.globalAlpha = U.clamp(bk2, 0, 1);
        var bbw = bw2 * bubbles[bi].w * bk2;
        var bbx = bubbles[bi].me ? bw2 / 2 - bbw : -bw2 / 2;
        U.rr(ctx, bbx, byy, bbw, 64 * S, 16 * S);
        ctx.fillStyle = bubbles[bi].me ? U.rgba(U.accent, 0.92) : U.rgba(U.mix(U.bg2, ink, 0.16), 0.98);
        ctx.fill();
        ctx.font = U.fs(25 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = bubbles[bi].me ? U.bg1 : ink;
        ctx.globalAlpha = bk2;
        ctx.fillText(bubbles[bi].t, bbx + 22 * S, byy + 34 * S);
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'modal') {
      var dw = Math.min(base * 1.9, W * 0.66), dh = dw * 0.62;
      ctx.save();
      ctx.globalAlpha = 0.6 * k2;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-W, -H, W * 2, H * 2);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = U.clamp(k2 * 1.4, 0, 1);
      var pop = 0.86 + 0.14 * k;
      ctx.scale(pop, pop);
      panel(dw, dh, 26 * S);
      ctx.font = U.fs(42 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), 0, -dh / 2 + 70 * S);
      ctx.font = U.fs(24 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 26), 0, -dh / 2 + 124 * S);
      var btnW = dw * 0.36, btnH = 70 * S;
      U.rr(ctx, -dw / 2 + dw * 0.06, dh / 2 - 106 * S, btnW, btnH, 14 * S);
      ctx.fillStyle = U.rgba(ink, 0.12);
      ctx.fill();
      ctx.fillStyle = U.rgba(ink, 0.8);
      ctx.font = U.fs(26 * S, 700);
      ctx.fillText('取消', -dw / 2 + dw * 0.06 + btnW / 2, dh / 2 - 106 * S + btnH / 2);
      U.rr(ctx, dw / 2 - dw * 0.06 - btnW, dh / 2 - 106 * S, btnW, btnH, 14 * S);
      var btng = ctx.createLinearGradient(dw / 2 - btnW * 2, 0, dw / 2, 0);
      btng.addColorStop(0, U.accent); btng.addColorStop(1, U.accent2);
      ctx.fillStyle = btng;
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('确认', dw / 2 - dw * 0.06 - btnW / 2, dh / 2 - 106 * S + btnH / 2);
      ctx.restore();
    }

    else if (kind === 'spinner') {
      var R = base * 0.4;
      var ang = t * sp * 3.4;
      ctx.strokeStyle = U.rgba(ink, 0.12);
      ctx.lineWidth = 16 * S;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
      var sg2 = ctx.createLinearGradient(-R, -R, R, R);
      sg2.addColorStop(0, U.accent);
      sg2.addColorStop(1, U.accent2);
      ctx.strokeStyle = sg2;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.beginPath(); ctx.arc(0, 0, R, ang, ang + Math.PI * 1.25); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(30 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(sub.slice(0, 16), 0, R + 60 * S);
    }

    else if (kind === 'skeleton') {
      var kw = Math.min(base * 1.9, W * 0.6);
      var rows = 3;
      for (var ri = 0; ri < rows; ri++) {
        var ry2 = -((rows - 1) * 56 * S) / 2 + ri * 56 * S;
        var rw = kw * (1 - (ri % 2) * 0.32);
        var shine = ((t * sp * 0.7 + ri * 0.2) % 1);
        var sg3 = ctx.createLinearGradient(-rw / 2, 0, rw / 2, 0);
        sg3.addColorStop(U.clamp(shine - 0.25, 0, 1), U.rgba(ink, 0.09));
        sg3.addColorStop(U.clamp(shine, 0, 1), U.rgba(ink, 0.2));
        sg3.addColorStop(U.clamp(shine + 0.25, 0, 1), U.rgba(ink, 0.09));
        U.rr(ctx, -rw / 2, ry2, rw, 26 * S, 13 * S);
        ctx.fillStyle = sg3;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(-kw / 2 + 38 * S, 0, 30 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(ink, 0.14);
      ctx.fill();
    }

    else if (kind === 'input') {
      var iw = Math.min(base * 2, W * 0.7), ih = 96 * S;
      panel(iw, ih, 16 * S);
      var focus = U.clamp((t * sp - 0.5) / 0.4, 0, 1);
      U.rr(ctx, -iw / 2, -ih / 2, iw, ih, 16 * S);
      ctx.strokeStyle = U.rgba(U.accent, focus);
      ctx.lineWidth = 3 * S * focus;
      if (p.glow > 0.02 && focus > 0) { ctx.shadowColor = U.rgba(U.accent, p.glow * focus); ctx.shadowBlur = 20 * S * p.glow; }
      ctx.stroke();
      ctx.shadowBlur = 0;
      var iv = label.slice(0, Math.floor(U.clamp((t * sp - 0.9) * 5, 0, label.length)));
      ctx.font = U.fs(30 * S, 500);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(iv, -iw / 2 + 28 * S, 0);
      if (iv.length && focus > 0.5 && Math.floor(t * sp * 2) % 2 === 0) {
        ctx.fillStyle = U.accent;
        ctx.fillRect(-iw / 2 + 30 * S + ctx.measureText(iv).width, -22 * S, 3 * S, 44 * S);
      }
      ctx.font = U.fs(21 * S, 500);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(ink, 0.45);
      ctx.fillText(sub.slice(0, 20), -iw / 2 + 28 * S, ih / 2 + 38 * S);
    }

    else if (kind === 'tabs') {
      var tabs = ['概览', '明细', '设置'];
      var ttw = base * 0.6, tth = 72 * S;
      var activeIdx = Math.floor((t * sp * 0.6) % tabs.length);
      var trackW = ttw * tabs.length;
      ctx.save();
      ctx.translate(-trackW / 2, 0);
      U.rr(ctx, 0, -tth / 2, trackW, tth, tth / 2);
      ctx.fillStyle = U.rgba(ink, 0.09);
      ctx.fill();
      var indicatorX = activeIdx * ttw;
      U.rr(ctx, indicatorX + 6 * S, -tth / 2 + 6 * S, ttw - 12 * S, tth - 12 * S, (tth - 12 * S) / 2);
      var tg = ctx.createLinearGradient(indicatorX, 0, indicatorX + ttw, 0);
      tg.addColorStop(0, U.accent); tg.addColorStop(1, U.accent2);
      ctx.fillStyle = tg;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var ti2 = 0; ti2 < tabs.length; ti2++) {
        ctx.fillStyle = ti2 === activeIdx ? U.bg1 : U.rgba(ink, 0.6);
        ctx.fillText(tabs[ti2], ti2 * ttw + ttw / 2, 0);
      }
      ctx.restore();
    }

    else if (kind === 'rating') {
      var stars = 5, activeStars = Math.floor(U.clamp(t * sp * 1.1, 0, stars)) + 1;
      var starSize = base * 0.24;
      for (var sti = 0; sti < stars; sti++) {
        var sx4 = (sti - (stars - 1) / 2) * starSize * 1.25;
        var litFlag = sti < Math.min(activeStars, stars);
        var pop2 = litFlag ? e.outBack(U.clamp((t * sp - sti * 0.18) / 0.5, 0, 1)) : 1;
        ctx.save();
        ctx.translate(sx4, 0);
        ctx.scale(pop2, pop2);
        U.star(ctx, 0, 0, 5, starSize * 0.52, starSize * 0.24, -Math.PI / 2);
        if (litFlag) {
          var stg = ctx.createLinearGradient(-starSize / 2, -starSize / 2, starSize / 2, starSize / 2);
          stg.addColorStop(0, U.accent); stg.addColorStop(1, U.accent2);
          ctx.fillStyle = stg;
          if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = U.rgba(ink, 0.16);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.font = U.fs(30 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(sub.slice(0, 16), 0, starSize * 1.4);
    }

    else if (kind === 'tooltip') {
      var up = e.outBack(U.clamp(t * sp / 0.8, 0, 1));
      var tkw = 320 * S, tkh = 84 * S;
      ctx.save();
      ctx.globalAlpha = U.clamp(up, 0, 1);
      ctx.translate(0, -base * 0.34 - (1 - up) * 30 * S);
      panel(tkw, tkh, 16 * S);
      ctx.beginPath();
      ctx.moveTo(-14 * S, tkh / 2);
      ctx.lineTo(14 * S, tkh / 2);
      ctx.lineTo(0, tkh / 2 + 18 * S);
      ctx.closePath();
      ctx.fillStyle = U.mix(U.bg2, U.accent, 0.2);
      ctx.fill();
      ctx.font = U.fs(27 * S, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), 0, -6 * S);
      ctx.font = U.fs(20 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 22), 0, 24 * S);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(0, base * 0.26, 30 * S, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.accent, 0.9);
      ctx.fill();
      ctx.font = U.fs(24 * S, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.bg1;
      ctx.fillText('?', 0, base * 0.27);
    }

    else if (kind === 'carousel') {
      var cards = 3;
      for (var ci = 0; ci < cards; ci++) {
        var cd = ci - 1;
        var cprog = (t * sp * 0.3) % cards;
        var xoff = cd - cprog;
        xoff = ((xoff + cards * 1.5) % cards) - 1.5;
        var cw3 = base * 1.1, ch3 = cw3 * 0.72;
        var scaleC = 1 - Math.abs(xoff) * 0.18;
        ctx.save();
        ctx.globalAlpha = 0.35 + (1 - Math.abs(xoff) / 1.6) * 0.65;
        ctx.translate(xoff * cw3 * 0.78, 0);
        ctx.scale(scaleC, scaleC);
        panel(cw3, ch3, 20 * S);
        ctx.font = U.fs(34 * S, 900);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = ink;
        ctx.fillText(label.slice(0, 10), 0, -12 * S);
        ctx.font = U.fs(21 * S, 500);
        ctx.fillStyle = U.rgba(ink, 0.55);
        ctx.fillText(sub.slice(0, 16), 0, 26 * S);
        ctx.restore();
      }
    }

    else if (kind === 'calendar') {
      var cols = 7, rows2 = 5;
      var cellW = base * 0.19, cellH = cellW * 0.88;
      var gridW = cols * cellW, gridH = rows2 * cellH;
      ctx.save();
      ctx.translate(-gridW / 2, -gridH / 2 + 20 * S);
      var today = Math.floor(U.clamp(t * sp * 1.2, 0, 34));
      for (var gr = 0; gr < rows2; gr++) {
        for (var gc = 0; gc < cols; gc++) {
          var idx2 = gr * cols + gc;
          var ck3 = e.outCubic(U.clamp((t * sp - idx2 * 0.015) / 0.6, 0, 1));
          var isToday = idx2 === today;
          ctx.globalAlpha = ck3 * (idx2 > today ? 0.35 : 1);
          if (isToday) {
            var cg = ctx.createLinearGradient(gc * cellW, gr * cellH, (gc + 1) * cellW, (gr + 1) * cellH);
            cg.addColorStop(0, U.accent); cg.addColorStop(1, U.accent2);
            ctx.fillStyle = cg;
            if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 18 * S * p.glow; }
            U.rr(ctx, gc * cellW + 4 * S, gr * cellH + 4 * S, cellW - 8 * S, cellH - 8 * S, 10 * S);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.font = U.fs(20 * S, isToday ? 800 : 500);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = isToday ? U.bg1 : U.rgba(ink, 0.72);
          ctx.fillText(String(idx2 + 1), gc * cellW + cellW / 2, gr * cellH + cellH / 2);
        }
      }
      ctx.restore();
      ctx.font = U.fs(26 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.8);
      ctx.fillText(label.slice(0, 10), 0, -gridH / 2 - 16 * S);
    }

    else if (kind === 'tasklist') {
      var items2 = ['设计稿评审', '动效联调', '导出交付'];
      var lw2 = Math.min(base * 1.8, W * 0.6);
      for (var li2 = 0; li2 < items2.length; li2++) {
        var ly4 = -((items2.length - 1) * 84 * S) / 2 + li2 * 84 * S;
        var lk = e.outCubic(U.clamp((t * sp - li2 * 0.25) / 0.55, 0, 1));
        ctx.globalAlpha = lk;
        ctx.save();
        ctx.translate((1 - lk) * -50 * S, 0);
        var done = t * sp > li2 * 0.45 + 0.85;
        U.rr(ctx, -lw2 / 2, ly4 - 30 * S, lw2, 60 * S, 14 * S);
        ctx.fillStyle = done ? U.rgba(U.accent, 0.16) : U.rgba(ink, 0.07);
        ctx.fill();
        U.rr(ctx, -lw2 / 2 + 20 * S, ly4 - 15 * S, 30 * S, 30 * S, 8 * S);
        ctx.strokeStyle = done ? U.accent : U.rgba(ink, 0.35);
        ctx.lineWidth = 2.6 * S;
        ctx.stroke();
        if (done) {
          ctx.beginPath();
          ctx.moveTo(-lw2 / 2 + 27 * S, ly4);
          ctx.lineTo(-lw2 / 2 + 34 * S, ly4 + 8 * S);
          ctx.lineTo(-lw2 / 2 + 46 * S, ly4 - 9 * S);
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = 3.2 * S;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.stroke();
        }
        ctx.font = U.fs(26 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = done ? U.rgba(ink, 0.45) : ink;
        ctx.fillText(items2[li2], -lw2 / 2 + 70 * S, ly4);
        if (done) {
          var tw3 = ctx.measureText(items2[li2]).width;
          ctx.strokeStyle = U.rgba(ink, 0.4);
          ctx.lineWidth = 2 * S;
          ctx.beginPath();
          ctx.moveTo(-lw2 / 2 + 70 * S, ly4);
          ctx.lineTo(-lw2 / 2 + 70 * S + tw3, ly4);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'statcard') {
      var cards2 = [['128K', '曝光'], ['4.9', '评分'], ['36%', '增长']];
      var scw = Math.min(base * 1.1, W * 0.24), sch = scw * 0.92;
      for (var sc = 0; sc < 3; sc++) {
        var scx = (sc - 1) * (scw * 1.12);
        var sck = e.outBack(U.clamp((t * sp - sc * 0.15) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp(sck, 0, 1);
        ctx.translate(scx, (1 - sck) * 40 * S);
        panel(scw, sch, 20 * S);
        ctx.font = U.fs(50 * S, 900);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var scg = ctx.createLinearGradient(-scw / 4, 0, scw / 4, 0);
        scg.addColorStop(0, U.accent); scg.addColorStop(1, U.accent2);
        ctx.fillStyle = scg;
        ctx.fillText(cards2[sc][0], 0, -sch * 0.12);
        ctx.font = U.fs(22 * S, 600);
        ctx.fillStyle = U.rgba(ink, 0.6);
        ctx.fillText(cards2[sc][1], 0, sch * 0.2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'badge') {
      ctx.beginPath();
      ctx.arc(0, 0, base * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(ink, 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, base * 0.32, 0, Math.PI * 2);
      var bdg = ctx.createLinearGradient(-base * 0.3, -base * 0.3, base * 0.3, base * 0.3);
      bdg.addColorStop(0, U.accent); bdg.addColorStop(1, U.accent2);
      ctx.fillStyle = bdg;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      var num = Math.floor(U.clamp(t * sp / 1.6, 0, 1) * 99) + 1;
      ctx.font = U.fs(base * 0.28, 900);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(String(num), 0, 2 * S);
      ctx.font = U.fs(24 * S, 600);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(sub.slice(0, 14), 0, base * 0.4 + 40 * S);
      var ang2 = t * sp * 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, base * 0.46, ang2, ang2 + Math.PI * 0.6);
      ctx.strokeStyle = U.accent;
      ctx.lineWidth = 5 * S; ctx.lineCap = 'round';
      ctx.stroke();
    }

    else if (kind === 'avatars') {
      var avN = 5;
      for (var av = avN - 1; av >= 0; av--) {
        var avk = e.outBack(U.clamp((t * sp - av * 0.11) / 0.6, 0, 1));
        ctx.save();
        ctx.globalAlpha = U.clamp(avk, 0, 1);
        ctx.translate(-av * 44 * S, 0);
        ctx.beginPath();
        ctx.arc(0, 0, base * 0.22, 0, Math.PI * 2);
        var ag2 = ctx.createLinearGradient(-base * 0.2, -base * 0.2, base * 0.2, base * 0.2);
        ag2.addColorStop(0, U.mix(U.accent, U.bg1, av * 0.16));
        ag2.addColorStop(1, U.mix(U.accent2, U.bg1, av * 0.16));
        ctx.fillStyle = ag2;
        ctx.strokeStyle = U.rgba(U.bg1, 0.9);
        ctx.lineWidth = 4 * S;
        ctx.fill();
        ctx.stroke();
        ctx.font = U.fs(base * 0.15, 800);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('ABCDE'.charAt(av), 0, 1 * S);
        ctx.restore();
      }
      ctx.font = U.fs(26 * S, 700);
      ctx.textAlign = 'center';
      ctx.fillStyle = U.rgba(ink, 0.7);
      ctx.fillText(sub.slice(0, 18), -avN * 22 * S, base * 0.4 + 34 * S);
    }

    else if (kind === 'dropdown') {
      var ddw = Math.min(base * 1.5, W * 0.5), ddh = 76 * S;
      var open = U.clamp((t * sp - 0.7) / 0.5, 0, 1);
      panel(ddw, ddh, 14 * S);
      ctx.font = U.fs(27 * S, 600);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 14), -ddw / 2 + 24 * S, 0);
      ctx.save();
      ctx.translate(ddw / 2 - 34 * S, 0);
      ctx.rotate(open * Math.PI);
      ctx.strokeStyle = U.rgba(ink, 0.7);
      ctx.lineWidth = 3 * S;
      ctx.beginPath();
      ctx.moveTo(-10 * S, -5 * S); ctx.lineTo(0, 6 * S); ctx.lineTo(10 * S, -5 * S);
      ctx.stroke();
      ctx.restore();
      if (open > 0.01) {
        var listH = 3 * 56 * S + 20 * S;
        ctx.save();
        ctx.globalAlpha = open;
        ctx.translate(0, ddh / 2 + 12 * S + (1 - open) * -20 * S);
        panel(ddw, listH, 14 * S);
        for (var di = 0; di < 3; di++) {
          ctx.fillStyle = di === 1 ? U.rgba(U.accent, 0.9) : U.rgba(ink, 0.7);
          ctx.font = U.fs(24 * S, di === 1 ? 800 : 500);
          ctx.textAlign = 'left';
          ctx.fillText(sub.slice(0, 12) + ' ' + (di + 1), -ddw / 2 + 24 * S, -listH / 2 + 28 * S + di * 56 * S);
        }
        ctx.restore();
      }
    }

    else if (kind === 'slider') {
      var slw = Math.min(base * 2, W * 0.68);
      var val3 = 0.5 + 0.5 * Math.sin(t * sp * 0.9);
      var knobX = -slw / 2 + slw * val3;
      U.rr(ctx, -slw / 2, -10 * S, slw, 20 * S, 10 * S);
      ctx.fillStyle = U.rgba(ink, 0.12);
      ctx.fill();
      U.rr(ctx, -slw / 2, -10 * S, slw * val3, 20 * S, 10 * S);
      var slg = ctx.createLinearGradient(-slw / 2, 0, slw / 2, 0);
      slg.addColorStop(0, U.accent); slg.addColorStop(1, U.accent2);
      ctx.fillStyle = slg;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(knobX, 0, 28 * S, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(30 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.accent;
      ctx.fillText(Math.round(val3 * 100) + '%', 0, -70 * S);
      ctx.font = U.fs(22 * S, 500);
      ctx.fillStyle = U.rgba(ink, 0.6);
      ctx.fillText(label.slice(0, 16), 0, 76 * S);
    }

    else if (kind === 'settings') {
      var rows3 = ['自动播放', '高清导出', '云端同步'];
      var sw3 = Math.min(base * 1.9, W * 0.62);
      for (var ri3 = 0; ri3 < rows3.length; ri3++) {
        var ry3 = -((rows3.length - 1) * 78 * S) / 2 + ri3 * 78 * S;
        var rk2 = e.outCubic(U.clamp((t * sp - ri3 * 0.16) / 0.55, 0, 1));
        ctx.globalAlpha = rk2;
        ctx.font = U.fs(27 * S, 600);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = ink;
        ctx.fillText(rows3[ri3], -sw3 / 2, ry3);
        var onFlag = ri3 !== 1;
        var tglW = 68 * S, tglH = 34 * S;
        var tglX = sw3 / 2 - tglW;
        U.rr(ctx, tglX, ry3 - tglH / 2, tglW, tglH, tglH / 2);
        ctx.fillStyle = onFlag ? U.rgba(U.accent, 0.9) : U.rgba(ink, 0.16);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tglX + (onFlag ? tglW - tglH / 2 : tglH / 2), ry3, tglH * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        if (ri3 < rows3.length - 1) {
          ctx.strokeStyle = U.rgba(ink, 0.08);
          ctx.lineWidth = 1.4 * S;
          ctx.beginPath();
          ctx.moveTo(-sw3 / 2, ry3 + 39 * S); ctx.lineTo(sw3 / 2, ry3 + 39 * S);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'battery') {
      var bw3 = base * 1.1, bh3 = bw3 * 0.44;
      var level = (t * sp * 0.4) % 1.4;
      level = U.clamp(level, 0, 1);
      U.rr(ctx, -bw3 / 2, -bh3 / 2, bw3, bh3, bh3 * 0.26);
      ctx.strokeStyle = U.rgba(ink, 0.45);
      ctx.lineWidth = 5 * S;
      ctx.stroke();
      U.rr(ctx, bw3 / 2 - 4 * S, -bh3 * 0.16, 14 * S, bh3 * 0.32, 4 * S);
      ctx.fillStyle = U.rgba(ink, 0.45);
      ctx.fill();
      var pad = 9 * S;
      var fillW = (bw3 - pad * 2) * level;
      U.rr(ctx, -bw3 / 2 + pad, -bh3 / 2 + pad, fillW, bh3 - pad * 2, bh3 * 0.16);
      var bg2 = ctx.createLinearGradient(-bw3 / 2, 0, bw3 / 2, 0);
      bg2.addColorStop(0, level > 0.3 ? U.accent : '#FF3B30');
      bg2.addColorStop(1, U.accent2);
      ctx.fillStyle = bg2;
      if (p.glow > 0.02 && level < 0.99) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 22 * S * p.glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = U.fs(28 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(Math.round(level * 100) + '%', 0, bh3 / 2 + 46 * S);
    }

    else if (kind === 'waveform') {
      var bars = 28;
      var barW = base * 0.07;
      for (var bi2 = 0; bi2 < bars; bi2++) {
        var bxc = (bi2 - (bars - 1) / 2) * barW * 1.5;
        var amp = Math.abs(Math.sin(bi2 * 0.5 + t * sp * 4)) * Math.abs(Math.cos(bi2 * 0.23 - t * sp * 2.2));
        var bhh = 12 * S + amp * base * 0.5;
        var barG = ctx.createLinearGradient(0, -bhh / 2, 0, bhh / 2);
        barG.addColorStop(0, U.accent);
        barG.addColorStop(1, U.accent2);
        ctx.fillStyle = barG;
        U.rr(ctx, bxc, -bhh / 2, barW, bhh, barW / 2);
        ctx.fill();
      }
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 16), 0, base * 0.4 + 40 * S);
    }

    else if (kind === 'keypress') {
      var keys = ['⌘', 'K'];
      var kw2 = base * 0.42, kh2 = kw2 * 0.9;
      var press = 0;
      for (var ki = 0; ki < keys.length; ki++) {
        press = U.clamp((t * sp - 0.9 - ki * 0.12) / 0.18, 0, 1) * U.clamp((1 - (t * sp - 1.5 - ki * 0.12) / 0.4), 0, 1);
        var kx2 = (ki - (keys.length - 1) / 2) * (kw2 * 1.18);
        ctx.globalAlpha = 0.9;
        var kyg = ctx.createLinearGradient(0, -kh2 / 2, 0, kh2 / 2);
        kyg.addColorStop(0, U.mix(U.bg2, U.accent, press * 0.5 + 0.12));
        kyg.addColorStop(1, U.mix(U.bg1, U.accent, press * 0.35));
        U.rr(ctx, kx2 - kw2 / 2, -kh2 / 2 + press * 6 * S, kw2, kh2, 16 * S);
        ctx.fillStyle = kyg;
        ctx.fill();
        ctx.strokeStyle = U.rgba(press > 0.5 ? U.accent : ink, 0.3 + press * 0.6);
        ctx.lineWidth = 2.4 * S;
        ctx.stroke();
        ctx.font = U.fs(kw2 * 0.5, 800);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = U.rgba(ink, 0.85);
        ctx.fillText(keys[ki], kx2, press * 6 * S);
      }
      if (press > 0.5) {
        ctx.globalAlpha = (press - 0.5) * 2 * 0.6;
        var ripples = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 0.8);
        ripples.addColorStop(0, U.rgba(U.accent, 0.4));
        ripples.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ripples;
        ctx.fillRect(-W, -H, W * 2, H * 2);
      }
      ctx.globalAlpha = 1;
      ctx.font = U.fs(24 * S, 600);
      ctx.textAlign = 'center';
      ctx.fillStyle = U.rgba(ink, 0.55);
      ctx.fillText(sub.slice(0, 18), 0, kh2 + 50 * S);
    }

    else {
      panel(base, base * 0.6, 20 * S);
      ctx.font = U.fs(36 * S, 800);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      ctx.fillText(label.slice(0, 12), 0, 0);
    }

    ctx.restore();
  }

  MF.forge({
    cat: '界面组件', type: 'component', dur: 5.5, poster: 0.8,
    params: UI_PARAMS, draw: uiDraw,
    ids: [
      { id: 'ui-notification', name: '通知横幅', tags: ['通知', '反馈'], desc: '通知横幅自顶部滑入并展示勾选图标，适合操作成功反馈。', cfg: { kind: 'notification', text: '保存成功', sub: '动效已同步到工作台', size: 720} },
      { id: 'ui-card-stack', name: '卡片堆叠', tags: ['堆叠', '层次'], desc: '多层卡片依次错位展开，适合展示专辑与项目集合。', cfg: { kind: 'card-stack' } },
      { id: 'ui-profile', name: '资料卡', tags: ['资料', '人设'], desc: '头像、姓名与三项统计依次落位的资料卡，适合人物介绍。', cfg: { kind: 'profile', text: 'JAYKOU', sub: '跨境 · 动效 · 选品', size: 380 } },
      { id: 'ui-toggle', name: '开关切换', tags: ['开关', '状态'], desc: '开关从关到开并带颜色渐变，适合功能启停演示。', cfg: { kind: 'toggle', text: '自动播放' } },
      { id: 'ui-search', name: '搜索展开', tags: ['搜索', '输入'], desc: '搜索框逐字输入并下拉出建议列表，交互演示的标准件。', cfg: { kind: 'search', text: 'motion', sub: '动效模板' } },
      { id: 'ui-menu', name: '菜单展开', tags: ['菜单', '导航'], desc: '菜单项依次从左侧滑入并高亮当前项。', cfg: { kind: 'menu', text: '设置' } },
      { id: 'ui-chat', name: '消息气泡', tags: ['聊天', '对话'], desc: '多条气泡依次弹出，左右分栏呈现对话，适合访谈与客服场景。', cfg: { kind: 'chat', text: '在的，请讲', sub: '你好，在吗？', size: 720} },
      { id: 'ui-modal', name: '弹窗对话框', tags: ['弹窗', '确认'], desc: '遮罩渐暗 + 弹窗弹出，标准的确认交互演示。', cfg: { kind: 'modal', text: '确认删除？', sub: '删除后不可恢复' } },
      { id: 'ui-spinner', name: '加载环', tags: ['加载', '等待'], desc: '渐变加载环持续旋转，等待状态的通用表达。', cfg: { kind: 'spinner', sub: '正在加载' } },
      { id: 'ui-skeleton', name: '骨架屏', tags: ['骨架', '占位'], desc: '骨架条依次流光扫过，内容加载前的占位演示。', cfg: { kind: 'skeleton' } },
      { id: 'ui-input', name: '输入框聚焦', tags: ['输入', '聚焦'], desc: '输入框边框高亮并逐字输入，聚焦态演示。', cfg: { kind: 'input', text: 'Jaykou', sub: '请输入项目名称' } },
      { id: 'ui-tabs', name: '标签切换', tags: ['标签', '切换'], desc: '胶囊指示器在三档之间平滑滑动，适合分栏切换演示。', cfg: { kind: 'tabs' } },
      { id: 'ui-rating', name: '星级评分', tags: ['评分', '反馈'], desc: '星星依次弹亮到指定分值，适合评价与口碑场景。', cfg: { kind: 'rating', sub: '基于 1,284 条评价', size: 720} },
      { id: 'ui-tooltip', name: '浮动提示', tags: ['提示', '指引'], desc: '提示气泡弹入并指向问号图标，适合功能说明。', cfg: { kind: 'tooltip', text: '点击查看详情', sub: '这里有更详细的说明' } },
      { id: 'ui-carousel', name: '轮播卡片', tags: ['轮播', '循环'], desc: '三张卡片循环轮转并缩放，适合展示多个方案。', cfg: { kind: 'carousel', text: '精选方案', sub: '方案 ' } },
      { id: 'ui-calendar', name: '日历节奏', tags: ['日历', '节奏'], desc: '日期逐格点亮并高亮当前日，适合排期与打卡场景。', cfg: { kind: 'calendar', text: '十月排期', size: 520 } },
      { id: 'ui-tasklist', name: '任务清单', tags: ['清单', '完成'], desc: '任务逐条滑入并被打勾划掉，完成感很强。', cfg: { kind: 'tasklist' } },
      { id: 'ui-statcard', name: '数据卡片组', tags: ['数据卡', '指标'], desc: '三张数据卡依次弹入，适合关键指标总览。', cfg: { kind: 'statcard' } },
      { id: 'ui-badge', name: '徽章计数', tags: ['徽章', '计数'], desc: '圆形徽章数字滚动并带环形进度，适合成就与提醒。', cfg: { kind: 'badge', sub: '待处理事项' } },
      { id: 'ui-avatars', name: '头像堆叠', tags: ['头像', '成员'], desc: '多个头像依次错位叠放，适合团队成员展示。', cfg: { kind: 'avatars', sub: '已有 36 人参与', size: 720} },
      { id: 'ui-dropdown', name: '下拉选择', tags: ['下拉', '选择'], desc: '下拉箭头翻转并展开选项列表，表单演示常用。', cfg: { kind: 'dropdown', text: '选择分类', sub: '选项' } },
      { id: 'ui-slider', name: '滑块调节', tags: ['滑块', '数值'], desc: '滑块自动往复并实时显示数值，适合参数调节演示。', cfg: { kind: 'slider', text: '细节强度' } },
      { id: 'ui-settings', name: '设置列表', tags: ['设置', '开关'], desc: '设置项逐条出现并带各自开关状态的列表。', cfg: { kind: 'settings' } },
      { id: 'ui-battery', name: '电量充能', tags: ['电量', '进度'], desc: '电池电量逐步充满，充电与进度主题的直观表达。', cfg: { kind: 'battery' } },
      { id: 'ui-waveform', name: '声波跳动', tags: ['声波', '音频'], desc: '声波柱随节奏跳动，适合播客与音乐内容。', cfg: { kind: 'waveform', sub: '正在录音' } },
      { id: 'ui-keypress', name: '按键反馈', tags: ['按键', '快捷键'], desc: '快捷键按键被按下并弹出涟漪，适合功能介绍与教程。', cfg: { kind: 'keypress', sub: '打开命令面板', size: 720} }
    ]
  });
})();
