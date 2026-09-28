import { useState } from "react";

import "./assets/generic.css";
import "./assets/wetten.css";
import { BwbPreviewContent } from "./component/toestand/bwb-preview";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BwbPreviewContent
        bwbId="BWBR0020368"
        expression="2026-09-01_0"
        isToekomstig={false}
      />
    </>
  );
}

export default App;
