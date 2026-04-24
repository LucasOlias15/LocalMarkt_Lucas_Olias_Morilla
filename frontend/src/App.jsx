import { Route, Switch } from 'wouter';
import { MainLayout } from './layouts/mainLayout';
import { Home } from './pages/Home'; // Asegúrate de tenerlo des-comentado
import { MapPage } from "./pages/MapPage"; 
import { Products } from './pages/Products';
import { ShopDetail } from './pages/ShopDetail';
import { LoginPage } from './pages/LoginPage';
import { StorePanelPage } from './pages/StorePanelPage'; 
import { Profile } from './pages/Profile';
import { ExplorePage } from './pages/ExplorePage';
import { OrdersPage } from './pages/OrdersPage';
import { RegisterPage } from './pages/RegisterPage';
import { ToastContainer } from './components/common/ToastContainer';

function App() {
  return (
      <MainLayout>
        <Switch>
        {/* 1. Ruta principal: Home */}
        <Route path="/" component={Home} />
        
        {/* 2. Ruta de productos */}
        <Route path="/productos" component={Products} />

        {/* 3. El Mapa Interactivo */}
        <Route path="/mapa" component={MapPage} />

        {/* 4. Detalle de la tienda */}
        <Route path="/tienda/:id" component={ShopDetail} />

        {/* 5. Ruta de login */}
        <Route path="/login" component={LoginPage} />

        {/* 7. Ruta de perfil */}
        <Route path="/perfil" component={Profile} />

        {/* 6. Panel de gestión de la tienda (solo para el dueño) */}
        <Route path="/panel-tienda/:id" component={StorePanelPage} />

        {/* 7. Ruta para mostrar productos y tiendas completos ,  con filtros y búsqueda*/}
        <Route path="/explorar" component={ExplorePage}/>

        {/* 8. Ruta de gestíon de los pedidos realizados por el usuario*/}
        <Route path="/perfil/pedidos" component={OrdersPage}/>

        {/* 9. Ruta de registro de comercios y usuarios*/}
        <Route path="/registro" component={RegisterPage}/>

        {/* Ruta 404: Captura errores de URL */}
          <Route>
            <div className="flex flex-col items-center py-20">
              <h1 className="text-4xl font-bold">404 - Página no encontrada</h1>
              <button 
                className="btn btn-ghost mt-4" 
                onClick={() => window.location.href='/'}
              >
                Volver al inicio
              </button>
            </div>
          </Route>
        </Switch>
        <ToastContainer />
      </MainLayout>
  );
}

export default App;