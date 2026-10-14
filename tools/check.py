#!/usr/bin/env python3
"""Проверка доски перед отправкой: файлы читаются, поля на месте, id не повторяются."""
import json, os, sys
ROOT = os.path.join(os.path.dirname(__file__), '..', 'content')
NEED = {"hero": ["title", "stats"], "flow": ["nodes"], "cards": ["items"], "roadmap": ["items"],
        "split": ["parts"], "funnel": ["steps", "scenarios"], "bars": ["items"], "pricing": ["plans"],
        "tables": ["tables"], "modules": ["groups"], "metrics": ["items"], "risks": ["items"],
        "checklist": ["items"], "log": ["items"], "markdown": []}
errors = []
def load(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return json.load(f) if p.endswith('.json') else f.read()
try:
    site = load('site.json')
except Exception as e:
    sys.exit(f"site.json не читается: {e}")
ids = set()
for b in site.get('blocks', []):
    bid, t = b.get('id'), b.get('type')
    if not bid: errors.append(f"блок без id: {b}"); continue
    if bid in ids: errors.append(f"id повторяется: {bid}")
    ids.add(bid)
    if t not in NEED: errors.append(f"{bid}: неизвестный тип {t}"); continue
    if not b.get('src'): continue
    try: d = load(b['src'])
    except Exception as e: errors.append(f"{bid}: {b['src']} — {e}"); continue
    for k in NEED[t]:
        if isinstance(d, dict) and k not in d: errors.append(f"{bid}: нет поля «{k}» в {b['src']}")
    if t == 'funnel':
        for sc in d.get('scenarios', []):
            if len(sc.get('values', [])) != len(d.get('steps', [])):
                errors.append(f"{bid}: в сценарии «{sc.get('name')}» чисел {len(sc.get('values', []))}, а шагов {len(d.get('steps', []))}")
    if t == 'risks':
        for r in d.get('items', []):
            if r.get('level') not in (1, 2, 3): errors.append(f"{bid}: у риска «{r.get('risk')}» level должен быть 1, 2 или 3")
    if t == 'roadmap':
        for s in d.get('items', []):
            for k in ['n', 'title', 'status']:
                if k not in s: errors.append(f"{bid}: у этапа {s.get('n', '?')} нет поля {k}")
    if t == 'modules':
        seen = set()
        for g in d.get('groups', []):
            for r in g.get('rows', []):
                for k in ['id', 'name', 'what', 'price', 'stage', 'priority']:
                    if not r.get(k): errors.append(f"модуль {r.get('id','?')}: пустое поле {k}")
                if r.get('id') in seen: errors.append(f"модуль повторяется: {r.get('id')}")
                seen.add(r.get('id'))
print("\n".join(errors) if errors else f"Всё в порядке: {len(ids)} разделов.")
sys.exit(1 if errors else 0)
