import { useState } from "react";
import { useHotelManagement } from "@/hooks/useHotelManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function HotelSettings() {
  const { hotel, loading } = useHotelManagement();
  const [feeEnabled, setFeeEnabled] = useState((hotel as any)?.reservation_fee_enabled || false);
  const [feeType, setFeeType] = useState((hotel as any)?.reservation_fee_type || "percentage");
  const [percentage, setPercentage] = useState((hotel as any)?.reservation_fee_percentage || 20);
  const [fixedAmount, setFixedAmount] = useState((hotel as any)?.reservation_fee_fixed_amount || 0);
  const [isSaving, setIsSaving] = useState(false);

  const exampleTotal = 500;
  const exampleFee = feeType === "percentage" 
    ? (exampleTotal * percentage) / 100 
    : fixedAmount;
  const exampleBalance = exampleTotal - exampleFee;

  const handleSave = async () => {
    if (!hotel) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("hotel_properties")
        .update({
          reservation_fee_enabled: feeEnabled,
          reservation_fee_type: feeType,
          reservation_fee_percentage: percentage,
          reservation_fee_fixed_amount: fixedAmount,
        })
        .eq("id", hotel.id);

      if (error) throw error;

      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Hotel not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Hotel Settings</h1>
        <p className="text-muted-foreground">Manage your hotel's booking preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Reservation Fee Settings
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Require guests to pay a deposit to secure their booking. The remaining balance can be paid at check-in.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Configure deposit requirements for bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fee-enabled">Require Reservation Fee</Label>
              <p className="text-sm text-muted-foreground">
                Enable to require a deposit instead of full payment upfront
              </p>
            </div>
            <Switch
              id="fee-enabled"
              checked={feeEnabled}
              onCheckedChange={setFeeEnabled}
            />
          </div>

          {feeEnabled && (
            <>
              {/* Fee Type Selection */}
              <div className="space-y-3">
                <Label>Fee Type</Label>
                <RadioGroup value={feeType} onValueChange={setFeeType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="font-normal">
                      Percentage of total
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="font-normal">
                      Fixed amount
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Percentage Slider */}
              {feeType === "percentage" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Deposit Percentage</Label>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <Slider
                    value={[percentage]}
                    onValueChange={(value) => setPercentage(value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose the percentage of the total booking amount guests must pay as a deposit
                  </p>
                </div>
              )}

              {/* Fixed Amount Input */}
              {feeType === "fixed" && (
                <div className="space-y-2">
                  <Label htmlFor="fixed-amount">Fixed Deposit Amount (GH₵)</Label>
                  <Input
                    id="fixed-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                    placeholder="100.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the fixed amount guests must pay as a deposit regardless of booking total
                  </p>
                </div>
              )}

              {/* Preview Calculation */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Preview</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Example booking total:</span>
                    <span className="font-medium">GH₵{exampleTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest pays upfront:</span>
                    <span className="font-semibold text-primary">GH₵{exampleFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance due at check-in:</span>
                    <span className="font-medium">GH₵{exampleBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
