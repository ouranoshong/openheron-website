/**
 * 入场动画触发器：元素露出 15% 时加 .is-in，动画播一次。
 *
 * 是否启用、以及 .js-enter 的添加，交给 <head> 里那段同步内联脚本：
 * 它必须在首次绘制之前跑完，否则元素会先以最终态出现、再突然隐藏、最后才播放动画。
 * 这里只负责观察与一次性触发，并标记「已接管」以取消引导脚本的兜底定时器。
 *
 * 没有 JS、减弱动效、窄屏（<751px）时都不会加 .js-enter，
 * 元素保持最终态，内容一个都不少。
 */

const root = document.documentElement;

if (root.classList.contains('js-enter') && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // 比视口还高的元素，intersectionRatio 永远到不了 0.15：
        // 这类只要开始相交就放行，避免整块内容一直藏着不出现。
        const tallerThanViewport = entry.boundingClientRect.height > window.innerHeight;
        if (entry.isIntersecting && (entry.intersectionRatio >= 0.15 || tallerThanViewport)) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: [0, 0.15] },
  );

  root.classList.add('js-enter-ready');
  for (const el of document.querySelectorAll<HTMLElement>('[data-enter]')) io.observe(el);
}
