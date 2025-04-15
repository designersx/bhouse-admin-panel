import { useState } from "react";
import { createCustomer } from "../../lib/api";
import Layout from "../../components/Layout";
import "./style.css"; // Import External CSS
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import BackButton from "../../components/BackButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CustomerForm = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        address: "",
        delivery_address: "",
        status: "active",
        password: "",
        send_login_credentials: false,
        enable_email_notifications: false,
        enable_sms_notifications: false,
        building_delivery_hours: "",
        require_coi: false,
        createdBy: "admin",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [sameAsAddress, setSameAsAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Regex patterns
    const patterns = {
        full_name: /^[A-Za-z\s]{3,}$/, // Only letters & spaces, min 3 chars
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Standard email format
        phone: /^[0-9]{10,15}$/, // Only numbers, 10-15 digits
        password: /^.{6,}$/, // Minimum 6 characters
    };
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    const companyNameRegex = /^[A-Za-z0-9\s]+$/; 

    const validateField = (name, value) => {
        if (!value) {
            return `${name.replace("_", " ")} is required`;
        }
    
        switch (name) {
            case "full_name":
                return !patterns.full_name.test(value)
                    ? "Full Name must be at least 3 characters long and contain only letters."
                    : !/^[A-Z]/.test(value.trim())
                    ? "Full Name must start with a capital letter."
                    : "";
            case "email":
                return patterns.email.test(value)
                    ? ""
                    : "Enter a valid email (e.g., user@example.com).";
            case "phone":
                return patterns.phone.test(value)
                    ? ""
                    : "Phone number must be 10-15 digits long.";
            case "password":
                return value.length < 6
                    ? "Password must be at least 6 characters long."
                    : "";
            case "company_name":
                if (!value.trim()) return "Company Name is required.";
                if (!/^[A-Za-z0-9\s]+$/.test(value))
                    return "Company Name should not contain special characters or emojis.";
                if (/^\d+$/.test(value.trim()))
                    return "Company Name cannot contain only numbers.";
                return "";
                case "address":
                    if (value.trim() === "") return "Address cannot be empty or just spaces.";
                    if (!/^[A-Za-z0-9\s,.-]+$/.test(value)) return "Address cannot contain special characters or emojis.";
                    if (/^\d+$/.test(value.trim())) return "Address cannot contain only numbers.";
                    return "";
                
                case "delivery_address":
                    if (value.trim() === "") return "Delivery Address cannot be empty or just spaces.";
                    if (!/^[A-Za-z0-9\s,.-]+$/.test(value)) return "Delivery Address cannot contain special characters or emojis.";
                    if (/^\d+$/.test(value.trim())) return "Delivery Address cannot contain only numbers.";
                    return "";
                
            default:
                return "";
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "sameAsAddress") {
            setSameAsAddress(checked);
            setFormData((prev) => ({
                ...prev,
                delivery_address: checked ? prev.address : "",
            }));
        } else {
            let newValue = value;

            // Password: Remove spaces & emojis
            if (name === "password") {
                newValue = value.replace(/[\s\p{Extended_Pictographic}]/gu, "");
            }

            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : newValue,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        for (const key in patterns) {
            const error = validateField(key, formData[key]);
    
            if (error) {
                toast.dismiss();
                toast.error(error);
                setLoading(false);
                return;
            }
        }
        if (!/^[A-Z]/.test(formData.full_name.trim())) {
            toast.error("Full Name must start with a capital letter.", { toastId: "fullNameCapital" });
            setLoading(false);
            return;
        }
        
        // ✅ Strong password alert handling
        if (!formData.password) {
            setLoading(false);
            return Swal.fire({
                icon: "warning",
                title: "Password Required",
                text: "Please enter a password to continue.",
            });
        }
    
        if (!strongPasswordRegex.test(formData.password)) {
            setLoading(false);
            return Swal.fire({
                icon: "error",
                title: "Weak Password",
                html: `
                    <div style="text-align: left;">
                        Your password must meet the following requirements:
                        <ul style="margin-top: 8px;">
                            <li>✅ 6–20 characters</li>
                            <li>✅ At least one uppercase letter</li>
                            <li>✅ At least one lowercase letter</li>
                            <li>✅ At least one number</li>
                            <li>✅ At least one special character (@$!%*?&)</li>
                        </ul>
                    </div>
                `,
            });
        }
        const requiredFields = [...Object.keys(patterns), "company_name"];

for (const key of requiredFields) {
  const error = validateField(key, formData[key]);
  if (error) {
    toast.dismiss();
    toast.error(error);
    setLoading(false);
    return;
  }
}
const addressError = validateField("address", formData.address);
const deliveryError = validateField("delivery_address", formData.delivery_address);

if (addressError) {
    toast.error(addressError);
    setLoading(false);
    return;
}
if (deliveryError) {
    toast.error(deliveryError);
    setLoading(false);
    return;
}

    
        try {
            const response = await createCustomer(formData);
            if (response?.error) {
                toast.error(`Error: ${response?.error?.errors[0].message}`);
            } else {
                await Swal.fire({
                    title: "Customer Added Successfully",
                    icon: "success"
                });
                navigate("/customers");
            }
        } catch (error) {
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Layout>
            <ToastContainer position="top-right" autoClose={3000} />
            {loading ? (
                <Loader />
            ) : (
                <div className="customer-form-container">
                    <div>
                        <BackButton />
                    </div>
                    <h2 className="add-customer">Add New Customer</h2>
                    <form onSubmit={handleSubmit} className="customer-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                maxLength={25}
                                onChange={handleChange}
                            />
                            <small style={{ fontSize: "0.8rem", color: "#777" }}>
  Must start with a capital letter and contain only letters.
</small>

                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Company Name</label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="full-width">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                maxLength={55}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="sameAsAddress"
                                    checked={sameAsAddress}
                                    onChange={handleChange}
                                />
                                Same as Company Address
                            </label>
                        </div>

                        <div className="full-width">
                            <label>Delivery Address</label>
                            <input
                                type="text"
                                name="delivery_address"
                                value={formData.delivery_address}
                                onChange={handleChange}
                                disabled={sameAsAddress}
                            />
                        </div>

                        <div className="full-width" style={{ position: "relative" }}>
  <label>Password</label>
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password}
    maxLength={20}
    onChange={handleChange}
  />
  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      top: "70%",
      right: "28px",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "1.1rem",
      color: "#666",
    }}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>


                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="send_login_credentials"
                                    checked={formData.send_login_credentials}
                                    onChange={handleChange}
                                />
                                Send Login Credentials
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="enable_email_notifications"
                                    checked={formData.enable_email_notifications}
                                    onChange={handleChange}
                                />
                                Enable Email Notifications
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="enable_sms_notifications"
                                    checked={formData.enable_sms_notifications}
                                    onChange={handleChange}
                                />
                                Enable SMS Notifications
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="require_coi"
                                    checked={formData.require_coi}
                                    onChange={handleChange}
                                />
                                Require COI
                            </label>
                        </div>

                        <button type="submit" className="submit-btn">
                            Save Customer
                        </button>
                    </form>
                </div>
            )}
        </Layout>
    );
};

export default CustomerForm;
