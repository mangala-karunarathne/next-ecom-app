"use client";
import { getLoginFormData, handleLoginSubmit } from "@/actions/auth/login";
import { getSignupFormData, handleSignupSubmit } from "@/actions/auth/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { IAttributes } from "oneentry/dist/base/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface SignUpFormData {
  email: string;
  password: string;
  name: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function AuthForm() {
  const router = useRouter();
  const searhParams = useSearchParams();

  const [isSignUp, setiIsSignUp] = useState(true);
  const [formData, setFormData] = useState<IAttributes[]>([]);
  const [inputValues, setInputValues] = useState<
    Partial<SignUpFormData & LoginFormData>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>("Not valid");

  useEffect(() => {
    const type = searhParams.get("type");
    setiIsSignUp(type !== "login");
  }, [searhParams]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchData = isSignUp ? getSignupFormData : getLoginFormData;
    fetchData()
      .then((data) => setFormData(data))
      .catch((err) =>
        setError("Failed to loard form data. Please try again later.")
      )
      .finally(() => setIsLoading(false));
  }, [isSignUp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isSignUp) {
        if (inputValues.email && inputValues.password && inputValues.name) {
          const response = await handleSignupSubmit(
            inputValues as SignUpFormData
          );
          if ("identifier" in response) {
            setInputValues({});
            setiIsSignUp(false);
            toast("User has been created", {
              description: "You can now log in with your credentials.",
              duration: 5000,
            });
          } else {
            setError(response.message);
          }
        } else {
          setError("Please fill in all required fields.");
        }
      } else {
        if (inputValues.email && inputValues.password) {
          const response = await handleLoginSubmit(
            inputValues as LoginFormData
          );
          if (response.message) {
            setError(response.message);
          }
        } else {
          setError("Please fill in all required fields.");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setiIsSignUp(!isSignUp);
    setError(null);
    setInputValues({});
  };

  return (
    <div className="flex min-h-screen mt-7">
      <div className="w-full max-w-3xl mx-auto flex flex-col lg:flex-row p-3">
        <div>
          <div
            className="mb-8 lg:mb-12 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="className='text-gray-500 h-6 w-6 sm:h-8 sm:w-8 border-2 rounded-full p-1'" />
          </div>

          {/* Form header */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent pb-3">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8">
              {isSignUp
                ? "Join MKStore today and discover exclusive deals on your favorite products!"
                : "Welcome back to MKStore! Log in to continue your shopping journey."}
            </p>
          </div>

          {/* Form Loading  */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {formData.map((field) => (
                <div key={field.marker}>
                  <Label
                    htmlFor={field.marker}
                    className="text-base sm:text-lg text-gray-400 mb-1 sm:mb-2 block"
                  >
                    {field.localizeInfos.title}
                  </Label>
                  <Input
                    id={field.marker}
                    type={field.marker === "password" ? "password" : "text"}
                    name={field.marker}
                    className="text-base sm:text-lg p-4 sm:p-6"
                    placeholder={field.localizeInfos.title}
                    value={
                      inputValues[
                        field.marker as keyof (SignUpFormData & LoginFormData)
                      ] || ""
                    }
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              ))}

              {error && (
                <div className="text-red-500 mt-2 text-center">{error}</div>
              )}

              <div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white text-base sm:text-xl font-bold p-4 sm:p-6 rounded-md shadow-xl transition-colors duration-300 ease-in-out cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  ) : isSignUp ? (
                    "Sign Up"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Toggle form */}
          <div>
            <div className="mt-4 sm:mt-5 flex items-center justify-center">
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                {isSignUp ? "Already a member?" : "Don't have an account?"}
              </p>
              <Button
                variant="link"
                className="text-lg sm:text-xl lg:text-2xl text-gray-500 cursor-pointer"
                onClick={toggleForm}
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
