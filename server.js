const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const urlModule = require("url");
const path = require("path");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.use(cors());

dotenv.config();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./", "client", "dist", "index.html"));
  });
}

async function scrapeWebsite(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const extractedLinks = {
      internal: new Set(),
      external: new Set(),
      meta: new Set(),
    };

    // Extract links from anchor tags
    $("a").each((index, element) => {
      const link = $(element).attr("href");
      if (link) {
        extractedLinks.internal.add(normalizeUrl(link, url));
      }
    });

    // Extract links from script tags
    $("script").each((index, element) => {
      const src = $(element).attr("src");
      if (src) {
        extractedLinks.external.add(normalizeUrl(src, url));
      }
    });

    // Extract links from link tags (stylesheets)
    $("link").each((index, element) => {
      const href = $(element).attr("href");
      if (href) {
        extractedLinks.external.add(normalizeUrl(href, url));
      }
    });

    // Extract links from meta tags
    $("meta").each((index, element) => {
      const content = $(element).attr("content");
      if (content) {
        const metaLinks = content.match(/(https?:\/\/[^\s]+)/g);
        if (metaLinks) {
          metaLinks.forEach((link) => {
            extractedLinks.meta.add(normalizeUrl(link, url));
          });
        }
      }
    });

    // Convert Sets to Arrays before returning
    extractedLinks.internal = Array.from(extractedLinks.internal);
    extractedLinks.external = Array.from(extractedLinks.external);
    extractedLinks.meta = Array.from(extractedLinks.meta);

    return extractedLinks;
  } catch (error) {
    throw error;
  }
}

function normalizeUrl(link, baseUrl) {
  // Convert relative URLs to absolute URLs
  return urlModule.resolve(baseUrl, link);
}

// Route to handle scraping request
app.post("/api/scrape-links", async (req, res) => {
  const { websiteLink } = req.body;
  if (!websiteLink) {
    return res.status(400).json({ error: "Website link is required" });
  }

  try {
    const links = await scrapeWebsite(websiteLink);
    res.json(links);
  } catch (error) {
    console.error("Error scraping website:", error);
    res.status(500).json({ error: "Failed to scrape website links" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
