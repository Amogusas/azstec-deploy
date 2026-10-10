/* AZS Technologies — хранилище материалов (общая точка для сайта и редактора) */
(function () {
  const AZS = (window.AZS = window.AZS || {});
  const KEY = 'azs_news_store';

  /* Декодирование HTML-сущностей: защита от попадания &quot; и т.п. в заголовки. */
  const ENT = {
    '&quot;': '"', '&#34;': '"', '&#039;': "'", '&#39;': "'", '&apos;': "'",
    '&laquo;': '«', '&raquo;': '»', '&nbsp;': ' ', '&amp;': '&',
    '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”'
  };
  AZS.decodeEntities = function (s) {
    return String(s == null ? '' : s)
      .replace(/&#(\d+);/g, (m, n) => { try { return String.fromCodePoint(+n); } catch (e) { return m; } })
      .replace(/&#x([0-9a-f]+);/gi, (m, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch (e) { return m; } })
      .replace(/&[a-z]+;|&#\d+;/gi, m => (ENT[m.toLowerCase()] != null ? ENT[m.toLowerCase()] : m));
  };
  AZS.cleanText = (s) => AZS.decodeEntities(s).replace(/\s+/g, ' ').trim();

  function normalizeItem(n) {
    if (!n || typeof n !== 'object') return n;
    const o = Object.assign({}, n);
    o.title = AZS.cleanText(o.title);
    o.author = AZS.cleanText(o.author);
    o.excerpt = AZS.cleanText(o.excerpt);
    if (Array.isArray(o.tags)) o.tags = o.tags.map(AZS.cleanText);
    o.type = o.type === 'article' ? 'article' : 'news';
    if (!o.status) o.status = 'published';
    return o;
  }
  AZS.normalizeItems = function (list) { return (list || []).map(normalizeItem); };

  function readCache() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (Array.isArray(d)) return { v: null, items: d };            // старый формат
      if (d && Array.isArray(d.items)) return d;
      return null;
    } catch (e) { return null; }
  }

  const fileVersion = String(AZS.newsUpdatedAt || '');
  const base = Array.isArray(AZS.newsData) ? AZS.newsData.slice() : [];
  const cache = readCache();
  /* Кэш используем только если он от той же версии файла. Иначе — файл. */
  AZS.newsData = AZS.normalizeItems((cache && cache.v != null && cache.v === fileVersion) ? cache.items : base);

  /* Ключ даты для сортировки. Понимает «дд.мм.гггг» и «гггг-мм-дд». */
  AZS.dateKey = function (d) {
    const s = String(d == null ? '' : d).trim();
    let m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m) return m[3] + m[2] + m[1];
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return m[1] + m[2] + m[3];
    return '00000000';
  };

  /* Публичный сайт читает AZS.news / AZS.articles — только опубликованное,
     отсортированное по дате (сначала свежие). */
  AZS.applyNews = function () {
    const all = AZS.newsData || [];
    const pub = all.filter(n => n.status !== 'draft');
    const byDate = (a, b) => AZS.dateKey(b.date).localeCompare(AZS.dateKey(a.date));
    AZS.news = pub.filter(n => n.type === 'news').sort(byDate);
    AZS.articles = pub.filter(n => n.type === 'article').sort(byDate);
  };

  AZS.saveNewsData = function (list) {
    AZS.newsData = AZS.normalizeItems(list);
    try { localStorage.setItem(KEY, JSON.stringify({ v: AZS.newsUpdatedAt || fileVersion, items: AZS.newsData })); } catch (e) {}
    AZS.applyNews();
  };

  AZS.resetNewsData = function () {
    AZS.newsData = AZS.normalizeItems(base);
    try { localStorage.removeItem(KEY); } catch (e) {}
    AZS.applyNews();
  };

  AZS.newsExport = function () {
    /* Проставляем новую версию — чтобы опубликованный файл перекрыл
       устаревший кэш на других устройствах. */
    AZS.newsUpdatedAt = new Date().toISOString();
    AZS.saveNewsData(AZS.newsData);
    return 'window.AZS=window.AZS||{};\n'
      + 'window.AZS.newsUpdatedAt=' + JSON.stringify(AZS.newsUpdatedAt) + ';\n'
      + 'window.AZS.newsData=' + JSON.stringify(AZS.newsData || []) + ';\n';
  };

  AZS.applyNews();
})();
