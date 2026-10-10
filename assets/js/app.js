/* AZS Technologies — page logic */
(function () {
  const A = window.AZS;
  const esc = A.esc;
  const R = document.body.getAttribute('data-root') || '';
  const fix = (s) => String(s == null ? '' : s).split('__ROOT__').join(R);
  const absolutize = (h) => String(h == null ? '' : h).replace(/(\b(?:src|href))="\/(?!\/)/g, '$1="https://azstec.ru/');
  const processContent = (h) => {
    let s = String(h == null ? '' : h);
    s = s.replace(/<iframe\b[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/gi,
      (m, src) => '<div class="notice">Встроенный блок недоступен для показа. <a href="' + src + '" target="_blank" rel="noopener">Открыть источник →</a></div>');
    s = s.replace(/<a\b[^>]*>\s*(Наверх|Вверх)\s*<\/a>/gi, '<a href="#" data-to-top class="to-top">$1</a>');
    s = s.replace(/\{load(?:module|position|moduleposition)[^}]*\}/gi, '');
    return s;
  };
  const catBySlug = (s) => (A.categories || []).find(c => c.slug === s);
  const $ = (s, r) => (r || document).querySelector(s);

  const PRICE = '<span class="card__price">Цена по запросу</span>';

  function catCard(c) {
    const media = c.image ? `<div class="card__media"><img loading="lazy" src="${esc(c.image)}" alt="${esc(c.name)}"></div>` : '';
    return `<a class="card" href="category.html?cat=${encodeURIComponent(c.slug)}">
      ${media}
      <div class="card__body"><h3 class="card__title">${esc(c.name)}</h3>
      ${c.desc ? `<p class="card__desc">${esc(c.desc)}</p>` : ''}
      <span class="more" style="font-weight:700;color:var(--brand-d);font-size:.88rem">Перейти →</span></div></a>`;
  }
  function prodCard(p) {
    return `<div class="card">
      <a class="card__media" href="product.html?id=${encodeURIComponent(p.id)}"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}"></a>
      <div class="card__body">
        <h3 class="card__title"><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
        <p class="card__desc">${esc((p.short || '').slice(0, 90))}</p>
        <div class="card__meta"><span>${p.manufacturer ? 'Произв.: ' + esc(p.manufacturer) : ''}</span><span>Отзывов (${p.reviews || 0})</span></div>
        <div class="card__meta">${PRICE}</div>
        <div class="card__actions">
          <button class="btn" data-add="${esc(p.id)}">Купить</button>
          <a class="btn btn--ghost" href="product.html?id=${encodeURIComponent(p.id)}">Подробнее</a>
        </div>
      </div></div>`;
  }
  function crumbs(items) {
    return `<ul class="crumbs">${items.map((it, i) => it[1] && i < items.length - 1
      ? `<li><a href="${it[1]}">${esc(it[0])}</a></li>` : `<li>${esc(it[0])}</li>`).join('')}</ul>`;
  }

  /* ---------- HOME ---------- */
  function initHome() {
    const slides = (A.slides || []).map(s => `<div class="hero__slide"><img src="${esc(fix(s.img))}" alt="${esc(s.title)}">
      <div class="hero__body"><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p><a class="btn" href="${s.href}">Подробнее</a></div></div>`).join('');
    const hero = $('#hero');
    if (hero) {
      hero.innerHTML = `<div class="hero__track">${slides}</div><div class="hero__dots"></div>`;
      const track = $('.hero__track', hero), dots = $('.hero__dots', hero), n = (A.slides || []).length || 1;
      let i = 0, timer;
      for (let k = 0; k < n; k++) { const b = document.createElement('button'); if (!k) b.className = 'active'; b.onclick = () => go(k); dots.appendChild(b); }
      function go(k) { i = (k + n) % n; track.style.transform = `translateX(-${i * 100}%)`; dots.querySelectorAll('button').forEach((b, x) => b.classList.toggle('active', x === i)); }
      function auto() { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); }
      auto(); hero.addEventListener('mouseenter', () => clearInterval(timer)); hero.addEventListener('mouseleave', auto);
      let x0 = null; hero.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
      hero.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; auto(); });
    }
    const feat = $('#features');
    if (feat) feat.innerHTML = (A.features || []).map(f => `<div class="feature">
      <div class="fi">${f.icon}</div><h3>${esc(f.title)}</h3><p>${esc(f.short)}</p>
      <a class="more" href="#" data-feature="${esc(f.key)}">Подробнее →</a></div>`).join('');
    const news = $('#home-news');
    if (news) news.innerHTML = (A.news || []).slice(0, 5).map(n => `
      <article class="news-item"><img loading="lazy" src="${esc(fix(n.img))}" alt="${esc(n.title)}">
        <div><div class="meta">${esc(n.date)} · ${esc(n.author || '')}</div>
        <h3><a href="article.html?type=news&slug=${encodeURIComponent(n.slug)}">${esc(n.title)}</a></h3>
        <p class="muted small">${esc(n.excerpt || '')}</p>
        <a class="btn btn--sm btn--ghost" href="article.html?type=news&slug=${encodeURIComponent(n.slug)}">Подробнее</a></div></article>`).join('');
    const partners = $('#partners');
    if (partners) partners.innerHTML = (A.partners || []).map(p => `<a href="${p.url || 'about/partnery.html'}" title="${esc(p.name)}"><img loading="lazy" src="${esc(fix(p.img))}" alt="${esc(p.name)}"></a>`).join('');
    const phones = $('#phones');
    if (phones) phones.innerHTML = (A.managers || []).map(m => `<div class="contact-card"><img src="${esc(fix(m.photo))}" alt="${esc(m.name)}">
      <div><b>${esc(m.name)}</b><span class="muted small">${esc(m.phone)}</span>
      <div><a href="${A.COMPANY.wa}" target="_blank" rel="noopener">WhatsApp</a> · <a href="mailto:${A.COMPANY.email}">E-mail</a></div></div></div>`).join('');
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-to-top]');
    if (t) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-feature]');
    if (f) { e.preventDefault(); const feat = (A.features || []).find(x => x.key === f.getAttribute('data-feature'));
      if (feat) A.modal(feat.title, `<div class="prose" style="border:0;padding:0">${feat.html}</div>`); }
  });

  /* ---------- SHOP ---------- */
  function initShop() {
    const top = (A.categories || []).filter(c => !c.parent || c.parent === c.slug);
    const grid = $('#cats'); if (grid) grid.innerHTML = top.map(catCard).join('');
    const sc = $('#shop-count'); if (sc) sc.textContent = `Разделов: ${(A.categories || []).length} · Товаров: ${(A.products || []).length}`;
    const all = $('#all-cats');
    if (all) all.innerHTML = (A.categories || []).map(catCard).join('');
  }

  /* ---------- CATEGORY ---------- */
  function initCategory() {
    const slug = A.param('cat');
    const cat = catBySlug(slug) || { name: slug, slug: slug };
    let subs = (A.categories || []).filter(c => c.parent === slug && c.slug !== slug);
    let list = (A.products || []).filter(p => p.category === slug);
    if (!list.length && cat.parent) {
      const parentProds = (A.products || []).filter(p => p.category === cat.parent);
      const term = (cat.name || '').toLowerCase();
      const filtered = parentProds.filter(p => ((p.manufacturer || '') + ' ' + p.name).toLowerCase().includes(term));
      list = filtered.length ? filtered : parentProds;
      subs = (A.categories || []).filter(c => c.parent === cat.parent && c.slug !== slug);
    }
    const page = $('#cat-page'); if (!page) return;
    $('#cat-title').textContent = cat.name;
    const crumbArr = [['Главная', 'index.html'], ['Интернет-магазин', 'shop.html']];
    if (cat.parent) { const pc = catBySlug(cat.parent); crumbArr.push([pc ? pc.name : cat.parent, 'category.html?cat=' + encodeURIComponent(cat.parent)]); }
    crumbArr.push([cat.name]);
    $('#crumbs').innerHTML = crumbs(crumbArr);
    const subBox = $('#subcats');
    if (subBox) subBox.innerHTML = subs.length ? `<div class="grid grid--cats">${subs.map(catCard).join('')}</div><hr style="border:0;border-top:1px solid var(--line);margin:22px 0">` : '';
    let cur = 1; const per = 12;
    const sortSel = $('#sort');
    function render() {
      const sorted = list.slice().sort((a, b) => {
        const m = sortSel ? sortSel.value : 'default';
        if (m === 'name') return a.name.localeCompare(b.name, 'ru');
        if (m === 'name-desc') return b.name.localeCompare(a.name, 'ru');
        return 0;
      });
      const total = Math.max(1, Math.ceil(sorted.length / per));
      cur = Math.min(cur, total);
      const slice = sorted.slice((cur - 1) * per, cur * per);
      const grid = $('#prods');
      grid.innerHTML = slice.length ? slice.map(prodCard).join('') : `<div class="empty">В этой категории пока нет товаров.</div>`;
      $('#count').textContent = `${sorted.length} товаров`;
      const pager = $('#pager');
      if (total <= 1) { pager.innerHTML = ''; return; }
      let h = '';
      for (let k = 1; k <= total; k++) h += `<a class="${k === cur ? 'active' : ''}" href="#" data-p="${k}">${k}</a>`;
      pager.innerHTML = h;
      pager.querySelectorAll('[data-p]').forEach(a => a.onclick = ev => { ev.preventDefault(); cur = +a.getAttribute('data-p'); render(); window.scrollTo({ top: page.offsetTop - 90, behavior: 'smooth' }); });
    }
    if (sortSel) sortSel.onchange = () => { cur = 1; render(); };
    render();
  }

  /* ---------- PRODUCT ---------- */
  function initProduct() {
    const id = A.param('id');
    const p = A.findProduct(id);
    const box = $('#product'); if (!box) return;
    if (!p) { box.innerHTML = `<div class="empty">Товар не найден. <a href="shop.html">Вернуться в каталог</a></div>`; return; }
    const cat = catBySlug(p.category);
    document.title = p.name + ' — АЗС Технологии';
    $('#crumbs').innerHTML = crumbs([['Главная', 'index.html'], ['Интернет-магазин', 'shop.html'], [cat ? cat.name : 'Каталог', cat ? 'category.html?cat=' + encodeURIComponent(cat.slug) : 'shop.html'], [p.name]]);
    const imgs = (p.images && p.images.length ? p.images : [p.image]).filter(Boolean);
    box.innerHTML = `
      <div class="gallery">
        <div class="gallery__main"><img id="gmain" src="${esc(imgs[0])}" alt="${esc(p.name)}"></div>
        <div class="gallery__thumbs">${imgs.map((im, i) => `<img class="${i === 0 ? 'active' : ''}" data-g="${i}" src="${esc(im)}" alt="${esc(p.name)}">`).join('')}</div>
      </div>
      <div class="buybox">
        <span class="badge">${esc(p.manufacturer || 'Оборудование')}</span>
        <h1>${esc(p.name)}</h1>
        <div class="card__meta"><span>Отзывов (${p.reviews || 0})</span></div>
        <div class="price">Цена по запросу</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" data-add="${esc(p.id)}">В корзину</button>
          <button class="btn btn--dark" data-callback>Задать вопрос</button>
        </div>
        <div class="notice" style="margin-top:16px">Оставьте заявку — менеджер рассчитает стоимость и сроки поставки.</div>
      </div>`;
    box.querySelectorAll('[data-g]').forEach(t => t.onclick = () => {
      $('#gmain').src = imgs[+t.getAttribute('data-g')];
      box.querySelectorAll('[data-g]').forEach(x => x.classList.remove('active')); t.classList.add('active');
    });
    if (p.desc) { const d = $('#product-desc'); if (d) d.innerHTML = absolutize(p.desc); }
  }

  /* ---------- SEARCH ---------- */
  function initSearch() {
    const box = $('#search-page'); if (!box) return;
    const q = A.param('q') || '';
    $('#search-input').value = q;
    const res = $('#search-results');
    function run() {
      const term = ($('#search-input').value || '').trim().toLowerCase();
      if (!term) { res.innerHTML = '<div class="empty">Введите запрос для поиска по каталогу.</div>'; return; }
      const found = (A.products || []).filter(p => (p.name + ' ' + (p.short || '') + ' ' + (p.manufacturer || '')).toLowerCase().includes(term));
      res.innerHTML = found.length ? `<p class="muted">Найдено: ${found.length}</p><div class="grid grid--prods">${found.slice(0, 60).map(prodCard).join('')}</div>`
        : '<div class="empty">Ничего не найдено.</div>';
    }
    $('#search-form').onsubmit = e => { e.preventDefault(); const t = $('#search-input').value.trim(); history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(t)); run(); };
    run();
  }

  /* ---------- CART ---------- */
  function initCart() {
    const box = $('#cart-page'); if (!box) return;
    function render() {
      const c = A.getCart();
      const items = c.map(r => ({ ...r, p: A.findProduct(r.id) })).filter(r => r.p);
      if (!items.length) {
        box.innerHTML = `<div class="empty"><p>Ваша корзина пуста.</p><a class="btn" href="shop.html">Перейти в каталог</a></div>`;
        return;
      }
      box.innerHTML = `<div class="layout"><div>${items.map(r => `
        <div class="cart-row">
          <img src="${esc(r.p.image)}" alt="${esc(r.p.name)}">
          <div><a href="product.html?id=${encodeURIComponent(r.p.id)}"><b>${esc(r.p.name)}</b></a>
            <div class="muted small">${esc(r.p.manufacturer || '')}</div></div>
          <div class="qty"><button data-dec="${esc(r.id)}">−</button><span>${r.qty}</span><button data-inc="${esc(r.id)}">+</button></div>
          <button class="btn btn--ghost btn--sm" data-del="${esc(r.id)}">Удалить</button>
        </div>`).join('')}
        <button class="btn btn--ghost" data-clear>Очистить корзину</button></div>
        <div><div class="cart-summary"><h3>Заявка</h3>
          <p class="muted small">Цены уточняются менеджером. Отправьте заявку — мы рассчитаем стоимость.</p>
          <div class="cart-total"><span>Позиций</span><span>${A.cartCount()}</span></div>
          <a class="btn btn--block" href="checkout.html">Оформить заявку</a></div></div></div>`;
      box.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-inc'); const r = A.getCart().find(i => i.id === id); A.setQty(id, r.qty + 1); render(); });
      box.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-dec'); const r = A.getCart().find(i => i.id === id); A.setQty(id, r.qty - 1); render(); });
      box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { A.removeFromCart(b.getAttribute('data-del')); render(); });
      const cl = box.querySelector('[data-clear]'); if (cl) cl.onclick = () => { A.saveCart([]); render(); };
    }
    render();
  }

  function initCheckout() {
    const box = $('#checkout-page'); if (!box) return;
    const n = A.cartCount();
    if (!n) { box.innerHTML = '<div class="empty"><p>Корзина пуста.</p><a class="btn" href="shop.html">В каталог</a></div>'; return; }
    box.innerHTML = `<div class="layout"><div class="prose"><h1>Оформление заявки</h1>
      <p class="muted">Заполните данные — менеджер свяжется с вами для расчёта стоимости и условий поставки.</p>
      <form class="form" id="order-form">
        <div class="field"><label>Имя *</label><input required name="name"></div>
        <div class="field"><label>Телефон *</label><input required type="tel" name="phone"></div>
        <div class="field"><label>E-mail</label><input type="email" name="email"></div>
        <div class="field"><label>Организация</label><input name="org"></div>
        <div class="field"><label>Комментарий</label><textarea name="comment"></textarea></div>
        <button class="btn" type="submit">Отправить заявку</button>
      </form></div>
      <div class="cart-summary"><h3>В заявке: ${n} поз.</h3>
        <ul>${A.getCart().map(r => { const p = A.findProduct(r.id); return p ? `<li>${esc(p.name)} × ${r.qty}</li>` : ''; }).join('')}</ul></div></div>`;
    $('#order-form').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, btn = f.querySelector('button');
      const items = A.getCart().map(r => { const p = A.findProduct(r.id); return p ? `${p.name} — ${r.qty} шт.` : ''; }).filter(Boolean).join('\n');
      btn.disabled = true; btn.textContent = 'Отправляем…';
      const r = await A.sendForm({
        'Тип заявки': 'Заказ из корзины', 'Имя': f.elements['name'].value, 'Телефон': f.elements['phone'].value,
        'E-mail': f.elements['email'].value, 'Организация': f.elements['org'].value, 'Комментарий': f.elements['comment'].value,
        'Состав заявки': items || '(корзина пуста)'
      });
      if (r.ok) { A.saveCart([]); A.modal('Заявка отправлена', '<p>Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.</p>'); }
      else A.modal('Отправка не удалась', `<div class="notice">${esc(r.message)}</div>`);
    };
  }

  /* ---------- NEWS / ARTICLES ---------- */
  function initNews() {
    const box = $('#news-list'); if (!box) return;
    box.innerHTML = (A.news || []).map(n => `<article class="news-item"><img loading="lazy" src="${esc(fix(n.img))}" alt="${esc(n.title)}">
      <div><div class="meta">${esc(n.date)} · ${esc(n.author || '')}</div>
      <h3><a href="article.html?type=news&slug=${encodeURIComponent(n.slug)}">${esc(n.title)}</a></h3>
      <p class="muted small">${esc(n.excerpt || '')}</p>
      <a class="btn btn--sm btn--ghost" href="article.html?type=news&slug=${encodeURIComponent(n.slug)}">Подробнее</a></div></article>`).join('');
  }
  function initArticles() {
    const box = $('#articles-list'); if (!box) return;
    box.innerHTML = (A.articles || []).map(n => `<article class="news-item"><div style="grid-column:1/-1"><div class="meta">${esc(n.date || '')}</div>
      <h3><a href="article.html?type=article&slug=${encodeURIComponent(n.slug)}">${esc(n.title)}</a></h3>
      <p class="muted small">${esc(n.excerpt || '')}</p>
      <a class="btn btn--sm btn--ghost" href="article.html?type=article&slug=${encodeURIComponent(n.slug)}">Читать</a></div></article>`).join('');
  }
  function initArticle() {
    const box = $('#article-page'); if (!box) return;
    const type = A.param('type') || 'news', slug = A.param('slug');
    const src = type === 'article' ? (A.articles || []) : (A.news || []);
    const it = src.find(x => x.slug === slug);
    if (!it) { box.innerHTML = '<div class="empty">Материал не найден.</div>'; return; }
    document.title = it.title + ' — АЗС Технологии';
    let body = fix(it.html) || '<p>' + esc(it.excerpt || '') + '</p>';
    body = body.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, '');
    body = body.replace(/<dl\b[^>]*>(?:(?!<\/dl>)[\s\S])*?<\/dl>/i, '');
    body = absolutize(body);
    body = processContent(body);
    box.innerHTML = `${crumbs([['Главная', 'index.html'], [type === 'article' ? 'Статьи' : 'Новости', type === 'article' ? 'articles.html' : 'news.html'], [it.title]])}
      <div class="prose"><h1>${esc(it.title)}</h1><div class="meta muted small" style="margin-bottom:14px">${esc(it.date || '')} · ${esc(it.author || '')}</div>${body}</div>`;
  }

  /* ---------- CONTENT PAGES (services / info / about) ---------- */
  function initContent() {
    const box = $('#content-page'); if (!box) return;
    const key = box.getAttribute('data-key');
    if (key === 'about/kontakty') { initContacts(box); return; }
    if (key === 'cooperation') { initCooperation(box); return; }
    if (key === 'info/kursy-valyut') { initRates(box); return; }
    if (key === 'about/otzyvy') { initReviews(box); return; }
    const c = (A.content || {})[key];
    if (!c) { box.innerHTML = '<div class="empty">Раздел наполняется.</div>'; return; }
    box.innerHTML = `<div class="prose">${processContent(absolutize(fix(c)))}</div>`;
  }

  function initContacts(box) {
    const c = A.COMPANY;
    box.innerHTML = `<div class="layout"><div class="prose">
      <h1>ООО «АЗС Технологии» — контакты</h1>
      <p><b>Адрес:</b> ул. Рубежная, д. 17А, офис 205; г. Челябинск; Челябинская область; 454048; Россия</p>
      <p><b>Телефон:</b> <a href="tel:${c.phoneHref}">${c.phone}</a><br>
         <b>Мобильный:</b> ${c.mobile}<br>
         <b>E-mail:</b> <a href="mailto:${c.email}">${c.email}</a><br>
         <b>Веб-сайт:</b> <a href="https://azstec.ru">azstec.ru</a><br>
         <b>Режим работы:</b> ${c.workHours}</p>
      <h2>Форма обратной связи</h2>
      <p class="muted">Поля, отмеченные звёздочкой, обязательны для заполнения.</p>
      <form class="form" id="contact-form">
        <div class="field"><label>Имя *</label><input required name="name"></div>
        <div class="field"><label>E-mail *</label><input required type="email" name="email"></div>
        <div class="field"><label>Тема *</label><input required name="subject"></div>
        <div class="field"><label>Сообщение *</label><textarea required name="message"></textarea></div>
        <button class="btn" type="submit">Отправить</button>
      </form></div>
      <aside>
        <div class="widget"><h3>Мы на карте</h3>
          <p class="muted small">${c.address}</p>
          <a class="btn btn--ghost btn--block" target="_blank" rel="noopener"
            href="https://yandex.ru/maps/?text=${encodeURIComponent(c.address)}">Открыть на карте</a>
        </div>
        <div class="widget"><h3>Обратный звонок</h3>
          <p class="muted small">Оставьте номер — перезвоним.</p>
          <button class="btn btn--block" data-callback>Заказать звонок</button></div>
      </aside></div>`;
    $('#contact-form').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, btn = f.querySelector('button');
      btn.disabled = true; btn.textContent = 'Отправляем…';
      const r = await A.sendForm({ 'Тип заявки': 'Обратная связь', 'Имя': f.elements['name'].value, 'E-mail': f.elements['email'].value, 'Тема': f.elements['subject'].value, 'Сообщение': f.elements['message'].value });
      if (r.ok) A.modal('Сообщение отправлено', '<p>Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.</p>');
      else A.modal('Отправка не удалась', `<div class="notice">${esc(r.message)}</div>`);
    };
  }

  function initCooperation(box) {
    const c = A.COMPANY;
    box.innerHTML = `<div class="layout"><div class="prose">
      <h1>Сотрудничество</h1>
      <p><b>Компания «АЗС Технологии» приглашает к сотрудничеству представителей и дилеров.</b></p>
      <p>Подробности и условия сотрудничества мы готовы обсудить с вами при личной встрече.</p>
      <p>Присылайте ваши предложения на <a href="mailto:${c.email}">${c.email}</a>.</p>
      <img src="${R}assets/img/comm_offer.jpg" alt="Сотрудничество">
      <h2>Оставить предложение</h2>
      <form class="form" id="coop-form">
        <div class="field"><label>Имя *</label><input required name="name"></div>
        <div class="field"><label>Email *</label><input required type="email" name="email"></div>
        <div class="field"><label>Телефон</label><input type="tel" name="phone"></div>
        <div class="field"><label>Тема *</label><input required name="subject"></div>
        <div class="field"><label>Предложение о сотрудничестве *</label><textarea required name="message"></textarea></div>
        <button class="btn" type="submit">Отправить</button>
      </form></div>
      <aside>
        <div class="widget"><h3>Контакты</h3>
          <ul>
            <li><b>Адрес:</b> ${c.address}</li>
            <li><b>E-mail:</b> <a href="mailto:${c.email}">${c.email}</a></li>
            <li><b>Телефон:</b> <a href="tel:${c.phoneHref}">${c.phone}</a></li>
            <li><b>Мобильный:</b> ${c.mobile}</li>
            <li><b>Сайт:</b> <a href="https://azstec.ru">azstec.ru</a></li>
          </ul></div>
        <div class="widget"><h3>Нужна консультация?</h3>
          <p class="muted small">Оставьте номер — перезвоним.</p>
          <button class="btn btn--block" data-callback>Заказать звонок</button></div>
      </aside></div>`;
    $('#coop-form').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, btn = f.querySelector('button');
      btn.disabled = true; btn.textContent = 'Отправляем…';
      const r = await A.sendForm({
        'Тип заявки': 'Сотрудничество', 'Имя': f.elements['name'].value, 'E-mail': f.elements['email'].value,
        'Телефон': f.elements['phone'].value, 'Тема': f.elements['subject'].value, 'Сообщение': f.elements['message'].value
      });
      if (r.ok) A.modal('Предложение отправлено', '<p>Спасибо! Ваше предложение отправлено. Мы свяжемся с вами.</p>');
      else A.modal('Отправка не удалась', `<div class="notice">${esc(r.message)}</div>`);
    };
  }

  function initReviews(box) {
    const c = A.content['about/otzyvy'] || '';
    box.innerHTML = `<div class="prose">${processContent(absolutize(fix(c)))}</div>`;
    const formHtml = `
      <form class="form" id="review-form" style="margin-top:16px">
        <div class="field"><label>Имя *</label><input required name="name"></div>
        <div class="field"><label>E-mail</label><input type="email" name="email"></div>
        <div class="field"><label>Отзыв *</label><textarea required name="message"></textarea></div>
        <button class="btn" type="submit">Отправить сообщение</button>
      </form>`;
    const host = box.querySelector('#setComment') || box.querySelector('.prose');
    if (host) host.insertAdjacentHTML('beforeend', formHtml);
    box.querySelector('#review-form').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, btn = f.querySelector('button');
      btn.disabled = true; btn.textContent = 'Отправляем…';
      const r = await A.sendForm({ 'Тип заявки': 'Отзыв', 'Имя': f.elements['name'].value, 'E-mail': f.elements['email'].value, 'Сообщение': f.elements['message'].value });
      if (r.ok) A.modal('Отзыв отправлен', '<p>Спасибо! Ваш отзыв отправлен.</p>');
      else A.modal('Отправка не удалась', `<div class="notice">${esc(r.message)}</div>`);
    };
  }

  async function initRates(box) {
    const order = ['USD', 'EUR', 'CNY', 'GBP', 'CHF', 'JPY', 'KZT', 'BYN', 'UAH', 'TRY', 'AED', 'PLN'];
    box.innerHTML = `<div class="prose"><h1>Курсы валют ЦБ РФ</h1><div id="rates"><div class="empty">Загрузка курсов…</div></div></div>`;
    const host = $('#rates');
    try {
      const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
      if (!res.ok) throw new Error('bad');
      const j = await res.json();
      const V = j.Valute || {};
      const d = new Date(j.Date);
      const date = isNaN(d) ? '' : d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
      const rows = order.filter(c => V[c]).map(c => {
        const v = V[c];
        const unit = v.Nominal > 1 ? v.Nominal + ' ' + v.CharCode : '1 ' + v.CharCode;
        const val = v.Value.toFixed(4).replace('.', ',');
        const diff = v.Value - v.Previous;
        const cls = diff > 0 ? 'up' : (diff < 0 ? 'down' : '');
        const mark = diff > 0 ? '▲' : (diff < 0 ? '▼' : '—');
        const dtxt = diff === 0 ? '' : ' ' + (diff > 0 ? '+' : '−') + Math.abs(diff).toFixed(4).replace('.', ',');
        return `<tr><td><b>${v.Name}</b><br><span class="muted small">за ${unit}</span></td><td class="rate">${val} ₽</td><td class="${cls}">${mark}${dtxt}</td></tr>`;
      }).join('');
      host.innerHTML = `<p class="muted small">Официальные курсы ЦБ РФ${date ? ' на ' + date : ''}</p>
        <table class="rates-table"><thead><tr><th>Валюта</th><th>Курс</th><th>Изм.</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="muted small">Источник: <a href="https://www.cbr.ru/currency_base/daily/" target="_blank" rel="noopener">Центральный банк РФ</a>. Обновляется при открытии страницы.</p>`;
    } catch (e) {
      host.innerHTML = `<div class="notice">Не удалось загрузить курсы (нет интернета или источник недоступен). Откройте <a href="https://www.cbr.ru/currency_base/daily/" target="_blank" rel="noopener">сайт ЦБ РФ</a>.</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const p = document.body.getAttribute('data-page');
    ({ home: initHome, shop: initShop, category: initCategory, product: initProduct,
       search: initSearch, cart: initCart, checkout: initCheckout, news: initNews,
       articles: initArticles, article: initArticle, content: initContent }[p] || function () {})();
  });
})();
