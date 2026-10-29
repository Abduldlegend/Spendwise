import { adminService } from "../services/admin.service.js";
import { settingsService } from "../services/settings.service.js";
import { categoryService } from "../services/category.service.js";
import { auditService } from "../services/audit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";
import { serializeAuditLog } from "../utils/serialize.js";

/** @param {import("express").Request} req */
function actorFrom(req) {
  return { id: req.user.sub, email: req.user.email };
}

export const adminController = {
  overview: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await adminService.overview(req.query));
  }),

  analytics: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await adminService.analytics(req.query));
  }),

  listUsers: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await adminService.listUsers(req.query));
  }),

  getUser: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await adminService.getUser(req.params.id));
  }),

  updateUser: asyncHandler(async (req, res) => {
    res
      .status(httpStatus.OK)
      .json(await adminService.updateUser(actorFrom(req), req.params.id, req.body, req));
  }),

  listAudit: asyncHandler(async (req, res) => {
    const result = await auditService.list(req.query);
    res.status(httpStatus.OK).json({ ...result, items: result.items.map(serializeAuditLog) });
  }),

  listCategories: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await categoryService.listAll());
  }),

  createCategory: asyncHandler(async (req, res) => {
    const { reason, ...payload } = req.body;
    const category = await categoryService.create(payload, req.user.sub);
    await auditService.record({
      actor: actorFrom(req),
      action: "category.create",
      targetType: "category",
      targetId: category.key,
      reason,
      metadata: { kind: category.kind, status: category.status },
      req,
    });
    res.status(httpStatus.CREATED).json(category);
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const { reason, ...payload } = req.body;
    const category = await categoryService.update(req.params.key, payload, req.user.sub);
    await auditService.record({
      actor: actorFrom(req),
      action: "category.update",
      targetType: "category",
      targetId: category.key,
      reason,
      metadata: { fields: Object.keys(payload) },
      req,
    });
    res.status(httpStatus.OK).json(category);
  }),

  settings: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await settingsService.summary());
  }),

  credentials: asyncHandler(async (req, res) => {
    const summary = await settingsService.summary();
    res.status(httpStatus.OK).json(summary.credentials);
  }),

  rotateCredential: asyncHandler(async (req, res) => {
    res
      .status(httpStatus.OK)
      .json(await settingsService.rotateCredential(actorFrom(req), req.body.reason, req));
  }),
};
