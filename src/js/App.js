// --------------------------------------------------------------------------------
// IMPORTS [ ONLY WITH WEBPACK ]
// --------------------------------------------------------------------------------
// import [class name | variable]('file_path[.js]');
import Rapp from './relast.js';
import Comp_test1 from './comps/Comp_test1.js';
// // --------------------------------------------------------------------------------
// // --------------------------------------------------------------------------------

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
		this.action('test_action1', (args)=>
			{
				if(this.get_state('a') === 2)
					this.state('a', 1);
				else
					this.state('a', 2);
			});
		this.action('change_input', (args)=>
			{
				this.state('input', args.target.value);
			});
		this.action('form_submit', (args)=>
			{
				console.log(args);
			});

		// --------------------------------------------------------------------------------
		// HTML VIEWs
		// --------------------------------------------------------------------------------
		this._view.iterators.items = `<p key='[k]'>[v]</p>`;

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
		}
		button{font-size: 20px;}`;

		this._view.main = `<div>
			<p>${this.get_state('a')}</p>
			${this.get_state('a') === 1 ? 
				`<p>aaaaaaa</p>` 
				: 
				`<p>bbbbbb</p>`
			}
			<button onclick='test_action1'>button 1</button>
			${this.render('b', 'items')}
			${this.render('c', 'items')}
		</div>`;

		this._view.test1 = `<Comp_test1 id='aaa' class='bbb' action='aaaaaaa'></Comp_test1><br/>a
		<input type='text' onkeyup='change_input' value='[state:input]' /><br/>
		<input type='text' onkeyup='change_input' value='[state:input]' />
		<form onsubmit='form_submit'><input type='submit' value='submit 1'></form>`;
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------
	}
}
App.default_props = {};


// --------------------------------------------------------------------------------
// INCLUDE INTO window OBJECT [ ONLY WITOUT WEBPACK ]
// --------------------------------------------------------------------------------
// window.App = App;