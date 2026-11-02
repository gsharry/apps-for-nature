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

  function feedbackLink(app) {
    if (!config.feedbackUrl) return null;
    return config.feedbackUrl.indexOf("APPCODE") !== -1
      ? config.feedbackUrl.split("APPCODE").join(encodeURIComponent(app.id))
      : config.feedbackUrl;
  }

  function show(app) {
    var brief = briefs[app.brief] || briefs.other || { label: "Nature app", colour: "#2f5d2a" };
    $("app-title").textContent = app.title || brief.label;
    var tag = $("app-brief");
    tag.className = "tag";
    tag.style.background = brief.colour;
    tag.textContent = brief.label;
    $("app-code").textContent = "App code: " + app.id;

    var fb = $("feedback");
    var link = feedbackLink(app);
    if (link) { fb.href = link; fb.removeAttribute("aria-disabled"); fb.hidden = false; }
    else { fb.hidden = true; }

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

  $("another").addEventListener("click", function () {
    current = pickRandom(current.id);
    show(current);
  });

  if (config.showWelcome !== false && !store.get("welcomed") && !requested) {
    $("welcome").hidden = false;
    $("start").addEventListener("click", function () {
      $("welcome").hidden = true;
      store.set("welcomed", true);
    });
  }
})();
