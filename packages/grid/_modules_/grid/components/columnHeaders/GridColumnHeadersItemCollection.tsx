import * as React from 'react';
import { gridColumnReorderDragColSelector } from '../../hooks/features/columnReorder/columnReorderSelector';
import { gridResizingColumnFieldSelector } from '../../hooks/features/columnResize/columnResizeSelector';
import { useGridSelector } from '../../hooks/features/core/useGridSelector';
import { filterGridColumnLookupSelector } from '../../hooks/features/filter/gridFilterSelector';
import {
  gridFocusColumnHeaderSelector,
  gridTabIndexCellSelector,
  gridTabIndexColumnHeaderSelector,
} from '../../hooks/features/focus/gridFocusStateSelector';
import { gridSortColumnLookupSelector } from '../../hooks/features/sorting/gridSortingSelector';
import { renderStateSelector } from '../../hooks/features/virtualization/renderingStateSelector';
import { optionsSelector } from '../../hooks/utils/optionsSelector';
import { GridColumns } from '../../models/colDef/gridColDef';
import { GridApiContext } from '../GridApiContext';
import { GridColumnHeaderItem } from './GridColumnHeaderItem';

export interface GridColumnHeadersItemCollectionProps {
  columns: GridColumns;
}

export function GridColumnHeadersItemCollection(props: GridColumnHeadersItemCollectionProps) {
  const { columns } = props;
  const apiRef = React.useContext(GridApiContext);
  const options = useGridSelector(apiRef, optionsSelector);
  const sortColumnLookup = useGridSelector(apiRef, gridSortColumnLookupSelector);
  const filterColumnLookup = useGridSelector(apiRef, filterGridColumnLookupSelector);
  const dragCol = useGridSelector(apiRef, gridColumnReorderDragColSelector);
  const resizingColumnField = useGridSelector(apiRef, gridResizingColumnFieldSelector);
  const columnHeaderFocus = useGridSelector(apiRef, gridFocusColumnHeaderSelector);
  const renderCtx = useGridSelector(apiRef, renderStateSelector).renderContext;
  const tabIndexState = useGridSelector(apiRef, gridTabIndexColumnHeaderSelector);
  const cellTabIndexState = useGridSelector(apiRef, gridTabIndexCellSelector);

  const getColIndex = (index) => {
    if (renderCtx == null) {
      return index;
    }

    return index + renderCtx.firstColIdx;
  };

  const items = columns.map((col, idx) => {
    const colIndex = getColIndex(idx);
    const isFirstColumn = colIndex === 0;
    const hasTabbableElement = !(tabIndexState === null && cellTabIndexState === null);
    const tabIndex =
      (tabIndexState !== null && tabIndexState.field === col.field) ||
      (isFirstColumn && !hasTabbableElement)
        ? 0
        : -1;
    const hasFocus = columnHeaderFocus !== null && columnHeaderFocus.field === col.field;
    return (
      <GridColumnHeaderItem
        key={col.field}
        {...sortColumnLookup[col.field]}
        filterItemsCounter={filterColumnLookup[col.field] && filterColumnLookup[col.field].length}
        options={options}
        isDragging={col.field === dragCol}
        column={col}
        colIndex={getColIndex(idx)}
        isResizing={resizingColumnField === col.field}
        hasFocus={hasFocus}
        tabIndex={tabIndex}
      />
    );
  });

  return <React.Fragment>{items}</React.Fragment>;
}
