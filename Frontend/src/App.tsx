import { Home } from '@/components/Home';
import { RefreshProvider } from '@/hooks/useRefresh'
import { ProductsProvider } from '@/context/ProductsContext';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <RefreshProvider>
      <ProductsProvider>
        <>
        <Home />
        <Toaster />
        </>
      </ProductsProvider>
    </RefreshProvider>

  );
}

export default App;

