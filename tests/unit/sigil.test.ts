import { describe, it, expect, beforeEach } from 'vitest';
import { globalRecognizer } from '@/engine/sigils/recognizer';
import { globalSigilController } from '@/engine/sigils/SigilController';
import { SIGIL_TEMPLATES } from '@/content/sigils';

describe('Sigil System ($1 Recognizer & Controller)', () => {
  beforeEach(() => {
    globalSigilController.setAcquiredSigils(['kindle', 'unbind', 'beckon', 'echo']);
    globalSigilController.resetFailures();
    globalSigilController.setHoldToCast(false);
  });

  it('recognizes Kindle (spiral) stroke with score >= 0.75', () => {
    const templatePoints = SIGIL_TEMPLATES.kindle.points;
    const result = globalRecognizer.recognize(templatePoints, Object.values(SIGIL_TEMPLATES));

    expect(result.matchedId).toBe('kindle');
    expect(result.score).toBeGreaterThanOrEqual(0.75);
  });

  it('recognizes Unbind (angular Z) stroke with score >= 0.75', () => {
    const templatePoints = SIGIL_TEMPLATES.unbind.points;
    const result = globalRecognizer.recognize(templatePoints, Object.values(SIGIL_TEMPLATES));

    expect(result.matchedId).toBe('unbind');
    expect(result.score).toBeGreaterThanOrEqual(0.75);
  });

  it('prevents cross-confusion across distinct sigil topologies', () => {
    const spiralPoints = SIGIL_TEMPLATES.kindle.points;
    const result = globalRecognizer.recognize(spiralPoints, Object.values(SIGIL_TEMPLATES));

    expect(result.matchedId).toBe('kindle');
    expect(result.allScores['unbind']).toBeLessThan(0.75);
  });

  it('activates ghost-path assist after 3 consecutive failures', () => {
    globalSigilController.setTargetSigil('unbind');
    expect(globalSigilController.isAssistActive()).toBe(false);

    const invalidStroke = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 40, y: 0 },
      { x: 50, y: 0 },
    ];

    globalSigilController.evaluateGesture(invalidStroke, Object.values(SIGIL_TEMPLATES));
    expect(globalSigilController.isAssistActive()).toBe(false);

    globalSigilController.evaluateGesture(invalidStroke, Object.values(SIGIL_TEMPLATES));
    expect(globalSigilController.isAssistActive()).toBe(false);

    globalSigilController.evaluateGesture(invalidStroke, Object.values(SIGIL_TEMPLATES));
    expect(globalSigilController.isAssistActive()).toBe(true);
  });

  it('allows casting via holdToCast accessibility shortcut', () => {
    expect(globalSigilController.castViaHold('beckon')).toBe(true);
    globalSigilController.setAcquiredSigils(['kindle']);
    expect(globalSigilController.castViaHold('echo')).toBe(false);
  });
});
