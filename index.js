const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
var bodyParser = require('body-parser');

require('./models/User');
require('./models/Address');
require('./models/MenuDishes');
require('./models/Ingredient');
require('./services/passport');
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const menuDishesRoutes = require('./routes/menuDishesRoutes');
const userRoutes = require('./routes/userRoutes');
const keys = require('./config/keys');

mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.coockieKey]
  })
);

app.use((error, req, res, next) => {
  res.status(422).send({error: error.message});
});

app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads/users/profilePics', express.static('uploads/users/profilePics'));

authRoutes(app);
addressRoutes(app);
menuDishesRoutes(app);
userRoutes(app);
const PORT = process.env.PORT || 5000
app.listen(PORT);
