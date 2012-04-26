
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes'),
    socialfeed = require('./socialfeed-live')
    ;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){

  //app.engine('.html', require('ejs')._express); //ejs configuration
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  //app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/q', routes.siteLookup);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
