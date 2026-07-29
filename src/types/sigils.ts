import { SigilId } from './ids';

export interface Point2D {
  x: number;
  y: number;
}

export interface SigilTemplate {
  id: SigilId;
  name: string;
  description: string;
  svgPath: string; // SVG path string for ghost-assist rendering
  points: Point2D[]; // Normalized template points
}
