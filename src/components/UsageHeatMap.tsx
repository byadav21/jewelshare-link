import { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

interface GeographicData {
  country: string;
  country_code: string;
  usage_count: number;
  manufacturing: number;
  diamond: number;
  top_cities: Array<{ city: string; count: number }>;
}

interface UsageHeatMapProps {
  data: GeographicData[];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const UsageHeatMap = memo(({ data }: UsageHeatMapProps) => {
  // Create a map of country codes to usage counts
  const usageByCountry = data.reduce((acc, item) => {
    acc[item.country_code] = item.usage_count;
    return acc;
  }, {} as Record<string, number>);

  const maxUsage = Math.max(...data.map(d => d.usage_count), 1);

  // Color scale from light to dark based on usage intensity
  const colorScale = scaleLinear<string>()
    .domain([0, maxUsage * 0.25, maxUsage * 0.5, maxUsage * 0.75, maxUsage])
    .range([
      "hsl(var(--muted))",
      "hsl(210 80% 85%)",
      "hsl(210 80% 65%)",
      "hsl(210 80% 45%)",
      "hsl(210 80% 25%)",
    ]);

  return (
    <div className="w-full h-[500px] bg-background rounded-lg border">
      <ComposableMap
        projectionConfig={{
          scale: 147,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.id;
                const usageCount = usageByCountry[countryCode] || 0;
                const fillColor = usageCount > 0 
                  ? colorScale(usageCount) 
                  : "hsl(var(--muted))";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: "hsl(var(--primary))",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                  >
                    <title>
                      {geo.properties.name}
                      {usageCount > 0 && `: ${usageCount} uses`}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});

UsageHeatMap.displayName = "UsageHeatMap";

export default UsageHeatMap;
