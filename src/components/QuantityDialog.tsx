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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <p className="text-lg text-muted-foreground">{product.price} Kč / ks</p>
        </DialogHeader>
        
        <div className="flex items-center justify-center gap-8 py-10">
          <Button
            variant="outline"
            className="quantity-button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-7 w-7" />
          </Button>
          
          <div className="relative">
            <span className="text-6xl font-bold w-24 text-center block text-foreground">
              {quantity}
            </span>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
              kusů
            </span>
          </div>
          
          <Button
            variant="outline"
            className="quantity-button"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-7 w-7" />
          </Button>
        </div>

        <div className="text-center py-4 bg-secondary/50 rounded-xl mx-4">
          <span className="text-sm text-muted-foreground">Celkem</span>
          <p className="text-3xl font-bold text-primary">
            {product.price * quantity} Kč
          </p>
        </div>

        <DialogFooter className="sm:justify-center pt-4">
          <Button
            className="action-button-success w-full sm:w-auto min-w-[220px] py-6"
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
