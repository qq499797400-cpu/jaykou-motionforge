/* ==========================================================================
   Jaykou 动效库 · 08
   原语：几何构成（用数学图形做视觉构成与循环动画）
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng;

  var GEO_PARAMS = [
    P('kind', '几何形态', 'poly-morph', sel('poly-morph', [
      ['poly-morph', '多边形变形'], ['star-draw', '星形绘制'], ['spiral-line', '螺旋线'],
      ['grid-wave', '网格波动'], ['ripple-rings', '同心圆环'], ['tri-grid', '三角阵列'],
      ['circle-pack', '圆形堆叠'], ['hex-mosaic', '蜂窝网格'], ['guilloche', '万花线'],
      ['mandala', '曼陀罗'], ['rosette', '玫瑰线'], ['truchet', '特鲁谢拼贴'],
      ['dots-wave', '点阵波'], ['sine-field', '正弦场'], ['squares', '同心方框'],
      ['dot-grid', '网点矩阵'], ['poly-net', '多边形网'], ['moire', '摩尔纹'],
      ['spiral-dots', '螺旋点阵'], ['arcs', '圆弧阵列'], ['cross-hatch', '交叉排线'],
      ['lissajous', '李萨如曲线'], ['rings-3d', '立体连环'], ['kaleido', '万花筒'],
      ['weave', '编织纹'], ['bricks', '砖阵'], ['stairs', '阶梯'], ['wave-rings', '波纹环']
    ])),
    P('size', '基准尺寸', 320, rng(320, 80, 620, 4)),
    P('count', '数量', 12, rng(12, 2, 48, 1)),
    P('stroke', '线宽', 3, rng(3, 0.6, 14, 0.2)),
    P('speed', '速度', 1, rng(1, 0.15, 3, 0.05)),
    P('rot', '旋转', 0.5, rng(0.5, -1, 1, 0.05)),
    P('glow', '辉光', 0.5, rng(0.5, 0, 1, 0.05))
  ];

  function geoDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var cx = W / 2, cy = H / 2;
    var k = e.outCubic(U.clamp(t / 1.5, 0, 1));
    var kind = p.kind;
    var n = Math.max(2, Math.round(p.count));
    var base = p.size * S * k;
    var lw = p.stroke * S;
    var sp = Math.max(0.1, p.speed);
    var rot = t * p.rot * sp * 0.5;
    var i, a;

    ctx.save();
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.8); ctx.shadowBlur = 22 * S * p.glow; }

    if (kind === 'poly-morph') {
      var sides = n < 3 ? 3 : n;
      var wob = Math.sin(t * sp * 1.4) * 0.5 + 0.5;
      ctx.beginPath();
      for (i = 0; i <= 260; i++) {
        var ang = Math.PI * 2 * i / 260 - Math.PI / 2;
        var rad = base * (0.72 + 0.28 * Math.cos(sides * ang + t * sp) * wob);
        var px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
      var pg = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
      pg.addColorStop(0, U.accent); pg.addColorStop(1, U.accent2);
      ctx.strokeStyle = pg;
      ctx.stroke();
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = U.mix(U.accent, U.bg1, 0.45);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'star-draw') {
      var pts = n < 3 ? 5 : n;
      ctx.beginPath();
      for (i = 0; i <= pts * 2; i++) {
        var rr = i % 2 ? base * 0.42 : base;
        var ag = Math.PI * i / pts - Math.PI / 2 + rot;
        var sx2 = cx + Math.cos(ag) * rr, sy2 = cy + Math.sin(ag) * rr;
        if (i) ctx.lineTo(sx2, sy2); else ctx.moveTo(sx2, sy2);
      }
      ctx.closePath();
      ctx.strokeStyle = U.accent;
      ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = U.rgba(U.accent2, 0.7);
      ctx.lineWidth = lw * 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spiral-line') {
      ctx.beginPath();
      var turns = n / 2 > 1 ? n / 2 : 2;
      var steps = 460;
      for (i = 0; i <= steps; i++) {
        var fr = i / steps;
        var aa = fr * Math.PI * 2 * turns + rot;
        var rr2 = base * Math.pow(fr, 0.72);
        var sxp = cx + Math.cos(aa) * rr2, syp = cy + Math.sin(aa) * rr2;
        if (i) ctx.lineTo(sxp, syp); else ctx.moveTo(sxp, syp);
      }
      var sg = ctx.createLinearGradient(cx - base, cy, cx + base, cy);
      sg.addColorStop(0, U.accent); sg.addColorStop(1, U.accent2);
      ctx.strokeStyle = sg;
      ctx.stroke();
    }

    else if (kind === 'grid-wave') {
      var cols = n, rows = Math.max(2, Math.round(n * H / W));
      var gx = W / (cols - 1), gy = H / (rows - 1);
      ctx.strokeStyle = U.rgba(U.ink, 0.55);
      ctx.lineWidth = lw * 0.7;
      for (var gyy = 0; gyy < rows; gyy++) {
        ctx.beginPath();
        for (var gxx = 0; gxx < cols; gxx++) {
          var px2 = gxx * gx;
          var py2 = gyy * gy + Math.sin(gxx * 0.5 + t * sp * 2 - gyy * 0.3) * 26 * S * k;
          if (gxx) ctx.lineTo(px2, py2); else ctx.moveTo(px2, py2);
        }
        ctx.globalAlpha = 0.35 + 0.65 * (gyy / rows);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'ripple-rings') {
      var maxR = Math.min(W, H) * 0.62;
      for (i = 0; i < n; i++) {
        var ph = (t * sp * 0.42 + i / n) % 1;
        var rr3 = maxR * ph;
        ctx.globalAlpha = (1 - ph) * 0.9 * k;
        ctx.beginPath();
        ctx.arc(cx, cy, rr3, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * (0.5 + (1 - ph));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'tri-grid') {
      var tCols = n, tRows = Math.max(2, Math.round(n * 0.6));
      var tW = W / tCols, tH = H / tRows;
      for (var tr = 0; tr < tRows; tr++) {
        for (var tc = 0; tc < tCols; tc++) {
          var dly = (tr + tc) * 0.09;
          var kk = e.outCubic(U.clamp((t * sp - dly) / 0.9, 0, 1));
          if (kk <= 0) continue;
          var ox = tc * tW, oy = tr * tH;
          var up = (tr + tc) % 2 === 0;
          ctx.beginPath();
          if (up) { ctx.moveTo(ox + tW / 2, oy + tH * (1 - kk)); ctx.lineTo(ox + tW * kk, oy + tH); ctx.lineTo(ox + tW - tW * kk, oy + tH); }
          else { ctx.moveTo(ox + tW / 2, oy + tH * kk); ctx.lineTo(ox + tW * kk, oy); ctx.lineTo(ox + tW - tW * kk, oy); }
          ctx.closePath();
          ctx.strokeStyle = U.rgba(U.accent, 0.85);
          ctx.lineWidth = lw * 0.8;
          ctx.stroke();
        }
      }
    }

    else if (kind === 'circle-pack') {
      ctx.strokeStyle = U.accent;
      for (i = 0; i < n; i++) {
        var ph2 = (i / n + t * sp * 0.12) % 1;
        var rr4 = base * 0.92 * ph2;
        ctx.globalAlpha = (1 - ph2) * 0.85;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(i * 2.399) * base * 0.16, cy + Math.sin(i * 2.399) * base * 0.16, rr4, 0, Math.PI * 2);
        ctx.lineWidth = lw;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = U.ink;
      ctx.lineWidth = lw * 1.2;
      ctx.stroke();
    }

    else if (kind === 'hex-mosaic') {
      var hr = base / Math.max(3, n) * 1.55;
      var colW = hr * 1.732, rowH = hr * 1.5;
      for (var ry2 = -2; ry2 * rowH < H + rowH * 2; ry2++) {
        for (var rx2 = -2; rx2 * colW < W + colW * 2; rx2++) {
          var hcx = rx2 * colW + (ry2 % 2 ? colW / 2 : 0), hcy = ry2 * rowH;
          var dd = Math.hypot(hcx - cx, hcy - cy) / (Math.min(W, H) * 0.5);
          var vis = U.clamp(k * 1.4 - dd * 0.7, 0, 1);
          if (vis <= 0.02) continue;
          ctx.globalAlpha = vis * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(dd * 5 - t * sp * 2.2)));
          ctx.beginPath();
          for (i = 0; i < 6; i++) {
            a = Math.PI * 2 * i / 6;
            var hx = hcx + hr * Math.cos(a), hy = hcy + hr * Math.sin(a);
            if (i) ctx.lineTo(hx, hy); else ctx.moveTo(hx, hy);
          }
          ctx.closePath();
          ctx.strokeStyle = U.accent;
          ctx.lineWidth = lw * 0.7;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'guilloche') {
      var R = base * 0.85, rr5 = base * 0.34;
      var pts = Math.max(6, n);
      for (var li = 0; li < 5; li++) {
        ctx.beginPath();
        for (i = 0; i <= 720; i++) {
          var th = i / 720 * Math.PI;
          var x5 = cx + R * Math.cos(th + rot) + rr5 * Math.cos(pts * th + li * 0.35);
          var y5 = cy + R * Math.sin(th + rot) + rr5 * Math.sin(pts * th + li * 0.35);
          if (i) ctx.lineTo(x5, y5); else ctx.moveTo(x5, y5);
        }
        ctx.strokeStyle = U.rgba(li % 2 ? U.accent2 : U.accent, 0.75);
        ctx.lineWidth = lw * 0.6;
        ctx.stroke();
      }
    }

    else if (kind === 'mandala') {
      var petals = n;
      for (var ring = 0; ring < 3; ring++) {
        var rr6 = base * (0.4 + ring * 0.3);
        for (i = 0; i < petals; i++) {
          a = Math.PI * 2 * i / petals + rot * (1 + ring * 0.3);
          var mx = cx + Math.cos(a) * rr6, my = cy + Math.sin(a) * rr6;
          ctx.beginPath();
          ctx.arc(mx, my, base * 0.16 * (1 - ring * 0.18), 0, Math.PI * 2);
          ctx.strokeStyle = U.rgba(ring % 2 ? U.accent2 : U.accent, 0.8);
          ctx.lineWidth = lw * 0.8;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = U.accent;
      ctx.beginPath(); ctx.arc(cx, cy, base * 0.98, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    else if (kind === 'rosette') {
      var kk2 = n / 2;
      ctx.beginPath();
      for (i = 0; i <= 1440; i++) {
        var th2 = i / 1440 * Math.PI * 2;
        var rad3 = base * Math.abs(Math.cos(kk2 * th2 + t * sp)); 
        var xr = cx + Math.cos(th2) * rad3, yr = cy + Math.sin(th2) * rad3;
        if (i) ctx.lineTo(xr, yr); else ctx.moveTo(xr, yr);
      }
      ctx.closePath();
      var rg = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
      rg.addColorStop(0, U.accent); rg.addColorStop(0.5, U.accent2); rg.addColorStop(1, U.accent);
      ctx.strokeStyle = rg;
      ctx.lineWidth = lw * 0.7;
      ctx.stroke();
    }

    else if (kind === 'truchet') {
      var tN = Math.max(3, Math.round(n * 0.8));
      var cw = W / tN, ch = H / Math.max(3, Math.round(tN * H / W));
      for (var ty = 0; ty * ch < H; ty++) {
        for (var tx = 0; tx * cw < W; tx++) {
          var arc = U.rng(ty * 97 + tx * 31) > 0.5;
          var flip = U.rng(ty * 53 + tx * 71) > 0.5;
          var oy2 = ty * ch, ox2 = tx * cw;
          var kv = e.outCubic(U.clamp((t * sp - (tx + ty) * 0.05) / 1.2, 0, 1));
          ctx.save();
          ctx.globalAlpha = kv * 0.9;
          ctx.strokeStyle = (tx + ty) % 3 ? U.accent : U.accent2;
          ctx.lineWidth = lw * 0.7;
          var r3 = cw / 2;
          ctx.beginPath();
          if (arc) {
            ctx.arc(ox2 + (flip ? cw : 0), oy2, r3, flip ? Math.PI : 0, flip ? Math.PI * 2 : Math.PI);
            ctx.moveTo(ox2 + (flip ? 0 : cw), oy2 + ch);
            ctx.arc(ox2 + (flip ? cw : 0), oy2 + ch, r3, flip ? Math.PI * 2 : Math.PI, flip ? Math.PI * 3 : Math.PI * 2);
          } else {
            ctx.arc(ox2, oy2 + (flip ? 0 : ch), r3, flip ? Math.PI * 1.5 : Math.PI * 0.5, flip ? Math.PI * 2.5 : Math.PI * 1.5);
            ctx.moveTo(ox2 + cw, oy2 + (flip ? ch : 0));
            ctx.arc(ox2 + cw, oy2 + (flip ? 0 : ch), r3, flip ? Math.PI * 0.5 : Math.PI * 1.5, flip ? Math.PI * 1.5 : Math.PI * 2.5);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    else if (kind === 'dots-wave') {
      var dCols = n, dRows = Math.max(2, Math.round(n * H / W * 0.6));
      var dgx = W / (dCols - 1), dgy = H / (dRows - 1);
      for (var dr = 0; dr < dRows; dr++) {
        for (var dc = 0; dc < dCols; dc++) {
          var wave = Math.sin(dc * 0.42 + t * sp * 2.2) * Math.cos(dr * 0.42 - t * sp * 1.6);
          var rad4 = (3 + 9 * (0.5 + 0.5 * wave)) * S * k;
          ctx.globalAlpha = 0.28 + 0.72 * (0.5 + 0.5 * wave);
          ctx.beginPath();
          ctx.arc(dc * dgx, dr * dgy, rad4, 0, Math.PI * 2);
          ctx.fillStyle = wave > 0 ? U.accent : U.accent2;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'sine-field') {
      var lines = n;
      for (i = 0; i < lines; i++) {
        ctx.beginPath();
        var baseY = H * (i + 0.5) / lines;
        for (var xx = 0; xx <= W; xx += 10) {
          var yy = baseY + Math.sin(xx * 0.006 + t * sp * 1.8 + i * 0.42) * 40 * S * k;
          if (xx) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
        }
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent2 : U.accent, 0.72);
        ctx.lineWidth = lw * 0.55;
        ctx.stroke();
      }
    }

    else if (kind === 'squares') {
      for (i = n; i > 0; i--) {
        var side = base * (i / n) * 1.35;
        ctx.globalAlpha = 0.9 * (1 - i / (n * 1.4));
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * 0.8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot + i * 0.06);
        ctx.strokeRect(-side / 2, -side / 2, side, side);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'dot-grid') {
      var dn = n;
      var sp2 = Math.min(W, H) / (dn + 1);
      for (var gy3 = 0; gy3 < Math.ceil(H / sp2); gy3++) {
        for (var gx3 = 0; gx3 < Math.ceil(W / sp2); gx3++) {
          var dx3 = (gx3 + 0.5) * sp2, dy3 = (gy3 + 0.5) * sp2;
          var dist2 = Math.hypot(dx3 - cx, dy3 - cy) / (Math.min(W, H) * 0.62);
          var pulse = 0.5 + 0.5 * Math.sin(dist2 * 8 - t * sp * 2.6);
          var r5 = (2 + 7 * pulse) * S * k;
          ctx.globalAlpha = (1 - dist2 * 0.65) * (0.4 + 0.6 * pulse);
          ctx.beginPath();
          ctx.arc(dx3, dy3, r5, 0, Math.PI * 2);
          ctx.fillStyle = pulse > 0.5 ? U.accent : U.mix(U.ink, U.accent2, 0.5);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'poly-net') {
      var pn = Math.max(3, Math.min(9, n));
      var pr = base * 0.9;
      var verts = [];
      for (i = 0; i < pn; i++) {
        a = Math.PI * 2 * i / pn - Math.PI / 2 + rot;
        verts.push([cx + Math.cos(a) * pr, cy + Math.sin(a) * pr]);
      }
      for (i = 0; i < pn; i++) {
        for (var j = i + 1; j < pn; j++) {
          ctx.globalAlpha = 0.28 + 0.5 * k;
          ctx.beginPath();
          ctx.moveTo(verts[i][0], verts[i][1]);
          ctx.lineTo(verts[j][0], verts[j][1]);
          ctx.strokeStyle = (i + j) % 2 ? U.rgba(U.accent, 0.8) : U.rgba(U.accent2, 0.8);
          ctx.lineWidth = lw * 0.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < pn; i++) {
        ctx.beginPath();
        ctx.arc(verts[i][0], verts[i][1], 5 * S * k, 0, Math.PI * 2);
        ctx.fillStyle = U.ink;
        ctx.fill();
      }
    }

    else if (kind === 'moire') {
      var mo = Math.max(4, n);
      for (i = 0; i < mo; i++) {
        var off = i / mo * 26 * S;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = i % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * 0.5;
        for (var m = 0; m < mo; m++) {
          ctx.beginPath();
          ctx.arc(cx - off + Math.sin(t * sp * 0.5) * 20 * S, cy, base * (0.3 + m / mo * 0.9) * k, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'spiral-dots') {
      var total = n * 12;
      for (i = 0; i < total; i++) {
        var ft = i / total;
        var aa2 = ft * Math.PI * 2 * 4.5 + rot;
        var rr7 = base * Math.pow(ft, 0.65);
        var dotR = (2 + 7 * ft) * S * k;
        ctx.globalAlpha = (0.35 + 0.65 * ft) * k;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(aa2) * rr7, cy + Math.sin(aa2) * rr7, dotR, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 ? U.accent : U.mix(U.ink, U.accent2, 0.4);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'arcs') {
      var an = n;
      for (i = 0; i < an; i++) {
        var ph3 = i / an;
        var start = ph3 * Math.PI * 2 + t * sp * 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, base * (0.35 + 0.6 * ph3), start, start + Math.PI * 0.72);
        ctx.strokeStyle = U.rgba(i % 2 ? U.accent : U.accent2, 0.9 - ph3 * 0.4);
        ctx.lineWidth = lw * (0.8 + ph3);
        ctx.stroke();
      }
    }

    else if (kind === 'cross-hatch') {
      var hn = n;
      for (i = -hn; i <= hn; i++) {
        var shift = (Math.sin(t * sp + i * 0.3) * 0.5 + 0.5) * 40 * S * k;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = U.rgba(U.accent, 0.75);
        ctx.lineWidth = lw * 0.5;
        ctx.beginPath(); ctx.moveTo(cx + i * 46 * S * k - shift, cy - base); ctx.lineTo(cx + i * 46 * S * k + shift, cy + base); ctx.stroke();
        ctx.strokeStyle = U.rgba(U.accent2, 0.75);
        ctx.beginPath(); ctx.moveTo(cx - base, cy + i * 46 * S * k - shift); ctx.lineTo(cx + base, cy + i * 46 * S * k + shift); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'lissajous') {
      var A = n, B = n + 2;
      ctx.beginPath();
      for (i = 0; i <= 1200; i++) {
        var lt = i / 1200 * Math.PI * 2;
        var lx2 = cx + Math.sin(A * lt + t * sp * 0.5) * base * 0.9;
        var ly2 = cy + Math.sin(B * lt) * base * 0.9;
        if (i) ctx.lineTo(lx2, ly2); else ctx.moveTo(lx2, ly2);
      }
      var lg3 = ctx.createLinearGradient(cx - base, cy - base, cx + base, cy + base);
      lg3.addColorStop(0, U.accent); lg3.addColorStop(1, U.accent2);
      ctx.strokeStyle = lg3;
      ctx.lineWidth = lw * 0.65;
      ctx.stroke();
    }

    else if (kind === 'rings-3d') {
      for (var r8 = 0; r8 < n; r8++) {
        var ang8 = t * sp * 0.6 + r8 * 0.42;
        var stretch = 0.25 + 0.75 * Math.abs(Math.cos(ang8));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang8 * 0.6);
        ctx.scale(1, stretch);
        ctx.beginPath();
        ctx.arc(0, 0, base * (0.4 + r8 / n * 0.7), 0, Math.PI * 2);
        ctx.strokeStyle = U.rgba(r8 % 2 ? U.accent2 : U.accent, 0.8 - r8 / n * 0.4);
        ctx.lineWidth = lw;
        ctx.stroke();
        ctx.restore();
      }
    }

    else if (kind === 'kaleido') {
      var segs = Math.max(4, n);
      for (var sg2 = 0; sg2 < segs; sg2++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sg2 * Math.PI * 2 / segs + rot * 0.5);
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = sg2 % 2 ? U.accent : U.accent2;
        ctx.lineWidth = lw * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (i = 0; i <= 40; i++) {
          var kf = i / 40;
          var kr = base * kf;
          var ka = Math.sin(kf * Math.PI * 2 + t * sp * 2) * 0.5 * (1 - kf);
          ctx.lineTo(Math.cos(ka) * kr, Math.sin(ka) * kr);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'weave') {
      var wn = Math.max(3, Math.round(n * 0.7));
      var ww = Math.min(W, H) / wn;
      for (var wy = 0; wy < Math.ceil(H / ww); wy++) {
        for (var wx = 0; wx < Math.ceil(W / ww); wx++) {
          var horiz = (wx + wy) % 2 === 0;
          var wv = 0.5 + 0.5 * Math.sin((wx + wy) * 0.6 - t * sp * 2);
          ctx.globalAlpha = 0.25 + 0.6 * wv * k;
          ctx.strokeStyle = horiz ? U.accent : U.accent2;
          ctx.lineWidth = lw * (0.5 + wv);
          ctx.beginPath();
          if (horiz) { ctx.moveTo(wx * ww + ww * 0.12, wy * ww + ww / 2); ctx.lineTo(wx * ww + ww * 0.88, wy * ww + ww / 2); }
          else { ctx.moveTo(wx * ww + ww / 2, wy * ww + ww * 0.12); ctx.lineTo(wx * ww + ww / 2, wy * ww + ww * 0.88); }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'bricks') {
      var bRows = Math.max(3, Math.round(n * 0.6));
      var bH = H / bRows;
      var bW = Math.min(W, H) / n;
      for (var br = 0; br < bRows; br++) {
        var offset = (br % 2) * bW / 2;
        for (var bc = -1; bc * bW < W + bW; bc++) {
          var bkx = bc * bW + offset, bky = br * bH;
          var bK = e.outCubic(U.clamp((t * sp - (br + bc) * 0.08) / 0.9, 0, 1));
          if (bK <= 0.02) continue;
          ctx.globalAlpha = 0.85 * bK;
          ctx.strokeStyle = (br + bc) % 2 ? U.accent : U.accent2;
          ctx.lineWidth = lw * 0.65;
          U.rr(ctx, bkx + 3 * S, bky + 3 * S, bW * bK - 6 * S, bH * 0.82 - 6 * S, 5 * S);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'stairs') {
      var sn = n;
      var stW = W / (sn + 1), stH = H / (sn + 1);
      for (i = 0; i < sn; i++) {
        var pv = 0.5 + 0.5 * Math.sin(i * 0.5 - t * sp * 1.6);
        ctx.globalAlpha = 0.3 + 0.7 * pv * k;
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        var bh2 = stH * (0.3 + pv * 0.7) * k;
        U.rr(ctx, stW * 0.5 + i * stW, H * 0.8 - bh2, stW * 0.62, bh2, 6 * S);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    else if (kind === 'wave-rings') {
      for (i = 0; i < n; i++) {
        var wph = (i / n + t * sp * 0.3) % 1;
        var wr = base * 1.1 * wph;
        ctx.globalAlpha = (1 - wph) * 0.8 * k;
        ctx.beginPath();
        for (var wa = 0; wa <= 140; wa++) {
          var wang = Math.PI * 2 * wa / 140;
          var wrr = wr * (1 + 0.12 * Math.sin(wang * 6 + t * sp * 3));
          var wxp = cx + Math.cos(wang) * wrr, wyp = cy + Math.sin(wang) * wrr;
          if (wa) ctx.lineTo(wxp, wyp); else ctx.moveTo(wxp, wyp);
        }
        ctx.closePath();
        ctx.strokeStyle = i % 2 ? U.accent2 : U.accent;
        ctx.lineWidth = lw * 0.8;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    else {
      ctx.strokeStyle = U.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, base, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* 主题文案覆盖：几何类动效可加中央标题 */
  MF.forge({
    cat: '几何构成', type: 'block', dur: 6, poster: 0.7,
    params: GEO_PARAMS, draw: geoDraw,
    ids: [
      { id: 'geo-poly-morph', name: '多边形变形', tags: ['多边形', '变形'], desc: '圆与多边形之间连续呼吸式变形，是数据与科技主题的通用底纹。', cfg: { kind: 'poly-morph', count: 5, size: 340 } },
      { id: 'geo-star-draw', name: '星形绘制', tags: ['星形', '对称'], desc: '多角星缓慢旋转并呼吸，适合奖项与荣誉类画面。', cfg: { kind: 'star-draw', count: 8, size: 360 } },
      { id: 'geo-spiral', name: '螺旋线', tags: ['螺旋', '生长'], desc: '螺旋线自中心展开，有生长与递归的秩序感。', cfg: { kind: 'spiral-line', count: 12, size: 420 } },
      { id: 'geo-grid-wave', name: '网格波动', tags: ['网格', '波动'], desc: '网格线随正弦波起伏，是最通用的科技感底纹之一。', cfg: { kind: 'grid-wave', count: 22 } },
      { id: 'geo-ripple', name: '同心圆环', tags: ['圆环', '扩散'], desc: '圆环持续向外扩散消失，节奏稳定，适合等待与加载场景。', cfg: { kind: 'ripple-rings', count: 6, size: 340 } },
      { id: 'geo-tri-grid', name: '三角阵列', tags: ['三角', '几何'], desc: '三角格依次升起，几何构成感强，适合建筑与结构主题。', cfg: { kind: 'tri-grid', count: 16 } },
      { id: 'geo-circle-pack', name: '圆形堆叠', tags: ['圆形', '层次'], desc: '多层圆环由内向外扩散堆叠，层次分明。', cfg: { kind: 'circle-pack', count: 9, size: 360 } },
      { id: 'geo-hex', name: '蜂窝网格', tags: ['蜂窝', '科技'], desc: '六边形网格呼吸闪烁，科技与化工主题的经典底纹。', cfg: { kind: 'hex-mosaic', size: 320, count: 12 } },
      { id: 'geo-guilloche', name: '万花线', tags: ['万花', '精密'], desc: '精密仪器式的万花线，带机械与金融票据的质感。', cfg: { kind: 'guilloche', count: 9, size: 380 } },
      { id: 'geo-mandala', name: '曼陀罗', tags: ['曼陀罗', '对称'], desc: '多层圆点构成的曼陀罗缓慢旋转，东方与神秘气质。', cfg: { kind: 'mandala', count: 10, size: 380 } },
      { id: 'geo-rosette', name: '玫瑰线', tags: ['玫瑰线', '数学'], desc: '经典玫瑰线在旋转中不断变换花瓣形态，数学之美。', cfg: { kind: 'rosette', count: 8, size: 400 } },
      { id: 'geo-truchet', name: '特鲁谢拼贴', tags: ['拼贴', '随机'], desc: '随机圆弧拼贴成连续路径，像管道与电路，生成感强。', cfg: { kind: 'truchet', count: 14 } },
      { id: 'geo-dots', name: '点阵波', tags: ['点阵', '波动'], desc: '点阵随双重正弦起伏，柔和且规律，适合大面积铺底。', cfg: { kind: 'dots-wave', count: 24 } },
      { id: 'geo-sine', name: '正弦场', tags: ['正弦', '流动'], desc: '多条正弦曲线并行流动，干净且有秩序。', cfg: { kind: 'sine-field', count: 11 } },
      { id: 'geo-squares', name: '同心方框', tags: ['方框', '聚焦'], desc: '方框逐层旋转收拢，聚焦感强，适合强调某个中心元素。', cfg: { kind: 'squares', count: 12, size: 330 } },
      { id: 'geo-dotgrid', name: '网点矩阵', tags: ['网点', '呼吸'], desc: '网点矩阵按距离脉冲呼吸，有放射状的律动。', cfg: { kind: 'dot-grid', count: 16 } },
      { id: 'geo-polynet', name: '多边形网', tags: ['完全图', '结构'], desc: '所有顶点两两连线形成关系网，适合生态与网络主题。', cfg: { kind: 'poly-net', count: 7, size: 360 } },
      { id: 'geo-moire', name: '摩尔纹', tags: ['摩尔纹', '迷幻'], desc: '多组同心圆叠加产生摩尔纹，迷幻且高级。', cfg: { kind: 'moire', count: 7, size: 340 } },
      { id: 'geo-spiral-dots', name: '螺旋点阵', tags: ['螺旋', '点阵'], desc: '点沿螺旋线排布并旋转，结构感与秩序感兼备。', cfg: { kind: 'spiral-dots', count: 11, size: 400 } },
      { id: 'geo-arcs', name: '圆弧阵列', tags: ['圆弧', '旋转'], desc: '多层圆弧错位旋转，像仪表盘与雷达。', cfg: { kind: 'arcs', count: 8, size: 350 } },
      { id: 'geo-hatch', name: '交叉排线', tags: ['排线', '手绘'], desc: '交叉排线带轻微摆动，有手绘与版画的质感。', cfg: { kind: 'cross-hatch', count: 9, size: 300 } },
      { id: 'geo-lissajous', name: '李萨如曲线', tags: ['曲线', '数学'], desc: '李萨如曲线在振荡中不断重绘，优雅且数学感强。', cfg: { kind: 'lissajous', count: 5, size: 380 } },
      { id: 'geo-rings3d', name: '立体连环', tags: ['立体', '连环'], desc: '圆环带透视翻转形成立体连环，空间感强。', cfg: { kind: 'rings-3d', count: 10, size: 360 } },
      { id: 'geo-kaleido', name: '万花筒', tags: ['万花筒', '对称'], desc: '镜像对称的放射结构，像万花筒一样不断变化。', cfg: { kind: 'kaleido', count: 12, size: 380 } },
      { id: 'geo-weave', name: '编织纹', tags: ['编织', '纹理'], desc: '横竖交替的编织纹理持续波动，适合做质感底纹。', cfg: { kind: 'weave', count: 14 } },
      { id: 'geo-bricks', name: '砖阵', tags: ['砖块', '构建'], desc: '砖块逐块垒起，有建造与积累的隐喻。', cfg: { kind: 'bricks', count: 10 } },
      { id: 'geo-stairs', name: '阶梯韵律', tags: ['阶梯', '节奏'], desc: '柱状阶梯随波起伏跳动的韵律。', cfg: { kind: 'stairs', count: 16, size: 320 } },
      { id: 'geo-wave-rings', name: '波纹环', tags: ['波纹', '柔性'], desc: '边缘带波动的圆环向外扩散，柔性且有生命力。', cfg: { kind: 'wave-rings', count: 6, size: 340 } }
    ]
  });
})();
