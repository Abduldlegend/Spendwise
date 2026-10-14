import express from "express";

import { budgetController } from "../../controllers/budget.controller.js";
import { budgetValidators } from "../../validators/budget.validator.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", budgetController.list);
router.post("/", validate(budgetValidators.create), budgetController.create);
router.put("/:id", validate(budgetValidators.update), budgetController.update);

export default router;
