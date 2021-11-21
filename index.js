const argv = require('minimist')(process.argv.slice(2), {
    alias: {
        f: ['file'],
        d: ['dest'],
        o: ['omit', 'skip'],
    },
});
const pptSlideExtractor = require('./lib/ppt');
const xml = require('./lib/xml');
const docx = require('./lib/docx');
const smartProcessing = require('./lib/nodes');

(async function({ _: [input], dest, skip } = argv) {
    const slideExtractor = pptSlideExtractor(input, { skip });

    for await (const slide of slideExtractor) {
        const nodes = xml.parse(slide);

        const sanitizedNodes = smartProcessing.pushNodes(nodes);

        docx.appendNodes(sanitizedNodes);
    }

    return docx.save(dest || input.replace('.pptx', '.docx'));
})();
