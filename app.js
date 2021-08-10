//Defines Core Modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const MongoClient = require('mongodb').MongoClient;
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const dboper = require('./operations');
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter =  require('./routes/dishRouter')
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
const { FailedDependency } = require('http-errors');

//Express Setup
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Middleware Setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));
// app.use(cookieParser('12345-67890-09876-54321'));

//Basic authentication to prevent unauthed access to our static pages
app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
    console.log(req.session);

    //if the signed cookie does not contain the user authorization, then we expect the user to authorize themselves
    if(!req.session.user) {
        var err = new Error ('You are not authenticated!');
        err.status = 401;
        return next(err);

    //else if the signed cookie does contain the user authorization, then we will authorize the user
    } else {
        if (req.session.user === 'authenticated') {
            next();
        } 
        else {
            var err = new Error ('You are not authenticated!');
            err.status = 403;
            return next(err);
        }
    }
}

app.use(auth);

//Will forward specified routes to correct path
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

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

//Executes Server Listener
module.exports = app;

//Sets up Mongo Connection
const url = 'mongodb://localhost:27017/confusion';
const dbname = 'confusion';

MongoClient.connect(url).then((client) => {

  //Checks MongoDB connection
  console.log('Connected correctly to server');

  //Checks specified MongoDB collection
  const db = client.db(dbname);

  //Defines and executes newDish operation using mongoose
  Dishes.create({
    name: 'Uthappizza',
    description: 'test'
    })
    .then((dish) => {
        console.log(dish);

        return Dishes.findByIdAndUpdate(dish._id, {
            $set: { description: 'Updated test'}
        },{ 
            new: true 
        })
        .exec();
    })
    .then((dish) => {
        console.log(dish);
        dish.comments.push({
            rating: 5,
            comment: 'I\'m getting a sinking feeling!',
            author: 'Leonardo di Carpaccio'
    });
    return dish.save();
    })
    .then((dish) => {
        console.log(dish);

        return Dishes.remove({});
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
    });

  //Executes insertion operation from operations.js
//   dboper.insertDocument(db, { name: "Vadonut", description: "Test"},
//       "dishes")
//       .then((result) => {
//           console.log("Insert Document:\n", result.ops);

//           return dboper.findDocuments(db, "dishes");
//       })
//       //Executes finding operation from operations.js
//       .then((docs) => {
//           console.log("Found Documents:\n", docs);

//           return dboper.updateDocument(db, { name: "Vadonut" },
//                   { description: "Updated Test" }, "dishes");

//       })
//       //Executes updating operation from operations.js
//       .then((result) => {
//           console.log("Updated Document:\n", result.result);

//           return dboper.findDocuments(db, "dishes");
//       })
//       //Executes finding update operation from operations.js
//       .then((docs) => {
//           console.log("Found Updated Documents:\n", docs);
                          
//           return db.dropCollection("dishes");
//       })
//       //Executes deletion operation from operations.js
//       .then((result) => {
//           console.log("Dropped Collection: ", result);

//           return client.close();
//       })
//       //Catches and logs errors
//       .catch((err) => console.log(err));

})
//Catches and logs errors
.catch((err) => console.log(err));