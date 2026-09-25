type LogoProps = {
  size?: number;
};

export default function Logo({ size = 30 }: LogoProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-fuchsia-500 to-violet-600"
      style={{ width: size, height: size }}
      aria-label="Fireflies"
    >
      <div className="absolute left-[24%] top-[18%] h-[64%] w-[18%] rounded-sm bg-white/90" />
      <div className="absolute left-[24%] top-[18%] h-[18%] w-[52%] rounded-sm bg-white/90" />
      <div className="absolute left-[24%] top-[44%] h-[18%] w-[43%] rounded-sm bg-white/80" />
    </div>
  );
}