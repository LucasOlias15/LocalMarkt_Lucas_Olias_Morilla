import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export const CategoriesBento = () => {

    const [, setLocation] = useLocation();

  const handleSearch = () => {
      setLocation(`/explorar?categoria=Todas`)
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
            Explora tu mercado
          </h2>
          <p className="text-base-content/70 text-lg">
            Descubre los mejores productos de los comercios de tu zona.
          </p>
        </div>
        <button className="btn btn-ghost text-jungle_teal hover:bg-jungle_teal/10" onClick={handleSearch}>
          Ver todas las categorías &rarr;
        </button>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
      >
        {/* CATEGORÍA 1 */}
        <CategoryCard 
          span="md:col-span-2 md:row-span-2"
          title="Frutas y Verduras"
          desc="Directo del huerto a tu mesa"
          img="/categories/frutasyverduras.jpg" 
          href="/explorar?categoria=Frutería"
        />

        {/* CATEGORÍA 2 */}
        <CategoryCard 
          title="Panadería"
          desc="Recién horneado"
          img="/categories/panaderia.jpg"
          href="/explorar?categoria=Panadería"
        />

        {/* CATEGORÍA 3 */}
        <CategoryCard 
          span="md:row-span-2"
          title="Carnicería"
          desc="Cortes premium"
          img="/categories/carniceria.jpg"
          href="/explorar?categoria=Carnicería"
        />

        {/* CATEGORÍA 4 */}
        <CategoryCard 
          title="Lácteos"
          desc="Quesos artesanos"
          img="/categories/lacteos.jpg"
          href="/explorar?categoria=Bio"
        />

        {/* CATEGORÍA 5 */}
        <CategoryCard 
          span="md:col-span-2"
          title="Artesanía y Regalos"
          desc="Apoya a los creadores locales"
          img="/categories/Artesania.jpg"
          href="/explorar?categoria=Artesanía y regalos"
        />

          {/* CATEGORÍA 6 */}
        <CategoryCard 
          span="md:col-span-2"
          title="Textiles y Moda"
          desc="Apoya a los creadores locales"
          img="/categories/ropa.jpg"
          href="/explorar?categoria=Textiles y moda"
        />

      </motion.div>
    </section>
  );
};

// Sub-componente para no repetir código 5 veces
const CategoryCard = ({ span = "", title, desc, img ,href}) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} 
    className={`${span} relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300`}
  >
    {/* IMAGEN DE FONDO */}

    <a href={href}>
      <img 
        src={img} 
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* OVERLAY OSCURO (Para que el texto destaque) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>

      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">

        <div>
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{title}</h3>
          <p className="text-white/80 font-medium text-sm">{desc}</p>
        </div>
      </div>
    </a>
  </motion.div>
);