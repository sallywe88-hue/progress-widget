import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function GET() {
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    // 🔥 핵심 디버그 (이거 꼭 로그에 찍힘)
    console.log("NOTION RESPONSE:", JSON.stringify(data, null, 2));

    const results = data.results || [];

    let requiredDone = 0;
    let requiredTotal = 0;
    let electiveDone = 0;
    let electiveTotal = 0;

    results.forEach((page) => {
      const props = page.properties;

      // 🔥 실제 Notion 구조 확인용 로그
      console.log("PAGE PROPS:", props);

      const type = props.Select?.select?.name; // 필수 / 선택
      const week = props.Number?.number; // 1~15

      console.log("PARSED:", { type, week });

      // 데이터 없으면 스킵
      if (!type || week == null) return;

      if (type === "필수") {
        requiredTotal++;
        requiredDone++;
      }

      if (type === "선택") {
        electiveTotal++;
        electiveDone++;
      }
    });

    const total = requiredTotal + electiveTotal;
    const done = requiredDone + electiveDone;

    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    return NextResponse.json({
      percent,
      requiredDone,
      requiredTotal,
      electiveDone,
      electiveTotal,
    });
  } catch (err) {
    console.error("NOTION ERROR:", err);

    return NextResponse.json(
      { error: "Notion fetch failed" },
      { status: 500 }
    );
  }
}
