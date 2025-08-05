import httpStatus from "http-status";
import AppError from "../../error/appError";
import Category from '../category/category.model';
import { IFields } from "./fields.interface";
import fieldsModel from "./fields.model";

const createFields = async (fieldsReference: string, payload: Partial<IFields>) => {

  const category = await Category.findById(fieldsReference);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  if (!category.is_add_product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category is not allowed to add products");
  }
  return await fieldsModel.create({
    fieldsReference,
    ...payload,
  });
};

const FieldsServices = { createFields };
export default FieldsServices;