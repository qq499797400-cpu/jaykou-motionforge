/* ════════════════════════════════════════════════════════════════════
   嘉Jaykou动效库 · 视频风格系统（VIDEO STYLE KIT）
   ────────────────────────────────────────────────────────────────────
   数据来源：嘉Jaykou 剪辑工作台沉淀的两套正式视觉合同
     · docs/styles/obsidian-glass-cognition-system.md （方法论 V4 · 默认）
     · docs/styles/black-gold-business-dossier.md    （方法论 V3 · 显式调用）
   两套风格不得混用，配色/字体/圆角/禁用项严格按合同执行。

   本文件是「预览 == 导出」的唯一真源：
     CSS 与模板 HTML 都由这里生成，页面预览、下载 HTML、导出 PNG 共用同一份。
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MF = window.MF || (window.MF = {});

  /* ══════════════════ 固定案例内容（两套风格共用，便于对比风格差异） ══════════════════ */
  var CASE = {
    no: '第 12 期',
    dossier: 'DOSSIER 012',
    section: '系统诊断 / 03',
    mark: '58%',
    eyebrow: '低回报系统已识别',
    /* ⚠️ <br/> 必须自闭合：导出 PNG 走 SVG foreignObject（按 XML 解析），
       HTML 里写成 <br> 会让整个 SVG 解析失败，导出直接报错 */
    title: '你不是不努力<br/>是<em class="em-alt">系统</em>没有<em class="em-key">复利</em>',
    sub: '真正拉开差距的，从来不是重复用力。<br/><b>找到反馈回路，让每一次行动成为下一次行动的杠杆。</b>',
    panelLabel: 'SYSTEM RETURN INDEX',
    score: '8.7',
    delta: '↑ 36.4%',
    steps: ['01 识别', '02 重构', '03 复利'],
    activeStep: 1,
    caption: '大多数人不是<em class="em-key">不努力</em>，而是把努力投进了<em class="em-bad">低回报系统</em>',
    author: '作者 · 嘉Jaykou',
    wechat: '微信 JAYKOU411',
    coverBrand: 'JAYKOU COGNITION',
    coverCrit: '别再误判',
    coverLabel: '复利习惯',
    coverSub: '先修系统，再谈努力'
  };

  /* ══════════════════ 两套风格（合同字段全量录入） ══════════════════ */
  var STYLES = [
    {
      id: 'obsidian-glass',
      skin: 'glass',
      name: '黑曜玻璃认知系统',
      en: 'OBSIDIAN GLASS COGNITION SYSTEM',
      ver: '方法论 V4',
      badge: '账号默认',
      tagline: '深色 Apple UI 玻璃材质 · 商业诊断的锋利感',
      desc: '为无真人出镜的认知 / 商业 / 自我提升视频而做。它不是普通科技风，而是玻璃材质、诊断结构与认知拆解三件事叠在一起。',
      vibe: ['这个人很懂商业', '这句话戳醒我了', '这个方法我得收藏', '这个观点很锋利'],
      tokens: [
        { n: '背景黑', v: '#020305', d: '视频主背景' },
        { n: '深层黑', v: '#07090d', d: '渐变中段' },
        { n: '面板黑', v: '#0b1117', d: '玻璃面板底' },
        { n: '主文字', v: '#fffaf0', d: '大字观点 / 标题' },
        { n: '辅助文字', v: '#b5bfca', d: '副标题 / 标签' },
        { n: '荧光绿', v: '#39ff88', d: '方法 / 复利 / 正确路径' },
        { n: '科技紫', v: '#9b6cff', d: '系统 / 结构 / 认知层' },
        { n: '科技蓝', v: '#56e8ff', d: '信号线 / 进度' },
        { n: '批判红', v: '#ff3f4d', d: '失效 / 低回报 / 警告' }
      ],
      font: 'HarmonyOS Sans SC → MiSans → Microsoft YaHei UI → PingFang SC',
      panel: '28–32px 大圆角 · 1px 半透明白描边 · 内侧上沿高光 · blur(22px) saturate(1.25)',
      semantics: [
        ['荧光绿', '努力 · 勤奋 · 反馈 · 复利 · 方法 · 正确路径 · 激活状态'],
        ['科技紫', '系统 · 结构 · 认知 · 节点 · 框架 · 诊断层'],
        ['科技蓝', '信号线 · 进度节点 · 数据流'],
        ['批判红', '系统失效 · 低回报 · 懒惰 · 错误归因 · 警告']
      ],
      rules: [
        '以文字为主体时主观点必须居中，保留干净负空间',
        '所有面板统一深色玻璃材质，不使用直角硬框',
        '主文字背后不放整块半透明面板、雾状光晕或扫描线压灰文字',
        '字幕固定在底部安全区居中，支持关键词高亮，不压主画面',
        '每 2–4 秒信息变化，每 5–7 秒一个非字幕视觉亮点，每 12–18 秒强命中'
      ],
      banned: ['直角硬框', '粗描边', '普通 PPT 卡片', '灰蒙蒙低亮度彩色字', '大面积廉价霓虹发光'],
      spec: [
        ['视频比例', '16:9'],
        ['预览 / 成片', '1920×1080 → 3840×2160'],
        ['封面', '3:4 · 1536×2048'],
        ['帧率 / 输出', '30fps · H.264 yuv420p BT.709 · AAC 48kHz']
      ]
    },
    {
      id: 'black-gold',
      skin: 'gold',
      name: '黑金商业档案',
      en: 'BLACK GOLD BUSINESS DOSSIER',
      ver: '方法论 V3',
      badge: '显式调用',
      tagline: '高级咨询报告感 · 档案级厚度与判断力',
      desc: '深黑石墨底 + 暖金，骨白中文大字像一句商业判断。要调用它必须明确说「用黑金风 / 黑金商业档案」，且不能混回黑曜玻璃的荧光绿与科技紫。',
      vibe: ['像审计报告', '像咨询方案', '像一份被盖章的结论', '克制、有厚度'],
      tokens: [
        { n: '石墨黑', v: '#020305', d: '视频主背景' },
        { n: '档案深', v: '#11100d', d: '渐变中段' },
        { n: '卡片黑', v: '#191713', d: '档案卡面' },
        { n: '骨白', v: '#f4eddf', d: '大字观点 / 标题' },
        { n: '钛灰', v: '#aaa193', d: '副标题 / 标签' },
        { n: '香槟金', v: '#d7b36a', d: '杠杆 / 方法 / 复利' },
        { n: '批判红', v: '#ff3f4d', d: '仅批判与错误路径' }
      ],
      font: 'Microsoft YaHei UI → PingFang SC → HarmonyOS Sans SC',
      panel: '22px 圆角 · 1px 金描边（32% 透明度）· 深黑到暗金块面渐变 · 不用模糊玻璃',
      semantics: [
        ['香槟金', '杠杆 · 方法 · 复利 · 被选中的正确路径'],
        ['骨白', '大字观点 · 商业判断 · 主标题'],
        ['钛灰', '副标题 · 注释 · 报告编号'],
        ['批判红', '仅批判、警告、错误路径（常规强调不用红）']
      ],
      rules: [
        '文字重叠绝对禁止：卡片压字、字幕压主画面一律硬失败',
        '大字观点约占画面 60%，卡片 / 数据结构约占 40%，不做 PPT 信息块',
        '转场只用元素接力、轻微推拉、档案页内翻动、细线扫过边缘',
        '封面背景只用深黑到暗金的线性渐变，不放圆形光晕或雾化光效',
        '每 5–7 秒仍有非字幕视觉机制，后半段不能退化成字幕 + 普通卡片'
      ],
      banned: ['雾蒙蒙玻璃风', '全屏网格背景', '霓虹蓝紫科技风', '发光字体做主效果', 'SaaS 仪表盘'],
      spec: [
        ['视频比例', '16:9'],
        ['预览 / 成片', '1920×1080 → 3840×2160'],
        ['封面', '3:4 · 1536×2048'],
        ['帧率 / 输出', '30fps · H.264 CRF16 BT.709 · AAC 48kHz']
      ]
    }
  ];

  /* ══════════════════ 模板 CSS（预览 / 导出 / 下载三处共用） ══════════════════ */
  var CSS = [
    /* —— 复位（用 :where() 保持零特异性，不覆盖下方类样式；保证页面内预览与导出一致） —— */
    '.vsk :where(*),.vsk :where(*::before),.vsk :where(*::after){box-sizing:border-box}',
    '.vsk :where(h1,p,ul,li,figure,figcaption){margin:0;padding:0}',
    '.vsk :where(em,i){font-style:normal}',

    /* —— 画布与底 —— */
    '.vsk{position:relative;overflow:hidden;display:grid;font-family:"HarmonyOS Sans SC","MiSans","Microsoft YaHei UI","PingFang SC","Noto Sans SC",sans-serif;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}',
    '.vsk--169{width:1920px;height:1080px;padding:54px 96px 58px;grid-template-rows:auto 1fr auto;gap:44px}',
    '.vsk--34{width:1536px;height:2048px;padding:104px 118px 92px;grid-template-rows:auto 1fr auto;gap:40px}',
    '.vsk-gridbg{position:absolute;inset:0;pointer-events:none;opacity:.18;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(to bottom,#000,transparent 88%);mask-image:linear-gradient(to bottom,#000,transparent 88%)}',
    '.vsk--glass{--vsk-accent:#39ff88;--vsk-alt:#9b6cff;--vsk-ink:#fffaf0;--vsk-mut:#b5bfca;color:#fffaf0;background:radial-gradient(circle at 72% 28%,rgba(155,108,255,.12),transparent 28%),radial-gradient(circle at 24% 76%,rgba(57,255,136,.08),transparent 30%),linear-gradient(140deg,#020305,#07090d 56%,#030609)}',
    '.vsk--gold{--vsk-accent:#d7b36a;--vsk-alt:#d7b36a;--vsk-ink:#f4eddf;--vsk-mut:#aaa193;color:#f4eddf;background:linear-gradient(135deg,#070604,#11100d 55%,#080704)}',
    '.vsk--gold .vsk-gridbg{display:none}',

    /* —— 顶部安全区 —— */
    '.vsk-top{position:relative;z-index:2;display:flex;align-items:center;gap:20px;font-size:17px;letter-spacing:.08em;color:var(--vsk-mut)}',
    '.vsk-top .vsk-author{display:inline-flex;align-items:center;color:var(--vsk-ink);font-weight:800}',
    '.vsk-top .vsk-dot{width:9px;height:9px;margin-right:11px;border-radius:50%;background:var(--vsk-accent);box-shadow:0 0 18px var(--vsk-accent);flex:none}',
    '.vsk--gold .vsk-top .vsk-dot{box-shadow:none}',
    '.vsk-top .vsk-wx{margin-left:14px;color:var(--vsk-mut);font-weight:400;letter-spacing:.06em}',
    '.vsk-track{position:relative;flex:1;height:3px;border-radius:99px;background:rgba(255,255,255,.09);min-width:180px}',
    '.vsk-track i{position:absolute;left:0;top:0;bottom:0;border-radius:inherit;background:linear-gradient(90deg,var(--vsk-accent),var(--vsk-alt));box-shadow:0 0 14px rgba(86,232,255,.5)}',
    '.vsk-track b{position:absolute;top:50%;width:11px;height:11px;border:2px solid var(--vsk-alt);border-radius:50%;background:#020305;transform:translate(-50%,-50%);box-shadow:0 0 16px var(--vsk-alt)}',
    '.vsk--gold .vsk-track i{box-shadow:none}',
    '.vsk--gold .vsk-track b{display:none}',

    /* —— 主体 —— */
    '.vsk-main{position:relative;z-index:2;display:grid;grid-template-columns:1.28fr .84fr;align-items:center;gap:78px;min-height:0}',
    '.vsk-eyebrow{display:inline-flex;align-items:center;gap:11px;padding:12px 19px;border-radius:999px;border:1px solid rgba(255,63,77,.28);background:rgba(255,63,77,.07);color:#ff8b94;font-size:17px;font-weight:800;letter-spacing:.14em;white-space:nowrap}',
    '.vsk-eyebrow i{width:7px;height:7px;border-radius:50%;background:#ff3f4d;box-shadow:0 0 12px #ff3f4d;flex:none}',
    '.vsk--gold .vsk-eyebrow{border-color:rgba(215,179,106,.42);background:rgba(215,179,106,.08);color:#d7b36a}',
    '.vsk--gold .vsk-eyebrow i{background:#d7b36a;box-shadow:none}',
    '.vsk-title{margin:34px 0 26px;font-size:88px;font-weight:900;line-height:1.1;letter-spacing:-4px}',
    '.vsk-title .em-key{font-style:normal;color:var(--vsk-accent);text-shadow:0 0 30px rgba(57,255,136,.18)}',
    '.vsk-title .em-alt{font-style:normal;color:var(--vsk-alt);text-shadow:0 0 30px rgba(155,108,255,.2)}',
    '.vsk--gold .vsk-title .em-key,.vsk--gold .vsk-title .em-alt{text-shadow:none}',
    '.vsk-sub{margin:0;max-width:900px;font-size:26px;line-height:1.72;color:var(--vsk-mut)}',
    '.vsk-sub b{color:var(--vsk-ink)}',

    /* —— 右侧面板 —— */
    '.vsk-panel{position:relative;display:flex;flex-direction:column;justify-content:center;gap:16px;padding:42px;border-radius:32px;overflow:hidden;border:1px solid rgba(255,255,255,.15);background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.035) 44%,rgba(4,6,10,.76)),rgba(4,6,10,.76);box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 35px 90px rgba(0,0,0,.45);backdrop-filter:blur(22px) saturate(1.25);-webkit-backdrop-filter:blur(22px) saturate(1.25)}',
    '.vsk-panel::after{content:"";position:absolute;top:-80px;right:-70px;width:190px;height:190px;border-radius:50%;background:var(--vsk-alt);filter:blur(80px);opacity:.22}',
    '.vsk--gold .vsk-panel{border-radius:22px;border-color:rgba(215,179,106,.32);background:linear-gradient(145deg,#191713,#0b0a08);box-shadow:inset 0 1px rgba(255,255,255,.08),0 35px 90px rgba(0,0,0,.5);backdrop-filter:none;-webkit-backdrop-filter:none}',
    '.vsk--gold .vsk-panel::after{display:none}',
    '.vsk-label{position:relative;z-index:1;font-size:16px;letter-spacing:.18em;color:var(--vsk-mut)}',
    '.vsk-score{position:relative;z-index:1;display:flex;align-items:flex-end;gap:16px}',
    '.vsk-score b{font-size:106px;font-weight:900;line-height:.9}',
    '.vsk-score span{color:var(--vsk-accent);font-size:22px;font-weight:800}',
    '.vsk-chart{position:relative;z-index:1;height:104px;margin-top:6px;border-bottom:1px solid rgba(255,255,255,.1);background:repeating-linear-gradient(to bottom,transparent 0 34px,rgba(255,255,255,.045) 35px)}',
    '.vsk-chart svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.vsk-steps{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}',
    '.vsk-steps div{padding:14px 8px;border-radius:14px;background:rgba(255,255,255,.035);color:var(--vsk-mut);font-size:15px;text-align:center;white-space:nowrap}',
    '.vsk-steps .on{color:var(--vsk-accent);background:rgba(57,255,136,.08);border:1px solid rgba(57,255,136,.22)}',
    '.vsk--gold .vsk-steps div{border-radius:10px;background:rgba(215,179,106,.05)}',
    '.vsk--gold .vsk-steps .on{color:var(--vsk-accent);background:rgba(215,179,106,.07);border-color:rgba(215,179,106,.4)}',
    '.vsk-stamp{display:none}',
    '.vsk--gold .vsk-stamp{position:relative;z-index:1;display:inline-flex;align-self:flex-start;padding:8px 16px;border:3px solid #ff3f4d;color:#ff3f4d;font-size:22px;font-weight:900;letter-spacing:.06em;transform:rotate(-4deg)}',

    /* —— 底部字幕安全区 —— */
    '.vsk-caption{position:relative;z-index:2;justify-self:center;align-self:end;max-width:1520px;padding:16px 30px;border-radius:18px;border:1px solid rgba(255,255,255,.13);background:rgba(8,12,16,.78);box-shadow:inset 0 1px rgba(255,255,255,.1),0 12px 38px rgba(0,0,0,.35);font-size:25px;text-align:center}',
    '.vsk-caption .em-key{font-style:normal;color:var(--vsk-accent);font-weight:800}',
    '.vsk-caption .em-bad{font-style:normal;color:#ff3f4d;font-weight:800}',
    '.vsk--gold .vsk-caption{border-color:rgba(215,179,106,.25);background:rgba(10,9,7,.9)}',

    /* —— 3:4 封面 —— */
    '.vsk--34 .vsk-cover-top{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;font-size:25px;letter-spacing:.24em;color:var(--vsk-mut)}',
    '.vsk-cover-brand{color:var(--vsk-ink);font-weight:800}',
    '.vsk-cover-mid{position:relative;z-index:2;align-self:center;justify-self:center;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:96px 76px;text-align:center;border-radius:44px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(150deg,rgba(255,255,255,.075),rgba(255,255,255,.018) 48%,rgba(4,6,10,.55));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 44px 110px rgba(0,0,0,.45);backdrop-filter:blur(20px) saturate(1.2);-webkit-backdrop-filter:blur(20px) saturate(1.2)}',
    '.vsk--gold .vsk-cover-mid{border-radius:32px;border-color:rgba(215,179,106,.2);background:linear-gradient(150deg,#131110,#0a0908);box-shadow:inset 0 1px rgba(255,255,255,.05),0 44px 110px rgba(0,0,0,.55);backdrop-filter:none;-webkit-backdrop-filter:none}',
    '.vsk-cover-crit{display:inline-flex;align-items:center;padding:14px 30px;border-radius:999px;border:1px solid rgba(255,63,77,.3);background:rgba(255,63,77,.08);color:#ff8b94;font-size:29px;font-weight:800;letter-spacing:.16em}',
    '.vsk--gold .vsk-cover-crit{border-color:rgba(255,63,77,.42);border-radius:10px;color:#ff3f4d;background:rgba(255,63,77,.06)}',
    '.vsk-cover-title{margin:0;font-size:126px;font-weight:900;line-height:1.2;letter-spacing:-5px}',
    '.vsk-cover-title .em-key{font-style:normal;color:var(--vsk-accent);text-shadow:0 0 42px rgba(57,255,136,.22)}',
    '.vsk-cover-title .em-alt{font-style:normal;color:var(--vsk-alt);text-shadow:0 0 42px rgba(155,108,255,.24)}',
    '.vsk--gold .vsk-cover-title .em-key,.vsk--gold .vsk-cover-title .em-alt{text-shadow:none}',
    '.vsk-cover-label{display:inline-block;padding:15px 36px;border-radius:14px;border:1px solid rgba(57,255,136,.28);background:rgba(57,255,136,.08);color:var(--vsk-accent);font-size:31px;font-weight:800;letter-spacing:.1em}',
    '.vsk--gold .vsk-cover-label{border-color:rgba(215,179,106,.42);background:rgba(215,179,106,.07)}',
    '.vsk--34 .vsk-cover-foot{position:relative;z-index:2;text-align:center}',
    '.vsk-cover-sub{margin:0 0 26px;font-size:39px;color:var(--vsk-mut)}',
    '.vsk-cover-sub b{color:var(--vsk-ink)}',
    '.vsk-cover-sig{display:block;font-size:23px;letter-spacing:.14em;color:var(--vsk-mut)}',
    '.vsk-signal{position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,transparent,var(--vsk-accent),var(--vsk-alt),transparent);opacity:.72}',

    /* —— 独立打开时的自适应（不影响导出） —— */
    '.vsk-stage{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#020305;overflow:hidden}',
    '.vsk-stage .vsk{flex:none}'
  ].join('\n');

  var INJECTED = false;
  function ensureCSS() {
    if (INJECTED) return;
    var el = document.createElement('style');
    el.id = 'vsk-style';
    el.textContent = CSS;
    document.head.appendChild(el);
    INJECTED = true;
  }

  function styleById(id) {
    for (var i = 0; i < STYLES.length; i++) if (STYLES[i].id === id) return STYLES[i];
    return STYLES[0];
  }
  function size(kind) {
    return kind === 'cover' ? { w: 1536, h: 2048, cls: 'vsk--34' } : { w: 1920, h: 1080, cls: 'vsk--169' };
  }

  /* ══════════════════ 16:9 视频画面模板 ══════════════════ */
  function videoHTML(id) {
    var s = styleById(id);
    var sz = size('video');
    return '<div class="vsk ' + sz.cls + ' vsk--' + s.skin + '" data-vsk-style="' + s.id + '" data-vsk-kind="video">' +
      '<div class="vsk-gridbg"></div>' +
      '<header class="vsk-top">' +
        '<span class="vsk-author"><i class="vsk-dot"></i>' + CASE.author + '<span class="vsk-wx">' + CASE.wechat + '</span></span>' +
        '<span>' + CASE.section + '</span>' +
        '<div class="vsk-track"><i style="width:' + CASE.mark + '"></i><b style="left:' + CASE.mark + '"></b></div>' +
        '<span>' + CASE.mark + '</span>' +
      '</header>' +
      '<section class="vsk-main">' +
        '<div class="vsk-copy">' +
          '<span class="vsk-eyebrow"><i></i>' + CASE.eyebrow + '</span>' +
          '<h1 class="vsk-title">' + CASE.title + '</h1>' +
          '<p class="vsk-sub">' + CASE.sub + '</p>' +
        '</div>' +
        '<aside class="vsk-panel">' +
          '<span class="vsk-stamp">' + CASE.coverCrit + '</span>' +
          '<div class="vsk-label">' + CASE.panelLabel + '</div>' +
          '<div class="vsk-score"><b>' + CASE.score + '</b><span>' + CASE.delta + '</span></div>' +
          '<div class="vsk-chart">' +
            '<svg viewBox="0 0 420 100" preserveAspectRatio="none" aria-hidden="true">' +
              '<defs><linearGradient id="vskfill-' + s.id + '" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0" stop-color="var(--vsk-accent)" stop-opacity=".26"/>' +
                '<stop offset="1" stop-color="var(--vsk-accent)" stop-opacity="0"/></linearGradient></defs>' +
              '<path d="M0 90 C48 87 58 72 104 74 S160 52 202 61 S260 36 300 42 S356 8 420 12 L420 100 L0 100Z" fill="url(#vskfill-' + s.id + ')"/>' +
              '<path d="M0 90 C48 87 58 72 104 74 S160 52 202 61 S260 36 300 42 S356 8 420 12" fill="none" stroke="var(--vsk-accent)" stroke-width="3" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<div class="vsk-steps">' +
            CASE.steps.map(function (t, i) { return '<div' + (i === CASE.activeStep ? ' class="on"' : '') + '>' + t + '</div>'; }).join('') +
          '</div>' +
        '</aside>' +
      '</section>' +
      '<footer class="vsk-caption">' + CASE.caption + '</footer>' +
    '</div>';
  }

  /* ══════════════════ 3:4 封面模板 ══════════════════ */
  function coverHTML(id) {
    var s = styleById(id);
    var sz = size('cover');
    return '<div class="vsk ' + sz.cls + ' vsk--' + s.skin + '" data-vsk-style="' + s.id + '" data-vsk-kind="cover">' +
      '<div class="vsk-gridbg"></div>' +
      '<header class="vsk-cover-top">' +
        '<span class="vsk-cover-brand">' + CASE.coverBrand + '</span>' +
        '<span>' + CASE.no + ' · ' + CASE.dossier + '</span>' +
      '</header>' +
      '<section class="vsk-cover-mid">' +
        '<span class="vsk-cover-crit">' + CASE.coverCrit + '</span>' +
        '<h1 class="vsk-cover-title">' + CASE.title + '</h1>' +
        '<span class="vsk-cover-label">' + CASE.coverLabel + '</span>' +
      '</section>' +
      '<footer class="vsk-cover-foot">' +
        '<p class="vsk-cover-sub">' + CASE.coverSub + '</p>' +
        '<span class="vsk-cover-sig">' + CASE.author + ' ｜ ' + CASE.wechat + '</span>' +
      '</footer>' +
      '<div class="vsk-signal"></div>' +
    '</div>';
  }

  function frameHTML(id, kind) {
    return kind === 'cover' ? coverHTML(id) : videoHTML(id);
  }

  /* ══════════════════ 挂载预览（按容器宽度等比缩放） ══════════════════ */
  function mount(wrap, id, kind) {
    if (!wrap) return null;
    ensureCSS();
    var sz = size(kind);
    wrap.innerHTML = frameHTML(id, kind);
    var root = wrap.firstElementChild;
    wrap.style.position = 'relative';
    wrap.style.overflow = 'hidden';
    wrap.style.aspectRatio = sz.w + ' / ' + sz.h;
    root.style.position = 'absolute';
    root.style.left = '0';
    root.style.top = '0';
    root.style.transformOrigin = 'top left';
    var fit = function () {
      var k = wrap.clientWidth / sz.w;
      if (k > 0) root.style.transform = 'scale(' + k + ')';
    };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
    else window.addEventListener('resize', fit);
    return root;
  }

  /* ══════════════════ 独立 HTML（下载 / 复制用） ══════════════════ */
  function standalone(id, kind) {
    var s = styleById(id);
    var sz = size(kind);
    var name = s.name + ' · ' + (kind === 'cover' ? '3:4 封面模板' : '16:9 视频画面模板');
    return '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + name + '</title>\n' +
      '<style>\n*{box-sizing:border-box}\n' + CSS + '\n</style>\n</head>\n' +
      '<body class="vsk-stage">\n' + frameHTML(id, kind) + '\n' +
      '<script>\n(function(){var W=' + sz.w + ',H=' + sz.h + ';var f=document.querySelector(".vsk");\n' +
      'function fit(){var k=Math.min(innerWidth/W,innerHeight/H);f.style.transform="scale("+k+")";}\n' +
      'addEventListener("resize",fit);fit();})();\n<\/script>\n</body>\n</html>\n';
  }

  /* ══════════════════ 导出 PNG（SVG foreignObject → Canvas） ══════════════════ */
  function exportPNG(id, kind, done) {
    var s = styleById(id);
    var sz = size(kind);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz.w + '" height="' + sz.h + '" viewBox="0 0 ' + sz.w + ' ' + sz.h + '">' +
      '<foreignObject x="0" y="0" width="' + sz.w + '" height="' + sz.h + '">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="width:' + sz.w + 'px;height:' + sz.h + 'px">' +
      '<style>' + CSS + '</style>' + frameHTML(id, kind) +
      '</div></foreignObject></svg>';
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = sz.w;
      cv.height = sz.h;
      cv.getContext('2d').drawImage(img, 0, 0);
      cv.toBlob(function (b) {
        if (!b) return done(false);
        if (MF.download) MF.download(b, fileName(id, kind, 'png'));
        done(true);
      }, 'image/png');
    };
    img.onerror = function () { done(false); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function fileName(id, kind, ext) {
    var s = styleById(id);
    return '嘉Jaykou动效库-' + s.name + '-' + (kind === 'cover' ? '3x4封面' : '16x9视频') + '模板.' + ext;
  }

  /* ══════════════════ 对外 API ══════════════════ */
  MF.VIDEO_STYLES = STYLES;
  MF.vsStyle = styleById;
  MF.vsFrameHTML = function (id, kind) { ensureCSS(); return frameHTML(id, kind); };
  MF.vsMount = mount;
  MF.vsStandalone = standalone;
  MF.vsFileName = fileName;
  MF.vsExportPNG = exportPNG;
  MF.vsDownloadHTML = function (id, kind) {
    if (!MF.downloadText) return false;
    MF.downloadText(standalone(id, kind), fileName(id, kind, 'html'), 'text/html');
    return true;
  };
})();
