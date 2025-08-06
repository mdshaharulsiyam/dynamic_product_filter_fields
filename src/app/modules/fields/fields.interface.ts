import { Types } from "mongoose";

export interface IFields {
  fieldsReference: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "radio" | "file";
  options?: string[];
  is_required?: boolean;
}