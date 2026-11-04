"""Het Alibi-rooster — regelsysteem, solver A (padgebaseerd) en generator.

Rooster: rijen = personen (index 0 = slachtoffer), kolommen = tijdvakken.
Cel = kamer. Tussen twee opeenvolgende tijdvakken blijft iemand in dezelfde
kamer of gaat naar een aangrenzende kamer (plattegrond = graaf).
Moordmoment M is bekend. Het slachtoffer heeft alleen cellen voor t <= M.
Op moment M is precies één andere persoon in de kamer van het slachtoffer:
de moordenaar.

Atomen (altijd waar; getuigen liegen niet):
 ('in', p, t, r)        p was op t in r
 ('notin', p, t, r)     p was op t niet in r
 ('with', a, b, t)      a en b in dezelfde kamer op t
 ('notwith', a, b, t)   a en b in verschillende kamers op t
 ('alone', p, t)        p was op t de enige in zijn kamer
 ('count', p, t, n)     precies n personen in de kamer van p op t (incl. p)
 ('stay', p, t1, t2)    p bleef van t1 t/m t2 in dezelfde kamer
 ('move', p, t)         p ging tussen t en t+1 naar een andere kamer
 ('never_with', a, b)   a en b waren nooit samen in een kamer
 ('visited', p, r)      p was ooit in r
 ('never', p, r)        p was nooit in r
 ('empty', r, t)        niemand in r op t
 ('step', p, r1, r2)    p ging op enig moment direct van r1 naar r2
Het slachtoffer telt alleen mee voor t <= M.
"""
import random
from itertools import product

VICT = 0


class Zaak:
    def __init__(self, P, T, R, adj, M):
        self.P, self.T, self.R, self.M = P, T, R, M
        self.adj = {r: set(adj.get(r, ())) | {r} for r in range(R)}
        for a in adj:
            for b in adj[a]:
                self.adj[b].add(a)

    def slots(self, p):
        return range(self.T) if p != VICT else range(self.M + 1)

    def present(self, p, t):
        return p != VICT or t <= self.M

    # ---------- paden per persoon ----------
    def paths(self, p):
        n = self.M + 1 if p == VICT else self.T
        out = []

        def rec(pad):
            if len(pad) == n:
                out.append(tuple(pad)); return
            for r in sorted(self.adj[pad[-1]]):
                pad.append(r); rec(pad); pad.pop()
        for r in range(self.R):
            rec([r])
        return out

    # ---------- atoomevaluatie op volledig rooster ----------
    def true_atom(self, atom, sol):
        k = atom[0]
        g = sol
        if k == 'in':
            _, p, t, r = atom; return g[p][t] == r
        if k == 'notin':
            _, p, t, r = atom; return g[p][t] != r
        if k == 'with':
            _, a, b, t = atom; return self.present(a, t) and self.present(b, t) and g[a][t] == g[b][t]
        if k == 'notwith':
            _, a, b, t = atom; return self.present(a, t) and self.present(b, t) and g[a][t] != g[b][t]
        if k == 'alone':
            _, p, t = atom; return self.occ(g, g[p][t], t) == 1
        if k == 'count':
            _, p, t, n = atom; return self.occ(g, g[p][t], t) == n
        if k == 'stay':
            _, p, t1, t2 = atom; return all(g[p][t] == g[p][t1] for t in range(t1, t2 + 1))
        if k == 'move':
            _, p, t = atom; return g[p][t] != g[p][t + 1]
        if k == 'never_with':
            _, a, b = atom
            return all(g[a][t] != g[b][t] for t in range(self.T) if self.present(a, t) and self.present(b, t))
        if k == 'visited':
            _, p, r = atom; return r in g[p]
        if k == 'never':
            _, p, r = atom; return r not in g[p]
        if k == 'empty':
            _, r, t = atom; return self.occ_room(g, r, t) == 0
        if k == 'step':
            _, p, r1, r2 = atom
            return any(g[p][t] == r1 and g[p][t + 1] == r2 for t in range(len(g[p]) - 1))
        raise ValueError(k)

    def occ(self, g, r, t):
        return self.occ_room(g, r, t)

    def occ_room(self, g, r, t):
        return sum(1 for q in range(self.P) if self.present(q, t) and g[q][t] == r)

    def killer(self, g):
        r = g[VICT][self.M]
        ks = [q for q in range(1, self.P) if g[q][self.M] == r]
        return ks[0] if len(ks) == 1 else None

    # ---------- solver A ----------
    def solve(self, atoms, cap=2, max_nodes=5_000_000):
        import csp
        return csp.solve(self, atoms, cap=cap, max_nodes=max_nodes)

    def uniek(self, atoms, max_nodes=150_000):
        """True alleen als bewezen uniek; 'onbeslist' telt nooit als uniek."""
        try:
            n, _ = self.solve(atoms, cap=2, max_nodes=max_nodes)
            return n == 1
        except TimeoutError:
            return False

    def solve_paths(self, atoms, cap=2):
        """Telt oplossingen (max cap). Padgebaseerd: eerst unaire atomen per
        persoon, dan DFS over personen met binaire/globale controles."""
        unary = {p: [] for p in range(self.P)}
        binary = []
        for a in atoms:
            k = a[0]
            if k in ('in', 'notin', 'stay', 'move', 'visited', 'never', 'step'):
                unary[a[1]].append(a)
            else:
                binary.append(a)
        cand = {}
        for p in range(self.P):
            cand[p] = [pad for pad in self.paths(p) if all(self._unary(a, pad) for a in unary[p])]
            if not cand[p]:
                return 0, []
        order = sorted(range(self.P), key=lambda p: len(cand[p]))
        sols = []
        g = [None] * self.P

        def ok_partial(assigned):
            for a in binary:
                k = a[0]
                if k == 'with':
                    _, x, y, t = a
                    if g[x] is not None and g[y] is not None:
                        if not (self.present(x, t) and self.present(y, t) and g[x][t] == g[y][t]): return False
                elif k == 'notwith':
                    _, x, y, t = a
                    if g[x] is not None and g[y] is not None:
                        if not (self.present(x, t) and self.present(y, t) and g[x][t] != g[y][t]): return False
                elif k == 'never_with':
                    _, x, y = a
                    if g[x] is not None and g[y] is not None:
                        for t in range(self.T):
                            if self.present(x, t) and self.present(y, t) and g[x][t] == g[y][t]: return False
                elif k == 'alone':
                    _, p, t = a
                    if g[p] is not None:
                        for q in range(self.P):
                            if q != p and g[q] is not None and self.present(q, t) and g[q][t] == g[p][t]: return False
                elif k == 'count':
                    _, p, t, n = a
                    if g[p] is not None:
                        c = sum(1 for q in range(self.P) if g[q] is not None and self.present(q, t) and g[q][t] == g[p][t])
                        if c > n: return False
                        if len(assigned) == self.P and c != n: return False
                elif k == 'empty':
                    _, r, t = a
                    for q in range(self.P):
                        if g[q] is not None and self.present(q, t) and g[q][t] == r: return False
            # moordenaar: precies één ander bij slachtoffer op M
            if g[VICT] is not None:
                r = g[VICT][self.M]
                c = sum(1 for q in range(1, self.P) if g[q] is not None and g[q][self.M] == r)
                if c > 1: return False
                if len(assigned) == self.P and c != 1: return False
            return True

        def dfs(i, assigned):
            if len(sols) >= cap: return
            if i == self.P:
                sols.append([list(x) for x in g]); return
            p = order[i]
            for pad in cand[p]:
                g[p] = pad
                assigned.append(p)
                if ok_partial(assigned):
                    dfs(i + 1, assigned)
                assigned.pop()
                g[p] = None
                if len(sols) >= cap: return
        dfs(0, [])
        return len(sols), sols

    def _unary(self, a, pad):
        k = a[0]
        if k == 'in': return pad[a[2]] == a[3]
        if k == 'notin': return pad[a[2]] != a[3]
        if k == 'stay': return all(pad[t] == pad[a[2]] for t in range(a[2], a[3] + 1))
        if k == 'move': return pad[a[2]] != pad[a[2] + 1]
        if k == 'visited': return a[2] in pad
        if k == 'never': return a[2] not in pad
        if k == 'step': return any(pad[t] == a[2] and pad[t + 1] == a[3] for t in range(len(pad) - 1))
        raise ValueError(k)

    # ---------- kandidaat-atomen uit een oplossing ----------
    def candidates(self, sol):
        g = sol
        out = []
        P, T, R, M = self.P, self.T, self.R, self.M
        for p in range(P):
            for t in self.slots(p):
                out.append(('in', p, t, g[p][t]))
                for r in range(R):
                    if r != g[p][t]: out.append(('notin', p, t, r))
                if self.occ_room(g, g[p][t], t) == 1: out.append(('alone', p, t))
                else: out.append(('count', p, t, self.occ_room(g, g[p][t], t)))
                if t + 1 in self.slots(p) and g[p][t] != g[p][t + 1]: out.append(('move', p, t))
            for t1 in self.slots(p):
                for t2 in self.slots(p):
                    if t2 >= t1 + 1 and all(g[p][t] == g[p][t1] for t in range(t1, t2 + 1)):
                        if (t1 == 0 or g[p][t1 - 1] != g[p][t1]) and (t2 == len(g[p]) - 1 or g[p][t2 + 1] != g[p][t2]):
                            out.append(('stay', p, t1, t2))
            for r in range(R):
                out.append(('visited', p, r) if r in g[p] else ('never', p, r))
            seen = set()
            for t in range(len(g[p]) - 1):
                if g[p][t] != g[p][t + 1] and (g[p][t], g[p][t + 1]) not in seen:
                    seen.add((g[p][t], g[p][t + 1])); out.append(('step', p, g[p][t], g[p][t + 1]))
        for a in range(P):
            for b in range(a + 1, P):
                nw = True
                for t in range(T):
                    if self.present(a, t) and self.present(b, t):
                        if g[a][t] == g[b][t]:
                            nw = False
                            if not (a == VICT and t == M): out.append(('with', a, b, t))
                        else: out.append(('notwith', a, b, t))
                if nw: out.append(('never_with', a, b))
        for r in range(R):
            for t in range(T):
                if self.occ_room(g, r, t) == 0: out.append(('empty', r, t))
        for a in out:
            assert self.true_atom(a, g), a
        return out


def random_solution(z, rng):
    """Willekeurige wandelingen; precies één ander bij slachtoffer op M."""
    for _ in range(500):
        g = []
        for p in range(z.P):
            n = z.M + 1 if p == VICT else z.T
            r = rng.randrange(z.R); pad = [r]
            for t in range(1, n):
                r = rng.choice(sorted(z.adj[r])); pad.append(r)
            g.append(pad)
        if z.killer(g) is not None:
            return g
    return None


PRIO = {'with': 0, 'notwith': 1, 'never_with': 0, 'alone': 0, 'count': 0, 'step': 2, 'stay': 2,
        'move': 2, 'empty': 2, 'visited': 3, 'never': 3, 'notin': 3, 'in': 2}


def strength(a):
    k = a[0]
    if k == 'in': return 10
    if k == 'stay': return 3 + 2 * (a[3] - a[2])
    if k == 'step': return 6
    if k == 'with': return 5
    if k == 'never_with': return 5
    if k == 'empty': return 4
    if k == 'count': return 4
    if k == 'alone': return 4
    if k == 'move': return 3
    if k == 'visited': return 3
    if k == 'never': return 3
    if k == 'notwith': return 2
    if k == 'notin': return 1
    return 0


def carve(z, sol, rng, cap_in=1, cap_step=None, cap_empty=None):
    """Kies een minimale clue-set: eerst toevoegen tot uniek, dan terugsnoeien."""
    import csp
    from collections import Counter
    ncel = sum(1 for p in range(z.P) for t in z.slots(p))
    cands = z.candidates(sol)
    rng.shuffle(cands)
    caps = {'in': cap_in, 'step': cap_step, 'empty': cap_empty, 'notin': 2, 'never': 2, 'visited': 2, 'move': 3}
    chosen = []
    cur = csp.measure(z, chosen)
    while True:
        tel = Counter(a[0] for a in chosen)
        pool = [a for a in cands if a not in chosen and (caps.get(a[0]) is None or tel[a[0]] < caps[a[0]])]
        if not pool:
            pool = [a for a in cands if a not in chosen]
        if not pool:
            return None
        sample = rng.sample(pool, min(60, len(pool)))
        best = None
        for a in sample:
            m = csp.measure(z, chosen + [a])
            if m is None: continue
            # kleine voorkeur voor relationele/vertelbare types
            score = m - 0.15 * (6 - PRIO[a[0]]) * (cur - m if cur else 0) / max(1, cur) * 10 + rng.random() * 0.5
            if best is None or score < best[0]: best = (score, a, m)
        chosen.append(best[1]); cur = best[2]
        if cur == ncel:
            break
    # terugsnoeien: zwakste eerst proberen te verwijderen
    i = 0
    rng.shuffle(chosen)
    chosen.sort(key=strength)
    while i < len(chosen):
        proef = chosen[:i] + chosen[i + 1:]
        if csp.measure(z, proef) == ncel:
            chosen = proef
        else:
            i += 1
    return chosen


def certify(z, atoms, sol):
    n, sols = z.solve(atoms, cap=2)
    assert n == 1, n
    assert sols[0] == [list(x) for x in sol]
    import csp
    ncel = sum(1 for p in range(z.P) for t in z.slots(p))
    assert csp.measure(z, atoms) == ncel, "niet volledig afleidbaar door propagatie"
    for i in range(len(atoms)):
        assert csp.measure(z, atoms[:i] + atoms[i + 1:]) != ncel, ("overbodig voor afleiding", atoms[i])
    return True
