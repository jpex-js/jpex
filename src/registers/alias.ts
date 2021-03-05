import { JpexInstance } from '../types';

export default function alias(this: JpexInstance, alias: any, name: any) {
  if (this.$$alias[alias] == null || this.$$config.precedence === 'active') {
    this.$$alias[alias] = name;
  }
  if (this.$$alias[name] == null || this.$$config.precedence === 'active') {
    this.$$alias[name] = alias;
  }
}
