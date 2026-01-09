import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface EmbedCodeModalProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmbedCodeModal({ formId, open, onOpenChange }: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const iframeCode = `<iframe src="${window.location.origin}/embed/form/${formId}" width="100%" height="600" frameborder="0"></iframe>`;
  
  const scriptCode = `<div id="lead-form-${formId}"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  LeadForm.render('lead-form-${formId}', '${formId}');
</script>`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Your Form</DialogTitle>
          <DialogDescription>Get the code to embed this form on your website</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">iFrame Embed</TabsTrigger>
            <TabsTrigger value="script">Script Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Copy and paste this code into your website's HTML:
              </p>
              <Textarea
                value={iframeCode}
                readOnly
                rows={5}
                className="font-mono text-xs"
              />
              <Button
                onClick={() => handleCopy(iframeCode)}
                className="mt-2"
                variant="outline"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Copy and paste this code into your website's HTML:
              </p>
              <Textarea
                value={scriptCode}
                readOnly
                rows={7}
                className="font-mono text-xs"
              />
              <Button
                onClick={() => handleCopy(scriptCode)}
                className="mt-2"
                variant="outline"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Installation Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Copy the embed code above</li>
            <li>Paste it into your website's HTML where you want the form to appear</li>
            <li>The form will automatically capture and send leads to your dashboard</li>
            <li>You'll receive email notifications for new leads (if enabled)</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
