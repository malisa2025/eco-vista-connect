import { Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FeatureComparisonTableProps {
  plans: Array<{
    id: string;
    name: string;
    features: any;
    usage_limits?: any;
  }>;
}

export function FeatureComparisonTable({ plans }: FeatureComparisonTableProps) {
  const [expanded, setExpanded] = useState(false);

  // Extract all unique features across plans
  const allFeatures = Array.from(
    new Set(plans.flatMap((p) => (Array.isArray(p.features) ? p.features : [])))
  );

  // Extract usage limits
  const limitKeys = Array.from(
    new Set(plans.flatMap((p) => (p.usage_limits ? Object.keys(p.usage_limits) : [])))
  );

  const hasFeature = (plan: any, feature: string) => {
    return Array.isArray(plan.features) && plan.features.includes(feature);
  };

  const getLimit = (plan: any, key: string) => {
    return plan.usage_limits?.[key] || "—";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Feature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Feature</TableHead>
                  {plans.map((plan) => (
                    <TableHead key={plan.id} className="text-center">
                      {plan.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Usage Limits Section */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={plans.length + 1} className="font-semibold">
                    Usage Limits
                  </TableCell>
                </TableRow>
                {limitKeys.map((key) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium capitalize">
                      {key.replace(/_/g, " ")}
                    </TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        {getLimit(plan, key) === -1 ? "Unlimited" : getLimit(plan, key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Features Section */}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={plans.length + 1} className="font-semibold">
                    Features
                  </TableCell>
                </TableRow>
                {allFeatures.slice(0, expanded ? undefined : 5).map((feature) => (
                  <TableRow key={feature}>
                    <TableCell className="font-medium">{feature}</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        {hasFeature(plan, feature) ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {allFeatures.length > 5 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full mt-4">
                {expanded ? "Show Less" : "Show All Features"}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}
