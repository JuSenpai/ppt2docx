const htmlparser2 = require('htmlparser2');
const { getElementsByTagName, innerText, getAttributeValue } = require('domutils');

const nodeTypeCheck = {
    title: p => {
        const [pph] = getElementsByTagName('p:ph', p);

        if (!pph) {
            return false;
        }

        if (getAttributeValue(pph, 'type') !== 'title') {
            return false;
        }

        return innerText(p);
    },
    listItem: p => {
        const [avLst] = getElementsByTagName('a:avlst', p);

        if (!avLst) {
            return false;
        }

        const listItems = getElementsByTagName('a:p', p);

        return listItems.map(el => innerText(el));
    },
};

const xml = {
    parse(xml) {
        const document = htmlparser2.parseDocument(xml);
        const paragraphs = getElementsByTagName('p:sp', document);

        const nodes = paragraphs.map(p => {
            for (const nodeType in nodeTypeCheck) {
                const content = nodeTypeCheck[nodeType](p);

                if (content) {
                    return {
                        type: nodeType,
                        content,
                    };
                }
            }
        });

        console.log(nodes);

        return nodes;
    },
};

module.exports = xml;
