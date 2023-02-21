import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { simpleApiClient, HTTPRequestMethod, ApiEndpoint } from '../../shared/api';
import { LoginRegisterMessageValidator } from '../../shared/validators';
import {
  MINIMUM_NICKNAME_LENGTH,
  MAXIMUM_NICKNAME_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
  REDIRECT_TIMEOUT,
} from '../../shared/constants';
import { TypeRoute } from '../../shared/types';
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

interface RegisterFormProps {
  onChangeForm: () => void;
}

interface FormValues {
  username: string;
  password: string;
  passwordConfirm: string;
}

export const RegisterForm = ({ onChangeForm }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [APIError, setAPIError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async ({ username, password }: FormValues) => {
    console.log('username', username, 'password', password);
    const result = await simpleApiClient.fetch(
      HTTPRequestMethod.POST,
      ApiEndpoint.AuthSignup,
      LoginRegisterMessageValidator,
      { username, password },
    );

    if (result.data) {
      setSuccessMessage('Registration successful. Redirecting...');
      setAPIError(null);
      setTimeout(() => {
        navigate(TypeRoute.About);
      }, REDIRECT_TIMEOUT);
    }

    if (result.error) {
      setAPIError(result.error);
    }
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
        <p className={styles.accountLink}>Have an account?</p>
      </button>
      <Formik
        initialValues={{
          username: '',
          password: '',
          passwordConfirm: '',
        }}
        validationSchema={RegisterSchema}
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
          <Field
            name="passwordConfirm"
            type="password"
            required
            placeholder="confirm password"
          />
          <ErrorMessage name="passwordConfirm">
            {(msg) => <div className={styles.formError}>{msg}</div>}
          </ErrorMessage>
          {APIError && <div className={styles.formError}>{APIError}</div>}
          {successMessage && <div className={styles.formSuccess}>{successMessage}</div>}

          <button
            className={`btn ${styles.submitButton}`}
            type="submit"
          >
            register
          </button>
        </Form>
      </Formik>
    </div>
  );
};
