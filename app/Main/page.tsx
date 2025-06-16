"use client";
import { useEffect, useState } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import Sidebar from "../Sidenav/page";
import Tracksession from "../Tracksession/page";


interface Company {
    id: string;
    officer_id: string;
    startup_name: string;
    team_size: string | number;
    founder_count: string | number;
    male_count: string | number;
    female_count: string | number;
    youth_count: string | number;
    adult_count: string | number;
    sector_id: string;
    dev_type: string;
    generated_revenue: string | number;
    product_service_description: string;
}

// Type for form input changes
type FormInputChange = React.ChangeEvent<HTMLInputElement>;

// Helper function to safely convert values to numbers
const toNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
};

// Helper function to safely convert values to integers
const toInteger = (value: string | number): number => {
    if (typeof value === 'number') return Math.floor(value);
    return parseInt(value) || 0;
};

// Helper function to format value for display
const formatValue = (key: keyof Company, value: string | number): string => {
    if (key === 'generated_revenue') {
        return `$${toNumber(value).toLocaleString()}`;
    }
    if (['male_count', 'female_count', 'youth_count', 'adult_count'].includes(key)) {
        return `${toNumber(value)}%`;
    }
    return String(value);
};

const API_IP = process.env.NEXT_PUBLIC_IP;
const API_PORT = process.env.NEXT_PUBLIC_PORT;

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
                const response = await fetch(`${API_IP}:${API_PORT}/api/stats`, {
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
    const [companies, setCompanies] = useState<Company[]>([]);
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

    // New state for business selection
    const [selectedBusiness, setSelectedBusiness] = useState<string>("all");

    // Fetch company data from API
    const getCompanyData = async () => {
        try {
            const officerId = localStorage.getItem("officer_id"); // Retrieve officer_id from session

            if (!officerId) {
                throw new Error("Company ID is missing from session.");
            }

            const response = await fetch(`${API_IP}:${API_PORT}/getCompanyData`, {
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
    const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);

    // Handlers for action buttons
    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setIsEditModalOpen(true);
    };

    const handleView = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    // Change page
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate total pages
    const totalPages = Math.ceil(companies.length / itemsPerPage);

    // Close the modal
    const closeModal = () => setIsModalOpen(false);
    const closeEditModal = () => setIsEditModalOpen(false);

    const handleSaveChanges = async () => {
        console.log("Test Edited Company", editedCompany);
        console.log("ID", selectedCompany?.id);

        // Merge the ID into the editedCompany object
        const updatedCompany = {
            ...editedCompany,
            id: selectedCompany?.id || "",
        };
        console.log("....................", updatedCompany);

        try {
            const response = await fetch(`${API_IP}:${API_PORT}/updateCompany`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCompany),
            });

            if (response.ok) {
                alert('Company details updated successfully');
                closeEditModal(); // Close the modal after saving
            } else {
                alert('Failed to update company details');
            }
        } catch (error) {
            console.log('Error updating company:', error);
        }
    };

    // Update the personal stats calculations
    const calculatePersonalStats = (companies: Company[]) => {
        if (!companies || companies.length === 0) return;

        // Filter companies based on selected business
        const filteredCompanies = selectedBusiness === "all" 
            ? companies 
            : companies.filter(company => company.startup_name === selectedBusiness);

        if (filteredCompanies.length === 0) return;

        const stats = {
            totalTeamSize: filteredCompanies.reduce((sum, company) => sum + toInteger(company.team_size), 0),
            totalFounders: filteredCompanies.reduce((sum, company) => sum + toInteger(company.founder_count), 0),
            malePercentage: filteredCompanies.reduce((sum, company) => sum + toNumber(company.male_count), 0) / filteredCompanies.length,
            femalePercentage: filteredCompanies.reduce((sum, company) => sum + toNumber(company.female_count), 0) / filteredCompanies.length,
            youthPercentage: filteredCompanies.reduce((sum, company) => sum + toNumber(company.youth_count), 0) / filteredCompanies.length,
            adultPercentage: filteredCompanies.reduce((sum, company) => sum + toNumber(company.adult_count), 0) / filteredCompanies.length,
            totalRevenue: filteredCompanies.reduce((sum, company) => sum + toNumber(company.generated_revenue), 0)
        };

        return stats;
    };

    // Update the handleInputChange function
    const handleInputChange = (e: FormInputChange) => {
        const { name, value } = e.target;
        const key = name as keyof Company;
        
        // Convert numeric values
        if (['team_size', 'founder_count', 'male_count', 'female_count', 'youth_count', 'adult_count', 'generated_revenue'].includes(key)) {
            const numericValue = toNumber(value);
            setEditedCompany(prev => ({
                ...prev,
                [key]: numericValue
            }));
        } else {
            setEditedCompany(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    // Use calculatePersonalStats in the component
    const personalStats = calculatePersonalStats(companies);
    const {
        totalTeamSize = 0,
        totalFounders = 0,
        malePercentage = 0,
        femalePercentage = 0,
        youthPercentage = 0,
        adultPercentage = 0,
        totalRevenue = 0
    } = personalStats || {};

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
                            className={`p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
                                getCardColor()
                            } bg-opacity-90 backdrop-blur-sm hover:bg-sky-600`}
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                            </h3>
                            <p className="text-3xl font-bold text-white">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Personal Stats Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Personal Statistics Overview</h2>
                        <div className="flex items-center gap-4">
                            <label htmlFor="businessSelect" className="text-sm font-medium text-gray-700">
                                Select Business:
                            </label>
                            <select
                                id="businessSelect"
                                value={selectedBusiness}
                                onChange={(e) => setSelectedBusiness(e.target.value)}
                                className="p-2 border rounded-md focus:ring focus:ring-blue-200 text-black"
                            >
                                <option value="all">All Businesses</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.startup_name}>
                                        {company.startup_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Team Size Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Total Team Size</h3>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {totalTeamSize}
                                    </p>
                                </div>
                                <div className="bg-blue-200 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Founders Card */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Total Founders</h3>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        {totalFounders}
                                    </p>
                                </div>
                                <div className="bg-green-200 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                                        E{totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-yellow-200 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Demographics Section */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Demographics Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Gender Distribution */}
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-600">Male</h4>
                                    <div className="mt-2 flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-pink-600 h-2.5 rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${malePercentage.toFixed(1)}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold text-pink-600">
                                            {malePercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-600">Female</h4>
                                    <div className="mt-2 flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${femalePercentage.toFixed(1)}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold text-purple-600">
                                            {femalePercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-600">Youth</h4>
                                    <div className="mt-2 flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${youthPercentage.toFixed(1)}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold text-blue-600">
                                            {youthPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-600">Adult</h4>
                                    <div className="mt-2 flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                                                style={{ 
                                                    width: `${adultPercentage.toFixed(1)}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold text-indigo-600">
                                            {adultPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Startup List</h2>
                        <div className="text-sm text-gray-500">
                            Showing {indexOfFirstCompany + 1} to {Math.min(indexOfLastCompany, companies.length)} of {companies.length} entries
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
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Startup Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Team Size</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Business Development Stage</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentCompanies.map((company: Company) => (
                                            <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900">{company.startup_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{company.team_size}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{company.dev_type}</td>
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
                                                            onClick={() => handleView(company)} 
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                            title="View"
                                                        >
                                                            <FaEye className="w-5 h-5" />
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
                                        onClick={() => handlePageChange(currentPage - 1)}
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
                                            onClick={() => handlePageChange(i + 1)}
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
                                        onClick={() => handlePageChange(currentPage + 1)}
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

            {/* Modal */}
            {isModalOpen && selectedCompany && (
                              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[600px] max-w-full transform transition-all scale-100">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Company Details - {selectedCompany.startup_name}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-lg">
                                ✖
                            </button>
                        </div>

                        {/* Modal Content - Table */}
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <tbody>
                                    {Object.entries(selectedCompany || {}).map(([key, value]) => (
                                        <tr key={key} className="border-b border-gray-300">
                                            <td className="p-3 font-medium text-gray-900 bg-gray-100 w-1/3">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</td>
                                            <td className="p-3 text-gray-700">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            )}

            {/* EditModal */}
            {isEditModalOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[600px] max-w-full h-[80vh] overflow-auto">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Edit Company Details - {selectedCompany.startup_name}
                            </h2>
                            <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 text-lg">
                                ✖
                            </button>
                        </div>

                        {/* Form Layout - Two Columns */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {Object.entries(selectedCompany || {}).map(([key, value]) => {
                                const fieldKey = key as keyof Company;
                                const isNumeric = ['team_size', 'founder_count', 'male_count', 'female_count', 'youth_count', 'adult_count', 'generated_revenue'].includes(fieldKey);
                                const displayValue = editedCompany[fieldKey] !== undefined 
                                    ? isNumeric 
                                        ? String(editedCompany[fieldKey])
                                        : formatValue(fieldKey, editedCompany[fieldKey] as string | number)
                                    : formatValue(fieldKey, value);
                                
                                return (
                                    <div key={key} className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </label>
                                        <input
                                            type={isNumeric ? 'number' : 'text'}
                                            name={key}
                                            value={displayValue}
                                            onChange={handleInputChange}
                                            disabled={key === "officer_id" || key === "company_id"}
                                            className="p-2 border rounded-md focus:ring focus:ring-blue-200 w-full text-black"
                                        />
                                    </div>
                                );
                            })}

                            {/* Product/Service - Use Textarea */}
                            <div className="col-span-2 flex flex-col">
                                <label className="text-gray-700 font-medium">Product/Service</label>
                                <textarea
                                    value={editedCompany.product_service_description !== undefined
                                        ? editedCompany.product_service_description
                                        : selectedCompany.product_service_description || ""}
                                    onChange={(e) => setEditedCompany({
                                        ...editedCompany, product_service_description: e.target.value
                                    })}
                                    rows={4}
                                    className="p-2 border rounded-md focus:ring focus:ring-blue-200 w-full text-black resize-none"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mt-5">
                            <button
                                onClick={handleSaveChanges}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
