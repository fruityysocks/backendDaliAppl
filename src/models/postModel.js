import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema(
  {
    authorRef: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    content: {
      type: String,
      required: true,
    },
    // tags: {
    //   type: [String],
    //   required: true,
    // },
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

const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
