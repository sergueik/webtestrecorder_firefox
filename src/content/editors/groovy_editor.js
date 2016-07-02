/*******************************************************************************
 * Copyright (c) 2007 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *	Marc Guillemot - initial version
 *******************************************************************************/
var nestedEquivalence = {
	invoke: 'url',
	clickButton: 'label',
	clickLink: 'label',
	verifyTitle: 'text',
	verifyText: 'text'
}

/**
Creates a DOM node to represent the step as Groovy code
@param _document the document to which the node will be added
@param _oStep the step to represent
@return the DOM node to insert in the document
*/
function createDOMNode_GroovyRepresentation(_oStep, _document, bVisible) {
	var oStepNode = _document.createElement('div');
	if (!bVisible) {
		oStepNode.setAttribute('class', 'alternativeStep')
	}
	WTR_DomUtils.appendNodeToNode(oStepNode, 'span', {
		'class': 'tagName'
	}, _oStep.wtrStep);

	var nestedEquivalentFor = nestedEquivalence[_oStep.wtrStep]
	var tabPropNames = _oStep.getSortedPropertyNames();

	var withParentheses = !nestedEquivalentFor || tabPropNames.length > 1
	if (withParentheses)
		WTR_DomUtils.appendTextToNode(oStepNode, '(');
	else if (tabPropNames.length > 0)
		WTR_DomUtils.appendTextToNode(oStepNode, ' ');

	var bNeedSep = false
	for (var i = 0; i < tabPropNames.length; ++i) {
		var strPropName = tabPropNames[i];
		if (strPropName == nestedEquivalentFor)
			continue
		if (bNeedSep)
			WTR_DomUtils.appendTextToNode(oStepNode, ', ');
		WTR_DomUtils.appendNodeToNode(oStepNode, 'span', {
			'class': 'tagAttribute'
		}, strPropName);
		var strTmp = String(_oStep[strPropName]);
		strTmp = ': "' + strTmp.replace('"', "\\\"") + '"';
		WTR_DomUtils.appendTextToNode(oStepNode, strTmp);
		bNeedSep = true
	}

	if (nestedEquivalentFor && _oStep[nestedEquivalentFor]) {
		if (tabPropNames.length > 1)
			WTR_DomUtils.appendTextToNode(oStepNode, ', ');
		WTR_DomUtils.appendTextToNode(oStepNode, '"' + _oStep[nestedEquivalentFor] + '"');
	}

	if (withParentheses)
		WTR_DomUtils.appendTextToNode(oStepNode, ')');
	if (_oStep.wtrChildren) {
		WTR_DomUtils.appendNodeToNode(oStepNode, 'br');
		WTR_DomUtils.appendTextToNode(oStepNode, '{');
		WTR_DomUtils.appendNodeToNode(oStepNode, 'br');
		if (_oStep.wtrChildren.wtrStep) // single child
			oStepNode.appendChild(createDOMNode_GroovyRepresentation(_oStep.wtrChildren, _document, bVisible));
		else // collection of children
		{
			for (var iChild in _oStep.wtrChildren) {
				var oChild = _oStep.wtrChildren[iChild];
				oStepNode.appendChild(createDOMNode_GroovyRepresentation(oChild, _document, bVisible));
			}
		}
		WTR_DomUtils.appendTextToNode(oStepNode, '}');
	}

	return oStepNode;
}

setCreateDOMNode_XXXRepresentation(createDOMNode_GroovyRepresentation)