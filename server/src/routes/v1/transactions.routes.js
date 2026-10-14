import express from "express";

import { transactionController } from "../../controllers/transaction.controller.js";
import { transactionValidators } from "../../validators/transaction.validator.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", validate(transactionValidators.list), transactionController.list);
router.post("/", validate(transactionValidators.create), transactionController.create);
router.put("/:id", validate(transactionValidators.update), transactionController.update);
router.delete("/:id", validate(transactionValidators.remove), transactionController.remove);

export default router;
