import Image from "next/image";

export default function Logo({ pic }: { pic: string }) {
  return (
    <div className="h-16 my-4 flex flex-row justify-start">
      <Image className="h-16" src={pic} alt="ACM logo" width={250} height={1000} />
    </div>
  );
}
