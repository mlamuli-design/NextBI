"use client"
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSignOutAlt, FaHome, FaBuilding, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../styles/SideNavStyle.css";

const Sidebar = () => {
    const [user, setUser] = useState<{ officer_name?: string; company_id?: string } | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/");
    };

    const toggleAdminDropdown = () => {
        setIsAdminOpen(!isAdminOpen);
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="sidebar-container">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <img
                        src="https://www.afrilabs.com/wp-content/uploads/2024/04/Logo.jpg"
                        alt="RSTP Logo"
                        className="logo"
                    />
                    <div className="company-name">
                        <h2 className="company-name">Business Incubator</h2>
                    </div>
                    <div className="user-info">
                        <span className="user-label">Advisor:</span>
                        <span className="user-name">{user?.officer_name || "N/A"}</span>
                    </div>
                </div>

                <div className="sidebar-menu" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                    <Link href="/Main" className="menu-item">
                        <FaBuilding className="menu-icon" />
                        <span>Dashboard</span>
                    </Link>
                   
                    <Link href="/Home" className="menu-item">
                        <FaHome className="menu-icon" />
                        <span>Add Company</span>
                    </Link>
                    
                    <div className="admin-section">
                        <div className="menu-item" onClick={toggleAdminDropdown}>
                            <FaBuilding className="menu-icon" />
                            <span>Administration</span>
                            {isAdminOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                        </div>
                        {isAdminOpen && (
                            <div className="admin-dropdown">
                                <Link href="/RstpBi" className="dropdown-item">
                                    <span>Dashboard</span>
                                </Link>
                                <Link href="/Register" className="dropdown-item">
                                    <span>Add Officer</span>
                                </Link>
                                <Link href="/Businesssector" className="dropdown-item">
                                    <span>Add Sector</span>
                                </Link>
                                <Link href="/Developmentstage" className="dropdown-item">
                                    <span>Add Dev Stage</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="flag-container flex justify-center items-center gap-4">
                        <img
                            src="https://i.ibb.co/ngzMF6C/pngtree-eswatini-flag-with-pole-png-image-9161665-removebg-preview.png"
                            alt="Eswatini Flag"
                            className="flag-image w-16 h-auto"
                        />
                        <img
                            src="https://www.iasp.ws/media/imagegenerator/290x290/upscale(false)/canvascolor(0xffffffff)/RSTP_Logo-01_8.png"
                            alt="Eswatini Flag"
                            className="flag-image w-16 h-auto"
                        />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        <FaSignOutAlt className="logout-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
