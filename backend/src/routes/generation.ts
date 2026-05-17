import { Router } from 'express';
import {
  generateTextToImage,
  generateImageToImage,
  generateImageToVideo,
  getGenerations,
} from '../controllers/generationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren auth
router.use(authMiddleware);

router.post('/text-to-image', generateTextToImage);
router.post('/image-to-image', generateImageToImage);
router.post('/image-to-video', generateImageToVideo);
router.get('/history', getGenerations);

export default router;
