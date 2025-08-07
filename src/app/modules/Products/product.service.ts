import { PipelineStage } from 'mongoose';
import AppError from '../../error/appError';
import { verifyFields } from '../../utilities/verifyFields';
import FieldsServices from '../fields/fields.service';
import { Product } from './product.model';

const create = async (fieldsReference: string, payload: any, user: string) => {

  const fields = await FieldsServices.getFields(fieldsReference);

  const providedFields = Object.keys(payload) || [];

  const fieldNames = fields.map(field => field?.name);

  const validate = await verifyFields(fieldNames, providedFields);
  if (validate.error) {
    throw new AppError(
      400,
      validate.message
    );
  }
  return await Product.create({
    ...payload,
    fieldsReference,
    createdBy: user,
  });
};
async function GetAll(query: Record<string, any>) {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { page: pages, limit: limits, categoryFields, ...filter } = query;
  const categoryFieldsArray: string[] = categoryFields ? categoryFields.split('_') : [];
  const matchConditions: any = {
    ...filter
  };

  // if (query.parentCategory) {
  //   matchConditions.parentCategory = new mongoose.Types.ObjectId(
  //     query.parentCategory as string
  //   );
  // } else {
  //   matchConditions.parentCategory = null;
  // }

  // const lockups = categoryFieldsArray?.length > 0 ? categoryFieldsArray.map((field) => ({

  //   $lookup: {
  //     from: 'categories',
  //     localField: field,
  //     foreignField: '_id',
  //     as: field,
  //   },
  // })) : [];

  const lockups = categoryFieldsArray?.length > 0
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
const Product_Service = { create, GetAll };
export default Product_Service;