import express from 'express';
import { uploadFile } from '../../helper/fileUploader';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ProductController from './product.controller';

const router = express.Router();

router.post(
  "/create/:fieldsReference",
  auth(USER_ROLE.superAdmin),
  uploadFile(),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  ProductController.Create
);

router.get(
  "/get/:fieldsReference",
  // auth(USER_ROLE.user),
  // fieldsController.getFields
);

export const ProductRoutes = router;