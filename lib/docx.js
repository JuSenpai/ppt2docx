const { Document, Packer, AlignmentType, convertInchesToTwip, Paragraph, TextRun, Footer, PageNumber } = require('docx');
const { promises: fs } = require('fs');
const { docxSections } = require('./parsers');

const createLevels = (levelsCount, config) => {
    const levels = [];

    for (let level = 0; level <= levelsCount; level++) {
        let levelConfig = config;

        if (typeof config === 'function') {
            levelConfig = config(level);
        }

        const { left = .25 } = levelConfig;

        levels.push({
            level,
            ...levelConfig,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip((level + 1) * left), hanging: convertInchesToTwip(.18) }
                },
            },
        });
    }

    return levels;
};

const docx = {
    sections: [],

    appendNodes(nodes = []) {
        const sections = nodes.map(node => docxSections[node.type] && docxSections[node.type](node))
            .filter(s => s);

        this.sections = this.sections.concat(sections);
    },

    async save(fileName) {
        const doc = new Document({
            sections: [{
                children: this.sections,
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: 'right',
                                children: [
                                    new TextRun({
                                        children: ['Pagina ', PageNumber.CURRENT, ' din ', PageNumber.TOTAL_PAGES],
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
            }],
            numbering: {
                config: [
                    {
                        reference: 'arabicPeriod',
                        levels: createLevels(3, level => ({
                            format: 'decimal',
                            text: `%${level + 1}.`,
                            left: .25,
                        })),
                    },
                    {
                        reference: 'romanUcPeriod',
                        levels: createLevels(3, level => ({
                            format: 'upperRoman',
                            text: `%${level + 1}.`,
                            left: .25,
                        })),
                    },
                    {
                        reference: 'alphaLcParenR',
                        levels: [{
                            level: 0,
                            format: 'lowerLetter',
                            text: '%1)',
                            style: {
                                paragraph: {
                                    indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) },
                                },
                            },
                        }],
                    },
                    {
                        reference: 'arabicParenR',
                        levels: createLevels(5, {
                            format: 'bullet',
                            text: '•',
                            left: .25,
                        }),
                    },
                    {
                        reference: 'alphaUcPeriod',
                        levels: [{
                            level: 0,
                            format: 'upperLetter',
                            text: '%d.',
                            style: {
                                paragraph: {
                                    indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) },
                                },
                            },
                        }],
                    },
                    {
                        reference: 'alphaLcPeriod',
                        levels: [{
                            level: 0,
                            format: 'lowerLetter',
                            text: '%d.',
                            style: {
                                paragraph: {
                                    indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) },
                                },
                            },
                        }],
                    },
                    {
                        reference: 'bullet',
                        levels: createLevels(5, {
                            format: 'bullet',
                            text: '•',
                            left: .25,
                        }),
                    },
                    {
                        reference: 'no-bullet',
                        levels: createLevels(5, {
                            format: 'none',
                            left: .25,
                        }),
                    },
                ],
            },
            styles: {
                paragraphStyles: [
                    {
                        id: 'par',
                        name: 'Paragraph',
                        basedOn: 'Normal',
                        next: 'Normal',
                        run: {
                            size: 22,
                        },
                        paragraph: {
                            contextualSpacing: true,
                            spacing: {
                                line: 300,
                                before: 200,
                                after: 200,
                            },
                        },
                    },
                ],
                default: {
                    heading1: {
                        run: {
                            color: '#000000',
                            size: 40,
                            bold: true,
                        },
                        paragraph: {
                            alignment: AlignmentType.CENTER,
                        },
                    },
                    heading2: {
                        run: {
                            color: '#000000',
                            size: 30,
                            bold: true,
                        },
                        paragraph: {
                            spacing: { after: 240, before: 360 },
                        },
                    },
                    heading3: {
                        run: {
                            color: '#000000',
                            size: 26,
                            bold: true,
                        },
                        paragraph: {
                            spacing: { after: 240, before: 240 },
                        },
                    },
                    listParagraph: {
                        paragraph: {
                            spacing: { before: 120 },
                        },
                    },
                },
            },
        });

        const buffer = await Packer.toBuffer(doc);

        return fs.writeFile(fileName, buffer);
    },
};

module.exports = docx;
