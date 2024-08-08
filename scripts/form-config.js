export const formConfig = {
  '/contact-us': { minHeight: 1130 },
  '/warranty': { minHeight: 920 },
  default: { minHeight: 800 },
};

export function getFormConfig(path) {
  const matchingConfig = Object.entries(formConfig).find(([key]) => path.startsWith(key));
  return matchingConfig ? matchingConfig[1] : formConfig.default;
}
