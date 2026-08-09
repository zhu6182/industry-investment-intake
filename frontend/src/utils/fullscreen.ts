/**
 * 全屏适配工具
 * 提供不同场景下的分辨率适配方案：
 * - PC 业务页: 使用 antd layout 响应式 + 全屏 100vh
 * - 移动端: 100dvh 适配 + viewport meta
 * - BI 大屏: 基于 1920x1080 设计稿的等比缩放
 */

export const BI_DESIGN_WIDTH = 1920;
export const BI_DESIGN_HEIGHT = 1080;

/**
 * BI 大屏缩放模式
 * - contain: 等比缩放保留比例，完整可见（可能有黑边）
 * - cover:   等比缩放撑满，裁剪溢出（无黑边）
 */
export type BiScaleMode = 'contain' | 'cover';

/**
 * 计算 BI 大屏缩放比例
 * @param mode 'contain' 完整保留比例 (默认) / 'cover' 撑满不留黑边
 */
export function calcBiScale(
  mode: BiScaleMode = 'contain',
): { scale: number } {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const sx = w / BI_DESIGN_WIDTH;
  const sy = h / BI_DESIGN_HEIGHT;
  const scale = mode === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);
  return { scale };
}

/**
 * 监听窗口尺寸变化
 */
export function watchResize(callback: () => void): () => void {
  let timer: number | null = null;
  const handler = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(callback, 100);
  };
  window.addEventListener('resize', handler);
  return () => {
    window.removeEventListener('resize', handler);
    if (timer) window.clearTimeout(timer);
  };
}

/**
 * 进入浏览器全屏 (F11 效果)
 */
export async function enterFullscreen(el?: HTMLElement): Promise<void> {
  const target = el || document.documentElement;
  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
    } else if ((target as any).webkitRequestFullscreen) {
      await (target as any).webkitRequestFullscreen();
    } else if ((target as any).msRequestFullscreen) {
      await (target as any).msRequestFullscreen();
    }
  } catch (e) {
    console.warn('Fullscreen not supported', e);
  }
}

/**
 * 退出浏览器全屏
 */
export async function exitFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if ((document as any).webkitFullscreenElement) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).msFullscreenElement) {
      await (document as any).msExitFullscreen();
    }
  } catch (e) {
    console.warn('Exit fullscreen failed', e);
  }
}

/**
 * 切换全屏状态
 */
export async function toggleFullscreen(el?: HTMLElement): Promise<boolean> {
  if (document.fullscreenElement) {
    await exitFullscreen();
    return false;
  }
  await enterFullscreen(el);
  return true;
}
