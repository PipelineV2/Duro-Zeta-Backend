import { Router } from 'express';
import userController from '../controller/user.controller';
import Authentication from '../middleware/auth.middleware';


const {signin} = userController
const {authenticate} = Authentication


const router = Router();
router.post('/login', signin);
// router.get('/join-queue/business/:businessId', authenticate, joinQueue)

export default router;