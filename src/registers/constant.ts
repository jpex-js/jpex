import { JpexInstance } from '../types';

export default function constant(this: JpexInstance, name: string, obj: any) {
  return this.factory(name, [], () => obj, { lifecycle: 'application' });
}
