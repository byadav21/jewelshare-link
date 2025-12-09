import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EstimateImage } from "@/components/EstimateImage";

export interface LineItem {
  id: string;
  item_name: string;
  description: string;
  image_url: string;
  certificate_image_url?: string;
  diamond_weight: number;
  diamond_per_carat_price: number;
  diamond_color: string;
  diamond_clarity: string;
  diamond_cut: string;
  diamond_certification: string;
  diamond_shape?: string;
  diamond_fluorescence?: string;
  diamond_measurements?: string;
  gemstone_weight: number;
  gemstone_type: string;
  gemstone_color: string;
  gemstone_clarity: string;
  gemstone_origin?: string;
  gemstone_treatment?: string;
  gemstone_shape?: string;
  gemstone_per_carat_price?: number;
  net_weight: number;
  gross_weight: number;
  purity_fraction: number;
  diamond_cost: number;
  gemstone_cost: number;
  gold_cost: number;
  making_charges: number;
  certification_cost: number;
  cad_design_charges: number;
  camming_charges: number;
  subtotal: number;
  weight_mode: 'gross' | 'net';
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  goldRate24k: number;
  purityFraction: number;
  estimateCategory?: 'jewelry' | 'loose_diamond' | 'gemstone';
}

export const InvoiceLineItems = ({ items, onChange, goldRate24k, purityFraction, estimateCategory = 'jewelry' }: InvoiceLineItemsProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const addNewItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      item_name: "",
      description: "",
      image_url: "",
      certificate_image_url: "",
      diamond_weight: 0,
      diamond_per_carat_price: 0,
      diamond_color: "",
      diamond_clarity: "",
      diamond_cut: "",
      diamond_certification: "",
      diamond_shape: "",
      diamond_fluorescence: "",
      diamond_measurements: "",
      gemstone_weight: 0,
      gemstone_type: "",
      gemstone_color: "",
      gemstone_clarity: "",
      gemstone_origin: "",
      gemstone_treatment: "",
      gemstone_shape: "",
      gemstone_per_carat_price: 0,
      net_weight: 0,
      gross_weight: 0,
      purity_fraction: purityFraction,
      diamond_cost: 0,
      gemstone_cost: 0,
      gold_cost: 0,
      making_charges: 0,
      certification_cost: 0,
      cad_design_charges: 0,
      camming_charges: 0,
      subtotal: 0,
      weight_mode: 'gross',
    };
    onChange([...items, newItem]);
    setEditingIndex(items.length);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    const item = updatedItems[index];
    
    // Auto-calculate net weight if in gross weight mode
    if (item.weight_mode === 'gross' && (field === 'gross_weight' || field === 'diamond_weight' || field === 'gemstone_weight')) {
      const totalStoneWeight = (item.diamond_weight + item.gemstone_weight) / 5;
      item.net_weight = Math.max(0, item.gross_weight - totalStoneWeight);
    }
    
    // Auto-calculate diamond cost from weight × per carat price
    if (field === 'diamond_weight' || field === 'diamond_per_carat_price') {
      item.diamond_cost = item.diamond_weight * item.diamond_per_carat_price;
    }
    
    // Auto-calculate gemstone cost from weight × per carat price (if per carat price is set)
    if ((field === 'gemstone_weight' || field === 'gemstone_per_carat_price') && item.gemstone_per_carat_price) {
      item.gemstone_cost = item.gemstone_weight * item.gemstone_per_carat_price;
    }
    
    // Auto-calculate gold cost and subtotal using item's own purity fraction
    item.gold_cost = item.net_weight * item.purity_fraction * goldRate24k;
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

      // Store the storage path (not public URL)
      // Signed URLs will be generated when displaying
      const imagePath = data.path;

      updateItem(index, 'image_url', imagePath);
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

  const handleCertificateUpload = async (index: number, file: File) => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `cert-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('manufacturing-estimates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const imagePath = data.path;
      updateItem(index, 'certificate_image_url', imagePath);
      toast.success("Certificate uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading certificate:', error);
      toast.error("Failed to upload certificate");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCertificate = (index: number) => {
    updateItem(index, 'certificate_image_url', '');
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

                    {/* Weight & Purity Section - Only for Jewelry */}
                    {estimateCategory === 'jewelry' && (
                      <div className="col-span-2 space-y-4 p-4 border rounded-lg bg-card">
                        <div>
                          <h4 className="font-semibold text-base mb-1">Weight & Purity</h4>
                          <p className="text-sm text-muted-foreground">Enter weights and purity details</p>
                        </div>

                        <div>
                          <Label className="mb-2 block">Weight Entry Mode:</Label>
                          <Select
                            value={item.weight_mode}
                            onValueChange={(value: 'gross' | 'net') => updateItem(index, 'weight_mode', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gross">Gross Weight Mode (Auto-calculate Net Weight)</SelectItem>
                              <SelectItem value="net">Net Weight Mode (Direct Entry)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {item.weight_mode === 'gross' ? (
                          <>
                            <div>
                              <Label>Gross Weight (grams)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.gross_weight}
                                onChange={(e) => updateItem(index, 'gross_weight', parseFloat(e.target.value) || 0)}
                                className="mt-1.5"
                              />
                            </div>

                            <div>
                              <Label>Net Weight (grams) <span className="text-muted-foreground text-xs">(Auto-calculated)</span></Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.net_weight}
                                disabled
                                className="mt-1.5 bg-muted"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <Label>Gross Weight (grams)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.gross_weight}
                                onChange={(e) => updateItem(index, 'gross_weight', parseFloat(e.target.value) || 0)}
                                className="mt-1.5"
                              />
                            </div>

                            <div>
                              <Label>Net Weight (grams)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.net_weight}
                                onChange={(e) => updateItem(index, 'net_weight', parseFloat(e.target.value) || 0)}
                                className="mt-1.5"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <Label>Purity Fraction (e.g., 0.76 for 18K)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={item.purity_fraction}
                            onChange={(e) => updateItem(index, 'purity_fraction', parseFloat(e.target.value) || 0)}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    )}

                    {/* Diamond Section - Show for jewelry and loose_diamond only */}
                    {(estimateCategory === 'jewelry' || estimateCategory === 'loose_diamond') && (
                      <>
                        <div className="col-span-2 border-t my-2 pt-4">
                          <h5 className="font-medium text-sm text-muted-foreground mb-3">Diamond Details</h5>
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
                          <Label>Diamond Per Carat Price (₹/ct)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.diamond_per_carat_price}
                            onChange={(e) => updateItem(index, 'diamond_per_carat_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <Label>Diamond Cost (₹) <span className="text-muted-foreground text-xs">(Auto-calculated)</span></Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.diamond_cost}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </>
                    )}

                    {/* Diamond 4Cs and Details - Show for jewelry and loose_diamond only */}
                    {(estimateCategory === 'jewelry' || estimateCategory === 'loose_diamond') && (
                      <>
                        <div>
                          <Label>Diamond Color</Label>
                          <Input
                            value={item.diamond_color}
                            onChange={(e) => updateItem(index, 'diamond_color', e.target.value)}
                            placeholder="e.g., D, E, F"
                          />
                        </div>

                        <div>
                          <Label>Diamond Clarity</Label>
                          <Input
                            value={item.diamond_clarity}
                            onChange={(e) => updateItem(index, 'diamond_clarity', e.target.value)}
                            placeholder="e.g., VVS1, VS1, SI1"
                          />
                        </div>

                        <div>
                          <Label>Diamond Cut</Label>
                          <Input
                            value={item.diamond_cut}
                            onChange={(e) => updateItem(index, 'diamond_cut', e.target.value)}
                            placeholder="e.g., Excellent, Very Good"
                          />
                        </div>

                        <div>
                          <Label>Diamond Certification</Label>
                          <Input
                            value={item.diamond_certification}
                            onChange={(e) => updateItem(index, 'diamond_certification', e.target.value)}
                            placeholder="e.g., GIA, IGI"
                          />
                        </div>

                        <div>
                          <Label>Diamond Shape</Label>
                          <Input
                            value={item.diamond_shape || ''}
                            onChange={(e) => updateItem(index, 'diamond_shape', e.target.value)}
                            placeholder="e.g., Round, Princess, Oval"
                          />
                        </div>

                        <div>
                          <Label>Diamond Fluorescence</Label>
                          <Input
                            value={item.diamond_fluorescence || ''}
                            onChange={(e) => updateItem(index, 'diamond_fluorescence', e.target.value)}
                            placeholder="e.g., None, Faint, Medium"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Diamond Measurements</Label>
                          <Input
                            value={item.diamond_measurements || ''}
                            onChange={(e) => updateItem(index, 'diamond_measurements', e.target.value)}
                            placeholder="e.g., 6.5 x 6.5 x 4.0 mm"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Certificate Image</Label>
                          <div className="mt-2">
                            {item.certificate_image_url ? (
                              <div className="relative inline-block">
                                <EstimateImage
                                  src={item.certificate_image_url}
                                  alt="Certificate"
                                  className="h-32 w-auto object-contain rounded border"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2"
                                  onClick={() => removeCertificate(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleCertificateUpload(index, file);
                                  }}
                                  disabled={uploadingImage}
                                />
                                {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Gemstone Section - Show for jewelry and gemstone only */}
                    {(estimateCategory === 'jewelry' || estimateCategory === 'gemstone') && (
                      <>
                        <div className="col-span-2 border-t my-2 pt-4">
                          <h5 className="font-medium text-sm text-muted-foreground mb-3">Gemstone Details</h5>
                        </div>

                        <div>
                          <Label>Gemstone Type</Label>
                          <Input
                            value={item.gemstone_type}
                            onChange={(e) => updateItem(index, 'gemstone_type', e.target.value)}
                            placeholder="e.g., Ruby, Sapphire, Emerald"
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
                          <Label>Gemstone Per Carat Price (₹/ct)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.gemstone_per_carat_price || 0}
                            onChange={(e) => updateItem(index, 'gemstone_per_carat_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <Label>Gemstone Cost (₹) <span className="text-muted-foreground text-xs">(Auto/Manual)</span></Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.gemstone_cost}
                            onChange={(e) => updateItem(index, 'gemstone_cost', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <Label>Gemstone Color</Label>
                          <Input
                            value={item.gemstone_color}
                            onChange={(e) => updateItem(index, 'gemstone_color', e.target.value)}
                            placeholder="e.g., Pigeon Blood Red"
                          />
                        </div>

                        <div>
                          <Label>Gemstone Clarity</Label>
                          <Input
                            value={item.gemstone_clarity}
                            onChange={(e) => updateItem(index, 'gemstone_clarity', e.target.value)}
                            placeholder="e.g., Eye Clean, VVS"
                          />
                        </div>

                        <div>
                          <Label>Gemstone Origin</Label>
                          <Input
                            value={item.gemstone_origin || ''}
                            onChange={(e) => updateItem(index, 'gemstone_origin', e.target.value)}
                            placeholder="e.g., Burma, Kashmir, Colombia"
                          />
                        </div>

                        <div>
                          <Label>Gemstone Treatment</Label>
                          <Input
                            value={item.gemstone_treatment || ''}
                            onChange={(e) => updateItem(index, 'gemstone_treatment', e.target.value)}
                            placeholder="e.g., None, Heated, Untreated"
                          />
                        </div>

                        <div>
                          <Label>Gemstone Shape</Label>
                          <Input
                            value={item.gemstone_shape || ''}
                            onChange={(e) => updateItem(index, 'gemstone_shape', e.target.value)}
                            placeholder="e.g., Oval, Cushion, Cabochon"
                          />
                        </div>

                        {/* Certificate for Gemstones */}
                        <div className="col-span-2">
                          <Label>Certificate Image</Label>
                          <div className="mt-2">
                            {item.certificate_image_url ? (
                              <div className="relative inline-block">
                                <EstimateImage
                                  src={item.certificate_image_url}
                                  alt="Certificate"
                                  className="h-32 w-auto object-contain rounded border"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2"
                                  onClick={() => removeCertificate(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleCertificateUpload(index, file);
                                  }}
                                  disabled={uploadingImage}
                                />
                                {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Additional Charges Section - Only for Jewelry */}
                    {estimateCategory === 'jewelry' && (
                      <>
                        <div className="col-span-2 border-t my-2 pt-4">
                          <h5 className="font-medium text-sm text-muted-foreground mb-3">Additional Charges</h5>
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
                      </>
                    )}

                    {/* Certification Cost - Show for all categories */}
                    <div>
                      <Label>Certification Cost (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.certification_cost}
                        onChange={(e) => updateItem(index, 'certification_cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    {/* Totals Section */}
                    <div className="col-span-2 pt-4 border-t">
                      {/* Gold Cost - Only for Jewelry */}
                      {estimateCategory === 'jewelry' && (
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Gold Cost (Auto-calculated):</span>
                          <span className="text-lg">₹{item.gold_cost.toFixed(2)}</span>
                        </div>
                      )}
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
                      <EstimateImage
                        src={item.image_url}
                        alt={item.item_name}
                        className="h-24 w-24 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        {item.diamond_weight > 0 && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Diamond:</span> {item.diamond_weight}ct
                            </div>
                            <div>
                              <span className="text-muted-foreground">Color/Clarity:</span> {item.diamond_color || 'N/A'}/{item.diamond_clarity || 'N/A'}
                            </div>
                            {item.diamond_cut && (
                              <div>
                                <span className="text-muted-foreground">Cut:</span> {item.diamond_cut}
                              </div>
                            )}
                            {item.diamond_certification && (
                              <div>
                                <span className="text-muted-foreground">Cert:</span> {item.diamond_certification}
                              </div>
                            )}
                          </>
                        )}
                        {item.gemstone_weight > 0 && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Gemstone:</span> {item.gemstone_weight}ct
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span> {item.gemstone_type || 'N/A'}
                            </div>
                            {item.gemstone_color && (
                              <div>
                                <span className="text-muted-foreground">Color:</span> {item.gemstone_color}
                              </div>
                            )}
                            {item.gemstone_clarity && (
                              <div>
                                <span className="text-muted-foreground">Clarity:</span> {item.gemstone_clarity}
                              </div>
                            )}
                          </>
                        )}
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
