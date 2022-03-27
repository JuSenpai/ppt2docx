const { HeadingLevel } = require('docx');

const levels = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
};

const titleRegex = /^%title\s?(?<level>h[1-3])?%/i;

const smartProcessing = {
    uniqueTitles: [],

    processTitle(node, level, allowDuplicateTitle = false) {
        const isMainTitle = this.uniqueTitles.length === 0;

        let nodeText = node.content.text;

        if (!allowDuplicateTitle) {
            const checkPotentialSubtitle = this.uniqueTitles.filter(title => nodeText.startsWith(title) && title !== nodeText)
                .sort((a, b) => a.length - b.length)
                .pop();

            if (checkPotentialSubtitle) {
                if (!this.uniqueTitles.includes(nodeText)) {
                    this.uniqueTitles.push(nodeText);
                }

                const nodeTextWithoutSubtitle = nodeText.replace(checkPotentialSubtitle, '').trim();

                nodeText = checkPotentialSubtitle + ' → ' + nodeTextWithoutSubtitle;
                nodeText = nodeText.trim().replace(/\s+/g, ' ');
            }
        }

        const titleAlreadyRegistered = allowDuplicateTitle ? false : this.uniqueTitles.some(title => title === nodeText);

        if (nodeText && !titleAlreadyRegistered) {
            if (!allowDuplicateTitle) {
                this.uniqueTitles.push(nodeText);
            }

            return {
                type: 'title',
                content: {
                    text: nodeText,
                    level: level || (isMainTitle ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2),
                },
            };
        }
    },

    processCustomTitle(node) {
        const match = node.content.text.match(titleRegex);
        const level = match.groups.level;

        node.content.text = node.content.text.replace(match[0], '').trim();

        return this.processTitle(node, levels[level] || levels.h3, true);
    },

    processPlains(node) {
        const wordCount = node.content.text.split(/[.\t\n\s]+/).length;
        const bannedWords = ['sau', 'si', 'dar'];

        if (wordCount > 1 || bannedWords.includes(node.content.text.toLowerCase())) {
            if (titleRegex.test(node.content.text)) {
                return this.processCustomTitle(node);
            }

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
        if (titleRegex.test(node.content.text)) {
            return this.processCustomTitle(node);
        }

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
