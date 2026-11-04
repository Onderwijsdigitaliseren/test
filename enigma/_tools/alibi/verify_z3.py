"""Onafhankelijke verificatie met z3: het rooster als SMT-model, oplossingen
tellen door blokkeren. Deelt niets met core.py behalve de atoomnotatie."""
from z3 import Int, Solver, And, Or, Not, Sum, If, sat


def count_solutions(P, T, R, adj_pairs, M, atoms, cap=2):
    adj = {r: {r} for r in range(R)}
    for a, b in adj_pairs:
        adj[a].add(b); adj[b].add(a)
    n_t = [M + 1 if p == 0 else T for p in range(P)]
    X = [[Int(f"x_{p}_{t}") for t in range(n_t[p])] for p in range(P)]
    s = Solver()
    for p in range(P):
        for t in range(n_t[p]):
            s.add(X[p][t] >= 0, X[p][t] < R)
            if t > 0:
                s.add(Or([And(X[p][t - 1] == a, X[p][t] == b) for a in range(R) for b in adj[a]]))

    def occ(r, t):
        return Sum([If(X[q][t] == r, 1, 0) for q in range(P) if t < n_t[q]])

    def occ_of(p, t):
        return Sum([If(X[q][t] == X[p][t], 1, 0) for q in range(P) if t < n_t[q]])

    for a in atoms:
        k = a[0]
        if k == 'in': s.add(X[a[1]][a[2]] == a[3])
        elif k == 'notin': s.add(X[a[1]][a[2]] != a[3])
        elif k == 'with': s.add(X[a[1]][a[3]] == X[a[2]][a[3]])
        elif k == 'notwith': s.add(X[a[1]][a[3]] != X[a[2]][a[3]])
        elif k == 'alone': s.add(occ_of(a[1], a[2]) == 1)
        elif k == 'count': s.add(occ_of(a[1], a[2]) == a[3])
        elif k == 'stay':
            for t in range(a[2] + 1, a[3] + 1): s.add(X[a[1]][t] == X[a[1]][a[2]])
        elif k == 'move': s.add(X[a[1]][a[2]] != X[a[1]][a[2] + 1])
        elif k == 'never_with':
            for t in range(min(n_t[a[1]], n_t[a[2]])): s.add(X[a[1]][t] != X[a[2]][t])
        elif k == 'visited': s.add(Or([X[a[1]][t] == a[2] for t in range(n_t[a[1]])]))
        elif k == 'never':
            for t in range(n_t[a[1]]): s.add(X[a[1]][t] != a[2])
        elif k == 'empty': s.add(occ(a[1], a[2]) == 0)
        elif k == 'step':
            s.add(Or([And(X[a[1]][t] == a[2], X[a[1]][t + 1] == a[3]) for t in range(n_t[a[1]] - 1)]))
        else: raise ValueError(k)
    # moordregel
    s.add(Sum([If(X[q][M] == X[0][M], 1, 0) for q in range(1, P)]) == 1)
    n = 0
    sols = []
    while n < cap and s.check() == sat:
        m = s.model()
        g = [[m.eval(X[p][t]).as_long() for t in range(n_t[p])] for p in range(P)]
        sols.append(g); n += 1
        s.add(Or([X[p][t] != g[p][t] for p in range(P) for t in range(n_t[p])]))
    return n, sols
