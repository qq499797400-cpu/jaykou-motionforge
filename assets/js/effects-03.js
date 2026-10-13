/* ==========================================================================
   Jaykou 动效库 · 03
   交互与卡片 / 粒子与反馈 / 材质与纹理
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* ══════════════════════════ 交互与卡片 ══════════════════════════ */

  MF.register({
    id: 'card-stack', name: '卡片堆叠', cat: '交互与卡片', type: 'block', dur: 9, poster: 0.8,
    desc: '一叠卡片从牌堆中依次抽出并扇形展开，每张到位后带轻微回弹与投影变化，适合功能罗列。',
    tags: ['卡片', '扇形', '展开'],
    params: [
      { k: 'labels', label: '卡片文案（逗号分隔）', type: 'textarea', def: '选品,定价,视觉,投放,复盘' },
      { k: 'spread', label: '展开角度', type: 'range', min: 0.1, max: 1.4, step: 0.05, def: 0.85 },
      { k: 'stagger', label: '错峰', type: 'range', min: 0.05, max: 0.8, step: 0.05, def: 0.24 },
      { k: 'fan', label: '扇形展开', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var names = String(p.labels || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = names.length || 1;
      var cw = W * 0.2, ch = cw * 1.32;
      var cx = W / 2, cy = H * 0.56;
      for (var i = n - 1; i >= 0; i--) {
        var pr = e.outBack(U.clamp((t - 0.35 - i * p.stagger) / 1, 0, 1));
        var norm = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
        var ang = p.fan ? norm * p.spread * 0.5 : 0;
        var ox = p.fan ? norm * cw * 0.62 : 0;
        var oy = p.fan ? Math.abs(norm) * ch * 0.14 : -i * 18 * S;
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 0.35 - i * p.stagger) / 0.5, 0, 1);
        ctx.translate(cx + ox * pr, cy + oy * pr);
        ctx.rotate(ang * pr);
        var lift = e.outCubic(U.clamp((t - 1.6 - i * p.stagger) / 0.9, 0, 1));
        ctx.translate(0, -lift * 22 * S);
        ctx.rotate(lift * Math.sin(t * 1.1 + i) * 0.02);
        ctx.shadowColor = 'rgba(0,0,0,.5)';
        ctx.shadowBlur = (36 + lift * 30) * S;
        ctx.shadowOffsetY = (18 + lift * 16) * S;
        U.rr(ctx, -cw / 2, -ch / 2, cw, ch, 24 * S);
        var g = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
        g.addColorStop(0, U.mix(U.bg2, U.accent, 0.12 + (i % 3) * 0.06));
        g.addColorStop(1, U.bg1);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = U.rgba(U.ink, 0.16);
        ctx.lineWidth = 1.4 * S;
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = i % 2 ? U.accent : U.accent2;
        U.rr(ctx, -cw / 2 + 26 * S, -ch / 2 + 26 * S, cw * 0.16, cw * 0.16, cw * 0.05);
        ctx.fill();
        ctx.fillStyle = U.ink;
        ctx.font = U.fs(30 * S, 700);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(names[i], -cw / 2 + 26 * S, ch / 2 - 92 * S);
        ctx.fillStyle = U.rgba(U.ink, 0.22);
        U.rr(ctx, -cw / 2 + 26 * S, ch / 2 - 72 * S, cw - 52 * S, 9 * S, 5 * S);
        ctx.fill();
        U.rr(ctx, -cw / 2 + 26 * S, ch / 2 - 52 * S, (cw - 52 * S) * 0.6, 9 * S, 5 * S);
        ctx.fill();
        ctx.fillStyle = U.rgba(U.ink, 0.5);
        ctx.font = U.fs(16 * S, 500, true);
        ctx.fillText(String(i + 1).padStart(2, '0'), -cw / 2 + 26 * S, -ch / 2 + 40 * S);
        ctx.restore();
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'list-stagger', name: '清单错落', cat: '交互与卡片', type: 'block', dur: 8, poster: 0.8,
    desc: '待办清单逐行滑入，每行尾部的对勾用描边动画勾出并扩散一圈光晕，适合功能清单与流程确认。',
    tags: ['清单', '对勾', '依次'],
    params: [
      { k: 'items', label: '条目（每行一条）', type: 'textarea', def: '绑定动效参数|实时预览渲染|一键导出视频|同步到项目' },
      { k: 'width', label: '行宽', type: 'range', min: 0.4, max: 0.86, step: 0.02, def: 0.66 },
      { k: 'stagger', label: '错峰', type: 'range', min: 0.1, max: 1.2, step: 0.05, def: 0.42 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var items = String(p.items || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var rows = items.length || 1;
      var lw = W * p.width, lh = Math.min(96 * S, (H * 0.66) / rows - 18 * S);
      var x0 = (W - lw) / 2;
      var total = rows * (lh + 18 * S);
      var y0 = H / 2 - total / 2 + 9 * S;
      for (var i = 0; i < rows; i++) {
        var pr = U.clamp((t - 0.3 - i * p.stagger) / 0.7, 0, 1);
        var k = e.outExpo(pr);
        var y = y0 + i * (lh + 18 * S);
        ctx.save();
        ctx.globalAlpha = U.clamp(pr * 2, 0, 1);
        ctx.translate(x0 + (1 - k) * -70 * S, 0);
        ctx.shadowColor = 'rgba(0,0,0,.4)';
        ctx.shadowBlur = 28 * S;
        U.rr(ctx, 0, y, lw, lh, lh * 0.3);
        var g = ctx.createLinearGradient(0, 0, lw, 0);
        g.addColorStop(0, U.rgba(U.ink, 0.1));
        g.addColorStop(1, U.rgba(U.ink, 0.035));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = U.rgba(U.ink, 0.13);
        ctx.lineWidth = 1.2 * S;
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = U.accent;
        ctx.beginPath();
        ctx.arc(lh * 0.5, y + lh / 2, lh * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = U.rgba(U.ink, 0.88);
        ctx.font = U.fs(lh * 0.28, 600);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(items[i], lh * 0.95, y + lh / 2);
        /* 对勾 */
        var cp = e.outCubic(U.clamp((t - 0.9 - i * p.stagger) / 0.6, 0, 1));
        var ccx = lw - lh * 0.62, ccy = y + lh / 2, rad = lh * 0.26;
        ctx.save();
        ctx.globalAlpha = cp * 0.35;
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = 2 * S;
        ctx.beginPath();
        ctx.arc(ccx, ccy, rad * (1 + cp * 1.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = U.clamp((t - 0.85 - i * p.stagger) / 0.4, 0, 1);
        ctx.strokeStyle = U.accent;
        ctx.lineWidth = 4.4 * S;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        var cpts = [[ccx - rad * 0.55, ccy + rad * 0.02], [ccx - rad * 0.12, ccy + rad * 0.45], [ccx + rad * 0.6, ccy - rad * 0.48]];
        var segs = [], tt = 0;
        for (var s2 = 1; s2 < cpts.length; s2++) {
          var d = Math.hypot(cpts[s2][0] - cpts[s2 - 1][0], cpts[s2][1] - cpts[s2 - 1][1]);
          segs.push(d); tt += d;
        }
        var want = tt * cp, acc = 0, started = false;
        ctx.beginPath();
        for (var s3 = 0; s3 < segs.length; s3++) {
          var A = cpts[s3], B = cpts[s3 + 1];
          if (acc + segs[s3] <= want) {
            if (!started) { ctx.moveTo(A[0], A[1]); started = true; }
            ctx.lineTo(B[0], B[1]);
          } else if (acc < want) {
            var f = (want - acc) / segs[s3];
            if (!started) { ctx.moveTo(A[0], A[1]); started = true; }
            ctx.lineTo(U.lerp(A[0], B[0], f), U.lerp(A[1], B[1], f));
          }
          acc += segs[s3];
        }
        ctx.stroke();
        ctx.restore();
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'switch-toggle', name: '开关切换', cat: '交互与卡片', type: 'block', dur: 6, poster: 0.5,
    desc: '大号开关在开与关之间来回切换，滑块带弹性位移与扩散涟漪，两侧标签同步高亮。',
    tags: ['开关', '涟漪', '状态'],
    params: [
      { k: 'on', label: '开启文案', type: 'text', def: 'ON · 已启用' },
      { k: 'off', label: '关闭文案', type: 'text', def: 'OFF · 已停用' },
      { k: 'period', label: '切换周期(秒)', type: 'range', min: 1, max: 5, step: 0.1, def: 2.4 },
      { k: 'w', label: '开关宽度', type: 'range', min: 200, max: 900, step: 10, def: 480 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var sw = p.w * S, sh = sw * 0.44;
      var cx = W / 2, cy = H / 2;
      var phase = (t % p.period) / p.period;
      var isOn = phase < 0.5;
      var knob = e.inOutBack(U.clamp(((isOn ? phase : phase - 0.5) / 0.5) * 1, 0, 1));
      var kpos = U.lerp(sh / 2, sw - sh / 2, isOn ? knob : 1 - knob);
      ctx.save();
      ctx.translate(cx, cy);
      U.rr(ctx, -sw / 2, -sh / 2, sw, sh, sh / 2);
      var g = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
      var mixv = isOn ? knob : 1 - knob;
      g.addColorStop(0, U.mix(U.mix(U.ink, U.accent2, 0.5), U.accent, mixv));
      g.addColorStop(1, U.mix(U.rgba(U.ink, 1), U.accent2, mixv * 0.9));
      ctx.fillStyle = g;
      ctx.shadowColor = U.rgba(isOn ? U.accent : U.accent2, 0.55);
      ctx.shadowBlur = 50 * S;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.18);
      ctx.lineWidth = 1.6 * S;
      ctx.stroke();
      /* 涟漪 */
      for (var r = 0; r < 2; r++) {
        var rs = U.clamp((phase - r * 0.04) / 0.28, 0, 1);
        var rs2 = U.clamp((phase - 0.5 - r * 0.04) / 0.28, 0, 1);
        var useOn = phase < 0.5;
        var rp = useOn ? rs : rs2;
        if (rp > 0 && rp < 1) {
          ctx.save();
          ctx.globalAlpha = (1 - rp) * 0.5;
          ctx.strokeStyle = useOn ? U.accent : U.accent2;
          ctx.lineWidth = 3 * S;
          ctx.beginPath();
          ctx.arc(-sw / 2 + (useOn ? sw - sh / 2 : sh / 2), 0, sh * (0.6 + rp * 2.2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      /* 滑块 */
      ctx.save();
      ctx.translate(-sw / 2 + kpos, 0);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = 30 * S;
      ctx.shadowOffsetY = 8 * S;
      ctx.beginPath();
      ctx.arc(0, 0, sh * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = U.mix(U.accent2, U.accent, isOn ? 1 : 0);
      var tick = isOn ? 1 : 0;
      ctx.strokeStyle = U.rgba('#0A0B0F', 0.85);
      ctx.lineWidth = 4.5 * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (tick > 0.5) {
        ctx.moveTo(-sh * 0.13, 0);
        ctx.lineTo(-sh * 0.03, sh * 0.11);
        ctx.lineTo(sh * 0.14, -sh * 0.11);
      } else {
        ctx.moveTo(-sh * 0.1, -sh * 0.1);
        ctx.lineTo(sh * 0.1, sh * 0.1);
        ctx.moveTo(sh * 0.1, -sh * 0.1);
        ctx.lineTo(-sh * 0.1, sh * 0.1);
      }
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(28 * S, 700);
      ctx.globalAlpha = isOn ? 1 : 0.35;
      ctx.fillStyle = U.ink;
      ctx.fillText(String(p.on || ''), cx, cy + sh * 1.1);
      ctx.globalAlpha = isOn ? 0.35 : 1;
      ctx.fillStyle = U.rgba(U.ink, 0.75);
      ctx.fillText(String(p.off || ''), cx, cy + sh * 1.1 + 0);
      ctx.restore();
    }
  });

  MF.register({
    id: 'notification-stack', name: '通知堆叠', cat: '交互与卡片', type: 'block', dur: 10, poster: 0.75,
    desc: '系统通知从右上角依次滑入并向下堆叠，旧通知被压缩，最后逐条淡出，适合消息流与提醒场景。',
    tags: ['通知', '堆叠', '提醒'],
    params: [
      { k: 'items', label: '通知文案（每行一条）', type: 'textarea', def: '动效库已更新|导出任务已完成|新模板已同步|今日灵感已生成' },
      { k: 'gap', label: '出现间隔(秒)', type: 'range', min: 0.3, max: 2, step: 0.05, def: 0.9 },
      { k: 'stay', label: '停留(秒)', type: 'range', min: 1, max: 6, step: 0.1, def: 3.2 },
      { k: 'icon', label: '显示图标', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S, e = U.ease;
      var items = String(p.items || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var n = items.length || 1;
      var cw = Math.min(W * 0.34, 560 * S), ch = cw * 0.22;
      var x = W - cw - W * 0.06;
      var y0 = H * 0.1;
      for (var i = 0; i < n; i++) {
        var inT = i * p.gap;
        var outT = inT + p.stay;
        var pr = e.outExpo(U.clamp((t - inT) / 0.7, 0, 1));
        var out = e.inOutCubic(U.clamp((t - outT) / 0.6, 0, 1));
        if (t < inT) continue;
        var y = y0 + i * (ch + 16 * S);
        ctx.save();
        ctx.globalAlpha = (1 - out) * U.clamp((t - inT) / 0.4, 0, 1);
        ctx.translate(x + (1 - pr) * (cw + 120 * S) + out * (cw + 120 * S), y - out * 30 * S);
        ctx.shadowColor = 'rgba(0,0,0,.5)';
        ctx.shadowBlur = 40 * S;
        ctx.shadowOffsetY = 16 * S;
        U.rr(ctx, 0, 0, cw, ch, 20 * S);
        var g = ctx.createLinearGradient(0, 0, cw, ch);
        g.addColorStop(0, U.rgba('#F7F9FD', 0.96));
        g.addColorStop(1, U.rgba('#E8EDF6', 0.94));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        if (p.icon) {
          ctx.save();
          var ig = ctx.createLinearGradient(0, 0, 0, ch);
          ig.addColorStop(0, U.accent);
          ig.addColorStop(1, U.accent2);
          ctx.fillStyle = ig;
          U.rr(ctx, ch * 0.22, ch * 0.22, ch * 0.56, ch * 0.56, ch * 0.16);
          ctx.fill();
          ctx.fillStyle = '#0A0B0F';
          ctx.font = U.fs(ch * 0.3, 900);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('MF', ch * 0.5, ch * 0.5);
          ctx.restore();
        }
        ctx.fillStyle = '#101319';
        ctx.font = U.fs(ch * 0.24, 700);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(items[i], ch * 1.0, ch * 0.42);
        ctx.fillStyle = 'rgba(16,19,25,.45)';
        ctx.font = U.fs(ch * 0.18, 500);
        ctx.fillText('Jaykou · 刚刚', ch * 1.0, ch * 0.68);
        ctx.restore();
      }
    }
  });

  /* ══════════════════════════ 粒子与反馈 ══════════════════════════ */

  MF.register({
    id: 'particle-flow', name: '粒子流场', cat: '粒子与反馈', type: 'block', dur: 10, poster: 0.6,
    desc: '成百条流线沿噪声场持续流动，头部明亮尾部渐隐，适合做科技底纹与数据流动氛围。',
    tags: ['流场', '流线', '底纹'],
    params: [
      { k: 'lines', label: '流线数量', type: 'range', min: 40, max: 700, step: 10, def: 260 },
      { k: 'speed', label: '流速', type: 'range', min: 0.1, max: 2, step: 0.05, def: 0.6 },
      { k: 'tail', label: '拖尾长度', type: 'range', min: 0.02, max: 0.4, step: 0.01, def: 0.14 },
      { k: 'weight', label: '线宽', type: 'range', min: 0.5, max: 6, step: 0.5, def: 2 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.lines);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (var i = 0; i < n; i++) {
        var s0 = U.rng(i * 1.71), s1 = U.rng(i * 3.13);
        var u0 = ((t * p.speed * (0.35 + s0 * 0.4) + s1) % 1);
        var steps = 8;
        ctx.beginPath();
        for (var s = 0; s <= steps; s++) {
          var u = u0 - (s / steps) * p.tail * (0.6 + s0);
          var uu = (u + 10) % 1;
          var wob = U.noise(uu * 3 + s1 * 10, i % 9) * 0.11;
          var x = W * (uu * 1.3 - 0.15);
          var y = H * (0.1 + s0 * 0.8) + Math.sin(uu * 6.2 + s1 * 6) * H * 0.1 + wob * H;
          if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        var a = (1 - Math.abs(u0 - 0.5) * 0.9);
        ctx.strokeStyle = U.rgba(i % 4 === 0 ? U.accent2 : U.accent, 0.06 + a * 0.34);
        ctx.lineWidth = p.weight * S * (0.5 + s0);
        ctx.stroke();
      }
      for (var j = 0; j < Math.round(n * 0.5); j++) {
        var s2 = U.rng(j * 5.3);
        var u2 = ((t * p.speed * (0.4 + s2 * 0.5) + U.rng(j * 7.7)) % 1);
        var x2 = W * (u2 * 1.3 - 0.15);
        var y2 = H * (0.1 + s2 * 0.8) + Math.sin(u2 * 6.2 + U.rng(j * 9.1) * 6) * H * 0.1;
        ctx.fillStyle = U.rgba(i % 3 ? U.ink : U.accent, 0.5);
        ctx.beginPath();
        ctx.arc(x2, y2, 1.8 * S * (0.6 + s2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  MF.register({
    id: 'confetti-burst', name: '彩纸爆炸', cat: '粒子与反馈', type: 'block', dur: 5, poster: 0.5,
    desc: '数百片彩纸从中心炸开，受重力下落并旋转，颜色取自主题色，适合庆祝与里程碑节点。',
    tags: ['彩带', '庆祝', '重力'],
    params: [
      { k: 'count', label: '数量', type: 'range', min: 60, max: 700, step: 20, def: 260 },
      { k: 'power', label: '爆炸力', type: 'range', min: 0.3, max: 2, step: 0.05, def: 1 },
      { k: 'gravity', label: '重力', type: 'range', min: 0.2, max: 2.5, step: 0.05, def: 1.1 },
      { k: 'shape', label: '形状', type: 'select', options: [['rect', '矩形'], ['circle', '圆形'], ['mix', '混合']], def: 'mix' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.count);
      var cx = W / 2, cy = H * 0.46;
      var g = 1100 * p.gravity;
      for (var i = 0; i < n; i++) {
        var delay = U.rng(i * 1.31) * 0.12;
        var life = t - delay;
        if (life <= 0 || life > 4.4) continue;
        var a = U.rng(i * 2.71) * Math.PI * 2;
        var v = (620 + U.rng(i * 5.13) * 900) * p.power * S;
        var vx = Math.cos(a) * v, vy = Math.sin(a) * v - 260 * S * p.power;
        var x = cx + vx * life;
        var y = cy + vy * life + 0.5 * g * S * life * life;
        if (y > H * 1.06) continue;
        var alpha = U.clamp(1 - (life - 3.1) / 1.3, 0, 1);
        var cols = [U.accent, U.accent2, U.ink, U.mix(U.accent, U.ink, 0.5), U.mix(U.accent2, U.ink, 0.35)];
        var col = cols[i % cols.length];
        var rot = U.rng(i * 7.77) * 6 + life * (3 + U.rng(i * 9.1) * 8);
        var w = (10 + U.rng(i * 3.7) * 16) * S, h = w * (0.4 + U.rng(i * 11.3) * 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = col;
        var kind = p.shape;
        if (kind === 'circle' || (kind === 'mix' && i % 3 === 0)) {
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          var squash = Math.abs(Math.sin(rot * 1.7));
          ctx.fillRect(-w / 2, -h / 2 * (0.3 + squash * 0.7), w, h * (0.3 + squash * 0.7));
        }
        ctx.restore();
      }
    }
  });

  MF.register({
    id: 'ripple-rings', name: '涟漪扩散', cat: '粒子与反馈', type: 'block', dur: 8, poster: 0.55,
    desc: '规则点阵持续向外扩散圆环，环与环交叠形成有序的呼吸节律，适合做轻量背景与点击反馈。',
    tags: ['涟漪', '点阵', '扩散'],
    params: [
      { k: 'cols', label: '列数', type: 'range', min: 3, max: 24, step: 1, def: 10 },
      { k: 'period', label: '周期(秒)', type: 'range', min: 0.8, max: 5, step: 0.1, def: 2.6 },
      { k: 'reach', label: '扩散半径', type: 'range', min: 0.2, max: 1.6, step: 0.05, def: 0.8 },
      { k: 'grid', label: '显示点', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var cols = Math.round(p.cols);
      var rows = Math.max(2, Math.round((cols * H) / W));
      var dx = W / (cols + 1), dy = H / (rows + 1);
      var maxR = Math.min(dx, dy) * 1.9 * p.reach;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var c = 1; c <= cols; c++) {
        for (var r = 1; r <= rows; r++) {
          var x = c * dx, y = r * dy;
          var phase = ((t / p.period) + U.rng(c * 3.1 + r * 7.7) * 0.6) % 1;
          for (var k = 0; k < 2; k++) {
            var pp = phase - k * 0.5;
            if (pp <= 0) continue;
            var rad = pp * maxR;
            var alpha = (1 - pp) * (1 - pp) * 0.6;
            ctx.strokeStyle = U.rgba(k ? U.accent2 : U.accent, alpha);
            ctx.lineWidth = (1 + (1 - pp) * 3) * S;
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
      if (p.grid) {
        for (var c2 = 1; c2 <= cols; c2++) {
          for (var r2 = 1; r2 <= rows; r2++) {
            ctx.fillStyle = U.rgba(U.ink, 0.34);
            ctx.beginPath();
            ctx.arc(c2 * dx, r2 * dy, 2.6 * S, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  });

  MF.register({
    id: 'starfield-warp', name: '星野跃迁', cat: '粒子与反馈', type: 'block', dur: 8, poster: 0.5,
    desc: '星点从中心向外高速拉伸成光条，速度随深度变化，营造穿越星空的推进感，适合段落开头。',
    tags: ['星空', '跃迁', '速度'],
    params: [
      { k: 'stars', label: '星数', type: 'range', min: 100, max: 1200, step: 20, def: 420 },
      { k: 'speed', label: '跃迁速度', type: 'range', min: 0.1, max: 2.5, step: 0.05, def: 0.9 },
      { k: 'stretch', label: '光条长度', type: 'range', min: 0.01, max: 0.3, step: 0.01, def: 0.09 },
      { k: 'color', label: '彩色星', type: 'toggle', def: true }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.stars);
      var cx = W / 2, cy = H / 2;
      var focal = Math.min(W, H) * 0.9;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (var i = 0; i < n; i++) {
        var base = U.rng(i * 1.37);
        var z = ((base + t * p.speed * 0.16) % 1);
        if (z < 0.02) continue;
        var ang = U.rng(i * 3.97) * Math.PI * 2;
        var rr = Math.pow(z, 1.7) * Math.hypot(W, H) * 0.62;
        var x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
        var z2 = z - p.stretch * (0.4 + U.rng(i * 5.7));
        var rr2 = Math.pow(Math.max(z2, 0.01), 1.7) * Math.hypot(W, H) * 0.62;
        var x2 = cx + Math.cos(ang) * rr2, y2 = cy + Math.sin(ang) * rr2;
        var a = U.clamp(z * 1.6, 0, 1);
        var col = p.color ? (i % 7 === 0 ? U.accent2 : (i % 5 === 0 ? U.accent : '#FFFFFF')) : '#FFFFFF';
        ctx.strokeStyle = U.rgba(col, a * 0.85);
        ctx.lineWidth = (0.5 + z * 3.2) * S;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.3);
      g.addColorStop(0, U.rgba(U.accent, 0.18));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  /* ══════════════════════════ 材质与纹理 ══════════════════════════ */

  MF.register({
    id: 'grain-noise', name: '噪点颗粒', cat: '材质与纹理', type: 'block', dur: 6, poster: 0.5,
    desc: '在画面上叠加胶片颗粒、扫描线与轻微色散，可套在任意内容上增加质感与年代感。',
    tags: ['颗粒', '胶片', '质感'],
    params: [
      { k: 'amount', label: '颗粒强度', type: 'range', min: 0.05, max: 1, step: 0.05, def: 0.45 },
      { k: 'scan', label: '扫描线', type: 'range', min: 0, max: 1, step: 0.05, def: 0.4 },
      { k: 'vignette', label: '暗角', type: 'range', min: 0, max: 1, step: 0.05, def: 0.6 },
      { k: 'text', label: '叠加文案', type: 'text', def: 'ANALOG' }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(180 * S, 900);
      ctx.fillStyle = U.rgba(U.ink, 0.06);
      ctx.fillText(String(p.text || ''), W / 2, H / 2);
      ctx.restore();
      var frame = Math.floor(t * 24);
      var n = Math.round(2600 * p.amount);
      ctx.save();
      for (var i = 0; i < n; i++) {
        var x = U.rng(i * 1.37 + frame * 0.017) * W;
        var y = U.rng(i * 3.71 + frame * 0.031) * H;
        var a = U.rng(i * 5.13 + frame * 0.011) * p.amount * 0.5;
        ctx.fillStyle = U.rgba(i % 2 ? U.ink : '#000000', a);
        ctx.fillRect(x, y, 2 * S, 2 * S);
      }
      ctx.restore();
      if (p.scan > 0.02) {
        ctx.save();
        ctx.fillStyle = U.rgba('#000000', p.scan * 0.22);
        for (var y2 = (t * 40) % (6 * S); y2 < H; y2 += 6 * S) {
          ctx.fillRect(0, y2, W, 1.6 * S);
        }
        ctx.restore();
      }
      ctx.save();
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.22, W / 2, H / 2, Math.max(W, H) * 0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, U.rgba('#000000', p.vignette));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  });

  MF.register({
    id: 'halftone-field', name: '流动点阵', cat: '材质与纹理', type: 'block', dur: 10, poster: 0.6,
    desc: '等距点阵的半径由噪声场驱动，形成缓慢起伏的流动波纹，兼具印刷网点的质感与节奏。',
    tags: ['半调', '点阵', '流动'],
    params: [
      { k: 'gap', label: '点距', type: 'range', min: 8, max: 46, step: 1, def: 20 },
      { k: 'rough', label: '噪声频率', type: 'range', min: 0.3, max: 4, step: 0.1, def: 1.6 },
      { k: 'speed', label: '流动速度', type: 'range', min: 0, max: 1.5, step: 0.05, def: 0.4 },
      { k: 'maxR', label: '最大点半径', type: 'range', min: 1, max: 16, step: 0.5, def: 7 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var gap = p.gap * S;
      var cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          var x = c * gap + (r % 2 ? gap * 0.5 : 0);
          var y = r * gap * 0.87;
          var nv = U.noise2(x * 0.0035 * p.rough, y * 0.0035 * p.rough + t * p.speed, 5);
          var k = U.clamp((nv + 1) / 2, 0, 1);
          k = Math.pow(k, 1.5);
          var rad = k * p.maxR * S;
          if (rad < 0.4) continue;
          var camber = U.clamp(1 - Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2)), 0, 1);
          var col = U.mix(U.accent2, U.accent, k);
          ctx.fillStyle = U.rgba(col, 0.2 + camber * 0.7);
          if (rad > p.maxR * S * 0.62) {
            ctx.save();
            ctx.shadowColor = U.rgba(col, 0.8);
            ctx.shadowBlur = 22 * S;
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  });

  MF.register({
    id: 'metallic-sweep', name: '金属扫光', cat: '材质与纹理', type: 'block', dur: 7, poster: 0.75,
    desc: '拉丝金属表面上一道高光缓慢横扫，文字随光线亮起浮雕，适合做品牌铭牌与产品细节展示。',
    tags: ['金属', '拉丝', '扫光'],
    params: [
      { k: 'text', label: '铭牌文字', type: 'text', def: 'JAYKOU' },
      { k: 'brush', label: '拉丝密度', type: 'range', min: 40, max: 460, step: 10, def: 200 },
      { k: 'sweep', label: '扫光速度', type: 'range', min: 0.1, max: 1.6, step: 0.05, def: 0.55 },
      { k: 'emboss', label: '浮雕强度', type: 'range', min: 0, max: 1, step: 0.05, def: 0.6 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var x0 = W * 0.1, y0 = H * 0.34, pw = W * 0.8, ph = H * 0.32;
      U.rr(ctx, x0, y0, pw, ph, 20 * S);
      var base = ctx.createLinearGradient(0, y0, 0, y0 + ph);
      base.addColorStop(0, U.mix(U.bg2, '#FFFFFF', 0.22));
      base.addColorStop(0.35, U.mix(U.bg2, '#FFFFFF', 0.06));
      base.addColorStop(0.5, U.mix(U.bg1, '#FFFFFF', 0.16));
      base.addColorStop(1, U.bg1);
      ctx.fillStyle = base;
      ctx.fill();
      ctx.save();
      ctx.clip();
      var bn = Math.round(p.brush);
      for (var i = 0; i < bn; i++) {
        var yy = y0 + (i / bn) * ph;
        ctx.strokeStyle = U.rgba(i % 2 ? '#FFFFFF' : '#000000', 0.02 + U.rng(i * 3.3) * 0.05);
        ctx.lineWidth = (ph / bn) * (0.4 + U.rng(i * 5.7) * 0.8);
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(x0 + pw, yy + U.rng(i * 7.1) * 2);
        ctx.stroke();
      }
      var sp = ((t * p.sweep * 0.5) % 1) * 1.6 - 0.3;
      var sx = x0 + sp * pw;
      var sg = ctx.createLinearGradient(sx - pw * 0.3, y0, sx + pw * 0.3, y0 + ph);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.42, U.rgba(U.accent, 0.3));
      sg.addColorStop(0.5, 'rgba(255,255,255,0.75)');
      sg.addColorStop(0.58, U.rgba(U.accent2, 0.28));
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = sg;
      ctx.fillRect(x0, y0, pw, ph);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      ctx.strokeStyle = U.rgba(U.ink, 0.16);
      ctx.lineWidth = 1.6 * S;
      U.rr(ctx, x0, y0, pw, ph, 20 * S);
      ctx.stroke();
      var txt = String(p.text || '');
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = U.fs(ph * 0.3, 800);
      var tg = ctx.createLinearGradient(0, y0 + ph * 0.2, 0, y0 + ph * 0.8);
      tg.addColorStop(0, '#FFFFFF');
      tg.addColorStop(0.45, U.mix(U.ink, U.accent, 0.5));
      tg.addColorStop(1, U.rgba(U.accent2, 0.85));
      ctx.fillStyle = tg;
      if (p.emboss > 0.05) {
        ctx.globalAlpha = p.emboss * 0.5;
        ctx.fillStyle = '#000000';
        ctx.fillText(txt, W / 2 + 3 * S, H / 2 + 3 * S);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = tg;
      ctx.fillText(txt, W / 2, H / 2);
      ctx.globalAlpha = 0.5;
      ctx.font = U.fs(ph * 0.13, 500, true);
      ctx.fillStyle = U.rgba(U.ink, 0.55);
      ctx.fillText('MADE WITH JAYKOU', W / 2, y0 + ph * 0.78);
      ctx.restore();
    }
  });

  MF.register({
    id: 'gradient-mesh', name: '渐变网格', cat: '材质与纹理', type: 'block', dur: 12, poster: 0.5,
    desc: '多团彩色光斑缓慢漂移交融，叠加细颗粒形成柔和的网格渐变背景，适合做长时段底图。',
    tags: ['渐变', '光斑', '背景'],
    params: [
      { k: 'blobs', label: '光斑数量', type: 'range', min: 3, max: 14, step: 1, def: 7 },
      { k: 'drift', label: '漂移速度', type: 'range', min: 0.02, max: 0.8, step: 0.02, def: 0.22 },
      { k: 'soft', label: '柔和度', type: 'range', min: 0.2, max: 1, step: 0.05, def: 0.7 },
      { k: 'grain', label: '颗粒', type: 'range', min: 0, max: 1, step: 0.05, def: 0.3 }
    ],
    draw: function (ctx, t, p, U) {
      var W = U.W, H = U.H, S = U.S;
      var n = Math.round(p.blobs);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < n; i++) {
        var ph = U.rng(i * 1.7) * 6.28;
        var cx = W * (0.15 + U.rng(i * 3.1) * 0.7) + Math.sin(t * p.drift + ph) * W * 0.16;
        var cy = H * (0.15 + U.rng(i * 5.7) * 0.7) + Math.cos(t * p.drift * 0.8 + ph * 1.3) * H * 0.16;
        var rad = Math.min(W, H) * (0.22 + U.rng(i * 7.3) * 0.34) * (1 + p.soft);
        var col = i % 3 === 0 ? U.accent : (i % 3 === 1 ? U.accent2 : U.mix(U.accent, U.accent2, 0.5));
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, U.rgba(col, 0.36 * p.soft + 0.14));
        g.addColorStop(0.45, U.rgba(col, 0.1));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
      ctx.save();
      var vg = ctx.createLinearGradient(0, 0, W, H);
      vg.addColorStop(0, U.rgba(U.bg1, 0.35));
      vg.addColorStop(0.5, 'rgba(0,0,0,0)');
      vg.addColorStop(1, U.rgba(U.bg1, 0.5));
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      if (p.grain > 0.02) {
        var frame = Math.floor(t * 24);
        var gn = Math.round(1600 * p.grain);
        for (var k = 0; k < gn; k++) {
          ctx.fillStyle = U.rgba(k % 2 ? '#FFFFFF' : '#000000', U.rng(k * 3.3 + frame * 0.021) * 0.16 * p.grain);
          ctx.fillRect(U.rng(k * 1.1 + frame * 0.013) * W, U.rng(k * 2.3 + frame * 0.019) * H, 2 * S, 2 * S);
        }
      }
    }
  });
})();
