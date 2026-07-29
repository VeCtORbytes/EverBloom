export type LoadTier = 'boot' | 'eager' | 'on-demand';

export interface AssetSpec {
  id: string;
  url: string;
  bytes: number;
  tier: LoadTier;
  encrypted?: boolean;
  sha?: string;
}

export interface AssetManifest {
  version: string;
  totalBytes: number;
  assets: Record<string, AssetSpec>;
}

export const DEFAULT_ASSET_MANIFEST: AssetManifest = {
  version: '1.0.0',
  totalBytes: 420000,
  assets: {
    'trail_glow_texture': {
      id: 'trail_glow_texture',
      url: '/textures/shared/trail_glow.png',
      bytes: 12400,
      tier: 'boot',
    },
    'garden_base_lut': {
      id: 'garden_base_lut',
      url: '/textures/luts/garden.png',
      bytes: 35000,
      tier: 'eager',
    },
    'school_background': {
      id: 'school_background',
      url: '/textures/school/school_bg.png',
      bytes: 120000,
      tier: 'on-demand',
    },
  },
};
