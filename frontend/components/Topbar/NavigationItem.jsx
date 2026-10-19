export default function NavigationItem({ text, icon }) {
  return (
    <div className="navigation-item">
      {icon && <i className={`fa ${icon}`} />}
      <span>{text}</span>
    </div>
  );
}
