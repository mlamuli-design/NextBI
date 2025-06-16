"use client";
import { useEffect, useState } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import Sidebar from "../Sidenav/page";
import Tracksession from "../Tracksession/page";

const API_IP = process.env.NEXT_PUBLIC_IP;
const API_PORT = process.env.NEXT_PUBLIC_PORT;

interface Company {
    id: string;
    startup_name: string;
    team_size: string;
    dev_type: string;
    [key: string]: string; // Index signature for other properties
}

export default function Home() {
    // Statistics for cards
    const [stats, setStats] = useState({
        totalCompanies: 0,
        contractedCompanies: 0,
        expiredContracts: 0,
        sectors: 0,
    });

    useEffect(() => {
        const officerId = localStorage.getItem("officer_id");

        if (!officerId) {
            console.log("Officer ID is missing from session.");
            return;
        }

        async function fetchStats() {
            try {
                const response = await fetch(`${API_IP}:${API_PORT}/api/rstp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ officer_id: officerId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch statistics");
                }

                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.log("Error fetching stats:", error);
            }
        }

        fetchStats();
    }, []);

    const getCardColor = () => {
        return "bg-sky-500";
    };

    // State for companies, loading, and error handling
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for modal visibility and selected company data
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Items per page (can be adjusted)

    // Fetch company data from API
    const getCompanyData = async () => {
        try {
            const officerId = localStorage.getItem("officer_id"); // Retrieve officer_id from session

            if (!officerId) {
                throw new Error("Company ID is missing from session.");
            }

            const response = await fetch(`${API_IP}:${API_PORT}/getRstpData`, {
                method: "POST", // Use POST if API expects a body, otherwise GET with query params
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ officer_id: officerId }), // Send officer_id in request body
            });

            if (!response.ok) {
                throw new Error("Failed to fetch company data");
            }

            const data = await response.json();
            setCompanies(data);
        } catch (error) {
            setError("Failed to fetch company data. Please try again later.");
            console.log("Error fetching company data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        getCompanyData();
    }, []);

    // Calculate index range for pagination
    const indexOfLastCompany = currentPage * itemsPerPage;
    const indexOfFirstCompany = indexOfLastCompany - itemsPerPage;
    const currentCompanies = companies.slice(
        indexOfFirstCompany,
        indexOfLastCompany
    );

    // Handlers for action buttons
    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setEditedCompany(company);
        setIsEditModalOpen(true);
    };

    const handleView = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(companies.length / itemsPerPage);

    // Close the modal
    const closeModal = () => setIsModalOpen(false);
    const closeEditModal = () => setIsEditModalOpen(false);

    const handleSaveChanges = async () => {
        console.log("Test Edited Company", editedCompany);
        if (!selectedCompany) {
            console.log("No company selected for editing.");
            return;
        }
        console.log("ID", selectedCompany.id);

        // Merge the ID into the editedCompany object
        const updatedCompany = {
            ...editedCompany,
            id: selectedCompany.id,
        };
        console.log("....................", updatedCompany);

        try {
            const response = await fetch(`${API_IP}:${API_PORT}/updateCompany`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedCompany),
            });

            if (response.ok) {
                alert("Company details updated successfully");
                closeEditModal(); // Close the modal after saving
            } else {
                alert("Failed to update company details");
            }
        } catch (error) {
            console.log("Error updating company:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Tracksession />
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-[60px] p-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Object.entries(stats).map(([key, value]) => (
                        <div
                            key={key}
                            className={`p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${getCardColor(
                                
                            )} bg-opacity-90 backdrop-blur-sm hover:bg-sky-600`}
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                            </h3>
                            <p className="text-3xl font-bold text-white">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Startup List</h2>

                    {/* Loading and Error Handling */}
                    {loading ? (
                        <p>Loading company data...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Startup Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team Size
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Business Development Stage
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentCompanies.map((company: Company) => (
                                            <tr
                                                key={company.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {company.startup_name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {company.team_size}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {company.dev_type}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => handleEdit(company)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleView(company)}
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg ${currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                        }`}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => paginate(index + 1)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* View Modal */}
                {isModalOpen && selectedCompany && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out animate-fadeIn max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        Company Details
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto flex-grow">
                                <div className="grid grid-cols-2 gap-6">
                                    {Object.entries(selectedCompany).map(
                                        ([key, value]) =>
                                            key !== "id" && (
                                                <div key={key} className="space-y-2">
                                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                                    </h4>
                                                    <p className="text-lg text-gray-800">{value}</p>
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end flex-shrink-0">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && selectedCompany && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out animate-fadeIn max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        Edit Company Details
                                    </h3>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto flex-grow">
                                <div className="grid grid-cols-2 gap-6">
                                    {Object.entries(selectedCompany).map(
                                        ([key]) =>
                                            key !== "id" && (
                                                <div key={key} className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editedCompany[key] || ""}
                                                        onChange={(e) =>
                                                            setEditedCompany({
                                                                ...editedCompany,
                                                                [key]: e.target.value,
                                                            })
                                                        }
                                                        disabled={key === "officer_id" || key === "company_id"}
                                                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-4 flex-shrink-0">
                                <button
                                    onClick={closeEditModal}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
            </main>
        </div>
    );
}
