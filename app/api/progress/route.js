import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function GET() {
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    const results = data.results || [];

    let requiredDone = 0;
    let requiredTotal = 0;
    let electiveDone = 0;
    let electiveTotal = 0;

    results.forEach((page) => {
      const props = page.properties;

      const type = props.Select?.select?.name; // 필수 / 선택
      const week = props.Number?.number; // 1~15

      if (!type || !week) return;

      if (type === "필수") {
        requiredTotal++;
        if (week > 0) requiredDone++;
      }

      if (type === "선택") {
        electiveTotal++;
        if (week > 0) electiveDone++;
      }
    });

    const totalDone = requiredDone + electiveDone;
    const total = requiredTotal + electiveTotal;

    const percent = total === 0 ? 0 : Math.round((totalDone / total) * 100);

    return NextResponse.json({
      percent,
      requiredDone,
      requiredTotal,
      electiveDone,
      electiveTotal,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Notion fetch failed" },
      { status: 500 }
    );
  }
}
