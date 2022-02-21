import express from 'express';
import _ from 'lodash';

import appRoutes from './app.route';
import userRoutes from './user.route';
// import publisherRoutes from './events/publisher.route';
// import subscriberRoutes from './events/subscriber.route';
// import swaggerRoutes from './swagger.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/app',
    route: appRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  // {
  //   path: '/publisher',
  //   route: publisherRoutes,
  // },
  // {
  //   path: '/subscriber',
  //   route: subscriberRoutes,
  // },
];

const devRoutes = [
  {
    path: '/documentation',
    route: appRoutes,
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
