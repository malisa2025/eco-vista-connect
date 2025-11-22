import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FormPreviewProps {
  formName: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    placeholder: string;
  }>;
}

export function FormPreview({ formName, fields }: FormPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{formName || "Your Form"}</h3>
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {fields.map((field, index) => (
              <div key={index}>
                <Label htmlFor={`preview-${field.name}`}>
                  {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={`preview-${field.name}`}
                    placeholder={field.placeholder}
                    rows={3}
                    disabled
                  />
                ) : (
                  <Input
                    id={`preview-${field.name}`}
                    type={field.type}
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
              </div>
            ))}
            <Button type="submit" disabled>Submit</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
