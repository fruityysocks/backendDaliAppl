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
    imageFile: {
      data: String,
      contentType: String,
    },
    generatedPoem: {
      type: String,
    },
    replies: {
      type: [
        {
          message: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
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
