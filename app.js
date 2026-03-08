const state = { user: null, foods: [] };
const OMS = { fibra: 25, azucar: 50, sodio: 2000, grasa: 20 };

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
    state.foods.push({ nombre, fibra, azucar, sodio, grasa });
    saveState();
    af.reset();
    renderFoods();
    renderTotals();
    renderComparacion();
    renderAlertas();
  });
}

function render() {
  renderRegistro();
  renderFoods();
  renderTotals();
  renderComparacion();
  renderAlertas();
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
    info.textContent = f.nombre + ' · fibra ' + f.fibra + 'g · azúcar ' + f.azucar + 'g · sodio ' + f.sodio + 'mg · grasa sat ' + f.grasa + 'g';
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
      return acc;
    },
    { fibra: 0, azucar: 0, sodio: 0, grasa: 0 }
  );
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
}

document.addEventListener('DOMContentLoaded', init);
