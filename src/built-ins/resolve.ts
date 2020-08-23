import { JpexInstance, Dependency, Resolve, ResolveOpts } from '../types';
import { resolve } from '../resolver';

interface NamedParameters {
  [key: string]: any,
}

export default (jpex: JpexInstance) => {
  jpex.factory('$resolve', [ '$namedParameters' ], function(
    this: JpexInstance,
    $namedParameters: NamedParameters,
  ) {
    return (name: Dependency, opts?: ResolveOpts) => {
      return resolve(
        this, // eslint-disable-line no-invalid-this
        name,
        {
          ...opts,
          with: {
            ...$namedParameters,
            ...opts?.with,
          },
        },
      );
    };
  });
  jpex.alias<Resolve>('$resolve');
};
