export enum DrmType {
  WIDEVINE = 'Widevine',
  FAIRPLAY = 'FairPlay',
}

export interface SubtitleRes {
  subtitleUrl: string;
  languageCode: string;
  type: string;
  subtitleType: string;
}
