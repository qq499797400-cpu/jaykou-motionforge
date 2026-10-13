/* ==========================================================================
   Jaykou 动效库 · 07
   原语：文字特效（逐字型 / 整体型 / 特殊型）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  var TEXT_PARAMS = [
    P('text', '文案', 'MOTION', txt('MOTION')),
    P('kind', '特效类型', 'rise', sel('rise', [
      ['rise', '逐字升起'], ['wave', '波浪浮动'], ['bounce', '逐字弹跳'], ['rotchar', '逐字旋转'],
      ['karaoke', '逐字点亮'], ['box', '逐字方框'], ['scale', '逐字缩放'], ['skew', '斜切入场'],
      ['blurchar', '逐字显影'], ['trackin', '聚拢字距'],
      ['gradient', '渐变流光'], ['outline', '描边空心'], ['glitch', '故障闪切'], ['maskrise', '遮罩上推'],
      ['mirror', '镜像倒影'], ['split', '上下分离'], ['stack', '重复叠影'], ['cycle', '色相循环'],
      ['shine', '光泽扫过'], ['extrude', '立体挤出'],
      ['typewriter', '打字机'], ['decode', '乱码解码'], ['scramble', '字符滚动'], ['countup', '数字滚动'],
      ['vertical', '竖排文字'], ['highlight', '荧光笔'], ['matrix', '点阵成像'], ['fire', '火焰文字'],
      ['liquid', '液态流动'], ['neon', '霓虹灯管']
    ])),
    P('size', '字号', 240, rng(240, 40.0, 324.0, 2.0)),
    P('weight', '字重', '900', sel('900', [['900', '特粗'], ['700', '粗体'], ['500', '中黑'], ['300', '细体']])),
    P('gap', '字距', 0, rng(0, -8, 34, 1)),
    P('speed', '速度', 1, rng(1, 0.3, 3, 0.1)),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  /* 逐字把字符串切成「绘制单元」：中文单字、英文单词、空格独立 */
  function sliceChars(str) {
    var raw = String(str || '');
    var out = [], buf = '';
    for (var i = 0; i < raw.length; i++) {
      var ch = raw.charAt(i);
      if (ch === ' ') {
        if (buf) { out.push(buf); buf = ''; }
        out.push(' ');
      } else if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/.test(ch)) {
        if (buf) { out.push(buf); buf = ''; }
        out.push(ch);
      } else {
        buf += ch;
      }
    }
    if (buf) out.push(buf);
    return out;
  }

  /* ─────────────── 原语 A：逐字型特效 ─────────────── */
  function textPerCharDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var size = p.size * S;
    /* 切分函数必须内联在 draw 内部：导出产物只保留 draw 的函数体 */
    function sliceChars(str) {
      var raw = String(str || '');
      var out = [], buf = '';
      for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        if (ch === ' ') {
          if (buf) { out.push(buf); buf = ''; }
          out.push(' ');
        } else if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/.test(ch)) {
          if (buf) { out.push(buf); buf = ''; }
          out.push(ch);
        } else {
          buf += ch;
        }
      }
      if (buf) out.push(buf);
      return out;
    }
    var chars = sliceChars(p.text);
    if (!chars.length) return;
    ctx.font = U.fs(size, p.weight);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    var gap = p.gap * S;
    var widths = [], total = 0, i;
    for (i = 0; i < chars.length; i++) {
      var w = ctx.measureText(chars[i]).width;
      widths.push(w); total += w;
    }
    total += gap * (chars.length - 1);
    var x0 = W / 2 - total / 2;
    var cy = H / 2;
    var kind = p.kind;
    var sp = Math.max(0.2, p.speed);

    var grad = ctx.createLinearGradient(x0, 0, x0 + total, 0);
    grad.addColorStop(0, U.ink);
    grad.addColorStop(1, U.mix(U.ink, U.accent, 0.5));

    var cursor = x0;
    for (i = 0; i < chars.length; i++) {
      var cx = cursor + widths[i] / 2;
      var idx = i;
      var k, dx = 0, dy = 0, rot = 0, sc = 1, alpha = 1, blur = 0;
      var col = grad;

      if (kind === 'rise') {
        k = e.outCubic(U.clamp((t * sp - 0.25 - idx * 0.07) / 0.75, 0, 1));
        dy = (1 - k) * size * 0.95; alpha = k;
      } else if (kind === 'wave') {
        k = 1; dy = Math.sin(t * sp * 2.6 - idx * 0.55) * size * 0.16;
        rot = Math.cos(t * sp * 2.6 - idx * 0.55) * 0.06;
      } else if (kind === 'bounce') {
        k = e.outBounce(U.clamp((t * sp - 0.2 - idx * 0.09) / 0.85, 0, 1));
        dy = -(1 - k) * size * 1.3; alpha = U.clamp(k * 2, 0, 1);
      } else if (kind === 'rotchar') {
        k = e.outBack(U.clamp((t * sp - 0.2 - idx * 0.08) / 0.9, 0, 1));
        rot = (1 - k) * 1.8; dy = (1 - k) * size * 0.4; sc = 0.6 + 0.4 * k; alpha = U.clamp(k * 1.8, 0, 1);
      } else if (kind === 'karaoke') {
        var lit = U.clamp((t * sp - 0.3) / 1.9, 0, 1) * chars.length;
        col = idx < lit ? grad : U.rgba(U.ink, 0.16);
        sc = 1 + U.clamp(1 - Math.abs(idx + 0.5 - lit), 0, 1) * 0.16;
      } else if (kind === 'box') {
        k = U.clamp((t * sp - 0.25 - idx * 0.1) / 0.55, 0, 1);
        alpha = k;
        ctx.save();
        ctx.globalAlpha = k * 0.9;
        ctx.strokeStyle = U.rgba(U.accent, 0.9);
        ctx.lineWidth = 2.4 * S;
        var bw = widths[i] * (0.55 + 0.55 * k), bh = size * (0.55 + 0.55 * k);
        U.rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 8 * S);
        ctx.stroke();
        ctx.restore();
      } else if (kind === 'scale') {
        k = e.outBack(U.clamp((t * sp - 0.25 - idx * 0.07) / 0.8, 0, 1));
        sc = 0.2 + 0.8 * k; alpha = U.clamp(k * 1.6, 0, 1);
      } else if (kind === 'skew') {
        k = e.outExpo(U.clamp((t * sp - 0.2 - idx * 0.06) / 0.7, 0, 1));
        dx = (1 - k) * size * 0.9; rot = (1 - k) * 0.5; alpha = k;
      } else if (kind === 'blurchar') {
        k = U.clamp((t * sp - 0.25 - idx * 0.08) / 0.9, 0, 1);
        alpha = k; blur = (1 - k) * size * 0.28;
      } else if (kind === 'trackin') {
        k = e.outExpo(U.clamp((t * sp - 0.2) / 1.1, 0, 1));
        dx = (1 - k) * (idx - (chars.length - 1) / 2) * size * 0.75; alpha = U.clamp(k * 2, 0, 1);
      } else {
        k = e.outCubic(U.clamp((t * sp - 0.25 - idx * 0.07) / 0.75, 0, 1));
        dy = (1 - k) * size * 0.95; alpha = k;
      }

      ctx.save();
      ctx.globalAlpha *= alpha;
      if (blur > 0.5) ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
      ctx.translate(cx + dx, cy + dy);
      if (rot) ctx.rotate(rot);
      if (sc !== 1) ctx.scale(sc, sc);
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.85); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.fillStyle = col;
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
      cursor += widths[i] + gap;
    }
  }

  /* ─────────────── 原语 B：整体型特效 ─────────────── */
  function textWholeDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var size = p.size * S;
    var label = String(p.text || '');
    ctx.font = U.fs(size, p.weight);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var tw = ctx.measureText(label).width;
    var cx = W / 2, cy = H / 2;
    var kind = p.kind;
    var sp = Math.max(0.2, p.speed);
    var prog = U.clamp(t * sp, 0, 4);
    var k = e.outCubic(U.clamp(prog / 1.1, 0, 1));

    var grad = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
    grad.addColorStop(0, U.ink);
    grad.addColorStop(1, U.mix(U.ink, U.accent, 0.55));

    if (kind === 'gradient') {
      var flow = ctx.createLinearGradient(cx - tw / 2 - tw * 0.6 + Math.sin(t * 1.6) * tw * 0.3, cy - size, cx + tw / 2 + tw * 0.6, cy + size);
      flow.addColorStop(0, U.accent);
      flow.addColorStop(0.35, U.ink);
      flow.addColorStop(0.6, U.accent2);
      flow.addColorStop(1, U.accent);
      ctx.save();
      ctx.shadowColor = U.rgba(U.accent, p.glow * 0.6);
      ctx.shadowBlur = 26 * S * p.glow;
      ctx.fillStyle = flow;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'outline') {
      ctx.save();
      /* 从左向右逐字揭示，随后辉光呼吸 */
      var rev = e.outCubic(U.clamp(t * sp / 1.2, 0, 1));
      ctx.beginPath();
      ctx.rect(cx - tw / 2 - 30 * S, cy - size * 1.2, tw * rev + 60 * S, size * 2.4);
      ctx.clip();
      var pulse = 0.55 + 0.45 * Math.sin(t * sp * 2.4);
      ctx.lineWidth = Math.max(1.6, size * 0.035);
      ctx.strokeStyle = U.accent;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * (0.5 + 0.5 * pulse)); ctx.shadowBlur = (14 + 26 * pulse) * S * p.glow; }
      ctx.strokeText(label, cx, cy);
      ctx.globalAlpha = 0.22 * (0.7 + 0.3 * Math.sin(t * sp * 1.7));
      ctx.fillStyle = U.mix(U.accent, U.ink, 0.5);
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'glitch') {
      var bands = 12;
      for (var b = 0; b < bands; b++) {
        var ry = cy - size * 0.7 + (b / bands) * size * 1.4;
        var rh = size * 1.4 / bands;
        var off = (U.rng(b + Math.floor(t * sp * 6) * 13) - 0.5) * size * 0.34;
        var on = U.rng(b * 7 + Math.floor(t * sp * 4) * 3) > 0.42;
        if (!on) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - tw / 2 - size, ry, tw + size * 2, rh);
        ctx.clip();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = U.accent;
        ctx.fillText(label, cx + off, cy);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = U.accent2;
        ctx.fillText(label, cx - off, cy);
        ctx.globalAlpha = 1;
        ctx.fillStyle = U.ink;
        ctx.fillText(label, cx, cy);
        ctx.restore();
      }
      return;
    }

    if (kind === 'maskrise') {
      var mh = size * 1.6;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, cy - mh / 2 + (1 - k) * mh, W, mh * k);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'mirror') {
      /* 流光渐变 + 倒影呼吸，不再是静帧 */
      var mgx = Math.sin(t * sp * 1.4) * tw * 0.3;
      var mflow = ctx.createLinearGradient(cx - tw / 2 - tw * 0.4 + mgx, cy - size, cx + tw / 2 + tw * 0.4 + mgx, cy + size);
      mflow.addColorStop(0, U.ink);
      mflow.addColorStop(0.45, U.mix(U.ink, U.accent, 0.6));
      mflow.addColorStop(0.55, U.mix(U.ink, U.accent2, 0.5));
      mflow.addColorStop(1, U.ink);
      ctx.save();
      ctx.fillStyle = mflow;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.7); ctx.shadowBlur = 26 * S * p.glow; }
      ctx.fillText(label, cx, cy - size * 0.15);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.17 + 0.09 * Math.sin(t * sp * 2.1);
      ctx.translate(0, cy + size * 0.5);
      ctx.scale(1, -0.55);
      var mg = ctx.createLinearGradient(0, 0, 0, -size);
      mg.addColorStop(0, U.rgba(U.accent, 0.0));
      mg.addColorStop(1, U.rgba(U.accent, 0.9));
      ctx.fillStyle = mg;
      ctx.fillText(label, cx, 0);
      ctx.restore();
      return;
    }

    if (kind === 'split') {
      var up = e.outExpo(U.clamp(prog / 1.2, 0, 1));
      var half = size * 1.5;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, cy); ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillText(label, cx, cy - (1 - up) * half * 0.5);
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.rect(0, cy, W, H - cy); ctx.clip();
      ctx.fillStyle = U.mix(U.accent, U.ink, 0.35);
      ctx.fillText(label, cx, cy + (1 - up) * half * 0.5);
      ctx.restore();
      return;
    }

    if (kind === 'stack') {
      var layers = 7;
      for (var L = layers; L >= 1; L--) {
        ctx.save();
        ctx.globalAlpha = 0.1 * (1 - L / layers) + 0.06;
        ctx.fillStyle = L % 2 ? U.accent : U.accent2;
        ctx.fillText(label, cx - L * 7 * S * k, cy + L * 6 * S * k);
        ctx.restore();
      }
      ctx.fillStyle = grad;
      ctx.fillText(label, cx, cy);
      return;
    }

    if (kind === 'cycle') {
      var hue = (t * sp * 90) % 360;
      var c1 = 'hsl(' + hue.toFixed(0) + ',92%,62%)';
      var c2 = 'hsl(' + ((hue + 120) % 360).toFixed(0) + ',92%,62%)';
      var cg = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      cg.addColorStop(0, c1); cg.addColorStop(1, c2);
      ctx.save();
      ctx.shadowColor = c1; ctx.shadowBlur = 30 * S * (0.4 + p.glow);
      ctx.fillStyle = cg;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'shine') {
      ctx.save();
      ctx.fillStyle = U.rgba(U.ink, 0.9);
      ctx.fillText(label, cx, cy);
      ctx.globalCompositeOperation = 'source-atop';
      var sw = tw * 0.4;
      var sx = cx - tw / 2 - sw + ((tw + sw * 2) * ((t * sp * 0.55) % 1.4));
      var sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
      sg.addColorStop(0, U.rgba(U.accent, 0));
      sg.addColorStop(0.5, U.rgba('#FFFFFF', 0.95));
      sg.addColorStop(1, U.rgba(U.accent, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(cx - tw / 2 - sw, cy - size, tw + sw * 2, size * 2);
      ctx.restore();
      return;
    }

    if (kind === 'extrude') {
      var depth = Math.round(16 * k);
      for (var d2 = depth; d2 > 0; d2--) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = U.mix(U.bg1, U.accent, U.clamp(1 - d2 / depth, 0, 1) * 0.85);
        ctx.fillText(label, cx + d2 * 1.6 * S, cy + d2 * 1.6 * S);
        ctx.restore();
      }
      ctx.fillStyle = U.ink;
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 24 * S * p.glow; }
      ctx.fillText(label, cx, cy);
      return;
    }

    /* 兜底：整体上浮淡入 */
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(0, (1 - k) * size * 0.6);
    ctx.fillStyle = grad;
    ctx.fillText(label, cx, cy);
    ctx.restore();
  }

  /* ─────────────── 原语 C：特殊型特效 ─────────────── */
  function textSpecialDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var size = p.size * S;
    /* 乱码字符池与切分函数必须内联在 draw 内部：导出产物只保留 draw 的函数体 */
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*<>/\\|+=~';
    function sliceChars(str) {
      var raw = String(str || '');
      var out = [], buf = '';
      for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        if (ch === ' ') {
          if (buf) { out.push(buf); buf = ''; }
          out.push(' ');
        } else if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/.test(ch)) {
          if (buf) { out.push(buf); buf = ''; }
          out.push(ch);
        } else {
          buf += ch;
        }
      }
      if (buf) out.push(buf);
      return out;
    }
    var label = String(p.text || '');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = U.fs(size, p.weight);
    var tw = ctx.measureText(label).width;
    var cx = W / 2, cy = H / 2;
    var kind = p.kind;
    var sp = Math.max(0.2, p.speed);

    if (kind === 'typewriter') {
      var chars = sliceChars(label);
      var gapW = p.gap * S;
      var widths = [], total = 0, i;
      for (i = 0; i < chars.length; i++) { var w = ctx.measureText(chars[i]).width; widths.push(w); total += w; }
      total += gapW * (chars.length - 1);
      var x0 = cx - total / 2;
      var shown = U.clamp(Math.floor(t * sp * 9), 0, chars.length);
      var cur = x0;
      ctx.textAlign = 'left';
      for (i = 0; i < shown; i++) {
        ctx.fillStyle = U.ink;
        ctx.fillText(chars[i], cur, cy);
        cur += widths[i] + gapW;
      }
      var blink = Math.floor(t * sp * 2.4) % 2 === 0;
      if (blink && shown < chars.length) {
        ctx.fillStyle = U.accent;
        ctx.fillRect(cur + 2 * S, cy - size * 0.46, size * 0.075, size * 0.92);
      }
      return;
    }

    if (kind === 'decode') {
      var chs = sliceChars(label);
      var gw2 = p.gap * S;
      var ws = [], tot2 = 0;
      for (i = 0; i < chs.length; i++) { var w2 = ctx.measureText(chs[i]).width; ws.push(w2); tot2 += w2; }
      tot2 += gw2 * (chs.length - 1);
      var sx0 = cx - tot2 / 2;
      var reveal = U.clamp(t * sp / 1.4, 0, 1) * chs.length;
      ctx.textAlign = 'left';
      var cx2 = sx0;
      for (i = 0; i < chs.length; i++) {
        var done = reveal - i;
        if (done >= 1) {
          ctx.fillStyle = U.ink;
          ctx.fillText(chs[i], cx2, cy);
        } else {
          var g = GLYPHS.charAt(Math.floor(U.rng(i * 17 + Math.floor(t * sp * 22) * 7) * GLYPHS.length) % GLYPHS.length);
          ctx.fillStyle = U.rgba(U.accent, 0.85);
          ctx.fillText(g, cx2, cy);
        }
        cx2 += ws[i] + gw2;
      }
      return;
    }

    if (kind === 'scramble') {
      var cs = sliceChars(label);
      var gw3 = p.gap * S;
      var w3 = [], tt = 0;
      for (i = 0; i < cs.length; i++) { var ww = ctx.measureText(cs[i]).width; w3.push(ww); tt += ww; }
      tt += gw3 * (cs.length - 1);
      var bx = cx - tt / 2;
      ctx.textAlign = 'left';
      for (i = 0; i < cs.length; i++) {
        var settle = (i * 0.13 + 0.35) / sp;
        if (t > settle) {
          ctx.fillStyle = U.ink;
          ctx.fillText(cs[i], bx, cy);
        } else {
          var roll = Math.floor(U.rng(i * 31 + Math.floor(t * 20) * 11) * GLYPHS.length);
          ctx.fillStyle = U.rgba(U.accent, 0.9);
          ctx.fillText(GLYPHS.charAt(roll), bx, cy);
        }
        bx += w3[i] + gw3;
      }
      return;
    }

    if (kind === 'countup') {
      var num = parseFloat(String(label).replace(/[^\d.]/g, '')) || 0;
      var suffix = String(label).replace(/[\d.,\s]/g, '');
      var cur2 = Math.round(num * e.outExpo(U.clamp(t * sp / 1.6, 0, 1)));
      var shownTxt = String(cur2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      ctx.font = U.fs(size, p.weight);
      var gt = ctx.createLinearGradient(cx - 300 * S, 0, cx + 300 * S, 0);
      gt.addColorStop(0, U.ink);
      gt.addColorStop(1, U.accent);
      ctx.save();
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 32 * S * p.glow; }
      ctx.fillStyle = gt;
      ctx.fillText(shownTxt, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'vertical') {
      var vc = sliceChars(label);
      var lh = size * 1.12;
      var y0 = cy - (vc.length - 1) * lh / 2;
      for (i = 0; i < vc.length; i++) {
        var kk = e.outCubic(U.clamp((t * sp - i * 0.08) / 0.7, 0, 1));
        ctx.save();
        ctx.globalAlpha = kk;
        if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 26 * S * p.glow; }
        ctx.fillStyle = i === vc.length - 1 ? U.accent : U.ink;
        ctx.fillText(vc[i], cx, y0 + i * lh + (1 - kk) * size * 0.5);
        ctx.restore();
      }
      return;
    }

    if (kind === 'highlight') {
      var sweep = e.inOutCubic(U.clamp(t * sp / 1.2, 0, 1));
      ctx.save();
      ctx.fillStyle = U.ink;
      ctx.fillText(label, cx, cy);
      ctx.globalCompositeOperation = 'source-atop';
      var hl = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      hl.addColorStop(0, U.rgba(U.accent, 0.9));
      hl.addColorStop(0.75, U.rgba(U.accent, 0.55));
      hl.addColorStop(1, U.rgba(U.accent, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = hl;
      ctx.fillRect(cx - tw / 2 - 20 * S, cy - size * 0.62, (tw + 40 * S) * sweep, size * 1.24);
      ctx.restore();
      return;
    }

    if (kind === 'matrix') {
      var cells = 30, rows = 6;
      var gx = W / cells, gy = H / rows;
      var lit = U.clamp(t * sp / 1.7, 0, 1);
      var mx = cx - tw / 2, my = cy - size / 2;
      for (var r2 = 0; r2 < rows; r2++) {
        for (var c2 = 0; c2 < cells; c2++) {
          var px = c2 * gx + gx / 2, py = r2 * gy + gy / 2;
          var tInText = px > mx - 6 && px < mx + tw + 6 && py > my - 6 && py < my + size + 6;
          if (!tInText) continue;
          var rndv = U.rng(r2 * 61 + c2 * 13);
          if (rndv > lit * 1.15) continue;
          ctx.globalAlpha = 0.5 + 0.5 * U.rng(r2 * 7 + c2 * 19);
          ctx.fillStyle = rndv > lit ? U.accent : U.ink;
          var rad = Math.min(gx, gy) * 0.3;
          ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = U.rgba(U.ink, U.clamp(lit * 1.6 - 1.2, 0, 1));
      ctx.font = U.fs(size, p.weight);
      ctx.fillText(label, cx, cy);
      return;
    }

    if (kind === 'fire') {
      ctx.save();
      ctx.shadowColor = 'rgba(255,120,20,0.9)';
      ctx.shadowBlur = 40 * S;
      var fg = ctx.createLinearGradient(cx, cy + size * 0.6, cx, cy - size * 0.6);
      fg.addColorStop(0, '#FFC24B');
      fg.addColorStop(0.45, '#FF7A18');
      fg.addColorStop(1, '#FF2D55');
      ctx.fillStyle = fg;
      ctx.fillText(label, cx + Math.sin(t * 9) * 2.4 * S, cy + Math.cos(t * 7) * 2 * S);
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-atop';
      for (var fi = 0; fi < 26; fi++) {
        var fxp = cx - tw / 2 + U.rng(fi * 3) * tw;
        var rise = (t * sp * 0.8 + U.rng(fi * 11)) % 1;
        var fy = cy + size * 0.5 - rise * size * 1.7;
        var rad2 = (1 - rise) * size * 0.13;
        var fgd = ctx.createRadialGradient(fxp, fy, 0, fxp, fy, rad2);
        fgd.addColorStop(0, 'rgba(255,240,180,0.95)');
        fgd.addColorStop(1, 'rgba(255,90,0,0)');
        ctx.fillStyle = fgd;
        ctx.beginPath(); ctx.arc(fxp, fy, rad2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      return;
    }

    if (kind === 'liquid') {
      var lprog = U.clamp(t * sp / 1.5, 0, 1);
      ctx.save();
      ctx.fillStyle = U.rgba(U.ink, 0.14);
      ctx.fillText(label, cx, cy);
      ctx.beginPath();
      ctx.moveTo(0, cy + size * 0.8);
      for (var lx = 0; lx <= W; lx += 14) {
        var ly = cy + size * 0.8 - lprog * size * 1.7 + Math.sin(lx * 0.012 + t * sp * 2.4) * size * 0.09
          + Math.sin(lx * 0.03 - t * sp * 1.7) * size * 0.05;
        ctx.lineTo(lx, ly);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.clip();
      var lg2 = ctx.createLinearGradient(0, cy - size, 0, cy + size);
      lg2.addColorStop(0, U.accent2);
      lg2.addColorStop(1, U.accent);
      ctx.fillStyle = lg2;
      ctx.font = U.fs(size, p.weight);
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    if (kind === 'neon') {
      var flick = 0.85 + 0.15 * Math.sin(t * sp * 18) * Math.sin(t * sp * 5.3);
      ctx.save();
      ctx.font = U.fs(size, p.weight);
      ctx.lineWidth = Math.max(1.6, size * 0.028);
      ctx.strokeStyle = U.accent;
      ctx.shadowColor = U.accent;
      ctx.shadowBlur = 30 * S * flick * (0.6 + p.glow);
      ctx.strokeText(label, cx, cy);
      ctx.shadowBlur = 60 * S * flick * (0.6 + p.glow);
      ctx.strokeText(label, cx, cy);
      ctx.shadowBlur = 14 * S;
      ctx.fillStyle = U.mix(U.ink, U.accent, 0.35);
      ctx.globalAlpha = flick;
      ctx.fillText(label, cx, cy);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalAlpha = U.clamp(t * sp, 0, 1);
    ctx.fillStyle = U.ink;
    ctx.fillText(label, cx, cy);
    ctx.restore();
  }

  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.58,
    params: TEXT_PARAMS, draw: textPerCharDraw,
    ids: [
      { id: 'tx-rise', name: '逐字升起', tags: ['逐字', '通用'], desc: '字符一个个从下方升起并显影，最经典的字幕式入场。', cfg: { kind: 'rise', text: 'MAKE IT MOVE' } },
      { id: 'tx-wave', name: '波浪浮动', tags: ['波浪', '循环'], desc: '字符沿正弦波持续起伏，适合标题动画与循环背景文字。', cfg: { kind: 'wave', text: 'WAVE MOTION' } },
      { id: 'tx-bounce', name: '逐字弹跳', tags: ['弹跳', '活泼'], desc: '每个字符弹跳落位，节奏轻快，适合儿童与娱乐内容。', cfg: { kind: 'bounce', text: 'BOUNCE!' } },
      { id: 'tx-rotchar', name: '逐字旋转', tags: ['旋转', '动感'], desc: '字符带旋转落位，动感强，适合片头与活动视觉。', cfg: { kind: 'rotchar', text: 'SPIN IN' } },
      { id: 'tx-karaoke', name: '逐字点亮', tags: ['点亮', '字幕'], desc: '字符按进度依次点亮，最常见的歌词与口播强调样式。', cfg: { kind: 'karaoke', text: '跟着节奏走到最后' } },
      { id: 'tx-box', name: '逐字方框', tags: ['方框', '科技'], desc: '每个字外扩出一个描边框，科技感与结构感并存。', cfg: { kind: 'box', text: 'BOXED' } },
      { id: 'tx-scale', name: '逐字缩放', tags: ['缩放', '强调'], desc: '字符从极小放大落位，强调感强，适合关键词。', cfg: { kind: 'scale', text: 'GROW' } },
      { id: 'tx-skew', name: '斜切入场', tags: ['斜切', '速度'], desc: '字符带倾斜角度高速切入，节奏凌厉。', cfg: { kind: 'skew', text: 'FAST LANE' } },
      { id: 'tx-blurchar', name: '逐字显影', tags: ['虚化', '高级'], desc: '每个字符从模糊中聚焦，高级且克制。', cfg: { kind: 'blurchar', text: 'FOCUS' } },
      { id: 'tx-trackin', name: '聚拢字距', tags: ['字距', '收束'], desc: '字符从极宽字距聚拢到正常间距，有「合拢」的仪式感。', cfg: { kind: 'trackin', text: 'CONVERGE' } },
      { id: 'tx-lift-chars', name: '错落升起', tags: ['错落', '节奏'], desc: '放缓的逐字升起，配合更大字距，适合长句标题。', cfg: { kind: 'rise', text: 'EVERY WORD MATTERS', speed: 0.55, gap: 4, size: 240 } },
      { id: 'tx-bounce-cn', name: '中文弹跳', tags: ['中文', '活泼'], desc: '中文逐字弹跳的节奏更明显，适合社媒标题。', cfg: { kind: 'bounce', text: '爆款选品逻辑', gap: 6 } },
      { id: 'tx-wave-slow', name: '慢波荡漾', tags: ['慢速', '柔和'], desc: '放慢的波浪浮动，气质安静，适合生活方式内容。', cfg: { kind: 'wave', text: 'SLOW MOTION', speed: 0.45, gap: 8 } }
    ]
  });

  MF.forge({
    cat: '文字特效', type: 'block', dur: 6, poster: 0.58,
    params: TEXT_PARAMS, draw: textWholeDraw,
    ids: [
      { id: 'tx-gradient', name: '渐变流光', tags: ['渐变', '质感'], desc: '字面沿横向流动的渐变，色彩在字内穿行，质感现代。', cfg: { kind: 'gradient', text: 'GRADIENT FLOW' } },
      { id: 'tx-outline', name: '描边空心', tags: ['描边', '极简'], desc: '只有轮廓没有填充的空心字，极简且高级。', cfg: { kind: 'outline', text: 'OUTLINE' } },
      { id: 'tx-glitch', name: '故障闪切', tags: ['故障', '赛博'], desc: '带 RGB 分离与横向切片的故障效果，赛博风格代表。', cfg: { kind: 'glitch', text: 'GLITCH' } },
      { id: 'tx-maskrise', name: '遮罩上推', tags: ['遮罩', '干净'], desc: '文字像被上推的遮罩揭示，干净利落，是很高级的字幕手法。', cfg: { kind: 'maskrise', text: 'REVEAL' } },
      { id: 'tx-mirror', name: '镜像倒影', tags: ['镜像', '倒影'], desc: '文字下方带渐变倒影，适合发布会与产品名。', cfg: { kind: 'mirror', text: 'REFLECT' } },
      { id: 'tx-split', name: '上下分离', tags: ['分离', '层次'], desc: '文字被水平切开，上下两半分别移动，趣味性强。', cfg: { kind: 'split', text: 'SPLIT' } },
      { id: 'tx-stack', name: '重复叠影', tags: ['叠影', '动感'], desc: '多层错位叠影拉出运动拖尾，速度感强。', cfg: { kind: 'stack', text: 'ECHO' } },
      { id: 'tx-cycle', name: '色相循环', tags: ['变色', '循环'], desc: '色相持续循环变化，适合需要吸睛的循环标题。', cfg: { kind: 'cycle', text: 'COLOR LOOP' } },
      { id: 'tx-shine', name: '光泽扫过', tags: ['光泽', '质感'], desc: '一道高光横扫字面，像金属反光，质感强烈。', cfg: { kind: 'shine', text: 'METALLIC' } },
      { id: 'tx-extrude', name: '立体挤出', tags: ['立体', '3D'], desc: '文字向后挤出厚度并带透视方向，不做 3D 也有立体感。', cfg: { kind: 'extrude', text: 'DEPTH' } },
      { id: 'tx-gradient-wide', name: '宽字流光', tags: ['渐变', '宽幅'], desc: '更大字号配合更宽的流光范围，适合做封面主标。', cfg: { kind: 'gradient', text: 'JAYKOU', size: 176 } },
      { id: 'tx-outline-bold', name: '粗描边字', tags: ['描边', '力量'], desc: '加粗描边形成的力量型标题，适合运动与潮流主题。', cfg: { kind: 'outline', text: 'STRONG', size: 190 } },
      { id: 'tx-glitch-cn', name: '中文故障', tags: ['中文', '赛博'], desc: '中文语境下的故障闪切，适合科技评测与数码内容。', cfg: { kind: 'glitch', text: '系统异常', size: 150 } },
      { id: 'tx-shine-gold', name: '金色扫光', tags: ['金色', '质感'], desc: '偏暖的扫光质感，适合高单价产品与品牌片。', cfg: { kind: 'shine', text: 'PREMIUM', size: 168 } }
    ]
  });

  MF.forge({
    cat: '文字特效', type: 'block', dur: 7, poster: 0.5,
    params: TEXT_PARAMS, draw: textSpecialDraw,
    ids: [
      { id: 'tx-typewriter', name: '打字机', tags: ['打字', '叙事'], desc: '逐字敲出并有光标闪烁，适合口播字幕与叙事开场。', cfg: { kind: 'typewriter', text: 'Hello, World.' } },
      { id: 'tx-decode', name: '乱码解码', tags: ['解码', '科技'], desc: '字符在乱码中逐位解码成正确文字，数据感强。', cfg: { kind: 'decode', text: 'DECRYPTED' } },
      { id: 'tx-scramble', name: '字符滚动', tags: ['滚动', '科技'], desc: '字符高速滚动后逐位定格，是黑客与数据主题的标配。', cfg: { kind: 'scramble', text: 'SEQUENCE' } },
      { id: 'tx-countup', name: '数字滚动', tags: ['数字', '数据'], desc: '数字快速滚动到目标值并带千分位，适合战绩与数据播报。', cfg: { kind: 'countup', text: '1274580+', size: 240 } },
      { id: 'tx-vertical', name: '竖排文字', tags: ['竖排', '东方'], desc: '文字自上而下竖排，东方美学，适合中式与国风内容。', cfg: { kind: 'vertical', text: '纵横四海', size: 240 } },
      { id: 'tx-highlight', name: '荧光笔', tags: ['荧光笔', '强调'], desc: '一道荧光色从左扫过文字，是最直观的强调方式。', cfg: { kind: 'highlight', text: '重点来了', size: 240 } },
      { id: 'tx-matrix', name: '点阵成像', tags: ['点阵', '科技'], desc: '文字由点阵逐格点亮拼合而成，数字感极强。', cfg: { kind: 'matrix', text: 'MATRIX' } },
      { id: 'tx-fire', name: '火焰文字', tags: ['火焰', '热烈'], desc: '文字带真实火焰粒子燃烧，热烈有情绪，适合爆点内容。', cfg: { kind: 'fire', text: 'HOT!' } },
      { id: 'tx-liquid', name: '液态流动', tags: ['液态', '有机'], desc: '液面上升逐步淹没文字并填充渐变，有机流动感。', cfg: { kind: 'liquid', text: 'FLUID' } },
      { id: 'tx-neon', name: '霓虹灯管', tags: ['霓虹', '夜店'], desc: '霓虹管效果带闪烁，夜店与潮流场景的经典选择。', cfg: { kind: 'neon', text: 'OPEN' } },
      { id: 'tx-typewriter-cn', name: '中文打字', tags: ['中文', '叙事'], desc: '中文逐字敲出，适合口播与叙述型字幕。', cfg: { kind: 'typewriter', text: '我们先说结论。', size: 118 } },
      { id: 'tx-countup-percent', name: '百分比滚动', tags: ['百分比', '数据'], desc: '百分比数字滚动到目标值，适合增长与转化数据。', cfg: { kind: 'countup', text: '237%', size: 200 } },
      { id: 'tx-neon-cn', name: '中文霓虹', tags: ['中文', '霓虹'], desc: '中文霓虹灯管效果，适合餐饮与夜经济内容。', cfg: { kind: 'neon', text: '深夜食堂', size: 140 } }
    ]
  });
})();
