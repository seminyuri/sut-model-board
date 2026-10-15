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

  machine(b, d) {
    const num = (v) => typeof v === 'number' ? fmt(v) : esc(v);
    const ST = { now: ['идёт сейчас', 'now'], ready: ['код готов', 'ready'], next: ['дальше', 'next'] };
    const stats = (d.stats || []).map((x, i) => `<li style="--i:${i}">${icon(x.icon || 'circle')}<b>${num(x.value)}</b><span>${rich(x.label)}</span></li>`).join('');
    const conv = (d.conveyor || []).map((x, i) => `
      <li class="cv-${esc(x.status || 'next')}">
        <div class="cv-top"><span class="mstep-ic">${icon(x.icon || 'circle')}</span><span class="cv-st mono">${ST[x.status]?.[0] || ''}</span></div>
        <h3><span class="mono">${i + 1}</span>${rich(x.title)}</h3><p>${rich(x.text)}</p>
      </li>`).join('');
    const steps = (d.steps || []).map((x, i) => `
      <li class="${x.paid ? 'paid' : ''}">
        <span class="mstep-n mono">${String(i + 1).padStart(2, '0')}</span>
        <div class="mstep-ic">${icon(x.icon || 'circle')}</div>
        <h3>${rich(x.title)}</h3><p>${rich(x.text)}</p>
        ${x.paid ? `<span class="mstep-tag mono">${icon('wallet')}здесь зарабатываем</span>` : ''}
      </li>`).join('');
    const groups = (d.groups || []).map((g) => `<li><b>${rich(g.title)}</b><span>${rich(g.examples)}</span></li>`).join('');
    const gets = (d.gets || []).map((g) => `<li>${icon(g.icon)}<div><b>${rich(g.who)}</b><span>${rich(g.what)}</span></div></li>`).join('');
    return head(b, d) + `<div class="mach">
      <div class="mach-top"><ul class="mach-stats">${stats}</ul>
        ${d.asof ? `<p class="mono mach-asof">${icon('activity')}замер на ${esc(d.asof)} · сбор идёт${d.growth ? ` · ${rich(d.growth)}` : ''}</p>` : ''}</div>
      ${conv ? `<div><p class="mono mach-sub">Конвейер карты</p><ol class="mach-conv">${conv}</ol></div>` : ''}
      ${steps ? `<div><p class="mono mach-sub">Путь специалиста к нам</p><ol class="mach-steps">${steps}</ol></div>` : ''}
      ${groups ? `<div class="mach-prof"><p class="mono mach-sub">${rich(d.groups_title || 'Кого собираем')}</p><ul class="mach-groups">${groups}</ul></div>` : ''}
    </div>${gets ? `<ul class="gets mach-gets">${gets}</ul>` : ''}${d.note ? `<p class="note">${rich(d.note)}</p>` : ''}`;
  },

  meaning(b, d) {
    const col = (c, cls, ic) => c ? `<div class="mn-col ${cls}"><h3>${icon(ic)}${rich(c.title)}</h3><ul>${(c.items || []).map((x) => `<li>${icon('check')}<span>${rich(x)}</span></li>`).join('')}</ul></div>` : '';
    const chain = (d.chain || []).map((x, i) => `${i ? icon('arrow-right', 'mn-arr') : ''}<span>${rich(x)}</span>`).join('');
    const lv = d.levels || [];
    const n = lv.length, R = 150, r0 = 30, step = n > 1 ? (R - r0) / (n - 1) : 0;
    const rings = lv.map((_, i) => n - 1 - i).map((i) => {
      const r = r0 + i * step;
      return `<circle class="mn-ring ${i === 0 ? 'core' : ''}" cx="160" cy="160" r="${r.toFixed(1)}" style="--o:${(1 - i / n * 0.75).toFixed(2)}"/>` +
        `<text class="mn-ring-n" x="160" y="${(160 - r + (i === 0 ? 34 : 13)).toFixed(1)}">${i + 1}</text>`;
    }).join('');
    const legend = lv.map((x, i) => `<li class="${i === 0 ? 'core' : ''}"><span class="mono">${i + 1}</span>${rich(x)}</li>`).join('');
    const cmp = d.compare ? `<div class="mn-cmp"><table><thead><tr>${d.compare.cols.map((c) => `<th>${rich(c)}</th>`).join('')}</tr></thead><tbody>${d.compare.rows.map((r) => `<tr>${r.map((c, j) => `<td data-l="${esc(d.compare.cols[j])}">${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>${d.compare.note ? `<p class="note">${rich(d.compare.note)}</p>` : ''}</div>` : '';
    const path = (d.path || []).map((x, i) => `<li class="${i === (d.path.length - 1) ? 'goal' : ''}"><span class="mono">${i + 1}</span>${rich(x)}</li>`).join('');
    return head(b, d) + `
      ${d.split_title ? `<p class="mn-split">${rich(d.split_title)}</p>` : ''}
      <div class="mn-cols">${col(d.ai, 'ai', 'cpu')}${col(d.human, 'human', 'heart-handshake')}</div>
      ${chain ? `<p class="mn-chain">${chain}</p>` : ''}
      ${d.quote ? `<blockquote class="mn-quote"><p>«${rich(d.quote.text)}»</p><cite>${rich(d.quote.who)}</cite></blockquote>` : ''}
      ${n ? `<div class="mn-levels">
        <h3>${rich(d.levels_title || '')}</h3>
        <div class="mn-lv-grid">
          <svg class="mn-rings" viewBox="0 0 320 320" role="img" aria-label="${esc('Семь уровней человека: ' + lv.join(', '))}">${rings}</svg>
          <div><ol class="mn-legend">${legend}</ol>${d.levels_note ? `<p class="mn-lv-note">${rich(d.levels_note)}</p>` : ''}</div>
        </div>
        ${cmp}
      </div>` : ''}
      ${path ? `<div class="mn-path"><p class="mono">Наш путь</p><ol>${path}</ol></div>` : ''}
      ${d.scarcity ? `<p class="mn-scar">${icon('sparkles')}<span>${rich(d.scarcity)}</span></p>` : ''}
      ${d.scenarios ? `<div class="mn-scen"><h3 class="st-h">${rich(d.scenarios.title)}</h3><div class="mn-scen-grid">${d.scenarios.items.map((x, i) => `
        <article><header><span class="mono">сценарий ${i + 1}</span>${icon(x.icon || 'circle')}<h4>${rich(x.name)}</h4></header>
          <p>${rich(x.what)}</p><p class="mn-scen-m">${icon('compass')}<span>${rich(x.meaning)}</span></p>
          <p class="mn-scen-we">${icon('users-round')}<b>${rich(x.we)}</b></p></article>`).join('')}</div>
        ${d.scenarios.verdict ? `<p class="st-call tone-accent">${icon('route')}<span><span class="mono">В любом сценарии</span>${rich(d.scenarios.verdict)}</span></p>` : ''}</div>` : ''}
      ${d.plus ? `<p class="mn-plus">${icon('shield-check')}<span>${rich(d.plus)}</span></p>` : ''}
      ${d.source ? `<p class="note">Источник: <a href="${esc(d.source.url)}" target="_blank" rel="noopener">${rich(d.source.text)}</a></p>` : ''}`;
  },

  // Раздел из частей: lead, stats, cards, list, steps, bars, triangle, callout, sources (описание — _help в файле)
  story(b, d) {
    const P = {
      lead: (x) => `<p class="st-lead">${rich(x.text)}</p>`,
      stats: (x) => `<ul class="st-stats">${x.items.map((i) => `<li>${icon(i.icon || 'circle')}<b>${typeof i.value === 'number' ? fmt(i.value) : rich(i.value)}</b><span>${rich(i.label)}</span></li>`).join('')}</ul>`,
      cards: (x) => `${x.title ? `<h3 class="st-h">${rich(x.title)}</h3>` : ''}<div class="st-cards">${x.items.map((i) => `<article>${i.icon ? `<div class="card-ic">${icon(i.icon)}</div>` : ''}<h4>${rich(i.title)}</h4><p>${rich(i.text)}</p></article>`).join('')}</div>`,
      list: (x) => `${x.title ? `<h3 class="st-h">${rich(x.title)}</h3>` : ''}<ul class="st-list">${x.items.map((i) => `<li>${icon(i.icon || 'dot')}<div><b>${rich(i.title)}</b>${i.text ? `<span>${rich(i.text)}</span>` : ''}</div></li>`).join('')}</ul>`,
      steps: (x) => `${x.title ? `<h3 class="st-h">${rich(x.title)}</h3>` : ''}<ol class="st-steps">${x.items.map((i, k) => `<li><span class="mono">${k + 1}</span><b>${rich(i.title)}</b><p>${rich(i.text)}</p></li>`).join('')}</ol>`,
      bars: (x) => {
        const max = Math.max(...x.items.map((i) => i.value));
        return `${x.title ? `<h3 class="st-h">${rich(x.title)}</h3>` : ''}<div class="st-bars">${x.items.map((i) => `<div class="b-row ${i.hl ? 'ours' : ''}"><span class="b-label">${rich(i.label)}</span><div class="b-track"><span style="width:${i.value / max * 100}%" tabindex="0" data-tip="${esc(`${i.label}: ${String(i.value).replace('.', ',')} ${x.unit || ''}`)}"></span></div><b class="b-val">${String(i.value).replace('.', ',')}</b></div>`).join('')}${x.unit ? `<p class="mono st-unit">${esc(x.unit)}</p>` : ''}</div>${x.note ? `<p class="note">${rich(x.note)}</p>` : ''}`;
      },
      triangle: (x) => `${x.title ? `<h3 class="st-h">${rich(x.title)}</h3>` : ''}<div class="st-tri"><div class="st-tri-c">${icon('sparkles')}<b>${rich(x.center)}</b></div>${x.items.map((i, k) => `<article class="st-tri-${k}">${icon(i.icon || 'circle')}<b>${rich(i.who)}</b><p>${rich(i.text)}</p></article>`).join('')}</div>`,
      versus: (x) => `${x.title ? `<h3 class="st-h">${rich(x.title)}</h3>` : ''}<div class="vs" role="table">
        <div class="vs-row vs-head" role="row"><span role="columnheader"></span><span role="columnheader" class="mono">${icon('users')}${rich(x.before || 'Раньше')}</span><span role="columnheader" class="mono">${icon('cpu')}${rich(x.after || 'Сейчас')}</span></div>
        ${x.items.map((i) => `<div class="vs-row" role="row"><b role="rowheader">${i.icon ? icon(i.icon) : ''}${rich(i.what)}</b><span role="cell" class="vs-was" data-l="${esc(x.before || 'Раньше')}">${rich(i.before)}</span><span role="cell" class="vs-now" data-l="${esc(x.after || 'Сейчас')}">${rich(i.after)}</span></div>`).join('')}</div>${x.note ? `<p class="note">${rich(x.note)}</p>` : ''}`,
      callout: (x) => `<p class="st-call tone-${esc(x.tone || 'muted')}">${icon(x.icon || 'info')}<span>${x.label ? `<span class="mono">${rich(x.label)}</span>` : ''}${rich(x.text)}</span></p>`,
      sources: (x) => `<p class="note st-src">Источники: ${x.items.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${rich(i.text)}</a>`).join(' · ')}</p>`,
    };
    return head(b, d) + (d.parts || []).map((x) => `<div class="st-part stp-${esc(x.kind)}">${(P[x.kind] || (() => `<div class="err">неизвестная часть «${esc(x.kind)}»</div>`))(x)}</div>`).join('');
  },

  portraits(b, d) {
    const k = (v) => String(v).replace('.', ',');
    const card = (x) => {
      const m = x.money || { costs: [], left: 0, base: 0 };
      const segs = m.costs.map((c, i) => `<span class="pt-seg c${i % 6}" style="flex:${c.value}" tabindex="0" data-tip="${esc(`${c.label}: ~${k(c.value)} тыс. ₽`)}"></span>`).join('') +
        `<span class="pt-seg rest" style="flex:${m.left}" tabindex="0" data-tip="${esc(`Остаётся: ~${k(m.left)} тыс. ₽`)}"></span>`;
      const legend = m.costs.map((c, i) => `<li><span class="pt-sw c${i % 6}"></span>${rich(c.label)}<b>~${k(c.value)}</b></li>`).join('') +
        `<li class="rest"><span class="pt-sw rest"></span>Остаётся<b>~${k(m.left)}</b></li>`;
      return `<article class="pt">
        <header><div class="card-ic">${icon(x.icon || 'user-round')}</div><div><h3>${rich(x.title)}</h3><p class="mono">${rich(x.sub)}</p></div></header>
        <div class="pt-share"><b>${rich(x.share_text)}</b><div class="pt-share-bar"><span style="width:${x.share}%"></span></div></div>
        <dl class="pt-facts">${x.facts.map((f) => `<div><dt>${rich(f.label)}</dt><dd>${rich(f.value)}</dd></div>`).join('')}</dl>
        <div class="pt-money"><p class="mono">Куда уходят деньги · на ${k(m.base)} тыс. ₽ выручки, тыс. ₽</p><div class="pt-bar">${segs}</div><ul class="pt-legend">${legend}</ul></div>
        <p class="pt-row">${icon('users')}<span><span class="mono">Где клиенты</span>${rich(x.clients)}</span></p>
        <p class="pt-row">${icon('target')}<span><span class="mono">На что рассчитывать</span>${rich(x.expect)}</span></p>
        <p class="pt-row pt-we">${icon('sparkles')}<span><span class="mono">Что даём мы</span>${rich(x.we)}</span></p>
      </article>`;
    };
    return head(b, d) + `<div class="pts">${(d.items || []).map(card).join('')}</div>
      ${d.insight ? `<p class="st-call tone-accent">${icon('lightbulb')}<span><span class="mono">Главное</span>${rich(d.insight)}</span></p>` : ''}
      ${d.anchors ? `<div class="pt-anchors"><p class="mono">Подтверждённые опорные цифры</p><ul>${d.anchors.map((a) => `<li>${icon('check')}<span>${rich(a)}</span></li>`).join('')}</ul></div>` : ''}
      ${d.check ? `<p class="note">${rich(d.check)}</p>` : ''}
      ${d.sources ? `<p class="note st-src">Источники: ${d.sources.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener">${rich(i.text)}</a>`).join(' · ')}</p>` : ''}`;
  },

  engine(b, d) {
    const stats = `<ul class="st-stats eg-stats">${(d.stats || []).map((i) => `<li>${icon(i.icon || 'circle')}<b>${rich(i.value)}</b><span>${rich(i.label)}</span></li>`).join('')}</ul>`;
    const steps = `<ol class="eg-flow">${(d.steps || []).map((s, k) => `
      <li><div class="eg-ic">${icon(s.icon || 'circle')}</div><span class="mono">шаг ${k + 1}</span><h4>${rich(s.title)}</h4><p>${rich(s.text)}</p>${s.size ? `<span class="eg-size mono">${rich(s.size)}</span>` : ''}</li>`).join('')}</ol>`;
    const sv = d.sieve;
    const sieve = sv ? `<div class="eg-sieve"><h3 class="st-h">${rich(sv.title)}</h3>${sv.rows.map((r) => {
      const pass = r.hits > sv.threshold;
      const dots = Array.from({ length: sv.total }, (_, i) => `<span class="${i < r.hits ? 'on' : ''} ${i === sv.threshold ? 'cut' : ''}"></span>`).join('');
      return `<div class="eg-row ${pass ? 'pass' : 'fail'}"><div class="eg-dots" role="img" aria-label="${esc(`${r.hits} из ${sv.total} школ, порог — больше ${sv.threshold}`)}">${dots}</div>
        <div class="eg-verdict">${icon(pass ? 'circle-check' : 'circle-x')}<b>${rich(r.label)}</b><span>${rich(r.text)}</span></div></div>`;
    }).join('')}<p class="eg-legend mono"><span class="eg-cut-mark"></span>порог: больше ${esc(sv.threshold)} школ из ~${esc(sv.total)}</p>${sv.note ? `<p class="note">${rich(sv.note)}</p>` : ''}</div>` : '';
    const side = (x, cls) => `<article class="eg-side ${cls}"><h4>${icon(x.icon || 'circle')}${rich(x.title)}</h4><ul>${x.items.map((i) => `<li>${icon(cls === 'ours' ? 'check' : 'minus')}<span>${rich(i)}</span></li>`).join('')}</ul></article>`;
    const cmp = d.compare ? `<h3 class="st-h">${rich(d.compare.title)}</h3><div class="eg-cmp">${side(d.compare.left, 'them')}${side(d.compare.right, 'ours')}</div>` : '';
    const c = d.callout;
    const call = c ? `<p class="st-call tone-${esc(c.tone || 'accent')}">${icon(c.icon || 'info')}<span>${c.label ? `<span class="mono">${rich(c.label)}</span>` : ''}${rich(c.text)}</span></p>` : '';
    return head(b, d) + stats + steps + sieve + cmp + call + (d.note ? `<p class="note">${rich(d.note)}</p>` : '');
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
      }).join('') + `<div class="f-money">${icon('banknote')}<span><span class="mono">Прибыль</span><b>${rich(s.money)}</b>${s.detail ? `<span class="f-detail">${rich(s.detail)}</span>` : ''}</span></div>`;
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

  slider(b, d) {
    const steps = d.steps || [0];
    const groups = (d.groups || []).map((g) => `
      <article class="pc"><h3>${icon(g.icon || 'circle')}${rich(g.who)}</h3>
        <ul>${(g.pros || []).map((x) => `<li class="pro">${icon('plus')}<span>${rich(x)}</span></li>`).join('')}${(g.cons || []).map((x) => `<li class="con">${icon('minus')}<span>${rich(x)}</span></li>`).join('')}</ul>
      </article>`).join('');
    const html = head(b, d) + `<div class="disc">
      <div class="disc-ctl">
        <label class="mono" for="disc-range">Скидка клиенту из доли специалиста</label>
        <input id="disc-range" type="range" min="0" max="${steps.length - 1}" step="1" value="0" aria-valuetext="0 %">
        <div class="disc-ticks">${steps.map((x) => `<span>${x} %</span>`).join('')}</div>
      </div>
      <div class="disc-out"></div>
    </div>
    <div class="pcs">${groups}</div>
    ${d.avoid ? `<p class="avoid">${icon('ban')}<span>${rich(d.avoid)}</span></p>` : ''}
    ${d.verdict ? `<p class="verdict">${icon('lightbulb')}<span><span class="mono">Предлагаем</span>${rich(d.verdict)}</span></p>` : ''}`;
    const draw = (root, i) => {
      const pct = steps[i], off = Math.round(d.price * pct / 100), final = d.price - off, spec = d.spec - off;
      const seg = (cls, v, label) => v > 0 ? `<div class="seg ${cls}" style="flex:${v}" tabindex="0" data-tip="${esc(`${label}: ${fmt(v)} ₽`)}"><span>${fmt(v)}</span></div>` : '';
      root.querySelector('.disc-out').innerHTML = `
        <div class="disc-price">${off ? `<s>${fmt(d.price)} ₽</s><span class="badge-off">−${pct} %</span>` : ''}<b>${fmt(final)} ₽</b><span class="mono">платит клиент</span></div>
        <div class="split-bar">${seg('seg-spec', spec, 'Специалисту')}${seg('seg-platform', d.platform, 'Платформе')}${seg('seg-cost', d.cost, 'Себестоимость и эквайринг')}</div>
        <ul class="legend">
          <li><span class="sw seg-spec"></span><b>${fmt(spec)} ₽</b><span>специалисту${off ? ` — отдал клиенту ${fmt(off)} ₽` : ''}</span></li>
          <li><span class="sw seg-platform"></span><b>${fmt(d.platform)} ₽</b><span>платформе — не меняется</span></li>
          <li><span class="sw seg-cost"></span><b>${fmt(d.cost)} ₽</b><span>себестоимость и эквайринг</span></li>
        </ul>`;
      root.querySelector('#disc-range').setAttribute('aria-valuetext', `${pct} %`);
    };
    return { html, after: (root) => { const r = root.querySelector('#disc-range'); draw(root, 0); r.addEventListener('input', () => draw(root, +r.value)); } };
  },

  ramp(b, d) {
    const mlnS = (v) => `${v < 0 ? '−' : '+'}${(Math.abs(v) / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: Math.abs(v) < 1e6 ? 2 : 1 })} млн ₽`;
    const panel = (s) => {
      const max = Math.max(0, ...s.values), min = Math.min(0, ...s.values), range = max - min || 1, zero = max / range * 100;
      const bars = s.values.map((v, i) => {
        const h = Math.abs(v) / range * 100;
        return `<span class="rb ${v < 0 ? 'neg' : 'pos'}" style="left:${(i / s.values.length * 100).toFixed(2)}%;top:${(v < 0 ? zero : zero - h).toFixed(2)}%;height:${Math.max(h, .6).toFixed(2)}%" tabindex="0" data-tip="${esc(`${s.name}, месяц ${i + 1}: ${mlnS(v)}`)}"></span>`;
      }).join('');
      return `<article class="rp">
        <header><h3>${rich(s.name)}</h3><p class="rp-be ${s.breakeven ? 'ok' : 'bad'}">${icon(s.breakeven ? 'trending-up' : 'trending-down')}${s.breakeven ? `в плюсе с ${s.breakeven}-го месяца` : 'не выходит в плюс за год'}</p></header>
        <div class="rp-chart" role="img" aria-label="${esc(`${s.name}: прибыль по месяцам от ${mlnS(s.values[0])} до ${mlnS(s.values[s.values.length - 1])}`)}">
          <span class="rp-zero" style="top:${zero.toFixed(2)}%"></span>${bars}
        </div>
        <div class="rp-x mono"><span>1 мес</span><span>6</span><span>12</span></div>
        <dl class="rp-sum"><div><dt>12-й месяц</dt><dd>${mlnS(s.values[s.values.length - 1])}</dd></div><div><dt>Итог года</dt><dd>${mlnS(s.year)}</dd></div></dl>
        <ul class="rp-facts">${(s.facts || []).map((x) => `<li>${rich(x)}</li>`).join('')}</ul>
      </article>`;
    };
    return head(b, d) + `<div class="ramp">${(d.scenarios || []).map(panel).join('')}</div>${d.note ? `<p class="note">${rich(d.note)}</p>` : ''}`;
  },

  faq(b, d) {
    const ST = { answer: ['circle-check', 'ответ есть'], pilot: ['flask-conical', 'проверит пилот'], proposal: ['circle-help', 'предложение'], accepted: ['shield-alert', 'риск принят'] };
    const items = d.items || [];
    const whos = [...new Set(items.map((x) => x.who))];
    const states = Object.keys(ST).filter((k) => items.some((x) => x.state === k));
    const list = items.map((x) => `
      <details class="qa st-${esc(x.state)}" data-who="${esc(x.who)}" data-state="${esc(x.state)}">
        <summary><span class="qa-st" title="${esc(ST[x.state]?.[1] || '')}">${icon(ST[x.state]?.[0] || 'circle')}</span><span class="qa-q">${rich(x.q)}</span><span class="qa-who mono">${esc(x.who)}</span>${icon('chevron-down', 'chev')}</summary>
        <div class="qa-a"><p>${rich(x.a)}</p>
          ${x.check ? `<p class="qa-check">${icon('flask-conical')}<span><span class="mono">Чем проверяем</span>${rich(x.check)}</span></p>` : ''}
          ${x.note ? `<p class="qa-note">${icon('info')}<span>${rich(x.note)}</span></p>` : ''}
          <p class="qa-tag mono">${esc(ST[x.state]?.[1] || '')}</p></div>
      </details>`).join('');
    const html = head(b, d) + `
      <div class="filters faq-f" role="group" aria-label="Фильтры возражений">
        <div class="chips" data-f="who"><span class="mono">Кто спрашивает</span>${whos.map((w) => `<button type="button" data-v="${esc(w)}" aria-pressed="false">${esc(w)}</button>`).join('')}</div>
        <div class="chips" data-f="state"><span class="mono">Статус</span>${states.map((k) => `<button type="button" data-v="${k}" aria-pressed="false">${icon(ST[k][0])}${ST[k][1]}</button>`).join('')}</div>
        <button type="button" class="open-all mono">раскрыть все</button>
        <p class="found mono" aria-live="polite">${items.length}</p>
      </div>
      <div class="qas">${list}</div>`;
    const wire = (root) => {
      const st = { who: new Set(), state: new Set() };
      const rows = [...root.querySelectorAll('.qa')];
      const apply = () => {
        let n = 0;
        rows.forEach((r) => { const on = (!st.who.size || st.who.has(r.dataset.who)) && (!st.state.size || st.state.has(r.dataset.state)); r.hidden = !on; if (on) n++; });
        root.querySelector('.found').textContent = n === rows.length ? `${n} возражений` : `${n} из ${rows.length}`;
      };
      root.querySelectorAll('.chips').forEach((box) => box.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        const set = st[box.dataset.f], v = btn.dataset.v;
        set.has(v) ? set.delete(v) : set.add(v);
        btn.classList.toggle('on', set.has(v)); btn.setAttribute('aria-pressed', set.has(v)); apply();
      }));
      const all = root.querySelector('.open-all');
      all.addEventListener('click', () => { const open = all.dataset.open !== '1'; rows.forEach((r) => { r.open = open; }); all.dataset.open = open ? '1' : ''; all.textContent = open ? 'свернуть все' : 'раскрыть все'; });
      apply();
    };
    return { html, after: wire };
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

  async modules(b, d) {
    const groups = d.groups || [];
    // этапы — из блока «Этапы» (один источник правды), иначе 0…5
    let stageInfo = [];
    if (b.stages_src) { try { stageInfo = (await load(b.stages_src)).items || []; } catch (e) { stageInfo = []; } }
    const stages = stageInfo.length ? stageInfo.map((x) => String(x.n)) : ['0', '1', '2', '3', '4', '5'];
    const sName = (n) => stageInfo.find((x) => String(x.n) === n)?.short || '';
    const all = groups.flatMap((g) => g.rows);
    const byId = Object.fromEntries(all.map((r) => [r.id, r]));
    const total = all.length;
    const first = (st) => String(st).trim().match(/\d/)?.[0] || '0';

    // вкладки «что получает специалист»: модули из карты, разложенные по этапам
    const personas = d.personas || [];
    const tabs = personas.length ? `<div class="sp-tabs" role="tablist" aria-label="Кто вы">${personas.map((p, i) => `
      <button type="button" role="tab" class="sp-tab" aria-selected="${i === 1}" data-i="${i}">${icon(p.icon || 'user-round')}<span><b>${rich(p.name)}</b><span class="mono">${rich(p.sub)} · ${rich(p.share)}</span></span></button>`).join('')}</div>` : '';
    const panels = personas.map((p, i) => {
      const picks = (p.picks || []).filter((x) => byId[x.id]);
      const ladder = stages.map((s) => {
        const here = picks.filter((x) => first(byId[x.id].stage) === s);
        if (!here.length) return '';
        const cur = stageInfo.find((x) => String(x.n) === s)?.status === 'сейчас';
        return `<li class="sp-stage ${cur ? 'now' : ''}"><div class="sp-st-h"><span class="sp-st-n">${esc(s)}</span><span><span class="mono">Этап ${esc(s)}${cur ? ' · сейчас' : ''}</span><b>${rich(sName(s))}</b></span></div>
          <ul class="sp-items">${here.map((x) => { const r = byId[x.id]; return `<li><span class="mono sp-id">${esc(r.id)}</span><div><b>${rich(r.name)}</b><p>${rich(x.why)}</p></div><span class="sp-price">${rich(r.price)}</span></li>`; }).join('')}</ul></li>`;
      }).join('');
      return `<div class="sp-panel" role="tabpanel" data-i="${i}" ${i === 1 ? '' : 'hidden'}>
        <div class="sp-top"><p class="sp-pitch">${rich(p.pitch)}</p>${p.money ? `<p class="sp-money">${icon('wallet')}<span>${rich(p.money)}</span></p>` : ''}</div>
        <ol class="sp-ladder">${ladder}</ol></div>`;
    }).join('');

    // сводка: модули по этапам, разбитые по приоритету
    const byStage = stages.map((s) => ({ s, p: ['🔴', '🟡', '⚪'].map((p) => all.filter((r) => first(r.stage) === s && r.priority === p).length) }));
    const maxS = Math.max(1, ...byStage.map((x) => x.p.reduce((a, c) => a + c, 0)));
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
    const catalog = summary + `
      <div class="filters" role="group" aria-label="Фильтры модулей">
        <label class="search">${icon('search')}<input type="search" placeholder="Поиск: касса, книга, лендинг…" aria-label="Поиск модулей"></label>
        <div class="chips" data-f="stage"><span class="mono">Этап</span>${stages.map((s) => `<button type="button" data-v="${s}" aria-pressed="false">${s}</button>`).join('')}</div>
        <div class="chips" data-f="prio"><span class="mono">Приоритет</span>${['🔴', '🟡', '⚪'].map((p) => `<button type="button" data-v="${p}" aria-pressed="false">${EMOJI[p]}${PRIO[p][1]}</button>`).join('')}</div>
        <p class="found mono" aria-live="polite">${total} модулей</p>
      </div>
      <div class="mlist">${body}</div>`;
    const html = head(b, d) + (personas.length
      ? `<div class="sp">${tabs}${panels}</div><details class="more sp-all"><summary>${icon('layout-grid')}<span>Полная карта: все ${total} модулей</span><span class="mono">этапы, цены, приоритет, поиск</span>${icon('chevron-down', 'chev')}</summary><div class="more-body">${catalog}</div></details>`
      : catalog);
    return { html, after: (root) => { wireModules(root, total); wireTabs(root, '.sp-tab', '.sp-panel'); } };
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

// '0–5' или '1–4' — диапазон; '2' — один этап
function stageHas(st, s) {
  const n = String(st).match(/\d/g)?.map(Number) || [];
  if (!n.length) return false;
  return /[–-]/.test(st) ? +s >= Math.min(...n) && +s <= Math.max(...n) : n.includes(+s);
}

function wireTabs(root, tabSel, panelSel) {
  const tabs = [...root.querySelectorAll(tabSel)];
  const panels = [...root.querySelectorAll(panelSel)];
  if (!tabs.length) return;
  const show = (i) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(+t.dataset.i === i)));
    panels.forEach((p) => { p.hidden = +p.dataset.i !== i; });
  };
  tabs.forEach((t) => t.addEventListener('click', () => show(+t.dataset.i)));
  tabs[0].parentElement.addEventListener('keydown', (e) => {
    const cur = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = e.key === 'ArrowRight' ? cur + 1 : e.key === 'ArrowLeft' ? cur - 1 : -1;
    if (next >= 0 && next < tabs.length) { e.preventDefault(); show(next); tabs[next].focus(); }
  });
}

function wireModules(root, total) {
  const state = { stage: new Set(), prio: new Set(), q: '' };
  const rows = [...root.querySelectorAll('.mrow')];
  const apply = () => {
    let shown = 0;
    rows.forEach((r) => {
      const st = r.dataset.stage;
      const okStage = !state.stage.size || [...state.stage].some((s) => stageHas(st, s));
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
