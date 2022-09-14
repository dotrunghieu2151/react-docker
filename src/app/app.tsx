import * as React from 'react';

import './assets/styles/main.scss';
import { test } from '@/app/libs/test';

type Prop = {
  test?: string;
};

const App: React.FC<Prop> = () => <div>{test}</div>;

export default App;
