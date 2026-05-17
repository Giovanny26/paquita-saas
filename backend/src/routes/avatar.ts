import { Router } from 'express';
import {
  getAvatarOptions,
  generateAvatarPreviews,
  saveAvatar,
  getAvatar,
  generateWithAvatar,
} from '../controllers/avatarController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/options', getAvatarOptions);
router.use(authMiddleware);
router.post('/generate-previews', generateAvatarPreviews);
router.post('/save', saveAvatar);
router.get('/', getAvatar);
router.post('/generate', generateWithAvatar);

export default router;
