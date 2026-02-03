import { Product } from "@/types/pos";
import { 
  Coffee, 
  Leaf, 
  GlassWater, 
  Croissant, 
  Sandwich, 
  Salad, 
  Cake, 
  IceCream, 
  Droplets,
  CupSoda
} from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "1": Coffee,
  "2": Leaf,
  "3": GlassWater,
  "4": Croissant,
  "5": Sandwich,
  "6": Salad,
  "7": Cake,
  "8": IceCream,
  "9": Droplets,
  "10": CupSoda,
};

const ProductGrid = ({ products, onProductSelect }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => {
        const Icon = productIcons[product.id] || Coffee;
        return (
          <button
            key={product.id}
            className="product-card group"
            onClick={() => onProductSelect(product)}
          >
            <div className="product-card-icon">
              <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <div className="flex flex-col items-center gap-1 min-w-0 w-full">
              <span className="text-sm md:text-base font-semibold text-foreground text-center leading-tight line-clamp-2">
                {product.name}
              </span>
              <span className="text-xs md:text-sm font-bold text-primary">
                {product.price} Kč
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProductGrid;
