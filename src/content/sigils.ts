import { SigilId } from '@/types/ids';
import { Point2D, SigilTemplate } from '@/types/sigils';

// Generate spiral points for Kindle
function generateKindleSpiral(): Point2D[] {
  const points: Point2D[] = [];
  const totalPoints = 64;
  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * 3 * Math.PI; // 1.5 turns
    const radius = 20 + (i / totalPoints) * 100;
    points.push({
      x: 125 + radius * Math.cos(angle),
      y: 125 + radius * Math.sin(angle),
    });
  }
  return points;
}

// Generate angular Z points for Unbind
function generateUnbindZ(): Point2D[] {
  const points: Point2D[] = [];
  // Segment 1: top horizontal (left to right)
  for (let i = 0; i <= 20; i++) {
    points.push({ x: 25 + (i / 20) * 200, y: 25 });
  }
  // Segment 2: diagonal down-left
  for (let i = 1; i <= 22; i++) {
    points.push({ x: 225 - (i / 22) * 200, y: 25 + (i / 22) * 200 });
  }
  // Segment 3: bottom horizontal (left to right)
  for (let i = 1; i <= 21; i++) {
    points.push({ x: 25 + (i / 21) * 200, y: 225 });
  }
  return points;
}

// Generate hook points for Beckon
function generateBeckonHook(): Point2D[] {
  const points: Point2D[] = [];
  // Top arc (semicircle)
  for (let i = 0; i <= 32; i++) {
    const angle = Math.PI + (i / 32) * Math.PI;
    points.push({
      x: 125 + 75 * Math.cos(angle),
      y: 100 + 75 * Math.sin(angle),
    });
  }
  // Down stem
  for (let i = 1; i <= 31; i++) {
    points.push({ x: 200, y: 100 + (i / 31) * 125 });
  }
  return points;
}

// Generate closed loop points for Echo
function generateEchoLoop(): Point2D[] {
  const points: Point2D[] = [];
  const totalPoints = 64;
  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * 2 * Math.PI;
    points.push({
      x: 125 + 90 * Math.cos(angle),
      y: 125 + 90 * Math.sin(angle),
    });
  }
  return points;
}

export const SIGIL_TEMPLATES: Record<SigilId, SigilTemplate> = {
  kindle: {
    id: 'kindle',
    name: 'Kindle',
    description: 'Reveal, light, and warm surrounding objects.',
    svgPath: 'M 145 125 A 20 20 0 0 1 125 145 A 40 40 0 0 1 85 125 A 60 60 0 0 1 125 65 A 80 80 0 0 1 205 125',
    points: generateKindleSpiral(),
  },
  unbind: {
    id: 'unbind',
    name: 'Unbind',
    description: 'Open, unlock, and release bound ribbons.',
    svgPath: 'M 25 25 L 225 25 L 25 225 L 225 225',
    points: generateUnbindZ(),
  },
  beckon: {
    id: 'beckon',
    name: 'Beckon',
    description: 'Pull, gather, and retrieve distant objects.',
    svgPath: 'M 50 100 A 75 75 0 0 1 200 100 L 200 225',
    points: generateBeckonHook(),
  },
  echo: {
    id: 'echo',
    name: 'Echo',
    description: 'Manifest a living shape from memory.',
    svgPath: 'M 215 125 A 90 90 0 1 1 214.99 125 Z',
    points: generateEchoLoop(),
  },
};
