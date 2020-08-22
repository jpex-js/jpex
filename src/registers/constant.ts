import { JpexInstance } from '../types';

function constant(jpex: JpexInstance, name: string, obj: any) {
  return jpex.factory(name, [], () => obj, { lifecycle: 'application' });
}

export default constant;
