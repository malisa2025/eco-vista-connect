import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobAlertMutations } from "@/hooks/useJobAlerts";
import { useBusinessCategories } from "@/hooks/useBusinessCategories";

const CreateAlertDialog = () => {
  const { user } = useAuth();
  const { createAlert } = useJobAlertMutations();
  const { data: categories } = useBusinessCategories();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    category: '',
    location: '',
    job_type: '',
    experience_level: '',
    frequency: 'daily',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createAlert.mutate(
      {
        alert: {
          ...formData,
          is_active: true,
        },
        userId: user.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData({
            name: '',
            keywords: '',
            category: '',
            location: '',
            job_type: '',
            experience_level: '',
            frequency: 'daily',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Create Job Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Job Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Alert Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Software Engineer in Accra"
              required
            />
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (Optional)</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="e.g., React, Node.js"
            />
          </div>

          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Accra"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Alert Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={createAlert.isPending}>
            {createAlert.isPending ? 'Creating...' : 'Create Alert'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAlertDialog;
