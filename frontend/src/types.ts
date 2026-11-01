export type AppId = 'home' | 'logbook' | 'dispatch' | 'tracker' | 'documents' | 'settings' | 'performance' | 'pushback' | 'taxi' | 'ground';
export interface WebApp { id: string; name: string; url: string; icon?: string }
export interface Settings {
  enabledApps: Record<string, boolean>;
  webApps: WebApp[];
}
export interface FlightPlan {
  originRunway?: string; destRunway?: string; originElevationFt?: number; destElevationFt?: number;
  origMetar?: string; destMetar?: string; estTow?: number; estLdw?: number;
  callsign: string;
  aircraftIcao: string;
  aircraftName: string;
  originIcao: string;
  originIata: string;
  originName: string;
  destIcao: string;
  destIata: string;
  destName: string;
  scheduledOutUtc?: string;
  scheduledInUtc?: string;
  blockFuel?: number;
  fuelUnits: string;
  routeDistanceNm?: number;
  cruiseAltitudeFt?: number;
  atcRoute?: string;
}
export interface OperationsBridge {
  navigate: (id: AppId) => void;
  openWebsite: (app: WebApp) => void;
}
export interface NavigationEvent { id: AppId | 'wizard' }
declare global {
  interface WindowEventMap {
    'realefb:navigate': CustomEvent<NavigationEvent>;
    'realefb:apps': CustomEvent<Settings>;
  }
}
