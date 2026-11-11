/**
 * 入场动画触发器：元素露出 15% 时加 .is-in，动画播一次。
 *
 * 带 data-enter-late 的元素改等露出 60% 再放行：
 * 页尾这类「滚到底就是终点」的区块，若在视口下沿就开始擦出，
 * 用户滚到位时看到的还是半截。
 *
 * 两条兜底，跟阈值无关：
 *   - 整块滚到视口上方了 —— 一次快速滑动可能整个跳过触发窗口，
 *     那块内容不能永远藏着；
 *   - 比视口还高的元素 —— intersectionRatio 永远到不了阈值，
 *     只要开始相交就放行。
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
        const rect = entry.boundingClientRect;
        const late = entry.target.hasAttribute('data-enter-late');

        // 兜底一：整块已经滚到视口上方，用户不会再看到它 —— 直接放行。
        const scrolledPast = rect.bottom < 0;

        // 兜底二：比视口还高的元素，intersectionRatio 永远到不了阈值。
        const tallerThanViewport = rect.height > window.innerHeight;

        // 晚触发等露出 60%；已经从顶部开始离开视口时也算 ——
        // 不然用户正看着它，它还半透明着。
        const enough = late
          ? entry.intersectionRatio >= 0.6 || rect.top < 0
          : entry.intersectionRatio >= 0.15;

        if (scrolledPast || (entry.isIntersecting && (tallerThanViewport || enough))) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: [0, 0.15, 0.6] },
  );

  root.classList.add('js-enter-ready');
  for (const el of document.querySelectorAll<HTMLElement>('[data-enter]')) io.observe(el);
}
