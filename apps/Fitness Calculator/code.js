onEvent("calculatebutton", "click", function( ) {
  if (getText("stepinput") < 8000) {
    setText("resultlabel", "unhealthy");
  } else if ((getText("stepinput") < 20000)) {
    setText("resultlabel", "healthy");
  } else {
    setText("resultlabel", "thats wild dude");
  }
});
