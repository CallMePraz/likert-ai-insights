
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for Indonesia's regions
const regionData = [
  { id: "aceh", name: "Aceh", rating: 4.2 },
  { id: "sumut", name: "North Sumatra", rating: 3.7 },
  { id: "sumbar", name: "West Sumatra", rating: 4.1 },
  { id: "riau", name: "Riau", rating: 3.9 },
  { id: "jambi", name: "Jambi", rating: 3.5 },
  { id: "sumsel", name: "South Sumatra", rating: 3.8 },
  { id: "bengkulu", name: "Bengkulu", rating: 3.6 },
  { id: "lampung", name: "Lampung", rating: 3.4 },
  { id: "jakarta", name: "Jakarta", rating: 4.5 },
  { id: "jabar", name: "West Java", rating: 4.3 },
  { id: "jateng", name: "Central Java", rating: 4.0 },
  { id: "jatim", name: "East Java", rating: 4.2 },
  { id: "bali", name: "Bali", rating: 4.7 },
  { id: "ntb", name: "West Nusa Tenggara", rating: 3.9 },
  { id: "ntt", name: "East Nusa Tenggara", rating: 3.8 },
  { id: "kalbar", name: "West Kalimantan", rating: 3.6 },
  { id: "kalteng", name: "Central Kalimantan", rating: 3.7 },
  { id: "kalsel", name: "South Kalimantan", rating: 3.9 },
  { id: "kaltim", name: "East Kalimantan", rating: 4.0 },
  { id: "sulut", name: "North Sulawesi", rating: 4.1 },
  { id: "sulteng", name: "Central Sulawesi", rating: 3.8 },
  { id: "sulsel", name: "South Sulawesi", rating: 4.2 },
  { id: "sultengg", name: "Southeast Sulawesi", rating: 3.9 },
  { id: "gorontalo", name: "Gorontalo", rating: 3.7 },
  { id: "maluku", name: "Maluku", rating: 3.6 },
  { id: "malut", name: "North Maluku", rating: 3.5 },
  { id: "papua", name: "Papua", rating: 3.4 },
  { id: "papuabarat", name: "West Papua", rating: 3.3 },
];

// Color scale function
const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "#22c55e"; // Bright green for excellent
  if (rating >= 4.0) return "#4ade80"; // Green for very good
  if (rating >= 3.5) return "#a3e635"; // Light green for good
  if (rating >= 3.0) return "#facc15"; // Yellow for average
  if (rating >= 2.5) return "#fb923c"; // Orange for below average
  return "#ef4444"; // Red for poor
};

export function IndonesiaMap() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Regional Satisfaction Ratings</CardTitle>
        <CardDescription>Average customer ratings across Indonesia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
          {/* SVG map of Indonesia */}
          <svg
            viewBox="0 0 800 400"
            className="w-full h-full"
            style={{ maxHeight: "300px" }}
          >
            {/* Simplified Indonesia map - using abstract shapes for regions */}
            <g className="regions">
              {/* West Indonesia (Sumatra, Java, Bali) */}
              <path
                d="M100,180 L180,120 L220,200 L150,250 Z"
                fill={getRatingColor(4.1)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Sumatra"
              >
                <title>Sumatra: 4.1 ★</title>
              </path>
              <path
                d="M240,220 L340,210 L350,240 L280,260 Z"
                fill={getRatingColor(4.3)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Java"
              >
                <title>Java: 4.3 ★</title>
              </path>
              <path
                d="M360,230 L390,220 L400,240 L380,250 Z"
                fill={getRatingColor(4.7)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Bali"
              >
                <title>Bali: 4.7 ★</title>
              </path>

              {/* Central Indonesia (Nusa Tenggara, Sulawesi) */}
              <path
                d="M400,230 L460,220 L470,250 L420,260 Z"
                fill={getRatingColor(3.8)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Nusa Tenggara"
              >
                <title>Nusa Tenggara: 3.8 ★</title>
              </path>
              <path
                d="M480,150 L510,120 L550,180 L500,230 Z"
                fill={getRatingColor(4.0)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Sulawesi"
              >
                <title>Sulawesi: 4.0 ★</title>
              </path>

              {/* East Indonesia (Kalimantan, Maluku, Papua) */}
              <path
                d="M300,120 L400,100 L420,180 L340,190 Z"
                fill={getRatingColor(3.8)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Kalimantan"
              >
                <title>Kalimantan: 3.8 ★</title>
              </path>
              <path
                d="M560,170 L600,160 L610,200 L580,210 Z"
                fill={getRatingColor(3.6)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Maluku"
              >
                <title>Maluku: 3.6 ★</title>
              </path>
              <path
                d="M620,150 L700,130 L710,200 L630,220 Z"
                fill={getRatingColor(3.4)}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer transition-opacity"
                data-region="Papua"
              >
                <title>Papua: 3.4 ★</title>
              </path>
            </g>

            {/* Legend */}
            <g transform="translate(30, 300)">
              <text x="0" y="0" className="text-xs font-medium">Rating Scale:</text>
              <rect x="0" y="10" width="20" height="10" fill="#22c55e" />
              <text x="25" y="19" className="text-xs">≥ 4.5</text>
              <rect x="60" y="10" width="20" height="10" fill="#4ade80" />
              <text x="85" y="19" className="text-xs">≥ 4.0</text>
              <rect x="120" y="10" width="20" height="10" fill="#a3e635" />
              <text x="145" y="19" className="text-xs">≥ 3.5</text>
              <rect x="180" y="10" width="20" height="10" fill="#facc15" />
              <text x="205" y="19" className="text-xs">≥ 3.0</text>
              <rect x="240" y="10" width="20" height="10" fill="#fb923c" />
              <text x="265" y="19" className="text-xs">≥ 2.5</text>
              <rect x="300" y="10" width="20" height="10" fill="#ef4444" />
              <text x="325" y="19" className="text-xs">< 2.5</text>
            </g>
          </svg>

          <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">
            *Hover over regions to see details
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
