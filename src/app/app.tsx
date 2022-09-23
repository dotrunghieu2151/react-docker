import * as React from 'react';

import { test } from '@/libs/mod';

import './assets/styles/main.scss';

type Prop = {
  test?: string;
};

const Person = {
  name: 'hi',
  games: ['da', 'pha'],
};

const test1 = Person?.games;
console.log(test1);

const App: React.FC<Prop> = () => <div>{test}</div>;

export default App;
