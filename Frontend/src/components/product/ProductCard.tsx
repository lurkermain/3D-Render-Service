import { memo } from "react"
import { Product } from "../../lib/types"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onClick: () => void
}
const ProductCard = memo(({ product, onClick }: ProductCardProps) => {
  return (
    <div
      className={cn(
        // border-[1px] border-[rgba(0,0,0,0.3)]
        "space-y-3  rounded-md cursor-pointer",
        "w-full h-auto max-w-[230px] pb-4" // Ограничиваем максимальную ширину
      )}
      onClick={onClick}
    >
      <div className="overflow-hidden rounded-md bg-gray-200">
        <img
          className="h-auto w-full object-cover transition-all hover:scale-105 aspect-square"
          src={api.getImageUrl(product.id) || "/placeholder.svg"}
          alt={product.name}
        />
      </div>

      <div className="space-y-1 text-sm ">
        <h3 className="font-medium leading-none">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.description}</p>
      </div>
    </div>
  );
});

// Добавление displayName для лучшего дебаггинга
ProductCard.displayName = "ProductCard"

export { ProductCard }
