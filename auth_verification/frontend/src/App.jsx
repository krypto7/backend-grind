import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Verify from "./pages/Verify";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgetPassword from "./pages/ForgetPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Navbar /> <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/verify",
      element: <VerifyEmail />,
    },
    {
      path: "/verify-email/:token",
      element: <Verify />,
    },
    {
      path: "/verify-otp/:email",
      element: <VerifyOTP />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/forgot-password",
      element: <ForgetPassword />,
    },
    {
      path: "/change-password/:email",
      element: <ChangePassword />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
