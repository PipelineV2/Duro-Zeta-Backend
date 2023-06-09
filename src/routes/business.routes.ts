import { Router } from 'express';
import businessController from '../controller/business.controller';
import Authentication from '../middleware/auth.middleware';

const {createNewBusiness, updateBusiness, getBusiness, generateQRCode} = businessController;
const {authenticate} = Authentication

const router = Router();
router.get('/:businessId', getBusiness)
router.post('/create', authenticate, createNewBusiness);
router.post('/:businessId/qrcode/generate', authenticate, generateQRCode )
router.patch('/:businessId/update', authenticate, updateBusiness)


export default router;