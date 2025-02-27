import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle  } from 'lucide-react';

interface SearchPanelProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalProducts: number;
  onCreateClick: () => void;
}

export function SearchPanel({ 
  searchQuery, 
  onSearchChange, 
  totalProducts,
  onCreateClick 
}: SearchPanelProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between space-y-4 md:space-y-2 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-10">
        <div className="flex items-center space-x-6">

        <h2 className="text-3xl font-bold tracking-tight">Каталог товаров</h2>
      
        <span className='text-lg -mb-1'>{totalProducts}</span>
        </div>
        <Button onClick={onCreateClick} className="w-full sm:w-auto">
          <PlusCircle/>
          Добавить товар
        </Button>
      </div>
      <div className="flex md:ml-auto">
        <Input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-[200px] md:w-[300px]"
        />
      </div>
    </div>
  );
} 