import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Militares from "./pages/Militares";
import MilitarForm from "./pages/MilitarForm";
import Importacao from "./pages/Importacao";
import Afastamentos from "./pages/Afastamentos";
import Reordenacao from "./pages/Reordenacao";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/militares"} component={Militares} />
      <Route path={"/militares/novo"} component={(props: any) => <MilitarForm {...props} />} />
      <Route path={"/militares/:id"} component={(props: any) => <MilitarForm {...props} />} />
      <Route path={"/importacao"} component={Importacao} />
      <Route path={"/afastamentos"} component={Afastamentos} />
      <Route path={"/reordenacao"} component={Reordenacao} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
