import { UserRoundKey, UserRoundCog, Store, LogOut } from "lucide-react";

export const ProfileHeader = ({ user, onLogout }) => {
  return (
    <section className="bg-base-200 rounded-[3rem] p-8 md:p-12 shadow-sm border border-base-300 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sea_green/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="avatar z-10">
        <div className="w-32 h-32 rounded-[2.5rem] p-1.5 bg-linear-to-tr from-jungle_teal to-bright_fern shadow-xl">
          <div className="w-full h-full rounded-[2.2rem] bg-base-100 flex items-center justify-center text-jungle_teal">
            {user.rol === "dueño" ? (
              <UserRoundKey className="w-12 h-12" />
            ) : (
              <UserRoundCog className="w-12 h-12" />
            )}
          </div>
        </div>
      </div>

      <div className="z-10 text-center md:text-left flex-1">
        <h1 className="text-4xl md:text-5xl font-black text-base-content tracking-tight mb-2">
          {user.nombre}
        </h1>
        <p className="text-lg text-base-content/60 font-medium mb-5">
          {user.email}
        </p>
        <span
          className={`badge badge-lg border-none py-4 px-5 font-bold shadow-sm inline-flex items-center gap-2 ${
            user.rol === "dueño"
              ? "bg-jungle_teal text-white"
              : "bg-bright_fern text-white"
          }`}
        >
          {user.rol === "dueño" ? (
            <>
              <Store className="w-4 h-4" /> DUEÑO DE COMERCIO
            </>
          ) : (
            <>
              <UserRoundCog className="w-4 h-4" /> CLIENTE LOCAL
            </>
          )}
        </span>
      </div>

      <button
        onClick={onLogout}
        className="z-10 btn btn-circle btn-ghost text-base-content/40 hover:bg-error/10 hover:text-error transition-colors md:self-start"
        title="Cerrar sesión"
      >
        <LogOut/>
      </button>
    </section>
  );
};