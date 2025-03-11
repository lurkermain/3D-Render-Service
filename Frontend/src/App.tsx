import { Home } from '@/components/Home';
import { RefreshProvider } from '@/hooks/useRefresh'
import { ProductsProvider } from '@/context/ProductsContext';

function App() {
  return (
    <RefreshProvider>
      <ProductsProvider>
        <Home />
      </ProductsProvider>
    </RefreshProvider>

  );
}

export default App;

