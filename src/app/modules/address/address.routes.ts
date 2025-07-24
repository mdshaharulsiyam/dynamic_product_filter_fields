import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import addressController from './address.controller';

const router = express.Router();

router.post('/create', auth(USER_ROLE.user), addressController.createAddress);

router.get(
    '/my-addresses',
    auth(USER_ROLE.user),
    addressController.getMyAddresses
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    addressController.updateAddress
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.user),
    addressController.deleteAddress
);

export const addressRoutes = router;
