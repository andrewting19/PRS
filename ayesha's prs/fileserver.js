var express = require('express');
var fs = require('fs');
const PORT = process.env.PORT || 5000

var app = express();
app.use(express.static('public'));
app.listen(PORT, function(){
  console.log('Easy server listening for requests on port'+ PORT+'!');
});

app.get('/', function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'})
  var file = fs.readFileSync("index.html");
  response.write(file);
  response.send();
});

app.get('/rules', function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'})
  var file = fs.readFileSync("rules.html");
  response.write(file);
  response.send();
});

app.get('/stats', function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'})
  var file = fs.readFileSync("stats.html");
  response.write(file);
    response.send();
});
