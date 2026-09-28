import express from 'express'
import { clearAllActivities, deleteActivity, getActivity } from '../controllers/activityController.js';
import { protect } from '../middlewares/authMiddlewares.js';



const activityRouter = express.Router();

activityRouter.get('/', protect , getActivity)
activityRouter.delete("/:id", protect, deleteActivity);
activityRouter.delete("/", protect, clearAllActivities);

export default activityRouter