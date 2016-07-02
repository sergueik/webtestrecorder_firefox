/*******************************************************************************
 * Copyright (c) 2007 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/


/**
Creates a DOM node to represent the step
@param _document the document to which the node will be added
@param _oStep the step to represent
@return the DOM node to insert in the document
*/
function createDOMNode_XMLRepresentation(_oStep, _document, bVisible)
{
	var oStepNode = _document.createElement("div");
	if (!bVisible)
	{
		oStepNode.setAttribute("class", "alternativeStep")
	}
	WTR_DomUtils.appendTextToNode(oStepNode, '<');
	WTR_DomUtils.appendNodeToNode(oStepNode, "span", {"class": "tagName"}, _oStep.wtrStep);

	// the attributes
	var tabPropNames = _oStep.getSortedPropertyNames();
	for (var i=0; i<tabPropNames.length; ++i)
	{
		var strPropName = tabPropNames[i];
		var strTmp = String(_oStep[strPropName]);
		WTR_DomUtils.appendTextToNode(oStepNode, ' ');
		
		WTR_DomUtils.appendNodeToNode(oStepNode, "span", {"class": "tagAttribute"}, strPropName);
		WTR_DomUtils.appendTextToNode(oStepNode, '="' +strTmp + '"');
	}
	
	if (_oStep.wtrChildren) 
	{
		WTR_DomUtils.appendTextToNode(oStepNode, '>\n');
		if (_oStep.wtrChildren.wtrStep) // single child
			oStepNode.appendChild(createDOMNode_XMLRepresentation(_oStep.wtrChildren, _document, bVisible));
		else // collection of children
		{
			for (var iChild in _oStep.wtrChildren)
			{
				var oChild = _oStep.wtrChildren[iChild];
				oStepNode.appendChild(createDOMNode_XMLRepresentation(oChild), _document, bVisible);
			}
		}
		WTR_DomUtils.appendTextToNode(oStepNode, '<');
		WTR_DomUtils.appendNodeToNode(oStepNode, "span", {"class": "tagName"}, "/" + _oStep.wtrStep);
		WTR_DomUtils.appendTextToNode(oStepNode, '>');
	}
	else
		WTR_DomUtils.appendTextToNode(oStepNode, '/>');

	return oStepNode;
}

setCreateDOMNode_XXXRepresentation(createDOMNode_XMLRepresentation)