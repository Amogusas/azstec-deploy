window.AZS=window.AZS||{};
/* ------------------------------------------------------------------
   Пользователи редактора и их права.

   Роли: admin (Администратор), editor (Редактор), author (Автор).
   Права в поле "permissions" можно включать/выключать индивидуально —
   так вы выдаёте конкретные права конкретному человеку.
   Пароль хранится как хэш (SHA-256 от salt + ":" + пароль).

   Вход по умолчанию: admin / admin123 — обязательно смените пароль.
------------------------------------------------------------------ */
window.AZS.usersUpdatedAt="2026-01-01T00:00:00.000Z";
window.AZS.users=[
  {
    "id": "u_admin",
    "login": "admin",
    "name": "Администратор сайта",
    "email": "azstec@mail.ru",
    "role": "admin",
    "active": true,
    "salt": "azstec2026",
    "hash": "d7c548640774716ba3db7cdb51fd6bfaac3b6525847bd6e3f94f5fcdd30982fc",
    "permissions": {
      "news.view": true, "news.create": true, "news.editOwn": true, "news.editAny": true, "news.publish": true, "news.delete": true,
      "articles.view": true, "articles.create": true, "articles.editOwn": true, "articles.editAny": true, "articles.publish": true, "articles.delete": true,
      "users.manage": true
    },
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
];
