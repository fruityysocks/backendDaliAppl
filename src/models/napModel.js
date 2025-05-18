import mongoose, { Schema } from 'mongoose';

const NapSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    timestamp: {
      type: String,
      required: true,
    },
    napImage: {
      type: String,
    },
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

const NapModel = mongoose.model('Nap', NapSchema);

export default NapModel;
