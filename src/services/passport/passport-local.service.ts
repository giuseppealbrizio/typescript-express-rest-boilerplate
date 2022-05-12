import debug from 'debug';
import dotenv from 'dotenv';
import passport from 'passport';
import passportLocal, { IStrategyOptionsWithRequest } from 'passport-local';
import NativeError from 'mongoose';
import User, { IUserDocument } from '../../models/user.model';

const DEBUG = debug('dev');

const authFields: IStrategyOptionsWithRequest = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user, done) => {
  /* Store only the id in passport req.session.passport.user */
  // @ts-ignore
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  // console.log(id);
  User.findOne({ _id: id }, (err: NativeError, user: IUserDocument) => {
    done(null, user);
  });
});

dotenv.config();

passport.use(
  'login',
  new LocalStrategy(authFields, async (req, email, password, cb) => {
    try {
      const user = await User.findOne({
        $or: [{ email }, { username: email }],
      }).exec();

      if (!user || !user.password) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }

      const checkPassword = await user.comparePassword(password);

      if (!checkPassword) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }

      if (!user || !user.active) {
        return cb(null, false, { message: 'Account is deactivated.' });
      }

      return cb(null, user, { message: 'Logged In Successfully' });
    } catch (err: any) {
      DEBUG(err);
      return cb(null, false, { message: err.message });
    }
  }),
);

passport.use(
  'signup',
  new LocalStrategy(authFields, async (req, email, password, cb) => {
    try {
      const checkEmail = await User.checkExistingField('email', email);

      if (checkEmail) {
        return cb(null, false, {
          message: 'Email already registered, log in instead',
        });
      }

      const checkUserName = await User.checkExistingField(
        'username',
        req.body.username,
      );
      if (checkUserName) {
        return cb(null, false, {
          message: 'Username exists, please try another',
        });
      }

      const newUser = new User();
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.username = req.body.username;

      await newUser.save();

      return cb(null, newUser);
    } catch (err: any) {
      DEBUG(err);
      return cb(null, false, { message: err.message });
    }
  }),
);

/**
 * The password Reset method is with a token generated
 */
passport.use(
  'reset-password',
  new LocalStrategy(authFields, async (req, email, password, cb) => {
    try {
      const { token } = await req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }).exec();

      if (!user) {
        return cb(null, false, {
          message: 'Password reset token is invalid or has expired.',
        });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return cb(null, user, { message: 'Password Changed Successfully' });
    } catch (err: any) {
      DEBUG(err);
      return cb(null, false, { message: err.message });
    }
  }),
);

export default passport;
