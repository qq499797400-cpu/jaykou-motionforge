/* ==========================================================================
   Jaykou — Engine
   效果注册表 · 舞台渲染 · 时间轴 · 录制 · 导出产物生成
   ========================================================================== */
(function () {
  'use strict';

  var MF = (window.MF = window.MF || {});
  MF.effects = [];
  MF.byId = {};

  /* 全局默认设置（可在界面中修改，驱动所有效果的配色与背景） */
  MF.defaultSettings = {
    accent: '#FF5A1F',
    accent2: '#7C5CFF',
    ink: '#FFFFFF',
    bg1: '#0A0B0F',
    bg2: '#161B26',
    bgMode: 'gradient',
    seed: 7,
    speed: 1,
    ratio: '16:9'
  };

  MF.ratios = {
    '16:9': { w: 1920, h: 1080, label: '横屏 16:9' },
    '9:16': { w: 1080, h: 1920, label: '竖屏 9:16' },
    '1:1': { w: 1080, h: 1080, label: '方形 1:1' },
    '4:5': { w: 1080, h: 1350, label: '竖版 4:5' },
    '21:9': { w: 2100, h: 900, label: '宽银幕 21:9' }
  };

  MF.categories = [];

  /* 细类 → 大类映射：界面只展示 10 个大类，原始细类保留在 def.sub */
  MF.catGroups = {
    '文字与排版': '文字排版', '文字特效': '文字排版', '弹幕字幕': '文字排版',
    '入场与反馈': '入场与状态', '入场序列': '入场与状态', '退场收尾': '入场与状态',
    '加载与进度': '入场与状态', '状态与进度': '入场与状态',
    '镜头与转场': '转场运镜', '转场切换': '转场运镜', '镜头运动': '转场运镜', '形变转换': '转场运镜',
    '数据可视化': '数据图表', '数据图表': '数据图表', '数据大屏': '数据图表', '数字计数': '数据图表',
    'HUD 仪表': '数据图表', '对比展示': '数据图表', '时间轴': '数据图表',
    '粒子与反馈': '粒子光影', '粒子系统': '粒子光影', '光影氛围': '粒子光影', '节日庆典': '粒子光影',
    '空间与展示': '几何空间', '几何与抽象': '几何空间', '几何构成': '几何空间',
    '3D 立体': '几何空间', '物理运动': '几何空间',
    '交互与卡片': '界面交互', '界面组件': '界面交互', '办公效率': '界面交互',
    '终端代码': '界面交互', '社交叙事': '界面交互',
    '品牌与标识': '品牌叙事', '叙事与演示': '品牌叙事', '徽章印章': '品牌叙事',
    '涂鸦手绘': '创意生活', '拼贴手账': '创意生活', '天气氛围': '创意生活',
    '地图轨迹': '创意生活', '音乐律动': '创意生活',
    '材质与纹理': '背景材质', '背景循环': '背景材质'
  };

  /* ------------------------------ 注册 ------------------------------ */
  /* 退役名单：基础款与同质化配方，注册时直接跳过（保留 id 便于将来复活） */
  MF.retired = new Set(("enter-fade enter-down enter-left enter-right enter-rotate enter-roll enter-back-up enter-back-scale " +
    "enter-quint-clean enter-card-up enter-card-elastic enter-card-zoom enter-chip-pop enter-chip-slide enter-chip-elastic enter-chip-focus " +
    "enter-title-blur enter-title-scale enter-title-flip enter-title-elastic enter-title-bounce enter-title-roll enter-title-clean " +
    "enter-side-pop enter-soft-rise enter-hard-cut enter-diagonal enter-delayed-stack enter-tall-pop " +
    "exit-down exit-left exit-right exit-grow exit-rotate exit-flip exit-slow-fade exit-drift exit-long-hold exit-vanish " +
    "tr-wipe-v tr-diagonal tr-checker tr-grain tr-star tr-bars tr-sweep tr-cross tr-corners tr-triangle tr-ripple " +
    "tr-push-right tr-slide-up tr-slide-down tr-zoom-out " +
    "tx-rotchar tx-box tx-scale tx-skew tx-bounce-cn tx-wave-slow tx-gradient-wide tx-outline-bold tx-glitch-cn tx-shine-gold " +
    "tx-scramble tx-matrix tx-typewriter-cn tx-countup-percent tx-neon-cn tx-cycle tx-split tx-stack " +
    "geo-star-draw geo-spiral geo-grid-wave geo-ripple geo-tri-grid geo-hex geo-dots geo-sine geo-squares geo-dotgrid " +
    "geo-polynet geo-spiral-dots geo-arcs geo-hatch geo-weave geo-bricks geo-stairs geo-wave-rings " +
    "ui-toggle ui-search ui-menu ui-spinner ui-skeleton ui-input ui-tabs ui-tooltip ui-calendar ui-tasklist ui-badge ui-dropdown ui-slider ui-settings ui-battery " +
    "pt-rain pt-snow pt-fireworks pt-confetti pt-starfield pt-galaxy pt-pollen pt-dust pt-ripplep " +
    "lt-aurora lt-bokeh lt-mesh lt-rainbow lt-haze lt-rings " +
    "ch-spark ch-rings ch-timeline ch-grid-heat " +
    "pr-bar-stripes pr-dots pr-bounce-dots pr-percent pr-counter pr-clock pr-circle-arrow pr-hashtag pr-square-flip pr-ladder pr-wave-load " +
    "scr-box scr-cross scr-star scr-heart scr-spiral scr-double scr-strike scr-bracket scr-wave " +
    "bdg-stamp-pulse bdg-laurel bdg-shield bdg-seal bdg-wobble bdg-serial bdg-stamp-slam bdg-ribbon bdg-verified bdg-coin bdg-ink bdg-medal " +
    "term-progress term-cursor term-split term-ascii " +
    "soc-heart-rain soc-vote soc-mention soc-trend " +
    "mus-wave mus-metronome mus-cassette mus-reel " +
    "num-percent num-flip-date " +
    "map-radar map-compass map-grid-locate map-contour " +
    "col-photo-grid col-scrapbook col-magazine col-pin-board " +
    "hud-toggle hud-slider hud-battery " +
    "d3-stairs d3-pyramid d3-box-tunnel d3-cyl " +
    "cmp-wipe cmp-labels cmp-bars cmp-oscillate cmp-scale cmp-merge " +
    "tl-vertical tl-steps tl-dots tl-flag tl-calendar tl-progress-nodes " +
    "dash-pie dash-progress dash-funnel dash-bubble dash-num-roll " +
    "wx-rain wx-drizzle wx-snow wx-snow-heavy wx-sun wx-wind wx-hail wx-dew " +
    "wk-calendar wk-timer wk-bell wk-target wk-clipboard wk-sync " +
    "dm-top dm-quiz dm-reply dm-watermark dm-ping " +
    "fest-gift fest-cake fest-bunting fest-cheers " +
    "ph-magnetic ph-gravity ph-collision ph-balance ph-chain ph-trajectory " +
    "cm-tilt cm-whip-pan cm-roll cm-pan-lr cm-pan-ud cm-focus-pull cm-handheld " +
    "mo-star-burst mo-ribbon mo-spring mo-fold mo-inflate mo-merge mo-split mo-wave-blob " +
    "bg-grid-pan bg-particle bg-hex bg-stripes bg-blueprint bg-rays bg-crack").trim().split(/\s+/));

  MF.register = function (def) {
    if (!def || !def.id) throw new Error('effect.id 必填');
    if (MF.byId[def.id]) throw new Error('效果 id 重复：' + def.id);
    if (MF.retired.has(def.id)) return null;   /* 已退役：静默跳过 */
    def.type = def.type || 'block';
    def.dur = def.dur || 6;
    def.poster = def.poster === undefined ? 0.72 : def.poster;
    def.tags = def.tags || [];
    def.params = def.params || [];
    def.desc = def.desc || '';
    def.sub = def.cat;                       /* 保留原始细类，供搜索与展示 */
    def.cat = MF.catGroups[def.cat] || def.cat;
    MF.effects.push(def);
    MF.byId[def.id] = def;
    if (dev_cache_cats.indexOf(def.cat) === -1) dev_cache_cats.push(def.cat);
    return def;
  };
  var dev_cache_cats = MF.categories;

  /* 参数默认值合并：支持 $accent / $accent2 / $ink 跟随全局主题 */
  MF.resolveParams = function (effect, params, settings) {
    var s = settings || MF.defaultSettings;
    var out = {};
    var src = params || {};
    effect.params.forEach(function (pd) {
      var v = src[pd.k] === undefined ? pd.def : src[pd.k];
      if (typeof v === 'string' && v.charAt(0) === '$') {
        v = s[v.slice(1)] || pd.def;
      }
      out[pd.k] = v;
    });
    return out;
  };

  MF.defaultParams = function (effect) {
    var o = {};
    effect.params.forEach(function (pd) { o[pd.k] = pd.def; });
    return o;
  };

  /* ------------------------------ 光栅绘制 ------------------------------ */
  MF.paint = function (ctx, effect, params, t, cfg) {
    var W = cfg.w, H = cfg.h;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (cfg.clear !== false) ctx.clearRect(0, 0, W, H);
    var U = window.MFCore.createUtils({
      W: W, H: H, D: cfg.duration, t: t,
      accent: cfg.accent, accent2: cfg.accent2, ink: cfg.ink,
      bg1: cfg.bg1, bg2: cfg.bg2, bgMode: cfg.bgMode, seed: cfg.seed
    });
    if (cfg.background !== false) window.MFCore.drawBackground(ctx, U, cfg);
    try {
      effect.draw(ctx, t, params, U);
    } catch (err) {
      if (!cfg.quiet) console.warn('[Jaykou] 效果渲染失败：' + effect.id, err);
    }
    ctx.restore();
  };

  /* ------------------------------ 颜色混合（用于转场） ------------------------------ */
  MF.blend = function (dst, src, a) {
    dst.save();
    dst.globalAlpha = a;
    dst.drawImage(src.canvas, 0, 0);
    dst.restore();
  };

  /* ------------------------------ 录制器 ------------------------------ */
  MF.recorder = {
    chunks: [],
    recorder: null,
    /* 以真实时间驱动一次完整播放，边播边录。
       format: 'mp4' | 'webm' | undefined(自动，优先 MP4) */
    start: function (canvas, fps, bitrate, format) {
      if (!window.MediaRecorder) return null;
      var MP4 = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'];
      var WEBM = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      var types = format === 'webm' ? WEBM : MP4.concat(WEBM);
      var mime = '';
      for (var i = 0; i < types.length; i++) {
        if (MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
      }
      this.mime = mime || 'video/webm';
      var stream = canvas.captureStream(fps || 60);
      var rec;
      try {
        rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: bitrate || 16000000 } : undefined);
      } catch (e) {
        rec = new MediaRecorder(stream);
      }
      this.chunks = [];
      var self = this;
      rec.ondataavailable = function (e) { if (e.data && e.data.size) self.chunks.push(e.data); };
      this.recorder = rec;
      rec.start(120);
      return rec;
    },
    stop: function () {
      var self = this;
      return new Promise(function (resolve) {
        var rec = self.recorder;
        if (!rec) return resolve(null);
        rec.onstop = function () {
          var blob = new Blob(self.chunks, { type: self.mime || 'video/webm' });
          self.recorder = null;
          resolve(blob);
        };
        if (rec.state !== 'inactive') rec.stop(); else resolve(null);
      });
    }
  };

  /* ------------------------------ 导出产物生成 ------------------------------ */
  MF.download = function (blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1200);
  };

  MF.downloadText = function (text, filename, mime) {
    MF.download(new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' }), filename);
  };

  /* 生成「单文件可播放 HTML」——把运行时 + 该效果的 draw 源码 + 当前参数一起打包 */
  MF.buildStandaloneHTML = function (scene, settings) {
    var effect = MF.byId[scene.id];
    var p = MF.resolveParams(effect, scene.params, settings);
    var R = MF.ratios[settings.ratio] || MF.ratios['16:9'];
    var title = effect.name + ' · 嘉Jaykou动效工作台';
    var cfg = {
      w: R.w, h: R.h, duration: scene.duration || effect.dur,
      accent: settings.accent, accent2: settings.accent2, ink: settings.ink,
      bg1: settings.bg1, bg2: settings.bg2, bgMode: settings.bgMode, seed: settings.seed
    };
    return [
      '<!doctype html>',
      '<html lang="zh-CN"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>' + escapeHTML(title) + '</title>',
      '<style>',
      '  html,body{margin:0;height:100%;background:#07080b;overflow:hidden}',
      '  #wrap{position:fixed;inset:0;display:grid;place-items:center}',
      '  canvas{max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;display:block}',
      '  .bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:8px;',
      '       padding:7px 10px;border-radius:999px;background:rgba(14,16,22,.72);backdrop-filter:blur(12px);',
      '       border:1px solid rgba(255,255,255,.09);opacity:0;transition:.28s;font:600 13px/1 ' + 'system-ui,sans-serif}',
      '  #wrap:hover+.bar,.bar:hover{opacity:1}',
      '  .bar button{cursor:pointer;border:0;border-radius:999px;padding:8px 14px;background:rgba(255,255,255,.08);color:#fff;font:inherit}',
      '  .bar button:hover{background:rgba(255,255,255,.16)}',
      '  .bar span{color:#9aa3b5;font-weight:500;padding:8px 6px}',
      '</style></head><body>',
      '<div id="wrap"><canvas id="cv" width="' + cfg.w + '" height="' + cfg.h + '"></canvas></div>',
      '<div class="bar"><button id="pp">暂停</button><button id="rp">重播</button><span id="tm"></span></div>',
      '<script>' + window.MF_RUNTIME_SRC + '<\/script>',
      '<script>',
      'var CFG=' + JSON.stringify(cfg) + ';',
      'var P=' + JSON.stringify(p) + ';',
      'var DRAW=' + effect.draw.toString() + ';',
      'var cv=document.getElementById("cv"),ctx=cv.getContext("2d");',
      'var D=CFG.duration,t=0,last=performance.now(),playing=true,loops=Infinity;',
      'function frame(now){',
      '  var dt=(now-last)/1000;last=now;',
      '  if(playing)t+=dt;',
      '  if(t>D){t-=D;}',
      '  var U=MFCore.createUtils({W:CFG.w,H:CFG.h,D:D,t:t,accent:CFG.accent,accent2:CFG.accent2,',
      '     ink:CFG.ink,bg1:CFG.bg1,bg2:CFG.bg2,bgMode:CFG.bgMode,seed:CFG.seed});',
      '  ctx.clearRect(0,0,CFG.w,CFG.h);MFCore.drawBackground(ctx,U,CFG);',
      '  ctx.save();DRAW(ctx,t,P,U);ctx.restore();',
      '  document.getElementById("tm").textContent=t.toFixed(1)+"s / "+D+"s";',
      '  requestAnimationFrame(frame);',
      '}',
      'requestAnimationFrame(frame);',
      'document.getElementById("pp").onclick=function(){playing=!playing;this.textContent=playing?"暂停":"播放"};',
      'document.getElementById("rp").onclick=function(){t=0};',
      'cv.addEventListener("dblclick",function(){document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()});',
      '<\/script></body></html>'
    ].join('\n');
  };

  /* 生成 React 组件 */
  MF.buildReact = function (scene, settings) {
    var effect = MF.byId[scene.id];
    var p = MF.resolveParams(effect, scene.params, settings);
    var R = MF.ratios[settings.ratio] || MF.ratios['16:9'];
    var cfg = {
      w: R.w, h: R.h, duration: scene.duration || effect.dur,
      accent: settings.accent, accent2: settings.accent2, ink: settings.ink,
      bg1: settings.bg1, bg2: settings.bg2, bgMode: settings.bgMode, seed: settings.seed
    };
    return [
      '/* ' + effect.name + ' · 由 嘉Jaykou动效工作台 生成 */',
      "import { useEffect, useRef } from 'react';",
      '',
      window.MF_RUNTIME_SRC,
      '',
      'const CFG = ' + JSON.stringify(cfg, null, 2) + ';',
      'const PARAMS = ' + JSON.stringify(p, null, 2) + ';',
      '',
      'const draw = ' + effect.draw.toString() + ';',
      '',
      'export default function ' + pascal(effect.id) + '({ loop = true, className }) {',
      '  const ref = useRef(null);',
      '  useEffect(() => {',
      '    const cv = ref.current;',
      '    const ctx = cv.getContext("2d");',
      '    let t = 0, last = performance.now(), raf = 0;',
      '    const frame = (now) => {',
      '      const dt = (now - last) / 1000; last = now;',
      '      t += dt;',
      '      if (t > CFG.duration) t = loop ? t - CFG.duration : CFG.duration;',
      '      const U = window.MFCore.createUtils({ W: CFG.w, H: CFG.h, D: CFG.duration, t,',
      '        accent: CFG.accent, accent2: CFG.accent2, ink: CFG.ink,',
      '        bg1: CFG.bg1, bg2: CFG.bg2, bgMode: CFG.bgMode, seed: CFG.seed });',
      '      ctx.clearRect(0, 0, CFG.w, CFG.h);',
      '      window.MFCore.drawBackground(ctx, U, CFG);',
      '      ctx.save(); draw(ctx, t, PARAMS, U); ctx.restore();',
      '      raf = requestAnimationFrame(frame);',
      '    };',
      '    raf = requestAnimationFrame(frame);',
      '    return () => cancelAnimationFrame(raf);',
      '  }, [loop]);',
      '  return <canvas ref={ref} width={CFG.w} height={CFG.h} className={className}',
      '    style={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }} />;',
      '}'
    ].join('\n');
  };

  MF.buildEmbed = function (scene, settings) {
    var R = MF.ratios[settings.ratio] || MF.ratios['16:9'];
    return '<iframe src="' + 'YOUR_HOST/' + scene.id + '.html' + '" width="' + R.w + '" height="' + R.h +
      '" style="border:0;border-radius:14px;max-width:100%" allowfullscreen loading="lazy" title="' +
      MF.byId[scene.id].name + '"></iframe>';
  };

  /* 参数写入 URL，便于分享 / 复现 */
  MF.encodeShare = function (state) {
    var payload = {
      e: state.id,
      p: state.params,
      s: {
        a: state.settings.accent, a2: state.settings.accent2, ink: state.settings.ink,
        b1: state.settings.bg1, b2: state.settings.bg2, bg: state.settings.bgMode,
        sd: state.settings.seed, r: state.settings.ratio
      }
    };
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (e) { return ''; }
  };

  MF.decodeShare = function (str) {
    try {
      var o = JSON.parse(decodeURIComponent(escape(atob(str))));
      return {
        id: o.e, params: o.p || {},
        settings: {
          accent: o.s.a, accent2: o.s.a2, ink: o.s.ink,
          bg1: o.s.b1, bg2: o.s.b2, bgMode: o.s.bg, seed: o.s.sd, ratio: o.s.r
        }
      };
    } catch (e) { return null; }
  };

  /* 生成收藏集分享页：一个自包含 HTML，网格内全部实时动画
     opts: { light: true } 输出浅色版式（默认深色画廊） */
  MF.buildCollectionHTML = function (ids, settings, opts) {
    var s = settings || MF.defaultSettings;
    var light = !!(opts && opts.light);
    var C = light
      ? { page: '#f6f7fa', card: '#ffffff', line: 'rgba(12,14,22,.10)', text: '#12141c', sub: '#69707f', cvbg: '#ffffff', colorScheme: 'light' }
      : { page: '#0a0b10', card: '#0d0f16', line: 'rgba(255,255,255,.08)', text: '#eef1f7', sub: '#8b93a7', cvbg: '#06070a', colorScheme: 'dark' };
    var items = [];
    ids.forEach(function (id) {
      var eff = MF.byId[id];
      if (!eff) return;
      items.push({
        id: eff.id, name: eff.name, cat: eff.cat || '', dur: eff.dur,
        params: MF.resolveParams(eff, null, s),
        draw: eff.draw.toString()
      });
    });
    var title = '我的收藏集 · ' + items.length + ' 个动效 · 嘉Jaykou动效工作台';
    return [
      '<!doctype html>',
      '<html lang="zh-CN"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>' + escapeHTML(title) + '</title>',
      '<style>',
      '  :root{color-scheme:' + C.colorScheme + '}',
      '  html,body{margin:0;background:' + C.page + ';color:' + C.text + ';font:15px/1.6 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}',
      '  header{padding:34px 28px 10px;max-width:1280px;margin:0 auto;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}',
      '  header h1{font-size:24px;margin:0;letter-spacing:-.01em}',
      '  header em{font-style:normal;color:' + C.sub + ';font-size:13px}',
      '  header .dot{color:' + s.accent + '}',
      '  .grid{max-width:1280px;margin:18px auto 60px;padding:0 28px;display:grid;gap:22px;grid-template-columns:repeat(auto-fill,minmax(380px,1fr))}',
      '  .card{border:1px solid ' + C.line + ';border-radius:16px;overflow:hidden;background:' + C.card + '}',
      '  .card canvas{width:100%;aspect-ratio:16/9;display:block;background:' + C.cvbg + '}',
      '  .meta{display:flex;align-items:center;gap:10px;padding:12px 15px 14px}',
      '  .meta b{font-size:14.5px}',
      '  .meta span{margin-left:auto;color:' + C.sub + ';font-size:12px;font-family:ui-monospace,Menlo,monospace}',
      '  .empty{max-width:560px;margin:80px auto;text-align:center;color:' + C.sub + '}',
      '  @media(max-width:560px){.grid{grid-template-columns:1fr;padding:0 16px}header{padding:24px 16px 6px}}',
      '</style></head><body>',
      '<header><h1>我的收藏集<span class="dot"> .</span></h1><em>' + items.length + ' 个动效 · 实时渲染 · 嘉Jaykou动效工作台出品</em></header>',
      items.length ? '<div class="grid" id="grid"></div>' : '<p class="empty">收藏集为空</p>',
      '<script>' + window.MF_RUNTIME_SRC + '<\/script>',
      '<script>',
      'var META=' + JSON.stringify(items.map(function (it) {
        return { id: it.id, name: it.name, cat: it.cat, dur: it.dur, params: it.params };
      })) + ';',
      'var SRCS=' + JSON.stringify(items.map(function (it) { return it.draw; })) + ';',
      'var FNS=SRCS.map(function(s){return eval("(" + s + ")");});',
      'var ST=' + JSON.stringify({ accent: s.accent, accent2: s.accent2, ink: s.ink, bg1: s.bg1, bg2: s.bg2, bgMode: s.bgMode, seed: s.seed }) + ';',
      'var grid=document.getElementById("grid"),io=null;',
      'if("IntersectionObserver" in window){io=new IntersectionObserver(function(es){es.forEach(function(en){',
      '  var r=en.target._rec;if(en.isIntersecting&&!r.on){r.on=true;r.last=0;loop(r);}else if(!en.isIntersecting&&r.on){r.on=false;}',
      '});},{rootMargin:"160px"});}',
      'META.forEach(function(it,i){',
      '  var card=document.createElement("div");card.className="card";',
      '  var cv=document.createElement("canvas");cv.width=560;cv.height=315;',
      '  var meta=document.createElement("div");meta.className="meta";',
      '  meta.innerHTML="<b>"+it.name+"</b><span>"+it.dur+"s · "+it.cat+"</span>";',
      '  card.appendChild(cv);card.appendChild(meta);grid.appendChild(card);',
      '  var rec={ctx:cv.getContext("2d"),cv:cv,it:it,fn:FNS[i],t:i*0.7,last:0,on:false};card._rec=rec;',
      '  if(io)io.observe(card);else{rec.on=true;loop(rec);}',
      '});',
      'function loop(r){',
      '  if(!r.on)return;',
      '  var now=performance.now();',
      '  var dt=r.last?Math.min(.05,(now-r.last)/1000):0;r.last=now;',
      '  r.t=(r.t+dt)%r.it.dur;',
      '  var U=MFCore.createUtils({W:r.cv.width,H:r.cv.height,D:r.it.dur,t:r.t,accent:ST.accent,accent2:ST.accent2,',
      '    ink:ST.ink,bg1:ST.bg1,bg2:ST.bg2,bgMode:ST.bgMode,seed:ST.seed});',
      '  r.ctx.setTransform(1,0,0,1,0,0);r.ctx.clearRect(0,0,r.cv.width,r.cv.height);',
      '  MFCore.drawBackground(r.ctx,U,{w:r.cv.width,h:r.cv.height,bgMode:ST.bgMode,bg1:ST.bg1,bg2:ST.bg2});',
      '  try{r.ctx.save();r.fn(r.ctx,r.t,r.it.params,U);r.ctx.restore();}catch(e){}',
      '  requestAnimationFrame(function(){loop(r);});',
      '}',
      '<\/script></body></html>'
    ].join('\n');
  };

  function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function pascal(id) {
    return String(id).split(/[^a-z0-9]+/i).filter(Boolean)
      .map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join('') || 'MotionScene';
  }
  MF.pascal = pascal;
})();
