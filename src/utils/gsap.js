import gsap from "gsap";

/** css 动画
 * @param {String} nodeId 节点id
 * @param {Array} options 配置项数组
 */
export function animated(nodeId, options) {
  const t = gsap.timeline({ repeat: 5, yoyo: true });

  options.forEach((op) => {
    t.to(nodeId, {
      duration: 0.5,
      ease: "power1.inOut",
      ...op
    });
  });
  return t;
}
