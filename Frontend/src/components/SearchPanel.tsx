import { Input } from './ui/input';
import { Button } from './ui/button';
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
    <div className="flex items-center justify-between space-y-2 mb-8">
      <div className="flex items-center space-x-10">
        <div className="flex items-center space-x-6">

        <h2 className="text-3xl font-bold tracking-tight">Каталог товаров</h2>
      
        <span className='text-lg -mb-1'>{totalProducts}</span>
        </div>
        <Button onClick={onCreateClick}>
          <PlusCircle/>
          Добавить товар
        </Button>
      </div>
      <div className="ml-auto space-x-4">
        <Input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="md:w-[100px] lg:w-[300px]"
        />
      </div>
    </div>
  );
} 