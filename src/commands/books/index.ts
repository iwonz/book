import { Command } from 'commander';

export default function (program: Command) {
  program.command('hi').description('Hi.');
}
