import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../../helper/mutler-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { default as LocationController } from './location.controller';
import LocationValidation from './location.validation';

const router = express.Router();

router.post(
  '/create',
  validateRequest(LocationValidation.createLocationValidationSchema),
  LocationController.createLocation
);
router.patch(
  '/update/:id',
  // auth(USER_ROLE.superAdmin),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(LocationValidation.updateLocationValidationSchema),
  LocationController.updateLocations
);

router.get('/get-all', LocationController.getAllLocations);
router.get('/get-single/:id', LocationController.getSingleLocations);
router.delete(
  '/delete/:id',
  auth(USER_ROLE.superAdmin),
  LocationController.deleteLocation
);

export const locationRoutes = router;
