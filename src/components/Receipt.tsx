import { CartItem, PaymentType } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Send, Receipt as ReceiptIcon, ShoppingBag, Printer, CreditCard, Banknote } from "lucide-react";
import { useThermalPrinter } from "@/hooks/useThermalPrinter";
import PrinterButton from "@/components/PrinterButton";
import { cn } from "@/lib/utils";
import { useSystemSettings } from "@/hooks/useSystemSettings";

interface ReceiptProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  paymentType: PaymentType;
  onPaymentTypeChange: (type: PaymentType) => void;
}

const Receipt = ({ 
  items, 
  onRemoveItem, 
  onClear, 
  onSubmit, 
  isSubmitting,
  paymentType,
  onPaymentTypeChange,
}: ReceiptProps) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { isConnected, isPrinting, printReceipt, isSupported } = useThermalPrinter();
  const { data: systemSettings } = useSystemSettings();

  const receiptHeader = systemSettings?.find(s => s.key === "receipt_header")?.value || "";
  const receiptFooter = systemSettings?.find(s => s.key === "receipt_footer")?.value || "";

  const handlePrint = async () => {
    if (items.length === 0) return;
    await printReceipt(items, total, undefined, receiptHeader, receiptFooter);
  };

  const handleSubmitAndPrint = async () => {
    // First submit
    onSubmit();
    // Then print if connected
    if (isConnected && items.length > 0) {
      await printReceipt(items, total, undefined, receiptHeader, receiptFooter);
    }
  };

  return (
    <div className="card-elevated h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ReceiptIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Účtenka</h2>
            {itemCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'položka' : itemCount < 5 ? 'položky' : 'položek'}
              </p>
            )}
          </div>
          <PrinterButton />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-center font-medium">Zatím žádné položky</p>
            <p className="text-center text-sm mt-1">Klikněte na produkt pro přidání</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {items.map((item, index) => (
                  <div 
                    key={index} 
                    className="receipt-item group rounded-xl mx-2 my-1"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.product.price} Kč
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-foreground">
                        {item.product.price * item.quantity} Kč
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border/50 p-5 space-y-4 bg-gradient-to-t from-secondary/30 to-transparent">
              {/* Payment Type Selector */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Způsob platby</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "py-4 rounded-xl border-2 transition-all",
                      paymentType === "hotovost" 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "hover:border-primary/30"
                    )}
                    onClick={() => onPaymentTypeChange("hotovost")}
                  >
                    <Banknote className="h-5 w-5 mr-2" />
                    Hotovost
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "py-4 rounded-xl border-2 transition-all",
                      paymentType === "karta" 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "hover:border-primary/30"
                    )}
                    onClick={() => onPaymentTypeChange("karta")}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Karta
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-muted-foreground">Celkem</span>
                <span className="text-3xl font-bold text-primary">{total} Kč</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="py-6 rounded-xl border-2 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all"
                  onClick={onClear}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Smazat
                </Button>
                
                {isSupported && (
                  <Button
                    variant="outline"
                    className={cn(
                      "py-6 rounded-xl border-2 transition-all",
                      isConnected 
                        ? "border-green-500/30 text-green-600 hover:bg-green-500/5" 
                        : "hover:border-primary/30"
                    )}
                    onClick={handlePrint}
                    disabled={isPrinting || items.length === 0}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? "Tisknu..." : "Tisk"}
                  </Button>
                )}
                
                <Button
                  className={cn("action-button-success py-6", !isSupported && "col-span-2")}
                  onClick={isConnected ? handleSubmitAndPrint : onSubmit}
                  disabled={isSubmitting || items.length === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Odesílám...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {isConnected ? "Uložit + Tisk" : "Uložit"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Receipt;
