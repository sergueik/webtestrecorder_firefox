/*******************************************************************************
 * Copyright (c) 2006 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/

var WTR_Preferences = new Object();

WTR_Preferences.BRANCH_NAME = 'webtestrecorder.';

/**
Gets the value of a string preference
@param _strKey the name of the preference to retrieve
*/
WTR_Preferences.getString = function(_strKey)
{
	return this._getBranch().getCharPref(_strKey);
}

/**
Gets the values of a multi-strings preference
@param _strKey the name of the preference to retrieve
*/
WTR_Preferences.getStrings = function(_strKey)
{
	try
	{
		return this._getBranch().getCharPref(_strKey).split(',');
	}
	catch (e)
	{
		return [];
	}
}

/**
Gets the branch containing the preferences for this extension
*/
WTR_Preferences._getBranch = function()
{
	return Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(this.BRANCH_NAME);
}
