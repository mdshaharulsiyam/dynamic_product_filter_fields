import { model, Schema } from 'mongoose';

const productSchema = new Schema({}, { strict: false });
export const Product = model('Product', productSchema);