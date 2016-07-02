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

function WTRStep(_stepName, _attributes)
{
	this.wtrStep = _stepName;
	for (var i in _attributes)
	{
		this[i] = _attributes[i];
	}
	this.getPropertyNames = function()
	{
		var tabPropNames = new Array();
		for (var strPropName in this)
		{
			if (strPropName.indexOf("wtr") != 0
				&& (typeof this[strPropName] == "string"))
			{
				tabPropNames.push(strPropName);
			}
		}
		return tabPropNames
	}

	this.getSortedPropertyNames = function()
	{
		var tabPropNames = this.getPropertyNames()
		tabPropNames.sort();
		return tabPropNames;
	}
	
	this.clone = function()
	{
		var name = this.wtrStep
		var props = {}
		var tabPropNames = this.getPropertyNames()
		for (var i=0; i<tabPropNames.length; ++i)
		{
			var propName = tabPropNames[i]
			props[propName] = this[propName]
		}
		return new WTRStep(name, props)
	}

	this.cloneAndAdd = function(properties)
	{
		var clone = this.clone()
		for (var i in properties)
		{
			clone[i] = properties[i]
		}
		return clone;
	}
}
