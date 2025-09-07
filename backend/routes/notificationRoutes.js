import express from 'express';
import {
  createAlertController,
  createSOSAlertController,
  createStormAlertController,
  createRescueAlertController,
  createSafeAlertController,
  createEvacuationAlertController,
  createAllClearAlertController,
  sendBulkNotificationsController,
  getUserAlertsController,
  markAlertAsReadController,
  registerDeviceTokenController
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/alert', createAlertController);
router.post('/sos', createSOSAlertController);
router.post('/storm', createStormAlertController);
router.post('/rescue', createRescueAlertController);
router.post('/safe', createSafeAlertController);
router.post('/evacuation', createEvacuationAlertController);
router.post('/all-clear', createAllClearAlertController);

router.post('/bulk', sendBulkNotificationsController);

router.get('/user/:userId', getUserAlertsController);
router.put('/read/:alertId', markAlertAsReadController);

router.post('/device/register', registerDeviceTokenController);

export default router;
