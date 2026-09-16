export type BoothType = 'inline' | 'corner' | 'peninsula' | 'island';

export type FlooringType = 'wood_oak' | 'wood_dark' | 'carpet_grey' | 'carpet_navy' | 'concrete_polished' | 'marble_white';

export interface BoothConfig {
  id: string;
  name: string;
  type: BoothType;
  width: number; // in meters (e.g. 3, 6, 9)
  depth: number; // in meters (e.g. 3, 6)
  wallHeight: number; // in meters (e.g. 2.5, 3.0, 3.5, 4.0)
  flooring: FlooringType;
  brandColor: string;
  secondaryColor: string;
  brandName: string;
  tagline: string;
  hasOverheadTruss: boolean;
  hasHangingBanner: boolean;
}

export type ItemCategory = 'reception' | 'multimedia' | 'meeting' | 'display' | 'structure' | 'decor';

export interface CatalogItemDefinition {
  type: string;
  name: string;
  category: ItemCategory;
  defaultWidth: number; // meters
  defaultDepth: number; // meters
  defaultHeight: number; // meters
  icon: string;
  color: string;
  description: string;
  powerWatts: number;
}

export interface PlacedBoothItem {
  id: string;
  type: string;
  name: string;
  category: ItemCategory;
  x: number; // meters relative to booth center (-width/2 to width/2)
  z: number; // meters relative to booth center (-depth/2 to depth/2)
  rotation: number; // degrees: 0, 45, 90, 180, 270
  width: number;
  depth: number;
  height: number;
  color?: string;
  powerWatts: number;
}

export interface ClientFeedback {
  id: string;
  author: string;
  role: 'Client' | 'Art Director' | 'Account Executive';
  avatar: string;
  time: string;
  message: string;
  status: 'pending' | 'resolved' | 'approved';
  targetItemName?: string;
}

export interface BoothSizePreset {
  id: string;
  name: string;
  badge: string;
  type: BoothType;
  width: number;
  depth: number;
  description: string;
  popularFor: string;
  defaultItems: Omit<PlacedBoothItem, 'id'>[];
}

export const CATALOG_ITEMS: CatalogItemDefinition[] = [
  // Reception
  {
    type: 'reception_counter',
    name: 'Straight Reception Desk',
    category: 'reception',
    defaultWidth: 1.8,
    defaultDepth: 0.7,
    defaultHeight: 1.1,
    icon: 'Store',
    color: '#3b82f6',
    description: 'Lockable storage with front branded LED acrylic face',
    powerWatts: 150
  },
  {
    type: 'curved_counter',
    name: 'Curved Welcome Counter',
    category: 'reception',
    defaultWidth: 2.2,
    defaultDepth: 0.9,
    defaultHeight: 1.1,
    icon: 'Sparkles',
    color: '#6366f1',
    description: 'Sculptural organic reception hub for greeting attendees',
    powerWatts: 200
  },
  // Multimedia
  {
    type: 'led_video_wall',
    name: 'Seamless LED Video Wall',
    category: 'multimedia',
    defaultWidth: 2.8,
    defaultDepth: 0.3,
    defaultHeight: 2.4,
    icon: 'Tv',
    color: '#8b5cf6',
    description: 'P2.6 ultra-high contrast video backdrop for reels and demos',
    powerWatts: 1200
  },
  {
    type: 'touch_kiosk',
    name: 'Interactive Touch Kiosk',
    category: 'multimedia',
    defaultWidth: 0.6,
    defaultDepth: 0.5,
    defaultHeight: 1.4,
    icon: 'Tablet',
    color: '#ec4899',
    description: '43" angled touch screen pedestal for self-guided software demos',
    powerWatts: 250
  },
  // Meeting & Lounge
  {
    type: 'lounge_seating',
    name: 'VIP Lounge Suite',
    category: 'meeting',
    defaultWidth: 2.2,
    defaultDepth: 1.8,
    defaultHeight: 0.8,
    icon: 'Armchair',
    color: '#10b981',
    description: 'Modern 2-seater designer sofa + coffee table + twin armchairs',
    powerWatts: 0
  },
  {
    type: 'meeting_table',
    name: 'Round Consultation Table',
    category: 'meeting',
    defaultWidth: 1.2,
    defaultDepth: 1.2,
    defaultHeight: 0.75,
    icon: 'Users',
    color: '#14b8a6',
    description: 'Round glass table with 3 ergonomic conference chairs',
    powerWatts: 0
  },
  {
    type: 'high_bar_table',
    name: 'High Bar Table & Stools',
    category: 'meeting',
    defaultWidth: 0.8,
    defaultDepth: 0.8,
    defaultHeight: 1.1,
    icon: 'Wine',
    color: '#06b6d4',
    description: 'Compact cocktail standing table with 2 upholstered stools',
    powerWatts: 0
  },
  // Display
  {
    type: 'product_podium',
    name: 'Illuminated Product Podium',
    category: 'display',
    defaultWidth: 0.6,
    defaultDepth: 0.6,
    defaultHeight: 1.0,
    icon: 'Box',
    color: '#f59e0b',
    description: 'Acrylic glass top with integrated base ring spotlight',
    powerWatts: 80
  },
  {
    type: 'shelving_rack',
    name: 'Illuminated Display Shelf',
    category: 'display',
    defaultWidth: 1.2,
    defaultDepth: 0.4,
    defaultHeight: 2.0,
    icon: 'Layers',
    color: '#f97316',
    description: 'Multi-tier brushed steel shelving with LED accent under-glow',
    powerWatts: 120
  },
  // Structure & Overhead
  {
    type: 'truss_arch',
    name: 'Modular Box Truss Arch',
    category: 'structure',
    defaultWidth: 3.0,
    defaultDepth: 0.4,
    defaultHeight: 3.2,
    icon: 'Boxes',
    color: '#64748b',
    description: 'Heavy duty aluminium quad truss arch for spot mounting',
    powerWatts: 400
  },
  {
    type: 'hanging_banner',
    name: 'Ceiling Rigging Cube Sign',
    category: 'structure',
    defaultWidth: 2.0,
    defaultDepth: 2.0,
    defaultHeight: 1.2,
    icon: 'Flag',
    color: '#f43f5e',
    description: 'Overhead 360° fabric sign visible from entire exhibition hall',
    powerWatts: 150
  },
  // Decor & Greenery
  {
    type: 'planter_greenery',
    name: 'Architectural Planter Divider',
    category: 'decor',
    defaultWidth: 1.2,
    defaultDepth: 0.35,
    defaultHeight: 1.1,
    icon: 'Trees',
    color: '#22c55e',
    description: 'Acoustic moss & live tropical foliage partition box',
    powerWatts: 0
  },
  {
    type: 'spotlight_rack',
    name: 'Adjustable LED Floodlight Tree',
    category: 'decor',
    defaultWidth: 0.4,
    defaultDepth: 0.4,
    defaultHeight: 2.4,
    icon: 'SunMedium',
    color: '#eab308',
    description: 'Twin high-CRI 4000K daylight spotlights for focal illumination',
    powerWatts: 200
  }
];

export const BOOTH_PRESETS: BoothSizePreset[] = [
  {
    id: 'standard-3x3',
    name: '3×3m Standard Inline',
    badge: '9 m² · Quick Pitch',
    type: 'inline',
    width: 3.0,
    depth: 3.0,
    description: '3 solid back and side walls. Ideal for startup launches, shell schemes, and direct client consults.',
    popularFor: 'FinTech, SaaS, BioTech',
    defaultItems: [
      {
        type: 'reception_counter',
        name: 'Straight Reception Desk',
        category: 'reception',
        x: 0,
        z: 0.7,
        rotation: 0,
        width: 1.6,
        depth: 0.6,
        height: 1.1,
        powerWatts: 150
      },
      {
        type: 'led_video_wall',
        name: 'Seamless LED Video Wall',
        category: 'multimedia',
        x: 0,
        z: -1.2,
        rotation: 0,
        width: 2.2,
        depth: 0.25,
        height: 2.2,
        powerWatts: 1000
      },
      {
        type: 'touch_kiosk',
        name: 'Interactive Touch Kiosk',
        category: 'multimedia',
        x: -0.9,
        z: -0.2,
        rotation: 45,
        width: 0.5,
        depth: 0.4,
        height: 1.3,
        powerWatts: 200
      },
      {
        type: 'planter_greenery',
        name: 'Architectural Planter Divider',
        category: 'decor',
        x: 1.0,
        z: -0.6,
        rotation: 90,
        width: 1.0,
        depth: 0.3,
        height: 1.0,
        powerWatts: 0
      }
    ]
  },
  {
    id: 'corner-6x3',
    name: '6×3m Corner Showcase',
    badge: '18 m² · Dual Aisle Access',
    type: 'corner',
    width: 6.0,
    depth: 3.0,
    description: 'Open on 2 intersecting aisles with prominent corner entry. High visibility from cross-hall traffic.',
    popularFor: 'Hardware, Automotive, Fashion',
    defaultItems: [
      {
        type: 'curved_counter',
        name: 'Curved Welcome Counter',
        category: 'reception',
        x: 1.6,
        z: 0.6,
        rotation: -25,
        width: 2.0,
        depth: 0.8,
        height: 1.1,
        powerWatts: 200
      },
      {
        type: 'led_video_wall',
        name: 'Seamless LED Video Wall',
        category: 'multimedia',
        x: -1.2,
        z: -1.2,
        rotation: 0,
        width: 2.8,
        depth: 0.3,
        height: 2.4,
        powerWatts: 1200
      },
      {
        type: 'lounge_seating',
        name: 'VIP Lounge Suite',
        category: 'meeting',
        x: -1.6,
        z: 0.5,
        rotation: 0,
        width: 2.0,
        depth: 1.6,
        height: 0.8,
        powerWatts: 0
      },
      {
        type: 'product_podium',
        name: 'Illuminated Product Podium',
        category: 'display',
        x: 0.6,
        z: -0.6,
        rotation: 0,
        width: 0.6,
        depth: 0.6,
        height: 1.0,
        powerWatts: 80
      },
      {
        type: 'spotlight_rack',
        name: 'Adjustable LED Floodlight Tree',
        category: 'decor',
        x: 2.5,
        z: -1.2,
        rotation: 0,
        width: 0.4,
        depth: 0.4,
        height: 2.4,
        powerWatts: 200
      }
    ]
  },
  {
    id: 'peninsula-6x6',
    name: '6×6m Peninsula Booth',
    badge: '36 m² · 3 Sides Open',
    type: 'peninsula',
    width: 6.0,
    depth: 6.0,
    description: 'Attached back wall with 3 open walking corridors. Unhindered visitor flow and commanding presence.',
    popularFor: 'Enterprise Tech, Cloud, AI Platforms',
    defaultItems: [
      {
        type: 'curved_counter',
        name: 'Curved Welcome Counter',
        category: 'reception',
        x: 0,
        z: 1.8,
        rotation: 0,
        width: 2.4,
        depth: 0.9,
        height: 1.1,
        powerWatts: 200
      },
      {
        type: 'led_video_wall',
        name: 'Seamless LED Video Wall',
        category: 'multimedia',
        x: 0,
        z: -2.7,
        rotation: 0,
        width: 4.2,
        depth: 0.3,
        height: 2.8,
        powerWatts: 1800
      },
      {
        type: 'lounge_seating',
        name: 'VIP Lounge Suite',
        category: 'meeting',
        x: -1.7,
        z: -0.2,
        rotation: 90,
        width: 2.2,
        depth: 1.8,
        height: 0.8,
        powerWatts: 0
      },
      {
        type: 'meeting_table',
        name: 'Round Consultation Table',
        category: 'meeting',
        x: 1.7,
        z: -0.2,
        rotation: 0,
        width: 1.2,
        depth: 1.2,
        height: 0.75,
        powerWatts: 0
      },
      {
        type: 'product_podium',
        name: 'Illuminated Product Podium',
        category: 'display',
        x: 1.8,
        z: 1.6,
        rotation: 0,
        width: 0.6,
        depth: 0.6,
        height: 1.0,
        powerWatts: 80
      },
      {
        type: 'hanging_banner',
        name: 'Ceiling Rigging Cube Sign',
        category: 'structure',
        x: 0,
        z: 0,
        rotation: 0,
        width: 2.4,
        depth: 2.4,
        height: 1.2,
        powerWatts: 150
      }
    ]
  },
  {
    id: 'island-8x6',
    name: '8×6m Flagship Island',
    badge: '48 m² · 360° Open Plaza',
    type: 'island',
    width: 8.0,
    depth: 6.0,
    description: 'All 4 sides open to hall thoroughfares. Central architectural truss centerpiece with complete freedom.',
    popularFor: 'Global Brands, Keynote Sponsors',
    defaultItems: [
      {
        type: 'truss_arch',
        name: 'Modular Box Truss Arch',
        category: 'structure',
        x: 0,
        z: 0,
        rotation: 0,
        width: 4.0,
        depth: 0.5,
        height: 3.4,
        powerWatts: 400
      },
      {
        type: 'curved_counter',
        name: 'Curved Welcome Counter',
        category: 'reception',
        x: 0,
        z: 2.0,
        rotation: 0,
        width: 2.4,
        depth: 0.9,
        height: 1.1,
        powerWatts: 200
      },
      {
        type: 'led_video_wall',
        name: 'Seamless LED Video Wall',
        category: 'multimedia',
        x: 0,
        z: 0,
        rotation: 0,
        width: 3.6,
        depth: 0.3,
        height: 2.5,
        powerWatts: 1600
      },
      {
        type: 'lounge_seating',
        name: 'VIP Lounge Suite',
        category: 'meeting',
        x: -2.6,
        z: 0,
        rotation: 90,
        width: 2.2,
        depth: 1.8,
        height: 0.8,
        powerWatts: 0
      },
      {
        type: 'high_bar_table',
        name: 'High Bar Table & Stools',
        category: 'meeting',
        x: 2.6,
        z: -1.2,
        rotation: 0,
        width: 0.8,
        depth: 0.8,
        height: 1.1,
        powerWatts: 0
      },
      {
        type: 'touch_kiosk',
        name: 'Interactive Touch Kiosk',
        category: 'multimedia',
        x: 2.5,
        z: 1.2,
        rotation: -45,
        width: 0.6,
        depth: 0.5,
        height: 1.4,
        powerWatts: 250
      },
      {
        type: 'planter_greenery',
        name: 'Architectural Planter Divider',
        category: 'decor',
        x: -2.6,
        z: -2.0,
        rotation: 0,
        width: 1.4,
        depth: 0.4,
        height: 1.0,
        powerWatts: 0
      },
      {
        type: 'hanging_banner',
        name: 'Ceiling Rigging Cube Sign',
        category: 'structure',
        x: 0,
        z: 0,
        rotation: 45,
        width: 3.0,
        depth: 3.0,
        height: 1.4,
        powerWatts: 200
      }
    ]
  }
];

export const INITIAL_BOOTH_CONFIG: BoothConfig = {
  id: 'current-booth',
  name: 'ES Dzign Research Pavilion',
  type: 'corner',
  width: 6.0,
  depth: 3.0,
  wallHeight: 3.0,
  flooring: 'wood_oak',
  brandColor: '#27272a', // Architectural Charcoal
  secondaryColor: '#4f46e5', // Indigo Accent
  brandName: 'ES Dzign Research',
  tagline: 'interior • architecture • design',
  hasOverheadTruss: true,
  hasHangingBanner: false,
};

export const INITIAL_FEEDBACK: ClientFeedback[] = [
  {
    id: 'fb-1',
    author: 'Elena Rostova',
    role: 'Client',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    time: '10 mins ago',
    message: 'Love the open aisle entrance! Could we ensure the LED video wall is visible from the main corridor entrance?',
    status: 'approved',
    targetItemName: 'Seamless LED Video Wall'
  },
  {
    id: 'fb-2',
    author: 'Marcus Vance',
    role: 'Account Executive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    time: '25 mins ago',
    message: 'We will have 2 product specialists on duty; let us verify the reception counter has enough leaflet storage underneath.',
    status: 'resolved',
    targetItemName: 'Curved Welcome Counter'
  }
];
