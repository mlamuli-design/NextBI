"use client";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Sidebar from "../Sidenav/page";
import Tracksession from "../Tracksession/page";

interface Officer {
  officer_id: number;
  officer_name: string;
  email: string;
}

const API_IP = process.env.NEXT_PUBLIC_IP;
const API_PORT = process.env.NEXT_PUBLIC_PORT;

export default function Home() {
  useEffect(() => {
    const officerId = localStorage.getItem("officer_id");

    if (!officerId) {
      console.log("Officer ID is missing from session.");
      return;
    }
  }, []);

  // State for users, loading, and error handling
  const [users, setUsers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal AddUser
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    officer_name: "",
    email: ""
  });

  // State for modal visibility and selected user data
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selecteduser, setSelectedUser] = useState<Officer | null>(null);
  const [editeduser, setEditedUser] = useState<Partial<Officer>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Items per page (can be adjusted)

  // Fetch user data from API
  const getUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_IP}:${API_PORT}/getUsers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    getUserData();
  }, []);

  // Calculate index range for pagination
  const indexOfLastCompany = currentPage * itemsPerPage;
  const indexOfFirstCompany = indexOfLastCompany - itemsPerPage;
  const currentCompanies = users.slice(indexOfFirstCompany, indexOfLastCompany);

  // Handlers for action buttons
  const handleEdit = (user: Officer) => {
    setSelectedUser(user);
    setEditedUser({});
    setIsEditModalOpen(true);
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Close the modal
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleSaveChanges = async () => {
    // Merge original and edited data
    const mergedData = { ...selecteduser, ...editeduser };

    try {
      const response = await fetch(`${API_IP}:${API_PORT}/updateusers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedData),
      });

      if (response.ok) {
        alert("Officer details updated successfully");
        setEditedUser({}); // 🔄 Clear inputs
        getUserData();
        closeEditModal(); // Close the modal after saving
      } else {
        alert("Failed to update officer details");
      }
    } catch (error) {
      console.log("Error updating officer:", error);
    }
  };

    const handleAdduser = async () => {
            try {
              const response = await fetch(`${API_IP}:${API_PORT}/addUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
              });

              if (response.ok) {
                alert("User added successfully");
                setNewUser({ officer_name: "", email: "" }); // Clear input
                setIsAddModalOpen(false);
                getUserData(); // Refresh table
              } else {
                alert("Failed to add user");
              }
            } catch (error) {
              console.error("Error adding user:", error);
            }
          }

  return (
    <div className="flex min-h-screen bg-gray-50">
        <Tracksession />
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-[60px] p-8">
        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
<div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold text-gray-800">Officers</h2>
  <div className="flex items-center gap-4">
    <div className="text-sm text-gray-500">
      Showing {indexOfFirstCompany + 1} to{" "}
      {Math.min(indexOfLastCompany, users.length)} of {users.length} entries
    </div>
    <button
      onClick={() => setIsAddModalOpen(true)}
      className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition text-sm"
    >
      + Add User
    </button>
  </div>
</div>


          {/* Loading and Error Handling */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Officer Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Officer Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Officer ID
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentCompanies.map((company: Officer) => (
                      <tr
                        key={company.officer_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {company.officer_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {company.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {company.officer_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => handleEdit(company)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-colors`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-colors`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-full transform transition-all scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Add Officer</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 text-lg transition-colors"
                >
                  ✖
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={newUser.officer_name}
                    onChange={(e) => setNewUser({ ...newUser, officer_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Enter officer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdduser}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selecteduser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-full transform transition-all scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Officer Details</h2>
                <button 
                  onClick={closeEditModal} 
                  className="text-gray-500 hover:text-gray-700 text-lg transition-colors"
                >
                  ✖
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={editeduser.officer_name || selecteduser.officer_name}
                    onChange={(e) => setEditedUser({ ...editeduser, officer_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editeduser.email || selecteduser.email}
                    onChange={(e) => setEditedUser({ ...editeduser, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
