import * as cheerio from "cheerio";

// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
export default async (request) => {
  try {
    const url = new URL(request.url);
    const bookmark = url.searchParams.get("url");

    const response = await fetch(bookmark);

    if (response.ok) {
      const responseTxt = await response.text();
      const $ = cheerio.load(responseTxt);

      const pageTitle = $("title").text();
      const metaDescription = $('meta[name="description"]').attr("content");
      const ogImage = $('meta[property="og:image"]').attr("content");
      const twitterImg = $('meta[name="twitter:image"]').attr("content");
      const previewImg = ogImage || twitterImg;

      const jsonResponse = JSON.stringify({
        pageTitle,
        metaDescription,
        previewImg,
      });

      return new Response(jsonResponse, {
        headers: new Headers({
          "content-type": "application/json",
        }),
      });
    }
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    });
  }
};
