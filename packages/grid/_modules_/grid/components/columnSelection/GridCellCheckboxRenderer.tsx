import * as React from 'react';
import { useForkRef } from '@material-ui/core/utils';
import { GRID_CELL_NAVIGATION_KEYDOWN } from '../../constants/eventsConstants';
import { GridCellParams } from '../../models/params/gridCellParams';
import { isNavigationKey, isSpaceKey } from '../../utils/keyboardUtils';
import { GridApiContext } from '../GridApiContext';

export const GridCellCheckboxForwardRef = React.forwardRef<HTMLInputElement, GridCellParams>(
  function GridCellCheckboxRenderer(props, ref) {
    const { field, id, value, tabIndex, hasFocus } = props;
    const apiRef = React.useContext(GridApiContext);
    const checkboxElement = React.useRef<HTMLInputElement | null>(null);

    const handleRef = useForkRef(checkboxElement, ref);
    const element = props.api.getCellElement(id, field);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      apiRef!.current.selectRow(id, event.target.checked, true);
    };

    React.useLayoutEffect(() => {
      if (tabIndex === 0 && element) {
        element!.tabIndex = -1;
      }
    }, [element, tabIndex]);

    React.useLayoutEffect(() => {
      if (hasFocus && checkboxElement.current) {
        const input = checkboxElement.current.querySelector('input')!;
        input!.focus();
      }
    }, [hasFocus]);

    const handleKeyDown = React.useCallback(
      (event) => {
        if (isSpaceKey(event.key)) {
          event.stopPropagation();
        }
        if (isNavigationKey(event.key) && !event.shiftKey) {
          apiRef!.current.publishEvent(GRID_CELL_NAVIGATION_KEYDOWN, props, event);
        }
      },
      [apiRef, props],
    );

    const CheckboxComponent = apiRef?.current.components.Checkbox!;

    return (
      <CheckboxComponent
        ref={handleRef}
        tabIndex={tabIndex}
        checked={!!value}
        onChange={handleChange}
        className="MuiDataGrid-checkboxInput"
        color="primary"
        inputProps={{ 'aria-label': 'Select Row checkbox' }}
        onKeyDown={handleKeyDown}
        {...apiRef?.current.componentsProps?.checkbox}
      />
    );
  },
);

export const GridCellCheckboxRenderer = React.memo(GridCellCheckboxForwardRef);
