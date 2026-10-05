import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { BwbPreviewContent } from "./bwb-preview";
import "./wetten.css";

interface BwbPreviewModalProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
  onClose: () => void;
}

function BwbPreviewModal({ bwbId, expression, isToekomstig, onClose }: BwbPreviewModalProps) {
  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {bwbId} — {expression}
        <IconButton size="small" onClick={onClose} aria-label="Sluiten">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: "auto", maxHeight: "80vh" }}>
        <BwbPreviewContent bwbId={bwbId} expression={expression} isToekomstig={isToekomstig} />
      </DialogContent>
    </Dialog>
  );
}

export default BwbPreviewModal;
