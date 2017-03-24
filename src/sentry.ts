import * as Raven from 'raven-js';

Raven.setTagsContext({
  location: 'frontend',
});

export default Raven;
