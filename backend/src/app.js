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

app.use(cors({
  origin: [
    "https://proyecto-final-grado-lucas-olias-mo.vercel.app/",      // URL vercel desplegada
    "http://localhost:5173",           // Para desarrollo local
    "http://localhost:3000"            // Por si acaso
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json()); // Parsear JSON del body

// 3. Enrutadores
app.use('/api/productos', productRouter);
app.use('/api/comercios', comercioRouter); 
app.use('/api/users', userRoutes);
app.use('/api/favoritos', favoritoRouter);
app.use('/api/pedidos', pedidoRoutes); 

app.get("/", (req, res) => {
    res.send("Bienvenido a la API LocalMarkt");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});