import { getData } from "@/context/UserContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user } = getData();
  return <div>{user ? children : <Navigate to={"/login"} />}</div>;
}

export default ProtectedRoute;
