import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isbn = searchParams.get("isbn")?.trim();
  const asin = searchParams.get("asin")?.trim();
  const title = searchParams.get("title")?.trim();

  const idToLookup = asin || isbn;

  // 1. If Rainforest API key is provided in environment variables
  if (process.env.RAINFOREST_API_KEY && idToLookup) {
    try {
      const url = new URL("https://api.rainforestapi.com/request");
      url.searchParams.set("api_key", process.env.RAINFOREST_API_KEY);
      url.searchParams.set("type", "product");
      url.searchParams.set("amazon_domain", "amazon.in");
      url.searchParams.set("asin", idToLookup);

      const res = await fetch(url.toString(), {
        next: { revalidate: 86400 }, // Cache on server for 24 hours
      });

      if (res.ok) {
        const data = await res.json();
        const priceRaw =
          data?.product?.buybox_winner?.price?.raw ||
          data?.product?.buybox_winner?.price?.value;
        const inStock =
          data?.product?.buybox_winner?.availability?.type === "in_stock";

        if (priceRaw) {
          const formatted =
            typeof priceRaw === "number" ? `₹${priceRaw}` : String(priceRaw);
          return NextResponse.json(
            {
              price: formatted,
              inStock,
              source: "amazon.in",
            },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=86400, stale-while-revalidate=43200",
              },
            }
          );
        }
      }
    } catch {
      // Fallback silently if third party call fails
    }
  }

  // 2. Open fallback via Google Books API (free, no API key needed for basic info)
  if (isbn) {
    try {
      const googleRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`,
        { next: { revalidate: 86400 } }
      );
      if (googleRes.ok) {
        const googleData = await googleRes.json();
        const item = googleData.items?.[0];
        const saleInfo = item?.saleInfo;
        if (saleInfo?.saleability === "FOR_SALE" && saleInfo?.retailPrice) {
          const amount = Math.round(saleInfo.retailPrice.amount);
          const currency = saleInfo.retailPrice.currencyCode || "INR";
          return NextResponse.json(
            {
              price:
                currency === "INR" ? `₹${amount}` : `${currency} ${amount}`,
              inStock: true,
              source: "google-books",
            },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=86400, stale-while-revalidate=43200",
              },
            }
          );
        }
      }
    } catch {
      // Fallback
    }
  }

  // 3. Fallback when no live price is found
  return NextResponse.json(
    {
      price: null,
      source: "none",
      query: { isbn, asin, title },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600",
      },
    }
  );
}
