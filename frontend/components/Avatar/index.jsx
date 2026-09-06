import { useState } from "react";
import "./style.scss";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({ name, picture, size = 70 }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(picture) && !imgError;
  const style = { width: size, height: size };

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="avatar-fallback-img" src={picture} alt={name} style={style} onError={() => setImgError(true)} />
    );
  }

  return (
    <div className="avatar-fallback-initials" style={style} aria-label={name} title={name}>
      {getInitials(name)}
    </div>
  );
}
