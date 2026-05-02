// Project content
export interface ProjectMeta {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  featured: boolean;
  date: string;
}

// Contact form
export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

// Plywood optimizer
export interface Sheet {
  width: number;
  height: number;
  unit: 'mm' | 'in';
}

export interface Piece {
  width: number;
  height: number;
  quantity: number;
  label: string;
}

export interface Placement {
  piece: Piece;
  x: number;
  y: number;
  rotated: boolean;
}

export interface CutLayout {
  sheet: Sheet;
  placements: Placement[];
  wastePercent: number;
  error?: string;
}

// TNutz Order Builder — mirrors order_data.py schema
export type EndMachining =
  | 'No machining'
  | '1/4-20 x 1" deep tap'
  | 'Access Hole - Style "C", thru "R"'
  | 'Access Hole - Style "C", thru "S"'
  | 'Access Holes - Style "C", thru "R" & "S"'
  | 'Access Hole - Style "C", thru "T"';

export type FractionValue =
  | '' | '1/16' | '1/8' | '3/16' | '1/4' | '5/16' | '3/8' | '7/16'
  | '1/2' | '9/16' | '5/8' | '11/16' | '3/4' | '13/16' | '7/8' | '15/16';

export interface ExtrusionOrder {
  sku: 'ex-1010' | 'ex-1020';
  length: string;
  fraction: FractionValue;
  qty: number;
  end1: EndMachining;
  end2: EndMachining;
}

export interface HardwareOrder {
  sku: string | null;
  qty: number;
  label: string;
  selects?: Record<string, string>;
  needs_review?: string;
}

export interface TnutzOrderList {
  extrusions: ExtrusionOrder[];
  hardware: HardwareOrder[];
}

// SEO
export interface PageMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}
