import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
        cache: "no-store",
      }
    );

    const data = await res.json();
    const results = data.results || [];

    let requiredDone = 0;
    let requiredTotal = 10;

    let electiveDone = 0;
    let electiveTotal = 7;

    let totalProgress = 0;

    results.forEach((page) => {
      const props = page.properties;

      const type = props.Select?.select?.name; // 필수 / 선택
      const week = props.Number?.number ?? 0;   // 1~15

      if (!type) return;

      // 🔥 전체 진행률 핵심
      totalProgress += week;

      // 필수 / 선택 완료 카운트 (15일 때만 완료)
      if (type === "필수") {
        if (week === 15) requiredDone++;
      }

      if (type === "선택") {
        if (week === 15) electiveDone++;
      }
    });

    const maxTotal = (requiredTotal + electiveTotal) * 15;

    const percent =
      maxTotal === 0
        ? 0
        : Math.round((totalProgress / maxTotal) * 100);

    return NextResponse.json({
      percent,
      requiredDone,
      requiredTotal,
      electiveDone,
      electiveTotal,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Notion fetch failed" },
      { status: 500 }
    );
  }
}
