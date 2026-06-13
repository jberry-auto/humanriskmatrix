import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Heading level={1} size="h1">
        Page not found
      </Heading>
      <p className="text-muted">
        That page does not exist (yet). The site is in active development.
      </p>
      <Link href="/">← Back home</Link>
    </div>
  );
}
