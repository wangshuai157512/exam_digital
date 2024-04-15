const eventHandler = function (el, value) {
  return function (e) {
    if (!el.contains(e.target) && typeof value === "function") {
      value();
    }
  };
};

const clickOutside = function (el, binding) {
  const value = binding.value;

  document.addEventListener("click", eventHandler(el, value));
};

const mounted = function (el, binding) {
  clickOutside(el, binding);
};

const beforeUnmount = function (el) {
  document.removeEventListener("click", eventHandler());
};

const qutsideDirective = {
  mounted,
  beforeUnmount
};

export const setupQutsideDirective = (app) => {
  app.directive("clickOutside", qutsideDirective);
};
