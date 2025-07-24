import { z } from 'zod';

export const createAddressSchema = z.object({
    body: z.object({
        neighborhood: z.string().min(1, 'Neighborhood is required'),
        buildingOrState: z.string().min(1, 'Building or state is required'),
        apartmentNumber: z.string().min(1, 'Apartment number is required'),
        lebel: z.string().min(1, 'Label is required'),
    }),
});

const AddressValidations = { createAddressSchema };
export default AddressValidations;
