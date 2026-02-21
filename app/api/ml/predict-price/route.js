import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const mlResponse = await fetch(
      "https://sami123.pythonanywhere.com/predict-api",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    // ✅ Check if Flask returned error
    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error("Flask Error:", errorText);

      return NextResponse.json(
        { message: "ML server error" },
        { status: mlResponse.status }
      );
    }

    const data = await mlResponse.json();

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("ML Prediction Error:", error);

    return NextResponse.json(
      { message: "ML prediction failed" },
      { status: 500 }
    );
  }
}