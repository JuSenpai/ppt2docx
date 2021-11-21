const { getElementsByTagName, existsOne, getChildren, getAttributeValue } = require('domutils');
const { getFormattedInner } = require('../utils');

const listTags = ['a:bunone', 'a:bufont', 'a:buchar', 'a:buszpct', 'a:buAutoNum', 'a:tablst', 'a:bublip'];

const paragraphTypes = {
    listItem: p => {
        const [paragraphProps] = getElementsByTagName('a:ppr', p);

        if (!paragraphProps) {
            return false;
        }

        const level = getAttributeValue(paragraphProps, 'lvl');
        const isList = level || existsOne(elem => listTags.includes(elem.name), getChildren(paragraphProps));

        if (!isList) {
            return false;
        }

        const [autoNumTag] = getElementsByTagName('a:buautonum', paragraphProps);
        const [buNone] = getElementsByTagName('a:bunone', paragraphProps);

        let autoNum = 'bullet';

        if (buNone) {
            autoNum = 'no-bullet';
        } else if (autoNumTag) {
            autoNum = getAttributeValue(autoNumTag, 'type');
        }

        const text = getFormattedInner(p);

        if (!text) {
            return {};
        }

        return {
            autoNum,
            level: Number(level) || 0,
            text,
        };
    },
    plain: p => {
        return {
            text: getFormattedInner(p),
        };
    },
};

module.exports = paragraphTypes;
