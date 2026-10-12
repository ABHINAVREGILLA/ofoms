"use client";

import React, { useState } from "react";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  loading = "lazy",
}) => {
  const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
      // fallback to an online placeholder image
      setImgSrc('https://via.placeholder.com/400x300?text=Image+Not+Found');
    };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
};
