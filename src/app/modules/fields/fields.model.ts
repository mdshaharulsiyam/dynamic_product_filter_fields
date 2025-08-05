import { model, Schema } from "mongoose";
import { IFields } from "./fields.interface";
const fieldsSchema = new Schema<IFields>({
  fieldsReference: { type: Schema.Types.ObjectId, required: true, ref: "FieldsReference" },
  category: { type: Schema.Types.ObjectId, required: false, ref: "Category" },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "number", "date", "select", "checkbox", "radio", "file"],
    required: true,
  },
  options: [{ type: String }],
  is_required: { type: Boolean, default: false },
}, { timestamps: true });

fieldsSchema.index({ name: 1, fieldsReference: 1 }, { unique: true });

fieldsSchema.pre("save", function (next) {
  if (this.type === "select" || this.type === "checkbox" || this.type === "radio") {
    if ((!this.options || this.options.length === 0) && !this.category) {
      throw new Error("Options or category are required for select type fields");
    }
    if (this.options && this.options.length > 0 && this.category) {
      throw new Error("Cannot have both options and category for select type fields");
    }
  }
  next();
});

const fieldsModel = model<IFields>("Fields", fieldsSchema);
export default fieldsModel;