interface Props {
  size?: number;
  withText?: boolean;
  compact?: boolean;
}

export default function DevspaceLogo({ size = 32, withText = true, compact = false }: Props) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Diamond rotated square background */}
        <g transform="rotate(45 50 50)">
          {/* Red piece - top-right */}
          <rect x="52" y="10" width="36" height="36" rx="8" fill="#EF4444" />
          {/* Navy piece - bottom-left */}
          <rect x="12" y="54" width="36" height="36" rx="8" fill="#2C3E7A" />
          {/* Navy piece - top-left */}
          <rect x="12" y="10" width="36" height="36" rx="8" fill="#2C3E7A" />
          {/* Red piece - bottom-right */}
          <rect x="52" y="54" width="36" height="36" rx="8" fill="#EF4444" />
          {/* White center diamond */}
          <rect x="38" y="38" width="24" height="24" rx="4" fill="white" />
        </g>
      </svg>
      {withText && (
        <div>
          <div className={`font-bold text-[#172033] leading-none tracking-tight ${compact ? "text-base" : "text-lg"}`}>DEVSPACE</div>
          {!compact && <div className="text-[10px] text-[#667085] tracking-widest uppercase leading-tight mt-0.5">PT. Ruang Kreasi Aplikasi</div>}
        </div>
      )}
    </div>
  );
}
