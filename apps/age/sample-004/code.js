function calc(){var g=parseFloat(document.getElementById('girth').value);
var r=parseFloat(document.getElementById('species').value);
var out=document.getElementById('out');
if(isNaN(g)||g<=0){out.textContent='Please type the girth as a number';return;}
var age=Math.round(g/r);out.textContent='About '+age+' years old';}