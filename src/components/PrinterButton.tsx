import { Button } from "@/components/ui/button";
import { Printer, Unplug, Loader2 } from "lucide-react";
import { useThermalPrinter } from "@/hooks/useThermalPrinter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PrinterButtonProps {
  variant?: "icon" | "full";
  className?: string;
}

const PrinterButton = ({ variant = "icon", className }: PrinterButtonProps) => {
  const { isConnected, isPrinting, printerName, isSupported, connect, disconnect } = useThermalPrinter();

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={variant === "icon" ? "icon" : "default"}
              className={className}
              disabled
            >
              <Printer className="h-5 w-5 text-muted-foreground" />
              {variant === "full" && <span className="ml-2">Tisk nepodporován</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>WebUSB není podporováno v tomto prohlížeči</p>
            <p className="text-xs text-muted-foreground">Použijte Chrome nebo Edge</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isPrinting) {
    return (
      <Button
        variant="ghost"
        size={variant === "icon" ? "icon" : "default"}
        className={className}
        disabled
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        {variant === "full" && <span className="ml-2">Tisknu...</span>}
      </Button>
    );
  }

  if (isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={variant === "icon" ? "icon" : "default"}
              className={`text-green-600 hover:text-destructive ${className}`}
              onClick={disconnect}
            >
              <Printer className="h-5 w-5" />
              {variant === "full" && <span className="ml-2">{printerName}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{printerName}</p>
            <p className="text-xs text-muted-foreground">Klikněte pro odpojení</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={variant === "icon" ? "icon" : "default"}
            className={className}
            onClick={connect}
          >
            <Printer className="h-5 w-5" />
            {variant === "full" && <span className="ml-2">Připojit tiskárnu</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Připojit USB tiskárnu</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PrinterButton;
