import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface StylingControlsProps {
  globalStyling: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    pageMargin?: number;
  };
  onUpdate: (styling: any) => void;
}

export const StylingControls = ({ globalStyling, onUpdate }: StylingControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Styling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={globalStyling.primaryColor || "#4F46E5"}
                onChange={(e) =>
                  onUpdate({ ...globalStyling, primaryColor: e.target.value })
                }
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={globalStyling.primaryColor || "#4F46E5"}
                onChange={(e) =>
                  onUpdate({ ...globalStyling, primaryColor: e.target.value })
                }
                placeholder="#4F46E5"
              />
            </div>
          </div>

          <div>
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={globalStyling.secondaryColor || "#8B5CF6"}
                onChange={(e) =>
                  onUpdate({ ...globalStyling, secondaryColor: e.target.value })
                }
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={globalStyling.secondaryColor || "#8B5CF6"}
                onChange={(e) =>
                  onUpdate({ ...globalStyling, secondaryColor: e.target.value })
                }
                placeholder="#8B5CF6"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Font Family</Label>
          <Select
            value={globalStyling.fontFamily || "Arial"}
            onValueChange={(value) =>
              onUpdate({ ...globalStyling, fontFamily: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Page Margin (px): {globalStyling.pageMargin || 20}</Label>
          <Slider
            value={[globalStyling.pageMargin || 20]}
            onValueChange={([value]) =>
              onUpdate({ ...globalStyling, pageMargin: value })
            }
            min={10}
            max={50}
            step={5}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
