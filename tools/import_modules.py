#!/usr/bin/env python3
"""Переносит таблицу модулей из 65_КАРТА-МОДУЛЕЙ_ЦЕНЫ_ЭТАПЫ.md в content/blocks/modules.json.
Запуск: python3 tools/import_modules.py <путь к 65_…md>"""
import json, re, sys
src = open(sys.argv[1], encoding='utf-8').read()
groups, cur = [], None
for line in src.splitlines():
    m = re.match(r'^## ([A-Z])\. (.+)$', line)
    if m:
        cur = {"id": m.group(1), "title": m.group(2).strip(), "rows": []}; groups.append(cur); continue
    if cur and line.startswith('| ') and re.match(r'^\| [A-Z]\d+', line):
        c = [x.strip() for x in line.strip().strip('|').split('|')]
        if len(c) < 9: continue
        num, name, who, what, cost, price, stage, prio, now = c[:9]
        cur["rows"].append({"id": num, "name": name.replace('**', ''), "who": who, "what": what.replace('**', ''),
            "cost": cost, "price": price.replace('**', ''), "stage": stage, "priority": prio, "now": now})
groups = [g for g in groups if g["rows"]]
out = {"note": "Карта модулей. Строка = модуль. Поля: id, name, who, what, cost (0 | ₽ | ₽₽ + пояснение), price, stage ('0'…'4', можно '1–4'), priority (🔴|🟡|⚪), now (✅ | ❓ + пояснение).",
       "groups": groups}
json.dump(out, open('content/blocks/modules.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(sum(len(g['rows']) for g in groups), 'модулей в', len(groups), 'блоках')
