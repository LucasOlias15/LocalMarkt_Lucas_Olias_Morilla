export const DrawerSideBar = ({ children }) => {
    return (
        <div className="drawer">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />

            {/* TODO Cambiar el menú de un despliegue lateral a un despliegue superior (como el de Amazon) 
            para que sea más accesible en móvil. */}

            <div className="drawer-content">
                {/* IMPORTANTE: No ponemos flex-col aquí. 
                   El Header será el primer hijo y podrá ser sticky 
                   porque el scroll ahora pertenece a la ventana principal.
                */}
                {children}
            </div>

            {/* BARRA LATERAL */}
            {/* Cambiamos z-150 por z-[150] (valor arbitrario) para asegurar que tape al Header */}
            <div className="drawer-side z-150">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

                <ul className="menu bg-base-100 text-base-content min-h-full w-80 p-6 shadow-2xl border-r border-base-200">
                    <div className="mb-8 px-4 font-bold text-xl text-jungle_teal flex items-center gap-2">
                        <span>📁</span> LocalMarkt
                    </div>

                    <li className="mb-2">
                        <a className="hover:bg-jungle_teal/10 hover:text-jungle_teal transition-colors text-lg font-medium">
                            🏠 Inicio
                        </a>
                    </li>
                    <li className="mb-2">
                        <a className="hover:bg-jungle_teal/10 hover:text-jungle_teal transition-colors text-lg font-medium">
                            📦 Mis Productos
                        </a>
                    </li>
                    <li className="mb-2">
                        <a className="hover:bg-jungle_teal/10 hover:text-jungle_teal transition-colors text-lg font-medium">
                            🛒 Mis Compras
                        </a>
                    </li>

                    <div className="divider opacity-50"></div>

                    <li>
                        <a className="text-sm opacity-70 hover:bg-base-200">Soporte técnico</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};