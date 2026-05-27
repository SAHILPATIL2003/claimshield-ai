import { Router } from 'express';
import { getPublicHospitals } from '../controllers/publicController';

const router = Router();
router.get('/hospitals', getPublicHospitals);

export default router;
