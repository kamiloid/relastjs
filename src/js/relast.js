export default class Rapp{
	_token = null;
	_debug = false;
	_conf = null;
	_main = null;
	_parent = null;
	_name = '';
	_bbox = null;
	_id = {};//save nodes indexed with ref:id attribute
	_class = {};
	_ev = {};
	_actions = {};
	_methods = {};
	_states = {};
	_prev_states = {};
	_rstates = {};
	_istates = {};
	_view = {main: '<fragment></fragment>', iterators: {}, style:``};
	_net = {};
	_mods = {};
	_includes = {};
	_props = {};
	_app_sections = {};
	constructor(conf)
	{
		this._conf = conf;
		this._name = conf.name || "unknow app";
		this._bbox = conf.bbox ? ( typeof(conf.bbox) === 'string' ? document.getElementById(conf.bbox) : conf.bbox ) : null;
		this._main = conf.main;
		this._parent = conf.parent;

		if(this.created)
			this.created();
		if(this.states)
		{
			this.states();
			this.sync_states();
		}
		if(this.methods)
			this.methods();
	};
	title = function(title)
	{
		let title_tag = document.createElement('title');
		title_tag.innerHTML = title;
		document.head.appendChild(title_tag);
	};
	add_section = function(name, mod, title, restricted = false)
	{
		this._app_sections[name] = {name: name, mod: mod, title: title, restricted: restricted};
		for(let m in this._mods){
			if(this._mods.hasOwnProperty(m)){
				let node = this._mods[m];
				node.add_section(name, mod, title, restricted);
			}	
		}
	};
	sync_states = function()
	{
		this._prev_states = {};
		for(let k in this._states)
			this._prev_states[k] = {v: this._states[k], changed: false};
	};
	any_states_changed = function()
	{
		let changed = false;
		for(let k in this._states)
			if(this._prev_states[k].v !== this._states[k])
			{
				this._prev_states[k].changed = true;
				change = true;
			}
		return changed;
	};
	state_changed = function(key)
	{
		if(!this._prev_states[key] || !this._states[key]) return false;
		if(this._prev_states[key].v !== this._states[key])
			this._prev_states[key].changed = true;
		return this._prev_states[key].changed;
	};
	states_changed = function()
	{
		let buffer = [];
		for(let k in this._states)
		{
			console.log(this._prev_states[k].v, this._states[k]);
			if(this._prev_states[k].v !== this._states[k])
			{
				this._prev_states[k].changed = true;
				buffer.push(k);
			}
		}
		return buffer;
	};
	check_changed_state_in_read_states = function()
	{
		let buffer = this.states_changed();
		for(let k in buffer)
			if(this._rstates[k])
				return true;
		return false;
	};
	get_props = function()
	{
		return this._props;
	};
	get_main = function(mod)
	{
		if(!mod) return null;
		let aux = mod;
		while(aux._parent != null)
			aux = aux._parent;
		return aux;
	};
	init = function(props = null)
	{
		if(!this._bbox) return;
		if(this.run){
			this.run(props || this._props);
			// this.run_sub_mods(this);
		}
		this.exec();
	};
	update = function(props = null)
	{
		this.init(props || this._props);
	};
	exec = function()
	{
		if(!this._bbox) return;
		this.run_dom();
	};
	add_comp = function(class_name, comp)
	{
		if(!comp) return;
		this._includes[class_name.toLowerCase()] = class_name;

		let mod_data =
		{
			class: comp,
			name: class_name,
			bbox: class_name,
			parent: this,
			main: (this._main || this)
		}
		let mod = Rapp.create_app(mod_data);
		(this._main || this)._mods[class_name] = mod;
	};
	add_comps = function(comps)
	{
		if(!comps) return;
		if(!Array.isArray(comps)) return;
		for(let c in comps)
		{
			if(!comps.hasOwnProperty(c)) continue;
			this.add_comp(comps[c].name, comps[c].class);
		}
	};
	get_comp = function(name)
	{
		if(!name) return;
		if(typeof(name) != 'string') return;
		for(let c in (this._main || this)._mods)
			if(c.toLowerCase() === name.toLowerCase())
				return (this._main || this)._mods[c];
		return null;
	};
	clean_dom = function(dom)
	{
		if(!dom) return;
		dom.innerHTML = '';
		if(dom.parentNode)
			dom.parentNode.removeChild(dom);
		dom = null;
	};
	run_sub_mods = function(parent)
	{
		let main = this._main || this;
		for(let m in main._mods)
		{
			if(!main._mods.hasOwnProperty(m)) continue;
			let mod = main._mods[m];
			if(mod === null || mod === undefined) continue;
			if(mod._parent._name !== parent._name) continue;
			mod.init();
			this.run_sub_mods(mod);
		}
	};
	if_regex_eval = function(str_dom)
	{
		return str_dom.match(/\{\%if([:|a-z|A-Z|0-9|-|_|<|>|\\|\/|\s|=|'|\[|\]|"|#])*>\%\}/gm);
	}
	for_regex_eval = function(str_dom)
	{
		return str_dom.match(/\{\%for([:|a-z|A-Z|0-9|-|_|<|>|\\|\/|\s|=|'|\[|\]|"|#|\s|\,|\-])*\%\}/gm);
	}
	render_regex_eval = function(str_dom)
	{
		return str_dom.match(/\{\%render([:|a-z|A-Z|0-9|-|_|<|>|\/|\s|=|'|\[|\]|"|#])*\%\}/gm);
	};
	render_regex = function(str_dom)
	{
		const regexp = this.render_regex_eval(str_dom);
		if(regexp !== null)
		{
			if(regexp.length === 0) return str_dom;
			for(let r of regexp)
			{
				const split = r.split(':');
				if(split[1] === null || split[1] === undefined) continue;
				if(split[2] === null || split[2] === undefined) continue;
				const state = split[1];
				this._istates[state] = true;
				if(!this._states[state]) continue;
				if(this._states[state].length === 0) continue;
				const html = split[2].substring(0, split[2].length - 2);
				this._view.iterators[`${state}_items`] = html;
				const render = this.render(state, `${state}_items`);
				str_dom = str_dom.replace(r, render);
				str_dom = this.html_regex(str_dom);
			}
		}
		return str_dom;
	};
	for_regex = function(str_dom)
	{
		const regexp = this.for_regex_eval(str_dom);
		if(regexp)
		{
			if(regexp.length === 0) return str_dom;
			for(let r of regexp)
			{
				const split = r.split(':');
				let str = '';
				if(split[1] === null || split[1] === undefined) continue;
				if(split[2] === null || split[2] === undefined) continue;
				try{
					let array_detector = split[1].match(/\[([a-z|A-Z|0-9|\,|\s|\-])+\]/g);
					const html = split[2].substring(0, split[2].length - 2);
					if(array_detector)
					{
						if(array_detector.length === 0) continue;
						const split_keys = array_detector[0].replace('[', '').replace(']', '').trim().split(',');
						for(let k of split_keys)
						{
							let v = '';
							if(k.trim().replace(/\s/g, '').includes('-'))
							{
								v = k.trim().split('-')[1].trim();
								k = k.trim().split('-')[0].trim().replace(/\s/g, '-');
							}
							str += html.replace(/(\[k\])+/g, k).replace(/(\[v\])+/g, v);
						}
					}else if(split[1].match(/([0-9])+/g))
					{
						const limit = parseInt(split[1]);
						for(let i = 0; i < limit; i++)
						{
							str += html.replace(/(\[k\])+/g, i);
						}
					}
				}catch(e){console.log(e);}
				str_dom = str_dom.replace(r, str);
				str_dom = this.html_regex(str_dom);
			}
		}
		return str_dom;
	};
	if_regex = function(str_dom)
	{
		const regexp = this.if_regex_eval(str_dom);
		if(regexp)
		{
			if(regexp.length === 0) return str_dom;
			for(let r of regexp)
			{
				const split = r.split(':');
				let str = '';
				if(split[1] === null || split[1] === undefined) continue;
				if(split[2] === null || split[2] === undefined) continue;
				try{
					const cond = split[1];
					let final_cond = cond.replace(/and/g, '&&').replace(/or/g, '||');
					for(let s in this._states)
					{
						if(!this._states.hasOwnProperty(s)) continue;
						const regex = new RegExp(s, 'g');
						if(final_cond.match(regex))
							this._istates[s] = true;
						final_cond = final_cond.replace(regex, this._states[s]);
					}
					let final_result = eval(final_cond);

					const resp_true = split.length === 3 ? split[2].substring(0, split[2].length - 2) : split[2];
					const resp_false = split.length === 4 ? split[3].substring(0, split[3].length - 2) : '';
					
					const html = final_result ? resp_true : resp_false;
					str_dom = str_dom.replace(r, html);
					str_dom = this.html_regex(str_dom);
				}catch(e){console.log(e);}
			}
		}
		return str_dom;
	};
	html_regex = function(str)
	{
		str = this.if_regex(str);
		str = this.render_regex(str);
		str = this.for_regex(str);
		return str;
	};
	run_dom = function()
	{
		let str_dom = this._view.main;

		const styles = `<style>${this._view.style.replace(/\<style\>/g, '').replace(/\<\/style\>/g, '')}</style>`;

		str_dom = this.html_regex(str_dom);
		this.translate(str_dom);
		const main = this._main || this;
		if(this._view.style.trim() !== '' && !main._view.style.includes(this._view.style))
			main._view.style += this._view.style;
		if(main === this)
		{
			const style_node = document.createElement('style');
			style_node.innerHTML = main._view.style;
			if(this._bbox)
				this._bbox.appendChild(style_node);
		}
	};
	translate = function(html)
	{
		if(this._bbox)
			this._bbox.innerHTML = '';
		const root = document.createElement('div');
		root.innerHTML = html;
		let aux = root.childNodes[0];
		const visual_root = this.translate_nodes(aux, this._bbox, this._main || this);
		if(this._bbox && visual_root)
			this._bbox.appendChild(visual_root);
	};
	translate_nodes = function(node, parent, main)
	{
		if(node === undefined || node === null) return null;
		// Avoid comments nodes
		if(node.nodeType === 8) return null;
		// create node according the node
		let n = document.createElement(node.tagName);
		// check if the node is not textual element
		if(node.nodeType !== 3 && node.tagName !== undefined)
		{
			if(this._includes[node.tagName.toLowerCase()])
			{
				let ref_attr = node.attributes['ref'];
				if(ref_attr)
					ref_attr = ref_attr.name;
				
				let comp = this.get_comp(n.tagName);
				comp._name = ref_attr || this._includes[node.tagName.toLowerCase()];
				this._mods[comp._name] = comp;
				comp._main = main;
				comp._parent = this;
				comp._bbox = parent;
				const props = {};
				for(let a of node.attributes)
				{
					let val = a.value;
					if(this._states[a.value])
						val = this._states[a.value];
					props[a.name] = val;
				}
				comp.init(props);
			}else if(node.tagName.toLowerCase() === 'input')
			{
				// if(node.attributes['type'])
				// {
				// 	if(node.attributes['type'].value.toLowerCase() === 'text')
				// 	{
				// 	}
				// }
			}
			for(let a of node.attributes)
			{
				if(a.value.toLowerCase().includes('[state:'))
				{
					const match = a.value.toLowerCase().match(/\[state:([\s|a-z|A-Z|0-9])*\]/g);
					if(match)
					{
						for(let m of match)
						{
							const split = m.replace('[', '').replace(']', '').split(':');
							const str_state = split[1];
							a.value = a.value.replace(`[state:${str_state}]`, this._states[str_state.trim()]);
							if(a.name === 'value')
								this.add_binder(str_state, n, 'i');
						}
						n.setAttribute(a.name, a.value);
					}
				}else{
					if(a.name.toLowerCase().includes('on'))
					{
						n.addEventListener(a.name.replace('on', ''), (e)=>
						{
							if(this._actions[a.value.trim()])
								this.call_action(a.value.trim(), {ev:e, target: n});
						});
					}else{
						n[a.name] = a.value;
					}
				}
			}
			for(let child of node.childNodes)
			{
				const visual_child = this.translate_nodes(child, n, main);
				if(visual_child)
					if(n.tagName.toLowerCase() !== 'fragment')
						n.appendChild(visual_child, n);
					else{
						parent.appendChild(visual_child, n);
					}
			}
			if(this._includes[node.tagName.toLowerCase()] || node.tagName.toLowerCase() === 'fragment')
				n = null;
		}else{
			node.nodeValue = node.nodeValue.trim();
			let restrictions = node.nodeValue === '' || node.nodeValue.includes('\n') || node.nodeValue.includes('\t') || node.nodeValue.includes('\r') || node.nodeValue.includes('undefined') || node.nodeValue.includes('null');
			if(restrictions)
				return null;
			// CHECK IF THERE ARE STATES IN THIS NODE
			n = document.createTextNode('');
			let node_txt = node.nodeValue;
			if(node_txt.includes('[state:'))
			{
				const match = node_txt.match(/\[state:([\s|a-z|A-Z|0-9])*\]/g);
				if(match)
				{
					for(let m of match)
					{
						const split = m.replace('[', '').replace(']', '').split(':');
						const str_state = split[1];
						node_txt = node_txt.replace(`[state:${str_state}]`, this._states[str_state.trim()]);
						this.add_binder(str_state, n, 'o');
					}
				}
			}
			n.nodeValue = node_txt;
		}
		return n;
	};
	add_binder = function(key, node, type)
	{
		if(!this._rstates[key])
			this._rstates[key] = [];
		this._rstates[key].push({
			node: node,
			type: type
		});
	};
	state = function(key, value=null)
	{
		if(!key) return;
		if(key.trim() == '') return;
		if(value === null || value === undefined) return this._states[key];

		this._prev_states[key] = this._states[key];
		this._states[key] = value;

		for(let rs in this._rstates)
		{
			if(!this._rstates.hasOwnProperty(rs)) continue;
			if(rs !== key) continue;
			for(let e of this._rstates[key])
			{
				let node = e.node;
				if(!node) continue;
				let type = e.type;
				if(node.nodeType !== 3)
				{
					if(node.hasAttribute('value'))
						node.value = value;
				}else
					node.nodeValue = this._states[key];
			}
		}
		if(this._istates[key])
			this.update();
		return {update: ()=>{this.update()}};
	};
	action = function(key, action)
	{
		if(!key || !action) return;
		if(key.trim() == '') return;
		this._actions[key] = action;
	};
	call_action = function(key, args)
	{
		if(!key) return;
		if(key.trim() == '') return;
		if(!this._actions[key]) return;
		return this._actions[key](args);
	};
	method = function(key, method)
	{
		if(!key || !method) return;
		if(key.trim() == '') return;
		this._methods[key] = method;
	};
	call_method = function(key, args)
	{
		if(!key) return;
		if(key.trim() == '') return;
		if(!this._methods[key]) return;
		return this._methods[key](args);
	};
	render = function(state, view, params = 20)
	{
		if(!state || !view) return ``;
		state = this.state(state);
		let renderer = ``;
		if(typeof(state) === 'string')
		{
			renderer = view.replace(/(\[v\])*/g, state);
		}else if(typeof(state) === 'object' || Array.isArray(state))
		{
			for(let k in state)
			{
				if(!state.hasOwnProperty(k)) continue;
				let v = state[k];
				if(typeof(v) !== 'object')
					renderer += this._view.iterators[view].replace(/\[v\]/g, v).replace(/\[k\]/g, k);
				else{
					let txt = this._view.iterators[view];
					for(let a in v)
					{
						const regex = new RegExp(`\\[${a}\\]`, 'g');
						if(txt.match(regex))
							if(txt.match(regex).length > 0)
								txt = txt.replace(regex, v[a] || '');
					}
					renderer += txt;
				}
			}
		}
		return renderer;
	};
	include = function(file, class_name)
	{
		let self = this;
		this._includes[class_name.toLowerCase()] = class_name;
		let main = self.get_main(self);
		let mod_data =
		{
			name: class_name,
			bbox: class_name,
			parent: self,
			main: main
		}
		if((main || this)._mods[class_name]) return;
		let script = document.createElement('script');
		script.onload = ()=>
		{
			mod_data['class'] = window[class_name];
			let mod = Rapp.create_app(mod_data);
			(main || this)._mods[class_name] = mod;
			this.init();
		};
		script.src = file+"?"+Math.random();

		document.head.appendChild(script);
	};
	import_js = function(attrs=[], cb=null)
	{
		let script = document.createElement('script');
		for(attr of attrs)
			style.setAttribute(attr.name, attr.value);
		if(!script.getAttribute('src')) return false;
		script.onload = ()=>
		{
			if(cb) cb();
		};
		script.src = file+"?"+Math.random();

		document.head.appendChild(script);
		return true;
	};
	include_css = function(attrs = [])
	{
		let style = document.createElement('link');
		for(attr of attrs)
			style.setAttribute(attr.name, attr.value);
		if(!style.getAttribute('href')) return false;
		style.onload = ()=>
		{
			if(cb) cb();
		};
		document.head.appendChild(style);
		return true;
	};
	new_refId = function()
	{
		return Rapp.uid();
	};
	create_api = function(key, uri)
	{
		if(!key || !uri) return;
		if(typeof(key) != 'string' || typeof(uri) != 'string') return;
		(this._main || this)._net[key] = uri;
	};
	get_uri = function(uri, callback = null, actions = null)
	{
	};
	api = function(key, a, cmd, args, callback = null, success_actions = null, error_actions = null, error_server_actions = null)
	{
		if(!key || !cmd || !a) return;
		if(typeof(key) != 'string' || typeof(cmd) != 'string' || typeof(a) != 'string') return;
		let api = (this._main || this)._net[key];
		if(!api) return;
		if(typeof(api) != 'string') return;

		args = args || {};
		args['token'] = args.token || ((this._main || this)._token || null);

		let headers = {
			'Content-Type': 'application/json'
		};
		if(Rapp.local)
		{
			headers['Access-Control-Allow-Credentials'] = true;
			headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept;';
			headers['Access-Control-Allow-Origin'] = '*';
			headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
		}
		let data = {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				a: a,
				cmd: cmd,
				args: args
			})
		};

		if(!data.body)
		{
			Rapp.log(`Error sending the cmd( ${cmd} ): json could not serialize the arguments.`);
			return;
		}
		
		fetch(`${api}/api`, data).then(res=>
		{
			if(res.status !== 200)
			{
				if(error_server_actions)
				{
					if(Array.isArray(error_server_actions))
						this.call_actions(error_server_actions);
					else if(typeof(error_server_actions) == 'object' && !Array.isArray(error_server_actions))
						error_server_actions.mod.call_action(error_server_actions.action, res);
					else if(typeof(error_server_actions) == 'string')
						this.call_action(error_server_actions, res);
					else if(Array.isArray(error_server_actions))
						this.call_actions(error_server_actions, res);
				}
				return;
			}
			res.json().then((o)=>
				{
					if(o.error)
					{
						if(error_actions)
						{
							if(Array.isArray(error_actions))
								this.call_actions(error_actions, o);
							else if(typeof(error_actions) == 'object' && !Array.isArray(error_actions))
								error_actions.mod.call_action(error_actions.action, o);
							else if(typeof(error_actions) == 'string')
								this.call_action(error_actions, o);
							else if(Array.isArray(error_actions))
								this.call_actions(error_actions, o);
						}
					}else{
						if(success_actions)
						{
							if(Array.isArray(success_actions))
								this.call_actions(success_actions, o);
							else if(typeof(success_actions) == 'object' && !Array.isArray(success_actions))
								success_actions.mod.call_action(success_actions.action, o);
							else if(typeof(success_actions) == 'string')
								this.call_action(success_actions, o);
							else if(Array.isArray(success_actions))
								this.call_actions(Array.isArray(success_actions), o);
						}
					}

					if(callback)
						callback(o);
				});
		});
	};
}

Rapp.create_app = function(conf)
{
	// app_name [string]
	// conf [object]
	// -	name [string]
	if(!conf.class) return;
	let app = new (conf.class || window[conf.name])(conf);
	if(window[conf.name])
		delete window[conf.name];
	if(app.run)
	{
		app.init();
	}
	return app;
}


Rapp.uid = function() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

Rapp.new_refId = function()
{
	return Rapp.uid();
}


Rapp.MD5 = function (string) {

   function RotateLeft(lValue, iShiftBits) {
           return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
   }

   function AddUnsigned(lX,lY) {
           var lX4,lY4,lX8,lY8,lResult;
           lX8 = (lX & 0x80000000);
           lY8 = (lY & 0x80000000);
           lX4 = (lX & 0x40000000);
           lY4 = (lY & 0x40000000);
           lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
           if (lX4 & lY4) {
                   return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
           }
           if (lX4 | lY4) {
                   if (lResult & 0x40000000) {
                           return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                   } else {
                           return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                   }
           } else {
                   return (lResult ^ lX8 ^ lY8);
           }
   }

   function F(x,y,z) { return (x & y) | ((~x) & z); }
   function G(x,y,z) { return (x & z) | (y & (~z)); }
   function H(x,y,z) { return (x ^ y ^ z); }
   function I(x,y,z) { return (y ^ (x | (~z))); }

   function FF(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function GG(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function HH(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function II(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function ConvertToWordArray(string) {
           var lWordCount;
           var lMessageLength = string.length;
           var lNumberOfWords_temp1=lMessageLength + 8;
           var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
           var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
           var lWordArray=Array(lNumberOfWords-1);
           var lBytePosition = 0;
           var lByteCount = 0;
           while ( lByteCount < lMessageLength ) {
                   lWordCount = (lByteCount-(lByteCount % 4))/4;
                   lBytePosition = (lByteCount % 4)*8;
                   lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                   lByteCount++;
           }
           lWordCount = (lByteCount-(lByteCount % 4))/4;
           lBytePosition = (lByteCount % 4)*8;
           lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
           lWordArray[lNumberOfWords-2] = lMessageLength<<3;
           lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
           return lWordArray;
   };

   function WordToHex(lValue) {
           var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
           for (lCount = 0;lCount<=3;lCount++) {
                   lByte = (lValue>>>(lCount*8)) & 255;
                   WordToHexValue_temp = "0" + lByte.toString(16);
                   WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
           }
           return WordToHexValue;
   };

   function Utf8Encode(string) {
           string = string.replace(/\r\n/g,"\n");
           var utftext = "";

           for (var n = 0; n < string.length; n++) {

                   var c = string.charCodeAt(n);

                   if (c < 128) {
                           utftext += String.fromCharCode(c);
                   }
                   else if((c > 127) && (c < 2048)) {
                           utftext += String.fromCharCode((c >> 6) | 192);
                           utftext += String.fromCharCode((c & 63) | 128);
                   }
                   else {
                           utftext += String.fromCharCode((c >> 12) | 224);
                           utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                           utftext += String.fromCharCode((c & 63) | 128);
                   }

           }

           return utftext;
   };

   var x=Array();
   var k,AA,BB,CC,DD,a,b,c,d;
   var S11=7, S12=12, S13=17, S14=22;
   var S21=5, S22=9 , S23=14, S24=20;
   var S31=4, S32=11, S33=16, S34=23;
   var S41=6, S42=10, S43=15, S44=21;

   string = Utf8Encode(string);

   x = ConvertToWordArray(string);

   a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

   for (k=0;k<x.length;k+=16) {
           AA=a; BB=b; CC=c; DD=d;
           a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
           d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
           c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
           b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
           a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
           d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
           c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
           b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
           a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
           d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
           c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
           b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
           a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
           d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
           c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
           b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
           a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
           d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
           c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
           b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
           a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
           d=GG(d,a,b,c,x[k+10],S22,0x2441453);
           c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
           b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
           a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
           d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
           c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
           b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
           a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
           d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
           c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
           b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
           a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
           d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
           c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
           b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
           a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
           d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
           c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
           b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
           a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
           d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
           c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
           b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
           a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
           d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
           c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
           b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
           a=II(a,b,c,d,x[k+0], S41,0xF4292244);
           d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
           c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
           b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
           a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
           d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
           c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
           b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
           a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
           d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
           c=II(c,d,a,b,x[k+6], S43,0xA3014314);
           b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
           a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
           d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
           c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
           b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
           a=AddUnsigned(a,AA);
           b=AddUnsigned(b,BB);
           c=AddUnsigned(c,CC);
           d=AddUnsigned(d,DD);
   		}

   	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

   	return temp.toLowerCase();
}