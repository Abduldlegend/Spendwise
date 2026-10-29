import express from "express";

import { adminController } from "../../controllers/admin.controller.js";
import { adminValidators } from "../../validators/admin.validator.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

// Every admin route requires a valid session and the `admin` role.
router.use(authenticate, authorize("admin"));

router.get("/overview", validate(adminValidators.overview), adminController.overview);
router.get("/analytics", validate(adminValidators.analytics), adminController.analytics);

router.get("/users", validate(adminValidators.listUsers), adminController.listUsers);
router.get("/users/:id", validate(adminValidators.userParams), adminController.getUser);
router.patch("/users/:id", validate(adminValidators.updateUser), adminController.updateUser);

router.get("/audit", validate(adminValidators.listAudit), adminController.listAudit);

router.get("/categories", adminController.listCategories);
router.post("/categories", validate(adminValidators.createCategory), adminController.createCategory);
router.put(
  "/categories/:key",
  validate(adminValidators.updateCategory),
  adminController.updateCategory
);

router.get("/settings", adminController.settings);
router.get("/credentials", adminController.credentials);
router.put(
  "/credentials",
  validate(adminValidators.rotateCredential),
  adminController.rotateCredential
);

export default router;
