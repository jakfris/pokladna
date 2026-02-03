import { CartItem } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Send, FileText } from "lucide-react";

interface ReceiptProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const Receipt = ({ items, onRemoveItem, onClear, onSubmit, isSubmitting }: ReceiptProps) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Účtenka
          {itemCount > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {itemCount} položek
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
            <p className="text-center">Zatím žádné položky.<br />Klikněte na produkt pro přidání.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {items.map((item, index) => (
                  <div key={index} className="receipt-item group">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}× {item.product.price} Kč
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {item.product.price * item.quantity} Kč
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4 space-y-4 bg-muted/30">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Celkem</span>
                <span className="text-primary">{total} Kč</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="py-3"
                  onClick={onClear}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Smazat vše
                </Button>
                <Button
                  className="action-button-success py-3"
                  onClick={onSubmit}
                  disabled={isSubmitting || items.length === 0}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Odesílám...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Uložit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Receipt;
