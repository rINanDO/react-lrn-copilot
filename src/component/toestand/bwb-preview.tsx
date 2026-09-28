import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  // getApiBeheerToestand,
  type Bijlage,
  type Citeertitel,
  type RegelingTekst,
  type Wettekst,
} from "../../api";
import BwbRegelingTekst from "./bwb-regeling-tekst";
import { Alert, CircularProgress, Box } from "@mui/material";
import BwbWettekst from "./bwb-wettekst";
import BwbBijlage from "./bwb-bijlage";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import BwbRawText from "./bwb-raw-text";
import { getToestand } from "../../api/wettenRepository";

interface BwbPreviewContentProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
}

export function BwbPreviewContent({
  bwbId,
  expression,
  isToekomstig,
}: BwbPreviewContentProps) {
  const [regelingTekst, setRegelingTekst] = useState<RegelingTekst | undefined>(
    undefined,
  );
  const [wettekst, setWettekst] = useState<Wettekst | undefined>(undefined);
  const [bijlage, setBijlage] = useState<Bijlage[] | null | undefined>(
    undefined,
  );
  const [citeerTitel, setCiteerTitel] = useState<Citeertitel | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    technical?: string;
  } | null>(null);

  useEffect(() => {
    getToestand(bwbId, expression, isToekomstig)
      .then((data) => {
        setRegelingTekst(data?.wetgeving?.regeling?.regelingTekst);
        setBijlage(data?.wetgeving?.regeling?.bijlage);
        setWettekst(data?.wetgeving?.wetBesluit?.wettekst);
        setCiteerTitel(data?.wetgeving?.citeertitel);
      })
      .catch((err: unknown) => {
        let message = "Er is een fout opgetreden bij het laden van de preview.";
        let technical: string | undefined;

        if (typeof err === "string") {
          technical = err;
        } else if (err && typeof err === "object") {
          type HttpError = {
            response?: {
              status?: number;
              data?: unknown;
              _data?: unknown;
              statusText?: string;
            };
            error?: {
              response?: {
                status?: number;
                data?: unknown;
                _data?: unknown;
                statusText?: string;
              };
            };
          };
          const httpErr = err as HttpError;
          const res = httpErr?.response ?? httpErr?.error?.response;
          if (res) {
            const body = res.data ?? res._data ?? res.statusText ?? "";
            const bodyStr =
              typeof body === "string" ? body : JSON.stringify(body);
            technical = `HTTP ${res.status}: ${bodyStr}`;
          } else if (err instanceof Error) {
            message = err.message;
          }
        }

        setError({ message, technical });
      })
      .finally(() => setLoading(false));
  }, [bwbId, expression, isToekomstig]);

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
        {error.message}
        {import.meta.env.DEV && error.technical && (
          <Box
            component="pre"
            sx={{
              mt: 1,
              fontSize: 11,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              opacity: 0.8,
            }}
          >
            {error.technical}
          </Box>
        )}
      </Alert>
    );
  }

  return (
    <div className="bwb-preview">
      {bwbId}_{expression}.xml
      <Heading level={1}>
        <BwbRawText id="citeerTitel" rawText={citeerTitel?.text?.join(" ")} />
      </Heading>
      <div className="wetgeving">
        <BwbRegelingTekst bwbId={bwbId} regelingTekst={regelingTekst} />
        <BwbWettekst bwbId={bwbId} wettekst={wettekst} />
        {bijlage?.map((bijlage, index) => (
          <BwbBijlage key={`bijlage_${index}`} bijlage={bijlage} />
        ))}
      </div>
    </div>
  );
}

function BwbPreview({
  isToekomstig: isToekomstigOverride,
}: { isToekomstig?: boolean } = {}) {
  const params = useParams();
  const bwbId = params.bwbid ?? "";
  const expression = params.expression ?? "";
  const isToekomstig = isToekomstigOverride ?? params.isToekomstig === "true";

  return (
    <BwbPreviewContent
      key={`${bwbId}:${expression}:${isToekomstig}`}
      bwbId={bwbId}
      expression={expression}
      isToekomstig={isToekomstig}
    />
  );
}

export default BwbPreview;
