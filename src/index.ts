#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import books from './commands/books';
import pdf from './commands/pdf';
import epub from './commands/epub';

console.log(
  '\n',
  figlet.textSync('Wan Shi Tong', {
    width: process.stdout.columns,
    font: 'Fuzzy',
  }),
);

const program = new Command();

program.version('1.0.0');

books(program);
pdf(program);
epub(program);

program.parse();
