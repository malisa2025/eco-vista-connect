import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelManagement } from "@/hooks/useHotelManagement";
import { useRoomManagement } from "@/hooks/useRoomManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Users, Bed, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function HotelRooms() {
  const navigate = useNavigate();
  const { hotel, loading: hotelLoading } = useHotelManagement();
  const { roomTypes, loading, createRoom, updateRoom, deleteRoom } = useRoomManagement(hotel?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_occupancy: 2,
    bed_configuration: "",
    room_size_sqm: 0,
    base_price_per_night: 0,
    quantity: 1,
    amenities: [] as string[],
    is_active: true,
  });

  if (hotelLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!hotel) {
    navigate("/dashboard/hotel/setup");
    return null;
  }

  const handleOpenDialog = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        description: room.description || "",
        max_occupancy: room.max_occupancy,
        bed_configuration: room.bed_configuration || "",
        room_size_sqm: room.room_size_sqm || 0,
        base_price_per_night: room.base_price_per_night,
        quantity: room.quantity,
        amenities: room.amenities || [],
        is_active: room.is_active,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: "",
        description: "",
        max_occupancy: 2,
        bed_configuration: "",
        room_size_sqm: 0,
        base_price_per_night: 0,
        quantity: 1,
        amenities: [],
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRoom) {
        await updateRoom.mutateAsync({
          id: editingRoom.id,
          ...formData,
        });
        toast.success("Room type updated successfully");
      } else {
        await createRoom.mutateAsync({
          hotel_id: hotel.id,
          ...formData,
        });
        toast.success("Room type created successfully");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save room type");
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room type?")) return;

    try {
      await deleteRoom.mutateAsync(roomId);
      toast.success("Room type deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room type");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage your hotel room types and availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room Type" : "Add Room Type"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Deluxe Double Room"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the room features..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="max_occupancy">Max Occupancy *</Label>
                  <Input
                    id="max_occupancy"
                    type="number"
                    min="1"
                    value={formData.max_occupancy}
                    onChange={(e) => setFormData({ ...formData, max_occupancy: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bed_configuration">Bed Configuration</Label>
                  <Input
                    id="bed_configuration"
                    value={formData.bed_configuration}
                    onChange={(e) => setFormData({ ...formData, bed_configuration: e.target.value })}
                    placeholder="e.g., 1 King Bed"
                  />
                </div>

                <div>
                  <Label htmlFor="room_size_sqm">Room Size (sqm)</Label>
                  <Input
                    id="room_size_sqm"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.room_size_sqm}
                    onChange={(e) => setFormData({ ...formData, room_size_sqm: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="base_price_per_night">Base Price per Night (GH₵) *</Label>
                  <Input
                    id="base_price_per_night"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_price_per_night}
                    onChange={(e) => setFormData({ ...formData, base_price_per_night: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Number of Rooms *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoom.isPending || updateRoom.isPending}>
                  {createRoom.isPending || updateRoom.isPending ? "Saving..." : "Save Room Type"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {roomTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bed className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No room types yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first room type to start accepting bookings</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((room) => (
            <Card key={room.id} className={!room.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(room)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(room.id)}
                      disabled={deleteRoom.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {room.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{room.max_occupancy} guests</span>
                  </div>
                  {room.bed_configuration && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{room.bed_configuration}</span>
                    </div>
                  )}
                </div>

                {room.room_size_sqm > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    <span>{room.room_size_sqm} sqm</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">GH₵ {room.base_price_per_night}</p>
                      <p className="text-xs text-muted-foreground">per night</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{room.quantity} rooms</p>
                      <p className="text-xs text-muted-foreground">
                        {room.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
