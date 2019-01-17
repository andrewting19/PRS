//required packages
var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');
var app = express();

//variables for login and villain strategies
var villainPrevious=randomChoice();
var userPrevious=randomChoice();
var villainWeapon;
var userName;
var userPSWD;

var svgNames=["the_boss","the_magician","harry","gato","bones","manny","comic_hans","mickey","pixie","regal","spock","mr_modern"];
var colors=["red","blue","green","white","black","yellow","orange","purple"];
var svgExtensions=["_waiting","_rock","_scissors","_paper"];
for (var k=0;k<svgNames.length;k++){
    chosenColor=colors[Math.floor(Math.random()*colors.length)]
    for (var j=0; j<svgExtensions.length;j++){
    svgName=__dirname+"/public/images/"+svgNames[k]+svgExtensions[j]+".svg";
    if(!svgName.includes("regal_waiting")&&!svgName.includes("pixie_rock")&&!svgName.includes("the_boss_waiting")&&!svgName.includes("pixie_scissors")){
    var svgToEdit=fs.readFileSync(svgName, "utf8");
    var out=svgToEdit.split("fill");
    var output=out[0];
    for(var i=1;i<out.length;i++){
        output+="fill:"+chosenColor+out[i].substring(out[i].indexOf('"'),out[i].length);
    }
    fs.writeFileSync(svgName,output, "utf8");
    }
    }
}



//set up server
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Server started at '+ new Date()+', on port ' + port+'!');
});

//first request, renders index
app.get('/', function(request, response){
  var user_data={};
  userName = "";
  userPSWD = "";
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index', {page:request.url, user:user_data, title:"Index"});
});

//login request; renders either index if password is wrong or game if new user created or correct login entered
app.get('/login', function(request, response){
  //set up data
  var user_data={};
  user_data["name"] = request.query.player_name;
  user_data["pswd"] = request.query.pswd;
  userName = user_data["name"];
  userPSWD = user_data["pswd"];
  
  //manage users in CSV
  var csv_data = loadCSV("data/users.csv");
  if (user_data["name"] == "") {//if someone accidentally submits login w/o entering anything
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render('index', {page:request.url, user:user_data, title:"Index"});
  }
    
  if (!findUser(user_data,csv_data,request,response)){ //if user isn't found in CSV
      newUser(user_data); //create new user
      csv_data.push(user_data);
      upLoadCSV(csv_data, "data/users.csv");
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render('game', {page:request.url, user:user_data, title:"game"});
  }
});

//request for throw choice
app.get('/:user/results', function(request, response){
  //set up data
  var user_data={
      name: request.params.user,
      weapon: request.query.weapon,
      villain: request.query.villain
  };//send more stuff under user data
  if (fs.existsSync("data/villainPrevious.txt")) {
    villainPrevious=fs.readFileSync("data/villainPrevious.txt",'utf8');
  }
  if (fs.existsSync("data/userPrevious.txt")) {
    userPrevious=fs.readFileSync("data/userPrevious.txt",'utf8');
  }
  
  user_data["result"] = handleThrow(user_data.weapon, user_data.villain);
  user_data["response"] =villainWeapon;
  fs.writeFileSync("data/villainPrevious.txt",villainWeapon,'utf8')
  fs.writeFileSync("data/userPrevious.txt",user_data.weapon,'utf8')
  
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
  
  //manage villain CSV for games, wins, losses, and weapon used
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
  
  //render results
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('results',{page:request.url, user:user_data, title:"results"});
});

//request for when user wants to play again; basically exactly the same as the login request w/o having to log in again
app.get('/playAgain', function(request, response){
    //use the saved username and password which get reset when you return to login page
    var user_data={};
    user_data["name"] = userName;
    user_data["pswd"] = userPSWD;
    var csv_data = loadCSV("data/users.csv");
    //if the saved username is 
    if (user_data["name"] == "") {
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render('index', {page:request.url, user:user_data, title:"Index"});
    }
    
    if (!findUser(user_data,csv_data,request,response)){
        newUser(user_data);
        csv_data.push(user_data);
        upLoadCSV(csv_data, "data/users.csv");
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {page:request.url, user:user_data, title:"game"});
    }
});

//handles a request for the rules page (sends the user to the rules page)
app.get('/rules', function(request, response){
  user_data = {}
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('rules', {page:request.url, user:user_data, title:"rules"});
});

//handles a request for the rules page (inputs the necessary data and sends the user to the newly rendered stats page)
app.get('/stats', function(request, response){
  var user_data = loadCSV("data/users.csv");
  var villain_data = loadCSV("data/villains.csv")
  var data = {};
  data["player"] = user_data;
  data["villain"] = villain_data
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {page:request.url, user:data, title:"stats"});
});

//handles a request for the rules page (sends the user to the rules page)
app.get('/about', function(request, response){
  user_data = {};
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about', {page:request.url, user:user_data, title:"about"});
});

//loads villains.csv or users.csv, returning an object that contains the data contained in the spreadsheet
function loadCSV(filename) {
  var users_file = fs.readFileSync(filename, "utf8");
  console.log(users_file);
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

//uploads the csv containing all the gameplay data (used to update villains.csv and users.csv)
function upLoadCSV(user_data, file_name) {
  var out="";
  user_data.sort(function(a,b) {
    var bPercent = 0;
    if (b.total_games == 0) {
      bPercent = 0;
    } else {
      bPercent =Math.round((b.wins/b.total_games)*100);
    }
    var aPercent = 0;
    if (a.total_games == 0) {
      aPercent = 0;
    } else {
      aPercent =Math.round((a.wins/a.total_games)*100);
    }
    return (bPercent-aPercent);
  });
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
  fs.writeFileSync(file_name, out, "utf8")
}

//creates a new User
function newUser(user_data) {
  user_data["games"] =0;
  user_data["total_games"] =0;
  user_data["wins"] =0;
  user_data["losses"] =0;
  user_data["rock"] =0;
  user_data["paper"] =0;
  user_data["scissors"] = 0;
}

//checks to see if a user's login information correspond to an actual user
function findUser(user_data,csv_data,request,response){
    for (var i = 0; i < csv_data.length; i++) {
    if (csv_data[i].name == user_data["name"]) {
      if (csv_data[i].pswd == user_data["pswd"]) {
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {page:request.url, user:user_data, title:"game"});
        return true;
        break;
      } else {
        user_data["failure"] = 4;
        userName = "";
        userPSWD = "";
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('index', {page:request.url, user:user_data, title:"Index"});
        return true;
        break;
      }
    }
  }
    return false;
}

//handles a user's throw, returning the result and setting the value of the global variable villainWeapon
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
}

//makes a random choice of weapon for use in the default scenario
function randomChoice(){
    var choices=["rock","paper","scissors"];
    return choices[(3*Math.random())|0];
}

//calculates the villain's choice of weapon based on the inputs and the villain's possible strategies

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

//returns the weapon that defeats the input weapon
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

//returns the weapon that loses to the input weapon
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
