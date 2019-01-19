
if(document.title==="P,R,S - Game"){
    document.getElementById("hurry?").innerHTML="Play the Game";
    document.getElementById("martin atkinson").src='/images/ref/three.svg';
    setTimeout(function(){document.getElementById("martin atkinson").src='/images/ref/two.svg';}, 1000);
        
    setTimeout(function(){document.getElementById("martin atkinson").src='/images/ref/one.svg';}, 2000);
        
    setTimeout(function(){document.getElementById("martin atkinson").src='/images/ref/fairy_dust.svg';}, 3000);
    
    setTimeout(function(){document.getElementById("martin atkinson").src='/images/ref/watch.svg'; document.getElementById("hurry?").innerHTML="Play the Game; Hurry!";}, 8000);
    
}
if(document.title==="P,R,S - Results"){
   if(document.getElementById("result").innerHTML.includes("won")){
       document.getElementById("martin atkinson").src='/images/ref/thumbs_up.svg';
   }
   else if(document.getElementById("result").innerHTML.includes("lost")){
       document.getElementById("martin atkinson").src='/images/ref/thumbs_down.svg';
   }
   else if(document.getElementById("result").innerHTML.includes("drew")){
       document.getElementById("martin atkinson").src='/images/ref/heart.svg';
   }
    
}