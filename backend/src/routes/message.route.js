import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getMessages, getUserForSidebar, sendMessage } from '../controllers/message.controller.js';
const router = express.Router();

router.get("/users", authenticate, getUserForSidebar);
router.get("/:id", authenticate, getMessages);
router.post("/send/:id", authenticate, sendMessage);

export default router;