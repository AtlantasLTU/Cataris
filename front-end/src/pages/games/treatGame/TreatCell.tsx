import aliveIcon from '/src/assets/treat/fish-alive.png';
import deadIcon from '/src/assets/treat/fish-dead.png';

export interface TreatCellData {
  value: 0 | 1;
  isOpened: boolean;
}

interface TreatCellProps {
  cell: TreatCellData;
  onReveal: () => void;
  disabled: boolean;
}

const TreatCell = ({ cell, onReveal, disabled }: TreatCellProps) => {
  return (
    <div className="treat-cell">
      {cell.isOpened && (
        <img
          src={cell.value === 1 ? aliveIcon : deadIcon}
          alt={cell.value === 1 ? 'Safe treat' : 'Bomb'}
        />
      )}

      {!cell.isOpened && (
        <button
          type="button"
          className="treat-cell__overlay"
          onClick={onReveal}
          disabled={disabled}
          aria-label="Reveal treat"
        />
      )}
    </div>
  );
};

export default TreatCell;
