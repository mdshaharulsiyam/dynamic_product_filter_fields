import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IAddress } from './address.interface';
import Address from './address.model';

const createAddress = async (userId: string, payload: IAddress) => {
    const result = await Address.create({ ...payload, user: userId });
    return result;
};

const getMyAddresses = async (userId: string) => {
    const result = await Address.find({ user: userId });
    return result;
};

const updateAddress = async (
    userId: string,
    id: string,
    payload: Partial<IAddress>
) => {
    const address = await Address.findOne({ user: userId, _id: id });
    if (!address) {
        throw new AppError(httpStatus.NOT_FOUND, 'Address not found');
    }

    const result = await Address.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteAddress = async (userId: string, id: string) => {
    const result = await Address.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This is not your address');
    }
    return result;
};

const AddressServices = {
    createAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
};

export default AddressServices;
