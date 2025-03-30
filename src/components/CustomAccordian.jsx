import React, { useState } from "react";
import "../../src/styles/CustomAccordian.css"; // ✅ Import Custom CSS

const CustomAccordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="accordion-container">
            <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>{title}</h3>
                <span className={`arrow ${isOpen ? "open" : ""}`}>&#9660;</span>
            </div>
            <div className={`accordion-content ${isOpen ? "show" : ""}`}>
                {children}
            </div>
        </div>
    );
};

export default CustomAccordion;
