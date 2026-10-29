import express from "express";

import { categoryController } from "../../controllers/category.controller.js";

const router = express.Router();

// Public: the consumer app loads the taxonomy before/independently of sign-in.
router.get("/", categoryController.list);

export default router;
