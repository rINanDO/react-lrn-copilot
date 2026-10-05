import { useEffect, useState } from "react";
import {
  getManifest,
  type ManifestExpression,
} from "../../api/wettenRepository";

/** True when the expression is in force on `today` (`yyyy-mm-dd`). */
export function isGeldend(
  expression: ManifestExpression,
  today: string,
): boolean {
  return (
    (expression.datumInwerkingtreding ?? "") <= today &&
    (!expression.einddatum || expression.einddatum >= today)
  );
}

/** Loads the expressions of a BWB work from its manifest, newest first. Skips loading while `enabled` is false. */
export function useManifestExpressions(bwbId: string, enabled = true) {
  const [expressions, setExpressions] = useState<ManifestExpression[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getManifest(bwbId, { signal: controller.signal })
      .then((manifest) => setExpressions([...manifest.expressions].reverse()))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Er is een fout opgetreden bij het laden van de versies.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [bwbId, enabled]);

  return { expressions, loading, error };
}
