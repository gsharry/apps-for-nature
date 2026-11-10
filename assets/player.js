(function () {
  var config = window.SITE_CONFIG || {};
  var briefs = window.SITE_BRIEFS || {};
  var apps = (window.SITE_APPS || []).slice();

  var $ = function (id) { return document.getElementById(id); };
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  if (config.siteTitle) { $("site-title").textContent = config.siteTitle; document.title = config.siteTitle; }
  if (config.schoolName) {
    $("welcome-text").textContent = "Year 7 students at " + config.schoolName +
      " built apps that help people learn about trees and the creatures that live on them. You've been given one at random.";
  }

  // ---- Which apps can the QR code pick? ----
  function randomPool() {
    var mode = config.randomFrom || "latest";
    if (mode === "all") return apps;
    var cohort = mode;
    if (mode === "latest") {
      var newest = apps.slice().sort(function (a, b) { return (b.added || "").localeCompare(a.added || ""); })[0];
      cohort = newest ? newest.cohort : null;
    }
    var pool = apps.filter(function (a) { return a.cohort === cohort; });
    return pool.length ? pool : apps;
  }

  // Random, but never the same app twice until every app has been seen.
  function pickRandom(exceptId) {
    var pool = randomPool();
    var seen = store.get("seen") || [];
    var fresh = pool.filter(function (a) { return seen.indexOf(a.id) === -1 && a.id !== exceptId; });
    if (!fresh.length) {
      seen = [];
      fresh = pool.filter(function (a) { return a.id !== exceptId; });
      if (!fresh.length) fresh = pool;
    }
    var app = fresh[Math.floor(Math.random() * fresh.length)];
    seen.push(app.id);
    store.set("seen", seen);
    return app;
  }

  // ---- Feedback: the school's Microsoft Form, shown inside the site ----
  function feedbackLink(app, embed) {
    if (!config.feedbackUrl) return null;
    var url = config.feedbackUrl.split("APPCODE").join(encodeURIComponent(app.id));
    if (embed) {
      try { var u = new URL(url); u.searchParams.set("embed", "true"); url = u.toString(); } catch (e) {}
    }
    return url;
  }

  var rate = {
    sheet: $("rate"), backdrop: $("rate-backdrop"), body: $("rate-body"),
    formFor: null, lastFocus: null
  };

  function openRating() {
    var app = current;
    $("rate-title").textContent = "Rate " + (app.title ? "\u201c" + app.title + "\u201d" : "this app");
    var link = feedbackLink(app, false);
    // Keep a half-filled form if the visitor closes and reopens the same app's form.
    if (rate.formFor !== app.id) {
      rate.body.innerHTML = "";
      if (link) {
        var f = document.createElement("iframe");
        f.title = "Feedback form";
        f.src = feedbackLink(app, true);
        f.setAttribute("allow", "");
        rate.body.appendChild(f);
        $("rate-newtab").href = link;
        $("rate-newtab").hidden = false;
      } else {
        rate.body.innerHTML = '<div class="sheet-empty"><p class="big">★★★★★</p><p>Feedback isn\'t open yet.<br>Please try again soon.</p></div>';
        $("rate-newtab").hidden = true;
        if (window.console) console.info("Apps for Nature: add your Microsoft Forms link as feedbackUrl in assets/config.js to turn on ratings.");
      }
      rate.formFor = app.id;
    }
    rate.lastFocus = document.activeElement;
    rate.backdrop.hidden = false;
    rate.sheet.hidden = false;
    document.body.classList.add("sheet-open");
    $("rate-close").focus();
  }

  function closeRating() {
    rate.sheet.hidden = true;
    rate.backdrop.hidden = true;
    document.body.classList.remove("sheet-open");
    if (rate.lastFocus && rate.lastFocus.focus) rate.lastFocus.focus();
  }

  function show(app) {
    var brief = briefs[app.brief] || briefs.other || { label: "Nature app", colour: "#2f5d2a" };
    $("app-title").textContent = app.title || brief.label;
    var tag = $("app-brief");
    tag.className = "tag";
    tag.style.background = brief.colour;
    tag.textContent = brief.label;
    $("app-code").textContent = "App code: " + app.id;


    var frame = document.createElement("iframe");
    frame.title = app.title || brief.label;
    frame.src = app.path + "index.html";
    // Apps run in a sandbox: they can run code and open links (e.g. Wikipedia)
    // in a new tab, but can't take over or navigate away from this page.
    frame.setAttribute("sandbox",
      "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox");
    var stage = $("stage");
    stage.innerHTML = "";
    stage.appendChild(frame);

    var url = new URL(location.href);
    url.searchParams.set("app", app.id);
    history.replaceState(null, "", url);
  }

  function showEmpty() {
    $("app-title").textContent = "No apps yet";
    $("feedback").hidden = true;
    $("another").hidden = true;
    $("stage").innerHTML = '<div class="empty"><p>The Year 7 apps haven\'t been published yet.<br>Check back soon!</p></div>';
  }

  // ---- Start ----
  if (!apps.length) { showEmpty(); return; }

  var requested = new URL(location.href).searchParams.get("app");
  var current = apps.filter(function (a) { return a.id === requested; })[0] || pickRandom();
  show(current);

  function nextApp() {
    current = pickRandom(current.id);
    show(current);
  }
  $("another").addEventListener("click", nextApp);

  $("feedback").addEventListener("click", openRating);
  $("rate-close").addEventListener("click", closeRating);
  rate.backdrop.addEventListener("click", closeRating);
  $("rate-next").addEventListener("click", function () { closeRating(); nextApp(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !rate.sheet.hidden) closeRating();
  });

  if (config.showWelcome !== false && !store.get("welcomed") && !requested) {
    $("welcome").hidden = false;
    $("start").addEventListener("click", function () {
      $("welcome").hidden = true;
      store.set("welcomed", true);
    });
  }
})();
