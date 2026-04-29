import { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Megaphone,
  Star,
  BanknoteArrowUp,
  Crown,
  X
} from "lucide-react";
import { useLocation } from "wouter";

export const ShopPromotionModal = () => {
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [, setLocation] = useLocation();

  // Obtener usuario para saber si es dueño
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const planes = [
    {
      id: "basico",
      nombre: "Plan Visibilidad",
      precio: "3.99€/mes",
      color: "from-jungle_teal to-sea_green",
      icono: Megaphone,
      bgCard: "bg-jungle_teal/5 border-jungle_teal/30",
      bgBoton: "bg-jungle_teal hover:bg-jungle_teal/90",
      bgSeleccionado: "bg-jungle_teal/10 border-jungle_teal shadow-lg shadow-jungle_teal/10",
      checkColor: "text-jungle_teal",
      beneficios: [
        "Aparece en el mapa interactivo",
        "Ficha de tienda personalizada",
        "Catálogo de productos ilimitado",
        "Edición del comercio gratuita",
        "Revisión del equipo de LocalMarkt"
      ]
    },
    {
      id: "premium",
      nombre: "Plan Destacado",
      precio: "9.99€/mes",
      color: "from-yellow-500 to-amber-500",
      icono: Crown,
      bgCard: "bg-yellow-500/5 border-yellow-500/30",
      bgBoton: "bg-yellow-500 hover:bg-yellow-600",
      bgSeleccionado: "bg-yellow-500/10 border-yellow-500 shadow-lg shadow-yellow-500/10",
      checkColor: "text-yellow-600",
      beneficios: [
        "Todo lo del Plan Visibilidad",
        "Posición prioritaria en búsquedas",
        "Badge de 'Tienda Destacada'",
        "Productos en carrusel principal",
        "Estadísticas avanzadas",
        "Soporte prioritario 24h"
      ],
      destacado: true
    }
  ];

  const handleSolicitar = () => {
    if (!user) {
      // No está logueado → redirigir a login
      setLocation("/login");
      return;
    }
    
    if (user.rol !== "dueño") {
      // Es cliente → redirigir a registro
      setLocation("/registro");
      return;
    }

    // Es dueño → aquí iría la lógica de solicitud (por ahora cerramos)
    document.getElementById('shop_promotion_modal').close();
    // toast.success("¡Solicitud enviada! Nos pondremos en contacto contigo.");
  };

  return (
    <dialog id="shop_promotion_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-base-100 text-base-content rounded-t-3xl sm:rounded-[2.5rem] border border-base-200 shadow-2xl max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera con gradiente - SIEMPRE VISIBLE */}
        <div className="relative overflow-hidden bg-linear-to-br from-jungle_teal to-sea_green p-6 sm:p-8 text-white shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <BanknoteArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
              <h3 className="font-black text-2xl sm:text-3xl tracking-tight">
                Impulsa tu <span className="text-yellow-400">negocio</span>
              </h3>
            </div>
            <p className="text-white/80 text-sm sm:text-base max-w-lg">
              Elige el plan que mejor se adapte a tu tienda y empieza a vender más desde hoy.
            </p>
          </div>

          {/* Botón cerrar */}
          <form method="dialog">
            <button className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm text-white/70 hover:text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Cuerpo con SCROLL */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* Planes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {planes.map((plan) => {
              const seleccionado = planSeleccionado === plan.id;
              const IconoPlan = plan.icono;

              return (
                <div
                  key={plan.id}
                  onClick={() => setPlanSeleccionado(plan.id)}
                  className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 ${
                    seleccionado
                      ? plan.bgSeleccionado
                      : "bg-base-200/50 border-transparent hover:border-base-300 hover:bg-base-200"
                  }`}
                >
                  {/* Badge de destacado */}
                  {plan.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="badge bg-yellow-500 text-white border-none font-bold px-4 py-3 text-xs gap-1 shadow-lg shadow-yellow-500/20">
                        <Sparkles className="w-3 h-3" /> Más popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${plan.color} flex items-center justify-center mb-3`}>
                        <IconoPlan className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-black text-lg text-base-content">{plan.nombre}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-base-content">{plan.precio}</p>
                      {plan.precio !== "Gratis" && (
                        <p className="text-xs text-base-content/50">+ IVA</p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-base-content/70">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                          seleccionado ? plan.checkColor : "text-base-content/30"
                        }`} />
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Estadísticas rápidas (siempre visibles) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-jungle_teal mx-auto mb-1" />
              <p className="text-lg font-black text-base-content">+40%</p>
              <p className="text-[10px] text-base-content/50 uppercase tracking-wider">Más ventas</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-jungle_teal mx-auto mb-1" />
              <p className="text-lg font-black text-base-content">+500</p>
              <p className="text-[10px] text-base-content/50 uppercase tracking-wider">Vecinos</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 text-center">
              <MapPin className="w-5 h-5 text-jungle_teal mx-auto mb-1" />
              <p className="text-lg font-black text-base-content">20km</p>
              <p className="text-[10px] text-base-content/50 uppercase tracking-wider">Alcance</p>
            </div>
          </div>

          {/* Aviso para no dueños */}
          {user && user.rol !== "dueño" && planSeleccionado && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-amber-800 font-medium">
                Para solicitar un plan necesitas ser dueño de un comercio. 
                Serás redirigido a la página de registro para crear tu tienda.
              </p>
            </div>
          )}
        </div>

        {/* Pie con botones - SIEMPRE VISIBLE */}
        <div className="p-6 sm:px-8 border-t border-base-200 bg-base-100 shrink-0">
          <div className="flex gap-3">
            <form method="dialog" className="flex gap-3 w-full">
              <button className="btn btn-ghost text-base-content/60 hover:bg-base-200 flex-1 sm:flex-none rounded-xl">
                Quizás luego
              </button>
              <button 
                type="button"
                onClick={handleSolicitar}
                className={`btn flex-1 sm:flex-none rounded-xl border-none text-green-950 shadow-lg ${
                  planSeleccionado 
                    ? planes.find(p => p.id === planSeleccionado).bgBoton
                    : "bg-base-300 text-base-content/40 cursor-not-allowed"
                }`}
                disabled={!planSeleccionado}
              >
                {planSeleccionado ? (
                  <>
                    {!user 
                      ? "Iniciar sesión" 
                      : user.rol !== "dueño" 
                        ? "Registrar mi tienda" 
                        : `Solicitar ${planes.find(p => p.id === planSeleccionado)?.nombre}`
                    } 
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  "Selecciona un plan"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fondo */}
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-sm">
        <button>cerrar</button>
      </form>
    </dialog>
  );
};