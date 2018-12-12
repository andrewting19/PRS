var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');
var app = express();
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));

var port = 3000;
app.listen(port, function(){
  console.log('Server started at '+ new Date()+', on port ' + port+'!');
});

app.get('/', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index');
});

app.get('/login', function(request, response){
  var user_data={};
  user_data["name"] = request.query.player_name;
  var csv_data = loadCSV();
  for (var i = 0; i < csv_data.length; i++) {
    if (csv_data[i].name == user_data["name"]) {
      if (csv_data[i].pswd == request.query.pswd) {
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {user:user_data});
        break;
      }
    }
  }
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index');
});

app.get('/:user/results', function(request, response){
  var user_data={
      name: request.params.user,
      weapon: request.query.weapon
  };
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.send(JSON.stringify(user_data));
});

app.get('/rules', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('rules');
});

app.get('/stats', function(request, response){
  var user_data = loadCSV();
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {user:user_data});
});

app.get('/about', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});

function loadCSV() {
  var users_file = fs.readFileSync("data/users.csv", "utf8");
  //parse csv
  var rows = users_file.split('\r\n');
  console.log(rows);
  var user_data = [];
  for(var i = 1; i < rows.length; i++) {
      var user_d = rows[i].trim().split(",");
      var user = {};
      user["name"] = user_d[0];
      user["pswd"] = user_d[1];
      user["total_games"] = user_d[2];
      user["wins"] = user_d[3];
      user["losses"] = user_d[4];
      user["rock"] = user_d[5];
      user["paper"] = user_d[6];
      user["scissors"] = user_d[7];
      user_data.push(user);
  }
  return user_data;
}
