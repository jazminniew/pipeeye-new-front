import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
  all: unset; 
  text-decoration: none;
  cursor: pointer;

  --btn-bg-1: hsla(194, 100%, 69%, 1);
  --btn-bg-2: hsla(217, 100%, 56%, 1);
  --btn-bg-color: white;
  --radii: 0.5em;

  padding: 0.9em 0em;
  min-width: 180px;
  outline: none;
  font-size: 1rem;
  font-weight: 500;
  background-size: 280% auto;
  background-image: linear-gradient(
    325deg,
    var(--btn-bg-2) 0%,
    var(--btn-bg-1) 55%,
    var(--btn-bg-2) 90%
  );
  border: none;
  border-radius: var(--radii);
  color: var(--btn-bg-color);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  transition: background-position 0.8s ease;

  box-shadow:
    0px 0px 20px rgba(71, 184, 255, 0.5),
    0px 5px 5px -1px rgba(58, 125, 233, 0.25),
    inset 4px 4px 8px rgba(175, 230, 255, 0.5),
    inset -4px -4px 8px rgba(19, 95, 216, 0.35);

  &:hover {
    background-position: right top;
  }

  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
    box-shadow:
      0 0 0 3px var(--btn-bg-color),
      0 0 0 6px var(--btn-bg-2);
  }

  span {
    text-transform: none;
    white-space: nowrap;
    line-height: 1;
    text-decoration: none;
  }

  svg {
    display: block;
  }
`;


const SubirImgBtn = () => {
  return (
    <StyledLink to="/upload">
      <Icon icon="mdi:upload" width="22" height="22" />
      <span>Subir imágenes</span>
    </StyledLink>
  );
};

export default SubirImgBtn;