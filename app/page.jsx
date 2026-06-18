import styles from "./styles.module.css";

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.percent}>63%</div>

        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: "63%" }} />
        </div>

        <div className={styles.text}>
          <div>필수 6/10개</div>
          <div>선택 3/7개</div>
        </div>
      </div>
    </div>
  );
}
