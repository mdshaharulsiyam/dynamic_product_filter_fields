import { Types } from 'mongoose';
export interface ICategory {
  name: string;
  category_image: string;
  isDeleted: boolean;
  parentCategory: Types.ObjectId | null;
  is_add_product: boolean;
  is_parent_adding_product: boolean;
}
