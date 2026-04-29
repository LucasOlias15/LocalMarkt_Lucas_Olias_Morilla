import pool from "../db/db.js"; 

export const toggleFavorito = async (req, res) => {
  try {
    const { id_usuario, id_producto, id_comercio } = req.body;

    if (!id_usuario)
      return res.status(401).json({ message: "Inicio de sesión necesario" });

    let queryCheck = "";
    let queryParams = [id_usuario];

    if (id_producto) {
      queryCheck =
        "SELECT * FROM favorito WHERE id_usuario = ? AND id_producto = ?";
      queryParams.push(id_producto);
    } else if (id_comercio) {
      queryCheck =
        "SELECT * FROM favorito WHERE id_usuario = ? AND id_comercio = ?";
      queryParams.push(id_comercio);
    } else {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const [existing] = await pool.query(queryCheck, queryParams);

    if (existing.length > 0) {
      const id_favorito = existing[0].id_favorito;
      await pool.query("DELETE FROM favorito WHERE id_favorito = ?", [
        id_favorito,
      ]);

      const tipo = existing[0].id_producto ? "Producto" : "Tienda";
      return res.status(200).json({
        message: `${tipo} eliminado de favoritos`,
        isFavorite: false,
      });
    } else {
      if (id_comercio) {
        await pool.query(
          "INSERT INTO favorito (id_usuario, id_comercio) VALUES (?, ?)",
          [id_usuario, id_comercio],
        );
        return res.status(200).json({
          message: "Tienda añadida a favoritos ",
          isFavorite: true,
        });
      } else {
        await pool.query(
          "INSERT INTO favorito (id_usuario, id_producto) VALUES (?, ?)",
          [id_usuario, id_producto],
        );
        return res.status(200).json({
          message: "Producto añadido a favoritos ",
          isFavorite: true,
        });
      }
    }
  } catch (error) {
    console.log(" ERROR GRAVE EN LA BASE DE DATOS:", error.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getFavoritos = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [favoritos] = await pool.query(
      "SELECT * FROM favorito WHERE id_usuario = ?",
      [id_usuario],
    );

    return res.status(200).json(favoritos);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener la lista de favoritos" });
  }
};
