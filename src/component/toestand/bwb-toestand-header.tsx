import { useState } from "react";
import { Box, Button } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { Heading } from "@rijkshuisstijl-community/components-react/no-side-effects";
import type { Citeertitel } from "../../api";
import BwbRawText from "./bwb-raw-text";
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
        <Heading level={1}>
          <BwbRawText id="citeerTitel" rawText={citeertitel?.text?.join(" ")} />
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
    </>
  );
}

export default BwbToestandHeader;
