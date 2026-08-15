import TreatCell, { type TreatCellData } from './TreatCell';

interface TreatBoardProps {
  grid: TreatCellData[][];
  onReveal: (rowIndex: number, columnIndex: number) => void;
  disabled: boolean;
}

const TreatBoard = ({ grid, onReveal, disabled }: TreatBoardProps) => (
  <div className="treat-board" role="grid" aria-label="Treat board">
    {grid.map((row, rowIndex) => (
              // eslint-disable-next-line react-x/no-array-index-key -- grid is static, index is stable identity
      <div className="treat-row" role="row" key={rowIndex}>
        {row.map((cell, columnIndex) => (
          <TreatCell
                  // eslint-disable-next-line react-x/no-array-index-key -- grid is static, index is stable identity
            key={`${rowIndex}-${columnIndex}`}
            cell={cell}
            onReveal={() => onReveal(rowIndex, columnIndex)}
            disabled={disabled}
          />
        ))}
      </div>
    ))}
  </div>
);

export default TreatBoard;
