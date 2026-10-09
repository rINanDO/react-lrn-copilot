import { Alert, Box } from "@mui/material";
import type { ToestandLoadError } from "./use-toestand";

function BwbLoadError({ error }: { error: ToestandLoadError }) {
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

export default BwbLoadError;
