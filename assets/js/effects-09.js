/* ==========================================================================
   Jaykou 动效库 · 09
   原语：粒子系统 / 光影氛围
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  /* ══════════════════════════ 粒子系统 ══════════════════════════ */

  var PT_PARAMS = [
    P('kind', '粒子形态', 'burst', sel('burst', [
      ['burst', '中心爆炸'], ['confetti', '彩纸飘落'], ['starfield', '星域穿梭'], ['bubble', '气泡上升'],
      ['fireworks', '烟花绽放'], ['snow', '落雪'], ['rain', '雨丝'], ['sparkup', '火星上窜'],
      ['spiral', '螺旋粒子'], ['trail', '拖尾流光'], ['orbit', '环绕轨道'], ['ink', '墨迹扩散'],
      ['pollen', '花粉漂浮'], ['dust', '尘埃浮动'], ['firefly', '萤火虫'], ['vortex', '漩涡卷入'],
      ['galaxy', '星系漩涡'], ['comet', '彗星划过'], ['geyser', '喷泉涌出'], ['pulse', '脉冲扩散'],
      ['magnetic', '磁性吸附'], ['wind', '风线流动'], ['ripplep', '涟漪粒子'], ['bloom', '绽放']
    ])),
    P('count', '粒子数量', 110, rng(110, 12, 320, 2)),
    P('size', '粒子尺寸', 5, rng(5, 2, 40, 0.5)),
    P('speed', '速度', 1, rng(1, 0.2, 3, 0.05)),
    P('spread', '扩散幅度', 0.7, rng(0.7, 0.1, 1, 0.05)),
    P('glow', '辉光', 0.6, rng(0.6, 0, 1, 0.05))
  ];

  function particleDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var n = Math.max(4, Math.round(p.count));
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var baseSize = p.size * S;
    var spread = p.spread;
    var i, x, y, a, r;

    ctx.save();
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 18 * S * p.glow; }

    if (kind === 'burst') {
      var cycle = 2.6 / sp;
      var ct = t % cycle;
      var prog = e.outExpo(U.clamp(ct / (cycle * 0.62), 0, 1));
      for (i = 0; i < n; i++) {
        a = U.rng(i) * Math.PI * 2;
        var spd = 0.35 + U.rng(i + 91) * 0.95;
        r = prog * Math.min(W, H) * 0.62 * spread * spd;
        var dt = U.clamp(1 - ct / cycle, 0, 1);
        ctx.globalAlpha = dt;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, baseSize * (1 - prog * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
    }

    else if (kind === 'confetti') {
      for (i = 0; i < n; i++) {
        var cfx = U.rng(i) * W * 1.1 - W * 0.05;
        var cfy = ((t * sp * (0.16 + U.rng(i + 5) * 0.3) + U.rng(i + 10)) % 1.2 - 0.1) * H;
        ctx.save();
        ctx.translate(cfx + Math.sin(t * sp * 1.4 + i) * 34 * S, cfy);
        ctx.rotate(t * sp * (1 + U.rng(i + 30) * 2.2) + i);
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = i % 3 === 0 ? U.accent : (i % 3 === 1 ? U.accent2 : U.mix(U.ink, U.accent, 0.35));
        var cw2 = baseSize * (1.4 + U.rng(i + 41));
        ctx.fillRect(-cw2 / 2, -cw2 / 4, cw2, cw2 / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'starfield') {
      for (i = 0; i < n; i++) {
        var z = (i / n + t * sp * 0.16) % 1;
        var ang = U.rng(i) * Math.PI * 2;
        var rad = Math.pow(z, 2.1) * Math.min(W, H) * 0.78;
        var sz = baseSize * (0.3 + z * 2.4);
        ctx.globalAlpha = U.clamp(z * 1.6, 0, 1);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, sz, 0, Math.PI * 2);
        ctx.fillStyle = z > 0.7 ? U.ink : U.mix(U.accent, U.ink, z);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'bubble') {
      for (i = 0; i < n; i++) {
        var bh = (i % 7 + 1) / 7;
        var by = H * 1.1 - ((t * sp * (0.1 + bh * 0.18) + U.rng(i)) % 1.25) * H * 1.2;
        var bx = U.rng(i + 3) * W + Math.sin(t * sp * 1.3 + i) * 26 * S * bh;
        var br = baseSize * (0.5 + bh * 1.6);
        ctx.globalAlpha = 0.5 + 0.4 * bh;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(U.accent, 0.85);
        ctx.lineWidth = 1.6 * S;
        ctx.stroke();
        ctx.globalAlpha = 0.12 + 0.2 * bh;
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'fireworks') {
      var bursts = 4;
      for (var b = 0; b < bursts; b++) {
        var bcx = W * (0.16 + U.rng(b * 17) * 0.68);
        var bcy = H * (0.16 + U.rng(b * 23 + 5) * 0.42);
        var bt = (t * sp * 0.42 + b / bursts) % 1;
        if (bt > 0.82) continue;
        var bp = e.outExpo(U.clamp(bt / 0.7, 0, 1));
        var perB = Math.floor(n / bursts);
        for (i = 0; i < perB; i++) {
          a = U.rng(b * 137 + i) * Math.PI * 2;
          var rr = bp * Math.min(W, H) * 0.3 * spread * (0.5 + U.rng(i + b * 61) * 0.9);
          ctx.globalAlpha = U.clamp(1 - bt / 0.82, 0, 1);
          ctx.beginPath();
          ctx.arc(bcx + Math.cos(a) * rr, bcy + Math.sin(a) * rr + bp * bp * 90 * S, baseSize * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = b % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'snow') {
      for (i = 0; i < n; i++) {
        var sy = ((t * sp * (0.06 + U.rng(i + 2) * 0.14) + U.rng(i)) % 1.15) * H * 1.15 - H * 0.08;
        var sx = U.rng(i + 7) * W + Math.sin(t * sp * 0.9 + i * 0.9) * 40 * S;
        var sr = baseSize * (0.4 + U.rng(i + 19) * 1.2);
        ctx.globalAlpha = 0.35 + 0.6 * U.rng(i + 33);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = U.mix(U.ink, U.accent, 0.18);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'rain') {
      ctx.lineCap = 'round';
      for (i = 0; i < n; i++) {
        var ry = ((t * sp * (0.7 + U.rng(i) * 0.9) + U.rng(i + 4)) % 1.2) * H * 1.2 - H * 0.1;
        var rx = U.rng(i + 9) * W * 1.05 - W * 0.02;
        var rl = baseSize * (2.4 + U.rng(i + 12) * 4);
        ctx.globalAlpha = 0.3 + 0.5 * U.rng(i + 15);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - rl * 0.22, ry + rl);
        ctx.strokeStyle = U.rgba(U.accent, 0.85);
        ctx.lineWidth = 1.5 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'sparkup') {
      for (i = 0; i < n; i++) {
        var up = ((t * sp * (0.4 + U.rng(i) * 0.8) + U.rng(i + 6)) % 1.2);
        var spy = H * 1.02 - up * H * 1.1;
        var spx = W * 0.5 + (U.rng(i + 21) - 0.5) * W * 0.7 * spread + Math.sin(up * 7 + i) * 22 * S;
        var life = U.clamp(1 - up / 1.1, 0, 1);
        ctx.globalAlpha = life;
        ctx.beginPath();
        ctx.arc(spx, spy, baseSize * (0.5 + life * 1.1), 0, Math.PI * 2);
        ctx.fillStyle = U.mix('#FFC24B', U.accent, 0.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spiral') {
      for (i = 0; i < n; i++) {
        var sfr = i / n;
        var sang = sfr * Math.PI * 2 * 4.2 + t * sp * 1.1;
        var srad = Math.min(W, H) * 0.6 * spread * Math.pow(sfr, 0.7);
        ctx.globalAlpha = 0.35 + 0.65 * sfr;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sang) * srad, cy + Math.sin(sang) * srad, baseSize * (0.4 + sfr), 0, Math.PI * 2);
        ctx.fillStyle = i % 4 ? U.accent : U.accent2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'trail') {
      ctx.lineCap = 'round';
      for (var tr2 = 0; tr2 < 5; tr2++) {
        var tcx = W * (0.2 + U.rng(tr2 * 31) * 0.6);
        var tcy = H * (0.2 + U.rng(tr2 * 41 + 3) * 0.6);
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        var prevX = tcx, prevY = tcy;
        for (i = 0; i <= 60; i++) {
          var tf = i / 60;
          var ttx = tcx + Math.sin(t * sp * 1.6 + tr2 * 2 + tf * 5) * 130 * S * spread;
          var tty = tcy + Math.cos(t * sp * 1.4 + tr2 * 3 + tf * 4) * 130 * S * spread;
          if (i) { ctx.moveTo(prevX, prevY); ctx.lineTo(ttx, tty); }
          prevX = ttx; prevY = tty;
        }
        ctx.strokeStyle = U.rgba(tr2 % 2 ? U.accent : U.accent2, 0.55);
        ctx.lineWidth = 2 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < n / 3; i++) {
        var fx2 = W * 0.5 + Math.sin(t * sp * 1.2 + i * 0.6) * W * 0.36 * spread;
        var fy2 = H * 0.5 + Math.cos(t * sp * 1.05 + i * 0.75) * H * 0.34 * spread;
        ctx.beginPath();
        ctx.arc(fx2, fy2, baseSize * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = U.ink;
        ctx.fill();
      }
    }

    else if (kind === 'orbit') {
      var rings = 4;
      for (var rg2 = 0; rg2 < rings; rg2++) {
        var orr = Math.min(W, H) * (0.16 + rg2 * 0.1) * (0.6 + spread * 0.6);
        var speedO = 0.6 - rg2 * 0.1;
        var cnt = Math.max(3, Math.round(n / rings));
        for (i = 0; i < cnt; i++) {
          var oa = i / cnt * Math.PI * 2 + t * sp * speedO + rg2;
          ctx.globalAlpha = 0.85 - rg2 * 0.12;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(oa) * orr, cy + Math.sin(oa) * orr * 0.72, baseSize * (1 - rg2 * 0.1), 0, Math.PI * 2);
          ctx.fillStyle = (i + rg2) % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
        ctx.globalAlpha = 0.16;
        ctx.beginPath();
        ctx.ellipse(cx, cy, orr, orr * 0.72, 0, 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(U.ink, 0.5);
        ctx.lineWidth = 1.2 * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'ink') {
      for (i = 0; i < n; i++) {
        var ik = (t * sp * 0.2 + U.rng(i) * 0.5) % 1;
        var ikr = Math.pow(ik, 0.6) * Math.min(W, H) * 0.5 * spread * (0.4 + U.rng(i + 11) * 1.1);
        var ika = U.rng(i + 21) * Math.PI * 2;
        ctx.globalAlpha = (1 - ik) * 0.4;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ika) * ikr * 0.6, cy + Math.sin(ika) * ikr * 0.6, ikr * 0.5, 0, Math.PI * 2);
        var ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.5);
        ig.addColorStop(0, U.rgba(U.accent, 0.5));
        ig.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ig;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'pollen' || kind === 'dust' || kind === 'firefly') {
      var slow = kind === 'dust' ? 0.35 : (kind === 'firefly' ? 0.8 : 0.55);
      for (i = 0; i < n; i++) {
        var nx = U.rng(i) * W + Math.sin(t * sp * 0.35 * slow + i * 0.8) * 60 * S * spread;
        var ny = U.rng(i + 13) * H + Math.cos(t * sp * 0.3 * slow + i * 1.1) * 60 * S * spread;
        var flick = kind === 'firefly' ? (0.35 + 0.65 * Math.abs(Math.sin(t * sp * 2.2 + i * 1.7))) : (0.3 + 0.5 * U.rng(i + 8));
        ctx.globalAlpha = flick;
        var pr = baseSize * (kind === 'dust' ? 0.35 : 0.7) * (0.5 + U.rng(i + 3));
        ctx.beginPath();
        ctx.arc(nx, ny, pr, 0, Math.PI * 2);
        ctx.fillStyle = kind === 'firefly' ? U.mix('#FFF59A', U.accent, 0.35) : U.mix(U.ink, U.accent, 0.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'vortex' || kind === 'galaxy') {
      var arms = kind === 'galaxy' ? 3 : 1;
      for (i = 0; i < n; i++) {
        var vf = i / n;
        var vang = vf * Math.PI * 2 * 2.6 + t * sp * (0.9 - vf * 0.5) + Math.floor(U.rng(i) * arms) * (Math.PI * 2 / arms);
        var vrad = Math.min(W, H) * 0.66 * spread * Math.pow(vf, 0.62);
        ctx.globalAlpha = 0.25 + 0.7 * (1 - vf);
        var vr = baseSize * (0.35 + U.rng(i + 9) * 1.1) * (1 - vf * 0.4);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(vang) * vrad, cy + Math.sin(vang) * vrad * 0.8, vr, 0, Math.PI * 2);
        ctx.fillStyle = vf < 0.32 ? U.mix('#FFFFFF', U.accent, 0.5) : (i % 3 ? U.accent : U.accent2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.3;
      var cg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.24);
      cg2.addColorStop(0, U.rgba('#FFFFFF', 0.9));
      cg2.addColorStop(0.4, U.rgba(U.accent, 0.4));
      cg2.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = cg2;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    else if (kind === 'comet') {
      ctx.lineCap = 'round';
      var comets = Math.max(2, Math.round(n / 18));
      for (var ci2 = 0; ci2 < comets; ci2++) {
        var cprog = (t * sp * 0.3 + ci2 / comets) % 1;
        var cpx = -W * 0.2 + cprog * W * 1.4;
        var cpy = H * (0.15 + U.rng(ci2 * 13) * 0.55) + cprog * H * 0.28;
        var cgA = ctx.createLinearGradient(cpx, cpy, cpx - 320 * S * spread, cpy - 90 * S * spread);
        cgA.addColorStop(0, U.rgba('#FFFFFF', 0.95));
        cgA.addColorStop(0.25, U.rgba(U.accent, 0.7));
        cgA.addColorStop(1, U.rgba(U.accent, 0));
        ctx.strokeStyle = cgA;
        ctx.lineWidth = baseSize * 1.6;
        ctx.beginPath();
        ctx.moveTo(cpx, cpy);
        ctx.lineTo(cpx - 340 * S * spread, cpy - 96 * S * spread);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cpx, cpy, baseSize * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    else if (kind === 'geyser') {
      for (i = 0; i < n; i++) {
        var gph = ((t * sp * (0.5 + U.rng(i) * 0.7) + U.rng(i + 17)) % 1.15);
        var gpy = H * 0.86 - gph * H * 0.95;
        var gpxc = cx + (U.rng(i + 27) - 0.5) * 90 * S * spread;
        var grav = gph * gph * 200 * S;
        ctx.globalAlpha = U.clamp(1 - gph / 1.1, 0, 1);
        ctx.beginPath();
        ctx.arc(gpxc + Math.sin(gph * 6 + i) * 26 * S, gpy + grav, baseSize * (0.5 + (1 - gph)), 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'pulse') {
      for (i = 0; i < n; i++) {
        var pph = ((t * sp * 0.35 + i / n) % 1);
        var ppr = Math.pow(pph, 0.7) * Math.min(W, H) * 0.68 * spread;
        ctx.globalAlpha = (1 - pph) * 0.75;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(i * 2.399) * ppr * 0.42, cy + Math.sin(i * 2.399) * ppr * 0.42, baseSize * (1.5 - pph), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'magnetic') {
      for (i = 0; i < n; i++) {
        var mpph = (t * sp * 0.3 + U.rng(i) * 0.7) % 1;
        var mrad = Math.min(W, H) * 0.62 * spread * (1 - Math.pow(mpph, 1.7));
        var mang = U.rng(i + 5) * Math.PI * 2 + mpph * 3;
        ctx.globalAlpha = 0.25 + mpph * 0.7;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(mang) * mrad, cy + Math.sin(mang) * mrad, baseSize * (0.4 + mpph), 0, Math.PI * 2);
        ctx.fillStyle = mpph > 0.75 ? U.ink : U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'wind') {
      ctx.lineCap = 'round';
      for (i = 0; i < n; i++) {
        var wy2 = U.rng(i + 6) * H;
        var wxp = ((t * sp * (0.5 + U.rng(i) * 0.9) + U.rng(i + 16)) % 1.3 - 0.15) * W;
        var wlen = (60 + U.rng(i + 26) * 260) * S * spread;
        var wAl = 0.14 + 0.5 * U.rng(i + 36);
        ctx.globalAlpha = wAl;
        ctx.beginPath();
        ctx.moveTo(wxp, wy2);
        ctx.lineTo(wxp + wlen, wy2 + Math.sin(t * sp + i) * 8 * S);
        ctx.strokeStyle = i % 4 ? U.rgba(U.ink, 0.7) : U.rgba(U.accent, 0.85);
        ctx.lineWidth = (1 + U.rng(i + 46) * 2.6) * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'ripplep') {
      for (i = 0; i < n; i++) {
        var rpph = (t * sp * 0.28 + i / n) % 1;
        var rpr = Math.pow(rpph, 0.72) * Math.min(W, H) * 0.7 * spread;
        var rpa = i / n * Math.PI * 2;
        ctx.globalAlpha = (1 - rpph) * 0.85;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(rpa) * rpr, cy + Math.sin(rpa) * rpr, baseSize * (1.4 - rpph * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.ink;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'bloom') {
      var petals2 = 6;
      for (var pb = 0; pb < petals2; pb++) {
        var pba = pb / petals2 * Math.PI * 2 + t * sp * 0.24;
        var pbl = e.outElastic(U.clamp((t * sp % 3) / 1.8, 0, 1));
        for (i = 0; i < n / petals2; i++) {
          var pbf = i / (n / petals2);
          var pbr = pbl * Math.min(W, H) * 0.5 * spread * pbf;
          ctx.globalAlpha = 0.3 + 0.7 * (1 - pbf);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(pba) * pbr, cy + Math.sin(pba) * pbr, baseSize * (1 - pbf * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = pb % 2 ? U.accent : U.accent2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else {
      for (i = 0; i < n; i++) {
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(U.rng(i) * W, U.rng(i + 5) * H, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = U.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  MF.forge({
    cat: '粒子系统', type: 'block', dur: 6, poster: 0.45,
    params: PT_PARAMS, draw: particleDraw,
    ids: [
      { id: 'pt-burst', name: '中心爆炸', tags: ['爆炸', '冲击'], desc: '粒子自中心高速四散并淡出，冲击力强，适合揭晓与开场。', cfg: { kind: 'burst', count: 130 } },
      { id: 'pt-confetti', name: '彩纸飘落', tags: ['彩纸', '庆祝'], desc: '彩纸旋转飘落，庆祝氛围直接，适合成交与达成类画面。', cfg: { kind: 'confetti', count: 120 } },
      { id: 'pt-starfield', name: '星域穿梭', tags: ['星空', '穿梭'], desc: '星点自中心向外加速飞过，制造高速穿越的错觉。', cfg: { kind: 'starfield', count: 150 } },
      { id: 'pt-bubble', name: '气泡上升', tags: ['气泡', '轻盈'], desc: '透明气泡缓缓上升并晃动，轻盈通透。', cfg: { kind: 'bubble', count: 46, size: 9 } },
      { id: 'pt-fireworks', name: '烟花绽放', tags: ['烟花', '节庆'], desc: '多点烟花依次绽放与消散，节日气氛浓厚。', cfg: { kind: 'fireworks', count: 160 } },
      { id: 'pt-snow', name: '落雪', tags: ['雪', '冬季'], desc: '雪花缓慢飘落并左右摇摆，冬季与节日主题首选。', cfg: { kind: 'snow', count: 130 } },
      { id: 'pt-rain', name: '雨丝', tags: ['雨', '氛围'], desc: '斜向雨丝持续落下，情绪沉稳，适合叙事与抒情画面。', cfg: { kind: 'rain', count: 140, size: 2 } },
      { id: 'pt-sparkup', name: '火星上窜', tags: ['火星', '上升'], desc: '火星自底部向上窜动并消散，像篝火与热浪。', cfg: { kind: 'sparkup', count: 110 } },
      { id: 'pt-spiral', name: '螺旋粒子', tags: ['螺旋', '旋转'], desc: '粒子沿螺旋线排布旋转，结构感与动感一体。', cfg: { kind: 'spiral', count: 120 } },
      { id: 'pt-trail', name: '拖尾流光', tags: ['拖尾', '流光'], desc: '光点沿复杂曲线运动并留下拖尾轨迹，像数据流。', cfg: { kind: 'trail', count: 90 } },
      { id: 'pt-orbit', name: '环绕轨道', tags: ['轨道', '系统'], desc: '多层轨道上的粒子环绕运动，像原子与星系系统。', cfg: { kind: 'orbit', count: 100 } },
      { id: 'pt-ink', name: '墨迹扩散', tags: ['墨', '扩散'], desc: '墨色在水中的扩散质感，柔和且艺术。', cfg: { kind: 'ink', count: 60 } },
      { id: 'pt-pollen', name: '花粉漂浮', tags: ['漂浮', '柔和'], desc: '光点在空中缓慢漂浮，空气感强，适合美妆与生活方式。', cfg: { kind: 'pollen', count: 100, size: 6 } },
      { id: 'pt-dust', name: '尘埃浮动', tags: ['尘埃', '细腻'], desc: '光束中细微尘埃的浮动，安静且有质感。', cfg: { kind: 'dust', count: 160, size: 3 } },
      { id: 'pt-firefly', name: '萤火虫', tags: ['萤火', '夜晚'], desc: '萤火虫闪烁漂浮，夜间的梦幻氛围。', cfg: { kind: 'firefly', count: 70, size: 7 } },
      { id: 'pt-vortex', name: '漩涡卷入', tags: ['漩涡', '吸引'], desc: '粒子被中心漩涡卷入并被吞没，有强烈的吸引力。', cfg: { kind: 'vortex', count: 150 } },
      { id: 'pt-galaxy', name: '星系漩涡', tags: ['星系', '宏大'], desc: '多旋臂星系结构缓慢旋转，宏大且有宇宙感。', cfg: { kind: 'galaxy', count: 200 } },
      { id: 'pt-comet', name: '彗星划过', tags: ['彗星', '轨迹'], desc: '多颗彗星带长尾划过画面，速度与优雅并存。', cfg: { kind: 'comet', count: 72 } },
      { id: 'pt-geyser', name: '喷泉涌出', tags: ['喷泉', '动能'], desc: '粒子自底部喷出后受重力回落，物理感强。', cfg: { kind: 'geyser', count: 130, size: 17.5} },
      { id: 'pt-pulse', name: '脉冲扩散', tags: ['脉冲', '节奏'], desc: '粒子以脉冲方式一波波向外扩散。', cfg: { kind: 'pulse', count: 120, size: 17.5} },
      { id: 'pt-magnetic', name: '磁性吸附', tags: ['磁性', '收拢'], desc: '粒子自外被磁力吸附到中心，收拢感强烈。', cfg: { kind: 'magnetic', count: 130 } },
      { id: 'pt-wind', name: '风线流动', tags: ['风', '速度'], desc: '水平风线快速掠过，营造速度与流动感。', cfg: { kind: 'wind', count: 110 } },
      { id: 'pt-ripplep', name: '涟漪粒子', tags: ['涟漪', '同心'], desc: '粒子以同心方式向外扩散，规律而柔和。', cfg: { kind: 'ripplep', count: 110 } },
      { id: 'pt-bloom', name: '绽放', tags: ['绽放', '生机'], desc: '粒子沿六片花瓣方向绽放，有生命感。', cfg: { kind: 'bloom', count: 140 } }
    ]
  });

  /* ══════════════════════════ 光影氛围 ══════════════════════════ */

  var LIGHT_PARAMS = [
    P('kind', '光效形态', 'glow-pulse', sel('glow-pulse', [
      ['glow-pulse', '光晕脉冲'], ['lens-flare', '镜头光斑'], ['neon-line', '霓虹线'], ['sweep', '扫光推移'],
      ['spotlight', '聚光灯'], ['laser', '激光线'], ['aurora', '极光'], ['prism', '棱镜色散'],
      ['god-rays', '体积光'], ['lightning', '闪电'], ['plasma', '等离子'], ['hologram', '全息扫描'],
      ['starburst', '星光爆点'], ['bokeh', '散景光斑'], ['mesh', '渐变网格'], ['caustics', '焦散波纹'],
      ['tunnel', '光隧道'], ['haze', '光雾'], ['rings', '光环叠加'], ['rainbow', '彩虹光带']
    ])),
    P('size', '尺寸', 340, rng(340, 80, 700, 4)),
    P('count', '数量', 9, rng(9, 2, 40, 1)),
    P('speed', '速度', 1, rng(1, 0.15, 3, 0.05)),
    P('intensity', '强度', 0.75, rng(0.75, 0.1, 1, 0.05)),
    P('glow', '辉光', 0.7, rng(0.7, 0, 1, 0.05))
  ];

  function lightDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var k = e.outCubic(U.clamp(t / 1.4, 0, 1));
    var kind = p.kind;
    var sp = Math.max(0.1, p.speed);
    var base = p.size * S * k;
    var intensity = p.intensity;
    var i, a, x, y;

    ctx.save();

    if (kind === 'glow-pulse') {
      for (i = 0; i < 5; i++) {
        var ph = (t * sp * 0.35 + i / 5) % 1;
        var rr = base * (0.35 + ph * 1.1);
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, U.rgba(U.accent, 0.5 * intensity * (1 - ph)));
        g.addColorStop(0.5, U.rgba(U.accent2, 0.22 * intensity * (1 - ph)));
        g.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'lens-flare') {
      var fx = cx + Math.sin(t * sp * 0.6) * W * 0.16;
      var fy = cy + Math.cos(t * sp * 0.5) * H * 0.14;
      var fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, base * 0.6);
      fg.addColorStop(0, U.rgba('#FFFFFF', 0.95 * intensity));
      fg.addColorStop(0.18, U.rgba(U.accent, 0.6 * intensity));
      fg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, W, H);
      for (i = 1; i <= Math.max(3, Math.round(p.count / 2)); i++) {
        var fx2 = W - (fx - W * 0.5) * (i * 0.5) - W * 0.5;
        var fr = base * (0.06 + i * 0.045);
        var fg2 = ctx.createRadialGradient(fx2, fy, 0, fx2, fy, fr);
        fg2.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.4 * intensity));
        fg2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = fg2;
        ctx.beginPath(); ctx.arc(fx2, fy, fr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 0.5 * intensity;
      ctx.strokeStyle = U.rgba(U.accent2, 0.7);
      ctx.lineWidth = 2 * S;
      ctx.beginPath();
      ctx.moveTo(fx - base * 1.5, fy); ctx.lineTo(fx + base * 1.5, fy);
      ctx.moveTo(fx, fy - base * 0.5); ctx.lineTo(fx, fy + base * 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'neon-line') {
      ctx.lineCap = 'round';
      var nLines = Math.max(2, Math.round(p.count));
      for (i = 0; i < nLines; i++) {
        var ly = H * (i + 1) / (nLines + 1);
        var startX = Math.sin(t * sp * 0.8 + i) * 40 * S;
        ctx.globalAlpha = 0.9 * intensity;
        for (var pass = 0; pass < 3; pass++) {
          ctx.strokeStyle = U.rgba(i % 2 ? U.accent : U.accent2, [0.28, 0.5, 1][pass] * intensity);
          ctx.lineWidth = [10, 5, 2][pass] * S;
          ctx.beginPath();
          for (x = startX; x <= W - startX; x += 12) {
            var yy = ly + Math.sin(x * 0.008 + t * sp * 2 + i) * 26 * S;
            if (x === startX) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'sweep') {
      var sw = base * 0.9;
      var sx = -sw + (W + sw * 2) * ((t * sp * 0.5) % 1.35);
      var sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
      sg.addColorStop(0, U.rgba(U.accent, 0));
      sg.addColorStop(0.42, U.rgba(U.accent, 0.42 * intensity));
      sg.addColorStop(0.5, U.rgba('#FFFFFF', 0.68 * intensity));
      sg.addColorStop(0.58, U.rgba(U.accent2, 0.42 * intensity));
      sg.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.85 * intensity;
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = U.rgba('#FFFFFF', 0.8);
      ctx.beginPath();
      ctx.moveTo(sx, -20); ctx.lineTo(sx, H + 20);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spotlight') {
      var sxa = cx + Math.sin(t * sp * 0.7) * W * 0.26;
      var sya = cy + Math.cos(t * sp * 0.55) * H * 0.16;
      var rTop = base * 0.12, rBot = base * 0.85;
      var lg = ctx.createLinearGradient(sxa, -H * 0.2, sxa, H);
      lg.addColorStop(0, U.rgba(U.accent, 0.4 * intensity));
      lg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(sxa - rTop, -H * 0.2);
      ctx.lineTo(sxa + rTop, -H * 0.2);
      ctx.lineTo(sxa + rBot, H);
      ctx.lineTo(sxa - rBot, H);
      ctx.closePath();
      ctx.fill();
      var sp2 = ctx.createRadialGradient(sxa, sya, 0, sxa, sya, base * 0.9);
      sp2.addColorStop(0, U.rgba(U.accent, 0.35 * intensity));
      sp2.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = sp2;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'laser') {
      ctx.lineCap = 'round';
      for (i = 0; i < Math.max(2, Math.round(p.count)); i++) {
        var lang = t * sp * 0.5 + i * Math.PI * 2 / Math.max(2, p.count);
        var lx = cx + Math.cos(lang) * W;
        var ly2 = cy + Math.sin(lang) * H;
        ctx.globalAlpha = 0.85 * intensity;
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent : U.accent2, 0.9);
        ctx.shadowColor = U.rgba(i % 2 ? U.accent : U.accent2, 0.9);
        ctx.shadowBlur = 26 * S * p.glow;
        ctx.lineWidth = 2.6 * S;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(lx, ly2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      var cg3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.4);
      cg3.addColorStop(0, U.rgba('#FFFFFF', 0.9));
      cg3.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = cg3;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'aurora') {
      for (i = 0; i < 4; i++) {
        var ag = ctx.createLinearGradient(0, 0, W, H * 0.6);
        var off = Math.sin(t * sp * 0.5 + i * 1.6) * 0.18;
        ag.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0));
        ag.addColorStop(U.clamp(0.3 + off, 0.05, 0.9), U.rgba(i % 2 ? U.accent : U.accent2, 0.3 * intensity));
        ag.addColorStop(U.clamp(0.62 + off, 0.1, 0.95), U.rgba(i % 2 ? U.accent2 : U.accent, 0.24 * intensity));
        ag.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.moveTo(0, H * 0.1 + i * 12 * S);
        for (x = 0; x <= W; x += 20) {
          ctx.lineTo(x, H * (0.16 + i * 0.13) + Math.sin(x * 0.005 + t * sp * 1.1 + i) * 60 * S * k
            + Math.sin(x * 0.013 - t * sp * 0.7) * 30 * S * k);
        }
        ctx.lineTo(W, H * 0.75);
        ctx.lineTo(0, H * 0.75);
        ctx.closePath();
        ctx.fill();
      }
    }

    else if (kind === 'prism') {
      for (i = 0; i < Math.max(3, Math.round(p.count)); i++) {
        var pang = t * sp * 0.4 + i * Math.PI * 2 / Math.max(3, p.count);
        var pcol = 'hsl(' + (i * 360 / Math.max(3, p.count)).toFixed(0) + ',90%,62%)';
        ctx.globalAlpha = 0.34 * intensity;
        ctx.fillStyle = pcol;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(pang) * W, cy + Math.sin(pang) * H);
        ctx.lineTo(cx + Math.cos(pang + 0.24) * W, cy + Math.sin(pang + 0.24) * H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 1;
      var pg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.5);
      pg2.addColorStop(0, U.rgba('#FFFFFF', 0.7 * intensity));
      pg2.addColorStop(1, U.rgba('#FFFFFF', 0));
      ctx.fillStyle = pg2;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'god-rays') {
      var rays = Math.max(6, Math.round(p.count * 1.4));
      for (i = 0; i < rays; i++) {
        var ra = i / rays * Math.PI * 2 + t * sp * 0.06;
        var rw = 0.022 + 0.05 * Math.abs(Math.sin(i * 1.7 + t * sp * 0.5));
        var rgd = ctx.createRadialGradient(cx, cy - H * 0.24, 0, cx, cy - H * 0.24, Math.max(W, H) * 1.05);
        rgd.addColorStop(0, U.rgba(U.accent, 0.34 * intensity));
        rgd.addColorStop(0.35, U.rgba(U.accent, 0.14 * intensity));
        rgd.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = rgd;
        ctx.beginPath();
        ctx.moveTo(cx, cy - H * 0.24);
        ctx.lineTo(cx + Math.cos(ra - rw) * Math.max(W, H) * 1.2, cy - H * 0.24 + Math.sin(ra - rw) * Math.max(W, H) * 1.2);
        ctx.lineTo(cx + Math.cos(ra + rw) * Math.max(W, H) * 1.2, cy - H * 0.24 + Math.sin(ra + rw) * Math.max(W, H) * 1.2);
        ctx.closePath();
        ctx.fill();
      }
    }

    else if (kind === 'lightning') {
      ctx.lineCap = 'round';
      for (var lb = 0; lb < Math.max(2, Math.round(p.count / 3)); lb++) {
        var ly3 = -20;
        var lx3 = W * (0.15 + U.rng(lb * 13) * 0.7);
        ctx.beginPath();
        ctx.moveTo(lx3, ly3);
        for (i = 0; i < 14; i++) {
          ly3 += H / 13;
          lx3 += (U.rng(lb * 97 + i * 7 + Math.floor(t * sp * 8) * 3) - 0.5) * 140 * S;
          ctx.lineTo(lx3, ly3);
        }
        ctx.globalAlpha = (0.35 + 0.6 * U.rng(lb * 31 + Math.floor(t * sp * 6))) * intensity;
        ctx.strokeStyle = U.rgba('#DDF3FF', 0.95);
        ctx.shadowColor = U.rgba(U.accent2, 0.95);
        ctx.shadowBlur = 34 * S * p.glow;
        ctx.lineWidth = 2.8 * S;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    else if (kind === 'plasma') {
      for (i = 0; i < 26; i++) {
        var plx = cx + Math.sin(t * sp * 0.7 + i * 0.9) * base * 0.9;
        var ply = cy + Math.cos(t * sp * 0.6 + i * 1.3) * base * 0.72;
        var plr = base * (0.08 + 0.16 * Math.abs(Math.sin(t * sp + i)));
        var plg = ctx.createRadialGradient(plx, ply, 0, plx, ply, plr);
        plg.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0.7 * intensity));
        plg.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = plg;
        ctx.beginPath(); ctx.arc(plx, ply, plr, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'hologram') {
      for (i = 0; i < 60; i++) {
        var hly = (i / 60) * H;
        var hlv = 0.5 + 0.5 * Math.sin(hly * 0.06 - t * sp * 3);
        ctx.globalAlpha = (0.06 + 0.22 * hlv) * intensity;
        ctx.fillStyle = U.accent;
        ctx.fillRect(0, hly, W, H / 60 * 0.9);
      }
      ctx.globalAlpha = 1;
      var hb = (t * sp * 0.35) % 1 * H * 1.2 - H * 0.1;
      var hg = ctx.createLinearGradient(0, hb - 70 * S, 0, hb + 70 * S);
      hg.addColorStop(0, U.rgba(U.accent2, 0));
      hg.addColorStop(0.5, U.rgba(U.accent2, 0.42 * intensity));
      hg.addColorStop(1, U.rgba(U.accent2, 0));
      ctx.fillStyle = hg;
      ctx.fillRect(0, hb - 70 * S, W, 140 * S);
    }

    else if (kind === 'starburst') {
      var sbx = cx, sby = cy;
      var pulses = 0.6 + 0.4 * Math.sin(t * sp * 2.4);
      for (i = 0; i < 4; i++) {
        ctx.globalAlpha = [0.34, 0.5, 0.75, 1][i] * intensity * pulses;
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.85);
        ctx.lineWidth = [10, 6, 3, 1.6][i] * S * k;
        ctx.beginPath();
        ctx.moveTo(sbx - base * 1.6, sby); ctx.lineTo(sbx + base * 1.6, sby);
        ctx.moveTo(sbx, sby - base * 1.6); ctx.lineTo(sbx, sby + base * 1.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      var stg = ctx.createRadialGradient(sbx, sby, 0, sbx, sby, base * 0.7);
      stg.addColorStop(0, U.rgba('#FFFFFF', 0.9 * intensity));
      stg.addColorStop(0.3, U.rgba(U.accent, 0.4 * intensity));
      stg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = stg;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'bokeh') {
      var bn = Math.max(6, Math.round(p.count * 2));
      for (i = 0; i < bn; i++) {
        var brx = U.rng(i) * W + Math.sin(t * sp * 0.3 + i) * 30 * S;
        var bry = U.rng(i + 7) * H + Math.cos(t * sp * 0.24 + i) * 30 * S;
        var brr = base * (0.06 + U.rng(i + 13) * 0.22);
        var bg = ctx.createRadialGradient(brx, bry, 0, brx, bry, brr);
        bg.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.32 * intensity));
        bg.addColorStop(0.72, U.rgba(i % 2 ? U.accent2 : U.accent, 0.22 * intensity));
        bg.addColorStop(0.82, U.rgba('#FFFFFF', 0.1 * intensity));
        bg.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(brx, bry, brr, 0, Math.PI * 2); ctx.fill();
      }
    }

    else if (kind === 'mesh') {
      for (i = 0; i < 5; i++) {
        var mxp = cx + Math.sin(t * sp * 0.4 + i * 2.2) * W * 0.32;
        var myp = cy + Math.cos(t * sp * 0.34 + i * 1.7) * H * 0.28;
        var mg = ctx.createRadialGradient(mxp, myp, 0, mxp, myp, base * 0.95);
        mg.addColorStop(0, U.rgba(i % 2 ? U.accent : U.accent2, 0.4 * intensity));
        mg.addColorStop(1, U.rgba(i % 2 ? U.accent : U.accent2, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'caustics') {
      ctx.globalCompositeOperation = 'screen';
      for (i = 0; i < 3; i++) {
        ctx.strokeStyle = U.rgba(U.accent, 0.16 * intensity);
        ctx.lineWidth = 12 * S;
        for (var cyc = 0; cyc < 14; cyc++) {
          ctx.beginPath();
          for (x = 0; x <= W; x += 14) {
            var cyv = cy + Math.sin(x * 0.007 + cyc * 0.5 + t * sp * (1 + i * 0.4)) * 90 * S * k
              + Math.sin(x * 0.019 - t * sp * 1.6) * 40 * S * k;
            if (x === 0) ctx.moveTo(x, cyv + cyc * 60 * S - 380 * S); else ctx.lineTo(x, cyv + cyc * 60 * S - 380 * S);
          }
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    else if (kind === 'tunnel') {
      var rings2 = Math.max(6, Math.round(p.count * 1.6));
      for (i = 0; i < rings2; i++) {
        var tph = (i / rings2 + t * sp * 0.24) % 1;
        var trr = Math.pow(tph, 1.8) * Math.min(W, H) * 0.95;
        ctx.globalAlpha = U.clamp(tph * 2.2, 0, 1) * (1 - tph * 0.4) * intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, trr, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = (1.4 + tph * 8) * S;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      var tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.2);
      tg.addColorStop(0, U.rgba('#FFFFFF', 0.85 * intensity));
      tg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = tg;
      ctx.fillRect(0, 0, W, H);
    }

    else if (kind === 'haze') {
      for (i = 0; i < 4; i++) {
        var hx = cx + Math.sin(t * sp * 0.24 + i * 1.9) * W * 0.3;
        var hy = cy + Math.cos(t * sp * 0.2 + i * 2.4) * H * 0.26;
        var hg2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, base * 1.15);
        hg2.addColorStop(0, U.rgba(i % 2 ? U.accent2 : U.accent, 0.26 * intensity));
        hg2.addColorStop(1, U.rgba(U.accent, 0));
        ctx.fillStyle = hg2;
        ctx.fillRect(0, 0, W, H);
      }
    }

    else if (kind === 'rings') {
      for (i = 0; i < Math.max(3, Math.round(p.count)); i++) {
        var rph2 = (t * sp * 0.3 + i / Math.max(3, p.count)) % 1;
        var rrad = base * 1.2 * Math.pow(rph2, 0.72);
        ctx.globalAlpha = (1 - rph2) * 0.8 * intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, rrad, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.shadowColor = U.rgba(i % 2 ? U.accent : U.accent2, p.glow);
        ctx.shadowBlur = 20 * S * p.glow;
        ctx.lineWidth = (2 + (1 - rph2) * 8) * S;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    else if (kind === 'rainbow') {
      var bands = Math.max(3, Math.round(p.count));
      for (i = 0; i < bands; i++) {
        ctx.globalAlpha = 0.24 * intensity;
        ctx.fillStyle = 'hsl(' + (i * 360 / bands).toFixed(0) + ',92%,60%)';
        ctx.beginPath();
        ctx.moveTo(0, H * (0.2 + i * 0.5 / bands) + Math.sin(t * sp * 0.6) * 40 * S * k);
        for (x = 0; x <= W; x += 24) {
          ctx.lineTo(x, H * (0.2 + i * 0.5 / bands) + Math.sin(x * 0.006 + t * sp + i * 0.6) * 50 * S * k);
        }
        ctx.lineTo(W, H * (0.3 + i * 0.5 / bands) + 60 * S);
        ctx.lineTo(0, H * (0.3 + i * 0.5 / bands) + 60 * S);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else {
      var dg = ctx.createRadialGradient(cx, cy, 0, cx, cy, base);
      dg.addColorStop(0, U.rgba(U.accent, 0.4 * intensity));
      dg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = dg;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }

  MF.forge({
    cat: '光影氛围', type: 'block', dur: 6, poster: 0.62,
    params: LIGHT_PARAMS, draw: lightDraw,
    ids: [
      { id: 'lt-glow-pulse', name: '光晕脉冲', tags: ['光晕', '呼吸'], desc: '柔光以呼吸节奏向外扩散，适合做氛围底光。', cfg: { kind: 'glow-pulse' } },
      { id: 'lt-lens-flare', name: '镜头光斑', tags: ['光斑', '镜头'], desc: '真实镜头光斑沿画面游走并带十字星芒，电影感强。', cfg: { kind: 'lens-flare' } },
      { id: 'lt-neon-line', name: '霓虹线', tags: ['霓虹', '线条'], desc: '多条霓虹灯管线条波动，科技与夜店氛围兼具。', cfg: { kind: 'neon-line' } },
      { id: 'lt-sweep', name: '扫光推移', tags: ['扫光', '高级'], desc: '一道宽光带横扫而过，是最常用的高级质感动效。', cfg: { kind: 'sweep' } },
      { id: 'lt-spotlight', name: '聚光灯', tags: ['聚光', '舞台'], desc: '顶部投下的聚光灯缓慢扫过，舞台与发布会标配。', cfg: { kind: 'spotlight' } },
      { id: 'lt-laser', name: '激光线', tags: ['激光', '放射'], desc: '激光自中心旋转放射，赛博与科幻感强烈。', cfg: { kind: 'laser' } },
      { id: 'lt-aurora', name: '极光', tags: ['极光', '梦幻'], desc: '多层极光带缓慢流动，梦幻且极具氛围。', cfg: { kind: 'aurora' } },
      { id: 'lt-prism', name: '棱镜色散', tags: ['棱镜', '色彩'], desc: '光线经棱镜色散成彩色光扇，色彩表现力强。', cfg: { kind: 'prism' } },
      { id: 'lt-god-rays', name: '体积光', tags: ['体积光', '自然'], desc: '自上方倾泻的体积光束，自然光感强，适合晨光场景。', cfg: { kind: 'god-rays' } },
      { id: 'lt-lightning', name: '闪电', tags: ['闪电', '冲击'], desc: '随机折线闪电击中画面，配合辉光，冲击力极强。', cfg: { kind: 'lightning' } },
      { id: 'lt-plasma', name: '等离子', tags: ['等离子', '能量'], desc: '等离子光团在画面中游走融合，能量感强。', cfg: { kind: 'plasma' } },
      { id: 'lt-hologram', name: '全息扫描', tags: ['全息', '科技'], desc: '横向扫描线与扫描光带叠加，全息投影质感。', cfg: { kind: 'hologram' } },
      { id: 'lt-starburst', name: '星光爆点', tags: ['星光', '闪耀'], desc: '十字星芒脉冲爆闪，是强调与惊喜瞬间的利器。', cfg: { kind: 'starburst' } },
      { id: 'lt-bokeh', name: '散景光斑', tags: ['散景', '柔美'], desc: '大光圈散景光斑漂浮，柔美且有摄影质感。', cfg: { kind: 'bokeh' } },
      { id: 'lt-mesh', name: '渐变网格', tags: ['网格', '色彩'], desc: '多个彩色光团融合成渐变网格，现代设计感强。', cfg: { kind: 'mesh' } },
      { id: 'lt-caustics', name: '焦散波纹', tags: ['焦散', '水感'], desc: '水面焦散般的光纹波动，通透且有水感。', cfg: { kind: 'caustics' } },
      { id: 'lt-tunnel', name: '光隧道', tags: ['隧道', '穿越'], desc: '多层光环由远及近穿过，穿越感强烈。', cfg: { kind: 'tunnel' } },
      { id: 'lt-haze', name: '光雾', tags: ['光雾', '氛围'], desc: '流动的光雾铺满画面，适合做柔和的氛围底。', cfg: { kind: 'haze' } },
      { id: 'lt-rings', name: '光环叠加', tags: ['光环', '扩散'], desc: '多层光环依次向外扩散，规律且华丽。', cfg: { kind: 'rings' } },
      { id: 'lt-rainbow', name: '彩虹光带', tags: ['彩虹', '色彩'], desc: '彩色光带波动流动，色彩丰富，适合活泼内容。', cfg: { kind: 'rainbow' } }
    ]
  });
})();
