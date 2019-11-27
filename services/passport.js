const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const keys = require('../config/keys');
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtClientSecret;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.findOne({id: jwt_payload.sub}, function(err, user) {
    if (err) {
        return done(err, false);
    }
    if (user) {
        return done(null, user);
    } else {
        console.log(">>>>>new user", user);
        return done(null, false);
        // or you could create a new account
    }
  });
}));

passport.use(new GoogleStrategy({
  clientID: keys.googleClientID,
  clientSecret: keys.googleClientSecret,
  callbackURL: '/auth/google/callback',
  proxy: true
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({profileId: profile.id})
    .then((existedUser) => {
      if(existedUser) {
        done(null, existedUser);
      } else {
        const user = getGoogleUserObj(profile);
        new User(user)
          .save()
          .then((user) => {
            done(null, user);
          })
          .catch((error) => {
            done({ error });
          })
      }
    });
    console.log("ACCESS TOKEN: ", accessToken);
  })
);

getGoogleUserObj = (profile) => {
  return {
    profileId: profile.id,
    userType: 'Social',
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    email: profile.emails[0].value
  };
}
