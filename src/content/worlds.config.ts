import { WorldConfig } from './schema/world.schema';

export const WORLDS_CONFIG: Record<string, WorldConfig> = {
  prologue: {
    id: 'prologue',
    prerequisites: [],
    softTargetSeconds: 180,
    grade: 'lut_prologue',
    audio: {
      bed: 'music.garden_bed',
      layers: [],
      ambience: 'ambience.garden',
    },
    assetBundle: 'boot',
    memories: [],
    collectibles: [],
  },
  garden: {
    id: 'garden',
    prerequisites: ['prologue'],
    softTargetSeconds: 120,
    grade: 'lut_garden',
    audio: {
      bed: 'music.garden_bed',
      layers: ['stem_guitar', 'stem_strings'],
      ambience: 'ambience.garden',
    },
    assetBundle: 'eager',
    memories: [],
    collectibles: ['mushroom_secret'],
  },
  school: {
    id: 'school',
    prerequisites: ['prologue'],
    softTargetSeconds: 330,
    grade: 'lut_school',
    audio: {
      bed: 'music.garden_bed',
      layers: ['stem_celeste'],
      ambience: 'ambience.garden',
    },
    assetBundle: 'school_bundle',
    memories: ['school_primary_01', 'school_secret_01', 'school_secret_02', 'school_secret_03'],
    collectibles: ['window_bird', 'desk_initials'],
  },
  steeping: {
    id: 'steeping',
    prerequisites: ['school'],
    softTargetSeconds: 390,
    grade: 'lut_steeping',
    audio: {
      bed: 'music.garden_bed',
      layers: ['stem_bassoon', 'stem_marimba'],
      ambience: 'ambience.garden',
    },
    assetBundle: 'steeping_bundle',
    memories: ['steeping_primary_01', 'steeping_secret_01', 'steeping_secret_02', 'steeping_secret_03'],
    collectibles: ['rat_ingredient'],
  },
  stillwater: {
    id: 'stillwater',
    prerequisites: ['school'],
    softTargetSeconds: 300,
    grade: 'lut_stillwater',
    audio: {
      bed: 'music.garden_bed',
      layers: ['stem_piano'],
      ambience: 'ambience.garden',
    },
    assetBundle: 'stillwater_bundle',
    memories: ['stillwater_primary_01', 'stillwater_secret_01', 'stillwater_secret_02', 'stillwater_secret_03'],
    collectibles: ['stillness_mote'],
  },
};
