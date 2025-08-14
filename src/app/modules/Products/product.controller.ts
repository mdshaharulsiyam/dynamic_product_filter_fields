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
  const query = Object.keys(req.query)
    .filter((key) => {
      const value = req.query[key];
      return value !== '' && value !== undefined && value !== null;
    })
    .reduce((acc, key) => {
      acc[key] = req.query[key];
      return acc;
    }, {} as Record<string, any>);
  const result = await Product_Service.GetAll(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category retrieved successfully',
    data: result,
  });
});
const getRecomendedProducts = catchAsync(async (req, res) => {
  const result = await Product_Service.recomendedProducts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recomended product retrieved successfully',
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
  getRecomendedProducts,
};
export default ProductController;
