import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IAddress } from "./address.interface";
import addressModel from "./address.model";

const updateUserProfile = async (id: string, payload: Partial<IAddress>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await addressModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await addressModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const AddressServices = { updateUserProfile };
export default AddressServices;