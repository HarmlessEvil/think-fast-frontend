import { ErrorMessage, Field, Form, Formik } from 'formik';
import { withZodSchema } from 'formik-validator-zod';
import { useSubmit } from 'react-router-dom';
import { schema } from '../../components/Auth/LoginSchema.ts';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const submit = useSubmit();

  return (
    <div className={styles.page}>
      <Formik initialValues={{
        username: '',
      }} onSubmit={async (values) => {
        submit(values, { method: 'post' });
      }} validate={withZodSchema(schema)}>
        {() => (
          <Form method="post">
            <h1>Welcome to Think Fast!</h1>
            <p>Log in to continue</p>

            <label> Username
              <Field type="text" required name="username"/>
            </label>
            <ErrorMessage name="username"/>

            <button type="submit">Login</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
