const { getElementsByTagName, getAttributeValue } = require('domutils');
const { getFormattedInner, getFormattedTitle } = require('../utils');

const titleTypes = ['title', 'ctrTitle'];

const nodeTypeCheck = {
    title: p => {
        const [pph] = getElementsByTagName('p:ph', p);

        if (!pph) {
            return false;
        }

        if (!titleTypes.includes(getAttributeValue(pph, 'type'))) {
            return false;
        }

        return {
            text: getFormattedTitle(getFormattedInner(p)),
        };
    },
    subtitle: p => {
        const [pph] = getElementsByTagName('p:ph', p);

        if (!pph) {
            return false;
        }

        if (getAttributeValue(pph, 'type') !== 'subTitle') {
            return false;
        }

        return {
            text: getFormattedTitle(getFormattedInner(p)),
        };
    },
};

module.exports = nodeTypeCheck;
