"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import loading icon
import styles from "./Login.module.css";

const API_IP = process.env.NEXT_PUBLIC_IP;
const API_PORT = process.env.NEXT_PUBLIC_PORT;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Set error as a string, not boolean
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      router.push("/Main"); // Redirect to Main if already logged in
    }
  }, []);

  useEffect(() => {
    // Logs serverData when it updates
    if (serverData) {
      console.log("User Data from serverData state:", serverData);
    }
  }, [serverData]);



  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset any previous errors

    try {
      const response = await fetch(`${API_IP}:${API_PORT}/authentication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed"); // Set error message here
        throw new Error(data.error || "Login failed");
      }

      setServerData(data.user)

      // Ensure officer_id is stored in the session
      if (!data.user || !data.user.officer_id) {
        throw new Error("Company ID is missing in the response.");
      }

      // Store user session in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("officer_id", data.user.officer_id); // Store officer_id separately if needed

      if( data.user.initialLogin == true){
          // Redirect to New Password set
      router.push("/Newpassword");
      }
    else{
            // Redirect to dashboard
      router.push("/Main");
    }



    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);

      // Hide the error after 7 seconds
      setTimeout(() => {
        setError(null);
      }, 7000); // Set timer for 7 seconds (7 ms)
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}></div>
      <div className={styles.bottom}></div>
      <div className={styles.center}>
        <h2 className="text-1xl font-bold text-blue-400 mb-5">
          Please Sign In
        </h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-white text-xl" />
            ) : (
              "Login"
            )}
          </button>
          {error && <p className="text-red-500 ml-25 pt-7">{error}</p>}
        </form>
      </div>
      <div className={styles.imageGrid}>
        <Image
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzwIbyyKam7OXgX64ZTTayxZ18n_L01PaqVg&s"
          alt="Image 1"
          width={150}
          height={150}
        />
      </div>
      <div className={styles.imageGrid1}>
        <Image
          src="https://www.afrilabs.com/wp-content/uploads/2024/04/Logo.jpg"
          alt="Image 2"
          width={150}
          height={150}
        />
      </div>
    </div>
  );
}