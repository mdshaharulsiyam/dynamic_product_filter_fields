import { z } from "zod";
//  fieldsReference: Types.ObjectId;
//   category: Types.ObjectId;
//   name: string;
//   label: string;
//   type: "text" | "number" | "date" | "select" | "checkbox" | "radio" | "file";
//   options?: string[];
//   is_required?: boolean;
export const createFieldsData = z.object({
  body: z.object({
    category: z.string().optional(),
    name: z.string().optional(),
    label: z.string().optional(),
    type: z.enum(["text", "number", "date", "select", "checkbox", "radio", "file"], { required_error: "Type is required", invalid_type_error: "Invalid type" }),
    options: z.array(z.string()).optional(),
    is_required: z.boolean().optional(),
  }),
});

const FieldsValidations = { createFieldsData };
export default FieldsValidations;