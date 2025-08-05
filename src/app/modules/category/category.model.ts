import { model, Schema } from 'mongoose';
import { ICategory } from './category.interface';

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    category_image: { type: String },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    is_add_product: {
      type: Boolean,
      default: false,
    },
    is_parent_adding_product: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
CategorySchema.pre('save', function (next) {
  if (this.is_parent_adding_product && this.is_add_product) {
    throw new Error('sub category cannot add product if parent category is adding product');
  }
  next();
});
const Category = model<ICategory>('Category', CategorySchema);

export default Category;
