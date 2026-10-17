/* @ds-bundle: {"format":4,"namespace":"Dalama","components":[{"name":"Button"},{"name":"Input"},{"name":"StatusBadge"},{"name":"KpiCard"},{"name":"DataTable"},{"name":"Sidebar"},{"name":"Topbar"},{"name":"Toast"},{"name":"Alert"},{"name":"ConfirmModal"},{"name":"Tabs"},{"name":"Icon"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  var useRef = React.useRef;
  var useEffect = React.useEffect;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(" ");
  }
  function omit(obj, keys) {
    var o = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) === -1) o[k] = obj[k]; }
    return o;
  }

  /* Logo: archivos subidos al sistema. Fuera de este sistema, pasá tu copia por props. */
  var LOGO_NEGATIVO = "/_blob/e2b92f69103bb4004ec5334842b682b7";
  var ISOTIPO_NEGATIVO = "/_blob/5a3e8ccd1b54fd037f4d291153c64819";

  /* Íconos de línea estilo Lucide: grilla 24, trazo 1.5 */
  var PATHS = {
    "home": "M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5",
    "message": "M4 4h16v12H9l-5 4zM8 8.5h8M8 12h5",
    "file-text": "M6 2.5h8.5L19 7v14.5H6zM14 2.5V7h5M9 12h7M9 16h7",
    "package": "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9",
    "truck": "M2 6h12v10H2zM14 9h4l3 3.5V16h-7M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M15 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
    "receipt": "M5.5 2.5h13v19l-3.2-2-3.3 2-3.3-2-3.2 2zM9 8h6M9 12h6M9 16h3.5",
    "users": "M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.6M18 14.2c2.3.6 3.5 2.6 3.5 5.8",
    "wallet": "M3 7h17v13H3zM3 7l12-4v4M15.5 13.5h2",
    "tag": "M3 3h8l10 10-8 8L3 11zM7.5 7.5h.01",
    "boxes": "M3 13h8v8H3zM13 13h8v8h-8zM8 3h8v8H8z",
    "cart": "M2.5 3.5h3l2.5 11.5h10.5L21 7H7M9.5 20h.01M17.5 20h.01",
    "chart": "M4 20V11M10 20V4M16 20v-7M21.5 20h-19",
    "settings": "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4",
    "search": "M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 1 0 0 15M21 21l-5.2-5.2",
    "bell": "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
    "chevron-left": "M15 5l-7 7 7 7",
    "chevron-right": "M9 5l7 7-7 7",
    "chevron-down": "M5 9l7 7 7-7",
    "calendar": "M3.5 5h17v15.5h-17zM3.5 10h17M8 2.5V7M16 2.5V7",
    "plus": "M12 5v14M5 12h14",
    "check": "M4.5 12.5l5 5L19.5 7",
    "x": "M6 6l12 12M18 6 6 18",
    "alert-triangle": "M12 3 22 20.5H2zM12 9.5v5M12 17.5h.01",
    "alert-circle": "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18M12 7.5v6M12 16.5h.01",
    "info": "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18M12 11v6M12 7.5h.01",
    "check-circle": "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18M8 12.5l2.8 2.8L16.5 9.5",
    "clock": "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18M12 7v5l3.5 2",
    "pencil": "M4 20h4L19.5 8.5l-4-4L4 16zM13.5 6.5l4 4",
    "trash": "M4 6.5h16M9 6.5V3.5h6v3M6 6.5l1 14h10l1-14M10 11v6M14 11v6",
    "send": "M3.5 11.5 21 3l-8.5 17.5-2-7z",
    "download": "M12 3.5v12M7 10.5l5 5 5-5M4 20.5h16",
    "eye": "M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zM12 15a3 3 0 1 0 0-6a3 3 0 1 0 0 6",
    "more": "M5 12h.01M12 12h.01M19 12h.01",
    "loader": "M12 3a9 9 0 1 1-9 9",
    "panel-left": "M3.5 4h17v16h-17zM9.5 4v16M15.5 10l-2 2 2 2",
    "panel-right": "M3.5 4h17v16h-17zM9.5 4v16M13.5 10l2 2-2 2",
    "trending-up": "M3 17l6-6 4 4 8-8M15 7h6v6",
    "trending-down": "M3 7l6 6 4-4 8 8M15 17h6v-6",
    "minus": "M5 12h14",
    "inbox": "M3 13h5l1.5 3h5l1.5-3h5M3 13l3-8h12l3 8v7H3z"
  };

  function Icon(props) {
    var size = props.size || 20;
    var d = PATHS[props.name] || PATHS["info"];
    var dots = props.name === "more" || props.name === "tag" || /h\.01/.test(d);
    var attrs = {
      className: cx("dl-icon", props.className),
      width: size, height: size, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: props.strokeWidth || 1.5,
      strokeLinecap: "round", strokeLinejoin: "round"
    };
    if (props.title) { attrs.role = "img"; attrs["aria-label"] = props.title; } else { attrs["aria-hidden"] = "true"; }
    return h("svg", attrs, h("path", { d: d, strokeWidth: dots && props.name === "more" ? 2.5 : undefined }));
  }

  /* 1. Botón */
  function Button(props) {
    var variant = props.variant || "primary";
    var size = props.size || "m";
    var iconSize = size === "s" ? 16 : 20;
    var rest = omit(props, ["variant", "size", "loading", "icon", "iconRight", "demoState", "className", "children", "type"]);
    var kids = [];
    if (props.loading) kids.push(h(Icon, { key: "l", name: "loader", size: iconSize, className: "dl-spin" }));
    else if (props.icon) kids.push(h(Icon, { key: "i", name: props.icon, size: iconSize }));
    if (props.children != null) kids.push(h("span", { key: "t" }, props.children));
    if (props.iconRight && !props.loading) kids.push(h(Icon, { key: "r", name: props.iconRight, size: iconSize }));
    rest.type = props.type || "button";
    rest.className = cx("dl-btn", "dl-btn-" + variant, "dl-btn-" + size,
      props.demoState === "hover" && "is-hover", props.demoState === "active" && "is-active",
      props.loading && "is-loading", props.className);
    if (props.loading) { rest["aria-busy"] = "true"; rest.disabled = true; }
    return h("button", rest, kids);
  }

  /* 2. Input */
  var uid = 0;
  function useId(given) {
    var ref = useRef(null);
    if (ref.current === null) { uid += 1; ref.current = given || "dl-in-" + uid; }
    return ref.current;
  }
  function formatARS(n) {
    return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function parseARS(s) {
    if (s == null) return NaN;
    var clean = String(s).replace(/[^0-9,]/g, "").replace(",", ".");
    return clean === "" ? NaN : parseFloat(clean);
  }
  function Input(props) {
    var kind = props.kind || "text";
    var id = useId(props.id);
    var helpId = id + "-ayuda";
    var initial = props.defaultValue != null ? props.defaultValue : (props.value != null ? props.value : "");
    if (kind === "money" && initial !== "" && typeof initial === "number") initial = formatARS(initial);
    var st = useState(initial);
    var val = st[0], setVal = st[1];
    var controlCls = cx("dl-input-control", kind === "money" && "is-money", props.error && "is-error",
      props.disabled && "is-disabled", props.demoState === "focus" && "is-focus");
    var common = {
      id: id, disabled: props.disabled, placeholder: props.placeholder,
      "aria-invalid": props.error ? "true" : undefined,
      "aria-describedby": (props.error || props.helper) ? helpId : undefined,
      required: props.required
    };
    var control;
    if (kind === "select") {
      control = h("div", { className: controlCls },
        h("select", Object.assign({}, common, { defaultValue: props.defaultValue, onChange: props.onChange }),
          (props.options || []).map(function (o) {
            var v = typeof o === "string" ? o : o.value, l = typeof o === "string" ? o : o.label;
            return h("option", { key: v, value: v }, l);
          })),
        h(Icon, { name: "chevron-down", size: 16, className: "dl-select-chevron" }));
    } else {
      var lead = null, trail = null, inputProps = Object.assign({}, common, {
        value: val,
        onChange: function (e) { setVal(e.target.value); if (props.onChange) props.onChange(e); }
      });
      if (kind === "search") { lead = h(Icon, { name: "search", size: 16 }); inputProps.type = "search"; }
      else if (kind === "date") {
        trail = h(Icon, { name: "calendar", size: 20 }); inputProps.inputMode = "numeric";
        inputProps.placeholder = props.placeholder || "dd/mm/aaaa"; inputProps.maxLength = 10;
      } else if (kind === "money") {
        lead = h("span", { className: "dl-prefix", "aria-hidden": "true" }, "$");
        inputProps.inputMode = "decimal"; inputProps.placeholder = props.placeholder || "0,00";
        inputProps.onBlur = function () { var n = parseARS(val); if (!isNaN(n)) setVal(formatARS(n)); };
        inputProps.onFocus = function () { var n = parseARS(val); if (!isNaN(n)) setVal(String(n).replace(".", ",")); };
      } else { inputProps.type = "text"; }
      control = h("div", { className: controlCls }, lead, h("input", inputProps), trail);
    }
    var help = null;
    if (props.error) help = h("div", { id: helpId, className: "dl-help is-error" }, h(Icon, { name: "alert-circle", size: 16 }), h("span", null, props.error));
    else if (props.helper) help = h("div", { id: helpId, className: "dl-help" }, props.helper);
    return h("div", { className: cx("dl-field", props.className), style: props.style },
      props.label ? h("label", { htmlFor: id, className: "dl-label" }, props.label, props.required ? h("span", { className: "dl-req", "aria-hidden": "true" }, "*") : null) : null,
      control, help);
  }

  /* 3. Badge de estado */
  var STATUS = {
    "borrador": ["neutral", "pencil", "Borrador"],
    "enviado": ["info", "send", "Enviado"],
    "aceptado": ["success", "check", "Aceptado"],
    "rechazado": ["error", "x", "Rechazado"],
    "vencido": ["warning", "clock", "Vencido"],
    "pagado": ["success", "check-circle", "Pagado"],
    "deuda-vencida": ["error", "alert-triangle", "Deuda vencida"],
    "stock-bajo": ["warning", "alert-triangle", "Stock bajo"]
  };
  function StatusBadge(props) {
    var s = STATUS[props.status] || STATUS["borrador"];
    return h("span", { className: cx("dl-badge", "dl-badge-" + s[0], props.className) },
      h(Icon, { name: s[1], size: 14, strokeWidth: 2 }), props.children || s[2]);
  }

  /* 4. Tarjeta KPI */
  function KpiCard(props) {
    var trend = props.trend || "flat";
    var good = props.positive !== undefined ? props.positive : trend === "up";
    var cls = trend === "flat" ? "is-flat" : (good ? "is-good" : "is-bad");
    var icon = trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus";
    return h("section", { className: cx("dl-kpi", props.className), "aria-label": props.label },
      h("div", { className: "dl-kpi-head" },
        h("div", null, h("div", { className: "dl-overline" }, props.label), h("span", { className: "dl-brandline", "aria-hidden": "true" })),
        props.icon ? h(Icon, { name: props.icon, size: 20 }) : null),
      h("div", { className: "dl-kpi-value" }, props.value),
      props.delta ? h("div", { className: "dl-kpi-foot" },
        h("span", { className: cx("dl-delta", cls) }, h(Icon, { name: icon, size: 16, strokeWidth: 2 }), props.delta),
        h("span", null, props.deltaLabel || "vs. período anterior")) : null);
  }

  /* 5. Tabla de datos */
  function DataTable(props) {
    var columns = props.columns || [];
    var rows = props.rows || [];
    var hasActions = typeof props.rowActions === "function";
    var total = props.total != null ? props.total : rows.length;
    var pageSize = props.pageSize || 10;
    var page = props.page || 1;
    var pages = Math.max(1, Math.ceil(total / pageSize));
    var from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    var to = Math.min(total, page * pageSize);
    var go = function (p) { if (props.onPageChange && p >= 1 && p <= pages) props.onPageChange(p); };

    var body;
    if (rows.length === 0) {
      body = h("div", { className: "dl-empty", role: "status" },
        h("div", { className: "dl-empty-mark" }, h(Icon, { name: props.emptyIcon || "inbox", size: 24 })),
        h("p", { className: "dl-empty-title" }, props.emptyTitle || "Todavía no hay datos"),
        props.emptyText ? h("p", { className: "dl-empty-text" }, props.emptyText) : null,
        props.emptyAction || null);
    } else {
      body = h("div", { className: "dl-table-scroll" },
        h("table", { className: "dl-table" },
          props.caption ? h("caption", { style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" } }, props.caption) : null,
          h("thead", null, h("tr", null,
            columns.map(function (c) { return h("th", { key: c.key, scope: "col", className: c.align === "right" ? "is-right" : undefined, style: c.width ? { width: c.width } : undefined }, c.label); }),
            hasActions ? h("th", { scope: "col", className: "is-right" }, h("span", { style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" } }, "Acciones")) : null)),
          h("tbody", null, rows.map(function (r, i) {
            return h("tr", { key: r.id || i, className: props.hoverRow === i ? "is-hover" : undefined },
              columns.map(function (c) {
                var v = c.render ? c.render(r) : r[c.key];
                return h("td", { key: c.key, className: c.align === "right" ? "is-right" : undefined }, v);
              }),
              hasActions ? h("td", { className: "is-right" }, h("div", { className: "dl-row-actions" },
                props.rowActions(r).map(function (a) {
                  return h("button", { key: a.label, type: "button", className: cx("dl-iconbtn", a.danger && "is-danger"), "aria-label": a.label + (r.label ? " " + r.label : ""), title: a.label, onClick: a.onClick },
                    h(Icon, { name: a.icon, size: 16 }));
                }))) : null);
          }))));
    }

    var pager = null;
    if (rows.length > 0 && props.pagination !== false) {
      var nums = [];
      for (var p = 1; p <= pages; p++) {
        if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
        else if (nums[nums.length - 1] !== "…") nums.push("…");
      }
      pager = h("nav", { className: "dl-pager", "aria-label": "Paginación" },
        h("span", { className: "dl-num" }, "Mostrando " + from + "–" + to + " de " + total),
        h("div", { className: "dl-pages" },
          h("button", { type: "button", className: "dl-page", "aria-label": "Página anterior", disabled: page <= 1, onClick: function () { go(page - 1); } }, h(Icon, { name: "chevron-left", size: 16 })),
          nums.map(function (n, i) {
            if (n === "…") return h("span", { key: "e" + i, className: "dl-page", "aria-hidden": "true", style: { border: 0, background: "transparent", cursor: "default" } }, "…");
            return h("button", { key: n, type: "button", className: "dl-page", "aria-current": n === page ? "page" : undefined, "aria-label": "Página " + n, onClick: function () { go(n); } }, n);
          }),
          h("button", { type: "button", className: "dl-page", "aria-label": "Página siguiente", disabled: page >= pages, onClick: function () { go(page + 1); } }, h(Icon, { name: "chevron-right", size: 16 }))));
    }

    return h("section", { className: cx("dl-table-card", props.className), "aria-label": props.title },
      props.title || props.headerAction ? h("div", { className: "dl-table-head" },
        h("div", null, h("div", { className: "dl-overline" }, props.overline || ""), h("h2", { className: "dl-table-title" }, props.title), h("span", { className: "dl-brandline", "aria-hidden": "true" })),
        props.headerAction || null) : null,
      body, pager);
  }

  /* 6. Barra lateral */
  var DEFAULT_NAV = [
    { label: "Operación", items: [
      { id: "inicio", label: "Inicio", icon: "home" },
      { id: "bandeja", label: "Bandeja WhatsApp", icon: "message", count: 5 },
      { id: "presupuestos", label: "Presupuestos", icon: "file-text" },
      { id: "pedidos", label: "Pedidos y entregas", icon: "truck" }]},
    { label: "Administración", items: [
      { id: "facturacion", label: "Facturación", icon: "receipt" },
      { id: "clientes", label: "Clientes", icon: "users" },
      { id: "cuentas", label: "Cuentas corrientes", icon: "wallet" }]},
    { label: "Catálogo", items: [
      { id: "productos", label: "Productos y precios", icon: "tag" },
      { id: "stock", label: "Stock", icon: "boxes" },
      { id: "compras", label: "Compras", icon: "cart" }]},
    { label: "Análisis", items: [
      { id: "reportes", label: "Reportes", icon: "chart" },
      { id: "configuracion", label: "Configuración", icon: "settings" }]}
  ];
  function Sidebar(props) {
    var groups = props.groups || DEFAULT_NAV;
    var ctrl = props.collapsed !== undefined;
    var st = useState(!!props.defaultCollapsed);
    var collapsed = ctrl ? props.collapsed : st[0];
    var toggle = function () { if (props.onToggle) props.onToggle(!collapsed); if (!ctrl) st[1](!collapsed); };
    return h("aside", { className: cx("dl-sidebar", collapsed && "is-collapsed", props.className), style: props.style, "aria-label": "Navegación principal" },
      h("div", { className: "dl-sidebar-logo" },
        collapsed
          ? h("img", { src: props.isotipoSrc || ISOTIPO_NEGATIVO, alt: "DALAMA", width: 36, style: { width: 36 } })
          : h("img", { src: props.logoSrc || LOGO_NEGATIVO, alt: "DALAMA · Accesorios para aberturas", width: 196, style: { width: 196 } })),
      h("nav", { className: "dl-nav" }, groups.map(function (g) {
        return h("div", { key: g.label, className: "dl-nav-group" },
          h("div", { className: "dl-nav-heading" }, g.label),
          g.items.map(function (it) {
            var active = it.id === props.active;
            return h("a", { key: it.id, href: it.href || "#" + it.id, className: "dl-nav-item", "aria-current": active ? "page" : undefined, title: collapsed ? it.label : undefined,
              onClick: function (e) { if (props.onNavigate) { e.preventDefault(); props.onNavigate(it.id); } } },
              h(Icon, { name: it.icon, size: 20 }),
              h("span", { className: "dl-nav-label" }, it.label),
              it.count ? h("span", { className: "dl-nav-count", "aria-label": it.count + " sin leer" }, it.count) : null);
          }));
      })),
      h("div", { className: "dl-sidebar-foot" },
        h("button", { type: "button", className: "dl-nav-item", onClick: toggle, "aria-expanded": collapsed ? "false" : "true", title: collapsed ? "Expandir menú" : undefined },
          h(Icon, { name: collapsed ? "panel-right" : "panel-left", size: 20 }),
          h("span", { className: "dl-nav-label" }, collapsed ? "Expandir menú" : "Colapsar menú"))));
  }

  /* 7. Barra superior */
  function Topbar(props) {
    var user = props.user || { name: "Laura V.", role: "Administradora", initials: "LM" };
    return h("header", { className: cx("dl-topbar", props.className) },
      h("div", { className: "dl-topbar-title" },
        props.overline ? h("div", { className: "dl-overline" }, props.overline) : null,
        h("h1", null, props.title)),
      h("div", { className: "dl-topbar-tools" },
        h("label", { className: "dl-search" },
          h(Icon, { name: "search", size: 16 }),
          h("span", { style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" } }, "Buscar en DALAMA"),
          h("input", { type: "search", placeholder: props.searchPlaceholder || "Buscar cliente, producto o comprobante" }),
          h("span", { className: "dl-kbd", "aria-hidden": "true" }, "Ctrl K")),
        h("button", { type: "button", className: "dl-iconbtn dl-bell", "aria-label": "Notificaciones" + (props.notifications ? ": " + props.notifications + " nuevas" : "") },
          h(Icon, { name: "bell", size: 20 }),
          props.notifications ? h("span", { className: "dl-bell-dot", "aria-hidden": "true" }, props.notifications) : null),
        h("div", { className: "dl-user" },
          h("span", { className: "dl-avatar", "aria-hidden": "true" }, user.initials),
          h("div", null, h("div", { className: "dl-user-name" }, user.name), h("div", { className: "dl-user-role" }, user.role)))));
  }

  /* 8. Toast y alerta */
  var TONE_ICON = { success: "check-circle", warning: "alert-triangle", error: "alert-circle", info: "info" };
  var TONE_WORD = { success: "Éxito", warning: "Advertencia", error: "Error", info: "Información" };
  function Toast(props) {
    var tone = props.tone || "success";
    return h("div", { className: cx("dl-toast", "dl-tone-" + tone, props.className), role: tone === "error" ? "alert" : "status", style: props.style },
      h("span", { className: "dl-tone-ico" }, h(Icon, { name: TONE_ICON[tone], size: 20, title: TONE_WORD[tone] })),
      h("div", { className: "dl-msg-body" },
        h("p", { className: "dl-msg-title" }, props.title),
        props.children ? h("p", { className: "dl-msg-text" }, props.children) : null,
        props.action ? h("div", { className: "dl-msg-action" }, props.action) : null),
      props.onClose !== false ? h("button", { type: "button", className: "dl-iconbtn", "aria-label": "Cerrar aviso", onClick: props.onClose || undefined, style: { marginTop: -6, marginRight: -6 } }, h(Icon, { name: "x", size: 16 })) : null);
  }
  function Alert(props) {
    var tone = props.tone || "info";
    return h("div", { className: cx("dl-alert", "dl-tone-" + tone, props.className), role: tone === "error" ? "alert" : "status" },
      h(Icon, { name: TONE_ICON[tone], size: 20, title: TONE_WORD[tone] }),
      h("div", { className: "dl-msg-body" },
        props.title ? h("p", { className: "dl-msg-title" }, props.title) : null,
        props.children ? h("p", { className: "dl-msg-text" }, props.children) : null),
      props.action || null);
  }

  /* 9. Modal de confirmación */
  function ConfirmModal(props) {
    var titleId = useId(props.id ? props.id + "-t" : null);
    var textId = titleId + "-d";
    var dialogRef = useRef(null);
    useEffect(function () {
      if (!props.open || props.inline) return;
      var el = dialogRef.current; if (el) { var b = el.querySelector("button"); if (b) b.focus(); }
      var onKey = function (e) { if (e.key === "Escape" && props.onCancel) props.onCancel(); };
      document.addEventListener("keydown", onKey);
      return function () { document.removeEventListener("keydown", onKey); };
    }, [props.open, props.inline]);
    if (!props.open) return null;
    var destructive = !!props.destructive;
    return h("div", { className: cx("dl-overlay", props.inline && "is-inline"), onClick: function (e) { if (e.target === e.currentTarget && props.onCancel) props.onCancel(); } },
      h("div", { ref: dialogRef, className: "dl-modal", role: "alertdialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": textId },
        h("div", { className: "dl-modal-head" + (destructive ? " dl-tone-error" : " dl-tone-info") },
          h("span", { className: "dl-tone-ico" }, h(Icon, { name: destructive ? "alert-triangle" : "info", size: 20 })),
          h("div", null,
            h("h2", { id: titleId, className: "dl-modal-title" }, props.title),
            h("p", { id: textId, className: "dl-modal-text" }, props.children))),
        h("div", { className: "dl-modal-actions" },
          h(Button, { variant: "secondary", onClick: props.onCancel }, props.cancelLabel || "Cancelar"),
          h(Button, { variant: destructive ? "destructive" : "primary", onClick: props.onConfirm, loading: props.loading, className: destructive ? "is-solid" : undefined }, props.confirmLabel || "Confirmar"))));
  }

  /* 10. Tabs */
  function Tabs(props) {
    var tabs = props.tabs || [];
    var ctrl = props.value !== undefined;
    var st = useState(props.defaultValue || (tabs[0] && tabs[0].id));
    var value = ctrl ? props.value : st[0];
    var refs = useRef({});
    var select = function (id) { if (!ctrl) st[1](id); if (props.onChange) props.onChange(id); };
    var onKey = function (e) {
      var enabled = tabs.filter(function (t) { return !t.disabled; });
      var i = enabled.findIndex(function (t) { return t.id === value; });
      var n = null;
      if (e.key === "ArrowRight") n = enabled[(i + 1) % enabled.length];
      if (e.key === "ArrowLeft") n = enabled[(i - 1 + enabled.length) % enabled.length];
      if (n) { e.preventDefault(); select(n.id); var el = refs.current[n.id]; if (el) el.focus(); }
    };
    return h("div", { className: cx("dl-tabs", props.className), role: "tablist", "aria-label": props.label || "Secciones", onKeyDown: onKey },
      tabs.map(function (t) {
        var sel = t.id === value;
        return h("button", { key: t.id, ref: function (el) { refs.current[t.id] = el; }, type: "button", role: "tab", className: "dl-tab", "aria-selected": sel ? "true" : "false", tabIndex: sel ? 0 : -1, disabled: t.disabled, onClick: function () { select(t.id); } },
          t.label, t.count != null ? h("span", { className: "dl-tab-count" }, t.count) : null);
      }));
  }

  window.Dalama = {
    Button: Button, Input: Input, StatusBadge: StatusBadge, KpiCard: KpiCard, DataTable: DataTable,
    Sidebar: Sidebar, Topbar: Topbar, Toast: Toast, Alert: Alert, ConfirmModal: ConfirmModal, Tabs: Tabs, Icon: Icon,
    formatARS: formatARS, STATUS: STATUS, ICON_NAMES: Object.keys(PATHS)
  };
})();
