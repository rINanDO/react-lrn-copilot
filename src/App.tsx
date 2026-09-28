import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import "./assets/generic.css";
import "./assets/wetten.css";

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
