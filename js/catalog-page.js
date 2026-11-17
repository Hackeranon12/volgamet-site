/* Страница каталога: вкладки металлов, поиск, таблицы цен. */
(function () {
  var P = window.PRICES, C = window.Catalog;
  var tabsBox = document.getElementById("tabs");
  var out = document.getElementById("results");
  var input = document.getElementById("q");
  if (!P || !C || !tabsBox) return;

  var NERZH_IMG = { "Лист": 1, "Труба": 2, "Уголок": 3, "Круг": 4, "Шестигранник": 5, "Полоса": 6, "Проволока": 7, "Квадрат": 8 };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function current() {
    var id = location.hash.slice(1);
    return P.metals.filter(function (m) { return m.id === id; })[0] || P.metals[0];
  }

  tabsBox.innerHTML = P.metals.map(function (m) {
    return "<button class=\"tab\" role=\"tab\" type=\"button\" data-id=\"" + m.id + "\"><i class=\"sw-" + m.id + "\"></i>" + esc(m.name) + "</button>";
  }).join("");
  tabsBox.addEventListener("click", function (e) {
    var b = e.target.closest(".tab");
    if (b) { history.replaceState(null, "", "#" + b.getAttribute("data-id")); render(); }
  });

  function renderNerzh(m, q) {
    var list = m.products.filter(function (p) { return C.rowMatches([p, ""], q) || C.rowMatches(["нержавеющий " + p.toLowerCase(), ""], q); });
    if (!list.length) return "";
    return "<div class=\"products\">" + list.map(function (p) {
      var n = NERZH_IMG[p];
      var img = "<div class=\"img-fallback\"></div>";
      return "<article class=\"product\">" + img + "<div><h3>" + esc(p) + "</h3>" +
        "<span class=\"muted\">Цена по запросу</span>" +
        "<button class=\"btn btn-ghost row-btn\" type=\"button\" data-order=\"Нержавейка: " + esc(p.toLowerCase()) + "\">Узнать цену</button></div></article>";
    }).join("") + "</div>";
  }

  function renderSection(s) {
    var head = s.columns.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "<th><span class=\"visually-hidden\">Действие</span></th>";
    var body = s.rows.map(function (r) {
      if (r.length === 1) return "<tr class=\"group\"><td colspan=\"" + (s.columns.length + 1) + "\">" + esc(r[0]) + "</td></tr>";
      var priceCell = r[r.length - 1];
      var num = C.parsePrice(priceCell);
      var item = cap(r[0]) + (r[1] ? " " + r[1] : "");
      var cells = r.map(function (c, i) {
        if (i === r.length - 1) {
          return num != null
            ? "<td class=\"price\">" + esc(priceCell) + " ₽</td>"
            : "<td class=\"price ask\">" + esc(priceCell || "по запросу") + "</td>";
        }
        return "<td>" + esc(i === 0 ? cap(c) : c) + "</td>";
      }).join("");
      var label = num != null ? "Заказать" : "Узнать цену";
      return "<tr>" + cells + "<td class=\"act\"><button class=\"btn btn-ghost row-btn\" type=\"button\" data-order=\"" + esc(item) + "\">" + label + "</button></td></tr>";
    }).join("");
    return "<section class=\"cat-section\"><h2>" + esc(s.title) + "</h2><div class=\"table-wrap\"><table class=\"price-table\"><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table></div></section>";
  }

  function render() {
    var m = current(), q = input.value;
    tabsBox.querySelectorAll(".tab").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-id") === m.id ? "true" : "false");
    });
    var html = m.id === "nerzhaveika" ? renderNerzh(m, q) : "";
    m.sections.forEach(function (s) {
      var f = C.filterSection(s, q);
      if (f.rows.some(function (r) { return r.length > 1; })) html += renderSection(f);
    });
    if (!html) {
      html = "<div class=\"empty\"><h2>Не нашли? Оставьте заявку — проверим склад</h2>" +
        "<p>Бывает, что позиция есть на складе, но её нет в прайсе. Напишите, что нужно, менеджер проверит наличие и перезвонит.</p>" +
        "<button class=\"btn btn-primary\" type=\"button\" data-order=\"" + esc(m.name + ": " + q) + "\">Оставить заявку</button></div>";
    }
    out.innerHTML = html;
  }

  var t;
  input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(render, 120); });
  window.addEventListener("hashchange", render);
  render();
})();
