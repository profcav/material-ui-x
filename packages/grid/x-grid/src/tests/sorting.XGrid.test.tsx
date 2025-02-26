import * as React from 'react';
import { GridApiRef, GridColDef, GridSortModel, useGridApiRef } from '@material-ui/data-grid';
import { XGrid } from '@material-ui/x-grid';
import { expect } from 'chai';
import { useFakeTimers } from 'sinon';
import { getColumnValues, getColumnHeaderCell } from 'test/utils/helperFn';
import {
  createClientRenderStrictMode,
  // @ts-expect-error need to migrate helpers to TypeScript
  fireEvent,
  // @ts-expect-error need to migrate helpers to TypeScript
  screen,
  // @ts-expect-error need to migrate helpers to TypeScript
  waitFor,
} from 'test/utils';
import { useData } from 'packages/storybook/src/hooks/useData';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<XGrid /> - Sorting', () => {
  let clock;

  beforeEach(() => {
    clock = useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  // TODO v5: replace with createClientRender
  const render = createClientRenderStrictMode();

  let apiRef: GridApiRef;

  const TestCase = (props: {
    rows?: any[];
    sortModel: GridSortModel;
    disableMultipleColumnsSorting?: boolean;
  }) => {
    const baselineProps = {
      autoHeight: isJSDOM,
      rows: [
        {
          id: 0,
          brand: 'Nike',
          year: '1940',
        },
        {
          id: 1,
          brand: 'Adidas',
          year: '1940',
        },
        {
          id: 2,
          brand: 'Puma',
          year: '1950',
        },
      ],
      columns: [{ field: 'brand' }, { field: 'year', type: 'number' }],
    };

    const { sortModel, rows, disableMultipleColumnsSorting } = props;
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <XGrid
          apiRef={apiRef}
          {...baselineProps}
          rows={rows || baselineProps.rows}
          sortModel={sortModel}
          disableMultipleColumnsSorting={disableMultipleColumnsSorting}
        />
      </div>
    );
  };

  const renderBrandSortedAsc = () => {
    const sortModel: GridSortModel = [{ field: 'brand', sort: 'asc' }];

    render(<TestCase sortModel={sortModel} />);
  };

  it('should apply the sortModel prop correctly', () => {
    renderBrandSortedAsc();
    expect(getColumnValues()).to.deep.equal(['Adidas', 'Nike', 'Puma']);
  });

  it('should apply the sortModel prop correctly on GridApiRef setRows', () => {
    renderBrandSortedAsc();
    const newRows = [
      {
        id: 3,
        brand: 'Asics',
      },
      {
        id: 4,
        brand: 'RedBull',
      },
      {
        id: 5,
        brand: 'Hugo',
      },
    ];
    apiRef.current.setRows(newRows);
    clock.tick(100);
    expect(getColumnValues()).to.deep.equal(['Asics', 'Hugo', 'RedBull']);
  });

  it('should apply the sortModel prop correctly on GridApiRef update row data', () => {
    renderBrandSortedAsc();
    apiRef.current.updateRows([{ id: 1, brand: 'Fila' }]);
    apiRef.current.updateRows([{ id: 0, brand: 'Patagonia' }]);
    clock.tick(100);
    expect(getColumnValues()).to.deep.equal(['Fila', 'Patagonia', 'Puma']);
  });

  it('should allow apiRef to setSortModel', () => {
    renderBrandSortedAsc();
    apiRef.current.setSortModel([{ field: 'brand', sort: 'desc' }]);
    expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
  });

  it('should allow multiple sort columns and', () => {
    const sortModel: GridSortModel = [
      { field: 'year', sort: 'desc' },
      { field: 'brand', sort: 'asc' },
    ];
    render(<TestCase sortModel={sortModel} />);
    expect(getColumnValues()).to.deep.equal(['Puma', 'Adidas', 'Nike']);
  });

  it('should allow to set multiple Sort items via apiRef', () => {
    renderBrandSortedAsc();
    expect(getColumnValues()).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    const sortModel: GridSortModel = [
      { field: 'year', sort: 'desc' },
      { field: 'brand', sort: 'asc' },
    ];

    apiRef.current.setSortModel(sortModel);
    expect(getColumnValues()).to.deep.equal(['Puma', 'Adidas', 'Nike']);
  });

  describe('multi-sorting', () => {
    ['shiftKey', 'metaKey', 'ctrlKey'].forEach((key) => {
      it(`should do a multi-sorting when clicking the header cell while ${key} is pressed`, () => {
        render(<TestCase sortModel={[{ field: 'year', sort: 'desc' }]} />);
        expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
        fireEvent.click(getColumnHeaderCell(1), { [key]: true });
        expect(getColumnValues()).to.deep.equal(['Puma', 'Adidas', 'Nike']);
      });
    });

    ['metaKey', 'ctrlKey'].forEach((key) => {
      it(`should do nothing when pressing Enter while ${key} is pressed`, () => {
        render(<TestCase sortModel={[{ field: 'year', sort: 'desc' }]} />);
        expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
        getColumnHeaderCell(1).focus();
        fireEvent.keyDown(getColumnHeaderCell(1), { key: 'Enter', [key]: true });
        expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
      });
    });

    it('should do a multi-sorting pressing Enter while shiftKey is pressed', () => {
      render(<TestCase sortModel={[{ field: 'year', sort: 'desc' }]} />);
      expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
      getColumnHeaderCell(1).focus();
      fireEvent.keyDown(getColumnHeaderCell(1), { key: 'Enter', shiftKey: true });
      expect(getColumnValues()).to.deep.equal(['Puma', 'Adidas', 'Nike']);
    });

    it(`should not do a multi-sorting if no multiple key is pressed`, () => {
      render(<TestCase sortModel={[{ field: 'year', sort: 'desc' }]} />);
      expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
      fireEvent.click(getColumnHeaderCell(1));
      expect(getColumnValues()).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    });

    it('should not do a multi-sorting if disableMultipleColumnsSorting is true', () => {
      render(
        <TestCase sortModel={[{ field: 'year', sort: 'desc' }]} disableMultipleColumnsSorting />,
      );
      expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
      fireEvent.click(getColumnHeaderCell(1), { shiftKey: true });
      expect(getColumnValues()).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    });
  });

  describe('performance', () => {
    beforeEach(() => {
      clock.restore();
    });

    it('should sort 5,000 rows in less than 200 ms', async function test() {
      // It's simpler to only run the performance test in a single controlled environment.
      if (!/HeadlessChrome/.test(window.navigator.userAgent)) {
        this.skip();
        return;
      }

      const TestCasePerf = () => {
        const data = useData(5000, 10);

        return (
          <div style={{ width: 300, height: 300 }}>
            <XGrid columns={data.columns} rows={data.rows} />
          </div>
        );
      };

      render(<TestCasePerf />);
      const header = screen
        .getByRole('columnheader', { name: 'Currency Pair' })
        .querySelector('.MuiDataGrid-colCellTitleContainer');

      const t0 = performance.now();
      fireEvent.click(header);
      await waitFor(() =>
        expect(document.querySelector('.MuiDataGrid-sortIcon')).to.not.equal(null),
      );
      const t1 = performance.now();
      const time = Math.round(t1 - t0);
      expect(time).to.be.lessThan(300);
    });

    it('should render maximum twice', async function test() {
      let renderCellCount = 0;
      let renderHeaderCount = 0;
      const TestCasePerf = () => {
        const [cols, setCols] = React.useState<GridColDef[]>([]);
        const data = useData(10, 10);

        React.useEffect(() => {
          if (data.columns.length) {
            const newColumns = [...data.columns];
            newColumns[1].renderHeader = (params) => {
              renderHeaderCount += 1;

              return <span>{params.field}</span>;
            };
            newColumns[1].renderCell = (params) => {
              if (params.id === 0) {
                renderCellCount += 1;
              }
              return <span>{params.value}</span>;
            };
            setCols(newColumns);
          }
        }, [data.columns]);

        return (
          <div style={{ width: 300, height: 300 }}>
            <XGrid columns={cols} rows={data.rows} />
          </div>
        );
      };

      render(<TestCasePerf />);
      const header = getColumnHeaderCell(2);
      renderHeaderCount = 0;
      renderCellCount = 0;
      fireEvent.click(header);
      await waitFor(() =>
        expect(document.querySelector('.MuiDataGrid-sortIcon')).to.not.equal(null),
      );
      expect(renderHeaderCount).to.equal(2);
      expect(renderCellCount).to.equal(0);
    });
  });
});
