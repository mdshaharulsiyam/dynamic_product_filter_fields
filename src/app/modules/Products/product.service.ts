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

const Product_Service = { create };
export default Product_Service;