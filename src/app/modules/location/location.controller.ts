/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/mutler-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import locationService from './location.services';

const createLocation = catchAsync(async (req, res) => {
  const result = await locationService.createLocationIntoDB(req?.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Location created successfully',
    data: result,
  });
});

const getAllLocations = catchAsync(async (req, res) => {
  const result = await locationService.getAllLocations(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Location retrieved successfully',
    data: result,
  });
});

const getSingleLocations = catchAsync(async (req, res) => {
  const result = await locationService.getSingleLocations(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Location retrieved successfully',
    data: result,
  });
});

const updateLocations = catchAsync(async (req, res) => {
  const file: any = req.files?.category_image;
  if (req.files?.category_image) {
    req.body.category_image = getCloudFrontUrl(file[0].key);
  }
  const result = await locationService.updateLocationIntoDB
    (
      req?.params?.id,
      req?.body
    );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Location updated successfully',
    data: result,
  });
});

// delete category
const deleteLocation = catchAsync(async (req, res) => {
  const result = await locationService.deleteLocationFromDB(req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Location deleted successfully',
    data: result,
  });
});

const LocationController = {
  createLocation,
  updateLocations,
  getSingleLocations,
  deleteLocation,
  getAllLocations,
};
export default LocationController;
