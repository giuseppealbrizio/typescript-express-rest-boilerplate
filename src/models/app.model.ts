import dotenv from 'dotenv';

import { model, Schema, Document } from 'mongoose';

dotenv.config();

export interface App {
  field1: string;
  field2: string;
}

const AppSchema = new Schema<App>(
  {
    field1: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    field2: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    toObject: {
      virtuals: true,
    },
  },
);

interface AppBaseDocument extends App, Document {
  fullField: string;
}

// eslint-disable-next-line func-names
AppSchema.virtual('fullField').get(function (this: AppBaseDocument) {
  return `${this.field1} - ${this.field2}`;
});

export default model<App>('App', AppSchema, 'apps');
