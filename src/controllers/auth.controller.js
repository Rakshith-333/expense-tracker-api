import authService from "../services/auth.service.js";

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({ success: true, message: "User registered successfully", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json({ success: true, message: "User logged in successfully", data: result });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
}

export default { register, login };