#!/usr/bin/env python3
"""合并全部 JS 为单一 bundle.js（保持加载顺序）。
优先按 index.html 中 <script defer src> 顺序；若 index.html 已只引用 bundle，
则使用下方 MANIFEST 固定清单。用法：python3 tools/build-bundle.py
"""
import re, pathlib, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')
srcs = [s.split('?')[0] for s in re.findall(r'<script defer src="([^"]+)"></script>', html)]
srcs = [s for s in srcs if s != 'assets/js/bundle.js']

MANIFEST = (
    ['assets/js/runtime-src.js', 'assets/js/engine.js']
    + ['assets/js/effects-%02d.js' % i for i in range(1, 5)]
    + ['assets/js/forge.js']
    + ['assets/js/effects-%02d.js' % i for i in range(5, 26)]
    + ['assets/js/vendor/gifenc.js', 'assets/js/gif-export.js', 'assets/js/styles-kit.js', 'assets/js/studio.js']
)

if not srcs:
    srcs = MANIFEST
assert srcs, '未找到任何脚本'

parts = ['/* 嘉Jaykou动效库 · 合并包 v%s · 由 tools/build-bundle.py 生成 */' % time.strftime('%Y%m%d%H%M')]
for s in srcs:
    p = ROOT / s
    code = p.read_text(encoding='utf-8')
    parts.append('/* ════════ %s ════════ */\n' % s + code.rstrip() + '\n')
out = ROOT / 'assets/js/bundle.js'
out.write_text('\n'.join(parts), encoding='utf-8')
print('合并 %d 个文件 → %s（%d 字符）' % (len(srcs), out.relative_to(ROOT), len('\n'.join(parts))))

# 品牌别名入口：生成一份与 index.html 完全同步的副本，文件名即品牌名。
# index.html 是 GitHub Pages 的根入口（不可改名），这个副本给本地双击 / 归档用。
alias = ROOT / '嘉Jaykou动效库.html'
alias.write_text(
    '<!-- 由 tools/build-bundle.py 自动生成，内容与 index.html 逐字节相同。\n'
    '     请勿直接编辑本文件 —— 改动会写进 index.html 里，然后重跑 build-bundle.py。 -->\n'
    + html,
    encoding='utf-8',
)
print('别名入口 → %s' % alias.name)
