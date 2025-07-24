import { z } from 'zod';
import { ENUM_GENDER } from './normalUser.enum';
const locationSchema = z.object({
    type: z.literal('Point'),
    coordinates: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]'),
});
const registerNormalUserValidationSchema = z.object({
    body: z.object({
        password: z
            .string({ required_error: 'Password is required' })
            .min(6, { message: 'Password must be at least 6 characters' }),
        confirmPassword: z
            .string({ required_error: 'Confirm password is required' })
            .min(6, { message: 'Password must be at least 6 characters' }),
        firstName: z.string({
            required_error: 'First name is required',
            invalid_type_error: 'First name must be a string',
        }),
        lastName: z.string({
            required_error: 'Last name is required',
            invalid_type_error: 'Last name must be a string',
        }),
        email: z.string().email('Invalid email format'),
        phone: z.string().optional(),
        city: z.string().optional(),
        dateOfBirth: z.string().optional(),
    }),
});

const updateNormalUserValidationSchema = z.object({
    body: z.object({
        firstName: z
            .string({
                required_error: 'First name is required',
                invalid_type_error: 'First name must be a string',
            })
            .optional(),
        lastName: z
            .string({
                required_error: 'Last name is required',
                invalid_type_error: 'Last name must be a string',
            })
            .optional(),
        email: z.string().email('Invalid email format').optional(),
        phone: z.string().optional(),
        location: locationSchema.optional(),
        address: z.string().optional(),
        dateOfBirth: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Invalid date format',
            })
            .optional(),
        gender: z
            .enum(Object.values(ENUM_GENDER) as [string, ...string[]])
            .optional(),
        nationality: z.string().optional(),
    }),
});

const normalUserValidations = {
    registerNormalUserValidationSchema,
    updateNormalUserValidationSchema,
};

export default normalUserValidations;
