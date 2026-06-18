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

    // 📌 과목별 상태 저장
    const subjects = {};

    results.forEach((page) => {
      const props = page.properties;

      const name = props.Name?.title?.[0]?.plain_text;
      const type = props.Select?.select?.name;
      const week = props.Number?.number;

      if (!name || !type || week == null) return;

      // 과목 하나로 묶기
      if (!subjects[name]) {
        subjects[name] = {
          type,
          maxWeek: 0,
        };
      }

      // 가장 큰 week 저장
      if (week > subjects[name].maxWeek) {
        subjects[name].maxWeek = week;
      }
    });

    let requiredDone = 0;
    let electiveDone = 0;

    Object.values(subjects).forEach((subj) => {
      const isDone = subj.maxWeek === 15;

      if (subj.type === "필수") {
        if (isDone) requiredDone++;
      }

      if (subj.type === "선택") {
        if (isDone) electiveDone++;
      }
    });

    const totalSubjects = Object.keys(subjects).length;

    const percent =
      totalSubjects === 0
        ? 0
        : Math.round((totalSubjects / 17) * 100);

    return NextResponse.json({
      percent,

      requiredDone,
      requiredTotal: 10,

      electiveDone,
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
