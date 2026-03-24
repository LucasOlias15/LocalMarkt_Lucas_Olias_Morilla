import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";

export const LoginPage = () => {
  // Estados para controlar el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Hook de wouter para redirigir al usuario tras el login
  const [, setLocation] = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setLoading(true);
    setError(""); // Limpiamos errores previos

    try {
      // Llamada a tu API de Node.js (Asegúrate de que la URL coincida con tu backend)
const res = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, clave: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

// ¡Éxito! Guardamos el token en el navegador (localStorage)
      localStorage.setItem("token", data.token);
      
      // Guardamos los datos del usuario en Localstorage user
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirigimos al usuario a su panel o a la página principal
      setLocation("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 relative overflow-hidden px-4">
      
      {/* Círculos decorativos de fondo (Estilo que ya usabas) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jungle_teal/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-base-100 p-8 rounded-[2.5rem] shadow-2xl border border-white/20 z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-base-content tracking-tight mb-2">
            Bienvenido <br/> de <span className="text-transparent bg-clip-text bg-linear-to-r from-jungle_teal to-yellow-500">nuevo</span>
          </h1>
          <p className="text-base-content/60 font-medium">
            Inicia sesión para gestionar tu comercio
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Campo Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-base-content/80">Correo Electrónico</span>
            </label>
            <input 
              type="email" 
              placeholder="salvatore@regina.com" 
              className="input input-bordered w-full rounded-2xl focus:border-jungle_teal focus:ring-2 focus:ring-jungle_teal/20" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-base-content/80">Contraseña</span>
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input input-bordered w-full rounded-2xl focus:border-jungle_teal focus:ring-2 focus:ring-jungle_teal/20" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-bold text-center bg-red-100 p-3 rounded-xl">
              {error}
            </motion.div>
          )}

          {/* Botón Submit */}
          <button 
            type="submit" 
            className="btn w-full bg-jungle_teal hover:bg-teal-700 text-white border-none rounded-2xl text-lg font-bold"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Entrar al Panel"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-base-content/60">
          ¿No tienes una cuenta? <Link href="/registro" className="text-jungle_teal hover:underline font-bold">Regístrate aquí</Link>
        </div>
      </motion.div>

    </div>
  );
};