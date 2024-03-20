import React, { useState } from "react";

const isValidURL = (url) => {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
};
function isAssetLink(url) {
  const assetExtensions = [
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".php",
    ".min.css",
  ];

  const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
  return assetExtensions.includes(extension);
}
function App() {
  const [option, setOption] = useState("singlePage");
  const [showExternalWebsite, setShowExternalWebsite] = useState(false);
  const [desiredURL, setDesiredURL] = useState("");
  const [urls, setUrls] = useState([]);
  const [externalURL, setExternalURL] = useState("");
  const [desiredURLError, setDesiredURLError] = useState(false);
  const [externalURLError, setExternalURLError] = useState("");
  const [redirectError, setRedirectError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = (e) => {
    setOption(e.target.value);
  };

  const handleExternalWebsiteChange = (e) => {
    setShowExternalWebsite(e.target.checked);
    if (!e.target.checked) {
      setExternalURL("");
      setExternalURLError("");
    }
  };

  const handleDesiredURLChange = (e) => {
    const value = e.target.value;
    setDesiredURL(value);
    setDesiredURLError(!isValidURL(value) || isAssetLink(value));
    setRedirectError(null);
  };

  const handleExternalURLChange = (e) => {
    setExternalURL(e.target.value);
    !isValidURL(e.target.value) && setExternalURLError("Enter a valid URL");
  };

  const isSubmitDisabled =
    (desiredURL === "" && externalURL === "") ||
    (desiredURL !== "" &&
      (!isValidURL(desiredURL) || isAssetLink(desiredURL))) ||
    (externalURL !== "" && !isValidURL(externalURL)) ||
    redirectError !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setExternalURLError("");
    setIsLoading(true);
    setUrls([]);

    const formData = {
      desiredURL,
      option,
      externalURL: showExternalWebsite ? externalURL : "",
    };

    try {
      const response = await fetch(
        "https://link-scrap-backend.vercel.app/api/scrape-links",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.title) {
          const {
            title,
            rootLink,
            internalLinks,
            externalLinks,
            metaLinks,
            crawledPages,
          } = data;
          let allUrls = [
            { title, rootLink, internalLinks, externalLinks, metaLinks },
          ];
          if (crawledPages && crawledPages.length > 0) {
            allUrls = [...allUrls, ...crawledPages];
          }
          setUrls(allUrls);
        } else if (!data.title && data[0].linkFinder) {
          setUrls(data);
        } else {
          setExternalURLError("Not Found");
        }
      } else {
        setUrls([]);
        console.log(response);
        setRedirectError(
          `${response.status} : ${
            response.statusText || response.status === 308
              ? "Permanent Redirect"
              : "Not Found"
          }`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-500 mb-6 text-center">
          Search URL
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Add your desired URL"
              value={desiredURL}
              onChange={handleDesiredURLChange}
              className={`w-full border ${
                desiredURLError || redirectError
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-indigo-500"
              } rounded-lg p-2 transition-colors duration-300`}
            />
            {desiredURLError && isAssetLink(desiredURL) && (
              <p className="text-red-500 mt-1">Unavailable for Asset URLs</p>
            )}
            {desiredURLError && !isAssetLink(desiredURL) && (
              <p className="text-red-500 mt-1">Please enter a valid URL</p>
            )}
            {redirectError && (
              <p className="text-red-500 mt-1">{redirectError}</p>
            )}
          </div>
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              <input
                type="radio"
                name="option"
                id="singlePage"
                value="singlePage"
                checked={option === "singlePage"}
                onChange={handleOptionChange}
                className="mr-2 form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="singlePage" className="text-gray-700">
                Single Page
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name="option"
                id="wholeWebsite"
                value="wholeWebsite"
                checked={option === "wholeWebsite"}
                onChange={handleOptionChange}
                className="mr-2 form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="wholeWebsite" className="text-gray-700">
                Whole Website
              </label>
            </div>
          </div>
          {option === "wholeWebsite" && (
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="externalWebsite"
                checked={showExternalWebsite}
                onChange={handleExternalWebsiteChange}
                className="mr-2 form-checkbox text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="externalWebsite" className="text-gray-700">
                Look for specific URL
              </label>
            </div>
          )}
          {option !== "singlePage" && showExternalWebsite && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="External Website URL"
                value={externalURL}
                onChange={handleExternalURLChange}
                className={`w-full border ${
                  externalURLError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                } rounded-lg p-2 transition-colors duration-300`}
              />
              {externalURLError && (
                <p className="text-red-500 mt-1">{externalURLError}</p>
              )}
            </div>
          )}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitDisabled || isLoading}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ${
                isSubmitDisabled || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100 cursor-pointer"
              }`}
            >
              {isLoading ? "Loading..." : "SUBMIT"}
            </button>
          </div>
        </form>
        {isLoading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        {urls.length > 0 && !isLoading && (
          <div className="mt-8">
            {urls.map((url, index) =>
              url?.linkFinder ? (
                <div key={index} className="w-full pr-2 mb-4 md:mb-0">
                  <h4 className="text-md font-semibold text-gray-500 mb-2">
                    Found In:
                  </h4>
                  <ul className="text-sm text-gray-600 leading-relaxed">
                    {url.rootLinks?.map((link, i) => (
                      <li key={i} className="break-all text-blue-600">
                        {i + 1}. {link}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  key={index}
                  className="mb-8 border border-gray-300 rounded-md p-3"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {index + 1}. {url.title}
                  </h3>
                  <a
                    href={url.rootLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block max-w-full"
                  >
                    ( {url.rootLink} )
                  </a>
                  <div className="flex flex-col md:flex-row mt-4">
                    <div className="w-full md:w-1/3 pr-2 mb-4 md:mb-0">
                      <h4 className="text-md font-semibold text-gray-500 mb-2">
                        Internal Links
                      </h4>
                      <ul className="text-sm text-gray-600 leading-relaxed">
                        {url.internalLinks?.map((link, i) => (
                          <li key={i} className="break-all text-blue-600">
                            {i + 1}. {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                      <h4 className="text-md font-semibold text-gray-500 mb-2">
                        External Links
                      </h4>
                      <ul className="text-sm text-gray-600 leading-relaxed">
                        {url.externalLinks?.map((link, i) => (
                          <li key={i} className="break-all text-green-500">
                            {i + 1}. {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-full md:w-1/3 pl-2">
                      <h4 className="text-md font-semibold text-gray-500 mb-2">
                        Meta & Asset Links
                      </h4>
                      <ul className="text-sm text-gray-600 leading-relaxed">
                        {url.metaLinks?.map((link, i) => (
                          <li key={i} className="break-all text-purple-600">
                            {i + 1}. {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
