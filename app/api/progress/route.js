import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function GET() {
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

  let totalProgress = 0;

  let requiredDone = new Set();
  let electiveDone = new Set();

  data.results.forEach((page) => {
    const props = page.properties;

    const name = props.Name?.title?.[0]?.plain_text;
    const type = props.Select?.select?.name;
    const week = props.Number?.number;

    if (!name || !type || week == null) return;

    totalProgress += week;

    if (week === 15) {
      if (type === "필수") requiredDone.add(name);
      if (type === "선택") electiveDone.add(name);
    }
  });

  const percent = Math.round((totalProgress / (17 * 15)) * 100);

  return NextResponse.json({
    percent,
    requiredDone: requiredDone.size,
    requiredTotal: 10,
    electiveDone: electiveDone.size,
    electiveTotal: 7,
  });
}
  
