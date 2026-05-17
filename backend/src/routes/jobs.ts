import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getJobById,
  listMyJobs,
} from '../controllers/jobController';

const router = Router();

router.use(authMiddleware);

router.get('/', listMyJobs);
router.get('/:id', getJobById);

export default router;