import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/authService';
import { useUserStore } from '../../store/userStore';
import { REDIRECT_TIMEOUT } from '../../shared/constants';
import { TypeRoute } from '../../shared/types';
import logo from '../../assets/durak-logo-text.webp';
import styles from './LoginForm.m.scss';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Required'),

  password: Yup.string().required('Required'),
});

interface LoginFormProps {
  onChangeForm: () => void;
}

interface FormValues {
  username: string;
  password: string;
}

export const LoginForm = ({ onChangeForm }: LoginFormProps) => {
  const navigate = useNavigate();
  const { actions } = useUserStore();
  const [APIError, setAPIError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async ({ username, password }: FormValues) => {
    const result = await authService.login(username, password);

    if (result.data) {
      setSuccessMessage('Login successful. Redirecting...');
      setAPIError(null);
      await actions.setUser();
      setTimeout(() => {
        navigate(TypeRoute.Rooms);
      }, REDIRECT_TIMEOUT);
    }

    if (result.error) {
      setAPIError(`HTTP status ${result.error.statusCode}: ${result.error.message}`);
    }
  };

  return (
    <div className={styles.contents}>
      <img
        className={styles.gameLogo}
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
          {successMessage && <div className={styles.formSuccess}>{successMessage}</div>}

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
