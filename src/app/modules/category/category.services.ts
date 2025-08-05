/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICategory } from './category.interface';
import Category from './category.model';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import mongoose from 'mongoose';

// create category into db
const createCategoryIntoDB = async (payload: ICategory) => {
    if (payload.parentCategory) {
        const cateogry = await Category.exists({ _id: payload.parentCategory });
        if (!cateogry) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Parent category not found'
            );
        }
    }
    const sameCategory = await Category.findOne({ name: payload.name });
    if (sameCategory?.isDeleted) {
        const result = await Category.findByIdAndUpdate(
            sameCategory._id,
            { isDeleted: false },
            { new: true, runValidators: true }
        );
        return result;
    }

    const result = await Category.create(payload);
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
    const result = await Category.findByIdAndUpdate(id, payload, {
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
