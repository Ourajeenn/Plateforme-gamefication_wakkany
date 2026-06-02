export default function Marquee({ messages }) {
  return (
    <div className="overflow-hidden border-b border-white/10 bg-zinc-950/90 py-4">
      <div className="flex animate-marquee whitespace-nowrap gap-8 text-sm uppercase tracking-[0.35em] text-[#c28e3a] font-black">
        {messages.concat(messages).map((message, index) => (
          <span key={`${message}-${index}`} className="inline-flex items-center gap-3">
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
