import { useNavigate } from "react-router-dom";
import { useIsAuthenticationStore } from "../store/authenticate";
import Navbar from "./Navbar";
import { useEffect } from "react";
import Tabs from "./Tabs";

export default function MainDapp() {
  const authenticated = useIsAuthenticationStore(
    (state) => state.authenticated
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate("/authenticate");
    }
  }, []);
  return (
    <div className="bg-background flex flex-col min-h-screen text-white">
      <Navbar />
      <Tabs />
    </div>
  );
}
