/* AZS Technologies — пользователи, роли, права, вход */
(function () {
  const AZS = (window.AZS = window.AZS || {});
  const USERS_KEY = 'azs_users';
  const SESSION_KEY = 'azs_session';

  /* ---------- Права ---------- */
  AZS.PERMS = [
    { key: 'news.view',       group: 'Новости',       label: 'Видеть раздел новостей' },
    { key: 'news.create',     group: 'Новости',       label: 'Создавать новости' },
    { key: 'news.editOwn',    group: 'Новости',       label: 'Редактировать свои новости' },
    { key: 'news.editAny',    group: 'Новости',       label: 'Редактировать любые новости' },
    { key: 'news.publish',    group: 'Новости',       label: 'Публиковать и снимать с публикации' },
    { key: 'news.delete',     group: 'Новости',       label: 'Удалять новости' },
    { key: 'articles.view',   group: 'Статьи',        label: 'Видеть раздел статей' },
    { key: 'articles.create', group: 'Статьи',        label: 'Создавать статьи' },
    { key: 'articles.editOwn',group: 'Статьи',        label: 'Редактировать свои статьи' },
    { key: 'articles.editAny',group: 'Статьи',        label: 'Редактировать любые статьи' },
    { key: 'articles.publish',group: 'Статьи',        label: 'Публиковать и снимать с публикации' },
    { key: 'articles.delete', group: 'Статьи',        label: 'Удалять статьи' },
    { key: 'users.manage',    group: 'Пользователи',  label: 'Управлять пользователями и правами' }
  ];

  const ALL = {};
  AZS.PERMS.forEach(p => { ALL[p.key] = true; });

  AZS.ROLES = {
    admin:  { label: 'Администратор', perms: Object.assign({}, ALL) },
    editor: { label: 'Редактор', perms: {
      'news.view': true, 'news.create': true, 'news.editOwn': true, 'news.editAny': true, 'news.publish': true, 'news.delete': true,
      'articles.view': true, 'articles.create': true, 'articles.editOwn': true, 'articles.editAny': true, 'articles.publish': true, 'articles.delete': true,
      'users.manage': false
    } },
    author: { label: 'Автор', perms: {
      'news.view': true, 'news.create': true, 'news.editOwn': true, 'news.editAny': false, 'news.publish': false, 'news.delete': false,
      'articles.view': true, 'articles.create': true, 'articles.editOwn': true, 'articles.editAny': false, 'articles.publish': false, 'articles.delete': false,
      'users.manage': false
    } }
  };

  /* ---------- Хэш пароля ---------- */
  AZS.sha256 = async function (text) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    /* Резерв, если SubtleCrypto недоступен (например, file://) — не криптостойко. */
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < text.length; i++) {
      h1 = (h1 ^ text.charCodeAt(i)) * 16777619 >>> 0;
      h2 = (h2 + text.charCodeAt(i) * (i + 1)) >>> 0;
    }
    return 'fb' + h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  };
  AZS.hashPassword = (pw, salt) => AZS.sha256(String(salt || '') + ':' + String(pw || ''));

  AZS.newSalt = function () {
    const a = new Uint8Array(8);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0;
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  /* ---------- Хранилище пользователей ---------- */
  /* Версия файла data/users.js. Меняется при каждой выгрузке из редактора,
     поэтому опубликованный файл перекрывает устаревший кэш на любом устройстве. */
  const fileVersion = String(AZS.usersUpdatedAt || '');
  const baseUsers = Array.isArray(AZS.users) ? AZS.users.slice() : [];

  /* Кэш храним вместе с версией файла, из которого он получен. */
  function readCache() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (Array.isArray(d)) return { v: null, users: d };          // старый формат
      if (d && Array.isArray(d.users)) return d;
      return null;
    } catch (e) { return null; }
  }
  const cache = readCache();
  /* Кэш используем только если он от той же версии файла. Иначе — файл. */
  AZS.usersData = (cache && cache.v != null && cache.v === fileVersion) ? cache.users : baseUsers;

  AZS.saveUsersData = function (list) {
    AZS.usersData = (list || []).slice();
    try { localStorage.setItem(USERS_KEY, JSON.stringify({ v: AZS.usersUpdatedAt || fileVersion, users: AZS.usersData })); } catch (e) {}
  };
  AZS.resetUsersData = function () {
    AZS.usersData = baseUsers.slice();
    try { localStorage.removeItem(USERS_KEY); } catch (e) {}
  };
  AZS.findUserByLogin = (login) =>
    (AZS.usersData || []).find(u => String(u.login || '').toLowerCase() === String(login || '').toLowerCase());

  /* ---------- Права пользователя ---------- */
  AZS.userPerms = function (user) {
    const base = Object.assign({}, ((AZS.ROLES[user && user.role] || {}).perms) || {});
    if (user && user.permissions) Object.assign(base, user.permissions);
    return base;
  };
  AZS.can = function (perm, user) {
    user = user || AZS.currentUser();
    if (!user || user.active === false) return false;
    return !!AZS.userPerms(user)[perm];
  };

  /* ---------- Сессия ---------- */
  AZS.currentUser = function () {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (!s || !s.uid) return null;
      const u = (AZS.usersData || []).find(x => x.id === s.uid);
      return u && u.active !== false ? u : null;
    } catch (e) { return null; }
  };
  AZS.login = async function (login, password) {
    const u = AZS.findUserByLogin(login);
    if (!u) return { ok: false, message: 'Пользователь с таким логином не найден.' };
    if (u.active === false) return { ok: false, message: 'Учётная запись отключена.' };
    const h = await AZS.hashPassword(password, u.salt);
    if (h !== u.hash) return { ok: false, message: 'Неверный пароль.' };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: u.id, ts: Date.now() })); } catch (e) {}
    return { ok: true, user: u };
  };
  AZS.logout = function () { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} };
})();
