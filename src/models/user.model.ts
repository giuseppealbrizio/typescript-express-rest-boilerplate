import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose, { Schema, Model, LeanDocument } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';
import validator from 'validator';
import { ApplicationError } from '../errors';
import { roles } from '../config/roles.config';
import { IUser } from '../interfaces/models/user.interface';

dotenv.config();

if (!process.env.JWT_KEY) {
  throw new ApplicationError(
    404,
    'Please provide a JWT_KEY as global environment variable',
  );
}

const jwtKey = process.env.JWT_KEY;

// define interface for methods
export interface IUserDocument extends IUser, SoftDeleteDocument {
  // @ts-ignore
  toJSON(): LeanDocument<this>;

  comparePassword(password: string): Promise<boolean>;

  generateVerificationToken(): string;

  generatePasswordResetToken(): void;

  // comparePassword: (password: string) => Promise<boolean>;
  // generateVerificationToken: () => string;
}

// define interface for statics
interface IUserModel extends Model<IUserDocument> {
  checkExistingField: (field: string, value: string) => Promise<IUserDocument>;
  // checkExistingField(field: string, value: string): Promise<IUserDocument>;
}

// define schema
const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email cannot be blank'],
      unique: true,
      lowercase: true,
      index: true,
      validate: [validator.isEmail, 'Please provide an email address'],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    google: {
      id: String,
      sync: { type: Boolean }, // authorisation to sync with google
      tokens: {
        accessToken: String,
        refreshToken: String,
      },
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    pictureUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) =>
          validator.isURL(value, {
            protocols: ['http', 'https', 'ftp'],
            require_tld: true,
            require_protocol: true,
          }),
        message: 'Must be a Valid URL',
      },
    },
    pictureBlob: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
    timestamps: true,
  },
);

// define plugin
UserSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true });

// define indexes
UserSchema.index({ username: 1, email: 1, googleId: 1 });

// @ts-ignore
UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next;

  this.password = await bcrypt.hash(
    this.password,
    parseInt(<string>process.env.HASH, 10),
  );
  next();
});

// methods
UserSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  userObj.id = userObj._id; // remap _id to id

  delete userObj._id;
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

UserSchema.methods.comparePassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.generateVerificationToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      active: this.active,
      role: this.role,
      deleted: this.deleted,
    },
    jwtKey,
    {
      expiresIn: '1d',
      // algorithm: 'RS256',
    },
  );
};

UserSchema.methods.generatePasswordResetToken = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // expires in an hour
};

// statics
UserSchema.statics.checkExistingField = function (
  field: string,
  value: string,
) {
  return this.findOne({ [`${field}`]: value });
};

const User = mongoose.model<IUserDocument, IUserModel>(
  'User',
  UserSchema,
  'users',
);

export default User;
