import React, { useState } from "react";
import Add from "../img/addAvatar.png";

import { Auth } from '@aws-amplify/auth';
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { Storage } from '@aws-amplify/storage';


import { useNavigate, Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { createUser } from "../graphql/mutations";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(false);

    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      // Step 1: Sign up with Cognito
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name: displayName,
        },
      });

      let photoURL = "";

      // Step 2: Upload avatar to S3
      if (file) {
        const fileName = `${uuid()}_${file.name}`;
        await Storage.put(fileName, file, {
          contentType: file.type,
        });
        photoURL = await Storage.get(fileName);
      }

      // Step 3: Save user to database
      await API.graphql(
        graphqlOperation(createUser, {
          input: {
            id: user.username,  // Cognito username is usually the sub
            email,
            displayName,
            photoURL,
          },
        })
      );

      // Step 4: Redirect
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setErr(true);
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat Me</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="Display Name" />
          <input required type="email" placeholder="Email" />
          <input required type="password" placeholder="Password" />
          <input required style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <img src={Add} alt="Add avatar" />
            <span>Add an avatar</span>
          </label>
          <button disabled={loading}>Sign up</button>
          {loading && <span>Uploading and setting up, please wait...</span>}
          {err && <span>Something went wrong. Try again.</span>}
        </form>
        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
