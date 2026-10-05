import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Wetgeving } from "../../api";
import {
  // getApiBeheerToestand,
  type Bijlage,
  type Citeertitel,
  type RegelingTekst,
  type Wettekst,
} from "../../api";
import BwbRegelingTekst from "./bwb-regeling-tekst";
import { Alert, CircularProgress, Box, Button } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import BwbWettekst from "./bwb-wettekst";
import BwbBijlage from "./bwb-bijlage";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import BwbRawText from "./bwb-raw-text";
import { getToestand } from "../../api/wettenRepository";
import type { Verdrag } from "../../api";
import BwbVerdrag from "./bwb-verdrag";
import { BwbToestandContext } from "./bwb-toestand-context";
import Footer from "../page/footer";
import SideBar from "../page/side-bar";
import BwbExpressionsModal from "./bwb-expressions-modal";

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
  const [verdragen, setVerdragen] = useState<Verdrag[] | null | undefined>(
    undefined,
  );
  const [wettekst, setWettekst] = useState<Wettekst | undefined>(undefined);
  const [bijlage, setBijlage] = useState<Bijlage[] | null | undefined>(
    undefined,
  );
  const [citeerTitel, setCiteerTitel] = useState<Citeertitel | undefined>(
    undefined,
  );
  const [toc, setToc] = useState<Wettekst | RegelingTekst | undefined>(
    undefined,
  );
  const [wetgeving, setWetgeving] = useState<Wetgeving | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [expressionsOpen, setExpressionsOpen] = useState(false);
  const [error, setError] = useState<{
    message: string;
    technical?: string;
  } | null>(null);

  useEffect(() => {
    getToestand(bwbId, expression, isToekomstig)
      .then((data) => {
        setWetgeving(data?.wetgeving);
        setVerdragen(data?.wetgeving?.verdrag);
        setRegelingTekst(data?.wetgeving?.regeling?.regelingTekst);
        setBijlage(data?.wetgeving?.regeling?.bijlage);
        setWettekst(data?.wetgeving?.wetBesluit?.wettekst);
        setCiteerTitel(data?.wetgeving?.citeertitel);
        setToc(
          data?.wetgeving?.regeling?.regelingTekst ??
            data?.wetgeving?.wetBesluit?.wettekst,
        );
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
    <>
      <div className="preview">
        <a
          href={`https://repository.officiele-overheidspublicaties.nl/${isToekomstig ? "BWBTT" : "BWB"}/${bwbId}/${expression}/xml/${bwbId}_${expression}.xml`}
        >
          {bwbId}_{expression}.xml
        </a>
        <div className="container columns columns--sticky-sidebar row">
          <BwbToestandContext.Provider
            value={{ bwbId, expression, isToekomstig }}
          >
            <SideBar wetgeving={wetgeving}></SideBar>
            <div id="content">
              <div id="regeling">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Heading level={1}>
                    <BwbRawText
                      id="citeerTitel"
                      rawText={citeerTitel?.text?.join(" ")}
                    />
                  </Heading>
                  {!isToekomstig && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<HistoryIcon />}
                      onClick={() => setExpressionsOpen(true)}
                      sx={{ flexShrink: 0 }}
                    >
                      Andere versies
                    </Button>
                  )}
                </Box>
                <BwbExpressionsModal
                  bwbId={bwbId}
                  expression={expression}
                  open={expressionsOpen}
                  onClose={() => setExpressionsOpen(false)}
                />
                <div className="wetgeving">
                  {verdragen?.map((verdrag) => (
                    <BwbVerdrag bwbId={bwbId} verdrag={verdrag} />
                  ))}
                  <BwbRegelingTekst
                    bwbId={bwbId}
                    regelingTekst={regelingTekst}
                  />
                  <BwbWettekst bwbId={bwbId} wettekst={wettekst} />
                  {bijlage?.map((bijlage, index) => (
                    <BwbBijlage key={`bijlage_${index}`} bijlage={bijlage} />
                  ))}
                </div>
              </div>
            </div>
          </BwbToestandContext.Provider>
        </div>
        <Footer></Footer>
      </div>
    </>
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
