import { Types } from 'mongoose';
export interface ICategory {
    name: string;
    category_image: string;
    isDeleted: boolean;
    parentCategory: Types.ObjectId | null;
}
