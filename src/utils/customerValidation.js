export const patterns = {
    full_name: /^[A-Za-z\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[0-9]{10,15}$/,
    password: /^.{6,}$/,
  };
  

  
  export const validateField = (name, value) => {
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
      case "delivery_address":
        if (value.trim() === "") return `${name.replace("_", " ")} cannot be empty or just spaces.`;
        if (!/^[A-Za-z0-9\s,.-]+$/.test(value)) return `${name.replace("_", " ")} cannot contain special characters or emojis.`;
        if (/^\d+$/.test(value.trim())) return `${name.replace("_", " ")} cannot contain only numbers.`;
        return "";
      default:
        return "";
    }
  };
  