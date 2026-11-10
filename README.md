# Apps for Nature: student app website

A small website that hosts every Year 7 app. The QR code opens a random app;
visitors try it, rate it on a Microsoft Form, and can tap **Another app**.

```
apps-for-nature/
  site/        THE WEBSITE: the only folder you upload
    index.html      random app player (the QR code points here)
    gallery.html    every app, filterable by brief and year
    assets/config.js   your settings: school name, feedback form link
    apps/           published apps, sorted by brief: apps/leaf/, apps/age/ …
  tools/
    manage_apps.py  checks and publishes apps (needs only Python 3)
    settings.json   cohort name, class list location, allowed websites
  incoming/    students' exported .zip files, in a folder per brief:
               leaf/  age/  minibeast/  survey/  other/
  review/      created by the tool: report + checklist, staff only
```

Three sample apps are already published so you can see it working. Remove them
before going live: `python tools/manage_apps.py remove --cohort sample`

---

## 1. Each year: add the apps

1. **Export** each finished app as HTML/CSS/JS (a .zip). Rename nothing. Drop each zip
   into the `incoming/` folder for its brief (`leaf`, `age`, `minibeast`, `survey`, `other`):
   that's what files it under the right button on the website. An unzipped folder with
   an `index.html` works too. Zips left loose in `incoming/` still work; the tool guesses
   their brief from words in the app (e.g. "girth" → age), so check its guess in step 6.
2. **Set the year** in `tools/settings.json` (`"cohort": "2026-27"`). App codes
   become `2026-27-001`, `2026-27-002`, … No student names appear anywhere on the site.
3. **Optional but recommended:** point `names_file` at your class list (a CSV
   exported from the register, one student per row). Keep it **outside** `site/`.
   The tool blocks any app containing a student's name.
4. **Check:** `python tools/manage_apps.py check`
5. **Review:** open `review/report.html`. Each app is:
   - **OK**: nothing found. Still play it and look at every screen.
   - **CHECK**: something to look at (a "Made by…" line, a link to an outside site,
     a photo with camera/location data, a first name that's also a tree, like Ash or Holly).
   - **BLOCKED**: email address, phone number, a student's name, odd file types or
     no web page. Ask the student to fix and re-export, then put the new zip in `incoming/`
     and run `check` again.
6. **Approve:** open `review/checklist.csv` in Excel. For each app you're happy with:
   type a `title` (the app's name, not the student's), check the `brief` (filled in
   from the folder; change it here if it's wrong) and type `yes` in `approve`.
   Keep the `code` column: it's how you match feedback to the student.
7. **Publish:** `python tools/manage_apps.py publish`, then upload `site/` again.
   Each app goes into `site/apps/<brief>/<code>/`. If you change an app's brief later,
   publishing again moves it to the right folder.

The website's filter buttons come from each app's brief, so new apps appear under the
right button as soon as they're published. Names and colours of the buttons are in
`site/assets/config.js` (`SITE_BRIEFS`).

### Apps made in code.org App Lab

Export from App Lab as normal (**Share → Export → Download**) and put the zip in `incoming/`.
The tool spots App Lab exports and fixes them automatically:

- code.org's export doesn't actually run on its own (part of its 13 MB library is missing),
  so the tool replaces it with a small one built into the site (`site/shared/applab-lite.js`).
  Each app shrinks from about 14 MB to a few KB, which matters on phones in the park.
- The links back to code.org (including the student's project ID) are removed.
- The app is scaled to fit the visitor's screen.

The report flags App Lab features the website can't run: turtle and canvas drawing,
code.org datasets/charts, and web requests. Data blocks (`createRecord`, `setKeyValue`…) work,
but save on the visitor's own phone only, never to a server. The everyday blocks (screens,
buttons, text, dropdowns, images, sounds, timers, lists, random numbers) all work. Try every
screen in the report as usual.

What the automatic check can't do: see faces, uniforms or names *in images*, or
judge whether text a student typed is appropriate. Step 5 (playing every app) is
the real safeguard.

To take an app down: `python tools/manage_apps.py remove 2026-27-004`, then re-upload.

---

## 2. Hosting (free, about 15 minutes, once)

**Recommended: GitHub Pages.** Free, HTTPS, and the address never changes, which
matters because the QR code will be printed.

1. Create a free account at github.com (a school/department account is better than a personal one).
2. **New repository** → name it e.g. `apps-for-nature` → Public → Create.
3. **Add file → Upload files** → drag in the *contents* of `site/` (not the folder itself) → Commit.
   For lots of apps, the free GitHub Desktop app is easier than the browser upload.
4. **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
5. After a minute your site is at `https://<account>.github.io/apps-for-nature/`.

Each year you only re-upload `site/`. The address, and so the QR code, stay the same.

Alternatives: Netlify (drag `site/` onto app.netlify.com/drop, then claim the site so it
doesn't expire), or the school's own web space if ITS has one. Whichever you use, the
site is plain HTML: no database, no logins, no cookies.

Search engines are told not to list the site (`robots.txt`), so people reach it by the QR code
or link.

**Before going public:** get the sign-off you listed on the SoW slide (DPO/ITS and
safeguarding). Useful points for that conversation: no personal data is published,
apps are reviewed before publishing, feedback is collected in the school's own
Microsoft 365, and an app can be removed in minutes.

---

## 3. Star ratings (Microsoft Forms, about 10 minutes, once)

Visitors tap **★ Rate** above any app. A panel slides over the app showing your
Microsoft Form, with the app's code already filled in. Ratings go into the school's
own Microsoft 365, so no other company sees them.

**Build the form** at forms.office.com (one form for every app):

| # | Question | Type | Required |
|---|---|---|---|
| 1 | App code | Text | Yes |
| 2 | **Design**: does it look good and is it easy to read? | Rating | Yes |
| 3 | **Works properly**: did everything work, with no bugs or errors? | Rating | Yes |
| 4 | **Features**: does it do useful, interesting things? | Rating | Yes |
| 5 | **Easy to use**: could you work out what to do without help? | Rating | Yes |
| 6 | **Nature**: did it help you learn about trees or wildlife? | Rating | Yes |
| 7 | One thing the student could improve (optional) | Text | No |

For each Rating question, set **Levels: 5** and **Symbol: Star**. Give the form a short
title such as "Rate a Year 7 app".

**Settings** (the ⚙ or … menu):
- *Who can fill out this form*: **Anyone can respond**. If this option is greyed
  out, your IT admin has switched it off for the school; ask ITS to allow it for this form.
- Don't record names, and turn off email receipts.
- Customise the thank-you message, e.g. "Thank you! Tap 'Done: next app' to try another one."

**Connect it to the site:**
1. In the form editor, switch on **Enable pre-filled answers** (a toggle at the top of the form).
2. Type `APPCODE` as the answer to question 1. Leave the rest blank.
3. **…** (top right) **→ Get Pre-filled URL** → copy the long link (it contains `ResponsePage.aspx?id=`).
4. Paste it into `site/assets/config.js` as `feedbackUrl`, between the quotes.
5. Re-upload `site/`. On a phone, open an app, tap **★ Rate**, and check the code appears in question 1.

Until a link is added, the Rate panel says "Feedback isn't open yet", so it's safe
to go live first and add the form later.

**Reading the results:** in Forms, **Responses → Open in Excel**. Filter the App code
column to see one student's ratings, or make a PivotTable (rows: App code, values:
average of each rating) for the whole class. Read the written comments before passing
them on, as members of the public can type anything.

---

## 4. QR code

Once the site is live, open it in Microsoft Edge or Chrome and use the browser's
**Create QR code for this page** option (in Edge, the QR icon in the address bar;
in Chrome, the Share menu). Use the plain address, without `?app=…`, so every scan is random.

Print it at least 4 cm wide for scanning in a park, laminate it, and test it on two
different phones before it goes on a board.

---

## How it works (for the curious)

- `site/apps.js` lists the published apps. The tool writes it; don't edit by hand.
- `index.html` picks a random app from the latest year (change `randomFrom` in
  `config.js` to `"all"` to mix years), never repeating until a visitor has seen them all.
- `index.html?app=2026-27-004` opens one specific app: handy for a link in end-of-May reports.
- Each app runs in a sandboxed frame: it can run its code and open links like Wikipedia in a
  new tab, but can't take over the page.
