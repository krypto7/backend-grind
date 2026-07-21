import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function Verify() {
  const { token } = useParams();
  const [status, setStatus] = useState("Verify...");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("===token", token);
    const verifyEmail = async () => {
      try {
        const res = await axios.post(
          `http://localhost:8000/api/auth/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.data.success) {
          setStatus("Email verification successfully");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setStatus("invalid token");
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="relative w-full bg-green-300 overflow-hidden">
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md text-center w-[90%] max-w-md">
          <h2 className="text-xl font-semibold text-gray-800">{status}</h2>
        </div>
      </div>
    </div>
  );
}

export default Verify;
