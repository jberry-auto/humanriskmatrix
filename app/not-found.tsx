import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-black/70 dark:text-white/70">
        That page doesn&apos;t exist (yet). The site is in active development.
      </p>
      <Link href="/" className="text-sm font-medium underline underline-offset-4">
        ← Back home
      </Link>
    </div>
  );
}
