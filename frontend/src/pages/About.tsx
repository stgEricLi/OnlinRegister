import React from "react";
import { useApi } from "../hooks/useApi";
import { userService } from "../services/userService";
import type { User } from "../services/userService";

const About: React.FC = () => {
  const {
    data: users,
    loading,
    error,
  } = useApi<User[]>(() => userService.getUsers(), []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>About Page</h1>
      <p>This page demonstrates axios usage by fetching users from an API.</p>

      <h2>Users:</h2>
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
      )}
    </div>
  );
};

export default About;
