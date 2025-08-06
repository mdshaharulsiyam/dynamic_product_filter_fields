export const invalid_fields_name = ['model', "Schema", "SchemaTypes", "Types", "ObjectId", "mongoose", "zod", "z", "createFieldsData", "createCategoryValidationSchema", "updateCategoryValidationSchema", "categoryValidation", "FieldsValidations", "export", "import", "interface", "const", "export default", "export const", "export interface", "export type", "export class", "export function", "export enum", "export let", "export var", "export default function", "export default class"];
import mongoose, { Schema } from 'mongoose';





import { IProduct_6891aadacbcfa29dcbfdbacd } from './product.interface';

const Product_6891aadacbcfa29dcbfdbacdSchema = new Schema({
eng_type: { type: String, required: [true, "eng_type is required"] },
  name: { type: String, required: [true, "name is required"] },
  models: { type: Schema.Types.ObjectId, ref: 'category', required: [true, "models is required"] },
});

export const Product_6891aadacbcfa29dcbfdbacd = mongoose.model<IProduct_6891aadacbcfa29dcbfdbacd>('Product_6891aadacbcfa29dcbfdbacd', Product_6891aadacbcfa29dcbfdbacdSchema);
