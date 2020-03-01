import { Schema, model } from 'mongoose';

/**
 * The contact model
 */
const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    lastname: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, lowercase: true, trim: true, unique: true, maxlength: 100 },
    telephone: { type: String, maxlength: 20 },
  },
  {
    timestamps: true,
  },
);

export default model('contact', contactSchema);
