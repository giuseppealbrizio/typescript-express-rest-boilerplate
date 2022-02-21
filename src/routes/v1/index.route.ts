import express, { Request, Response } from 'express';
import _ from 'lodash';

import appRoutes from './app.route';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import swaggerRoutes from './swagger.route';
import publisherRoutes from './events/publisher.route';
import subscriberRoutes from './events/subscriber.route';

const router = express.Router();

// Healthy probe for Kubernetes.
// @see
// https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/#define-a-liveness-http-request
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Healthy check completed successfully',
  });
});

const defaultRoutes = [
  {
    path: '/app',
    route: appRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/publisher',
    route: publisherRoutes,
  },
  {
    path: '/subscriber',
    route: subscriberRoutes,
  },
];

const devRoutes = [
  {
    path: '/documentation',
    route: swaggerRoutes,
  },
];

_.forEach(defaultRoutes, (route) => {
  router.use(route.path, route.route);
});

if (process.env.NODE_ENV === 'development') {
  _.forEach(devRoutes, (route) => {
    router.use(route.path, route.route);
  });
}

export default router;
