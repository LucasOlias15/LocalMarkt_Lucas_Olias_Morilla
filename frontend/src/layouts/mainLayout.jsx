import { Footer } from '../components/Footer';
import { TopMenuLayout } from '../components/TopMenuLayout';
import { FloatingMapButton } from '../components/FloatingMapButton'; 

export const MainLayout = ({ children }) => {
  return (
    <TopMenuLayout>
        
        <div className="flex flex-col min-h-[calc(100vh-64px)] relative"> 
          <main className="grow overflow-x-hidden">
            {children} 
          </main>
          
          <Footer />
          
          <FloatingMapButton />
          
        </div>

    </TopMenuLayout>
  );
};
