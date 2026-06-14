const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const palette = [
  'bg-[#0A0A0A]',
  'bg-[#374151]',
  'bg-[#1F2937]',
  'bg-[#111827]',
  'bg-[#0A0A0A]',
  'bg-[#1F2937]',
  'bg-[#374151]',
];

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
  ...props
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = palette[hashStr(name) % palette.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover flex-shrink-0 ring-2 ring-[var(--border-default)]',
          sizes[size],
          className,
        ].join(' ')}
        {...props}
      />
    );
  }

  return (
    <div
      className={[
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
        'ring-2 ring-[var(--border-default)]',
        sizes[size],
        bgColor,
        className,
      ].join(' ')}
      title={name}
      {...props}
    >
      {initials || '?'}
    </div>
  );
}
