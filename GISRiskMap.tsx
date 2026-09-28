import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { Filter, Layers, Navigation } from 'lucide-react';

// Leaflet marker icon configuration
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const GISRiskMap: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Layer Visibility Toggles
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  // Dynamic state from backend API
  const [shelters, setShelters] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [hazardAreas, setHazardAreas] = useState<any[]>([]);

  // Centered on North Eastern Region (Guwahati / Shillong / Gangtok region)
  const nerCenter: [number, number] = [26.2006, 92.9376];

  useEffect(() => {
    // 1. Fetch Shelters
    apiClient.get('/gis/shelters')
      .then(res => {
        if (res.data?.features) setShelters(res.data.features);
      })
      .catch(() => {});

    // 2. Fetch Hospitals
    apiClient.get('/gis/hospitals')
      .then(res => {
        if (res.data?.features) setHospitals(res.data.features);
      })
      .catch(() => {});

    // 3. Fetch Sensors
    apiClient.get('/sensors')
      .then(res => {
        if (Array.isArray(res.data)) setSensors(res.data);
      })
      .catch(() => {});

    // 4. Fetch Risk Polygons
    apiClient.get('/risk/areas')
      .then(res => {
        if (res.data?.areas) setHazardAreas(res.data.areas);
      })
      .catch(() => {
        // Fallback realistic zones
        setHazardAreas([
          {
            id: "NER-ZONE-01",
            name: "Guwahati Red Hill Escarpment",
            district: "Kamrup Metropolitan",
            risk_category: "Critical",
            hazard_type: "landslide",
            coordinates: [[26.18, 91.70], [26.22, 91.75], [26.19, 91.80], [26.15, 91.74]]
          },
          {
            id: "NER-ZONE-02",
            name: "Cherrapunji - Shella Ridge",
            district: "East Khasi Hills",
            risk_category: "High",
            hazard_type: "flash_flood",
            coordinates: [[25.25, 91.68], [25.32, 91.75], [25.28, 91.82], [25.20, 91.72]]
          },
          {
            id: "NER-ZONE-03",
            name: "NH-10 Teesta Valley Active Slide Corridor",
            district: "East Sikkim",
            risk_category: "Critical",
            hazard_type: "slope_failure",
            coordinates: [[27.30, 98.58], [27.35, 98.65], [27.32, 98.70], [27.28, 98.61]]
          }
        ]);
      });
  }, []);

  // Filtered Polygons
  const filteredHazards = hazardAreas.filter((h) => {
    const matchHazard = selectedHazard === 'all' || h.hazard_type === selectedHazard;
    const matchDistrict = selectedDistrict === 'all' || h.district === selectedDistrict;
    return matchHazard && matchDistrict;
  });

  // Evacuation Line Coordinates
  const evacuationRouteGuwahati: [number, number][] = [
    [26.144, 91.736], [26.120, 91.820], [26.110, 91.950]
  ];
  const evacuationRouteSikkim: [number, number][] = [
    [27.180, 98.530], [27.260, 98.590], [27.338, 98.613]
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-3">
      {/* GIS Controls Header */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-teal-400">
            <Layers className="w-4 h-4" />
            <span>GIS Multi-Hazard Layers</span>
          </div>

          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Hazard Layers</option>
            <option value="landslide">Landslides</option>
            <option value="flash_flood">Flash Floods</option>
            <option value="slope_failure">Slope Subsidence</option>
            <option value="river_level_rise">River Rise</option>
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All NER Districts</option>
            <option value="Kamrup Metropolitan">Kamrup Metro (Assam)</option>
            <option value="East Khasi Hills">East Khasi Hills (Meghalaya)</option>
            <option value="East Sikkim">East Sikkim (Sikkim)</option>
            <option value="Papum Pare">Papum Pare (Arunachal)</option>
            <option value="Aizawl">Aizawl (Mizoram)</option>
          </select>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-4 text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-teal-500"
            />
            <span>Shelters</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="accent-teal-500"
            />
            <span>Hospitals</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="accent-teal-500"
            />
            <span>IoT Sensors</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="accent-teal-500"
            />
            <span>Evacuation Lifelines</span>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        <MapContainer
          center={nerCenter}
          zoom={7}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Risk Polygons */}
          {filteredHazards.map((area) => {
            const isCritical = area.risk_category === 'Critical';
            const isHigh = area.risk_category === 'High';
            const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#eab308';

            return (
              <Polygon
                key={area.id}
                positions={area.coordinates}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.45,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-slate-900 p-1 text-xs">
                    <strong className="text-sm block">{area.name}</strong>
                    <div className="mt-1">District: <b>{area.district}</b></div>
                    <div>Hazard: <b>{area.hazard_type}</b></div>
                    <div className="mt-1">
                      Status: <span style={{ color: color, fontWeight: 'bold' }}>{area.risk_category} Risk</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 italic">
                      Prototype decision-support estimate zone
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Shelters */}
          {showShelters && shelters.map((s, idx) => (
            <CircleMarker
              key={`shelter-${idx}`}
              center={[s.geometry.coordinates[1], s.geometry.coordinates[0]]}
              radius={8}
              pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <div className="text-slate-900 p-1 text-xs">
                  <strong className="text-sky-700 block text-sm">{s.properties.name}</strong>
                  <div>District: {s.properties.district}</div>
                  <div>Capacity: <b>{s.properties.capacity} persons</b></div>
                  <div>Phone: <a href={`tel:${s.properties.contact_phone}`} className="text-blue-600 font-bold">{s.properties.contact_phone}</a></div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Hospitals */}
          {showHospitals && hospitals.map((h, idx) => (
            <CircleMarker
              key={`hospital-${idx}`}
              center={[h.geometry.coordinates[1], h.geometry.coordinates[0]]}
              radius={8}
              pathOptions={{ color: '#dc2626', fillColor: '#f87171', fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <div className="text-slate-900 p-1 text-xs">
                  <strong className="text-red-700 block text-sm">{h.properties.name}</strong>
                  <div>District: {h.properties.district}</div>
                  <div>Bed Capacity: <b>{h.properties.capacity} beds</b></div>
                  <div>Emergency Helpline: <a href={`tel:${h.properties.contact_phone}`} className="text-blue-600 font-bold">{h.properties.contact_phone}</a></div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* IoT Sensors */}
          {showSensors && sensors.map((s, idx) => (
            <CircleMarker
              key={`sensor-${idx}`}
              center={[s.location_lat, s.location_lng]}
              radius={6}
              pathOptions={{
                color: '#0f172a',
                fillColor: s.status === 'warning' ? '#f59e0b' : '#10b981',
                fillOpacity: 0.95,
                weight: 1.5
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1 text-xs">
                  <strong className="block font-bold">{s.sensor_code} ({s.sensor_type})</strong>
                  <div>District: {s.district}</div>
                  <div>Reading: <b>{s.last_reading_value} {s.unit}</b></div>
                  <div>Threshold: Warning {s.warning_threshold} / Critical {s.critical_threshold}</div>
                  <div>Status: <b className={s.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}>{s.status.toUpperCase()}</b></div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Evacuation Lifelines */}
          {showRoutes && (
            <>
              <Polyline
                positions={evacuationRouteGuwahati}
                pathOptions={{ color: '#14b8a6', weight: 4, dashArray: '6, 6' }}
              >
                <Popup>
                  <div className="text-slate-900 text-xs">
                    <strong>NH-27 Guwahati-Sonapur Evacuation Bypass</strong>
                    <p className="text-[10px] text-slate-600">Designated High-Capacity Evacuation Route</p>
                  </div>
                </Popup>
              </Polyline>

              <Polyline
                positions={evacuationRouteSikkim}
                pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '6, 6' }}
              >
                <Popup>
                  <div className="text-slate-900 text-xs">
                    <strong>NH-10 Rangpo to Gangtok Lifeline</strong>
                    <p className="text-[10px] text-slate-600">Caution: Active slide area, convoy only</p>
                  </div>
                </Popup>
              </Polyline>
            </>
          )}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shadow-2xl text-xs z-[1000] w-64 space-y-2">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>GIS Map Legend</span>
            <span className="text-[10px] text-slate-500 font-normal">WGS84 EPSG:4326</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-red-500 shrink-0"></span>
              <span>Critical Slope / Flood Zone (75-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-orange-500 shrink-0"></span>
              <span>High Risk Hazard Zone (50-74)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-400 border border-sky-600 shrink-0"></span>
              <span>Designated Emergency Shelter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-600 shrink-0"></span>
              <span>Hospital & Trauma Center</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>IoT Telemetry Station</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 border-t-2 border-dashed border-teal-400 shrink-0"></span>
              <span>Evacuation Lifeline Bypass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
