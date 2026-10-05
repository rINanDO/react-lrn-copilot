import { useEffect, useState } from "react";
import { generatePath, Link, useParams } from "react-router-dom";
import { Alert, Box, CircularProgress } from "@mui/material";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import {
  getManifest,
  type ManifestExpression,
} from "../../api/wettenRepository";
import { appRoutes } from "../../router/routes";

function isGeldend(expression: ManifestExpression, today: string): boolean {
  return (
    (expression.datumInwerkingtreding ?? "") <= today &&
    (!expression.einddatum || expression.einddatum >= today)
  );
}

export function BwbExpressionsContent({ bwbId }: { bwbId: string }) {
  const [expressions, setExpressions] = useState<ManifestExpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getManifest(bwbId, { signal: controller.signal })
      .then((manifest) =>
        // Newest first.
        setExpressions([...manifest.expressions].reverse()),
      )
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
  }, [bwbId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="bwb-preview">
      <Heading level={1}>{bwbId}</Heading>
      {expressions.length === 0 ? (
        <p>Geen versies gevonden.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Versie</th>
              <th>Inwerkingtreding</th>
              <th>Einddatum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expressions.map((expression) => (
              <tr key={expression.label}>
                <td>
                  <Link
                    to={generatePath(appRoutes.bwb, {
                      bwbid: bwbId,
                      expression: expression.label,
                    })}
                  >
                    {expression.label}
                  </Link>
                </td>
                <td>{expression.datumInwerkingtreding}</td>
                <td>{expression.einddatum}</td>
                <td>{isGeldend(expression, today) ? "Geldend" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function BwbExpressions() {
  const bwbId = useParams().bwbid ?? "";
  return <BwbExpressionsContent key={bwbId} bwbId={bwbId} />;
}

export default BwbExpressions;
