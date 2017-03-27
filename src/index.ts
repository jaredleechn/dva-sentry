// import undoable from 'redux-undo';
import Raven from './sentry';

export { Raven };

export interface ICommand {
  onReducerError?: (e: Error, traceID: string, dispatch: () => void) => void;
  onEffectError?: (e: Error, traceID: string, dispatch: () => void) => void;
  dsn: string;
  config?: {};
  context?: {
    user?: {},
    tags?: {},
    extra?: {},
  };
}

const noop = () => null;

export default function createMiddleware(options: ICommand) {
  const {
    onReducerError = noop,
    onEffectError = noop,
    dsn,
    config,
    context,
  } = options;

  Raven.config(dsn, {
    ...config,
  }).install();

  if (context) {
    const { user, tags, extra } = context;
    if (user) {
      Raven.setUserContext(user);
    }
    if (tags) {
      Raven.setTagsContext(tags);
    }
    if (extra) {
      Raven.setExtraContext(extra);
    }
  }

  return {
    onAction: (store) => (next) => (action) => {
      try {
        const { type, ...others } = action;
        Raven.captureBreadcrumb({
          category: 'action.start',
          data: others,
          message: type,
        });
        const result = next(action);
        Raven.captureBreadcrumb({
          category: 'action.end',
          data: others,
          message: type,
        });
      } catch (e) {
        Raven.captureException(e, {
          extra: {
            action,
            state: store.getState(),
          },
          logger: 'javascript.action',
        });
        onReducerError(e, Raven.lastEventId(), store.dispatch);
        throw e;
      }
    },
    // onReducer: (reducer) => (state, action) => {
    //   const { type, ...others } = action;
    //   Raven.captureBreadcrumb({
    //     category: 'reducer.start',
    //     data: others,
    //     message: type,
    //   });
    //   const newState = undoable(reducer, {})(state, action);
    //   Raven.captureBreadcrumb({
    //     category: 'reducer.end',
    //     data: others,
    //     message: type,
    //   });
    //   return { ...newState, routing: newState.present.routing, ...newState.present };
    // },
    onEffect: (effect, _, model, action) => function*(...args) {
      Raven.captureBreadcrumb({
        category: 'effect.start',
        message: action,
      });
      yield effect(...args);
      Raven.captureBreadcrumb({
        category: 'effect.end',
        message: action,
      });
    },
    onError: (e, dispatch) => {
      Raven.captureException(e, {
        extra: {},
        logger: 'javascript.effect',
      });
      onEffectError(e, Raven.lastEventId(), dispatch);
      throw e;
    },
  };
}
