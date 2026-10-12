import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ToestandView } from "./toestand-view";
import "../elements/wetten.css";

interface ToestandModalProps {
  bwbId: string;
  expression: string;
  isToekomstig: boolean;
  onClose: () => void;
}

function ToestandModal({ bwbId, expression, isToekomstig, onClose }: ToestandModalProps) {
  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {bwbId} — {expression}
        <IconButton size="small" onClick={onClose} aria-label="Sluiten">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: "auto", maxHeight: "80vh" }}>
        <ToestandView bwbId={bwbId} expression={expression} isToekomstig={isToekomstig} />
      </DialogContent>
    </Dialog>
  );
}

export default ToestandModal;
