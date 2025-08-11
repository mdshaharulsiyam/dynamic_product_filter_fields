import { Router } from 'express';
import { addressRoutes } from '../modules/address/address.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { albumRoutes } from '../modules/album/album.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { bannerRoutes } from '../modules/banner/banner.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';
import { fieldsRoutes } from '../modules/fields/fields.routes';
import { locationRoutes } from '../modules/location/location.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { metaRoutes } from '../modules/meta/meta.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { ProductRoutes } from '../modules/Products/product.routes';
import { superAdminRoutes } from '../modules/superAdmin/superAdmin.routes';
import { userRoutes } from '../modules/user/user.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/user',
    router: userRoutes,
  },
  {
    path: '/normal-user',
    router: normalUserRoutes,
  },

  {
    path: '/manage',
    router: ManageRoutes,
  },
  {
    path: '/notification',
    router: notificationRoutes,
  },

  {
    path: '/banner',
    router: bannerRoutes,
  },
  {
    path: '/meta',
    router: metaRoutes,
  },
  {
    path: '/feedback',
    router: feedbackRoutes,
  },
  {
    path: '/super-admin',
    router: superAdminRoutes,
  },

  {
    path: '/album',
    router: albumRoutes,
  },
  {
    path: '/category',
    router: categoryRoutes,
  },
  {
    path: '/address',
    router: addressRoutes,
  },
  {
    path: '/admin',
    router: AdminRoutes,
  },
  {
    path: '/fields',
    router: fieldsRoutes,
  },
  {
    path: '/products',
    router: ProductRoutes,
  },
  {
    path: '/location',
    router: locationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
