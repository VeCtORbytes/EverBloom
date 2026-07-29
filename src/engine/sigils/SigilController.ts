import { SigilId } from '@/types/ids';
import { Point2D, SigilTemplate } from '@/types/sigils';
import { getRegisteredSigilTemplates, getRegisteredSigilTemplate } from './templates';
import { globalRecognizer, RecognitionResult } from './recognizer';
import { globalEventBus } from '@/engine/core/eventBus';

export class SigilController {
  private acquiredSigils: Set<SigilId> = new Set(['kindle']);
  private failureCounts: Map<SigilId, number> = new Map();
  private targetSigil: SigilId | null = null;
  private holdToCastEnabled: boolean = false;
  private assistActive: boolean = false;

  public setAcquiredSigils(sigils: SigilId[]): void {
    this.acquiredSigils = new Set(sigils);
  }

  public acquireSigil(sigil: SigilId): void {
    this.acquiredSigils.add(sigil);
    globalEventBus.emit('sigilAcquired', { sigilId: sigil });
  }

  public isAcquired(sigil: SigilId): boolean {
    return this.acquiredSigils.has(sigil);
  }

  public setTargetSigil(sigil: SigilId | null): void {
    this.targetSigil = sigil;
    this.assistActive = false;
  }

  public setHoldToCast(enabled: boolean): void {
    this.holdToCastEnabled = enabled;
  }

  public isHoldToCast(): boolean {
    return this.holdToCastEnabled;
  }

  public isAssistActive(): boolean {
    return this.assistActive;
  }

  /**
   * Evaluates user drawn gesture points against active acquired templates.
   */
  public evaluateGesture(points: Point2D[], overrideTemplates?: SigilTemplate[]): RecognitionResult {
    const templates = overrideTemplates || getRegisteredSigilTemplates();
    const activeTemplates = templates.filter((t) => this.acquiredSigils.has(t.id));

    const result = globalRecognizer.recognize(points, activeTemplates);

    if (result.matchedId) {
      if (this.targetSigil) {
        this.failureCounts.set(this.targetSigil, 0);
      }
      this.assistActive = false;
      globalEventBus.emit('sigilCast', { sigilId: result.matchedId, score: result.score });
    } else {
      if (this.targetSigil) {
        const currentFailures = (this.failureCounts.get(this.targetSigil) || 0) + 1;
        this.failureCounts.set(this.targetSigil, currentFailures);

        if (currentFailures >= 3) {
          this.assistActive = true;
        }

        globalEventBus.emit('sigilFailed', {
          sigilId: this.targetSigil,
          attempts: currentFailures,
        });
      } else {
        globalEventBus.emit('sigilFailed', { attempts: 1 });
      }
    }

    return result;
  }

  /**
   * Cast sigil directly via holdToCast accessibility shortcut.
   */
  public castViaHold(sigil: SigilId): boolean {
    if (!this.acquiredSigils.has(sigil)) {
      globalEventBus.emit('sigilFailed', { sigilId: sigil, attempts: 1 });
      return false;
    }

    globalEventBus.emit('sigilCast', { sigilId: sigil, score: 1.0 });
    return true;
  }

  public getTargetTemplate(): SigilTemplate | undefined {
    return this.targetSigil ? getRegisteredSigilTemplate(this.targetSigil) : undefined;
  }

  public getFailureCount(sigil: SigilId): number {
    return this.failureCounts.get(sigil) || 0;
  }

  public resetFailures(sigil?: SigilId): void {
    if (sigil) {
      this.failureCounts.set(sigil, 0);
    } else {
      this.failureCounts.clear();
    }
    this.assistActive = false;
  }
}

export const globalSigilController = new SigilController();
