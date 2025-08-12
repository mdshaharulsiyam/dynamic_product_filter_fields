/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import Product_Service from './product.service';

const Create = catchAsync(async (req, res) => {
    const file = req.files as any;
    if (file?.image) {
        req.body.image = file.image?.map((f: any) => f.path);
    }
    const result = await Product_Service.create(
        req.params.fieldsReference,
        req.body,
        req?.user?.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const getAll = catchAsync(async (req, res) => {
    const result = await Product_Service.GetAll(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category retrieved successfully',
        data: result,
    });
});
const getSingle = catchAsync(async (req, res) => {
    const result = await Product_Service.GetSingle(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product retrieved successfully',
        data: result,
    });
});
const deleteProduct = catchAsync(async (req, res) => {
    const result = await Product_Service.deleteProduct(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});

const ProductController = {
    Create,
    getAll,
    getSingle,
    deleteProduct,
};
export default ProductController;
