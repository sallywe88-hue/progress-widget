import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const TOTAL_WEEKS = 15;
const TOTAL_SUBJECTS = 17;

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

    // 📌 필수 / 선택 과목 리스트
    let requiredSubjects = new Set();
    let electiveSubjects = new Set();

    // 📌 진행된 주차 (전체 기준)
    let completedWeeks = 0;

    results.forEach((page) => {
      const props = page.properties;

      const type = props.Select?.select?.name; // 필수 / 선택
      const week = props.Number?.number; // 1~15
      const name = props.Name?.title?.[0]?.plain_text;

      if (!type || week == null) return;

      // 과목 분류
      if (type === "필수") requiredSubjects.add(name);
      if (type === "선택") electiveSubjects.add(name);

      // 주차 진행 = 완료된 것으로 계산
      if (week > 0) completedWeeks++;
    });

    // 📌 기준값
    const totalCells = TOTAL_SUBJECTS * TOTAL_WEEKS;

    const percent =
      totalCells === 0
        ? 0
        : Math.round((completedWeeks / totalCells) * 100);

    return NextResponse.json({
      percent,

      // 필수 / 선택 과목 개수
      requiredTotal: 10,
      electiveTotal: 7,

      requiredDone: requiredSubjects.size,
      electiveDone: electiveSubjects.size,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Notion fetch failed" },
      { status: 500 }
    );
  }
}
