var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');
var app = express();

var villainPrevious=randomChoice();
var userPrevious=randomChoice();
var villainWeapon;
var userName;
var userPSWD;

app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));

var port = 3000;
app.listen(port, function(){
  console.log('Server started at '+ new Date()+', on port ' + port+'!');
});

app.get('/', function(request, response){
  var user_data={};
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index', {user:user_data});
  userName = "";
  userPSWD = "";
});

app.get('/login', function(request, response){
  var user_data={};
  user_data["name"] = request.query.player_name;
  user_data["pswd"] = request.query.pswd;
  userName = user_data["name"];
  userPSWD = user_data["pswd"];
  var csv_data = loadCSV("data/users.csv");
    if (user_data["name"] == "") {
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render('index', {user:user_data});
    }
    
    if (!findUser(user_data,csv_data,request,response)){
        newUser(user_data);
        csv_data.push(user_data);
        upLoadCSV(csv_data, "data/users.csv");
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {user:user_data});
    }
});

app.get('/:user/results', function(request, response){
  var user_data={
      name: request.params.user,
      weapon: request.query.weapon,
      villain: request.query.villain
  };//send more stuff under user data
  user_data["result"] = handleThrow(user_data.weapon, user_data.villain);
  user_data["response"] =villainWeapon;

  var user_csv = loadCSV("data/users.csv");
  for (var i = 0; i < user_csv.length; i++) {
    if (user_csv[i]["name"] == user_data.name) {
      user_csv[i][user_data.weapon] +=1;
      user_csv[i]["total_games"]+=1;
      switch(user_data["result"]){
          case "won":
              user_csv[i]["wins"] +=1;
              break;
          case "lost":
              user_csv[i]["losses"] +=1;
              break;
      }
    }
  }
  upLoadCSV(user_csv, "data/users.csv");
  var villains_csv = loadCSV("data/villains.csv");
  for (var i = 0; i < villains_csv.length; i++) {
    if (villains_csv[i]["name"] == user_data.villain) {
      villains_csv[i][user_data.response] +=1;
      villains_csv[i]["total_games"]+=1;
      switch(user_data["result"]){
          case "lost":
              villains_csv[i]["wins"] +=1;
              break;
          case "won":
              villains_csv[i]["losses"] +=1;
              break;
      }
    }
  }
  upLoadCSV(villains_csv, "data/villains.csv");
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('results',{user:user_data});
});

app.get('/playAgain', function(request, response){
    var user_data={};
    user_data["name"] = userName;
    user_data["pswd"] = userPSWD;
    console.log(userName, userPSWD);
    var csv_data = loadCSV("data/users.csv");
    if (!findUser(user_data,csv_data,request,response)){
        newUser(user_data);
        csv_data.push(user_data);
        upLoadCSV(csv_data, "data/users.csv");
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {user:user_data});
    }
});

app.get('/rules', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('rules');
});

app.get('/stats', function(request, response){
  var user_data = loadCSV("data/users.csv");
  var villain_data = loadCSV("data/villains.csv")
  var data = {};
  data["player"] = user_data;
  data["villain"] = villain_data
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {user:data});
});

app.get('/about', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});

function loadCSV(filename) {
  var users_file = fs.readFileSync(filename, "utf8");
  console.log(users_file);
  //parse csv
  var rows = users_file.split('\n');
  var user_data = [];
  for(var i = 0; i < rows.length; i++) {
      var user_d = rows[i].trim().split(",");
      var user = {};
      if (filename == "data/users.csv") {
        user["name"] = user_d[0];
        user["pswd"] = user_d[1];
        user["total_games"] = parseInt(user_d[2]);
        user["wins"] = parseInt(user_d[3]);
        user["losses"] = parseInt(user_d[4]);
        user["rock"] = parseFloat(user_d[5]);
        user["paper"] = parseFloat(user_d[6]);
        user["scissors"] = parseFloat(user_d[7]);
        user_data.push(user);
      } else if (filename == "data/villains.csv") {
        user["name"] = user_d[0];
        user["total_games"] = parseInt(user_d[1]);
        user["wins"] = parseInt(user_d[2]);
        user["losses"] = parseInt(user_d[3]);
        user["rock"] = parseFloat(user_d[4]);
        user["paper"] = parseFloat(user_d[5]);
        user["scissors"] = parseFloat(user_d[6]);
        user_data.push(user);
      }
  }
  return user_data;
}

function upLoadCSV(user_data, file_name) {
  var out="";
  for (var i = 0; i < user_data.length; i++) {
    arr=Object.keys(user_data[i]);
    for (var k=0;k<arr.length;k++){
      if(k == arr.length-1) {
        out+=user_data[i][arr[k]];
      } else {
        out+=user_data[i][arr[k]]+",";
      }
    }
    if (i!=user_data.length-1){
        out+="\n";
    }

  }
  console.log(out);
  fs.writeFileSync(file_name, out, "utf8")
}

function newUser(user_data) {
  user_data["games"] =0;
  user_data["total_games"] =0;
  user_data["wins"] =0;
  user_data["losses"] =0;
  user_data["rock"] =0;
  user_data["paper"] =0;
  user_data["scissors"] = 0;
}

function findUser(user_data,csv_data,request,response){
    for (var i = 0; i < csv_data.length; i++) {
    if (csv_data[i].name == user_data["name"]) {
      if (csv_data[i].pswd == user_data["pswd"]) {
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {user:user_data});
        return true;
        break;
      } else {
        user_data["failure"] = 4;
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('index', {user:user_data});
        return true;
        break;
      }
    }
  }
    return false;
}

function handleThrow(userWeapon, villain){
    villainWeapon=villainStrategies(villain,villainPrevious,userPrevious,userWeapon);
    switch(userWeapon){
        case villainWeapon:
          return("drew");
        case winAgainst(villainWeapon):
            return("won");
        case loseAgainst(villainWeapon):
            return("lost");
    }
    villainPrevious=villainWeapon;
    userPrevious=userWeapon;
}
function randomChoice(){
    var choices=["rock","paper","scissors"];
    return choices[(3*Math.random())|0];
}

function villainStrategies(villain,villainPrevious,userPrevious,userCurrent){
    var rand=Math.random();
    var choice=randomChoice();
    switch(villain){
        case "Bones":
            if (rand>0.5)
                return choice;
            else
                return villainPrevious;
        case "Comic_Hans":
            if (rand>0.7)
                return choice;
            else
                return loseAgainst(userCurrent)
        case "Gato":
            return choice;
        case "Harry":
            return choice;
        case "Manny":
            return choice;
        case "Mickey":
            if(rand>0.6)
                return loseAgainst(villainPrevious);
            else
                return choice;
        case "Mr_Modern":
            if(rand>0.7)
                return "rock";
            else
                return choice;
        case "Pixie":
            return loseAgainst(userPrevious);
        case "Regal":
            if (rand>0.4)
                return winAgainst(userPrevious);
            else
                return winAgainst(userCurrent);
        case "The_Boss":
            return winAgainst(userCurrent);
        case "The_Magician":
            return choice;
        case "Spock":
            return choice;
    }
}
function winAgainst(weapon){
    switch(weapon){
        case "rock":
            return "paper";
        case "paper":
            return "scissors";
        case "scissors":
            return "rock";
        /*default:
            return "Mjölnir"*/
    }
}
function loseAgainst(weapon){
  switch(weapon){
      case "rock":
          return "scissors";
      case "paper":
          return "rock";
      case "scissors":
          return "paper";
      /*default:
          return "Mjölnir"*/
  }
}
