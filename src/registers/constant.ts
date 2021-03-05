import { JpexInstance } from '../types';
import { isPassive, validateName } from '../utils';

export default function constant(this: JpexInstance, name: string, obj: any) {
  validateName(name);

  if (isPassive(name, this)) {
    return;
  }

  this.$$factories[name] = {
    fn: () => obj,
    lifecycle: 'application',
    value: obj,
    resolved: true,
  };
}
