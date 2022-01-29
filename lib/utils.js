const { innerText } = require('domutils');

function removeDiacritics(str) {
    return str.normalize('NFKD')
        .replace(//, '→')
        .replace(/[^\w\s.,-_\/()\[\]\\@#!$→↑↓%+*~`"'–“”]/g, '');
}

function getFormattedInner(node) {
    const inner = innerText(node);

    const formatted = removeDiacritics(inner)
        .trim()
        .replace('', '→');

    return formatted.replace(/\t|\s+/g, ' ');
}

function getFormattedTitle(title) {
    return title.replace(/([a-z])([A-Z])/, '$1 $2')
        .replace(/([A-z0-9])([.()])([A-z0-9])/, '$1$2 $3');
}

module.exports = {
    getFormattedInner,
    getFormattedTitle,
};
