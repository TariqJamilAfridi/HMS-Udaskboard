import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";

const Messages = () => {
  const [messages, setMessages] = useState([]); // State for storing messages
  const [loading, setLoading] = useState(true); // State for loading indicator
  const { isAuthenticated } = useContext(Context); // Check authentication context

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          "https://hms-backend-tj-48lx.vercel.app/api/v1/message/getall",
          { withCredentials: true } // Ensure cookies are sent
        );
        console.log("Fetched Data: ", data); // Log the fetched data for debugging

        if (data && data.success) {
          // Check if the response is successful
          if (Array.isArray(data.message) && data.message.length > 0) {
            setMessages(data.message); // Update state with messages if they exist
          } else {
            setMessages([]); // If no messages, set to empty array
          }
        } else {
          console.error("Error: No success in response", data);
          setMessages([]); // Fallback for no messages
        }
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data?.message || error.message);
        setMessages([]); // In case of error, set messages to empty array
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchMessages();
  }, []); // Empty dependency array ensures this runs only once on component mount

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />; // Redirect if not authenticated
  }

  return (
    <section className="page messages">
      <h1>MESSAGE</h1>
      <div className="banner">
        {loading ? ( // Show loading spinner if data is still being fetched
          <h1>Loading...</h1>
        ) : messages.length > 0 ? ( // If messages exist, display them
          messages.map((element) => (
            <div className="card" key={element._id}>
              <div className="details">
                <p>
                  First Name: <span>{element.firstName}</span>
                </p>
                <p>
                  Last Name: <span>{element.lastName}</span>
                </p>
                <p>
                  Email: <span>{element.email}</span>
                </p>
                <p>
                  Phone: <span>{element.phone}</span>
                </p>
                <p>
                  Message: <span>{element.message}</span>
                </p>
              </div>
            </div>
          ))
        ) : ( // If no messages, show this message
          <h1>No Messages!</h1>
        )}
      </div>
    </section>
  );
};

export default Messages;
