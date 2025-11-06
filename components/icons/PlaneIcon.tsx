
import React from 'react';

const PlaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 21l2-2L14.5 9.5 12 7 2 5l20 16-4-4-7.5-7.5Z" />
    <path d="M14.5 9.5L22 2" />
  </svg>
);

export default PlaneIcon;
