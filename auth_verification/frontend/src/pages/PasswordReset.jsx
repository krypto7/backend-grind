import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// import { useState } from "react";

function PasswordReset() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8000/api/auth/forgot-password`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (res.data.success) {
        navigate("/home");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-green-100 overflow-hidden">
      <div className="min-h-screen flex flex-col to-muted/20">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2 flex flex-col items-center">
              <h1 className="text-3xl font-bold tracking-tight text-green-600">
                Reset Your Password
              </h1>

              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Reset Password</CardTitle>
                  <CardDescription>
                    Enter your email below to receive a password reset link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="newPassword">New Password</Label>
                      </div>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter your new password"
                          required
                        />
                        <button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleNewPassword}
                          className="absolute right-0 top-0 h-full px-3"
                        >
                          <Eye />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                      </div>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleConfirmPassword}
                          className="absolute right-0 top-0 h-full px-3"
                        >
                          <Eye />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        resetting password
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
