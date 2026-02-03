import { Product } from "@/types/pos";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const ProductGrid = ({ products, onProductSelect }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {products.map((product) => (
        <Button
          key={product.id}
          variant="outline"
          className="product-button flex flex-col items-center justify-center gap-1"
          onClick={() => onProductSelect(product)}
        >
          <span className="text-base md:text-lg font-semibold">{product.name}</span>
          <span className="text-sm text-muted-foreground">{product.price} Kč</span>
        </Button>
      ))}
    </div>
  );
};

export default ProductGrid;
