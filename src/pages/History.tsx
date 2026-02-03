import { useState } from "react";
import { Link } from "react-router-dom";
import { useReceipts, ReceiptWithItems, useRefundReceipt } from "@/hooks/useReceipts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Receipt,
  X,
  RotateCcw,
  CreditCard,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { cn } from "@/lib/utils";

const PAYMENT_TYPE_LABELS = {
  hotovost: "Hotovost",
  karta: "Karta",
};

interface ReceiptRowProps {
  receipt: ReceiptWithItems;
  canRefund: boolean;
  onRefund: (receipt: ReceiptWithItems) => void;
}

const ReceiptRow = ({ receipt, canRefund, onRefund }: ReceiptRowProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <TableRow className={cn(
          "cursor-pointer hover:bg-muted/50",
          receipt.is_refunded && "bg-destructive/5"
        )}>
          <TableCell>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-mono text-sm">{receipt.id.slice(0, 8)}...</span>
              {receipt.is_refunded && (
                <Badge variant="destructive" className="text-xs">
                  Storno
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell>
            {format(new Date(receipt.created_at), "d. M. yyyy HH:mm", { locale: cs })}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              {receipt.payment_type === "karta" ? (
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Banknote className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">{PAYMENT_TYPE_LABELS[receipt.payment_type]}</span>
            </div>
          </TableCell>
          <TableCell className="text-center">{receipt.items.length}</TableCell>
          <TableCell className={cn(
            "text-right font-semibold",
            receipt.is_refunded && "text-destructive line-through"
          )}>
            {Number(receipt.total).toFixed(0)} Kč
          </TableCell>
          <TableCell className="text-right">
            {canRefund && !receipt.is_refunded && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefund(receipt);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Storno
              </Button>
            )}
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <tr>
          <td colSpan={6} className="p-0">
            <div className="bg-muted/30 p-4 border-t">
              <h4 className="text-sm font-medium mb-2">Položky účtenky:</h4>
              <div className="space-y-1">
                {receipt.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0"
                  >
                    <span>
                      {item.quantity}× {item.product_name}
                    </span>
                    <span className="text-muted-foreground">
                      {Number(item.subtotal).toFixed(0)} Kč
                    </span>
                  </div>
                ))}
              </div>
              {receipt.is_refunded && receipt.refunded_at && (
                <div className="mt-3 pt-3 border-t border-destructive/20">
                  <p className="text-sm text-destructive">
                    Stornováno: {format(new Date(receipt.refunded_at), "d. M. yyyy HH:mm", { locale: cs })}
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </Collapsible>
  );
};

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [receiptToRefund, setReceiptToRefund] = useState<ReceiptWithItems | null>(null);

  const { data: receipts, isLoading, error } = useReceipts(searchQuery, dateFrom, dateTo);
  const { isAdmin, isManager } = useAuth();
  const refundMutation = useRefundReceipt();

  const canRefund = isAdmin || isManager;

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasFilters = searchQuery || dateFrom || dateTo;

  const handleRefundClick = (receipt: ReceiptWithItems) => {
    setReceiptToRefund(receipt);
    setRefundDialogOpen(true);
  };

  const handleRefundConfirm = async () => {
    if (receiptToRefund) {
      await refundMutation.mutateAsync(receiptToRefund);
      setRefundDialogOpen(false);
      setReceiptToRefund(null);
    }
  };

  // Calculate totals
  const activeReceipts = receipts?.filter(r => !r.is_refunded) || [];
  const refundedReceipts = receipts?.filter(r => r.is_refunded) || [];
  const activeTotal = activeReceipts.reduce((sum, r) => sum + Number(r.total), 0);
  const refundedTotal = refundedReceipts.reduce((sum, r) => sum + Number(r.total), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Historie účtenek</h1>
                  <p className="text-sm text-white/70">Přehled všech prodejů</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtrování
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-1">
                <Input
                  placeholder="Hledat podle názvu produktu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Date from */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[180px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "d. M. yyyy", { locale: cs }) : "Od data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={cs}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Date to */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[180px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "d. M. yyyy", { locale: cs }) : "Do data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={cs}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Clear filters */}
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="md:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Zrušit filtry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                Chyba při načítání účtenek. Zkuste to prosím znovu.
              </div>
            ) : !receipts || receipts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {hasFilters
                  ? "Žádné účtenky neodpovídají filtru."
                  : "Zatím nebyly uloženy žádné účtenky."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Datum a čas</TableHead>
                    <TableHead>Platba</TableHead>
                    <TableHead className="text-center">Položek</TableHead>
                    <TableHead className="text-right">Celkem</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <ReceiptRow 
                      key={receipt.id} 
                      receipt={receipt} 
                      canRefund={canRefund}
                      onRefund={handleRefundClick}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {receipts && receipts.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Card className="p-4">
              <p className="text-muted-foreground">Aktivní účtenky</p>
              <p className="text-2xl font-bold text-foreground">
                {activeReceipts.length} • {activeTotal.toFixed(0)} Kč
              </p>
            </Card>
            {refundedReceipts.length > 0 && (
              <Card className="p-4 border-destructive/20">
                <p className="text-muted-foreground">Stornováno</p>
                <p className="text-2xl font-bold text-destructive">
                  {refundedReceipts.length} • -{refundedTotal.toFixed(0)} Kč
                </p>
              </Card>
            )}
            <Card className="p-4 border-primary/20">
              <p className="text-muted-foreground">Čistý obrat</p>
              <p className="text-2xl font-bold text-primary">
                {(activeTotal - refundedTotal).toFixed(0)} Kč
              </p>
            </Card>
          </div>
        )}
      </main>

      {/* Refund Confirmation Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stornovat účtenku</DialogTitle>
            <DialogDescription>
              Opravdu chcete stornovat účtenku v hodnotě{" "}
              <span className="font-semibold">{receiptToRefund?.total} Kč</span>?
              Tato akce odešle refund na webhook a nelze ji vrátit zpět.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundConfirm}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Stornovat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
