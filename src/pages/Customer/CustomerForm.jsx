import { useState } from "react";
import { createCustomer } from "../../lib/api";
import Layout from "../../components/Layout";
import "./style.css"; // Import External CSS
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

    const [sameAsAddress, setSameAsAddress] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({}); // Tracks if the field was touched

    // Regex patterns
    const patterns = {
        full_name: /^[A-Za-z\s]{3,}$/, // Only letters & spaces, min 3 chars
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Standard email format
        phone: /^[0-9]{10,15}$/, // Only numbers, 10-15 digits
        password: /^.{6,}$/ // Minimum 6 characters
    };

    const validateField = (name, value) => {
        if (!value) return `${name.replace("_", " ")} is required`; // Empty field check

        switch (name) {
            case "full_name":
                return patterns.full_name.test(value) ? "" : "Full name must be at least 3 characters long and contain only letters.";
            case "email":
                return patterns.email.test(value) ? "" : "Enter a valid email (e.g., user@example.com).";
            case "phone":
                return patterns.phone.test(value) ? "" : "Phone number must be 10-15 digits long.";
            case "password":
                return patterns.password.test(value) ? "" : "Password must be at least 6 characters long.";
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
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));

            if (touched[name]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: validateField(name, value),
                }));
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true })); // Mark field as touched
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (patterns[key]) {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched(Object.keys(newErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            return;
        }

        const response = await createCustomer(formData);
        toast.success(response.message || "Customer created successfully!");
        nevigate('/customers')
    };
const nevigate = useNavigate()
    return (
        <Layout>
            <ToastContainer/>
            <div className="customer-form-container">
                <h2 className="add-customer">Add New Customer</h2>
                <form onSubmit={handleSubmit} className="customer-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} maxLength={25} onChange={handleChange} onBlur={handleBlur} required />
                        {touched.full_name && errors.full_name && <p className="error">{errors.full_name}</p>}
                        
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required />
                        {touched.email && errors.email && <p className="error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} />
                        {touched.phone && errors.phone && <p className="error">{errors.phone}</p>}
                    </div>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
                    </div>

                    <div className="full-width">
                        <label>Address</label>
                        <input type="text" name="address" value={formData.address} maxLength={55} onChange={handleChange} required />
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" name="sameAsAddress" checked={sameAsAddress} onChange={handleChange} />
                            Same as Company Address
                        </label>
                    </div>

                    <div className="full-width">
                        <label>Delivery Address</label>
                        <input type="text" name="delivery_address" value={formData.delivery_address} onChange={handleChange} disabled={sameAsAddress} />
                    </div>

                    <div className="full-width">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} maxLength={15} onChange={handleChange} onBlur={handleBlur} required />
                        {touched.password && errors.password && <p className="error">{errors.password}</p>}
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" name="send_login_credentials" checked={formData.send_login_credentials} onChange={handleChange} />
                            Send Login Credentials
                        </label>

                        <label className="checkbox-label">
                            <input type="checkbox" name="enable_email_notifications" checked={formData.enable_email_notifications} onChange={handleChange} />
                            Enable Email Notifications
                        </label>

                        <label className="checkbox-label">
                            <input type="checkbox" name="enable_sms_notifications" checked={formData.enable_sms_notifications} onChange={handleChange} />
                            Enable SMS Notifications
                        </label>

                        <label className="checkbox-label">
                            <input type="checkbox" name="require_coi" checked={formData.require_coi} onChange={handleChange} />
                            Require COI
                        </label>
                    </div>

                    <button type="submit" className="submit-btn">Save Customer</button>
                </form>
            </div>
        </Layout>
    );
};

export default CustomerForm;
