const htmlparser2 = require('htmlparser2');
const { getElementsByTagName } = require('domutils');
const { nodeTypeCheck, paragraphTypes, graphicsType } = require('./parsers');

const xml = {
    _computeNodeType(node, typeChecks) {
        for (const nodeType in typeChecks) {
            const content = typeChecks[nodeType](node);

            if (content) {
                if (Array.isArray(content)) {
                    return content.map(c => ({
                        type: nodeType,
                        content: c,
                    }));
                }

                return [{
                    type: nodeType,
                    content,
                }];
            }
        }
    },

    parseParagraphNode(node) {
        const nodes = this._computeNodeType(node, nodeTypeCheck);

        if (nodes) {
            return nodes;
        }

        // if no node type is determined, try applying a paragraph level filter
        const innerParagraphs = getElementsByTagName('a:p', node);
        let innerNodes = [];

        for (const innerP of innerParagraphs) {
            const pNodes = this._computeNodeType(innerP, paragraphTypes);

            if (pNodes && pNodes.length > 0) {
                innerNodes = innerNodes.concat(pNodes);
            }
        }

        return innerNodes;
    },

    parseGraphicNode(node) {
        const nodes = this._computeNodeType(node, graphicsType);

        if (nodes) {
            return nodes;
        }

        return [];
    },

    parse(xml) {
        const document = htmlparser2.parseDocument(xml);
        const [tree] = getElementsByTagName('p:sptree', document);

        let nodes = [];

        for (const child of tree.children) {
            if (child.name === 'p:sp') {
                nodes = nodes.concat(this.parseParagraphNode(child));
            } else if (child.name === 'p:graphicframe') {
                nodes = nodes.concat(this.parseGraphicNode(child));
            }
        }

        return nodes;
    },
};

module.exports = xml;
