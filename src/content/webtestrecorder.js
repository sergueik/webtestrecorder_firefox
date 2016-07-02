/*******************************************************************************
 * Copyright (c) 2006-2007 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/

/**
 webtest specials
Contains object definition
*/

var wtr_WebtestRecorder = {
	steps_: new Array(),
	log: new Log("wtr_WebtestRecorder"),
	toString: function() { return "[object wtr_WebtestRecorder]" },
	listeners_: [],
	
	registerListener: function(_listener)
	{
		this.listeners_.push(_listener);
	},
	
	addStep:
		function(_oStep, _oNode)
		{
			if (_oNode)
				this.checkFrame_(_oNode);
			this.addStep_(_oStep);
		},
		
	addStep_:
		function(_oStep)
		{
			this.steps_.push(_oStep);
			for (var i=0; i<this.listeners_.length; ++i)
			{
				this.listeners_[i](_oStep);
			}
		},

	checkFrame_: 
		function(_oNode)
		{
			try // not that sure curently: TODO improve it
			{
				var oWin = _oNode.defaultView ? _oNode.defaultView : _oNode.ownerDocument.defaultView;
	
				if (this.curDeepFrameName_ != oWin.name)
				{
					var tmpWin = oWin;
					var i = 0;
					try {
						while (tmpWin.frameElement)
						{
							this.addStep_(new WTRStep("followFrame", {name: tmpWin.name}));
							tmpWin = tmpWin.frameElement.defaultView;
							++i;
							if (i > 10)
							{
								throw "Error depth > 10: " + tmpWin.name;
							}
						}
					}
					catch (e)
					{
						// ignore it
					}
				}
				this.curDeepFrameName_ = oWin.name;
				this.curWin = oWin;
			}
			catch (e)
			{
				// ignore it
			}
		}
};
