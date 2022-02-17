import express from 'express';
import { requireAuth } from '@skeldon/sdv3-shared-library';
import catchAsync from '../../../middlewares/catchAsync.middleware';

import { publishMessageToPubSub } from '../../../controllers/events/publisher.controller';
// import catchAsync from '../../../middlewares/catchAsync.middleware';

const router = express.Router();

router
  .route('/publish-event-example')
  .post(requireAuth, catchAsync(publishMessageToPubSub));

export default router;
