import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdVariants } from "@/hooks/useAdVariants";
import { VariantCard } from "./VariantCard";
import { CreateVariantDialog } from "./CreateVariantDialog";
import { VariantComparisonChart } from "./VariantComparisonChart";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ABTestManagerProps {
  advertisementId: string;
}

export function ABTestManager({ advertisementId }: ABTestManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { variants, isLoading, analyzeABTest } = useAdVariants(advertisementId);

  const totalImpressions = variants?.reduce((sum, v) => sum + (v.impressions || 0), 0) || 0;
  const winner = variants?.find(v => v.is_winner);
  const hasMultipleVariants = (variants?.length || 0) > 1;

  const handleAnalyze = async () => {
    if (!variants || variants.length < 2) return;
    await analyzeABTest.mutateAsync();
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading A/B test data...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">A/B Test Manager</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Test different ad variants to optimize performance
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Variant
        </Button>
      </div>

      {winner && (
        <Alert className="bg-primary/10 border-primary">
          <AlertDescription>
            <strong>Winner Declared:</strong> {winner.variant_name} is performing significantly better with {winner.conversions} conversions
          </AlertDescription>
        </Alert>
      )}

      {hasMultipleVariants && totalImpressions >= 100 && !winner && (
        <Button onClick={handleAnalyze} disabled={analyzeABTest.isPending}>
          {analyzeABTest.isPending ? "Analyzing..." : "Analyze Results"}
        </Button>
      )}

      {!hasMultipleVariants && (
        <Alert>
          <AlertDescription>
            Create at least 2 variants to start A/B testing. You'll need 100+ impressions for statistical significance.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="grid" className="text-xs md:text-sm">Grid</TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs md:text-sm">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-3 md:space-y-4 mt-4">
          {variants && variants.length > 0 ? (
            <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {variants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No variants yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first variant to start A/B testing
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          {variants && variants.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <VariantComparisonChart variants={variants} />
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No variants to compare yet
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateVariantDialog
        advertisementId={advertisementId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
