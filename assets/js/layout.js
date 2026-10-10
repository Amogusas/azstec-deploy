/* AZS Technologies — shared layout & cart */
(function () {
  const AZS = (window.AZS = window.AZS || {});
  AZS.MENU = [
    { t: 'Главная', h: 'index.html' },
    { t: 'Интернет-магазин', h: 'shop.html' },
    { t: 'Услуги', children: [
      { t: 'Сервисное обслуживание', h: 'services/servisnoe-obsluzhivanie.html' },
      { t: 'Проектирование', h: 'services/proektirovanie.html' },
      { t: 'Строительство', h: 'services/stroitelstvo.html' },
      { t: 'Автоматизация', h: 'services/avtomatizaciya.html' },
      { t: 'Реконструкция АЗС', h: 'services/rekonstrukciya.html' },
      { t: 'Ремонт оборудования АЗС', h: 'services/remont-oborudovaniya.html' }
    ]},
    { t: 'Информация', children: [
      { t: 'Как заказать', h: 'info/kak-zakazat.html' },
      { t: 'Как оплатить', h: 'info/kak-oplatit.html' },
      { t: 'Доставка', h: 'info/dostavka.html' },
      { t: 'Фотоотчеты', h: 'info/galereya.html' },
      { t: 'Курсы валют', h: 'info/kursy-valyut.html' }
    ]},
    { t: 'Статьи', h: 'articles.html' },
    { t: 'Новости', h: 'news.html' },
    { t: 'О нас', children: [
      { t: 'Контакты', h: 'about/kontakty.html' },
      { t: 'Реквизиты', h: 'about/rekvizity.html' },
      { t: 'Сертификаты', h: 'about/sertifikaty.html' },
      { t: 'Партнеры', h: 'about/partnery.html' },
      { t: 'Отзывы о нашей работе', h: 'about/otzyvy.html' }
    ]},
    { t: 'Сотрудничество', h: 'cooperation.html' }
  ];
  AZS.COMPANY = {
    name: 'АЗС Технологии',
    phone: '+7 (351) 262 88 29',
    phoneHref: '+73512628829',
    email: 'azstec@mail.ru',
    address: 'Челябинская обл., г. Челябинск, ул. Рубежная, 17А, офис 205',
    mobile: '+7 919 129 95 95',
    workHours: 'Круглосуточно',
    wa: 'https://api.whatsapp.com/send?phone=+79193509555&text=Я%20заинтересован%20в%20сотрудничестве%20с%20вашей%20компанией'
  };

  let ROOT = '';
  const lnk = (h) => (h && !/^(https?:|tel:|mailto:|#|\/)/.test(h)) ? ROOT + h : h;

  const ICON = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.3a2 2 0 0 0 2 1.7h8.3a2 2 0 0 0 2-1.6L22 7H6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3.9A10 10 0 0 0 4.1 17.3L3 21l3.8-1a10 10 0 0 0 13.2-16zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.3.6.6-2.2-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7 1-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.3 7.3 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 8 10c0 1.3.9 2.5 1.1 2.7a10.6 10.6 0 0 0 4 3.5c.6.2 1 .4 1.4.5a3.3 3.3 0 0 0 1.5.1 2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>'
  };
  AZS.ICON = ICON;

  AZS.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  AZS.param = (k) => new URLSearchParams(location.search).get(k);

  /* ---------- Cart ---------- */
  const KEY = 'azs_cart';
  AZS.getCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  AZS.saveCart = (c) => { localStorage.setItem(KEY, JSON.stringify(c)); AZS.updateBadge(); };
  AZS.cartCount = () => AZS.getCart().reduce((s, i) => s + i.qty, 0);
  AZS.findProduct = (id) => (AZS.products || []).find(p => String(p.id) === String(id));
  AZS.addToCart = (id, qty) => {
    qty = qty || 1;
    const c = AZS.getCart();
    const row = c.find(i => String(i.id) === String(id));
    if (row) row.qty += qty; else c.push({ id: String(id), qty: qty });
    AZS.saveCart(c);
    AZS.toast('Товар добавлен в корзину');
  };
  AZS.setQty = (id, qty) => {
    let c = AZS.getCart();
    if (qty <= 0) c = c.filter(i => String(i.id) !== String(id));
    else { const r = c.find(i => String(i.id) === String(id)); if (r) r.qty = qty; }
    AZS.saveCart(c);
  };
  AZS.removeFromCart = (id) => AZS.setQty(id, 0);
  AZS.updateBadge = () => { document.querySelectorAll('[data-cart-count]').forEach(e => e.textContent = AZS.cartCount()); };

  /* ---------- Toast ---------- */
  AZS.toast = (msg) => {
    let t = document.getElementById('azs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'azs-toast'; document.body.appendChild(t);
      Object.assign(t.style, { position: 'fixed', left: '50%', bottom: '80px', transform: 'translateX(-50%)',
        background: '#1d232b', color: '#fff', padding: '12px 20px', borderRadius: '10px', zIndex: 200,
        fontWeight: '700', boxShadow: '0 10px 30px rgba(0,0,0,.3)', opacity: 0, transition: '.25s', pointerEvents: 'none' }); }
    t.textContent = msg; t.style.opacity = 1;
    clearTimeout(t._t); t._t = setTimeout(() => t.style.opacity = 0, 2200);
  };

  /* ---------- Header ---------- */
  function headerHTML() {
    const c = AZS.COMPANY;
    const nav = AZS.MENU.map(m => m.children
      ? `<div class="has-sub"><a href="#">${AZS.esc(m.t)}</a><div class="sub">${m.children.map(s => `<a href="${lnk(s.h)}">${AZS.esc(s.t)}</a>`).join('')}</div></div>`
      : `<a href="${lnk(m.h)}">${AZS.esc(m.t)}</a>`).join('');
    return `
    <div class="header">
    <div class="topbar"><div class="container">
      <div class="tb-links"><a href="tel:${c.phoneHref}">${c.phone}</a><span>${c.workHours}</span></div>
      <div class="tb-links"><a href="${c.wa}" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:${c.email}">${c.email}</a></div>
    </div></div>
    <div class="header-main"><div class="container">
      <a class="logo" href="${lnk('index.html')}"><span class="mark">АЗС</span><span>${c.name}<small>AZS TECHNOLOGIES</small></span></a>
      <nav class="nav">${nav}</nav>
      <div class="header-actions">
        <a class="icon-btn" href="${lnk('search.html')}" title="Поиск" aria-label="Поиск">${ICON.search}</a>
        <a class="icon-btn" href="${lnk('cart.html')}" title="Корзина" aria-label="Корзина">${ICON.cart}<span class="cart-badge" data-cart-count>0</span></a>
        <button class="icon-btn burger" id="burger" aria-label="Меню">${ICON.menu}</button>
      </div>
    </div></div>
    </div>`;
  }

  function drawerHTML() {
    const items = AZS.MENU.map(m => m.children
      ? `<div class="acc"><button class="acc-btn">${AZS.esc(m.t)}${ICON.chevron}</button><div class="acc-panel">${m.children.map(s => `<a href="${lnk(s.h)}">${AZS.esc(s.t)}</a>`).join('')}</div></div>`
      : `<a class="drawer__direct-link" href="${lnk(m.h)}">${AZS.esc(m.t)}</a>`).join('');
    return `
    <div class="drawer__scrim" data-close-drawer></div>
    <aside class="drawer__panel" aria-label="Меню">
      <div class="drawer__close"><a class="logo" href="${lnk('index.html')}"><span class="mark">АЗС</span><span>${AZS.COMPANY.name}</span></a>
        <button class="icon-btn" data-close-drawer aria-label="Закрыть">${ICON.close}</button></div>
      <div class="drawer__direct">${items}</div>
      <div style="padding:16px 6px"><a class="btn btn--block" href="tel:${AZS.COMPANY.phoneHref}">${ICON.phone} ${AZS.COMPANY.phone}</a>
        <a class="drawer__staff" href="${lnk('admin.html')}">Редактор сайта · вход для сотрудников</a></div>
    </aside>`;
  }

  function footerHTML() {
    const c = AZS.COMPANY;
    const col = (title, links) => `<div><h4>${title}</h4><ul>${links.map(l => `<li><a href="${lnk(l[1])}">${AZS.esc(l[0])}</a></li>`).join('')}</ul></div>`;
    return `
    <div class="container"><div class="footer-grid">
      <div>
        <a class="logo" href="${lnk('index.html')}" style="color:#fff"><span class="mark">АЗС</span><span>${c.name}<small>AZS TECHNOLOGIES</small></span></a>
        <p class="small" style="margin-top:14px">Поставка оборудования, сервис, ремонт, проектирование и строительство АЗС, АГЗС и нефтебаз.</p>
      </div>
      ${col('Магазин', [['Интернет-магазин','shop.html'],['Корзина','cart.html'],['Поиск','search.html'],['Новости','news.html'],['Статьи','articles.html']])}
      ${col('Услуги', [['Сервисное обслуживание','services/servisnoe-obsluzhivanie.html'],['Проектирование','services/proektirovanie.html'],['Строительство','services/stroitelstvo.html'],['Автоматизация','services/avtomatizaciya.html'],['Ремонт оборудования','services/remont-oborudovaniya.html']])}
      <div>
        <h4>Контакты</h4>
        <ul>
          <li><a href="tel:${c.phoneHref}">${c.phone}</a></li>
          <li><a href="mailto:${c.email}">${c.email}</a></li>
          <li>${c.address}</li>
          <li>${c.workHours}</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ООО «${c.name}». Все права защищены.</span>
      <span><a href="${lnk('about/rekvizity.html')}">Реквизиты</a> · <a href="${lnk('about/kontakty.html')}">Контакты</a> · <a href="${lnk('admin.html')}">Редактор сайта</a></span></div></div>`;
  }

  function mobileBarHTML() {
    const c = AZS.COMPANY;
    return `
      <a href="tel:${c.phoneHref}">${ICON.phone}<span>Позвонить</span></a>
      <a href="${c.wa}" target="_blank" rel="noopener">${ICON.wa}<span>WhatsApp</span></a>
      <a href="${lnk('cart.html')}">${ICON.cart}<span>Корзина</span></a>`;
  }

  AZS.modal = (title, html) => {
    let m = document.getElementById('azs-modal');
    if (!m) { m = document.createElement('div'); m.id = 'azs-modal'; m.className = 'modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="modal__scrim" data-modal-close></div><div class="modal__box">
      <button class="modal__close" data-modal-close aria-label="Закрыть">✕</button>
      ${title ? `<h2>${AZS.esc(title)}</h2>` : ''}<div>${html}</div></div>`;
    m.classList.add('open');
  };
  AZS.closeModal = () => { const m = document.getElementById('azs-modal'); if (m) m.classList.remove('open'); };

  AZS.initLayout = () => {
    ROOT = document.body.getAttribute('data-root') || '';
    const h = document.getElementById('site-header'); if (h) h.innerHTML = headerHTML();
    const d = document.getElementById('site-drawer'); if (d) d.innerHTML = drawerHTML();
    const f = document.getElementById('site-footer'); if (f) { f.className = 'footer'; f.innerHTML = footerHTML(); }
    const b = document.getElementById('site-mobilebar'); if (b) { b.className = 'mobile-bar'; b.innerHTML = mobileBarHTML(); }
    AZS.updateBadge();

    document.addEventListener('click', (e) => {
      if (e.target.closest('#burger')) document.getElementById('site-drawer').classList.add('open');
      if (e.target.closest('[data-close-drawer]')) document.getElementById('site-drawer').classList.remove('open');
      if (e.target.closest('.acc-btn')) e.target.closest('.acc').classList.toggle('open');
      if (e.target.closest('[data-modal-close]')) AZS.closeModal();
      const add = e.target.closest('[data-add]');
      if (add) { e.preventDefault(); AZS.addToCart(add.getAttribute('data-add')); }
      const cb = e.target.closest('[data-callback]');
      if (cb) { e.preventDefault(); AZS.callbackModal(); }
    });
  };

  AZS.callbackModal = () => {
    AZS.modal('Обратный звонок', `
      <p class="muted">Введите Ваш номер, и мы перезвоним!</p>
      <form class="form" id="cb-form">
        <div class="field"><label>Имя</label><input required name="name" placeholder="Ваше имя"></div>
        <div class="field"><label>Телефон</label><input required name="phone" type="tel" placeholder="+7 (___) ___-__-__"></div>
        <button class="btn" type="submit">Отправить</button>
      </form>`);
    const f = document.getElementById('cb-form');
    if (f) f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Отправляем…';
      const r = await AZS.sendForm({ 'Тип заявки': 'Обратный звонок', 'Имя': f.elements['name'].value, 'Телефон': f.elements['phone'].value });
      if (r.ok) { AZS.closeModal(); AZS.toast('Спасибо! Заявка отправлена, мы перезвоним.'); }
      else { AZS.modal('Отправка не удалась', `<div class="notice">${AZS.esc(r.message)}</div>`); }
    };
  };

  /* ---------- Формы: отправка на e-mail ----------
     По умолчанию используется FormSubmit (по адресу ниже).
     Чтобы перейти на Web3Forms (без ссылки-активации):
       1) получи Access Key на https://web3forms.com (введи свою почту),
       2) вставь его в web3formsKey ниже.
     Если ключ указан — заявки идут через Web3Forms, иначе — через FormSubmit. */
  AZS.FORMS = {
    formsubmitEmail: 'rescors@gmail.com',
    web3formsKey: ''
  };

  AZS.sendForm = async (fields) => {
    if (location.protocol === 'file:') {
      return { ok: false, message: 'Отправка форм работает только когда сайт открыт через веб-сервер или размещён на хостинге. Запустите start-server.bat и откройте http://localhost:8080 — тогда заявки будут уходить.' };
    }
    const subject = 'Заявка с сайта АЗС Технологии';
    try {
      if (AZS.FORMS.web3formsKey) {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.assign({ access_key: AZS.FORMS.web3formsKey, subject: subject, from_name: 'АЗС Технологии' }, fields))
        });
        const j = await res.json().catch(() => ({}));
        if (j && j.success) return { ok: true };
        return { ok: false, message: j.message || 'Сервис Web3Forms вернул ошибку.' };
      }
      const data = Object.assign({ _subject: subject, _template: 'table', _captcha: 'false' }, fields);
      const res = await fetch('https://formsubmit.co/ajax/' + AZS.FORMS.formsubmitEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const j = await res.json().catch(() => ({}));
      if (j && (j.success === 'true' || j.success === true)) return { ok: true };
      return { ok: false, message: j.message || 'Сервис отправки вернул ошибку.' };
    } catch (err) {
      return { ok: false, message: 'Не удалось связаться с сервисом отправки. Проверьте подключение к интернету.' };
    }
  };

  document.addEventListener('DOMContentLoaded', AZS.initLayout);
})();
