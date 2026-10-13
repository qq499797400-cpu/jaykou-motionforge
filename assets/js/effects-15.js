/* ==========================================================================
   Jaykou 动效库 · 15
   原语：终端代码（打字机 / 代码雨 / 日志） / 社交叙事（点赞 / 评论 / 关注）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt, col = MF.col;

  /* ══════════════════════════ 原语一：终端代码 ══════════════════════════ */

  var TERM_PARAMS = [
    P('kind', '形态', 'type', sel('type', [
      ['type', '命令打字'], ['output', '命令与输出'], ['progress', '终端进度条'],
      ['matrix', '代码雨'], ['log', '日志滚动'], ['boot', '开机自检'],
      ['cursor', '光标呼吸'], ['split', '分屏输出'], ['success', '成功收尾'],
      ['error', '报错抖动'], ['install', '依赖安装'], ['ascii', '字符横幅']
    ])),
    P('cmd', '命令', 'npm run dev', txt('npm run dev')),
    P('lines', '输出内容', '✓ compiled successfully\nready in 412 ms\nlistening on :3000', txt('✓ compiled successfully\nready in 412 ms\nlistening on :3000', true)),
    P('size', '字号', 158, rng(158, 18.0, 221, 1.0)),
    P('speed', '打字速度', 1, rng(1, 0.4, 2.5, 0.05)),
    P('ink2', '终端主色', '#7CFF9B', col('#7CFF9B')),
    P('glow', '辉光', 0.35, rng(0.35, 0, 1, 0.05))
  ];

  function termDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var sp = Math.max(0.2, p.speed);
    var fs = p.size * S;
    var mono = U.mono;
    var green = p.ink2;
    var lines = String(p.lines || '').split('\n');
    var kind = p.kind;
    var pad = fs * 1.1;
    ctx.save();
    ctx.textBaseline = 'middle';

    function bar(x, y, w, h, k, c1, c2) {
      U.rr(ctx, x, y, w, h, h / 2);
      ctx.fillStyle = c2; ctx.fill();
      if (k > 0.01) {
        U.rr(ctx, x, y, Math.max(h, w * k), h, h / 2);
        ctx.fillStyle = c1; ctx.fill();
      }
    }

    if (kind === 'matrix') {
      var cols = Math.floor(W / (fs * 0.85));
      ctx.font = U.fs(fs * 0.8, 600, true);
      for (var c = 0; c < cols; c++) {
        var speedC = 0.5 + U.rnd(0.2, 1.3, c) * sp;
        var yBase = ((t * speedC * 240 * S) % (H + fs * 8)) - fs * 4;
        var trail = Math.floor(6 + U.rnd(0, 9, c + 40));
        for (var r2 = 0; r2 < trail; r2++) {
          var yy = yBase - r2 * fs * 0.95;
          if (yy < -fs || yy > H + fs) continue;
          var a = (1 - r2 / trail) * 0.9;
          var ch = String.fromCharCode(0x30A0 + Math.floor(U.rng(c * 97 + r2) * 96));
          ctx.fillStyle = U.rgba(r2 === 0 ? '#FFFFFF' : green, r2 === 0 ? 0.95 : a * 0.85);
          ctx.fillText(ch, c * fs * 0.85 + fs * 0.2, yy);
        }
      }
    } else if (kind === 'type' || kind === 'cursor') {
      var chars = kind === 'cursor' ? '' : String(p.cmd || '');
      var n = Math.floor(chars.length * e.linear(U.clamp(t * sp / 1.8, 0, 1)));
      var shown = chars.slice(0, n);
      var caretOn = kind === 'cursor' ? (Math.sin(t * 5) > -0.2) : (Math.sin(t * 9) > 0 || n < chars.length);
      var y0 = H / 2;
      if (kind === 'type') {
        ctx.font = U.fs(fs * 0.5, 600, true);
        ctx.fillStyle = U.rgba(U.ink, 0.55);
        ctx.fillText('~ $', pad, y0 - fs * 0.85);
      }
      ctx.font = U.fs(fs, 600, true);
      if (p.glow > 0.03) { ctx.shadowColor = U.rgba(green, 0.8 * p.glow); ctx.shadowBlur = 20 * S * p.glow; }
      ctx.fillStyle = U.rgba(green, 1);
      ctx.textAlign = 'left';
      ctx.fillText(shown, pad * 2.6, y0);
      var cw = ctx.measureText(shown).width;
      if (caretOn) {
        ctx.fillRect(pad * 2.6 + cw + fs * 0.12, y0 - fs * 0.55, fs * 0.55, fs * 1.1);
      }
    } else if (kind === 'output' || kind === 'success' || kind === 'error') {
      var cmd2 = String(p.cmd || '');
      var tn = Math.floor(cmd2.length * e.linear(U.clamp(t * sp / 1.5, 0, 1)));
      ctx.font = U.fs(fs * 0.62, 600, true);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(U.ink, 0.92);
      ctx.fillText('$ ' + cmd2.slice(0, tn) + (tn < cmd2.length ? '▌' : ''), pad, H * 0.24);
      var isErr = kind === 'error';
      var shake = isErr && t > 1.6 ? Math.sin((t - 1.6) * 55) * Math.exp(-(t - 1.6) * 5) * 8 * S : 0;
      ctx.save();
      ctx.translate(shake, 0);
      for (var li = 0; li < lines.length; li++) {
        var at = 1.7 + li * 0.55;
        var lk = e.outCubic(U.clamp((t * sp - at) / 0.4, 0, 1));
        if (lk <= 0.01) continue;
        var ly = H * 0.24 + fs * 1.5 + li * fs * 1.25;
        ctx.globalAlpha = lk;
        var colLine = isErr && li === lines.length - 1 ? '#FF5A5A' : green;
        if (p.glow > 0.03) { ctx.shadowColor = U.rgba(colLine, 0.7 * p.glow); ctx.shadowBlur = 14 * S * p.glow; }
        ctx.fillStyle = U.rgba(colLine, 1);
        ctx.fillText(String(lines[li]).slice(0, Math.ceil(String(lines[li]).length * lk)), pad, ly);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      if (kind === 'success' && t * sp > 1.7 + lines.length * 0.55) {
        var ok = e.outBack(U.clamp((t * sp - 1.7 - lines.length * 0.55) / 0.5, 0, 1));
        ctx.globalAlpha = ok;
        ctx.fillStyle = U.rgba(green, 0.9);
        ctx.fillText('✔ done in ' + (t).toFixed(1) + 's', pad, H * 0.24 + fs * 1.5 + lines.length * fs * 1.25 + fs * 0.4);
      }
      ctx.restore();
    } else if (kind === 'progress') {
      var pk = e.inOutCubic(U.clamp((t * sp - 0.4) / 2.2, 0, 1));
      var label = 'downloading ' + (p.cmd || 'package.tar.gz');
      ctx.font = U.fs(fs * 0.5, 600, true);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, pad, H * 0.4);
      bar(pad, H * 0.4 + fs * 0.7, W - pad * 2, fs * 0.7, pk, U.rgba(green, 1), U.rgba(green, 0.15));
      ctx.fillStyle = U.rgba(green, 0.95);
      ctx.fillText(Math.round(pk * 100) + '%', W - pad - fs * 1.6, H * 0.4 + fs * 0.7 + fs * 1.4);
    } else if (kind === 'install') {
      var pk2 = e.linear(U.clamp((t * sp - 0.3) / 2.6, 0, 1));
      var total = 42;
      var done = Math.round(total * pk2);
      ctx.font = U.fs(fs * 0.5, 600, true);
      ctx.textAlign = 'left';
      for (var pi = 0; pi < Math.min(lines.length || 6, 6); pi++) {
        var st = pi < done / Math.ceil(total / 6) ? '✓' : (pi === Math.floor(done / Math.ceil(total / 6)) ? '•' : ' ');
        ctx.fillStyle = U.rgba(st === '✓' ? green : U.ink, st === ' ' ? 0.25 : 0.9);
        ctx.fillText(st + ' ' + ['resolve', 'fetch', 'link', 'build', 'bundle', 'finish'][pi], pad, H * 0.3 + pi * fs * 0.95);
      }
      bar(pad, H * 0.78, W - pad * 2, fs * 0.5, pk2, U.rgba(green, 1), U.rgba(green, 0.12));
      ctx.fillStyle = U.rgba(green, 0.9);
      ctx.fillText(done + '/' + total + ' packages', W - pad, H * 0.78 - fs * 0.7);
    } else if (kind === 'log' || kind === 'boot') {
      var rowH = fs * 1.05;
      var rows = Math.floor((H * 0.7) / rowH);
      var pool = kind === 'boot' ? ['BIOS check ......... OK', 'memory 32768K ..... OK', 'loading kernel .... OK', 'mounting disk ..... OK', 'network eth0 ...... UP', 'starting service .. OK'] : lines.concat(['[info] heartbeat ok', '[info] cache warm', '[info] queue drained', '[warn] retry #1', '[info] reconnect ok']);
      if (!pool.length) pool = ['[info] service started'];
      var scroll = Math.floor(Math.max(0, t * sp - 0.6) * 3.2);
      ctx.font = U.fs(fs * 0.5, 500, true);
      ctx.textAlign = 'left';
      for (var ri = 0; ri < rows; ri++) {
        var idx = scroll + ri;
        if (idx >= pool.length + scroll) break;
        var content = pool[idx % pool.length];
        var ly2 = H * 0.16 + ri * rowH;
        var tagOk = /OK|ok|UP|✓/.test(content);
        ctx.fillStyle = U.rgba(tagOk ? green : U.ink, 0.15 + 0.75 * Math.max(0, 1 - Math.max(0, idx - scroll) / rows));
        ctx.fillText(content, pad, ly2);
      }
    } else if (kind === 'split') {
      ctx.font = U.fs(fs * 0.5, 600, true);
      ctx.textAlign = 'left';
      var half = W / 2;
      var ln = e.inOutCubic(U.clamp((t * sp - 0.2) / 0.7, 0, 1));
      ctx.fillStyle = U.rgba(U.ink, 0.35);
      ctx.fillRect(half * ln - 1, H * 0.14, 2, H * 0.72);
      for (var si = 0; si < lines.length; si++) {
        var side = si % 2;
        var sx = side ? half + pad : pad;
        var lk2 = e.outCubic(U.clamp((t * sp - 0.5 - si * 0.35) / 0.4, 0, 1));
        if (lk2 <= 0.01) continue;
        ctx.globalAlpha = lk2;
        ctx.fillStyle = U.rgba(si % 2 ? U.accent : green, 1);
        ctx.fillText(String(lines[si]).slice(0, Math.ceil(String(lines[si]).length * lk2)), sx, H * 0.3 + Math.floor(si / 2) * fs * 1.3);
        ctx.globalAlpha = 1;
      }
    } else if (kind === 'ascii') {
      var word = String(p.cmd || 'MOTION');
      var flick = 0.75 + 0.25 * Math.sin(t * 6);
      ctx.font = U.fs(fs * 1.35, 900, true);
      ctx.textAlign = 'center';
      if (p.glow > 0.03) { ctx.shadowColor = U.rgba(green, 0.9 * p.glow); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fillStyle = U.rgba(green, flick);
      ctx.fillText(word, W / 2, H / 2 - fs * 0.4);
      ctx.shadowBlur = 0;
      ctx.font = U.fs(fs * 0.42, 500, true);
      ctx.fillStyle = U.rgba(U.ink, 0.5);
      ctx.fillText('// ' + String(lines[0] || 'end of transmission') + ' //', W / 2, H / 2 + fs * 0.9);
    } else {
      ctx.font = U.fs(fs, 600, true);
      ctx.fillStyle = U.rgba(green, 1);
      ctx.textAlign = 'left';
      ctx.fillText('$ ' + p.cmd, pad, H / 2);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 原语二：社交叙事 ══════════════════════════ */

  var SOC_PARAMS = [
    P('kind', '形态', 'like', sel('like', [
      ['like', '点赞爆心'], ['heart-rain', '心形雨'], ['follow', '关注按钮'],
      ['comment', '评论气泡'], ['share', '分享扩散'], ['notif', '红点通知'],
      ['story', '故事环'], ['vote', '投票对比'], ['follower', '粉丝数滚动'],
      ['mention', '@ 提及'], ['trend', '话题冲榜'], ['gift', '礼物打赏']
    ])),
    P('text', '文案', '点个赞再走', txt('点个赞再走')),
    P('num', '数字', 128, rng(128, 1, 9999, 1)),
    P('size', '尺寸', 1144, rng(1144, 120.0, 1602, 4.0)),
    P('speed', '速度', 1, rng(1, 0.5, 2, 0.05)),
    P('ink2', '主色', '$accent', col('$accent')),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function socDraw(ctx, t, p, U) {
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

    function heartPath(x, y, s2) {
      ctx.beginPath();
      ctx.moveTo(x, y + s2 * 0.3);
      ctx.bezierCurveTo(x + s2 * 0.62, y - s2 * 0.3, x + s2 * 0.5, y - s2, x, y - s2 * 0.42);
      ctx.bezierCurveTo(x - s2 * 0.5, y - s2, x - s2 * 0.62, y - s2 * 0.3, x, y + s2 * 0.3);
      ctx.closePath();
    }
    function glowOn(c, amt) {
      if (amt > 0.03) { ctx.shadowColor = U.rgba(c, 0.8 * amt); ctx.shadowBlur = 26 * S * amt; }
    }
    function label2(size, a2, y) {
      ctx.font = U.fs(size * S, 800);
      ctx.fillStyle = U.rgba(U.ink, a2);
      ctx.fillText(label, cx, y === undefined ? cy + R * 1.05 : y);
    }

    if (kind === 'like' || kind === 'gift') {
      var hit = e.outBack(U.clamp(tt / 0.5, 0, 1));
      var beat = 1 + Math.sin(tt * 7) * 0.05 * U.clamp(tt - 0.6, 0, 1);
      ctx.globalAlpha = U.clamp(tt * 4, 0, 1);
      ctx.translate(cx, cy); ctx.scale(hit * beat, hit * beat); ctx.translate(-cx, -cy);
      glowOn(col, p.glow);
      heartPath(cx, cy, R * 0.9);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.shadowBlur = 0;
      for (var i = 0; i < 10; i++) {
        var ba = -Math.PI * 1.1 + (i / 9) * Math.PI * 1.2;
        var bk = e.outCubic(U.clamp((tt - 0.4 - i * 0.03) / 0.5, 0, 1));
        if (bk <= 0.01) continue;
        var r0 = R * 0.75, r1 = R * (0.75 + 0.55 * bk);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ba) * U.lerp(r0, r1, bk), cy + Math.sin(ba) * U.lerp(r0, r1, bk), R * 0.05 * (1 - bk * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(i % 2 ? U.accent2 : col, 0.9 * (1 - bk));
        ctx.fill();
      }
      label2(R * 0.2, U.clamp((tt - 0.7) / 0.4, 0, 1) * 1);
    } else if (kind === 'heart-rain') {
      for (var h2 = 0; h2 < 16; h2++) {
        var delay = U.rnd(0, 2.4, h2);
        var lt = ((tt + delay) % 3) / 3;
        var hx = W * U.rnd(0.12, 0.88, h2) + Math.sin(tt * 1.4 + h2) * 30 * S;
        var hy = U.lerp(H * 1.05, -R * 0.4, lt);
        var hs = R * (0.1 + U.rnd(0, 0.14, h2 + 3)) * (0.7 + 0.3 * Math.sin(lt * Math.PI));
        ctx.globalAlpha = Math.sin(lt * Math.PI) * 0.95;
        glowOn(h2 % 3 ? col : U.accent2, p.glow * 0.4);
        heartPath(hx, hy, hs);
        ctx.fillStyle = U.rgba(h2 % 3 ? col : U.accent2, 1);
        ctx.fill();
      }
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      label2(R * 0.2, 1);
    } else if (kind === 'follow') {
      var flip = e.outCubic(U.clamp((tt - 0.5) / 0.45, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      var bw = R * 1.5, bh = R * 0.5;
      U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, bh / 2);
      var fg = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
      fg.addColorStop(0, U.rgba(col, 1));
      fg.addColorStop(1, U.rgba(U.mix(col, U.accent2, 0.5), 1));
      ctx.fillStyle = fg; ctx.fill();
      ctx.font = U.fs(bh * 0.42, 800);
      var txt1 = '+ 关注', txt2 = '✓ 已关注';
      var k1 = U.clamp(flip * 2, 0, 1), k2v = U.clamp(flip * 2 - 1, 0, 1);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      if (k2v > 0.01) ctx.fillText(txt2, cx, cy);
      else ctx.fillText(txt1, cx - bw * (1 - k1) * 0.0, cy);
      var chip = label ? R * 0.18 : 0;
      if (chip) {
        ctx.font = U.fs(chip * S, 700);
        ctx.fillStyle = U.rgba(U.ink, 0.85);
        ctx.fillText(label, cx, cy + bh * 1.25);
      }
    } else if (kind === 'comment') {
      var pool = label.split(/[,，|]/).filter(Boolean);
      if (!pool.length) pool = ['太真实了', '收藏了', '学到了'];
      for (var ci = 0; ci < Math.min(pool.length, 5); ci++) {
        var ck = e.outCubic(U.clamp((tt - 0.4 - ci * 0.5) / 0.45, 0, 1));
        if (ck <= 0.01) continue;
        var side2 = ci % 2 ? 1 : -1;
        var bx2 = cx + side2 * W * U.rnd(0.1, 0.2, ci);
        var by = cy - R * 0.5 + ci * R * 0.34;
        ctx.globalAlpha = ck;
        ctx.font = U.fs(R * 0.14 * S, 700);
        var tw = ctx.measureText(pool[ci]).width + R * 0.24;
        ctx.translate(0, 0);
        ctx.save();
        ctx.translate(U.lerp(bx2 + side2 * 60 * S, bx2, ck), by);
        U.rr(ctx, -tw / 2, -R * 0.11, tw, R * 0.22, R * 0.11);
        ctx.fillStyle = U.rgba(ci === 0 ? col : U.bg2, ci === 0 ? 0.95 : 0.9);
        ctx.fill();
        ctx.fillStyle = U.rgba(ci === 0 ? U.bg1 : U.ink, 1);
        ctx.fillText(pool[ci], 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    } else if (kind === 'share') {
      var s4 = e.outCubic(U.clamp(tt / 0.5, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      for (var ri = 0; ri < 3; ri++) {
        var rk = U.clamp((s4 - ri * 0.14) / 0.5, 0, 1);
        if (rk <= 0.01) continue;
        ctx.globalAlpha = (1 - rk) * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.5 + rk * 0.7), 0, Math.PI * 2);
        ctx.lineWidth = R * 0.03 * (1 - rk) * S;
        ctx.strokeStyle = U.rgba(col, 1);
        ctx.stroke();
      }
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      glowOn(col, p.glow);
      var nodes = [[0, -1], [-0.87, 0.5], [0.87, 0.5]];
      for (var ni = 0; ni < nodes.length; ni++) {
        var nk = U.clamp((s4 - 0.3 - ni * 0.1) / 0.4, 0, 1);
        var nx = cx + nodes[ni][0] * R * 0.62, ny = cy + nodes[ni][1] * R * 0.62;
        var ncx = cx + nodes[ni][0] * R * 0.2, ncy = cy + nodes[ni][1] * R * 0.2;
        if (nk > 0.01) {
          ctx.beginPath();
          ctx.moveTo(ncx, ncy);
          ctx.lineTo(U.lerp(ncx, nx, nk), U.lerp(ncy, ny, nk));
          ctx.lineWidth = R * 0.035 * S;
          ctx.strokeStyle = U.rgba(col, 0.85);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(nx, ny, R * 0.09 * nk, 0, Math.PI * 2);
        ctx.fillStyle = U.rgba(ni === 0 ? U.accent2 : col, 1); ctx.fill();
      }
      ctx.shadowBlur = 0;
      label2(R * 0.18, U.clamp((tt - 0.9) / 0.4, 0, 1));
    } else if (kind === 'notif') {
      var pop2 = e.outBack(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      U.rr(ctx, cx - R * 0.42, cy - R * 0.42, R * 0.84, R * 0.84, R * 0.18);
      ctx.fillStyle = U.rgba(U.bg2, 0.96); ctx.fill();
      ctx.lineWidth = R * 0.02 * S; ctx.strokeStyle = U.rgba(U.ink, 0.18); ctx.stroke();
      ctx.font = U.fs(R * 0.34, 600);
      ctx.fillStyle = U.rgba(U.ink, 0.8);
      ctx.fillText('🔔', cx, cy - R * 0.02);
      var shake = Math.sin(tt * 24) * Math.exp(-tt * 2.4) * R * 0.05;
      ctx.save();
      ctx.translate(cx + R * 0.38 + shake, cy - R * 0.38);
      ctx.scale(pop2, pop2);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      ctx.font = U.fs(R * 0.15 * S, 800);
      ctx.fillStyle = U.rgba(U.bg1, 0.95);
      ctx.fillText(String(Math.max(1, Math.round(p.num % 100))), 0, 0);
      ctx.restore();
      label2(R * 0.18, U.clamp((tt - 0.8) / 0.4, 0, 1));
    } else if (kind === 'story') {
      var prog = (tt * 0.55) % 1;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      var segs = 5;
      for (var gi = 0; gi < segs; gi++) {
        var gk = U.clamp(prog * segs - gi, 0, 1);
        var a0 = -Math.PI / 2 + (gi / segs) * Math.PI * 2 + 0.04;
        var a1v = -Math.PI / 2 + ((gi + gk) / segs) * Math.PI * 2 - 0.04;
        ctx.beginPath();
        ctx.arc(cx, cy - R * 0.05, R * 0.72, a0, Math.max(a0 + 0.01, a1v));
        ctx.lineWidth = R * 0.045 * S;
        ctx.strokeStyle = U.rgba(gk > 0 && gk < 1 ? U.accent2 : col, gk > 0 ? 1 : 0.28);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy - R * 0.05, R * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.95); ctx.fill();
      var av = e.outBack(U.clamp((tt - 0.3) / 0.5, 0, 1));
      ctx.font = U.fs(R * 0.4 * av, 800);
      ctx.fillStyle = U.rgba(U.ink, av);
      ctx.fillText(label.charAt(0) || '★', cx, cy - R * 0.05);
      label2(R * 0.17, U.clamp((tt - 0.7) / 0.4, 0, 1), cy + R * 0.9);
    } else if (kind === 'vote') {
      var pair = label.split(/[,，|]/);
      var a3 = pair[0] || '方案 A', b3 = pair[1] || '方案 B';
      var nA = Math.round(p.num), nB = Math.max(1, Math.round(p.num * U.rnd(0.4, 0.9, 5)));
      var gk2 = e.inOutCubic(U.clamp((tt - 0.3) / 1.6, 0, 1));
      var wA = nA / (nA + nB), wB = 1 - wA;
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      ctx.font = U.fs(R * 0.16 * S, 800);
      ctx.textAlign = 'left';
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText(a3, W * 0.12, cy - R * 0.42);
      ctx.fillStyle = U.rgba(U.accent2, 1);
      ctx.fillText(b3, W * 0.12, cy + R * 0.42);
      var bh2 = R * 0.24;
      U.rr(ctx, W * 0.12, cy - R * 0.3, W * 0.76, bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      U.rr(ctx, W * 0.12, cy - R * 0.3, Math.max(bh2, W * 0.76 * wA * gk2), bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(col, 0.95); ctx.fill();
      U.rr(ctx, W * 0.12, cy + R * 0.14, W * 0.76, bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(U.bg2, 0.9); ctx.fill();
      U.rr(ctx, W * 0.12, cy + R * 0.14, Math.max(bh2, W * 0.76 * wB * gk2), bh2, bh2 / 2);
      ctx.fillStyle = U.rgba(U.accent2, 0.95); ctx.fill();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(Math.round(nA * gk2), W * 0.12 + W * 0.76 * wA * gk2 + 14 * S, cy - R * 0.3 + bh2 / 2);
      ctx.fillText(Math.round(nB * gk2), W * 0.12 + W * 0.76 * wB * gk2 + 14 * S, cy + R * 0.14 + bh2 / 2);
      ctx.textAlign = 'center';
    } else if (kind === 'follower' || kind === 'trend') {
      var target = Math.max(1, Math.round(p.num));
      var ck3 = e.outExpo(U.clamp((tt - 0.4) / 1.6, 0, 1));
      var val = Math.round(target * ck3);
      ctx.globalAlpha = U.clamp(tt * 3, 0, 1);
      glowOn(col, p.glow * 0.5);
      ctx.font = U.fs(R * 0.62, 900);
      ctx.fillStyle = U.rgba(U.ink, 1);
      ctx.fillText(String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ','), cx, cy - R * 0.12);
      ctx.font = U.fs(R * 0.16 * S, 700);
      ctx.fillStyle = U.rgba(col, 0.95);
      ctx.fillText(kind === 'trend' ? ('#' + label) : (label + ' · ' + (tt > 1 ? '+1' : '')), cx, cy + R * 0.42);
      if (kind === 'trend') {
        var tk = e.outCubic(U.clamp((tt - 0.8) / 0.8, 0, 1));
        ctx.strokeStyle = U.rgba(col, 0.9 * tk);
        ctx.lineWidth = R * 0.03 * S;
        ctx.beginPath();
        for (var pi2 = 0; pi2 <= 20; pi2++) {
          var px = W * 0.3 + (pi2 / 20) * W * 0.4;
          var py = cy + R * 0.8 - Math.pow(pi2 / 20, 1.6) * R * 0.4 * tk;
          if (!pi2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else if (kind === 'mention') {
      var mk = e.outBack(U.clamp(tt / 0.6, 0, 1));
      ctx.globalAlpha = U.clamp(tt * 3.4, 0, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((1 - e.outCubic(U.clamp(tt / 0.6, 0, 1))) * -0.3);
      ctx.scale(mk, mk);
      ctx.font = U.fs(R * 0.6, 900);
      if (p.glow > 0.03) { ctx.shadowColor = U.rgba(col, 0.8 * p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.fillStyle = U.rgba(col, 1);
      ctx.fillText('@', 0, 0);
      ctx.restore();
      label2(R * 0.2, U.clamp((tt - 0.6) / 0.4, 0, 1));
    } else {
      heartPath(cx, cy, R * 0.8);
      ctx.fillStyle = U.rgba(col, 1); ctx.fill();
      label2(R * 0.18, 1);
    }
    ctx.restore();
  }

  /* ══════════════════════════ 注册 ══════════════════════════ */

  MF.forge({
    cat: '终端代码', type: 'block', dur: 6, poster: 0.55,
    params: TERM_PARAMS, draw: termDraw,
    ids: [
      { id: 'term-type', name: '命令打字机', tags: ['打字', '命令'], desc: '命令逐字敲出并伴随光标闪烁，开发者质感。', cfg: { kind: 'type' } },
      { id: 'term-output', name: '命令与输出', tags: ['命令', '输出'], desc: '先打命令，再逐行弹出执行输出，教学演示利器。', cfg: { kind: 'output' } },
      { id: 'term-progress', name: '终端进度条', tags: ['进度', '下载'], desc: '终端风格进度条从 0 到 100%，极客感十足。', cfg: { kind: 'progress' } },
      { id: 'term-matrix', name: '代码雨', tags: ['矩阵', '黑客'], desc: '经典代码雨倾泻而下，黑客帝国氛围。', cfg: { kind: 'matrix' } },
      { id: 'term-log', name: '日志滚动', tags: ['日志', '滚动'], desc: '服务日志持续滚动刷新，运维监控感。', cfg: { kind: 'log' } },
      { id: 'term-boot', name: '开机自检', tags: ['开机', 'BIOS'], desc: 'BIOS 自检逐行通过，系统启动叙事。', cfg: { kind: 'boot' } },
      { id: 'term-cursor', name: '光标呼吸', tags: ['光标', '待机'], desc: '只剩光标在黑屏上呼吸闪烁，极简开场。', cfg: { kind: 'cursor' } },
      { id: 'term-split', name: '分屏输出', tags: ['分屏', '对比'], desc: '双栏交错弹出的终端输出，对比演示。', cfg: { kind: 'split' } },
      { id: 'term-success', name: '成功收尾', tags: ['成功', '部署'], desc: '命令执行后逐行输出并以绿色 done 收尾。', cfg: { kind: 'success' } },
      { id: 'term-error', name: '报错抖动', tags: ['报错', '抖动'], desc: '输出后红色报错并伴随屏幕抖动，故障演示。', cfg: { kind: 'error' } },
      { id: 'term-install', name: '依赖安装', tags: ['安装', 'npm'], desc: '模拟依赖安装的分步勾选与总进度，构建叙事。', cfg: { kind: 'install' } },
      { id: 'term-ascii', name: '字符横幅', tags: ['ASCII', '标语'], desc: '等宽字体大字横幅闪烁，片头与章节页。', cfg: { kind: 'ascii', cmd: 'MOTION' } }
    ]
  });

  MF.forge({
    cat: '社交叙事', type: 'block', dur: 5.5, poster: 0.4,
    params: SOC_PARAMS, draw: socDraw,
    texts: ['点个赞再走', '关注不迷路', '评论区聊聊', '转发给需要的人'],
    ids: [
      { id: 'soc-like', name: '点赞爆心', tags: ['点赞', '爱心'], desc: '爱心弹出并放射粒子，互动号召场景。', cfg: { kind: 'like' } },
      { id: 'soc-heart-rain', name: '心形雨', tags: ['心雨', '氛围'], desc: '爱心从天而降连绵不断，直播与感谢场景。', cfg: { kind: 'heart-rain' } },
      { id: 'soc-follow', name: '关注按钮', tags: ['关注', '按钮'], desc: '「+关注」翻转为「已关注」，涨粉引导。', cfg: { kind: 'follow' } },
      { id: 'soc-comment', name: '评论气泡', tags: ['评论', '气泡'], desc: '评论气泡左右交错弹出，用逗号分隔内容。', cfg: { kind: 'comment', text: '太真实了,收藏了,学到了' } },
      { id: 'soc-share', name: '分享扩散', tags: ['分享', '节点'], desc: '分享节点逐个连线扩散，传播可视化。', cfg: { kind: 'share' } },
      { id: 'soc-notif', name: '红点通知', tags: ['通知', '红点'], desc: '图标抖动后红点数字弹出，提醒氛围。', cfg: { kind: 'notif' } },
      { id: 'soc-story', name: '故事环', tags: ['故事', '进度'], desc: '故事环分段填充并露出头像首字。', cfg: { kind: 'story' } },
      { id: 'soc-vote', name: '投票对比', tags: ['投票', '对比'], desc: '两条投票条按票数增长，逗号分隔两个选项。', cfg: { kind: 'vote', text: '方案 A,方案 B' } },
      { id: 'soc-follower', name: '粉丝数滚动', tags: ['数字', '粉丝'], desc: '粉丝数快速滚动到位，里程碑庆祝。', cfg: { kind: 'follower', num: 10000 } },
      { id: 'soc-mention', name: '@ 提及', tags: ['@', '提及'], desc: '@ 符号旋入弹出，提及与召唤场景。', cfg: { kind: 'mention' } },
      { id: 'soc-trend', name: '话题冲榜', tags: ['话题', '热度'], desc: '话题标签伴随热度曲线上扬，冲榜氛围。', cfg: { kind: 'trend', num: 9999 } },
      { id: 'soc-gift', name: '礼物打赏', tags: ['礼物', '打赏'], desc: '爱心爆开配放射光点，感谢打赏场景。', cfg: { kind: 'gift' } }
    ]
  });
})();
