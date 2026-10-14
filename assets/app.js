// Доска «Суть»: собирает страницу из content/site.json.
// Содержимое здесь не правим — только в content/. Новый тип блока = новая функция в RENDER.

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = '') => `<i data-lucide="${esc(name)}" class="ic ${cls}" aria-hidden="true"></i>`;
const fmt = (n) => Number(n).toLocaleString('ru-RU');

// В текстах: **жирный**, _акцент_ (курсив Lora), `код`; смайлики заменяются на иконки и метки.
const EMOJI = {
  '❓': `<span class="q" title="предложение, решает Юрий">${icon('circle-help')}</span>`,
  '✅': `<span class="yes">${icon('circle-check')}</span>`,
  '⚠️': `<span class="warn-i">${icon('triangle-alert')}</span>`,
  '⚠': `<span class="warn-i">${icon('triangle-alert')}</span>`,
  '🔴': '<span class="pri pri-1" title="Без этого не стартуем"></span>',
  '🟡': '<span class="pri pri-2" title="Важно"></span>',
  '⚪': '<span class="pri pri-3" title="Позже"></span>',
};
const rich = (s) => {
  let t = esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(«])_(.+?)_(?=[\s.,;:!?»)]|$)/g, '$1<em>$2</em>').replace(/`(.+?)`/g, '<code>$1</code>');
  for (const [k, v] of Object.entries(EMOJI)) t = t.split(k).join(v);
  return t;
};
const PRIO = { '🔴': ['1', 'Без этого не стартуем'], '🟡': ['2', 'Важно'], '⚪': ['3', 'Позже'] };

const head = (b, d) => {
  const title = b.title || d.title;
  const lead = b.lead || d.lead;
  return title ? `<header class="sec-head"><h2>${rich(title)}</h2>${lead ? `<p class="lead">${rich(lead)}</p>` : ''}</header>` : '';
};

const ring = (v, of) => {
  const r = 26, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, v / of));
  return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" style="--c:${c.toFixed(1)};--p:${(c * (1 - p)).toFixed(1)}"/></svg>`;
};

const RENDER = {
  hero(b, d) {
    const stat = (s, i) => {
      let vis = '';
      if (s.kind === 'ring') vis = ring(s.value, s.of);
      else if (s.kind === 'dots') vis = `<div class="dots100" aria-hidden="true">${Array.from({ length: s.of }, (_, k) => `<span class="${k < s.value ? 'on' : ''}"></span>`).join('')}</div>`;
      else vis = `<div class="stat-ic">${icon(s.icon || 'circle')}</div>`;
      return `<li style="--i:${i}"><div class="stat-vis">${vis}</div><b>${rich(s.big)}</b><span>${rich(s.label)}</span></li>`;
    };
    const orbit = (n, r, cls, size) => Array.from({ length: n }, (_, k) => {
      const a = (k / n) * Math.PI * 2 + (r % 7);
      return `<circle class="${cls}" cx="${(260 + r * Math.cos(a)).toFixed(1)}" cy="${(260 + r * Math.sin(a)).toFixed(1)}" r="${size}"/>`;
    }).join('');
    const art = `<svg class="orbit" viewBox="0 0 520 520" aria-hidden="true">
      <circle class="o-ring" cx="260" cy="260" r="110"/><circle class="o-ring" cx="260" cy="260" r="190"/><circle class="o-ring faint" cx="260" cy="260" r="250"/>
      <g class="o-spin o-1">${orbit(8, 110, 'o-spec', 7)}</g>
      <g class="o-spin o-2">${orbit(28, 190, 'o-client', 4)}</g>
      <g class="o-spin o-3">${orbit(48, 250, 'o-far', 2.5)}</g>
      <circle class="o-core-halo" cx="260" cy="260" r="54"/><circle class="o-core" cx="260" cy="260" r="34"/>
      <text x="260" y="265" class="o-core-t">МЕТОД</text>
      <text x="260" y="138" class="o-lbl">специалисты</text><text x="260" y="58" class="o-lbl">их клиенты</text>
    </svg>`;
    return `<div class="hero">${art}
      <p class="eyebrow">${rich(d.eyebrow)}</p>
      <h1>${rich(d.title)}</h1>
      <p class="hero-lead">${rich(d.lead)}</p>
      <ul class="stats">${(d.stats || []).map(stat).join('')}</ul>
    </div>`;
  },

  flow(b, d) {
    const nodes = (d.nodes || []).map((n, i) => `
      ${i ? `<div class="flow-arrow" aria-hidden="true">${icon('arrow-right', 'a-h')}${icon('arrow-down', 'a-v')}</div>` : ''}
      <div class="flow-node" style="--i:${i}"><div class="flow-ic">${icon(n.icon)}</div><h3>${rich(n.title)}</h3><p>${rich(n.text)}</p></div>`).join('');
    const gets = (d.gets || []).map((g) => `<li>${icon(g.icon)}<div><b>${rich(g.who)}</b><span>${rich(g.what)}</span></div></li>`).join('');
    return head(b, d) + `<div class="flow">${nodes}</div>${gets ? `<ul class="gets">${gets}</ul>` : ''}`;
  },

  cards(b, d) {
    const items = (d.items || []).map((c, i) =>
      `<article class="card" style="--i:${i}">${c.icon ? `<div class="card-ic">${icon(c.icon)}</div>` : ''}${c.tag ? `<span class="tag">${rich(c.tag)}</span>` : ''}<h3>${rich(c.title)}</h3><p>${rich(c.text)}</p></article>`).join('');
    return head(b, d) + `<div class="cards">${items}</div>`;
  },

  roadmap(b, d) {
    const items = d.items || [];
    const nowIdx = Math.max(0, items.findIndex((s) => s.status === 'сейчас'));
    const list = (arr) => `<ul class="ticks">${(arr || []).map((x) => `<li>${icon('check')}<span>${rich(x)}</span></li>`).join('')}</ul>`;
    const track = items.map((s, i) => `
      <button type="button" class="rm-node ${i < nowIdx ? 'past' : ''} ${i === nowIdx ? 'now' : ''}" role="tab" aria-selected="${i === nowIdx}" data-i="${i}">
        <span class="rm-dot">${icon(s.icon || 'circle')}</span>
        <span class="rm-n mono">Этап ${esc(s.n)}</span>
        <span class="rm-t">${rich(s.short || s.title)}</span>
      </button>`).join('');
    const panels = items.map((s, i) => `
      <article class="rm-panel" role="tabpanel" data-i="${i}" ${i === nowIdx ? '' : 'hidden'}>
        <header class="rm-head">
          <div class="rm-big">${icon(s.icon || 'circle')}</div>
          <div><p class="mono">Этап ${esc(s.n)} · ${rich(s.status)} · ${rich(s.period)}</p><h3>${rich(s.title)}</h3><p class="rm-goal">${rich(s.goal)}</p></div>
        </header>
        ${s.segments ? `<div class="pills">${s.segments.map((x) => `<span>${icon('user-round')}${rich(x)}</span>`).join('')}</div>` : ''}
        <div class="rm-grid">
          <section><h4>${icon('hammer')}Что делаем</h4>${list(s.do)}</section>
          <section><h4>${icon('wallet')}Деньги</h4>${list(s.money)}</section>
        </div>
        ${s.exit ? `<p class="exit">${icon('flag')}<span><span class="mono">Переход дальше</span>${rich(s.exit)}</span></p>` : ''}
      </article>`).join('');
    const seq = d.sequence ? `<div class="seq"><h3>${rich(d.sequence.title)}</h3><ol>${d.sequence.items.map((x) => `<li>${icon(x.icon)}<span>${rich(x.label)}</span><span class="mono">этап ${esc(x.stage)}</span></li>`).join('')}</ol></div>` : '';
    return { html: head(b, d) + `<div class="rm"><div class="rm-track" role="tablist" aria-label="Этапы">${track}</div>${panels}</div>${seq}`, after: wireRoadmap };
  },

  split(b, d) {
    const total = d.total || d.parts.reduce((s, p) => s + p.value, 0);
    const segs = d.parts.map((p) => `<div class="seg seg-${esc(p.key)}" style="flex:${p.value}" tabindex="0" data-tip="${esc(`${p.label}: ${fmt(p.value)} ₽ (${Math.round(p.value / total * 100)} %)`)}"><span>${Math.round(p.value / total * 100)} %</span></div>`).join('');
    const legend = d.parts.map((p) => `<li><span class="sw seg-${esc(p.key)}"></span><b>${fmt(p.value)} ₽</b><span>${rich(p.label)}${p.note ? ` · ${rich(p.note)}` : ''}</span></li>`).join('');
    const also = (d.also || []).map((a) => `<li>${icon(a.icon)}<div><b>${rich(a.label)}</b><span>${rich(a.text)}</span></div></li>`).join('');
    return head(b, d) + `<div class="split"><div class="split-total"><span class="mono">Цена книги</span><b>${fmt(total)} ₽</b></div><div class="split-bar" role="img" aria-label="${esc(d.parts.map((p) => `${p.label} ${fmt(p.value)} ₽`).join(', '))}">${segs}</div><ul class="legend">${legend}</ul></div>${also ? `<ul class="gets">${also}</ul>` : ''}`;
  },

  funnel(b, d) {
    const def = Math.max(0, d.scenarios.findIndex((s) => s.default));
    const tabs = d.scenarios.map((s, i) => `<button type="button" role="tab" aria-selected="${i === def}" data-i="${i}">${rich(s.name)}</button>`).join('');
    const html = head(b, d) + `<div class="funnel"><div class="seg-tabs" role="tablist">${tabs}</div><div class="funnel-body"></div><p class="scale mono">длина полос — в сжатой шкале, чтобы были видны малые шаги</p>${d.note ? `<p class="note">${rich(d.note)}</p>` : ''}</div>`;
    const draw = (root, i) => {
      const s = d.scenarios[i], max = s.values[0];
      root.querySelector('.funnel-body').innerHTML = d.steps.map((step, k) => {
        const v = s.values[k], w = Math.max(3, Math.sqrt(v / max) * 100);
        const r = v / s.values[k - 1] * 100;
        const conv = k ? `<span class="conv mono">${r.toLocaleString('ru-RU', { maximumFractionDigits: r < 10 ? 1 : 0 })} %</span>` : '';
        return `<div class="f-row"><span class="f-label">${rich(step)}</span><div class="f-bar"><span style="width:${w}%" data-tip="${esc(`${step}: ${fmt(v)}`)}" tabindex="0"></span></div><b class="f-val">${fmt(v)}</b>${conv}</div>`;
      }).join('') + `<div class="f-money">${icon('banknote')}<span><span class="mono">Платформе</span><b>${rich(s.money)}</b></span></div>`;
      root.querySelectorAll('.seg-tabs button').forEach((btn) => btn.setAttribute('aria-selected', String(+btn.dataset.i === i)));
      paintIcons(root);
    };
    return { html, after: (root) => { draw(root, def); root.querySelector('.seg-tabs').addEventListener('click', (e) => { const btn = e.target.closest('button'); if (btn) draw(root, +btn.dataset.i); }); } };
  },

  bars(b, d) {
    const max = d.max || Math.max(...d.items.map((x) => x.value));
    const rows = d.items.map((x) => `
      <div class="b-row ${x.ours ? 'ours' : ''}">
        <span class="b-label">${x.ours ? icon('star') : ''}${rich(x.label)}</span>
        <div class="b-track"><span style="width:${x.value / max * 100}%" tabindex="0" data-tip="${esc(`${x.label}: ${x.value} ${d.unit || ''} — ${x.note || ''}`)}"></span></div>
        <b class="b-val">${x.value} ${esc(d.unit || '')}</b>
        ${x.note ? `<span class="b-note">${rich(x.note)}</span>` : ''}
      </div>`).join('');
    return head(b, d) + `<div class="bars">${rows}</div>`;
  },

  pricing(b, d) {
    const free = d.free ? `<div class="free"><h3>${icon('gift')}Бесплатно всем</h3><ul>${d.free.map((x) => `<li>${icon('check')}${rich(x)}</li>`).join('')}</ul></div>` : '';
    const plans = (d.plans || []).map((p) => `
      <article class="plan ${p.hot ? 'hot' : ''}">${p.hot ? '<span class="badge">Основной</span>' : ''}
        <div class="plan-ic">${icon(p.icon || 'circle')}</div>
        <h3>${rich(p.name)}</h3>
        <p class="price"><b>${rich(p.price)}</b><span>${rich(p.per)}</span></p>
        <ul>${p.features.map((f) => `<li>${icon('check')}${rich(f)}</li>`).join('')}</ul>
      </article>`).join('');
    return head(b, d) + `<div class="pricing">${free}<div class="plans">${plans}</div></div>${d.extra ? `<p class="note">${rich(d.extra)}</p>` : ''}`;
  },

  tables(b, d) {
    const one = (t) => {
      const cols = t.columns || [];
      const rows = (t.rows || []).map((r) => `<tr>${r.map((c, j) => `<td data-l="${esc(cols[j] || '')}">${rich(c)}</td>`).join('')}</tr>`).join('');
      return `<div class="tbl">${t.title ? `<h3>${rich(t.title)}</h3>` : ''}
        <div class="tbl-scroll"><table><thead><tr>${cols.map((c) => `<th>${rich(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        ${t.note ? `<p class="note">${rich(t.note)}</p>` : ''}</div>`;
    };
    const body = (d.tables || []).map(one).join('');
    if (b.collapsed) return `<details class="more"><summary>${icon('table-2')}<span>${rich(b.title || d.title)}</span><span class="mono">${rich(d.lead || '')}</span>${icon('chevron-down', 'chev')}</summary><div class="more-body">${body}</div></details>`;
    return head(b, d) + body;
  },

  modules(b, d) {
    const groups = d.groups || [];
    const stages = ['0', '1', '2', '3', '4'];
    const all = groups.flatMap((g) => g.rows);
    const total = all.length;
    // сводка: модули по этапам, разбитые по приоритету
    const byStage = stages.map((s) => ({ s, p: ['🔴', '🟡', '⚪'].map((p) => all.filter((r) => r.stage.trim().startsWith(s) && r.priority === p).length) }));
    const maxS = Math.max(...byStage.map((x) => x.p.reduce((a, c) => a + c, 0)));
    const summary = `<div class="msum"><div class="msum-bars">${byStage.map(({ s, p }) => {
      const sum = p.reduce((a, c) => a + c, 0);
      return `<div class="msum-col"><div class="msum-stack" style="height:${sum / maxS * 100}%">${p.map((n, k) => n ? `<span class="pri-bg-${k + 1}" style="flex:${n}" tabindex="0" data-tip="${esc(`Этап ${s}: ${n} — ${['без этого не стартуем', 'важно', 'позже'][k]}`)}"></span>` : '').join('')}</div><b>${sum}</b><span class="mono">этап ${s}</span></div>`;
    }).join('')}</div><ul class="msum-legend">${['🔴', '🟡', '⚪'].map((p) => `<li>${EMOJI[p]}${PRIO[p][1]}</li>`).join('')}</ul></div>`;
    const body = groups.map((g) => `
      <details class="mgroup" open data-g="${esc(g.id)}">
        <summary><span class="g-id mono">${esc(g.id)}</span><span class="g-t">${rich(g.title)}</span><span class="count"></span>${icon('chevron-down', 'chev')}</summary>
        <div class="mrows">${g.rows.map((r) => `
          <article class="mrow" data-stage="${esc(r.stage)}" data-prio="${esc(r.priority)}" data-text="${esc([r.id, r.name, r.who, r.what, r.price].join(' ').toLowerCase())}">
            <div class="m-id">${EMOJI[r.priority] || ''}<span class="mono">${esc(r.id)}</span></div>
            <div class="m-main"><h4>${rich(r.name)}</h4><p>${rich(r.what)}</p><p class="m-who">${icon('user-round')}${rich(r.who)}</p></div>
            <div class="m-price"><span class="mono">Цена</span>${rich(r.price)}</div>
            <dl class="m-facts">
              <div><dt>Этап</dt><dd><span class="stage-chip">${rich(r.stage)}</span></dd></div>
              <div><dt>Себест.</dt><dd>${rich(r.cost)}</dd></div>
              <div><dt>Есть</dt><dd>${rich(r.now)}</dd></div>
            </dl>
          </article>`).join('')}</div>
      </details>`).join('');
    const html = head(b, d) + summary + `
      <div class="filters" role="group" aria-label="Фильтры модулей">
        <label class="search">${icon('search')}<input type="search" placeholder="Поиск: касса, книга, лендинг…" aria-label="Поиск модулей"></label>
        <div class="chips" data-f="stage"><span class="mono">Этап</span>${stages.map((s) => `<button type="button" data-v="${s}" aria-pressed="false">${s}</button>`).join('')}</div>
        <div class="chips" data-f="prio"><span class="mono">Приоритет</span>${['🔴', '🟡', '⚪'].map((p) => `<button type="button" data-v="${p}" aria-pressed="false">${EMOJI[p]}${PRIO[p][1]}</button>`).join('')}</div>
        <p class="found mono" aria-live="polite">${total} модулей</p>
      </div>
      <div class="mlist">${body}</div>`;
    return { html, after: (root) => wireModules(root, total) };
  },

  metrics(b, d) {
    const items = (d.items || []).map((m, i) => {
      const pct = m.target ? Math.min(100, (Number(m.value) || 0) / m.target * 100) : 0;
      return `<article class="metric st-${esc(m.status || 'plan')}" style="--i:${i}">
        <div class="metric-top">${icon(m.icon || 'activity')}<span>${rich(m.label)}</span></div>
        <b>${rich(m.shown ?? m.value)}</b>
        <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct.toFixed(0)}"><span style="width:${pct}%"></span></div>
        <span class="target">${icon('target')}цель: ${rich(m.target_text ?? m.target)}</span>
        ${m.hint ? `<span class="hint">${rich(m.hint)}</span>` : ''}
      </article>`;
    }).join('');
    return head(b, d) + `<div class="metrics">${items}</div>`;
  },

  risks(b, d) {
    const lv = ['', 'низкая', 'средняя', 'высокая'];
    const items = (d.items || []).map((r) => `
      <article class="risk lv-${r.level}">
        <div class="risk-top"><div class="risk-ic">${icon(r.icon || 'triangle-alert')}</div><div class="lvl" title="Опасность: ${lv[r.level]}">${[1, 2, 3].map((k) => `<span class="${k <= r.level ? 'on' : ''}"></span>`).join('')}<span class="mono">${lv[r.level]}</span></div></div>
        <h3>${rich(r.risk)}</h3>
        <p>${icon('shield-check')}<span>${rich(r.answer)}</span></p>
      </article>`).join('');
    return head(b, d) + `<div class="risks">${items}</div>`;
  },

  checklist(b, d) {
    const items = (d.items || []).map((x) => `
      <li class="${x.done ? 'done' : ''}">${icon(x.done ? 'circle-check' : 'circle-dashed', 'box')}<div><p>${rich(x.q)}</p>${x.answer ? `<p class="answer">${rich(x.answer)}</p>` : ''}</div></li>`).join('');
    const left = (d.items || []).filter((x) => !x.done).length;
    return head(b, d) + `<p class="mono left">${left ? `ждут решения: ${left}` : 'все решены'}</p><ul class="check">${items}</ul>`;
  },

  log(b, d) {
    const items = (d.items || []).map((x) => `<li>${icon('git-commit-horizontal')}<time class="mono">${esc(x.date)}</time><p>${rich(x.text)}</p></li>`).join('');
    return head(b, d) + `<ol class="log">${items}</ol>`;
  },

  async markdown(b, d) {
    const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js');
    return head(b, {}) + `<div class="md">${marked.parse(d)}</div>`;
  },
};

function wireRoadmap(root) {
  const nodes = [...root.querySelectorAll('.rm-node')];
  const panels = [...root.querySelectorAll('.rm-panel')];
  const show = (i) => {
    nodes.forEach((n) => n.setAttribute('aria-selected', String(+n.dataset.i === i)));
    panels.forEach((p) => { p.hidden = +p.dataset.i !== i; });
  };
  root.querySelector('.rm-track').addEventListener('click', (e) => { const n = e.target.closest('.rm-node'); if (n) show(+n.dataset.i); });
  root.querySelector('.rm-track').addEventListener('keydown', (e) => {
    const cur = nodes.findIndex((n) => n.getAttribute('aria-selected') === 'true');
    const next = e.key === 'ArrowRight' ? cur + 1 : e.key === 'ArrowLeft' ? cur - 1 : -1;
    if (next >= 0 && next < nodes.length) { e.preventDefault(); show(next); nodes[next].focus(); }
  });
}

function wireModules(root, total) {
  const state = { stage: new Set(), prio: new Set(), q: '' };
  const rows = [...root.querySelectorAll('.mrow')];
  const apply = () => {
    let shown = 0;
    rows.forEach((r) => {
      const st = r.dataset.stage;
      const okStage = !state.stage.size || [...state.stage].some((s) => st.includes(s));
      const okPrio = !state.prio.size || state.prio.has(r.dataset.prio);
      const okQ = !state.q || r.dataset.text.includes(state.q);
      const on = okStage && okPrio && okQ;
      r.hidden = !on; if (on) shown++;
    });
    root.querySelectorAll('.mgroup').forEach((g) => {
      const n = g.querySelectorAll('.mrow:not([hidden])').length;
      g.hidden = n === 0; g.querySelector('.count').textContent = n;
    });
    root.querySelector('.found').textContent = shown === total ? `${total} модулей` : `${shown} из ${total}`;
  };
  root.querySelectorAll('.chips').forEach((box) => box.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    const set = state[box.dataset.f]; const v = btn.dataset.v;
    set.has(v) ? set.delete(v) : set.add(v);
    btn.classList.toggle('on', set.has(v)); btn.setAttribute('aria-pressed', set.has(v));
    apply();
  }));
  root.querySelector('.search input').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); apply(); });
  apply();
}

// подсказка над столбиками и долями
function tooltips() {
  const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
  const showTip = (el) => {
    tip.textContent = el.dataset.tip; tip.hidden = false;
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    tip.style.left = `${Math.min(innerWidth - t.width - 8, Math.max(8, r.left + r.width / 2 - t.width / 2))}px`;
    tip.style.top = `${Math.max(8, r.top - t.height - 8)}px`;
  };
  ['pointerover', 'focusin'].forEach((ev) => document.addEventListener(ev, (e) => { const el = e.target.closest?.('[data-tip]'); if (el) showTip(el); }));
  ['pointerout', 'focusout'].forEach((ev) => document.addEventListener(ev, (e) => { if (e.target.closest?.('[data-tip]')) tip.hidden = true; }));
  addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });
}

let lucideReady;
function paintIcons(root = document) {
  lucideReady ??= new Promise((ok) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lucide@0.460.0/dist/umd/lucide.min.js';
    s.onload = () => ok(window.lucide); s.onerror = () => ok(null);
    document.head.appendChild(s);
  });
  lucideReady.then((l) => { if (l) l.createIcons({ attrs: { 'stroke-width': 1.6 }, root }); });
}

async function load(src) {
  const r = await fetch(`content/${src}`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${src}: ${r.status}`);
  return src.endsWith('.json') ? r.json() : r.text();
}

async function main() {
  const app = $('#app');
  let site;
  try { site = await load('site.json'); } catch (e) {
    app.innerHTML = `<div class="err"><b>Не открылся content/site.json</b><p>${esc(e.message)}</p></div>`; return;
  }
  document.title = site.title || document.title;
  $('#updated').textContent = site.updated ? `Обновлено ${site.updated}` : '';
  $('#nav').innerHTML = site.blocks.filter((b) => b.nav).map((b) => `<a href="#${esc(b.id)}">${esc(b.nav)}</a>`).join('');

  // каждый блок — отдельно: ошибка в одном файле не ломает остальные
  const parts = await Promise.all(site.blocks.map(async (b) => {
    try {
      const fn = RENDER[b.type];
      if (!fn) throw new Error(`неизвестный тип «${b.type}»`);
      const data = b.src ? await load(b.src) : (b.data || {});
      const out = await fn(b, data);
      return typeof out === 'string' ? { b, html: out } : { b, ...out };
    } catch (e) {
      return { b, html: `<div class="err">${icon('triangle-alert')}<b>Блок «${esc(b.id)}» не собрался</b><p>${esc(e.message)}</p><p class="mono">${esc(b.src || '')}</p></div>` };
    }
  }));
  app.innerHTML = parts.map(({ b, html }) => `<section id="${esc(b.id)}" class="sec sec-${esc(b.type)}">${html}</section>`).join('');
  parts.forEach(({ b, after }) => { try { after && after(document.getElementById(b.id)); } catch (e) { console.error(b.id, e); } });
  paintIcons(); tooltips(); revealOnScroll(); trackNav();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function revealOnScroll() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.sec').forEach((s) => io.observe(s));
}

function trackNav() {
  const nav = $('#nav');
  const links = [...nav.querySelectorAll('a')];
  const ids = new Set(links.map((a) => a.getAttribute('href').slice(1)));
  let current = '';
  // подсвечиваем ближайший раздел из меню, который выше середины экрана
  const io = new IntersectionObserver(() => {
    const secs = [...document.querySelectorAll('.sec')].filter((s) => ids.has(s.id));
    let best = secs[0]?.id || '';
    for (const s of secs) if (s.getBoundingClientRect().top < innerHeight * 0.45) best = s.id;
    if (best === current) return;
    current = best;
    links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${current}`));
    // двигаем только полоску меню по горизонтали; scrollIntoView здесь нельзя —
    // у прилипшей шапки он тянет вверх всю страницу (Safari, телефоны)
    const a = links.find((x) => x.classList.contains('on'));
    if (a && nav.scrollWidth > nav.clientWidth) {
      const r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
      nav.scrollTo({ left: nav.scrollLeft + (r.left - n.left) - (nav.clientWidth - r.width) / 2, behavior: 'smooth' });
    }
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  document.querySelectorAll('.sec').forEach((s) => io.observe(s));
}

$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('sut-theme', root.dataset.theme); } catch (e) {}
});

main();
