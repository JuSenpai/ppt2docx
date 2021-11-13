const StreamZip = require('node-stream-zip');

async function* pptSlideExtractor(file) {
    const zip = new StreamZip.async({ file });

    const zipFiles = await zip.entries();

    const slides = Object.values(zipFiles)
        .filter(fn => fn.name.startsWith('ppt/slides/slide20'));

    for (const entry of slides) {
        const data = await zip.entryData(entry);

        yield data;
    }
}

module.exports = pptSlideExtractor;
