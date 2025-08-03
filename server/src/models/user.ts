import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISocialAccount {
  provider: string;
  providerId: string;
  email?: string;
  name?: string;
}

export interface IUnlockedImage {
  imageId: Types.ObjectId;
  unlockedAt: Date;
}

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  tokens: number;
  isAdmin: boolean;
  socialAccounts: ISocialAccount[];
  unlockedImages: IUnlockedImage[];
  ageVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const socialAccountSchema = new Schema<ISocialAccount>({
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  email: { type: String },
  name: { type: String }
}, { _id: false });

const unlockedImageSchema = new Schema<IUnlockedImage>({
  imageId: { type: Schema.Types.ObjectId, required: true, ref: 'Image' },
  unlockedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String },
  tokens: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  ageVerified: { type: Boolean, default: false },
  socialAccounts: [socialAccountSchema],
  unlockedImages: [unlockedImageSchema]
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for faster queries
userSchema.index({ 'socialAccounts.provider': 1, 'socialAccounts.providerId': 1 });
userSchema.index({ 'unlockedImages.imageId': 1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);
