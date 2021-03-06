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

var WTR_Overlay = new WTR_base();

WTR_Overlay.log = new Log('overlay.js');

/**
Called on display of the context menu.
Takes care that WTR menus item are displayed as needed 
*/
WTR_Overlay.onPopupShown = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	myThis.onPopupShown_(_oEvent);
}

WTR_Overlay.onPopupShown_ = function(_oEvent)
{
	try
	{
		if (this._getWebtestRecorder() != null)
		{
			this.showIfSelection();

			var oCmd = document.getElementById('wtr_cmdVerifyTitle');
			if (!oCmd.originalLabel)
				oCmd.originalLabel = oCmd.label;
	
			var focusedWindow = this._getWindow(_oEvent);
			oCmd.label = oCmd.originalLabel + '"' + focusedWindow.document.title + '"';
			oCmd.hidden = false;

			var focusedElement = document.commandDispatcher.focusedElement;
//			var focusedElement = document.popupNode;
			if (focusedElement)
			{
				if (focusedElement.tagName == 'SELECT')
				{
					// verifySelectField
					this._showMenuElement('wtr_cmdVerifySelectField', focusedElement.name);
				}
				else if (focusedElement.tagName == 'INPUT' 
							&& (focusedElement.type == 'text' || focusedElement.type == 'password'))
				{
					this._showMenuElement('wtr_cmdVerifyInputField', focusedElement.name);
				}
				else if (focusedElement.tagName == 'TEXTAREA')
				{
					this._showMenuElement('wtr_cmdVerifyTextArea', focusedElement.name);
				}
			}

			// separator
			document.getElementById('wtr_cmdSeparatorBeforeVerifyText').hidden = false;
		}
		
		// Make links live should be available even if side bar is not displayed
		this._showIfNeeded_makeLinksLive(_oEvent);
	}
	catch (e)
	{
		this.log.logError(e);
	}
}

/**
Makes the menu item with the given id visible and adds the text to its label
*/
WTR_Overlay._showMenuElement = function(_strMenuItemId, _strText)
{
	var oCmd = document.getElementById(_strMenuItemId);
	if (!oCmd.originalLabel)
		oCmd.originalLabel = oCmd.label;
	if (_strText)
		oCmd.label = oCmd.originalLabel + '"' + _strText + '"';
	oCmd.hidden = false;
}

/**
Shows context menu item if selection available
*/
WTR_Overlay.showIfSelection = function()
{
	var myThis = arguments.callee.myThis;
	var strSelection = document.commandDispatcher.focusedWindow.getSelection().toString();
	// TODO: trim the string
	var bSelection = (strSelection.length > 0);

	if (bSelection)
	{
		myThis._showMenuElement('wtr_cmdVerifyText', strSelection);
	}
}


/**
Shows the 'make links live' menu point only if we are on a page capture by webtest
*/
WTR_Overlay._showIfNeeded_makeLinksLive = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	var oWin = myThis._getWindow(_oEvent);
	var bShow = (oWin.location.search.indexOf('baseUrl') > -1)
//	myThis.log.debug('_showIfNeeded_makeLinksLive: ' + bShow);
	if (bShow)
	{
		myThis._showMenuElement('wtr_cmdMakeLinksLive');
		myThis._showMenuElement('wtr_loadResourcesFromOriginalSite');
	}
}

/**
Hides all WTR menu elements (items or separators).
This allows in onpopupshown to show the controls that should be shown and not to
bother with the one that should not be displayed.
*/
WTR_Overlay.onPopupHidden = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	myThis.hideWTRControls_(_oEvent);
}

WTR_Overlay.hideWTRControls_ = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	try
	{
		var oMenu = document.getElementById('contentAreaContextMenu');
		var oMenuElements = oMenu.childNodes;
		
		for (var i=0; i<oMenuElements.length; ++i)
		{
			var oMenuElt = oMenuElements[i];
			if (oMenuElt.id.indexOf('wtr_') == 0)
			{
				oMenuElt.hidden = true;
			}
		}
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/**
Display the WebtestRecorder in the side bar
*/
WTR_Overlay.ShowSidebar = function()
{
	var myThis = arguments.callee.myThis;
	try
	{
		const sidebarId = 'webtestRecorderSidebar';
		toggleSidebar(sidebarId);
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/**
Adds a verifyTitle step for the currently selected window.
Caution: this is called from a popup defined in the main overlay
*/
WTR_Overlay.addVerifyTitle = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	try
	{
		var oDocument = myThis._getDocument(_oEvent);
	
		var oStep = new WTRStep('verifyTitle', {text: oDocument.title});
		myThis.addStep(oStep, oDocument, _oEvent);
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/**
Adds a verifyText step for the currently selected text (if any).
Caution: this is called from a popup defined in the main overlay
*/
WTR_Overlay.addVerifyText = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	try
	{
		var strSelection = document.commandDispatcher.focusedWindow.getSelection().toString();
	
		var oStep = new WTRStep('verifyText', {
			text: strSelection,
			description: 'Verify that text is contained in the page'
			});
		
		myThis.addStep(oStep, document.popupNode, _oEvent);
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/**
Adds a verifySelectField step for the currently focused select (if any).
Caution: this is called from a popup defined in the main overlay
*/
WTR_Overlay.addVerifySelectField = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	try
	{
		var focusedElement = document.popupNode;
	
		var oStep = new WTRStep('verifySelectField', {
			name: focusedElement.name,
			value: focusedElement.value,
			description: 'Verify the value of the select value'
			});

		myThis.addStep(oStep, focusedElement, _oEvent);
	}
	catch (e)
	{
		myThis.logError(e);
	}
}

/**
Adds a verifyInputField step for the currently focused input field (if any).
Caution: this is called from a popup defined in the main overlay
*/
WTR_Overlay.addVerifyInputField = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	try
	{
		var focusedElement = document.popupNode;
	
		var oStep = new WTRStep('verifyInputField', {
			value: focusedElement.value,
			name: focusedElement.name
			});

		myThis.addStep(oStep, focusedElement, _oEvent);
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/**
Adds a verifyInputField step for the currently focused input field (if any).
Caution: this is called from a popup defined in the main overlay
*/
WTR_Overlay.addVerifyTextArea = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	try
	{
		var focusedElement = document.popupNode;
	
		var oStep = new WTRStep('verifyTextarea', {
			text: focusedElement.value,
			name: focusedElement.name
			});

		myThis.addStep(oStep, focusedElement, _oEvent);
	}
	catch (e)
	{
		myThis.log.logError(e);
	}
}

/**
locates the WebtestRecorder and adds the step, taking care to wrap it in a <not> if needed according to the event
@param _oStep the webtest step
@param _oNode the associated node
@param _oEvent the (mouse) event 
*/
WTR_Overlay.addStep = function(_oStep, _oNode, _oEvent)
{
	var myThis = arguments.callee.myThis;
	var oStep = myThis.decorateStep(_oStep, _oEvent);
	myThis._getWebtestRecorder().addStep(oStep, _oNode);
}

/**
Wraps the step in a <not> if the special key is pressed in the event
@param _oStep the webtest step
@param _oEvent the (mouse) event 
*/
WTR_Overlay.decorateStep = function(_oStep, _oEvent)
{
	if (_oEvent && _oEvent.ctrlKey)
	{
		return new WTRStep('not', {wtrChildren: _oStep});
	}
	return _oStep;
}

/**
Just for debug purposes
*/
WTR_Overlay.toString = function()
{
	return '[object WTR_Overlay]';
}

/**
Gets the window for this event
*/
WTR_Overlay._getWindow = function(_oEvent)
{
	var oWin = document.commandDispatcher.focusedWindow
	return oWin;
}

/**
Gets the document for this event
*/
WTR_Overlay._getDocument = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	return myThis._getWindow(_oEvent).document
}

/**
Change the images and css src to refer to the original server
*/
WTR_Overlay.loadResourcesFromOriginalSite = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	var oWin = myThis._getWindow(_oEvent);

	var oDoc = myThis._getDocument(_oEvent);
	
	var updateImagesSource = function(urlServerUrl, urlDirUrl)
	{
		var nbImages = oDoc.images.length;
		for (var i=0; i<nbImages; ++i)
		{
			var oImg = oDoc.images[i];
			var originalSrc = oImg.getAttribute('src');
			if (oImg.src != originalSrc)
			{
				if (originalSrc.indexOf('/') == 0)
					oImg.src = urlServerUrl + originalSrc;
				else
					oImg.src = urlDirUrl + originalSrc;
			}
		}
	};
	
	var updateStylesheetsSource = function(urlServerUrl, urlDirUrl)
	{
		var nbCSS = oDoc.styleSheets.length;
		for (var i=0; i<nbCSS; ++i)
		{
			var oCSS = oDoc.styleSheets[i];
			var originalSrc = oCSS.ownerNode.getAttribute('href');
			if (oCSS.href != originalSrc)
			{
				var newHref = '';
				if (originalSrc.indexOf('/') == 0)
					newHref = urlServerUrl + originalSrc;
				else
					newHref = urlDirUrl + originalSrc;
				oCSS.ownerNode.setAttribute('href', newHref);
			}
		}
	};

	var infoData = myThis._readInfoFile(oDoc);
	if (infoData['url'])
	{
		var url = infoData['url'];
		var urlServerUrl = url.match('.*//[^/]*')[0];
		var urlDirUrl = url.match('.*/')[0];
		updateImagesSource(urlServerUrl, urlDirUrl);
		updateStylesheetsSource(urlServerUrl, urlDirUrl);
	}
}

/**
 * Read the .info file associated with a page
*/
WTR_Overlay._readInfoFile = function(_oDoc)
{
	var x = new XMLHttpRequest();
	var infoFile = _oDoc.location.toString().split('?')[0] + '.info';
	x.open('GET', infoFile, false);
	x.send('');
	var txt = x.responseText;
	var lines = txt.split("\n");
	var response = {};
	for (var i=0; i<lines.length; ++i)
	{
		var line = lines[i];
		var p = line.indexOf('=');
		if (p > 0) {
			var key = line.substring(0, p);
			var value = line.substr(p+1);
			response[key] = value;
		}
	}
	return response;
}

/**
Changes the links in the page to prepend server information
and register session cookie (if any)
*/
WTR_Overlay.makeLinksLive = function(_oEvent)
{
	var myThis = arguments.callee.myThis;
	var oWin = myThis._getWindow(_oEvent);
	
	var oDoc = myThis._getDocument(_oEvent);
	var props = myThis._readInfoFile(oDoc);

	var url = props.url;
	var oBaseUrl = myThis._parseBaseUrl(url);
	
	var prependValue = function(_value, _prependValue)
	{
		if (_value.charAt(0) != '/')
			return _prependValue + '/' + _value;
		else
			return _prependValue + _value;
	}

	var prependAttrValue = function(_colNodes, _attrName, _prependValue)
	{
		for (var i=0; i<_colNodes.length; ++i)
		{
			var oNode = _colNodes[i];
			var value = oNode.getAttribute(_attrName);
			if (value && value.indexOf('javascript:') != 0
					&& value.indexOf('http://') != 0 && value.indexOf('https://') != 0)
			{
				var newValue = prependValue(oNode.getAttribute(_attrName), _prependValue);
				oNode.setAttribute(_attrName, newValue);
			}
		}
	}

	var baseTags = oDoc.getElementsByTagName('BASE');
	if (baseTags.length > 0) {
		var baseTag = baseTags[0];
		if (baseTag.href.match('https?://.*')) {
			// absolute base tag, nothing to do
		}
		else {
			prependAttrValue(baseTags, 'href', oBaseUrl.urlWithoutPath);
		}
	}
	else {
		prependAttrValue(oDoc.getElementsByTagName('A'), 'href', oBaseUrl.urlWithoutPath);
		prependAttrValue(oDoc.getElementsByTagName('FORM'), 'action', oBaseUrl.urlWithoutPath);
	}
	
	// define session cookies
	try
	{
		var nbCookies = props['cookies'];
		if (nbCookies)
		{
			oWin.status = nbCookies + ' cookies set';
			nbCookies = parseInt(nbCookies);
			for (var i=0; i<nbCookies; ++i)
			{
				var cookieName = props['cookie.' + i + '.name'];
				var cookieDomain = props['cookie.' + i + '.domain'];
				var cookieValue = props['cookie.' + i + '.value'];
				var cookiePath = props['cookie.' + i + '.path'];
				myThis._defineNewSessionCookie(oBaseUrl.scheme, oBaseUrl.host, cookieName, cookieValue, cookiePath);
			}
		}
		else
		{
			oWin.status = 'No cookie found';
		}
	}
	catch (e)
	{
		alert('Exception setting cookies: ' + e.message)
	}
}

/**
Parses the baseUrl
@param _strBaeUrl of the form: protocol://some.server[:port][/some/path]
@return a object with following properties:
	- host (ex: some.server)
	- scheme (ex: http)
	- urlWithoutPath (ex: http://some.server:123)
*/
WTR_Overlay._parseBaseUrl = function(_strBaseUrl)
{
	var serverRE = new RegExp('(http|https)://([^/:]*)(:\\d+)?')
	var tab = serverRE.exec(_strBaseUrl);
	if (!tab)
		return null;
	
	return {scheme: tab[1], host: tab[2], urlWithoutPath: tab[0]}
}

/**
Parses the parameters from the query information
@param _strSearch the query string (inclusive '?'), may be null
@return a map of (parameter name, parameter value)
*/
WTR_Overlay._parseQueryParameters = function(_strSearch)
{
	if (!_strSearch)
		return {};

	var tab = _strSearch.substr(1).split('&');
	var oMap = {}
	for (var i=0; i<tab.length; ++i)
	{
		var tab2 = tab[i].split('=');
		oMap[tab2[0]] = unescape(tab2[1]);
	}
	return oMap;
}

/**
Removes the session cookies with matching host, name and path
@param _strScheme 'http' or 'https'
@param _strHost the host name. Ex: my.server.org
@param _strName the name of the cookie. Ex: JSESSIONID
@param _strValue the value of the cookie
@param _strPath the cookie path
*/
WTR_Overlay._defineNewSessionCookie = function(_strScheme, _strHost, _strName, _strValue, _strPath)
{
	// first remove any existing (needed?)
    var cookieManager = Components.classes['@mozilla.org/cookiemanager;1'].getService(Components.interfaces.nsICookieManager);
    cookieManager.remove(_strHost, _strName, _strPath, false);

	// then define new one
    var cookie = _strName + '=' + _strValue + ';';

    // If the host is a domain
    if (_strHost.charAt(0) == '.')
    {
        cookie += 'domain=' + _strHost + ';';
    }

	cookie += 'path=' + _strPath + ';'

	var strUri = _strScheme + '://' + _strHost + _strPath;
	var uri = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService).newURI(strUri, null, null);

	var cookieService = Components.classes['@mozilla.org/cookieService;1'].getService().QueryInterface(Components.interfaces.nsICookieService);
	cookieService.setCookieString(uri, null, cookie, null);
}

// register WTR_Overlay as property on all its function to allow them to retrieve it when detached
wtr_myThis.registerAsMyThis(WTR_Overlay);

// register handler to display right elements in context menu
window.addEventListener('popupshowing', WTR_Overlay.onPopupShown, false);
window.addEventListener('popuphidden', WTR_Overlay.onPopupHidden, false);

