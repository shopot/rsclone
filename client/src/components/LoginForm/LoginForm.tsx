import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LoginMessageValidator } from '../../shared/validators/LoginMessageValidator';
import { simpleApiClient, HTTPRequestMethod, ApiEndpoint } from '../../shared/api';
import { TypeRoute } from '../../shared/types';
import logo from '../../assets/durak-logo-text.webp';
import styles from './styles.m.scss';

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
  const [APIError, setAPIError] = useState<string | null>(null);

  const handleSubmit = async ({ username, password }: FormValues) => {
    const result = await simpleApiClient.fetch(
      HTTPRequestMethod.POST,
      ApiEndpoint.AuthSignin,
      LoginMessageValidator,
      { username, password },
    );

    if (result.data) {
      navigate(TypeRoute.Rooms);
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
