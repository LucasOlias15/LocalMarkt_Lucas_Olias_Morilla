import pool from "../db/db.js"; // <-- Asegúrate de que la ruta a tu db es correcta

export const toggleFavorito = async (req, res) => {
    try {
        
        const { id_usuario, id_producto, id_comercio } = req.body;

        if (!id_usuario) return res.status(401).json({ message: "Inicio de sesión necesario" });
        
        let queryCheck = '';
        let queryParams = [id_usuario];

        if (id_producto) {
            queryCheck = 'SELECT * FROM favorito WHERE id_usuario = ? AND id_producto = ?';
            queryParams.push(id_producto);
        } else if (id_comercio) {
            queryCheck = 'SELECT * FROM favorito WHERE id_usuario = ? AND id_comercio = ?';
            queryParams.push(id_comercio);
        } else {
            return res.status(400).json({ message: "Faltan datos" });
        }

        const [existing] = await pool.query(queryCheck, queryParams);
        
        if (existing.length > 0) {  
            const id_favorito = existing[0].id_favorito;
            await pool.query('DELETE FROM favorito WHERE id_favorito = ?', [id_favorito]);
            return res.status(200).json({ message: "Eliminado", isFavorite: false });
        } else {
            if (id_comercio) {
                const [result] = await pool.query('INSERT INTO favorito (id_usuario, id_comercio) VALUES (?, ?)',[id_usuario, id_comercio]);
            } else {
                const [result] = await pool.query('INSERT INTO favorito (id_usuario, id_producto) VALUES (?, ?)', [id_usuario, id_producto]);
            }
            return res.status(200).json({ message: "Añadido", isFavorite: true });
        }
    } catch (error) {
        console.log(" ERROR GRAVE EN LA BASE DE DATOS:", error.message); 
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getFavoritos = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        // 2. Hacemos la consulta a la base de datos
        // Queremos buscar en la tabla 'favorito' donde el 'id_usuario' sea el que nos han pasado.
        // ¿Cómo sería este query? 👇
        const [favoritos] = await pool.query(
            'SELECT * FROM favorito WHERE id_usuario = ?', 
            [id_usuario]
        );

        // 3. Devolvemos la lista al frontend
        return res.status(200).json(favoritos);

    } catch (error) {
        console.error("Error al obtener favoritos:", error);
        return res.status(500).json({ message: "Error al obtener la lista de favoritos" });
    }
};