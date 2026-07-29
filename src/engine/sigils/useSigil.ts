import { useState, useCallback } from 'react';
import { SigilId } from '@/types/ids';
import { Point2D, SigilTemplate } from '@/types/sigils';
import { globalSigilController } from './SigilController';
import { RecognitionResult } from './recognizer';

export function useSigil() {
  const [assistActive, setAssistActive] = useState<boolean>(globalSigilController.isAssistActive());
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null);

  const evaluateGesture = useCallback((points: Point2D[], overrideTemplates?: SigilTemplate[]): RecognitionResult => {
    const result = globalSigilController.evaluateGesture(points, overrideTemplates);
    setLastResult(result);
    setAssistActive(globalSigilController.isAssistActive());
    return result;
  }, []);

  const castViaHold = useCallback((sigil: SigilId): boolean => {
    const success = globalSigilController.castViaHold(sigil);
    setAssistActive(globalSigilController.isAssistActive());
    return success;
  }, []);

  const acquireSigil = useCallback((sigil: SigilId) => {
    globalSigilController.acquireSigil(sigil);
  }, []);

  const setTargetSigil = useCallback((sigil: SigilId | null) => {
    globalSigilController.setTargetSigil(sigil);
    setAssistActive(globalSigilController.isAssistActive());
  }, []);

  const setHoldToCast = useCallback((enabled: boolean) => {
    globalSigilController.setHoldToCast(enabled);
  }, []);

  return {
    evaluateGesture,
    castViaHold,
    acquireSigil,
    setTargetSigil,
    setHoldToCast,
    isAcquired: (sigil: SigilId) => globalSigilController.isAcquired(sigil),
    holdToCastEnabled: globalSigilController.isHoldToCast(),
    assistActive,
    lastResult,
  };
}
