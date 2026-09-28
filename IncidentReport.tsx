import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/dexieDb';
import { apiClient } from '../api/client';
import { HazardType, IncidentSeverity } from '../types';
import { 
  FileText, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw 
} from 'lucide-react';

interface IncidentReportProps {
  isOnline: boolean;
  onReportSaved: () => void;
}

export const IncidentReport: React.FC<IncidentReportProps> = ({ isOnline, onReportSaved }) => {
  const [hazardType, setHazardType] = useState<HazardType>('landslide');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [village, setVillage] = useState('');
  const [latitude, setLatitude] = useState<number>(26.1445);
  const [longitude, setLongitude] = useState<number>(91.7362);
  const [affectedPeople, setAffectedPeople] = useState<number>(0);
  const [roadStatus, setRoadStatus] = useState<string>('partially_blocked');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'offline'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capture Live GPS from Browser Device
  const fetchDeviceGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setFeedback({ type: 'success', message: 'Live GPS Coordinates fetched successfully from device.' });
        },
        () => {
          setFeedback({ type: 'offline', message: 'GPS location unavailable. Retained default regional coordinates.' });
        }
      );
    }
  };

  // Convert File to Base64 for IndexedDB safe storage
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const clientId = `offline-${uuidv4()}`;
    const reportData = {
      clientId,
      hazardType,
      title,
      description,
      severity,
      latitude,
      longitude,
      district,
      village,
      affectedPeople,
      roadStatus,
      attachments: photoPreview ? [photoPreview] : [],
      syncStatus: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Always save to Dexie IndexedDB first (guarantees zero data loss)
      await db.incidents.add(reportData);

      // 2. If online, upload to backend API immediately
      if (isOnline) {
        try {
          await apiClient.post('/incidents', {
            client_id: clientId,
            hazard_type: hazardType,
            title,
            description,
            severity,
            latitude,
            longitude,
            district,
            village,
            affected_people: affectedPeople,
            road_status: roadStatus,
            attachments: photoPreview ? [photoPreview] : []
          });
          setFeedback({
            type: 'success',
            message: 'Incident reported and uploaded directly to the Regional Command Center!'
          });
        } catch (apiErr) {
          // If network failed mid-flight, update IndexedDB to pending
          await db.incidents.update(clientId, { syncStatus: 'pending' });
          setFeedback({
            type: 'offline',
            message: 'Network connection dropped during upload. Report safely preserved in IndexedDB queue.'
          });
        }
      } else {
        setFeedback({
          type: 'offline',
          message: 'Saved to local IndexedDB storage (Offline Mode). Will synchronize automatically once connection returns.'
        });
      }

      // Reset form fields
      setTitle('');
      setDescription('');
      setPhotoPreview(null);
      onReportSaved();
    } catch (err: any) {
      setFeedback({ type: 'offline', message: `Local save error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              Field Incident Emergency Report
            </h2>
            <p className="text-xs text-slate-400">
              Offline-first field tool for scouts, volunteers, and citizens across NER
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isOnline 
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
              : 'bg-amber-950/80 text-amber-300 border-amber-800'
          }`}>
            {isOnline ? '● Online (Auto-Upload)' : '○ Offline Storage Active'}
          </span>
        </div>

        {feedback && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold mb-4 border flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-amber-950/80 text-amber-300 border-amber-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Hazard Category</label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as HazardType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
              >
                <option value="landslide">Landslide / Rockfall</option>
                <option value="flash_flood">Flash Flood</option>
                <option value="heavy_rainfall">Heavy Rainfall / Cloudburst</option>
                <option value="river_level_rise">River Level Rise / Overwash</option>
                <option value="road_blockage">Road / Highway Blockage</option>
                <option value="bridge_damage">Bridge Structural Damage</option>
                <option value="slope_failure">Slope Subsidence / Cracking</option>
                <option value="earthquake">Earthquake Tremor Damage</option>
                <option value="extreme_weather">Extreme Weather / Storm</option>
                <option value="infrastructure_damage">Infrastructure Damage</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Severity Assessment</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
              >
                <option value="critical">Critical (Immediate danger to lives / settlements)</option>
                <option value="high">High (Major road severed / significant damage)</option>
                <option value="medium">Medium (Partial disruption / single lane blocked)</option>
                <option value="low">Low (Minor debris / watchful status)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Incident Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Major debris slip choking NH-27 near Sonapur"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Detailed Description & Field Evidence</label>
            <textarea
              required
              rows={3}
              placeholder="Describe debris volume, water velocity, trapped vehicles, houses threatened..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Village / Landmark</label>
              <input
                type="text"
                placeholder="e.g., Milepost 14 near bridge"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Road / Transit Status</label>
              <select
                value={roadStatus}
                onChange={(e) => setRoadStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="passable">Passable (Normal)</option>
                <option value="partially_blocked">Partially Blocked (Single Lane)</option>
                <option value="blocked">Completely Blocked</option>
                <option value="destroyed">Destroyed / Washed Away</option>
              </select>
            </div>
          </div>

          {/* GPS Coordinates Section */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-slate-400">Recorded GPS Position:</span>
              <span className="font-mono text-teal-300 font-bold ml-2">
                {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
              </span>
            </div>
            <button
              type="button"
              onClick={fetchDeviceGPS}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Fetch Device GPS</span>
            </button>
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Attach Field Photo (Persisted in offline queue)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-700 file:text-white hover:file:bg-teal-600"
            />
            {photoPreview && (
              <div className="mt-2 relative w-32 h-24 rounded-lg overflow-hidden border border-slate-700">
                <img src={photoPreview} alt="Field preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Submit Incident Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
