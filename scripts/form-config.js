export const formConfig = {
  '/contact-us': { minHeight: 1170 },
  '/warranty': { minHeight: 960 },
  default: { minHeight: 800 },
};

export function getFormConfig(path) {
  const matchingConfig = Object.entries(formConfig).find(([key]) => path.startsWith(key));
  return matchingConfig ? matchingConfig[1] : formConfig.default;
}
