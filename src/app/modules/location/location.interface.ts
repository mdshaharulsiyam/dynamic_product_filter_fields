import { Types } from 'mongoose';
export interface ILocation {
  name: string;
  parentLocation: Types.ObjectId | null;
}
