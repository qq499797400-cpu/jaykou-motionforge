/* ==========================================================================
   Jaykou 动效库 · 05
   原语：元素入场 / 元素退场
   --------------------------------------------------------------------------
   一份自包含的绘制原语，通过参数配方批量产出几十个视觉各不相同的动效。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;
  var P = MF.P, sel = MF.sel, rng = MF.rng, txt = MF.txt;

  /* ══════════════════════════ 原语一：元素入场 ══════════════════════════ */

  var ENTER_PARAMS = [
    P('text', '文案', 'MOTION', txt('MOTION')),
    P('sub', '副标题', '', txt('')),
    P('dir', '入场方向', 'up', sel('up', [
      ['up', '下方升入'], ['down', '上方落下'], ['left', '左侧滑入'], ['right', '右侧滑入'],
      ['scale', '缩放浮现'], ['rotate', '旋转入场'], ['flip', '翻转展开'],
      ['roll', '滚入'], ['blur', '虚化聚焦']
    ])),
    P('curve', '运动曲线', 'outCubic', sel('outCubic', [
      ['outCubic', '平滑'], ['outExpo', '急停'], ['outQuint', '干净'],
      ['outBack', '回弹'], ['outElastic', '弹性'], ['outBounce', '弹跳'], ['inOutQuint', '均衡']
    ])),
    P('dist', '位移量', 180, rng(180, 30, 640, 10)),
    P('anim', '动作时长', 0.9, rng(0.9, 0.3, 2.2, 0.05)),
    P('delay', '延迟', 0.2, rng(0.2, 0, 1.4, 0.05)),
    P('size', '字号', 229, rng(229, 321, 321, 2)),
    P('shape', '元素形态', 'text', sel('text', [
      ['text', '大字标题'], ['title', '标题组'], ['card', '信息卡片'], ['chip', '胶囊标签']
    ])),
    P('blurAmt', '虚化强度', 16, rng(16, 0, 40, 1)),
    P('glow', '辉光', 0.45, rng(0.45, 0, 1, 0.05))
  ];

  function enterDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var ez = e[p.curve] || e.outCubic;
    var raw = U.clamp((t - p.delay) / Math.max(0.08, p.anim), 0, 1);
    var k = ez(raw);
    var vis = U.clamp(raw * 2.6, 0, 1);
    var d = p.dist * S;
    var dx = 0, dy = 0, rot = 0, sc = 1, sy = 1;
    var dir = p.dir;
    if (dir === 'up') { dy = (1 - k) * d; }
    else if (dir === 'down') { dy = -(1 - k) * d; }
    else if (dir === 'left') { dx = -(1 - k) * d; }
    else if (dir === 'right') { dx = (1 - k) * d; }
    else if (dir === 'scale') { sc = 0.5 + 0.5 * k; }
    else if (dir === 'rotate') { rot = (1 - k) * -0.5; sc = 0.72 + 0.28 * k; }
    else if (dir === 'flip') { sy = 0.035 + 0.965 * k; }
    else if (dir === 'roll') { rot = (1 - k) * -0.55; dx = -(1 - k) * d * 0.5; dy = (1 - k) * d * 0.2; }
    else if (dir === 'blur') { sc = 0.9 + 0.1 * k; }
    else { dy = (1 - k) * d; }
    var blur = (1 - k) * p.blurAmt * S;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.globalAlpha = vis;
    if (blur > 0.5) ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
    ctx.translate(dx, dy);
    if (rot) ctx.rotate(rot);
    ctx.scale(sc, sc * sy);

    var size = p.size * S;
    var label = String(p.text || '');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* 重绘主体：三种形态共享同一套入场变换 */
    var shape = p.shape;
    if (shape === 'card' || shape === 'chip') {
      ctx.font = U.fs(size * (shape === 'chip' ? 0.42 : 0.62), 800);
      var tw = ctx.measureText(label).width;
      var padX = size * (shape === 'chip' ? 0.62 : 0.8);
      var padY = size * (shape === 'chip' ? 0.34 : 0.66);
      var cw = Math.max(tw + padX * 2, size * 2.6);
      var ch = shape === 'chip' ? size * 0.95 : Math.max(size * 1.7, size * 1.7);
      var rd = shape === 'chip' ? ch / 2 : size * 0.28;
      ctx.shadowColor = U.rgba('#000000', 0.45);
      ctx.shadowBlur = 46 * S; ctx.shadowOffsetY = 16 * S;
      var g = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
      g.addColorStop(0, U.rgba(U.mix(U.bg2, U.accent, 0.42), 0.99));
      g.addColorStop(1, U.rgba(U.mix(U.bg1, U.accent2, 0.3), 0.99));
      U.rr(ctx, -cw / 2, -ch / 2, cw, ch, rd);
      ctx.fillStyle = g; ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = U.rgba(U.ink, 0.16); ctx.lineWidth = 1.6 * S; ctx.stroke();
      if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow * 0.9); ctx.shadowBlur = 30 * S * p.glow; }
      ctx.fillStyle = U.ink;
      ctx.fillText(label, 0, shape === 'card' ? -size * 0.2 : 0);
      ctx.shadowBlur = 0;
      if (shape === 'card' && p.sub) {
        ctx.font = U.fs(size * 0.3, 600);
        ctx.fillStyle = U.rgba(U.ink, 0.6);
        ctx.fillText(String(p.sub), 0, size * 0.42);
      }
      ctx.restore();
      return;
    }

    /* 大字标题 / 标题组 */
    ctx.font = U.fs(size, 900);
    var gr = ctx.createLinearGradient(-W * 0.3, 0, W * 0.3, 0);
    gr.addColorStop(0, U.ink);
    gr.addColorStop(1, U.mix(U.ink, U.accent, 0.55));
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent, p.glow); ctx.shadowBlur = 36 * S * p.glow; }
    ctx.fillStyle = gr;
    ctx.fillText(label, 0, shape === 'title' ? -size * 0.16 : 0);
    ctx.shadowBlur = 0;

    if (shape === 'title') {
      var uw = Math.min(ctx.measureText(label).width, W * 0.78);
      var grow = U.clamp((raw - 0.35) / 0.5, 0, 1);
      var gg = ctx.createLinearGradient(-uw / 2, 0, uw / 2, 0);
      gg.addColorStop(0, U.accent); gg.addColorStop(1, U.accent2);
      ctx.fillStyle = gg;
      ctx.fillRect(-uw / 2, size * 0.56, uw * grow, 5 * S);
      if (p.sub) {
        var sp = U.clamp((raw - 0.5) / 0.5, 0, 1);
        ctx.globalAlpha = vis * sp;
        ctx.font = U.fs(size * 0.26, 600);
        ctx.fillStyle = U.rgba(U.ink, 0.62);
        ctx.letterSpacing = '2px';
        ctx.fillText(String(p.sub), 0, size * 0.94);
        ctx.letterSpacing = '0px';
      }
    }
    ctx.restore();
  }

  MF.forge({
    cat: '入场序列', type: 'block', dur: 5, poster: 0.16,
    texts: ['MOTION', 'IMPACT', 'BOOM', 'FOCUS', 'RISE', 'GLORY', 'LAUNCH', 'HERO', 'VIBES', 'DRIFT', 'SURGE', 'PIVOT', '闪亮登场', '重头戏', '开场'],
    params: ENTER_PARAMS, draw: enterDraw,
    ids: [
      { id: 'enter-fade', name: '淡入浮现', tags: ['淡入', '极简'], desc: '最克制的一种入场：只做透明度渐变，不加位移。适合需要安静出现的正文或图表。', cfg: { dir: 'blur', blurAmt: 0, dist: 0, glow: 0.2, anim: 1.1 } },
      { id: 'enter-up', name: '上浮入场', tags: ['上浮', '开场'], desc: '元素自下方升入并逐渐显影，最通用的开场动作，稳重不抢戏。', cfg: { dir: 'up' } },
      { id: 'enter-down', name: '下落入场', tags: ['下落', '开场'], desc: '元素自上方落下停稳，带一点重量感，适合标题与提示条。', cfg: { dir: 'down' } },
      { id: 'enter-left', name: '左侧滑入', tags: ['滑入', '横向'], desc: '元素从左侧平移进入，与阅读方向一致，常用于段落与列表。', cfg: { dir: 'left' } },
      { id: 'enter-right', name: '右侧滑入', tags: ['滑入', '横向'], desc: '元素从右侧平移进入，适合需要打破常规阅读节奏的画面。', cfg: { dir: 'right' } },
      { id: 'enter-scale', name: '缩放浮现', tags: ['缩放', '聚焦'], desc: '元素由小放大并淡入，像被镜头对焦，适合强调单个结论。', cfg: { dir: 'scale', glow: 0.6 } },
      { id: 'enter-rotate', name: '旋转入场', tags: ['旋转', '动感'], desc: '元素带角度旋转落位，动势更强，适合活泼的封面与新品亮相。', cfg: { dir: 'rotate', glow: 0.6 } },
      { id: 'enter-flip', name: '翻转展开', tags: ['翻转', '立体'], desc: '元素像翻牌一样从压扁状态展开，带轻微立体感，适合揭晓类画面。', cfg: { dir: 'flip', glow: 0.5 } },
      { id: 'enter-roll', name: '滚入落位', tags: ['滚入', '动感'], desc: '元素从侧下方滚动进入并回正，节奏明快，适合快剪片头。', cfg: { dir: 'roll', curve: 'outExpo' } },
      { id: 'enter-blur', name: '虚化聚焦', tags: ['虚化', '高级'], desc: '元素从模糊状态逐渐聚焦清晰，是很高级的入场方式，适合质感型内容。', cfg: { dir: 'blur', blurAmt: 30, anim: 1.2 } },
      { id: 'enter-back-up', name: '回弹上浮', tags: ['回弹', '俏皮'], desc: '上浮到位后再回弹一点点，动作有生命感，适合轻量级资讯类内容。', cfg: { dir: 'up', curve: 'outBack' } },
      { id: 'enter-back-scale', name: '回弹放大', tags: ['回弹', '强调'], desc: '放大到位后轻微回弹，强调感强但不粗暴，适合数字与卖点。', cfg: { dir: 'scale', curve: 'outBack' } },
      { id: 'enter-elastic-up', name: '弹性上浮', tags: ['弹性', '活泼'], desc: '弹性曲线带来的自然余震，是电商与社媒内容最常用的入场手感。', cfg: { dir: 'up', curve: 'outElastic', glow: 0.6 } },
      { id: 'enter-bounce-drop', name: '弹跳落下', tags: ['弹跳', '活泼'], desc: '元素落地后连续弹跳几次才停稳，趣味性强，适合促销与儿童向内容。', cfg: { dir: 'down', curve: 'outBounce', dist: 260 } },
      { id: 'enter-expo-left', name: '急停左滑', tags: ['急停', '快节奏'], desc: '高速滑入并瞬间刹停，节奏干脆，适合信息密度高的数据画面。', cfg: { dir: 'left', curve: 'outExpo', anim: 0.7 } },
      { id: 'enter-expo-right', name: '急停右滑', tags: ['急停', '快节奏'], desc: '高速自右侧滑入急停，与左滑形成镜像，适合左右对比布局。', cfg: { dir: 'right', curve: 'outExpo', anim: 0.7 } },
      { id: 'enter-quint-clean', name: '干净上浮', tags: ['干净', '通用'], desc: '用干净利落的五次曲线完成上浮，没有多余动作，最百搭的默认选择。', cfg: { dir: 'up', curve: 'outQuint' } },
      { id: 'enter-card-up', name: '卡片上浮', tags: ['卡片', '界面'], desc: '一张信息卡片从下方托起，适合界面演示与功能介绍。', cfg: { shape: 'card', text: 'Dashboard', sub: '实时数据概览', dir: 'up', size: 158 } },
      { id: 'enter-card-flip', name: '卡片翻转', tags: ['卡片', '翻转'], desc: '卡片翻面出现，带轻微的立体翻转，适合产品切换与前后对比。', cfg: { shape: 'card', text: 'Pro Plan', sub: '专为团队设计', dir: 'flip', glow: 0.55, size: 158 } },
      { id: 'enter-card-elastic', name: '卡片弹入', tags: ['卡片', '弹性'], desc: '卡片带弹性余震落入画面，适合消息通知与轻量级弹层。', cfg: { shape: 'card', text: 'New Message', sub: '来自 Jaykou', dir: 'up', curve: 'outElastic', size: 66 } },
      { id: 'enter-card-blur', name: '卡片聚焦', tags: ['卡片', '虚化'], desc: '卡片从虚化中显影，质感偏高级，适合金融与科技类内容。', cfg: { shape: 'card', text: 'Quarterly Report', sub: '2026 · Q3', dir: 'blur', blurAmt: 28, size: 141 } },
      { id: 'enter-card-zoom', name: '卡片推近', tags: ['卡片', '推近'], desc: '卡片由远推近并淡入，制造镜头推进的感觉。', cfg: { shape: 'card', text: 'Featured', sub: '本期精选', dir: 'scale', size: 70 } },
      { id: 'enter-chip-pop', name: '标签弹入', tags: ['标签', '俏皮'], desc: '小胶囊从中心弹出，适合给关键词打上标记。', cfg: { shape: 'chip', text: 'NEW', dir: 'scale', curve: 'outBack', glow: 0.7 } },
      { id: 'enter-chip-slide', name: '标签滑入', tags: ['标签', '横向'], desc: '胶囊从左侧滑入，适合多个标签依次登场的场景。', cfg: { shape: 'chip', text: '限时特惠', dir: 'left', glow: 0.5 } },
      { id: 'enter-chip-elastic', name: '标签弹跳', tags: ['标签', '弹性'], desc: '胶囊带弹性落地，适合促销标签与徽章。', cfg: { shape: 'chip', text: 'HOT', dir: 'down', curve: 'outBounce', glow: 0.7 } },
      { id: 'enter-chip-focus', name: '标签聚焦', tags: ['标签', '虚化'], desc: '胶囊从虚化中清晰，适合需要质感的品牌露出。', cfg: { shape: 'chip', text: 'PREMIUM', dir: 'blur', blurAmt: 24, glow: 0.8 } },
      { id: 'enter-title-up', name: '标题组升起', tags: ['标题', '开场'], desc: '标题、下划线、副标题依次升起，是标准的开场版式。', cfg: { shape: 'title', text: '让画面动起来', sub: '嘉Jaykou动效工作台', dir: 'up', size: 229 } },
      { id: 'enter-title-blur', name: '标题组聚焦', tags: ['标题', '虚化'], desc: '标题从模糊中显影，副标题随后淡入，情绪更沉稳。', cfg: { shape: 'title', text: 'Design in Motion', sub: '视觉表达 · 一次说清', dir: 'blur', blurAmt: 26, size: 211 } },
      { id: 'enter-title-scale', name: '标题组缩放', tags: ['标题', '聚焦'], desc: '标题由小放大到正位，强调感强，适合结论页。', cfg: { shape: 'title', text: '增长 237%', sub: '同比去年 · 全渠道', dir: 'scale', size: 118 } },
      { id: 'enter-title-flip', name: '标题组翻转', tags: ['标题', '立体'], desc: '标题翻面展开，带轻微透视，适合新品发布。', cfg: { shape: 'title', text: 'NEW ARRIVAL', sub: '2026 秋冬系列', dir: 'flip', size: 100 } },
      { id: 'enter-title-elastic', name: '标题组弹入', tags: ['标题', '弹性'], desc: '标题弹性落位，气场活泼，适合社媒内容开头。', cfg: { shape: 'title', text: '今天聊点干货', sub: '跨境电商 · 选品方法论', dir: 'up', curve: 'outElastic', size: 211 } },
      { id: 'enter-title-bounce', name: '标题组弹跳', tags: ['标题', '弹跳'], desc: '标题从上方弹跳落下，趣味性强，适合轻松话题。', cfg: { shape: 'title', text: '三个避坑点', sub: '踩过的坑 · 都在这', dir: 'down', curve: 'outBounce', size: 100 } },
      { id: 'enter-title-roll', name: '标题组滚入', tags: ['标题', '动感'], desc: '标题带旋转滚入，动势凌厉，适合快节奏片头。', cfg: { shape: 'title', text: 'SPEED UP', sub: '效率即是优势', dir: 'roll', curve: 'outExpo', glow: 0.6 } },
      { id: 'enter-title-clean', name: '标题组净入', tags: ['标题', '干净'], desc: '用干净的缓动完成上浮，没有任何多余动效，商务首选。', cfg: { shape: 'title', text: '季度经营复盘', sub: '数据 · 结论 · 下一步', dir: 'up', curve: 'outQuint', glow: 0.25 } },
      { id: 'enter-slow-lux', name: '从容浮现', tags: ['慢速', '高级'], desc: '放慢到 1.8 秒的入场，配合虚化，适合品牌片与高端物料。', cfg: { anim: 1.8, blurAmt: 22, dir: 'blur', glow: 0.3, text: 'REFINED' } },
      { id: 'enter-fast-punch', name: '极速登场', tags: ['快速', '冲击'], desc: '0.45 秒完成的猛烈入场，适合短视频前三秒抓注意力。', cfg: { anim: 0.45, dir: 'up', curve: 'outExpo', dist: 300, glow: 0.75, text: 'WAIT!' } },
      { id: 'enter-side-pop', name: '侧向弹入', tags: ['侧向', '回弹'], desc: '从侧向回弹进入，介于滑入与弹出之间的手感。', cfg: { dir: 'right', curve: 'outBack', dist: 240, text: '第一时间' } },
      { id: 'enter-soft-rise', name: '柔光升入', tags: ['柔光', '上浮'], desc: '低强度辉光配合缓速上浮，气质柔和，适合生活方式内容。', cfg: { dir: 'up', anim: 1.35, glow: 0.35, curve: 'outQuint', text: 'Slow Living' } },
      { id: 'enter-hard-cut', name: '硬切入场', tags: ['硬切', '利落'], desc: '极短动作时长、近乎瞬移的入场，适合强调信息的冲击力。', cfg: { anim: 0.32, curve: 'outExpo', dir: 'up', dist: 380, glow: 0.85, text: 'BREAK' } },
      { id: 'enter-diagonal', name: '对角滑入', tags: ['对角', '动态'], desc: '沿对角线方向滑入，比水平或垂直多一分设计感。', cfg: { dir: 'roll', curve: 'outExpo', dist: 280, text: 'Move Different' } },
      { id: 'enter-zoom-fade', name: '缩放淡入', tags: ['缩放', '通用'], desc: '缩放与透明度同步变化，是最中性的强调式入场。', cfg: { dir: 'scale', curve: 'outQuint', glow: 0.4, text: 'Insight' } },
      { id: 'enter-delayed-stack', name: '延迟叠加', tags: ['延迟', '节奏'], desc: '较长的延迟配合较强弹跳，适合紧跟上一个动效之后的二次强调。', cfg: { delay: 0.75, dir: 'up', curve: 'outBack', text: '然后呢？' } },
      { id: 'enter-tall-pop', name: '长距弹出', tags: ['长距', '冲击'], desc: '超长位移配合回弹曲线，让元素几乎从画面外冲进来。', cfg: { dir: 'up', dist: 620, curve: 'outBack', anim: 1.1, text: 'BOOM' } }
    ]
  });

  /* ══════════════════════════ 原语二：元素退场 ══════════════════════════ */

  var EXIT_PARAMS = [
    P('text', '文案', 'GOODBYE', txt('GOODBYE')),
    P('dir', '退场方向', 'up', sel('up', [
      ['up', '向上飘离'], ['down', '向下沉离'], ['left', '向左滑离'], ['right', '向右滑离'],
      ['scale', '缩小消失'], ['grow', '放大淡出'], ['rotate', '旋转离去'],
      ['flip', '翻转收起'], ['blur', '虚化消散']
    ])),
    P('curve', '运动曲线', 'inCubic', sel('inCubic', [
      ['inCubic', '加速'], ['inQuint', '猛冲'], ['inOutCubic', '起缓收急'], ['inQuad', '轻缓']
    ])),
    P('dist', '位移量', 200, rng(200, 30, 640, 10)),
    P('anim', '动作时长', 0.8, rng(0.8, 0.3, 2, 0.05)),
    P('hold', '保持时长', 1.2, rng(1.2, 0, 3, 0.1)),
    P('size', '字号', 211, rng(211, 295, 295, 2)),
    P('blurAmt', '虚化强度', 18, rng(18, 0, 40, 1)),
    P('glow', '辉光', 0.4, rng(0.4, 0, 1, 0.05))
  ];

  function exitDraw(ctx, t, p, U) {
    var W = U.W, H = U.H, S = U.S, e = U.ease;
    var ez = e[p.curve] || e.inCubic;
    var raw = U.clamp((t - p.hold) / Math.max(0.08, p.anim), 0, 1);
    var k = ez(raw);
    var vis = 1 - raw;
    var d = p.dist * S;
    var dx = 0, dy = 0, rot = 0, sc = 1, sy = 1;
    var dir = p.dir;
    if (dir === 'up') { dy = -k * d; }
    else if (dir === 'down') { dy = k * d; }
    else if (dir === 'left') { dx = -k * d; }
    else if (dir === 'right') { dx = k * d; }
    else if (dir === 'scale') { sc = 1 - 0.85 * k; }
    else if (dir === 'grow') { sc = 1 + 0.9 * k; }
    else if (dir === 'rotate') { rot = k * 0.7; sc = 1 - 0.4 * k; }
    else if (dir === 'flip') { sy = 1 - 0.97 * k; }
    else if (dir === 'blur') { sc = 1 - 0.12 * k; }
    else { dy = -k * d; }
    var blur = k * p.blurAmt * S;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.globalAlpha = U.clamp(vis, 0, 1);
    if (blur > 0.5) ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
    ctx.translate(dx, dy);
    if (rot) ctx.rotate(rot);
    ctx.scale(sc, sc * sy);

    var size = p.size * S;
    ctx.font = U.fs(size, 900);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var gr = ctx.createLinearGradient(-W * 0.3, 0, W * 0.3, 0);
    gr.addColorStop(0, U.ink);
    gr.addColorStop(1, U.mix(U.ink, U.accent2, 0.6));
    if (p.glow > 0.02) { ctx.shadowColor = U.rgba(U.accent2, p.glow); ctx.shadowBlur = 34 * S * p.glow; }
    ctx.fillStyle = gr;
    ctx.fillText(String(p.text || ''), 0, 0);
    ctx.restore();
  }

  MF.forge({
    cat: '退场收尾', type: 'block', dur: 5, poster: 0.62,
    texts: ['GOODBYE', 'SEE YOU', 'FADE OUT', 'THE END', 'EXIT', 'WRAP UP', 'ADIEU', 'FIN', '收尾', '落幕'],
    params: EXIT_PARAMS, draw: exitDraw,
    ids: [
      { id: 'exit-up', name: '上浮退离', tags: ['上浮', '收尾'], desc: '元素加速向上飘离，最常见的收尾动作，衔接下一个画面很自然。', cfg: { dir: 'up' } },
      { id: 'exit-down', name: '下沉退离', tags: ['下沉', '收尾'], desc: '元素向下沉离，带一点落幕感，适合章节结束。', cfg: { dir: 'down' } },
      { id: 'exit-left', name: '左滑退离', tags: ['左滑', '收尾'], desc: '元素向左滑出画面，与左滑入场互为镜像，可做往返切换。', cfg: { dir: 'left' } },
      { id: 'exit-right', name: '右滑退离', tags: ['右滑', '收尾'], desc: '元素向右滑出，与右滑入场互为镜像，可做往返切换。', cfg: { dir: 'right' } },
      { id: 'exit-scale', name: '缩小消失', tags: ['缩小', '收束'], desc: '元素缩向中心消失，把注意力收拢回画面中心。', cfg: { dir: 'scale' } },
      { id: 'exit-grow', name: '放大淡出', tags: ['放大', '穿越'], desc: '元素放大到冲出画面，像穿过镜头一样，适合场景切换。', cfg: { dir: 'grow', curve: 'inQuad' } },
      { id: 'exit-rotate', name: '旋转离去', tags: ['旋转', '动感'], desc: '元素边旋转边缩小离开，动势更有戏剧性。', cfg: { dir: 'rotate' } },
      { id: 'exit-flip', name: '翻转收起', tags: ['翻转', '立体'], desc: '元素像翻牌一样收拢消失，适合翻页与切换场景。', cfg: { dir: 'flip' } },
      { id: 'exit-blur', name: '虚化消散', tags: ['虚化', '高级'], desc: '元素逐渐模糊到消失，柔和且高级，适合品牌片收尾。', cfg: { dir: 'blur', blurAmt: 32, anim: 1.1 } },
      { id: 'exit-fast-cut', name: '急速切离', tags: ['急速', '利落'], desc: '极短时长内迅速离场，适合快剪节奏。', cfg: { dir: 'up', anim: 0.35, curve: 'inQuint', dist: 420 } },
      { id: 'exit-slow-fade', name: '缓缓隐没', tags: ['慢速', '抒情'], desc: '长时间缓慢淡出，情绪绵长，适合纪录片式收尾。', cfg: { dir: 'blur', blurAmt: 26, anim: 1.9, hold: 1 } },
      { id: 'exit-blow-up', name: '爆破离场', tags: ['放大', '冲击'], desc: '元素急速放大到超出画面，冲击感强，适合广告收尾。', cfg: { dir: 'grow', anim: 0.5, curve: 'inQuint', glow: 0.8 } },
      { id: 'exit-shrink-thread', name: '收束成点', tags: ['缩小', '聚焦'], desc: '元素缩小到几乎变成一个点后消失，像被光点吸走。', cfg: { dir: 'scale', anim: 1, curve: 'inOutCubic', glow: 0.7 } },
      { id: 'exit-drift', name: '漂流离去', tags: ['漂移', '柔和'], desc: '边轻微旋转边向上飘走，像纸片被风带走。', cfg: { dir: 'rotate', dist: 320, anim: 1.5, curve: 'inOutCubic' } },
      { id: 'exit-long-hold', name: '长留后离', tags: ['停留', '节奏'], desc: '保持 3 秒后再离场，适合需要充分阅读的标题。', cfg: { hold: 3, dir: 'up', anim: 0.7 } },
      { id: 'exit-vanish', name: '瞬间隐没', tags: ['瞬间', '极短'], desc: '几乎不带动效的瞬时消失，适合硬切剪辑。', cfg: { anim: 0.28, curve: 'inQuad', dir: 'blur', blurAmt: 8, dist: 40 } }
    ]
  });
})();
