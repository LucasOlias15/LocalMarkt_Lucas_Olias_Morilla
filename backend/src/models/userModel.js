import pool from "../db/db.js";

async function getUserByEmail(userEmail) {
  try {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [
      userEmail,
    ]);
    return rows[0]; // Devuelve el primer usuario encontrado o undefined si no existe
  } catch (error) {
    console.error("Error al obtener el usuario por email:", error);
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE id_usuario = ?",
      [userId],
    );
    return rows[0];
  } catch (error) {
    console.error("Error al obtener el usuario por ID:", error);
    throw error;
  }
}

async function createUser(nombre, email, clave, rol = "cliente") {
  try {
    // Se guarda el nuevo usuario en la base de datos y se obtiene el ID generado automáticamente
    const [result] = await pool.query(
      "INSERT INTO usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, clave, rol],
    );
    return result.insertId;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error;
  }
}

async function updateUserInfo(id, campos) {
  try {
    const keys = Object.keys(campos);

    const setQuery = keys.map((key) => `${key} = ?`).join(", ");

    const values = [...Object.values(campos), id];

    const [result] = await pool.query(
      `UPDATE usuario SET ${setQuery} WHERE id_usuario = ?`,
      values,
    );

    return result;
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const [result] = await pool.query(
      "DELETE FROM usuario WHERE id_usuario = ?",
      [userId],
    );
    return result.affectedRows > 0; // true si eliminó, false si no
  } catch (error) {
    console.error("Error SQL en deleteUser:", error.message);
    throw error;
  }
}

export { getUserByEmail, createUser, getUserById, updateUserInfo, deleteUser };
