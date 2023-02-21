import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { authService } from '../../services/authService';
import * as Yup from 'yup';
import {
  MINIMUM_NICKNAME_LENGTH,
  MAXIMUM_NICKNAME_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
} from '../../shared/constants';
import logo from '../../assets/durak-logo-text.webp';
import styles from './styles.m.scss';

const LoginSchema = Yup.object().shape({
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
});

interface LoginFormProps {
  onChangeForm: () => void;
}

interface FormValues {
  username: string;
  password: string;
}

export const LoginForm = ({ onChangeForm }: LoginFormProps) => {
  const [APIError, setAPIError] = useState<string | null>(null);

  const handleSubmit = async ({ username, password }: FormValues) => {
    console.log('username', username, 'password', password);
    const result = await authService.login(username, password);
    console.log(result);

    setAPIError(result.error);
  };

  return (
    <div className={styles.contents}>
      <img
        src={logo}
        alt="Game logo"
      />
      <button
        type="button"
        onClick={onChangeForm}
      >
        <p className={styles.accountLink}>Need an account?</p>
      </button>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
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
          {APIError && <div className={styles.formError}>{APIError}</div>}

          <button
            className={`btn ${styles.submitButton}`}
            type="submit"
          >
            login
          </button>
        </Form>
      </Formik>
    </div>
  );
};
