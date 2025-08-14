/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from 'mongoose';
import AppError from '../../error/appError';
import { verifyFields, verifyObjectIds } from '../../utilities/verifyFields';
import FieldsServices from '../fields/fields.service';
import { Product } from './product.model';

const create = async (fieldsReference: string, payload: any, user: string) => {
  const { main_category, ...data } = payload
  try {
    const fields = await FieldsServices.getFields(fieldsReference);

    const providedFields = Object.keys(data) || [];

    const fieldNames = fields.map(field => field?.name);
    const categoryFields = fields.filter((field: any) => field?.category?._id)?.map((field: any) => field?.name) || [];
    const validate = await verifyFields(fieldNames, providedFields);
    const objectIdValidation = await verifyObjectIds(categoryFields, data);
    if (validate.error) {
      throw new AppError(
        400,
        validate.message
      );
    }
    if (objectIdValidation.error) {
      throw new AppError(
        400,
        objectIdValidation.message
      );
    }
    return await Product.create({
      ...payload,
      fieldsReference,
      createdBy: user,
      isApprove: false,
      main_category
    });
  } catch (error: any) {
    throw new AppError(500, error?.message || 'Internal Server Error');
  }
};

async function GetAll(query: Record<string, any>) {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { page: pages, limit: limits, categoryFields, ...filter } = query;
  const categoryFieldsArray: string[] = categoryFields
    ? categoryFields.split('_')
    : [];
  const matchConditions: any = {
    ...filter,
  };

  const lockups =
    categoryFieldsArray?.length > 0
      ? categoryFieldsArray.reduce<PipelineStage[]>((acc, field) => {
        acc.push({
          $addFields: {
            [field]: { $toObjectId: `$${field}` },
          },
        });

        acc.push({
          $lookup: {
            from: 'categories',
            localField: field,
            foreignField: '_id',
            as: field,
          },
        });
        acc.push({
          $unwind: {
            path: `$${field}`,
            preserveNullAndEmptyArrays: true,
          },
        });

        return acc;
      }, [])
      : [];
  const data = await Product.aggregate([
    {
      $match: matchConditions,
    },
    ...lockups,
    {
      $addFields: {
        "createdBy": { $toObjectId: `$createdBy` },
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: "createdBy",
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    {
      $unwind: {
        path: `$createdBy`,
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "category": { $toObjectId: `$category` },
        "main_category": { $toObjectId: `$main_category` },
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: "category",
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: {
        path: `$category`,
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: "main_category",
        foreignField: '_id',
        as: 'main_category',
      },
    },
    {
      $unwind: {
        path: `$main_category`,
        preserveNullAndEmptyArrays: true,
      },
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
}

async function GetSingle(id: string) {
  try {
    const initialProduct = (await Product.findById(id)) as any;
    if (!initialProduct) {
      throw new AppError(404, 'Product not found');
    }
    const fields = await FieldsServices.getFields(
      initialProduct.fieldsReference
    );

    const categoryFields =
      fields
        .filter((field: any) => field?.category?._id)
        ?.map((field: any) => field?.name) || [];
    const lockups =
      categoryFields?.length > 0
        ? categoryFields.reduce<PipelineStage[]>((acc, field) => {
          acc.push({
            $addFields: {
              [field]: { $toObjectId: `$${field}` },
            },
          });

          acc.push({
            $lookup: {
              from: 'categories',
              localField: field,
              foreignField: '_id',
              as: field,
            },
          });
          acc.push({
            $unwind: {
              path: `$${field}`,
              preserveNullAndEmptyArrays: true,
            },
          });

          return acc;
        }, [])
        : [];

    const data = await Product.aggregate([
      {
        $match: {
          _id: { $eq: initialProduct._id },
        },
      },
      ...lockups,
      {
        $addFields: {
          createdBy: { $toObjectId: `$createdBy` },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      {
        $unwind: {
          path: `$createdBy`,
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          category: { $toObjectId: `$category` },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: `$category`,
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          location: { $toObjectId: `$location` },
        },
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'location',
          foreignField: '_id',
          as: 'location',
        },
      },
      {
        $unwind: {
          path: `$location`,
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return {
      ...data[0],
    };
  } catch (error: any) {
    throw new AppError(500, error?.message || 'Internal Server Error');
  }
}

const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }
  return product;
};

const recomendedProducts = async () => {
  const result = await Product.aggregate([
    {
      $sample: { size: 10 },
    },
  ]);

  return result;
};

const Product_Service = {
  create,
  GetAll,
  GetSingle,
  deleteProduct,
  recomendedProducts,
};
export default Product_Service;
