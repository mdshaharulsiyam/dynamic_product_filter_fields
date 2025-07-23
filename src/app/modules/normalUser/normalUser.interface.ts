/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { USER_ROLE } from '../user/user.constant';
import { ENUM_GENDER } from './normalUser.enum';

export interface INormalUser {
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: (typeof ENUM_GENDER)[keyof typeof ENUM_GENDER];
    natinality: string;
    profile_image: string;
    profile_cover: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
    address: string;
}
