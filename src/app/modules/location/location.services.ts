/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ILocation } from './location.interface';
import { default as Category, default as Location } from './location.model';

// create category into db
const createCategoryIntoDB = async (payload: ILocation) => {

  if (payload.parentLocation) {
    const location = await Location.findOne({ _id: payload.parentLocation });
    if (!location) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Parent location not found'
      );
    }

  }

  const result = await Location.create({ ...payload, });
  return result;
};
const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<ILocation>
) => {
  const location = await Location.findOne({ _id: id });
  if (!location) {
    throw new AppError(httpStatus.NOT_FOUND, 'Location not found');
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const getAllCategories = async (query: Record<string, any>) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const matchConditions: any = {
    isDeleted: false,
  };

  if (query.parentCategory) {
    matchConditions.parentCategory = new mongoose.Types.ObjectId(
      query.parentCategory as string
    );
  } else {
    matchConditions.parentCategory = null;
  }

  const data = await Category.aggregate([
    {
      $match: matchConditions,
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parentCategory',
        as: 'subcategories',
      },
    },
    {
      $addFields: {
        totalSubcategory: {
          $size: {
            $filter: {
              input: '$subcategories',
              as: 'sub',
              cond: { $eq: ['$$sub.isDeleted', false] },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parentCategory',
        foreignField: '_id',
        as: 'parentCategoryInfo',
      },
    },
    {
      $unwind: {
        path: '$parentCategoryInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        parentCategory: '$parentCategoryInfo',
      },
    },
    {
      $project: {
        subcategories: 0,
        parentCategoryInfo: 0,
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

const getSingleCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return category;
};
// delete category
const deleteCategoryFromDB = async (categoryId: string) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const result = await Category.findByIdAndUpdate(categoryId, {
    isDeleted: true,
  });
  return result;
};

const categoryService = {
  createCategoryIntoDB,
  updateCategoryIntoDB,
  getAllCategories,
  getSingleCategory,
  deleteCategoryFromDB,
};

export default categoryService;
