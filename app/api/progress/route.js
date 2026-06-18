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
    const results = data.results || [];

    let required = 0;
    let elective = 0;

    results.forEach((page) => {
      const props = page.properties;

      const type = props.Select?.select?.name;

      if (type === "필수") required++;
      if (type === "선택") elective++;
    });

    const total = required + elective;
    const done = total; // 현재는 "전체 완료 기준" 없음

    const percent = total === 0 ? 0 : 100;

    return NextResponse.json({
      percent,
      requiredDone: required,
      requiredTotal: required,
      electiveDone: elective,
      electiveTotal: elective,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch Notion data" },
      { status: 500 }
    );
  }
}
