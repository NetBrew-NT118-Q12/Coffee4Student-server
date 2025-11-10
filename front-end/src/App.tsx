import { BrowserRouter } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Routers from "./router/Routers";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routers />
      </BrowserRouter>
    </>
  );
};

export default App;
