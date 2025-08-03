import React from "react";

export const Circle = (props: React.SVGProps<SVGSVGElement>) => {
  const fill = props.fill ?? "#10B981";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="40" fill={fill} />
    </svg>
  );
};

export const Diamond = (props: React.SVGProps<SVGSVGElement>) => {
  const fill = props.fill ?? "#F43F5E";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <polygon points="50,10 90,50 50,90 10,50" fill={fill} />
    </svg>
  );
};

export const Hexagon = (props: React.SVGProps<SVGSVGElement>) => {
  const fill = props.fill ?? "#FBBF24";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill={fill} />
    </svg>
  );
};

export const Square = (props: React.SVGProps<SVGSVGElement>) => {
  const fill = props.fill ?? "#4F46E5";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="80" height="80" x="10" y="10" fill={fill} />
    </svg>
  );
};

export const Triangle = (props: React.SVGProps<SVGSVGElement>) => {
  const fill = props.fill ?? "#F59E42";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <polygon points="50,15 90,85 10,85" fill={fill} />
    </svg>
  );
};

