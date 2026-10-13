/* ==========================================================================
   Jaykou — GIF 导出（依赖 vendored gifenc：window.GIFEnc）
   流程：离屏 canvas 逐帧渲染 → 每帧量化 256 色 → LZW 编码 → Blob
   ========================================================================== */
(function () {
  'use strict';
  var MF = window.MF;

  /* opts = { id, params, settings, duration, width, fps, onProgress } */
  MF.exportGIF = function (opts) {
    return new Promise(function (resolve, reject) {
      var G = window.GIFEnc;
      if (!G || !G.GIFEncoder) return reject(new Error('GIF 编码器未加载'));
      var eff = MF.byId[opts.id];
      if (!eff) return reject(new Error('未知动效：' + opts.id));
      var R = MF.ratios[opts.settings.ratio] || MF.ratios['16:9'];
      var W = Math.max(120, Math.round(opts.width || 640));
      var H = Math.round(W * R.h / R.w);
      var fps = Math.min(24, Math.max(5, opts.fps || 12));
      var D = Math.max(0.5, opts.duration || eff.dur);
      var frames = Math.max(2, Math.round(D * fps));
      var delay = Math.round(1000 / fps);

      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var ctx = cv.getContext('2d', { willReadFrequently: true });
      var enc = G.GIFEncoder();
      var i = 0;
      var BATCH = 3;

      function step() {
        var end = Math.min(i + BATCH, frames);
        for (; i < end; i++) {
          var t = (i / frames) * D;
          MF.paint(ctx, eff, opts.params, t, {
            w: W, h: H, duration: D,
            accent: opts.settings.accent, accent2: opts.settings.accent2,
            ink: opts.settings.ink, bg1: opts.settings.bg1, bg2: opts.settings.bg2,
            bgMode: opts.settings.bgMode, seed: opts.settings.seed, quiet: true
          });
          var data = ctx.getImageData(0, 0, W, H).data;
          var palette = G.quantize(data, 256);
          var index = G.applyPalette(data, palette);
          enc.writeFrame(index, W, H, { palette: palette, delay: delay });
        }
        if (opts.onProgress) { try { opts.onProgress(i / frames); } catch (e) {} }
        if (i < frames) {
          setTimeout(step, 0);
        } else {
          enc.finish();
          var bytes = enc.bytes();
          resolve(new Blob([bytes], { type: 'image/gif' }));
        }
      }
      setTimeout(step, 30);
    });
  };
})();
