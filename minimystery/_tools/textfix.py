# Kleine tekstwijzigingen in data-nl.js / data-en.js op sleutel, zonder hele bestanden te herschrijven.
#   key(file, "evT", "nieuwe tekst", nth=0)          -> vervangt de nth-e  evT:"..."
#   arr(file, "cliff", [2], "nieuwe tekst")           -> vervangt element 2 van  cliff:[...]
#   arr(file, "HIJACK", [0,1], "nieuwe tekst")        -> geneste lijst
#   add(file, "evT", 'newKey:"tekst"', nth=0)         -> voegt  ,newKey:"tekst"  toe ná de waarde van evT
import json, re

def _find_key(s, key, nth, opener):
    pat = re.compile(r'(?<![A-Za-z0-9_$])' + re.escape(key) + r'\s*:\s*' + re.escape(opener))
    ms = list(pat.finditer(s))
    if len(ms) <= nth: raise KeyError("%s (nth %d) niet gevonden" % (key, nth))
    return ms[nth]

def _str_end(s, i):  # i staat op de openende "
    j = i + 1
    while True:
        if s[j] == "\\": j += 2; continue
        if s[j] == '"': return j + 1
        j += 1

def _q(t): return json.dumps(t, ensure_ascii=False)

def key(path, k, new, nth=0):
    s = open(path).read(); m = _find_key(s, k, nth, '"'); a = m.end() - 1; b = _str_end(s, a)
    s = s[:a] + _q(new) + s[b:]; open(path, "w").write(s)

def get(path, k, nth=0):
    s = open(path).read(); m = _find_key(s, k, nth, '"'); a = m.end() - 1; b = _str_end(s, a)
    return json.loads(s[a:b])

def add(path, after_key, snippet, nth=0):
    s = open(path).read(); m = _find_key(s, after_key, nth, '"'); b = _str_end(s, m.end() - 1)
    s = s[:b] + "," + snippet + s[b:]; open(path, "w").write(s)

def _elems(s, i):  # i staat op [ ; geeft lijst (start,end,type) van elementen op dit niveau
    out = []; j = i + 1
    while True:
        while s[j] in " \n\t\r,": j += 1
        if s[j] == "]": return out
        if s[j] == '"': e = _str_end(s, j); out.append((j, e, "s")); j = e
        elif s[j] == "[":
            d = 0; k = j
            while True:
                if s[k] == '"': k = _str_end(s, k); continue
                if s[k] == "[": d += 1
                elif s[k] == "]":
                    d -= 1
                    if d == 0: break
                k += 1
            out.append((j, k + 1, "a")); j = k + 1
        else:
            k = j
            while s[k] not in ",]": k += 1
            out.append((j, k, "o")); j = k

def arr(path, k, idx, new, nth=0):
    s = open(path).read(); m = _find_key(s, k, nth, "["); i = m.end() - 1
    for n, ix in enumerate(idx):
        el = _elems(s, i)[ix]
        if n == len(idx) - 1:
            assert el[2] == "s", "geen tekst op %s %s" % (k, idx)
            s = s[:el[0]] + _q(new) + s[el[1]:]; break
        i = el[0]
    open(path, "w").write(s)

def arr_get(path, k, idx, nth=0):
    s = open(path).read(); m = _find_key(s, k, nth, "["); i = m.end() - 1
    for n, ix in enumerate(idx):
        el = _elems(s, i)[ix]
        if n == len(idx) - 1: return json.loads(s[el[0]:el[1]])
        i = el[0]
