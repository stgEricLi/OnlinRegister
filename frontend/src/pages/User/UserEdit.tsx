import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import RegisterForm from "../../components/user/RegisterForm";
//import type { RegisterRequest } from "../../interfaces/IAuth";
import type { RegisteredUser } from "../../interfaces/IUser";
import {
  getSingleUser,
  selectedUser,
  getUsersLoading,
  getUsersError,
  setError,
  clearError,
  updateUser,
} from "../../store/slices/userSlice";

const UserEdit: React.FC = () => {
  // Uses React Router's useParams hook to extract the userId from the URL
  //const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();

  // Get user from Redux store
  const user = useAppSelector(selectedUser);
  console.log("currentSelectedUser:", user);
  // Get error message from store
  const error = useAppSelector(getUsersError);

  //const users = useAppSelector(allUsers);
  const isLoading = useAppSelector(getUsersLoading);
  //console.log(`Current User ID: ${currentSelectedUser?.id}`);

  //const userId = currentSelectedUser?.id;
  // Try to find user in the users list first
  //const userFromList = users.find((user) => user.id.toString() === userId);
  //const user = currentSelectedUser;

  //const [submitError, setSubmitError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (userId && !user) {
  //     // If user not in store, fetch from API
  //     dispatch(getSingleUser(parseInt(userId)));
  //   }
  // }, [userId, user, dispatch]);

  const handleSubmit = async (formData: RegisteredUser) => {
    // Handle form submission - update user
    //console.log("Updating user:", formData);

    if (!user) {
      dispatch(setError("No user selected for update"));
      console.error("No user selected for update");
      return;
    }

    try {
      // Clear any previous errors
      dispatch(clearError());

      // Create updated user data object
      const updateData: RegisteredUser = {
        id: user.id,
        username: formData.username,
        email: formData.email,
        role: formData.role,
      };

      console.log("EditUser - dispatching updateUser with:", updateData);
      // 🔄 Calling Update User THUNK → httpService.put(`/users/${id}`, userData)
      const result = await dispatch(
        updateUser({
          id: user.id.toString(),
          userData: updateData,
        })
      );

      // Check update user cases region at userSlice (line 161)
      if (updateUser.fulfilled.match(result)) {
        console.log("✅ User updated successfully:", result.payload);
      } else {
        console.error("❌ Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (!user) {
    return <div>No User Selected</div>;
  }

  // if (isLoading) {
  //   return <div>Loading user...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  // if (!user) {
  //   return <div>User not found</div>;
  // }

  if (!user) {
    return <div>No user selected for editing</div>;
  }

  return (
    <>
      {error && <p className="text-red-600">{error}</p>}
      {isLoading && <p className="text-blue-500">Processing...</p>}
      <RegisterForm user={user} onSubmit={handleSubmit} showRole={true} />
    </>
  );
};

export default UserEdit;
