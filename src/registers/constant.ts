import { JpexInstance } from '../types';

function constant(jpex: JpexInstance, name: any, obj: any) {
  return jpex.factory(name, [], () => obj).lifecycle.application();
}

export default constant;
