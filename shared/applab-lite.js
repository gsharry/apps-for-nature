/*
 * applab-lite.js
 * A small stand-in for code.org's App Lab library, so apps exported from
 * App Lab run on our own website. It provides the common App Lab commands
 * (onEvent, getText, setScreen, setProperty, timedLoop, lists, ...) and then
 * runs the student's code.js. tools/manage_apps.py adds it to each App Lab app.
 *
 * Not supported: Turtle and Canvas drawing, code.org datasets (getColumn),
 * web requests. The checker flags apps that use them.
 * Data blocks (setKeyValue, createRecord, ...) save on the visitor's own
 * device only, never to a server.
 */
(function () {
  "use strict";
  var W = window;

  function el(id) {
    var e = document.getElementById(String(id));
    if (!e) console.warn("App Lab: no element with id \"" + id + "\"");
    return e;
  }
  function tag(e) { return e ? e.tagName.toLowerCase() : ""; }
  function isField(e) { var t = tag(e); return t === "input" || t === "textarea" || t === "select"; }
  function cssColour(c) { return c == null ? "" : String(c); }

  // ---------------- UI: screens, text, visibility ----------------
  W.setScreen = function (id) {
    var target = el(id);
    if (!target) return;
    var screens = document.querySelectorAll("#divApplab > .screen");
    for (var i = 0; i < screens.length; i++) screens[i].style.display = "none";
    target.style.display = "block";
    W.__currentScreen = target.id;
    paintBackground();
  };
  function paintBackground() {
    var s = document.getElementById(W.__currentScreen);
    var bg = s && getComputedStyle(s).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") document.documentElement.style.background = bg;
  }

  W.getText = function (id) {
    var e = el(id);
    if (!e) return "";
    if (tag(e) === "select") return e.options[e.selectedIndex] ? e.options[e.selectedIndex].text : "";
    if (isField(e)) return e.value;
    return e.innerText;
  };
  W.setText = function (id, text) {
    var e = el(id);
    if (!e) return;
    text = text == null ? "" : String(text);
    if (tag(e) === "select") { for (var i = 0; i < e.options.length; i++) if (e.options[i].text === text) e.selectedIndex = i; }
    else if (isField(e)) e.value = text;
    else e.innerText = text;
  };
  W.getNumber = function (id) { return parseFloat(W.getText(id)); };
  W.setNumber = function (id, n) { W.setText(id, n); };
  W.getChecked = function (id) { var e = el(id); return !!(e && e.checked); };
  W.setChecked = function (id, v) { var e = el(id); if (e) e.checked = !!v; };
  W.getImageURL = function (id) { var e = el(id); return e ? (e.getAttribute("src") || "") : ""; };
  W.setImageURL = function (id, url) {
    var e = el(id);
    if (!e) return;
    if (tag(e) === "img") e.src = url;
    else { e.style.backgroundImage = "url('" + url + "')"; e.style.backgroundSize = "contain"; e.style.backgroundRepeat = "no-repeat"; e.style.backgroundPosition = "center"; }
  };
  W.showElement = function (id) { var e = el(id); if (e) { e.style.visibility = "visible"; if (e.style.display === "none") e.style.display = ""; } };
  W.hideElement = function (id) { var e = el(id); if (e) e.style.visibility = "hidden"; };
  W.deleteElement = function (id) { var e = el(id); if (e && e.parentNode) e.parentNode.removeChild(e); };
  W.setPosition = function (id, x, y, w, h) {
    var e = el(id);
    if (!e) return;
    e.style.position = "absolute";
    if (x != null) e.style.left = x + "px";
    if (y != null) e.style.top = y + "px";
    if (w != null) e.style.width = w + "px";
    if (h != null) e.style.height = h + "px";
  };
  W.setSize = function (id, w, h) { W.setPosition(id, null, null, w, h); };
  W.getXPosition = function (id) { var e = el(id); return e ? e.offsetLeft : 0; };
  W.getYPosition = function (id) { var e = el(id); return e ? e.offsetTop : 0; };
  W.setStyle = function (id, css) { var e = el(id); if (e) e.style.cssText += ";" + css; };
  W.setFocus = function (id) { var e = el(id); if (e) e.focus(); };

  var PROPS = {
    "text-color": "color", "background-color": "backgroundColor", "border-color": "borderColor",
    "font-family": "fontFamily", "text-align": "textAlign", "font-size": "fontSize",
    "border-width": "borderWidth", "border-radius": "borderRadius", "width": "width",
    "height": "height", "x": "left", "y": "top"
  };
  var PX = { "font-size": 1, "border-width": 1, "border-radius": 1, "width": 1, "height": 1, "x": 1, "y": 1 };

  W.setProperty = function (id, prop, value) {
    var e = el(id);
    if (!e) return;
    prop = String(prop).toLowerCase();
    switch (prop) {
      case "text": return W.setText(id, value);
      case "value": if (isField(e)) e.value = value; else W.setText(id, value); return;
      case "placeholder": e.placeholder = value; return;
      case "hidden": return value ? W.hideElement(id) : W.showElement(id);
      case "checked": e.checked = !!value; return;
      case "image": case "picture": return W.setImageURL(id, value);
      case "icon-color": e.style.color = cssColour(value); return;
      case "options":
        if (tag(e) === "select") {
          e.innerHTML = "";
          (value || []).forEach(function (o) { var opt = document.createElement("option"); opt.text = o; e.add(opt); });
        }
        return;
      case "index": if (tag(e) === "select") e.selectedIndex = value; return;
      case "readonly": e.readOnly = !!value; return;
      case "fit": e.style.objectFit = value; return;
    }
    if (PROPS[prop]) {
      e.style[PROPS[prop]] = PX[prop] && typeof value === "number" ? value + "px" : cssColour(value);
      if (prop === "x" || prop === "y") e.style.position = "absolute";
    }
  };
  W.getProperty = function (id, prop) {
    var e = el(id);
    if (!e) return undefined;
    prop = String(prop).toLowerCase();
    switch (prop) {
      case "text": return W.getText(id);
      case "value": return isField(e) ? e.value : W.getText(id);
      case "placeholder": return e.placeholder;
      case "hidden": return e.style.visibility === "hidden";
      case "checked": return e.checked;
      case "image": case "picture": return W.getImageURL(id);
      case "index": return e.selectedIndex;
      case "options": return tag(e) === "select" ? Array.prototype.map.call(e.options, function (o) { return o.text; }) : [];
      case "x": return e.offsetLeft;
      case "y": return e.offsetTop;
      case "width": return e.offsetWidth;
      case "height": return e.offsetHeight;
    }
    if (PROPS[prop]) return getComputedStyle(e)[PROPS[prop]];
    return undefined;
  };

  // ---------------- Events ----------------
  var EVENT_MAP = { click: "click", change: "change", input: "input", keydown: "keydown", keyup: "keyup",
    keypress: "keypress", mousedown: "mousedown", mouseup: "mouseup", mousemove: "mousemove",
    mouseover: "mouseover", mouseout: "mouseout", dblclick: "dblclick" };
  W.onEvent = function (id, type, callback) {
    var e = el(id);
    if (!e || typeof callback !== "function") return;
    var domType = EVENT_MAP[type] || type;
    var target = (domType.indexOf("key") === 0 && e.classList.contains("screen")) ? document : e;
    target.addEventListener(domType, function (ev) {
      if (domType.indexOf("key") === 0 && target === document && W.__currentScreen && W.__currentScreen !== e.id) return;
      var rect = e.getBoundingClientRect();
      var scale = W.__appScale || 1;
      callback({
        type: type, targetId: (ev.target && ev.target.id) || e.id, currentTargetId: e.id,
        key: ev.key, keyCode: ev.keyCode, shiftKey: ev.shiftKey, ctrlKey: ev.ctrlKey, altKey: ev.altKey,
        x: ev.clientX != null ? Math.round((ev.clientX - rect.left) / scale) : undefined,
        y: ev.clientY != null ? Math.round((ev.clientY - rect.top) / scale) : undefined,
        offsetX: ev.offsetX, offsetY: ev.offsetY
      });
    });
  };

  // ---------------- Creating elements ----------------
  function screenNow() {
    return document.getElementById(W.__currentScreen) || document.querySelector("#divApplab > .screen");
  }
  function make(kind, id, setup) {
    var e = document.createElement(kind);
    e.id = id;
    e.style.position = "relative";
    setup(e);
    screenNow().appendChild(e);
    return e;
  }
  W.button = function (id, text) { make("button", id, function (e) { e.textContent = text; }); };
  W.textInput = function (id, text) { make("input", id, function (e) { e.value = text || ""; }); };
  W.textLabel = function (id, text) { make("label", id, function (e) { e.innerText = text || ""; e.style.display = "block"; }); };
  W.image = function (id, url) { make("img", id, function (e) { e.src = url; }); };
  W.dropdown = function (id) {
    var items = Array.prototype.slice.call(arguments, 1);
    make("select", id, function (e) { items.forEach(function (o) { var opt = document.createElement("option"); opt.text = o; e.add(opt); }); });
  };
  W.checkbox = function (id, checked) { make("input", id, function (e) { e.type = "checkbox"; e.checked = !!checked; }); };
  W.radioButton = function (id, checked, group) { make("input", id, function (e) { e.type = "radio"; e.checked = !!checked; if (group) e.name = group; }); };
  W.write = function (text) {
    var d = document.createElement("div");
    d.innerHTML = String(text);
    d.style.position = "relative";
    screenNow().appendChild(d);
  };

  // ---------------- Sound ----------------
  var sounds = {};
  function soundUrl(url) {
    url = String(url);
    return url.indexOf("sound://") === 0 ? "https://studio.code.org/api/v1/sound-library/" + url.slice(8) : url;
  }
  W.playSound = function (url, loop) {
    var a = new Audio(soundUrl(url));
    a.loop = !!loop;
    (sounds[url] = sounds[url] || []).push(a);
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
  };
  W.stopSound = function (url) {
    Object.keys(sounds).forEach(function (k) {
      if (url == null || k === url) { sounds[k].forEach(function (a) { a.pause(); }); sounds[k] = []; }
    });
  };
  W.playSpeech = function (text) {
    if (W.speechSynthesis) W.speechSynthesis.speak(new SpeechSynthesisUtterance(String(text)));
  };

  // ---------------- Timing, maths, lists ----------------
  var loops = [];
  W.timedLoop = function (ms, cb) { var h = setInterval(cb, ms); loops.push(h); return h; };
  W.stopTimedLoop = function (h) {
    if (h == null) { loops.forEach(clearInterval); loops = []; }
    else { clearInterval(h); loops = loops.filter(function (x) { return x !== h; }); }
  };
  W.getTime = function () { return Date.now(); };
  W.randomNumber = function (min, max) {
    if (max == null) { max = min; min = 0; }
    min = Math.ceil(min); max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  W.appendItem = function (list, item) { list.push(item); };
  W.insertItem = function (list, index, item) { list.splice(index, 0, item); };
  W.removeItem = function (list, index) { list.splice(index, 1); };
  W.promptNum = function (q) { return parseFloat(W.prompt(q)); };
  W.open = (function (orig) { return function (url) { return orig.call(W, url, "_blank", "noopener"); }; })(W.open);

  // ---------------- Data (this device only) ----------------
  var KEY = "applab:" + location.pathname + ":";
  function load(k, fallback) { try { var v = localStorage.getItem(KEY + k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }
  function later(fn) { setTimeout(fn, 0); }
  W.setKeyValue = function (k, v, cb) { save("kv:" + k, v); if (cb) later(cb); };
  W.getKeyValue = function (k, cb) { var v = load("kv:" + k, undefined); if (cb) later(function () { cb(v); }); };
  W.createRecord = function (table, rec, cb) {
    var rows = load("t:" + table, []);
    rec = Object.assign({}, rec, { id: rows.reduce(function (m, r) { return Math.max(m, r.id); }, 0) + 1 });
    rows.push(rec); save("t:" + table, rows);
    if (cb) later(function () { cb(rec); });
  };
  function matches(r, q) { return Object.keys(q || {}).every(function (k) { return r[k] === q[k]; }); }
  W.readRecords = function (table, q, cb) {
    var rows = load("t:" + table, []).filter(function (r) { return matches(r, q); });
    if (cb) later(function () { cb(rows); });
  };
  W.updateRecord = function (table, rec, cb) {
    var rows = load("t:" + table, []);
    var ok = false;
    rows = rows.map(function (r) { if (r.id === rec.id) { ok = true; return rec; } return r; });
    save("t:" + table, rows);
    if (cb) later(function () { cb(rec, ok); });
  };
  W.deleteRecord = function (table, rec, cb) {
    var rows = load("t:" + table, []);
    var before = rows.length;
    save("t:" + table, rows.filter(function (r) { return r.id !== rec.id; }));
    if (cb) later(function () { cb(rows.length !== before); });
  };
  W.getUserId = function () {
    var id = load("uid", null);
    if (!id) { id = "visitor-" + Math.random().toString(36).slice(2, 10); save("uid", id); }
    return id;
  };

  // ---------------- Fit the 320 x 450 app to the screen ----------------
  function fit() {
    var app = document.getElementById("divApplab");
    if (!app) return;
    var w = app.offsetWidth || 320, h = app.offsetHeight || 450;
    var scale = Math.min(W.innerWidth / w, W.innerHeight / h);
    scale = Math.max(0.5, Math.min(scale, 2.5));
    W.__appScale = scale;
    app.style.transformOrigin = "top left";
    app.style.transform = "scale(" + scale + ")";
    app.style.position = "absolute";
    app.style.top = "0";
    app.style.left = Math.max(0, (W.innerWidth - w * scale) / 2) + "px";
  }

  // ---------------- Start ----------------
  function start() {
    document.documentElement.style.background = "#fff";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    var screens = document.querySelectorAll("#divApplab > .screen");
    var shown = null;
    for (var i = 0; i < screens.length; i++) if (screens[i].style.display !== "none") { shown = screens[i]; break; }
    W.__currentScreen = (shown || screens[0] || {}).id;
    paintBackground();
    fit();
    W.addEventListener("resize", fit);
    var s = document.createElement("script");
    s.src = "code.js";
    document.body.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
