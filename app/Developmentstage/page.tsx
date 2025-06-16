"use client";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Sidenav/page";
import Tracksession from "../Tracksession/page";

interface DevelopmentStage {
  dev_id: number;
  dev_type: string;
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

  // State for stage, loading, and error handling
  const [stage, setStage] = useState<DevelopmentStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal Addstage
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newstage, setNewstage] = useState({
    stage_name: "",
  });

  // State for modal visibility and selected stage data
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedstage, setSelectedstage] = useState<DevelopmentStage | null>(null);
  const [editedstage, setEditedstage] = useState<Partial<DevelopmentStage>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Items per page (can be adjusted)

  // Fetch stage data from API
  const getstageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_IP}:${API_PORT}/getBusinessDevelopment`, {
        method: "GET", // Use GET since no body is needed
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }

      const data = await response.json();
      setStage(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    getstageData();
  }, []);

  // Calculate index range for pagination
  const indexOfLastCompany = currentPage * itemsPerPage;
  const indexOfFirstCompany = indexOfLastCompany - itemsPerPage;
  const currentCompanies = stage.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );

  // Handlers for action buttons
  const handleEdit = (stage: DevelopmentStage) => {
    setSelectedstage(stage);
    setEditedstage({});
    setIsEditModalOpen(true);
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(stage.length / itemsPerPage);

  // Close the modal
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleSaveChanges = async () => {
    // Merge original and edited data
    const mergedData = { ...selectedstage, ...editedstage };

    try {
      const response = await fetch(`${API_IP}:${API_PORT}/updatestage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedData),
      });

      if (response.ok) {
        alert("stage details updated successfully");
        setEditedstage({}); // 🔄 Clear inputs
        getstageData();
        closeEditModal(); // Close the modal after saving
      } else {
        alert("Failed to update stage details");
      }
    } catch (error) {
      console.log("Error updating stage:", error);
    }
  };

  const handleAddstage = async () => {
    try {
      const response = await fetch(`${API_IP}:${API_PORT}/addstage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newstage),
      });

      if (response.ok) {
        alert("stage added successfully");
        setNewstage({ stage_name: "" }); // Clear input
        setIsAddModalOpen(false);
        getstageData(); // Refresh table
      } else {
        alert("Failed to add stage");
      }
    } catch (error) {
      console.error("Error adding stage:", error);
    }
  };

const handleDelete = async (stageId: number) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this stage?"
  );
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_IP}:${API_PORT}/deletestage/${stageId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("stage deleted successfully");
      getstageData(); // Refresh list
    } else {
      alert("Failed to delete stage");
    }
  } catch (error) {
    console.error("Error deleting stage:", error);
  }
};


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Tracksession />
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-[60px] p-8">
        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Development Stage</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstCompany + 1} to{" "}
                {Math.min(indexOfLastCompany, stage.length)} of {stage.length}{" "}
                entries
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition text-sm"
              >
                + Add stage
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
                        stage Id
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        stage Name
                      </th>

                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentCompanies.map((company: DevelopmentStage) => (
                      <tr
                        key={company.dev_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {company.dev_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {company.dev_type}
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
                            <button
                              onClick={() => handleDelete(company.dev_id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="w-5 h-5" />
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
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } transition-colors`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
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
                <h2 className="text-2xl font-semibold text-gray-800">Add Development Stage</h2>
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
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={newstage.stage_name}
                    onChange={(e) => setNewstage({ ...newstage, stage_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Enter stage name"
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
                  onClick={handleAddstage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedstage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-full transform transition-all scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Development Stage</h2>
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
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={editedstage.dev_type || selectedstage.dev_type}
                    onChange={(e) => setEditedstage({ ...editedstage, dev_type: e.target.value })}
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
