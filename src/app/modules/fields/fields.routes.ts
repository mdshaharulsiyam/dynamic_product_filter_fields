import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import fieldsController from "./fields.controller";
import fieldsValidations from "./fields.validation";

const router = express.Router();

router.post(
  "/create",
  auth(USER_ROLE.admin),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(fieldsValidations.createFieldsData),
  fieldsController.updateUserProfile
);

export const fieldsRoutes = router;