const argv = require('minimist')(process.argv.slice(2), {
    alias: {
        f: ['file'],
        o: ['output'],
    },
});
const pptSlideExtractor = require('./lib/ppt');
const xml = require('./lib/xml');

(async function({ _: [input], output } = argv) {
    const slideExtractor = pptSlideExtractor(input);

    for await (const buffer of slideExtractor) {
        const slide = buffer.toString();

        xml.parse(slide);
    }
})();
