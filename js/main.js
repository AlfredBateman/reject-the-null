import {$,HAS,render} from './render.js';
import {initUi} from './ui.js';
import {initMotion} from './motion.js';
import {initIntro} from './intro.js';
import {diagrams} from './diagrams.js';
import {github} from './github.js';

render();
await github();
diagrams();
initUi();
if(!HAS)$('#intro').hidden=true;
else{initMotion();initIntro()}
