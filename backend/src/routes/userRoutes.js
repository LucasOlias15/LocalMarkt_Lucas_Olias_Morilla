import { Router } from "express";
import { uploadImage } from "../middlewares/cloudinary.js";
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  eliminarCuenta,
  verificarEmail,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/registro", uploadImage.single("imagen"), registrarUsuario);

// Obtener perfil (Protegido)
router.get("/perfil", authMiddleware, obtenerPerfil);

// Login
router.post("/login", loginUsuario);

// Comprobar si el email existe para simulación de recuperción de contraseña
router.post("/verificar-email", verificarEmail);

// Actualización de datos del usuario 
router.put("/perfil", authMiddleware, actualizarPerfil);

// Eliminar la cuenta totalmente
router.delete("/cuenta", authMiddleware, eliminarCuenta);

export default router;
