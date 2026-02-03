import { Product } from "@/types/pos";
import { Button } from "@/components/ui/button";
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {products.map((product) => {
        const Icon = productIcons[product.id] || Coffee;
        return (
          <Button
            key={product.id}
            variant="ghost"
            className="product-button flex flex-col items-center justify-center gap-2 p-4"
            onClick={() => onProductSelect(product)}
          >
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <span className="text-base md:text-lg font-semibold text-foreground">
              {product.name}
            </span>
            <span className="text-sm font-bold text-primary">
              {product.price} Kč
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default ProductGrid;
