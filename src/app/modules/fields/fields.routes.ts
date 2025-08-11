import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import fieldsController from "./fields.controller";
import fieldsValidations from "./fields.validation";

const router = express.Router();

router.post(
  "/create/:fieldsReference",
  auth(USER_ROLE.superAdmin),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(fieldsValidations.createFieldsData),
  fieldsController.createFields
);

router.get(
  "/get/:fieldsReference",
  // auth(USER_ROLE.user),
  fieldsController.getFields
);

export const fieldsRoutes = router;