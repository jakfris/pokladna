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
import { Minus, Plus, Check, Delete } from "lucide-react";

interface QuantityDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
}

const QuantityDialog = ({ product, open, onClose, onConfirm }: QuantityDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  const handleConfirm = () => {
    if (product && quantity > 0) {
      onConfirm(product, quantity);
      resetState();
      onClose();
    }
  };

  const resetState = () => {
    setQuantity(1);
    setInputValue("1");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
      onClose();
    }
  };

  const handleNumpadClick = (num: number) => {
    const newValue = inputValue === "0" ? String(num) : inputValue + String(num);
    const numericValue = parseInt(newValue, 10);
    if (numericValue <= 999) {
      setInputValue(newValue);
      setQuantity(numericValue);
    }
  };

  const handleBackspace = () => {
    if (inputValue.length > 1) {
      const newValue = inputValue.slice(0, -1);
      setInputValue(newValue);
      setQuantity(parseInt(newValue, 10));
    } else {
      setInputValue("1");
      setQuantity(1);
    }
  };

  const handleClear = () => {
    setInputValue("1");
    setQuantity(1);
  };

  if (!product) return null;

  const numpadButtons = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <p className="text-lg text-muted-foreground">{product.price} Kč / ks</p>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left side - Quantity display with +/- buttons */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full"
                onClick={() => {
                  const newQty = Math.max(1, quantity - 1);
                  setQuantity(newQty);
                  setInputValue(String(newQty));
                }}
                disabled={quantity <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <span className="text-5xl font-bold w-20 text-center block text-foreground">
                  {quantity}
                </span>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                  kusů
                </span>
              </div>
              
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full"
                onClick={() => {
                  const newQty = Math.min(999, quantity + 1);
                  setQuantity(newQty);
                  setInputValue(String(newQty));
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-center py-4 bg-secondary/50 rounded-xl w-full mt-4">
              <span className="text-sm text-muted-foreground">Celkem</span>
              <p className="text-2xl font-bold text-primary">
                {product.price * quantity} Kč
              </p>
            </div>
          </div>

          {/* Right side - Numeric keypad */}
          <div className="flex flex-col gap-2">
            {numpadButtons.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-2">
                {row.map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-12 text-xl font-semibold"
                    onClick={() => handleNumpadClick(num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="h-12 text-sm font-medium"
                onClick={handleClear}
              >
                C
              </Button>
              <Button
                variant="outline"
                className="h-12 text-xl font-semibold"
                onClick={() => handleNumpadClick(0)}
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={handleBackspace}
              >
                <Delete className="h-5 w-5" />
              </Button>
            </div>
          </div>
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
