import { useState } from "react";
import { Box, Button } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import type { Citeertitel } from "../../api";
import DocumentTitle from "../document/document-title";
import BwbExpressionsModal from "./bwb-expressions-modal";

interface BwbToestandHeaderProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
  citeertitel?: Citeertitel;
}

/** The citeertitel heading, with access to other versions for a current toestand. */
function BwbToestandHeader({
  bwbId,
  expression,
  isToekomstig,
  citeertitel,
}: BwbToestandHeaderProps) {
  const [expressionsOpen, setExpressionsOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <DocumentTitle citeertitel={citeertitel} />
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
    </>
  );
}

export default BwbToestandHeader;
