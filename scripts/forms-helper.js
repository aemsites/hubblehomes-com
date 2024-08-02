const formConfigurations = [];
/**
 * Checks if there are any form configurations.
 * @returns {boolean} True if there are form configurations, otherwise false.
 */
function hasForms() {
  return formConfigurations.length > 0;
}

function addFormConfiguration(formConfig) {
  formConfigurations.push(formConfig);
}

function buildForms(hbspt) {
  formConfigurations.forEach((formConfiguration) => {
    const config = {
      region: 'na1',
      portalId: '21555329',
      formId: formConfiguration.formId,
      target: `.hubspot-form#${formConfiguration.targetElementId}`,
    };
    hbspt.forms.create(config);
  });
}

export {
  hasForms,
  addFormConfiguration,
  buildForms,
};
