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
});

app.get('/login', function(request, response){
  var user_data={};
  user_data["name"] = request.query.player_name;
  user_data["pswd"] = request.query.pswd;
  userName = user_data["name"];
  userPSWD = user_data["pswd"];
  var csv_data = loadCSV("data/users.csv");
    if (!findUser(user_data,csv_data,request,response)){
        newUser(user_data);
        csv_data.push(user_data);
        upLoadCSV(csv_data);
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
          case "lost":
              user_csv[i]["losses"] +=1;
      }
    }
  }
  upLoadCSV(user_csv);
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
        upLoadCSV(csv_data);
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
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {user:user_data});
});

app.get('/about', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});

function loadCSV(filename) {
  var users_file = fs.readFileSync(filename, "utf8");
  //parse csv
  var rows = users_file.split('\n');
  var user_data = [];
  for(var i = 0; i < rows.length; i++) {
      var user_d = rows[i].trim().split(",");
      var user = {};
      user["name"] = user_d[0];
      user["pswd"] = user_d[1];
      user["total_games"] = parseInt(user_d[2]);
      user["wins"] = parseInt(user_d[3]);
      user["losses"] = parseInt(user_d[4]);
      user["rock"] = parseFloat(user_d[5]);
      user["paper"] = parseFloat(user_d[6]);
      user["scissors"] = parseFloat(user_d[7]);
      user_data.push(user);
  }
  return user_data;
}

function upLoadCSV(user_data) {
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
  fs.writeFileSync("data/users.csv", out, "utf8")
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
