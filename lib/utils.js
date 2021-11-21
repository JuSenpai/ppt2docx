const { innerText } = require('domutils');

function removeDiacritics(str) {
    return str.normalize('NFKD').replace(/[^\w\s.,-_\/()\[\]\\@#!$→↑↓+*~`"']/g, '');
}

function getFormattedInner(node) {
    const inner = innerText(node);

    const formatted = removeDiacritics(inner)
        .trim()
        .replace('', '→');

    return formatted.replace(/\t|\s+/g, ' ');
}

module.exports = {
    getFormattedInner,
};
