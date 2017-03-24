# dva-sentry

tracing action and effect, upload when an error occurs

```js
import createSentry from 'dva-sentry';

const { user: { login, name, workid, email }, env } = window.context;
const app = dva();

app.use(createSentry({
  onReducerError,
  onEffectError,
  dsn,
  config: {
    environment: env,
    shouldSendCallback: data => data.environment !== 'local'
      && data.environment !== 'unittest',
  },
  context: {
    user: {
      login, name, workid, email,
    },
  },
}));
```