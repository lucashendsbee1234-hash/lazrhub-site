export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="glass rounded-3xl px-8 py-20 text-center relative overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {Icon && (
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <Icon size={26} strokeWidth={1.5} className="text-[#00E5FF]" />
          </div>
        )}
        <div className="font-heading text-2xl md:text-3xl font-black">{title}</div>
        {subtitle && <div className="text-sm text-[#B8C2CC] max-w-md">{subtitle}</div>}
        {action}
      </div>
    </div>
  );
}
