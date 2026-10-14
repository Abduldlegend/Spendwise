import express from "express";

import { profileController } from "../../controllers/profile.controller.js";
import { profileValidators } from "../../validators/profile.validator.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", profileController.get);
router.put("/", validate(profileValidators.update), profileController.update);

export default router;
