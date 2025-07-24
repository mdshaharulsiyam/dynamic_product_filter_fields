import { z } from "zod";

export const updateAddressData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const AddressValidations = { updateAddressData };
export default AddressValidations;