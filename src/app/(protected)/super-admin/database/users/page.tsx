"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


// Define a more specific type for the user
interface User {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  dob: string | null;
  age_group: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  occupation: string;
  industry: string;
  income: string;
  address: string;
  created_date: string | null;
  updated_date: string | null;
  registration_date: string | null;
}

const UsersPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      getUsers(page);
    }
  }, [mounted,page]);

  const getUsers = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/get?page=${pageNumber}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(data?.data);
      setTotalPages(data?.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Edit User Functionality
  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setEditedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitEditUser = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/users/${currentUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser),
      });
      console.log("put response", response);

      if (!response.ok) {
        toast.error("Failed to update user");
        throw new Error("Failed to update user");
      }

      // Update the users list
      const updatedUsers = users.map((user) =>
        user.user_id === currentUser.user_id
          ? { ...user, ...editedUser, updated_date: new Date().toISOString() }
          : user
      );
      setUsers(updatedUsers);

      // Close modal
      setIsEditModalOpen(false);
      setCurrentUser(null);
      setEditedUser({});
      toast.success("User updated successfully");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Delete User Functionality
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/users/${userToDelete.user_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        toast.error("Failed to delete user");
        throw new Error("Failed to delete user");
      }

      const data = await response.json();
      // Remove the user from the list
      const updatedUsers = users.filter(
        (user) => user.user_id !== userToDelete.user_id
      );
      setUsers(updatedUsers);
      toast.success(data.message);
      // Close modal
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 ">
          <h1 className="text-2xl font-bold">Users Data</h1>
          <div>
            <Input type="text" placeholder="Search User" />
          </div>
        </div>

        {/* Added overflow-x-auto here */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e8a4c] text-white">
                  {[
                    "User ID",
                    "Username",
                    "First Name",
                    "Last Name",
                    "Email",
                    "Phone",
                    "Gender",
                    "DOB",
                    "Age",
                    "Country",
                    "State",
                    "City",
                    "Pincode",
                    "Occupation",
                    "Industry",
                    "Income",
                    "Address",
                    "Created",
                    "Updated",
                    "Registration",
                    "Actions",
                  ].map((header, index) => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-sm font-semibold text-left border-r border-[#1e8a4c]/30 ${
                        index < 3
                          ? "sticky left-0 z-10 bg-[#1e8a4c]"
                          : index === 20
                          ? "sticky right-0 z-10 bg-[#1e8a4c]"
                          : ""
                      } ${
                        index === 0
                          ? "left-0"
                          : index === 1
                          ? "left-[100px]"
                          : index === 2
                          ? "left-[200px]"
                          : ""
                      }`}
                      style={{ minWidth: index < 3 ? "100px" : undefined }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={21} className="text-center py-4 text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={21} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user, index) => (
                    <tr
                      key={`${user.user_id}~${index}`}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Sticky left columns */}
                      <td
                        className={`px-4 py-2 text-sm border-r border-gray-200 sticky left-0 z-10 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{ minWidth: "100px" }}
                      >
                        {user.user_id}
                      </td>
                      <td
                        className={`px-4 py-2 text-sm border-r border-gray-200 sticky left-[100px] z-10 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{ minWidth: "100px" }}
                      >
                        {user.username}
                      </td>
                      <td
                        className={`px-4 py-2 text-sm border-r border-gray-200 sticky left-[200px] z-10 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{ minWidth: "100px" }}
                      >
                        {user.first_name}
                      </td>

                      {/* Scrolling columns */}
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.last_name}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[150px] truncate">
                        {user.email}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[120px] truncate">
                        {user.phone_number}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[100px] truncate">
                        {user.gender}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[100px] truncate">
                        {formatDate(user.dob)}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[80px] truncate">
                        {user.age_group}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.country}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.state}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.city}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.pincode}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.occupation}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.industry}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">
                        {user.income}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[250px] truncate">
                        {user.address}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[120px] truncate">
                        {formatDate(user.created_date)}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[120px] truncate">
                        {formatDate(user.updated_date)}
                      </td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200 max-w-[120px] truncate">
                        {formatDate(user.registration_date)}
                      </td>

                      {/* Sticky right column */}
                      <td
                        className={`px-4 py-2 text-sm sticky right-0 z-10 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={21} className="text-center py-4 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* paginetion */}
          <div className="flex justify-between items-center mt-4">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's information. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={editedUser.username || ""}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                First Name
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={editedUser.first_name || ""}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={editedUser.last_name || ""}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={editedUser.email || ""}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={editedUser.phone_number || ""}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={submitEditUser}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              onClick={confirmDeleteUser}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
