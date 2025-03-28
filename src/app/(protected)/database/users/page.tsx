'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      getUsers();
    }
  }, [mounted]);

  const getUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/get", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(Array.isArray(data) ? data : []);
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
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitEditUser = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/users/${currentUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser)
      });
      console.log("put response", response)

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update the users list
      const updatedUsers = users.map(user => 
        user.user_id === currentUser.user_id 
          ? { ...user, ...editedUser, updated_date: new Date().toISOString() } 
          : user
      );
      setUsers(updatedUsers);

      // Close modal
      setIsEditModalOpen(false);
      setCurrentUser(null);
      setEditedUser({});
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
      const response = await fetch(`/api/users/delete/${userToDelete.user_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Remove the user from the list
      const updatedUsers = users.filter(user => user.user_id !== userToDelete.user_id);
      setUsers(updatedUsers);

      // Close modal
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted) return null; 

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Users Page</h1>

      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white border border-gray-200 shadow-lg">
          <thead className="bg-[#2B2D31] text-white">
            <tr>
              {[
                "User ID", "Username", "First Name", "Last Name", "Email",
                "Phone", "Gender", "DOB", "Age", "Country", "State",
                "City", "Pincode", "Occupation", "Industry", "Income",
                "Address", "Created", "Updated", "Registration date", "Actions"
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-sm font-semibold border border-gray-300 text-center w-32"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={`${user.user_id}~${index}`} className="even:bg-gray-100 text-center hover:bg-gray-200 transition">
                  <td className="px-4 py-2 text-black border border-gray-300 w-20">{user.user_id}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">{user.username}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.first_name}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.last_name}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-48 truncate">{user.email}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.phone_number}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">{user.gender}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">{formatDate(user.dob)}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">{user.age_group}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.country}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.state}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.city}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">{user.pincode}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-40">{user.occupation}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-40">{user.industry}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.income}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-60 truncate">{user.address}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{formatDate(user.created_date)}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{formatDate(user.updated_date)}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{formatDate(user.registration_date)}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={21} className="text-center py-4 text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] text-gray-700">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's information. Click save when you're done.
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
                value={editedUser.username || ''}
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
                value={editedUser.first_name || ''}
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
                value={editedUser.last_name || ''}
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
                value={editedUser.email || ''}
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
                value={editedUser.phone_number || ''}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={submitEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={confirmDeleteUser}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;