import { useState } from "react";
import { Link } from "react-router-dom";
import { useReceipts, ReceiptWithItems } from "@/hooks/useReceipts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { cn } from "@/lib/utils";

const ReceiptRow = ({ receipt }: { receipt: ReceiptWithItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <TableRow className="cursor-pointer hover:bg-muted/50">
          <TableCell>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-mono text-sm">{receipt.id.slice(0, 8)}...</span>
            </div>
          </TableCell>
          <TableCell>
            {format(new Date(receipt.created_at), "d. M. yyyy HH:mm", { locale: cs })}
          </TableCell>
          <TableCell className="text-center">{receipt.items.length}</TableCell>
          <TableCell className="text-right font-semibold">{Number(receipt.total).toFixed(0)} Kč</TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <tr>
          <td colSpan={4} className="p-0">
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

  const { data: receipts, isLoading, error } = useReceipts(searchQuery, dateFrom, dateTo);

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasFilters = searchQuery || dateFrom || dateTo;

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
                    <TableHead className="text-center">Položek</TableHead>
                    <TableHead className="text-right">Celkem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <ReceiptRow key={receipt.id} receipt={receipt} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {receipts && receipts.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Zobrazeno {receipts.length} účtenek • Celkem:{" "}
            <span className="font-semibold text-foreground">
              {receipts.reduce((sum, r) => sum + Number(r.total), 0).toFixed(0)} Kč
            </span>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
