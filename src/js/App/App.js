// --------------------------------------------------------------------------------
// IMPORTS [ ONLY WITH WEBPACK ]
// --------------------------------------------------------------------------------
// import [class name | variable]('file_path[.js]');
import Rapp from '../relast.js';
import app_view from './App.html';
import Comp_test1 from '../comps/Comp_test1/Comp_test1.js';
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

export default class App extends Rapp
{
	constructor(conf)
	{
		super(conf);


		// --------------------------------------------------------------------------------
		// ADD COMPONENTS [ ONLY WITH WEBPACK ]
		// --------------------------------------------------------------------------------
		// this.add_comp([class_name:string], [class:class]);
		// this.add_comps([classes:Array]); --> item array: {name: [class_name:string], class: [class:imported-object]}
		this.add_comps([{class: Comp_test1, name: 'Comp_test1'}]);
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------

		// --------------------------------------------------------------------------------
		// INCLUDES [ ONLY WITHOUT WEBPACK ]
		// --------------------------------------------------------------------------------
		// this.include('file_path[.js]', [class_name]);
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------
		// this.include('js/comps/Comp_test1.js', 'Comp_test1');
	}
	states()
	{
		// --------------------------------------------------------------------------------
		// STATES
		// --------------------------------------------------------------------------------
		// this.state('state_key', [value]);
		// this.get_state('state_key');
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------
		this.state('a', 2);
		this.state('input', 'asdefwefewrfgew');
		this.state('b', ['dsfawfwe', 'wqfefwefqw', 'ewqfwefqwtef']);
		this.state('c', {a: 1, b: 2});
	}
	run = function(props)
	{
		// --------------------------------------------------------------------------------
		// ACTIONS
		// --------------------------------------------------------------------------------
		// this.action('action_key', (args)=>{...});
		// this.call_action('action_key', args[object]);
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------

		// --------------------------------------------------------------------------------
		// HTML VIEWs
		// --------------------------------------------------------------------------------
		// this._view.iterators.items = `<p key='[k]'>[v]</p>`;

		this._view.style =`
		@font-face {
			font-family: 'aaarghnormal';
			src: url('assets/fonts/aaargh-webfont.woff2') format('woff2'),
				url('assets/fonts/aaargh-webfont.woff') format('woff');
			font-weight: normal;
			font-style: normal;
		}
		@font-face {
			font-family: 'abelregular';
			src: url('assets/fonts/abel-regular-webfont.woff2') format('woff2'),
				url('assets/fonts/abel-regular-webfont.woff') format('woff');
			font-weight: normal;
			font-style: normal;
		}`;

		this._view.main = app_view;
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------
	}
}
App.default_props = {};


// --------------------------------------------------------------------------------
// INCLUDE INTO window OBJECT [ ONLY WITOUT WEBPACK ]
// --------------------------------------------------------------------------------
// window.App = App;