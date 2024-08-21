import { Router } from 'express'
import { createMesa } from '../controllers/mesaController'
const router = Router()

//rutas
router.use("/mesa",createMesa)

export default router 