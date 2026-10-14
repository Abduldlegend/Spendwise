import express from "express";

import { milestoneController } from "../../controllers/milestone.controller.js";
import { milestoneValidators } from "../../validators/milestone.validator.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", milestoneController.list);
router.post("/", validate(milestoneValidators.create), milestoneController.create);
router.put("/:id", validate(milestoneValidators.update), milestoneController.update);

export default router;
