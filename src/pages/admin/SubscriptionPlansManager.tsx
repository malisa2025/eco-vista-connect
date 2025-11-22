import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SubscriptionPlansManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    billing_period: 'monthly',
    target_audience: 'business',
    features: [] as string[],
    limits: {} as Record<string, any>,
    is_active: true,
    popular: false,
    display_order: 0,
    discount_percentage: 0,
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const [businessSubs, jobSeekerSubs] = await Promise.all([
        supabase
          .from('business_subscriptions')
          .select('plan_id, amount')
          .eq('status', 'active'),
        supabase
          .from('job_seeker_subscriptions')
          .select('amount')
          .eq('status', 'active'),
      ]);

      const totalBusinessRevenue = businessSubs.data?.reduce((sum, sub) => sum + Number(sub.amount), 0) || 0;
      const totalJobSeekerRevenue = jobSeekerSubs.data?.reduce((sum, sub) => sum + Number(sub.amount), 0) || 0;

      return {
        totalRevenue: totalBusinessRevenue + totalJobSeekerRevenue,
        activeBusinessSubs: businessSubs.data?.length || 0,
        activeJobSeekerSubs: jobSeekerSubs.data?.length || 0,
      };
    },
  });

  const createPlan = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('subscription_plans').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan created successfully');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to create plan'),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan updated successfully');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to update plan'),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: () => toast.error('Failed to delete plan'),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      price: '',
      billing_period: 'monthly',
      target_audience: 'business',
      features: [],
      limits: {},
      is_active: true,
      popular: false,
      display_order: 0,
      discount_percentage: 0,
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price.toString(),
      billing_period: plan.billing_period,
      target_audience: plan.target_audience,
      features: Array.isArray(plan.features) ? plan.features : [],
      limits: plan.limits || {},
      is_active: plan.is_active,
      popular: plan.popular || false,
      display_order: plan.display_order || 0,
      discount_percentage: plan.discount_percentage || 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features,
      limits: formData.limits,
    };

    if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, data });
    } else {
      createPlan.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Subscription Plans</h1>
              <p className="text-muted-foreground">Manage pricing and features</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (GH₵)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_period">Billing Period</Label>
                      <Select
                        value={formData.billing_period}
                        onValueChange={(v) => setFormData({ ...formData, billing_period: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Select
                      value={formData.target_audience}
                      onValueChange={(v) => setFormData({ ...formData, target_audience: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="job_seeker">Job Seeker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Textarea
                      id="features"
                      value={formData.features.join(', ')}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value.split(',').map((f) => f.trim()) })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="popular"
                        checked={formData.popular}
                        onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                      />
                      <Label htmlFor="popular">Popular</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingPlan ? 'Update' : 'Create'} Plan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GH₵{stats?.totalRevenue.toFixed(2) || '0.00'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Business Subscriptions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeBusinessSubs || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Job Seeker Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeJobSeekerSubs || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Plans List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans?.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-2xl font-bold mt-2">
                        GH₵{plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.billing_period}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {plan.popular && <Badge>Popular</Badge>}
                      {!plan.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Target: {plan.target_audience}</p>
                    <p className="text-sm text-muted-foreground">Slug: {plan.slug}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(plan)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this plan?')) deletePlan.mutate(plan.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionPlansManager;
