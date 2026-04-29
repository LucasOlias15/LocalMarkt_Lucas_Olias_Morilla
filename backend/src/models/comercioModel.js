import pool from "../db/db.js";

async function createComercio(
  nombre,
  idUsuario,
  descripcion,
  categoria,
  contacto,
  direccion,
  latitud,
  longitud,
  imagen,
) {
  try {
    const [result] = await pool.query(
      `INSERT INTO comercio (nombre, id_usuario, descripcion, categoria, contacto, direccion, latitud, longitud, imagen) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        idUsuario,
        descripcion,
        categoria,
        contacto,
        direccion,
        latitud,
        longitud,
        imagen,
      ],
    );
    return result.insertId;
  } catch (error) {
    console.error(" Error SQL en createComercio:", error.message);
    throw error;
  }
}

async function getComercioById(idComercio) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.email AS email_contacto
             FROM comercio c
             JOIN usuario u ON c.id_usuario = u.id_usuario
             WHERE c.id_comercio = ?`,
      [idComercio],
    );

    return rows[0];
  } catch (error) {
    console.error(" Error SQL en getComercioById:", error.message);
    throw error;
  }
}

async function getAllComercios() {
  try {
    const [rows] = await pool.query("SELECT * FROM comercio");
    return rows;
  } catch (error) {
    console.error(" Error SQL en getAllComercios:", error.message);
    throw error;
  }
}

async function getComercioByUsuarioId(idUsuario) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM comercio WHERE id_usuario = ?",
      [idUsuario],
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(" Error SQL en getComercioByUsuarioId:", error.message);
    throw error;
  }
}

async function updateComercioImage(nuevaImagen, idComercio) {
  try {
    // Actualizamos la imagen buscando por id_comercio
    const [result] = await pool.query(
      "UPDATE comercio SET imagen = ? WHERE id_comercio = ?",
      [nuevaImagen, idComercio],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error(" Error SQL en updateComercioImage:", error.message);
    throw error;
  }
}

async function updateComercio(
  idComercio,
  { nombre, descripcion, categoria, contacto, direccion, latitud, longitud },
) {
  try {
    const [result] = await pool.query(
      `UPDATE comercio 
             SET nombre = ?, descripcion = ?, categoria = ?, contacto = ?, direccion = ?, latitud = ?, longitud = ? 
             WHERE id_comercio = ?`,
      [
        nombre,
        descripcion,
        categoria,
        contacto,
        direccion,
        latitud,
        longitud,
        idComercio,
      ],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error SQL en updateComercio:", error.message);
    throw error;
  }
}

export {
  createComercio,
  getComercioById,
  getAllComercios,
  updateComercioImage,
  getComercioByUsuarioId,
  updateComercio, 
};
