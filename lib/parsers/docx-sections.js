const { Paragraph, HeadingLevel, TextRun } = require('docx');

const docxSections = {
    title: node => new Paragraph({
        text: node.content.text,
        heading: node.content.level,
    }),
    subtitle: node => new Paragraph({
        text: node.content.text,
        heading: HeadingLevel.HEADING_3,
        alignment: 'center',
    }),
    plain: node => new Paragraph({
        style: 'par',
        children: [
            new TextRun({
                text: node.content.text,
                bold: node.bold || false,
            }),
        ],
    }),
    listItem: node => {
        const opts = {
            children: [
                new TextRun({
                    text: node.content.text,
                    bold: node.bold || false,
                }),
            ],
            contextualSpacing: true,
            style: 'par',
            numbering: {
                reference: node.content.autoNum,
                level: node.content.level,
            },
            spacing: {
                before: 120,
            },
        };

        return new Paragraph(opts);
    },
};

module.exports = docxSections;
