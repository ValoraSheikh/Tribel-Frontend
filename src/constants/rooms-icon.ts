import {
  AirVentIcon,
  ArchiveIcon,
  BathIcon,
  BedDoubleIcon,
  BedSingleIcon,
  BlindsIcon,
  DropletsIcon,
  FanIcon,
  FlameIcon,
  LampDeskIcon,
  LockIcon,
  Plug2Icon,
  RockingChairIcon,
  TableIcon,
  VolumeXIcon,
} from "lucide-react";

const roomFeatures = [
  // --- Bed & Sleeping ---
  { name: "Single Bed", icon: "BedSingle", IconComponent: BedSingleIcon },
  { name: "Double Bed", icon: "BedDouble", IconComponent: BedDoubleIcon },
  // { name: "Bunk Bed", icon: "BedBunk", IconComponent: BedBunkIcon },

  // --- Storage & Furniture ---
  { name: "Personal Locker", icon: "Lock", IconComponent: LockIcon },
  { name: "Wardrobe", icon: "Archive", IconComponent: ArchiveIcon },
  { name: "Study Table", icon: "Table", IconComponent: TableIcon },
  { name: "Chair", icon: "Chair", IconComponent: RockingChairIcon },

  // --- Climate & Comfort ---
  { name: "Air Conditioning", icon: "AirVent", IconComponent: AirVentIcon },
  { name: "Fan", icon: "Fan", IconComponent: FanIcon },
  { name: "Heater", icon: "Flame", IconComponent: FlameIcon },

  // --- Bathroom ---
  { name: "Attached Bathroom", icon: "Bath", IconComponent: BathIcon },
  { name: "Hot Water", icon: "Droplets", IconComponent: DropletsIcon },

  // --- Power & Lighting ---
  { name: "Power Socket", icon: "Plug", IconComponent: Plug2Icon },
  { name: "Bedside Lamp", icon: "LampDesk", IconComponent: LampDeskIcon },

  // --- Privacy / Extras ---
  { name: "Curtains", icon: "Blinds", IconComponent: BlindsIcon },
  { name: "Soundproofing", icon: "VolumeX", IconComponent: VolumeXIcon },
] as const;

export default roomFeatures;
