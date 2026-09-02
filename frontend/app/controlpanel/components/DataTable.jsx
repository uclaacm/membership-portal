'use client';

import PropTypes from 'prop-types';

/**
 * The dense table used by every Control Panel section.
 *
 * Headers and cells are both rendered from the same `columns` array, so they cannot drift out
 * of sync — the design notes a stray header shifting every column one place left, and this
 * shape makes that mistake unrepresentable rather than merely discouraged.
 *
 * The scroll wrapper is not optional: `min-width: max-content` on the table plus nowrap cells
 * would otherwise widen the whole document and clip the right-hand columns off-screen.
 */
export default function DataTable({
  columns, rows, rowKey, isSelected, empty, className,
}) {
  if (rows.length === 0) {
    return <div className="cp-empty">{empty}</div>;
  }

  return (
    <div className="cp-table-scroll">
      <table className={`cp-table ${className}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${column.numeric ? 'numeric' : ''} ${column.headerClassName || ''}`.trim()}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className={isSelected && isSelected(row) ? 'selected' : ''}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`${column.numeric ? 'numeric' : ''} ${column.cellClassName || ''}`.trim()}
                >
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node,
    render: PropTypes.func.isRequired,
    numeric: PropTypes.bool,
    width: PropTypes.string,
    headerClassName: PropTypes.string,
    cellClassName: PropTypes.string,
  })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowKey: PropTypes.func.isRequired,
  isSelected: PropTypes.func,
  empty: PropTypes.string,
  className: PropTypes.string,
};

DataTable.defaultProps = {
  isSelected: null,
  empty: 'Nothing to show.',
  className: '',
};
