import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const TOTAL_SUBJECTS = 17;
const TOTAL_WEEKS = 15;
const TOTAL_CELLS = TOTAL_SUBJECTS * TOTAL_WEEKS; // 255

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

    let totalProgress = 0;

    let requiredDone = new Set();
    let electiveDone = new Set();

    results.forEach((page) => {
      const props = page.properties;

      const name = props.Name?.title?.[0]?.plain_text;
      const type = props.Select?.select?.name; // 필수 / 선택
      const week = props.Number?.number;

      if (!name || !type || week == null) return;

      // 📌 핵심: 1~15 모두 "진행량"으로 누적
      totalProgress += week;

      // 📌 완료 기준
      if (week === 15) {
        if (type === "필수") requiredDone.add(name);
        if (type === "선택") electiveDone.add(name);
      }
    });

    // 📌 전체 퍼센트 (255칸 기준)
    const percent =
      TOTAL_CELLS === 0
        ? 0
        : Math.round((totalProgress / TOTAL_CELLS) * 100);

    return NextResponse.json({
      percent,

      // 완료 과목 수
      requiredDone: requiredDone.size,
      requiredTotal: 10,

      electiveDone: electiveDone.size,
      electiveTotal: 7,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Notion fetch failed" },
      { status: 500 }
    );
  }
}
