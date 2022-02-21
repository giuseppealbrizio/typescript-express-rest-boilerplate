import debug from 'debug';
import dotenv from 'dotenv';
import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import User, { IUserDocument } from '../../models/user.model';

const DEBUG = debug('dev');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

dotenv.config();

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: <string>GOOGLE_CLIENT_ID,
      clientSecret: <string>GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/iam/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const username = profile.emails && profile?.emails[0]?.value;
        const email = profile.emails && profile?.emails[0]?.value;
        const pictureUrl = profile.photos && profile.photos[0].value;

        // 1. Check if user has already a Google profile and return it
        const googleUser = await User.findOne({
          'google.id': profile.id,
        }).exec();

        if (googleUser) {
          return done(null, googleUser, { statusCode: 200 });
        }

        // 2. If user email is in the db and tries to google auth
        // update only with Google id and token
        const checkEmail = await User.checkExistingField(
          'email',
          <string>email,
        );

        const fieldsToUpdate = {
          pictureUrl,
          'google.id': profile.id,
          'google.sync': true,
          'google.tokens.accessToken': accessToken,
        };

        if (checkEmail) {
          const user = await User.findByIdAndUpdate(
            checkEmail._id,
            fieldsToUpdate,
            { new: true },
          ).exec();

          return done(null, <IUserDocument>user, { statusCode: 200 });
        }

        // 3. If nothing before is verified create a new User
        const userObj = new User({
          username, // the same as the email
          email,
          pictureUrl,
          password: accessToken,
          'google.id': profile.id,
          'google.sync': true,
          'google.tokens.accessToken': accessToken,
        });

        const user = await userObj.save({ validateBeforeSave: false });

        return done(null, user, { statusCode: 201 });
      } catch (err: any) {
        DEBUG(err);
        done(err, false);
      }
    },
  ),
);

export default passport;
