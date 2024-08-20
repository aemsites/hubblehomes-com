/* eslint-disable */
import { cleanupImageSrc } from './common.js';

const csvContent = []; // Array to hold CSV lines

export default {
  transformDOM: ({ document }) => {
    const main = document.body;
    console.log('Creating Mapping');
    debugger;

    main.querySelectorAll('.col-sm-9.sidebarbody .row').forEach((row) => {
      const imgElement = row.querySelector('a img');
      const parentAnchor = new URL(imgElement.closest('a').href).pathname;

      if (parentAnchor && imgElement) {
        const line = `${parentAnchor}, ${cleanupImageSrc(imgElement.src)}, ${imgElement.alt}\n`;
        csvContent.push(line);
      }
    });

    console.log(csvContent.join('')); // Output CSV content

    return main; // Assuming this function is part of a larger context
  },
};
