"""Propagatie-solver voor het Alibi-rooster (domeinen per cel + vertakking).
Gebruikt door core.Zaak.solve. Onvolledige propagatie, maar elk blad wordt
volledig gecontroleerd met z.true_atom, dus het aantal oplossingen is exact.
"""
VICT = 0


def measure(z, atoms):
    """Som van domeingroottes na propagatie (kleiner = meer bepaald); None bij tegenspraak."""
    return solve(z, atoms, cap=2, max_nodes=0, only_measure=True)


def solve(z, atoms, cap=2, max_nodes=2_000_000, only_measure=False):
    P, T, R, M = z.P, z.T, z.R, z.M
    nt = [M + 1 if p == VICT else T for p in range(P)]
    full = (1 << R) - 1
    adjmask = [0] * R
    for r in range(R):
        for s in z.adj[r]:
            adjmask[r] |= 1 << s
    dom = [[full] * nt[p] for p in range(P)]
    by_t = [[p for p in range(P) if t < nt[p]] for t in range(T)]

    def bits(m):
        while m:
            b = m & -m; yield b.bit_length() - 1; m ^= b

    def single(m):
        return m and (m & (m - 1)) == 0

    def img(m):
        out = 0
        for r in bits(m): out |= adjmask[r]
        return out

    # statische atomen (eenmalig toepassen)
    for a in atoms:
        k = a[0]
        if k == 'in': dom[a[1]][a[2]] &= 1 << a[3]
        elif k == 'notin': dom[a[1]][a[2]] &= ~(1 << a[3])
        elif k == 'never':
            for t in range(nt[a[1]]): dom[a[1]][t] &= ~(1 << a[2])
        elif k == 'empty':
            for p in by_t[a[2]]: dom[p][a[2]] &= ~(1 << a[1])
    dyn = [a for a in atoms if a[0] not in ('in', 'notin', 'never', 'empty')]

    def propagate(dom):
        changed = True
        while changed:
            changed = False
            # beweging
            for p in range(P):
                for t in range(1, nt[p]):
                    n = dom[p][t] & img(dom[p][t - 1])
                    if n != dom[p][t]: dom[p][t] = n; changed = True
                    n = dom[p][t - 1] & img(dom[p][t])
                    if n != dom[p][t - 1]: dom[p][t - 1] = n; changed = True
            for a in dyn:
                k = a[0]
                if k == 'with':
                    _, x, y, t = a
                    n = dom[x][t] & dom[y][t]
                    if n != dom[x][t] or n != dom[y][t]:
                        dom[x][t] = dom[y][t] = n; changed = True
                elif k == 'notwith':
                    _, x, y, t = a
                    if single(dom[x][t]) and dom[y][t] & dom[x][t]:
                        dom[y][t] &= ~dom[x][t]; changed = True
                    if single(dom[y][t]) and dom[x][t] & dom[y][t]:
                        dom[x][t] &= ~dom[y][t]; changed = True
                elif k == 'never_with':
                    _, x, y = a
                    for t in range(min(nt[x], nt[y])):
                        if single(dom[x][t]) and dom[y][t] & dom[x][t]:
                            dom[y][t] &= ~dom[x][t]; changed = True
                        if single(dom[y][t]) and dom[x][t] & dom[y][t]:
                            dom[x][t] &= ~dom[y][t]; changed = True
                elif k == 'alone':
                    _, p, t = a
                    if single(dom[p][t]):
                        for q in by_t[t]:
                            if q != p and dom[q][t] & dom[p][t]:
                                dom[q][t] &= ~dom[p][t]; changed = True
                    else:
                        for q in by_t[t]:
                            if q != p and single(dom[q][t]) and dom[p][t] & dom[q][t]:
                                dom[p][t] &= ~dom[q][t]; changed = True
                elif k == 'count':
                    _, p, t, n = a
                    for r in bits(dom[p][t]):
                        m = 1 << r
                        poss = sum(1 for q in by_t[t] if dom[q][t] & m)
                        if poss < n:
                            dom[p][t] &= ~m; changed = True
                    if single(dom[p][t]):
                        m = dom[p][t]
                        sing = [q for q in by_t[t] if dom[q][t] == m]
                        if len(sing) > n: return False
                        if len(sing) == n:
                            for q in by_t[t]:
                                if dom[q][t] != m and dom[q][t] & m:
                                    dom[q][t] &= ~m; changed = True
                        poss = [q for q in by_t[t] if dom[q][t] & m]
                        if len(poss) == n:
                            for q in poss:
                                if dom[q][t] != m: dom[q][t] = m; changed = True
                elif k == 'stay':
                    _, p, t1, t2 = a
                    m = full
                    for t in range(t1, t2 + 1): m &= dom[p][t]
                    for t in range(t1, t2 + 1):
                        if dom[p][t] != m: dom[p][t] = m; changed = True
                elif k == 'move':
                    _, p, t = a
                    if single(dom[p][t]) and dom[p][t + 1] & dom[p][t]:
                        dom[p][t + 1] &= ~dom[p][t]; changed = True
                    if single(dom[p][t + 1]) and dom[p][t] & dom[p][t + 1]:
                        dom[p][t] &= ~dom[p][t + 1]; changed = True
                elif k == 'visited':
                    _, p, r = a
                    m = 1 << r
                    ts = [t for t in range(nt[p]) if dom[p][t] & m]
                    if not ts: return False
                    if len(ts) == 1 and dom[p][ts[0]] != m:
                        dom[p][ts[0]] = m; changed = True
                elif k == 'step':
                    _, p, r1, r2 = a
                    m1, m2 = 1 << r1, 1 << r2
                    ts = [t for t in range(nt[p] - 1) if dom[p][t] & m1 and dom[p][t + 1] & m2]
                    if not ts: return False
                    if len(ts) == 1:
                        t = ts[0]
                        if dom[p][t] != m1 or dom[p][t + 1] != m2:
                            dom[p][t] = m1; dom[p][t + 1] = m2; changed = True
            # moordregel op M
            vm = dom[VICT][M]
            for r in bits(vm):
                m = 1 << r
                if not any(dom[q][M] & m for q in range(1, P)):
                    dom[VICT][M] &= ~m; changed = True
            if single(dom[VICT][M]):
                m = dom[VICT][M]
                sing = [q for q in range(1, P) if dom[q][M] == m]
                if len(sing) > 1: return False
                if len(sing) == 1:
                    for q in range(1, P):
                        if q != sing[0] and dom[q][M] & m:
                            dom[q][M] &= ~m; changed = True
                else:
                    poss = [q for q in range(1, P) if dom[q][M] & m]
                    if len(poss) == 1 and dom[poss[0]][M] != m:
                        dom[poss[0]][M] = m; changed = True
            for p in range(P):
                for t in range(nt[p]):
                    if dom[p][t] == 0: return False
        return True

    if only_measure:
        d0 = [row[:] for row in dom]
        if not propagate(d0): return None
        return sum(bin(d0[p][t]).count('1') for p in range(P) for t in range(nt[p]))
    sols = []
    nodes = [0]

    def rec(dom):
        if len(sols) >= cap: return
        nodes[0] += 1
        if nodes[0] > max_nodes: raise TimeoutError("max_nodes")
        if not propagate(dom): return
        best = None
        for p in range(P):
            for t in range(nt[p]):
                c = bin(dom[p][t]).count('1')
                if c > 1 and (best is None or c < best[0]):
                    best = (c, p, t)
        if best is None:
            g = [[dom[p][t].bit_length() - 1 for t in range(nt[p])] for p in range(P)]
            # volledige controle
            for p in range(P):
                for t in range(1, nt[p]):
                    if g[p][t] not in z.adj[g[p][t - 1]]: return
            if not all(z.true_atom(a, g) for a in atoms): return
            if z.killer(g) is None: return
            sols.append(g); return
        _, p, t = best
        for r in bits(dom[p][t]):
            nd = [row[:] for row in dom]
            nd[p][t] = 1 << r
            rec(nd)
            if len(sols) >= cap: return
    rec([row[:] for row in dom])
    return len(sols), sols
