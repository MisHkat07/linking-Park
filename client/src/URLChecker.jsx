// URLChecker.jsx
import React, { useState } from "react";
import axios from "axios";

const URLChecker = () => {
  const [url, setUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setErrMsg("");
    try {
      const response = await axios.get(
        `https://link-scrap-backend.vercel.app/api/check-url?url=${url}&website=${website}`
      );
      setResult(response.data);
    } catch (error) {
      console.error(error);
      setErrMsg(
        error.response?.data?.error ||
          "An error occurred while checking the URL"
      );
      setResult({ exists: false, belongsTo: null });
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl text-center font-bold mb-8">Find the URL</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Website"
          className="border border-gray-300 rounded-l-md px-2 py-2 w-full sm:w-auto focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Enter URL"
          className="border border-gray-300 rounded-r-md px-2 py-2 w-full sm:w-auto focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md ml-2 sm:ml-4 focus:outline-none"
        >
          {loading ? "Searching..." : "Submit"}
        </button>
      </form>
      {errMsg && (
        <h4 className="text-red-500 my-4 overflow-hidden">{errMsg}</h4>
      )}
      {result && (
        <div>
          <p>URL exists: {result.exists.toString()}</p>
          {result.exists && (
            <div>
              <p>Belongs to:</p>
              <ul>
                {result.belongsTo.map((url, index) => (
                  <li key={index} className="text-blue-500 overflow-hidden">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default URLChecker;
