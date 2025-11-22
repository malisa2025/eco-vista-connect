import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Trophy } from "lucide-react";
import { useAdVariants } from "@/hooks/useAdVariants";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VariantCardProps {
  variant: {
    id: string;
    variant_name: string;
    title: string;
    description: string | null;
    image_url: string;
    cta_text: string | null;
    traffic_allocation: number | null;
    impressions: number | null;
    clicks: number | null;
    conversions: number | null;
    is_winner: boolean | null;
  };
}

export function VariantCard({ variant }: VariantCardProps) {
  const { deleteVariant } = useAdVariants(variant.id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const ctr = variant.impressions
    ? ((variant.clicks || 0) / variant.impressions * 100).toFixed(2)
    : "0.00";
  
  const conversionRate = variant.clicks
    ? ((variant.conversions || 0) / variant.clicks * 100).toFixed(2)
    : "0.00";

  const handleDelete = async () => {
    await deleteVariant.mutateAsync(variant.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className={variant.is_winner ? "border-primary shadow-lg" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{variant.variant_name}</CardTitle>
            {variant.is_winner && (
              <Badge className="bg-primary">
                <Trophy className="mr-1 h-3 w-3" />
                Winner
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <img
            src={variant.image_url}
            alt={variant.title}
            className="w-full h-32 object-cover rounded"
          />
          
          <div>
            <h4 className="font-semibold">{variant.title}</h4>
            {variant.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {variant.description}
              </p>
            )}
            {variant.cta_text && (
              <p className="text-sm text-primary mt-1">
                CTA: "{variant.cta_text}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">Traffic</div>
              <div className="font-semibold">{variant.traffic_allocation}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Impressions</div>
              <div className="font-semibold">{variant.impressions || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Clicks</div>
              <div className="font-semibold">{variant.clicks || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">CTR</div>
              <div className="font-semibold">{ctr}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Conversions</div>
              <div className="font-semibold">{variant.conversions || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Conv. Rate</div>
              <div className="font-semibold">{conversionRate}%</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteVariant.isPending}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{variant.variant_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
