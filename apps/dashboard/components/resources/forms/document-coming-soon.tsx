import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText as FileTextIcon } from 'lucide-react';

export function DocumentComingSoon() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Document Upload</Label>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
              <FileTextIcon className="w-12 h-12 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-center">Document Upload Coming Soon</h3>
              <p className="text-sm text-center text-muted-foreground mt-2">
                We're working on bringing you the ability to upload and manage documents directly.
                Stay tuned for updates!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
