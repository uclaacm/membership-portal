import Image from "next/image";
import Loader from "@/components/Loader";

export default function Button({
  action,
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
  className: string;
  color: string;
  icon: string;
  customIcon: string;
  loading: boolean;
  style: string;
  text: string;
  type: "submit" | "reset" | "button";
}>) {
  const buttonClass = `inline-block ${className}`;
  const buttonIcon = icon ? <i className={`fa ${icon} inline-block text-center mr-2.5`} aria-hidden="true" /> : null;
  const buttonCustomIcon = customIcon ? (
    <Image src={customIcon} alt="Button" className="inline-block w-[18px] h-[18px]" />
  ) : null;

  return (
    <div className={buttonClass} onClick={() => action && action()}>
      <button
        className={`${style} ${color} font-["Lato",sans-serif] box-border cursor-pointer border-none outline-none w-auto text-white text-center rounded-[40px] text-[18px] h-10 transition-[0.125s_ease-in-out] p-[0_12px] text-wrap flex items-center`}
        type={type}>
        {!loading && buttonIcon && !buttonCustomIcon}
        {!loading && buttonCustomIcon}
        {!loading && <span className="h-full w-full text-nowrap flex items-center justify-center">{text}</span>}
        {loading && <Loader />}
      </button>
    </div>
  );
}
