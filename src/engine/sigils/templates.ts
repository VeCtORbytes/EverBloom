import { SigilId } from '@/types/ids';
import { Point2D, SigilTemplate } from '@/types/sigils';

export type { Point2D, SigilTemplate };

const registeredTemplates: Map<SigilId, SigilTemplate> = new Map();

export function registerSigilTemplate(template: SigilTemplate): void {
  registeredTemplates.set(template.id, template);
}

export function registerSigilTemplates(templates: SigilTemplate[]): void {
  templates.forEach((t) => registeredTemplates.set(t.id, t));
}

export function getRegisteredSigilTemplate(id: SigilId): SigilTemplate | undefined {
  return registeredTemplates.get(id);
}

export function getRegisteredSigilTemplates(): SigilTemplate[] {
  return Array.from(registeredTemplates.values());
}
