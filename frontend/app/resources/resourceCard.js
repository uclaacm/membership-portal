export default function ResourceCard({ resource }) {
  const { type, title, subtitle, link, description } = resource;
  const backgroundImage = `url('/resource_types/${type}.png')`;
  return (
    <a className="no-style" target="_BLANK" href={link} rel="noreferrer">
      <div className="resource-card">
        <div className="cover" style={{ backgroundImage }} />
        <div className="content">
          {title && <h2>{title}</h2>}
          {subtitle && <h3>{subtitle}</h3>}
          {description && (
            <div className="description">
              <p>{description}</p>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
