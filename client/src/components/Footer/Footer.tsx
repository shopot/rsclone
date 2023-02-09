import styles from './Footer.m.scss';
import GitHubIcon from '../../assets/github-dark-bg.svg?component';
import RSSchoolIcon from '../../assets/rslogo-dark-bg.svg?component';

export const Footer = () => {
  return (
    <div className={`footer ${styles.footer}`}>
      <div className="container">
        <div className="text-center">
          <section className={styles.creditsSection}>
            <p>© 2023</p>
            <a
              href="https://github.com/shopot/"
              className={styles.iconLink}
            >
              <GitHubIcon className={styles.SVGIcon} />
              <span>shopot</span>
            </a>
            <a
              href="https://github.com/sinastya"
              className={styles.iconLink}
            >
              <GitHubIcon className={styles.SVGIcon} />
              <span>sinastya</span>
            </a>
            <a
              href="https://github.com/gentoosiast/"
              className={styles.iconLink}
            >
              <GitHubIcon className={styles.SVGIcon} />
              <span>gentoosiast</span>
            </a>
            <a
              href="https://rs.school/js/"
              className={styles.iconLink}
            >
              <RSSchoolIcon className={styles.SVGIcon} />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};
