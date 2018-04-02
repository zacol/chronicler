const mongoose = require('mongoose');
const passport = require('passport');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const registration = require('./registration');

const User = mongoose.model('User');

function isAllowedDomain(whitelist, domain) {
  return whitelist.length
    ? whitelist.some(wlDomain => domain.toLowerCase() === wlDomain)
    : true;
}

/**
 * Expose Passport login strategies.
 *
 * @param {Express} app `Express` instance.
 * @api public
 */
module.exports = function LoginStrategies(app) {
  // Register Google Plus Token Strategy
  passport.use(
    new GooglePlusTokenStrategy(
      {
        clientID: app.get('config').auth.google.clientID,
        clientSecret: app.get('config').auth.google.clientSecret,
        authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
        tokenURL: 'https://accounts.google.com/o/oauth2/token',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const emailSplit = email.split('@');
          const emailDomain = emailSplit[emailSplit.length - 1];

          const validDomain = isAllowedDomain(
            app.get('config').auth.domainWhitelist,
            emailDomain
          );

          if (!validDomain) {
            return done(
              new Error(`The '${emailDomain}' is not on the domain whitelist.`),
              false
            );
          }

          const existingUser = await User.findByProvider(profile);

          if (existingUser) {
            return done(null, existingUser);
          }

          const registeredUser = await registration.googlePlus(profile);

          return done(null, registeredUser);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  // Register JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: app.get('config').auth.JWTSecret,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.sub);

          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
};
