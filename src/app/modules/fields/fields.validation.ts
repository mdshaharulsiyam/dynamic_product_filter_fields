import { z } from "zod";

export const updateFieldsData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const FieldsValidations = { updateFieldsData };
export default FieldsValidations;