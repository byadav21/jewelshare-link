import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  products: Array<{ id: string; name: string; sku?: string }>;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  products,
  isDeleting = false
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Selected Products?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            You are about to delete <strong>{products.length} product(s)</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4">
          <p className="text-sm font-medium mb-2">Products to be deleted:</p>
          <ScrollArea className="h-[200px] w-full border rounded-md p-4">
            <div className="space-y-2">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-start gap-2 py-2 border-b last:border-0"
                >
                  <span className="text-xs text-muted-foreground min-w-[20px]">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : `Delete ${products.length} Product${products.length > 1 ? 's' : ''}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
