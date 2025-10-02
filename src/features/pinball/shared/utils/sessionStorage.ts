/**
 * 세션 스토리지 유틸리티
 * 게임 설정을 세션 동안 유지
 */

export class SessionStorageUtil {
  /**
   * 값을 세션 스토리지에 저장
   * Next.js SSR 호환: 브라우저 환경에서만 실행
   */
  static save<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save to sessionStorage:`, error);
    }
  }

  /**
   * 세션 스토리지에서 값 로드
   * Next.js SSR 호환: 서버 환경에서는 null 반환
   */
  static load<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to load from sessionStorage:`, error);
      return null;
    }
  }

  /**
   * 세션 스토리지에서 키 제거
   * Next.js SSR 호환: 브라우저 환경에서만 실행
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from sessionStorage:`, error);
    }
  }

  /**
   * 세션 스토리지 키 존재 여부 확인
   * Next.js SSR 호환: 서버 환경에서는 false 반환
   */
  static exists(key: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return sessionStorage.getItem(key) !== null;
  }
}

// 게임 설정 키 상수들
export const STORAGE_KEYS = {
  PARTICIPANTS: 'pinball_participants',
  SELECTED_MAP: 'pinball_selected_map',
  GAME_SETTINGS: 'pinball_game_settings',
} as const;