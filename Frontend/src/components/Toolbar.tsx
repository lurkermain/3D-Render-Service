import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle,  X } from "lucide-react";


interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalProducts: number;
  onCreateClick: () => void;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  totalProducts,
  onCreateClick,
}: ToolbarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleExpandSearch = () => {
    setIsSearchExpanded(true);
  };

console.log("toolbar render")


  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    onSearchChange("");
  };

  return (
    <div>
    {/* Mobile version */}
    <div className="flex sm:hidden items-center justify-between w-full">
      {/* Если поиск открыт, показываем только инпут и кнопку закрытия */}
      {isSearchExpanded ? (
        <div className="flex items-center gap-2 w-full">
          <Input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button variant="secondary" size="icon" onClick={handleCloseSearch}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {/* Если поиск закрыт, показываем кнопку поиска, заголовок и кнопку добавления */}
          <Button variant="outline" size="icon" onClick={handleExpandSearch}>
            <Search className="h-5 w-5" />
          </Button>
  
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Каталог товаров</h2>
            <span className="text-lg -mb-1">{totalProducts}</span>
          </div>
  
          <Button variant="outline" size="icon" onClick={onCreateClick}>
            <PlusCircle />
          </Button>
        </>
      )}
    </div>
  
    {/* Desktop version */}
    <div className="hidden sm:flex gap-3 items-center justify-between mb-8">
      <div className="flex items-center space-x-10">
        <div className="flex items-center space-x-6">
          <h2 className="text-3xl font-bold tracking-tight">Каталог товаров</h2>
          <span className="text-lg -mb-1">{totalProducts}</span>
        </div>
        <Button onClick={onCreateClick} className="w-full sm:w-auto">
          <PlusCircle />
          Добавить товар
        </Button>
      </div>
    
           
  
      <div className="flex md:ml-auto items-start">
        <Input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[300px]"
        />
      </div>
    </div>
  </div>
  );
}
