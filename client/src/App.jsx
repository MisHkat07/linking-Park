import React, { useState } from "react";

import axios from "axios";
import URLChecker from "./URLChecker";
function App() {
  const [websiteLink, setWebsiteLink] = useState("");
  const [internalLinks, setInternalLinks] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [metaLinks, setMetaLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showURLChecker, setShowURLChecker] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchPerformed(false);
    setError("");

    try {
      const response = await axios.post(
        "https://link-scrap-backend.vercel.app/api/scrape-links",
        { websiteLink }
      );

      if (response.data.redirectUrl) {
        setError(
          `Redirect occurred. Redirect URL: ${response.data.redirectUrl}, Status Code: ${response.data.statusCode}`
        );
      } else if (isAssetUrl(websiteLink)) {
        setError("Unavailable for asset URLs");
      } else {
        setInternalLinks(response.data.internal);
        setExternalLinks(response.data.external);
        setMetaLinks(response.data.meta);
        setSearchPerformed(true);
      }
    } catch (error) {
      setError(`Error: ${error.response.data.error}`);
      console.error("Error fetching links:", error);
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    let value = event.target.value;
    if (!value.startsWith("https://")) {
      value = "https://" + value;
    }
    setWebsiteLink(value);
  };

  const isAssetUrl = (url) => {
    const assetExtensions = [".js", ".css", ".jpg", ".png", ".gif", ".svg"];
    const urlObject = new URL(url);
    const pathExtension = urlObject.pathname.split(".").pop().toLowerCase();
    return assetExtensions.includes(`.${pathExtension}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <button
        onClick={() => setShowURLChecker(!showURLChecker)}
        className="bg-green-500 text-white px-4 py-2 rounded m-4"
      >
        {showURLChecker ? "Scrap Links" : "Find URL"}
      </button>
      {!showURLChecker ? (
        <div>
          <h1 className="text-3xl font-bold mb-8">Website Link Scraper</h1>
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-8">
              <input
                type="text"
                value={websiteLink}
                onChange={handleChange}
                placeholder="Enter webpage link"
                className="border border-gray-300 rounded-l-md px-2 py-2 w-full sm:w-auto focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-r-md ml-2 sm:ml-4 focus:outline-none"
              >
                {loading ? "Submitting.." : "Submit"}
              </button>
            </div>
            <h4 className="text-red-500 overflow-hidden">{error}</h4>
          </form>
        </div>
      ) : (
        ""
      )}
      {searchPerformed && !showURLChecker && (
        <div className="flex justify-between w-full">
          <div className="w-full md:w-1/3 border border-gray-300 rounded-md p-4">
            <h2 className="text-xl font-semibold mb-2">Internal Links:</h2>
            <ul className="list-disc pl-6">
              {internalLinks.map((link, index) => (
                <li key={index} className="text-blue-500 overflow-hidden">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block max-w-full"
                  >
                    {index + 1}. {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3 border border-gray-300 rounded-md p-4 mx-0 md:mx-4 mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-2">External Links:</h2>
            <ul className="list-disc pl-6">
              {externalLinks.map((link, index) => (
                <li key={index} className="text-green-500 overflow-hidden">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block max-w-full"
                  >
                    {index + 1}. {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3 border border-gray-300 rounded-md p-4">
            <h2 className="text-xl font-semibold mb-2">Meta Links:</h2>
            <ul className="list-disc pl-6">
              {metaLinks.map((link, index) => (
                <li key={index} className="text-purple-500 overflow-hidden">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block max-w-full"
                  >
                    {index + 1}. {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showURLChecker && <URLChecker />}
    </div>
  );
}

export default App;
