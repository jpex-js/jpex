import { JpexInstance, Dependency } from '../types';
import { resolve, resolveDependencies } from '../resolver';

interface NamedParameters {
  [key: string]: any,
}

export default (jpex: JpexInstance) => {
  jpex.factory('$resolve', [ '$namedParameters' ], function(
    this: JpexInstance,
    $namedParameters: NamedParameters,
  ) {
    return (name: Dependency | Dependency[], namedParameters: NamedParameters) => {
      const allParams = {
        ...$namedParameters,
        ...namedParameters,
      };

      if (Array.isArray(name)) {
        return resolveDependencies(
          this, // eslint-disable-line no-invalid-this
          { dependencies: name },
          allParams,
        );
      }

      return resolve(
        this, // eslint-disable-line no-invalid-this
        name,
        allParams,
      );
    };
  });
};
