import React from "react";
import { useDispatch } from "react-redux";
import httpService from "../services/httpService";
import { clearAuthState } from "../store/slices/authSlice";
// import { useApi } from "../hooks/useApi";
// import { userService } from "../services/userService";
// import type { User } from "../services/userService";

const About: React.FC = () => {
  const dispatch = useDispatch();

  // const {
  //   data: users,
  //   loading,
  //   error,
  // } = useApi<User[]>(() => userService.getUsers(), []);

  // if (loading) return <div>Loading users...</div>;
  // if (error) return <div>Error: {error}</div>;

  const handleClearAuthToken = () => {
    httpService.clearAuthToken();
    dispatch(clearAuthState());
    console.log("Auth token and state cleared");
  };

  const handleTestDebugAuth = async () => {
    try {
      console.log("🔍 Testing debug auth endpoint...");
      const response = await httpService.get("/users/debug/auth");
      console.log("✅ Debug Auth Response:", response);
      console.log("📋 Claims Count:", response.totalClaims);
      console.log("👤 User Info:", response.commonClaims);
      console.log("🔐 All Claims:", response.allClaims);
    } catch (error) {
      console.error("❌ Debug Auth Error:", error);
    }
  };

  const handleTestBackendConnection = async () => {
    try {
      console.log("🌐 Testing backend connection...");
      console.log("📍 Base URL:", httpService.getBaseURL());

      // Test the auth endpoint directly
      const testUrl = httpService.getBaseURL() + "auth/login";
      console.log("🎯 Testing URL:", testUrl);

      const response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.com",
          password: "test123",
        }),
      });

      console.log("📡 Response status:", response.status, response.statusText);
      const responseText = await response.text();
      console.log("📄 Response body:", responseText);

      if (response.status === 400 || response.status === 401) {
        console.log("✅ Backend is reachable (got expected auth error)");
      } else if (response.ok) {
        console.log("✅ Backend is reachable and responded successfully");
      } else {
        console.log(
          "⚠️ Backend responded with unexpected status:",
          response.status
        );
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      console.log("🔧 Troubleshooting:");
      console.log("1. Is your backend server running on port 5147?");
      console.log("2. Check the base URL:", httpService.getBaseURL());
      console.log("3. Check for CORS issues");
      console.log("4. Try running: dotnet run (in backend directory)");
    }
  };

  return (
    <div>
      <h1>About Page</h1>
      <p>This page demonstrates axios usage by fetching users from an API.</p>

      <div className="space-y-4 mt-4">
        <button
          onClick={handleTestBackendConnection}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Test Backend Connection
        </button>

        <button
          onClick={handleTestDebugAuth}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Test Debug Auth Endpoint
        </button>

        <button
          onClick={handleClearAuthToken}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Clear Auth Token
        </button>
      </div>

      {/* <h2>Users:</h2>
      {users && users.length > 0 ? (
        <ul>
          {users.slice(0, 5).map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong> ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )} */}
    </div>
  );
};

export default About;
