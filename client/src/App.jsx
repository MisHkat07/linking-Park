import React, { useState } from "react";

import axios from "axios";

function App() {
  const [websiteLink, setWebsiteLink] = useState("");
  const [internalLinks, setInternalLinks] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [metaLinks, setMetaLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://link-scrap-backend.vercel.app/api/scrape-links",
        { websiteLink }
      );
      setInternalLinks(response.data.internal);
      setExternalLinks(response.data.external);
      setMetaLinks(response.data.meta);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
    setWebsiteLink("");
    setLoading(false);
  };

  const handleChange = (event) => {
    let value = event.target.value;
    if (!value.startsWith("https://")) {
      value = "https://" + value;
    }
    setWebsiteLink(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Website Link Scraper
      </h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center justify-center mb-4 sm:mb-8">
          <input
            type="text"
            value={websiteLink}
            onChange={handleChange}
            placeholder="Enter website link"
            className="border border-gray-300 rounded-l-md px-4 py-2 w-full sm:w-auto focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-r-md ml-2 sm:ml-4 focus:outline-none"
          >
            {loading ? "Scraping..." : "Scrape Links"}
          </button>
        </div>
      </form>
      <div className="flex flex-col md:flex-row justify-center md:justify-between">
        <div className="w-full md:w-1/3 border border-gray-300 rounded-md p-4 mb-4 md:mb-0">
          <h2 className="text-xl font-semibold text-blue-500 mb-2">
            Internal Links:
          </h2>
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
          <h2 className="text-xl font-semibold text-green-500 mb-2">
            External Links:
          </h2>
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
          <h2 className="text-xl font-semibold mb-2 text-purple-500">
            Meta Links:
          </h2>
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
    </div>
  );
}

export default App;
