/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import fieldsModel from '../fields/fields.model';
import { ICategory } from './category.interface';
import Category from './category.model';

// create category into db
const createCategoryIntoDB = async (payload: ICategory) => {
  let is_parent_adding_product = false;

  if (payload.parentCategory) {
    const category = await Category.findOne({ _id: payload.parentCategory });
    if (!category) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Parent category not found'
      );
    }
    is_parent_adding_product = category.is_add_product || category.is_parent_adding_product;
    if (is_parent_adding_product && payload.is_add_product) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Sub category cannot add product if parent category is adding product'
      );
    }
  }

  const sameCategory = await Category.findOne({ name: payload.name });

  if (sameCategory?.isDeleted) {
    if (payload.is_add_product) {
      await fieldsModel.create({
        name: 'location',
        label: "location",
        type: "text",
        fieldsReference: sameCategory?._id?.toString(),
        is_required: true
      })
    }
    const result = await Category.findByIdAndUpdate(
      sameCategory._id,
      { isDeleted: false },
      { new: true, runValidators: true }
    );
    return result;
  }

  const result = await Category.create({ ...payload, is_parent_adding_product });
  if (payload.is_add_product) {
    await fieldsModel.create({
      name: 'location',
      label: "location",
      type: "text",
      fieldsReference: result?._id?.toString(),
      is_required: true
    })
  }
  return result;
};
const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<ICategory>
) => {
  const category = await Category.findOne({ _id: id });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const { is_parent_adding_product, is_add_product, ...data } = payload;

  const result = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (payload.category_image) {
    if (category.category_image) {
      deleteFileFromS3(category.category_image);
    }
  }
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
