// =====================================================================
//  SITE SETTINGS  –  the only file you normally need to edit by hand
// =====================================================================
window.SITE_CONFIG = {
  // Shown in the header and on the welcome card.
  siteTitle: "Apps for Nature",
  schoolName: "our school",

  // Microsoft Forms link for the star ratings (README section 3 has the
  // questions to set up). The form opens inside the site's "Rate" panel.
  // 1. In Forms, turn on "Enable pre-filled answers", type APPCODE as the
  //    answer to the "App code" question, then "..." > "Get Pre-filled URL".
  // 2. Paste that long link below, between the quotes. The site swaps
  //    APPCODE for the real app code.
  // Until a link is added, the Rate panel says "Feedback isn't open yet".
  feedbackUrl: "",

  // Which apps the QR code picks from:
  //   "latest" = only the most recent cohort (e.g. this year's Year 7)
  //   "all"    = every published app
  //   "2026-27" (or any cohort name) = just that cohort
  randomFrom: "latest",

  // Show the "Welcome" card the first time someone opens the site.
  showWelcome: true
};

// Names and colours for the four briefs (and anything else).
window.SITE_BRIEFS = {
  leaf:      { label: "Leaf Detective",        colour: "#3f7d3a" },
  age:       { label: "Tree Age Calculator",   colour: "#8a5a2b" },
  minibeast: { label: "Minibeast Finder",      colour: "#b5651d" },
  survey:    { label: "Tree Survey",           colour: "#2f6f73" },
  other:     { label: "Nature app",            colour: "#5b6b4d" }
};
