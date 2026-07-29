import { CueId } from '@/types/ids';

export type AudioBusType = 'music' | 'ambience' | 'sfx' | 'voice';

export interface AudioManifestItem {
  id: CueId;
  src: string[];
  bus: AudioBusType;
  loop?: boolean;
  volume?: number;
  sprite?: Record<string, [number, number]>;
}

export const AUDIO_MANIFEST: Record<string, AudioManifestItem> = {
  'sfx.thread.snap': {
    id: 'sfx.thread.snap',
    src: ['/audio/sfx/thread_snap.mp3'],
    bus: 'sfx',
    volume: 0.7,
  },
  'sfx.sigil.cast': {
    id: 'sfx.sigil.cast',
    src: ['/audio/sfx/sigil_cast.mp3'],
    bus: 'sfx',
    volume: 0.8,
  },
  'sfx.sigil.fail': {
    id: 'sfx.sigil.fail',
    src: ['/audio/sfx/sigil_fail.mp3'],
    bus: 'sfx',
    volume: 0.5,
  },
  'sfx.interact': {
    id: 'sfx.interact',
    src: ['/audio/sfx/interact.mp3'],
    bus: 'sfx',
    volume: 0.6,
  },
  'sfx.secret': {
    id: 'sfx.secret',
    src: ['/audio/sfx/secret.mp3'],
    bus: 'sfx',
    volume: 0.8,
  },
  'music.garden_bed': {
    id: 'music.garden_bed',
    src: ['/audio/music/garden_bed.mp3'],
    bus: 'music',
    loop: true,
    volume: 0.5,
  },
  'ambience.garden': {
    id: 'ambience.garden',
    src: ['/audio/ambience/garden_wind.mp3'],
    bus: 'ambience',
    loop: true,
    volume: 0.4,
  },
};
