import styles from './Spinner.m.scss';

export const Spinner = () => {
  return (
    <div className={styles.wrpapper}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>Loading...</div>
    </div>
  );
};
