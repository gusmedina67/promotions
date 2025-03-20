import { useEffect } from "react";
import AppRoutes from "./routes/Routes";

export default function App() {
  useEffect(() => {
    document.title = "ChilSpot";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppRoutes />
    </div>
  );
}
