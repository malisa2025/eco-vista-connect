import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface InvoiceTableProps {
  businessId: string;
}

export function InvoiceTable({ businessId }: InvoiceTableProps) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["subscription-invoices", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading invoices...</div>;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No invoices yet
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
            <TableCell>{format(new Date(invoice.created_at), "MMM dd, yyyy")}</TableCell>
            <TableCell>GH₵{invoice.amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>Paystack</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" disabled={!invoice.pdf_url}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
