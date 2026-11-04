import json
d=json.load(open('dossiers.json'))
s=open('alibi-rooster.html').read()
assert s.count('__DATA__')==1
js=json.dumps(d,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
open('out/alibi-rooster.html','w').write(s.replace('__DATA__',js))
print("ok",len(js))
