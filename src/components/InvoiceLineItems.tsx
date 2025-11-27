import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LineItem {
  id: string;
  item_name: string;
  description: string;
  image_url: string;
  diamond_weight: number;
  gemstone_weight: number;
  net_weight: number;
  gross_weight: number;
  diamond_cost: number;
  gemstone_cost: number;
  gold_cost: number;
  making_charges: number;
  certification_cost: number;
  cad_design_charges: number;
  camming_charges: number;
  subtotal: number;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  goldRate24k: number;
  purityFraction: number;
}

export const InvoiceLineItems = ({ items, onChange, goldRate24k, purityFraction }: InvoiceLineItemsProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const addNewItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      item_name: "",
      description: "",
      image_url: "",
      diamond_weight: 0,
      gemstone_weight: 0,
      net_weight: 0,
      gross_weight: 0,
      diamond_cost: 0,
      gemstone_cost: 0,
      gold_cost: 0,
      making_charges: 0,
      certification_cost: 0,
      cad_design_charges: 0,
      camming_charges: 0,
      subtotal: 0,
    };
    onChange([...items, newItem]);
    setEditingIndex(items.length);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate gold cost and subtotal
    const item = updatedItems[index];
    item.gold_cost = item.net_weight * purityFraction * goldRate24k;
    item.subtotal = 
      item.gold_cost +
      item.making_charges +
      item.certification_cost +
      item.cad_design_charges +
      item.camming_charges +
      item.diamond_cost +
      item.gemstone_cost;
    
    onChange(updatedItems);
  };

  const deleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('manufacturing-estimates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('manufacturing-estimates')
        .getPublicUrl(filePath);

      updateItem(index, 'image_url', publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    updateItem(index, 'image_url', '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invoice Line Items</h3>
        <Button onClick={addNewItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No items added yet. Click "Add Item" to start adding jewelry pieces to this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Item {index + 1}: {item.item_name || "Untitled Item"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={editingIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    >
                      {editingIndex === index ? "Done" : "Edit"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {editingIndex === index ? (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.item_name}
                        onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                        placeholder="e.g., Diamond Engagement Ring"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Describe the jewelry piece..."
                        rows={3}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Product Image</Label>
                      <div className="mt-2">
                        {item.image_url ? (
                          <div className="relative inline-block">
                            <img
                              src={item.image_url}
                              alt={item.item_name}
                              className="h-32 w-32 object-cover rounded border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                              disabled={uploadingImage}
                            />
                            {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Gross Weight (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.gross_weight}
                        onChange={(e) => updateItem(index, 'gross_weight', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Net Weight (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.net_weight}
                        onChange={(e) => updateItem(index, 'net_weight', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Diamond Weight (ct)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.diamond_weight}
                        onChange={(e) => updateItem(index, 'diamond_weight', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Diamond Cost (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.diamond_cost}
                        onChange={(e) => updateItem(index, 'diamond_cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Gemstone Weight (ct)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.gemstone_weight}
                        onChange={(e) => updateItem(index, 'gemstone_weight', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Gemstone Cost (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.gemstone_cost}
                        onChange={(e) => updateItem(index, 'gemstone_cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Making Charges (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.making_charges}
                        onChange={(e) => updateItem(index, 'making_charges', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>CAD Design Charges (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.cad_design_charges}
                        onChange={(e) => updateItem(index, 'cad_design_charges', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Camming Charges (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.camming_charges}
                        onChange={(e) => updateItem(index, 'camming_charges', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Certification Cost (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.certification_cost}
                        onChange={(e) => updateItem(index, 'certification_cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Gold Cost (Auto-calculated):</span>
                        <span className="text-lg">₹{item.gold_cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-lg">Item Subtotal:</span>
                        <span className="text-xl font-bold text-primary">₹{item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="flex gap-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="h-24 w-24 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Diamond:</span> {item.diamond_weight}ct
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gemstone:</span> {item.gemstone_weight}ct
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gold:</span> {item.net_weight}g
                        </div>
                      </div>
                      <div className="mt-2 font-semibold">
                        Subtotal: ₹{item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total (All Items):</span>
              <span className="text-2xl font-bold text-primary">
                ₹{items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
