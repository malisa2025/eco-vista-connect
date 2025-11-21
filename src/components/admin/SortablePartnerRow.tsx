import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Partner } from '@/hooks/usePartners';

interface SortablePartnerRowProps {
  id: string;
  partner: Partner;
  index: number;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

export const SortablePartnerRow = ({
  id,
  partner,
  index,
  onToggleStatus,
  onEdit,
  onDelete,
}: SortablePartnerRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Order Badge */}
      <Badge variant="outline" className="shrink-0 w-10 justify-center">
        {index + 1}
      </Badge>

      {/* Logo */}
      <img
        src={partner.logo_url}
        alt={partner.name}
        className="h-12 w-12 object-contain rounded border"
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{partner.name}</p>
        {partner.website_url && (
          <a
            href={partner.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            {new URL(partner.website_url).hostname}
          </a>
        )}
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          checked={partner.is_active}
          onCheckedChange={() => onToggleStatus(partner.id, partner.is_active)}
        />
        <Badge variant={partner.is_active ? 'default' : 'secondary'}>
          {partner.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(partner)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(partner)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
