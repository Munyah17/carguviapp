import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-4xl font-bold text-brand-200">404</p>
      <h1 className="mt-2 text-xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">
        The part or page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/search"
        className="tap mt-6 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white"
      >
        Search parts
      </Link>
    </div>
  );
}
