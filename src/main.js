import Rapp from './js/relast.js';
import App from './js/App.js';
require('./assets/fonts/fonts.js');

window.onload = function()
{
	Rapp.create_app({class: App, name: 'App', bbox: 'relast'}).title('Social Baboons');
}