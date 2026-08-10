/**
 * 设备检测工具
 * 自动判断是手机还是 PC，用于路由跳转
 */

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'iphone', 'ipad', 'ipod', 'blackberry',
    'webos', 'mobile', 'windows phone', 'opera mini', 'iemobile',
  ];
  return mobileKeywords.some((k) => ua.includes(k)) || window.innerWidth < 768;
}

export function getPlatform(): 'pc' | 'mobile' {
  return isMobile() ? 'mobile' : 'pc';
}

/**
 * 将 PC 路径转为移动端路径
 * 例：/pc/intakes/new -> /mobile/intakes/new
 */
export function toMobilePath(pcPath: string): string {
  return pcPath.replace(/^\/pc(\/|$)/, '/mobile$1');
}

/**
 * 将移动端路径转为 PC 路径
 */
export function toPcPath(mobilePath: string): string {
  return mobilePath.replace(/^\/mobile(\/|$)/, '/pc$1');
}
