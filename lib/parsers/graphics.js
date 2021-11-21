const { getElementsByTagName } = require('domutils');
const { getFormattedInner } = require('../utils');

const graphicsType = {
    table: tree => {
        const [tbl] = getElementsByTagName('a:tbl', tree);

        if (!tbl) {
            return false;
        }

        const gridCols = getElementsByTagName('a:gridcol', tbl);
        const rows = getElementsByTagName('a:tr', tbl);

        const tableCells = rows.map(row => {
            return row.children.map(tc => getFormattedInner(tc));
        });

        return {
            rows: rows.length,
            columns: gridCols.length,
            data: tableCells,
        };
    },
};

module.exports = graphicsType;
