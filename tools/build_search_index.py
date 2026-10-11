#!/usr/bin/env python3
"""Build public-page and CSV search index. Standard library only.
Run after editing HTML/CSV: python tools/build_search_index.py --root .
Search source paths and game metadata are declared in site_config.json.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import argparse,csv,json,re
class TextParser(HTMLParser):
 def __init__(self):
  super().__init__();self.skip=0;self.title_mode=False;self.title=[];self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag in {'script','style','nav','header','footer','noscript','svg'}:self.skip+=1
  if tag=='title':self.title_mode=True
 def handle_endtag(self,tag):
  if tag in {'script','style','nav','header','footer','noscript','svg'}:self.skip=max(0,self.skip-1)
  if tag=='title':self.title_mode=False
 def handle_data(self,data):
  if self.title_mode:self.title.append(data)
  if not self.skip:self.parts.append(data)
def clean(s):return re.sub(r'\s+',' ',s).strip()
def build(root,max_chars):
 config=json.loads((root/'site_config.json').read_text());entries=[];games=config['games'];lookup={}
 for g in games:
  lookup[g['home']]=[g['id']]
  for section in g['sections']:
   for link in section['links']:
    name=urlsplit(link['url']).path
    lookup.setdefault(name,[])
    if g['id'] not in lookup[name]:lookup[name].append(g['id'])
 for f in sorted(root.rglob('*.html')):
  rel=f.relative_to(root).as_posix()
  if any(x in f.parts for x in ['.git','node_modules','tools']):continue
  if f.name=='404.html' or '_admin' in f.stem or f.name.startswith('google'):continue
  parser=TextParser();parser.feed(f.read_text(encoding='utf-8-sig'))
  if not parser.title:continue
  matched=lookup.get(rel,[])
  if not matched:
   matched=[g['id'] for g in games if f.name.startswith(g['id']+'_')]
  if re.match(r'dq_character_[2-5]\.html',f.name):matched=['dq2']
  if f.name=='dq_character_1.html':matched=['dq1']
  title=clean(' '.join(parser.title)).split('|')[0].strip()
  entries.append({'url':rel,'title':title,'text':clean(' '.join(parser.parts))[:max_chars],'games':matched,'kind':'ページ'})
 for source in config.get('search_sources',[]):
  path=root/source['csv']
  if not path.exists():raise FileNotFoundError(path)
  with path.open(encoding='utf-8-sig',newline='') as f:
   for row in csv.DictReader(f):
    row={k:(v or '') for k,v in row.items() if k is not None}
    values=[clean(v) for v in row.values() if v.strip()]
    if not values:continue
    label=next((clean(row[k]) for k in ['名前','名称','アイテム名','場所','ボス名','キャラクター'] if row.get(k)),values[0])
    entries.append({'url':source['url'],'title':label,'text':clean(' / '.join(f'{k}：{v}' for k,v in row.items() if v)),'games':[source['game']],'kind':source['label']})
 return entries
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--root',default='.');ap.add_argument('--out',default='search_index.json');ap.add_argument('--max-chars',type=int,default=100000)
 args=ap.parse_args();root=Path(args.root).resolve();entries=build(root,args.max_chars)
 (root/args.out).write_text(json.dumps(entries,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 print(f'Indexed {len(entries)} page/data entries')
