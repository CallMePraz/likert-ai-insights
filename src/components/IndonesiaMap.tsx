import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Map region names to SVG regions (using Indonesian names as in DB)
const svgRegionMap = {
  Sumatra: [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Selatan",
    "Lampung",
    "Bengkulu",
    "Jambi",
    "Riau",
    "Kepulauan Riau",
    "Kepulauan Bangka Belitung"
  ],
  Java: [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Banten",
    "Yogyakarta"
  ],
  Bali: ["Bali"],
  "Nusa Tenggara": ["Nusa Tenggara Barat", "Nusa Tenggara Timur"],
  Kalimantan: [
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara"
  ],
  Sulawesi: [
    "Sulawesi Utara",
    "Sulawesi Tengah",
    "Sulawesi Selatan",
    "Gorontalo"
  ],
  Maluku: ["Maluku", "Maluku Utara"],
  Papua: ["Papua", "Papua Barat"],
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "#22c55e";
  if (rating >= 4.0) return "#4ade80";
  if (rating >= 3.5) return "#a3e635";
  if (rating >= 3.0) return "#facc15";
  if (rating >= 2.5) return "#fb923c";
  return "#ef4444";
};

export function IndonesiaMap() {
  // Province-based polling state
  const [provincePerformance, setProvincePerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [geoData, setGeoData] = useState<any>(null);

  // Poll averageperformance every 10 seconds
  useEffect(() => {
    let cancelled = false;
    const fetchPerformance = async () => {
      setError("");
      try {
        const res = await axios.get("/api/averageperformance");
        if (!cancelled) {
          setProvincePerformance(res.data);
        }
      } catch (e: any) {
        if (!cancelled) setError("Failed to load province performance");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Fetch GeoJSON once
  useEffect(() => {
    fetch("/src/components/indonesia-provinces.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch GeoJSON");
        return res.json();
      })
      .then((data) => setGeoData(data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    document.addEventListener('themeChange', handleThemeChange);
    return () => {
      document.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Helper: get value for a province
  const getProvinceValue = (provinceName: string) => {
    const found = provincePerformance.find(
      (item: any) => item.province?.toLowerCase() === provinceName?.toLowerCase()
    );
    return found ? found.value : null;
  };

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-lg h-full">
      <CardHeader className="pb-2">
        <CardTitle>Provincial Performance</CardTitle>
        <CardDescription>Real-time average performance by province</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative flex items-center justify-center">
          {loading ? (
            <div className="text-center py-8">Loading map...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 900, center: [120, -2] }}
                width={800}
                height={300}
                style={{ width: '100%', height: '100%' }}
                preserveAspectRatio="xMidYMid meet"
              >
                {geoData && (
                  <Geographies geography={geoData}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const province = geo.properties.Propinsi || geo.properties.province || geo.properties.name;
                        const value = getProvinceValue(province);
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={value !== null ? getRatingColor(value) : "#EEE"}
                            stroke={isDarkMode ? "#222" : "#fff"}
                            strokeWidth={0.5}
                            style={{ outline: "none" }}
                          />
                        );
                      })
                    }
                  </Geographies>
                )}
              </ComposableMap>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <svg width="100%" height="54" viewBox="0 0 600 54" style={{ maxWidth: 600 }}>
            <rect x="0" y="0" width="600" height="50" rx="14" style={{ fill: "var(--legend-bg)", stroke: "var(--legend-border)", fillOpacity: 0.97, strokeWidth: 1.5 }} />
            <text x="28" y="32" fontSize="18" fontWeight="bold" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 1 }}>Rating Scale:</text>
            <rect x="180" y="24" width="28" height="16" fill="#22c55e" stroke="#222" strokeWidth="0.5" rx="4" />
            <text x="215" y="38" fontSize="15" fontWeight="500" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif' }}>&#8805; 4.5</text>
            <rect x="265" y="24" width="28" height="16" fill="#4ade80" stroke="#222" strokeWidth="0.5" rx="4" />
            <text x="300" y="38" fontSize="15" fontWeight="500" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif' }}>&#8805; 4.0</text>
            <rect x="350" y="24" width="28" height="16" fill="#a3e635" stroke="#222" strokeWidth="0.5" rx="4" />
            <text x="385" y="38" fontSize="15" fontWeight="500" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif' }}>&#8805; 3.5</text>
            <rect x="435" y="24" width="28" height="16" fill="#facc15" stroke="#222" strokeWidth="0.5" rx="4" />
            <text x="470" y="38" fontSize="15" fontWeight="500" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif' }}>&#8805; 3.0</text>
            <rect x="520" y="24" width="28" height="16" fill="#fb923c" stroke="#222" strokeWidth="0.5" rx="4" />
            <text x="555" y="38" fontSize="15" fontWeight="500" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif' }}>&#8805; 2.5</text>
            <rect x="605" y="24" width="28" height="16" fill="#ef4444" stroke="#222" strokeWidth="0.5" rx="4" />
            <text x="640" y="38" fontSize="15" fontWeight="500" style={{ fill: "var(--legend-text)", fontFamily: 'Inter, Arial, sans-serif' }}>&lt; 2.5</text>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
