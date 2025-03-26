import { useEffect, useState } from "react";
import { getCustomerById, updateCustomer } from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";


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
        await updateCustomer(id, formData);
        alert("Customer updated successfully!");
        navigate("/customers");
    };

    return (
        <Layout>
            <div className="customer-form-container">
                <h2 className="add-customer">Edit Customer</h2>
                <form onSubmit={handleSubmit} className="customer-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
                    </div>

                    <div className="full-width">
                        <label>Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" name="sameAsAddress" checked={sameAsAddress} onChange={handleChange} />
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
