import React, { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode"

export const Auth = () => {
  const [user, setUser] = useState(null);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

    const refreshToken = async () => {
        try {
            const res = await axios.post("/refresh", { token: user.refreshToken });
            setUser({
                ...user,
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
            });
            return res.data;
        } catch (err) {
            console.log(err);
        };
    };
    const axiosJWT = axios.create();
    axiosJWT.interceptors.request.use(
        async (config) => {
        let currentDate = new Date();
        const decodeToken = jwt_decode(user.accessToken);
        if (decodeToken.exp * 1000 < currentDate.getTime()){
            const data = await refreshToken(); 
            config.headers["authorization"] = "Bearer" + data.accessToken;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
    
    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            // api request 
            const res = await axios.post("/login", {username,password });
            setUser(res.data);
        } catch (err){
            console.log(err);
        }
    }

    const handleDelete = async (id) => {
        setSuccess(false);
        setError(false);
        try {
            setSuccess(true);
            await axiosJWT.delete("/users/" + id, {
                headers:{authorization:"Bearer"+user.accessToken}
            })
        } catch (err) {
            setError(true);
        }
    }

    // end that awesome project 
    return (
        <div className="container">
            {user ? (
                <div className="home">
                    <span>
                        welcome to the <b>{user.isAdmin ? "Admin" : "User"} </b>dashboard{""}
                        <b>{user.username}</b>
                    </span>
                    <span>Delete User:</span>
                    <button className="deletebtn" onClick={() => handleDelete(1)}>Delete john</button>
                    <button className="deletebtn" onClick={() => handleDelete(2)}>Delete Saad</button>
                    {
                        error && (
                            <span className="error">You are not allowed to delete this user!</span>
                        )
                    }
                    {
                        success && (
                            <span className="success">User has been deleted successfuly...</span>
                        )
                    }
                </div>) : (
                    
                <div className="App">
                    <form onSubmit={handleSubmit}>
                        <span>Login</span>
                        <input
                            type="text"
                            placeholder="username"
                            onChange={(e) => setUserName(e.target.value)}
                        ></input>
                        <input
                            type="password"
                            placeholder="password"
                            onChange={(e) => setPassword(e.target.value)}
                        ></input>
                        <button type="submit" className="submitbtn">Login</button>
                    </form>
                </div>
            )}
                </div>
  );
};
