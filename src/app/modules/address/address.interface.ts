import { Types } from 'mongoose';

export interface IAddress {
    user: Types.ObjectId;
    neighborhood: string;
    buildingOrState: string;
    apartmentNumber: string;
    lebel: string;
}
