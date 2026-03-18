import { Router } from "express";
import { registrarUsuario,loginUsuario, obtenerPerfil , actualizarPerfil} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();

// Registrar nuevo usuario
router.post("/register", registrarUsuario);

// Obtener perfil (Protegido)
router.get("/perfil", authMiddleware, obtenerPerfil);

// Login
router.post("/login", loginUsuario);

// Actualización de datos del usuario (¡AHORA PROTEGIDO TAMBIÉN!)
router.put("/perfil", authMiddleware, actualizarPerfil); 

export default router;