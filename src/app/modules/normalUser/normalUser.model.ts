import mongoose, { Schema } from 'mongoose';
import { INormalUser } from './normalUser.interface';
import { ENUM_GENDER } from './normalUser.enum';

const LocationSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
});

const NormalUserSchema = new Schema<INormalUser>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        dateOfBirth: { type: Date, required: true },
        gender: {
            type: String,
            enum: Object.values(ENUM_GENDER),
        },
        nationality: { type: String },
        profile_image: { type: String },
        location: {
            type: LocationSchema,
        },

        city: { type: String, required: true },
    },
    { timestamps: true }
);

const NormalUser = mongoose.model<INormalUser>('NormalUser', NormalUserSchema);

export default NormalUser;
