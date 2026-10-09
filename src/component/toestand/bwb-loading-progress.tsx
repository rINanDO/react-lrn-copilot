import { Box, LinearProgress, Typography } from "@mui/material";
import type { ToestandProgress } from "../../api/wettenRepository";

function formatMegabytes(bytes: number): string {
  return (bytes / 1_000_000).toLocaleString("nl-NL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function BwbLoadingProgress({ progress }: { progress?: ToestandProgress }) {
  const total =
    progress?.total && progress.loaded <= progress.total
      ? progress.total
      : undefined;
  let label = "Regeling laden…";
  if (progress?.phase === "parsing") {
    label = "Regeling verwerken…";
  } else if (progress) {
    label = total
      ? `Regeling laden… ${formatMegabytes(progress.loaded)} van ${formatMegabytes(total)} MB`
      : `Regeling laden… ${formatMegabytes(progress.loaded)} MB`;
  }
  const determinate = progress?.phase === "downloading" && total;

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }} role="status">
        {label}
      </Typography>
      <LinearProgress
        aria-label="Voortgang laden regeling"
        variant={determinate ? "determinate" : "indeterminate"}
        value={determinate ? (progress.loaded / total) * 100 : undefined}
      />
    </Box>
  );
}

export default BwbLoadingProgress;
