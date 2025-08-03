
import React, { useEffect, useState } from "react";

const S3_PREFIX = "ChatImage/";

const ImageGallery: React.FC = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images/s3-images?prefix=${S3_PREFIX}`);
        const data = await res.json();
        setUrls(data.urls || []);
      } catch (err) {
        setUrls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading) return <div>Loading images...</div>;
  if (!urls.length) return <div>No images found.</div>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {urls.map((url) => (
        <img
          key={url}
          src={url}
          alt="S3"
          style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8 }}
        />
      ))}
    </div>
  );
};

export default ImageGallery;

