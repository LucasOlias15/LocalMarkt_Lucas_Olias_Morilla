import { motion } from "framer-motion";
import {
  AlignLeft,
  ArrowRight,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  Tags,
  User,
  Users,
  TrendingUp,
  MapPinX,
} from "lucide-react";
import {
  REGEX_NOMBRE_USUARIO,
  REGEX_EMAIL,
  REGEX_CONTRASENYA,
  REGEX_TELEFONO,
  REGEX_NOMBRE_TIENDA,
  REGEX_DIRECCION,
  REGEX_DESCRIPCION_TIENDA,
} from "../../../common/validaciones.js";
import { useState } from "react";
import { LocationPicker } from "../components/map/LocationPicker";
import { Link, useLocation } from "wouter";
import { PasswordInput } from "../components/common/PasswordInput";

export const RegisterPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // 1. ESTADOS DEL FORMULARIO
  const [tipoCuenta, setTipoCuenta] = useState("cliente");

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados exclusivos del Comercio
  const [nombreComercio, setNombreComercio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [contacto, setContacto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [imagen, setImagen] = useState(null);

  // 📍 Estado que guarda las coordenadas que nos pasa el LocationPicker
  const [coordenadasTienda, setCoordenadasTienda] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const [toast, setToast] = useState(null);

  const mostrarNotificacion = (mensaje, tipo = "error") => {
    setToast({ mensaje, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // 2. FUNCIÓN DE REGISTRO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificamos los campos comunes
    if (!REGEX_NOMBRE_USUARIO.test(nombreUsuario)) {
      setError("El nombre debe tener entre 3 y 80 caracteres (solo letras).");
      return;
    } else if (!REGEX_EMAIL.test(email)) {
      setError("Introduce un correo electrónico válido (ejemplo@correo.com).");
      return;
    } else if (!REGEX_CONTRASENYA.test(password)) {
      setError(
        "La clave debe tener 8+ caracteres, una mayúscula, una minúscula y un número.",
      );
      return;
    }

    // Verificamos los campos específicos de los dueños
    if (tipoCuenta === "dueño") {
      if (!REGEX_TELEFONO.test(contacto)) {
        setError("Introduce un número de teléfono válido (9 dígitos).");
        return;
      } else if (!REGEX_NOMBRE_TIENDA.test(nombreComercio)) {
        setError(
          "Nombre de tienda inválido (mínimo 2 caracteres, evita símbolos raros).",
        );
        return;
      } else if (!REGEX_DIRECCION.test(direccion)) {
        setError("La dirección debe ser más específica (mínimo 5 caracteres).");
        return;
      } else if (!REGEX_DESCRIPCION_TIENDA.test(descripcion)) {
        setError("La descripción debe tener entre 10 y 500 caracteres.");
        return;
      } else if (!coordenadasTienda) {
        setError("Por favor, usa el mapa para ubicar exactamente tu comercio.");
        return;
      }
    }

    setLoading(true);
    setError("");

    // FormData para enviar los datos y la imagen
    const paqueteDeDatos = new FormData();
    paqueteDeDatos.append("email", email);
    paqueteDeDatos.append("clave", password);
    paqueteDeDatos.append("nombreUsuario", nombreUsuario);
    paqueteDeDatos.append("rol", tipoCuenta);

    // Solo añadimos los datos del comercio si es dueño
    if (tipoCuenta === "dueño") {
      paqueteDeDatos.append("nombreComercio", nombreComercio);
      paqueteDeDatos.append("descripcion", descripcion);
      paqueteDeDatos.append("categoria", categoria);
      paqueteDeDatos.append("contacto", contacto);
      paqueteDeDatos.append("direccion", direccion);
      // 🗺️ Añadimos las coordenadas reales sacadas del mapa
      paqueteDeDatos.append("latitud", coordenadasTienda.lat);
      paqueteDeDatos.append("longitud", coordenadasTienda.lng);
    }

    if (imagen) {
      paqueteDeDatos.append("imagen", imagen);
    }

    try {
      const res = await fetch(`${API_URL}/users/registro`, {
        method: "POST",
        body: paqueteDeDatos,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setLocation("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 z-10"
      >
        {/* LADO IZQUIERDO: Branding */}
        <div className="md:w-5/12 bg-jungle_teal-300 relative overflow-hidden text-white border-r border-white/10 shadow-inner">
          <div className="sticky top-0 p-10 flex flex-col min-h-screen md:h-screen">
            <div className="absolute -top-18 -left-34 w-110 h-110 opacity-95 pointer-events-none drop-shadow-2xl">
              <img
                src="/logo.png"
                alt="Logo LocalMarkt"
                className="w-full h-full object-contain"
              />
            </div>

            <div
              className={`relative z-10 text-left pb-4 ${tipoCuenta === "dueño" ? "mt-145" : "mt-auto"}`}
            >
              <h3 className="font-black text-3xl tracking-tight text-white mb-6">
                LocalMarkt
              </h3>

              {tipoCuenta === "cliente" ? (
                <div className="animate-fade-in">
                  <h2 className="text-4xl font-black mb-4 leading-tight tracking-tight text-yellow-400">
                    El barrio en <br />{" "}
                    <span className="text-yellow-500/65">tu bolsillo</span>
                  </h2>
                  <p className="text-white/60 text-lg font-medium max-w-sm">
                    Únete a la comunidad. Compra productos frescos, apoya al
                    comercio local y descubre los tesoros de tu ciudad.
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h2 className="text-4xl font-black mb-6 leading-tight tracking-tight text-yellow-400">
                    Impulsa tu <br />{" "}
                    <span className="text-yellow-500/65">negocio local</span>
                  </h2>

                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-white/80 font-medium text-lg">
                      <div className="bg-yellow-500/20 p-2.5 rounded-xl text-yellow-400">
                        <Store size={22} />
                      </div>
                      Escaparate digital 24/7
                    </li>
                    <li className="flex items-center gap-4 text-white/80 font-medium text-lg">
                      <div className="bg-sea_green/20 p-2.5 rounded-xl text-sea_green">
                        <Users size={22} />
                      </div>
                      Conecta con tus vecinos
                    </li>
                    <li className="flex items-center gap-4 text-white/80 font-medium text-lg">
                      <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400">
                        <TrendingUp size={22} />
                      </div>
                      Aumenta tus ventas
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm font-bold bg-white/10 w-fit px-4 py-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg mt-8">
                <MapPin size={20} className="text-yellow-400" />
                Más de 500 comercios ya están aquí
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-base-100 relative overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-base-content mb-3 leading-tight tracking-tight">
              Crear cuenta
            </h1>
            <p className="text-base-content/60 text-lg font-medium">
              ¿Cómo te gustaría unirte a nosotros?
            </p>
          </div>

          {/* SELECTOR DE TIPO DE CUENTA */}
          <div className="flex bg-base-200 p-1.5 rounded-2xl mb-8 border border-base-300 shadow-sm">
            <button
              type="button"
              onClick={() => setTipoCuenta("cliente")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                tipoCuenta === "cliente"
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "bg-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              <User size={18} /> Soy Cliente
            </button>
            <button
              type="button"
              onClick={() => setTipoCuenta("dueño")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                tipoCuenta === "dueño"
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "bg-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              <Store size={18} /> Soy Comercio
            </button>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Campo común: Nombre Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                Tu Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ej. Laura Gómez"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-2 focus:ring-jungle_teal/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* CAMPOS EXCLUSIVOS DEL COMERCIO */}
            {tipoCuenta === "dueño" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-6 overflow-visible"
              >
                <div className="divider my-0 text-xs font-bold uppercase text-base-content/30">
                  Datos de tu tienda
                </div>

                {/* Nombre y Categoría */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                      Nombre de la Tienda
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                        <Store size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Ej. Frutería Loli"
                        value={nombreComercio}
                        onChange={(e) => setNombreComercio(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all"
                        required={tipoCuenta === "dueño"}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                      Categoría
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                        <Tags size={18} />
                      </div>
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all appearance-none cursor-pointer"
                        required={tipoCuenta === "dueño"}
                      >
                        <option value="" disabled>
                          Seleccionar...
                        </option>
                        <option value="Frutería">Frutería</option>
                        <option value="Panadería">Panadería</option>
                        <option value="Carnicería">Carnicería</option>
                        <option value="Pastelería">Pastelería</option>
                        <option value="Bio">Productos Bio/Eco</option>
                        <option value="Artesanía y regalos">
                          Artesanía y Regalos
                        </option>
                        <option value="Textiles y moda">Textiles y Moda</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                    Descripción
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none text-base-content/40">
                      <AlignLeft size={18} />
                    </div>
                    <textarea
                      placeholder="Cuéntanos sobre tu comercio..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all min-h-25 resize-none"
                      required={tipoCuenta === "dueño"}
                    ></textarea>
                  </div>
                </div>

                {/* Contacto y Dirección (Texto) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                      Teléfono
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        placeholder="600 000 000"
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all"
                        required={tipoCuenta === "dueño"}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                      Dirección Completa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Calle Principal, 1, Puerta 2"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all"
                        required={tipoCuenta === "dueño"}
                      />
                    </div>
                  </div>
                </div>

                {/* 🗺️ INTEGRACIÓN DEL COMPONENTE DEL MAPA */}
                <div className="mt-2">
                  <LocationPicker
                    onLocationSelect={(coords) => setCoordenadasTienda(coords)}
                    onError={(mensaje) => mostrarNotificacion(mensaje, "error")}
                  />
                </div>

                {/* Logo / Imagen */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                    Logo o Foto (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40 z-10">
                      <ImageIcon size={18} />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImagen(e.target.files[0])}
                      className="file-input w-full pl-12 bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all rounded-xl"
                    />
                  </div>
                </div>

                <div className="divider my-0 text-xs font-bold uppercase text-base-content/30">
                  Datos de acceso
                </div>
              </motion.div>
            )}

            {/* CAMPOS COMUNES (Email y Clave) */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                    <Lock size={18} />
                  </div>
                  <PasswordInput
                    name="clave"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-bold text-center bg-red-100 p-3 rounded-xl mt-2"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn bg-jungle_teal hover:bg-sea_green text-white border-none rounded-xl h-14 mt-4 shadow-md shadow-jungle_teal/20 text-lg font-bold"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  Registrarme <ArrowRight size={20} className="ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-base font-medium text-base-content/70">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login">
                <a className="text-jungle_teal font-bold hover:underline cursor-pointer">
                  Inicia sesión aquí
                </a>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
      {toast && (
        <div className="fixed top-22 left-1/2 -translate-x-1/2 z-9999 animate-fade-in-down">
          <div
            className={`alert shadow-2xl font-bold rounded-2xl text-red-500 border-none pr-6 flex items-center gap-2 ${
              toast.tipo === "error" ? " bg-red-100" : "bg-jungle_teal"
            }`}
          >
            <MapPinX />
            <span>{toast.mensaje}</span>
          </div>
        </div>
      )}
    </div>
  );
};
