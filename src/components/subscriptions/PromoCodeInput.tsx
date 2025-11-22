import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PromoCodeInputProps {
  onApply: (code: string, discount: number) => void;
}

export function PromoCodeInput({ onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (fetchError || !data) {
        setError("Invalid promo code");
        setLoading(false);
        return;
      }

      // Check if expired
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setError("Promo code has expired");
        setLoading(false);
        return;
      }

      // Check if not yet valid
      if (data.valid_from && new Date(data.valid_from) > new Date()) {
        setError("Promo code is not yet valid");
        setLoading(false);
        return;
      }

      // Check usage limit
      if (data.max_uses && data.used_count >= data.max_uses) {
        setError("Promo code has reached its usage limit");
        setLoading(false);
        return;
      }

      const discountPercent = data.discount_type === "percentage" 
        ? data.discount_value 
        : 0; // For fixed discounts, would need more logic

      setApplied({ code: data.code, discount: discountPercent });
      onApply(data.code, discountPercent);
      toast.success(`${discountPercent}% discount applied!`);
    } catch (err) {
      setError("Failed to validate promo code");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setError(null);
    onApply("", 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={!!applied}
          className={error ? "border-destructive" : ""}
        />
        {applied ? (
          <Button variant="outline" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleApply} disabled={loading || !code}>
            Apply
          </Button>
        )}
      </div>

      {applied && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>{applied.discount}% discount applied!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
