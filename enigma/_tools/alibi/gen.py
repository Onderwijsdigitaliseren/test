"""Genereert en certificeert de vijf dossiers van Het Alibi-rooster → dossiers.json"""
import json, random, sys, time
from collections import Counter
from core import Zaak, random_solution, carve, certify, VICT
from verify_z3 import count_solutions

# kamers: (sleutel, nl, en, x, y, w, h) in plattegrond-eenheden (12 breed)
KAMERS = {
 'hal':   ('hal', 'Hal', 'Hall', 4, 3, 4, 2),
 'salon': ('salon', 'Salon', 'Drawing room', 0, 0, 4, 3),
 'eet':   ('eet', 'Eetkamer', 'Dining room', 8, 0, 4, 3),
 'bib':   ('bib', 'Bibliotheek', 'Library', 0, 3, 4, 2),
 'serre': ('serre', 'Serre', 'Conservatory', 8, 3, 4, 2),
 'keuken':('keuken', 'Keuken', 'Kitchen', 8, 5, 4, 2),
 'studeer':('studeer', 'Studeerkamer', 'Study', 0, 5, 4, 2),
 'terras':('terras', 'Terras', 'Terrace', 4, 5, 4, 2),
 'muziek':('muziek', 'Muziekkamer', 'Music room', 4, 0, 4, 3),
}

DOSSIERS = [
 dict(id='toost', T=4, M=2, start='22:00', moordkamer='salon',
      kamers=['hal','salon','eet','bib'],
      adj=[('hal','salon'),('hal','eet'),('hal','bib'),('salon','bib')],
      personen=[('Victor Aldenberg','gastheer','host'),('Hendrik Aldenberg','zijn broer','his brother'),
                ('Clara Voss','de pianiste','the pianist'),('Tobias Reyn','de notaris','the notary')]),
 dict(id='serre', T=5, M=2, start='21:30', moordkamer='serre',
      kamers=['hal','salon','eet','bib','serre'],
      adj=[('hal','salon'),('hal','eet'),('hal','bib'),('hal','serre'),('salon','bib'),('eet','serre')],
      personen=[('Mathilde de Wit','gastvrouw','hostess'),('Pieter de Wit','haar echtgenoot','her husband'),
                ('Lotte Brand','haar nicht','her niece'),('Dr. Emil Kaufmann','de huisarts','the family doctor'),
                ('Jacob Steen','de tuinman','the gardener')]),
 dict(id='noodweer', T=6, M=3, start='22:00', moordkamer='bib',
      kamers=['hal','salon','eet','bib','serre','keuken'],
      adj=[('hal','salon'),('hal','eet'),('hal','bib'),('hal','serre'),('salon','bib'),('eet','serre'),('serre','keuken')],
      personen=[('Augusta Hoogveld','de weduwe','the widow'),('Ernst Hoogveld','haar stiefzoon','her stepson'),
                ('Marie Linde','de gezelschapsdame','the companion'),('Kapitein Bram Oosterling','een oude vriend','an old friend'),
                ('Sophie Hoogveld','de kleindochter','the granddaughter'),('Willem Baks','de huisknecht','the butler')]),
 dict(id='verjaardag', T=7, M=3, start='21:00', moordkamer='studeer', cap_in=3, cap_step=6, cap_empty=4,
      kamers=['hal','salon','eet','bib','serre','keuken','studeer'],
      adj=[('hal','salon'),('hal','eet'),('hal','bib'),('hal','serre'),('hal','studeer'),('salon','bib'),('eet','serre'),('serre','keuken'),('bib','studeer')],
      personen=[('Leonard Vreeswijk','de jarige','the birthday host'),('Isabel Vreeswijk','zijn dochter','his daughter'),
                ('Frederik Mol','haar verloofde','her fiancé'),('Agnes Dubois','de kunsthandelaar','the art dealer'),
                ('Oom Casper','de oom','the uncle'),('Nina Roos','de secretaresse','the secretary')]),
 dict(id='feest', T=7, M=4, start='22:00', moordkamer='terras', cap_in=4, cap_step=7, cap_empty=4,
      kamers=['hal','salon','eet','bib','serre','keuken','terras'],
      adj=[('hal','salon'),('hal','eet'),('hal','bib'),('hal','serre'),('hal','terras'),('salon','bib'),('eet','serre'),('serre','keuken'),('terras','keuken'),('terras','bib')],
      personen=[('Baron Rudolf van Essen','de baron','the baron'),('Barones Elise van Essen','de barones','the baroness'),
                ('Arthur Sleedoorn','de bankier','the banker'),('Juliette Fabre','de actrice','the actress'),
                ('Konrad Weiss','de componist','the composer'),('Mina Bakker','de kokkin','the cook'),
                ('Rector Dirk Jansen','de rector','the headmaster')]),
]


def tijd(start, t):
    h, m = map(int, start.split(':'))
    m += 15 * t; h += m // 60; m %= 60
    return f"{h:02d}:{m:02d}"


def attribute(z, atoms, rng):
    """Wijs aan elke clue een getuige toe; iedereen (behalve slachtoffer) spreekt minstens één keer."""
    out = []
    free = []  # index van clues waarvan de getuige vrij te kiezen is
    for i, a in enumerate(atoms):
        k = a[0]
        if k in ('in', 'notin', 'alone', 'count', 'stay', 'move', 'visited', 'never', 'step'):
            w = a[1]
        elif k in ('with', 'notwith', 'never_with'):
            w = a[1] if a[1] != VICT else a[2]
            if a[1] != VICT and a[2] != VICT: w = rng.choice([a[1], a[2]])
        else:
            w = None
        if w == VICT or w is None:
            free.append(i); w = None
        out.append(w)
    spoken = Counter(w for w in out if w is not None)
    silent = [p for p in range(1, z.P) if spoken[p] == 0]
    rng.shuffle(free)
    for i in free:
        if silent:
            out[i] = silent.pop()
        else:
            out[i] = rng.randrange(1, z.P)
    # nog stille getuigen: steel een 'with/notwith' clue waar die de tweede partij is
    for p in range(1, z.P):
        if Counter(out)[p] == 0:
            for i, a in enumerate(atoms):
                if a[0] in ('with', 'notwith', 'never_with') and p in (a[1], a[2]) and Counter(out)[out[i]] > 1:
                    out[i] = p; break
    return out


def build(d, seeds):
    kamers = d['kamers']; idx = {k: i for i, k in enumerate(kamers)}
    adj = {}
    for a, b in d['adj']:
        adj.setdefault(idx[a], []).append(idx[b])
    P = len(d['personen'])
    z = Zaak(P, d['T'], len(kamers), adj, d['M'])
    best = None
    for seed in seeds:
        rng = random.Random(seed)
        sol = random_solution(z, rng)
        wil = d.get('moordkamer')
        for _ in range(200):
            if wil is None or kamers[sol[VICT][d['M']]] == wil: break
            sol = random_solution(z, rng)
        cl = carve(z, sol, rng, cap_in=d.get('cap_in', 2), cap_step=d.get('cap_step', d['T'] // 2 + 1), cap_empty=d.get('cap_empty'))
        if cl is None: continue
        c = Counter(a[0] for a in cl)
        score = len(cl) - 0.5 * len(c)  # minder clues, meer soorten
        print(f"  {d['id']} seed {seed}: {len(cl)} clues, {dict(c)}", flush=True)
        if best is None or score < best[0]:
            best = (score, seed, sol, cl)
    _, seed, sol, cl = best
    certify(z, cl, sol)
    pairs = [(a, b) for a in adj for b in adj[a]]
    n, _ = count_solutions(P, d['T'], len(kamers), pairs, d['M'], cl)
    assert n == 1, n
    nodig = sum(1 for i in range(len(cl)) if count_solutions(P, d['T'], len(kamers), pairs, d['M'], cl[:i] + cl[i + 1:])[0] >= 2)
    print(f"  z3: uniek; {nodig}/{len(cl)} clues ook nodig voor uniciteit", flush=True)
    rng = random.Random(seed + 1000)
    wit = attribute(z, cl, rng)
    # volgorde: per getuige gegroepeerd, getuigen in willekeurige volgorde
    order = list(range(1, P)); rng.shuffle(order)
    clues = sorted(zip(wit, cl), key=lambda x: (order.index(x[0]), rng.random()))
    killer = z.killer(sol)
    print(f"  ✓ {d['id']} seed {seed}: {len(cl)} clues, moordenaar {d['personen'][killer][0]}, kamer {kamers[sol[VICT][d['M']]]}", flush=True)
    return dict(
        id=d['id'], T=d['T'], M=d['M'], start=d['start'],
        tijden=[tijd(d['start'], t) for t in range(d['T'])],
        kamers=[dict(zip(('k', 'nl', 'en', 'x', 'y', 'w', 'h'), KAMERS[k])) for k in kamers],
        adj=[[idx[a], idx[b]] for a, b in d['adj']],
        personen=[dict(naam=n, nl=rnl, en=ren) for n, rnl, ren in d['personen']],
        clues=[dict(w=w, a=list(a)) for w, a in clues],
        sol=[list(r) for r in sol], killer=killer, seed=seed,
    )


if __name__ == '__main__':
    n_seeds = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    alleen = sys.argv[2:]
    try: oud = {x['id']: x for x in json.load(open('dossiers.json'))}
    except Exception: oud = {}
    out = []
    for d in DOSSIERS:
        if alleen and d['id'] not in alleen:
            if d['id'] in oud: out.append(oud[d['id']])
            continue
        t = time.time()
        out.append(build(d, range(1, n_seeds + 1)))
        print(f"  ({round(time.time() - t)} s)", flush=True)
        json.dump(out, open('dossiers.json', 'w'), ensure_ascii=False, indent=1)
    print("klaar")
