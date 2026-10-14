import express from "express";

import { railController } from "../../controllers/rail.controller.js";
import { railValidators } from "../../validators/rail.validator.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", railController.list);
router.post("/", validate(railValidators.create), railController.create);
router.delete("/:id", validate(railValidators.remove), railController.remove);

export default router;
