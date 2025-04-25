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
    createdBy: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [sameAsAddress, setSameAsAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Regex patterns
  const patterns = {
    full_name: /^[A-Za-z\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[0-9]{10,15}$/,
    password: /^.{6,}$/,
  };
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    const validateField = (name, value) => {
        const trimmedValue = value.trim();
      
        switch (name) {
          case "full_name":
            if (!trimmedValue) return "Full Name is required.";
            if (!/^[A-Za-z\s]{3,}$/.test(trimmedValue))
              return "Full Name must be at least 3 characters and contain only letters and spaces.";
            if (!/^[A-Z]/.test(trimmedValue))
              return "Full Name must start with a capital letter.";
            return "";
      
          case "email":
            if (!trimmedValue) return "Email is required.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue))
              return "Enter a valid email (e.g., user@example.com).";
            return "";
      
          case "phone":
            if (!trimmedValue) return "Phone number is required.";
            if (!/^[0-9]{10,15}$/.test(trimmedValue))
              return "Phone number must be 10–15 digits long.";
            return "";
      
          case "password":
            if (!trimmedValue) return "Password is required.";
            if (trimmedValue.length < 6)
              return "Password must be at least 6 characters long.";
            return "";
      
          case "company_name":
            if (!trimmedValue) return "Company Name is required.";
            if (!/^[A-Za-z0-9\s]+$/.test(trimmedValue))
              return "Company Name should not contain special characters or emojis.";
            if (/^\d+$/.test(trimmedValue))
              return "Company Name cannot contain only numbers.";
            return "";
      
          case "address":
            if (!trimmedValue) return "Address cannot be empty.";
            if (!/^[A-Za-z0-9\s,.-]+$/.test(trimmedValue))
              return "Address cannot contain special characters or emojis.";
            if (/^\d+$/.test(trimmedValue))
              return "Address cannot contain only numbers.";
            return "";
      
          case "delivery_address":
            if (!trimmedValue) return "Delivery Address cannot be empty.";
            if (!/^[A-Za-z0-9\s,.-]+$/.test(trimmedValue))
              return "Delivery Address cannot contain special characters or emojis.";
            if (/^\d+$/.test(trimmedValue))
              return "Delivery Address cannot contain only numbers.";
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
      toast.error("Full Name must start with a capital letter.", {
        toastId: "fullNameCapital",
      });
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
    const deliveryError = validateField(
      "delivery_address",
      formData.delivery_address
    );

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
          icon: "success",
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
                placeholder="Enter Full Name"
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
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter Phone No."
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                placeholder="Enter Company Name"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter Address"
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
                  placeholder="Same as Company Address"
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
                placeholder="Enter Delivery Address"
                value={formData.delivery_address}
                onChange={handleChange}
                disabled={sameAsAddress}
              />
            </div>

            <div className="form-group" style={{ position: "relative" }}>
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                maxLength={20}
                onChange={handleChange}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "72%",
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
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
