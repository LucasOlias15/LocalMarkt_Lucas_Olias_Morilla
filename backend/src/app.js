import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 1. Iniciar dotenv ANTES de usar process.env
dotenv.config();
console.log("Host detectado:", process.env.DB_HOST);

// 2. Importaciones de rutas y BD
import pool from "./db/db.js";
import userRoutes from "./routes/userRoutes.js";
import comercioRouter from "./routes/comercioRoutes.js";
import productRouter from "./routes/productRoutes.js";
import favoritoRouter from "./routes/favoritoRoutes.js"; 
import pedidoRoutes from "./routes/pedidoRoutes.js"

const app = express();

app.use(cors()); // CORS para React
app.use(express.json()); // Parsear JSON del body

app.use((req, res, next) => {
  console.log(`📢 Petición recibida: ${req.method} ${req.url}`);
  next();
});

// 3. Enrutadores
app.use('/api/productos', productRouter);
app.use('/api/comercios', comercioRouter); 
app.use('/api/users', userRoutes);
app.use('/api/favoritos', favoritoRouter);
app.use('/api/pedidos', pedidoRoutes); // Esto hace que las rutas empiecen por /api/pedidos

app.get("/", (req, res) => {
    res.send("Bienvenido a la API LocalMarkt");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});