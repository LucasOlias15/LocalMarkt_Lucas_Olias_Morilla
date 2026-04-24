import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ForgotPasswordModal } from "../components/common/ForgotPasswordModal";
import { PasswordInput } from "../components/common/PasswordInput";

export const LoginPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Lógica de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, clave: password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Credenciales incorrectas");

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      setLocation("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-8">
      {/* Contenedor Principal Split-Screen */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 z-10"
      >
        {/* LADO IZQUIERDO: Formulario de Login        */}

        <div className="md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-base-100 relative">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-base-content mb-3 leading-tight tracking-tight">
              Bienvenido <br /> de{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-jungle_teal to-yellow-500">
                nuevo
              </span>
            </h1>
            <p className="text-base-content/60 text-lg font-medium max-w-sm mx-auto md:mx-0">
              Inicia sesión para gestionar tus compras o tu comercio.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
                  placeholder="LocalMarkt@email.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-base-200/50 border-2 border-transparent text-base text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-2 focus:ring-jungle_teal/10 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-1 flex justify-between">
                <span>Contraseña</span>
                <a
                  onClick={() =>
                    document.getElementById("forgot_password_modal").showModal()
                  }
                  className="text-jungle_teal hover:underline normal-case tracking-normal text-sm font-semibold cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </a>
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
                  Acceder ahora <ArrowRight size={20} className="ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-base font-medium text-base-content/70">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/registro">
                <a className="text-jungle_teal font-bold hover:underline cursor-pointer">
                  Regístrate aquí
                </a>
              </Link>
            </p>
          </div>
        </div>

        {/* LADO DERECHO: Branding y Bienvenida */}

        <div className="md:w-5/12 bg-jungle_teal-300 p-10 flex flex-col relative overflow-hidden text-white border-l border-white/10 shadow-inner">
          <div className="absolute -top-20 -right-30 w-120 h-120 opacity-95 pointer-events-none drop-shadow-2xl">
            <img
              src="/logo.png"
              alt="Logo LocalMarkt"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Espaciador para empujar el texto hacia abajo, dejando sitio al logo */}
          <div className="flex-1 min-h-55"></div>

          {/* Textos alineados a la derecha */}
          <div className="relative z-10 text-right mt-auto">
            <h3 className="font-black text-3xl tracking-tight text-yellow-500">
              LocalMarkt
            </h3>
            <h2 className="text-4xl font-black mb-4 leading-tight tracking-tight text-white">
              Tu barrio <br /> <span className="text-white/80">te espera</span>
            </h2>
            <p className="text-white/60 text-lg font-medium ml-auto max-w-sm">
              Inicia sesión para conectar con los comercios más frescos y apoyar
              la economía de tu ciudad.
            </p>
          </div>
        </div>
      </motion.div>
      <ForgotPasswordModal />
    </div>
  );
};
