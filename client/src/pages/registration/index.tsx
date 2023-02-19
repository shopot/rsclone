import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { MotionContainer } from '../../components/MotionContainer';
import {
  MINIMUM_NICKNAME_LENGTH,
  MAXIMUM_NICKNAME_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
} from '../../shared/constants';
import logo from '../../assets/durak-logo-text.webp';
import styles from './styles.m.scss';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(MINIMUM_NICKNAME_LENGTH, `Must be ${MINIMUM_NICKNAME_LENGTH} characters or more`)
    .max(MAXIMUM_NICKNAME_LENGTH, `Must be ${MAXIMUM_NICKNAME_LENGTH} characters or less`)
    .required('Required'),

  password: Yup.string()
    .matches(/^(?=.*[a-z])/, 'Must contain at least one lowercase character')
    .matches(/^(?=.*[A-Z])/, 'Must contain at least one uppercase character')
    .matches(/^(?=.*\d)/, 'Must contain at least one digit')
    .min(MINIMUM_PASSWORD_LENGTH, `Must be ${MINIMUM_PASSWORD_LENGTH} characters or more`)
    .required('Required'),

  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Password must be the same')
    .required('Required'),
});

const RegistrationPage = () => {
  return (
    <div className={styles.registrationPage}>
      <MotionContainer identKey="RegistrationPage">
        <div className={styles.contents}>
          <img
            src={logo}
            alt="Game logo"
          />
          <Link to="/login">
            <p className={styles.accountLink}>Have an account?</p>
          </Link>
          <Formik
            initialValues={{
              username: '',
              password: '',
              passwordConfirm: '',
            }}
            validationSchema={RegisterSchema}
            onSubmit={(values) => console.log(values)}
          >
            <Form
              className={styles.form}
              autoComplete="off"
            >
              <Field
                name="username"
                type="text"
                required
                placeholder="username"
              />
              <ErrorMessage name="username">
                {(msg) => <div className={styles.formError}>{msg}</div>}
              </ErrorMessage>
              <Field
                name="password"
                type="password"
                required
                placeholder="password"
              />
              <ErrorMessage name="password">
                {(msg) => <div className={styles.formError}>{msg}</div>}
              </ErrorMessage>
              <Field
                name="passwordConfirm"
                type="password"
                required
                placeholder="confirm password"
              />
              <ErrorMessage name="passwordConfirm">
                {(msg) => <div className={styles.formError}>{msg}</div>}
              </ErrorMessage>

              <button
                className={`btn ${styles.submitButton}`}
                type="submit"
              >
                register
              </button>
            </Form>
          </Formik>
        </div>
      </MotionContainer>
    </div>
  );
};

export default RegistrationPage;
