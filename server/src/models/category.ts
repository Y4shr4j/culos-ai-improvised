import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryItem extends Document {
  name: string;
  value: string;
  description?: string;
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  type: 'image' | 'video' | 'character';
  description?: string;
  items: ICategoryItem[];
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CategoryItemSchema = new Schema<ICategoryItem>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true,
  _id: true
});

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'character']
  },
  description: {
    type: String,
    trim: true
  },
  items: [CategoryItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
export const CategoryItem = mongoose.model<ICategoryItem>('CategoryItem', CategoryItemSchema); 