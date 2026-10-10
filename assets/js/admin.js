/* AZS Technologies — редактор материалов (страница admin.html) */
(function () {
  const AZS = (window.AZS = window.AZS || {});
  const esc = AZS.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const root = document.getElementById('admin-app');
  if (!root) return;

  let tab = 'news';
  let editingId = null;    // null | 'new' | <id материала>
  let editingUser = null;  // null | 'new' | <id пользователя>

  /* ---------- утилиты ---------- */
  const TRANSLIT = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y',
    'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
    'х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',' ':'-'
  };
  const translit = (s) => String(s || '').toLowerCase().split('').map(c => (TRANSLIT[c] != null ? TRANSLIT[c] : c)).join('');
  function uniqueSlug(base, excludeId) {
    let s = base || 'material', i = 2;
    while ((AZS.newsData || []).some(x => x.slug === s && x.id !== excludeId)) s = base + '-' + i++;
    return s;
  }
  function slugify(title, excludeId) {
    const s = translit(title).replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    return uniqueSlug(s || 'material', excludeId);
  }
  const uid = (p) => (p || 'm') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function today() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  /* Дата хранится в формате «дд.мм.гггг», а поле ввода требует «гггг-мм-дд».
     Без этого преобразования при сохранении дата сбрасывалась на сегодняшнюю. */
  function toInputDate(d) {
    const s = String(d == null ? '' : d).trim();
    let m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m) return m[3] + '-' + m[2] + '-' + m[1];
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];
    return today();
  }
  function fromInputDate(v) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v == null ? '' : v).trim());
    return m ? (m[3] + '.' + m[2] + '.' + m[1]) : fromInputDate(today());
  }
  const typeKey = (t) => (t === 'article' ? 'articles' : 'news');
  const typeLabel = (t) => (t === 'article' ? 'Статья' : 'Новость');
  const canCreate = (t, u) => AZS.can(typeKey(t) + '.create', u);
  const canPublish = (t, u) => AZS.can(typeKey(t) + '.publish', u);
  const canDelete = (t, u) => AZS.can(typeKey(t) + '.delete', u);
  function canEditItem(it, u) {
    u = u || AZS.currentUser();
    const k = typeKey(it.type || 'news');
    if (AZS.can(k + '.editAny', u)) return true;
    return AZS.can(k + '.editOwn', u) && it.createdBy === u.id;
  }

  /* ---------- вход ---------- */
  function renderLogin(msg) {
    const single = (AZS.usersData || []).length === 1 && AZS.usersData[0].login === 'admin';
    root.innerHTML = `
    <div class="container section">
      <div class="admin-login">
        <h1>Редактор материалов</h1>
        <p class="muted">Вход для сотрудников сайта. Права доступа выдаёт администратор.</p>
        <form class="form" id="admin-login-form">
          <div class="field"><label>Логин</label><input name="login" required autocomplete="username"></div>
          <div class="field"><label>Пароль</label><input name="password" type="password" required autocomplete="current-password"></div>
          <button class="btn btn--block" type="submit">Войти</button>
          ${msg ? `<div class="notice">${esc(msg)}</div>` : ''}
          ${single ? `<p class="muted small">По умолчанию: <b>admin</b> / <b>admin123</b>. Смените пароль после входа.</p>` : ''}
        </form>
      </div>
    </div>`;
    $('#admin-login-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target, btn = f.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Проверяем…';
      const r = await AZS.login(f.elements.login.value.trim(), f.elements.password.value);
      if (r.ok) { editingId = editingUser = null; renderApp(); }
      else { renderLogin(r.message); }
    };
  }

  /* ---------- каркас ---------- */
  function renderApp() {
    const u = AZS.currentUser();
    if (!u) return renderLogin();
    const role = (AZS.ROLES[u.role] || {}).label || u.role;
    const tabs = [];
    if (AZS.can('news.view', u)) tabs.push(['news', 'Новости']);
    if (AZS.can('articles.view', u)) tabs.push(['articles', 'Статьи']);
    if (AZS.can('users.manage', u)) tabs.push(['users', 'Пользователи']);
    if (!tabs.length) {
      root.innerHTML = `<div class="container section"><div class="empty">У вашей учётной записи нет прав на редактирование. Обратитесь к администратору.</div></div>`;
      return;
    }
    if (!tabs.some(t => t[0] === tab)) tab = tabs[0][0];
    root.innerHTML = `
    <div class="container section">
      <div class="admin__bar">
        <div><h1>Редактор материалов</h1>
          <span class="muted small">Вы вошли как <b>${esc(u.name || u.login)}</b> · ${esc(role)}</span></div>
        <div class="admin__bar-actions">
          <button class="btn btn--ghost btn--sm" data-act="export-news">Скачать data/news.js</button>
          <button class="btn btn--ghost btn--sm" data-act="import">Импорт…</button>
          ${AZS.can('users.manage', u) ? `<button class="btn btn--ghost btn--sm" data-act="reset">Сбросить правки</button>` : ''}
          <button class="btn btn--dark btn--sm" data-act="logout">Выйти</button>
          <input type="file" id="admin-import-file" accept=".js,.json,text/javascript,application/json" hidden>
        </div>
      </div>
      <div class="admin__tabs">
        ${tabs.map(t => `<button class="admin__tab ${t[0] === tab ? 'active' : ''}" data-tab="${t[0]}">${esc(t[1])}</button>`).join('')}
      </div>
      <div id="admin-body"></div>
    </div>`;
    renderBody();
  }

  function renderBody() {
    const host = $('#admin-body');
    if (!host) return;
    if (tab === 'users') return editingUser ? renderUserEditor(host) : renderUsers(host);
    return editingId ? renderEditor(host) : renderList(host, tab);
  }

  /* ---------- список материалов ---------- */
  function renderList(host, type) {
    const u = AZS.currentUser();
    const list = (AZS.newsData || [])
      .filter(x => (x.type || 'news') === type)
      .slice()
      .sort((a, b) => AZS.dateKey(b.date).localeCompare(AZS.dateKey(a.date)) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const rows = list.map(it => {
      const pub = it.status === 'published';
      return `<tr>
        <td><b>${esc(it.title || '(без названия)')}</b><div class="muted small">/${esc(it.slug || '')}</div></td>
        <td>${pub ? '<span class="tag-status pub">Опубликовано</span>' : '<span class="tag-status draft">Черновик</span>'}</td>
        <td>${esc(it.date || '')}</td>
        <td>${esc(it.author || '')}</td>
        <td><div class="admin__row-actions">
          ${pub ? `<a class="btn btn--ghost btn--sm" href="article.html?type=${type}&slug=${encodeURIComponent(it.slug)}" target="_blank" rel="noopener">Открыть</a>` : ''}
          ${canEditItem(it, u) ? `<button class="btn btn--ghost btn--sm" data-act="edit-item" data-id="${esc(it.id)}">Изменить</button>` : ''}
          ${canPublish(type, u) ? `<button class="btn btn--ghost btn--sm" data-act="toggle-status" data-id="${esc(it.id)}">${pub ? 'В черновик' : 'Опубликовать'}</button>` : ''}
          ${canDelete(type, u) ? `<button class="btn btn--ghost btn--sm" data-act="del-item" data-id="${esc(it.id)}">Удалить</button>` : ''}
        </div></td></tr>`;
    }).join('');
    host.innerHTML = `
      <div class="admin__head">
        <h2 style="margin:0">${type === 'article' ? 'Статьи' : 'Новости'} <span class="muted small">(${list.length})</span></h2>
        ${canCreate(type, u) ? `<button class="btn" data-act="new-item">+ Создать ${type === 'article' ? 'статью' : 'новость'}</button>` : ''}
      </div>
      ${list.length
        ? `<table class="admin__table"><thead><tr><th>Заголовок</th><th>Статус</th><th>Дата</th><th>Автор</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
        : `<div class="empty">Здесь пока нет материалов. Нажмите «Создать».</div>`}`;
  }

  /* ---------- редактор материала ---------- */
  function renderEditor(host) {
    const u = AZS.currentUser();
    const isNew = editingId === 'new';
    const item = isNew
      ? { type: tab, date: fromInputDate(today()), author: u.name || '', status: 'draft', html: '', excerpt: '', title: '', slug: '', img: '', tags: [] }      : (AZS.newsData || []).find(x => x.id === editingId);
    if (!item) { editingId = null; return renderBody(); }
    const type = item.type || (tab === 'users' ? 'news' : tab);
    const canPub = canPublish(type, u);
    host.innerHTML = `
    <div class="admin__editor">
      <h2>${isNew ? 'Новый материал' : 'Редактирование: ' + esc(item.title || '')}</h2>
      <form class="form" id="item-form">
        <div class="field"><label>Заголовок *</label><input name="title" required value="${esc(item.title || '')}"></div>
        <div class="admin__grid2">
          <div class="field"><label>Адрес (slug)</label><input name="slug" value="${esc(item.slug || '')}" placeholder="заполнится автоматически"></div>
          <div class="field"><label>Дата</label><input name="date" type="date" value="${esc(toInputDate(item.date))}"></div>
          <div class="field"><label>Автор</label><input name="author" value="${esc(item.author || '')}"></div>
          <div class="field"><label>Обложка (путь или URL)</label><input name="img" value="${esc(item.img || '')}" placeholder="assets/img/..."></div>
        </div>
        <div class="admin__grid2">
          <div class="field"><label>Тип материала</label>
            <select name="type">
              <option value="news" ${type === 'news' ? 'selected' : ''}>Новость</option>
              <option value="article" ${type === 'article' ? 'selected' : ''}>Статья</option>
            </select></div>
          <div class="field"><label>Теги (через запятую)</label><input name="tags" value="${esc((item.tags || []).join(', '))}"></div>
        </div>
        <div class="field"><label>Краткое описание</label><textarea name="excerpt" style="min-height:80px">${esc(item.excerpt || '')}</textarea></div>
        <div class="field"><label>Текст (HTML)</label><textarea name="html" spellcheck="false" style="min-height:320px;font-family:ui-monospace,Consolas,monospace">${esc(item.html || '')}</textarea></div>
        ${canPub
          ? `<div class="field"><label>Статус</label><select name="status">
               <option value="draft" ${item.status !== 'published' ? 'selected' : ''}>Черновик</option>
               <option value="published" ${item.status === 'published' ? 'selected' : ''}>Опубликовано</option>
             </select></div>`
          : `<div class="notice">Публиковать могут пользователи с правом «Публиковать». Материал сохранится черновиком.</div>`}
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" type="submit">Сохранить</button>
          <button class="btn btn--ghost" type="button" data-act="preview">Предпросмотр</button>
          <button class="btn btn--ghost" type="button" data-act="cancel-item">Отмена</button>
        </div>
      </form>
    </div>`;

    const f = $('#item-form');
    const titleEl = f.elements.title, slugEl = f.elements.slug;
    titleEl.addEventListener('input', () => {
      if (!slugEl.dataset.touched) slugEl.value = slugify(titleEl.value, isNew ? null : item.id);
    });
    slugEl.addEventListener('input', () => { slugEl.dataset.touched = '1'; });
    f.querySelector('[data-act="preview"]').onclick = () =>
      AZS.modal('Предпросмотр', `<div class="prose" style="border:0;padding:0"><h1>${esc(f.elements.title.value)}</h1>${f.elements.html.value}</div>`);
    f.querySelector('[data-act="cancel-item"]').onclick = () => { editingId = null; renderBody(); };
    f.onsubmit = (e) => saveItem(e, item, isNew, canPub);
  }

  function saveItem(e, item, isNew, canPub) {
    e.preventDefault();
    const f = e.target;
    const val = (n) => (f.elements[n] ? String(f.elements[n].value).trim() : '');
    const title = val('title');
    if (!title) return;
    const u = AZS.currentUser();
    const t = val('type') || 'news';
    const now = new Date().toISOString();
    const out = Object.assign({}, item, {
      type: t,
      title,
      slug: uniqueSlug(val('slug') || slugify(title, item.id), item.id),
      date: fromInputDate(val('date') || today()),
      author: val('author'),
      img: val('img'),
      excerpt: val('excerpt'),
      tags: val('tags').split(',').map(s => s.trim()).filter(Boolean),
      html: f.elements.html.value,
      status: (canPub && f.elements.status) ? f.elements.status.value : (item.status || 'draft'),
      updatedAt: now,
      updatedBy: u.id
    });
    if (isNew) { out.id = uid('m'); out.createdAt = now; out.createdBy = u.id; }
    const list = (AZS.newsData || []).slice();
    const idx = list.findIndex(x => x.id === out.id);
    if (idx >= 0) list[idx] = out; else list.push(out);
    AZS.saveNewsData(list);
    AZS.toast('Сохранено');
    editingId = null;
    tab = t === 'article' ? 'articles' : 'news';
    renderApp();
  }

  function deleteItem(id) {
    const it = (AZS.newsData || []).find(x => x.id === id);
    if (!it) return;
    if (!confirm('Удалить «' + (it.title || '') + '»?')) return;
    AZS.saveNewsData((AZS.newsData || []).filter(x => x.id !== id));
    AZS.toast('Удалено');
    renderBody();
  }
  function toggleStatus(id) {
    const list = (AZS.newsData || []).slice();
    const it = list.find(x => x.id === id);
    if (!it) return;
    it.status = it.status === 'published' ? 'draft' : 'published';
    it.updatedAt = new Date().toISOString();
    AZS.saveNewsData(list);
    renderBody();
  }

  /* ---------- пользователи ---------- */
  function renderUsers(host) {
    const u = AZS.currentUser();
    const list = AZS.usersData || [];
    host.innerHTML = `
      <div class="admin-note">Права выдаются каждому сотруднику отдельно. Роль задаёт набор по умолчанию, а галочки ниже можно включать и выключать индивидуально.
        Пароли хранятся в виде хэша в файле <b>data/users.js</b> — это защита от случайных правок, а не от злоумышленников.</div>
      <div class="admin__head">
        <h2 style="margin:0">Пользователи <span class="muted small">(${list.length})</span></h2>
        <div class="admin__row-actions">
          <button class="btn btn--ghost btn--sm" data-act="export-users">Скачать data/users.js</button>
          <button class="btn" data-act="new-user">+ Добавить пользователя</button>
        </div>
      </div>
      <table class="admin__table">
        <thead><tr><th>Имя</th><th>Логин</th><th>Роль</th><th>Статус</th><th></th></tr></thead>
        <tbody>${list.map(x => `<tr>
          <td>${esc(x.name || '')}${x.id === u.id ? ' <span class="muted small">(это вы)</span>' : ''}</td>
          <td>${esc(x.login)}</td>
          <td>${esc((AZS.ROLES[x.role] || {}).label || x.role)}</td>
          <td>${x.active === false ? '<span class="tag-status draft">Отключён</span>' : '<span class="tag-status pub">Активен</span>'}</td>
          <td><div class="admin__row-actions">
            <button class="btn btn--ghost btn--sm" data-act="edit-user" data-id="${esc(x.id)}">Изменить</button>
            ${x.id !== u.id ? `<button class="btn btn--ghost btn--sm" data-act="del-user" data-id="${esc(x.id)}">Удалить</button>` : ''}
          </div></td></tr>`).join('')}</tbody>
      </table>`;
  }

  function permsGrid(perms) {
    let html = '', last = '';
    AZS.PERMS.forEach(p => {
      if (p.group !== last) { html += `<div class="pg-title">${esc(p.group)}</div>`; last = p.group; }
      html += `<label><input type="checkbox" name="perm_${p.key}" ${perms[p.key] ? 'checked' : ''}> <span>${esc(p.label)}</span></label>`;
    });
    return html;
  }

  function renderUserEditor(host) {
    const me = AZS.currentUser();
    const isNew = editingUser === 'new';
    const t = isNew ? { role: 'author', active: true, name: '', login: '', email: '' }
                    : (AZS.usersData || []).find(x => x.id === editingUser);
    if (!t) { editingUser = null; return renderBody(); }
    const perms = isNew ? Object.assign({}, (AZS.ROLES[t.role] || {}).perms) : AZS.userPerms(t);
    const roleOpts = Object.keys(AZS.ROLES).map(k =>
      `<option value="${k}" ${t.role === k ? 'selected' : ''}>${esc(AZS.ROLES[k].label)}</option>`).join('');
    host.innerHTML = `
      <div class="admin__editor">
        <h2>${isNew ? 'Новый пользователь' : 'Пользователь: ' + esc(t.name || t.login)}</h2>
        <form class="form" id="user-form">
          <div class="admin__grid2">
            <div class="field"><label>Имя *</label><input name="name" required value="${esc(t.name || '')}"></div>
            <div class="field"><label>Логин *</label><input name="login" required autocomplete="off" value="${esc(t.login || '')}"></div>
            <div class="field"><label>E-mail</label><input name="email" type="email" value="${esc(t.email || '')}"></div>
            <div class="field"><label>Роль</label><select name="role">${roleOpts}</select></div>
            <div class="field"><label>${isNew ? 'Пароль *' : 'Новый пароль (пусто — не менять)'}</label>
              <input name="password" type="password" ${isNew ? 'required' : ''} autocomplete="new-password"></div>
            <div class="field"><label>Доступ</label>
              <label style="display:flex;gap:8px;align-items:center;font-weight:600;padding-top:6px">
                <input type="checkbox" name="active" ${t.active !== false ? 'checked' : ''} ${t.id === me.id ? 'disabled' : ''}> Учётная запись активна</label></div>
          </div>
          <div class="field"><label>Права доступа</label>
            <div class="perm-grid" id="perm-grid">${permsGrid(perms)}</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn" type="submit">Сохранить</button>
            <button class="btn btn--ghost" type="button" data-act="cancel-user">Отмена</button>
          </div>
        </form>
      </div>`;
    $('#user-form').onsubmit = (e) => saveUser(e, t, isNew);
    host.querySelector('[data-act="cancel-user"]').onclick = () => { editingUser = null; renderBody(); };
  }

  function applyRoleDefaults(role) {
    const defs = (AZS.ROLES[role] || {}).perms || {};
    AZS.PERMS.forEach(p => {
      const el = document.querySelector('#user-form input[name="perm_' + p.key + '"]');
      if (el) el.checked = !!defs[p.key];
    });
    AZS.toast('Права выставлены по роли');
  }

  async function saveUser(e, t, isNew) {
    e.preventDefault();
    const f = e.target;
    const val = (n) => (f.elements[n] ? String(f.elements[n].value).trim() : '');
    const me = AZS.currentUser();
    const login = val('login');
    if (!login) return;
    if ((AZS.usersData || []).some(x => x.login.toLowerCase() === login.toLowerCase() && x.id !== t.id)) {
      AZS.toast('Такой логин уже занят');
      return;
    }
    const permissions = {};
    AZS.PERMS.forEach(p => { permissions[p.key] = !!(f.elements['perm_' + p.key] && f.elements['perm_' + p.key].checked); });

    const out = Object.assign({}, t, {
      name: val('name') || login,
      login,
      email: val('email'),
      role: val('role') || 'author',
      active: t.id === me.id ? true : !!f.elements.active.checked,
      permissions
    });
    const pw = val('password');
    if (isNew && !pw) { AZS.toast('Задайте пароль'); return; }
    if (pw) { out.salt = AZS.newSalt(); out.hash = await AZS.hashPassword(pw, out.salt); }
    if (isNew) { out.id = uid('u'); out.createdAt = new Date().toISOString(); }
    if (out.id === me.id && !permissions['users.manage'] && !confirm('Вы отключаете себе право «Управление пользователями». Продолжить?')) return;

    const list = (AZS.usersData || []).slice();
    const idx = list.findIndex(x => x.id === out.id);
    if (idx >= 0) list[idx] = out; else list.push(out);
    AZS.saveUsersData(list);
    AZS.toast('Пользователь сохранён');
    editingUser = null;
    renderApp();
  }

  function deleteUser(id) {
    const me = AZS.currentUser();
    const t = (AZS.usersData || []).find(x => x.id === id);
    if (!t) return;
    if (t.id === me.id) { AZS.toast('Нельзя удалить себя'); return; }
    if (!confirm('Удалить пользователя ' + (t.name || t.login) + '?')) return;
    AZS.saveUsersData((AZS.usersData || []).filter(x => x.id !== id));
    AZS.toast('Пользователь удалён');
    renderBody();
  }

  /* ---------- файлы ---------- */
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  const usersExport = () => {
    /* Проставляем новую версию — чтобы опубликованный файл перекрыл
       устаревший кэш на других устройствах. */
    AZS.usersUpdatedAt = new Date().toISOString();
    AZS.saveUsersData(AZS.usersData);
    return 'window.AZS=window.AZS||{};\n'
      + 'window.AZS.usersUpdatedAt=' + JSON.stringify(AZS.usersUpdatedAt) + ';\n'
      + 'window.AZS.users=' + JSON.stringify(AZS.usersData || []) + ';\n';
  };
  function exportNewsFile() { download('news.js', AZS.newsExport()); AZS.toast('Файл news.js сформирован'); }
  function exportUsersFile() { download('users.js', usersExport()); AZS.toast('Файл users.js сформирован'); }

  function extractArray(text) {
    const t = String(text || '').trim();
    try { if (t.startsWith('[')) return JSON.parse(t); } catch (e) {}
    const s = t.indexOf('['), e = t.lastIndexOf(']');
    if (s >= 0 && e > s) { try { return JSON.parse(t.slice(s, e + 1)); } catch (err) {} }
    return null;
  }
  function importText(text, name) {
    const arr = extractArray(text);
    if (!arr) { AZS.toast('Не удалось распознать файл'); return; }
    const isUsers = /AZS\.users/.test(text) || /users\.js$/i.test(name);
    if (isUsers) {
      if (!AZS.can('users.manage')) { AZS.toast('Нет прав на импорт пользователей'); return; }
      if (!confirm('Заменить список пользователей (' + arr.length + ')?')) return;
      AZS.saveUsersData(arr); renderApp(); AZS.toast('Пользователи импортированы');
    } else {
      if (!confirm('Заменить материалы (' + arr.length + ')?')) return;
      AZS.saveNewsData(arr); renderApp(); AZS.toast('Материалы импортированы');
    }
  }
  function resetLocal(u) {
    if (!confirm('Сбросить локальные изменения и вернуть данные из файлов data/*.js?')) return;
    AZS.resetNewsData();
    if (AZS.can('users.manage', u)) AZS.resetUsersData();
    location.reload();
  }

  /* ---------- события ---------- */
  function onClick(e) {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) { tab = tabBtn.getAttribute('data-tab'); editingId = editingUser = null; return renderApp(); }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    const u = AZS.currentUser();
    if (!u) return renderLogin();
    switch (a) {
      case 'logout': AZS.logout(); return renderLogin();
      case 'export-news': return exportNewsFile();
      case 'export-users': return exportUsersFile();
      case 'import': { const inp = $('#admin-import-file'); if (inp) inp.click(); return; }
      case 'reset': return resetLocal(u);
      case 'new-item': editingId = 'new'; return renderBody();
      case 'edit-item': editingId = id; return renderBody();
      case 'del-item': return deleteItem(id);
      case 'toggle-status': return toggleStatus(id);
      case 'new-user': editingUser = 'new'; return renderBody();
      case 'edit-user': editingUser = id; return renderBody();
      case 'del-user': return deleteUser(id);
    }
  }
  function onChange(e) {
    const inp = e.target.closest('#admin-import-file');
    if (inp && inp.files && inp.files[0]) {
      const file = inp.files[0];
      const rd = new FileReader();
      rd.onload = () => { importText(String(rd.result), file.name); inp.value = ''; };
      rd.readAsText(file);
    }
    const roleSel = e.target.closest('#user-form select[name="role"]');
    if (roleSel) applyRoleDefaults(roleSel.value);
  }

  function boot() {
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    renderApp();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
