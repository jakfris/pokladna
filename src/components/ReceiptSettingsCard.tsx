import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Receipt, Printer } from "lucide-react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";

const ReceiptSettingsCard = () => {
  const { data: systemSettings, isLoading } = useSystemSettings();
  const updateSystemSetting = useUpdateSystemSetting();
  
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize from settings when data loads
  useEffect(() => {
    if (systemSettings && !initialized) {
      const headerSetting = systemSettings.find((s) => s.key === "receipt_header");
      const footerSetting = systemSettings.find((s) => s.key === "receipt_footer");
      
      if (headerSetting !== undefined) {
        setReceiptHeader(headerSetting.value || "");
      }
      if (footerSetting !== undefined) {
        setReceiptFooter(footerSetting.value || "");
      }
      setInitialized(true);
    }
  }, [systemSettings, initialized]);

  const handleSaveHeader = () => {
    updateSystemSetting.mutate({ key: "receipt_header", value: receiptHeader });
  };

  const handleSaveFooter = () => {
    updateSystemSetting.mutate({ key: "receipt_footer", value: receiptFooter });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Printer className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Nastavení účtenky</h3>
          <p className="text-sm text-muted-foreground">
            Hlavička a patička tištěného dokladu
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header Setting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="receiptHeader" className="font-medium">Hlavička účtenky</Label>
          </div>
          <Textarea
            id="receiptHeader"
            value={receiptHeader}
            onChange={(e) => setReceiptHeader(e.target.value)}
            placeholder="Název firmy
Adresa
IČ: 12345678, DIČ: CZ12345678
www.example.com"
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Zobrazí se nahoře na účtence. Každý řádek bude vytištěn zvlášť.
          </p>
          <Button
            size="sm"
            onClick={handleSaveHeader}
            disabled={updateSystemSetting.isPending}
          >
            {updateSystemSetting.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Uložit hlavičku
          </Button>
        </div>

        <div className="border-t border-border" />

        {/* Footer Setting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground rotate-180" />
            <Label htmlFor="receiptFooter" className="font-medium">Patička účtenky</Label>
          </div>
          <Textarea
            id="receiptFooter"
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            placeholder="Zjednodušený daňový doklad
Děkujeme za nákup!"
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Zobrazí se dole na účtence po rozpisu DPH.
          </p>
          <Button
            size="sm"
            onClick={handleSaveFooter}
            disabled={updateSystemSetting.isPending}
          >
            {updateSystemSetting.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Uložit patičku
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptSettingsCard;
