"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress", {
          cache: "no-store",
        });

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  if (!data) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.percent}>{data.percent}%</div>

        <div className={styles.bar}>
          <div
            className={styles.fill}
            style={{ width: `${data.percent}%` }}
          />
        </div>

        <div className={styles.text}>
          <div>필수 {data.requiredDone}/{data.requiredTotal}개</div>
          <div>선택 {data.electiveDone}/{data.electiveTotal}개</div>
        </div>
      </div>
    </div>
  );
}
}
