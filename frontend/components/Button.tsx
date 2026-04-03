import Image from "next/image";
import Loader from "@/components/Loader";
import "./Button.scss";

export default function Button({
  action,
  onClick,
  className,
  color,
  icon,
  customIcon,
  loading,
  style,
  text,
  type,
}: Partial<{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  action: Function;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onClick: Function;
  className: string;
  color: string;
  icon: string;
  customIcon: string;
  loading: boolean;
  style: string;
  text: string;
  type: "submit" | "reset" | "button";
}>) {
  const handleClick = () => {
    if (loading) return;
    if (onClick) onClick();
    else if (action) action();
  };

  const buttonClass = `button-component ${className ?? ""}`;
  const buttonIcon = icon ? <i className={`fa ${icon} button-icon`} aria-hidden="true" /> : null;
  const buttonCustomIcon = customIcon ? (
    <Image src={customIcon} alt="Button" className="button-icon button-custom-icon" width={18} height={18} />
  ) : null;

  return (
    <div className={buttonClass} onClick={handleClick}>
      <button className={`button-inside ${style ?? ""} ${color ?? ""}`} type={type}>
        {!loading && !buttonCustomIcon && buttonIcon}
        {!loading && buttonCustomIcon}
        {!loading && <span>{text}</span>}
        {loading && <Loader />}
      </button>
    </div>
  );
}
