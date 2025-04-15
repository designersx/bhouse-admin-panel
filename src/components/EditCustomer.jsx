import { useEffect, useState } from "react";
import { getCustomerById, updateCustomer } from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import BackButton from "./BackButton";

const EditCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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

    const [errors, setErrors] = useState({});
    const [sameAsAddress, setSameAsAddress] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            const data = await getCustomerById(id);
            if (data) {
                setFormData(data);
                setSameAsAddress(data.address === data.delivery_address);
            }
        };
        fetchCustomer();
    }, [id]);

    // Validation Rules
    const validateForm = () => {
        let newErrors = {};

        if (!/^[A-Za-z\s]{3,}$/.test(formData.full_name)) {
            newErrors.full_name = "Full Name must be at least 3 letters long and contain only alphabets.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email address (e.g. user@example.com).";
        }

        if (!/^\d{10,15}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be between 10 to 15 digits.";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address cannot be empty.";
        }

        if (!/^.{6,}$/.test(formData.password)) {
            newErrors.password = "Password must be at least 6 characters long.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
           toast.error(Object.values(newErrors)[0])
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "sameAsAddress") {
            setSameAsAddress(checked);
            setFormData({
                ...formData,
                delivery_address: checked ? formData.address : "",
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        await updateCustomer(id, formData);

        // Success Notification
        Swal.fire({
            icon: "success",
            title: "Customer Updated!",
            text: "Customer details have been updated successfully.",
            confirmButtonColor: "#3085d6",
        });

        navigate("/customers");
    };

    return (
        <Layout>
                <ToastContainer position="top-right" autoClose={3000} />
            <div className="customer-form-container">
                <BackButton/>
                <h2 className="add-customer">Edit Customer</h2>
                <form onSubmit={handleSubmit} className="customer-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} maxLength={25} />
                    
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} maxLength={50} />
                   
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" placeholder="Enter your phone no." name="phone" value={formData.phone} onChange={handleChange} maxLength={15} />
                      
                    </div>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" placeholder="Cpompany name" name="company_name" value={formData.company_name} onChange={handleChange} maxLength={25} />
                    </div>

                    <div className="full-width">
                        <label>Address</label>
                        <input type="text" placeholder="Address" name="address" value={formData.address} onChange={handleChange} maxLength={55} />
                       
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox"  name="sameAsAddress" checked={sameAsAddress} onChange={handleChange} />
                            Same as Company Address
                        </label>
                    </div>

                    <div className="full-width">
                        <label>Delivery Address</label>
                        <input type="text" placeholder="Delivery Address" name="delivery_address" value={formData.delivery_address} onChange={handleChange} disabled={sameAsAddress} maxLength={55} />
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

                    <button type="submit" className="submit-btn">Update Customer</button>
                </form>
            </div>
        </Layout>
    );
};

export default EditCustomer;
