export interface EmergencyContact {
  id: string;
  service: string;
  category: 'police' | 'medical' | 'fire' | 'women_child' | 'disaster' | 'municipal';
  number: string;
  description: string;
  availableHours: string;
  isNationalNumber?: boolean;
}

export interface GovernmentOffice {
  id: string;
  name: string;
  department: string;
  category: 'municipal' | 'collectorate' | 'public_works' | 'utilities' | 'panchayat' | 'other';
  address: string;
  phone: string;
  email?: string;
  workingHours: string;
  websiteUrl?: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
}

export interface CityFacility {
  id: string;
  name: string;
  category: 'hospital' | 'police' | 'fire' | 'municipal' | 'government' | 'transit';
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
}

export interface PublicService {
  id: string;
  serviceName: string;
  description: string;
  responsibleAuthority: string;
  contactNumber: string;
  contactEmail?: string;
  complaintPortalUrl?: string;
  statutorySla?: string;
  category: 'water' | 'electricity' | 'sanitation' | 'roads' | 'certificates' | 'tax' | 'transit';
}

export interface Representative {
  id: string;
  designation: string;
  name: string;
  jurisdiction: string;
  officeAddress: string;
  officeContact: string;
  email?: string;
  isVerified: boolean;
  verificationNote: string;
}

export interface LocalAnnouncement {
  id: string;
  title: string;
  summary: string;
  publishedDate: string;
  lastUpdatedDate: string;
  sourceName: string;
  sourceUrl: string;
  isVerified: boolean;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  district: string;
  governingBodyType: 'Municipal Corporation' | 'Municipal Council' | 'Village Panchayat';
  governingBodyName: string;
  coordinates: {
    lat: number;
    lng: number;
    defaultZoom: number;
  };
  overview: string;
  emergencyContacts: EmergencyContact[];
  governmentOffices: GovernmentOffice[];
  facilities: CityFacility[];
  publicServices: PublicService[];
  representatives: Representative[];
  announcements: LocalAnnouncement[];
  officialPortals: {
    title: string;
    description: string;
    url: string;
  }[];
  lastVerifiedDate: string;
}

export interface CitySummary {
  id: string;
  name: string;
  state: string;
  district: string;
  governingBodyName: string;
}

