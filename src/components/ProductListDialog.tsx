import { Product } from "@/types/pos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductListDialogProps {
  products: Product[];
  open: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
}

const ProductListDialog = ({ products, open, onClose, onProductSelect }: ProductListDialogProps) => {
  const categories = [...new Set(products.map(p => p.category))];

  const handleSelect = (product: Product) => {
    onProductSelect(product);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Další položky</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {products
                  .filter((p) => p.category === category)
                  .map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center gap-0.5 hover:border-primary hover:bg-secondary transition-all"
                      onClick={() => handleSelect(product)}
                    >
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">{product.price} Kč</span>
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductListDialog;
