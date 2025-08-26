import React, { useId } from 'react';
import styled from 'styled-components';

export type ModoProyecto = 'existente' | 'nuevo';

type Props = {
  value: ModoProyecto;                 // estado actual
  onChange: (v: ModoProyecto) => void; // callback al cambiar
  className?: string;
};

const ProyectoSelector: React.FC<Props> = ({ value, onChange, className }) => {
  // Para que los ids no choquen si hay más de un selector en la vista
  const uid = useId();
  const idExistente = `${uid}-op-existente`;
  const idNuevo = `${uid}-op-nuevo`;

  return (
    <StyledWrapper className={className}>
      <div className="tabs" role="tablist" aria-label="Seleccionar tipo de proyecto">
        {/* Radios controlados */}
        <input
          type="radio"
          id={idExistente}
          name={`${uid}-proyecto`}
          checked={value === 'existente'}
          onChange={() => onChange('existente')}
        />
        <label className="tab" htmlFor={idExistente} role="tab" aria-selected={value === 'existente'}>
          <span className="tabText">Proyecto existente</span>
        </label>

        <input
          type="radio"
          id={idNuevo}
          name={`${uid}-proyecto`}
          checked={value === 'nuevo'}
          onChange={() => onChange('nuevo')}
        />
        <label className="tab" htmlFor={idNuevo} role="tab" aria-selected={value === 'nuevo'}>
          <span className="tabText">Nuevo proyecto</span>
        </label>

        {/* Glider */}
        <span className="glider" data-pos={value} />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Paleta */
  --pill-bg: #08121f;
  --text: #fff;
  --text-active: #fff;
  --glider-bg: #007BFF;
  --border: none;
  --pill-shadow:#040a12;

  display: inline-flex;

  .tabs {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    background: var(--pill-bg);
    border: 1px solid var(--border);
    border-radius: 9999px;
    padding: 6px;
    box-shadow: var(--pill-shadow);
    min-width: 320px;
  }

  .tabs > input[type='radio'] { display: none; }

  .tab {
    position: relative;
    z-index: 2;
    height: 40px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    cursor: pointer;
    transition: color .15s ease-in;
    user-select: none;
  }

  .tabText {
    font-size: .85rem;
    font-weight: 600;
    padding: 0 18px;
    white-space: nowrap;
  }

  /* Color de texto activo usando aria-selected */
  .tab[aria-selected="true"] { color: var(--text-active); }

  .glider {
    position: absolute;
    z-index: 1;
    top: 6px;
    left: 6px;
    width: calc(50% - 6px);
    height: 40px;
    background: var(--glider-bg);
    border-radius: 9999px;
    transition: transform .25s ease-out;
  }
  .glider[data-pos="existente"] { transform: translateX(0%); }
  .glider[data-pos="nuevo"]      { transform: translateX(100%); }

  @media (max-width: 480px) {
    .tabs { min-width: 280px; }
    .tab { height: 36px; }
    .glider { height: 36px; }
    .tabText { font-size: .8rem; padding: 0 14px; }
  }
`;

export default ProyectoSelector;
