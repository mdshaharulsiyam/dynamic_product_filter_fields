/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ILocation } from './location.interface';
import { default as Location } from './location.model';

// create category into db
const createLocationIntoDB = async (payload: ILocation) => {
  const { lat, lng, ...data } = payload as any
  if (!lng || !lat) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "coordinates lat lng is required"
    )
  }
  if (payload.parentLocation) {
    const location = await Location.findOne({ _id: payload.parentLocation });
    if (!location) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Parent location not found'
      );
    }

  }
  data.location = {
    coordinates: [Number(lng), Number(lat)]
  }
  const result = await Location.create({ ...data, });
  return result;
};

const updateLocationIntoDB = async (
  id: string,
  payload: Partial<ILocation>
) => {
  const location = await Location.findOne({ _id: id });
  if (!location) {
    throw new AppError(httpStatus.NOT_FOUND, 'Location not found');
  }

  const result = await Location.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const getAllLocations = async (query: Record<string, any>) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const matchConditions: any = {
  };

  if (query.parentLocation) {
    matchConditions.parentLocation = new mongoose.Types.ObjectId(
      query.parentLocation as string
    );
  } else {
    matchConditions.parentLocation = null;
  }

  const data = await Location.aggregate([
    {
      $match: matchConditions,
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parentLocation',
        as: 'subLocations',
      },
    },
    {
      $addFields: {
        totalSubLocations: {
          $size: "$subLocations",
        },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parentLocation',
        foreignField: '_id',
        as: 'parentLocationInfo',
      },
    },
    {
      $unwind: {
        path: '$parentLocationInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        parentCategory: '$parentLocationInfo',
      },
    },
    {
      $project: {
        subLocations: 0,
        parentLocationInfo: 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        result: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'total' }],
      },
    },
  ]);

  const result = data[0]?.result || [];
  const total = data[0]?.totalCount[0]?.total || 0;
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };
};

const getSingleLocations = async (id: string) => {
  const category = await Location.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Location not found');
  }

  return category;
};
// delete category
const deleteLocationFromDB = async (categoryId: string) => {
  const category = await Location.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Location not found');
  }
  const result = await Location.findByIdAndDelete(categoryId);
  return result;
};

const categoryService = {
  createLocationIntoDB,
  updateLocationIntoDB,
  getAllLocations,
  getSingleLocations,
  deleteLocationFromDB,
};

export default categoryService;
