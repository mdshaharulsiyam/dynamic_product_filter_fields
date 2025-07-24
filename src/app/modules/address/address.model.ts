import mongoose, { Schema } from 'mongoose';
import { IAddress } from './address.interface';

const AddressSchema = new Schema<IAddress>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    neighborhood: { type: String, required: true },
    buildingOrState: { type: String, required: true },
    apartmentNumber: { type: String, required: true },
    lebel: { type: String, required: true },
});

const Address = mongoose.model<IAddress>('Address', AddressSchema);

export default Address;
