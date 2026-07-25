import { useState } from "react";
import axios from "axios";
import OtpInput from "react-otp-input";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CheckCircle, Loader2, RotateCcw } from "lucide-react";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { email } = useParams();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await axios.post(
        `http://localhost:8000/api/auth/verify-otp/${encodeURIComponent(email)}`,
        {
          email,
          otp,
        },
      );

      setIsVerified(true);
      setSuccessMessage(res.data.message);

      setTimeout(() => {
        navigate(`/change-password/${email}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearOtp = () => {
    setOtp("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-green-600">
            Verify your email
          </h1>

          <p className="mt-3 text-gray-500">
            We've sent a verification code to
          </p>

          <p className="mt-1 font-semibold text-gray-800 break-all">{email}</p>
        </div>

        <Card className="rounded-3xl border-0 shadow-2xl overflow-hidden">
          <CardHeader className="space-y-3 pb-2">
            <CardTitle className="text-3xl font-bold text-center">
              Enter OTP
            </CardTitle>

            <CardDescription className="text-center text-base">
              {isVerified
                ? "OTP verified successfully."
                : "Enter the 6-digit code sent to your email."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {isVerified ? (
              <div className="flex flex-col items-center justify-center space-y-5 py-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    Verification Successful 🎉
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Your email has been verified successfully.
                    <br />
                    Redirecting you to reset your password...
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </div>
              </div>
            ) : (
              <>
                {/* OTP INPUT */}

                <div className="flex justify-center py-2">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    shouldAutoFocus
                    renderSeparator={<span className="w-3"></span>}
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="
                          h-14
                          w-14
                          rounded-xl
                          border
                          border-gray-300
                          bg-white
                          text-center
                          text-xl
                          font-bold
                          shadow-sm
                          transition-all
                          duration-200
                          outline-none
                          focus:border-green-600
                          focus:ring-4
                          focus:ring-green-100
                          focus:scale-105
                        "
                      />
                    )}
                  />
                </div>

                {/* Buttons */}

                <div className="space-y-3">
                  <Button
                    onClick={handleVerify}
                    disabled={otp.length !== 6 || isLoading}
                    className="h-12 w-full rounded-xl bg-green-600 text-base font-semibold transition-all duration-200 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearOtp}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear OTP
                  </Button>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="border-t bg-gray-50 py-6">
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Wrong email?{" "}
                <Link
                  to="/forgot-password"
                  className="font-semibold text-green-600 transition-colors hover:text-green-700 hover:underline"
                >
                  Go back
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
