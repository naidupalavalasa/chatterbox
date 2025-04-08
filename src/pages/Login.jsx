import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from '@aws-amplify/auth';

const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(false); // reset error on every attempt

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await Auth.signIn(email, password);
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
      setErr(true);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat Me</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Sign in</button>
          {err && <span>Something went wrong. Please try again.</span>}
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
