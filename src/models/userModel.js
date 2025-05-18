import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    year: {
      type: String,
      required: true,
    },
    dev: {
      type: Boolean,
      required: true,
      default: false,
    },
    des: {
      type: Boolean,
      required: true,
      default: false,
    },
    pm: {
      type: Boolean,
      required: true,
      default: false,
    },
    core: {
      type: Boolean,
      required: true,
      default: false,
    },
    mentor: {
      type: Boolean,
      required: true,
      default: false,
    },
    major: {
      type: String,
    },
    minor: {
      type: String,
    },
    birthday: {
      type: String,
      required: true,
    },
    home: {
      type: String,
      required: true,
    },
    quote: {
      type: String,
      required: true,
    },
    favoriteThingOne: {
      type: String,
      required: true,
    },
    favoriteThingTwo: {
      type: String,
      required: true,
    },
    favoriteThingThree: {
      type: String,
      required: true,
    },
    favoriteDartmouthTradition: {
      type: String,
    },
    funFact: {
      type: String,
    },
    profilePic: {
      type: String,
      format: 'url',
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
