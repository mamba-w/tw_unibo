var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var dataRouter = require('./routes/database');
var routerRecommender = require('./routes/recommender');
var routerYoutube = require('./routes/youtubeAPI');
var routerWiki = require('./routes/wikiAPI');
var dppediaWiki = require('./routes/dbpediaAPI');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/css', express.static(path.join(__dirname, '..', 'alphatube_frontend/css/')))
app.use('/images', express.static(path.join(__dirname, '..', 'alphatube_frontend/images/')))
app.use('/script', express.static(path.join(__dirname, '..', 'alphatube_frontend/script/')))


app.use(cors());


app.use('/', indexRouter);
app.use('/store', dataRouter);
app.use('/recommender', routerRecommender);
app.use('/youtube', routerYoutube);
app.use('/wiki', routerWiki);
app.use('/dbpedia', dppediaWiki);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
