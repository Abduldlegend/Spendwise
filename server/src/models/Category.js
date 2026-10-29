import mongoose from "mongoose";
import {
  CATEGORY_ACCENTS,
  CATEGORY_KEY_PATTERN,
  CATEGORY_KINDS,
  CATEGORY_STATUSES,
} from "../constants/enums.js";

const categorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: CATEGORY_KEY_PATTERN,
    },
    label: { type: String, required: true, trim: true, maxlength: 40 },
    icon: { type: String, required: true, trim: true, maxlength: 48 },
    accent: { type: String, enum: CATEGORY_ACCENTS, required: true },
    kind: { type: String, enum: CATEGORY_KINDS, required: true },
    status: { type: String, enum: CATEGORY_STATUSES, default: "enabled" },
    isSystem: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

categorySchema.index({ status: 1, sortOrder: 1 });

export const Category = mongoose.model("Category", categorySchema);
