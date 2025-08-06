import fs from 'fs';
import httpStatus from "http-status";
import path from 'path';
import AppError from "../../error/appError";
import Category from '../category/category.model';
import { invalid_fields_name } from '../Products/product.model';
import { IFields } from "./fields.interface";
import fieldsModel from "./fields.model";
const MODEL_PATH = path.join(__dirname, '../Products/product.model.ts');
const CONTROLLER_PATH = path.join(__dirname, '../Products/createProduct.ts');
const INTERFACE_PATH = path.join(__dirname, '../Products/product.interface.ts');




const createFields = async (fieldsReference: string, payload: Partial<IFields>) => {
  if (invalid_fields_name.includes(payload.name as string)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Field name "${payload.name}" is not allowed.`);
  }
  const category = await Category.findById(fieldsReference);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  if (!category.is_add_product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category is not allowed to add products");
  }

  setImmediate(() => {
    addOrUpdateField(
      category?._id?.toString(),
      payload.name as string,
      payload.is_required || false,
      `${payload.name} is required`,
      payload?.category ? "category" : undefined
    );
  });

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

    console.log(` Successfully added/updated field '${fieldName}' for category '${categoryName}'.`);
  } catch (error: any) {
    console.error(` An error occurred: ${error.message}`);
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
  const pattern = new RegExp(`Product_${category}Schema = new Schema\\({[\\s\\S]*?\\b${field}\\b`, 'm');
  return pattern.test(fileContent);
}

function checkIfFieldExistsInInterface(category: string, field: string): boolean {
  const fileContent = fs.readFileSync(INTERFACE_PATH, 'utf-8');
  const pattern = new RegExp(`interface IProduct_${category} [\\s\\S]*?\\b${field}\\b`, 'm');
  return pattern.test(fileContent);
}

async function updateModel(
  category: string,
  field: string,
  required: boolean,
  message: string,
  reference?: string
) {
  if (checkIfFieldExistsInModel(category, field)) {
    console.log(` Field "${field}" already exists in model "${category}". Skipping update.`);
    return;
  }

  let fileContent = fs.readFileSync(MODEL_PATH, 'utf-8');
  const regex = new RegExp(`(const Product_${category}Schema = new Schema\\(\\{)([\\s\\S]*?)(\\}\\);)`, 'm');
  const match = fileContent.match(regex);

  if (match) {
    const fieldLine = reference
      ? `  ${field}: { type: Schema.Types.ObjectId, ref: '${reference}', required: [${required}, "${message}"] },`
      : `  ${field}: { type: String, required: [${required}, "${message}"] },`;

    const newFields = `${match[2].trim()}\n${fieldLine}`;
    const updated = `${match[1]}\n${newFields}\n${match[3]}`;
    fileContent = fileContent.replace(regex, updated);

    await fs.writeFileSync(MODEL_PATH, fileContent);
  } else {
    throw new Error(`Could not find schema for Product_${category}`);
  }
}

async function updateInterface(category: string, field: string, reference?: string) {
  if (checkIfFieldExistsInInterface(category, field)) {
    console.log(`ℹField "${field}" already exists in interface "${category}". Skipping update.`);
    return;
  }

  let fileContent = fs.readFileSync(INTERFACE_PATH, 'utf-8');
  const regex = new RegExp(`(export interface IProduct_${category} \\{)([\\s\\S]*?)(\\})`, 'm');
  const match = fileContent.match(regex);

  if (match) {
    const fieldLine = reference
      ? `  ${field}?: Types.ObjectId;`
      : `  ${field}?: string;`;

    const newFields = `${match[2].trim()}\n${fieldLine}`;
    const updated = `${match[1]}\n${newFields}\n${match[3]}`;
    fileContent = fileContent.replace(regex, updated);

    await fs.writeFileSync(INTERFACE_PATH, fileContent);
  } else {
    throw new Error(`Could not find interface for IProduct_${category}`);
  }
}
function prependFileSync(filePath: string, contentToPrepend: string) {
  const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
  const newContent = contentToPrepend + '\n' + existingContent;
  fs.writeFileSync(filePath, newContent, 'utf-8');
}
async function createModel(
  category: string,
  field: string,
  required: boolean,
  message: string,
  reference?: string
) {
  const fieldDef = reference
    ? `${field}: { type: Schema.Types.ObjectId, ref: '${reference}', required: [${required}, "${message}"] },`
    : `${field}: { type: String, required: [${required}, "${message}"] },`;

  const modelStr = `
import { IProduct_${category} } from './product.interface';

const Product_${category}Schema = new Schema({
  ${fieldDef}
});

export const Product_${category} = mongoose.model<IProduct_${category}>('Product_${category}', Product_${category}Schema);
`;
  const controllerStr = `
import { Product_${category} } from './product.model';
`
  await fs.appendFileSync(MODEL_PATH, modelStr);
  await prependFileSync(CONTROLLER_PATH, controllerStr);
}

async function createInterface(category: string, field: string, reference?: string) {
  const fieldDef = reference
    ? `${field}?: Types.ObjectId;`
    : `${field}?: string;`;

  const interfaceStr = `

export interface IProduct_${category} {
  ${fieldDef}
}
`;
  await fs.appendFileSync(INTERFACE_PATH, interfaceStr);
}

const FieldsServices = { createFields };
export default FieldsServices;