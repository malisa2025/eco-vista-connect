import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon } from 'lucide-react';

const AdminUsers = () => {
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Step 1: Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      // Step 2: Fetch roles for all these users
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      
      if (rolesError) throw rolesError;

      // Step 3: Merge roles into profiles
      const rolesMap = new Map<string, Array<{ role: string }>>();
      roles?.forEach(r => {
        if (!rolesMap.has(r.user_id)) {
          rolesMap.set(r.user_id, []);
        }
        rolesMap.get(r.user_id)!.push({ role: r.role });
      });

      return profiles.map(profile => ({
        ...profile,
        user_roles: rolesMap.get(profile.id) || []
      }));
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-2">
              <UsersIcon className="h-8 w-8" />
              Users Management
            </h1>
            <p className="text-muted-foreground">View and manage all users</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading users...</p>
              ) : isError ? (
                <div className="text-center py-8">
                  <p className="text-destructive font-medium">Failed to load users</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(error as Error)?.message || 'Check admin permissions'}
                  </p>
                </div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.user_roles?.map((ur: any, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {ur.role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No users found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
