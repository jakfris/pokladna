import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Product } from "@/types/pos";
import { useFavoriteProducts, useNonFavoriteProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import ProductGrid from "@/components/ProductGrid";
import QuantityDialog from "@/components/QuantityDialog";
import ProductListDialog from "@/components/ProductListDialog";
import Receipt from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShoppingCart, Zap, Settings, Loader2, LogIn, LogOut, User, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const { data: favoriteProducts, isLoading: favLoading } = useFavoriteProducts();
  const { data: additionalProducts, isLoading: addLoading } = useNonFavoriteProducts();
  const { isAuthenticated, user, profile, canManageProducts, signOut, isLoading: authLoading } = useAuth();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [productListOpen, setProductListOpen] = useState(false);
  const [mobileReceiptOpen, setMobileReceiptOpen] = useState(false);
  
  const { items, isSubmitting, addItem, removeItem, clearCart, submitReceipt } = useCart();

  const isLoading = favLoading || addLoading;

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantityDialogOpen(true);
  };

  const handleConfirmQuantity = (product: Product, quantity: number) => {
    addItem(product, quantity);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pokladna</h1>
                <p className="text-sm text-white/70">Rychlý prodej</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {/* History button */}
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                onClick={() => navigate("/history")}
              >
                <History className="h-5 w-5 mr-2" />
                Historie
              </Button>

              {/* Admin button - only show if user can manage products */}
              {canManageProducts && (
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                  onClick={() => navigate("/admin")}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Administrace
                </Button>
              )}

              {/* User menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                    >
                      <User className="h-5 w-5 mr-2" />
                      {profile?.full_name || user?.email?.split("@")[0] || "Uživatel"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Přihlásit
                </Button>
              )}
            </div>
            
            {/* Mobile cart button */}
            <Button
              variant="secondary"
              className="lg:hidden relative bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              onClick={() => setMobileReceiptOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Products */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-foreground">Rychlý výběr</h2>
              </div>
              <ProductGrid products={favoriteProducts || []} onProductSelect={handleProductSelect} />
            </section>

            {/* More Products Button */}
            <Button
              variant="outline"
              className="more-button"
              onClick={() => setProductListOpen(true)}
            >
              <MoreHorizontal className="h-5 w-5 mr-2" />
              Další položky
            </Button>
            
            {/* Mobile buttons */}
            <div className="lg:hidden space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/history")}
              >
                <History className="h-5 w-5 mr-2" />
                Historie účtenek
              </Button>
              
              {canManageProducts && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/admin")}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Administrace produktů
                </Button>
              )}
              
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Odhlásit ({profile?.full_name || user?.email?.split("@")[0]})
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Přihlásit se
                </Button>
              )}
            </div>
          </div>

          {/* Receipt Section - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
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
        )}
      </main>

      {/* Mobile Receipt Bottom Bar */}
      {items.length > 0 && !mobileReceiptOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <Button
            className="w-full action-button-success shadow-2xl"
            onClick={() => setMobileReceiptOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            <span className="flex-1 text-left">Účtenka ({itemCount} položek)</span>
            <span className="font-bold">{total} Kč</span>
          </Button>
        </div>
      )}

      {/* Mobile Receipt Dialog */}
      {mobileReceiptOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <header className="header-gradient text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Účtenka</h2>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setMobileReceiptOpen(false)}
              >
                Zavřít
              </Button>
            </header>
            <div className="flex-1 overflow-hidden p-4">
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
        products={additionalProducts || []}
        open={productListOpen}
        onClose={() => setProductListOpen(false)}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default Index;
