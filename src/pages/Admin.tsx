import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  Loader2, 
  LogIn, 
  ShieldAlert,
  Package,
  Users,
  Shield,
  X
} from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useUsers, useUpdateUserProfile, useAddUserRole, useRemoveUserRole } from "@/hooks/useUsers";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Product } from "@/types/product";

const CATEGORIES = ["Nápoje", "Jídlo", "Pečivo", "Dezerty"];
const VAT_RATES = [0, 10, 15, 21];
const AVAILABLE_ROLES: AppRole[] = ["admin", "manager", "user"];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrátor",
  manager: "Manažer",
  user: "Uživatel",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500/10 text-red-500 border-red-500/20",
  manager: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  user: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, canManageProducts, isAdmin, isLoading: authLoading, user, roles } = useAuth();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: users, isLoading: usersLoading } = useUsers();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateUserProfile = useUpdateUserProfile();
  const addUserRole = useAddUserRole();
  const removeUserRole = useRemoveUserRole();

  const [activeTab, setActiveTab] = useState("products");

  // Product dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // User dialogs
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    userId: string;
    fullName: string;
    email: string | null;
    roles: AppRole[];
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    vat_rate: "21",
    category: "",
    is_favorite: false,
  });

  const [userFormData, setUserFormData] = useState({
    fullName: "",
    selectedRole: "" as AppRole | "",
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

  const resetUserForm = () => {
    setUserFormData({
      fullName: "",
      selectedRole: "",
    });
    setEditingUser(null);
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

  const openUserEditDialog = (user: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    roles: AppRole[];
  }) => {
    setEditingUser({
      userId: user.user_id,
      fullName: user.full_name || "",
      email: user.email,
      roles: user.roles,
    });
    setUserFormData({
      fullName: user.full_name || "",
      selectedRole: "",
    });
    setUserDialogOpen(true);
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

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (userFormData.fullName !== editingUser.fullName) {
      await updateUserProfile.mutateAsync({
        userId: editingUser.userId,
        fullName: userFormData.fullName,
      });
    }

    setUserDialogOpen(false);
    resetUserForm();
  };

  const handleAddRole = async (role: AppRole) => {
    if (!editingUser) return;
    await addUserRole.mutateAsync({
      userId: editingUser.userId,
      role,
    });
    setEditingUser((prev) =>
      prev ? { ...prev, roles: [...prev.roles, role] } : null
    );
  };

  const handleRemoveRole = async (role: AppRole) => {
    if (!editingUser) return;
    await removeUserRole.mutateAsync({
      userId: editingUser.userId,
      role,
    });
    setEditingUser((prev) =>
      prev ? { ...prev, roles: prev.roles.filter((r) => r !== role) } : null
    );
  };

  const favoriteCount = products?.filter((p) => p.is_favorite).length || 0;
  const isLoading = authLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="header-gradient text-white p-6">
          <div className="flex items-center gap-3 justify-center">
            <div>
              <h1 className="text-2xl font-bold">Administrace</h1>
              <p className="text-sm text-white/70">Správa produktů a uživatelů</p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card-elevated p-8 text-center space-y-4 max-w-md">
            <LogIn className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold">Přihlášení vyžadováno</h2>
            <p className="text-muted-foreground">
              Pro přístup do administrace se musíte přihlásit.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Přihlásit se</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Authenticated but no permission
  if (!canManageProducts) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="header-gradient text-white p-6">
          <div className="flex items-center gap-3 justify-center">
            <div>
              <h1 className="text-2xl font-bold">Administrace</h1>
              <p className="text-sm text-white/70">Správa produktů a uživatelů</p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card-elevated p-8 text-center space-y-4 max-w-md">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Přístup zamítnut</h2>
            <p className="text-muted-foreground">
              Nemáte oprávnění pro správu produktů. Kontaktujte administrátora pro přidělení role.
            </p>
            <p className="text-sm text-muted-foreground">
              Přihlášen jako: {user?.email}
              {roles.length > 0 && ` (${roles.join(", ")})`}
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Zpět na pokladnu
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Chyba při načítání dat: {productsError.message}</p>
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
                <p className="text-sm text-white/70">
                  {activeTab === "products" ? "Správa produktů" : "Správa uživatelů"}
                </p>
              </div>
            </div>
            {activeTab === "products" && (
              <Button
                onClick={openCreateDialog}
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              >
                <Plus className="h-5 w-5 mr-2" />
                Přidat produkt
              </Button>
            )}
            {activeTab === "users" && isAdmin && (
              <Button
                asChild
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              >
                <Link to="/register">
                  <Plus className="h-5 w-5 mr-2" />
                  Přidat uživatele
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Prodejní položky
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2" disabled={!isAdmin}>
              <Users className="h-4 w-4" />
              Uživatelé
              {!isAdmin && <Shield className="h-3 w-3 text-muted-foreground" />}
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card-elevated p-4">
                    <p className="text-sm text-muted-foreground">Celkem uživatelů</p>
                    <p className="text-2xl font-bold text-foreground">{users?.length || 0}</p>
                  </div>
                  <div className="card-elevated p-4">
                    <p className="text-sm text-muted-foreground">Administrátoři</p>
                    <p className="text-2xl font-bold text-red-500">
                      {users?.filter((u) => u.roles.includes("admin")).length || 0}
                    </p>
                  </div>
                  <div className="card-elevated p-4">
                    <p className="text-sm text-muted-foreground">Manažeři</p>
                    <p className="text-2xl font-bold text-amber-500">
                      {users?.filter((u) => u.roles.includes("manager")).length || 0}
                    </p>
                  </div>
                  <div className="card-elevated p-4">
                    <p className="text-sm text-muted-foreground">Běžní uživatelé</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {users?.filter((u) => u.roles.includes("user") || u.roles.length === 0).length || 0}
                    </p>
                  </div>
                </div>

                {/* Users Table */}
                <div className="card-elevated overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Jméno</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Registrace</TableHead>
                        <TableHead className="text-right">Akce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.full_name || "-"}
                          </TableCell>
                          <TableCell>{u.email || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.roles.length > 0 ? (
                                u.roles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant="outline"
                                    className={ROLE_COLORS[role]}
                                  >
                                    {ROLE_LABELS[role]}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Bez role</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(u.created_at).toLocaleDateString("cs-CZ")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openUserEditDialog(u)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Product Dialog */}
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

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upravit uživatele</DialogTitle>
            <DialogDescription>
              {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Celé jméno</Label>
                <Input
                  id="fullName"
                  value={userFormData.fullName}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, fullName: e.target.value })
                  }
                  placeholder="Jméno uživatele"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role uživatele</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg min-h-[48px]">
                  {editingUser?.roles.length === 0 && (
                    <span className="text-sm text-muted-foreground">Bez role</span>
                  )}
                  {editingUser?.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="outline"
                      className={`${ROLE_COLORS[role]} pr-1`}
                    >
                      {ROLE_LABELS[role]}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveRole(role)}
                        disabled={removeUserRole.isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Přidat roli</Label>
                <div className="flex gap-2">
                  <Select
                    value={userFormData.selectedRole}
                    onValueChange={(value) =>
                      setUserFormData({ ...userFormData, selectedRole: value as AppRole })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Vyberte roli" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.filter(
                        (role) => !editingUser?.roles.includes(role)
                      ).map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (userFormData.selectedRole) {
                        handleAddRole(userFormData.selectedRole);
                        setUserFormData({ ...userFormData, selectedRole: "" });
                      }
                    }}
                    disabled={!userFormData.selectedRole || addUserRole.isPending}
                  >
                    {addUserRole.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserDialogOpen(false)}
              >
                Zavřít
              </Button>
              <Button
                type="submit"
                disabled={updateUserProfile.isPending}
              >
                {updateUserProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Uložit jméno
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
