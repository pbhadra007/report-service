interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-400">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-500">This page is not built yet.</p>
        <p className="text-xs text-gray-400">Coming soon.</p>
      </div>

      <footer className="text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
