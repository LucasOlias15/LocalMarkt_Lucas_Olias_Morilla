import pool from "./src/db/db.js";

const crearTablas = async () => {
  try {

    // 1. Borrar tablas si existen (en orden inverso para no romper las relaciones)
    await pool.query(`DROP TABLE IF EXISTS favorito`);
    await pool.query(`DROP TABLE IF EXISTS valoracion`);
    await pool.query(`DROP TABLE IF EXISTS producto`);
    await pool.query(`DROP TABLE IF EXISTS comercio`);
    await pool.query(`DROP TABLE IF EXISTS usuario`);

    await pool.query(`
      CREATE TABLE usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(250) NOT NULL,
        email VARCHAR(250) NOT NULL UNIQUE,
        contraseña VARCHAR(250) NOT NULL,
        rol VARCHAR(50) DEFAULT 'cliente',
        ubicacion_aproximada VARCHAR(250) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE comercio (
        id_comercio INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL, -- <--- El dueño de la tienda
        nombre VARCHAR(250) NOT NULL,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(250) NOT NULL,
        contacto VARCHAR(250) NOT NULL,
        direccion VARCHAR(250) NOT NULL,
        latitud DECIMAL(10, 8),
        longitud DECIMAL(11, 8),    
        imagen VARCHAR(250),
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
    )
    `);
    

    await pool.query(`
      CREATE TABLE producto (
        id_producto INT AUTO_INCREMENT PRIMARY KEY,
        id_comercio INT NOT NULL,
        nombre VARCHAR(250) NOT NULL,
        descripcion TEXT NOT NULL,
        stock INT NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        imagen VARCHAR(250) NOT NULL,
        FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio) ON DELETE CASCADE
      )
    `);
    
    await pool.query(`
      CREATE TABLE valoracion (
        id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_comercio INT NOT NULL,
        id_producto INT NULL,
        puntuacion INT NOT NULL,
        comentario VARCHAR(250),
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio) ON DELETE CASCADE,
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
      )
    `);
    
    await pool.query(`
      CREATE TABLE favorito (
        id_favorito INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_comercio INT NULL,
        id_producto INT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio) ON DELETE CASCADE,
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
      )
    `);

    console.log("Tablas creadas exitosamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error.message);
  } finally {
    process.exit();
  }
};

crearTablas();