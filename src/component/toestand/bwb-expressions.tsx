import { useMemo } from "react";
import { generatePath, Link, Navigate, useParams } from "react-router-dom";
import { Alert, Box, CircularProgress } from "@mui/material";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import { appRoutes } from "../../router/routes";
import { isGeldend, useManifestExpressions } from "./use-manifest-expressions";

export function BwbExpressionsContent({ bwbId }: { bwbId: string }) {
  const { expressions, loading, error } = useManifestExpressions(bwbId);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

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

  // Go straight to the version in force today. Expressions are newest first,
  // so if several qualify the most recent wins.
  const geldend = expressions.find((expression) =>
    isGeldend(expression, today),
  );
  if (geldend) {
    return (
      <Navigate
        replace
        to={generatePath(appRoutes.bwb, {
          bwbid: bwbId,
          expression: geldend.label,
        })}
      />
    );
  }

  // No version in force (e.g. a withdrawn regulation): list them all.
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
