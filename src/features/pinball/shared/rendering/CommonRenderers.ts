/**
 * 공통 렌더링 함수들
 * 모든 뷰에서 일관된 렌더링을 위한 공통 함수
 */

import { ObjectStyles, GradientStop } from './ObjectStyles';

/**
 * 그라데이션 생성 헬퍼
 */
export function createGradient(
  ctx: CanvasRenderingContext2D,
  type: 'radial' | 'linear',
  params: any,
  stops: readonly GradientStop[]
): CanvasGradient {
  let gradient: CanvasGradient;

  if (type === 'radial') {
    gradient = ctx.createRadialGradient(
      params.x0, params.y0, params.r0,
      params.x1, params.y1, params.r1
    );
  } else {
    gradient = ctx.createLinearGradient(
      params.x0, params.y0,
      params.x1, params.y1
    );
  }

  stops.forEach(stop => {
    gradient.addColorStop(stop.offset, stop.color);
  });

  return gradient;
}

/**
 * 별 모양 그리기
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  points: number = 5,
  innerRadiusRatio: number = 0.4
): void {
  const innerRadius = outerRadius * innerRadiusRatio;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

/**
 * Bounce Circle 렌더링
 */
export function renderBounceCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  bounceAnimation?: number
): void {
  const style = ObjectStyles.jumpPad;

  ctx.save();

  if (bounceAnimation !== undefined) {
    const phase = bounceAnimation * Math.PI * 2;
    const scale = 1 + Math.sin(phase) * 0.2;

    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
  }

  // 흰색 배경 + 빨간 별 스타일
  // 배경 원
  const bgGradient = createGradient(ctx, 'radial', {
    x0: x - radius * 0.3, y0: y - radius * 0.3, r0: 0,
    x1: x, y1: y, r1: radius
  }, style.background.gradient);

  ctx.fillStyle = bgGradient;
  ctx.strokeStyle = style.background.strokeColor;
  ctx.lineWidth = style.background.strokeWidth;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 중앙 별
  const starGradient = createGradient(ctx, 'radial', {
    x0: x, y0: y, r0: 0,
    x1: x, y1: y, r1: radius * style.star.sizeRatio
  }, style.star.gradient);

  ctx.fillStyle = starGradient;
  drawStar(
    ctx,
    x, y,
    radius * style.star.sizeRatio,
    style.star.points,
    style.star.innerRadiusRatio
  );
  ctx.fill();

  // 하이라이트
  ctx.globalAlpha = style.highlight.opacity;
  const highlightGradient = createGradient(ctx, 'radial', {
    x0: x + radius * style.highlight.offsetRatio,
    y0: y + radius * style.highlight.offsetRatio,
    r0: 0,
    x1: x + radius * style.highlight.offsetRatio,
    y1: y + radius * style.highlight.offsetRatio,
    r1: radius * style.highlight.sizeRatio
  }, style.highlight.gradient);

  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.arc(
    x + radius * style.highlight.offsetRatio,
    y + radius * style.highlight.offsetRatio,
    radius * style.highlight.sizeRatio,
    0, Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

/**
 * Jump Pad (Rectangle) 렌더링
 */
export function renderJumpPad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const style = ObjectStyles.jumpPad;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // 흰색 배경에 빨간 테두리
  ctx.fillStyle = style.background.gradient[0].color;
  ctx.strokeStyle = style.background.strokeColor;
  ctx.lineWidth = style.background.strokeWidth;

  ctx.fillRect(x - halfWidth, y - halfHeight, width, height);
  ctx.strokeRect(x - halfWidth, y - halfHeight, width, height);

  // 중앙에 별
  ctx.fillStyle = style.star.gradient[1].color;
  const starSize = Math.min(halfWidth, halfHeight) * style.star.sizeRatio;
  drawStar(ctx, x, y, starSize, style.star.points, style.star.innerRadiusRatio);
  ctx.fill();
}

/**
 * Bubble 렌더링
 */
export function renderBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  popped: boolean = false,
  popAnimation: number = 0
): void {
  const style = ObjectStyles.bubble;

  if (popped) {
    // 팝 애니메이션
    const scale = 1 + popAnimation * (style.popAnimation.maxScale - 1);
    const alpha = 1 - popAnimation;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  } else {
    // 일반 상태
    const gradient = createGradient(ctx, 'radial', {
      x0: x, y0: y, r0: 0,
      x1: x, y1: y, r1: radius
    }, style.gradient);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;

    // 그림자 효과 - 기존 shadow 설정이 있으면 유지, 없으면 기본 스타일 적용
    if (!ctx.shadowBlur || ctx.shadowColor === 'rgba(0, 0, 0, 0)' || ctx.shadowColor === 'transparent') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = style.glowColor;
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/**
 * Rotating Bar 렌더링
 */
export function renderRotatingBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  thickness: number,
  angle: number
): void {
  const style = ObjectStyles.rotatingBar;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 그림자 효과 - 기존 shadow 설정이 있으면 유지, 없으면 기본 스타일 적용
  if (!ctx.shadowBlur || ctx.shadowColor === 'rgba(0, 0, 0, 0)' || ctx.shadowColor === 'transparent') {
    ctx.shadowBlur = style.shadowBlur;
    ctx.shadowColor = style.shadowColor;
  }

  // 막대 그리기
  ctx.fillStyle = style.fillColor;
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;

  ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
  ctx.strokeRect(-length / 2, -thickness / 2, length, thickness);

  // 중심점 표시
  ctx.beginPath();
  ctx.arc(0, 0, thickness / 2, 0, Math.PI * 2);
  ctx.fillStyle = style.strokeColor;
  ctx.fill();

  ctx.restore();
}

/**
 * Wall 렌더링
 */
export function renderWall(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  const style = ObjectStyles.wall;

  ctx.save();
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.shadowBlur = style.shadowBlur;
  ctx.shadowColor = style.shadowColor;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Finish Line 렌더링
 */
export function renderFinishLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const style = ObjectStyles.finishLine;
  const squareSize = style.squareSize;
  const cols = Math.ceil(width / squareSize);
  const rows = Math.ceil(height / squareSize);

  ctx.save();
  ctx.globalAlpha = style.opacity;

  // 체커보드 패턴
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.fillStyle = style.colors[(i + j) % 2];
      ctx.fillRect(
        x + j * squareSize,
        y + i * squareSize,
        squareSize,
        squareSize
      );
    }
  }

  // 테두리
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.strokeRect(x, y, width, height);

  ctx.restore();
}

/**
 * 미니맵용 간소화된 렌더링 함수들
 */
export const MinimapRenderers = {
  bounceCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.save();

    const originalLineWidth = ObjectStyles.jumpPad.background.strokeWidth;
    (ObjectStyles.jumpPad.background as any).strokeWidth = Math.max(0.5, radius * 0.05);

    renderBounceCircle(ctx, x, y, radius);

    (ObjectStyles.jumpPad.background as any).strokeWidth = originalLineWidth;

    ctx.restore();
  },

  jumpPad(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.save();

    ctx.fillStyle = ObjectStyles.jumpPad.background.gradient[0].color;
    ctx.strokeStyle = ObjectStyles.jumpPad.background.strokeColor;
    ctx.lineWidth = Math.max(0.5, width * 0.02);

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    ctx.fillRect(x - halfWidth, y - halfHeight, width, height);
    ctx.strokeRect(x - halfWidth, y - halfHeight, width, height);

    ctx.fillStyle = ObjectStyles.jumpPad.star.gradient[1].color;
    const starSize = Math.min(halfWidth, halfHeight) * 0.5;
    drawStar(ctx, x, y, starSize, 5);
    ctx.fill();

    ctx.restore();
  },

  bubble(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    // 미니맵에서도 메인 화면과 동일한 렌더링 사용 (단순화 버전)
    ctx.save();

    // 미니맵용 간소화된 버전 - 그라데이션 대신 단색으로 표시하되 동일한 색상 사용
    ctx.fillStyle = ObjectStyles.bubble.gradient[1].color; // 분홍색
    ctx.strokeStyle = ObjectStyles.bubble.strokeColor;
    ctx.lineWidth = Math.max(0.5, radius * 0.05);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  rotatingBar(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, angle: number): void {
    // 미니맵에서도 메인 화면과 동일한 색상 사용 (간소화 버전)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 동일한 색상 사용
    ctx.fillStyle = ObjectStyles.rotatingBar.fillColor;
    ctx.strokeStyle = ObjectStyles.rotatingBar.strokeColor;
    ctx.lineWidth = Math.max(0.5, length * 0.02);

    ctx.fillRect(-length / 2, -2, length, 4);
    ctx.strokeRect(-length / 2, -2, length, 4);

    ctx.restore();
  },

  wall(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    ctx.strokeStyle = ObjectStyles.wall.strokeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
};