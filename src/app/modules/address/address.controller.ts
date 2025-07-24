import httpStatus from 'http-status';
import sendResponse from '../../utilities/sendResponse';
import addressServices from './address.service';
import catchAsync from '../../utilities/catchasync';

const createAddress = catchAsync(async (req, res) => {
    const payload = req.body;

    const result = await addressServices.createAddress(
        req.user.profileId,
        payload
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Address created successfully',
        data: result,
    });
});

const getMyAddresses = catchAsync(async (req, res) => {
    const result = await addressServices.getMyAddresses(req.user.profileId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Addresses fetched successfully',
        data: result,
    });
});

const updateAddress = catchAsync(async (req, res) => {
    const { userId, addressId } = req.params;
    const payload = req.body;

    const result = await addressServices.updateAddress(
        userId,
        addressId,
        payload
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Address updated successfully',
        data: result,
    });
});

const deleteAddress = catchAsync(async (req, res) => {
    const result = await addressServices.deleteAddress(
        req.user.profileId,
        req.params.id
    );

    sendResponse(res, {
        statusCode: httpStatus.NO_CONTENT,
        success: true,
        message: 'Address deleted successfully',
        data: result,
    });
});

const AddressController = {
    createAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
};

export default AddressController;
