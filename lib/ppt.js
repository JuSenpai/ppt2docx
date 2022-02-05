const StreamZip = require('node-stream-zip');

const computeSkipArray = skip => {
    if (!skip) {
        return [];
    } else if (Array.isArray(skip)) {
        return skip.map(slideNo => `ppt/slides/slide${slideNo}.xml`);
    } else {
        return [`ppt/slides/slide${skip}.xml`];
    }
};

async function* pptSlideExtractor(file, { skip }) {
    const zip = new StreamZip.async({ file });
    const slidesToSkip = computeSkipArray(skip);

    const zipFiles = await zip.entries();

    const slides = Object.values(zipFiles)
        .filter(fn => fn.name.startsWith('ppt/slides/slide'))
        .sort((e1, e2) => {
            const [, num1] = e1.name.match(/slide(\d+)\.xml$/);
            const [, num2] = e2.name.match(/slide(\d+)\.xml$/);

            return Number(num1) - Number(num2);
        });

    for (const entry of slides) {
        if (slidesToSkip.includes(entry.name)) {
            continue;
        }

        const buffer = await zip.entryData(entry);

        yield buffer.toString();
    }
}

module.exports = pptSlideExtractor;
