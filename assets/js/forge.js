/* ==========================================================================
   Jaykou — Forge（动效锻造器）

   作用：把「一份绘制原语 + 一组参数配方」批量注册成独立动效。
   这样几百个动效共享同一套经过验证的运动语法，但每个动效拥有自己的
   名称、描述、标签、默认参数与时长 —— 视觉上各不相同，且都能继续调参。

   硬约束：draw 函数会被 toString() 序列化进导出产物（单文件 HTML / React）。
   因此原语 draw 必须「自包含」—— 只能使用形参 (ctx, t, p, U)，
   绝不引用外部作用域变量或外部辅助函数，全部行为由 p（参数）驱动。
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* 注册一批同族动效。
     spec = {
       cat:    分类名
       type:   'block' | 'component'
       dur:    默认时长
       poster: 默认代表帧位置
       params: 参数 schema（各变体可覆盖 def）
       draw:   绘制原语
       ids:    [{ id, name, desc, tags, dur, poster, cfg:{参数默认值覆盖} }]
     } */
  MF.forge = function (spec) {
    var base = spec.params || [];
    var list = spec.ids || [];
    /* 可选：为没有自定义文案的变体轮换默认文案，避免整个分类的封面长得一样 */
    if (spec.texts && spec.texts.length) {
      var field = spec.textField || 'text';
      list.forEach(function (item, ix) {
        item.cfg = item.cfg || {};
        if (item.cfg[field] === undefined) item.cfg[field] = spec.texts[ix % spec.texts.length];
      });
    }
    list.forEach(function (item) {
      var params = base.map(function (pd) {
        var def = pd.def;
        if (item.cfg && item.cfg[pd.k] !== undefined) def = item.cfg[pd.k];
        var np = { k: pd.k, label: pd.label, type: pd.type, def: def };
        if (pd.min !== undefined) np.min = pd.min;
        if (pd.max !== undefined) np.max = pd.max;
        if (pd.step !== undefined) np.step = pd.step;
        if (pd.options) np.options = pd.options;
        return np;
      });
      MF.register({
        id: item.id,
        name: item.name,
        cat: spec.cat,
        type: item.type || spec.type || 'block',
        dur: item.dur === undefined ? (spec.dur === undefined ? 5.5 : spec.dur) : item.dur,
        poster: item.poster === undefined
          ? (spec.poster === undefined ? 0.72 : spec.poster) : item.poster,
        desc: item.desc || '',
        tags: item.tags || [],
        src: item.src || spec.src || null,   /* 灵感出处：{ name, url }，在工作台里可见可点 */
        params: params,
        draw: spec.draw
      });
    });
    return list.length;
  };

  /* 参数 schema 的快速构造（少写点字，统一风格） */
  MF.P = function (k, label, def, opts) {
    var o = { k: k, label: label, def: def };
    if (opts) for (var i in opts) if (opts.hasOwnProperty(i)) o[i] = opts[i];
    return o;
  };
  MF.sel = function (def, options) { return { type: 'select', def: def, options: options }; };
  MF.rng = function (def, min, max, step) { return { type: 'range', def: def, min: min, max: max, step: step }; };
  MF.txt = function (def, area) { return { type: area ? 'textarea' : 'text', def: def }; };
  MF.col = function (def) { return { type: 'color', def: def }; };
})();
