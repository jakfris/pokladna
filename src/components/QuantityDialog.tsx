import { useState } from "react";
import { Product } from "@/types/pos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Check } from "lucide-react";

interface QuantityDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
}

const QuantityDialog = ({ product, open, onClose, onConfirm }: QuantityDialogProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (product && quantity > 0) {
      onConfirm(product, quantity);
      setQuantity(1);
      onClose();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuantity(1);
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{product.name}</DialogTitle>
          <p className="text-center text-muted-foreground">{product.price} Kč / ks</p>
        </DialogHeader>
        
        <div className="flex items-center justify-center gap-6 py-8">
          <Button
            variant="outline"
            className="quantity-button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-6 w-6" />
          </Button>
          
          <span className="text-5xl font-bold w-20 text-center">{quantity}</span>
          
          <Button
            variant="outline"
            className="quantity-button"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        <div className="text-center py-2">
          <span className="text-2xl font-semibold">
            Celkem: {product.price * quantity} Kč
          </span>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            className="action-button-success w-full sm:w-auto min-w-[200px]"
            onClick={handleConfirm}
          >
            <Check className="h-5 w-5 mr-2" />
            Přidat do účtenky
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityDialog;
