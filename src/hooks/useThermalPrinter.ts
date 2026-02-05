import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { CartItem } from "@/types/pos";

// ESC/POS Commands
const ESC = 0x1b;
const GS = 0x1d;

const commands = {
  // Initialize printer
  init: new Uint8Array([ESC, 0x40]),
  
  // Select character code table - CP1250 (Windows-1250 for Central European)
  selectCP1250: new Uint8Array([ESC, 0x74, 16]),
  
  // Text alignment
  alignLeft: new Uint8Array([ESC, 0x61, 0x00]),
  alignCenter: new Uint8Array([ESC, 0x61, 0x01]),
  alignRight: new Uint8Array([ESC, 0x61, 0x02]),
  
  // Text formatting
  boldOn: new Uint8Array([ESC, 0x45, 0x01]),
  boldOff: new Uint8Array([ESC, 0x45, 0x00]),
  doubleHeight: new Uint8Array([GS, 0x21, 0x10]),
  doubleWidth: new Uint8Array([GS, 0x21, 0x20]),
  doubleSize: new Uint8Array([GS, 0x21, 0x30]),
  normalSize: new Uint8Array([GS, 0x21, 0x00]),
  
  // Line spacing
  lineSpacing: (n: number) => new Uint8Array([ESC, 0x33, n]),
  
  // Paper cut
  fullCut: new Uint8Array([GS, 0x56, 0x00]),
  partialCut: new Uint8Array([GS, 0x56, 0x01]),
  
  // Feed
  feedLines: (n: number) => new Uint8Array([ESC, 0x64, n]),
  
  // Beep (if supported)
  beep: new Uint8Array([ESC, 0x42, 0x02, 0x02]),
};

// Paper width constants for 58mm paper (Epson TM-T88V)
const PAPER_WIDTH = 32; // characters per line for 58mm paper
const ITEM_NAME_WIDTH = 18; // max chars for item name

// CP1250 character mapping for Czech characters
const cp1250Map: Record<string, number> = {
  // Czech specific characters
  'Á': 0xC1, 'á': 0xE1,
  'Č': 0xC8, 'č': 0xE8,
  'Ď': 0xCF, 'ď': 0xEF,
  'É': 0xC9, 'é': 0xE9,
  'Ě': 0xCC, 'ě': 0xEC,
  'Í': 0xCD, 'í': 0xED,
  'Ň': 0xD2, 'ň': 0xF2,
  'Ó': 0xD3, 'ó': 0xF3,
  'Ř': 0xD8, 'ř': 0xF8,
  'Š': 0xA9, 'š': 0xB9,
  'Ť': 0xAB, 'ť': 0xBB,
  'Ú': 0xDA, 'ú': 0xFA,
  'Ů': 0xD9, 'ů': 0xF9,
  'Ý': 0xDD, 'ý': 0xFD,
  'Ž': 0xAE, 'ž': 0xBE,
  // Special characters for receipt formatting
  '═': 0xCD,
  '─': 0xC4,
};

// Encode text to CP1250 for thermal printer
const encodeCP1250 = (text: string): Uint8Array => {
  const bytes: number[] = [];
  for (const char of text) {
    if (cp1250Map[char] !== undefined) {
      bytes.push(cp1250Map[char]);
    } else {
      const code = char.charCodeAt(0);
      // ASCII characters (0-127) pass through directly
      if (code < 128) {
        bytes.push(code);
      } else {
        // Replace unknown characters with '?'
        bytes.push(0x3F);
      }
    }
  }
  return new Uint8Array(bytes);
};

interface PrinterState {
  isConnected: boolean;
  isPrinting: boolean;
  printerName: string | null;
}

// Type-safe access to WebUSB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUSB = (): any => {
  if (typeof navigator !== "undefined" && "usb" in navigator) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (navigator as any).usb;
  }
  return undefined;
};

const PRINTER_STORAGE_KEY = "thermal_printer_config";

interface SavedPrinterConfig {
  vendorId: number;
  productId: number;
  productName: string;
}

export const useThermalPrinter = () => {
  const [state, setState] = useState<PrinterState>({
    isConnected: false,
    isPrinting: false,
    printerName: null,
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceRef = useRef<any>(null);
  const interfaceNumRef = useRef<number>(0);
  const endpointNumRef = useRef<number>(0);
  const autoConnectAttemptedRef = useRef(false);

  // Check if WebUSB is supported
  const isSupported = typeof navigator !== "undefined" && "usb" in navigator;

  // Helper to save printer config
  const savePrinterConfig = useCallback((vendorId: number, productId: number, productName: string) => {
    const config: SavedPrinterConfig = { vendorId, productId, productName };
    localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(config));
  }, []);

  // Helper to get saved printer config
  const getSavedPrinterConfig = useCallback((): SavedPrinterConfig | null => {
    try {
      const saved = localStorage.getItem(PRINTER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Invalid config, ignore
    }
    return null;
  }, []);

  // Helper to clear saved printer config
  const clearPrinterConfig = useCallback(() => {
    localStorage.removeItem(PRINTER_STORAGE_KEY);
  }, []);

  // Connect to a specific device (internal helper)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connectToDevice = useCallback(async (device: any, showToast = true): Promise<boolean> => {
    try {
      await device.open();
      
      // Find the printer interface and endpoint
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      // Find bulk OUT endpoint
      let foundInterface = false;
      for (const iface of device.configuration!.interfaces) {
        for (const alternate of iface.alternates) {
          for (const endpoint of alternate.endpoints) {
            if (endpoint.direction === "out" && endpoint.type === "bulk") {
              interfaceNumRef.current = iface.interfaceNumber;
              endpointNumRef.current = endpoint.endpointNumber;
              foundInterface = true;
              break;
            }
          }
          if (foundInterface) break;
        }
        if (foundInterface) break;
      }

      if (!foundInterface) {
        throw new Error("Nebyl nalezen tiskový endpoint");
      }

      await device.claimInterface(interfaceNumRef.current);
      
      deviceRef.current = device;
      
      // Save printer config for auto-reconnect
      savePrinterConfig(device.vendorId, device.productId, device.productName || "USB Tiskárna");
      
      setState({
        isConnected: true,
        isPrinting: false,
        printerName: device.productName || "USB Tiskárna",
      });

      if (showToast) {
        toast.success("Tiskárna připojena", {
          description: device.productName || "USB tiskárna připravena",
        });
      }

      return true;
    } catch (error) {
      console.error("Printer connection error:", error);
      if (showToast) {
        toast.error("Chyba připojení tiskárny", {
          description: (error as Error).message,
        });
      }
      return false;
    }
  }, [savePrinterConfig]);

  // Try to auto-connect to previously paired printer
  const autoConnect = useCallback(async (): Promise<boolean> => {
    const usb = getUSB();
    if (!usb) return false;

    const savedConfig = getSavedPrinterConfig();
    if (!savedConfig) return false;

    try {
      // Get all previously authorized devices
      const devices = await usb.getDevices();
      
      // Find the saved printer
      const savedDevice = devices.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.vendorId === savedConfig.vendorId && d.productId === savedConfig.productId
      );

      if (savedDevice) {
        return await connectToDevice(savedDevice, false);
      }
    } catch (error) {
      console.error("Auto-connect error:", error);
    }

    return false;
  }, [getSavedPrinterConfig, connectToDevice]);

  // Connect to printer (manual selection)
  const connect = useCallback(async () => {
    const usb = getUSB();
    if (!usb) {
      toast.error("WebUSB není podporováno", {
        description: "Použijte prohlížeč Chrome nebo Edge",
      });
      return false;
    }

    try {
      // Request USB device - filter for common thermal printer vendor IDs
      const device = await usb.requestDevice({
        filters: [
          // Common thermal printer vendors
          { vendorId: 0x0456 }, // CUSTOM
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0416 }, // Winbond
          { vendorId: 0x0483 }, // STMicroelectronics
          { vendorId: 0x0525 }, // Netchip
          { vendorId: 0x067b }, // Prolific
          { vendorId: 0x1504 }, // GOOJPRT
          { vendorId: 0x1a86 }, // QinHeng (CH340)
          { vendorId: 0x1fc9 }, // NXP
          { vendorId: 0x20d1 }, // Posiflex
          { vendorId: 0x0dd4 }, // Custom 
          { vendorId: 0x0fe6 }, // Kontron
          { vendorId: 0x28e9 }, // GD32
          // Allow any device - user will select
          {},
        ],
      });

      return await connectToDevice(device, true);
    } catch (error) {
      console.error("Printer connection error:", error);
      
      if ((error as Error).name === "NotFoundError") {
        // User cancelled the device picker
        return false;
      }
      
      toast.error("Chyba připojení tiskárny", {
        description: (error as Error).message,
      });
      return false;
    }
  }, [connectToDevice]);

  // Disconnect printer
  const disconnect = useCallback(async () => {
    if (deviceRef.current) {
      try {
        await deviceRef.current.releaseInterface(interfaceNumRef.current);
        await deviceRef.current.close();
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
      deviceRef.current = null;
    }
    
    // Clear saved config when manually disconnecting
    clearPrinterConfig();
    
    setState({
      isConnected: false,
      isPrinting: false,
      printerName: null,
    });
    
    toast.info("Tiskárna odpojena");
  }, [clearPrinterConfig]);

  // Auto-connect on mount
  useEffect(() => {
    if (isSupported && !autoConnectAttemptedRef.current && !state.isConnected) {
      autoConnectAttemptedRef.current = true;
      autoConnect().then((connected) => {
        if (connected) {
          console.log("Auto-connected to saved printer");
        }
      });
    }
  }, [isSupported, autoConnect, state.isConnected]);

  // Send data to printer
  const sendData = useCallback(async (data: Uint8Array) => {
    if (!deviceRef.current) {
      throw new Error("Tiskárna není připojena");
    }

    // Convert Uint8Array to ArrayBuffer for transferOut
    const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    await deviceRef.current.transferOut(endpointNumRef.current, buffer);
  }, []);

  // Print text
  const printText = useCallback(async (text: string) => {
    const encoded = encodeCP1250(text + "\n");
    await sendData(encoded);
  }, [sendData]);

  // Print receipt
  const printReceipt = useCallback(async (
    items: CartItem[],
    total: number,
    receiptId?: string,
    headerText?: string,
    footerText?: string
  ) => {
    if (!deviceRef.current) {
      const connected = await connect();
      if (!connected) return false;
    }

    setState(prev => ({ ...prev, isPrinting: true }));

    try {
      // Initialize printer
      await sendData(commands.init);
      
      // Select CP1250 code page for Czech characters
      await sendData(commands.selectCP1250);
      
      // Header from settings
      await sendData(commands.alignCenter);
      if (headerText) {
        const headerLines = headerText.split('\n');
        // First line in double size (company name)
        if (headerLines.length > 0) {
          await sendData(commands.doubleSize);
          await printText(headerLines[0]);
          await sendData(commands.normalSize);
        }
        // Rest of header lines
        for (let i = 1; i < headerLines.length; i++) {
          await printText(headerLines[i]);
        }
      } else {
        await sendData(commands.doubleSize);
        await printText("POKLADNA");
        await sendData(commands.normalSize);
      }
      await printText("=".repeat(PAPER_WIDTH));
      
      // Date and receipt ID
      await sendData(commands.alignLeft);
      const now = new Date();
      await printText(`Datum: ${now.toLocaleDateString("cs-CZ")}`);
      await printText(`Cas:   ${now.toLocaleTimeString("cs-CZ")}`);
      if (receiptId) {
        await printText(`C.:    ${receiptId}`);
      }
      await printText("-".repeat(PAPER_WIDTH));
      
      // Items
      for (const item of items) {
        // First line: item name
        const name = item.product.name.substring(0, ITEM_NAME_WIDTH);
        const qty = `${item.quantity}x`;
        const subtotal = `${item.product.price * item.quantity} Kc`;
        
        // Format: Name              2x  100 Kc
        const spacing = PAPER_WIDTH - name.length - qty.length - subtotal.length;
        const line = name + " ".repeat(Math.max(1, spacing)) + qty + " " + subtotal;
        await printText(line);
      }
      
      // Total
      await printText("=".repeat(PAPER_WIDTH));
      await sendData(commands.boldOn);
      await sendData(commands.doubleHeight);
      await printText(`CELKEM: ${total} Kc`);
      await sendData(commands.normalSize);
      await sendData(commands.boldOff);
      
      // VAT breakdown
      await printText("-".repeat(PAPER_WIDTH));
      const vatGroups = items.reduce((acc, item) => {
        const rate = item.product.vat_rate;
        const amount = item.product.price * item.quantity;
        acc[rate] = (acc[rate] || 0) + amount;
        return acc;
      }, {} as Record<number, number>);
      
      for (const [rate, amount] of Object.entries(vatGroups)) {
        const vatAmount = (Number(amount) * Number(rate)) / (100 + Number(rate));
        await printText(`DPH ${rate}%: ${vatAmount.toFixed(2)} Kc`);
      }
      
      // Footer from settings
      await printText("-".repeat(PAPER_WIDTH));
      await sendData(commands.alignCenter);
      if (footerText) {
        const footerLines = footerText.split('\n');
        for (const line of footerLines) {
          await printText(line);
        }
      } else {
        await printText("Dekujeme za nakup!");
      }
      await printText("");
      
      // Feed and cut
      await sendData(commands.feedLines(4));
      await sendData(commands.partialCut);
      
      // Beep
      await sendData(commands.beep);

      toast.success("Účtenka vytištěna");
      return true;
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Chyba při tisku", {
        description: (error as Error).message,
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isPrinting: false }));
    }
  }, [connect, sendData, printText]);

  return {
    ...state,
    isSupported,
    connect,
    disconnect,
    printReceipt,
  };
};
