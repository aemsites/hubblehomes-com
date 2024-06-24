const createDisclaimerFragment = (document, main) => {
    const cells = [['Fragment (disclaimer)'], ['https://main--hubblehomes-com--aemsites.hlx.live/fragments/disclaimer']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
}

const createLinksBlock = (document, main) => {
    const linksContainer = document.querySelector('.detaillinks');
    if (linksContainer) {
        const links = Array.from(linksContainer.querySelectorAll('a'))
            .map((link) => link.outerHTML)
            .join('<br>');

        const cells = [['Links'], [links]];

        const table = WebImporter.DOMUtils.createTable(cells, document);
        main.append(table);
    }
};

const createDescriptionBlock = (document, main) => {
    const descriptionContainer = document.querySelector('.col-sm-6.col-xs-6');

    descriptionContainer?.querySelector('h1')?.remove();
    descriptionContainer?.querySelector('h4')?.remove();
    descriptionContainer?.querySelectorAll('.row')?.forEach(el => el.remove());

    const descriptionText = descriptionContainer?.innerHTML.trim();

    const cells = [['Description'], [descriptionText]];

    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
};

const createOverviewBlock = (document, main) => {
    const overviewElement = document.querySelector('#overview');
    const overviewCategories = Array.from(overviewElement.querySelectorAll('dt'))
        .map((el) => el.textContent.trim().toLowerCase())
        .join(', ');
    const tabContent = `${overviewCategories}`;

    const cells = [['Overview'], [tabContent]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
};

const createActionButtonBlock = (document, main) => {
    // Select all elements matching '.row > .col-sm-12.text-center'
    const buttonsRows = document.querySelectorAll('.row > .col-sm-12.text-center');

    let tableAppended = false; // Flag to track if table was appended

    // Iterate over each matching element
    buttonsRows.forEach(buttonsRow => {
        // Check if a table has already been appended
        if (tableAppended) return;

        // Check if all children are <br>, <a>, or whitespace text nodes
        const isValidChild = (child) => {
            // Ignore text nodes containing only whitespace
            if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) return true;
            // Check for <br> or <a> elements
            return ['BR', 'A'].includes(child.tagName);
        };

        // Validate children of current buttonsRow
        if (Array.from(buttonsRow.childNodes).every(isValidChild)) {
            // Extract and format anchor elements
            const linksHtml = Array.from(buttonsRow.children)
                .filter((child) => child.tagName === 'A') // Filter out <a> elements
                .map((link) => `<div>${link.outerHTML}</div>`) // Wrap each <a> in <div>
                .join(''); // Join all <div> elements into a single string

            // Create table structure
            const cells = [['Action Buttons'], [linksHtml]]; // Define table cells
            const table = WebImporter.DOMUtils.createTable(cells, document); // Create table element

            // Append table to the 'main' element
            main.append(table);

            tableAppended = true; // Set flag to true indicating table was appended
        }
    });
};

const createFloorplanTabsBlock = (document, main) => {
    const floorplanContainer = document.querySelector('.responsive-tabs');
    if (floorplanContainer) {
        const cells = [['Tabs (floorplan)']];

        // Floorplan levels
        const levels = floorplanContainer.querySelectorAll('h4');
        levels.forEach((level) => {
            const img = level.nextElementSibling.querySelector('img');
            if (img) {
                cells.push([
                    `${level.textContent}`,
                    `<img src="${img.src}" alt="${img.alt}">`,
                ]);
            }
        });

        const table = WebImporter.DOMUtils.createTable(cells, document);
        main.append(table); // Replace the original floorplan section with the new table
    }
};

const createEmbedBlock = (document, main) => {
    const matterportIframe = document.querySelector(
        '.embed-responsive-item[src*="matterport.com"]',
    );
    const matterportSrc = matterportIframe?.src;
    if (matterportIframe) {
        const cells = [['Embed (matterport)']];
        cells.push(['URL', matterportSrc]);

        const table = WebImporter.DOMUtils.createTable(cells, document);
        const container = matterportIframe.closest('.container.topbuffer');
        if (container) {
            main.append(table);
        }
    }
};

export {
    createDisclaimerFragment,
    createLinksBlock,
    createDescriptionBlock,
    createOverviewBlock,
    createActionButtonBlock,
    createFloorplanTabsBlock,
    createEmbedBlock
}