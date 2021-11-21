const { Paragraph, HeadingLevel } = require('docx');

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
        text: node.content.text,
        style: 'par',
    }),
    listItem: node => {
        const opts = {
            text: node.content.text,
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
