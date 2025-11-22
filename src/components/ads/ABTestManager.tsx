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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Test Manager</h2>
          <p className="text-muted-foreground">
            Test different ad variants to optimize performance
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
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
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="comparison">Comparison Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {variants?.map((variant) => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          {variants && variants.length > 0 ? (
            <VariantComparisonChart variants={variants} />
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
