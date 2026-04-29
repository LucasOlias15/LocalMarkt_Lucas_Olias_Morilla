import {
  getUserByEmail,
  createUser,
  getUserById,
  updateUserInfo,
  deleteUser,
} from "../models/userModel.js";
import { createComercio } from "../models/comercioModel.js";
import { getComercioByUsuarioId } from "../models/comercioModel.js";
import {
  REGEX_NOMBRE_USUARIO,
  REGEX_EMAIL,
  REGEX_CONTRASENYA,
  REGEX_TELEFONO,
  REGEX_NOMBRE_TIENDA,
  REGEX_DIRECCION,
  REGEX_DESCRIPCION,
} from "../../../common/validaciones.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registrarUsuario = async (req, res) => {
  try {
    let fotoTienda = "";
    if (req.file) {
      fotoTienda = req.file.path || req.file.secure_url;
    } else {
      fotoTienda =
        "https://res.cloudinary.com/defaik2fl/image/upload/v1776084820/Gemini_Generated_Image_cswtzlcswtzlcswt_fn6vew.png";
    }

    const {
      nombreUsuario,
      email,
      clave,
      rol,
      nombreComercio,
      descripcion,
      categoria,
      contacto,
      direccion,
      latitud,
      longitud,
    } = req.body;

    // Verificamos los campos comunes a dueños y clientes que vienen en el body
    if (!REGEX_NOMBRE_USUARIO.test(nombreUsuario)) {
      return res
        .status(400)
        .json({ error: "Formato de nombre de usuario inválido. " });
    } else if (!REGEX_EMAIL.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido. " });
    } else if (!REGEX_CONTRASENYA.test(clave)) {
      return res
        .status(400)
        .json({ error: "Formato de contraseña inválido. " });
    }

    // Verificamos los campos específicos de los dueños
    if (rol === "dueño") {
      if (!REGEX_TELEFONO.test(contacto)) {
        return res
          .status(400)
          .json({ error: "Formato de número de teléfono inválido. " });
      } else if (!REGEX_NOMBRE_TIENDA.test(nombreComercio)) {
        return res
          .status(400)
          .json({ error: "Formato de nombre de comercio inválido. " });
      } else if (!REGEX_DIRECCION.test(direccion)) {
        return res
          .status(400)
          .json({ error: "Formato de direccion inválido. " });
      } else if (!REGEX_DESCRIPCION.test(descripcion)) {
        return res
          .status(400)
          .json({ error: "Formato de descripcion inválido. " });
      }
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "El usuario ya existe." });
    }

    // Se encripta la clave si el usuario no existe
    const hashedClave = await bcrypt.hash(clave, 10);

    // Si el usuario no existe, se crea uno nuevo
    let userId;
    if (rol === "cliente") {
      userId = await createUser(nombreUsuario, email, hashedClave, rol);
    } else if (rol === "dueño") {
      userId = await createUser(nombreUsuario, email, hashedClave, rol);
      await createComercio(
        nombreComercio,
        userId,
        descripcion,
        categoria,
        contacto,
        direccion,
        latitud,
        longitud,
        fotoTienda,
      );
    }

    // Se envia una respuesta exitosa con el ID del nuevo usuario
    return res.status(201).json({
      id: userId,
      message: "Usuario OK",
    });
  } catch (error) {
    console.error(" ERROR REAL AL CREAR COMERCIO:", error);
    return res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, clave } = req.body;

    // Guardamos el usuario en la variable user
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Siguiente paso comprobar las claves la encriptada y la que se recibe en el login
    const comprobarClave = await bcrypt.compare(clave, user.contraseña);

    if (!comprobarClave) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const comercio = await getComercioByUsuarioId(user.id_usuario);

    // Asignamos el rol por defecto
    let rolAsignado = "usuario";
    let comercioId = null;

    if (comercio) {
      rolAsignado = "dueño";
      comercioId = comercio.id_comercio;
    }

    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        rol: rolAsignado,
        id_comercio: comercioId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    // Enviamos la respuesta al cliente con el token y algunos datos básicos del usuario
    return res.status(200).json({
      message: "Login exitoso",
      token: token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        rol: rolAsignado,
        id_comercio: comercioId,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el login" });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

export const eliminarCuenta = async (req, res) => {
  try {
    const userId = req.user.id;
    const { clave } = req.body;

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const claveCorrecta = await bcrypt.compare(clave, user.contraseña);
    if (!claveCorrecta) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const eliminado = await deleteUser(userId);

    if (!eliminado) {
      return res.status(500).json({ error: "No se pudo eliminar la cuenta" });
    }

    return res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error en eliminarCuenta:", error);
    return res.status(500).json({ error: "Error al eliminar la cuenta" });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const { nombre, email, clave, nuevaClave } = req.body;

    // 1. Obtener datos actuales del usuario
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 2.   Validar contraseña actual
    const comprobarClave = await bcrypt.compare(clave, user.contraseña);
    if (!comprobarClave) {
      return res
        .status(401)
        .json({ error: "La contraseña actual es incorrecta" });
    }

    // 3. Comprobacion de email libre
    if (email && email !== user.email) {
      const emailOcupado = await getUserByEmail(email);
      if (emailOcupado) {
        return res
          .status(400)
          .json({ error: "El nuevo email ya está en uso por otra cuenta" });
      }
    }

    // 4. Se preparan los campos
    const campos = {};
    if (nombre) campos.nombre = nombre;
    if (email) campos.email = email;

    if (nuevaClave) {
      campos.contraseña = await bcrypt.hash(nuevaClave, 10);
    }

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: "No se han enviado cambios" });
    }

    // 5. Respuesta con los campos nuevos
    await updateUserInfo(userId, campos);

    const userActualizado = await getUserById(userId);

    res.json({
      message: "Perfil actualizado con éxito",
      user: {
        id: userActualizado.id_usuario,
        nombre: userActualizado.nombre,
        email: userActualizado.email,
        rol: req.user.rol,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error interno del servidor al actualizar" });
  }
};

export const verificarEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }

    const user = await getUserByEmail(email);

    return res.status(200).json({
      existe: !!user, // true si encontró, false si no
    });
  } catch (error) {
    console.error("Error en verificarEmail:", error);
    return res.status(500).json({ error: "Error al verificar el email" });
  }
};
