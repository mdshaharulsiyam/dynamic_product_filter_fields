/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { ENUM_GENDER } from './normalUser.enum';

export interface INormalUser {
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: (typeof ENUM_GENDER)[keyof typeof ENUM_GENDER];
    nationality: string;
    profile_image: string;
    profile_cover: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    city: string;
}
