import { SigilId } from '@/types/ids';
import { Point2D, SigilTemplate } from '@/types/sigils';

export interface RecognitionResult {
  matchedId: SigilId | null;
  score: number;
  bestTemplate: SigilId | null;
  allScores: Record<string, number>;
}

export class UnistrokeRecognizer {
  public static readonly DEFAULT_N_POINTS: number = 64;
  public static readonly SQUARE_SIZE: number = 250;
  public static readonly SCORE_THRESHOLD: number = 0.75; // Generous over-accepting threshold

  /**
   * Main recognition entry point: matches candidate points against templates.
   */
  public recognize(
    candidatePoints: Point2D[],
    templates: SigilTemplate[],
    threshold: number = UnistrokeRecognizer.SCORE_THRESHOLD
  ): RecognitionResult {
    if (candidatePoints.length < 5) {
      return { matchedId: null, score: 0, bestTemplate: null, allScores: {} };
    }

    const processedCandidate = this.preprocess(candidatePoints);
    const candidateVector = this.vectorize(processedCandidate);

    let bestScore = -Infinity;
    let bestMatch: SigilId | null = null;
    const allScores: Record<string, number> = {};

    for (const template of templates) {
      const processedTemplate = this.preprocess(template.points);
      const templateVector = this.vectorize(processedTemplate);

      const distance = this.optimalCosineDistance(candidateVector, templateVector);
      const score = Math.max(0, 1 - distance);
      allScores[template.id] = score;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = template.id;
      }
    }

    const isMatch = bestScore >= threshold;
    return {
      matchedId: isMatch ? bestMatch : null,
      score: bestScore,
      bestTemplate: bestMatch,
      allScores,
    };
  }

  public preprocess(points: Point2D[], n: number = UnistrokeRecognizer.DEFAULT_N_POINTS): Point2D[] {
    let pts = this.resample(points, n);
    const radians = this.indicativeAngle(pts);
    pts = this.rotateBy(pts, -radians);
    pts = this.scaleTo(pts, UnistrokeRecognizer.SQUARE_SIZE);
    pts = this.translateTo(pts, { x: 0, y: 0 });
    return pts;
  }

  public resample(points: Point2D[], n: number): Point2D[] {
    const I = this.pathLength(points) / (n - 1);
    if (I === 0) return points;

    let D = 0;
    const newPoints: Point2D[] = [points[0]];

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (D + d >= I) {
        const qx = p1.x + ((I - D) / d) * (p2.x - p1.x);
        const qy = p1.y + ((I - D) / d) * (p2.y - p1.y);
        const q = { x: qx, y: qy };
        newPoints.push(q);
        points.splice(i, 0, q);
        D = 0;
      } else {
        D += d;
      }
    }

    while (newPoints.length < n) {
      newPoints.push(points[points.length - 1]);
    }
    return newPoints.slice(0, n);
  }

  public indicativeAngle(points: Point2D[]): number {
    const centroid = this.centroid(points);
    return Math.atan2(centroid.y - points[0].y, centroid.x - points[0].x);
  }

  public rotateBy(points: Point2D[], radians: number): Point2D[] {
    const centroid = this.centroid(points);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return points.map((p) => {
      const dx = p.x - centroid.x;
      const dy = p.y - centroid.y;
      return {
        x: dx * cos - dy * sin + centroid.x,
        y: dx * sin + dy * cos + centroid.y,
      };
    });
  }

  public scaleTo(points: Point2D[], size: number): Point2D[] {
    const bbox = this.boundingBox(points);
    const width = bbox.maxX - bbox.minX || 1;
    const height = bbox.maxY - bbox.minY || 1;
    return points.map((p) => ({
      x: (p.x * size) / width,
      y: (p.y * size) / height,
    }));
  }

  public translateTo(points: Point2D[], origin: Point2D): Point2D[] {
    const centroid = this.centroid(points);
    return points.map((p) => ({
      x: p.x - centroid.x + origin.x,
      y: p.y - centroid.y + origin.y,
    }));
  }

  public vectorize(points: Point2D[]): number[] {
    let sum = 0;
    const vector: number[] = [];

    for (const p of points) {
      vector.push(p.x, p.y);
      sum += p.x * p.x + p.y * p.y;
    }

    const magnitude = Math.sqrt(sum) || 1;
    return vector.map((val) => val / magnitude);
  }

  public optimalCosineDistance(v1: number[], v2: number[]): number {
    let a = 0;
    let b = 0;
    const count = Math.min(v1.length, v2.length);

    for (let i = 0; i < count; i += 2) {
      a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
      b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
    }

    const angle = Math.atan2(b, a);
    return Math.acos(Math.max(-1, Math.min(1, a * Math.cos(angle) + b * Math.sin(angle))));
  }

  public centroid(points: Point2D[]): Point2D {
    let x = 0;
    let y = 0;
    for (const p of points) {
      x += p.x;
      y += p.y;
    }
    return { x: x / points.length, y: y / points.length };
  }

  public pathLength(points: Point2D[]): number {
    let d = 0;
    for (let i = 1; i < points.length; i++) {
      d += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return d;
  }

  public boundingBox(points: Point2D[]): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    return { minX, maxX, minY, maxY };
  }
}

export const globalRecognizer = new UnistrokeRecognizer();
