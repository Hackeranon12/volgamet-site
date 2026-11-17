/* Логика каталога: поиск и минимальная цена. Чистые функции, тестируются в Node. */
(function (root) {
  function normalize(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/x/g, "х")      // латинская x → кириллическая х
      .replace(/\*/g, "х")
      .replace(/,/g, ".")
      .replace(/\s+/g, " ")
      .trim();
  }


  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function tokenIn(text, token) {
    // Если токен начинается или кончается числом, это число должно совпасть целиком:
    // «40» и «40х3000» не находят «140х3000».
    var re = escapeRe(token);
    if (/^\d/.test(token)) re = "(^|[^\\d.])" + re;
    if (/\d$/.test(token)) re = re + "(?![\\d]|\\.\\d)";
    return new RegExp(re).test(text);
  }

  function rowMatches(row, query) {
    var q = normalize(query);
    if (!q) return true;
    if (row.length === 1) return false;
    var text = normalize(row.join(" "));
    return q.split(" ").every(function (t) { return tokenIn(text, t); });
  }

  function filterSection(section, query) {
    if (!normalize(query)) return Object.assign({}, section, { rows: section.rows.slice() });
    var out = [], group = null;
    section.rows.forEach(function (r) {
      if (r.length === 1) { group = r; return; }
      if (rowMatches(r, query)) {
        if (group) { out.push(group); group = null; }
        out.push(r);
      }
    });
    return Object.assign({}, section, { rows: out });
  }

  function parsePrice(cell) {
    var s = String(cell == null ? "" : cell).replace(/\s/g, "").replace(",", ".");
    return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null;
  }

  function minPricePerKg(metal) {
    var min = null;
    (metal.sections || []).forEach(function (s) {
      if (!s.perKg) return;
      s.rows.forEach(function (r) {
        if (r.length < 2) return;
        var p = parsePrice(r[r.length - 1]);
        if (p != null && (min == null || p < min)) min = p;
      });
    });
    return min;
  }

  var api = { normalize: normalize, rowMatches: rowMatches, filterSection: filterSection,
              parsePrice: parsePrice, minPricePerKg: minPricePerKg };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Catalog = api;
})(this);
