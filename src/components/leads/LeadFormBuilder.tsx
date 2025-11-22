import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Code } from "lucide-react";
import { useLeadForms } from "@/hooks/useLeadForms";
import { FormPreview } from "./FormPreview";
import { EmbedCodeModal } from "./EmbedCodeModal";

interface LeadFormBuilderProps {
  businessId: string;
}

const FIELD_TEMPLATES = [
  { id: "contact", name: "Contact Form", fields: [
    { name: "name", type: "text", required: true, placeholder: "Your Name" },
    { name: "email", type: "email", required: true, placeholder: "your@email.com" },
    { name: "phone", type: "tel", required: false, placeholder: "Phone Number" },
    { name: "message", type: "textarea", required: true, placeholder: "Your Message" },
  ]},
  { id: "quote", name: "Quote Request", fields: [
    { name: "name", type: "text", required: true, placeholder: "Your Name" },
    { name: "company", type: "text", required: false, placeholder: "Company Name" },
    { name: "email", type: "email", required: true, placeholder: "Email" },
    { name: "service", type: "text", required: true, placeholder: "Service Interested In" },
    { name: "budget", type: "text", required: false, placeholder: "Budget Range" },
    { name: "details", type: "textarea", required: true, placeholder: "Project Details" },
  ]},
];

export function LeadFormBuilder({ businessId }: LeadFormBuilderProps) {
  const { createForm } = useLeadForms(businessId);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState(FIELD_TEMPLATES[0].fields);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [spamProtection, setSpamProtection] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [savedFormId, setSavedFormId] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    const template = FIELD_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFields(template.fields);
      setFormName(template.name);
    }
  };

  const handleSave = async () => {
    const form = {
      business_id: businessId,
      name: formName,
      description: formDescription,
      fields: fields,
      email_notifications: emailNotifications,
      spam_protection: spamProtection,
      is_active: true,
    };
    
    const result = await createForm.mutateAsync(form);
    if (result) {
      setSavedFormId(result.id);
      setShowEmbedModal(true);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Template</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Contact Us"
              />
            </div>

            <div>
              <Label htmlFor="formDescription">Description</Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotif">Email Notifications</Label>
              <Switch
                id="emailNotif"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="spamProt">Spam Protection</Label>
              <Switch
                id="spamProt"
                checked={spamProtection}
                onCheckedChange={setSpamProtection}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!formName || createForm.isPending} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {createForm.isPending ? "Saving..." : "Save Form"}
              </Button>
              {savedFormId && (
                <Button variant="outline" onClick={() => setShowEmbedModal(true)}>
                  <Code className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        {showPreview && (
          <FormPreview
            formName={formName}
            fields={fields}
          />
        )}
      </div>

      {savedFormId && (
        <EmbedCodeModal
          formId={savedFormId}
          open={showEmbedModal}
          onOpenChange={setShowEmbedModal}
        />
      )}
    </div>
  );
}
