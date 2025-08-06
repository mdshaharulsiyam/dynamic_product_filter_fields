import fs from 'fs';
import httpStatus from "http-status";
import path from 'path';
import AppError from "../../error/appError";
import Category from '../category/category.model';
import { IFields } from "./fields.interface";
import fieldsModel from "./fields.model";
const MODEL_PATH = path.join(__dirname, '../Products/product.model.ts');
const INTERFACE_PATH = path.join(__dirname, '../Products/product.interface.ts');




const createFields = async (fieldsReference: string, payload: Partial<IFields>) => {

  const category = await Category.findById(fieldsReference);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  if (!category.is_add_product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category is not allowed to add products");
  }

  await addOrUpdateField(
    category?._id?.toString(),
    payload.name as string,
    payload.is_required || false,
    "Field is required",
    payload?.category ? "category" : undefined
  );


  return await fieldsModel.create({
    ...payload,
    fieldsReference,
  });
};

export async function addOrUpdateField(
  categoryName: string,
  fieldName: string,
  required: boolean,
  requiredMessage: string,
  reference?: string
) {
  try {
    if (!fs.existsSync(MODEL_PATH) || !fs.existsSync(INTERFACE_PATH)) {
      throw new Error('Model or Interface file not found. Please check the paths.');
    }

    const modelExists = checkIfModelExists(categoryName);
    const interfaceExists = checkIfInterfaceExists(categoryName);

    if (modelExists && interfaceExists) {
      await updateModel(categoryName, fieldName, required, requiredMessage, reference);
      await updateInterface(categoryName, fieldName, reference);
    } else {
      await createModel(categoryName, fieldName, required, requiredMessage, reference);
      await createInterface(categoryName, fieldName, reference);
    }
    console.log(`Successfully added/updated field '${fieldName}' for category '${categoryName}'.`);
  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
  }
}


function checkIfModelExists(categoryName: string): boolean {
  const fileContent = fs.readFileSync(MODEL_PATH, 'utf-8');
  return fileContent.includes(`export const Product_${categoryName}`);
}

function checkIfInterfaceExists(categoryName: string): boolean {
  const fileContent = fs.readFileSync(INTERFACE_PATH, 'utf-8');
  return fileContent.includes(`export interface IProduct_${categoryName}`);
}


function checkIfFieldExistsInModel(category: string, field: string): boolean {
  const fileContent = fs.readFileSync(MODEL_PATH, 'utf-8');
  const pattern = new RegExp(`const Product_${category}Schema = new Schema\\({[\\s\\S]*?\\b${field}:`, 'm');
  return pattern.test(fileContent);
}

function checkIfFieldExistsInInterface(category: string, field: string): boolean {
  const file = fs.readFileSync(INTERFACE_PATH, 'utf-8');
  const pattern = new RegExp(`\\b${field}\\b`, 'm');
  return pattern.test(file);
}

async function updateModel(
  category: string,
  field: string,
  required: boolean,
  message: string,
  reference?: string
) {
  if (checkIfFieldExistsInModel(category, field)) {
    console.log(`Field "${field}" already exists in the model for category "${category}". Skipping update.`);
    return;
  }

  let fileContent = fs.readFileSync(MODEL_PATH, 'utf-8');
  const schemaRegex = new RegExp(`(const Product_${category}Schema = new Schema\\({[\\s\\S]*?)(}\\);)`, 'm');
  const match = fileContent.match(schemaRegex);

  if (match) {
    const fieldDefinition = reference
      ? `  ${field}: { type: mongoose.Schema.Types.ObjectId, ref: '${reference}', required: [${required},"${message}"], message: '${message}' },`
      : `  ${field}: { type: String, required: [${required},"${message}"], message: '${message}' },`;

    let fieldsContent = match[1].trim();
    if (!fieldsContent.endsWith(',')) {
      fieldsContent += ',';
    }

    const updatedContent = `${fieldsContent}\n${fieldDefinition}`;
    fileContent = fileContent.replace(match[1], updatedContent);

    fs.writeFileSync(MODEL_PATH, fileContent);
  } else {
    throw new Error(`Could not find the model schema for category "${category}" to update.`);
  }
}

async function updateInterface(category: string, field: string, reference?: string) {
  if (checkIfFieldExistsInInterface(category, field)) {
    console.log(`Field "${field}" already exists in the interface for category "${category}". Skipping update.`);
    return;
  }

  let fileContent = fs.readFileSync(INTERFACE_PATH, 'utf-8');
  const interfaceRegex = new RegExp(`(export interface IProduct_${category} {[\\s\\S]*?)(})`, 'm');
  const match = fileContent.match(interfaceRegex);

  if (match) {
    const fieldDefinition = reference
      ? `  ${field}?: mongoose.Types.ObjectId;`
      : `  ${field}?: string;`;
    const updatedContent = `${match[1].trim()}\n${fieldDefinition}\n`;
    fileContent = fileContent.replace(match[1], updatedContent);

    fs.writeFileSync(INTERFACE_PATH, fileContent);
  } else {
    throw new Error(`Could not find the interface for category "${category}" to update.`);
  }
}

async function createModel(
  category: string,
  field: string,
  required: boolean,
  message: string,
  reference?: string
) {
  const fieldDefinition = reference
    ? `${field}: { type: mongoose.Schema.Types.ObjectId, ref: '${reference}', required: [${required},"${message}"], message: '${message}' }`
    : `${field}: { type: String, required: [${required},"${message}"], message: '${message}' }`;

  const modelString = `
import { IProduct_${category} } from './product.interface';
export const Product_${category}Schema = new mongoose.Schema({
  ${fieldDefinition}
});
export const Product_${category} = mongoose.model<IProduct_${category}>('Product_${category}', Product_${category}Schema);
`;
  fs.appendFileSync(MODEL_PATH, modelString);
}

async function createInterface(category: string, field: string, reference?: string) {
  const fieldDefinition = reference
    ? `${field}?: mongoose.Types.ObjectId;`
    : `${field}?: string;`;

  const interfaceString = `
export interface IProduct_${category} extends mongoose.Document {
  ${fieldDefinition}
}
`;
  fs.appendFileSync(INTERFACE_PATH, interfaceString);
}

const FieldsServices = { createFields };
export default FieldsServices;