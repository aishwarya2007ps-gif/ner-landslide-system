export type UserRole = 'super_admin' | 'state_authority' | 'district_authority' | 'field_worker' | 'citizen';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  assigned_state?: string;
  assigned_district?: string;
  is_active: boolean;
}

export type HazardType = 
  | 'landslide'
  | 'flash_flood'
  | 'heavy_rainfall'
  | 'river_level_rise'
  | 'road_blockage'
  | 'bridge_damage'
  | 'slope_failure'
  | 'earthquake'
  | 'extreme_weather'
  | 'infrastructure_damage';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'submitted' | 'under_review' | 'verified' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export interface Incident {
  id: string;
  client_id: string;
  hazard_type: HazardType;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  district: string;
  village?: string;
  affected_people: number;
  road_status: string;
  attachments: string[];
  reporter_id?: string;
  verification_notes?: string;
  assigned_team?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  alert_code: string;
  hazard_type: string;
  severity: 'warning' | 'high' | 'critical';
  title: string;
  warning_message: string;
  recommended_actions: string[];
  affected_district: string;
  status: 'draft' | 'published' | 'expired' | 'cancelled';
  valid_from: string;
  valid_to: string;
  channels: string[];
  created_at: string;
}

export interface Sensor {
  id: string;
  sensor_code: string;
  sensor_type: string;
  district: string;
  location_lat: number;
  location_lng: number;
  warning_threshold: number;
  critical_threshold: number;
  unit: string;
  status: 'online' | 'warning' | 'offline';
  last_reading_value?: number;
  last_reading_time?: string;
}

export interface CriticalFacility {
  id: string;
  name: string;
  facility_type: 'shelter' | 'hospital';
  district_name: string;
  capacity: number;
  contact_phone: string;
  latitude: number;
  longitude: number;
}

export interface RiskPrediction {
  district: string;
  hazard_type: string;
  risk_score: number;
  risk_category: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number;
  top_contributing_factors: { factor: string; contribution_pts: number }[];
  recommended_action: string;
  model_version: string;
  disclaimer: string;
  calculated_at: string;
}
