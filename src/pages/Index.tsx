import { useState } from "react";
import { Product } from "@/types/pos";
import { mainProducts, additionalProducts } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import ProductGrid from "@/components/ProductGrid";
import QuantityDialog from "@/components/QuantityDialog";
import ProductListDialog from "@/components/ProductListDialog";
import Receipt from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShoppingCart } from "lucide-react";

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [productListOpen, setProductListOpen] = useState(false);
  const [mobileReceiptOpen, setMobileReceiptOpen] = useState(false);
  
  const { items, isSubmitting, addItem, removeItem, clearCart, submitReceipt } = useCart();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantityDialogOpen(true);
  };

  const handleConfirmQuantity = (product: Product, quantity: number) => {
    addItem(product, quantity);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Pokladna</h1>
            
            {/* Mobile cart button */}
            <Button
              variant="outline"
              className="lg:hidden relative"
              onClick={() => setMobileReceiptOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Products */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-foreground">Rychlý výběr</h2>
              <ProductGrid products={mainProducts} onProductSelect={handleProductSelect} />
            </section>

            {/* More Products Button */}
            <Button
              variant="outline"
              className="w-full h-14 text-lg border-dashed border-2 hover:border-primary hover:bg-secondary transition-all"
              onClick={() => setProductListOpen(true)}
            >
              <MoreHorizontal className="h-5 w-5 mr-2" />
              Další položky
            </Button>
          </div>

          {/* Receipt Section - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Receipt
                items={items}
                onRemoveItem={removeItem}
                onClear={clearCart}
                onSubmit={submitReceipt}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Receipt Bottom Bar */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4">
          <Button
            className="w-full action-button-success"
            onClick={() => setMobileReceiptOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Účtenka ({itemCount} položek) • {total} Kč
          </Button>
        </div>
      )}

      {/* Mobile Receipt Dialog */}
      {mobileReceiptOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <header className="bg-card border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Účtenka</h2>
              <Button variant="ghost" onClick={() => setMobileReceiptOpen(false)}>
                Zavřít
              </Button>
            </header>
            <div className="flex-1 overflow-hidden">
              <Receipt
                items={items}
                onRemoveItem={removeItem}
                onClear={clearCart}
                onSubmit={() => {
                  submitReceipt();
                  setMobileReceiptOpen(false);
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <QuantityDialog
        product={selectedProduct}
        open={quantityDialogOpen}
        onClose={() => setQuantityDialogOpen(false)}
        onConfirm={handleConfirmQuantity}
      />

      <ProductListDialog
        products={additionalProducts}
        open={productListOpen}
        onClose={() => setProductListOpen(false)}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default Index;
