import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import fieldsServices from "./fields.service";

const createFields = catchAsync(async (req, res) => {

  const result = await fieldsServices.createFields(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fields created successfully",
    data: result,
  });
});

const FieldsController = { createFields };
export default FieldsController;