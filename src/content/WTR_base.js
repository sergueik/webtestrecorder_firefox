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

function WTR_base()
{
}

/**
Gets the webtest recorder associated to the current window
*/
WTR_base.prototype._getWebtestRecorder = function()
{
	var oWTRWin = this._getRecorderWindow();
	if (oWTRWin == null)
		return null;

	return oWTRWin.wtr_WebtestRecorder;
}

WTR_base.prototype._getRecorderWindow = function()
{
	if (parent)
		return parent.wtrWindow;
	return null;
}


/**
Gets the window in the current browser
*/
WTR_base.prototype._getCurrentWindow = function()
{
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow("navigator:browser");
	return window.getBrowser().contentWindow;
}
