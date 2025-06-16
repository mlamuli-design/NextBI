"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Tracksession from "../Tracksession/page";

const API_IP = process.env.NEXT_PUBLIC_IP;
const API_PORT = process.env.NEXT_PUBLIC_PORT;

export default function SetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [officerId, setOfficerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true); // Ensures component only renders on client
    const id = localStorage.getItem("officer_id");
    if (!id) {
      setMessage("Officer ID not found. Please log in.");
    } else {
      setOfficerId(id);
    }
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const isValid = {
    length: newPassword.length >= 6,
    uppercase: /[A-Z]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword.length > 0,
  };

  const allValid = Object.values(isValid).every(Boolean);

  interface UpdatePasswordRequest {
    officer_id: string;
    new_password: string;
  }

  interface UpdatePasswordResponse {
    message?: string;
    [key: string]: unknown;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!allValid || !officerId) return;

    setLoading(true);
    setMessage("");

    try {
      const response: Response = await fetch(`${API_IP}:${API_PORT}/updatePassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: officerId,
          new_password: newPassword,
        } as UpdatePasswordRequest),
      });

      const data: UpdatePasswordResponse = await response.json();

      if (response.ok) {
        setMessage("Password updated successfully.");
        setTimeout(() => {
          router.push("/Main");
        }, 1000);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-300 to-sky-500 p-4">
      <Tracksession />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setMessage(""); // clear message when typing
                }}
                className={`w-full rounded-lg py-2 px-4 pr-10 focus:outline-none border ${
                  allValid || newPassword === ""
                    ? "border-gray-300"
                    : "border-red-500"
                }`}
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="text-sm mt-2">
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li
                  className={isValid.length ? "text-green-600" : "text-red-500"}
                >
                  Minimum 6 characters
                </li>
                <li
                  className={
                    isValid.uppercase ? "text-green-600" : "text-red-500"
                  }
                >
                  One uppercase character
                </li>
                <li
                  className={
                    isValid.special ? "text-green-600" : "text-red-500"
                  }
                >
                  One special character
                </li>
                <li
                  className={isValid.match ? "text-green-600" : "text-red-500"}
                >
                  Passwords must match
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMessage("");
                }}
                className={`w-full rounded-lg py-2 px-4 pr-10 focus:outline-none border ${
                  allValid || confirmPassword === ""
                    ? "border-gray-300"
                    : "border-red-500"
                }`}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={!allValid || loading}
            type="submit"
            className="w-full py-2 text-white font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Set Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm font-medium ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
