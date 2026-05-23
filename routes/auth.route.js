import Express from 'express'
import {register,login} from '../controllers/auth.controller.js';
import { registerSchema } from '../validations/auth.validation.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Express.Router();

router.post('/register',validate(registerSchema),register)
router.pist('/login',login);

export default router;