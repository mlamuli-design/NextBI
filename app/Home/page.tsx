"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import loading icon
import Sidebar from "../Sidenav/page";
import "../styles/HomeStyle.css";
import Tracksession from "../Tracksession/page";


const API_IP = process.env.NEXT_PUBLIC_IP;
const API_PORT = process.env.NEXT_PUBLIC_PORT;

interface BusinessSector {
    sector_id: string;  // or string if your IDs are strings
    sector_name: string;
}
interface BusinessStage {
    dev_id: string;  // or string if your IDs are strings
    dev_type: string;
}

interface BusinessAdvasory {
    officer_id: string;  // or string if your IDs are strings
    officer_name: string;
}


export default function Home() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // General Information
    const [startupName, setStartupName] = useState("");
    const [foundersCount, setFoundersCount] = useState("");
    const [teamSize, setTeamSize] = useState("");
    const [maleCount, setMaleCount] = useState("");
    const [femaleCount, setFemaleCount] = useState("");
    const [youthCount, setYouthCount] = useState("");
    const [adultCount, setAdultCount] = useState("");
    const [businessSector, setBusinessSector] = useState("");
    const [businessDevelopmentStage, setBusinessDevelopmentStage] = useState("");
    const [productDescription, setProductDescription] = useState("");

    // Incubation Information
    const [incubationYear, setIncubationYear] = useState("");
    const [membershipStage, setMembershipStage] = useState("");
    const [businessAdvisory, setBusinessAdvisory] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [companyStatus, setCompanyStatus] = useState("");


    const [sectors, setSectors] = useState<BusinessSector[]>([]);
    const [businessStage, setBusinessStage] = useState<BusinessStage[]>([]);
    const [businessAdvasory, setBusinessAdvasory] = useState<BusinessAdvasory[]>([]);


    const currentYear = new Date().getFullYear();
    const today = new Date().toISOString().split("T")[0];
    const years = Array.from({ length: 11 }, (_, i) => currentYear - i); // Last 10 years

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);



    // Fetch business sectors from the API
    const fetchBusinessSectors = async () => {
        try {
            const response = await fetch(`${API_IP}:${API_PORT}/getBusinessSectors`);
            if (!response.ok) {
                throw new Error("Failed to fetch business sectors");
            }
            const data = await response.json();
            setSectors(data); // Save fetched data in state
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch business  from the API
    const fetchBusinessStage = async () => {
        try {
            const response = await fetch(`${API_IP}:${API_PORT}/getBusinessDevelopment`);
            if (!response.ok) {
                throw new Error("Failed to fetch getBusinessDevelopment");
            }
            const data = await response.json();
            setBusinessStage(data); // Save fetched data in state
        } catch (error) {
            console.log(error);
        }
    };



    // Fetch business  from the API
    const fetchBusinessAdvasory = async () => {
        try {
            const response = await fetch(`${API_IP}:${API_PORT}/getBusinessAdvasory`);
            if (!response.ok) {
                throw new Error("Failed to fetch BusinessAdvasory");
            }
            const data = await response.json();
            setBusinessAdvasory(data); // Save fetched data in state
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {

        fetchBusinessSectors();
        fetchBusinessStage();
        fetchBusinessAdvasory();
    }, []);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Prepare data from form fields
        const formData = {
            startupName,
            foundersCount,
            teamSize,
            maleCount,
            femaleCount,
            youthCount,
            adultCount,
            businessSector,
            businessDevelopmentStage,
            productDescription,
            incubationYear,
            membershipStage,
            businessAdvisory,
            startDate,
            endDate,
            companyStatus,
        };

        try {
            const response = await fetch(`${API_IP}:${API_PORT}/registerCompany`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {

                setError(data.error);
                throw new Error(data.error || "Registration failed");
            }

            setSuccess(data.message);
            console.log("Company registered successfully", data);

            // **RESET FORM FIELDS**
            setStartupName("");
            setFoundersCount("");
            setTeamSize("");
            setMaleCount("");
            setFemaleCount("");
            setYouthCount("");
            setAdultCount("");
            setBusinessSector("");
            setBusinessDevelopmentStage("");
            setProductDescription("");
            setIncubationYear("");
            setMembershipStage("");
            setBusinessAdvisory("");
            setStartDate("");
            setEndDate("");
            setCompanyStatus("");


        } catch (err) {
            console.log("Error during registration:", err);
        } finally {
            setLoading(false);

            // Hide the error after 7 seconds
            setTimeout(() => {
                setError(null);
            }, 7000); // Set timer for 7 seconds (7 ms)
        }
    };


    return (
        <div className="flex min-h-screen bg-gray-50">
              <Tracksession />
            <Sidebar />
            <main className="flex-1 ml-[50px] overflow-y-auto p-4">
                <motion.div
                    className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Progress Indicator */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {step === 1 ? "General Information" : "Incubation Details"}
                            </h2>
                            <span className="text-sm text-gray-500">Step {step} of 2</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                                className="bg-sky-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(step / 2) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Startup Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter startup name"
                                    value={startupName}
                                    onChange={(e) => setStartupName(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-gray-900"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product/Service Description
                                </label>
                                <textarea
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    placeholder="Describe your product or service"
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-gray-900"
                                    rows={5}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Number of Founders
                                    </label>
                                    <select
                                        value={foundersCount}
                                        onChange={(e) => setFoundersCount(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select number of founders</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Team Size
                                    </label>
                                    <select
                                        value={teamSize}
                                        onChange={(e) => setTeamSize(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select team size</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Male Count (%)
                                    </label>
                                    <select
                                        value={maleCount}
                                        onChange={(e) => setMaleCount(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select percentage</option>
                                        {[...Array(11)].map((_, i) => (
                                            <option key={i * 10} value={i * 10}>{i * 10}%</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Female Count (%)
                                    </label>
                                    <select
                                        value={femaleCount}
                                        onChange={(e) => setFemaleCount(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select percentage</option>
                                        {[...Array(11)].map((_, i) => (
                                            <option key={i * 10} value={i * 10}>{i * 10}%</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Youth Count (%)
                                    </label>
                                    <select
                                        value={youthCount}
                                        onChange={(e) => setYouthCount(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select percentage</option>
                                        {[...Array(11)].map((_, i) => (
                                            <option key={i * 10} value={i * 10}>{i * 10}%</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adult Count (%)
                                    </label>
                                    <select
                                        value={adultCount}
                                        onChange={(e) => setAdultCount(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select percentage</option>
                                        {[...Array(11)].map((_, i) => (
                                            <option key={i * 10} value={i * 10}>{i * 10}%</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Sector
                                    </label>
                                    <select
                                        value={businessSector}
                                        onChange={(e) => setBusinessSector(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select business sector</option>
                                        {sectors.map((sector) => (
                                            <option key={sector.sector_id} value={sector.sector_name}>
                                                {sector.sector_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Development Stage
                                    </label>
                                    <select
                                        value={businessDevelopmentStage}
                                        onChange={(e) => setBusinessDevelopmentStage(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select development stage</option>
                                        {businessStage.map((stage) => (
                                            <option key={stage.dev_id} value={stage.dev_type}>
                                                {stage.dev_type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Incubation Year
                                    </label>
                                    <select
                                        value={incubationYear}
                                        onChange={(e) => setIncubationYear(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select year</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Membership Stage
                                    </label>
                                    <select
                                        value={membershipStage}
                                        onChange={(e) => setMembershipStage(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select membership stage</option>
                                        <option value="Basic Membership">Basic Membership</option>
                                        <option value="Premium Membership">Premium Membership</option>
                                        <option value="Graduate Membership">Graduate Membership</option>
                                        <option value="Equity Membership">Equity Membership</option>

                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Advisory
                                    </label>
                                    <select
                                        value={businessAdvisory}
                                        onChange={(e) => setBusinessAdvisory(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select business advisory</option>
                                        {businessAdvasory.map((advisor) => (
                                            <option key={advisor.officer_id} value={advisor.officer_id}>
                                                {advisor.officer_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Status
                                    </label>
                                    <select
                                        value={companyStatus}
                                        onChange={(e) => setCompanyStatus(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    >
                                        <option value="" disabled>Select company status</option>
                                        <option value="contracted">Contracted</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        max={today}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || today}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-600 rounded text-sm">
                            {success}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex justify-between">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                                Previous
                            </button>
                        )}
                        {step < 2 ? (
                            <button
                                onClick={nextStep}
                                className="px-4 py-1.5 bg-sky-600 text-white rounded hover:bg-gray-700 transition-colors text-sm ml-auto"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-4 py-1.5 bg-sky-600 text-white rounded hover:bg-gray-700 transition-colors text-sm ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                        Submitting...
                                    </span>
                                ) : (
                                    "Submit"
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
