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

  function readLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      return Array.isArray(d) ? d : null;
    } catch (e) { return null; }
  }

  const base = Array.isArray(AZS.newsData) ? AZS.newsData.slice() : [];
  const local = readLocal();
  AZS.newsData = AZS.normalizeItems(local || base);

  /* Публичный сайт читает AZS.news / AZS.articles — только опубликованное. */
  AZS.applyNews = function () {
    const all = AZS.newsData || [];
    const pub = all.filter(n => n.status !== 'draft');
    AZS.news = pub.filter(n => n.type === 'news');
    AZS.articles = pub.filter(n => n.type === 'article');
  };

  AZS.saveNewsData = function (list) {
    AZS.newsData = AZS.normalizeItems(list);
    try { localStorage.setItem(KEY, JSON.stringify(AZS.newsData)); } catch (e) {}
    AZS.applyNews();
  };

  AZS.resetNewsData = function () {
    AZS.newsData = AZS.normalizeItems(base);
    try { localStorage.removeItem(KEY); } catch (e) {}
    AZS.applyNews();
  };

  AZS.newsExport = function () {
    return 'window.AZS=window.AZS||{};\nwindow.AZS.newsData='
      + JSON.stringify(AZS.newsData || []) + ';\n';
  };

  AZS.applyNews();
})();
