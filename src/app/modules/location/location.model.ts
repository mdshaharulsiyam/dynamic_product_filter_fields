import { model, Schema } from 'mongoose';
import { ILocation } from './location.interface';

const LocationSchema: Schema = new Schema<ILocation>(
  {
    name: { type: String, required: true, unique: true },
    parentLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
        // default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);
LocationSchema.pre('save', function (next) {
  if (this.is_parent_adding_product && this.is_add_product) {
    throw new Error('sub Location cannot add product if parent Location is adding product');
  }
  next();
});
LocationSchema.index({ location: "2dsphere" });
const Location = model<ILocation>('Location', LocationSchema);

export default Location;
