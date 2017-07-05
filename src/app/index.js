import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import Interannual from './components/interannual';

import '../styles/style.scss';

moment.locale('es', {
  months : [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
    'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
});
moment.locale('es');

const App = <Interannual />;

ReactDOM.render(App, document.getElementById('chart'));
