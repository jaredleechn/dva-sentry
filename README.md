# dva-sentry

[![NPM version](https://img.shields.io/npm/v/dva-sentry.svg?style=flat)](https://npmjs.org/package/dva-sentry)

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