import pool from "./db.js";
import bcrypt from "bcrypt";
import { createUser } from "../models/userModel.js";
import { createComercio } from "../models/comercioModel.js";
import { createProducto } from "../models/productoModel.js";

async function seed() {
  try {
     console.log('Iniciando el proceso de Seeding...');

     // 1. LIMPIAR TABLAS (Desactivamos claves foráneas temporalmente para no dar error al borrar)
     await pool.query('SET FOREIGN_KEY_CHECKS = 0');
     await pool.query('TRUNCATE TABLE producto');
     await pool.query('TRUNCATE TABLE comercio');
     await pool.query('TRUNCATE TABLE usuario');
     await pool.query('SET FOREIGN_KEY_CHECKS = 1');
     console.log('🧹 1. Tablas limpiadas con éxito.');

     // 2. CREAR USUARIOS (Todos tendrán la contraseña '123456')
     const claveHash = await bcrypt.hash('123456', 10);
     const idRegina = await createUser('Salvatore (Ortofrutta)', 'salvatore@regina.com', claveHash, 'Alcamo Centro');
     const idLucia = await createUser('Antonina (Panificio)', 'antonina@santalucia.com', claveHash, 'Alcamo Sud');
     const idNicolo = await createUser('Nicolò (Macelleria)', 'nicolo@renda.com', claveHash, 'Alcamo Nord');
     console.log('👤 2. Usuarios creados.');

     // 3. CREAR COMERCIOS DE ALCAMO
     // Usamos tu función: createComercio(nombre, idUsuario, descripcion, categoria, contacto, direccion)
     const idComercio1 = await createComercio(
         'Ortofrutta Regina', idRegina, 
         'Frutta e verdura freschissima, km 0. I migliori prodotti della terra siciliana diretti alla tua tavola.', 
         'Frutería', '345 1653058', 'Via Monte Bonifato 28, Alcamo (TP)', '37.97542', '12.96531'
     );
     const idComercio2 = await createComercio(
         'Panificio S. Lucia', idLucia, 
         'Il vero pane artigianale alcamese, focacce, biscotti e specialità da forno tradizionali.', 
         'Panadería', '0924 28100', 'Via Maestro Angelo Marrocco 11, Alcamo (TP)' , '37.9768', '12.9618'
     );
     const idComercio3 = await createComercio(
         "Macelleria Renda Nicolò", idNicolo, 
         'Carni scelte, salumi artigianali e preparati di altissima qualità per i tuoi pranzi domenicali.', 
         'Carnicería', '0924 22006', 'Via Madonna Del Riposo 13, Alcamo (TP)', '37.9828', '12.9607'
     );
     console.log('🏪 3. Comercios de Alcamo registrados.');

     // 4. CREAR PRODUCTOS (Con fotos placeholder de alta calidad)
     // createProducto(id_comercio, nombre, descripcion, stock, precio, imagen)
     
     // --> Productos Frutería
     await createProducto(idComercio1, 'Arance di Ribera DOP', 'Arance dolci e succose, perfette per spremute mattutine.', 50, 2.50, 'https://images.unsplash.com/photo-1611080661282-843e93361102?w=400');
     await createProducto(idComercio1, 'Pomodori Siccagno', 'Pomodori coltivati all\'asciutto, sapore intenso e dolcissimo.', 30, 3.20, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400');
     
     // --> Productos Panadería
     await createProducto(idComercio2, 'Pane Cunzato (Porzione)', 'Il classico pane cunzato con olio, pomodoro, acciughe e pecorino.', 20, 4.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400');
     await createProducto(idComercio2, 'Biscotti Fiori d\'Arancio', 'Biscotti artigianali profumati con arance biologiche siciliane.', 15, 6.00, 'https://images.unsplash.com/photo-1558961363-a6cd5006b537?w=400');
     
     // --> Productos Carnicería
     await createProducto(idComercio3, 'Salsiccia Pasqualora', 'Tipica salsiccia siciliana condita con sale, pepe e finocchietto.', 25, 12.00, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400');
     await createProducto(idComercio3, 'Involtini alla Siciliana', 'Involtini di vitello ripieni di pangrattato, formaggio e pinoli.', 40, 15.50, 'https://images.unsplash.com/photo-1607623814075-e51df1bd682f?w=400');
     console.log('🥩 4. Productos gourmet añadidos al catálogo.');

     console.log('✅ ¡Base de datos sembrada con éxito! Ya puedes navegar por Alcamo.');
     process.exit(0);

  } catch (error) {
     console.error('❌ Error sembrando la base de datos:', error);
     process.exit(1);
  }
}

// Ejecutamos la función
seed();