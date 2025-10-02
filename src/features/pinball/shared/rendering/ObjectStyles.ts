/**
 * 통합 오브젝트 스타일 정의
 * 게임, 에디터, 미니맵에서 공통으로 사용하는 모든 오브젝트 스타일
 */

export interface GradientStop {
  offset: number;
  color: string;
}

export interface ObjectStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  gradient?: GradientStop[];
  glowColor?: string;
  pattern?: string;
}

/**
 * 모든 오브젝트의 통합 스타일 정의
 */
export const ObjectStyles = {
  // 벽 스타일
  wall: {
    strokeColor: '#00ff00',
    glowColor: 'rgba(0, 255, 0, 0.5)',
    strokeWidth: 3,
    shadowBlur: 10,
    shadowColor: '#00ff00'
  },

  // 버블 스타일
  bubble: {
    gradient: [
      { offset: 0, color: '#ff69b4' },
      { offset: 1, color: '#ff1493' }
    ],
    strokeColor: '#ff1493',
    strokeWidth: 2,
    glowColor: 'rgba(255, 20, 147, 0.3)',
    popAnimation: {
      maxScale: 1.5,
      fadeSpeed: 0.05
    }
  },

  // 회전 막대 스타일
  rotatingBar: {
    fillColor: '#4169e1',
    strokeColor: '#1e90ff',
    strokeWidth: 2,
    glowColor: 'rgba(30, 144, 255, 0.5)',
    shadowBlur: 5,
    shadowColor: '#1e90ff'
  },

  // Jump Pad 스타일 (개선된 디자인)
  jumpPad: {
    // 배경 원
    background: {
      gradient: [
        { offset: 0, color: '#ffffff' },
        { offset: 0.7, color: '#ffeeee' },
        { offset: 1, color: '#ffcccc' }
      ],
      strokeColor: '#ff0000',
      strokeWidth: 3
    },
    // 중앙 별
    star: {
      gradient: [
        { offset: 0, color: '#ff6666' },
        { offset: 0.5, color: '#ff0000' },
        { offset: 1, color: '#cc0000' }
      ],
      points: 5,
      sizeRatio: 0.6, // radius 대비 비율
      innerRadiusRatio: 0.4 // 별 내부 반경 비율
    },
    // 하이라이트 효과
    highlight: {
      gradient: [
        { offset: 0, color: '#ffffff' },
        { offset: 1, color: 'transparent' }
      ],
      opacity: 0.4,
      offsetRatio: -0.3, // radius 대비 오프셋
      sizeRatio: 0.5
    },
    // legacy 스타일 제거 - 모든 곳에서 새로운 스타일 사용
  },

  // 결승선 스타일
  finishLine: {
    pattern: 'checkered',
    colors: ['#000000', '#ffffff'],
    squareSize: 10,
    opacity: 0,  // 투명하게 설정 (보이지 않음)
    strokeColor: '#ffd700',
    strokeWidth: 3
  },

  // 구슬 스타일
  marble: {
    strokeWidth: 2,
    glowIntensity: 0.5,
    trail: {
      enabled: true,
      maxLength: 5,
      fadeSpeed: 0.1
    }
  },

  // 에디터 전용 스타일
  editor: {
    // 선택된 오브젝트
    selected: {
      strokeColor: '#00ffff',
      strokeWidth: 2,
      dashPattern: [5, 3]
    },
    // 핸들
    handle: {
      size: 8,
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 1
    },
    // 그리드
    grid: {
      color: 'rgba(128, 128, 128, 0.2)',
      majorColor: 'rgba(128, 128, 128, 0.4)',
      size: 20,
      majorInterval: 5
    },
    // 스냅 가이드
    snapGuide: {
      color: '#00ffff',
      width: 1,
      dashPattern: [2, 2]
    }
  }
} as const;

/**
 * 색상 유틸리티 함수들
 */
export const ColorUtils = {
  /**
   * hex 색상에 알파값 추가
   */
  addAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },

  /**
   * 색상 밝기 조정
   */
  adjustBrightness(color: string, factor: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = Math.min(255, Math.floor(parseInt(hex.slice(0, 2), 16) * factor));
      const g = Math.min(255, Math.floor(parseInt(hex.slice(2, 4), 16) * factor));
      const b = Math.min(255, Math.floor(parseInt(hex.slice(4, 6), 16) * factor));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
  }
};