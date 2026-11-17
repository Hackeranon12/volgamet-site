/* Общее для всех страниц: заявка, модалка, карточки металлов, бирка. */
(function () {
  var DONE = "<div class=\"order-done\" role=\"status\"><b>Заявка отправлена</b>Перезвоним в рабочее время: Пн–Пт, 9:00–17:00.</div>";

  // Демо: форма никуда не отправляет данные
  function bindForm(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.innerHTML = DONE;
    });
  }
  document.querySelectorAll(".order-form").forEach(bindForm);

  var modal = document.getElementById("order");
  var lastFocus = null;
  var formTemplate = modal ? modal.querySelector(".modal-box").innerHTML : "";

  function openOrder(prefill) {
    if (!modal) return;
    lastFocus = document.activeElement;
    var box = modal.querySelector(".modal-box");
    box.innerHTML = formTemplate;
    bindForm(box.querySelector(".order-form"));
    box.querySelector(".modal-close").addEventListener("click", closeOrder);
    var field = box.querySelector("textarea");
    field.value = prefill || "";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    (prefill ? box.querySelector("input[type=tel]") : field).focus();
  }
  function closeOrder() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  window.openOrder = openOrder;

  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal) closeOrder(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) closeOrder(); });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-order]");
    if (!t) return;
    e.preventDefault();
    openOrder(t.getAttribute("data-order"));
  });

  var P = window.PRICES, C = window.Catalog;
  if (!P || !C) return;

  function fmt(n) { return String(n).replace(".", ","); }

  // Главная: карточки металлов
  var FORMS = {
    nerzhaveika: "Лист, круг, труба, уголок, проволока",
    med: "Круг, лист, труба, лента, шина",
    latun: "Круг, лист, шестигранник, труба",
    bronza: "Круг, лента, втулки под заказ",
    aliuminii: "Круг, лист, плита, труба"
  };
  var metalsBox = document.getElementById("metals");
  if (metalsBox) {
    metalsBox.innerHTML = P.metals.map(function (m) {
      var min = C.minPricePerKg(m);
      return "<a class=\"metal\" href=\"catalog.html#" + m.id + "\">" +
        "<div class=\"metal-swatch sw-" + m.id + "\"></div>" +
        "<div class=\"metal-body\"><h3>" + m.name + "</h3>" +
        "<span class=\"muted\">" + FORMS[m.id] + "</span>" +
        (min != null
          ? "<span class=\"metal-price\">от " + fmt(min) + " ₽/кг</span>"
          : "<span class=\"metal-price ask\">Цена по запросу</span>") +
        "</div></a>";
    }).join("");
  }

  // Главная: бирка с реальной позицией из прайса
  var tag = document.getElementById("tag");
  if (tag) {
    var pool = [];
    P.metals.forEach(function (m) {
      m.sections.forEach(function (s) {
        if (!s.perKg) return;
        s.rows.forEach(function (r) {
          if (r.length > 2 && C.parsePrice(r[2]) != null && r[1]) pool.push({ m: m, r: r });
        });
      });
    });
    var i = Math.floor(Math.random() * pool.length);
    function show() {
      var it = pool[i % pool.length];
      var name = it.r[0].charAt(0).toUpperCase() + it.r[0].slice(1);
      tag.querySelector(".tag-metal").textContent = it.m.name + " · со склада в Ульяновске";
      tag.querySelector(".tag-name").textContent = name;
      tag.querySelector(".tag-size").textContent = "Размер: " + it.r[1];
      tag.querySelector(".tag-price").innerHTML = fmt(C.parsePrice(it.r[2])) + " ₽ <small>за кг</small>";
      tag.querySelector("[data-order]").setAttribute("data-order", name + " " + it.r[1]);
    }
    if (pool.length) {
      show();
      tag.querySelector(".tag-next").addEventListener("click", function () { i += 1 + Math.floor(Math.random() * 40); show(); });
    }
  }
})();
