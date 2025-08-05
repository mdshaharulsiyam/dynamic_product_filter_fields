import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IFields } from "./fields.interface";
import fieldsModel from "./fields.model";

const updateUserProfile = async (id: string, payload: Partial<IFields>) => {

  const user = await fieldsModel.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  }
  return await fieldsModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const FieldsServices = { updateUserProfile };
export default FieldsServices;