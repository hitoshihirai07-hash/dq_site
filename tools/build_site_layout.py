#!/usr/bin/env python3
"""Rebuild the shared navigation using site_config.json. Keeps all existing URLs."""
from pathlib import Path
import re,json,html
ROOT=Path(__file__).resolve().parent.parent
config=json.loads((ROOT/'site_config.json').read_text())
E=html.escape
def game_for(name):
 for g in config['games']:
  if name==g['home'] or name.startswith(g['id']+'_'):return g
 if name=='dq_character_1.html':return config['games'][0]
 if re.match(r'dq_character_[2-5]\.html',name):return config['games'][1]
 return None
for path in ROOT.glob('*.html'):
 s=path.read_text()
 if '<body' not in s:continue
 # Idempotent: remove only generated blocks.
 s=re.sub(r'<!-- SITE:HEAD -->.*?<!-- /SITE:HEAD -->','',s,flags=re.S)
 s=re.sub(r'<!-- SITE:HEADER -->.*?<!-- /SITE:HEADER -->','',s,flags=re.S)
 s=re.sub(r'<!-- SITE:FOOTER -->.*?<!-- /SITE:FOOTER -->','',s,flags=re.S)
 s=s.replace('<div class="site-content" id="site-content">','').replace('<!-- SITE:CONTENT-END --></div>','')
 s=re.sub(r'<nav\b[^>]*class="related-links".*?</nav>','',s,flags=re.S)
 if not re.search(r'name=[\"\']viewport',s):s=s.replace('</head>','<meta name="viewport" content="width=device-width,initial-scale=1"></head>')
 s=s.replace('</head>','<!-- SITE:HEAD --><link rel="stylesheet" href="site.css"><script src="site.js" defer></script><!-- /SITE:HEAD --></head>')
 game=game_for(path.name)
 nav='<a href="index.html"'+(' aria-current="page"' if path.name=='index.html' else '')+'>総合トップ</a>'
 for g in config['games']:
  nav+=f'<a href="{g["home"]}"'+(' aria-current="page"' if game==g else '')+f'>{g["name"]}</a>'
 nav+='<a href="index.html#site-search-input">検索</a>'
 crumb=''
 if path.name!='index.html':
  title=re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S) or re.search(r'<title>(.*?)</title>',s,re.S)
  title=re.sub('<[^>]+>','',title.group(1)).split('|')[0].strip() if title else path.stem
  crumb='<nav class="breadcrumbs" aria-label="現在地"><a href="index.html">総合トップ</a><span aria-hidden="true">›</span>'
  if game and path.name!=game['home']:crumb+=f'<a href="{game["home"]}">{game["name"]}</a><span aria-hidden="true">›</span>'
  crumb+=f'<span aria-current="page">{E(title)}</span></nav>'
 header=f'<!-- SITE:HEADER --><a class="skip-link" href="#site-content">本文へ移動</a><header class="site-header"><div class="site-header-inner"><a class="site-brand" href="index.html"><span class="brand-mark" aria-hidden="true">DQ</span>攻略メモ＆データベース</a><nav class="site-nav" aria-label="メインメニュー">{nav}</nav></div></header>{crumb}<!-- /SITE:HEADER --><div class="site-content" id="site-content">'
 s=re.sub(r'(<body[^>]*>)',lambda m:m.group(1)+header,s,count=1)
 footer='<!-- SITE:CONTENT-END --></div><!-- SITE:FOOTER --><footer class="site-footer"><nav aria-label="サイト情報"><a href="howto.html">使い方</a><a href="policy.html">プレイ方針</a><a href="memo.html">メモ・小ネタ</a><a href="about.html">このサイトについて</a><a href="history.html">更新履歴</a><a href="sitemap.html">サイトマップ</a><a href="privacy.html">プライバシーポリシー</a></nav><p>非公式ファンサイト。画像・文言などの権利は各権利者に帰属します。</p></footer><!-- /SITE:FOOTER -->'
 s=s.replace('</body>',footer+'</body>')
 path.write_text(s)
