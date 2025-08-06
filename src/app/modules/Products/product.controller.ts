import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import Product_Service from './product.service';

const Create = catchAsync(async (req, res) => {

  const file = req.files as any;
  if (file?.image) {
    req.body.image = file.image?.map((f: any) => f.path);
  }
  const result = await Product_Service.create(req.params.fieldsReference, req.body, req?.user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product created successfully",
    data: result

  });
});
const ProductController = {
  Create,
};
export default ProductController;