import { Product } from "@/types/pos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coffee, Utensils, Cake, Croissant } from "lucide-react";

interface ProductListDialogProps {
  products: Product[];
  open: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Nápoje": Coffee,
  "Jídlo": Utensils,
  "Dezerty": Cake,
  "Pečivo": Croissant,
};

const ProductListDialog = ({ products, open, onClose, onProductSelect }: ProductListDialogProps) => {
  const categories = [...new Set(products.map(p => p.category))];

  const handleSelect = (product: Product) => {
    onProductSelect(product);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">Další položky</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] pr-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category || ""] || Coffee;
            return (
              <div key={category} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {products
                    .filter((p) => p.category === category)
                    .map((product) => (
                      <Button
                        key={product.id}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-1 
                                   rounded-xl border-2 hover:border-primary hover:bg-primary/5 
                                   transition-all duration-200"
                        onClick={() => handleSelect(product)}
                      >
                        <span className="font-semibold text-foreground">{product.name}</span>
                        <span className="text-sm font-bold text-primary">{product.price} Kč</span>
                      </Button>
                    ))}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductListDialog;
