printStats();

function printStats() {
  var player_obj = JSON.parse(localStorage.getItem("player"));
  var npc_obj = JSON.parse(localStorage.getItem("npc"));
  console.log(player_obj["Total Games"]);

  document.getElementById("Total Games").innerHTML = "Total Games: "+player_obj["Total Games"];
  document.getElementById("Total Wins").innerHTML = "Total Wins: "+player_obj["Total Wins"];
  document.getElementById("Win Loss Ratio").innerHTML = "Win Loss Ratio: "+parseFloat((player_obj["Win Loss Ratio"]).toFixed(2));
  
  var p_rock = ((player_obj["rock"]/player_obj["Total Games"])*100).toFixed(2);
  var p_paper = ((player_obj["paper"]/player_obj["Total Games"])*100).toFixed(2);
  var p_scissors = ((player_obj["scissors"]/player_obj["Total Games"])*100).toFixed(2);

  var npc_rock = ((npc_obj["rock"]/player_obj["Total Games"])*100).toFixed(2);
  var npc_paper = ((npc_obj["paper"]/player_obj["Total Games"])*100).toFixed(2);
  var npc_scissors = ((npc_obj["scissors"]/player_obj["Total Games"])*100).toFixed(2);

  document.getElementById("player_stats").innerHTML = "Rock: "+p_rock+"% Paper: "+p_paper+"% Scissors: "+p_scissors+"%";
  document.getElementById("browser_stats").innerHTML = "Rock: "+npc_rock+"% Paper: "+npc_paper+"% Scissors: "+npc_scissors+"%";
}
