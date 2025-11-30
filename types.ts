export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  TRANSCRIBING = 'TRANSCRIBING',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ProcessingState {
  status: AppStatus;
  message: string;
  progress: number;
}

export interface DubResult {
  originalText: string;
  translatedText: string;
  audioUrl: string;
}

export enum VoiceOption {
  KORE = 'Kore',
  PUCK = 'Puck', 
  CHARON = 'Charon',
  FENRIR = 'Fenrir',
  ZEPHYR = 'Zephyr'
}