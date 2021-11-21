const { HeadingLevel } = require('docx');

const smartProcessing = {
    uniqueTitles: [],

    processTitle(node, level) {
        const isMainTitle = this.uniqueTitles.length === 0;

        let nodeText = node.content.text;
        const checkPotentialSubtitle = this.uniqueTitles.filter(title => nodeText.startsWith(title) && title !== nodeText)
            .sort((a, b) => a.length - b.length)
            .pop();

        if (checkPotentialSubtitle) {
            if (!this.uniqueTitles.includes(nodeText)) {
                this.uniqueTitles.push(nodeText);
            }

            nodeText = nodeText.replace(checkPotentialSubtitle, '').trim();
        }

        const titleAlreadyRegistered = this.uniqueTitles.some(title => title === nodeText);

        if (nodeText && !titleAlreadyRegistered) {
            this.uniqueTitles.push(nodeText);

            return {
                type: 'title',
                content: {
                    text: nodeText,
                    level: level || (isMainTitle ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2),
                },
            };
        }
    },

    processPlains(node) {
        const wordCount = node.content.text.split(/[.\t\n\s]+/).length;
        const bannedWords = ['sau', 'si', 'dar'];

        if (wordCount > 1 || bannedWords.includes(node.content.text.toLowerCase())) {
            // node text starts with a bullet
            if (/^[*\->→$]/.test(node.content.text)) {
                return {
                    type: 'listItem',
                    content: {
                        text: node.content.text.substr(1).trim(),
                        level: 0,
                        autoNum: 'bullet',
                    },
                };
            }

            return node;
        } else {
            return this.processTitle(node, HeadingLevel.HEADING_3);
        }
    },

    processListItem(node) {
        const { autoNum, level } = node.content;

        if (autoNum === 'no-bullet' && level === 0) {
            return this.processPlains(node);
        } else {
            return node;
        }
    },

    pushNodes(nodes = []) {
        let result = [];

        for (const node of nodes) {
            const isEmpty = Object.keys(node.content).length === 0;

            if (isEmpty) continue;

            switch (node.type) {
                case 'title':
                    result.push(this.processTitle(node));
                    break;
                case 'plain':
                    result.push(this.processPlains(node));
                    break;
                case 'listItem':
                    result.push(this.processListItem(node));
                    break;
                default:
                    result.push(node);
            }
        }

        result = result.filter(e => e);

        return result;
    },
};

module.exports = smartProcessing;
