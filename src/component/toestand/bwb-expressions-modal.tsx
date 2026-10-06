import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState } from "react";
import { generatePath, Link } from "react-router-dom";
import { appRoutes } from "../../router/routes";
import type { ManifestExpression } from "../../api/wettenRepository";
import { isGeldend, useManifestExpressions } from "./use-manifest-expressions";

const PAGE_SIZE = 10;

interface BwbExpressionsModalProps {
  bwbId: string;
  /** The expression being shown; highlighted in the list. */
  expression: string;
  open: boolean;
  onClose: () => void;
}

function BwbExpressionsModal({
  bwbId,
  expression,
  open,
  onClose,
}: BwbExpressionsModalProps) {
  // Only fetch the manifest once the modal is opened.
  const { expressions, loading, error } = useManifestExpressions(bwbId, open);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Versies van {bwbId}
        <IconButton size="small" onClick={onClose} aria-label="Sluiten">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <BwbExpressionsList
            bwbId={bwbId}
            expression={expression}
            expressions={expressions}
            onSelect={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Matches the label and dates, so both `2023-07` and `_1` find versions. */
function matches(item: ManifestExpression, query: string): boolean {
  return [item.label, item.datumInwerkingtreding, item.einddatum].some(
    (value) => value?.toLowerCase().includes(query),
  );
}

/**
 * Searchable, paged list. Rendered inside the Dialog, which unmounts it on
 * close, so the search and page reset every time the modal opens.
 */
function BwbExpressionsList({
  bwbId,
  expression,
  expressions,
  onSelect,
}: {
  bwbId: string;
  expression: string;
  expressions: ManifestExpression[];
  onSelect: () => void;
}) {
  const [query, setQuery] = useState("");
  // Start on the page holding the current expression.
  const [page, setPage] = useState(() => {
    const index = expressions.findIndex((item) => item.label === expression);
    return index < 0 ? 1 : Math.floor(index / PAGE_SIZE) + 1;
  });
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? expressions.filter((item) => matches(item, normalizedQuery))
    : expressions;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <>
      <Box sx={{ px: 2, pt: 2 }}>
        <TextField
          type="search"
          label="Zoek versie of datum"
          placeholder="bijv. 2023 of 2023-07-01"
          size="small"
          fullWidth
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {filtered.length} van {expressions.length} versies
        </Typography>
      </Box>
      {filtered.length === 0 ? (
        <Typography sx={{ px: 2, py: 3 }} color="text.secondary">
          Geen versies gevonden.
        </Typography>
      ) : (
        <List dense>
          {visible.map((item) => {
            const isCurrent = item.label === expression;
            return (
              <ListItemButton
                key={item.label}
                component={Link}
                to={generatePath(appRoutes.bwb, {
                  bwbid: bwbId,
                  expression: item.label,
                })}
                selected={isCurrent}
                aria-current={isCurrent ? "page" : undefined}
                onClick={onSelect}
              >
                <ListItemText
                  primary={item.label}
                  secondary={`In werking: ${item.datumInwerkingtreding ?? "-"}${
                    item.einddatum ? ` — tot en met ${item.einddatum}` : ""
                  }`}
                  slotProps={{
                    primary: {
                      sx: { fontWeight: isCurrent ? 700 : undefined },
                    },
                  }}
                />
                {isCurrent && (
                  <Chip label="Huidig" color="primary" size="small" />
                )}
                {isGeldend(item, today) && (
                  <Chip label="Geldend" size="small" sx={{ ml: 1 }} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      )}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(_, value) => setPage(value)}
            size="small"
          />
        </Box>
      )}
    </>
  );
}

export default BwbExpressionsModal;
