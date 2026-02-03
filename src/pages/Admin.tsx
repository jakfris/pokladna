import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Product, ProductInsert, ProductUpdate } from "@/types/product";

const CATEGORIES = ["Nápoje", "Jídlo", "Pečivo", "Dezerty"];
const VAT_RATES = [0, 10, 15, 21];

const Admin = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    vat_rate: "21",
    category: "",
    is_favorite: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      vat_rate: "21",
      category: "",
      is_favorite: false,
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      vat_rate: product.vat_rate.toString(),
      category: product.category || "",
      is_favorite: product.is_favorite,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      vat_rate: parseFloat(formData.vat_rate),
      category: formData.category || null,
      is_favorite: formData.is_favorite,
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        ...productData,
      });
    } else {
      await createProduct.mutateAsync(productData);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (productToDelete) {
      await deleteProduct.mutateAsync(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const toggleFavorite = async (product: Product) => {
    await updateProduct.mutateAsync({
      id: product.id,
      is_favorite: !product.is_favorite,
    });
  };

  const favoriteCount = products?.filter((p) => p.is_favorite).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Chyba při načítání produktů: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Administrace</h1>
                <p className="text-sm text-white/70">Správa produktů</p>
              </div>
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Přidat produkt
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">Celkem produktů</p>
            <p className="text-2xl font-bold text-foreground">{products?.length || 0}</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">Oblíbených</p>
            <p className="text-2xl font-bold text-primary">{favoriteCount}/10</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">V seznamu</p>
            <p className="text-2xl font-bold text-foreground">
              {(products?.length || 0) - favoriteCount}
            </p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">Kategorií</p>
            <p className="text-2xl font-bold text-foreground">
              {new Set(products?.map((p) => p.category).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Star className="h-4 w-4" />
                </TableHead>
                <TableHead>Název</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>DPH</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={product.is_favorite ? "text-amber-500" : "text-muted-foreground"}
                      onClick={() => toggleFavorite(product)}
                      disabled={!product.is_favorite && favoriteCount >= 10}
                    >
                      <Star
                        className={`h-5 w-5 ${product.is_favorite ? "fill-current" : ""}`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.price} Kč</TableCell>
                  <TableCell>{product.vat_rate}%</TableCell>
                  <TableCell>{product.category || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Upravit produkt" : "Nový produkt"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Upravte údaje o produktu"
                : "Vyplňte údaje pro nový produkt"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Název produktu</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Název produktu"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Cena (Kč)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat_rate">Sazba DPH</Label>
                  <Select
                    value={formData.vat_rate}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vat_rate: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VAT_RATES.map((rate) => (
                        <SelectItem key={rate} value={rate.toString()}>
                          {rate}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategorii" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_favorite">Oblíbená položka</Label>
                  <p className="text-sm text-muted-foreground">
                    Zobrazí se na hlavní obrazovce ({favoriteCount}/10)
                  </p>
                </div>
                <Switch
                  id="is_favorite"
                  checked={formData.is_favorite}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_favorite: checked })
                  }
                  disabled={
                    !formData.is_favorite &&
                    !editingProduct?.is_favorite &&
                    favoriteCount >= 10
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Zrušit
              </Button>
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {createProduct.isPending || updateProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingProduct ? "Uložit změny" : "Přidat produkt"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Smazat produkt</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat produkt "{productToDelete?.name}"? Tuto akci
              nelze vrátit zpět.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Smazat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
