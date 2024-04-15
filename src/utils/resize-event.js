import ResizeObserver from "resize-observer-polyfill";

export const addResizeListener = function (element, fn) {
  if (!fn.name) return console.error("请定义函数名");
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = {};
    element.__obs__ = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const listeners = entry.target.__resizeListeners__ || {};
        Object.keys(listeners).forEach((key) => {
          listeners[key]();
        });
      }
    });
    element.__obs__.observe(element);
  }
  if (element.__resizeListeners__[fn.name])
    console.warn(`覆盖函数名:${fn.name}`);
  element.__resizeListeners__[fn.name] = fn;
};

export const removeResizeListener = function (element, fn) {
  if (!fn.name) return console.error("请定义函数名");
  if (!element.__resizeListeners__) return;
  delete element.__resizeListeners__[fn.name];
  if (Object.keys(element.__resizeListeners__).length === 0) {
    element.__obs__.disconnect();
    delete element.__resizeListeners__;
  }
};
