import { Router } from 'express';
import userController from '../controller/user.controller';

const {signin} = userController

const router = Router();
router.post('/login', signin);

export default router;