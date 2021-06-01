import mongoose, { Schema } from "mongoose";
import timestamps from "mongoose-timestamp";
import { composeWithMongoose } from "graphql-compose-mongoose";

export const UserSchema = new Schema({
  type: {
    type: String,
    enum : {
      values: ['student', 'admin'],
      message: 'Only student and admins are supported'
    }
  },
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    default: 0
  }
}, { collection: "users" });

UserSchema.plugin(timestamps);

UserSchema.index({ createdAt: 1, updatedAt: 1 });

export const User = mongoose.model("User", UserSchema);
export const UserTC = composeWithMongoose(User);
