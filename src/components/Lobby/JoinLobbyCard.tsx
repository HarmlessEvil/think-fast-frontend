import { Formik, Form, Field, ErrorMessage } from 'formik';
import { withZodSchema } from 'formik-validator-zod';
import urlJoin from 'proper-url-join';
import { useSubmit } from 'react-router-dom';
import styles from './JoinLobbyCard.module.css';
import { schema } from './JoinLobbySchema.ts';

export const JoinLobbyCard = () => {
  const submit = useSubmit();

  return (
    <Formik initialValues={{
      lobbyID: '',
    }} onSubmit={async (values) => {
      submit(values, {
        action: urlJoin('/lobby', values.lobbyID),
        method: 'put'
      });
    }} validate={withZodSchema(schema)}>
      {() => (
        <Form className={styles.card} method="put">
          <h2>Join a lobby</h2>
          <p>Enter the code shared by the lobby host to join.</p>

          <Field type="text" required name="lobbyID" placeholder="Enter Lobby Code"/>
          <ErrorMessage name="lobbyID"/>

          <button>Join Lobby</button>
        </Form>
      )}
    </Formik>
  );
};
