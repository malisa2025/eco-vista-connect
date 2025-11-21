import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortablePartnerRow } from '@/components/admin/SortablePartnerRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAllPartners, usePartnerMutations, Partner } from '@/hooks/usePartners';
import { CreatePartnerDialog } from '@/components/admin/CreatePartnerDialog';
import { EditPartnerDialog } from '@/components/admin/EditPartnerDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminPartners = () => {
  const { data: partners, isLoading } = useAllPartners();
  const { reorderPartners, togglePartnerStatus, deletePartner } = usePartnerMutations();
  const [localPartners, setLocalPartners] = useState<Partner[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    if (partners) {
      setLocalPartners(partners);
    }
  }, [partners]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalPartners((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);

      const updates = reordered.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));

      reorderPartners.mutate(updates);
      return reordered;
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    togglePartnerStatus.mutate({ id, is_active: !currentStatus });
  };

  const handleDelete = () => {
    if (deletingPartner) {
      deletePartner.mutate(deletingPartner.id);
      setDeletingPartner(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">
                Partners Management
              </h1>
              <p className="text-muted-foreground">
                Manage partner logos, reorder, and toggle visibility
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Partner
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Partners ({localPartners.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : localPartners.length > 0 ? (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localPartners.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {localPartners.map((partner, index) => (
                        <SortablePartnerRow
                          key={partner.id}
                          id={partner.id}
                          partner={partner}
                          index={index}
                          onToggleStatus={handleToggleStatus}
                          onEdit={setEditingPartner}
                          onDelete={setDeletingPartner}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No partners yet. Add your first partner!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <CreatePartnerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      {editingPartner && (
        <EditPartnerDialog
          open={!!editingPartner}
          onOpenChange={() => setEditingPartner(null)}
          partner={editingPartner}
        />
      )}

      <AlertDialog open={!!deletingPartner} onOpenChange={() => setDeletingPartner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPartner?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPartners;
