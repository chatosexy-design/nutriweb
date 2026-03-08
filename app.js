const state = { user: null, foods: [] };
const OMS = { fibra: 25, azucar: 50, sodio: 2000, grasa: 20 };
const CATALOGO = [
  { id: 'huevo', nombre: 'Huevo (1 u)', fibra: 0, azucar: 0.1, sodio: 62, grasa: 1.6, proteina: 6 },
  { id: 'leche', nombre: 'Leche 250 ml', fibra: 0, azucar: 12, sodio: 120, grasa: 3, proteina: 8 },
  { id: 'avena', nombre: 'Avena 40 g', fibra: 4, azucar: 0.5, sodio: 2, grasa: 0.8, proteina: 5 },
  { id: 'manzana', nombre: 'Manzana (1 u)', fibra: 3.6, azucar: 19, sodio: 1, grasa: 0, proteina: 0.3 },
  { id: 'yogur', nombre: 'Yogur natural 125 g', fibra: 0, azucar: 4.7, sodio: 50, grasa: 2.1, proteina: 5 },
  { id: 'pan', nombre: 'Pan integral 1 rebanada', fibra: 2.5, azucar: 2, sodio: 160, grasa: 0.3, proteina: 3.5 }
];

function init() {
  loadState();
  bindNav();
  bindForms();
  render();
}

function loadState() {
  try {
    const s = localStorage.getItem('nutriapp_state');
    if (s) {
      const obj = JSON.parse(s);
      state.user = obj.user || null;
      state.foods = Array.isArray(obj.foods) ? obj.foods : [];
    }
  } catch (e) {}
}

function saveState() {
  localStorage.setItem('nutriapp_state', JSON.stringify(state));
}

function bindNav() {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', ev => {
      ev.preventDefault();
      const id = a.getAttribute('data-section');
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      a.classList.add('active');
      showSection(id);
    });
  });
}

function showSection(id) {
  document.querySelectorAll('.view').forEach(s => s.classList.add('hidden'));
  const v = document.getElementById(id);
  if (v) v.classList.remove('hidden');
}

function bindForms() {
  const reg = document.getElementById('registro-form');
  reg.addEventListener('submit', ev => {
    ev.preventDefault();
    const edad = parseInt(document.getElementById('edad').value, 10);
    const peso = parseFloat(document.getElementById('peso').value);
    const actividad = document.getElementById('actividad').value;
    state.user = { edad, peso, actividad };
    saveState();
    const ok = document.getElementById('registro-ok');
    ok.textContent = 'Guardado';
    setTimeout(() => {
      ok.textContent = '';
    }, 1500);
  });

  const af = document.getElementById('alimento-form');
  af.addEventListener('submit', ev => {
    ev.preventDefault();
    const nombre = document.getElementById('alimento-nombre').value.trim();
    const fibra = parseFloat(document.getElementById('alimento-fibra').value) || 0;
    const azucar = parseFloat(document.getElementById('alimento-azucar').value) || 0;
    const sodio = parseFloat(document.getElementById('alimento-sodio').value) || 0;
    const grasa = parseFloat(document.getElementById('alimento-grasa').value) || 0;
    const proteina = parseFloat(document.getElementById('alimento-proteina').value) || 0;
    state.foods.push({ nombre, fibra, azucar, sodio, grasa, proteina });
    saveState();
    af.reset();
    renderFoods();
    renderTotals();
    renderComparacion();
    renderAlertas();
    renderBreakfast();
    renderCatalogos();
    renderMenu();
  });
}

function render() {
  renderRegistro();
  renderFoods();
  renderTotals();
  renderComparacion();
  renderAlertas();
  renderCatalogos();
  renderBreakfast();
  renderMenu();
}

function renderRegistro() {
  if (state.user) {
    document.getElementById('edad').value = state.user.edad;
    document.getElementById('peso').value = state.user.peso;
    document.getElementById('actividad').value = state.user.actividad;
  }
}

function renderFoods() {
  const ul = document.getElementById('food-list');
  ul.innerHTML = '';
  state.foods.forEach((f, idx) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const info = document.createElement('div');
    info.className = 'item-info';
    const prot = typeof f.proteina === 'number' ? f.proteina : 0;
    const meal = f.meal ? ' · ' + f.meal : '';
    info.textContent = f.nombre + ' · fibra ' + f.fibra + 'g · azúcar ' + f.azucar + 'g · sodio ' + f.sodio + 'mg · grasa sat ' + f.grasa + 'g · proteína ' + prot + 'g' + meal;
    const del = document.createElement('button');
    del.className = 'btn ghost';
    del.textContent = 'Eliminar';
    del.addEventListener('click', () => {
      state.foods.splice(idx, 1);
      saveState();
      renderFoods();
      renderTotals();
      renderComparacion();
      renderAlertas();
      renderBreakfast();
    });
    li.appendChild(info);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function totals() {
  return state.foods.reduce(
    (acc, f) => {
      acc.fibra += f.fibra;
      acc.azucar += f.azucar;
      acc.sodio += f.sodio;
      acc.grasa += f.grasa;
      acc.proteina += (typeof f.proteina === 'number' ? f.proteina : 0);
      return acc;
    },
    { fibra: 0, azucar: 0, sodio: 0, grasa: 0, proteina: 0 }
  );
}

function recommendedProtein() {
  const u = state.user;
  if (!u || !u.peso) return 50;
  const mult =
    u.actividad === 'intensa' ? 1.5 :
    u.actividad === 'moderada' ? 1.2 :
    u.actividad === 'ligera' ? 1.0 : 0.8;
  return Math.round(u.peso * mult);
}

function renderTotals() {
  const t = totals();
  const el = document.getElementById('totales');
  el.innerHTML = '';
  const rows = [
    { k: 'Fibra', v: t.fibra, u: 'g', lim: OMS.fibra },
    { k: 'Azúcar', v: t.azucar, u: 'g', lim: OMS.azucar },
    { k: 'Sodio', v: t.sodio, u: 'mg', lim: OMS.sodio },
    { k: 'Grasa saturada', v: t.grasa, u: 'g', lim: OMS.grasa }
  ];
  rows.forEach(r => {
    const div = document.createElement('div');
    div.className = 'total-row';
    const ok = r.k === 'Fibra' ? r.v >= r.lim : r.v <= r.lim;
    div.innerHTML = '<span>' + r.k + '</span><span>' + r.v.toFixed(1) + r.u + ' / ' + r.lim + r.u + '</span>';
    div.classList.add(ok ? 'ok' : 'warn');
    el.appendChild(div);
  });
  const protMeta = recommendedProtein();
  const protRow = document.createElement('div');
  protRow.className = 'total-row ' + (t.proteina >= protMeta ? 'ok' : 'warn');
  protRow.innerHTML = '<span>Proteína</span><span>' + t.proteina.toFixed(1) + 'g / ' + protMeta + 'g</span>';
  el.appendChild(protRow);
}

function renderComparacion() {
  const cont = document.getElementById('comparacion');
  cont.innerHTML = '';
  state.foods.forEach(f => {
    const wrap = document.createElement('div');
    wrap.className = 'compare-card';
    const h = document.createElement('div');
    h.className = 'compare-title';
    h.textContent = f.nombre;
    const list = document.createElement('ul');
    const items = [
      { k: 'Fibra', v: f.fibra, u: 'g', lim: OMS.fibra, ok: f.fibra >= OMS.fibra },
      { k: 'Azúcar', v: f.azucar, u: 'g', lim: OMS.azucar, ok: f.azucar <= OMS.azucar },
      { k: 'Sodio', v: f.sodio, u: 'mg', lim: OMS.sodio, ok: f.sodio <= OMS.sodio },
      { k: 'Grasa saturada', v: f.grasa, u: 'g', lim: OMS.grasa, ok: f.grasa <= OMS.grasa }
    ];
    items.forEach(i => {
      const li = document.createElement('li');
      li.className = i.ok ? 'ok' : 'warn';
      li.textContent = i.k + ': ' + i.v + i.u;
      list.appendChild(li);
    });
    wrap.appendChild(h);
    wrap.appendChild(list);
    cont.appendChild(wrap);
  });
}

function renderAlertas() {
  const t = totals();
  const ul = document.getElementById('alert-list');
  ul.innerHTML = '';
  if (t.fibra < OMS.fibra) {
    const li = document.createElement('li');
    li.className = 'alert';
    li.textContent = 'Te falta fibra hoy';
    ul.appendChild(li);
  }
  if (t.azucar > OMS.azucar) {
    const li = document.createElement('li');
    li.className = 'alert';
    li.textContent = 'Has excedido el azúcar recomendada';
    ul.appendChild(li);
  }
  if (t.sodio > OMS.sodio) {
    const li = document.createElement('li');
    li.className = 'alert';
    li.textContent = 'Has excedido el sodio recomendado';
    ul.appendChild(li);
  }
  if (t.grasa > OMS.grasa) {
    const li = document.createElement('li');
    li.className = 'alert';
    li.textContent = 'Has excedido la grasa saturada recomendada';
    ul.appendChild(li);
  }
  const protMeta = recommendedProtein();
  if (t.proteina < protMeta) {
    const faltan = Math.max(0, protMeta - t.proteina).toFixed(1);
    const li = document.createElement('li');
    li.className = 'alert';
    li.textContent = 'Te falta proteína hoy: ' + faltan + 'g';
    ul.appendChild(li);
  }
}

function renderCatalogos() {
  const cont = document.getElementById('catalogo');
  if (cont) {
    cont.innerHTML = '';
    CATALOGO.forEach(c => {
      const div = document.createElement('div');
      div.className = 'catalog-item';
      const t = document.createElement('div');
      t.className = 'catalog-title';
      t.textContent = c.nombre;
      const m = document.createElement('div');
      m.className = 'catalog-meta';
      m.textContent = 'Fibra ' + c.fibra + 'g · Azúcar ' + c.azucar + 'g · Sodio ' + c.sodio + 'mg · Grasa ' + c.grasa + 'g · Proteína ' + c.proteina + 'g';
      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.textContent = 'Agregar al día';
      btn.addEventListener('click', () => addFromCatalog(c.id));
      const btnD = document.createElement('button');
      btnD.className = 'btn accent';
      btnD.textContent = 'Agregar al desayuno';
      btnD.addEventListener('click', () => addFromCatalog(c.id, 'desayuno'));
      div.appendChild(t);
      div.appendChild(m);
      div.appendChild(btn);
      div.appendChild(btnD);
      cont.appendChild(div);
    });
  }
  const bq = document.getElementById('breakfast-quick');
  if (bq) {
    bq.innerHTML = '';
    ['avena', 'leche', 'manzana', 'yogur', 'pan', 'huevo'].forEach(id => {
      const c = CATALOGO.find(x => x.id === id);
      if (!c) return;
      const div = document.createElement('div');
      div.className = 'catalog-item';
      const t = document.createElement('div');
      t.className = 'catalog-title';
      t.textContent = c.nombre;
      const m = document.createElement('div');
      m.className = 'catalog-meta';
      m.textContent = 'Proteína ' + c.proteina + 'g · Fibra ' + c.fibra + 'g';
      const btn = document.createElement('button');
      btn.className = 'btn accent';
      btn.textContent = 'Agregar';
      btn.addEventListener('click', () => addFromCatalog(id, 'desayuno'));
      div.appendChild(t);
      div.appendChild(m);
      div.appendChild(btn);
      bq.appendChild(div);
    });
  }
}

function addFromCatalog(id, meal) {
  const c = CATALOGO.find(x => x.id === id);
  if (!c) return;
  const item = { nombre: c.nombre, fibra: c.fibra, azucar: c.azucar, sodio: c.sodio, grasa: c.grasa, proteina: c.proteina };
  if (meal) item.meal = meal;
  state.foods.push(item);
  saveState();
  renderFoods();
  renderTotals();
  renderComparacion();
  renderAlertas();
  renderBreakfast();
}

function renderBreakfast() {
  const ul = document.getElementById('breakfast-list');
  if (!ul) return;
  ul.innerHTML = '';
  state.foods
    .filter(f => f.meal === 'desayuno')
    .forEach((f, idx) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      const info = document.createElement('div');
      info.className = 'item-info';
      const prot = typeof f.proteina === 'number' ? f.proteina : 0;
      info.textContent = f.nombre + ' · proteína ' + prot + 'g · fibra ' + f.fibra + 'g';
      const del = document.createElement('button');
      del.className = 'btn ghost';
      del.textContent = 'Eliminar';
      del.addEventListener('click', () => {
        const i = state.foods.indexOf(f);
        if (i >= 0) {
          state.foods.splice(i, 1);
          saveState();
          renderBreakfast();
          renderFoods();
          renderTotals();
          renderAlertas();
        }
      });
      li.appendChild(info);
      li.appendChild(del);
      ul.appendChild(li);
    });
}

function renderMenu() {
  const cont = document.getElementById('menu-dia');
  if (!cont) return;
  cont.innerHTML = '';
  const menu = [
    { titulo: 'Desayuno', items: ['avena', 'leche', 'manzana'] },
    { titulo: 'Almuerzo', items: ['pan', 'huevo'] },
    { titulo: 'Cena', items: ['yogur', 'manzana'] }
  ];
  menu.forEach(m => {
    const div = document.createElement('div');
    div.className = 'menu-card';
    const t = document.createElement('div');
    t.className = 'menu-title';
    t.textContent = m.titulo;
    const list = document.createElement('div');
    list.className = 'catalog-meta';
    list.textContent = m.items.map(id => {
      const c = CATALOGO.find(x => x.id === id);
      return c ? c.nombre : id;
    }).join(' · ');
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.textContent = 'Agregar menú';
    btn.addEventListener('click', () => {
      m.items.forEach(id => {
        const meal = m.titulo.toLowerCase() === 'desayuno' ? 'desayuno' : undefined;
        addFromCatalog(id, meal);
      });
    });
    div.appendChild(t);
    div.appendChild(list);
    div.appendChild(btn);
    cont.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', init);
