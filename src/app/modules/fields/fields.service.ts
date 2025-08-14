import httpStatus from "http-status";
import path from 'path';
import AppError from "../../error/appError";
import Category from '../category/category.model';
import { IFields } from "./fields.interface";
import fieldsModel from "./fields.model";
const MODEL_PATH = path.join(__dirname, '../Products/product.model.ts');
const CONTROLLER_PATH = path.join(__dirname, '../Products/createProduct.ts');
const INTERFACE_PATH = path.join(__dirname, '../Products/product.interface.ts');




const createFields = async (fieldsReference: string, payload: Partial<IFields>) => {
  if (payload?.type === 'file' && payload?.name !== "image") {
    throw new AppError(httpStatus.BAD_REQUEST, "File type fields must have name 'image'");
  }
  const category = await Category.findById(fieldsReference);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  if (!category.is_add_product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category is not allowed to add products");
  }
  return await fieldsModel.create({
    ...payload,
    fieldsReference,
  });
};

const getFields = async (fieldsReference: string) => {
  return await fieldsModel.find({ fieldsReference, name: { $ne: "location" } }).populate('fieldsReference', 'name').populate('category', 'name');
}

const FieldsServices = { createFields, getFields };
export default FieldsServices;