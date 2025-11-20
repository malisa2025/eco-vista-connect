import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AIGenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
}

const AIGenerateButton = ({ 
  onClick, 
  loading = false, 
  disabled = false,
  text = "Generate with AI",
  className = ""
}: AIGenerateButtonProps) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      className={`gap-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
};

export default AIGenerateButton;
