import React from "react";

export const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

export const lazyLoad = (component: any) => {
  return React.lazy(component);
};