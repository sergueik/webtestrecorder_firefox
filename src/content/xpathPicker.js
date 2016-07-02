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

/*
Utility tool to help determining the right XPath expression to access a node
*/


var wtr_XPathPicker = new Object();
wtr_XPathPicker.myThis = wtr_XPathPicker;

wtr_XPathPicker.log = new Log("xpathPicker.js");

wtr_XPathPicker.startPicker = function()
{
    var oDoc = window.top.getBrowser().browsers[window.top.getBrowser().mTabBox.selectedIndex].contentDocument;
    
    this.log.debug("Configuring XPath Picker for " + oDoc);
	oDoc.addEventListener("mouseover", this.showXPath, true);
    oDoc.addEventListener("click", this.pickXPath, true);

	StylesheetUtis_addStyleSheet(oDoc, "chrome://webtestrecorder/content/stylesheets/xpathPicker.css");
}


/**
Shows an XPath expression for the node under the mouse
*/
wtr_XPathPicker.showXPath = function(_event)
{
	var mySelf = arguments.callee;
    var eventTarget = _event.target;
    mySelf.myThis.log.debug("target: " + eventTarget);

    // If there is a target
    if (eventTarget)
    {
        var tagName = eventTarget.tagName;

        // If the tag name is set and does not equal scrollbar
        if(tagName && tagName != "scrollbar")
        {
        	var oWindow = eventTarget.ownerDocument.defaultView;
            oWindow.status = mySelf.myThis.computeAbsoluteXPath(eventTarget);

            _event.preventDefault();
        }
    }
}
wtr_XPathPicker.showXPath.myThis = wtr_XPathPicker;

/**
Picks the XPath expression for the node under the mouse
*/
wtr_XPathPicker.pickXPath = function(_event)
{
	var mySelf = arguments.callee;
    var eventTarget = _event.target;
    mySelf.myThis.log.debug("target: " + eventTarget);

    // If there is a target
    if (eventTarget)
    {
        var tagName = eventTarget.tagName;

        // If the tag name is set and does not equal scrollbar
        if(tagName && tagName != "scrollbar")
        {
        	var oWindow = eventTarget.ownerDocument.defaultView;
            oWindow.status = mySelf.myThis.computeAbsoluteXPath(eventTarget);

            _event.preventDefault();
        }
    }
    
    mySelf.myThis.deregisterXPathPicker();
}
wtr_XPathPicker.pickXPath.myThis = wtr_XPathPicker;

/**
Computes the absolute XPath of the element
@param _oNode a node
@return (String) the calculated XPath
*/
wtr_XPathPicker.computeAbsoluteXPath = function(_oNode)
{
	var mySelf = arguments.callee;
	
	if (!_oNode)
		return "";

	var strNodeName = _oNode.nodeName;
	if ("HTML" == strNodeName)
		return "/HTML";

	var index = 1;
	var oNode = _oNode.previousSibling;
	while (oNode != null)
	{
		if (oNode.nodeName == strNodeName)
			++index;
		oNode = oNode.previousSibling;
	}
	var strPosition = "[" + index + "]";
	if (index == 1) // look if position is not necessary
	{
		var bHasFollowingSiblingsWithSameName = false;
		var oNode = _oNode.nextSibling;
		while (oNode != null)
		{
			if (oNode.nodeName == strNodeName)
			{
				bHasFollowingSiblingsWithSameName = true;
				break;
			}
			oNode = oNode.nextSibling;
		}
		if (!bHasFollowingSiblingsWithSameName)
			strPosition = "";
	}
	
	var strParentPath = mySelf(_oNode.parentNode);
	if (strParentPath != "/")
		strParentPath += "/";
	return strParentPath + strNodeName + strPosition;
}
