import express from "express";
import authRoutes from "./auth.routes.js";
import transactionsRoutes from "./transactions.routes.js";
import budgetsRoutes from "./budgets.routes.js";
import milestonesRoutes from "./milestones.routes.js";
import railsRoutes from "./rails.routes.js";
import profileRoutes from "./profile.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/budgets", budgetsRoutes);
router.use("/milestones", milestonesRoutes);
router.use("/rails", railsRoutes);
router.use("/profile", profileRoutes);

export default router;

