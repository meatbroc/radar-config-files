export async function fetchOrbats(inputLink) {
    const baseRegex = new RegExp('(\\([A-Z]{4}\\))', 'g');

    const fetchMainHTML = async (link) => {
        const response = await fetch(link);
        if (!response.ok) {
            throw new Error(`http status: ${response.status}`);
        }
        return response.text();
    };

    const extractLinks = (htmlText) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        const elements = tempDiv.getElementsByClassName('sdb-links');
        const elementsArray = Array.from(elements);
        let links = [];
        elementsArray.forEach((element) => {
            element.childNodes.forEach((childNode) => {
                childNode.childNodes.forEach((anchor) => {
                    links.push(anchor.href);
                });
            });
        });
        return links;
    };

    const fetchData = async (links) => {
        const promises = links.map((link) =>
            fetch(link)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`http status: ${response.status}`);
                    }
                    return response.text();
                })
                .then((text) => text.match(baseRegex))
        );
        return Promise.all(promises);
    };

    try {
        const mainHTML = await fetchMainHTML(inputLink);
        const links = extractLinks(mainHTML);

        const results = await fetchData(links);

        let unmerged = [];
        results.forEach((branch) => {
            if (branch) unmerged.push(...branch);
        });

        const mergedSet = new Set(unmerged);
        const mergedArr = Array.from(mergedSet).map((elem) =>
            elem.replace("(", "").replace(")", "")
        );

        return mergedArr;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
