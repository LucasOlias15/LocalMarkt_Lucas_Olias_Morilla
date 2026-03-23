import dotenv from "dotenv";
dotenv.config();

import pool from "./db.js";
import bcrypt from "bcrypt";
import { createUser } from "../models/userModel.js";
import { createComercio } from "../models/comercioModel.js";
import { createProducto } from "../models/productoModel.js";

async function seed() {
  try {
     console.log('Añadiendo productos base todo OK');

     // 1. LIMPIAR TABLAS
     await pool.query('SET FOREIGN_KEY_CHECKS = 0');
     await pool.query('TRUNCATE TABLE producto');
     await pool.query('TRUNCATE TABLE comercio');
     await pool.query('TRUNCATE TABLE usuario');
     await pool.query('SET FOREIGN_KEY_CHECKS = 1');
     console.log('Tablas limpiadas todo OK');

     // 2. CREAR USUARIOS
     // 2.1 USUARIOS DUEÑOS DE COMERCIOS (Pasamos 'dueño' como 5º parámetro)
     const claveHash = await bcrypt.hash('123456', 10);
     const idRegina = await createUser('Salvatore (Ortofrutta)', 'salvatore@regina.com', claveHash, 'Alcamo Centro', 'dueño');
     const idLucia = await createUser('Antonina (Panificio)', 'antonina@santalucia.com', claveHash, 'Alcamo Sud', 'dueño');
     const idNicolo = await createUser('Nicolò (Macelleria)', 'nicolo@renda.com', claveHash, 'Alcamo Nord', 'dueño');
     const idAlessandro = await createUser('Alessandro (Vivaio)', 'alessandro@perez.com', claveHash, 'Alcamo Est', 'dueño');
     const idGiulia = await createUser('Giulia (Sartoria)', 'giulia@sartoria.com', claveHash, 'Alcamo Ovest', 'dueño');
     const idMatteo = await createUser('Matteo (Ceramiche)', 'matteo@ceramiche.com', claveHash, 'Alcamo Centro Storico', 'dueño');

     // 2.2 USUARIOS BASE (No pasamos 5º parámetro, la función usará 'cliente' por defecto)
     const claveHashBase1 = await bcrypt.hash('PPPPPP', 10);
     const claveHashBase2 = await bcrypt.hash('MMMMMM', 10);
     
     // Nota: Como 'createUser' devuelve un ID (que es una promesa), es buena práctica poner el 'await',
     // aunque no vayamos a usar esos IDs para crearles comercios.
     await createUser('Pedro Giménez', 'pedro@gimenez.com', claveHashBase1, 'Mi ubicación');
     await createUser('Marta Gutierrez', 'marta@gutierrez.com', claveHashBase2, 'Mi ubicación');

     console.log(' Usuarios creados OK.');

     // 3. CREAR COMERCIOS DE ALCAMO
     const idComercio1 = await createComercio(
         'Ortofrutta Regina', idRegina, 
         'Frutta e verdura freschissima, km 0. I migliori prodotti della terra siciliana diretti alla tua tavola.', 
         'Frutería', '345 1653058', 'Via Monte Bonifato 28, Alcamo (TP)', '37.97542', '12.96531', 'https://res.cloudinary.com/defaik2fl/image/upload/v1774004564/tabrez-syed-WRaV7l_1JuA-unsplash_zyg1qj.jpg'
     );
     const idComercio2 = await createComercio(
         'Panificio S. Lucia', idLucia, 
         'Il vero pane artigianale alcamese, focacce, biscotti e specialità da forno tradizionali.', 
         'Panadería', '0924 28100', 'Via Maestro Angelo Marrocco 11, Alcamo (TP)' , '37.9768', '12.9618' , 'https://res.cloudinary.com/defaik2fl/image/upload/v1774004565/yeh-xintong-go3DT3PpIw4-unsplash_gutn66.jpg'
     );
     const idComercio3 = await createComercio(
         "Macelleria Renda Nicolò", idNicolo, 
         'Carni scelte, salumi artigianali e preparati di altissima qualità per i tuoi pranzi domenicali.', 
         'Carnicería', '0924 22006', 'Via Madonna Del Riposo 13, Alcamo (TP)', '37.9828', '12.9607', 'https://res.cloudinary.com/defaik2fl/image/upload/v1774004565/tommao-wang-kqytZ3VFb_o-unsplash_xq5pki.jpg'
     );
     const idComercio4 = await createComercio(
         "Vivaio naturale", idAlessandro, 
         'Piante di ogni tipo per la casa, alberi e cactus di ogni genere.', 
         'Bio', '0924 03942', 'Via Vittorio Veneto 269, Alcamo (TP)', '37.97787658797134', '12.96656156454616', 'https://res.cloudinary.com/defaik2fl/image/upload/v1774004567/timothy-hales-bennett-An0uaO4IhcQ-unsplash_kjtfdr.jpg'
     );

     const idComercio5 = await createComercio(
         "Sartoria Giulia", idGiulia, 
         'Capi d\'abbigliamento sartoriali e tessuti locali lavorati a mano con passione.', 
         'Textiles y moda', '328 4591230', 'Corso VI Aprile 152, Alcamo (TP)', '37.9790', '12.9635', "https://res.cloudinary.com/defaik2fl/image/upload/v1774258787/eddie-pipocas--y93T9OCD34-unsplash_nre2wj.jpg" 
     );
     
     const idComercio6 = await createComercio(
         "Ceramiche Artistiche Matteo", idMatteo, 
         'Ceramiche tradizionali siciliane dipinte a mano, perfette per decorare la tua casa o per un regalo speciale.', 
         'Artesanía y regalos', '331 9084756', 'Piazza Ciullo 12, Alcamo (TP)', '37.9805', '12.9642', "https://res.cloudinary.com/defaik2fl/image/upload/v1774258787/zoshua-colah-o1VwLwV4r7Y-unsplash_f29irl.jpg" 
     );

     console.log('Comercios de Alcamo registrados OK');

     // 4. CREAR PRODUCTOS 
     
     // --> Productos Frutería 
     await createProducto(idComercio1, 'Arance di Ribera DOP', 'Arance dolci e succose, perfette per spremute mattutine.', 50, 2.50, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002711/1586_involtini_id1ikb.webp');
     await createProducto(idComercio1, 'Pomodori Siccagno', 'Pomodori coltivati all\'asciutto, sapore intenso e dolcissimo.', 30, 3.20, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002715/top-view-organic-colorful-tomatoes-isolated-wooden-kitchen-board-wooden-wall_dj97dh.jpg');
     await createProducto(idComercio1, 'Limoni di Siracusa IGP', 'Limoni freschi non trattati, ideali per sorbetti e condimenti.', 40, 1.80, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002713/fresh-yellow-organic-lemon-fruits-vintage-wood-table-background_djvoec.jpg');
     
     // --> Productos Panadería
     await createProducto(idComercio2, 'Pane Cunzato (Porzione)', 'Il classico pane cunzato con olio, pomodoro, acciughe e pecorino.', 20, 4.50, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002713/jude-infantini-rYOqbTcGp1c-unsplash_ghybft.jpg');
     await createProducto(idComercio2, 'Biscotti Fiori d\'Arancio', 'Biscotti artigianali profumati con arance biologiche siciliane.', 15, 6.00, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002713/eva-creative-lVf3t9JWS0E-unsplash_winb5z.jpg');
     await createProducto(idComercio2, 'Cannoli Siciliani (Kit)', 'Kit con scorze croccanti e sac-à-poche di ricotta fresca.', 10, 18.00, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002714/frankie-lopez-zZj6oQwhhTs-unsplash_gae3ge.jpg');
     
     // --> Productos Carnicería
     await createProducto(idComercio3, 'Salsiccia Pasqualora', 'Tipica salsiccia siciliana condita con sale, pepe e finocchietto.', 25, 12.00, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002718/danielle-suijkerbuijk-NWo2mDYnfjY-unsplash_voq7t0.jpg');
     await createProducto(idComercio3, 'Involtini alla Siciliana', 'Involtini di vitello ripieni di pangrattato, formaggio e pinoli.', 40, 15.50, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002711/donald-giannatti-sWZ85aMZXg4-unsplash_zleecb.jpg');
     await createProducto(idComercio3, 'Costine di Maiale Nero', 'Pregiata carne di maiale nero dei Nebrodi, sapore selvatico.', 15, 14.00, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002711/1586_involtini_id1ikb.webp');
     
     // --> Productos Vivero
     await createProducto(idComercio4, 'Pianta di Limone in Vaso', 'Albero di limone ornamentale, perfetto per balconi e terrazzi.', 10, 35.00, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002711/ildar-garifullin-uz0Q5euY4Ow-unsplash_vzwa1t.jpg');
     await createProducto(idComercio4, 'Gelsomino Siciliano', 'Pianta rampicante molto profumata con fiori bianchi a stella.', 20, 12.50, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002712/dl314-lin-50GT6tNMobs-unsplash_pbryu8.jpg');
     await createProducto(idComercio4, 'Set Erbe Aromatiche', 'Tris di vasi con timo, rosmarino e origano fresco.', 30, 9.00, 'https://res.cloudinary.com/defaik2fl/image/upload/v1774002711/samuel-toh-ICUH7gCnwr4-unsplash_nv6lmc.jpg');
     
     // --> Productos Textiles y Moda (Comercio 5)
     await createProducto(idComercio5, 'Borsa in Tessuto Naturale', 'Borsa capiente realizzata a mano con cotone 100% biologico.', 12, 45.00, "https://res.cloudinary.com/defaik2fl/image/upload/v1774259314/raghavendra-v-konkathi-bA6_iNYP3CM-unsplash_fhxciw.jpg");
     await createProducto(idComercio5, 'Sciarpa in Lana Merinos', 'Morbida sciarpa tessuta al telaio, colori caldi autunnali.', 8, 38.50, "https://res.cloudinary.com/defaik2fl/image/upload/v1774259315/maria-kovalets-zhpCD4Y-sVg-unsplash_elfrgh.jpg");
     await createProducto(idComercio5, 'Grembiule da Cucina Ricamato', 'Grembiule in lino resistente con motivi tradizionali ricamati.', 15, 22.00, "https://res.cloudinary.com/defaik2fl/image/upload/v1774259315/Gemini_Generated_Image_un6140un6140un61_f8ezb2.png");

     // --> Productos Artesanía y Regalos (Comercio 6)
     await createProducto(idComercio6, 'Testa di Moro (Coppia)', 'Classiche teste di moro siciliane in ceramica, altezza 15cm.', 5, 85.00, "https://res.cloudinary.com/defaik2fl/image/upload/v1774259313/TESTE-DI-MORO-MOORISH-HEAD-FRUTTA-PICCOLE_noxjo9.webp");
     await createProducto(idComercio6, 'Piatto Decorato a Mano', 'Piatto da portata con decorazioni geometriche e colori solari.', 10, 35.00, "https://res.cloudinary.com/defaik2fl/image/upload/v1774259314/sadikali-pm-eWIAKlRUMbo-unsplash_qpmlty.jpg");
     await createProducto(idComercio6, 'Pigna Portafortuna', 'Tradizionale pigna siciliana in ceramica verde ramina.', 20, 28.00, "https://res.cloudinary.com/defaik2fl/image/upload/v1774259313/pigne-di-caltagirone-prezzi_qoukda.jpg");

     console.log('Productos añadidos al catálogo OK');

     console.log('Todo OK datos añadidos a las tablas');
     process.exit(0);

  } catch (error) {
     console.error('❌ Error sembrando la base de datos:', error);
     process.exit(1);
  }
}

seed();