import express from 'express'
import { protect } from '../middlewares/authMiddlewares.js';
import { generatePost, getGenerations, getPosts, publishNowPost, reschedulePost, schedulePost } from '../controllers/postController.js';
import { upload } from '../config/multer.js';

const postRouter = express.Router();


postRouter.get("/", protect, getPosts);
postRouter.get("/generations", protect, getGenerations);
postRouter.post("/", protect, upload.single("media"), schedulePost);
postRouter.post("/generate", protect, generatePost);
postRouter.patch("/:id/reschedule", protect, reschedulePost);
postRouter.post("/:id/publish-now", protect, publishNowPost);

export default postRouter;