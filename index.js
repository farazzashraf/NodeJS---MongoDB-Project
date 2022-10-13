const path = require('path');

const express = require('express');

const appRoutes = require('./routes/app');
const db = require('./data/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)
app.use('/user-image', express.static('user-image'))

app.use(appRoutes);

app.use(function (error, req, res, next) {
  console.log(error);
  res.status(500).render('500');
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
