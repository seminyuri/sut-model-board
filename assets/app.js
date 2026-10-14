// Доска «Суть»: собирает страницу из content/site.json.
// Содержимое здесь не правим — только в content/. Новый тип блока = новая функция в RENDER.

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// в текстах можно писать **жирный** и `код`
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
const h = (tag, cls, html) => `<${tag}${cls ? ` class="${cls}"` : ''}>${html}</${tag}>`;

const head = (b, d) => {
  const title = b.title || d.title;
  const lead = b.lead || d.lead;
  return title ? `<header class="sec-head"><h2>${rich(title)}</h2>${lead ? `<p class="lead">${rich(lead)}</p>` : ''}</header>` : '';
};

const RENDER = {
  hero(b, d) {
    const stats = (d.stats || []).map((s, i) =>
      `<li style="--i:${i}"><b>${rich(s.value)}</b><span>${rich(s.label)}</span></li>`).join('');
    return `<div class="hero">
      <p class="eyebrow">${rich(d.eyebrow)}</p>
      <h1>${rich(d.title)}</h1>
      <p class="hero-lead">${rich(d.lead)}</p>
      <ul class="stats">${stats}</ul>
    </div>`;
  },

  cards(b, d) {
    const items = (d.items || []).map((c, i) =>
      `<article class="card" style="--i:${i}">${c.tag ? `<span class="tag">${rich(c.tag)}</span>` : ''}<h3>${rich(c.title)}</h3><p>${rich(c.text)}</p></article>`).join('');
    return head(b, d) + `<div class="cards">${items}</div>`;
  },

  stages(b, d) {
    const list = (arr) => `<ul class="dots">${(arr || []).map((x) => `<li>${rich(x)}</li>`).join('')}</ul>`;
    const items = (d.items || []).map((s, i) => `
      <li class="stage ${s.status === 'сейчас' ? 'is-now' : ''}" style="--i:${i}">
        <div class="stage-n" aria-hidden="true">${esc(s.n)}</div>
        <details ${i === 0 ? 'open' : ''}>
          <summary>
            <span class="stage-meta"><span class="chip ${s.status === 'сейчас' ? 'chip-hot' : ''}">${rich(s.status)}</span><span class="mono">Этап ${esc(s.n)} · ${rich(s.period)}</span></span>
            <span class="stage-title">${rich(s.title)}</span>
            <span class="stage-goal">${rich(s.goal)}</span>
          </summary>
          <div class="stage-body">
            ${s.segments ? `<div class="pills">${s.segments.map((x) => `<span>${rich(x)}</span>`).join('')}</div>` : ''}
            <div class="stage-grid">
              <section>${h('h4', '', 'Что делаем')}${list(s.do)}</section>
              <section>${h('h4', '', 'Деньги')}${list(s.money)}</section>
            </div>
            ${s.exit ? `<p class="exit"><span class="mono">Переход дальше</span>${rich(s.exit)}</p>` : ''}
          </div>
        </details>
      </li>`).join('');
    return head(b, d) + `<ol class="stages">${items}</ol>`;
  },

  tables(b, d) {
    const one = (t) => {
      const cols = t.columns || [];
      const rows = (t.rows || []).map((r) => `<tr>${r.map((c, j) => `<td data-l="${esc(cols[j] || '')}">${rich(c)}</td>`).join('')}</tr>`).join('');
      return `<div class="tbl">${t.title ? `<h3>${rich(t.title)}</h3>` : ''}
        <div class="tbl-scroll"><table><thead><tr>${cols.map((c) => `<th>${rich(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        ${t.note ? `<p class="note">${rich(t.note)}</p>` : ''}</div>`;
    };
    return head(b, d) + (d.tables || []).map(one).join('');
  },

  modules(b, d) {
    const groups = d.groups || [];
    const stages = ['0', '1', '2', '3', '4'];
    const prios = [['🔴', 'Без этого не стартуем'], ['🟡', 'Важно'], ['⚪', 'Позже']];
    const total = groups.reduce((n, g) => n + g.rows.length, 0);
    const body = groups.map((g) => `
      <details class="mgroup" open data-g="${esc(g.id)}">
        <summary><span class="mono">${esc(g.id)}</span>${rich(g.title)}<span class="count"></span></summary>
        <div class="mrows">${g.rows.map((r) => `
          <article class="mrow" data-stage="${esc(r.stage)}" data-prio="${esc(r.priority)}" data-text="${esc([r.id, r.name, r.who, r.what, r.price].join(' ').toLowerCase())}">
            <div class="m-id mono">${esc(r.id)}</div>
            <div class="m-main"><h4>${rich(r.name)}</h4><p>${rich(r.what)}</p><p class="m-who">${rich(r.who)}</p></div>
            <dl class="m-facts">
              <div><dt>Цена</dt><dd>${rich(r.price)}</dd></div>
              <div><dt>Себестоимость</dt><dd>${rich(r.cost)}</dd></div>
              <div><dt>Этап</dt><dd>${rich(r.stage)}</dd></div>
              <div><dt>Приоритет</dt><dd>${rich(r.priority)}</dd></div>
              <div><dt>Есть сейчас</dt><dd>${rich(r.now)}</dd></div>
            </dl>
          </article>`).join('')}</div>
      </details>`).join('');
    const html = head(b, d) + `
      <div class="filters" role="group" aria-label="Фильтры модулей">
        <input class="search" type="search" placeholder="Поиск: касса, книга, лендинг…" aria-label="Поиск модулей">
        <div class="chips" data-f="stage"><span class="mono">Этап</span>${stages.map((s) => `<button type="button" data-v="${s}">${s}</button>`).join('')}</div>
        <div class="chips" data-f="prio"><span class="mono">Приоритет</span>${prios.map(([p, t]) => `<button type="button" data-v="${p}" title="${t}">${p} ${t}</button>`).join('')}</div>
        <p class="found mono" aria-live="polite">${total} модулей</p>
      </div>
      <div class="mlist">${body}</div>`;
    return { html, after: (root) => wireModules(root, total) };
  },

  metrics(b, d) {
    const items = (d.items || []).map((m, i) => `
      <article class="metric st-${esc(m.status || 'plan')}" style="--i:${i}">
        <span class="mono">${rich(m.label)}</span>
        <b>${rich(m.value)}</b>
        <span class="target">цель: ${rich(m.target)}</span>
        ${m.hint ? `<span class="hint">${rich(m.hint)}</span>` : ''}
      </article>`).join('');
    return head(b, d) + `<div class="metrics">${items}</div>`;
  },

  checklist(b, d) {
    const items = (d.items || []).map((x) => `
      <li class="${x.done ? 'done' : ''}"><span class="box" aria-hidden="true"></span><div><p>${rich(x.q)}</p>${x.answer ? `<p class="answer">${rich(x.answer)}</p>` : ''}</div></li>`).join('');
    return head(b, d) + `<ul class="check">${items}</ul>`;
  },

  log(b, d) {
    const items = (d.items || []).map((x) => `<li><time class="mono">${esc(x.date)}</time><p>${rich(x.text)}</p></li>`).join('');
    return head(b, d) + `<ol class="log">${items}</ol>`;
  },

  async markdown(b, d) {
    const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js');
    return head(b, {}) + `<div class="md">${marked.parse(d)}</div>`;
  },
};

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
  root.querySelector('.search').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); apply(); });
  apply();
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
      return { b, html: `<div class="err"><b>Блок «${esc(b.id)}» не собрался</b><p>${esc(e.message)}</p><p class="mono">${esc(b.src || '')}</p></div>` };
    }
  }));
  app.innerHTML = parts.map(({ b, html }) => `<section id="${esc(b.id)}" class="sec sec-${esc(b.type)}">${html}</section>`).join('');
  parts.forEach(({ b, after }) => after && after(document.getElementById(b.id)));
  revealOnScroll(); trackNav();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function revealOnScroll() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.sec').forEach((s) => io.observe(s));
}

function trackNav() {
  const nav = $('#nav');
  const links = [...nav.querySelectorAll('a')];
  let current = '';
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting || e.target.id === current) return;
    current = e.target.id;
    links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${current}`));
    // двигаем только полоску меню по горизонтали; scrollIntoView здесь нельзя —
    // у прилипшей шапки он тянет вверх всю страницу (Safari, телефоны)
    const a = links.find((x) => x.classList.contains('on'));
    if (a && nav.scrollWidth > nav.clientWidth) {
      const r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
      nav.scrollTo({ left: nav.scrollLeft + (r.left - n.left) - (nav.clientWidth - r.width) / 2, behavior: 'smooth' });
    }
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.sec').forEach((s) => io.observe(s));
}

$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('sut-theme', root.dataset.theme); } catch (e) {}
});

main();
