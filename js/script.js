const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};

const LAST_STAGE = 5;                 // la barra de progreso llega al 100% en la carta final
const ADVENT = 6;
const RING = 7;
let symbols = ['🧡'];
let curSection = 0;                  // símbolos de las partículas que flotan

$('nombre').textContent = CONFIG.paraQuien;

/* ---------- Navegación ---------- */
function go(n){
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  $('s'+n).classList.add('active');
  $('bar').style.width = (Math.min(n,LAST_STAGE)/LAST_STAGE*100)+'%';
  curSection = n; refreshHome();
  document.body.classList.toggle('theme-advent', n === ADVENT);
  document.body.classList.toggle('theme-night', n === 5);
  symbols = n === ADVENT ? ['❄','❅','✦','❆'] : n === 5 ? ['✦','✧','🧡'] : ['🧡'];
  scrollTo(0,0);
  if(n === 2) startBouquets();
  if(n === 3) startRasca();
  if(n === 5) startCarta();
  if(n === RING) startAnillo();
  if(n === ADVENT) renderAdvent();
  for(let i=0;i<14;i++) setTimeout(()=>spawn(Math.random()*innerWidth, innerHeight+10, true), i*60);
}
function ready(id){ $(id).hidden = false; }

$('s0').addEventListener('click', () => { if(!doneTour()) go(1); });
$('s0').addEventListener('keydown', e => { if(!doneTour() && (e.key==='Enter'||e.key===' ')) go(1); });
[1,2,3,4].forEach(i => $('n'+i).addEventListener('click', () => go(i+1)));
$('toAdvent2').addEventListener('click', () => go(RING));
$('backHome').addEventListener('click', () => go(0));
/* Inicio con accesos rápidos: solo después de haber hecho el recorrido completo */
const doneTour = () => !!store.get('carta_hecha');
function refreshHome(){
  const d = doneTour(), s0 = $('s0');
  $('quick').hidden = !d; $('introHint').style.display = d ? 'none' : '';
  s0.classList.toggle('done', d);
  if(d){ s0.removeAttribute('role'); s0.removeAttribute('tabindex'); } else { s0.setAttribute('role','button'); s0.setAttribute('tabindex','0'); }
  $('homeBtn').hidden = !(d && curSection !== 0);
}
const RESETS = [null, 'resetPruebas', 'resetBouquets', 'resetRasca', 'resetFrasco', 'resetCarta', null, 'resetAnillo'];
function enter(n){ const f = window[RESETS[n]]; if(f) f(); go(n); }
document.querySelectorAll('#quick [data-go]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); enter(+b.dataset.go); }));
$('replay').addEventListener('click', e => { e.stopPropagation(); [1,2,3,4,5,7].forEach(n => { const f = window[RESETS[n]]; if(f) f(); }); go(1); });
$('homeBtn').addEventListener('click', () => go(0));
refreshHome();

/* ---------- Pruebas de que me gustas (carta por carta) ---------- */
(function(){
  const P = CONFIG.razones.map(r => typeof r === 'string' ? {titulo:'', texto:r} : r);
  const total = P.length;
  // colores de cada sobre: [fondo, frente, solapa]
  const pal = [['#e592ab','#f6bfd0','#eca5ba'],['#a99be0','#cdc4f4','#bcb0ec'],['#f0a58a','#fbc9b6','#f6b69e'],
               ['#7fcfae','#b5ead2','#98dcc0'],['#e8c27a','#f8dfa8','#f0d090']];
  const stage = $('prStage'), env = $('envWrap'), paper = $('paper');
  let i = 0, opened = false, liked = 0, typing = null, finishFn = null, last = false;

  function dots(){
    $('prDots').innerHTML = P.map((_,k) => {
      const on = k < i || (k === i && opened);
      return `<span class="${on ? 'on' : ''}">${on ? '♥' : '♡'}</span>`;
    }).join('');
  }
  function summary(){
    const t = liked === total ? `Te gustaron las ${total}… sabía que íbamos a coincidir 😏`
                              : `Te gustaron ${liked} de ${total}… pero las ${total} son verdad 😌`;
    $('prSummary').textContent = t; $('prSummary').classList.add('show');
  }

  function show(n, animate){
    i = n; opened = false; last = n === total - 1;
    clearInterval(typing); typing = null; finishFn = null;
    const p = P[n], c = pal[n % pal.length];
    env.style.setProperty('--eb', c[0]); env.style.setProperty('--ef', c[1]); env.style.setProperty('--efl', c[2]);
    env.className = 'env-wrap'; paper.className = 'paper';
    stage.className = 'pr-stage' + (animate ? ' enter' : '');
    $('prStep').textContent = `Carta ${n+1} de ${total}`;
    $('prNum').textContent = `Prueba #${n+1}`;
    $('prTitle').textContent = p.titulo || '';
    $('prText').textContent = '';
    $('prHint').style.display = ''; $('prHint').textContent = 'Toca el sello para abrir 💌';
    $('prLike').hidden = true; $('prLike').classList.remove('liked'); $('prLike').textContent = '🧡 Me gusta esta';
    $('prNext').hidden = true;
    dots();
  }

  function open(){
    if(opened) return; opened = true;
    env.classList.add('open'); $('prHint').style.display = 'none'; dots();
    const r = env.getBoundingClientRect();
    for(let k=0;k<8;k++) setTimeout(() => spawn(r.left + r.width*(.3+Math.random()*.4), r.top + r.height*.4, false), k*60);
    setTimeout(() => { env.classList.add('gone'); paper.classList.add('show'); typeText(P[i].texto); }, 1250);
  }

  // la carta se va escribiendo sola (tocarla la completa de golpe)
  function typeText(full){
    const box = $('prText');
    box.innerHTML = '<span id="tv"></span><span id="th" style="visibility:hidden"></span>';
    const v = $('tv'), h = $('th'); h.textContent = full; let k = 0;
    finishFn = () => {
      clearInterval(typing); typing = null; finishFn = null;
      v.textContent = full; h.textContent = '';
      setTimeout(after, 350);
    };
    typing = setInterval(() => {
      k++; v.textContent = full.slice(0,k); h.textContent = full.slice(k);
      if(k >= full.length) finishFn();
    }, 30);
  }
  function after(){
    $('prLike').hidden = false;
    if(!last){ $('prNext').hidden = false; return; }
    ready('n1'); setTimeout(summary, 900);
  }

  env.addEventListener('click', open);
  $('seal').addEventListener('click', e => { e.stopPropagation(); open(); });
  paper.addEventListener('click', () => { if(finishFn) finishFn(); });
  $('prLike').addEventListener('click', () => {
    const b = $('prLike'); if(b.classList.contains('liked')) return;
    b.classList.add('liked'); b.textContent = '🧡 Guardada'; liked++; burst(b);
    if(last && $('prSummary').classList.contains('show')) summary();
  });
  $('prNext').addEventListener('click', () => {
    $('prNext').hidden = true; $('prLike').hidden = true;
    stage.classList.add('leave');
    setTimeout(() => show(i + 1, true), 450);
  });
  window.resetPruebas = function(){
    liked = 0; $('prSummary').textContent = ''; $('prSummary').classList.remove('show'); $('n1').hidden = true; show(0, false);
  };
  show(0, false);
})();

/* ---------- Ramos de rosas (uno a la vez) ---------- */
const ROSE_POS = { A:[150,90,1.25], B:[98,114,1.1], C:[202,114,1.1], D:[150,136,1.05],
                   E:[60,150,.95],  F:[240,150,.95], G:[104,162,.95], H:[196,162,.95] };
const ROSE_SETS = { 3:'ABC', 4:'ABCD', 5:'ABCEF', 6:'ABCDEF', 7:'ABCDEFG', 8:'ABCDEFGH' };

function roseSVG(x, y, s, gid, c, delay){
  const outer = [0,60,120,180,240,300].map(a =>
    `<ellipse cx="0" cy="-15" rx="13" ry="15" transform="rotate(${a})" fill="url(#${gid})" stroke="${c.oscura}" stroke-width=".9"/>`).join('');
  const mid = [30,102,174,246,318].map(a =>
    `<ellipse cx="0" cy="-9" rx="10" ry="12" transform="rotate(${a})" fill="url(#${gid})" stroke="${c.oscura}" stroke-width=".9"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="rose" style="transition-delay:${delay}s">${outer}${mid}
    <circle r="7.5" fill="url(#${gid})" stroke="${c.oscura}" stroke-width=".9"/>
    <path d="M0 0c1.5-2.5 5-1 4.2 2.3c-1 3.4-6 3.2-6.4-1c-.4-5 5.4-7 8.6-3.2" fill="none" stroke="${c.oscura}" stroke-width="1.2" stroke-linecap="round"/>
    <ellipse cx="-6" cy="-14" rx="5" ry="3" fill="#fff" opacity=".22" transform="rotate(-30 -6 -14)"/>
  </g></g>`;
}

function bouquetSVG(c, i){
  const gid = 'rg' + i;
  const n = Math.min(8, Math.max(3, c.rosas || 5));
  const pos = ROSE_SETS[n].split('').map(k => ROSE_POS[k]);
  const papel = c.papel || '#fdf1e3';
  const lazo  = c.lazo  || '#f5c542';

  // hojas en abanico
  const leaves = [-78,-52,-26,0,26,52,78].map((a,k) => {
    const rad = a*Math.PI/180, lx = 150 + Math.sin(rad)*92, ly = 168 - Math.cos(rad)*70;
    return `<g transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${a})">
      <ellipse rx="13" ry="34" fill="${k%2 ? '#237a4a' : '#2f9460'}"/><line y1="-30" y2="30" stroke="#1b5e38" stroke-width="1.2" opacity=".6"/></g>`;
  }).join('');

  // paniculata (florecitas blancas) opcional
  let gyp = '';
  if(c.paniculata){
    for(let k=0;k<22;k++){
      const a = (-85 + k*(170/21)) * Math.PI/180, r = 96 + (k%3)*12;
      const x = 150 + Math.sin(a)*r, y = 176 - Math.cos(a)*r*.82;
      gyp += `<line x1="150" y1="215" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#7bb68f" stroke-width="1" opacity=".5"/>
              <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.4 + (k%2)).toFixed(1)}" fill="#fff" opacity=".95"/>`;
    }
    gyp = `<g class="gyp">${gyp}</g>`;
  }

  const stems = pos.map(p => `<line x1="${p[0]}" y1="${p[1]}" x2="${150+(p[0]-150)*.1}" y2="270" stroke="#2a7d4f" stroke-width="4.5" stroke-linecap="round"/>`).join('');

  // botones cerrados (antes de abrir)
  const buds = pos.map(p => `<circle class="bud" cx="${p[0]}" cy="${p[1]}" r="${(10*p[2]).toFixed(1)}" fill="${c.oscura}"/>`).join('');

  // rosas dibujadas de atrás hacia adelante
  const order = pos.map((p,k) => ({p, k})).sort((a,b) => a.p[1] - b.p[1]);
  const roses = order.map((o,idx) => roseSVG(o.p[0], o.p[1], o.p[2]*1.18, gid, c, (idx*0.13).toFixed(2))).join('');

  const defs = `<defs><radialGradient id="${gid}" cx="50%" cy="58%" r="72%">
    <stop offset="0" stop-color="${c.clara}"/><stop offset=".55" stop-color="${c.rosa}"/><stop offset="1" stop-color="${c.oscura}"/></radialGradient></defs>`;

  const paper = `
    <g class="paper-l"><path d="M60 184 L162 208 L152 328 Q150 335 148 328 Z" fill="${papel}" stroke="rgba(0,0,0,.14)" stroke-width="1.2"/>
      <path d="M60 184 L162 208 L152 328 Q150 335 148 328 Z" fill="#000" opacity=".06"/></g>
    <g class="paper-r"><path d="M240 184 L138 208 L148 328 Q150 335 152 328 Z" fill="${papel}" stroke="rgba(0,0,0,.14)" stroke-width="1.2"/>
      <path d="M240 184 L138 208 L148 328 Q150 335 152 328 Z" fill="#fff" opacity=".28"/></g>`;

  const bow = `<g class="bow">
    <path d="M150 226 L132 268 L146 262 Z" fill="${lazo}" stroke="rgba(0,0,0,.15)"/>
    <path d="M150 226 L168 268 L154 262 Z" fill="${lazo}" stroke="rgba(0,0,0,.15)"/>
    <ellipse cx="126" cy="222" rx="23" ry="12" transform="rotate(-24 126 222)" fill="${lazo}" stroke="rgba(0,0,0,.18)"/>
    <ellipse cx="174" cy="222" rx="23" ry="12" transform="rotate(24 174 222)" fill="${lazo}" stroke="rgba(0,0,0,.18)"/>
    <circle cx="150" cy="228" r="9" fill="${lazo}" stroke="rgba(0,0,0,.22)"/></g>`;

  return `<svg viewBox="0 34 300 306" role="img" aria-label="Ramo de rosas">${defs}${leaves}${gyp}${stems}${buds}${roses}${paper}${bow}</svg>`;
}

let bqIndex = 0, bqBloomed = false, bqStarted = false;
function startBouquets(){ if(bqStarted) return; bqStarted = true; showBouquet(0, false); }
window.resetBouquets = function(){
  bqStarted = false; $('gardenMsg').textContent = ''; $('gardenMsg').classList.remove('show'); $('n2').hidden = true; $('bqNext').hidden = true;
};

function showBouquet(i, animate){
  const c = CONFIG.ramos[i], total = CONFIG.ramos.length;
  bqIndex = i; bqBloomed = false;
  $('bqStep').textContent = `Ramo ${i+1} de ${total}`;
  $('bqTitle').textContent = c.titulo || '';
  const v = $('bqView');
  v.className = 'bq-view' + (animate ? ' enter' : '');
  v.innerHTML = bouquetSVG(c, i) + '<div class="floor"></div>';
  $('bqTap').textContent = 'Toca el ramo para desenvolverlo 🎀';
  $('bqPhrase').textContent = c.texto || ''; $('bqPhrase').classList.remove('show');
  $('bqNote').textContent = c.nota || ''; $('bqNote').classList.remove('show');
  $('bqNote').style.display = c.nota ? '' : 'none';
  $('bqNext').hidden = true;
}

function bloomBouquet(){
  if(bqBloomed) return; bqBloomed = true;
  $('bqView').classList.add('bloomed');
  const r = $('bqView').getBoundingClientRect();
  for(let i=0;i<16;i++) setTimeout(() => spawn(r.left + r.width*(.25+Math.random()*.5), r.top + r.height*.4, false, ['🌹','🌸'][i%2]), 400 + i*50);
  setTimeout(() => { $('bqPhrase').classList.add('show'); $('bqNote').classList.add('show'); }, 1400);
  const last = bqIndex === CONFIG.ramos.length - 1;
  setTimeout(() => {
    if(!last){ $('bqNext').hidden = false; return; }
    $('gardenMsg').textContent = CONFIG.mensajeRamos; $('gardenMsg').classList.add('show');
    const petals = ['🌹','🌸','🌹','🌷'];
    for(let i=0;i<45;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true, petals[i%4]), i*60);
    ready('n2');
  }, 2600);
}
$('bqView').addEventListener('click', bloomBouquet);
$('bqView').addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); bloomBouquet(); } });
$('bqNext').addEventListener('click', () => {
  $('bqNext').hidden = true;
  $('bqView').classList.add('leave');
  setTimeout(() => showBouquet(bqIndex + 1, true), 450);
});

/* ---------- Retos de rasca (varios, de menos a más difícil) ---------- */
(function(){
  const R = CONFIG.rasca;
  const stageEl = $('rsStage');
  let started = false, stages = [], idx = 0, lintTimer = null;

  /* --- capa rascable reutilizable --- */
  function mkScratch(cv, o){
    const ctx = cv.getContext('2d'), r = cv.getBoundingClientRect();
    const w = cv.width = Math.round(r.width), h = cv.height = Math.round(r.height);
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#d7d7e2'); g.addColorStop(.5,'#a9a9bd'); g.addColorStop(1,'#c9c9d8');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 8;
    for(let x=-h; x<w; x+=34){ ctx.beginPath(); ctx.moveTo(x,h); ctx.lineTo(x+h,0); ctx.stroke(); }
    for(let i=0;i<Math.round(w*h/260);i++){
      ctx.fillStyle = `rgba(255,255,255,${(Math.random()*.55).toFixed(2)})`;
      ctx.fillRect(Math.random()*w, Math.random()*h, 1+Math.random()*2, 1+Math.random()*2);
    }
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.max(14, Math.min(20, w/12))}px Quicksand,sans-serif`;
    ctx.fillText(o.label || '✨ Rasca aquí ✨', w/2, h/2);

    let drawing = false, done = false, last = null, lastCheck = 0;
    const pos = e => { const b = cv.getBoundingClientRect(); return {x:e.clientX-b.left, y:e.clientY-b.top}; };
    function stroke(p){
      ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.lineWidth = o.brush*2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
    }
    function check(){
      const d = ctx.getImageData(0,0,w,h).data; let c = 0, t = 0;
      for(let i=3;i<d.length;i+=64){ t++; if(d[i] < 110) c++; }
      const pct = c/t;
      if(o.onProgress) o.onProgress(pct);
      if(pct >= o.threshold && !done){ done = true; cv.style.opacity = 0; cv.style.pointerEvents = 'none'; if(o.onDone) o.onDone(); }
    }
    cv.addEventListener('pointerdown', e => { if(done) return; drawing = true; last = null; cv.setPointerCapture(e.pointerId); stroke(pos(e)); });
    cv.addEventListener('pointermove', e => {
      if(!drawing || done) return; stroke(pos(e));
      const now = performance.now(); if(now - lastCheck > 140){ lastCheck = now; check(); }
    });
    const up = () => { if(!drawing) return; drawing = false; last = null; check(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    return { reveal(){ if(!done){ done = true; cv.style.opacity = 0; cv.style.pointerEvents = 'none'; } } };
  }

  const meterHTML = '<div class="rs-meter"><div></div></div><p class="rs-hint"></p>';
  function progressUI(el, th){
    const bar = el.querySelector('.rs-meter div'), hint = el.querySelector('.rs-hint');
    return p => {
      bar.style.width = Math.min(100, p/th*100) + '%';
      hint.textContent = p < .08 ? '' : p < th*.35 ? 'Sigue rascando…' : p < th*.7 ? 'Algo se ve ahí… 👀' : '¡Ya casi!';
    };
  }

  /* --- Reto 1: el secreto --- */
  function stageSecreto(el, done){
    el.innerHTML = `<div class="scratchbox"><span class="sb-msg"></span><canvas></canvas></div>${meterHTML}`;
    el.querySelector('.sb-msg').textContent = R.secreto;
    const th = .62;
    mkScratch(el.querySelector('canvas'), { brush:16, threshold:th, onProgress:progressUI(el, th), onDone:() => done(R.secretoExtra) });
  }

  /* --- Reto 2: la foto escondida --- */
  function stageFoto(el, done){
    el.innerHTML = `<div class="scratchbox photo"><img alt="" src="${esc(R.foto)}"><canvas></canvas></div>${meterHTML}`;
    const th = .66;
    mkScratch(el.querySelector('canvas'), { brush:17, threshold:th, label:'📸 ¿Quién será?', onProgress:progressUI(el, th), onDone:() => done(R.fotoTexto) });
  }

  /* --- Reto 3: el boleto premiado --- */
  function stageBoleto(el, done){
    const B = R.boleto || {}, need = B.corazones || 3, tries = B.intentos || 5;
    let attempt = 0, finished = false;
    el.innerHTML = `<div class="ticket"><div class="t-head">🎟️ Boleto premiado</div>
      <div class="t-info"><span id="tL"></span><span id="tH"></span></div><div class="t-grid" id="tG"></div><p class="t-foot" id="tF"></p></div>`;
    const decoys = ['🌹','🍫','⭐','🎁','🍀','🎈','🍓'];
    function ticket(){
      attempt++;
      const K = attempt === 1 ? 4 : attempt === 2 ? 6 : 8;           // cada boleto nuevo es más generoso
      const sym = Array.from({length:9}, () => decoys[Math.floor(Math.random()*decoys.length)]);
      [...Array(9).keys()].sort(() => Math.random() - .5).slice(0, K).forEach(i => sym[i] = '🧡');
      let used = 0, hearts = 0; const tiles = [], grid = $('tG'); grid.innerHTML = ''; $('tF').textContent = '';
      const info = () => { $('tL').textContent = `Raspaditas: ${tries - used}`; $('tH').textContent = `🧡 ${hearts} / ${need}`; };
      const lockRest = () => tiles.forEach(t => { if(!t.classList.contains('done')) t.classList.add('locked'); });
      info();
      for(let i=0;i<9;i++){
        const t = document.createElement('div'); t.className = 't-tile';
        t.innerHTML = `<span>${sym[i]}</span><canvas></canvas>`; grid.appendChild(t); tiles.push(t);
        mkScratch(t.querySelector('canvas'), { brush:11, threshold:.3, label:'?', onDone:() => {
          t.classList.add('done'); used++;
          if(sym[i] === '🧡'){ hearts++; t.classList.add('heart'); burst(t, '🧡'); }
          info();
          if(finished) return;
          if(hearts >= need){ finished = true; lockRest(); $('tF').textContent = '¡Boleto premiado! 🎉'; done(B.premio); }
          else if(used >= tries){ lockRest(); $('tF').textContent = 'Casi 😅 Te regalo otro boleto…'; setTimeout(ticket, 2200); }
        }});
      }
    }
    ticket();
  }

  /* --- Reto 4: buscar palabras en la oscuridad --- */
  function stageLinterna(el, done){
    const L = R.linterna || {}, words = L.palabras || [], n = words.length;
    el.innerHTML = `<div class="dark-box"><div class="dk-words"></div><canvas></canvas></div>
      <p class="dk-phrase"></p><p class="rs-hint dk-count"></p>`;
    const box = el.querySelector('.dark-box'), wl = el.querySelector('.dk-words'), cv = box.querySelector('canvas');
    const ctx = cv.getContext('2d'), r0 = box.getBoundingClientRect();
    cv.width = Math.round(r0.width); cv.height = Math.round(r0.height);
    const cols = 3, rows = Math.max(1, Math.ceil(n/cols));
    const cells = [...Array(cols*rows).keys()].sort(() => Math.random() - .5).slice(0, n);
    const els = words.map((wd, i) => {
      const s = document.createElement('span'), c = cells[i];
      s.className = 'dk-word'; s.textContent = wd;
      s.style.left = (((c % cols) + .5)/cols*100 + (Math.random()-.5)*8) + '%';
      s.style.top  = ((Math.floor(c/cols) + .5)/rows*100 + (Math.random()-.5)*10) + '%';
      s.style.transform = `translate(-50%,-50%) rotate(${((Math.random()-.5)*16).toFixed(1)}deg)`;
      wl.appendChild(s); return s;
    });
    const found = Array(n).fill(false), dwell = Array(n).fill(0);
    const RAD = Math.max(50, Math.min(72, r0.width/6));
    let spot = null, timer = null, finished = false;

    function phrase(){
      el.querySelector('.dk-phrase').textContent = words.map((w,i) => found[i] ? w : '_'.repeat(Math.max(3, w.length))).join(' ');
      el.querySelector('.dk-count').textContent = `Palabras encontradas: ${found.filter(Boolean).length} / ${n}`;
    }
    function paint(){
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0,0,cv.width,cv.height);
      ctx.fillStyle = 'rgba(6,3,16,.985)'; ctx.fillRect(0,0,cv.width,cv.height);
      if(spot){
        ctx.globalCompositeOperation = 'destination-out';
        const g = ctx.createRadialGradient(spot.x,spot.y,0,spot.x,spot.y,RAD);
        g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(.6,'rgba(0,0,0,.92)'); g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(spot.x, spot.y, RAD, 0, 7); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `700 ${Math.max(14, Math.min(19, cv.width/18))}px Quicksand,sans-serif`;
        ctx.fillText('🔦 Mueve tu dedo (o el mouse) para iluminar', cv.width/2, cv.height/2);
      }
    }
    function tick(){
      if(!spot || finished) return;
      const b = box.getBoundingClientRect();
      els.forEach((e,i) => {
        if(found[i]) return;
        const wb = e.getBoundingClientRect();
        const dx = wb.left + wb.width/2 - b.left - spot.x, dy = wb.top + wb.height/2 - b.top - spot.y;
        if(Math.hypot(dx, dy) < RAD*.62){
          dwell[i] += 60; e.classList.add('near');
          if(dwell[i] >= 420){ found[i] = true; e.classList.add('found'); e.classList.remove('near'); burst(e, '✨'); phrase(); }
        } else { dwell[i] = Math.max(0, dwell[i] - 30); e.classList.remove('near'); }
      });
      if(found.every(Boolean)) finish();
    }
    function finish(){
      finished = true; clearInterval(timer);
      cv.style.opacity = 0; cv.style.pointerEvents = 'none';
      done(L.mensaje);
    }
    const move = e => { const b = cv.getBoundingClientRect(); spot = {x:e.clientX-b.left, y:e.clientY-b.top-(e.pointerType === 'touch' ? 48 : 0)}; paint(); };
    const off = () => { spot = null; paint(); };
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); move(e); });
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', off); cv.addEventListener('pointerup', off); cv.addEventListener('pointercancel', off);
    timer = setInterval(tick, 60); lintTimer = timer;
    phrase(); paint();
  }

  /* --- control de los retos --- */
  function show(n, animate){
    idx = n; const s = stages[n];
    $('rsStep').textContent = `Reto ${n+1} de ${stages.length}`;
    $('rsTitle').textContent = s.titulo; $('rsSub').textContent = s.sub;
    $('rsMsg').textContent = ''; $('rsMsg').classList.remove('show'); $('rsNext').hidden = true;
    stageEl.className = 'rs-stage' + (animate ? ' enter' : ''); stageEl.innerHTML = '';
    let called = false;
    s.build(stageEl, msg => {
      if(called) return; called = true;
      if(msg){ $('rsMsg').textContent = msg; $('rsMsg').classList.add('show'); }
      for(let i=0;i<24;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*50);
      setTimeout(() => { if(idx < stages.length - 1) $('rsNext').hidden = false; else ready('n3'); }, 1300);
    });
  }
  $('rsNext').addEventListener('click', () => {
    $('rsNext').hidden = true; stageEl.classList.add('leave');
    setTimeout(() => show(idx + 1, true), 450);
  });

  window.resetRasca = function(){
    clearInterval(lintTimer); started = false; stages = []; idx = 0; stageEl.innerHTML = '';
    $('rsMsg').textContent = ''; $('rsMsg').classList.remove('show'); $('rsNext').hidden = true; $('n3').hidden = true;
  };

  window.startRasca = function(){
    if(started) return; started = true;
    const list = [{ titulo:'Un secreto mal guardado', sub:'Rasca con el dedo (o el mouse). Habrá que insistir un poquito…', build:stageSecreto }];
    const finish = () => {
      list.push({ titulo:'Boleto premiado', sub:`Tienes ${(R.boleto && R.boleto.intentos) || 5} raspaditas. Encuentra ${(R.boleto && R.boleto.corazones) || 3} 🧡 y ganas.`, build:stageBoleto });
      list.push({ titulo:'Busca en la oscuridad', sub:`Mueve la linterna y encuentra las ${(R.linterna && R.linterna.palabras || []).length} palabras escondidas.`, build:stageLinterna });
      stages = list; show(0, false);
    };
    if(R.foto){
      const im = new Image();
      im.onload  = () => { list.push({ titulo:'Alguien se esconde aquí', sub:'Hay una foto debajo. Rasca con calma para verla entera.', build:stageFoto }); finish(); };
      im.onerror = finish;
      im.src = R.foto;
    } else finish();
  };
})();

/* ---------- Frasco de mensajes ---------- */
(function(){
  const F = CONFIG.frasco, M = F.mensajes, total = M.length;
  const minimo = Math.min(F.minimo || 5, total);
  $('jarTitle').textContent = F.titulo;
  $('jarSub').textContent = F.subtitulo;

  // posiciones fijas de las notitas dentro del frasco (de abajo hacia arriba)
  const colors = ['#ffd6e0','#fff1b8','#d6f0ff','#e4d6ff','#d6ffe4','#ffe0c2'];
  const SLOTS = 52; let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const slots = [];
  for(let i=0;i<SLOTS;i++){
    const row = Math.floor(i/4);
    slots.push({ x: 62 + rnd()*116, y: 290 - row*15 - rnd()*5, r: (rnd()-.5)*90, c: colors[i % colors.length] });
  }
  const body = 'M62 48 Q62 54 54 62 Q38 76 38 102 L38 268 Q38 300 68 300 L172 300 Q202 300 202 268 L202 102 Q202 76 186 62 Q178 54 178 48 Z';
  const notes = slots.map((s,i) => `<g class="n" data-i="${i}" transform="translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.r.toFixed(1)})">
      <rect x="-23" y="-14" width="46" height="28" rx="3" fill="${s.c}" stroke="rgba(0,0,0,.14)"/>
      <line x1="-15" y1="-5" x2="15" y2="-5" stroke="rgba(0,0,0,.2)"/><line x1="-15" y1="2" x2="9" y2="2" stroke="rgba(0,0,0,.2)"/>
      <path d="M12 7 l-2.5-2.6a1.7 1.7 0 0 1 2.5-2.2 1.7 1.7 0 0 1 2.5 2.2z" fill="#e0245e" opacity=".8"/></g>`).join('');

  $('jar').innerHTML = `<svg viewBox="0 0 240 320" role="img" aria-label="Frasco con notas">
    <defs><clipPath id="jc"><path d="${body}"/></clipPath>
      <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>
      <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6d27f"/><stop offset=".5" stop-color="#e8b94a"/><stop offset="1" stop-color="#b8841f"/></linearGradient></defs>
    <g clip-path="url(#jc)">${notes}</g>
    <path d="${body}" fill="url(#glass)" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M52 100 Q50 150 52 250" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".28"/>
    <path d="M190 110 Q192 150 190 200" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".22"/>
    <rect x="66" y="18" width="108" height="30" rx="8" fill="url(#gold)" stroke="#8a6414" stroke-width="1.5"/>
    <g stroke="#8a6414" stroke-width="1" opacity=".5"><line x1="84" y1="22" x2="84" y2="44"/><line x1="100" y1="22" x2="100" y2="44"/><line x1="116" y1="22" x2="116" y2="44"/><line x1="132" y1="22" x2="132" y2="44"/><line x1="148" y1="22" x2="148" y2="44"/><line x1="164" y1="22" x2="164" y2="44"/></g>
    <path d="M60 56 Q120 70 180 56" fill="none" stroke="#c9a46a" stroke-width="5" stroke-linecap="round"/>
    <g transform="rotate(-4 120 190)"><rect x="66" y="160" width="108" height="64" rx="8" fill="#fff8e8" stroke="#d9c08a" stroke-width="1.5"/>
      <text x="120" y="190" text-anchor="middle" font-family="Dancing Script,cursive" font-size="26" fill="#c4243f" font-weight="700">Para ti</text>
      <text x="120" y="212" text-anchor="middle" font-size="16">🧡</text></g>
  </svg><div class="floor"></div>`;

  const els = [...$('jar').querySelectorAll('.n')];
  const bag = M.map((_, i) => i).sort(() => Math.random() - .5);
  let drawn = 0, busy = false;

  function update(){
    const left = bag.length, show = Math.ceil(left/total * SLOTS);
    els.forEach((e,i) => e.classList.toggle('gone', i >= show));
    $('jarCount').textContent = left ? `${drawn} de ${total} notas sacadas` : 'El frasco quedó vacío… pero siempre puedo rellenarlo 😉';
    if(!left) $('jarTap').style.display = 'none';
  }
  update();

  function draw(){
    if(busy) return;
    if(!bag.length){ toast('Ya no quedan notas, las sacaste todas 💌'); return; }
    busy = true;
    $('jar').classList.add('shake');
    setTimeout(() => {
      $('jar').classList.remove('shake');
      const m = M[bag.pop()]; drawn++;
      $('noteWhen').textContent = m.cuando ? 'Para cuando… ' + m.cuando : 'Una nota para ti';
      $('noteText').textContent = m.texto;
      $('noteFrom').textContent = '— ' + CONFIG.deParte;
      const card = $('noteCard'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
      $('noteOverlay').hidden = false; $('noteClose').focus();
      for(let i=0;i<14;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*45);
      update();
    }, 650);
  }
  function close(){
    $('noteOverlay').hidden = true; busy = false;
    if(drawn >= minimo) ready('n4');
  }
  window.resetFrasco = function(){
    bag.length = 0; M.map((_, i) => i).sort(() => Math.random() - .5).forEach(i => bag.push(i));
    drawn = 0; busy = false; $('jarTap').style.display = ''; $('noteOverlay').hidden = true; $('n4').hidden = true; update();
  };
  $('jar').addEventListener('click', draw);
  $('noteClose').addEventListener('click', close);
  $('noteOverlay').addEventListener('click', e => { if(e.target.id === 'noteOverlay') close(); });
  addEventListener('keydown', e => { if(e.key === 'Escape' && !$('noteOverlay').hidden) close(); });
})();

/* ---------- Carta final: un libro que se abre, en una noche con velas ---------- */
(function(){
  const C = CONFIG.carta;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const book = $('book'), slotL = $('slotL'), slotR = $('slotR'), leaf = $('leaf'), leafF = $('leafF'), leafB = $('leafB');
  const coverLeaf = $('coverLeaf'), coverF = $('coverF'), coverB = $('coverB');
  const daysSince = () => { const d = new Date((CONFIG.fechaReencuentro || '') + 'T00:00:00'); return isNaN(d) ? 0 : Math.max(0, Math.floor((Date.now() - d)/86400000)); };
  const sub = s => String(s).replace(/\{\{dias\}\}/g, daysSince());
  const hojas = C.paginas.map(p => ({ titulo:p.titulo, texto:sub(p.texto) }));
  const cierre = { titulo:C.cierre.titulo, texto:sub(C.cierre.texto), cierre:true };
  let pages = [], spreads = [], layout = '', cur = 0, top = -1, tk = 0, busy = false, started = false, shut = true;
  let seenTap = 0, asked = false, psOpen = false, psTk = 0;
  const mounted = {};

  /* Sintaxis dentro del texto de cada hoja:
       {texto mal|texto bien}        → lo escribe, lo tacha y lo corrige
       [palabra|recuerdo]            → palabra subrayada que al tocarla abre un recuerdo
       [palabra|recuerdo|img/x.jpg]  → igual, con una foto                                  */
  const RX = /\{([^{}|]+)\|([^{}]+)\}|\[([^\[\]|]+)\|([^\[\]|]+)(?:\|([^\[\]]+))?\]/g;
  function parse(t){
    const out = []; let last = 0, m; RX.lastIndex = 0;
    while((m = RX.exec(t))){
      if(m.index > last) out.push({k:'t', s:t.slice(last, m.index)});
      if(m[1] !== undefined) out.push({k:'fix', a:m[1], b:m[2]});
      else out.push({k:'tap', w:m[3], mem:m[4], img:m[5] || ''});
      last = RX.lastIndex;
    }
    if(last < t.length) out.push({k:'t', s:t.slice(last)});
    return out;
  }
  const add = (el, ch) => { if(el.nodeType === 3) el.data += ch; else el.textContent += ch; };
  function tapEl(tok){
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tapword';
    b.addEventListener('click', e => { e.stopPropagation(); openMem(tok, b); });
    return b;
  }
  function renderFull(body, i){
    body.textContent = '';
    for(const t of parse(pages[i].texto)){
      if(t.k === 't') body.append(document.createTextNode(t.s));
      else if(t.k === 'fix'){
        const sp = document.createElement('span'); sp.className = 'wrong struck'; sp.textContent = t.a;
        body.append(sp, document.createTextNode(' ' + t.b));
      } else { const b = tapEl(t); b.textContent = t.w; body.append(b); }
    }
  }
  async function typePage(my, el, i){
    const body = el.querySelector('.pg-body'); body.textContent = '';
    let node = document.createTextNode(''); body.append(node);
    const typeInto = async (t, txt) => {
      for(const ch of txt){
        if(my !== tk) return false;
        add(t, ch);
        await sleep(/[.!?…]/.test(ch) ? 170 : /[,;:]/.test(ch) ? 90 : 20);
      }
      return my === tk;
    };
    for(const t of parse(pages[i].texto)){
      if(t.k === 't'){ if(!await typeInto(node, t.s)) return false; }
      else if(t.k === 'fix'){
        const sp = document.createElement('span'); sp.className = 'wrong'; body.append(sp);
        if(!await typeInto(sp, t.a)) return false;
        await sleep(550); if(my !== tk) return false;
        sp.classList.add('struck');
        await sleep(380); if(my !== tk) return false;
        node = document.createTextNode(' '); body.append(node);
        if(!await typeInto(node, t.b)) return false;
      } else {
        const b = tapEl(t); body.append(b);
        if(!await typeInto(b, t.w)) return false;
        node = document.createTextNode(''); body.append(node);
      }
    }
    return my === tk;
  }

  /* --- estructura del libro (dos páginas en pantallas anchas, una en celular) --- */
  function build(){
    const two = innerWidth >= 760;
    pages = [...hojas, cierre];
    if(two && pages.length % 2) pages.push({ relleno:true });
    if(!two) pages = pages.filter(p => !p.relleno);
    const P = pages.length; spreads = [];
    if(two){
      spreads.push({ L:'cover', R:0 });
      for(let k=1; k<P/2; k++) spreads.push({ L:2*k-1, R:2*k });
      spreads.push({ L:P-1, R:'back' });
    } else {
      pages.forEach((_, i) => spreads.push({ L:null, R:i }));
      spreads.push({ L:null, R:'back' });
    }
    layout = two ? 'two' : 'one'; book.classList.toggle('two', two);
  }
  const pagesOf = sp => [sp.L, sp.R].filter(x => typeof x === 'number' && !pages[x].relleno);
  const allTyped = sp => pagesOf(sp).every(i => i <= top);

  function pageEl(i, full){
    const pg = document.createElement('div'); pg.className = 'pg';
    const p = pages[i]; if(p.relleno) return pg;
    pg.dataset.i = i;
    if(i === 0){ const g = document.createElement('div'); g.className = 'pg-greet'; g.textContent = C.saludo; pg.append(g); }
    const h = document.createElement('div'); h.className = 'pg-head'; h.textContent = p.titulo || ''; pg.append(h);
    const b = document.createElement('div'); b.className = 'pg-body'; pg.append(b);
    if(p.cierre){
      const s = document.createElement('div'); s.className = 'pg-sign'; s.textContent = C.firma + ', ' + CONFIG.deParte + ' 🧡';
      const q = document.createElement('div'); q.className = 'pg-pista'; q.textContent = C.cierre.pista || '';
      pg.append(s, q);
    }
    if(full){ renderFull(b, i); pg.classList.add('done'); }
    return pg;
  }
  function fitPage(pg){
    const i = +pg.dataset.i; if(isNaN(i)) return;
    const body = pg.querySelector('.pg-body'); if(!body) return;
    const wasDone = pg.classList.contains('done');
    renderFull(body, i); body.style.fontSize = '';
    let guard = 0;
    while(pg.scrollHeight > pg.clientHeight + 1 && guard++ < 16){
      body.style.fontSize = (parseFloat(getComputedStyle(body).fontSize) - 1) + 'px';
    }
    if(!wasDone) body.textContent = '';
  }
  const fitAll = boxes => boxes.forEach(b => b.querySelectorAll('.pg[data-i]').forEach(fitPage));
  function coverEl(){
    const d = document.createElement('div'); d.className = 'pg pg-cover';
    d.innerHTML = '<i>✦</i><small>Este libro es para</small><b></b><i>✦</i>';
    d.querySelector('b').textContent = CONFIG.paraQuien; return d;
  }
  function backEl(){
    const d = document.createElement('div'); d.className = 'pg pg-back';
    d.innerHTML = '<i>✦</i><span class="fin">Fin</span><button class="pocket" type="button" aria-label="Un bolsillo escondido en la contracubierta"></button>';
    d.querySelector('.pocket').addEventListener('click', e => { e.stopPropagation(); openPS(); });
    return d;
  }
  function content(x){
    if(x == null){ const d = document.createElement('div'); d.className = 'pg'; return d; }
    if(x === 'cover') return coverEl();
    if(x === 'back') return backEl();
    return pageEl(x, x <= top || pages[x].relleno);
  }

  /* --- estado, avisos y navegación --- */
  const hintText = t => { $('ltHint').textContent = t; };
  function hint(){
    const taps = pagesOf(spreads[cur]).some(i => parse(pages[i].texto || '').some(t => t.k === 'tap'));
    if(taps && !seenTap) return hintText('Toca las palabras subrayadas ✨');
    hintText(cur < spreads.length - 1 ? 'Pasa la página ▶ (o desliza)' : '');
  }
  function dots(){
    $('ltDots').innerHTML = spreads.map((_, k) => `<span class="${k <= cur ? 'on' : ''}">${k <= cur ? '♥' : '♡'}</span>`).join('');
  }
  function nav(){
    $('ltPrev').disabled = busy || shut || cur === 0;
    $('ltNext').disabled = busy || shut || cur >= spreads.length - 1 || !allTyped(spreads[cur]);
  }
  function typed(i){
    top = Math.max(top, i);
    if(mounted[i]) mounted[i].classList.add('done');
    if(pages[i].cierre && !asked) $('closeBook').hidden = false;
    nav();
  }
  function afterSpread(){ nav(); hint(); }

  async function mount(n, wait){
    cur = n; const sp = spreads[n];
    slotL.replaceChildren(); slotR.replaceChildren();
    for(const k in mounted) delete mounted[k];
    for(const [k, slot] of [['L', slotL], ['R', slotR]]){
      const x = sp[k]; if(x == null) continue;
      const el = content(x); slot.append(el); if(typeof x === 'number') mounted[x] = el;
    }
    fitAll([slotL, slotR]);
    dots(); nav();
    const todo = pagesOf(sp).filter(i => i > top);
    if(!todo.length){ afterSpread(); return; }
    hintText('Toca la página para saltar la escritura');
    const my = ++tk;
    if(wait){ await sleep(wait); if(my !== tk) return; }
    for(const i of todo){
      const ok = await typePage(my, mounted[i], i);
      if(!ok) return;
      typed(i);
    }
    afterSpread();
  }
  function skipAll(){
    const sp = spreads[cur]; tk++;
    pagesOf(sp).forEach(i => {
      if(i > top && mounted[i]){ renderFull(mounted[i].querySelector('.pg-body'), i); typed(i); }
    });
    afterSpread();
  }

  /* --- el giro de página --- */
  async function turn(n){
    if(shut || busy || n < 0 || n >= spreads.length || n === cur) return;
    const fwd = n > cur;
    if(fwd && !allTyped(spreads[cur])) return;
    busy = true; tk++; nav();
    const a = spreads[cur], b = spreads[n], two = layout === 'two';
    leafF.replaceChildren(content(fwd ? a.R : b.R));
    leafB.replaceChildren(content(fwd ? b.L : a.L));
    if(two) slotL.replaceChildren(content(fwd ? a.L : b.L));
    slotR.replaceChildren(content(fwd ? b.R : a.R));
    for(const k in mounted) delete mounted[k];
    leaf.style.transition = 'none'; leaf.style.display = 'block';
    leaf.style.transform = fwd ? 'rotateY(0deg)' : 'rotateY(-180deg)';
    fitAll([leafF, leafB, slotL, slotR]);
    void leaf.offsetWidth;
    leaf.classList.add('turning');
    leaf.style.transition = 'transform 1.2s cubic-bezier(.45,.05,.25,1)';
    leaf.style.transform = fwd ? 'rotateY(-180deg)' : 'rotateY(0deg)';
    await sleep(1260);
    leaf.classList.remove('turning'); leaf.style.display = 'none';
    busy = false;
    mount(n);
  }
  $('ltPrev').addEventListener('click', () => turn(cur - 1));
  $('ltNext').addEventListener('click', () => turn(cur + 1));
  const pagesBox = $('bookPages');
  pagesBox.addEventListener('click', () => {
    if(!shut && !busy && pagesOf(spreads[cur]).some(i => i > top)) skipAll();
  });
  let sx = null;
  pagesBox.addEventListener('pointerdown', e => { sx = e.target.closest('.tapword, .pocket') ? null : e.clientX; });
  pagesBox.addEventListener('pointerup', e => {
    if(sx === null) return; const dx = e.clientX - sx; sx = null;
    if(dx < -60) turn(cur + 1); else if(dx > 60) turn(cur - 1);
  });

  /* --- recuerdos tocables y el secreto del final --- */
  function showMem(word, text, img){
    $('memWord').textContent = word; $('memText').textContent = text;
    const im = $('memImg');
    if(img){ im.hidden = false; im.onerror = () => { im.hidden = true; }; im.src = img; } else im.hidden = true;
    const card = $('memCard'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    $('memOverlay').hidden = false; $('memClose').focus();
    for(let i=0;i<10;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*45);
  }
  function openMem(tok, btn){
    showMem(tok.w, tok.mem, tok.img);
    if(!btn.classList.contains('seen')){ btn.classList.add('seen'); seenTap++; }
    hint();
  }
  async function openPS(){
    if(psOpen) return; psOpen = true;
    showMem('P.D.', '', '');
    const my = ++psTk, el = $('memText'); el.textContent = '';
    for(const ch of (C.ps && C.ps.texto) || ''){ if(my !== psTk) return; el.textContent += ch; await sleep(26); }
  }
  function closeMem(){
    $('memOverlay').hidden = true;
    if(psOpen){ psOpen = false; psTk++; showQuestion(); }
  }
  $('memClose').addEventListener('click', closeMem);
  $('memOverlay').addEventListener('click', e => { if(e.target.id === 'memOverlay') closeMem(); });
  addEventListener('keydown', e => { if(e.key === 'Escape' && !$('memOverlay').hidden) closeMem(); });

  function showQuestion(){
    asked = true; $('closeBook').hidden = true; $('question').hidden = false;
    setTimeout(() => $('question').scrollIntoView({behavior:'smooth', block:'center'}), 350);
  }
  $('closeBook').addEventListener('click', () => { book.classList.add('closed'); showQuestion(); });

  /* --- la noche: velas, luciérnagas, farolitos y luces --- */
  function buildNight(){
    const cols = ['#ff4d6d','#ffd166','#4cd98a','#6ec1ff','#ff9ff3'], g = $('garland'); g.textContent = '';
    for(let i=0;i<16;i++){
      const b = document.createElement('span'); b.className = 'bulb';
      b.style.color = cols[i % cols.length]; b.style.animationDelay = (i*0.27) + 's'; g.appendChild(b);
    }
    const dyn = $('nightDyn'); dyn.textContent = '';
    for(let i=0;i<14;i++){
      const f = document.createElement('span'); f.className = 'ff';
      f.style.left = (4 + Math.random()*92) + '%'; f.style.top = (22 + Math.random()*70) + '%';
      f.style.setProperty('--dx', ((Math.random()-.5)*110).toFixed(0) + 'px'); f.style.setProperty('--dy', ((Math.random()-.5)*120).toFixed(0) + 'px');
      f.style.animationDelay = (-Math.random()*12).toFixed(1) + 's,' + (-Math.random()*3).toFixed(1) + 's';
      dyn.appendChild(f);
    }
    for(let i=0;i<4;i++){
      const l = document.createElement('div'); l.className = 'lantern';
      l.style.left = (8 + i*24 + Math.random()*10) + '%'; l.style.setProperty('--sx', ((Math.random()-.5)*120).toFixed(0) + 'px');
      l.style.animationDuration = (34 + i*7) + 's'; l.style.animationDelay = (-i*9) + 's'; dyn.appendChild(l);
    }
    const candles = [
      { s:'left', o:'1.5%', h:58 }, { s:'left', o:'5.5%', h:104 }, { s:'left', o:'9.5%', h:78, x:1 },
      { s:'right', o:'2%', h:90 }, { s:'right', o:'6%', h:62, x:1 }, { s:'right', o:'10%', h:80, x:1 }
    ];
    candles.forEach((c, k) => {
      const d = document.createElement('div'); d.className = 'candle' + (c.x ? ' c-extra' : '');
      d.style[c.s] = c.o; d.style.setProperty('--h', c.h + 'px');
      d.innerHTML = '<div class="glow"></div><div class="flame"></div><div class="wick"></div><div class="wax"></div>';
      d.querySelector('.flame').style.animationDelay = (-k*0.37) + 's'; d.querySelector('.glow').style.animationDelay = (-k*0.5) + 's';
      dyn.appendChild(d);
    });
    
  }

  addEventListener('resize', () => {
    if(!started || busy || shut) return;
    const two = innerWidth >= 760 ? 'two' : 'one';
    if(two === layout) return;
    const page = Math.max(0, top); build();
    const n = spreads.findIndex(sp => sp.L === page || sp.R === page);
    mount(n < 0 ? 0 : n);
  });

  /* música opcional (solo aparece si pones un archivo en config.js) */
  if(C.musica){
    const audio = new Audio(C.musica); audio.loop = true; audio.volume = .6;
    const btn = $('musicBtn'); btn.hidden = false; btn.textContent = '🔇';
    btn.addEventListener('click', () => {
      if(audio.paused){ audio.play().then(() => { btn.classList.add('on'); btn.textContent = '🎵'; }).catch(() => {}); }
      else { audio.pause(); btn.classList.remove('on'); btn.textContent = '🔇'; }
    });
  }

  function setupCover(){
    coverF.replaceChildren(); coverB.replaceChildren();
    const f = document.createElement('div'); f.className = 'pg pg-cover';
    f.innerHTML = '<i>✦</i><small>Una carta para</small><b></b><i>✦</i><span class="tapme">Toca para abrir 📖</span>';
    f.querySelector('b').textContent = CONFIG.paraQuien;
    coverF.append(f); coverB.append(coverEl());
  }
  async function openBook(){
    if(!shut || busy) return; busy = true; hintText('');
    book.classList.add('opening'); book.classList.remove('shut');
    coverLeaf.style.transition = 'transform 1.5s cubic-bezier(.45,.05,.25,1)';
    coverLeaf.style.transform = 'rotateY(-180deg)';
    for(let i=0;i<22;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*55);
    mount(0, 1500);                       // se monta ya; empieza a escribir cuando termina el giro
    await sleep(1500);
    book.classList.remove('opening'); coverLeaf.style.display = 'none';
    shut = false; busy = false; nav();
  }
  coverLeaf.addEventListener('click', openBook);
  coverLeaf.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openBook(); } });

  window.startCarta = function(){
    if(started) return; started = true;
    build(); buildNight(); setupCover();
    book.classList.add('shut');
    hintText('Toca el libro para abrirlo 📖'); dots(); nav();
  };

  /* la pregunta final */
  $('qtext').textContent = CONFIG.pregunta;
  $('yes').textContent = CONFIG.textoSi; $('no').textContent = CONFIG.textoNo;
  const no = $('no'), yes = $('yes'); let tries = 0;
  function dodge(){
    tries++;
    no.style.position = 'fixed';
    const w = no.offsetWidth || 110, h = no.offsetHeight || 50;
    no.style.left = Math.max(8, Math.random()*(innerWidth - w - 16)) + 'px';
    no.style.top  = Math.max(8, Math.random()*(innerHeight - h - 16)) + 'px';
    yes.style.transform = `scale(${Math.min(1 + tries*.1, 1.7)})`;
  }
  no.addEventListener('pointerenter', dodge);
  no.addEventListener('pointerdown', e => { e.preventDefault(); dodge(); });
  no.addEventListener('click', e => { e.preventDefault(); dodge(); });
  yes.addEventListener('click', () => {
    no.style.display = 'none'; yes.style.display = 'none';
    $('happy').style.display = 'block'; $('happy').textContent = CONFIG.respuestaSi;
    ready('toAdvent2'); store.set('carta_hecha', '1');
    for(let i=0;i<120;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*35);
    refreshHome();
  });

  window.resetCarta = function(){
    tk++; psTk++; top = -1; cur = 0; busy = false; shut = true; asked = false; psOpen = false; seenTap = 0; started = false; tries = 0;
    book.classList.remove('closed','opening'); book.classList.add('shut');
    coverLeaf.style.cssText = ''; leaf.style.display = 'none';
    slotL.replaceChildren(); slotR.replaceChildren();
    $('closeBook').hidden = true; $('question').hidden = true; $('memOverlay').hidden = true;
    yes.style.display = ''; yes.style.transform = ''; no.style.display = ''; no.style.position = ''; no.style.left = ''; no.style.top = '';
    $('happy').style.display = ''; $('toAdvent2').hidden = true;
  };
})();

/* ---------- El anillo de papel (antes del calendario) ---------- */
(function(){
  const A = CONFIG.anillo;
  const scene = $('rgScene'), ringPos = $('ringPos'), ring3d = $('ring3d');
  let state = 0, touched = false, built = false, timers = [];          // 0 cerrada · 1 abierta · 2 anillo fuera
  const later = (f, ms) => timers.push(setTimeout(f, ms));
  const esc2 = s => String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));

  /* Anillo de papel: banda circular con grosor + diamante de papel plegado (origami) */
  function ringSVG(){
    const cx = 128, cy = 152, R = 70, r = 54, ky = .96;      // banda de frente (círculo con agujero)
    const dx = 20, dy = -13, N = 16;                           // profundidad de la tira (lo que se ve de lado)
    const ann = (ox, oy) =>
      `M${cx+ox-R},${cy+oy} a${R},${R*ky} 0 1,0 ${2*R},0 a${R},${R*ky} 0 1,0 ${-2*R},0 Z ` +
      `M${cx+ox-r},${cy+oy} a${r},${r*ky} 0 1,0 ${2*r},0 a${r},${r*ky} 0 1,0 ${-2*r},0 Z`;
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v)*t));
    const front = [240,226,200], back = [176,150,108];
    let stack = '';
    for(let i=N; i>=1; i--){
      const t = i/N, c = mix(front, back, Math.pow(t, .8));
      stack += `<path fill-rule="evenodd" d="${ann(dx*t, dy*t)}" fill="rgb(${c[0]},${c[1]},${c[2]})"/>`;
    }
    // costura de la tira y pliegues finos sobre el lateral
    const pt = (ang, rad, t) => [cx + dx*t + rad*Math.cos(ang), cy + dy*t + rad*ky*Math.sin(ang)];
    const line = (ang, w, op, col) => { const a = pt(ang, R, 0), b = pt(ang, R, 1);
      return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`; };
    let marks = line(-0.62, 1.6, .55, '#6b4a26') + line(-0.55, 5, .12, '#fff') ;
    [-1.05, -0.2, 0.35, 0.9].forEach(a => { marks += line(a, 1, .22, '#7a5a30'); });
    // diamante de papel plegado
    const gem = `
      <g>
        <polygon points="96,52 110,28 128,52" fill="#ffc9d8"/>
        <polygon points="110,28 146,28 128,52" fill="#ffe4ec"/>
        <polygon points="146,28 160,52 128,52" fill="#ffb4c8"/>
        <polygon points="96,52 128,52 128,94" fill="#ff93b0"/>
        <polygon points="128,52 160,52 128,94" fill="#f2698c"/>
        <path d="M96,52 L110,28 L146,28 L160,52 L128,94 Z M96,52 L160,52 M110,28 L128,52 L146,28 M128,52 L128,94" fill="none" stroke="rgba(140,40,70,.38)" stroke-width="1.1" stroke-linejoin="round"/>
        <path d="M112,32 L124,48" stroke="#fff" stroke-width="2" opacity=".65" stroke-linecap="round"/>
      </g>`;
    const rm = (R + r)/2;
    const txt = esc2(A.textoAnillo || '');
    return `<svg viewBox="0 0 300 250" role="img" aria-label="Anillo de papel con un diamante plegado">
      <defs>
        <linearGradient id="rpf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbf3"/><stop offset=".55" stop-color="#f7ead3"/><stop offset="1" stop-color="#ecd9bb"/></linearGradient>
        <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="7"/>
          <feColorMatrix values="0 0 0 0 .42  0 0 0 0 .32  0 0 0 0 .2  .9 0 0 0 -.3"/></filter>
        <clipPath id="frontclip"><path clip-rule="evenodd" d="${ann(0,0)}"/></clipPath>
        <clipPath id="gemclip"><polygon points="96,52 110,28 146,28 160,52 128,94"/></clipPath>
        <path id="rtp" d="M${cx-rm},${cy} A${rm},${rm*ky} 0 0 0 ${cx+rm},${cy}"/>
      </defs>
      <ellipse cx="${cx+dx*.45}" cy="${cy+R*ky+30}" rx="92" ry="13" fill="rgba(0,0,0,.26)"/>
      ${stack}
      ${marks}
      <path fill-rule="evenodd" d="${ann(0,0)}" fill="url(#rpf)"/>
      <rect x="40" y="70" width="190" height="170" filter="url(#grain)" clip-path="url(#frontclip)" opacity=".5"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R*ky}" fill="none" stroke="#e0d0ab" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*ky}" fill="none" stroke="#bda980" stroke-width="1.4"/>
      <path d="M${cx-R+6},${cy-12} A${R-4},${(R-4)*ky} 0 0 1 ${cx-24},${cy-R*ky+6}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <text font-family="Dancing Script,cursive" font-weight="600" font-size="12" fill="#b03a56" opacity=".9" text-anchor="middle"><textPath href="#rtp" startOffset="50%">${txt}</textPath></text>
      ${gem}
      <rect x="90" y="20" width="76" height="80" filter="url(#grain)" clip-path="url(#gemclip)" opacity=".35"/>
    </svg>`;
  }

  function build(){
    if(built) return; built = true;
    ring3d.innerHTML = ringSVG();
    $('rgStep').textContent = A.paso; $('rgTitle').textContent = A.titulo;
    $('rgCard').textContent = A.mensajeCaja; $('rgNext').textContent = A.boton;
  }
  function reset(){
    timers.forEach(clearTimeout); timers = [];
    state = 0; touched = false;
    scene.classList.remove('open','out','shown');
    $('rgMsg').textContent = ''; $('rgMsg').classList.remove('show');
    $('rgNext').hidden = true; $('rgHint').textContent = A.pista; $('rgHint').style.display = '';
    ring3d.style.setProperty('--rx','0deg'); ring3d.style.setProperty('--ry','0deg');
  }

  // 1) abrir la cajita (el anillo se queda dentro)
  function openBox(){
    if(state !== 0) return; state = 1;
    scene.classList.add('open'); $('rgHint').style.display = 'none';
    const r = scene.getBoundingClientRect();
    for(let i=0;i<10;i++) later(() => spawn(r.left + r.width*(.3+Math.random()*.4), r.top + r.height*.62, false, ['✦','✧'][i%2]), 500 + i*80);
    later(() => { $('rgHint').textContent = A.pistaAnillo; $('rgHint').style.display = ''; }, 1900);
  }
  // 2) sacar el anillo
  function takeOut(){
    if(state !== 1) return; state = 2;
    scene.classList.add('out'); $('rgHint').style.display = 'none';
    const r = scene.getBoundingClientRect();
    for(let i=0;i<18;i++) later(() => spawn(r.left + r.width*(.25+Math.random()*.5), r.top + r.height*.5, false, ['✦','✨','✧'][i%3]), 200 + i*70);
    later(() => scene.classList.add('shown'), 1800);
    later(() => { $('rgMsg').textContent = A.textoAbierto; $('rgMsg').classList.add('show'); }, 2300);
    later(() => { $('rgHint').textContent = 'Tócalo, o mueve el dedo para verlo girar 💍'; $('rgHint').style.display = ''; }, 3000);
    later(() => { $('rgNext').hidden = false; }, 4000);
  }
  ['rgBox','rgFront','rgCard'].forEach(id => {
    $(id).addEventListener('click', openBox);
    $(id).addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openBox(); } });
  });
  ringPos.addEventListener('click', () => {
    if(state === 1){ takeOut(); return; }
    if(state !== 2) return;
    const r = ringPos.getBoundingClientRect();
    for(let i=0;i<10;i++) spawn(r.left + r.width*Math.random(), r.top + r.height*(.2+Math.random()*.6), false, ['✦','✨','🧡'][i%3]);
    if(!touched && A.alTocar){ touched = true; $('rgMsg').textContent = A.alTocar; $('rgHint').style.display = 'none'; }
  });

  // con el anillo fuera, sigue al dedo o al mouse
  scene.addEventListener('pointermove', e => {
    if(state !== 2) return;
    const r = scene.getBoundingClientRect();
    const x = ((e.clientX - r.left)/r.width - .5)*2, y = ((e.clientY - r.top)/r.height - .5)*2;
    ring3d.style.setProperty('--ry', (Math.max(-1,Math.min(1,x))*32).toFixed(1) + 'deg');
    ring3d.style.setProperty('--rx', (Math.max(-1,Math.min(1,-y))*24).toFixed(1) + 'deg');
  });
  const flat = () => { ring3d.style.setProperty('--rx','0deg'); ring3d.style.setProperty('--ry','0deg'); };
  scene.addEventListener('pointerleave', flat); scene.addEventListener('pointerup', e => { if(e.pointerType === 'touch') flat(); });
  $('rgNext').addEventListener('click', () => go(ADVENT));

  window.startAnillo = function(){ build(); reset(); };
  window.resetAnillo = function(){ build(); reset(); };
})();

/* ---------- Calendario de adviento (una caja que se abre) ---------- */
function today(){
  // Para probar: abre index.html?dia=12 y simulará que hoy es 12 de diciembre
  const p = new URLSearchParams(location.search).get('dia');
  const d = new Date();
  if(p && +p >= 1 && +p <= 31) return new Date(d.getFullYear(), 11, +p);
  return d;
}
function openedDoors(){ try{ return JSON.parse(store.get('adv_abiertas') || '[]'); }catch(e){ return []; } }
function toast(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2500);
}
(function buildLights(){
  const cols = ['#ff4d6d','#ffd166','#4cd98a','#6ec1ff','#ff9ff3'];
  for(let i=0;i<14;i++){
    const b = document.createElement('span'); b.className = 'bulb';
    b.style.color = cols[i % cols.length]; b.style.animationDelay = (i*0.28)+'s';
    $('lights').appendChild(b);
  }
})();

const stage = $('stage'), zoomer = $('zoomer'), cabwrap = $('cabwrap');
let advState = 'closed';            // closed -> opening -> open -> zoomed

function fit(){
  const sw = stage.clientWidth, sh = stage.clientHeight, mobile = innerWidth < 640;
  const ar = mobile ? 4/7 : 6/5;
  let W = Math.min(sw * (mobile ? .92 : .58), sh * .94 * ar);
  W = Math.max(W, 200);
  cabwrap.style.width = W + 'px';
  cabwrap.style.height = (W/ar) + 'px';
  cabwrap.style.setProperty('--W', W + 'px');
  cabwrap.style.setProperty('--ang', (mobile ? 100 : 128) + 'deg');
}
addEventListener('resize', () => { if($('s6').classList.contains('active')) fit(); });

function updateProgress(){
  const n = openedDoors().length, t = CONFIG.adviento.length;
  $('advBar').style.width = (n/t*100)+'%';
  $('advCount').textContent = `🎁 ${n} de ${t}`;
}

function renderAdvent(){
  const now = today(), year = now.getFullYear();
  const start = new Date(year, 11, 1);
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if(midnight < start){
    const days = Math.round((start - midnight)/86400000);
    $('advInfo').textContent = days === 1 ? 'Mañana se abre la primera puerta ✨' : `Faltan ${days} días para que se abra la primera puerta ✨`;
  } else if(midnight.getMonth() === 11 && midnight.getDate() <= 24){
    $('advInfo').textContent = `Hoy es ${midnight.getDate()} de diciembre. Puedes abrir la puerta de hoy y las anteriores.`;
  } else {
    $('advInfo').textContent = 'Todas las puertas están abiertas. Feliz Navidad 🎅';
  }
  // siempre empieza con la caja cerrada
  stage.classList.remove('open'); zoomer.style.transform = ''; advState = 'closed';
  fit();

  const cab = $('advent'); cab.innerHTML = '';
  CONFIG.adviento.forEach((item, idx) => {
    const day = idx + 1, unlock = new Date(year, 11, day);
    const isAvail = midnight >= unlock, isToday = +midnight === +unlock;
    const c = document.createElement('button');
    c.className = 'cell ' + (isAvail ? 'available' : 'locked') + (isToday ? ' today' : '') + (openedDoors().includes(day) ? ' opened' : '');
    c.style.gridArea = 'd' + day;
    c.setAttribute('aria-label', 'Día ' + day);
    c.innerHTML = `<div class="inside">${esc(item.emoji)}</div><div class="flap"><span class="num">${day}</span>${isAvail ? '' : '<span class="lock">🔒</span>'}</div>`;
    c.addEventListener('click', () => onCell(c, item, day, isAvail));
    cab.appendChild(c);
  });
  updateProgress();
}

function openBox(){
  if(advState !== 'closed') return;
  advState = 'opening';
  stage.classList.add('open');
  for(let i=0;i<30;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*45);
  setTimeout(() => { advState = 'open'; }, 1900);
}
$('clasp').addEventListener('click', openBox);
$('leafL').addEventListener('click', openBox);
$('leafR').addEventListener('click', openBox);

function zoomTo(cell){
  const r = cell.getBoundingClientRect(), z = zoomer.getBoundingClientRect();
  const S = Math.min(z.width*.5/r.width, z.height*.55/r.height, 4.5);
  const dx = (r.left + r.width/2) - (z.left + z.width/2);
  const dy = (r.top + r.height/2) - (z.top + z.height/2);
  zoomer.style.transform = `translate(${-dx*S}px, ${-dy*S}px) scale(${S})`;
}

function onCell(cell, item, day, isAvail){
  if(advState !== 'open') return;
  if(!isAvail){
    cell.classList.remove('shake'); void cell.offsetWidth; cell.classList.add('shake');
    toast(`Todavía no 😉 Se abre el ${day} de diciembre`); return;
  }
  advState = 'zoomed';
  zoomTo(cell);
  const wasOpen = cell.classList.contains('opened');
  setTimeout(() => {
    if(!wasOpen){
      cell.classList.add('opened');
      store.set('adv_abiertas', JSON.stringify([...openedDoors(), day]));
      updateProgress();
    }
  }, 1000);
  setTimeout(() => showDoor(item, day), wasOpen ? 1200 : 1900);
}

function showDoor(item, day){
  $('mDay').textContent = 'DÍA ' + day;
  $('mEmoji').textContent = item.emoji; $('mTitle').textContent = item.titulo; $('mText').textContent = item.texto;
  $('overlay').hidden = false; $('mClose').focus();
  for(let i=0;i<22;i++) setTimeout(() => spawn(Math.random()*innerWidth, innerHeight+10, true), i*40);
}
function closeDoor(){
  $('overlay').hidden = true;
  if(advState === 'zoomed'){ zoomer.style.transform = ''; advState = 'open'; }
}
$('mClose').addEventListener('click', closeDoor);
$('overlay').addEventListener('click', e => { if(e.target.id === 'overlay') closeDoor(); });
addEventListener('keydown', e => { if(e.key === 'Escape' && !$('overlay').hidden) closeDoor(); });

/* ---------- Partículas flotantes (ligeras) ---------- */
const cv = $('hearts'), cx = cv.getContext('2d');
let parts = [], running = false;
const MAX_PARTS = 120, sprites = {};
function rs(){ cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', rs); rs();

// cada emoji se dibuja una sola vez en un lienzo pequeño y luego solo se copia
function sprite(sym, size){
  const q = Math.max(12, Math.round(size/4)*4), k = sym + q;
  if(sprites[k]) return sprites[k];
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(q*1.5);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.font = q + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(sym, c.width/2, c.height/2);
  return sprites[k] = c;
}
function spawn(x, y, big, sym){
  if(parts.length >= MAX_PARTS) return;
  const small = innerWidth < 500;
  parts.push({x, y, s:((big?16:10)+Math.random()*(big?16:10)) * (small?.8:1), vy:-(0.7+Math.random()*1.3),
    vx:(Math.random()-.5)*.8, a:.9, w:Math.random()*6, sym: sym || symbols[Math.floor(Math.random()*symbols.length)]});
  if(!running){ running = true; requestAnimationFrame(loop); }
}
function burst(el, sym){
  const r = el.getBoundingClientRect();
  for(let i=0;i<8;i++) spawn(r.left+r.width/2, r.top+r.height/2, false, sym);
}
setInterval(() => { if(!document.hidden && parts.length < 20) spawn(Math.random()*innerWidth, innerHeight+10); }, 1000);
function loop(){
  if(!parts.length){ running = false; cx.clearRect(0,0,cv.width,cv.height); return; }
  cx.clearRect(0,0,cv.width,cv.height);
  for(const h of parts){
    h.y += h.vy; h.x += h.vx + Math.sin((h.y + h.w*50)/40)*.4; h.a -= 0.003;
    const sp = sprite(h.sym, h.s);
    cx.globalAlpha = Math.max(h.a, 0);
    cx.drawImage(sp, h.x - sp.width/2, h.y - sp.height/2);
  }
  parts = parts.filter(h => h.a > 0 && h.y > -40);
  requestAnimationFrame(loop);
}
