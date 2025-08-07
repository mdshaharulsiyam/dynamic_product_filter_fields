import { z } from 'zod';

const createLocationValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Location name is required' })
      .min(1, 'Location name is required'),
    parentLocation: z.string().optional(),
    // category_image: z.string({
    //     required_error: 'Category image is required',
    // }),
    // .optional(),
  }),
});
const updateLocationValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Location name is required' })
      .min(1, 'Location name is required')
      .optional(),
    parentLocation: z.string().optional(),
  }),
});

const LocationValidation = {
  createLocationValidationSchema,
  updateLocationValidationSchema
};

export default LocationValidation;
